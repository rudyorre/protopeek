'use client';

import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  FileUp,
  Folder,
  X,
  AlertCircle,
  Code2,
  FileCode,
  Eye,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileViewerModal } from './file-viewer-modal';
import { cn } from '@/lib/utils';

// File System Access API types
interface FileSystemFileHandle {
  kind: 'file';
  getFile: () => Promise<File>;
}

interface FileSystemDirectoryHandle {
  kind: 'directory';
  name: string;
  entries: () => AsyncIterable<[string, FileSystemHandle]>;
}

type FileSystemHandle = FileSystemFileHandle | FileSystemDirectoryHandle;

interface FileStructure {
  type: 'file';
  size: number;
  lastModified: number;
  content: string | null;
  error?: string;
}

interface DirectoryStructure {
  type: 'directory';
  children: Record<string, FileStructure | DirectoryStructure>;
}

export interface ProtoFile {
  name: string;
  content: string;
  path: string;
}

interface ProtoFileSelectorProps {
  onFilesSelected: (files: ProtoFile[]) => void;
  selectedFiles: ProtoFile[];
}

export function ProtoFileSelector({
  onFilesSelected,
  selectedFiles,
}: ProtoFileSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewerModalOpen, setIsViewerModalOpen] = useState(false);
  const [isLoadingDirectory, setIsLoadingDirectory] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inlineProtoName, setInlineProtoName] = useState('schema.proto');
  const [inlineProtoContent, setInlineProtoContent] = useState(
    `syntax = "proto3";\npackage tutorial;\n\nmessage Person {\n  string name = 1;\n  int32 id = 2;\n  string email = 3;\n}`
  );
  const [activeMode, setActiveMode] = useState<'files' | 'paste'>('files');

  const processFileList = async (files: File[]) => {
    const protoFiles: ProtoFile[] = [];

    for (const file of files) {
      if (file.name.endsWith('.proto')) {
        try {
          const content = await file.text();
          protoFiles.push({
            name: file.name,
            content,
            path: file.name,
          });
        } catch (err: unknown) {
          const errorMessage =
            err instanceof Error ? err.message : 'Unknown error';
          console.error(`Error reading file ${file.name}:`, errorMessage);
        }
      }
    }

    if (protoFiles.length === 0 && files.length > 0) {
      setError('No valid .proto files found in selection.');
      return;
    }

    if (protoFiles.length > 0) {
      onFilesSelected(protoFiles);
      setIsModalOpen(false);
      setError(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await processFileList(files);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    await processFileList(files);
  };

  const handleInlineSchemaSave = () => {
    if (!inlineProtoContent.trim()) {
      setError('Please enter a valid .proto schema definition.');
      return;
    }
    const cleanName = inlineProtoName.trim().endsWith('.proto')
      ? inlineProtoName.trim()
      : `${inlineProtoName.trim() || 'schema'}.proto`;
    onFilesSelected([
      ...selectedFiles.filter((f) => f.path !== cleanName),
      {
        name: cleanName,
        path: cleanName,
        content: inlineProtoContent,
      },
    ]);
    setIsModalOpen(false);
    setError(null);
  };

  const handleDirectorySelect = async () => {
    setError(null);
    setIsLoadingDirectory(true);

    try {
      if (!('showDirectoryPicker' in window)) {
        throw new Error(
          'File System Access API is not supported in this browser. Please use Upload Files or Paste Schema.'
        );
      }

      const directoryHandle: FileSystemDirectoryHandle = await (
        window as unknown as {
          showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
        }
      ).showDirectoryPicker();

      const protoFiles: ProtoFile[] = [];
      const directoryStructure = await readDirectoryRecursively(
        directoryHandle,
        ''
      );

      const extractProtoFiles = (
        structure: Record<string, FileStructure | DirectoryStructure>,
        basePath = ''
      ) => {
        for (const [name, item] of Object.entries(structure)) {
          const currentPath = basePath ? `${basePath}/${name}` : name;

          if (item.type === 'file' && name.endsWith('.proto') && item.content) {
            protoFiles.push({
              name,
              content: item.content,
              path: currentPath,
            });
          } else if (item.type === 'directory') {
            extractProtoFiles(
              (item as DirectoryStructure).children,
              currentPath
            );
          }
        }
      };

      extractProtoFiles(directoryStructure);

      onFilesSelected(protoFiles);
      setIsModalOpen(false);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to access directory. Please try again.'
      );
    } finally {
      setIsLoadingDirectory(false);
    }
  };

  const readDirectoryRecursively = async (
    directoryHandle: FileSystemDirectoryHandle,
    path: string
  ): Promise<Record<string, FileStructure | DirectoryStructure>> => {
    const structure: Record<string, FileStructure | DirectoryStructure> = {};

    for await (const [name, handle] of directoryHandle.entries()) {
      if (handle.kind === 'file') {
        try {
          const file = await handle.getFile();
          const content = name.endsWith('.proto') ? await file.text() : null;
          structure[name] = {
            type: 'file',
            size: file.size,
            lastModified: file.lastModified,
            content: content,
          };
        } catch {
          structure[name] = {
            type: 'file',
            size: 0,
            lastModified: 0,
            content: null,
            error: 'Could not read file',
          };
        }
      } else if (handle.kind === 'directory') {
        structure[name] = {
          type: 'directory',
          children: await readDirectoryRecursively(
            handle as FileSystemDirectoryHandle,
            `${path}/${name}`
          ),
        };
      }
    }

    return structure;
  };

  const removeFile = (pathToRemove: string) => {
    const updatedFiles = selectedFiles.filter(
      (file) => file.path !== pathToRemove
    );
    onFilesSelected(updatedFiles);
  };

  const clearAllFiles = () => {
    onFilesSelected([]);
  };

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Label className='text-xs font-semibold uppercase tracking-wider text-slate-300'>
            Proto Files
          </Label>
          <span className='rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-medium text-slate-400'>
            Optional Schema
          </span>
        </div>
        {selectedFiles.length > 0 && (
          <Button
            variant='ghost'
            size='sm'
            onClick={clearAllFiles}
            className='h-6 px-2 py-0 text-xs text-slate-400 hover:bg-rose-500/10 hover:text-rose-400'
          >
            Clear All
          </Button>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => setIsModalOpen(true)}
            role='button'
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsModalOpen(true);
              }
            }}
            className={cn(
              'flex min-h-[84px] w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed px-4 py-3 text-center transition-all',
              isDragging
                ? 'border-sky-400 bg-sky-500/10'
                : selectedFiles.length > 0
                  ? 'border-sky-500/40 bg-sky-500/5 hover:border-sky-400/60 hover:bg-sky-500/10'
                  : 'border-slate-700/80 bg-[#0D111A] hover:border-sky-500/50 hover:bg-slate-900/80'
            )}
          >
            <FileUp className='h-4 w-4 text-sky-400' />
            <span className='text-xs font-medium text-slate-200'>
              {selectedFiles.length > 0
                ? `${selectedFiles.length} file(s) selected — Click to manage or add`
                : 'Select .proto files'}
            </span>
            <span className='text-[11px] text-slate-500'>
              Drop .proto files, browse folder, or paste schema inline
            </span>
          </div>
        </DialogTrigger>

        {selectedFiles.length === 0 && (
          <p className='text-[11px] text-slate-500'>
            Without a .proto schema, ProtoPeek decodes raw wire tags and field
            numbers automatically.
          </p>
        )}

        {selectedFiles.length > 0 && (
          <div className='space-y-1.5 pt-1'>
            <div className='flex items-center justify-between text-xs'>
              <span className='text-slate-400'>
                Loaded schemas ({selectedFiles.length}):
              </span>
              <button
                type='button'
                onClick={() => setIsViewerModalOpen(true)}
                className='inline-flex items-center gap-1 text-xs font-medium text-sky-400 hover:text-sky-300'
              >
                <Eye className='h-3 w-3' />
                Inspect files
              </button>
            </div>

            <div className='flex flex-wrap gap-1.5'>
              {selectedFiles.map((file) => (
                <div
                  key={file.path}
                  className='inline-flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900/90 px-2 py-1 text-xs'
                >
                  <FileCode className='h-3 w-3 text-sky-400' />
                  <span className='max-w-[180px] truncate font-mono text-[11px] text-slate-200'>
                    {file.path}
                  </span>
                  <button
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.path);
                    }}
                    className='text-slate-500 hover:text-rose-400'
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className='h-3 w-3' />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogContent className='border-slate-800 bg-[#111621] text-slate-100 sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle className='text-base font-semibold text-white'>
              Provide .proto Schema
            </DialogTitle>
            <DialogDescription className='text-xs text-slate-400'>
              Upload .proto files from disk or write a schema definition inline.
            </DialogDescription>
          </DialogHeader>

          <div className='flex gap-1 rounded-lg border border-slate-800 bg-[#0D111A] p-1'>
            <button
              type='button'
              onClick={() => setActiveMode('files')}
              className={cn(
                'flex-1 rounded-md py-1.5 text-xs font-medium transition-colors',
                activeMode === 'files'
                  ? 'bg-sky-500 font-semibold text-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              Upload Files / Folder
            </button>
            <button
              type='button'
              onClick={() => setActiveMode('paste')}
              className={cn(
                'flex-1 rounded-md py-1.5 text-xs font-medium transition-colors',
                activeMode === 'paste'
                  ? 'bg-sky-500 font-semibold text-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              Write / Paste .proto Inline
            </button>
          </div>

          <div className='space-y-4'>
            {error && (
              <Alert
                variant='destructive'
                className='border-rose-800/80 bg-rose-950/40 py-2 text-rose-200'
              >
                <AlertCircle className='h-4 w-4' />
                <AlertDescription className='text-xs'>{error}</AlertDescription>
              </Alert>
            )}

            {activeMode === 'files' ? (
              <div className='grid gap-3'>
                <div className='rounded-lg border border-slate-800 bg-[#0D111A] p-4'>
                  <div className='mb-3 flex items-start gap-3'>
                    <div className='rounded-md bg-sky-500/10 p-2 text-sky-400'>
                      <FileUp className='h-4 w-4' />
                    </div>
                    <div>
                      <h4 className='text-sm font-medium text-white'>
                        Upload .proto Files
                      </h4>
                      <p className='text-xs text-slate-400'>
                        Select one or more .proto files from your computer
                      </p>
                    </div>
                  </div>
                  <Input
                    type='file'
                    accept='.proto'
                    multiple
                    onChange={handleFileUpload}
                    className='hidden'
                    id='file-upload'
                    data-testid='proto-file-input'
                  />
                  <Button
                    variant='outline'
                    size='sm'
                    className='w-full border-slate-700 bg-slate-900 text-xs text-slate-200 hover:border-sky-500/60 hover:bg-slate-800'
                    onClick={() =>
                      document.getElementById('file-upload')?.click()
                    }
                  >
                    Choose Files
                  </Button>
                </div>

                <div className='rounded-lg border border-slate-800 bg-[#0D111A] p-4'>
                  <div className='mb-3 flex items-start gap-3'>
                    <div className='rounded-md bg-emerald-500/10 p-2 text-emerald-400'>
                      <Folder className='h-4 w-4' />
                    </div>
                    <div>
                      <h4 className='text-sm font-medium text-white'>
                        Scan Directory
                      </h4>
                      <p className='text-xs text-slate-400'>
                        Recursively discover all .proto files in a folder
                      </p>
                    </div>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    className='w-full border-slate-700 bg-slate-900 text-xs text-slate-200 hover:border-emerald-500/60 hover:bg-slate-800'
                    onClick={handleDirectorySelect}
                    disabled={isLoadingDirectory}
                  >
                    {isLoadingDirectory ? 'Scanning...' : 'Select Directory'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className='space-y-3 rounded-lg border border-slate-800 bg-[#0D111A] p-4'>
                <div className='flex items-center justify-between gap-2'>
                  <Label
                    htmlFor='inline-proto-name'
                    className='text-xs text-slate-300'
                  >
                    Schema Filename
                  </Label>
                  <Input
                    id='inline-proto-name'
                    value={inlineProtoName}
                    onChange={(e) => setInlineProtoName(e.target.value)}
                    className='h-7 w-44 border-slate-800 bg-slate-900 font-mono text-xs text-slate-200'
                    placeholder='schema.proto'
                  />
                </div>
                <Textarea
                  value={inlineProtoContent}
                  onChange={(e) => setInlineProtoContent(e.target.value)}
                  className='min-h-[180px] border-slate-800 bg-slate-950 font-mono text-xs leading-relaxed text-slate-200 focus:border-sky-500/60'
                  placeholder='syntax = "proto3"; ...'
                />
                <Button
                  size='sm'
                  onClick={handleInlineSchemaSave}
                  className='w-full bg-sky-500 text-xs font-semibold text-slate-950 hover:bg-sky-400'
                >
                  <Code2 className='mr-1.5 h-3.5 w-3.5' />
                  Load Inline Schema
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <FileViewerModal
        files={selectedFiles}
        isOpen={isViewerModalOpen}
        onOpenChange={setIsViewerModalOpen}
        onRemoveFile={removeFile}
      />
    </div>
  );
}

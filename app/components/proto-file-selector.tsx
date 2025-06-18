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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FileUp, Folder, X, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileViewerModal } from './file-viewer-modal';

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

// Structure types for directory navigation
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

// Exported interfaces
interface ProtoFile {
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
  const [error, setError] = useState<string | null>(null);

  console.log('ProtoFileSelector render - isModalOpen:', isModalOpen);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
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

    onFilesSelected(protoFiles);
    setIsModalOpen(false);
    setError(null);
  };

  const handleDirectorySelect = async () => {
    setError(null);
    setIsLoadingDirectory(true);

    try {
      // Check if File System Access API is supported
      if (!('showDirectoryPicker' in window)) {
        throw new Error(
          'File System Access API is not supported in this browser. Please use Chrome 86+ or Edge 86+.'
        );
      }

      // @ts-ignore - TypeScript doesn't have types for this API yet
      const directoryHandle: FileSystemDirectoryHandle = await window.showDirectoryPicker();

      console.log('Selected directory:', directoryHandle.name);

      const protoFiles: ProtoFile[] = [];
      const directoryStructure = await readDirectoryRecursively(
        directoryHandle,
        ''
      );

      console.log('Directory structure:', directoryStructure);

      // Extract .proto files from the structure
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

      console.log(
        `Found ${protoFiles.length} .proto files:`,
        protoFiles.map((f) => f.path)
      );

      onFilesSelected(protoFiles);
      setIsModalOpen(false);
    } catch (err: unknown) {
      console.error('Error selecting directory:', err);
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
        } catch (err: unknown) {
          const errorMessage =
            err instanceof Error ? err.message : 'Unknown error';
          console.warn(`Could not read file ${name}:`, errorMessage);
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
          <Label className='text-label-large font-medium'>Proto Files</Label>
          <span className='text-label-medium text-gray-400'>(Optional)</span>
        </div>
        {selectedFiles.length > 0 && (
          <Button
            variant='ghost'
            size='sm'
            onClick={clearAllFiles}
            className='h-6 px-2 py-0 text-gray-400 hover:text-red-400'
          >
            Clear All
          </Button>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button
            variant='outline'
            onClick={() => {
              console.log('Button clicked, opening modal');
              setIsModalOpen(true);
            }}
            className='flex h-[85px] w-full flex-col gap-1 border-dashed border-gray-700 bg-[#303134] hover:border-blue-500 hover:bg-[#303134]'
          >
            <FileUp className='h-5 w-5 text-blue-500' />
            <span className='text-body-medium'>
              {selectedFiles.length > 0
                ? `${selectedFiles.length} file(s) selected - Click to change`
                : 'Select .proto files'}
            </span>
          </Button>
        </DialogTrigger>

        {/* </Dialog> */}

        {/* Show a more compact indicator of selected files directly on the button instead of below */}
        {selectedFiles.length === 0 && (
          <p className='mt-1 text-label-medium text-gray-400'>
            Without proto files, field names will be replaced with field numbers
          </p>
        )}

        {selectedFiles.length > 0 && (
          <div className='mt-2'>
            <div className='flex items-center justify-between'>
              <div className='text-label-medium text-gray-400'>
                Selected files ({selectedFiles.length}):
              </div>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setIsViewerModalOpen(true)}
                className='h-5 p-0 text-label-medium text-blue-400 hover:text-blue-300'
              >
                View all
              </Button>
            </div>

            {/* Show first file with ellipsis if there are more */}
            <div className='mt-1 flex items-center justify-between rounded bg-[#3a3a3a] px-2 py-1 text-label-medium'>
              <span className='max-w-[200px] truncate font-mono text-gray-300'>
                {selectedFiles[0].path}
                {selectedFiles.length > 1
                  ? ` + ${selectedFiles.length - 1} more...`
                  : ''}
              </span>
            </div>
          </div>
        )}

        <DialogContent className='border-gray-800 bg-[#202124] sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='text-headline-small text-white'>Select Proto Files</DialogTitle>
            <DialogDescription className='text-body-large text-gray-400'>
              Choose how you want to provide your .proto schema files
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            {error && (
              <Alert
                variant='destructive'
                className='border-red-800 bg-red-900/30 text-red-200'
              >
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className='grid gap-4'>
              <Card className='cursor-pointer border-gray-700 bg-[#303134] transition-colors hover:bg-[#3a3a3a]'>
                <CardHeader className='pb-3'>
                  <CardTitle className='flex items-center gap-2 text-title-large text-white'>
                    <FileUp className='h-5 w-5 text-blue-500' />
                    Upload Files
                  </CardTitle>
                  <CardDescription className='text-body-medium text-gray-400'>
                    Select one or more .proto files from your computer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Input
                    type='file'
                    accept='.proto'
                    multiple
                    onChange={handleFileUpload}
                    className='hidden'
                    id='file-upload'
                  />
                  <Button
                    variant='outline'
                    className='w-full border-gray-600 hover:border-blue-500'
                    onClick={() =>
                      document.getElementById('file-upload')?.click()
                    }
                  >
                    Choose Files
                  </Button>
                </CardContent>
              </Card>

              <Card className='cursor-pointer border-gray-700 bg-[#303134] transition-colors hover:bg-[#3a3a3a]'>
                <CardHeader className='pb-3'>
                  <CardTitle className='flex items-center gap-2 text-title-large text-white'>
                    <Folder className='h-5 w-5 text-green-500' />
                    Select Directory
                  </CardTitle>
                  <CardDescription className='text-body-medium text-gray-400'>
                    Choose a folder and we'll find all .proto files in it
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant='outline'
                    className='w-full border-gray-600 hover:border-green-500'
                    onClick={handleDirectorySelect}
                    disabled={isLoadingDirectory}
                  >
                    {isLoadingDirectory ? 'Loading...' : 'Select Directory'}
                  </Button>
                  <p className='mt-2 text-label-medium text-gray-500'>
                    Requires Chrome 86+ or Edge 86+
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* File Viewer Modal */}
      <FileViewerModal
        files={selectedFiles}
        isOpen={isViewerModalOpen}
        onOpenChange={setIsViewerModalOpen}
        onRemoveFile={removeFile}
      />
    </div>
  );
}

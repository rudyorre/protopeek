'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { X, FileCode } from 'lucide-react';

interface ProtoFile {
  name: string;
  content: string;
  path: string;
}

interface FileViewerModalProps {
  files: ProtoFile[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRemoveFile: (path: string) => void;
}

export function FileViewerModal({
  files,
  isOpen,
  onOpenChange,
  onRemoveFile,
}: FileViewerModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='border-slate-800 bg-[#111621] text-slate-100 sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle className='text-base font-semibold text-white'>
            Loaded Proto Schemas
          </DialogTitle>
          <DialogDescription className='text-xs text-slate-400'>
            {files.length} proto file{files.length !== 1 ? 's' : ''} currently
            active
          </DialogDescription>
        </DialogHeader>

        <div className='max-h-[60vh] space-y-3 overflow-y-auto pr-1'>
          {files.map((file) => (
            <div
              key={file.path}
              className='rounded-lg border border-slate-800 bg-[#0D111A] p-3'
            >
              <div className='mb-2 flex items-center justify-between'>
                <div className='flex items-center gap-2 truncate'>
                  <FileCode className='h-4 w-4 shrink-0 text-sky-400' />
                  <div className='truncate'>
                    <p className='font-mono text-xs font-semibold text-slate-200'>
                      {file.name}
                    </p>
                    <p className='truncate font-mono text-[10px] text-slate-500'>
                      {file.path}
                    </p>
                  </div>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => onRemoveFile(file.path)}
                  className='ml-2 h-7 w-7 p-0 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400'
                >
                  <X className='h-3.5 w-3.5' />
                </Button>
              </div>
              <pre className='max-h-40 overflow-x-auto overflow-y-auto rounded border border-slate-800/80 bg-slate-950 p-2.5 font-mono text-[11px] leading-relaxed text-slate-300'>
                {file.content}
              </pre>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

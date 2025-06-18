'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { X } from 'lucide-react';

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
      <DialogContent className='border-gray-800 bg-[#202124] sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-headline-small text-white'>Selected Proto Files</DialogTitle>
          <DialogDescription className='text-body-large text-gray-400'>
            {files.length} proto file{files.length !== 1 ? 's' : ''} currently
            selected
          </DialogDescription>
        </DialogHeader>

        <div className='max-h-[50vh] space-y-2 overflow-y-auto pr-2'>
          {files.map((file) => (
            <div
              key={file.path}
              className='flex items-center justify-between rounded-md bg-[#303134] p-2'
            >
              <div className='flex-1 truncate'>
                <p className='text-label-large font-medium text-gray-200'>{file.name}</p>
                <p className='truncate text-label-medium text-gray-400'>{file.path}</p>
              </div>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onRemoveFile(file.path)}
                className='ml-2 h-7 w-7 p-0 text-gray-400 hover:text-red-400'
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

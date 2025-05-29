"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { X } from "lucide-react"

interface ProtoFile {
  name: string
  content: string
  path: string
}

interface FileViewerModalProps {
  files: ProtoFile[]
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onRemoveFile: (path: string) => void
}

export function FileViewerModal({ files, isOpen, onOpenChange, onRemoveFile }: FileViewerModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#202124] border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">Selected Proto Files</DialogTitle>
          <DialogDescription className="text-gray-400">
            {files.length} proto file{files.length !== 1 ? 's' : ''} currently selected
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
          {files.map((file) => (
            <div 
              key={file.path} 
              className="bg-[#303134] rounded-md p-2 flex items-center justify-between"
            >
              <div className="truncate flex-1">
                <p className="text-sm font-medium text-gray-200">{file.name}</p>
                <p className="text-xs text-gray-400 truncate">{file.path}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveFile(file.path)}
                className="ml-2 h-7 w-7 p-0 text-gray-400 hover:text-red-400"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUp, Folder, X, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ProtoFile {
  name: string
  content: string
  path: string
}

interface ProtoFileSelectorProps {
  onFilesSelected: (files: ProtoFile[]) => void
  selectedFiles: ProtoFile[]
}

export function ProtoFileSelector({ onFilesSelected, selectedFiles }: ProtoFileSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoadingDirectory, setIsLoadingDirectory] = useState(false)
  const [error, setError] = useState<string | null>(null)

  console.log("ProtoFileSelector render - isModalOpen:", isModalOpen)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const protoFiles: ProtoFile[] = []

    for (const file of files) {
      if (file.name.endsWith(".proto")) {
        try {
          const content = await file.text()
          protoFiles.push({
            name: file.name,
            content,
            path: file.name,
          })
        } catch (err) {
          console.error(`Error reading file ${file.name}:`, err)
        }
      }
    }

    onFilesSelected(protoFiles)
    setIsModalOpen(false)
    setError(null)
  }

  const handleDirectorySelect = async () => {
    setError(null)
    setIsLoadingDirectory(true)

    try {
      // Check if File System Access API is supported
      if (!("showDirectoryPicker" in window)) {
        throw new Error("File System Access API is not supported in this browser. Please use Chrome 86+ or Edge 86+.")
      }

      // @ts-ignore - TypeScript doesn't have types for this API yet
      const directoryHandle = await window.showDirectoryPicker()

      console.log("Selected directory:", directoryHandle.name)

      const protoFiles: ProtoFile[] = []
      const directoryStructure = await readDirectoryRecursively(directoryHandle, "")

      console.log("Directory structure:", directoryStructure)

      // Extract .proto files from the structure
      const extractProtoFiles = (structure: any, basePath = "") => {
        for (const [name, item] of Object.entries(structure)) {
          const currentPath = basePath ? `${basePath}/${name}` : name

          if (item && typeof item === "object") {
            if (item.type === "file" && name.endsWith(".proto")) {
              protoFiles.push({
                name,
                content: item.content,
                path: currentPath,
              })
            } else if (item.type === "directory") {
              extractProtoFiles(item.children, currentPath)
            }
          }
        }
      }

      extractProtoFiles(directoryStructure)

      console.log(
        `Found ${protoFiles.length} .proto files:`,
        protoFiles.map((f) => f.path),
      )

      onFilesSelected(protoFiles)
      setIsModalOpen(false)
    } catch (err: any) {
      console.error("Error selecting directory:", err)
      setError(err.message || "Failed to access directory. Please try again.")
    } finally {
      setIsLoadingDirectory(false)
    }
  }

  const readDirectoryRecursively = async (directoryHandle: any, path: string): Promise<any> => {
    const structure: any = {}

    for await (const [name, handle] of directoryHandle.entries()) {
      if (handle.kind === "file") {
        try {
          const file = await handle.getFile()
          const content = name.endsWith(".proto") ? await file.text() : null
          structure[name] = {
            type: "file",
            size: file.size,
            lastModified: file.lastModified,
            content: content,
          }
        } catch (err) {
          console.warn(`Could not read file ${name}:`, err)
          structure[name] = {
            type: "file",
            error: "Could not read file",
          }
        }
      } else if (handle.kind === "directory") {
        structure[name] = {
          type: "directory",
          children: await readDirectoryRecursively(handle, `${path}/${name}`),
        }
      }
    }

    return structure
  }

  const removeFile = (pathToRemove: string) => {
    const updatedFiles = selectedFiles.filter((file) => file.path !== pathToRemove)
    onFilesSelected(updatedFiles)
  }

  const clearAllFiles = () => {
    onFilesSelected([])
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">Proto Files</Label>
          <span className="text-xs text-gray-400">(Optional)</span>
        </div>
        {selectedFiles.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAllFiles} className="text-gray-400 hover:text-red-400">
            Clear All
          </Button>
        )}
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-gray-300">Selected files ({selectedFiles.length}):</div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {selectedFiles.map((file) => (
              <div key={file.path} className="flex items-center justify-between bg-[#3a3a3a] px-3 py-2 rounded text-sm">
                <span className="text-gray-300 font-mono">{file.path}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.path)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            onClick={() => {
              console.log("Button clicked, opening modal")
              setIsModalOpen(true)
            }}
            className="w-full h-24 border-dashed border-gray-700 hover:border-blue-500 bg-[#303134] hover:bg-[#303134] flex flex-col gap-2"
          >
            <FileUp className="h-6 w-6 text-blue-500" />
            <span>
              {selectedFiles.length > 0
                ? `${selectedFiles.length} file(s) selected - Click to change`
                : "Select .proto files"}
            </span>
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md bg-[#202124] border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Select Proto Files</DialogTitle>
            <DialogDescription className="text-gray-400">
              Choose how you want to provide your .proto schema files
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-red-900/30 border-red-800 text-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4">
              <Card className="border-gray-700 bg-[#303134] hover:bg-[#3a3a3a] transition-colors cursor-pointer">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-white">
                    <FileUp className="h-5 w-5 text-blue-500" />
                    Upload Files
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Select one or more .proto files from your computer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Input
                    type="file"
                    accept=".proto"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button
                    variant="outline"
                    className="w-full border-gray-600 hover:border-blue-500"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    Choose Files
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-gray-700 bg-[#303134] hover:bg-[#3a3a3a] transition-colors cursor-pointer">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-white">
                    <Folder className="h-5 w-5 text-green-500" />
                    Select Directory
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Choose a folder and we'll find all .proto files in it
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full border-gray-600 hover:border-green-500"
                    onClick={handleDirectorySelect}
                    disabled={isLoadingDirectory}
                  >
                    {isLoadingDirectory ? "Loading..." : "Select Directory"}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">Requires Chrome 86+ or Edge 86+</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <p className="text-xs text-gray-400">Without proto files, field names will be replaced with field numbers</p>
    </div>
  )
}

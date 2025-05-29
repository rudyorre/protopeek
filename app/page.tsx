"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, FileUp, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { ProtoVisualizer } from "./components/proto-visualizer"
import { ProtoByteTable } from "./components/proto-byte-table"
import { Header } from "./components/header"
import { getSampleData } from "./utils/sample-data"

export default function ProtobufDecoder() {
  const [protobufBytes, setProtobufBytes] = useState("")
  const [protoFile, setProtoFile] = useState<File | null>(null)
  const [decodedData, setDecodedData] = useState<string | null>(null)
  const [protoStructure, setProtoStructure] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDecoding, setIsDecoding] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setProtoFile(file)
    setError(null)

    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setProtoStructure(event.target.result as string)
        }
      }
      reader.readAsText(file)
    } else {
      setProtoStructure(null)
    }
  }

  const handleDecode = () => {
    setError(null)
    setIsDecoding(true)

    // Validation
    if (!protobufBytes.trim()) {
      setError("Please enter protobuf bytes to decode")
      setIsDecoding(false)
      return
    }

    // In a real implementation, we would use a protobuf library to decode the data
    setTimeout(() => {
      try {
        // Get sample data based on input text
        const sampleType = getSampleType(protobufBytes.trim().toLowerCase())
        const mockDecodedData = getSampleData(sampleType, protoFile !== null)

        setDecodedData(JSON.stringify(mockDecodedData, null, 2))
        setIsDecoding(false)
      } catch (err) {
        setError("Failed to decode protobuf data. Please check your inputs and try again.")
        setIsDecoding(false)
      }
    }, 1000)
  }

  // Determine which sample data to use based on input text
  const getSampleType = (input: string): "simple" | "repeated" | "complex" => {
    if (input.includes("simple")) return "simple"
    if (input.includes("repeated")) return "repeated"
    return "complex" // default
  }

  const handleDownload = () => {
    if (!decodedData) return

    const blob = new Blob([decodedData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "decoded-protobuf.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <Header />
      <div className="container mx-auto py-10 px-4 max-w-6xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-medium mb-2">Decode Protocol Buffers</h2>
          <p className="text-gray-400">Visualize and explore your protobuf data with or without schema files</p>
        </div>

        <Card className="border border-gray-800 bg-[#202124] shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-medium">Input Data</CardTitle>
            <CardDescription>
              Paste your protobuf bytes to decode the data
              <div className="mt-1 text-xs text-gray-400">
                Try typing "simple", "repeated", or "complex" to see different sample outputs
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="protobufBytes" className="text-sm font-medium">
                Protobuf Bytes
              </Label>
              <Textarea
                id="protobufBytes"
                placeholder="Paste your protobuf bytes here..."
                className="min-h-[120px] font-mono text-sm bg-[#303134] border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                value={protobufBytes}
                onChange={(e) => setProtobufBytes(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="protoFile" className="text-sm font-medium">
                  Proto File
                </Label>
                <span className="text-xs text-gray-400">(Optional)</span>
              </div>
              <div className="flex items-center gap-3">
                <Input id="protoFile" type="file" accept=".proto" onChange={handleFileChange} className="hidden" />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("protoFile")?.click()}
                  className="w-full h-24 border-dashed border-gray-700 hover:border-blue-500 bg-[#303134] hover:bg-[#303134] flex flex-col gap-2"
                >
                  <FileUp className="h-6 w-6 text-blue-500" />
                  <span>{protoFile ? protoFile.name : "Upload a .proto file (optional)"}</span>
                </Button>
              </div>
              <p className="text-xs text-gray-400">
                Without a .proto file, field names will be replaced with field numbers
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-900/30 border-red-800 text-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleDecode}
              disabled={isDecoding}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {isDecoding ? "Decoding..." : "Decode"}
            </Button>
          </CardContent>
        </Card>

        {decodedData && (
          <Card className="mt-8 border border-gray-800 bg-[#202124] shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-medium">Decoded Results</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="border-gray-700 hover:border-blue-500 bg-[#303134] hover:bg-[#303134] text-gray-200"
                >
                  <Download className="h-4 w-4 mr-2 text-blue-500" />
                  Download JSON
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="decoded" className="w-full">
                <TabsList className="mb-4 bg-[#303134] p-1 rounded-lg">
                  <TabsTrigger
                    value="decoded"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
                  >
                    Tree View
                  </TabsTrigger>
                  <TabsTrigger
                    value="byte-table"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
                  >
                    Byte Table
                  </TabsTrigger>
                  {protoStructure && (
                    <TabsTrigger
                      value="structure"
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
                    >
                      Proto Structure
                    </TabsTrigger>
                  )}
                  <TabsTrigger
                    value="raw"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
                  >
                    Raw JSON
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="decoded">
                  <ProtoVisualizer data={decodedData} />
                </TabsContent>
                <TabsContent value="byte-table" className="overflow-x-auto">
                  <div className="min-w-[800px]">
                    <ProtoByteTable data={decodedData} />
                  </div>
                </TabsContent>
                {protoStructure && (
                  <TabsContent value="structure">
                    <pre className={cn("bg-[#303134] p-4 rounded-md", "text-sm font-mono")}>{protoStructure}</pre>
                  </TabsContent>
                )}
                <TabsContent value="raw">
                  <pre className={cn("bg-[#303134] p-4 rounded-md", "text-sm font-mono")}>{decodedData}</pre>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}

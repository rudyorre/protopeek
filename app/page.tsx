"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { ProtoVisualizer } from "./components/proto-visualizer"
import { ProtoByteTable } from "./components/proto-byte-table"
import { Header } from "./components/header"
import { ProtoFileSelector } from "./components/proto-file-selector"
import { MessageTypeSelector } from "./components/message-type-selector"
import { ProtobufDecoder, parseProtobufInput } from "./utils/protobuf-decoder"

export default function Home() {
  const [protobufBytes, setProtobufBytes] = useState("")
  const [decodedData, setDecodedData] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDecoding, setIsDecoding] = useState(false)
  const [protoFiles, setProtoFiles] = useState<Array<{ name: string; content: string; path: string }>>([])
  const [availableMessageTypes, setAvailableMessageTypes] = useState<string[]>([])
  const [selectedMessageType, setSelectedMessageType] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const decoderRef = useRef<ProtobufDecoder>(new ProtobufDecoder())

  const handleProtoFilesSelected = async (files: Array<{ name: string; content: string; path: string }>) => {
    setProtoFiles(files)
    setError(null)
    setInfo(null)
    setAvailableMessageTypes([])
    setSelectedMessageType(null)

    if (files.length > 0) {
      try {
        await decoderRef.current.loadProtoFiles(files)
        const messageTypes = decoderRef.current.getAvailableMessageTypes()
        setAvailableMessageTypes(messageTypes)

        if (messageTypes.length > 0) {
          setSelectedMessageType(messageTypes[0])
          setInfo(`Loaded ${files.length} proto file(s) with ${messageTypes.length} message type(s)`)
        }
      } catch (err: any) {
        setError(`Failed to load proto files: ${err.message}`)
      }
    }
  }

  const handleDecode = async () => {
    setError(null)
    setInfo(null)
    setIsDecoding(true)

    // Validation
    if (!protobufBytes.trim()) {
      setError("Please enter protobuf bytes to decode")
      setIsDecoding(false)
      return
    }

    try {
      // Parse the input bytes
      const bytes = parseProtobufInput(protobufBytes.trim())
      console.log(
        "Parsed bytes:",
        Array.from(bytes)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(" "),
      )

      let decodedResult

      if (protoFiles.length > 0 && selectedMessageType) {
        // Decode with schema
        console.log("Decoding with schema using message type:", selectedMessageType)
        decodedResult = await decoderRef.current.decodeWithSchema(bytes, selectedMessageType)
        setInfo(`Successfully decoded using message type: ${selectedMessageType}`)
      } else {
        // Decode without schema
        console.log("Decoding without schema")
        decodedResult = await decoderRef.current.decodeWithoutSchema(bytes)
        setInfo("Successfully decoded without schema (field names are numbers)")
      }

      console.log("Decoded result:", decodedResult)
      setDecodedData(JSON.stringify(decodedResult, null, 2))
    } catch (err: any) {
      console.error("Decoding error:", err)
      setError(`Failed to decode protobuf data: ${err.message}`)
    } finally {
      setIsDecoding(false)
    }
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

  const loadSampleData = (type: "simple" | "repeated" | "complex") => {
    const samples = {
      simple: "0a0a4a6f686e20446f6512d2091a106a6f686e406578616d706c652e636f6d",
      repeated:
        "0a0a4d79205461677312094a6f686e20446f651a0a696d706f7274616e741a04776f726b1a08706572736f6e616c1a06757267656e741a09666f6c6c6f772d7570",
      complex:
        "0a2e0a084a6f686e20446f6510d20912106a6f686e406578616d706c652e636f6d1a0a0a08353535343332311001220a0a08353535313233341000",
    }
    setProtobufBytes(samples[type])
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
              Paste your protobuf bytes to decode the data (hex, base64, or comma-separated bytes)
              <div className="mt-2 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadSampleData("simple")}
                  className="text-xs border-gray-600 hover:border-blue-500"
                >
                  Load Simple Sample
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadSampleData("repeated")}
                  className="text-xs border-gray-600 hover:border-blue-500"
                >
                  Load Repeated Sample
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadSampleData("complex")}
                  className="text-xs border-gray-600 hover:border-blue-500"
                >
                  Load Complex Sample
                </Button>
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
                placeholder="Paste your protobuf bytes here (hex: 0a0b48656c6c6f20576f726c64, base64: CgtIZWxsbyBXb3JsZA==, or bytes: 10,11,72,101,108,108,111,32,87,111,114,108,100)"
                className="min-h-[120px] font-mono text-sm bg-[#303134] border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                value={protobufBytes}
                onChange={(e) => setProtobufBytes(e.target.value)}
              />
            </div>

            <ProtoFileSelector onFilesSelected={handleProtoFilesSelected} selectedFiles={protoFiles} />

            {availableMessageTypes.length > 0 && (
              <MessageTypeSelector
                messageTypes={availableMessageTypes}
                selectedType={selectedMessageType}
                onTypeSelected={setSelectedMessageType}
              />
            )}

            {info && (
              <Alert className="bg-blue-900/30 border-blue-800 text-blue-200">
                <Info className="h-4 w-4" />
                <AlertDescription>{info}</AlertDescription>
              </Alert>
            )}

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
                  {protoFiles.length > 0 && (
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
                {protoFiles.length > 0 && (
                  <TabsContent value="structure">
                    <div className="space-y-4">
                      {protoFiles.map((file, index) => (
                        <div key={file.path}>
                          <h3 className="text-lg font-medium mb-2 text-white">{file.path}</h3>
                          <pre className={cn("bg-[#303134] p-4 rounded-md", "text-sm font-mono")}>{file.content}</pre>
                        </div>
                      ))}
                    </div>
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

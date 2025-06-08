"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Download, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { ProtoVisualizer } from "./components/proto-visualizer"
import { ProtoByteTable } from "./components/proto-byte-table"
import { Header } from "./components/header"
import { ProtoFileSelector } from "./components/proto-file-selector"
import { MessageTypeSelector } from "./components/message-type-selector"
import { DecodedField, ProtobufDecoder, parseProtobufInput } from "./utils/protobuf-decoder"

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

      let decodedResult: DecodedField[];

      if (protoFiles.length > 0 && selectedMessageType) {
        // Decode with schema
        console.log("Decoding with schema using message type:", selectedMessageType)
        decodedResult = await decoderRef.current.decodeWithSchema(bytes, selectedMessageType)
        setInfo(`Successfully decoded using message type: ${selectedMessageType}`)
      } else {
        // Decode without schema
        console.log("Decoding without schema")
        // decodedResult = await decoderRef.current.decodeWithoutSchema(bytes)
        decodedResult = decoderRef.current.decodeWithoutSchema(bytes);
        console.log(decodedResult);
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
      simple: "ChVTaW1wbGUgUGVyc29uIG1lc3NhZ2U=",
      repeated:
        "CgxTb21lIG51bWJlcnMSFwoDb25lCgN0d28KBXRocmVlCgRmb3Vy",
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
              Paste your protobuf bytes to decode the data (base64 or hex)
              <div className="mt-2 flex flex-wrap gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadSampleData("simple")}
                  className="text-xs h-7 border-gray-600 hover:border-blue-500"
                >
                  Simple
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadSampleData("repeated")}
                  className="text-xs h-7 border-gray-600 hover:border-blue-500"
                >
                  Repeated
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadSampleData("complex")}
                  className="text-xs h-7 border-gray-600 hover:border-blue-500"
                >
                  Complex
                </Button>
                <span className="ml-1 text-xs text-gray-400 self-center">← Sample data</span>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left column: Protobuf Bytes */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="protobufBytes" className="text-sm font-medium">
                      Protobuf Bytes
                    </Label>
                  </div>
                </div>
                <Textarea
                  id="protobufBytes"
                  placeholder="Paste your protobuf bytes here (base64: CgtIZWxsbyBXb3JsZA== or hex: 0a0b48656c6c6f20576f726c64)"
                  className="mt-2 min-h-[85px] h-[85px] font-mono text-sm bg-[#303134] border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                  value={protobufBytes}
                  onChange={(e) => setProtobufBytes(e.target.value)}
                />
                <p className="text-xs text-gray-400 mt-1">Enter hex, base64, or comma-separated bytes</p>
              </div>

              {/* Right column: Proto File Selection */}
              <div>
                <div className="flex-1">
                  <ProtoFileSelector onFilesSelected={handleProtoFilesSelected} selectedFiles={protoFiles} />
                </div>

                {availableMessageTypes.length > 0 && (
                  <div className="mt-2">
                    <MessageTypeSelector
                      messageTypes={availableMessageTypes}
                      selectedType={selectedMessageType}
                      onTypeSelected={setSelectedMessageType}
                    />
                  </div>
                )}
              </div>
            </div>

            {info && (
              <Alert className="bg-blue-900/30 border-blue-800 text-blue-200 py-2 flex">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">{info}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="bg-red-900/30 border-red-800 text-red-200 py-2 flex">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">{error}</AlertDescription>
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

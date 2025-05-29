"use client"

import { cn } from "@/lib/utils"

interface ProtoField {
  type: string
  value: any
}

interface ProtoData {
  message: string
  fields: Record<string, ProtoField>
}

export function ProtoByteTable({ data }: { data: string }) {
  const parsedData: ProtoData = JSON.parse(data)

  // In a real implementation, we would have actual byte ranges
  // Here we'll simulate them based on the structure
  const simulatedByteRanges = generateSimulatedByteRanges(parsedData)

  return (
    <div className="bg-[#303134] rounded-md p-4">
      <h2 className="text-xl font-medium mb-4">Result</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#202124] text-gray-200">
              <th className="border-2 border-gray-600 px-4 py-2 text-left font-medium">Byte Range</th>
              <th className="border-2 border-gray-600 px-4 py-2 text-left font-medium">Field Number</th>
              <th className="border-2 border-gray-600 px-4 py-2 text-left font-medium">Type</th>
              <th className="border-2 border-gray-600 px-4 py-2 text-left font-medium">Content</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(parsedData.fields).map(([key, field], index) => {
              const startByte = index * 50
              const endByte = startByte + 49
              const byteRange = `${startByte}-${endByte}`

              return (
                <tr key={key} className="border-t">
                  <td className="border-2 border-gray-600 px-4 py-2">{byteRange}</td>
                  <td className="border-2 border-gray-600 px-4 py-2">{key}</td>
                  <td className="border-2 border-gray-600 px-4 py-2">
                    {field.type === "repeated_message" ? "protobuf" : field.type}
                  </td>
                  <td className="border-2 border-gray-600 px-4 py-2">
                    {field.type === "repeated_message" ? (
                      <RenderNestedMessages messages={field.value} parentByteRange={byteRange} />
                    ) : (
                      <span className={getValueClass(field.type)}>{formatValue(field)}</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const RenderNestedMessages = ({
  messages,
  parentByteRange,
}: {
  messages: any[]
  parentByteRange: string
}) => {
  if (!messages || messages.length === 0) return null

  // Calculate simulated byte ranges for each message
  const [startByte] = parentByteRange.split("-").map(Number)
  const messageLength = 30

  return (
    <>
      {messages.map((message, messageIndex) => {
        const messageStartByte = startByte + messageIndex * messageLength
        const messageEndByte = messageStartByte + messageLength - 1
        const messageByteRange = `${messageStartByte}-${messageEndByte}`

        return (
          <table key={messageIndex} className="w-full border-collapse mb-4">
            <thead>
              <tr className="bg-[#202124] text-gray-200">
                <th className="border-2 border-gray-600 px-4 py-2 text-left font-medium">Byte Range</th>
                <th className="border-2 border-gray-600 px-4 py-2 text-left font-medium">Field Number</th>
                <th className="border-2 border-gray-600 px-4 py-2 text-left font-medium">Type</th>
                <th className="border-2 border-gray-600 px-4 py-2 text-left font-medium">Content</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(message.value).map(([fieldKey, fieldValue]: [string, any], fieldIndex) => {
                const fieldStartByte = messageStartByte + fieldIndex * 5
                const fieldEndByte = fieldStartByte + 4
                const fieldByteRange = `${fieldStartByte}-${fieldEndByte}`

                return (
                  <tr key={fieldKey} className="border-t">
                    <td className="border-2 border-gray-600 px-4 py-2">{fieldByteRange}</td>
                    <td className="border-2 border-gray-600 px-4 py-2">{fieldKey}</td>
                    <td className="border-2 border-gray-600 px-4 py-2">
                      {fieldValue.type === "repeated_message" ? "protobuf" : fieldValue.type}
                    </td>
                    <td className="border-2 border-gray-600 px-4 py-2">
                      {fieldValue.type === "repeated_message" ? (
                        <RenderNestedMessages messages={fieldValue.value} parentByteRange={fieldByteRange} />
                      ) : (
                        <span className={getValueClass(fieldValue.type)}>{formatValue(fieldValue)}</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )
      })}
    </>
  )
}

// Helper function to format values based on their type
function formatValue(field: ProtoField): string {
  if (!field) return ""

  switch (field.type) {
    case "string":
      return field.value
    case "int32":
    case "int64":
    case "varint":
      if (typeof field.value === "number") {
        return `As uint: ${field.value}\nAs sint: ${field.value < 0 ? field.value : field.value - 1}`
      }
      return field.value.toString()
    case "bool":
      return field.value ? "true" : "false"
    case "enum":
      return field.value
    case "timestamp":
      return field.value
    default:
      return field.value.toString()
  }
}

// Helper function to get CSS class for different value types
function getValueClass(type: string): string {
  return cn({
    "text-blue-400": type === "string",
    "text-green-400": type === "bool",
    "text-amber-400": type === "int32" || type === "int64" || type === "varint",
    "text-purple-400": type === "timestamp",
    "text-rose-400": type === "bytes",
    "text-teal-400": type === "float" || type === "double",
    "text-orange-400": type === "enum",
  })
}

// Helper function to generate simulated byte ranges
function generateSimulatedByteRanges(data: ProtoData) {
  // This would be replaced with actual byte ranges in a real implementation
  const ranges: Record<string, { start: number; end: number }> = {}
  let currentByte = 0

  Object.keys(data.fields).forEach((key) => {
    const fieldSize = 50 // Arbitrary size for demonstration
    ranges[key] = {
      start: currentByte,
      end: currentByte + fieldSize - 1,
    }
    currentByte += fieldSize
  })

  return ranges
}

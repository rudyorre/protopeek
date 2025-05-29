"use client"

import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"

interface ProtoField {
  type: string
  value: any
}

interface ProtoData {
  message: string
  fields: Record<string, ProtoField>
}

export function ProtoVisualizer({ data }: { data: string }) {
  const parsedData: ProtoData = JSON.parse(data)

  return (
    <div className="bg-[#303134] p-4 rounded-md">
      <div className="text-lg font-medium mb-2 text-white">{parsedData.message}</div>
      <ProtoValue data={{ type: "message", value: parsedData.fields }} />
    </div>
  )
}

const ProtoValue = ({ data, level = 0, fieldName = "" }: { data: ProtoField; level?: number; fieldName?: string }) => {
  const [isExpanded, setIsExpanded] = useState(true)

  if (!data) return null

  // Handle repeated fields (arrays)
  if (data.type === "repeated_message" || data.type === "repeated_string") {
    return (
      <div className={cn("pl-4", level > 0 ? "mt-2" : "")}>
        <div className="flex items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-400 mr-1" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400 mr-1" />
          )}
          <span className="font-medium text-gray-300">
            {fieldName} ({data.type === "repeated_message" ? `${data.value.length} items` : "array"})
          </span>
        </div>

        {isExpanded && (
          <div className="pl-4 border-l-2 border-gray-700">
            {data.type === "repeated_string" ? (
              <div className="text-blue-400 mt-1">
                [
                {data.value.map((item: string, index: number) => (
                  <span key={index}>
                    "{item}"{index < data.value.length - 1 ? ", " : ""}
                  </span>
                ))}
                ]
              </div>
            ) : (
              data.value.map((item: ProtoField, index: number) => (
                <div key={index} className="mt-2">
                  <div className="flex items-start">
                    <span className="font-medium mr-2 text-gray-400">[{index}]</span>
                    <ProtoValue data={item} level={level + 1} />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    )
  }

  if (data.type === "message") {
    return (
      <div className={cn("pl-0", level > 0 ? "mt-2" : "")}>
        {level > 0 && (
          <div className="flex items-center cursor-pointer mb-1" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400 mr-1" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400 mr-1" />
            )}
            <span className="font-medium text-gray-300">{fieldName || "Object"}</span>
          </div>
        )}

        {isExpanded && (
          <div className={cn("pl-4 border-l-2 border-gray-700", level === 0 ? "mt-2" : "")}>
            {Object.entries(data.value).map(([key, val]: [string, any]) => (
              <div key={key} className="mt-1">
                <div className="flex items-start">
                  {!isMessageOrRepeated(val) && <span className="font-medium mr-2 text-gray-300">{key}:</span>}
                  <ProtoValue data={val} level={level + 1} fieldName={key} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // For primitive values
  return (
    <div
      className={cn("flex items-center gap-2", {
        "text-blue-400": data.type === "string",
        "text-green-400": data.type === "bool",
        "text-amber-400": data.type === "int32" || data.type === "int64",
        "text-purple-400": data.type === "timestamp",
        "text-rose-400": data.type === "bytes",
        "text-teal-400": data.type === "float" || data.type === "double",
        "text-orange-400": data.type === "enum",
      })}
    >
      {/* Removed duplicate field name since it's already passed from the parent */}
      <span>
        {data.type === "string"
          ? `"${data.value}"`
          : data.type === "bool"
            ? data.value
              ? "true"
              : "false"
            : data.value.toString()}
      </span>
      <span className="text-xs text-gray-500">({data.type})</span>
    </div>
  )
}

// Helper function to check if a field is a message or repeated type
function isMessageOrRepeated(field: ProtoField): boolean {
  return field.type === "message" || field.type === "repeated_message" || field.type === "repeated_string"
}

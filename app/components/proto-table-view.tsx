"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProtoField {
  type: string
  value: any
}

interface ProtoData {
  message: string
  fields: Record<string, ProtoField>
}

export function ProtoTableView({ data }: { data: string }) {
  const parsedData: ProtoData = JSON.parse(data)

  return (
    <div className="bg-[#303134] rounded-md">
      <div className="text-lg font-medium p-4 text-white border-b border-gray-700">{parsedData.message}</div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#202124] text-gray-300 text-sm">
              <th className="py-2 px-4 text-left font-medium border-b border-gray-700">Field</th>
              <th className="py-2 px-4 text-left font-medium border-b border-gray-700">Type</th>
              <th className="py-2 px-4 text-left font-medium border-b border-gray-700">Value</th>
            </tr>
          </thead>
          <tbody>
            <ProtoTableRows data={{ type: "message", value: parsedData.fields }} />
          </tbody>
        </table>
      </div>
    </div>
  )
}

const ProtoTableRows = ({
  data,
  parentKey = "",
  level = 0,
}: { data: ProtoField; parentKey?: string; level?: number }) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  if (!data || !data.value) return null

  const toggleExpand = (key: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  if (data.type === "message") {
    return (
      <>
        {Object.entries(data.value).map(([key, val]: [string, ProtoField], index) => {
          const fullKey = parentKey ? `${parentKey}.${key}` : key
          const isExpandable = isMessageOrRepeated(val)
          const isExpanded = expandedItems[fullKey] !== false // Default to expanded

          return (
            <tr
              key={fullKey}
              className={cn(
                "border-b border-gray-700/50 hover:bg-[#3a3a3a]",
                index % 2 === 0 ? "bg-[#2a2a2a]" : "bg-[#303134]",
              )}
            >
              <td className="py-2 px-4 font-medium">
                <div className="flex items-center" style={{ paddingLeft: `${level * 16}px` }}>
                  {isExpandable ? (
                    <button onClick={() => toggleExpand(fullKey)} className="mr-2 focus:outline-none">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  ) : (
                    <span className="w-6"></span>
                  )}
                  <span className="text-gray-300">{key}</span>
                </div>
              </td>
              <td className="py-2 px-4 text-gray-400">{val.type}</td>
              <td className="py-2 px-4">
                {!isExpandable ? (
                  <ValueDisplay field={val} />
                ) : (
                  <span className="text-gray-400">
                    {val.type === "repeated_message" || val.type === "repeated_string"
                      ? `${Array.isArray(val.value) ? val.value.length : 0} items`
                      : "Object"}
                  </span>
                )}
              </td>
            </tr>
          )
        })}
        {Object.entries(data.value).map(([key, val]: [string, ProtoField]) => {
          const fullKey = parentKey ? `${parentKey}.${key}` : key
          const isExpandable = isMessageOrRepeated(val)
          const isExpanded = expandedItems[fullKey] !== false

          if (isExpandable && isExpanded) {
            if (val.type === "repeated_message") {
              return (
                <tr key={`${fullKey}-expanded`} className="border-b border-gray-700/50">
                  <td colSpan={3} className="p-0">
                    <div className="pl-4">
                      {val.value.map((item: ProtoField, index: number) => (
                        <table key={index} className="w-full border-l-2 border-blue-500/30 ml-4 my-2">
                          <thead>
                            <tr className="bg-[#202124] text-gray-300 text-sm">
                              <th className="py-2 px-4 text-left font-medium border-b border-gray-700">
                                <div className="flex items-center">
                                  <span className="text-blue-400 mr-2">[{index}]</span>
                                  <span>Field</span>
                                </div>
                              </th>
                              <th className="py-2 px-4 text-left font-medium border-b border-gray-700">Type</th>
                              <th className="py-2 px-4 text-left font-medium border-b border-gray-700">Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            <ProtoTableRows data={item} level={level + 1} parentKey={`${fullKey}[${index}]`} />
                          </tbody>
                        </table>
                      ))}
                    </div>
                  </td>
                </tr>
              )
            } else if (val.type === "repeated_string") {
              return (
                <tr key={`${fullKey}-expanded`} className="border-b border-gray-700/50">
                  <td colSpan={3} className="py-2 px-4">
                    <div className="pl-8 border-l-2 border-blue-500/30 ml-4">
                      <div className="bg-[#2a2a2a] p-2 rounded">
                        {val.value.map((item: string, index: number) => (
                          <div key={index} className="py-1">
                            <span className="text-blue-400 mr-2">[{index}]</span>
                            <span className="text-blue-400">"{item}"</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              )
            } else if (val.type === "message") {
              return (
                <tr key={`${fullKey}-expanded`} className="border-b border-gray-700/50">
                  <td colSpan={3} className="p-0">
                    <table className="w-full border-l-2 border-blue-500/30 ml-4 my-2">
                      <tbody>
                        <ProtoTableRows data={val} level={level + 1} parentKey={fullKey} />
                      </tbody>
                    </table>
                  </td>
                </tr>
              )
            }
          }
          return null
        })}
      </>
    )
  }

  return null
}

const ValueDisplay = ({ field }: { field: ProtoField }) => {
  if (!field) return null

  return (
    <span
      className={cn({
        "text-blue-400": field.type === "string",
        "text-green-400": field.type === "bool",
        "text-amber-400": field.type === "int32" || field.type === "int64",
        "text-purple-400": field.type === "timestamp",
        "text-rose-400": field.type === "bytes",
        "text-teal-400": field.type === "float" || field.type === "double",
        "text-orange-400": field.type === "enum",
      })}
    >
      {field.type === "string"
        ? `"${field.value}"`
        : field.type === "bool"
          ? field.value
            ? "true"
            : "false"
          : field.value.toString()}
    </span>
  )
}

// Helper function to check if a field is a message or repeated type
function isMessageOrRepeated(field: ProtoField): boolean {
  return field.type === "message" || field.type === "repeated_message" || field.type === "repeated_string"
}

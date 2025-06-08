"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { DecodedField } from "../utils/protobuf-decoder"
import React from "react"

export function ProtoTableView({ data }: { data: string }) {
  // Accepts DecodedField[] or a root DecodedField
  let root: DecodedField | null = null
  try {
    const parsed = JSON.parse(data)
    if (Array.isArray(parsed)) {
      root = { type: "message", value: parsed }
    } else if (parsed && parsed.type === "message" && Array.isArray(parsed.value)) {
      root = parsed
    } else {
      root = { type: "message", value: [] }
    }
  } catch {
    root = { type: "message", value: [] }
  }
  if (!root || !Array.isArray(root.value)) return null
  const messageName = root.message || "Message"
  return (
    <div className="bg-[#303134] rounded-md">
      <div className="text-lg font-medium p-4 text-white border-b border-gray-700">{messageName}</div>
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
            <ProtoTableRows fields={Array.isArray(root.value) && root.value.every(v => typeof v === "object") ? (root.value as DecodedField[]) : []} level={0} parentKey="" />
          </tbody>
        </table>
      </div>
    </div>
  )
}

const ProtoTableRows = ({ fields, parentKey = "", level = 0 }: { fields: DecodedField[]; parentKey?: string; level?: number }) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  if (!fields) return null
  return (
    <>
      {fields.map((field, idx) => {
        const key = field.message || String(field.fieldNumber ?? idx)
        const fullKey = parentKey ? `${parentKey}.${key}` : key
        const isExpandable = isMessageOrRepeated(field)
        const isExpanded = expandedItems[fullKey] !== false
        return (
          <React.Fragment key={fullKey}>
            <tr
              className={cn(
                "border-b border-gray-700/50 hover:bg-[#3a3a3a]",
                idx % 2 === 0 ? "bg-[#2a2a2a]" : "bg-[#303134]",
              )}
            >
              <td className="py-2 px-4 font-medium">
                <div className="flex items-center" style={{ paddingLeft: `${level * 16}px` }}>
                  {isExpandable ? (
                    <button onClick={() => setExpandedItems((prev) => ({ ...prev, [fullKey]: !isExpanded }))} className="mr-2 focus:outline-none">
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
              <td className="py-2 px-4 text-gray-400">{field.type}</td>
              <td className="py-2 px-4">
                {!isExpandable ? (
                  <ValueDisplay field={field} />
                ) : (
                  <span className="text-gray-400">
                    {field.type.startsWith("repeated_")
                      ? `${Array.isArray(field.value) ? field.value.length : 0} items`
                      : "Object"}
                  </span>
                )}
              </td>
            </tr>
            {isExpandable && isExpanded && (
              <tr key={`${fullKey}-expanded`} className="border-b border-gray-700/50">
                <td colSpan={3} className="p-0">
                  <div className="pl-4">
                    {field.type === "repeated_message" && Array.isArray(field.value) && (
                      (field.value as DecodedField[]).map((item, index) => (
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
                            <ProtoTableRows fields={item.value as DecodedField[]} level={level + 1} parentKey={`${fullKey}[${index}]`} />
                          </tbody>
                        </table>
                      ))
                    )}
                    {field.type === "repeated_string" && Array.isArray(field.value) && (
                      <div className="pl-8 border-l-2 border-blue-500/30 ml-4">
                        <div className="bg-[#2a2a2a] p-2 rounded">
                          {Array.isArray(field.value) && field.value.every(v => typeof v === "string") &&
                            field.value.map((item, index) => (
                              <div key={index} className="py-1">
                                <span className="text-blue-400 mr-2">[{index}]</span>
                                <span className="text-blue-400">"{item}"</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                    {field.type === "message" && Array.isArray(field.value) && (
                      <table className="w-full border-l-2 border-blue-500/30 ml-4 my-2">
                        <tbody>
                          <ProtoTableRows fields={field.value as DecodedField[]} level={level + 1} parentKey={fullKey} />
                        </tbody>
                      </table>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </React.Fragment>
        )
      })}
    </>
  )
}

const ValueDisplay = ({ field }: { field: DecodedField }) => {
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
          : field.value?.toString?.() ?? String(field.value)}
    </span>
  )
}

function isMessageOrRepeated(field: DecodedField): boolean {
  return field.type === "message" || field.type.startsWith("repeated_")
}

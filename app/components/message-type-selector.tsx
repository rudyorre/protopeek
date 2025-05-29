"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface MessageTypeSelectorProps {
  messageTypes: string[]
  selectedType: string | null
  onTypeSelected: (type: string) => void
}

export function MessageTypeSelector({ messageTypes, selectedType, onTypeSelected }: MessageTypeSelectorProps) {
  if (messageTypes.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Message Type</Label>
      <Select value={selectedType || ""} onValueChange={onTypeSelected}>
        <SelectTrigger className="bg-[#303134] border-gray-700 focus:border-blue-500">
          <SelectValue placeholder="Select a message type to decode" />
        </SelectTrigger>
        <SelectContent className="bg-[#303134] border-gray-700">
          {messageTypes.map((type) => (
            <SelectItem key={type} value={type} className="text-gray-200 focus:bg-[#404144]">
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-gray-400">Choose which message type to use for decoding your protobuf data</p>
    </div>
  )
}

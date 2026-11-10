'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface MessageTypeSelectorProps {
  messageTypes: string[];
  selectedType: string | null;
  onTypeSelected: (type: string) => void;
}

export function MessageTypeSelector({
  messageTypes,
  selectedType,
  onTypeSelected,
}: MessageTypeSelectorProps) {
  if (messageTypes.length === 0) {
    return null;
  }

  return (
    <div className='space-y-1.5'>
      <div className='flex items-center justify-between'>
        <Label className='text-xs font-semibold uppercase tracking-wider text-slate-300'>
          Message Type
        </Label>
        <span className='font-mono text-[11px] text-slate-400'>
          {messageTypes.length} available
        </span>
      </div>
      <Select value={selectedType || ''} onValueChange={onTypeSelected}>
        <SelectTrigger className='h-9 border-slate-700/80 bg-[#0D111A] font-mono text-xs text-slate-200 focus:border-sky-500/70'>
          <SelectValue placeholder='Select a message type' />
        </SelectTrigger>
        <SelectContent className='border-slate-800 bg-[#111621]'>
          {messageTypes.map((type) => (
            <SelectItem
              key={type}
              value={type}
              className='font-mono text-xs text-slate-200 focus:bg-slate-800'
            >
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

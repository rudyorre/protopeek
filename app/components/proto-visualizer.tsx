'use client';

import { cn } from '@/lib/utils';
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Search,
  ChevronsUpDown,
} from 'lucide-react';
import { useState } from 'react';
import { DecodedField } from '../utils/protobuf-decoder';

interface ProtoVisualizerProps {
  data: string;
  messageTypeName?: string | null;
  highlightedRange?: [number, number] | null;
  onHoverRange?: (range: [number, number] | null) => void;
}

export function ProtoVisualizer({
  data,
  messageTypeName,
  highlightedRange,
  onHoverRange,
}: ProtoVisualizerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandGeneration, setExpandGeneration] = useState<{
    expanded: boolean;
    version: number;
  }>({ expanded: true, version: 0 });

  let root: DecodedField | null = null;
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      root = {
        type: 'message',
        message: messageTypeName || 'Message',
        value: parsed,
      };
    } else if (
      parsed &&
      parsed.type === 'message' &&
      Array.isArray(parsed.value)
    ) {
      root = parsed;
    } else {
      root = { type: 'message', value: [] };
    }
  } catch {
    root = { type: 'message', value: [] };
  }

  if (!root) return null;

  const messageName = root?.message || messageTypeName || 'Message';
  const topFields = Array.isArray(root.value)
    ? (root.value as DecodedField[])
    : [];

  return (
    <div className='rounded-lg border border-slate-800/90 bg-[#0D111A] p-4'>
      <div className='mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3'>
        <div className='flex items-center gap-2.5'>
          <div className='font-mono text-base font-semibold text-slate-100'>
            {messageName}
          </div>
          <span className='rounded-full border border-slate-700/70 bg-slate-800/70 px-2 py-0.5 font-mono text-[11px] text-slate-400'>
            {topFields.length} field{topFields.length === 1 ? '' : 's'}
          </span>
        </div>

        {topFields.length > 0 && (
          <div className='flex items-center gap-2'>
            <div className='relative'>
              <Search className='pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500' />
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Filter fields or values...'
                aria-label='Filter fields or values'
                className='h-7 w-44 rounded-md border border-slate-800 bg-slate-900/90 pl-8 pr-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:border-sky-500/60 focus:outline-none sm:w-52'
              />
            </div>
            <button
              type='button'
              onClick={() =>
                setExpandGeneration((prev) => ({
                  expanded: !prev.expanded,
                  version: prev.version + 1,
                }))
              }
              className='inline-flex h-7 items-center gap-1 rounded-md border border-slate-800 bg-slate-900/90 px-2 text-xs text-slate-300 transition-colors hover:border-slate-700 hover:text-white'
              title='Expand or collapse all nested nodes'
            >
              <ChevronsUpDown className='h-3.5 w-3.5 text-slate-400' />
              <span className='hidden sm:inline'>
                {expandGeneration.expanded ? 'Collapse' : 'Expand'}
              </span>
            </button>
          </div>
        )}
      </div>

      <ProtoValue
        data={root}
        searchQuery={searchQuery.trim().toLowerCase()}
        expandSignal={expandGeneration}
        highlightedRange={highlightedRange}
        onHoverRange={onHoverRange}
      />
    </div>
  );
}

function matchesSearch(field: DecodedField, query: string): boolean {
  if (!query) return true;
  if (field.fieldName?.toLowerCase().includes(query)) return true;
  if (field.message?.toLowerCase().includes(query)) return true;
  if (field.fieldNumber !== undefined && String(field.fieldNumber) === query)
    return true;
  if (field.type.toLowerCase().includes(query)) return true;
  if (Array.isArray(field.value)) {
    return field.value.some((child: any) =>
      typeof child === 'object' && child !== null
        ? matchesSearch(child, query)
        : String(child).toLowerCase().includes(query)
    );
  }
  if (String(field.value).toLowerCase().includes(query)) return true;
  if (field.interpretations) {
    return Object.values(field.interpretations).some((v) =>
      v.toLowerCase().includes(query)
    );
  }
  return false;
}

const ProtoValue = ({
  data,
  level = 0,
  fieldName = '',
  searchQuery = '',
  expandSignal,
  highlightedRange,
  onHoverRange,
}: {
  data: DecodedField;
  level?: number;
  fieldName?: string;
  searchQuery?: string;
  expandSignal?: { expanded: boolean; version: number };
  highlightedRange?: [number, number] | null;
  onHoverRange?: (range: [number, number] | null) => void;
}) => {
  const [localExpanded, setLocalExpanded] = useState(true);
  const [lastSignalVersion, setLastSignalVersion] = useState(0);
  const [copied, setCopied] = useState(false);

  if (expandSignal && expandSignal.version !== lastSignalVersion) {
    setLastSignalVersion(expandSignal.version);
    setLocalExpanded(expandSignal.expanded);
  }

  const isExpanded = searchQuery ? true : localExpanded;

  if (!data) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  // Handle repeated fields (arrays of messages or scalars)
  if (data.type.startsWith('repeated_')) {
    const label = data.fieldName || fieldName || 'repeated';
    return (
      <div className={cn('pl-2', level > 0 ? 'mt-1.5' : '')}>
        <div
          className='inline-flex cursor-pointer items-center gap-1.5 rounded px-1.5 py-0.5 transition-colors hover:bg-slate-800/60'
          onClick={() => setLocalExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronDown className='h-3.5 w-3.5 text-slate-400' />
          ) : (
            <ChevronRight className='h-3.5 w-3.5 text-slate-400' />
          )}
          <span className='font-mono text-xs font-medium text-slate-200'>
            {label}
          </span>
          <span className='rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[11px] text-slate-400'>
            {Array.isArray(data.value) ? `${data.value.length} items` : 'array'}
          </span>
          <span className='font-mono text-[11px] text-slate-500'>
            ({data.type})
          </span>
        </div>
        {isExpanded && Array.isArray(data.value) && (
          <div className='ml-2 mt-1 border-l border-slate-800 pl-3.5'>
            {data.value.map((item: any, index: number) => (
              <div key={index} className='mt-1.5'>
                <div className='flex items-start gap-2'>
                  <span className='mt-0.5 font-mono text-xs font-medium text-slate-500'>
                    [{index}]
                  </span>
                  {typeof item === 'object' && item !== null ? (
                    <ProtoValue
                      data={item}
                      level={level + 1}
                      searchQuery={searchQuery}
                      expandSignal={expandSignal}
                      highlightedRange={highlightedRange}
                      onHoverRange={onHoverRange}
                    />
                  ) : (
                    <span className='font-mono text-xs text-sky-400'>
                      {JSON.stringify(item)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Message (object with fields)
  if (data.type === 'message' && Array.isArray(data.value)) {
    const fields = (data.value as DecodedField[]).filter((f) =>
      matchesSearch(f, searchQuery)
    );
    const displayHeader =
      data.fieldName ||
      (data.message && data.message !== String(data.fieldNumber)
        ? data.message
        : fieldName && fieldName !== String(data.fieldNumber)
          ? fieldName
          : 'Message');

    return (
      <div className={cn('pl-0', level > 0 ? 'mt-0.5' : '')}>
        {level > 0 && (
          <div
            className='inline-flex cursor-pointer items-center gap-1.5 rounded px-1.5 py-0.5 transition-colors hover:bg-slate-800/60'
            onClick={() => setLocalExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className='h-3.5 w-3.5 text-slate-400' />
            ) : (
              <ChevronRight className='h-3.5 w-3.5 text-slate-400' />
            )}
            <span className='font-mono text-xs font-semibold text-slate-200'>
              {displayHeader}
            </span>
            <span className='rounded bg-slate-800/80 px-1.5 py-0.5 font-mono text-[10px] text-slate-400'>
              {fields.length} {fields.length === 1 ? 'field' : 'fields'}
            </span>
            {data.byteRange && (
              <span className='font-mono text-[10px] text-slate-500'>
                bytes {data.byteRange[0]}–{data.byteRange[1]}
              </span>
            )}
          </div>
        )}
        {isExpanded && (
          <div
            className={cn(
              'border-l border-slate-800 pl-3.5',
              level === 0 ? 'mt-1 space-y-1' : 'ml-2 mt-1 space-y-1'
            )}
          >
            {fields.length === 0 && searchQuery ? (
              <div className='py-3 text-xs text-slate-500'>
                No fields match &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              Array.isArray(fields) &&
              fields.every(
                (f) => typeof f === 'object' && f !== null && 'type' in f
              ) &&
              fields.map((field: DecodedField, idx: number) => {
                const isHighlighted =
                  highlightedRange &&
                  field.byteRange &&
                  field.byteRange[0] === highlightedRange[0] &&
                  field.byteRange[1] === highlightedRange[1];

                const hasSchemaName =
                  field.fieldName &&
                  field.fieldName !== String(field.fieldNumber);

                return (
                  <div
                    key={idx}
                    onMouseEnter={() =>
                      field.byteRange && onHoverRange?.(field.byteRange)
                    }
                    onMouseLeave={() => onHoverRange?.(null)}
                    className={cn(
                      'group rounded-md px-2 py-1 transition-colors',
                      isHighlighted
                        ? 'bg-sky-500/15 ring-1 ring-sky-500/40'
                        : 'hover:bg-slate-900/80'
                    )}
                  >
                    <div className='flex flex-wrap items-start gap-2'>
                      {field.fieldNumber !== undefined && (
                        <span className='mt-0.5 font-mono text-xs font-semibold text-slate-400'>
                          {field.fieldNumber}:
                        </span>
                      )}
                      {hasSchemaName && !isMessageOrRepeated(field) && (
                        <span className='py-0.2 mt-0.5 rounded bg-slate-800/90 px-1.5 font-mono text-xs font-medium text-slate-200'>
                          {field.fieldName}
                        </span>
                      )}
                      <ProtoValue
                        data={field}
                        level={level + 1}
                        fieldName={
                          field.fieldName ||
                          field.message ||
                          String(field.fieldNumber) ||
                          'field'
                        }
                        searchQuery={searchQuery}
                        expandSignal={expandSignal}
                        highlightedRange={highlightedRange}
                        onHoverRange={onHoverRange}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  }

  // Primitive value
  const formattedVal =
    data.type === 'string'
      ? `"${data.value}"`
      : data.type === 'bool'
        ? data.value
          ? 'true'
          : 'false'
        : (data.value?.toString?.() ?? String(data.value));

  // Secondary interpretations worth showing inline
  const extraInterpretations: Array<{ label: string; val: string }> = [];
  if (data.interpretations) {
    if (
      data.type === 'varint' &&
      data.interpretations.sint64 &&
      data.interpretations.sint64 !== String(data.value)
    ) {
      extraInterpretations.push({
        label: 'sint',
        val: data.interpretations.sint64,
      });
    }
    if (
      data.type === 'varint' &&
      data.interpretations.timestamp &&
      !extraInterpretations.some((e) => e.label === 'time')
    ) {
      extraInterpretations.push({
        label: 'time',
        val: data.interpretations.timestamp,
      });
    }
    if (data.type === 'fixed32' && data.interpretations.float) {
      extraInterpretations.push({
        label: 'float',
        val: data.interpretations.float,
      });
      if (
        data.interpretations.sfixed32 &&
        data.interpretations.sfixed32 !== String(data.value)
      ) {
        extraInterpretations.push({
          label: 'sfixed32',
          val: data.interpretations.sfixed32,
        });
      }
    }
    if (data.type === 'fixed64' && data.interpretations.double) {
      extraInterpretations.push({
        label: 'double',
        val: data.interpretations.double,
      });
    }
    if (data.interpretations.packed_varint) {
      extraInterpretations.push({
        label: 'packed',
        val: data.interpretations.packed_varint,
      });
    }
  }

  return (
    <div className='flex flex-wrap items-center gap-2 font-mono text-xs'>
      <span
        className={cn('break-all font-medium', {
          'text-sky-400': data.type === 'string',
          'text-emerald-400': data.type === 'bool',
          'text-amber-400':
            data.type === 'int32' ||
            data.type === 'int64' ||
            data.type === 'uint32' ||
            data.type === 'uint64' ||
            data.type === 'sint32' ||
            data.type === 'sint64' ||
            data.type === 'varint',
          'text-cyan-300': data.type === 'timestamp',
          'text-rose-400': data.type === 'bytes',
          'text-teal-400':
            data.type === 'float' ||
            data.type === 'double' ||
            data.type === 'fixed32' ||
            data.type === 'fixed64',
          'text-orange-400': data.type === 'enum',
        })}
      >
        {formattedVal}
      </span>

      <span className='rounded border border-slate-800 bg-slate-900 px-1.5 py-0.5 text-[10px] text-slate-400'>
        ({data.type})
      </span>

      {extraInterpretations.map((interp) => (
        <span
          key={interp.label}
          className='rounded border border-slate-800/80 bg-slate-900/60 px-1.5 py-0.5 text-[10px] text-slate-400'
          title={`Alternative wire interpretation as ${interp.label}`}
        >
          <span className='text-slate-500'>{interp.label}:</span>{' '}
          <span className='text-slate-300'>{interp.val}</span>
        </span>
      ))}

      {data.byteRange && (
        <span className='text-[10px] text-slate-500'>
          [{data.byteRange[0]}–{data.byteRange[1]}]
        </span>
      )}

      <button
        type='button'
        onClick={(e) => {
          e.stopPropagation();
          handleCopy(String(data.value));
        }}
        className='opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100'
        title='Copy value'
        aria-label='Copy field value'
      >
        {copied ? (
          <Check className='h-3 w-3 text-emerald-400' />
        ) : (
          <Copy className='h-3 w-3 text-slate-500 hover:text-slate-300' />
        )}
      </button>
    </div>
  );
};

// Helper function to check if a field is a message or repeated type
function isMessageOrRepeated(field: DecodedField): boolean {
  return field.type === 'message' || field.type.startsWith('repeated_');
}

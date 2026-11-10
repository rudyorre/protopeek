'use client';

import { cn } from '@/lib/utils';
import {
  ChevronDown,
  ChevronRight,
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
    <div
      className='rounded-lg border border-slate-800/90 bg-[#0D111A] p-3 text-xs'
      onMouseLeave={() => onHoverRange?.(null)}
    >
      <div className='mb-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2'>
        <div className='flex items-center gap-2'>
          <span className='font-mono text-xs font-semibold text-slate-200'>
            {messageName}
          </span>
          <span className='rounded bg-slate-800/80 px-1.5 py-0.5 font-mono text-[11px] text-slate-400'>
            {topFields.length} field{topFields.length === 1 ? '' : 's'}
          </span>
        </div>

        {topFields.length > 0 && (
          <div className='flex items-center gap-1.5'>
            <div className='relative'>
              <Search className='pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-500' />
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Filter...'
                aria-label='Filter fields or values'
                className='h-6 w-36 rounded border border-slate-800 bg-[#090C12] pl-6 pr-2 text-xs text-slate-200 placeholder:text-slate-500 focus:border-sky-500/60 focus:outline-none sm:w-44'
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
              className='inline-flex h-6 items-center gap-1 rounded border border-slate-800 bg-[#090C12] px-2 text-[11px] text-slate-400 hover:text-slate-200'
              title='Expand or collapse all nested nodes'
            >
              <ChevronsUpDown className='h-3 w-3' />
              <span className='hidden sm:inline'>
                {expandGeneration.expanded ? 'Collapse' : 'Expand'}
              </span>
            </button>
          </div>
        )}
      </div>

      <div className='max-h-[340px] overflow-y-auto font-mono'>
        <ProtoValue
          data={root}
          searchQuery={searchQuery.trim().toLowerCase()}
          expandSignal={expandGeneration}
          highlightedRange={highlightedRange}
          onHoverRange={onHoverRange}
        />
      </div>
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

  if (expandSignal && expandSignal.version !== lastSignalVersion) {
    setLastSignalVersion(expandSignal.version);
    setLocalExpanded(expandSignal.expanded);
  }

  const isExpanded = searchQuery ? true : localExpanded;

  if (!data) return null;

  // Handle repeated fields (arrays of messages or scalars)
  if (data.type.startsWith('repeated_')) {
    const label = data.fieldName || fieldName || 'repeated';
    return (
      <div className={cn('pl-1', level > 0 ? 'mt-1' : '')}>
        <div
          className='inline-flex cursor-pointer items-center gap-1.5 rounded px-1 py-0.5 text-slate-300 hover:bg-slate-800/50'
          onClick={() => setLocalExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronDown className='h-3 w-3 text-slate-500' />
          ) : (
            <ChevronRight className='h-3 w-3 text-slate-500' />
          )}
          <span className='font-semibold text-slate-200'>{label}</span>
          <span className='text-slate-500'>
            ({Array.isArray(data.value) ? `${data.value.length}` : '0'})
          </span>
        </div>
        {isExpanded && Array.isArray(data.value) && (
          <div className='ml-2 mt-0.5 space-y-1 border-l border-slate-800/80 pl-2.5'>
            {data.value.map((item: any, index: number) => (
              <div key={index}>
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
                  <div className='flex items-center gap-1.5 px-1.5 py-0.5'>
                    <span className='text-slate-500'>[{index}]</span>
                    <span className='text-sky-400'>{JSON.stringify(item)}</span>
                  </div>
                )}
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
      data.message && data.message !== String(data.fieldNumber)
        ? data.message
        : 'Message';

    return (
      <div className={cn(level > 0 ? 'w-full' : '')}>
        {level > 0 && (
          <div
            className='inline-flex cursor-pointer items-center gap-1.5 rounded px-1 py-0.5 hover:bg-slate-800/50'
            onClick={() => setLocalExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className='h-3 w-3 text-slate-500' />
            ) : (
              <ChevronRight className='h-3 w-3 text-slate-500' />
            )}
            {data.fieldName && data.fieldName !== String(data.fieldNumber) && (
              <span className='rounded bg-slate-800 px-1.5 py-0.5 font-semibold text-slate-200'>
                {data.fieldName}
              </span>
            )}
            <span className='font-semibold text-sky-400'>{displayHeader}</span>
          </div>
        )}
        {isExpanded && (
          <div
            className={cn(
              'space-y-1',
              level === 0 ? '' : 'ml-2 mt-1 border-l border-slate-800/80 pl-2.5'
            )}
          >
            {fields.length === 0 && searchQuery ? (
              <div className='py-2 text-xs text-slate-500'>
                No fields match &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              Array.isArray(fields) &&
              fields.every(
                (f) => typeof f === 'object' && f !== null && 'type' in f
              ) &&
              fields.map((field: DecodedField, idx: number) => {
                const isLeaf = !isMessageOrRepeated(field);
                const isHighlighted =
                  isLeaf &&
                  highlightedRange &&
                  field.byteRange &&
                  field.byteRange[0] === highlightedRange[0] &&
                  field.byteRange[1] === highlightedRange[1];

                const hasSchemaName =
                  field.fieldName &&
                  field.fieldName !== String(field.fieldNumber);

                if (!isLeaf) {
                  return (
                    <div key={idx} className='flex items-start gap-1.5 py-0.5'>
                      {field.fieldNumber !== undefined && (
                        <span className='mt-0.5 font-semibold text-slate-400'>
                          {field.fieldNumber}:
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
                  );
                }

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => onHoverRange?.(field.byteRange ?? null)}
                    className={cn(
                      'flex cursor-pointer flex-wrap items-center gap-1.5 rounded px-1.5 py-0.5',
                      isHighlighted
                        ? 'bg-slate-800 ring-1 ring-sky-400/70'
                        : 'hover:bg-slate-800/50'
                    )}
                  >
                    {field.fieldNumber !== undefined && (
                      <span className='text-slate-400'>
                        {field.fieldNumber}:
                      </span>
                    )}
                    {hasSchemaName && (
                      <span className='rounded bg-slate-800 px-1 font-semibold text-slate-100'>
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

  // Primary alternative wire interpretation (keep at most 1 concise badge so rows stay clean)
  let altInterp = '';
  if (data.interpretations) {
    if (
      data.type === 'varint' &&
      data.interpretations.sint64 &&
      data.interpretations.sint64 !== String(data.value)
    ) {
      altInterp = `sint: ${data.interpretations.sint64}`;
    } else if (data.type === 'fixed32' && data.interpretations.float) {
      altInterp = `float: ${data.interpretations.float}`;
    } else if (data.type === 'fixed64' && data.interpretations.double) {
      altInterp = `double: ${data.interpretations.double}`;
    }
  }

  return (
    <>
      <span className='break-all text-sky-400'>{formattedVal}</span>
      <span className='text-slate-500'>({data.type})</span>
      {altInterp && (
        <span className='rounded bg-slate-800/80 px-1 text-slate-400'>
          {altInterp}
        </span>
      )}
      {data.byteRange && (
        <span className='ml-auto text-slate-500'>
          [{data.byteRange[0]}–{data.byteRange[1]}]
        </span>
      )}
    </>
  );
};

function isMessageOrRepeated(field: DecodedField): boolean {
  return field.type === 'message' || field.type.startsWith('repeated_');
}

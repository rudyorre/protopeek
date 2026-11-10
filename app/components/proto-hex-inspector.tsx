'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { DecodedField, WireType } from '../utils/protobuf-decoder';
import { Binary } from 'lucide-react';

interface ByteSpanInfo {
  fieldNumber?: number;
  fieldName?: string;
  type: string;
  wireType?: WireType;
  byteRange: [number, number];
  payloadByteRange?: [number, number];
  valuePreview: string;
  colorIndex: number;
}

interface ProtoHexInspectorProps {
  bytes: Uint8Array | null;
  decodedData: string | null;
  highlightedRange?: [number, number] | null;
  onSelectRange?: (range: [number, number] | null) => void;
}

const SPAN_COLORS = [
  {
    bg: 'bg-sky-500/15',
    activeBg: 'bg-sky-500/35 ring-1 ring-sky-400/70',
    text: 'text-sky-300',
    tagText: 'text-sky-200 font-semibold underline decoration-sky-400/60',
  },
  {
    bg: 'bg-amber-500/15',
    activeBg: 'bg-amber-500/35 ring-1 ring-amber-400/70',
    text: 'text-amber-300',
    tagText: 'text-amber-200 font-semibold underline decoration-amber-400/60',
  },
  {
    bg: 'bg-emerald-500/15',
    activeBg: 'bg-emerald-500/35 ring-1 ring-emerald-400/70',
    text: 'text-emerald-300',
    tagText:
      'text-emerald-200 font-semibold underline decoration-emerald-400/60',
  },
  {
    bg: 'bg-teal-500/15',
    activeBg: 'bg-teal-500/35 ring-1 ring-teal-400/70',
    text: 'text-teal-300',
    tagText: 'text-teal-200 font-semibold underline decoration-teal-400/60',
  },
  {
    bg: 'bg-rose-500/15',
    activeBg: 'bg-rose-500/35 ring-1 ring-rose-400/70',
    text: 'text-rose-300',
    tagText: 'text-rose-200 font-semibold underline decoration-rose-400/60',
  },
  {
    bg: 'bg-orange-500/15',
    activeBg: 'bg-orange-500/35 ring-1 ring-orange-400/70',
    text: 'text-orange-300',
    tagText: 'text-orange-200 font-semibold underline decoration-orange-400/60',
  },
];

const WIRE_TYPE_NAMES: Record<number, string> = {
  [WireType.VARINT]: 'Varint (0)',
  [WireType.FIXED64]: '64-bit Fixed (1)',
  [WireType.LENGTH_DELIMITED]: 'Length-Delimited (2)',
  [WireType.START_GROUP]: 'Start Group (3)',
  [WireType.END_GROUP]: 'End Group (4)',
  [WireType.FIXED32]: '32-bit Fixed (5)',
};

export function ProtoHexInspector({
  bytes,
  decodedData,
  highlightedRange,
  onSelectRange,
}: ProtoHexInspectorProps) {
  const spans = useMemo(() => {
    if (!decodedData) return [];
    let fields: DecodedField[] = [];
    try {
      const parsed = JSON.parse(decodedData);
      if (Array.isArray(parsed)) {
        fields = parsed;
      } else if (parsed && Array.isArray(parsed.value)) {
        fields = parsed.value;
      }
    } catch {
      return [];
    }

    const result: ByteSpanInfo[] = [];
    let counter = 0;

    function collectLeafSpans(list: DecodedField[]) {
      for (const f of list) {
        if (
          (f.type === 'message' || f.type === 'repeated_message') &&
          Array.isArray(f.value)
        ) {
          const childrenWithRanges = (f.value as DecodedField[]).filter(
            (c) =>
              c.byteRange ||
              (Array.isArray(c.value) &&
                (c.value as DecodedField[]).some((gc) => gc.byteRange))
          );
          if (childrenWithRanges.length > 0) {
            collectLeafSpans(f.value as DecodedField[]);
            continue;
          }
        }
        if (f.byteRange && f.byteRange.length === 2) {
          result.push({
            fieldNumber: f.fieldNumber,
            fieldName: f.fieldName || f.message,
            type: f.type,
            wireType: f.wireType,
            byteRange: f.byteRange,
            payloadByteRange: f.payloadByteRange,
            valuePreview: Array.isArray(f.value)
              ? `${f.value.length} items`
              : String(f.value),
            colorIndex: counter++ % SPAN_COLORS.length,
          });
        }
      }
    }

    collectLeafSpans(fields);
    return result;
  }, [decodedData]);

  // Map each byte offset to its span info
  const byteToSpan = useMemo(() => {
    const map = new Map<number, ByteSpanInfo>();
    for (const span of spans) {
      for (let i = span.byteRange[0]; i < span.byteRange[1]; i++) {
        map.set(i, span);
      }
    }
    return map;
  }, [spans]);

  const activeSpan = useMemo(() => {
    if (!highlightedRange) return null;
    return (
      spans.find(
        (s) =>
          s.byteRange[0] >= highlightedRange[0] &&
          s.byteRange[1] <= highlightedRange[1]
      ) ||
      spans.find(
        (s) =>
          highlightedRange[0] >= s.byteRange[0] &&
          highlightedRange[1] <= s.byteRange[1]
      ) ||
      null
    );
  }, [spans, highlightedRange]);

  if (!bytes || bytes.length === 0) return null;

  const rows: number[][] = [];
  for (let i = 0; i < bytes.length; i += 16) {
    const row: number[] = [];
    for (let j = i; j < Math.min(i + 16, bytes.length); j++) {
      row.push(j);
    }
    rows.push(row);
  }

  return (
    <div className='rounded-lg border border-slate-800/90 bg-[#0D111A] p-3.5'>
      <div className='mb-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2'>
        <div className='flex items-center gap-2'>
          <Binary className='h-4 w-4 text-sky-400' />
          <span className='text-xs font-semibold uppercase tracking-wider text-slate-300'>
            Interactive Wire Hex Map
          </span>
          <span className='rounded bg-slate-800/80 px-1.5 py-0.5 font-mono text-[11px] text-slate-400'>
            {bytes.length} byte{bytes.length === 1 ? '' : 's'}
          </span>
        </div>
        <div className='flex items-center gap-3 text-[11px] text-slate-400'>
          <span className='flex items-center gap-1'>
            <span className='inline-block h-2 w-2 rounded-sm bg-sky-400/70 underline' />
            <span className='underline decoration-sky-400/60'>Underlined</span>{' '}
            = Tag/Length Header
          </span>
          <span>Hover any byte or field to inspect</span>
        </div>
      </div>

      <div className='max-h-[220px] overflow-x-auto overflow-y-auto font-mono text-xs'>
        <div className='min-w-[540px] space-y-1'>
          {rows.map((rowIndices, rowIdx) => {
            const rowOffset = (rowIdx * 16)
              .toString(16)
              .padStart(4, '0')
              .toUpperCase();
            return (
              <div
                key={rowIdx}
                className='grid grid-cols-[52px_1fr_148px] items-center gap-3 rounded px-1.5 py-0.5 hover:bg-slate-900/50'
              >
                {/* Offset */}
                <span className='select-none text-[11px] text-slate-500'>
                  0x{rowOffset}
                </span>

                {/* 16 Hex Bytes */}
                <div className='grid-cols-16 grid gap-1'>
                  {Array.from({ length: 16 }).map((_, colIdx) => {
                    const byteIdx = rowIndices[colIdx];
                    if (byteIdx === undefined) {
                      return <span key={colIdx} className='px-1 py-0.5' />;
                    }
                    const byteVal = bytes[byteIdx];
                    const span = byteToSpan.get(byteIdx);
                    const isHighlighted =
                      highlightedRange &&
                      byteIdx >= highlightedRange[0] &&
                      byteIdx < highlightedRange[1];
                    const isHeaderByte =
                      span &&
                      span.payloadByteRange &&
                      byteIdx < span.payloadByteRange[0];
                    const palette = span
                      ? SPAN_COLORS[span.colorIndex]
                      : undefined;

                    return (
                      <button
                        key={colIdx}
                        type='button'
                        onMouseEnter={() =>
                          span && onSelectRange?.(span.byteRange)
                        }
                        onMouseLeave={() => onSelectRange?.(null)}
                        onClick={() =>
                          span &&
                          onSelectRange?.(isHighlighted ? null : span.byteRange)
                        }
                        className={cn(
                          'rounded px-1 py-0.5 text-center transition-all focus:outline-none',
                          palette
                            ? isHighlighted
                              ? palette.activeBg
                              : palette.bg
                            : 'bg-slate-800/40 text-slate-400',
                          palette
                            ? isHeaderByte
                              ? palette.tagText
                              : palette.text
                            : 'text-slate-400'
                        )}
                        title={
                          span
                            ? `Byte ${byteIdx} (0x${byteIdx.toString(16).toUpperCase()}) • Field #${span.fieldNumber ?? '?'}${span.fieldName ? ` (${span.fieldName})` : ''} • ${isHeaderByte ? 'Tag / Length Header' : 'Value Payload'}`
                            : `Byte ${byteIdx}`
                        }
                      >
                        {byteVal.toString(16).padStart(2, '0').toUpperCase()}
                      </button>
                    );
                  })}
                </div>

                {/* ASCII Column */}
                <div className='flex items-center border-l border-slate-800/80 pl-2.5 tracking-widest'>
                  {rowIndices.map((byteIdx) => {
                    const byteVal = bytes[byteIdx];
                    const char =
                      byteVal >= 32 && byteVal <= 126
                        ? String.fromCharCode(byteVal)
                        : '·';
                    const isHighlighted =
                      highlightedRange &&
                      byteIdx >= highlightedRange[0] &&
                      byteIdx < highlightedRange[1];
                    const span = byteToSpan.get(byteIdx);
                    const palette = span
                      ? SPAN_COLORS[span.colorIndex]
                      : undefined;

                    return (
                      <span
                        key={byteIdx}
                        onMouseEnter={() =>
                          span && onSelectRange?.(span.byteRange)
                        }
                        onMouseLeave={() => onSelectRange?.(null)}
                        className={cn(
                          'inline-block w-[8px] cursor-pointer text-center text-[11px]',
                          isHighlighted
                            ? 'bg-sky-500/30 font-bold text-white'
                            : palette
                              ? palette.text
                              : 'text-slate-500'
                        )}
                      >
                        {char}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Span Status Bar */}
      <div className='mt-2.5 flex min-h-[28px] flex-wrap items-center justify-between gap-2 rounded bg-slate-900/90 px-3 py-1.5 text-xs'>
        {activeSpan ? (
          <>
            <div className='flex flex-wrap items-center gap-2'>
              <span className='font-mono font-semibold text-sky-400'>
                Bytes {activeSpan.byteRange[0]}–{activeSpan.byteRange[1]}
              </span>
              <span className='text-slate-600'>•</span>
              <span className='font-medium text-slate-200'>
                Field #{activeSpan.fieldNumber ?? '?'}
                {activeSpan.fieldName &&
                activeSpan.fieldName !== String(activeSpan.fieldNumber)
                  ? ` (${activeSpan.fieldName})`
                  : ''}
              </span>
              <span className='text-slate-600'>•</span>
              <span className='rounded border border-slate-700/80 bg-slate-800/80 px-1.5 py-0.5 font-mono text-[11px] text-slate-300'>
                {activeSpan.wireType !== undefined
                  ? WIRE_TYPE_NAMES[activeSpan.wireType] ||
                    `Wire ${activeSpan.wireType}`
                  : activeSpan.type}
              </span>
              {activeSpan.payloadByteRange && (
                <span className='font-mono text-[11px] text-slate-400'>
                  Header:{' '}
                  {activeSpan.payloadByteRange[0] - activeSpan.byteRange[0]}B |
                  Payload:{' '}
                  {activeSpan.byteRange[1] - activeSpan.payloadByteRange[0]}B
                </span>
              )}
            </div>
            <div className='max-w-xs truncate font-mono text-xs text-emerald-400'>
              {activeSpan.valuePreview}
            </div>
          </>
        ) : (
          <span className='text-slate-500'>
            Hover over any byte above or any field row below to inspect its tag,
            wire type, and payload boundaries.
          </span>
        )}
      </div>
    </div>
  );
}

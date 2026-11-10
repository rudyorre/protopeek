'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { DecodedField, WireType } from '../utils/protobuf-decoder';

interface ByteSpanInfo {
  fieldNumber?: number;
  fieldName?: string;
  type: string;
  wireType?: WireType;
  byteRange: [number, number];
  payloadByteRange?: [number, number];
}

interface ProtoHexInspectorProps {
  bytes: Uint8Array | null;
  decodedData: string | null;
  highlightedRange?: [number, number] | null;
  onSelectRange?: (range: [number, number] | null) => void;
}

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
          });
        }
      }
    }

    collectLeafSpans(fields);
    return result;
  }, [decodedData]);

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
          s.byteRange[0] === highlightedRange[0] &&
          s.byteRange[1] === highlightedRange[1]
      ) || null
    );
  }, [spans, highlightedRange]);

  if (!bytes || bytes.length === 0) return null;

  const colsPerRow = 12;
  const rows: number[][] = [];
  for (let i = 0; i < bytes.length; i += colsPerRow) {
    const row: number[] = [];
    for (let j = i; j < Math.min(i + colsPerRow, bytes.length); j++) {
      row.push(j);
    }
    rows.push(row);
  }

  return (
    <div className='flex flex-col justify-between rounded-lg border border-slate-800/90 bg-[#0D111A] p-3 text-xs'>
      <div>
        <div className='mb-2 flex items-center justify-between border-b border-slate-800/80 pb-2'>
          <span className='font-semibold uppercase tracking-wider text-slate-400'>
            Wire Hex Map
          </span>
          <span className='font-mono text-sky-400'>{bytes.length} B</span>
        </div>

        <div
          className='max-h-[320px] space-y-1 overflow-x-auto overflow-y-auto font-mono'
          onMouseLeave={() => onSelectRange?.(null)}
        >
          {rows.map((rowIndices, rowIdx) => {
            const rowOffset = (rowIdx * colsPerRow)
              .toString(16)
              .padStart(2, '0')
              .toUpperCase();
            return (
              <div key={rowIdx} className='flex items-center gap-2'>
                <span className='w-10 shrink-0 select-none text-slate-500'>
                  0x{rowOffset}
                </span>
                <div className='flex gap-0.5'>
                  {rowIndices.map((byteIdx) => {
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

                    return (
                      <span
                        key={byteIdx}
                        onMouseEnter={() =>
                          onSelectRange?.(span ? span.byteRange : null)
                        }
                        className={cn(
                          'inline-block w-6 cursor-pointer select-none rounded py-0.5 text-center',
                          isHighlighted
                            ? 'bg-sky-400 font-bold text-slate-950'
                            : isHeaderByte
                              ? 'font-semibold text-sky-400 underline decoration-sky-500/60 underline-offset-2'
                              : 'text-slate-200 hover:bg-slate-800/70'
                        )}
                      >
                        {byteVal.toString(16).padStart(2, '0').toUpperCase()}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className='mt-2.5 truncate rounded bg-[#090C12] px-2.5 py-1.5 font-mono text-xs text-slate-400'>
        {activeSpan ? (
          <span>
            Bytes {activeSpan.byteRange[0]}–{activeSpan.byteRange[1]} • Field #
            {activeSpan.fieldNumber ?? '?'}
            {activeSpan.fieldName &&
            activeSpan.fieldName !== String(activeSpan.fieldNumber)
              ? ` (${activeSpan.fieldName})`
              : ''}{' '}
            • {activeSpan.type}
          </span>
        ) : (
          <span>Hover a byte or field to inspect wire tag</span>
        )}
      </div>
    </div>
  );
}

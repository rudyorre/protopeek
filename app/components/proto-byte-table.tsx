'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { DecodedField, WireType } from '../utils/protobuf-decoder';

interface ProtoByteTableProps {
  data: string;
  highlightedRange?: [number, number] | null;
  onHoverRange?: (range: [number, number] | null) => void;
}

const WIRE_LABELS: Record<number, string> = {
  [WireType.VARINT]: 'VARINT (0)',
  [WireType.FIXED64]: 'I64 (1)',
  [WireType.LENGTH_DELIMITED]: 'LEN (2)',
  [WireType.START_GROUP]: 'SGROUP (3)',
  [WireType.END_GROUP]: 'EGROUP (4)',
  [WireType.FIXED32]: 'I32 (5)',
};

export function ProtoByteTable({
  data,
  highlightedRange,
  onHoverRange,
}: ProtoByteTableProps) {
  let root: DecodedField | null = null;
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      root = { type: 'message', value: parsed };
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

  if (!root || !Array.isArray(root.value)) return null;

  return (
    <div className='overflow-hidden rounded-lg border border-slate-800/90 bg-[#0D111A]'>
      <div className='overflow-x-auto'>
        <table className='w-full border-collapse text-left text-xs'>
          <thead>
            <tr className='border-b border-slate-800 bg-slate-900/90 text-[11px] uppercase tracking-wider text-slate-400'>
              <th className='px-4 py-2.5 font-semibold'>Byte Range</th>
              <th className='px-4 py-2.5 font-semibold'>Field Number</th>
              <th className='px-4 py-2.5 font-semibold'>Type</th>
              <th className='px-4 py-2.5 font-semibold'>Content</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-800/60 font-mono'>
            {root.value.map((field, index) => (
              <ProtoByteTableRow
                key={index}
                field={field}
                depth={0}
                highlightedRange={highlightedRange}
                onHoverRange={onHoverRange}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProtoByteTableRow({
  field,
  depth = 0,
  highlightedRange,
  onHoverRange,
}: {
  field: DecodedField;
  depth?: number;
  highlightedRange?: [number, number] | null;
  onHoverRange?: (range: [number, number] | null) => void;
}) {
  const isHighlighted =
    highlightedRange &&
    field.byteRange &&
    field.byteRange[0] === highlightedRange[0] &&
    field.byteRange[1] === highlightedRange[1];

  // Handle repeated fields
  if (field.type.startsWith('repeated_') && Array.isArray(field.value)) {
    const isScalarArray = field.value.every(
      (item: any) => typeof item !== 'object' || item === null
    );

    if (isScalarArray) {
      return (
        <tr
          onMouseEnter={() =>
            field.byteRange && onHoverRange?.(field.byteRange)
          }
          onMouseLeave={() => onHoverRange?.(null)}
          className={cn(
            'transition-colors',
            isHighlighted ? 'bg-sky-500/15' : 'hover:bg-slate-900/70'
          )}
        >
          <td className='whitespace-nowrap px-4 py-2.5 text-slate-400'>
            {formatByteRange(field.byteRange)}
          </td>
          <td className='whitespace-nowrap px-4 py-2.5 text-slate-200'>
            <div
              className='flex items-center gap-2'
              style={{ paddingLeft: `${depth * 16}px` }}
            >
              <span>{field.fieldNumber ?? ''}</span>
              {field.fieldName &&
                field.fieldName !== String(field.fieldNumber) && (
                  <span className='rounded bg-slate-800 px-1.5 py-0.5 text-[11px] text-slate-300'>
                    {field.fieldName}
                  </span>
                )}
            </div>
          </td>
          <td className='whitespace-nowrap px-4 py-2.5'>
            <span className='rounded border border-slate-800 bg-slate-900 px-1.5 py-0.5 text-[11px] text-slate-300'>
              {field.type}
            </span>
          </td>
          <td className='px-4 py-2.5'>
            <span className='text-sky-400'>
              [{field.value.map((v: any) => JSON.stringify(v)).join(', ')}]
            </span>
          </td>
        </tr>
      );
    }

    return (
      <>
        <tr
          onMouseEnter={() =>
            field.byteRange && onHoverRange?.(field.byteRange)
          }
          onMouseLeave={() => onHoverRange?.(null)}
          className={cn(
            'bg-slate-900/40 transition-colors',
            isHighlighted ? 'bg-sky-500/15' : 'hover:bg-slate-900/70'
          )}
        >
          <td className='whitespace-nowrap px-4 py-2.5 text-slate-400'>
            {formatByteRange(field.byteRange)}
          </td>
          <td className='whitespace-nowrap px-4 py-2.5 text-slate-200'>
            <div
              className='flex items-center gap-2'
              style={{ paddingLeft: `${depth * 16}px` }}
            >
              <span>{field.fieldNumber ?? '?'}</span>
              {field.fieldName && (
                <span className='rounded bg-slate-800 px-1.5 py-0.5 text-[11px] text-slate-300'>
                  {field.fieldName}
                </span>
              )}
            </div>
          </td>
          <td className='whitespace-nowrap px-4 py-2.5'>
            <span className='rounded border border-slate-800 bg-slate-900 px-1.5 py-0.5 text-[11px] text-slate-300'>
              {field.type}
            </span>
          </td>
          <td className='px-4 py-2.5 text-slate-400'>
            {field.value.length} repeated message items
          </td>
        </tr>
        {field.value.map((item: DecodedField, idx: number) => (
          <ProtoByteTableRow
            key={idx}
            field={item}
            depth={depth + 1}
            highlightedRange={highlightedRange}
            onHoverRange={onHoverRange}
          />
        ))}
      </>
    );
  }

  // Handle message
  if (field.type === 'message' && Array.isArray(field.value)) {
    return (
      <>
        <tr
          onMouseEnter={() =>
            field.byteRange && onHoverRange?.(field.byteRange)
          }
          onMouseLeave={() => onHoverRange?.(null)}
          className={cn(
            'bg-slate-900/30 transition-colors',
            isHighlighted ? 'bg-sky-500/15' : 'hover:bg-slate-900/70'
          )}
        >
          <td className='whitespace-nowrap px-4 py-2.5 text-slate-400'>
            {formatByteRange(field.byteRange)}
          </td>
          <td className='whitespace-nowrap px-4 py-2.5 text-slate-200'>
            <div
              className='flex items-center gap-2'
              style={{ paddingLeft: `${depth * 16}px` }}
            >
              {depth > 0 && <span className='text-slate-600'>└─</span>}
              <span>{field.fieldNumber ?? ''}</span>
              {field.fieldName &&
                field.fieldName !== String(field.fieldNumber) && (
                  <span className='rounded bg-slate-800 px-1.5 py-0.5 text-[11px] text-slate-300'>
                    {field.fieldName}
                  </span>
                )}
            </div>
          </td>
          <td className='whitespace-nowrap px-4 py-2.5'>
            <div className='flex items-center gap-1.5'>
              <span className='rounded border border-slate-800 bg-slate-900 px-1.5 py-0.5 text-[11px] text-slate-300'>
                {field.type}
              </span>
              {field.wireType !== undefined && (
                <span className='text-[10px] text-slate-500'>
                  {WIRE_LABELS[field.wireType] || ''}
                </span>
              )}
            </div>
          </td>
          <td className='px-4 py-2.5'>
            <span className='font-medium text-slate-300'>
              {field.message || 'Message'} ({field.value.length}{' '}
              {field.value.length === 1 ? 'field' : 'fields'})
            </span>
          </td>
        </tr>
        {field.value.map((subField, idx) => (
          <ProtoByteTableRow
            key={idx}
            field={subField}
            depth={depth + 1}
            highlightedRange={highlightedRange}
            onHoverRange={onHoverRange}
          />
        ))}
      </>
    );
  }

  // Primitive
  return (
    <tr
      onMouseEnter={() => field.byteRange && onHoverRange?.(field.byteRange)}
      onMouseLeave={() => onHoverRange?.(null)}
      className={cn(
        'transition-colors',
        isHighlighted ? 'bg-sky-500/15' : 'hover:bg-slate-900/70'
      )}
    >
      <td className='whitespace-nowrap px-4 py-2.5 text-slate-400'>
        {formatByteRange(field.byteRange)}
      </td>
      <td className='whitespace-nowrap px-4 py-2.5 text-slate-200'>
        <div
          className='flex items-center gap-2'
          style={{ paddingLeft: `${depth * 16}px` }}
        >
          {depth > 0 && <span className='text-slate-600'>└─</span>}
          <span>{field.fieldNumber ?? ''}</span>
          {field.fieldName && field.fieldName !== String(field.fieldNumber) && (
            <span className='rounded bg-slate-800 px-1.5 py-0.5 text-[11px] text-slate-300'>
              {field.fieldName}
            </span>
          )}
        </div>
      </td>
      <td className='whitespace-nowrap px-4 py-2.5'>
        <div className='flex items-center gap-1.5'>
          <span className='rounded border border-slate-800 bg-slate-900 px-1.5 py-0.5 text-[11px] text-slate-300'>
            {field.type}
          </span>
          {field.wireType !== undefined && (
            <span className='text-[10px] text-slate-500'>
              {WIRE_LABELS[field.wireType] || ''}
            </span>
          )}
        </div>
      </td>
      <td className='px-4 py-2.5'>
        <div className='flex flex-wrap items-center gap-2'>
          <span className={getValueClass(field.type)}>
            {formatValue(field)}
          </span>
          {field.interpretations?.float && field.type === 'fixed32' && (
            <span className='rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-slate-400'>
              float: {field.interpretations.float}
            </span>
          )}
          {field.interpretations?.double && field.type === 'fixed64' && (
            <span className='rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-slate-400'>
              double: {field.interpretations.double}
            </span>
          )}
          {field.interpretations?.sint64 &&
            field.type === 'varint' &&
            field.interpretations.sint64 !== String(field.value) && (
              <span className='rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-slate-400'>
                sint: {field.interpretations.sint64}
              </span>
            )}
        </div>
      </td>
    </tr>
  );
}

function formatByteRange(byteRange?: [number, number]): string {
  if (!byteRange || byteRange.length !== 2) return '—';
  return `${byteRange[0]}-${byteRange[1]}`;
}

function formatValue(field: DecodedField): string {
  if (!field) return '';
  switch (field.type) {
    case 'string':
      return String(field.value);
    case 'int32':
    case 'int64':
    case 'varint':
      return String(field.value);
    case 'bool':
      return field.value ? 'true' : 'false';
    case 'enum':
      return String(field.value);
    case 'timestamp':
      return String(field.value);
    default:
      return String(field.value);
  }
}

function getValueClass(type: string): string {
  return cn({
    'text-sky-400': type === 'string',
    'text-emerald-400': type === 'bool',
    'text-amber-400':
      type === 'int32' ||
      type === 'int64' ||
      type === 'uint32' ||
      type === 'uint64' ||
      type === 'sint32' ||
      type === 'sint64' ||
      type === 'varint',
    'text-cyan-300': type === 'timestamp',
    'text-rose-400': type === 'bytes',
    'text-teal-400':
      type === 'float' ||
      type === 'double' ||
      type === 'fixed32' ||
      type === 'fixed64',
    'text-orange-400': type === 'enum',
  });
}

'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DecodedField } from '../utils/protobuf-decoder';

export function ProtoTableView({
  data,
  messageTypeName,
}: {
  data: string;
  messageTypeName?: string | null;
}) {
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
  if (!root || !Array.isArray(root.value)) return null;
  const messageName = root.message || messageTypeName || 'Message';
  return (
    <div className='overflow-hidden rounded-lg border border-slate-800/90 bg-[#0D111A]'>
      <div className='border-b border-slate-800/80 px-4 py-3 font-mono text-sm font-semibold text-slate-100'>
        {messageName}
      </div>
      <div className='overflow-x-auto'>
        <table className='w-full text-left text-xs'>
          <thead>
            <tr className='border-b border-slate-800 bg-slate-900/90 text-[11px] uppercase tracking-wider text-slate-400'>
              <th className='px-4 py-2.5 font-semibold'>Field</th>
              <th className='px-4 py-2.5 font-semibold'>Type</th>
              <th className='px-4 py-2.5 font-semibold'>Value</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-800/60 font-mono'>
            <ProtoTableRows
              fields={
                Array.isArray(root.value) &&
                root.value.every((v) => typeof v === 'object')
                  ? (root.value as DecodedField[])
                  : []
              }
              level={0}
              parentKey=''
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}

const ProtoTableRows = ({
  fields,
  parentKey = '',
  level = 0,
}: {
  fields: DecodedField[];
  parentKey?: string;
  level?: number;
}) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );
  if (!fields) return null;
  return (
    <>
      {fields.map((field, idx) => {
        const key =
          field.fieldName || field.message || String(field.fieldNumber ?? idx);
        const fullKey = parentKey
          ? `${parentKey}.${key}.${idx}`
          : `${key}.${idx}`;
        const isExpandable = isMessageOrRepeated(field);
        const isExpanded = expandedItems[fullKey] !== false;
        return (
          <React.Fragment key={fullKey}>
            <tr className='transition-colors hover:bg-slate-900/70'>
              <td className='px-4 py-2.5 font-medium'>
                <div
                  className='flex items-center gap-1.5'
                  style={{ paddingLeft: `${level * 18}px` }}
                >
                  {isExpandable ? (
                    <button
                      type='button'
                      onClick={() =>
                        setExpandedItems((prev) => ({
                          ...prev,
                          [fullKey]: !isExpanded,
                        }))
                      }
                      className='rounded p-0.5 text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none'
                    >
                      {isExpanded ? (
                        <ChevronDown className='h-3.5 w-3.5' />
                      ) : (
                        <ChevronRight className='h-3.5 w-3.5' />
                      )}
                    </button>
                  ) : (
                    <span className='w-4' />
                  )}
                  {field.fieldNumber !== undefined && (
                    <span className='text-slate-500'>#{field.fieldNumber}</span>
                  )}
                  <span className='text-slate-200'>{key}</span>
                </div>
              </td>
              <td className='px-4 py-2.5 text-slate-400'>
                <span className='rounded border border-slate-800 bg-slate-900 px-1.5 py-0.5 text-[11px] text-slate-300'>
                  {field.type}
                </span>
              </td>
              <td className='px-4 py-2.5'>
                {!isExpandable ? (
                  <ValueDisplay field={field} />
                ) : (
                  <span className='text-slate-400'>
                    {field.type.startsWith('repeated_')
                      ? `${Array.isArray(field.value) ? field.value.length : 0} items`
                      : 'Nested Message'}
                  </span>
                )}
              </td>
            </tr>
            {isExpandable &&
              isExpanded &&
              field.type === 'message' &&
              Array.isArray(field.value) && (
                <ProtoTableRows
                  fields={field.value as DecodedField[]}
                  level={level + 1}
                  parentKey={fullKey}
                />
              )}
            {isExpandable &&
              isExpanded &&
              field.type === 'repeated_message' &&
              Array.isArray(field.value) &&
              (field.value as DecodedField[]).map((item, index) => (
                <ProtoTableRows
                  key={`${fullKey}[${index}]`}
                  fields={
                    Array.isArray(item.value)
                      ? (item.value as DecodedField[])
                      : [item]
                  }
                  level={level + 1}
                  parentKey={`${fullKey}[${index}]`}
                />
              ))}
          </React.Fragment>
        );
      })}
    </>
  );
};

const ValueDisplay = ({ field }: { field: DecodedField }) => {
  if (!field) return null;
  return (
    <span
      className={cn({
        'text-sky-400': field.type === 'string',
        'text-emerald-400': field.type === 'bool',
        'text-amber-400':
          field.type === 'int32' ||
          field.type === 'int64' ||
          field.type === 'varint',
        'text-cyan-300': field.type === 'timestamp',
        'text-rose-400': field.type === 'bytes',
        'text-teal-400':
          field.type === 'float' ||
          field.type === 'double' ||
          field.type === 'fixed32' ||
          field.type === 'fixed64',
        'text-orange-400': field.type === 'enum',
      })}
    >
      {field.type === 'string'
        ? `"${field.value}"`
        : field.type === 'bool'
          ? field.value
            ? 'true'
            : 'false'
          : (field.value?.toString?.() ?? String(field.value))}
    </span>
  );
};

function isMessageOrRepeated(field: DecodedField): boolean {
  return field.type === 'message' || field.type.startsWith('repeated_');
}

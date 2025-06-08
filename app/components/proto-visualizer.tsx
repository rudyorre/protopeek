'use client';

import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { DecodedField } from '../utils/protobuf-decoder';

export function ProtoVisualizer({ data }: { data: string }) {
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

  if (!root) return null;

  const messageName = root?.message || 'Message';

  return (
    <div className='rounded-md bg-[#303134] p-4'>
      <div className='mb-2 text-lg font-medium text-white'>{messageName}</div>
      <ProtoValue data={root} />
    </div>
  );
}

const ProtoValue = ({
  data,
  level = 0,
  fieldName = '',
}: {
  data: DecodedField;
  level?: number;
  fieldName?: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  if (!data) return null;

  // Handle repeated fields (arrays of messages or scalars)
  if (data.type.startsWith('repeated_')) {
    return (
      <div className={cn('pl-4', level > 0 ? 'mt-2' : '')}>
        <div
          className='flex cursor-pointer items-center'
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronDown className='mr-1 h-4 w-4 text-gray-400' />
          ) : (
            <ChevronRight className='mr-1 h-4 w-4 text-gray-400' />
          )}
          <span className='font-medium text-gray-300'>
            {fieldName} (
            {Array.isArray(data.value) ? `${data.value.length} items` : 'array'}
            )
          </span>
        </div>
        {isExpanded && Array.isArray(data.value) && (
          <div className='border-l-2 border-gray-700 pl-4'>
            {data.value.map((item: any, index: number) => (
              <div key={index} className='mt-2'>
                <div className='flex items-start'>
                  <span className='mr-2 font-medium text-gray-400'>
                    [{index}]
                  </span>
                  {typeof item === 'object' && item !== null ? (
                    <ProtoValue data={item} level={level + 1} />
                  ) : (
                    <span className='text-blue-400'>
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
    // Ensure data.value is an array of DecodedField before mapping
    const fields = data.value as DecodedField[];
    return (
      <div className={cn('pl-0', level > 0 ? 'mt-2' : '')}>
        {level > 0 && (
          <div
            className='mb-1 flex cursor-pointer items-center'
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className='mr-1 h-4 w-4 text-gray-400' />
            ) : (
              <ChevronRight className='mr-1 h-4 w-4 text-gray-400' />
            )}
            <span className='font-medium text-gray-300'>
              {fieldName || data.message || 'Object'}
            </span>
          </div>
        )}
        {isExpanded && (
          <div
            className={cn(
              'border-l-2 border-gray-700 pl-4',
              level === 0 ? 'mt-2' : ''
            )}
          >
            {Array.isArray(fields) &&
              fields.every(
                (f) => typeof f === 'object' && f !== null && 'type' in f
              ) &&
              fields.map((field: DecodedField, idx: number) => (
                <div key={idx} className='mt-1'>
                  <div className='flex items-start'>
                    {field.fieldNumber !== undefined && (
                      <span className='mr-2 font-medium text-gray-300'>
                        {field.fieldNumber}:
                      </span>
                    )}
                    <ProtoValue
                      data={field}
                      level={level + 1}
                      fieldName={
                        field.message || String(field.fieldNumber) || 'field'
                      }
                    />
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    );
  }

  // Primitive value
  return (
    <div
      className={cn('flex items-center gap-2', {
        'text-blue-400': data.type === 'string',
        'text-green-400': data.type === 'bool',
        'text-amber-400': data.type === 'int32' || data.type === 'int64',
        'text-purple-400': data.type === 'timestamp',
        'text-rose-400': data.type === 'bytes',
        'text-teal-400': data.type === 'float' || data.type === 'double',
        'text-orange-400': data.type === 'enum',
      })}
    >
      <span>
        {data.type === 'string'
          ? `"${data.value}"`
          : data.type === 'bool'
            ? data.value
              ? 'true'
              : 'false'
            : (data.value?.toString?.() ?? String(data.value))}
      </span>
      <span className='text-xs text-gray-500'>({data.type})</span>
    </div>
  );
};

// Helper function to check if a field is a message or repeated type
function isMessageOrRepeated(field: DecodedField): boolean {
  return field.type === 'message' || field.type.startsWith('repeated_');
}

'use client';

import { cn } from '@/lib/utils';
import { DecodedField } from '../utils/protobuf-decoder';

export function ProtoByteTable({ data }: { data: string }) {
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
    <div className='rounded-md bg-[#303134] p-4'>
      <h2 className='mb-4 text-xl font-medium'>Result</h2>
      <div className='overflow-x-auto'>
        <table className='w-full border-collapse'>
          <thead>
            <tr className='bg-[#202124] text-gray-200'>
              <th className='border-2 border-gray-600 px-4 py-2 text-left font-medium'>
                Byte Range
              </th>
              <th className='border-2 border-gray-600 px-4 py-2 text-left font-medium'>
                Field Number
              </th>
              <th className='border-2 border-gray-600 px-4 py-2 text-left font-medium'>
                Type
              </th>
              <th className='border-2 border-gray-600 px-4 py-2 text-left font-medium'>
                Content
              </th>
            </tr>
          </thead>
          <tbody>
            {root.value.map((field, index) => (
              <ProtoByteTableRow key={index} field={field} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProtoByteTableRow({ field }: { field: DecodedField }) {
  // Handle repeated fields
  if (field.type.startsWith('repeated_') && Array.isArray(field.value)) {
    return (
      <tr>
        <td className='border-2 border-gray-600 px-4 py-2' colSpan={4}>
          <span className='font-medium text-gray-300'>
            Field {field.fieldNumber ?? '?'} ({field.type}):
          </span>
          <div className='pl-4'>
            {field.value.map((item: DecodedField, idx: number) => (
              <ProtoByteTableRow key={idx} field={item} />
            ))}
          </div>
        </td>
      </tr>
    );
  }

  // Handle message
  if (field.type === 'message' && Array.isArray(field.value)) {
    return (
      <>
        <tr>
          <td className='border-2 border-gray-600 px-4 py-2'>
            {formatByteRange(field.byteRange)}
          </td>
          <td className='border-2 border-gray-600 px-4 py-2'>
            {field.fieldNumber ?? ''}
          </td>
          <td className='border-2 border-gray-600 px-4 py-2'>{field.type}</td>
          <td className='border-2 border-gray-600 px-4 py-2'>
            <span className='font-medium text-gray-300'>
              {field.message || 'Message'}
            </span>
            <table className='mt-2 w-full border-collapse'>
              <tbody>
                {field.value.map((subField, idx) => (
                  <ProtoByteTableRow key={idx} field={subField} />
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      </>
    );
  }

  // Primitive
  return (
    <tr>
      <td className='border-2 border-gray-600 px-4 py-2'>
        {formatByteRange(field.byteRange)}
      </td>
      <td className='border-2 border-gray-600 px-4 py-2'>
        {field.fieldNumber ?? ''}
      </td>
      <td className='border-2 border-gray-600 px-4 py-2'>{field.type}</td>
      <td className='border-2 border-gray-600 px-4 py-2'>
        <span className={getValueClass(field.type)}>{formatValue(field)}</span>
      </td>
    </tr>
  );
}

function formatByteRange(byteRange?: [number, number]): string {
  if (!byteRange || byteRange.length !== 2) return '';
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
    'text-blue-400': type === 'string',
    'text-green-400': type === 'bool',
    'text-amber-400': type === 'int32' || type === 'int64' || type === 'varint',
    'text-purple-400': type === 'timestamp',
    'text-rose-400': type === 'bytes',
    'text-teal-400': type === 'float' || type === 'double',
    'text-orange-400': type === 'enum',
  });
}

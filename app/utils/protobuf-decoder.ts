import protobuf from 'protobufjs';
import { BufferReader } from './buffer-reader';

export enum WireType {
  VARINT = 0,
  FIXED64 = 1,
  LENGTH_DELIMITED = 2,
  START_GROUP = 3, // Deprecated
  END_GROUP = 4, // Deprecated
  FIXED32 = 5,
}
export interface DecodedField {
  type: string;
  value: string | DecodedField[];
  message?: string; // Optional, for named messages
  fieldNumber?: number; // Optional, for schemaless decoding
  wireType?: WireType; // Optional, for schemaless decoding
  byteRange?: [number, number]; // Optional, for schemaless decoding
}

export interface DecodedMessage {
  message: string;
  fields: Record<string, DecodedField>;
}

export class ProtobufDecodingError extends Error {
  constructor(
    message: string,
    public readonly errorType:
      | 'UNSUPPORTED_WIRE_TYPE'
      | 'PARSING_ERROR'
      | 'INVALID_FORMAT'
  ) {
    super(message);
    this.name = 'ProtobufDecodingError';
  }
}

export class ProtobufDecoder {
  private root: protobuf.Root | null = null;
  private messageTypes: Map<string, protobuf.Type> = new Map();

  async loadProtoFiles(
    protoFiles: Array<{ name: string; content: string; path: string }>
  ) {
    try {
      this.root = new protobuf.Root();

      // Parse each proto file content directly
      for (const file of protoFiles) {
        console.log(`Loading proto file: ${file.path}`);

        try {
          // Parse the proto content directly instead of trying to load from file
          const parsed = protobuf.parse(file.content, this.root, {
            keepCase: true,
            alternateCommentMode: true,
          });

          if (parsed.package) {
            console.log(`Parsed package: ${parsed.package}`);
          }

          console.log(`Successfully parsed ${file.path}`);
        } catch (parseError) {
          console.error(`Error parsing ${file.path}:`, parseError);
          throw new Error(`Failed to parse ${file.path}: ${parseError}`);
        }
      }

      // Resolve all types after parsing all files
      this.root.resolveAll();

      // Collect all message types
      this.collectMessageTypes(this.root);

      console.log(
        'Available message types:',
        Array.from(this.messageTypes.keys())
      );

      if (this.messageTypes.size === 0) {
        throw new Error('No message types found in the provided proto files');
      }

      return true;
    } catch (error) {
      console.error('Error loading proto files:', error);
      throw new Error(`Failed to load proto files: ${error}`);
    }
  }

  private collectMessageTypes(namespace: protobuf.Namespace) {
    for (const [name, nested] of Object.entries(namespace.nested || {})) {
      if (nested instanceof protobuf.Type) {
        // Store both full name and simple name
        const fullName = nested.fullName.startsWith('.')
          ? nested.fullName.substring(1)
          : nested.fullName;
        this.messageTypes.set(fullName, nested);
        this.messageTypes.set(name, nested);
        console.log(`Found message type: ${name} (${fullName})`);
      } else if (nested instanceof protobuf.Namespace) {
        this.collectMessageTypes(nested);
      }
    }
  }

  async decodeWithSchema(
    bytes: Uint8Array,
    messageTypeName?: string
  ): Promise<DecodedField[]> {
    if (!this.root) {
      throw new Error('No proto files loaded');
    }

    // If no message type specified, try to find the first available one
    if (!messageTypeName && this.messageTypes.size > 0) {
      messageTypeName = Array.from(this.messageTypes.keys())[0];
    }

    if (!messageTypeName) {
      throw new Error('No message type available');
    }

    const messageType = this.messageTypes.get(messageTypeName);
    if (!messageType) {
      const availableTypes = Array.from(this.messageTypes.keys()).join(', ');
      throw new Error(
        `Message type '${messageTypeName}' not found. Available types: ${availableTypes}`
      );
    }

    try {
      console.log(
        `Decoding ${bytes.length} bytes with message type: ${messageTypeName}`
      );

      const decoded = messageType.decode(bytes);
      const object = messageType.toObject(decoded, {
        longs: String,
        enums: String,
        bytes: String,
        defaults: false, // Don't include default values
        arrays: true,
        objects: true,
      });

      console.log('Decoded object:', object);

      return this.convertToDecodedFields(object, messageType);
    } catch (error) {
      console.error('Error decoding with schema:', error);
      throw new Error(
        `Failed to decode protobuf data with ${messageTypeName}: ${error}`
      );
    }
  }

  decodeWithoutSchema(buffer: Uint8Array): DecodedField[] {
    const reader = new BufferReader(buffer);
    const fields: DecodedField[] = [];

    while (reader.leftBytes() > 0) {
      reader.checkpoint();
      const startPos = reader.leftBytes();

      try {
        // Read tag
        const tag = reader.readVarint();
        const wireType = Number(tag.value & BigInt(7));
        const fieldNumber = Number(tag.value >> BigInt(3));

        let value: DecodedField['value'];
        let type: DecodedField['type'];

        // Process based on WireType
        switch (wireType) {
          case WireType.VARINT:
            const varint = reader.readVarint();
            value = varint.value.toString();
            type = 'varint';
            break;
          case WireType.FIXED64:
            value = bytesToUint64(reader.readFixed64()).toString();
            type = 'fixed64';
            break;
          case WireType.LENGTH_DELIMITED:
            const length = Number(reader.readVarint().value);
            const data = reader.readBytes(length);

            // First try to decode as a nested message
            try {
              const nestedFields = this.decodeWithoutSchema(data);

              // Check if all bytes were consumed by examining the byterange
              if (
                nestedFields.length > 0 &&
                nestedFields[nestedFields.length - 1].byteRange![1] ===
                  data.length
              ) {
                value = nestedFields;
                type = 'message';
                break; // Exit the case early if successful
              }
            } catch {
              // Failed to decode as message, continue to string/bytes
            }

            // Next try as a UTF-8 string
            try {
              const str = Buffer.from(data).toString('utf8');
              // Only consider it a string if it's printable
              if (isPrintableString(str)) {
                value = str;
                type = 'string';
                break; // Exit the case early if successful
              }
            } catch {
              // Failed to decode as string, continue to bytes
            }

            // Fallback to bytes representation
            value = Array.from(data)
              .map((b) => b.toString(16).padStart(2, '0'))
              .join(' ');
            type = 'bytes';
            break;
          case WireType.START_GROUP:
          case WireType.END_GROUP:
            throw new ProtobufDecodingError(
              `Wire type ${wireType} (${wireType === WireType.START_GROUP ? 'START_GROUP' : 'END_GROUP'}) is deprecated and not supported`,
              'UNSUPPORTED_WIRE_TYPE'
            );
          case WireType.FIXED32:
            value = bytesToUint32(reader.readFixed32()).toString();
            type = 'fixed32';
            break;
          default:
            throw new Error(`Unknown wire type: ${wireType}`);
        }

        const endPos = reader.leftBytes();
        const byteRange: [number, number] = [
          buffer.length - startPos,
          buffer.length - endPos,
        ];

        fields.push({
          fieldNumber,
          wireType,
          value,
          type,
          byteRange,
        });
      } catch (error) {
        // Rethrow specific protocol buffer errors
        if (
          error instanceof ProtobufDecodingError &&
          error.errorType === 'UNSUPPORTED_WIRE_TYPE'
        ) {
          throw error;
        }
        // If we fail to parse, reset and skip this field
        reader.resetToCheckpoint();
        break;
      }
    }

    return fields;
  }

  private convertToDecodedFields(
    obj: any,
    messageType?: protobuf.Type
  ): DecodedField[] {
    const fields: DecodedField[] = [];

    if (!obj || typeof obj !== 'object') return fields;

    // If we have a messageType, use its fields for stronger typing
    const fieldEntries = messageType
      ? Object.entries(messageType.fields)
      : Object.entries(obj);

    for (const [key, fieldInfo] of fieldEntries) {
      // Get the value from the object (by field name)
      const value = obj[key];
      if (value === null || value === undefined) continue;

      // If using messageType, fieldInfo is a protobuf.Field; otherwise, it's the value itself
      const field = messageType ? (fieldInfo as protobuf.Field) : undefined;
      let type = field?.type || typeof value;
      let convertedValue: DecodedField['value'] = value;

      if (Array.isArray(value)) {
        if (value.length === 0) continue;
        const firstItem = value[0];
        if (typeof firstItem === 'object' && firstItem !== null) {
          type = 'repeated_message';
          convertedValue = value.map((item) => ({
            type: 'message',
            value: this.convertToDecodedFields(
              item,
              field?.resolvedType as protobuf.Type
            ),
          }));
        } else {
          type = `repeated_${this.getScalarType(firstItem)}`;
          convertedValue = value;
        }
      } else if (typeof value === 'object' && value !== null) {
        type = 'message';
        convertedValue = this.convertToDecodedFields(
          value,
          field?.resolvedType as protobuf.Type
        );
      } else {
        type = field?.type || this.getScalarType(value);
        convertedValue = value;
      }

      fields.push({
        type,
        value: convertedValue,
        message: field?.resolvedType?.name,
        fieldNumber: field?.id,
      });
    }

    return fields;
  }

  private getScalarType(value: any): string {
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number')
      return Number.isInteger(value) ? 'int32' : 'double';
    if (typeof value === 'boolean') return 'bool';
    if (value instanceof Date) return 'timestamp';
    return 'unknown';
  }

  getAvailableMessageTypes(): string[] {
    return Array.from(this.messageTypes.keys());
  }
}

export function parseProtobufInput(input: string): Uint8Array {
  // Remove whitespace
  const cleaned = input.replace(/\s+/g, '');

  if (!cleaned) {
    throw new Error('Empty input');
  }

  // Try to parse as hex
  if (/^[0-9a-fA-F]+$/.test(cleaned)) {
    // Ensure even length
    const hex = cleaned.length % 2 === 0 ? cleaned : '0' + cleaned;
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = Number.parseInt(hex.substr(i, 2), 16);
    }
    console.log(`Parsed as hex: ${bytes.length} bytes`);
    return bytes;
  }

  // Try to parse as base64
  try {
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (base64Regex.test(cleaned)) {
      const binaryString = atob(cleaned);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      console.log(`Parsed as base64: ${bytes.length} bytes`);
      return bytes;
    }
  } catch (error) {
    // Not valid base64, continue to next format
  }

  throw new Error(
    'Invalid protobuf input format. Expected hex, base64, or comma-separated bytes.'
  );
}

function isPrintableString(str: string): boolean {
  if (str.length === 0 || str.length > 1000) {
    return false;
  }
  // Simple regex for ASCII printable chars + common Unicode + whitespace
  return (
    /^[\x20-\x7E\s\u00A0-\u024F\u1E00-\u1EFF]*$/.test(str) &&
    str.trim().length > 0
  );
}

/**
 * Interprets a Uint8Array as a 64-bit unsigned integer (little-endian)
 *
 * @param bytes An 8-byte Uint8Array
 * @returns The decoded bigint
 */
function bytesToUint64(bytes: Uint8Array): bigint {
  if (bytes.length !== 8) {
    throw new Error('Fixed64 must be exactly 8 bytes');
  }

  let value = BigInt(0);
  for (let i = 0; i < 8; i++) {
    value += BigInt(bytes[i]) << BigInt(i * 8);
  }
  return value;
}

/**
 * Interprets a Uint8Array as a 32-bit unsigned integer (little-endian)
 *
 * @param bytes A 4-byte Uint8Array
 * @returns The decoded number
 */
function bytesToUint32(bytes: Uint8Array): number {
  if (bytes.length !== 4) {
    throw new Error('Fixed32 must be exactly 4 bytes');
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return view.getUint32(0, true); // true for little-endian
}

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
  value: string | DecodedField[] | any;
  message?: string; // Optional, for named messages or schema field labels
  fieldName?: string; // Optional, schema field name when decoded with .proto
  fieldNumber?: number; // Field number from wire tag or schema
  wireType?: WireType; // Wire type from wire tag
  byteRange?: [number, number]; // Inclusive-exclusive [start, end] in root buffer
  payloadByteRange?: [number, number]; // Inclusive-exclusive [start, end] of value payload
  interpretations?: Record<string, string>; // Alternative scalar/wire interpretations
}

export interface DecodedMessage {
  message: string;
  fields: Record<string, DecodedField>;
}

export interface MessageFieldSchema {
  name: string;
  id: number;
  type: string;
  repeated: boolean;
  optional: boolean;
  map: boolean;
  resolvedTypeName?: string;
}

export interface MessageTypeSchema {
  name: string;
  fullName: string;
  fields: MessageFieldSchema[];
  enums: Record<string, Record<string, number>>;
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
  private canonicalMessageNames: string[] = [];

  async loadProtoFiles(
    protoFiles: Array<{ name: string; content: string; path: string }>
  ) {
    try {
      this.root = new protobuf.Root();
      this.messageTypes.clear();
      this.canonicalMessageNames = [];

      // Parse each proto file content directly
      for (const file of protoFiles) {
        try {
          protobuf.parse(file.content, this.root, {
            keepCase: true,
            alternateCommentMode: true,
          });
        } catch (parseError) {
          throw new Error(`Failed to parse ${file.path}: ${parseError}`);
        }
      }

      // Resolve all types after parsing all files
      this.root.resolveAll();

      // Collect all message types
      this.collectMessageTypes(this.root);

      if (this.messageTypes.size === 0) {
        throw new Error('No message types found in the provided proto files');
      }

      return true;
    } catch (error) {
      throw new Error(`Failed to load proto files: ${error}`);
    }
  }

  private collectMessageTypes(namespace: protobuf.Namespace) {
    for (const [name, nested] of Object.entries(namespace.nested || {})) {
      if (nested instanceof protobuf.Type) {
        const fullName = nested.fullName.startsWith('.')
          ? nested.fullName.substring(1)
          : nested.fullName;
        this.messageTypes.set(fullName, nested);
        if (!this.messageTypes.has(name)) {
          this.messageTypes.set(name, nested);
        }
        if (!this.canonicalMessageNames.includes(fullName)) {
          this.canonicalMessageNames.push(fullName);
        }
      }
      if (nested instanceof protobuf.Namespace) {
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
    if (!messageTypeName && this.canonicalMessageNames.length > 0) {
      messageTypeName = this.canonicalMessageNames[0];
    }

    if (!messageTypeName) {
      throw new Error('No message type available');
    }

    const messageType = this.messageTypes.get(messageTypeName);
    if (!messageType) {
      const availableTypes = this.canonicalMessageNames.join(', ');
      throw new Error(
        `Message type '${messageTypeName}' not found. Available types: ${availableTypes}`
      );
    }

    try {
      const decoded = messageType.decode(bytes);
      const object = messageType.toObject(decoded, {
        longs: String,
        enums: String,
        bytes: String,
        defaults: false,
        arrays: true,
        objects: true,
      });

      // Also extract wire-level fields so we can attach accurate byteRange & wireType metadata
      let wireFields: DecodedField[] = [];
      try {
        wireFields = this.decodeWithoutSchema(bytes);
      } catch {
        // Ignore wire fallback errors if schema decoding succeeded
      }

      return this.convertToDecodedFields(object, messageType, wireFields);
    } catch (error) {
      throw new Error(
        `Failed to decode protobuf data with ${messageTypeName}: ${error}`
      );
    }
  }

  /**
   * High-level convenience method that decodes a raw string input (hex, base64, or byte array)
   * with a loaded schema (if messageTypeName is provided or loaded) or without a schema,
   * returning a keyed DecodedMessage object.
   */
  async decodeProtobufInput(
    input: string,
    messageTypeName?: string
  ): Promise<DecodedMessage> {
    const bytes = parseProtobufInput(input);

    if (
      this.root &&
      (messageTypeName || this.canonicalMessageNames.length > 0)
    ) {
      const targetType = messageTypeName || this.canonicalMessageNames[0];
      const messageType = this.messageTypes.get(targetType);
      if (!messageType) {
        throw new Error(`Message type '${targetType}' not found`);
      }

      const decoded = messageType.decode(bytes);
      const object = messageType.toObject(decoded, {
        longs: Number,
        enums: String,
        bytes: String,
        defaults: false,
      });

      const fieldsRecord: Record<string, DecodedField> = {};
      for (const [key, fieldInfo] of Object.entries(messageType.fields)) {
        const val = object[key];
        if (val === undefined || val === null) continue;
        fieldsRecord[key] = {
          type: fieldInfo.type,
          value: val,
          fieldName: key,
          fieldNumber: fieldInfo.id,
          message: fieldInfo.resolvedType?.name,
        };
      }

      return {
        message: targetType,
        fields: fieldsRecord,
      };
    }

    const rawFields = this.decodeWithoutSchema(bytes);
    const fieldsRecord: Record<string, DecodedField> = {};
    for (const f of rawFields) {
      const key = String(f.fieldNumber ?? '');
      const coercedValue =
        f.type === 'varint' && /^\d+$/.test(String(f.value))
          ? Number(f.value)
          : f.value;
      fieldsRecord[key] = {
        ...f,
        value: coercedValue,
      };
    }

    return {
      message: 'Unknown',
      fields: fieldsRecord,
    };
  }

  decodeWithoutSchema(
    buffer: Uint8Array,
    baseOffset: number = 0
  ): DecodedField[] {
    const reader = new BufferReader(buffer);
    const fields: DecodedField[] = [];
    const utf8Decoder = new TextDecoder('utf-8', { fatal: true });

    while (reader.leftBytes() > 0) {
      reader.checkpoint();
      const startPos = reader.leftBytes();
      const fieldStartOffset = baseOffset + (buffer.length - startPos);

      try {
        // Read tag
        const tag = reader.readVarint();
        const wireType = Number(tag.value & BigInt(7));
        const fieldNumber = Number(tag.value >> BigInt(3));

        // Protobuf spec requires field numbers to be >= 1 and <= 2^29 - 1
        if (fieldNumber <= 0 || fieldNumber > 536870911) {
          throw new Error(`Invalid protobuf field number: ${fieldNumber}`);
        }

        let value: DecodedField['value'];
        let type: DecodedField['type'];
        let payloadByteRange: [number, number] | undefined;
        let interpretations: Record<string, string> | undefined;

        const afterTagOffset =
          baseOffset + (buffer.length - reader.leftBytes());

        // Process based on WireType
        switch (wireType) {
          case WireType.VARINT: {
            const varint = reader.readVarint();
            const rawBig = varint.value;
            value = rawBig.toString();
            type = 'varint';
            const endOffset = baseOffset + (buffer.length - reader.leftBytes());
            payloadByteRange = [afterTagOffset, endOffset];

            const signed64 = BigInt.asIntN(64, rawBig);
            const signed32 = BigInt.asIntN(32, rawBig);
            const zigzag = (rawBig >> BigInt(1)) ^ -(rawBig & BigInt(1));

            interpretations = {
              uint64: rawBig.toString(),
              int64: signed64.toString(),
              sint64: zigzag.toString(),
            };
            if (rawBig <= BigInt(0xffffffff)) {
              interpretations.int32 = signed32.toString();
            }
            if (rawBig === BigInt(0) || rawBig === BigInt(1)) {
              interpretations.bool = rawBig === BigInt(1) ? 'true' : 'false';
            }
            // Check if value looks like a plausible Unix timestamp (seconds or ms between 2000 and 2100)
            const numVal = Number(rawBig);
            if (numVal >= 946684800 && numVal <= 4102444800) {
              interpretations.timestamp = new Date(numVal * 1000).toISOString();
            } else if (numVal >= 946684800000 && numVal <= 4102444800000) {
              interpretations.timestamp = new Date(numVal).toISOString();
            }
            break;
          }
          case WireType.FIXED64: {
            const rawBytes = reader.readFixed64();
            const uint64Val = bytesToUint64(rawBytes);
            value = uint64Val.toString();
            type = 'fixed64';
            const endOffset = baseOffset + (buffer.length - reader.leftBytes());
            payloadByteRange = [afterTagOffset, endOffset];

            const view = new DataView(
              rawBytes.buffer,
              rawBytes.byteOffset,
              rawBytes.byteLength
            );
            const float64Val = view.getFloat64(0, true);
            const int64Val = BigInt.asIntN(64, uint64Val);

            interpretations = {
              uint64: uint64Val.toString(),
              sfixed64: int64Val.toString(),
              double: Number.isFinite(float64Val)
                ? String(float64Val)
                : 'NaN/Inf',
              hex:
                '0x' + uint64Val.toString(16).padStart(16, '0').toUpperCase(),
            };
            break;
          }
          case WireType.LENGTH_DELIMITED: {
            const length = Number(reader.readVarint().value);
            const payloadStart =
              baseOffset + (buffer.length - reader.leftBytes());
            const data = reader.readBytes(length);
            const payloadEnd =
              baseOffset + (buffer.length - reader.leftBytes());
            payloadByteRange = [payloadStart, payloadEnd];

            const hexPreview = Array.from(data)
              .map((b) => b.toString(16).padStart(2, '0'))
              .join(' ');
            const base64Preview = uint8ArrayToBase64(data);

            interpretations = {
              length: `${data.length} byte${data.length === 1 ? '' : 's'}`,
              hex: hexPreview,
              base64: base64Preview,
            };

            // Try to decode packed varints if length > 0 and <= 128
            const packedVarints = tryDecodePackedVarints(data);
            if (packedVarints && packedVarints.length > 1) {
              interpretations.packed_varint = `[${packedVarints.join(', ')}]`;
            }

            // First try to decode as a nested message
            try {
              if (data.length > 0) {
                const nestedFields = this.decodeWithoutSchema(
                  data,
                  payloadStart
                );

                // Check if all bytes were consumed by examining the byterange
                if (
                  nestedFields.length > 0 &&
                  nestedFields[nestedFields.length - 1].byteRange![1] ===
                    payloadStart + data.length
                ) {
                  value = nestedFields;
                  type = 'message';
                  break; // Exit the case early if successful
                }
              }
            } catch {
              // Failed to decode as message, continue to string/bytes
            }

            // Next try as a UTF-8 string
            try {
              const str = utf8Decoder.decode(data);
              // Only consider it a string if it's printable
              if (isPrintableString(str)) {
                value = str;
                type = 'string';
                interpretations.utf8 = str;
                break; // Exit the case early if successful
              }
            } catch {
              // Failed to decode as string, continue to bytes
            }

            // Fallback to bytes representation
            value = hexPreview;
            type = 'bytes';
            break;
          }
          case WireType.START_GROUP:
          case WireType.END_GROUP:
            throw new ProtobufDecodingError(
              `Wire type ${wireType} (${wireType === WireType.START_GROUP ? 'START_GROUP' : 'END_GROUP'}) is deprecated and not supported`,
              'UNSUPPORTED_WIRE_TYPE'
            );
          case WireType.FIXED32: {
            const rawBytes = reader.readFixed32();
            const uint32Val = bytesToUint32(rawBytes);
            value = uint32Val.toString();
            type = 'fixed32';
            const endOffset = baseOffset + (buffer.length - reader.leftBytes());
            payloadByteRange = [afterTagOffset, endOffset];

            const view = new DataView(
              rawBytes.buffer,
              rawBytes.byteOffset,
              rawBytes.byteLength
            );
            const int32Val = view.getInt32(0, true);
            const float32Val = view.getFloat32(0, true);

            interpretations = {
              uint32: uint32Val.toString(),
              sfixed32: int32Val.toString(),
              float: Number.isFinite(float32Val)
                ? Number(float32Val.toPrecision(7)).toString()
                : 'NaN/Inf',
              hex: '0x' + uint32Val.toString(16).padStart(8, '0').toUpperCase(),
            };
            break;
          }
          default:
            throw new Error(`Unknown wire type: ${wireType}`);
        }

        const endPos = reader.leftBytes();
        const byteRange: [number, number] = [
          fieldStartOffset,
          baseOffset + (buffer.length - endPos),
        ];

        fields.push({
          fieldNumber,
          wireType,
          value,
          type,
          byteRange,
          payloadByteRange,
          interpretations,
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
    messageType?: protobuf.Type,
    wireFields?: DecodedField[]
  ): DecodedField[] {
    const fields: DecodedField[] = [];

    if (!obj || typeof obj !== 'object') return fields;

    // Group wire fields by fieldNumber for byteRange & wireType enrichment
    const wireByFieldNum = new Map<number, DecodedField[]>();
    if (wireFields) {
      for (const wf of wireFields) {
        if (wf.fieldNumber !== undefined) {
          const list = wireByFieldNum.get(wf.fieldNumber) || [];
          list.push(wf);
          wireByFieldNum.set(wf.fieldNumber, list);
        }
      }
    }

    // If we have a messageType, use its fields for stronger typing
    const fieldEntries = messageType
      ? Object.entries(messageType.fields)
      : Object.entries(obj);

    for (const [key, fieldInfo] of fieldEntries) {
      const field = messageType ? (fieldInfo as protobuf.Field) : undefined;
      const fieldNum = field?.id;
      const matchingWire =
        fieldNum !== undefined ? wireByFieldNum.get(fieldNum) : undefined;

      // Get the value from the object (by field name)
      let value = obj[key];

      // If protobufjs omitted a default value (like enum 0 or bool false) that WAS explicitly on the wire, recover it
      if (
        (value === null || value === undefined) &&
        matchingWire &&
        matchingWire.length > 0 &&
        field
      ) {
        if (field.resolvedType instanceof protobuf.Enum) {
          const rawNum = Number(matchingWire[0].value);
          value = field.resolvedType.valuesById[rawNum] ?? rawNum;
        } else if (field.type === 'bool') {
          value = matchingWire[0].value === '1';
        } else if (field.type === 'string') {
          value = String(matchingWire[0].value);
        } else {
          value = matchingWire[0].value;
        }
      }

      if (value === null || value === undefined) continue;

      let type = field?.type || typeof value;
      let convertedValue: DecodedField['value'] = value;

      if (Array.isArray(value)) {
        if (value.length === 0) continue;
        const firstItem = value[0];
        if (typeof firstItem === 'object' && firstItem !== null) {
          type = 'repeated_message';
          convertedValue = value.map((item, idx) => {
            const subWire =
              matchingWire &&
              matchingWire[idx] &&
              Array.isArray(matchingWire[idx].value)
                ? (matchingWire[idx].value as DecodedField[])
                : undefined;
            return {
              type: 'message',
              message: field?.resolvedType?.name || key,
              fieldName: `${key}[${idx}]`,
              fieldNumber: field?.id,
              wireType: matchingWire?.[idx]?.wireType,
              byteRange: matchingWire?.[idx]?.byteRange,
              payloadByteRange: matchingWire?.[idx]?.payloadByteRange,
              value: this.convertToDecodedFields(
                item,
                field?.resolvedType as protobuf.Type,
                subWire
              ),
            };
          });
        } else {
          type = `repeated_${field?.type || this.getScalarType(firstItem)}`;
          convertedValue = value;
        }
      } else if (typeof value === 'object' && value !== null) {
        type = 'message';
        const subWire =
          matchingWire &&
          matchingWire[0] &&
          Array.isArray(matchingWire[0].value)
            ? (matchingWire[0].value as DecodedField[])
            : undefined;
        convertedValue = this.convertToDecodedFields(
          value,
          field?.resolvedType as protobuf.Type,
          subWire
        );
      } else {
        if (field?.resolvedType instanceof protobuf.Enum) {
          type = 'enum';
        } else {
          type = field?.type || this.getScalarType(value);
        }
        convertedValue = value;
      }

      // Compute consolidated byte range if repeated on wire
      let byteRange: [number, number] | undefined;
      let payloadByteRange: [number, number] | undefined;
      let wireType: WireType | undefined;
      let interpretations: Record<string, string> | undefined;

      if (matchingWire && matchingWire.length > 0) {
        const first = matchingWire[0];
        const last = matchingWire[matchingWire.length - 1];
        if (first.byteRange && last.byteRange) {
          byteRange = [first.byteRange[0], last.byteRange[1]];
        }
        payloadByteRange = first.payloadByteRange;
        wireType = first.wireType;
        interpretations = first.interpretations;
      }

      fields.push({
        type,
        value: convertedValue,
        fieldName: field?.name || key,
        message: field?.resolvedType?.name || field?.name || key,
        fieldNumber: field?.id,
        wireType,
        byteRange,
        payloadByteRange,
        interpretations,
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
    return this.canonicalMessageNames.length > 0
      ? [...this.canonicalMessageNames]
      : Array.from(this.messageTypes.keys());
  }

  getMessageTypeSchema(messageTypeName: string): MessageTypeSchema | null {
    const type = this.messageTypes.get(messageTypeName);
    if (!type) return null;

    const fields: MessageFieldSchema[] = Object.values(type.fields).map(
      (f) => ({
        name: f.name,
        id: f.id,
        type: f.type,
        repeated: f.repeated,
        optional: f.optional,
        map: f.map,
        resolvedTypeName: f.resolvedType?.fullName?.replace(/^\./, ''),
      })
    );

    const enums: Record<string, Record<string, number>> = {};
    if (type.nested) {
      for (const [name, nested] of Object.entries(type.nested)) {
        if (nested instanceof protobuf.Enum) {
          enums[name] = nested.values;
        }
      }
    }

    return {
      name: type.name,
      fullName: type.fullName.replace(/^\./, ''),
      fields,
      enums,
    };
  }
}

export function detectInputFormat(
  input: string
): 'hex' | 'base64' | 'bytes' | 'empty' | 'invalid' {
  const trimmed = input.trim();
  if (!trimmed) return 'empty';

  // Comma-separated bytes (e.g. "10, 11, 72" or "[0x0a, 0x0b]")
  if (
    /^\[?\s*(?:0x[0-9a-fA-F]{1,2}|\d{1,3})(?:\s*,\s*(?:0x[0-9a-fA-F]{1,2}|\d{1,3}))+\s*\]?$/.test(
      trimmed
    )
  ) {
    return 'bytes';
  }

  // Hex with optional 0x or \x prefixes or spaces
  const hexCleaned = trimmed.replace(/0x|\\x/gi, '').replace(/[\s,:;-]+/g, '');
  if (
    /^[0-9a-fA-F]+$/.test(hexCleaned) &&
    (trimmed.includes(' ') ||
      /0x|\\x/i.test(trimmed) ||
      !/[G-Zg-z+/=]/.test(trimmed))
  ) {
    return 'hex';
  }

  // Base64 (standard or URL-safe)
  const b64Cleaned = trimmed.replace(/\s+/g, '');
  if (/^[A-Za-z0-9+/_-]*={0,2}$/.test(b64Cleaned) && b64Cleaned.length >= 2) {
    return 'base64';
  }

  return 'invalid';
}

export function parseProtobufInput(input: string): Uint8Array {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error('Empty input');
  }

  // 1. Try comma-separated byte array (e.g. "8, 150, 1" or "[0x08, 0x96, 0x01]")
  if (
    /^\[?\s*(?:0x[0-9a-fA-F]{1,2}|\d{1,3})(?:\s*,\s*(?:0x[0-9a-fA-F]{1,2}|\d{1,3}))+\s*\]?$/.test(
      trimmed
    )
  ) {
    const inner = trimmed.replace(/^\[|\]$/g, '');
    const parts = inner.split(',').map((s) => s.trim());
    const bytes = new Uint8Array(parts.length);
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const val = part.toLowerCase().startsWith('0x')
        ? Number.parseInt(part.slice(2), 16)
        : Number.parseInt(part, 10);
      if (Number.isNaN(val) || val < 0 || val > 255) {
        throw new Error(`Invalid byte value at index ${i}: ${part}`);
      }
      bytes[i] = val;
    }
    return bytes;
  }

  // Remove whitespace
  const cleaned = trimmed.replace(/\s+/g, '');

  // Strip 0x or \x prefixes if present
  const strippedHex = cleaned.replace(/0x|\\x/gi, '');

  // 2. Try to parse as hex
  if (/^[0-9a-fA-F]+$/.test(strippedHex)) {
    const hex = strippedHex.length % 2 === 0 ? strippedHex : '0' + strippedHex;
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = Number.parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
  }

  // 3. Try to parse as base64 (standard or URL-safe)
  try {
    const normalizedB64 = cleaned.replace(/-/g, '+').replace(/_/g, '/');
    const paddedB64 =
      normalizedB64.length % 4 === 0
        ? normalizedB64
        : normalizedB64 + '='.repeat(4 - (normalizedB64.length % 4));
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (base64Regex.test(paddedB64)) {
      const binaryString = atob(paddedB64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    }
  } catch {
    // Not valid base64, continue
  }

  throw new Error(
    'Invalid protobuf input format. Expected hex, base64, or comma-separated bytes.'
  );
}

export function formatBytes(
  bytes: Uint8Array,
  format: 'hex' | 'base64' | 'bytes'
): string {
  if (format === 'hex') {
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join(' ');
  }
  if (format === 'base64') {
    return uint8ArrayToBase64(bytes);
  }
  return Array.from(bytes).join(', ');
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function tryDecodePackedVarints(data: Uint8Array): string[] | null {
  if (data.length < 2 || data.length > 128) return null;
  const reader = new BufferReader(data);
  const values: string[] = [];
  try {
    while (reader.leftBytes() > 0) {
      const v = reader.readVarint();
      values.push(v.value.toString());
    }
    return values.length > 1 ? values : null;
  } catch {
    return null;
  }
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

/**
 * Synthesizes a valid proto3 schema definition from decoded fields (useful in schemaless mode)
 */
export function inferProtoSchema(
  fields: DecodedField[],
  rootMessageName: string = 'InferredMessage'
): string {
  const nestedMessages: string[] = [];
  let nestedCounter = 1;

  function buildMessageBody(
    msgFields: DecodedField[],
    msgName: string,
    indent: string
  ): string {
    // Group fields by fieldNumber to detect repeated fields
    const byNumber = new Map<number, DecodedField[]>();
    msgFields.forEach((f, idx) => {
      const num = f.fieldNumber ?? idx + 1;
      const list = byNumber.get(num) || [];
      list.push(f);
      byNumber.set(num, list);
    });

    const lines: string[] = [];
    for (const [fieldNum, group] of byNumber.entries()) {
      const sample = group[0];
      const isRepeated =
        group.length > 1 || sample.type.startsWith('repeated_');
      const prefix = isRepeated ? 'repeated ' : '';
      const fieldName = sample.fieldName
        ? sample.fieldName.replace(/\[\d+\]$/, '')
        : `field_${fieldNum}`;

      let protoType = 'bytes';
      if (sample.type === 'message' || sample.type === 'repeated_message') {
        const subName =
          sample.message &&
          sample.message !== fieldName &&
          /^[A-Za-z_]\w*$/.test(sample.message)
            ? sample.message
            : `SubMessage${nestedCounter++}`;

        // Merge all subfields across repeated occurrences to get complete submessage schema
        const allSubFields: DecodedField[] = [];
        for (const item of group) {
          if (Array.isArray(item.value)) {
            for (const subItem of item.value as DecodedField[]) {
              if (subItem.type === 'message' && Array.isArray(subItem.value)) {
                allSubFields.push(...(subItem.value as DecodedField[]));
              } else {
                allSubFields.push(subItem);
              }
            }
          }
        }
        const nestedDef = buildMessageBody(allSubFields, subName, indent);
        nestedMessages.push(nestedDef);
        protoType = subName;
      } else if (
        sample.type === 'string' ||
        sample.type === 'repeated_string'
      ) {
        protoType = 'string';
      } else if (sample.type === 'varint') {
        protoType = 'int64';
      } else if (sample.type === 'fixed32') {
        protoType = 'fixed32';
      } else if (sample.type === 'fixed64') {
        protoType = 'fixed64';
      } else if (sample.type === 'bool' || sample.type === 'repeated_bool') {
        protoType = 'bool';
      } else if (sample.type.startsWith('repeated_')) {
        protoType = sample.type.replace('repeated_', '');
      } else {
        protoType = sample.type;
      }

      lines.push(
        `${indent}  ${prefix}${protoType} ${fieldName} = ${fieldNum};`
      );
    }

    return `${indent}message ${msgName} {\n${lines.join('\n')}\n${indent}}`;
  }

  const rootDef = buildMessageBody(fields, rootMessageName, '');
  const allDefs = [...nestedMessages, rootDef].join('\n\n');
  return `syntax = "proto3";\n\n// Auto-inferred schema generated by ProtoPeek\n${allDefs}\n`;
}

/**
 * Converts DecodedField[] into a clean key-value JSON object for developer export
 */
export function decodedFieldsToCleanJson(
  fields: DecodedField[]
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const field of fields) {
    const key =
      field.fieldName ||
      (field.message && field.message !== 'Message'
        ? field.message
        : `field_${field.fieldNumber ?? 'unknown'}`);

    let converted: any;
    if (field.type === 'repeated_message' && Array.isArray(field.value)) {
      converted = field.value.map((item: DecodedField) =>
        Array.isArray(item.value)
          ? decodedFieldsToCleanJson(item.value as DecodedField[])
          : item.value
      );
    } else if (field.type === 'message' && Array.isArray(field.value)) {
      converted = decodedFieldsToCleanJson(field.value as DecodedField[]);
    } else if (
      (field.type === 'varint' ||
        field.type === 'int32' ||
        field.type === 'uint32') &&
      typeof field.value === 'string' &&
      /^-?\d+$/.test(field.value)
    ) {
      const num = Number(field.value);
      converted = Number.isSafeInteger(num) ? num : field.value;
    } else {
      converted = field.value;
    }

    if (key in result) {
      if (Array.isArray(result[key])) {
        result[key].push(converted);
      } else {
        result[key] = [result[key], converted];
      }
    } else {
      result[key] = converted;
    }
  }

  return result;
}

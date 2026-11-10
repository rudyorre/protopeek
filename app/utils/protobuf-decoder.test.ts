import {
  parseProtobufInput,
  ProtobufDecoder,
  ProtobufDecodingError,
  WireType,
  inferProtoSchema,
  decodedFieldsToCleanJson,
} from '@/app/utils/protobuf-decoder';
import { BufferReader } from '@/app/utils/buffer-reader';
import { expect, describe, test, beforeEach } from '@jest/globals';

describe('parseProtobufInput', () => {
  test('parses hex input correctly', () => {
    const input = '0a0b48656c6c6f20576f726c64';
    const result = parseProtobufInput(input);
    expect(result.length).toBe(13);
    expect(result[0]).toBe(10);
    expect(result[1]).toBe(11);
  });

  test('parses 0x-prefixed hex input correctly', () => {
    const input = '0x08 0x96 0x01';
    const result = parseProtobufInput(input);
    expect(Array.from(result)).toEqual([8, 150, 1]);
  });

  test('parses comma-separated bytes correctly', () => {
    const input = '8, 150, 1';
    const result = parseProtobufInput(input);
    expect(Array.from(result)).toEqual([8, 150, 1]);

    const bracketHex = '[0x08, 0x96, 0x01]';
    expect(Array.from(parseProtobufInput(bracketHex))).toEqual([8, 150, 1]);
  });

  test('parses base64 input correctly', () => {
    const input = 'CgtIZWxsbyBXb3JsZA==';
    const result = parseProtobufInput(input);
    expect(result.length).toBe(13);
    expect(result[0]).toBe(10);
    expect(result[1]).toBe(11);
  });

  test('throws error for invalid input', () => {
    expect(() => parseProtobufInput('invalid!@#')).toThrow();
  });
});

describe('BufferReader', () => {
  test('throws on truncated varint at end of buffer', () => {
    // 0x80 has continuation MSB set but no following byte
    const reader = new BufferReader(new Uint8Array([0x80]));
    expect(() => reader.readVarint()).toThrow(/Unexpected end of buffer/);
  });
});

describe('decodeWithoutSchema', () => {
  const decoder = new ProtobufDecoder();

  test('decodes a simple message with varint field', () => {
    // Field 1: varint with value 150
    const hex = '08 96 01';
    const buffer = parseProtobufInput(hex.replace(/\s/g, ''));

    const result = decoder.decodeWithoutSchema(buffer);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      fieldNumber: 1,
      wireType: WireType.VARINT,
      type: 'varint',
      value: '150',
    });
    expect(result[0].byteRange![0]).toBeLessThan(result[0].byteRange![1]);
  });

  test('decodes a simple message with string field', () => {
    // Field 2: string with value "testing"
    const hex = '12 07 74 65 73 74 69 6e 67';
    const buffer = parseProtobufInput(hex.replace(/\s/g, ''));

    const result = decoder.decodeWithoutSchema(buffer);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      fieldNumber: 2,
      wireType: WireType.LENGTH_DELIMITED,
      type: 'string',
      value: 'testing',
    });
  });

  test('decodes a message with multiple fields', () => {
    // Field 1: varint with value 42
    // Field 2: string with value "hello"
    const hex = '08 2A 12 05 68 65 6C 6C 6F';
    const buffer = parseProtobufInput(hex.replace(/\s/g, ''));

    const result = decoder.decodeWithoutSchema(buffer);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      fieldNumber: 1,
      wireType: WireType.VARINT,
      type: 'varint',
      value: '42',
    });
    expect(result[1]).toMatchObject({
      fieldNumber: 2,
      wireType: WireType.LENGTH_DELIMITED,
      type: 'string',
      value: 'hello',
    });
  });

  test('decodes a nested message with accurate root byteRange', () => {
    // Field 1: nested message
    //   Field 1: string with value "something"
    const base64 = 'CgsKCXNvbWV0aGluZw==';
    const buffer = parseProtobufInput(base64);

    const result = decoder.decodeWithoutSchema(buffer);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      fieldNumber: 1,
      wireType: WireType.LENGTH_DELIMITED,
      type: 'message',
    });

    const nestedFields = result[0].value as any[];
    expect(nestedFields).toHaveLength(1);
    expect(nestedFields[0]).toMatchObject({
      fieldNumber: 1,
      wireType: WireType.LENGTH_DELIMITED,
      type: 'string',
      value: 'something',
      byteRange: [2, 13],
    });
  });

  test('does not misclassify zero-padded binary bytes as fieldNumber 0 message', () => {
    // Field 1: length-delimited 4 zero bytes (0a 04 00 00 00 00)
    const buffer = parseProtobufInput('0a 04 00 00 00 00');
    const result = decoder.decodeWithoutSchema(buffer);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      fieldNumber: 1,
      type: 'bytes',
      value: '00 00 00 00',
    });
  });

  test('decodes a message with repeated string fields', () => {
    const hex = '0A 03 6F 6E 65 0A 03 74 77 6F 0A 05 74 68 72 65 65';
    const buffer = parseProtobufInput(hex.replace(/\s/g, ''));

    const result = decoder.decodeWithoutSchema(buffer);

    expect(result).toHaveLength(3);
    expect(result[0]).toMatchObject({
      fieldNumber: 1,
      wireType: WireType.LENGTH_DELIMITED,
      type: 'string',
      value: 'one',
    });
    expect(result[1]).toMatchObject({
      fieldNumber: 1,
      wireType: WireType.LENGTH_DELIMITED,
      type: 'string',
      value: 'two',
    });
    expect(result[2]).toMatchObject({
      fieldNumber: 1,
      wireType: WireType.LENGTH_DELIMITED,
      type: 'string',
      value: 'three',
    });
  });

  test('handles large varint values correctly', () => {
    // Field 1: varint with value 2^32 (4294967296)
    const hex = '08 80 80 80 80 10';
    const buffer = parseProtobufInput(hex.replace(/\s/g, ''));

    const result = decoder.decodeWithoutSchema(buffer);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      fieldNumber: 1,
      wireType: WireType.VARINT,
      type: 'varint',
      value: '4294967296',
    });
  });

  test('decodes a message with multiple repeated string fields', () => {
    const base64 = 'GgR0aGlzGgJpcxoEanVzdBoHYW5vdGhlchoFMTIzNDUaBXRlc3Qh';
    const buffer = parseProtobufInput(base64);

    const result = decoder.decodeWithoutSchema(buffer);

    expect(result).toHaveLength(6);
    expect(result[0]).toMatchObject({
      fieldNumber: 3,
      wireType: WireType.LENGTH_DELIMITED,
      type: 'string',
      value: 'this',
    });
    expect(result[5]).toMatchObject({
      fieldNumber: 3,
      wireType: WireType.LENGTH_DELIMITED,
      type: 'string',
      value: 'test!',
    });

    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].byteRange![1]).toBe(result[i + 1].byteRange![0]);
    }
    expect(result[0].byteRange![0]).toBe(0);
    expect(result[result.length - 1].byteRange![1]).toBe(buffer.length);
  });

  test('decodes a fixed32 field correctly', () => {
    const hex = '1D 2A 00 00 00';
    const buffer = parseProtobufInput(hex.replace(/\s/g, ''));

    const result = decoder.decodeWithoutSchema(buffer);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      fieldNumber: 3,
      wireType: WireType.FIXED32,
      type: 'fixed32',
      value: '42',
    });
  });

  test('decodes a fixed64 field correctly', () => {
    const hex = '21 2A 00 00 00 00 00 00 00';
    const buffer = parseProtobufInput(hex.replace(/\s/g, ''));

    const result = decoder.decodeWithoutSchema(buffer);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      fieldNumber: 4,
      wireType: WireType.FIXED64,
      type: 'fixed64',
      value: '42',
    });
  });

  test('decodes a large fixed32 value correctly', () => {
    const hex = '1D FF FF FF FF';
    const buffer = parseProtobufInput(hex.replace(/\s/g, ''));

    const result = decoder.decodeWithoutSchema(buffer);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      fieldNumber: 3,
      wireType: WireType.FIXED32,
      type: 'fixed32',
      value: '4294967295',
    });
  });

  test('decodes a large fixed64 value correctly', () => {
    const hex = '21 FF FF FF FF FF FF 1F 00';
    const buffer = parseProtobufInput(hex.replace(/\s/g, ''));

    const result = decoder.decodeWithoutSchema(buffer);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      fieldNumber: 4,
      wireType: WireType.FIXED64,
      type: 'fixed64',
      value: '9007199254740991',
    });
  });

  test('decodes a message with mixed field types including fixed', () => {
    const hex =
      '08 2A 15 64 00 00 00 19 C8 00 00 00 00 00 00 00 22 04 74 65 73 74';
    const buffer = parseProtobufInput(hex.replace(/\s/g, ''));

    const result = decoder.decodeWithoutSchema(buffer);

    expect(result).toHaveLength(4);
    expect(result[0]).toMatchObject({
      fieldNumber: 1,
      wireType: WireType.VARINT,
      type: 'varint',
      value: '42',
    });
    expect(result[1]).toMatchObject({
      fieldNumber: 2,
      wireType: WireType.FIXED32,
      type: 'fixed32',
      value: '100',
    });
    expect(result[2]).toMatchObject({
      fieldNumber: 3,
      wireType: WireType.FIXED64,
      type: 'fixed64',
      value: '200',
    });
    expect(result[3]).toMatchObject({
      fieldNumber: 4,
      wireType: WireType.LENGTH_DELIMITED,
      type: 'string',
      value: 'test',
    });
  });

  test('decodes a nested message with fixed fields correctly', () => {
    const hex = '0a 0e 0d 2a 00 00 00 11 54 00 00 00 00 00 00 00';
    const buffer = parseProtobufInput(hex);

    const result = decoder.decodeWithoutSchema(buffer);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      fieldNumber: 1,
      wireType: WireType.LENGTH_DELIMITED,
      type: 'message',
    });

    const nestedFields = result[0].value as any[];
    expect(nestedFields).toHaveLength(2);
    expect(nestedFields[0]).toMatchObject({
      fieldNumber: 1,
      wireType: WireType.FIXED32,
      type: 'fixed32',
      value: '42',
    });
    expect(nestedFields[1]).toMatchObject({
      fieldNumber: 2,
      wireType: WireType.FIXED64,
      type: 'fixed64',
      value: '84',
    });
  });

  test('throws error for START_GROUP and END_GROUP wire types', () => {
    const startGroupHex = '1b';
    const startGroupBuffer = parseProtobufInput(startGroupHex);

    expect(() => {
      decoder.decodeWithoutSchema(startGroupBuffer);
    }).toThrow(ProtobufDecodingError);

    try {
      decoder.decodeWithoutSchema(startGroupBuffer);
    } catch (e: unknown) {
      expect(e).toBeInstanceOf(ProtobufDecodingError);
      if (e instanceof ProtobufDecodingError) {
        expect(e.errorType).toBe('UNSUPPORTED_WIRE_TYPE');
        expect(e.message).toMatch(/Wire type 3 \(START_GROUP\)/);
      }
    }
  });
});

describe('ProtobufDecoder schema-aware decoding & utilities', () => {
  let decoder: ProtobufDecoder;

  const sampleProtoFile = {
    name: 'test.proto',
    content: `
      syntax = "proto3";
      package test;

      message Person {
        string name = 1;
        int32 id = 2;
        string email = 3;
      }

      message Address {
        string street = 1;
        string city = 2;
        string country = 3;
      }
    `,
    path: '/test.proto',
  };

  beforeEach(() => {
    decoder = new ProtobufDecoder();
  });

  test('loadProtoFiles loads proto definitions without duplicates', async () => {
    await decoder.loadProtoFiles([sampleProtoFile]);
    const types = decoder.getAvailableMessageTypes();
    expect(types).toEqual(['test.Person', 'test.Address']);
  });

  test('decodeWithSchema preserves schema fieldName and byteRange metadata', async () => {
    const encodedData = '0a044a6f686e107b1a106a6f686e406578616d706c652e636f6d';
    const bytes = parseProtobufInput(encodedData);

    await decoder.loadProtoFiles([sampleProtoFile]);
    const fields = await decoder.decodeWithSchema(bytes, 'test.Person');

    expect(fields).toHaveLength(3);
    expect(fields[0]).toMatchObject({
      fieldName: 'name',
      fieldNumber: 1,
      type: 'string',
      value: 'John',
      byteRange: [0, 6],
    });
    expect(fields[1]).toMatchObject({
      fieldName: 'id',
      fieldNumber: 2,
      type: 'int32',
      value: 123,
      byteRange: [6, 8],
    });
    expect(fields[2]).toMatchObject({
      fieldName: 'email',
      fieldNumber: 3,
      type: 'string',
      value: 'john@example.com',
      byteRange: [8, 26],
    });
  });

  test('decodeProtobufInput decodes a message with and without proto definition', async () => {
    const encodedData = '0a044a6f686e107b1a106a6f686e406578616d706c652e636f6d';

    // Without schema
    const schemalessResult = await decoder.decodeProtobufInput(encodedData);
    expect(schemalessResult.message).toBe('Unknown');
    expect(schemalessResult.fields['1'].value).toBe('John');
    expect(schemalessResult.fields['2'].value).toBe(123);
    expect(schemalessResult.fields['3'].value).toBe('john@example.com');

    // With schema
    await decoder.loadProtoFiles([sampleProtoFile]);
    const schemaResult = await decoder.decodeProtobufInput(
      encodedData,
      'test.Person'
    );
    expect(schemaResult.message).toBe('test.Person');
    expect(schemaResult.fields['name'].value).toBe('John');
    expect(schemaResult.fields['id'].value).toBe(123);
    expect(schemaResult.fields['email'].value).toBe('john@example.com');
  });

  test('handles invalid proto file content', async () => {
    const invalidProto = {
      name: 'invalid.proto',
      content: 'this is not valid proto syntax',
      path: '/invalid.proto',
    };

    await expect(decoder.loadProtoFiles([invalidProto])).rejects.toThrow();
  });

  test('inferProtoSchema and decodedFieldsToCleanJson synthesize valid output', () => {
    const encodedData = '0a044a6f686e107b1a106a6f686e406578616d706c652e636f6d';
    const fields = decoder.decodeWithoutSchema(parseProtobufInput(encodedData));

    const inferred = inferProtoSchema(fields, 'InferredPerson');
    expect(inferred).toContain('syntax = "proto3";');
    expect(inferred).toContain('message InferredPerson');
    expect(inferred).toContain('string field_1 = 1;');
    expect(inferred).toContain('int64 field_2 = 2;');

    const cleanJson = decodedFieldsToCleanJson(fields);
    expect(cleanJson).toEqual({
      field_1: 'John',
      field_2: 123,
      field_3: 'john@example.com',
    });
  });
});

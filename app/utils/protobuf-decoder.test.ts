
import { parseProtobufInput, ProtobufDecoder, ProtobufDecodingError, WireType } from '@/app/utils/protobuf-decoder';
import { expect, describe, test } from '@jest/globals';

describe('parseProtobufInput', () => {
  test('parses hex input correctly', () => {
    const input = '0a0b48656c6c6f20576f726c64';
    const result = parseProtobufInput(input);
    expect(result.length).toBe(13);
    expect(result[0]).toBe(10);
    expect(result[1]).toBe(11);
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
      value: BigInt(150)
    });
    // Check byte range
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
      value: 'testing'
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
      value: BigInt(42)
    });
    expect(result[1]).toMatchObject({
      fieldNumber: 2,
      wireType: WireType.LENGTH_DELIMITED,
      type: 'string',
      value: 'hello'
    });
  });
    
  test('decodes a nested message', () => {
    // Field 1: nested message
    //   Field 1: string with value "something"
    const base64 = 'CgsKCXNvbWV0aGluZw==';
    const buffer = parseProtobufInput(base64);
    
    const result = decoder.decodeWithoutSchema(buffer);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      fieldNumber: 1,
      wireType: WireType.LENGTH_DELIMITED,
      type: 'message'
    });
    
    // Check the nested fields
    const nestedFields = result[0].value;
    expect(nestedFields).toHaveLength(1);
    expect(nestedFields[0]).toMatchObject({
      fieldNumber: 1,
      wireType: WireType.LENGTH_DELIMITED,
      type: 'string',
      value: 'something'
    });
  });
    
  test('decodes a message with repeated string fields', () => {
    // This encodes:
    // message Test {
    //   repeated string tags = 1;
    // }
    // With values: ["one", "two", "three"]
    const hex = '0A 03 6F 6E 65 0A 03 74 77 6F 0A 05 74 68 72 65 65';
    const buffer = parseProtobufInput(hex.replace(/\s/g, ''));
    
    const result = decoder.decodeWithoutSchema(buffer);
    
    expect(result).toHaveLength(3);
    
    // All fields should have same field number but be separate entries
    expect(result[0]).toMatchObject({
      fieldNumber: 1,
      wireType: WireType.LENGTH_DELIMITED,
      type: 'string',
      value: 'one'
    });
    
    expect(result[1]).toMatchObject({
      fieldNumber: 1,
      wireType: WireType.LENGTH_DELIMITED,
      type: 'string',
      value: 'two'
    });
    
    expect(result[2]).toMatchObject({
      fieldNumber: 1,
      wireType: WireType.LENGTH_DELIMITED,
      type: 'string',
      value: 'three'
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
      value: BigInt('4294967296') // 2^32
    });
  });
    
  test('decodes a message with multiple repeated string fields', () => {
      // This encodes a message with multiple repeated string fields
      const base64 = 'GgR0aGlzGgJpcxoEanVzdBoHYW5vdGhlchoFMTIzNDUaBXRlc3Qh';
      const buffer = parseProtobufInput(base64);

      const result = decoder.decodeWithoutSchema(buffer);

      // Should decode to 6 string fields with field number 3
      expect(result).toHaveLength(6);

      // Verify each field individually
      expect(result[0]).toMatchObject({
          fieldNumber: 3,
          wireType: WireType.LENGTH_DELIMITED,
          type: 'string',
          value: 'this'
      });

      expect(result[1]).toMatchObject({
          fieldNumber: 3,
          wireType: WireType.LENGTH_DELIMITED,
          type: 'string',
          value: 'is'
      });

      expect(result[2]).toMatchObject({
          fieldNumber: 3,
          wireType: WireType.LENGTH_DELIMITED,
          type: 'string',
          value: 'just'
      });

      expect(result[3]).toMatchObject({
          fieldNumber: 3,
          wireType: WireType.LENGTH_DELIMITED,
          type: 'string',
          value: 'another'
      });

      expect(result[4]).toMatchObject({
          fieldNumber: 3,
          wireType: WireType.LENGTH_DELIMITED,
          type: 'string',
          value: '12345'
      });

      expect(result[5]).toMatchObject({
          fieldNumber: 3,
          wireType: WireType.LENGTH_DELIMITED,
          type: 'string',
          value: 'test!'
      });

      // Verify byte ranges are in ascending order
      for (let i = 0; i < result.length - 1; i++) {
          expect(result[i].byteRange![1]).toBe(result[i+1].byteRange![0]);
      }

      // Verify the entire buffer is consumed
      expect(result[0].byteRange![0]).toBe(0);
      expect(result[result.length-1].byteRange![1]).toBe(buffer.length);
  });

  test('decodes a fixed32 field correctly', () => {
      // Field 3: fixed32 with value 42 (0x0000002A in little-endian)
      const hex = '1D 2A 00 00 00';
      const buffer = parseProtobufInput(hex.replace(/\s/g, ''));
      
      const result = decoder.decodeWithoutSchema(buffer);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
          fieldNumber: 3,
          wireType: WireType.FIXED32,
          type: 'fixed32',
          value: 42 // 0x0000002A in little-endian
      });
  });

  test('decodes a fixed64 field correctly', () => {
      // Field 4: fixed64 with value 42 (0x000000000000002A in little-endian)
      const hex = '21 2A 00 00 00 00 00 00 00';
      const buffer = parseProtobufInput(hex.replace(/\s/g, ''));
      
      const result = decoder.decodeWithoutSchema(buffer);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
          fieldNumber: 4,
          wireType: WireType.FIXED64,
          type: 'fixed64',
          value: BigInt(42) // 0x000000000000002A in little-endian
      });
  });

  test('decodes a large fixed32 value correctly', () => {
      // Field 3: fixed32 with value 0xFFFFFFFF (max uint32)
      const hex = '1D FF FF FF FF';
      const buffer = parseProtobufInput(hex.replace(/\s/g, ''));
      
      const result = decoder.decodeWithoutSchema(buffer);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
          fieldNumber: 3,
          wireType: WireType.FIXED32,
          type: 'fixed32',
          value: 4294967295 // 0xFFFFFFFF (max uint32)
      });
      });

      test('decodes a large fixed64 value correctly', () => {
      // Field 4: fixed64 with value (2^53-1) - the largest integer precisely representable in JavaScript
      const hex = '21 FF FF FF FF FF FF 1F 00';
      const buffer = parseProtobufInput(hex.replace(/\s/g, ''));
      
      const result = decoder.decodeWithoutSchema(buffer);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
          fieldNumber: 4,
          wireType: WireType.FIXED64,
          type: 'fixed64',
          value: BigInt('9007199254740991') // 2^53-1
      });
  });

  test('decodes a message with mixed field types including fixed', () => {
      // Field 1: varint with value 42
      // Field 2: fixed32 with value 100
      // Field 3: fixed64 with value 200
      // Field 4: string with value "test"
      const hex = '08 2A 15 64 00 00 00 19 C8 00 00 00 00 00 00 00 22 04 74 65 73 74';
      const buffer = parseProtobufInput(hex.replace(/\s/g, ''));
      
      const result = decoder.decodeWithoutSchema(buffer);
      
      expect(result).toHaveLength(4);
      expect(result[0]).toMatchObject({
          fieldNumber: 1,
          wireType: WireType.VARINT,
          type: 'varint',
          value: BigInt(42)
      });
      expect(result[1]).toMatchObject({
          fieldNumber: 2,
          wireType: WireType.FIXED32,
          type: 'fixed32',
          value: 100
      });
      expect(result[2]).toMatchObject({
          fieldNumber: 3,
          wireType: WireType.FIXED64,
          type: 'fixed64',
          value: BigInt(200)
      });
      expect(result[3]).toMatchObject({
          fieldNumber: 4,
          wireType: WireType.LENGTH_DELIMITED,
          type: 'string',
          value: 'test'
      });
    });

    test('decodes a nested message with fixed fields correctly', () => {
        // Field 1: nested message
        //   Field 1: fixed32 with value 42
        //   Field 2: fixed64 with value 84
        const hex = '0a 0e 0d 2a 00 00 00 11 54 00 00 00 00 00 00 00';
        const buffer = parseProtobufInput(hex);
        
        const result = decoder.decodeWithoutSchema(buffer);
        
        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            fieldNumber: 1,
            wireType: WireType.LENGTH_DELIMITED,
            type: 'message'
        });
        
        // Check the nested fields
        const nestedFields = result[0].value;
        expect(nestedFields).toHaveLength(2);
        expect(nestedFields[0]).toMatchObject({
            fieldNumber: 1,
            wireType: WireType.FIXED32,
            type: 'fixed32',
            value: 42
        });
        expect(nestedFields[1]).toMatchObject({
            fieldNumber: 2,
            wireType: WireType.FIXED64,
            type: 'fixed64',
            value: BigInt(84)
        });
    });

    test('throws error for START_GROUP and END_GROUP wire types', () => {
      // Field 3: START_GROUP (wireType 3)
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
    })
});

// TODO: Do something about the commented tests below. Not sure if these were
// important or not.

// describe('ProtobufDecoder', () => {
//   let decoder: ProtobufDecoder;
  
//   const sampleProtoFile = {
//     name: 'test.proto',
//     content: `
//       syntax = "proto3";
//       package test;
      
//       message Person {
//         string name = 1;
//         int32 id = 2;
//         string email = 3;
//       }
      
//       message Address {
//         string street = 1;
//         string city = 2;
//         string country = 3;
//       }
//     `,
//     path: '/test.proto'
//   };

//   beforeEach(() => {
//     decoder = new ProtobufDecoder();
//   });

//   test('loadProtoFiles loads proto definitions correctly', async () => {
//     await decoder.loadProtoFiles([sampleProtoFile]);
//     const types = decoder.getAvailableMessageTypes();
//     expect(types).toContain('test.Person');
//     expect(types).toContain('test.Address');
//   });

//   test('decodeProtobufInput decodes a message correctly with proto definition', async () => {
//     // This is a protobuf encoding of a Person with name="John", id=123, email="john@example.com"
//     const encodedData = '0a044a6f686e107b1a106a6f686e406578616d706c652e636f6d'; 
    
//     await decoder.loadProtoFiles([sampleProtoFile]);
//     const result = await decoder.decodeProtobufInput(encodedData, 'test.Person');
    
//     expect(result.message).toBe('test.Person');
//     expect(result.fields['name'].value).toBe('John');
//     expect(result.fields['id'].value).toBe(123);
//     expect(result.fields['email'].value).toBe('john@example.com');
//   });

//   test('decodeProtobufInput works without proto definition', async () => {
//     // Same encoded data as above
//     const encodedData = '0a044a6f686e107b1a106a6f686e406578616d706c652e636f6d';
    
//     const result = await decoder.decodeProtobufInput(encodedData);
    
//     expect(result.message).toBe('Unknown');
//     expect(result.fields).toBeDefined();
//     // The fields will be numbered rather than named
//     expect(result.fields['1'].value).toBe('John');
//     expect(result.fields['2'].value).toBe(123);
//     expect(result.fields['3'].value).toBe('john@example.com');
//   });

//   test('handles invalid proto file content', async () => {
//     const invalidProto = {
//       name: 'invalid.proto',
//       content: 'this is not valid proto syntax',
//       path: '/invalid.proto'
//     };
    
//     await expect(decoder.loadProtoFiles([invalidProto])).rejects.toThrow();
//   });
// });
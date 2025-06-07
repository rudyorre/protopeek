import { decodeProtobufRawMessage, WireType, RawDecodedField, ProtobufDecodingError } from './buffer-reader';
import { parseProtobufInput } from './protobuf-decoder';

describe('Protocol Buffer Decoder', () => {
  describe('decodeProtobufRawMessage', () => {
    test('decodes a simple message with varint field', () => {
      // Field 1: varint with value 150
      const hex = '08 96 01';
      const buffer = parseProtobufInput(hex.replace(/\s/g, ''));
      
      const result = decodeProtobufRawMessage(buffer);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        fieldNumber: 1,
        wireType: WireType.VARINT,
        type: 'varint',
        value: BigInt(150)
      });
      // Check byte range
      expect(result[0].byteRange[0]).toBeLessThan(result[0].byteRange[1]);
    });
    
    test('decodes a simple message with string field', () => {
      // Field 2: string with value "testing"
      const hex = '12 07 74 65 73 74 69 6e 67';
      const buffer = parseProtobufInput(hex.replace(/\s/g, ''));
      
      const result = decodeProtobufRawMessage(buffer);
      
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
      
      const result = decodeProtobufRawMessage(buffer);
      
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
      
      const result = decodeProtobufRawMessage(buffer);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        fieldNumber: 1,
        wireType: WireType.LENGTH_DELIMITED,
        type: 'message'
      });
      
      // Check the nested fields
      const nestedFields = result[0].value as RawDecodedField[];
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
      
      const result = decodeProtobufRawMessage(buffer);
      
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
      
      const result = decodeProtobufRawMessage(buffer);
      
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

        const result = decodeProtobufRawMessage(buffer);

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
            expect(result[i].byteRange[1]).toBe(result[i+1].byteRange[0]);
        }

        // Verify the entire buffer is consumed
        expect(result[0].byteRange[0]).toBe(0);
        expect(result[result.length-1].byteRange[1]).toBe(buffer.length);
    });

    test('decodes a fixed32 field correctly', () => {
        // Field 3: fixed32 with value 42 (0x0000002A in little-endian)
        const hex = '1D 2A 00 00 00';
        const buffer = parseProtobufInput(hex.replace(/\s/g, ''));
        
        const result = decodeProtobufRawMessage(buffer);
        
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
        
        const result = decodeProtobufRawMessage(buffer);
        
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
        
        const result = decodeProtobufRawMessage(buffer);
        
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
        
        const result = decodeProtobufRawMessage(buffer);
        
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
        
        const result = decodeProtobufRawMessage(buffer);
        
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
        
        const result = decodeProtobufRawMessage(buffer);
        
        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            fieldNumber: 1,
            wireType: WireType.LENGTH_DELIMITED,
            type: 'message'
        });
        
        // Check the nested fields
        const nestedFields = result[0].value as RawDecodedField[];
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
  });

    test('throws error for START_GROUP and END_GROUP wire types', () => {
        // Field 3: START_GROUP (wireType 3)
        const startGroupHex = '1b'; 
        const startGroupBuffer = parseProtobufInput(startGroupHex);
        
        expect(() => {
            decodeProtobufRawMessage(startGroupBuffer);
        }).toThrow(ProtobufDecodingError);
        
        try {
            decodeProtobufRawMessage(startGroupBuffer);
        } catch (e: unknown) {
            expect(e).toBeInstanceOf(ProtobufDecodingError);
            if (e instanceof ProtobufDecodingError) {
                expect(e.errorType).toBe('UNSUPPORTED_WIRE_TYPE');
                expect(e.message).toMatch(/Wire type 3 \(START_GROUP\)/);
            }
        }
    });
});
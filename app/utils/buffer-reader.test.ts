import { decodeWithoutSchema, WireType, DecodedField } from './buffer-reader';
import { parseProtobufInput } from './protobuf-decoder';

describe('Protocol Buffer Decoder', () => {
  describe('decodeWithoutSchema', () => {
    test('decodes a simple message with varint field', () => {
      // Field 1: varint with value 150
      const hex = '08 96 01';
      const buffer = parseProtobufInput(hex.replace(/\s/g, ''));
      
      const result = decodeWithoutSchema(buffer).fields;
      
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
      
      const result = decodeWithoutSchema(buffer).fields;
      
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
      
      const result = decodeWithoutSchema(buffer).fields;
      
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
      
      const result = decodeWithoutSchema(buffer).fields;
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        fieldNumber: 1,
        wireType: WireType.LENGTH_DELIMITED,
        type: 'message'
      });
      
      // Check the nested fields
      const nestedFields = result[0].value.fields;
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
      
      const result = decodeWithoutSchema(buffer).fields;
      
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
      
      const result = decodeWithoutSchema(buffer).fields;
      
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        fieldNumber: 1,
        wireType: WireType.VARINT,
        type: 'varint',
        value: BigInt('4294967296') // 2^32
      });
    });
    
    // TODO: This should break once we implement the FIXE64 case
    test('decodes a complex message with nested fields', () => {
      // Message with repeated fields from your previous example
      const base64 = 'ChxNZXNzYWdlIHdpdGggcmVwZWF0ZWQgZmllbGRzEkEKB015IFRhZ3MSCEpvaG4gRG9lGglpbXBvcnRhbnQaBHdvcmsaCHBlcnNvbmFsGgZ1cmdlbnQaCWZvbGxvdy11cA==';
      const buffer = parseProtobufInput(base64);
      
      const result = decodeWithoutSchema(buffer).fields;
      console.log(JSON.stringify(result, null, 2));
      // First field should be a string
      expect(result[0].type).toBe('string');
      expect(result[0].value).toBe('Message with repeated fields');
      
      // Second field should be a nested message
      expect(result[1].type).toBe('message');
      
      // Inside the nested message, we should find various fields
      const nestedMsg = result[1].value.fields;
      
      // Find a field with "My Tags" and "John Doe" strings
      const hasMyTags = nestedMsg.some((f: DecodedField) => f.type === 'string' && f.value === 'My Tags');
      const hasJohnDoe = nestedMsg.some((f: DecodedField) => f.type === 'string' && f.value === 'John Doe');
      const hasImportant = nestedMsg.some((f: DecodedField) => f.type === 'string' && f.value === 'important');
      
      expect(hasMyTags).toBe(true);
      expect(hasJohnDoe).toBe(true);
      expect(hasImportant).toBe(true);
    });
  });
});
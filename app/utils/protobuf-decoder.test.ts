
import { parseProtobufInput, ProtobufDecoder } from '@/app/utils/protobuf-decoder';
import { expect, describe, test, jest, beforeEach } from '@jest/globals';

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
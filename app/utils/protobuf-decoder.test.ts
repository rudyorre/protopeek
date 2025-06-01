
import { parseProtobufInput } from '@/app/utils/protobuf-decoder';
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
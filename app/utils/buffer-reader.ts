export class BufferReader {
    private buffer: Uint8Array;
    private offset: number = 0;
    private savedOffset: number = 0;

    constructor(buffer: Uint8Array) {
        this.buffer = buffer;
    }

    /**
     * Reads a variable-length integer (varint) from the buffer.
     * 
     * Varints are a serialization format used by Protocol Buffers for efficiently encoding
     * integers. They use fewer bytes for smaller values. In this encoding:
     * - Each byte except the last has the MSB (most significant bit) set to 1
     * - The last byte has the MSB set to 0
     * - The lower 7 bits of each byte contain the actual data
     * 
     * @throws {Error} If the varint is too long (more than 64 bits). This check (shift > 63)
     * prevents potential overflow as Protocol Buffers spec limits integers to 64 bits.
     * @see https://developers.google.com/protocol-buffers/docs/encoding#varints
     * 
     * @returns An object containing:
     *   - value: The decoded bigint value
     *   - length: The number of bytes read
     */
    readVarint(): { value: bigint; length: number } {
        let result = BigInt(0);
        let shift = 0;
        let byte: number;
        let bytesRead = 0;

        do {
            if (shift >= 64) {
                throw new Error("Varint is too long");
            }

            // Read the next byte
            byte = this.buffer[this.offset++];
            bytesRead++;

            // Add the lower 7 bits to the result
            result |= BigInt(byte & 0x7f) << BigInt(shift);
            shift += 7;
        } while (byte & 0x80) // continue reading bytes until the MSB is not set
        
        return { value: result, length: bytesRead };
    }

    /**
     * Reads a specified number of bytes from the buffer.
     * 
     * This method extracts a portion of the buffer starting from the current offset position 
     * and returns it as a new Uint8Array. After reading, the offset is advanced by the 
     * number of bytes read.
     * 
     * @param length The number of bytes to read from the buffer
     * @throws {Error} If there aren't enough bytes remaining in the buffer to satisfy the request
     * @returns A new Uint8Array containing the requested bytes
     */
    readBytes(length: number): Uint8Array {
        if (length > this.leftBytes()) {
            throw new Error(`Not enough bytes left. Requested: ${length}, left: ${this.leftBytes()}`);
        }

        const result = this.buffer.slice(this.offset, this.offset + length);
        this.offset += length;
        return result;
    }

    /**
     * Returns the number of unread bytes remaining in the buffer.
     * 
     * This method calculates and returns how many bytes are left to be read from the current
     * offset position to the end of the buffer.
     * 
     * @returns The number of unread bytes in the buffer
     */
    leftBytes(): number {
        return this.buffer.length - this.offset;
    }

    /**
     * Saves the current offset position as a checkpoint.
     * 
     * This method stores the current reading position in the buffer, allowing
     * you to return to this position later using `resetToCheckpoint()`.
     */
    checkpoint(): void {
        this.savedOffset = this.offset;
    }

    /**
     * Resets the buffer's reading position to the last saved checkpoint.
     * 
     * This method restores the reading position to where it was when the last
     * `checkpoint()` was called, allowing you to re-read data from that position.
     */
    resetToCheckpoint(): void {
        this.offset = this.savedOffset;
    }
}

// TODO: Move everything below this line to `protobuf-decoder.ts` once we have
// 100% featureset coverage.

export enum WireType {
    VARINT = 0,
    FIXED64 = 1,
    LENGTH_DELIMITED = 2,
    START_GROUP = 3, // Deprecated
    END_GROUP = 4, // Deprecated
    FIXED32 = 5,
};

export interface DecodedField {
    fieldNumber: number;
    wireType: WireType;
    value: any;
    type: string;
    byteRange: [number, number];
}

export function decodeWithoutSchema(
    buffer: Uint8Array
): { fields: DecodedField[], leftoverBytes: number } {
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

            let value: any;
            let type: string;

            // Process based on WireType
            switch (wireType) {
                case WireType.VARINT:
                    const varint = reader.readVarint();
                    value = varint.value;
                    type = "varint";
                    break;
                case WireType.LENGTH_DELIMITED:
                    const length = Number(reader.readVarint().value);
                    const data = reader.readBytes(length);
                    
                    // First try to decode as a nested message
                    try {
                        const nestedFields = decodeWithoutSchema(data);
                        // Only consider it a valid nested message if we have fields
                        // AND if we consumed all the bytes (or close to it)
                        if (nestedFields.fields.length > 0 && nestedFields.leftoverBytes == 0) {
                            value = nestedFields;
                            type = "message";
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
                            type = "string";
                            break; // Exit the case early if successful
                        }
                    } catch {
                        // Failed to decode as string, continue to bytes
                    }
                    
                    // Fallback to bytes representation
                    value = Array.from(data)
                        .map(b => b.toString(16).padStart(2, '0'))
                        .join(' ');
                    type = "bytes";
                    break;
                default:
                    throw new Error(`Unknown wire type: ${wireType}`);
            }

            const endPos = reader.leftBytes();
            const byteRange: [number, number] = [buffer.length - startPos, buffer.length - endPos];

            fields.push({
                fieldNumber,
                wireType,
                value,
                type,
                byteRange,
            });
        } catch (error) {
            // If we fail to parse, reset and skip this field
            reader.resetToCheckpoint();
            break;
        }
    }

    return { fields, leftoverBytes: reader.leftBytes() };
}

function isPrintableString(str: string): boolean {
  if (str.length === 0 || str.length > 1000) {
    return false;
  }
  // Simple regex for ASCII printable chars + common Unicode + whitespace
  return /^[\x20-\x7E\s\u00A0-\u024F\u1E00-\u1EFF]*$/.test(str) && str.trim().length > 0;
}
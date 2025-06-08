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
        throw new Error('Varint is too long');
      }

      // Read the next byte
      byte = this.buffer[this.offset++];
      bytesRead++;

      // Add the lower 7 bits to the result
      result |= BigInt(byte & 0x7f) << BigInt(shift);
      shift += 7;
    } while (byte & 0x80); // continue reading bytes until the MSB is not set

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
      throw new Error(
        `Not enough bytes left. Requested: ${length}, left: ${this.leftBytes()}`
      );
    }

    const result = this.buffer.slice(this.offset, this.offset + length);
    this.offset += length;
    return result;
  }

  /**
   * Reads a fixed 32-bit value from the buffer.
   *
   * This can represent various 32-bit types like int32, uint32, float, etc.
   * depending on how the data is interpreted.
   *
   * @returns The raw bytes as a Uint8Array
   */
  readFixed32(): Uint8Array {
    return this.readBytes(4);
  }

  /**
   * Reads a fixed 64-bit value from the buffer.
   *
   * This can represent various 64-bit types like int64, uint64, double, etc.
   * depending on how the data is interpreted.
   *
   * @returns The raw bytes as a Uint8Array
   */
  readFixed64(): Uint8Array {
    return this.readBytes(8);
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

import protobuf from "protobufjs"

export interface DecodedField {
  type: string
  value: any
}

export interface DecodedMessage {
  message: string
  fields: Record<string, DecodedField>
}

export class ProtobufDecoder {
  private root: protobuf.Root | null = null
  private messageTypes: Map<string, protobuf.Type> = new Map()

  async loadProtoFiles(protoFiles: Array<{ name: string; content: string; path: string }>) {
    try {
      this.root = new protobuf.Root()

      // Parse each proto file content directly
      for (const file of protoFiles) {
        console.log(`Loading proto file: ${file.path}`)

        try {
          // Parse the proto content directly instead of trying to load from file
          const parsed = protobuf.parse(file.content, this.root, {
            keepCase: true,
            alternateCommentMode: true,
          })

          if (parsed.package) {
            console.log(`Parsed package: ${parsed.package}`)
          }

          console.log(`Successfully parsed ${file.path}`)
        } catch (parseError) {
          console.error(`Error parsing ${file.path}:`, parseError)
          throw new Error(`Failed to parse ${file.path}: ${parseError.message}`)
        }
      }

      // Resolve all types after parsing all files
      this.root.resolveAll()

      // Collect all message types
      this.collectMessageTypes(this.root)

      console.log("Available message types:", Array.from(this.messageTypes.keys()))

      if (this.messageTypes.size === 0) {
        throw new Error("No message types found in the provided proto files")
      }

      return true
    } catch (error) {
      console.error("Error loading proto files:", error)
      throw new Error(`Failed to load proto files: ${error.message}`)
    }
  }

  private collectMessageTypes(namespace: protobuf.Namespace) {
    for (const [name, nested] of Object.entries(namespace.nested || {})) {
      if (nested instanceof protobuf.Type) {
        // Store both full name and simple name
        const fullName = nested.fullName.startsWith(".") ? nested.fullName.substring(1) : nested.fullName
        this.messageTypes.set(fullName, nested)
        this.messageTypes.set(name, nested)
        console.log(`Found message type: ${name} (${fullName})`)
      } else if (nested instanceof protobuf.Namespace) {
        this.collectMessageTypes(nested)
      }
    }
  }

  async decodeWithSchema(bytes: Uint8Array, messageTypeName?: string): Promise<DecodedMessage> {
    if (!this.root) {
      throw new Error("No proto files loaded")
    }

    // If no message type specified, try to find the first available one
    if (!messageTypeName && this.messageTypes.size > 0) {
      messageTypeName = Array.from(this.messageTypes.keys())[0]
    }

    if (!messageTypeName) {
      throw new Error("No message type available")
    }

    const messageType = this.messageTypes.get(messageTypeName)
    if (!messageType) {
      const availableTypes = Array.from(this.messageTypes.keys()).join(", ")
      throw new Error(`Message type '${messageTypeName}' not found. Available types: ${availableTypes}`)
    }

    try {
      console.log(`Decoding ${bytes.length} bytes with message type: ${messageTypeName}`)

      const decoded = messageType.decode(bytes)
      const object = messageType.toObject(decoded, {
        longs: String,
        enums: String,
        bytes: String,
        defaults: false, // Don't include default values
        arrays: true,
        objects: true,
      })

      console.log("Decoded object:", object)

      return {
        message: messageTypeName,
        fields: this.convertToDecodedFields(object, messageType),
      }
    } catch (error) {
      console.error("Error decoding with schema:", error)
      throw new Error(`Failed to decode protobuf data with ${messageTypeName}: ${error.message}`)
    }
  }

  async decodeWithoutSchema(bytes: Uint8Array): Promise<DecodedMessage> {
    try {
      console.log(`Decoding ${bytes.length} bytes without schema`)

      // Create a reader for the bytes
      const reader = protobuf.Reader.create(bytes)
      const fields: Record<string, DecodedField> = {}

      while (reader.pos < reader.len) {
        const tag = reader.uint32()
        const fieldNumber = tag >>> 3
        const wireType = tag & 7

        console.log(`Field ${fieldNumber}, wire type ${wireType}, position ${reader.pos}`)

        let value: any
        let type: string

        switch (wireType) {
          case 0: // Varint
            value = reader.uint64()
            type = "varint"
            // Convert to number if it fits in safe integer range
            if (typeof value === "object" && value.toNumber) {
              const num = value.toNumber()
              if (Number.isSafeInteger(num)) {
                value = num
              } else {
                value = value.toString()
              }
            }
            break
          case 1: // Fixed64
            value = reader.fixed64()
            type = "fixed64"
            if (typeof value === "object" && value.toString) {
              value = value.toString()
            }
            break
          case 2: // Length-delimited
            const length = reader.uint32()
            const data = reader.buf.slice(reader.pos, reader.pos + length)
            reader.pos += length

            // Try to decode as string first
            try {
              const str = new TextDecoder("utf-8", { fatal: true }).decode(data)
              if (this.isPrintableString(str)) {
                value = str
                type = "string"
              } else {
                throw new Error("Not a valid UTF-8 string")
              }
            } catch {
              // Try to decode as nested message
              try {
                const nestedDecoded = await this.decodeWithoutSchema(data)
                if (Object.keys(nestedDecoded.fields).length > 0) {
                  value = nestedDecoded.fields
                  type = "message"
                } else {
                  throw new Error("Empty nested message")
                }
              } catch {
                // Fall back to bytes
                value = Array.from(data)
                  .map((b) => b.toString(16).padStart(2, "0"))
                  .join(" ")
                type = "bytes"
              }
            }
            break
          case 5: // Fixed32
            value = reader.fixed32()
            type = "fixed32"
            break
          default:
            throw new Error(`Unknown wire type: ${wireType}`)
        }

        fields[fieldNumber.toString()] = { type, value }
      }

      return {
        message: "Unknown",
        fields,
      }
    } catch (error) {
      console.error("Error decoding without schema:", error)
      throw new Error(`Failed to decode protobuf data: ${error.message}`)
    }
  }

  private isPrintableString(str: string): boolean {
    // Check if string contains only printable characters and has reasonable length
    if (str.length === 0 || str.length > 1000) return false

    // Allow printable ASCII, common Unicode characters, and whitespace
    return /^[\x20-\x7E\s\u00A0-\u024F\u1E00-\u1EFF]*$/.test(str) && str.trim().length > 0
  }

  private convertToDecodedFields(obj: any, messageType?: protobuf.Type): Record<string, DecodedField> {
    const fields: Record<string, DecodedField> = {}

    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) continue

      const field = messageType?.fields[key]
      let type = field?.type || "unknown"
      let convertedValue = value

      if (Array.isArray(value)) {
        if (value.length === 0) continue

        const firstItem = value[0]
        if (typeof firstItem === "object" && firstItem !== null) {
          type = "repeated_message"
          convertedValue = value.map((item) => ({
            type: "message",
            value: this.convertToDecodedFields(item),
          }))
        } else {
          type = `repeated_${this.getScalarType(firstItem)}`
          convertedValue = value
        }
      } else if (typeof value === "object" && value !== null) {
        type = "message"
        convertedValue = this.convertToDecodedFields(value)
      } else {
        type = field?.type || this.getScalarType(value)
        convertedValue = value
      }

      fields[key] = { type, value: convertedValue }
    }

    return fields
  }

  private getScalarType(value: any): string {
    if (typeof value === "string") return "string"
    if (typeof value === "number") return Number.isInteger(value) ? "int32" : "double"
    if (typeof value === "boolean") return "bool"
    if (value instanceof Date) return "timestamp"
    return "unknown"
  }

  getAvailableMessageTypes(): string[] {
    return Array.from(this.messageTypes.keys())
  }
}

export function parseProtobufInput(input: string): Uint8Array {
  // Remove whitespace
  const cleaned = input.replace(/\s+/g, "")

  if (!cleaned) {
    throw new Error("Empty input")
  }

  // Try to parse as hex
  if (/^[0-9a-fA-F]+$/.test(cleaned)) {
    // Ensure even length
    const hex = cleaned.length % 2 === 0 ? cleaned : "0" + cleaned
    const bytes = new Uint8Array(hex.length / 2)
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = Number.parseInt(hex.substr(i, 2), 16)
    }
    console.log(`Parsed as hex: ${bytes.length} bytes`)
    return bytes
  }

  // Try to parse as base64
  try {
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
    if (base64Regex.test(cleaned)) {
      const binaryString = atob(cleaned)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      console.log(`Parsed as base64: ${bytes.length} bytes`)
      return bytes
    }
  } catch (error) {
    // Not valid base64, continue to next format
  }

  // Try to parse as comma-separated decimal bytes
  if (/^[\d,\s]+$/.test(cleaned)) {
    const numbers = cleaned.split(",").map((n) => Number.parseInt(n.trim(), 10))
    if (numbers.every((n) => !isNaN(n) && n >= 0 && n <= 255)) {
      console.log(`Parsed as comma-separated bytes: ${numbers.length} bytes`)
      return new Uint8Array(numbers)
    }
  }

  throw new Error("Invalid protobuf input format. Expected hex, base64, or comma-separated bytes.")
}

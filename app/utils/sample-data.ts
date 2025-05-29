// Sample data for different protobuf structures

export function getSampleData(type: "simple" | "repeated" | "complex", hasProtoFile: boolean) {
  switch (type) {
    case "simple":
      return hasProtoFile ? simpleWithProto : simpleWithoutProto
    case "repeated":
      return hasProtoFile ? repeatedWithProto : repeatedWithoutProto
    case "complex":
    default:
      return hasProtoFile ? complexWithProto : complexWithoutProto
  }
}

// Simple message with just a few fields
const simpleWithProto = {
  message: "Person",
  fields: {
    name: {
      type: "string",
      value: "John Doe",
    },
    id: {
      type: "int32",
      value: 1234,
    },
    email: {
      type: "string",
      value: "john@example.com",
    },
    active: {
      type: "bool",
      value: true,
    },
  },
}

const simpleWithoutProto = {
  message: "Unknown",
  fields: {
    "1": {
      type: "string",
      value: "John Doe",
    },
    "2": {
      type: "int32",
      value: 1234,
    },
    "3": {
      type: "string",
      value: "john@example.com",
    },
    "4": {
      type: "bool",
      value: true,
    },
  },
}

// Message with repeated fields
const repeatedWithProto = {
  message: "TagList",
  fields: {
    name: {
      type: "string",
      value: "My Tags",
    },
    tags: {
      type: "repeated_string",
      value: ["important", "work", "personal", "urgent", "follow-up"],
    },
    counts: {
      type: "repeated_message",
      value: [
        {
          type: "message",
          value: {
            tag: {
              type: "string",
              value: "important",
            },
            count: {
              type: "int32",
              value: 5,
            },
          },
        },
        {
          type: "message",
          value: {
            tag: {
              type: "string",
              value: "work",
            },
            count: {
              type: "int32",
              value: 12,
            },
          },
        },
        {
          type: "message",
          value: {
            tag: {
              type: "string",
              value: "personal",
            },
            count: {
              type: "int32",
              value: 8,
            },
          },
        },
      ],
    },
    created: {
      type: "timestamp",
      value: "2023-04-15T12:00:00.000Z",
    },
  },
}

const repeatedWithoutProto = {
  message: "Unknown",
  fields: {
    "1": {
      type: "string",
      value: "My Tags",
    },
    "2": {
      type: "repeated_string",
      value: ["important", "work", "personal", "urgent", "follow-up"],
    },
    "3": {
      type: "repeated_message",
      value: [
        {
          type: "message",
          value: {
            "1": {
              type: "string",
              value: "important",
            },
            "2": {
              type: "int32",
              value: 5,
            },
          },
        },
        {
          type: "message",
          value: {
            "1": {
              type: "string",
              value: "work",
            },
            "2": {
              type: "int32",
              value: 12,
            },
          },
        },
        {
          type: "message",
          value: {
            "1": {
              type: "string",
              value: "personal",
            },
            "2": {
              type: "int32",
              value: 8,
            },
          },
        },
      ],
    },
    "4": {
      type: "timestamp",
      value: "2023-04-15T12:00:00.000Z",
    },
  },
}

// Complex message with nested structures (existing data)
const complexWithProto = {
  message: "AddressBook",
  fields: {
    people: {
      type: "repeated_message",
      value: [
        {
          type: "message",
          value: {
            name: {
              type: "string",
              value: "John Doe",
            },
            id: {
              type: "int32",
              value: 1234,
            },
            email: {
              type: "string",
              value: "john@example.com",
            },
            phones: {
              type: "repeated_message",
              value: [
                {
                  type: "message",
                  value: {
                    number: {
                      type: "string",
                      value: "555-4321",
                    },
                    type: {
                      type: "enum",
                      value: "HOME",
                    },
                  },
                },
                {
                  type: "message",
                  value: {
                    number: {
                      type: "string",
                      value: "555-1234",
                    },
                    type: {
                      type: "enum",
                      value: "MOBILE",
                    },
                  },
                },
              ],
            },
            lastUpdated: {
              type: "timestamp",
              value: "2023-04-12T15:30:45.123Z",
            },
            addresses: {
              type: "repeated_message",
              value: [
                {
                  type: "message",
                  value: {
                    street: {
                      type: "string",
                      value: "123 Main St",
                    },
                    city: {
                      type: "string",
                      value: "Anytown",
                    },
                    state: {
                      type: "string",
                      value: "CA",
                    },
                    zip: {
                      type: "string",
                      value: "94043",
                    },
                    type: {
                      type: "enum",
                      value: "HOME",
                    },
                  },
                },
              ],
            },
          },
        },
        {
          type: "message",
          value: {
            name: {
              type: "string",
              value: "Jane Smith",
            },
            id: {
              type: "int32",
              value: 5678,
            },
            email: {
              type: "string",
              value: "jane@example.com",
            },
            phones: {
              type: "repeated_message",
              value: [
                {
                  type: "message",
                  value: {
                    number: {
                      type: "string",
                      value: "555-8765",
                    },
                    type: {
                      type: "enum",
                      value: "WORK",
                    },
                  },
                },
              ],
            },
            lastUpdated: {
              type: "timestamp",
              value: "2023-04-10T09:15:30.456Z",
            },
            addresses: {
              type: "repeated_message",
              value: [
                {
                  type: "message",
                  value: {
                    street: {
                      type: "string",
                      value: "456 Oak Ave",
                    },
                    city: {
                      type: "string",
                      value: "Somewhere",
                    },
                    state: {
                      type: "string",
                      value: "NY",
                    },
                    zip: {
                      type: "string",
                      value: "10001",
                    },
                    type: {
                      type: "enum",
                      value: "WORK",
                    },
                  },
                },
                {
                  type: "message",
                  value: {
                    street: {
                      type: "string",
                      value: "789 Pine St",
                    },
                    city: {
                      type: "string",
                      value: "Elsewhere",
                    },
                    state: {
                      type: "string",
                      value: "WA",
                    },
                    zip: {
                      type: "string",
                      value: "98001",
                    },
                    type: {
                      type: "enum",
                      value: "HOME",
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    },
    lastUpdated: {
      type: "timestamp",
      value: "2023-04-15T12:00:00.000Z",
    },
    version: {
      type: "int32",
      value: 42,
    },
    settings: {
      type: "message",
      value: {
        readOnly: {
          type: "bool",
          value: false,
        },
        encoding: {
          type: "string",
          value: "UTF-8",
        },
        compression: {
          type: "enum",
          value: "GZIP",
        },
        metadata: {
          type: "message",
          value: {
            created: {
              type: "timestamp",
              value: "2023-01-01T00:00:00.000Z",
            },
            modified: {
              type: "timestamp",
              value: "2023-04-15T12:00:00.000Z",
            },
            tags: {
              type: "repeated_string",
              value: ["personal", "contacts", "important"],
            },
          },
        },
      },
    },
  },
}

const complexWithoutProto = {
  message: "Unknown",
  fields: {
    "1": {
      type: "repeated_message",
      value: [
        {
          type: "message",
          value: {
            "1": {
              type: "string",
              value: "John Doe",
            },
            "2": {
              type: "int32",
              value: 1234,
            },
            "3": {
              type: "string",
              value: "john@example.com",
            },
            "4": {
              type: "repeated_message",
              value: [
                {
                  type: "message",
                  value: {
                    "1": {
                      type: "string",
                      value: "555-4321",
                    },
                    "2": {
                      type: "enum",
                      value: "1", // HOME
                    },
                  },
                },
                {
                  type: "message",
                  value: {
                    "1": {
                      type: "string",
                      value: "555-1234",
                    },
                    "2": {
                      type: "enum",
                      value: "0", // MOBILE
                    },
                  },
                },
              ],
            },
            "5": {
              type: "timestamp",
              value: "2023-04-12T15:30:45.123Z",
            },
            "6": {
              type: "repeated_message",
              value: [
                {
                  type: "message",
                  value: {
                    "1": {
                      type: "string",
                      value: "123 Main St",
                    },
                    "2": {
                      type: "string",
                      value: "Anytown",
                    },
                    "3": {
                      type: "string",
                      value: "CA",
                    },
                    "4": {
                      type: "string",
                      value: "94043",
                    },
                    "5": {
                      type: "enum",
                      value: "1", // HOME
                    },
                  },
                },
              ],
            },
          },
        },
        {
          type: "message",
          value: {
            "1": {
              type: "string",
              value: "Jane Smith",
            },
            "2": {
              type: "int32",
              value: 5678,
            },
            "3": {
              type: "string",
              value: "jane@example.com",
            },
            "4": {
              type: "repeated_message",
              value: [
                {
                  type: "message",
                  value: {
                    "1": {
                      type: "string",
                      value: "555-8765",
                    },
                    "2": {
                      type: "enum",
                      value: "2", // WORK
                    },
                  },
                },
              ],
            },
            "5": {
              type: "timestamp",
              value: "2023-04-10T09:15:30.456Z",
            },
            "6": {
              type: "repeated_message",
              value: [
                {
                  type: "message",
                  value: {
                    "1": {
                      type: "string",
                      value: "456 Oak Ave",
                    },
                    "2": {
                      type: "string",
                      value: "Somewhere",
                    },
                    "3": {
                      type: "string",
                      value: "NY",
                    },
                    "4": {
                      type: "string",
                      value: "10001",
                    },
                    "5": {
                      type: "enum",
                      value: "2", // WORK
                    },
                  },
                },
                {
                  type: "message",
                  value: {
                    "1": {
                      type: "string",
                      value: "789 Pine St",
                    },
                    "2": {
                      type: "string",
                      value: "Elsewhere",
                    },
                    "3": {
                      type: "string",
                      value: "WA",
                    },
                    "4": {
                      type: "string",
                      value: "98001",
                    },
                    "5": {
                      type: "enum",
                      value: "1", // HOME
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    },
    "2": {
      type: "timestamp",
      value: "2023-04-15T12:00:00.000Z",
    },
    "3": {
      type: "int32",
      value: 42,
    },
    "4": {
      type: "message",
      value: {
        "1": {
          type: "bool",
          value: false,
        },
        "2": {
          type: "string",
          value: "UTF-8",
        },
        "3": {
          type: "enum",
          value: "1", // GZIP
        },
        "4": {
          type: "message",
          value: {
            "1": {
              type: "timestamp",
              value: "2023-01-01T00:00:00.000Z",
            },
            "2": {
              type: "timestamp",
              value: "2023-04-15T12:00:00.000Z",
            },
            "3": {
              type: "repeated_string",
              value: ["personal", "contacts", "important"],
            },
          },
        },
      },
    },
  },
}

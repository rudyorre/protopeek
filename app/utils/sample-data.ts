export interface SamplePreset {
  id: 'simple' | 'repeated' | 'complex' | 'telemetry';
  label: string;
  description: string;
  base64: string;
  hex: string;
  messageType: string;
  protoFile: {
    name: string;
    path: string;
    content: string;
  };
}

export const SAMPLE_PRESETS: Record<SamplePreset['id'], SamplePreset> = {
  simple: {
    id: 'simple',
    label: 'Simple',
    description: 'Single length-delimited string greeting field',
    base64: 'ChVTaW1wbGUgUGVyc29uIG1lc3NhZ2U=',
    hex: '0a 15 53 69 6d 70 6c 65 20 50 65 72 73 6f 6e 20 6d 65 73 73 61 67 65',
    messageType: 'greeting.SimpleGreeting',
    protoFile: {
      name: 'greeting.proto',
      path: 'greeting.proto',
      content: `syntax = "proto3";
package greeting;

message SimpleGreeting {
  string headline = 1;
}
`,
    },
  },
  repeated: {
    id: 'repeated',
    label: 'Repeated',
    description: 'Title string with nested repeated string items',
    base64: 'CgxTb21lIG51bWJlcnMSFwoDb25lCgN0d28KBXRocmVlCgRmb3Vy',
    hex: '0a 0c 53 6f 6d 65 20 6e 75 6d 62 65 72 73 12 17 0a 03 6f 6e 65 0a 03 74 77 6f 0a 05 74 68 72 65 65 0a 04 66 6f 75 72',
    messageType: 'catalog.NumberList',
    protoFile: {
      name: 'catalog.proto',
      path: 'catalog.proto',
      content: `syntax = "proto3";
package catalog;

message WordGroup {
  repeated string words = 1;
}

message NumberList {
  string title = 1;
  WordGroup items = 2;
}
`,
    },
  },
  complex: {
    id: 'complex',
    label: 'Complex (AddressBook)',
    description: 'Nested messages, repeated phone records, and PhoneType enum',
    base64:
      'CghKb2huIERvZRDSCRoQam9obkBleGFtcGxlLmNvbSILCgc1NTU0MzIxEAEiCwoHNTU1MTIzNBAA',
    hex: '0a 08 4a 6f 68 6e 20 44 6f 65 10 d2 09 1a 10 6a 6f 68 6e 40 65 78 61 6d 70 6c 65 2e 63 6f 6d 22 0b 0a 07 35 35 35 34 33 32 31 10 01 22 0b 0a 07 35 35 35 31 32 33 34 10 00',
    messageType: 'tutorial.Person',
    protoFile: {
      name: 'addressbook.proto',
      path: 'addressbook.proto',
      content: `syntax = "proto3";
package tutorial;

message Person {
  string name = 1;
  int32 id = 2;
  string email = 3;

  enum PhoneType {
    MOBILE = 0;
    HOME = 1;
    WORK = 2;
  }

  message PhoneNumber {
    string number = 1;
    PhoneType type = 2;
  }

  repeated PhoneNumber phones = 4;
}

message AddressBook {
  repeated Person people = 1;
}
`,
    },
  },
  telemetry: {
    id: 'telemetry',
    label: 'Telemetry (Fixed/Float)',
    description:
      'Device sensor packet with fixed32 float, fixed64 double & varint',
    // Field 1 (string): "sensor-north-01" (0a 0f 73 65 6e 73 6f 72 2d 6e 6f 72 74 68 2d 30 31)
    // Field 2 (varint timestamp): 1731196800 (10 80 a3 d5 b9 06)
    // Field 3 (fixed32 float): 23.5 (1d 00 00 bc 41)
    // Field 4 (fixed64 double): 37.7749 (21 9a 99 99 99 30 e3 42 40)
    // Field 5 (sint32 zigzag -42 -> 83): (28 53)
    base64: 'Cg9zZW5zb3Itbm9ydGgtMDEQgKPVuQYdAAC8QSGamZmZMONCQChT',
    hex: '0a 0f 73 65 6e 73 6f 72 2d 6e 6f 72 74 68 2d 30 31 10 80 a3 d5 b9 06 1d 00 00 bc 41 21 9a 99 99 99 30 e3 42 40 28 53',
    messageType: 'iot.SensorReading',
    protoFile: {
      name: 'telemetry.proto',
      path: 'telemetry.proto',
      content: `syntax = "proto3";
package iot;

message SensorReading {
  string device_id = 1;
  int64 recorded_at_unix = 2;
  float temperature_celsius = 3;
  double latitude = 4;
  sint32 signal_dbm = 5;
}
`,
    },
  },
};

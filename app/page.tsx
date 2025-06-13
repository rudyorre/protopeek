'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Download, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProtoVisualizer } from './components/proto-visualizer';
import { ProtoByteTable } from './components/proto-byte-table';
import { Header } from './components/header';
import { ProtoFileSelector } from './components/proto-file-selector';
import { MessageTypeSelector } from './components/message-type-selector';
import {
  DecodedField,
  ProtobufDecoder,
  parseProtobufInput,
} from './utils/protobuf-decoder';

export default function Home() {
  const [protobufBytes, setProtobufBytes] = useState('');
  const [decodedData, setDecodedData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [protoFiles, setProtoFiles] = useState<
    Array<{ name: string; content: string; path: string }>
  >([]);
  const [availableMessageTypes, setAvailableMessageTypes] = useState<string[]>(
    []
  );
  const [selectedMessageType, setSelectedMessageType] = useState<string | null>(
    null
  );
  const [info, setInfo] = useState<string | null>(null);

  const decoderRef = useRef<ProtobufDecoder>(new ProtobufDecoder());

  const handleProtoFilesSelected = async (
    files: Array<{ name: string; content: string; path: string }>
  ) => {
    setProtoFiles(files);
    setError(null);
    setInfo(null);
    setAvailableMessageTypes([]);
    setSelectedMessageType(null);

    if (files.length > 0) {
      try {
        await decoderRef.current.loadProtoFiles(files);
        const messageTypes = decoderRef.current.getAvailableMessageTypes();
        setAvailableMessageTypes(messageTypes);

        if (messageTypes.length > 0) {
          setSelectedMessageType(messageTypes[0]);
          setInfo(
            `Loaded ${files.length} proto file(s) with ${messageTypes.length} message type(s)`
          );
        }
      } catch (err: any) {
        setError(`Failed to load proto files: ${err.message}`);
      }
    }
  };

  const handleDecode = async () => {
    setError(null);
    setInfo(null);
    setIsDecoding(true);

    // Validation
    if (!protobufBytes.trim()) {
      setError('Please enter protobuf bytes to decode');
      setIsDecoding(false);
      return;
    }

    try {
      // Parse the input bytes
      const bytes = parseProtobufInput(protobufBytes.trim());
      console.log(
        'Parsed bytes:',
        Array.from(bytes)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join(' ')
      );

      let decodedResult: DecodedField[];

      if (protoFiles.length > 0 && selectedMessageType) {
        // Decode with schema
        console.log(
          'Decoding with schema using message type:',
          selectedMessageType
        );
        decodedResult = await decoderRef.current.decodeWithSchema(
          bytes,
          selectedMessageType
        );
        setInfo(
          `Successfully decoded using message type: ${selectedMessageType}`
        );
      } else {
        // Decode without schema
        console.log('Decoding without schema');
        // decodedResult = await decoderRef.current.decodeWithoutSchema(bytes)
        decodedResult = decoderRef.current.decodeWithoutSchema(bytes);
        console.log(decodedResult);
        setInfo(
          'Successfully decoded without schema (field names are numbers)'
        );
      }

      console.log('Decoded result:', decodedResult);
      setDecodedData(JSON.stringify(decodedResult, null, 2));
    } catch (err: any) {
      console.error('Decoding error:', err);
      setError(`Failed to decode protobuf data: ${err.message}`);
    } finally {
      setIsDecoding(false);
    }
  };

  const handleDownload = () => {
    if (!decodedData) return;

    const blob = new Blob([decodedData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'decoded-protobuf.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadSampleData = (type: 'simple' | 'repeated' | 'complex') => {
    const samples = {
      simple: 'ChVTaW1wbGUgUGVyc29uIG1lc3NhZ2U=',
      repeated: 'CgxTb21lIG51bWJlcnMSFwoDb25lCgN0d28KBXRocmVlCgRmb3Vy',
      complex:
        'CghKb2huIERvZRDSCRoQam9obkBleGFtcGxlLmNvbSILCgc1NTU0MzIxEAEiCwoHNTU1MTIzNBAA',
    };
    setProtobufBytes(samples[type]);
  };

  return (
    <>
      <Header />
      <div className='container mx-auto max-w-6xl px-4 py-10'>
        <div className='mb-8 text-center'>
          <h2 className='mb-2 text-3xl font-medium'>Decode Protocol Buffers</h2>
          <p className='text-gray-400'>
            Visualize and explore your protobuf data with or without schema
            files
          </p>
        </div>

        <Card className='border border-gray-800 bg-[#202124] shadow-lg'>
          <CardHeader>
            <CardTitle className='text-xl font-medium'>Input Data</CardTitle>
            <CardDescription>
              Paste your protobuf bytes to decode the data (base64 or hex)
              <div className='mt-2 flex flex-wrap gap-1'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => loadSampleData('simple')}
                  className='h-7 border-gray-600 text-xs hover:border-blue-500'
                >
                  Simple
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => loadSampleData('repeated')}
                  className='h-7 border-gray-600 text-xs hover:border-blue-500'
                >
                  Repeated
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => loadSampleData('complex')}
                  className='h-7 border-gray-600 text-xs hover:border-blue-500'
                >
                  Complex
                </Button>
                <span className='ml-1 self-center text-xs text-gray-400'>
                  ← Sample data
                </span>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
              {/* Left column: Protobuf Bytes */}
              <div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Label
                      htmlFor='protobufBytes'
                      className='text-sm font-medium'
                    >
                      Protobuf Bytes
                    </Label>
                  </div>
                </div>
                <Textarea
                  id='protobufBytes'
                  placeholder='Paste your protobuf bytes here (base64: CgtIZWxsbyBXb3JsZA== or hex: 0a0b48656c6c6f20576f726c64)'
                  className='mt-2 h-[85px] min-h-[85px] border-gray-700 bg-[#303134] font-mono text-sm focus:border-blue-500 focus:ring-blue-500'
                  value={protobufBytes}
                  onChange={(e) => setProtobufBytes(e.target.value)}
                />
                <p className='mt-1 text-xs text-gray-400'>
                  Enter hex, base64, or comma-separated bytes
                </p>
              </div>

              {/* Right column: Proto File Selection */}
              <div>
                <div className='flex-1'>
                  <ProtoFileSelector
                    onFilesSelected={handleProtoFilesSelected}
                    selectedFiles={protoFiles}
                  />
                </div>

                {availableMessageTypes.length > 0 && (
                  <div className='mt-2'>
                    <MessageTypeSelector
                      messageTypes={availableMessageTypes}
                      selectedType={selectedMessageType}
                      onTypeSelected={setSelectedMessageType}
                    />
                  </div>
                )}
              </div>
            </div>

            {info && (
              <Alert className='flex border-blue-800 bg-blue-900/30 py-2 text-blue-200'>
                <Info className='h-4 w-4' />
                <AlertDescription className='text-sm'>{info}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert
                variant='destructive'
                className='flex border-red-800 bg-red-900/30 py-2 text-red-200'
              >
                <AlertCircle className='h-4 w-4' />
                <AlertDescription className='text-sm'>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleDecode}
              disabled={isDecoding}
              className='w-full bg-blue-600 font-medium text-white hover:bg-blue-700'
            >
              {isDecoding ? 'Decoding...' : 'Decode'}
            </Button>
          </CardContent>
        </Card>

        {decodedData && (
          <Card className='mt-8 border border-gray-800 bg-[#202124] shadow-lg'>
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-xl font-medium'>
                  Decoded Results
                </CardTitle>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleDownload}
                  className='border-gray-700 bg-[#303134] text-gray-200 hover:border-blue-500 hover:bg-[#303134]'
                >
                  <Download className='mr-2 h-4 w-4 text-blue-500' />
                  Download JSON
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue='decoded' className='w-full'>
                <TabsList className='mb-4 rounded-lg bg-[#303134] p-1'>
                  <TabsTrigger
                    value='decoded'
                    className='rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white'
                  >
                    Tree View
                  </TabsTrigger>
                  <TabsTrigger
                    value='byte-table'
                    className='rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white'
                  >
                    Byte Table
                  </TabsTrigger>
                  {protoFiles.length > 0 && (
                    <TabsTrigger
                      value='structure'
                      className='rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white'
                    >
                      Proto Structure
                    </TabsTrigger>
                  )}
                  <TabsTrigger
                    value='raw'
                    className='rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white'
                  >
                    Raw JSON
                  </TabsTrigger>
                </TabsList>
                <TabsContent value='decoded'>
                  <ProtoVisualizer data={decodedData} />
                </TabsContent>
                <TabsContent value='byte-table' className='overflow-x-auto'>
                  <div className='min-w-[800px]'>
                    <ProtoByteTable data={decodedData} />
                  </div>
                </TabsContent>
                {protoFiles.length > 0 && (
                  <TabsContent value='structure'>
                    <div className='space-y-4'>
                      {protoFiles.map((file, index) => (
                        <div key={file.path}>
                          <h3 className='mb-2 text-lg font-medium text-white'>
                            {file.path}
                          </h3>
                          <pre
                            className={cn(
                              'rounded-md bg-[#303134] p-4',
                              'font-mono text-sm'
                            )}
                          >
                            {file.content}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                )}
                <TabsContent value='raw'>
                  <pre
                    className={cn(
                      'rounded-md bg-[#303134] p-4',
                      'font-mono text-sm'
                    )}
                  >
                    {decodedData}
                  </pre>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

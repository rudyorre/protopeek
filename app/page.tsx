'use client';

import type React from 'react';
import { useState, useRef, useMemo, useEffect } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Download,
  AlertCircle,
  Info,
  Copy,
  Check,
  Sparkles,
  Upload,
  Share2,
  Trash2,
  FileCode2,
  Play,
  ArrowRightLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProtoVisualizer } from './components/proto-visualizer';
import { ProtoByteTable } from './components/proto-byte-table';
import { ProtoTableView } from './components/proto-table-view';
import { ProtoHexInspector } from './components/proto-hex-inspector';
import { Header } from './components/header';
import { ProtoFileSelector } from './components/proto-file-selector';
import { MessageTypeSelector } from './components/message-type-selector';
import {
  DecodedField,
  ProtobufDecoder,
  parseProtobufInput,
  detectInputFormat,
  formatBytes,
  inferProtoSchema,
  decodedFieldsToCleanJson,
} from './utils/protobuf-decoder';
import { SAMPLE_PRESETS, SamplePreset } from './utils/sample-data';

export default function Home() {
  const [protobufBytes, setProtobufBytes] = useState('');
  const [rawBytesBuffer, setRawBytesBuffer] = useState<Uint8Array | null>(null);
  const [decodedFields, setDecodedFields] = useState<DecodedField[] | null>(
    null
  );
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
  const [includeSampleSchema, setIncludeSampleSchema] = useState(false);
  const [activePresetId, setActivePresetId] = useState<
    SamplePreset['id'] | null
  >(null);
  const [highlightedRange, setHighlightedRange] = useState<
    [number, number] | null
  >(null);
  const [jsonMode, setJsonMode] = useState<'clean' | 'ast'>('clean');
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedProto, setCopiedProto] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const decoderRef = useRef<ProtobufDecoder>(new ProtobufDecoder());
  const binaryFileInputRef = useRef<HTMLInputElement>(null);

  // Live input format & byte length preview
  const inputStats = useMemo(() => {
    const format = detectInputFormat(protobufBytes);
    if (format === 'empty' || format === 'invalid') {
      return { format, byteCount: 0, bytes: null };
    }
    try {
      const parsed = parseProtobufInput(protobufBytes);
      return { format, byteCount: parsed.length, bytes: parsed };
    } catch {
      return { format: 'invalid' as const, byteCount: 0, bytes: null };
    }
  }, [protobufBytes]);

  // Support shareable ?payload=... URL parameter on initial mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const sharedPayload = params.get('payload');
    if (sharedPayload) {
      setProtobufBytes(sharedPayload);
      try {
        const bytes = parseProtobufInput(sharedPayload);
        const result = decoderRef.current.decodeWithoutSchema(bytes);
        setRawBytesBuffer(bytes);
        setDecodedFields(result);
        setDecodedData(JSON.stringify(result, null, 2));
        setInfo('Decoded shared protobuf payload from URL');
      } catch {
        // Ignore invalid shared payload on boot
      }
    }
  }, []);

  const handleProtoFilesSelected = async (
    files: Array<{ name: string; content: string; path: string }>,
    preferredType?: string
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
          const target =
            preferredType && messageTypes.includes(preferredType)
              ? preferredType
              : messageTypes[0];
          setSelectedMessageType(target);
          setInfo(
            `Loaded ${files.length} .proto schema(s) with ${messageTypes.length} message type(s)`
          );
          return target;
        }
      } catch (err: any) {
        setError(`Failed to load proto files: ${err.message}`);
      }
    }
    return null;
  };

  const executeDecode = async (
    inputStr: string,
    files: Array<{ name: string; content: string; path: string }>,
    msgType: string | null
  ) => {
    setError(null);
    setInfo(null);
    setIsDecoding(true);

    if (!inputStr.trim()) {
      setError('Please enter protobuf bytes to decode');
      setIsDecoding(false);
      return;
    }

    try {
      const bytes = parseProtobufInput(inputStr.trim());
      setRawBytesBuffer(bytes);

      let decodedResult: DecodedField[];

      if (files.length > 0 && msgType) {
        decodedResult = await decoderRef.current.decodeWithSchema(
          bytes,
          msgType
        );
        setInfo(`Decoded ${bytes.length} bytes using schema: ${msgType}`);
      } else {
        decodedResult = decoderRef.current.decodeWithoutSchema(bytes);
        if (decodedResult.length === 0 && bytes.length > 0) {
          throw new Error(
            'Unable to parse valid protobuf wire tags from input bytes.'
          );
        }
        setInfo(
          `Decoded ${bytes.length} bytes without schema (${decodedResult.length} top-level wire field${decodedResult.length === 1 ? '' : 's'})`
        );
      }

      setDecodedFields(decodedResult);
      setDecodedData(JSON.stringify(decodedResult, null, 2));
    } catch (err: any) {
      setError(`Failed to decode protobuf data: ${err.message}`);
    } finally {
      setIsDecoding(false);
    }
  };

  const handleDecode = async () => {
    await executeDecode(protobufBytes, protoFiles, selectedMessageType);
  };

  const handleMessageTypeChange = async (newType: string) => {
    setSelectedMessageType(newType);
    if (protobufBytes.trim()) {
      await executeDecode(protobufBytes, protoFiles, newType);
    }
  };

  const loadSampleData = async (
    type: SamplePreset['id'],
    withSchema: boolean = includeSampleSchema
  ) => {
    const preset = SAMPLE_PRESETS[type];
    setActivePresetId(type);
    setProtobufBytes(preset.base64);

    if (withSchema) {
      const files = [preset.protoFile];
      const chosenType = await handleProtoFilesSelected(
        files,
        preset.messageType
      );
      await executeDecode(
        preset.base64,
        files,
        chosenType || preset.messageType
      );
    } else {
      if (protoFiles.length > 0) {
        setProtoFiles([]);
        setAvailableMessageTypes([]);
        setSelectedMessageType(null);
      }
      await executeDecode(preset.base64, [], null);
    }
  };

  const handleToggleSampleSchema = async (checked: boolean) => {
    setIncludeSampleSchema(checked);
    if (activePresetId) {
      await loadSampleData(activePresetId, checked);
    }
  };

  const handleConvertInputFormat = (target: 'hex' | 'base64' | 'bytes') => {
    if (!inputStats.bytes) return;
    setProtobufBytes(formatBytes(inputStats.bytes, target));
  };

  const handleBinaryFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const b64 = formatBytes(bytes, 'base64');
      setProtobufBytes(b64);
      await executeDecode(b64, protoFiles, selectedMessageType);
    } catch (err: any) {
      setError(`Failed to read binary file: ${err.message}`);
    }
  };

  const handleShareUrl = () => {
    if (!protobufBytes.trim() || typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set('payload', protobufBytes.trim());
    navigator.clipboard?.writeText(url.toString());
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 1800);
  };

  const inferredSchemaText = useMemo(() => {
    if (!decodedFields || decodedFields.length === 0) return '';
    return inferProtoSchema(
      decodedFields,
      selectedMessageType?.split('.').pop() || 'InferredPayload'
    );
  }, [decodedFields, selectedMessageType]);

  const formattedJsonOutput = useMemo(() => {
    if (!decodedFields || !decodedData) return '';
    if (jsonMode === 'ast') return decodedData;
    return JSON.stringify(decodedFieldsToCleanJson(decodedFields), null, 2);
  }, [decodedFields, decodedData, jsonMode]);

  const handleApplyInferredSchema = async () => {
    if (!inferredSchemaText) return;
    const files = [
      {
        name: 'inferred.proto',
        path: 'inferred.proto',
        content: inferredSchemaText,
      },
    ];
    const target = await handleProtoFilesSelected(files, 'InferredPayload');
    if (protobufBytes.trim()) {
      await executeDecode(protobufBytes, files, target);
    }
  };

  const handleDownload = () => {
    if (!formattedJsonOutput) return;
    const blob = new Blob([formattedJsonOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download =
      jsonMode === 'clean'
        ? 'decoded-protobuf.json'
        : 'decoded-protobuf-wire-ast.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = () => {
    if (!formattedJsonOutput) return;
    navigator.clipboard?.writeText(formattedJsonOutput);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 1600);
  };

  const handleCopyProto = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedProto(true);
    setTimeout(() => setCopiedProto(false), 1600);
  };

  return (
    <>
      <Header />
      <div className='container mx-auto max-w-7xl px-4 py-8 sm:px-6'>
        {/* Hero Header */}
        <div className='mb-6 flex flex-col justify-between gap-4 border-b border-slate-800/80 pb-6 md:flex-row md:items-end'>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl'>
              Decode & Inspect Protocol Buffers
            </h1>
            <p className='mt-1 text-sm text-slate-400'>
              Analyze raw protobuf wire payloads in hex, base64, or binary —
              with or without{' '}
              <code className='font-mono text-sky-400'>.proto</code> schemas.
            </p>
          </div>

          {/* Sample Presets Toolbar */}
          <div className='flex flex-wrap items-center gap-2 rounded-lg border border-slate-800/90 bg-[#111621] p-2'>
            <span className='px-1.5 text-xs font-medium text-slate-400'>
              Presets:
            </span>
            {Object.values(SAMPLE_PRESETS).map((preset) => (
              <Button
                key={preset.id}
                variant='outline'
                size='sm'
                onClick={() => loadSampleData(preset.id)}
                className={cn(
                  'h-7 border-slate-700/80 bg-[#0D111A] px-2.5 text-xs font-medium text-slate-200 transition-colors hover:border-sky-500/60 hover:bg-sky-500/10 hover:text-sky-300',
                  activePresetId === preset.id &&
                    'border-sky-500/70 bg-sky-500/15 text-sky-300'
                )}
              >
                {preset.label}
              </Button>
            ))}
            <div className='ml-1 flex items-center gap-1.5 border-l border-slate-800 pl-2.5 pr-1'>
              <input
                type='checkbox'
                id='include-sample-schema'
                checked={includeSampleSchema}
                onChange={(e) => handleToggleSampleSchema(e.target.checked)}
                className='h-3.5 w-3.5 cursor-pointer rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-0'
              />
              <label
                htmlFor='include-sample-schema'
                className='cursor-pointer select-none text-xs text-slate-300'
                title='Automatically load the matching .proto schema file when clicking a preset'
              >
                + Load .proto schema
              </label>
            </div>
          </div>
        </div>

        {/* Input Workbench Card */}
        <Card className='border-slate-800/90 bg-[#111621] shadow-xl'>
          <CardHeader className='border-b border-slate-800/70 pb-4'>
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <div>
                <CardTitle className='text-base font-semibold text-slate-100'>
                  Input Payload & Schema Configuration
                </CardTitle>
                <CardDescription className='text-xs text-slate-400'>
                  Paste encoded bytes on the left and optionally attach{' '}
                  <code className='font-mono text-slate-300'>.proto</code>{' '}
                  definitions on the right
                </CardDescription>
              </div>

              {protobufBytes.trim() && (
                <div className='flex items-center gap-1.5'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleShareUrl}
                    className='h-7 border-slate-700/80 bg-[#0D111A] px-2.5 text-xs text-slate-300 hover:border-sky-500/50 hover:text-white'
                  >
                    {copiedShare ? (
                      <>
                        <Check className='mr-1.5 h-3.5 w-3.5 text-emerald-400' />
                        Link Copied
                      </>
                    ) : (
                      <>
                        <Share2 className='mr-1.5 h-3.5 w-3.5 text-sky-400' />
                        Share Payload
                      </>
                    )}
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      setProtobufBytes('');
                      setDecodedData(null);
                      setDecodedFields(null);
                      setRawBytesBuffer(null);
                      setError(null);
                      setInfo(null);
                      setActivePresetId(null);
                    }}
                    className='h-7 px-2 text-xs text-slate-400 hover:bg-rose-500/10 hover:text-rose-400'
                  >
                    <Trash2 className='mr-1 h-3.5 w-3.5' />
                    Clear
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className='space-y-4 pt-5'>
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
              {/* Left column: Protobuf Bytes (7 cols) */}
              <div className='space-y-2 lg:col-span-7'>
                <div className='flex flex-wrap items-center justify-between gap-2'>
                  <div className='flex items-center gap-2'>
                    <Label
                      htmlFor='protobufBytes'
                      className='text-xs font-semibold uppercase tracking-wider text-slate-300'
                    >
                      Protobuf Bytes
                    </Label>
                    {inputStats.format !== 'empty' && (
                      <span
                        className={cn(
                          'rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase',
                          inputStats.format === 'invalid'
                            ? 'bg-rose-500/15 text-rose-400'
                            : 'bg-sky-500/15 text-sky-300'
                        )}
                      >
                        {inputStats.format === 'invalid'
                          ? 'Invalid Format'
                          : `${inputStats.format} • ${inputStats.byteCount} B`}
                      </span>
                    )}
                  </div>

                  {/* Format converter & Binary upload actions */}
                  <div className='flex items-center gap-1'>
                    {inputStats.bytes && (
                      <div className='mr-1 flex items-center gap-1 rounded border border-slate-800 bg-[#0D111A] px-1 py-0.5'>
                        <ArrowRightLeft className='mx-1 h-3 w-3 text-slate-500' />
                        <button
                          type='button'
                          onClick={() => handleConvertInputFormat('hex')}
                          className='rounded px-1.5 py-0.5 font-mono text-[10px] text-slate-400 transition-colors hover:bg-slate-800 hover:text-sky-300'
                          title='Convert input to Hex'
                        >
                          Hex
                        </button>
                        <button
                          type='button'
                          onClick={() => handleConvertInputFormat('base64')}
                          className='rounded px-1.5 py-0.5 font-mono text-[10px] text-slate-400 transition-colors hover:bg-slate-800 hover:text-sky-300'
                          title='Convert input to Base64'
                        >
                          Base64
                        </button>
                        <button
                          type='button'
                          onClick={() => handleConvertInputFormat('bytes')}
                          className='rounded px-1.5 py-0.5 font-mono text-[10px] text-slate-400 transition-colors hover:bg-slate-800 hover:text-sky-300'
                          title='Convert input to comma-separated byte array'
                        >
                          [Bytes]
                        </button>
                      </div>
                    )}
                    <input
                      ref={binaryFileInputRef}
                      type='file'
                      accept='.bin,.pb,.dat,.proto-bin,*/*'
                      onChange={handleBinaryFileUpload}
                      className='hidden'
                    />
                    <button
                      type='button'
                      onClick={() => binaryFileInputRef.current?.click()}
                      className='inline-flex items-center gap-1 rounded border border-slate-800 bg-[#0D111A] px-2 py-1 text-[11px] font-medium text-slate-300 transition-colors hover:border-slate-700 hover:text-white'
                      title='Upload a binary protobuf file (.bin, .pb)'
                    >
                      <Upload className='h-3 w-3 text-sky-400' />
                      Load .bin
                    </button>
                  </div>
                </div>

                <Textarea
                  id='protobufBytes'
                  placeholder='Paste protobuf payload in Hex (0a 08 4a 6f 68 6e...), Base64 (CghKb2huIERvZQ==), or Byte Array ([10, 8, 74...])'
                  className='min-h-[116px] resize-y border-slate-800 bg-[#0D111A] font-mono text-xs leading-relaxed text-slate-100 placeholder:text-slate-600 focus:border-sky-500/70 focus:ring-sky-500/30'
                  value={protobufBytes}
                  onChange={(e) => setProtobufBytes(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                      e.preventDefault();
                      handleDecode();
                    }
                  }}
                />
                <div className='flex items-center justify-between text-[11px] text-slate-500'>
                  <span>
                    Supports hex (with or without 0x/spaces), base64, URL-safe
                    base64, or comma-separated bytes
                  </span>
                  <span className='hidden font-mono sm:inline'>
                    ⌘/Ctrl + Enter to decode
                  </span>
                </div>
              </div>

              {/* Right column: Proto File Selection (5 cols) */}
              <div className='flex flex-col justify-between space-y-3 lg:col-span-5'>
                <ProtoFileSelector
                  onFilesSelected={(files) => handleProtoFilesSelected(files)}
                  selectedFiles={protoFiles}
                />

                {availableMessageTypes.length > 0 && (
                  <MessageTypeSelector
                    messageTypes={availableMessageTypes}
                    selectedType={selectedMessageType}
                    onTypeSelected={handleMessageTypeChange}
                  />
                )}
              </div>
            </div>

            {info && (
              <Alert className='flex items-center border-sky-500/30 bg-sky-500/10 py-2.5 text-sky-200'>
                <Info className='h-4 w-4 text-sky-400' />
                <AlertDescription className='ml-2 text-xs font-medium'>
                  {info}
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert
                variant='destructive'
                className='flex items-center border-rose-500/40 bg-rose-950/40 py-2.5 text-rose-200'
              >
                <AlertCircle className='h-4 w-4 text-rose-400' />
                <AlertDescription className='ml-2 text-xs font-medium'>
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              id='decode-button'
              onClick={handleDecode}
              disabled={isDecoding}
              className='h-10 w-full bg-sky-500 text-sm font-semibold text-slate-950 shadow-sm transition-all hover:bg-sky-400 disabled:opacity-50'
            >
              <Play className='mr-1.5 h-4 w-4 fill-current' />
              {isDecoding ? 'Decoding...' : 'Decode'}
            </Button>
          </CardContent>
        </Card>

        {/* Decoded Results Section */}
        {decodedData && (
          <div className='mt-6 space-y-4'>
            {/* Interactive Wire Hex Dump */}
            <ProtoHexInspector
              bytes={rawBytesBuffer}
              decodedData={decodedData}
              highlightedRange={highlightedRange}
              onSelectRange={setHighlightedRange}
            />

            <Card className='border-slate-800/90 bg-[#111621] shadow-xl'>
              <CardHeader className='border-b border-slate-800/70 pb-3'>
                <div className='flex flex-wrap items-center justify-between gap-2'>
                  <div className='flex items-center gap-2.5'>
                    <CardTitle className='text-base font-semibold text-slate-100'>
                      Decoded Results
                    </CardTitle>
                    <span className='rounded-full border border-slate-700/80 bg-slate-800/80 px-2.5 py-0.5 font-mono text-[11px] text-slate-300'>
                      {protoFiles.length > 0 && selectedMessageType
                        ? `Schema: ${selectedMessageType}`
                        : 'Schemaless Wire Mode'}
                    </span>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleCopyJson}
                      className='h-8 border-slate-700/80 bg-[#0D111A] text-xs text-slate-200 hover:border-sky-500/60 hover:bg-slate-800'
                    >
                      {copiedJson ? (
                        <>
                          <Check className='mr-1.5 h-3.5 w-3.5 text-emerald-400' />
                          Copied JSON
                        </>
                      ) : (
                        <>
                          <Copy className='mr-1.5 h-3.5 w-3.5 text-sky-400' />
                          Copy JSON
                        </>
                      )}
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleDownload}
                      className='h-8 border-slate-700/80 bg-[#0D111A] text-xs text-slate-200 hover:border-sky-500/60 hover:bg-slate-800'
                    >
                      <Download className='mr-1.5 h-3.5 w-3.5 text-sky-400' />
                      Download JSON
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className='pt-4'>
                <Tabs defaultValue='decoded' className='w-full'>
                  <TabsList className='mb-4 flex h-auto flex-wrap justify-start gap-1 rounded-lg border border-slate-800 bg-[#0D111A] p-1'>
                    <TabsTrigger
                      value='decoded'
                      className='rounded-md px-3 py-1.5 text-xs font-medium data-[state=active]:bg-sky-500 data-[state=active]:font-semibold data-[state=active]:text-slate-950'
                    >
                      Tree View
                    </TabsTrigger>
                    <TabsTrigger
                      value='byte-table'
                      className='rounded-md px-3 py-1.5 text-xs font-medium data-[state=active]:bg-sky-500 data-[state=active]:font-semibold data-[state=active]:text-slate-950'
                    >
                      Byte Table
                    </TabsTrigger>
                    <TabsTrigger
                      value='table-view'
                      className='rounded-md px-3 py-1.5 text-xs font-medium data-[state=active]:bg-sky-500 data-[state=active]:font-semibold data-[state=active]:text-slate-950'
                    >
                      Table View
                    </TabsTrigger>
                    <TabsTrigger
                      value='structure'
                      className='rounded-md px-3 py-1.5 text-xs font-medium data-[state=active]:bg-sky-500 data-[state=active]:font-semibold data-[state=active]:text-slate-950'
                    >
                      {protoFiles.length > 0
                        ? 'Proto Structure'
                        : 'Inferred .proto'}
                    </TabsTrigger>
                    <TabsTrigger
                      value='raw'
                      className='rounded-md px-3 py-1.5 text-xs font-medium data-[state=active]:bg-sky-500 data-[state=active]:font-semibold data-[state=active]:text-slate-950'
                    >
                      Raw JSON
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value='decoded'>
                    <ProtoVisualizer
                      data={decodedData}
                      messageTypeName={selectedMessageType}
                      highlightedRange={highlightedRange}
                      onHoverRange={setHighlightedRange}
                    />
                  </TabsContent>

                  <TabsContent value='byte-table' className='overflow-x-auto'>
                    <ProtoByteTable
                      data={decodedData}
                      highlightedRange={highlightedRange}
                      onHoverRange={setHighlightedRange}
                    />
                  </TabsContent>

                  <TabsContent value='table-view'>
                    <ProtoTableView
                      data={decodedData}
                      messageTypeName={selectedMessageType}
                    />
                  </TabsContent>

                  <TabsContent value='structure'>
                    {protoFiles.length > 0 ? (
                      <div className='space-y-4'>
                        {protoFiles.map((file) => (
                          <div
                            key={file.path}
                            className='rounded-lg border border-slate-800/90 bg-[#0D111A] p-4'
                          >
                            <div className='mb-3 flex items-center justify-between'>
                              <div className='flex items-center gap-2'>
                                <FileCode2 className='h-4 w-4 text-sky-400' />
                                <h3 className='font-mono text-sm font-semibold text-white'>
                                  {file.path}
                                </h3>
                              </div>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => handleCopyProto(file.content)}
                                className='h-7 border-slate-700 bg-slate-900 text-xs text-slate-300'
                              >
                                {copiedProto ? (
                                  <>
                                    <Check className='mr-1 h-3 w-3 text-emerald-400' />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className='mr-1 h-3 w-3' />
                                    Copy .proto
                                  </>
                                )}
                              </Button>
                            </div>
                            <pre className='overflow-x-auto rounded-md border border-slate-800/80 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-200'>
                              {file.content}
                            </pre>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className='rounded-lg border border-slate-800/90 bg-[#0D111A] p-4'>
                        <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
                          <div>
                            <div className='flex items-center gap-2'>
                              <Sparkles className='h-4 w-4 text-sky-400' />
                              <h3 className='text-sm font-semibold text-slate-100'>
                                Auto-Inferred .proto Schema
                              </h3>
                            </div>
                            <p className='mt-0.5 text-xs text-slate-400'>
                              Synthesized directly from the wire tags and nested
                              field structure of your payload
                            </p>
                          </div>
                          <div className='flex items-center gap-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() =>
                                handleCopyProto(inferredSchemaText)
                              }
                              className='h-7 border-slate-700 bg-slate-900 text-xs text-slate-200 hover:border-sky-500/60'
                            >
                              {copiedProto ? (
                                <>
                                  <Check className='mr-1.5 h-3 w-3 text-emerald-400' />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className='mr-1.5 h-3 w-3 text-sky-400' />
                                  Copy .proto
                                </>
                              )}
                            </Button>
                            <Button
                              size='sm'
                              onClick={handleApplyInferredSchema}
                              className='h-7 bg-sky-500 text-xs font-semibold text-slate-950 hover:bg-sky-400'
                            >
                              Load as Active Schema
                            </Button>
                          </div>
                        </div>
                        <pre className='overflow-x-auto rounded-md border border-slate-800/80 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-sky-200'>
                          {inferredSchemaText}
                        </pre>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value='raw'>
                    <div className='rounded-lg border border-slate-800/90 bg-[#0D111A] p-4'>
                      <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
                        <div className='flex items-center gap-1 rounded-md border border-slate-800 bg-slate-950 p-0.5'>
                          <button
                            type='button'
                            onClick={() => setJsonMode('clean')}
                            className={cn(
                              'rounded px-2.5 py-1 text-xs font-medium transition-colors',
                              jsonMode === 'clean'
                                ? 'bg-sky-500 font-semibold text-slate-950'
                                : 'text-slate-400 hover:text-slate-200'
                            )}
                          >
                            Clean Key-Value JSON
                          </button>
                          <button
                            type='button'
                            onClick={() => setJsonMode('ast')}
                            className={cn(
                              'rounded px-2.5 py-1 text-xs font-medium transition-colors',
                              jsonMode === 'ast'
                                ? 'bg-sky-500 font-semibold text-slate-950'
                                : 'text-slate-400 hover:text-slate-200'
                            )}
                          >
                            Full Wire AST JSON
                          </button>
                        </div>
                      </div>
                      <pre className='max-h-[500px] overflow-x-auto overflow-y-auto rounded-md border border-slate-800/80 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-200'>
                        {formattedJsonOutput}
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}

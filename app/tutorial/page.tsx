import { BlogPost } from '../components/blog-post';
import { HeadingWithAnchor } from '../components/heading-with-anchor';
import { Upload, Play, Search, Download, Code2, FileText } from 'lucide-react';

export default function TutorialPage() {
  return (
    <BlogPost
      title="How to Use ProtoPeek"
      description="A comprehensive guide to decoding and visualizing Protocol Buffers with ProtoPeek"
      date="January 2025"
      readTime="8 min read"
    >
      <div className='space-y-8 text-body-large text-gray-300'>
        <section>
          <HeadingWithAnchor level={2} className='mb-4'>Getting Started</HeadingWithAnchor>
          <p className='leading-relaxed'>
            ProtoPeek is designed to be intuitive and powerful. Whether you're debugging 
            protobuf messages, exploring API responses, or learning about Protocol Buffers, 
            this guide will help you get the most out of the tool.
          </p>
        </section>

        <section>
          <HeadingWithAnchor level={2} className='mb-6'>Step-by-Step Tutorial</HeadingWithAnchor>
          
          {/* Step 1 */}
          <div className='mb-8 rounded-lg border border-gray-700 bg-[#303134] p-6'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-label-large font-semibold'>1</div>
              <HeadingWithAnchor level={3}>Input Your Protobuf Data</HeadingWithAnchor>
            </div>
            <div className='space-y-3'>
              <p className='leading-relaxed'>
                Start by pasting your protobuf data into the "Protobuf Bytes" field. ProtoPeek accepts multiple formats:
              </p>
              <ul className='list-disc space-y-1 pl-6'>
                <li><strong>Base64:</strong> <code className='rounded bg-gray-700 px-2 py-1 text-green-400'>CgtIZWxsbyBXb3JsZA==</code></li>
                <li><strong>Hexadecimal:</strong> <code className='rounded bg-gray-700 px-2 py-1 text-green-400'>0a0b48656c6c6f20576f726c64</code></li>
                <li><strong>Comma-separated bytes:</strong> <code className='rounded bg-gray-700 px-2 py-1 text-green-400'>10, 11, 72, 101, 108, 108, 111</code></li>
              </ul>
              <div className='mt-4 rounded border border-blue-600 bg-blue-900/20 p-3'>
                <p className='text-blue-200'>
                  <strong>💡 Tip:</strong> Use the sample data buttons (Simple, Repeated, Complex) to try out ProtoPeek with example data.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className='mb-8 rounded-lg border border-gray-700 bg-[#303134] p-6'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-label-large font-semibold'>2</div>
              <HeadingWithAnchor level={3}>Upload Proto Files (Optional but Recommended)</HeadingWithAnchor>
            </div>
            <div className='space-y-3'>
              <p className='leading-relaxed'>
                For the best experience, upload your <code className='rounded bg-gray-700 px-2 py-1 text-blue-400'>.proto</code> schema files. This enables:
              </p>
              <ul className='list-disc space-y-1 pl-6'>
                <li>Proper field names instead of generic "field_1", "field_2"</li>
                <li>Type information for better understanding</li>
                <li>Enum value resolution</li>
                <li>Nested message structure visualization</li>
              </ul>
              <div className='mt-4 flex items-start gap-3 rounded border border-green-600 bg-green-900/20 p-3'>
                <Upload className='h-5 w-5 text-green-400 mt-0.5' />
                <p className='text-green-200'>
                  You can upload multiple .proto files if your schema spans several files. ProtoPeek will automatically resolve imports and dependencies.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className='mb-8 rounded-lg border border-gray-700 bg-[#303134] p-6'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-label-large font-semibold'>3</div>
              <HeadingWithAnchor level={3}>Select Message Type</HeadingWithAnchor>
            </div>
            <div className='space-y-3'>
              <p className='leading-relaxed'>
                If you've uploaded .proto files, you'll see a dropdown to select the specific message type you want to decode. 
                This tells ProtoPeek how to interpret your binary data according to the schema.
              </p>
              <div className='mt-4 rounded border border-yellow-600 bg-yellow-900/20 p-3'>
                <p className='text-yellow-200'>
                  <strong>⚠️ Note:</strong> Without schema files, ProtoPeek will still decode your data but field names will be generic (field_1, field_2, etc.).
                </p>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className='mb-8 rounded-lg border border-gray-700 bg-[#303134] p-6'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-label-large font-semibold'>4</div>
              <HeadingWithAnchor level={3}>Decode and Explore</HeadingWithAnchor>
            </div>
            <div className='space-y-3'>
              <p className='leading-relaxed'>
                Click the "Decode" button to process your data. ProtoPeek will analyze the binary data and present it in multiple views:
              </p>
              <div className='grid gap-4 md:grid-cols-2'>
                <div className='rounded border border-gray-600 bg-[#252529] p-4'>
                  <div className='flex items-center gap-2 mb-2'>
                    <Search className='h-4 w-4 text-blue-400' />
                    <strong className='text-label-large text-white'>Tree View</strong>
                  </div>
                  <p className='text-body-medium'>Interactive tree structure showing nested fields and values</p>
                </div>
                <div className='rounded border border-gray-600 bg-[#252529] p-4'>
                  <div className='flex items-center gap-2 mb-2'>
                    <FileText className='h-4 w-4 text-green-400' />
                    <strong className='text-label-large text-white'>Byte Table</strong>
                  </div>
                  <p className='text-body-medium'>Detailed byte-by-byte analysis of the encoding</p>
                </div>
                <div className='rounded border border-gray-600 bg-[#252529] p-4'>
                  <div className='flex items-center gap-2 mb-2'>
                    <Code2 className='h-4 w-4 text-purple-400' />
                    <strong className='text-label-large text-white'>Proto Structure</strong>
                  </div>
                  <p className='text-body-medium'>View your uploaded .proto files (when available)</p>
                </div>
                <div className='rounded border border-gray-600 bg-[#252529] p-4'>
                  <div className='flex items-center gap-2 mb-2'>
                    <Download className='h-4 w-4 text-yellow-400' />
                    <strong className='text-label-large text-white'>Raw JSON</strong>
                  </div>
                  <p className='text-body-medium'>Export the decoded data as JSON</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <HeadingWithAnchor level={2} className='mb-4'>Understanding the Output</HeadingWithAnchor>
          
          <div className='space-y-6'>
            <div>
              <HeadingWithAnchor level={3} className='mb-3'>Tree View</HeadingWithAnchor>
              <p className='leading-relaxed'>
                The tree view shows your protobuf data in a hierarchical structure. You can expand and collapse nested objects, 
                making it easy to explore complex data structures. Field names, types, and values are clearly displayed.
              </p>
            </div>

            <div>
              <HeadingWithAnchor level={3} className='mb-3'>Byte Table</HeadingWithAnchor>
              <p className='leading-relaxed'>
                The byte table provides a detailed breakdown of how your data is encoded at the byte level. This is invaluable 
                for understanding protobuf's binary format, debugging encoding issues, or learning about the protocol.
              </p>
            </div>

            <div>
              <HeadingWithAnchor level={3} className='mb-3'>Export Options</HeadingWithAnchor>
              <p className='leading-relaxed'>
                Use the "Download JSON" button to export your decoded data for use in other tools or applications. 
                The exported JSON maintains the structure and field names from your schema.
              </p>
            </div>
          </div>
        </section>

        <section>
          <HeadingWithAnchor level={2} className='mb-4'>Privacy & Security</HeadingWithAnchor>
          <div className='rounded-lg border border-green-700 bg-green-900/20 p-6'>
            <p className='leading-relaxed text-green-100'>
              <strong>🔒 Your data never leaves your browser.</strong> All decoding happens locally using JavaScript, 
              ensuring complete privacy and security for your protobuf data and schema files.
            </p>
          </div>
        </section>

        <section>
          <HeadingWithAnchor level={2} className='mb-4'>Tips for Best Results</HeadingWithAnchor>
          <ul className='list-disc space-y-2 pl-6'>
            <li>Always upload your .proto files when available for the best decoding experience</li>
            <li>If you have multiple .proto files, upload them all - ProtoPeek will handle imports automatically</li>
            <li>Use the sample data to familiarize yourself with the interface before working with your own data</li>
            <li>The byte table view is excellent for learning about protobuf encoding and debugging issues</li>
            <li>Export to JSON when you need to use the decoded data in other applications</li>
          </ul>
        </section>

        <section>
          <HeadingWithAnchor level={2} className='mb-4'>Need Help?</HeadingWithAnchor>
          <p className='leading-relaxed'>
            If you encounter any issues or have questions, feel free to{' '}
            <a 
              href='https://github.com/rudyorre/protopeek/issues' 
              target='_blank' 
              rel='noopener noreferrer'
              className='text-blue-400 hover:text-blue-300 transition-colors'
            >
              open an issue on GitHub
            </a>
            . We're here to help make your protobuf debugging experience as smooth as possible!
          </p>
        </section>
      </div>
    </BlogPost>
  );
}

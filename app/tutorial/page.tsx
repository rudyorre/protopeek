import Link from 'next/link';
import { Header } from '../components/header';
import { ArrowLeft, Binary, Layers, Cpu, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Wire Format Guide & Tutorial — ProtoPeek',
  description:
    'Learn how Protocol Buffers binary wire encoding works and how to inspect payloads with ProtoPeek.',
};

export default function TutorialPage() {
  return (
    <>
      <Header />
      <div className='container mx-auto max-w-4xl px-4 py-10 sm:px-6'>
        <Link
          href='/'
          className='mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-sky-400 transition-colors hover:text-sky-300'
        >
          <ArrowLeft className='h-3.5 w-3.5' />
          Back to Wire Inspector
        </Link>

        <h1 className='text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl'>
          Protocol Buffers Wire Format & Inspector Guide
        </h1>
        <p className='mt-2 text-sm leading-relaxed text-slate-400'>
          Protocol Buffers serialize structured data into a compact stream of
          tag-value pairs. Understanding how tags, varints, and length-delimited
          records work on the wire makes debugging binary payloads effortless.
        </p>

        {/* Quick Workflow */}
        <div className='mt-8 grid gap-4 sm:grid-cols-3'>
          <div className='rounded-lg border border-slate-800/90 bg-[#111621] p-4'>
            <div className='mb-2 flex items-center gap-2 text-sky-400'>
              <Binary className='h-4 w-4' />
              <span className='text-xs font-semibold uppercase tracking-wider'>
                1. Provide Bytes
              </span>
            </div>
            <p className='text-xs leading-relaxed text-slate-300'>
              Paste hex (
              <code className='font-mono text-sky-300'>08 96 01</code>
              ), Base64, or a byte array, or upload a raw{' '}
              <code className='font-mono text-slate-200'>.bin</code> /{' '}
              <code className='font-mono text-slate-200'>.pb</code> file.
            </p>
          </div>

          <div className='rounded-lg border border-slate-800/90 bg-[#111621] p-4'>
            <div className='mb-2 flex items-center gap-2 text-emerald-400'>
              <Layers className='h-4 w-4' />
              <span className='text-xs font-semibold uppercase tracking-wider'>
                2. Optional Schema
              </span>
            </div>
            <p className='text-xs leading-relaxed text-slate-300'>
              Drop <code className='font-mono text-emerald-300'>.proto</code>{' '}
              files or paste a schema inline to resolve field names and enums—or
              decode without any schema.
            </p>
          </div>

          <div className='rounded-lg border border-slate-800/90 bg-[#111621] p-4'>
            <div className='mb-2 flex items-center gap-2 text-amber-400'>
              <Sparkles className='h-4 w-4' />
              <span className='text-xs font-semibold uppercase tracking-wider'>
                3. Inspect & Export
              </span>
            </div>
            <p className='text-xs leading-relaxed text-slate-300'>
              Hover bytes in the Hex Map to trace tags and payloads, view
              alternate scalar types, or generate an inferred{' '}
              <code className='font-mono text-amber-300'>.proto</code> file.
            </p>
          </div>
        </div>

        {/* Wire Format Reference */}
        <div className='mt-8 space-y-6'>
          <section className='rounded-lg border border-slate-800/90 bg-[#111621] p-6'>
            <h2 className='flex items-center gap-2 text-lg font-semibold text-slate-100'>
              <Cpu className='h-4 w-4 text-sky-400' />
              How Wire Tags Work
            </h2>
            <p className='mt-2 text-xs leading-relaxed text-slate-300'>
              Every field in a protobuf stream begins with a{' '}
              <strong className='text-white'>tag varint</strong> that packs two
              values into a single integer: the{' '}
              <strong className='text-sky-300'>field number</strong> and the{' '}
              <strong className='text-amber-300'>3-bit wire type</strong>.
            </p>
            <pre className='mt-3 overflow-x-auto rounded-md border border-slate-800 bg-[#0D111A] p-3.5 font-mono text-xs text-sky-300'>
              {`tag = (field_number << 3) | wire_type
wire_type = tag & 0x07
field_number = tag >> 3`}
            </pre>

            <div className='mt-4 overflow-x-auto'>
              <table className='w-full border-collapse text-left text-xs'>
                <thead>
                  <tr className='border-b border-slate-800 bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400'>
                    <th className='px-3 py-2'>Wire Type</th>
                    <th className='px-3 py-2'>Name</th>
                    <th className='px-3 py-2'>Used For (.proto types)</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-800/60 font-mono text-xs'>
                  <tr>
                    <td className='px-3 py-2 text-amber-400'>0</td>
                    <td className='px-3 py-2 text-slate-200'>VARINT</td>
                    <td className='px-3 py-2 font-sans text-slate-400'>
                      int32, int64, uint32, uint64, sint32, sint64, bool, enum
                    </td>
                  </tr>
                  <tr>
                    <td className='px-3 py-2 text-teal-400'>1</td>
                    <td className='px-3 py-2 text-slate-200'>I64 (FIXED64)</td>
                    <td className='px-3 py-2 font-sans text-slate-400'>
                      fixed64, sfixed64, double (8-byte little-endian)
                    </td>
                  </tr>
                  <tr>
                    <td className='px-3 py-2 text-sky-400'>2</td>
                    <td className='px-3 py-2 text-slate-200'>
                      LEN (LENGTH_DELIMITED)
                    </td>
                    <td className='px-3 py-2 font-sans text-slate-400'>
                      string, bytes, embedded messages, packed repeated fields
                    </td>
                  </tr>
                  <tr>
                    <td className='px-3 py-2 text-teal-400'>5</td>
                    <td className='px-3 py-2 text-slate-200'>I32 (FIXED32)</td>
                    <td className='px-3 py-2 font-sans text-slate-400'>
                      fixed32, sfixed32, float (4-byte little-endian)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className='rounded-lg border border-slate-800/90 bg-[#111621] p-6'>
            <h2 className='text-lg font-semibold text-slate-100'>
              Example: Decoding{' '}
              <code className='font-mono text-sky-400'>08 96 01</code>
            </h2>
            <ul className='mt-3 space-y-2 text-xs leading-relaxed text-slate-300'>
              <li>
                <strong className='font-mono text-sky-300'>
                  Byte 0 (0x08):
                </strong>{' '}
                Binary <code className='font-mono'>00001_000</code>. Lower 3
                bits are <code className='font-mono'>000</code> (Wire Type 0 =
                VARINT), upper bits are <code className='font-mono'>1</code>{' '}
                (Field #1).
              </li>
              <li>
                <strong className='font-mono text-amber-300'>
                  Bytes 1–2 (0x96 0x01):
                </strong>{' '}
                First byte <code className='font-mono'>0x96</code> has MSB set (
                <code className='font-mono'>10010110</code>), second byte{' '}
                <code className='font-mono'>0x01</code> has MSB clear (
                <code className='font-mono'>00000001</code>). Dropping MSBs and
                combining little-endian 7-bit groups gives{' '}
                <code className='font-mono'>
                  (0x01 &lt;&lt; 7) | 0x16 = 150
                </code>
                .
              </li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}

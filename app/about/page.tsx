import Link from 'next/link';
import { Header } from '../components/header';
import { ArrowLeft, Binary, ShieldCheck, Code2, Github } from 'lucide-react';

export const metadata = {
  title: 'About — ProtoPeek',
  description:
    'Learn about ProtoPeek, an open-source client-side Protocol Buffers wire inspector and schema visualizer.',
};

export default function AboutPage() {
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
          About ProtoPeek
        </h1>
        <p className='mt-2 text-sm leading-relaxed text-slate-400'>
          ProtoPeek is an open-source developer tool designed to make
          inspecting, debugging, and reverse-engineering Protocol Buffers
          payloads fast, visual, and private.
        </p>

        <div className='mt-8 grid gap-4 sm:grid-cols-2'>
          <div className='rounded-lg border border-slate-800/90 bg-[#111621] p-5'>
            <div className='mb-2 flex items-center gap-2 text-sky-400'>
              <Binary className='h-4 w-4' />
              <h2 className='text-sm font-semibold text-white'>
                Dual-Engine Decoder
              </h2>
            </div>
            <p className='text-xs leading-relaxed text-slate-300'>
              Combines a custom byte-range tracking wire reader for schemaless
              inspection with{' '}
              <code className='font-mono text-sky-300'>protobufjs</code> schema
              resolution, so you get exact byte offsets alongside full{' '}
              <code className='font-mono text-sky-300'>.proto</code> type and
              enum names.
            </p>
          </div>

          <div className='rounded-lg border border-slate-800/90 bg-[#111621] p-5'>
            <div className='mb-2 flex items-center gap-2 text-emerald-400'>
              <ShieldCheck className='h-4 w-4' />
              <h2 className='text-sm font-semibold text-white'>
                Zero-Server Privacy
              </h2>
            </div>
            <p className='text-xs leading-relaxed text-slate-300'>
              Every byte you paste and every{' '}
              <code className='font-mono text-emerald-300'>.proto</code> schema
              you load is processed locally inside your browser. No payloads or
              schemas are ever transmitted to any server.
            </p>
          </div>
        </div>

        <div className='mt-6 rounded-lg border border-slate-800/90 bg-[#111621] p-6'>
          <div className='flex items-center gap-2 text-slate-100'>
            <Code2 className='h-4 w-4 text-sky-400' />
            <h2 className='text-base font-semibold'>Open Source</h2>
          </div>
          <p className='mt-2 text-xs leading-relaxed text-slate-300'>
            ProtoPeek is created and maintained by{' '}
            <a
              href='https://rudyorre.com'
              target='_blank'
              rel='noopener noreferrer'
              className='font-medium text-sky-400 hover:underline'
            >
              Rudy Orre
            </a>
            . Contributions, bug reports, and feature requests are welcome on
            GitHub.
          </p>
          <div className='mt-4'>
            <a
              href='https://github.com/rudyorre/protopeek'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-sky-500/60 hover:text-white'
            >
              <Github className='h-3.5 w-3.5' />
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

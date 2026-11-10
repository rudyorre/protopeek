import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { ProtoPeekLogo } from './protopeek-logo';

export function Footer() {
  return (
    <footer className='w-full border-t border-slate-800/80 bg-[#090B10]'>
      <div className='container mx-auto max-w-7xl px-4 py-10 sm:px-6'>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-4'>
          {/* Brand Column */}
          <div className='space-y-3 md:col-span-1'>
            <div className='flex items-center gap-2.5'>
              <ProtoPeekLogo size={26} />
              <span className='text-sm font-semibold tracking-tight text-slate-100'>
                ProtoPeek
              </span>
            </div>
            <p className='text-xs leading-relaxed text-slate-400'>
              Zero-telemetry, client-side Protocol Buffers wire format inspector
              and schema visualizer.
            </p>
          </div>

          {/* Product */}
          <div className='space-y-2.5'>
            <h3 className='text-xs font-semibold uppercase tracking-wider text-slate-300'>
              Product
            </h3>
            <ul className='space-y-2'>
              <li>
                <Link
                  href='/'
                  className='text-xs text-slate-400 transition-colors hover:text-sky-400'
                >
                  Wire Inspector
                </Link>
              </li>
              <li>
                <Link
                  href='/tutorial'
                  className='text-xs text-slate-400 transition-colors hover:text-sky-400'
                >
                  How to Use & Wire Format Guide
                </Link>
              </li>
              <li>
                <Link
                  href='/about'
                  className='text-xs text-slate-400 transition-colors hover:text-sky-400'
                >
                  About & Architecture
                </Link>
              </li>
            </ul>
          </div>

          {/* Specifications */}
          <div className='space-y-2.5'>
            <h3 className='text-xs font-semibold uppercase tracking-wider text-slate-300'>
              Specifications
            </h3>
            <ul className='space-y-2'>
              <li>
                <a
                  href='https://protobuf.dev/programming-guides/encoding/'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-sky-400'
                >
                  Protobuf Wire Encoding
                  <ExternalLink className='h-3 w-3 opacity-70' />
                </a>
              </li>
              <li>
                <a
                  href='https://protobuf.dev/'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-sky-400'
                >
                  Protocol Buffers Docs
                  <ExternalLink className='h-3 w-3 opacity-70' />
                </a>
              </li>
              <li>
                <a
                  href='https://grpc.io/'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-sky-400'
                >
                  gRPC Documentation
                  <ExternalLink className='h-3 w-3 opacity-70' />
                </a>
              </li>
            </ul>
          </div>

          {/* Open Source & Support */}
          <div className='space-y-2.5'>
            <h3 className='text-xs font-semibold uppercase tracking-wider text-slate-300'>
              Open Source
            </h3>
            <ul className='space-y-2'>
              <li>
                <a
                  href='https://github.com/rudyorre/protopeek'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-sky-400'
                >
                  GitHub Repository
                  <ExternalLink className='h-3 w-3 opacity-70' />
                </a>
              </li>
              <li>
                <a
                  href='https://github.com/rudyorre/protopeek/issues'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-sky-400'
                >
                  Report an Issue
                  <ExternalLink className='h-3 w-3 opacity-70' />
                </a>
              </li>
              <li>
                <Link
                  href='/privacy'
                  className='text-xs text-slate-400 transition-colors hover:text-sky-400'
                >
                  Privacy & Local Execution
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className='mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-800/70 pt-6 sm:flex-row'>
          <p className='text-xs text-slate-500'>
            © {new Date().getFullYear()} ProtoPeek · Open-source Protocol
            Buffers inspector
          </p>
          <p className='text-xs text-slate-400'>
            Built by{' '}
            <a
              href='https://rudyorre.com'
              target='_blank'
              rel='noopener noreferrer'
              className='font-medium text-sky-400 transition-colors hover:text-sky-300'
            >
              Rudy Orre
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

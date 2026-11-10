import { ExternalLink, ShieldCheck } from 'lucide-react';
import { ProtoPeekLogo } from './protopeek-logo';

export function Footer() {
  return (
    <footer className='w-full border-t border-slate-800/80 bg-[#090B10]'>
      <div className='container mx-auto max-w-7xl px-4 py-5 sm:px-6'>
        <div className='flex flex-col items-center justify-between gap-4 sm:flex-row'>
          <div className='flex flex-wrap items-center justify-center gap-2.5 text-xs text-slate-400 sm:justify-start'>
            <ProtoPeekLogo size={22} />
            <span className='font-semibold text-slate-200'>ProtoPeek</span>
            <span className='text-slate-700'>·</span>
            <span className='inline-flex items-center gap-1 text-slate-400'>
              <ShieldCheck className='h-3.5 w-3.5 text-emerald-400' />
              100% client-side Protocol Buffers inspector (zero telemetry)
            </span>
          </div>

          <div className='flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400'>
            <a
              href='https://protobuf.dev/programming-guides/encoding/'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-1 transition-colors hover:text-sky-400'
            >
              Protobuf Wire Spec
              <ExternalLink className='h-3 w-3 opacity-70' />
            </a>
            <span className='text-slate-800'>·</span>
            <a
              href='https://github.com/rudyorre/protopeek'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-1 transition-colors hover:text-sky-400'
            >
              GitHub
              <ExternalLink className='h-3 w-3 opacity-70' />
            </a>
            <span className='text-slate-800'>·</span>
            <span>
              Built by{' '}
              <a
                href='https://rudyorre.com'
                target='_blank'
                rel='noopener noreferrer'
                className='font-medium text-sky-400 transition-colors hover:text-sky-300'
              >
                Rudy Orre
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

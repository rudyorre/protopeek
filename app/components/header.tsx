import Link from 'next/link';
import { Github, ShieldCheck, BookOpen } from 'lucide-react';
import { VersionBadge } from './version-badge';
import { ProtoPeekLogo } from './protopeek-logo';

export function Header() {
  return (
    <header className='sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0B0E14]/90 backdrop-blur-md'>
      <div className='container mx-auto max-w-7xl px-4 sm:px-6'>
        <div className='flex h-14 items-center justify-between'>
          <div className='flex items-center gap-6'>
            <Link
              href='/'
              className='group flex items-center gap-2.5 focus:outline-none'
            >
              <ProtoPeekLogo
                size={32}
                className='transition-transform duration-200 group-hover:scale-105'
              />
              <div className='flex items-baseline gap-2'>
                <span className='text-base font-semibold tracking-tight text-slate-100'>
                  ProtoPeek
                </span>
                <span className='hidden text-xs text-slate-500 sm:inline-block'>
                  by{' '}
                  <span className='text-slate-400 transition-colors group-hover:text-sky-400'>
                    Rudy Orre
                  </span>
                </span>
              </div>
            </Link>

            <nav className='hidden items-center gap-1 md:flex'>
              <Link
                href='/'
                className='rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800/60 hover:text-white'
              >
                Inspector
              </Link>
              <Link
                href='/tutorial'
                className='flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-white'
              >
                <BookOpen className='h-3.5 w-3.5 text-slate-500' />
                Wire Format Guide
              </Link>
              <Link
                href='/about'
                className='rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-white'
              >
                About
              </Link>
            </nav>
          </div>

          <div className='flex items-center gap-3'>
            <div
              className='hidden items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-[11px] font-medium text-emerald-400 lg:flex'
              title='All protobuf decoding and schema parsing runs 100% locally in your browser'
            >
              <ShieldCheck className='h-3.5 w-3.5' />
              <span>100% Client-Side</span>
            </div>
            <VersionBadge />
            <a
              href='https://github.com/rudyorre/protopeek'
              target='_blank'
              rel='noopener noreferrer'
              className='flex h-8 w-8 items-center justify-center rounded-md border border-slate-800 bg-slate-900/60 text-slate-400 transition-colors hover:border-slate-700 hover:text-slate-100'
              aria-label='View on GitHub'
            >
              <Github className='h-4 w-4' />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

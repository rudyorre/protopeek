'use client';

import Link from 'next/link';
import { Github, ShieldCheck, BookOpen } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { VersionBadge } from './version-badge';
import { ProtoPeekLogo } from './protopeek-logo';

export function Header() {
  return (
    <header className='sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0B0E14]/90 backdrop-blur-md'>
      <div className='container mx-auto max-w-7xl px-4 sm:px-6'>
        <div className='flex h-14 items-center justify-between'>
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

          <div className='flex items-center gap-2.5'>
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type='button'
                  className='inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900/60 px-2.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-700 hover:bg-slate-800/80 hover:text-white'
                >
                  <BookOpen className='h-3.5 w-3.5 text-sky-400' />
                  <span className='hidden sm:inline'>Wire Format</span>
                  <span className='sm:hidden'>Guide</span>
                </button>
              </DialogTrigger>
              <DialogContent className='max-w-2xl border-slate-800 bg-[#0D111A] text-slate-100'>
                <DialogHeader>
                  <DialogTitle className='text-base font-semibold text-white'>
                    Protocol Buffers Wire Format Cheatsheet
                  </DialogTitle>
                  <DialogDescription className='text-xs text-slate-400'>
                    Every protobuf field on the wire is a{' '}
                    <code className='rounded bg-slate-900 px-1 py-0.5 font-mono text-sky-400'>
                      (tag, value)
                    </code>{' '}
                    pair where the tag varint encodes{' '}
                    <code className='rounded bg-slate-900 px-1 py-0.5 font-mono text-sky-400'>
                      (field_number &lt;&lt; 3) | wire_type
                    </code>
                    .
                  </DialogDescription>
                </DialogHeader>

                <div className='space-y-4 text-xs'>
                  <div className='overflow-hidden rounded-lg border border-slate-800 bg-[#0B0E14]'>
                    <table className='w-full border-collapse text-left'>
                      <thead>
                        <tr className='border-b border-slate-800 bg-slate-900/70 text-[11px] uppercase tracking-wider text-slate-400'>
                          <th className='px-3 py-2'>ID</th>
                          <th className='px-3 py-2'>Wire Type</th>
                          <th className='px-3 py-2'>Encoding</th>
                          <th className='px-3 py-2'>Schema Types (.proto)</th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-slate-800/70 font-mono text-xs'>
                        <tr>
                          <td className='px-3 py-2 font-semibold text-amber-400'>
                            0
                          </td>
                          <td className='px-3 py-2 text-slate-200'>VARINT</td>
                          <td className='px-3 py-2 font-sans text-slate-400'>
                            1–10 byte base-128 (MSB continuation)
                          </td>
                          <td className='px-3 py-2 text-slate-300'>
                            int32, int64, uint32, uint64, sint32, sint64, bool,
                            enum
                          </td>
                        </tr>
                        <tr>
                          <td className='px-3 py-2 font-semibold text-purple-400'>
                            1
                          </td>
                          <td className='px-3 py-2 text-slate-200'>I64</td>
                          <td className='px-3 py-2 font-sans text-slate-400'>
                            8-byte little-endian
                          </td>
                          <td className='px-3 py-2 text-slate-300'>
                            fixed64, sfixed64, double
                          </td>
                        </tr>
                        <tr>
                          <td className='px-3 py-2 font-semibold text-emerald-400'>
                            2
                          </td>
                          <td className='px-3 py-2 text-slate-200'>LEN</td>
                          <td className='px-3 py-2 font-sans text-slate-400'>
                            Varint byte length + N raw bytes
                          </td>
                          <td className='px-3 py-2 text-slate-300'>
                            string, bytes, embedded messages, packed repeated
                          </td>
                        </tr>
                        <tr>
                          <td className='px-3 py-2 font-semibold text-cyan-400'>
                            5
                          </td>
                          <td className='px-3 py-2 text-slate-200'>I32</td>
                          <td className='px-3 py-2 font-sans text-slate-400'>
                            4-byte little-endian
                          </td>
                          <td className='px-3 py-2 text-slate-300'>
                            fixed32, sfixed32, float
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    <div className='rounded-lg border border-slate-800/80 bg-[#0B0E14] p-3'>
                      <div className='mb-1 font-semibold text-slate-200'>
                        Base-128 Varints &amp; ZigZag
                      </div>
                      <p className='leading-relaxed text-slate-400'>
                        Varints store 7 bits per byte in little-endian group
                        order with bit <code className='font-mono'>0x80</code>{' '}
                        as the continuation flag. Signed{' '}
                        <code className='font-mono text-amber-300'>
                          sint32/sint64
                        </code>{' '}
                        values use ZigZag encoding:{' '}
                        <code className='font-mono text-slate-300'>
                          (n &gt;&gt; 1) ^ -(n &amp; 1)
                        </code>
                        .
                      </p>
                    </div>
                    <div className='rounded-lg border border-slate-800/80 bg-[#0B0E14] p-3'>
                      <div className='mb-1 flex items-center gap-1.5 font-semibold text-emerald-400'>
                        <ShieldCheck className='h-3.5 w-3.5' />
                        100% Client-Side Execution
                      </div>
                      <p className='leading-relaxed text-slate-400'>
                        ProtoPeek decodes binary payloads and resolves{' '}
                        <code className='font-mono text-sky-400'>.proto</code>{' '}
                        files strictly in browser memory. Zero payloads or
                        schemas are ever transmitted over the network.
                      </p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <div
              className='hidden items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-[11px] font-medium text-emerald-400 md:flex'
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

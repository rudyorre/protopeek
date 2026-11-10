import Link from 'next/link';
import { Header } from '../components/header';
import { ArrowLeft, ShieldCheck, Lock } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy — ProtoPeek',
  description:
    'ProtoPeek processes all Protocol Buffers payloads and .proto schemas 100% locally in your browser.',
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <div className='container mx-auto max-w-3xl px-4 py-10 sm:px-6'>
        <Link
          href='/'
          className='mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-sky-400 transition-colors hover:text-sky-300'
        >
          <ArrowLeft className='h-3.5 w-3.5' />
          Back to Wire Inspector
        </Link>

        <div className='flex items-center gap-2.5'>
          <div className='rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2 text-emerald-400'>
            <ShieldCheck className='h-5 w-5' />
          </div>
          <h1 className='text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl'>
            Privacy & Local Execution
          </h1>
        </div>

        <div className='mt-6 space-y-4 rounded-lg border border-slate-800/90 bg-[#111621] p-6 text-xs leading-relaxed text-slate-300'>
          <div className='flex items-start gap-3'>
            <Lock className='mt-0.5 h-4 w-4 shrink-0 text-sky-400' />
            <div>
              <h2 className='text-sm font-semibold text-white'>
                100% Client-Side Processing
              </h2>
              <p className='mt-1 text-slate-400'>
                All Protocol Buffers binary decoding, hex inspection, and{' '}
                <code className='font-mono text-slate-200'>.proto</code> schema
                parsing execute strictly inside your web browser using
                JavaScript/TypeScript. Your payloads and schema files never
                leave your device.
              </p>
            </div>
          </div>

          <div className='border-t border-slate-800 pt-4'>
            <h2 className='text-sm font-semibold text-white'>
              No Data Collection or Storage
            </h2>
            <p className='mt-1 text-slate-400'>
              ProtoPeek does not store, log, or transmit your decoded messages,
              uploaded binary files, or proprietary{' '}
              <code className='font-mono text-slate-200'>.proto</code> schemas
              to any backend server or third-party analytics service.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

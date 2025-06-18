import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className='w-full border-t border-gray-800 bg-[#202124]'>
      <div className='container mx-auto px-4 py-12'>
        {/* Main Footer Content */}
        <div className='mx-auto max-w-4xl'>
          <div className='grid grid-cols-2 gap-8 md:grid-cols-3 lg:gap-12'>
            {/* ProtoPeek */}
            <div className='space-y-3'>
              <h3 className='text-sm font-semibold text-white'>ProtoPeek</h3>
              <ul className='space-y-3'>
                <li>
                  <Link
                    href='/about'
                    className='text-sm text-gray-400 transition-colors hover:text-white'
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href='/tutorial'
                    className='text-sm text-gray-400 transition-colors hover:text-white'
                  >
                    How to Use
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className='space-y-3'>
              <h3 className='text-sm font-semibold text-white'>Resources</h3>
              <ul className='space-y-3'>
                <li>
                  <a
                    href='https://protobuf.dev/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center text-sm text-gray-400 transition-colors hover:text-white'
                  >
                    Protocol Buffers
                    <ExternalLink className='ml-1 h-3 w-3' />
                  </a>
                </li>
                <li>
                  <a
                    href='https://grpc.io/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center text-sm text-gray-400 transition-colors hover:text-white'
                  >
                    gRPC
                    <ExternalLink className='ml-1 h-3 w-3' />
                  </a>
                </li>
                <li>
                  <a
                    href='https://github.com/rudyorre/protopeek'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center text-sm text-gray-400 transition-colors hover:text-white'
                  >
                    Source Code
                    <ExternalLink className='ml-1 h-3 w-3' />
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className='space-y-3'>
              <h3 className='text-sm font-semibold text-white'>Support</h3>
              <ul className='space-y-3'>
                <li>
                  <a
                    href='https://github.com/rudyorre/protopeek/issues'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center text-sm text-gray-400 transition-colors hover:text-white'
                  >
                    Report Issues
                    <ExternalLink className='ml-1 h-3 w-3' />
                  </a>
                </li>
                <li>
                  <Link
                    href='/privacy'
                    className='text-sm text-gray-400 transition-colors hover:text-white'
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className='mx-auto mt-12 max-w-4xl border-t border-gray-700 pt-8'>
          <div className='flex flex-col items-center justify-center text-center'>
            <p className='text-sm text-gray-400'>
              Made with ❤️ and ☕ by{' '}
              <a
                href='https://rudyorre.com'
                target='_blank'
                rel='noopener noreferrer'
                className='font-medium text-blue-400 transition-colors hover:text-blue-300'
              >
                Rudy Orre
              </a>
            </p>
            <p className='mt-2 text-xs text-gray-500'>
              © 2025 ProtoPeek · Open source protobuf decoder and visualizer
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

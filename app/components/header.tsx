import { Code, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VersionBadge } from './version-badge';
import Link from 'next/link';

export function Header() {
  return (
    <header className='w-full border-b border-gray-800 bg-[#202124] py-4'>
      <div className='container mx-auto px-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Link href="/" className='flex items-center gap-2 hover:opacity-80 transition-opacity duration-200'>
              <img 
                src="/logo.svg" 
                alt="ProtoPeek Logo" 
                className="h-8 w-8"
              />
              <div>
                <h1 className='text-title-large font-medium text-white tracking-tight'>ProtoPeek</h1>
                <div className='hidden text-label-medium text-gray-400 sm:block font-normal'>
                  by{' '}
                  <span 
                    className='text-blue-400 font-medium cursor-pointer hover:underline'
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.open('https://rudyorre.com', '_blank', 'noopener,noreferrer');
                    }}
                  >
                    Rudy Orre
                  </span>
                </div>
              </div>
            </Link>
          </div>

          <div className='flex items-center gap-3'>
            <VersionBadge />
            <a
              href='https://github.com/rudyorre/protopeek'
              target='_blank'
              rel='noopener noreferrer'
              className='text-gray-400 transition-colors hover:text-gray-200'
              aria-label='View on GitHub'
            >
              <Github className='h-5 w-5' />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

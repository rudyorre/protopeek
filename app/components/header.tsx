import { Code, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VersionBadge } from './version-badge';

export function Header() {
  return (
    <header className='w-full border-b border-gray-800 bg-[#202124] py-4'>
      <div className='container mx-auto px-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='rounded-full bg-blue-500 p-2'>
              <Code className='h-5 w-5 text-white' />
            </div>
            <div>
              <h1 className='text-xl font-medium text-white'>ProtoPeek</h1>
              <div className='hidden text-xs text-gray-400 sm:block'>
                by{' '}
                <a
                  href='https://rudyorre.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-400 hover:underline'
                >
                  Rudy Orre
                </a>
              </div>
            </div>
          </div>

          <div className='flex items-center gap-4'>
            <VersionBadge />
            <Button
              variant='outline'
              size='sm'
              className='border-gray-700 bg-[#303134] text-gray-200 hover:border-blue-500 hover:bg-[#303134]'
              asChild
            >
              <a
                href='https://github.com/rudyorre/protopeek'
                target='_blank'
                rel='noopener noreferrer'
              >
                <Github className='mr-2 h-4 w-4' />
                View on GitHub
              </a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

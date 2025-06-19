'use client';

import Link from 'next/link';
import { Info, Shield, BookOpen, Github, GitBranch } from 'lucide-react';
import { useGitHubRelease } from '../hooks/use-github-release';

function FooterVersion() {
  const { version, releaseUrl, isLoading } = useGitHubRelease();

  if (isLoading) {
    return (
      <span className='flex items-center gap-1 text-gray-400'>
        <GitBranch className='h-4 w-4' />
        Loading...
      </span>
    );
  }

  return (
    <a
      href={releaseUrl}
      target="_blank"
      rel="noopener noreferrer"
      className='flex items-center gap-1 text-gray-400 hover:text-white transition-colors'
    >
      <GitBranch className='h-4 w-4' />
      {version || 'Latest'}
    </a>
  );
}

export function Footer() {
  return (
    <footer className='w-full border-t border-gray-800 bg-[#202124]'>
      <div className='container mx-auto px-4 py-8'>
        <div className='flex flex-col space-y-6'>
          {/* Navigation Links - Left aligned with version on right */}
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div className='flex flex-wrap items-center gap-4 sm:gap-6 text-label-large'>
              <Link
                href='/about'
                className='flex items-center gap-2 text-gray-400 transition-colors hover:text-white'
              >
                <Info className='h-4 w-4' />
                Mission
              </Link>
              <Link
                href='/privacy'
                className='flex items-center gap-2 text-gray-400 transition-colors hover:text-white'
              >
                <Shield className='h-4 w-4' />
                Privacy
              </Link>
              <Link
                href='/tutorial'
                className='flex items-center gap-2 text-gray-400 transition-colors hover:text-white'
              >
                <BookOpen className='h-4 w-4' />
                How to Use
              </Link>
              <a
                href='https://github.com/rudyorre/protopeek'
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-2 text-gray-400 transition-colors hover:text-white'
              >
                <Github className='h-4 w-4' />
                Github
              </a>
            </div>
            
            {/* Version tag on the right */}
            <div className='flex-shrink-0'>
              <FooterVersion />
            </div>
          </div>

          {/* Bottom section with url and made with message on left */}
          <div className='flex items-center text-body-medium text-gray-400'>
            <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4'>
              <a
                href='https://protopeek.rudbase.com'
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-400 transition-colors hover:text-blue-300'
              >
                protopeek.rudbase.com
              </a>
              <span className='hidden sm:inline'>•</span>
              <p>
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
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

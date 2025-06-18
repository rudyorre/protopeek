'use client';

import Link from 'next/link';
import { Info, Shield, BookOpen, Github, GitBranch } from 'lucide-react';
import { useState, useEffect } from 'react';

interface GitHubRelease {
  tag_name: string;
  html_url: string;
}

function FooterVersion() {
  const [version, setVersion] = useState<string | null>(null);
  const [releaseUrl, setReleaseUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLatestRelease = async () => {
      try {
        const response = await fetch(
          'https://api.github.com/repos/rudyorre/protopeek/releases/latest'
        );
        
        if (response.ok) {
          const release: GitHubRelease = await response.json();
          setVersion(release.tag_name);
          setReleaseUrl(release.html_url);
        } else {
          // Fallback to releases page if no releases exist yet
          setReleaseUrl('https://github.com/rudyorre/protopeek/releases');
        }
      } catch (error) {
        console.error('Failed to fetch latest release:', error);
        // Fallback to releases page
        setReleaseUrl('https://github.com/rudyorre/protopeek/releases');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestRelease();
  }, []);

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
            <div className='flex flex-wrap items-center gap-4 sm:gap-6 text-sm'>
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
          <div className='flex items-center text-sm text-gray-400'>
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

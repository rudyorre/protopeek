'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';

interface GitHubRelease {
  tag_name: string;
  html_url: string;
}

export function VersionBadge() {
  const [version, setVersion] = useState<string>('v1.0.0');
  const [releaseUrl, setReleaseUrl] = useState<string>(
    'https://github.com/rudyorre/protopeek/releases'
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLatestRelease = async () => {
      try {
        const response = await fetch(
          'https://api.github.com/repos/rudyorre/protopeek/releases/latest'
        );

        if (response.ok) {
          const release: GitHubRelease = await response.json();
          if (release.tag_name) {
            setVersion(release.tag_name);
          }
          if (release.html_url) {
            setReleaseUrl(release.html_url);
          }
        }
      } catch {
        // Keep default v1.0.0 and releases URL
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestRelease();
  }, []);

  if (isLoading) {
    return (
      <Badge
        variant='outline'
        className='border-slate-800 bg-slate-900/80 font-mono text-[11px] text-slate-400'
      >
        v1.0.0
      </Badge>
    );
  }

  return (
    <a
      href={releaseUrl}
      target='_blank'
      rel='noopener noreferrer'
      className='inline-block transition-opacity hover:opacity-90'
    >
      <Badge
        variant='outline'
        className='flex cursor-pointer items-center gap-1 border-sky-500/30 bg-sky-500/10 px-2 py-0.5 font-mono text-[11px] font-medium text-sky-300 transition-colors hover:border-sky-400/60 hover:bg-sky-500/15'
      >
        {version}
        <ExternalLink className='h-2.5 w-2.5 opacity-75' />
      </Badge>
    </a>
  );
}

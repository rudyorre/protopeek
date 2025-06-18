'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';

interface GitHubRelease {
  tag_name: string;
  html_url: string;
}

export function VersionBadge() {
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
      <Badge 
        variant="secondary" 
        className="bg-gray-700 text-gray-300 animate-pulse cursor-default"
      >
        Loading...
      </Badge>
    );
  }

  return (
    <a
      href={releaseUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block transition-transform hover:scale-105"
    >
      <Badge 
        variant="outline" 
        className="border-blue-500/50 bg-blue-500/10 text-blue-400 hover:border-blue-400 hover:bg-blue-500/20 transition-colors cursor-pointer flex items-center gap-1"
      >
        {version || 'Latest'}
        <ExternalLink className="h-2.5 w-2.5" />
      </Badge>
    </a>
  );
}

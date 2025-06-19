'use client';

import { Badge } from '@/components/ui/badge';
import { ExternalLink, GitBranch } from 'lucide-react';
import { useGitHubRelease } from '../hooks/use-github-release';

export function VersionBadge() {
  const { version, releaseUrl, isLoading } = useGitHubRelease();

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
        <GitBranch className="h-2.5 w-2.5" />
        {version || 'Latest'}
        <ExternalLink className="h-2.5 w-2.5" />
      </Badge>
    </a>
  );
}

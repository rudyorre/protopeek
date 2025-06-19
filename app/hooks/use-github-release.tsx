'use client';

import { useState, useEffect } from 'react';

interface GitHubRelease {
  tag_name: string;
  html_url: string;
}

export function useGitHubRelease() {
  const [version, setVersion] = useState<string | null>(null);
  const [releaseUrl, setReleaseUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    // Try to get cached data first
    const loadCachedDataAndFetch = async () => {
      // Load cached data immediately
      try {
        const cached = localStorage.getItem('protopeek-version');
        const cachedUrl = localStorage.getItem('protopeek-release-url');
        
        if (cached && cachedUrl && !isCancelled) {
          setVersion(cached);
          setReleaseUrl(cachedUrl);
          setIsLoading(false);
        }
      } catch (error) {
        console.debug('localStorage not available');
      }

      // Check if we need to fetch fresh data
      const shouldFetch = (() => {
        try {
          const timestamp = localStorage.getItem('protopeek-version-timestamp');
          if (!timestamp) return true;
          
          const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour
          const cacheAge = Date.now() - parseInt(timestamp);
          return cacheAge >= CACHE_EXPIRY;
        } catch (error) {
          return true;
        }
      })();

      // Fetch fresh data if needed
      if (shouldFetch) {
        try {
          const response = await fetch(
            'https://api.github.com/repos/rudyorre/protopeek/releases/latest'
          );
          
          if (response.ok && !isCancelled) {
            const release: GitHubRelease = await response.json();
            setVersion(release.tag_name);
            setReleaseUrl(release.html_url);
            
            // Cache the result
            try {
              localStorage.setItem('protopeek-version', release.tag_name);
              localStorage.setItem('protopeek-release-url', release.html_url);
              localStorage.setItem('protopeek-version-timestamp', Date.now().toString());
            } catch (error) {
              console.debug('Unable to cache version in localStorage');
            }
          } else if (!response.ok && !isCancelled) {
            const fallbackUrl = 'https://github.com/rudyorre/protopeek/releases';
            if (!releaseUrl) setReleaseUrl(fallbackUrl);
          }
        } catch (error) {
          console.error('Failed to fetch latest release:', error);
          const fallbackUrl = 'https://github.com/rudyorre/protopeek/releases';
          if (!releaseUrl && !isCancelled) {
            setReleaseUrl(fallbackUrl);
          }
        }
      }

      // Ensure loading is false after everything
      if (!isCancelled) {
        setIsLoading(false);
      }
    };

    loadCachedDataAndFetch();

    return () => {
      isCancelled = true;
    };
  }, []);

  return { version, releaseUrl, isLoading };
}

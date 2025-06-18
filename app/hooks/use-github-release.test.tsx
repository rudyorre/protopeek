import { renderHook, waitFor } from '@testing-library/react';
import { useGitHubRelease } from '../use-github-release';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock fetch
global.fetch = jest.fn();

describe('useGitHubRelease', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should load cached version immediately if available', async () => {
    // Setup cache
    localStorageMock.getItem
      .mockReturnValueOnce('v1.2.3') // version
      .mockReturnValueOnce('https://github.com/rudyorre/protopeek/releases/tag/v1.2.3') // url
      .mockReturnValueOnce(Date.now().toString()); // timestamp

    const { result } = renderHook(() => useGitHubRelease());

    // Should immediately show cached version without loading state
    expect(result.current.version).toBe('v1.2.3');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.releaseUrl).toBe('https://github.com/rudyorre/protopeek/releases/tag/v1.2.3');
  });

  it('should fetch fresh data when cache is expired', async () => {
    // Setup expired cache
    const expiredTimestamp = (Date.now() - 2 * 60 * 60 * 1000).toString(); // 2 hours ago
    localStorageMock.getItem
      .mockReturnValueOnce('v1.2.3') // version
      .mockReturnValueOnce('https://github.com/rudyorre/protopeek/releases/tag/v1.2.3') // url
      .mockReturnValueOnce(expiredTimestamp); // expired timestamp

    // Mock fetch response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        tag_name: 'v1.3.0',
        html_url: 'https://github.com/rudyorre/protopeek/releases/tag/v1.3.0'
      })
    });

    const { result } = renderHook(() => useGitHubRelease());

    // Should show cached version initially
    expect(result.current.version).toBe('v1.2.3');
    expect(result.current.isLoading).toBe(false);

    // Wait for fetch to complete
    await waitFor(() => {
      expect(result.current.version).toBe('v1.3.0');
    });

    expect(result.current.releaseUrl).toBe('https://github.com/rudyorre/protopeek/releases/tag/v1.3.0');
  });

  it('should handle fetch errors gracefully', async () => {
    // No cache
    localStorageMock.getItem.mockReturnValue(null);

    // Mock fetch error
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useGitHubRelease());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.version).toBeNull();
    expect(result.current.releaseUrl).toBe('https://github.com/rudyorre/protopeek/releases');
  });
});

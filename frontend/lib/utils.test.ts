import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cn, getApiUrl } from './utils';

describe('cn utility', () => {
  it('merges tailwind classes correctly', () => {
    expect(cn('bg-red-500', 'p-4')).toBe('bg-red-500 p-4');
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });

  it('handles conditional classes', () => {
    expect(cn('p-4', true && 'm-2', false && 'hidden')).toBe('p-4 m-2');
  });
});

describe('getApiUrl', () => {
  const originalWindow = global.window;

  beforeEach(() => {
    vi.stubGlobal('window', undefined);
  });

  it('returns localhost fallback on server-side', () => {
    expect(getApiUrl()).toBe('http://localhost:8080');
  });

  it('returns dynamic hostname on client-side', () => {
    vi.stubGlobal('window', {
      location: {
        hostname: '192.168.1.5'
      }
    });
    expect(getApiUrl()).toBe('http://192.168.1.5:8080');
  });
});

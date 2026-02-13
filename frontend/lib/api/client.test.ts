import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from './client';
import { getApiUrl } from '../utils';

// Mock the utils
vi.mock('../utils', () => ({
  getApiUrl: vi.fn(() => 'http://localhost:3001/api'),
}));

describe('ApiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('performs a GET request correctly', async () => {
    const mockData = { id: 1, name: 'Test' };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await api.get('/test');
    
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/test',
      expect.objectContaining({
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
    );
    expect(result).toEqual(mockData);
  });

  it('performs a POST request with body', async () => {
    const mockBody = { name: 'New Item' };
    const mockResponse = { id: 2, ...mockBody };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await api.post('/test', mockBody);
    
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/test',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(mockBody),
        headers: { 'Content-Type': 'application/json' },
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it('handles query parameters', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await api.get('/test', { params: { search: 'term', limit: '10' } });
    
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/test?search=term&limit=10',
      expect.any(Object)
    );
  });

  it('throws ApiError on non-ok response', async () => {
    const errorData = { error: 'Not Found' };
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => errorData,
    });

    await expect(api.get('/test')).rejects.toThrow('Not Found');
  });

  it('handles network errors', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network failure'));

    await expect(api.get('/test')).rejects.toThrow('Network error occurred');
  });
});

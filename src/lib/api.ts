/**
 * Centralized API Client for Nyaya AI
 * Handles JWT injection, AbortController, Timeout, and unified error parsing.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface RequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
}

export class APIError extends Error {
  public status: number;
  public data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'APIError';
  }
}

async function fetchWithRetry(url: string, options: RequestOptions, retries: number): Promise<Response> {
  const { timeout = 15000, ...fetchOptions } = options;
  
  let currentController = new AbortController();
  // If user provided a signal, link them
  if (fetchOptions.signal) {
    fetchOptions.signal.addEventListener('abort', () => currentController.abort());
    // If it's already aborted, don't even start
    if (fetchOptions.signal.aborted) {
      currentController.abort();
    }
  }

  const timeoutId = setTimeout(() => currentController.abort(), timeout);

  try {
    const res = await fetch(url, {
      ...fetchOptions,
      signal: currentController.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const isRetryable = res.status >= 500 || res.status === 429;
      if (isRetryable && retries > 0) {
        // Exponential backoff
        await new Promise(r => setTimeout(r, 1000));
        return fetchWithRetry(url, options, retries - 1);
      }
      
      let errorData;
      try {
        errorData = await res.json();
      } catch (e) {
        errorData = { detail: await res.text() };
      }
      
      throw new APIError(
        errorData?.detail || `API request failed with status ${res.status}`,
        res.status,
        errorData
      );
    }
    
    return res;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw err;
    }
    // Network errors (fetch throws TypeError on network failure)
    if (retries > 0) {
      await new Promise(r => setTimeout(r, 1000));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw err;
  }
}

function buildHeaders(customHeaders?: HeadersInit): Headers {
  const headers = new Headers(customHeaders);
  
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // HttpOnly cookies handle auth automatically for same-origin requests
  return headers;
}

function resolveUrl(endpoint: string): string {
  // If endpoint is already absolute or relative path that includes api/v1 manually, adapt it.
  if (endpoint.startsWith('http')) return endpoint;
  
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  // Strip duplicate `/api/v1` if it exists, since BASE_URL already includes it
  if (cleanEndpoint.startsWith('/api/v1')) {
    cleanEndpoint = cleanEndpoint.replace('/api/v1', '');
  }
  return `${BASE_URL}${cleanEndpoint}`;
}

export const apiClient = {
  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const res = await fetchWithRetry(resolveUrl(endpoint), {
      ...options,
      method: 'GET',
      headers: buildHeaders(options.headers),
    }, options.retries || 0);
    return res.json();
  },

  async post<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    const res = await fetchWithRetry(resolveUrl(endpoint), {
      ...options,
      method: 'POST',
      headers: buildHeaders(options.headers),
      body: data ? JSON.stringify(data) : undefined,
    }, options.retries || 0);
    return res.json();
  },

  async put<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    const res = await fetchWithRetry(resolveUrl(endpoint), {
      ...options,
      method: 'PUT',
      headers: buildHeaders(options.headers),
      body: data ? JSON.stringify(data) : undefined,
    }, options.retries || 0);
    return res.json();
  },

  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const res = await fetchWithRetry(resolveUrl(endpoint), {
      ...options,
      method: 'DELETE',
      headers: buildHeaders(options.headers),
    }, options.retries || 0);
    return res.json();
  }
};

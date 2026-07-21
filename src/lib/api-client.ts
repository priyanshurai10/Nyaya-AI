/**
 * Centralized API Client for Nyaya AI
 * Handles authentication, timeouts, error parsing, logging, and base URL resolution.
 */

const API_VERSION = "v1";
// Resolve base URL: If NEXT_PUBLIC_API_URL is provided, use it. Otherwise, use relative path to trigger Next.js proxy rewrite.
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || `/api/${API_VERSION}`;
const DEFAULT_TIMEOUT_MS = 30000;

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export interface ApiRequestOptions extends RequestInit {
  timeout?: number;
  params?: Record<string, any>;
  requireAuth?: boolean;
  redirectOnAuthError?: boolean;
}

export class ApiClient {
  private generateRequestId(): string {
    return `req-${Math.random().toString(36).substring(2, 10)}-${Date.now()}`;
  }

  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    let finalPath = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    
    // Prevent duplicate /api/v1 if BASE_URL already contains /api/v1
    const base = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
    if ((base === "/api/v1" || base.endsWith("/api/v1")) && finalPath.startsWith("/api/v1")) {
      finalPath = finalPath.slice(7); // Remove leading /api/v1
    }

    let fullUrlString = "";
    if (base.startsWith("http://") || base.startsWith("https://")) {
      fullUrlString = `${base}${finalPath}`;
    } else {
      const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
      fullUrlString = `${origin}${base}${finalPath}`;
    }

    const url = new URL(fullUrlString);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  private getHeaders(options: ApiRequestOptions, isFormData = false): Headers {
    const headers = new Headers(options.headers || {});
    
    // Accept-Language
    if (!headers.has("Accept-Language")) {
      headers.set("Accept-Language", navigator.language || "en-US");
    }
    
    // Request ID
    if (!headers.has("X-Request-ID")) {
      headers.set("X-Request-ID", this.generateRequestId());
    }
    
    // Device Information / Timezone
    if (!headers.has("X-Timezone")) {
      headers.set("X-Timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
    
    // Content-Type (Only set if not FormData)
    if (!isFormData && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    
    // Authentication (Default true unless explicitly false)
    if (options.requireAuth !== false) {
      const token = localStorage.getItem("nyaya_token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }
    return headers;
  }

  private handleGlobalErrors(status: number, redirectOnAuthError = true) {
    if (status === 401) {
      if (redirectOnAuthError) {
        // Token expired or invalid
        localStorage.removeItem("nyaya_token");
        localStorage.removeItem("nyaya_user");
        window.location.href = "/auth?expired=true";
      }
    } else if (status === 403) {
      console.warn("[API] 403 Forbidden - Insufficient permissions");
    }
  }

  async request<T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const { timeout = DEFAULT_TIMEOUT_MS, params, ...fetchOptions } = options;
    const url = this.buildUrl(endpoint, params);
    const isFormData = fetchOptions.body instanceof FormData;
    const headers = this.getHeaders(options, isFormData);
    const controller = new AbortController();
    
    const id = setTimeout(() => controller.abort(), timeout);
    
    // If external signal is provided, link it
    if (fetchOptions.signal) {
      fetchOptions.signal.addEventListener("abort", () => controller.abort());
    }
    
    const isDev = process.env.NODE_ENV === "development";
    if (isDev) {
      console.log(`[API REQUEST] ${fetchOptions.method || "GET"} ${url}`);
    }
    
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal
      });
      clearTimeout(id);
      
      if (isDev) {
        console.log(`[API RESPONSE] ${response.status} ${url}`);
      }
      
      this.handleGlobalErrors(response.status, options.redirectOnAuthError);
      
      // Try parsing JSON, fallback to text
      let data: any;
      const contentType = response.headers.get("content-type");
      try {
        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          data = await response.text();
        }
      } catch (e) {
        data = null;
      }
      
      if (!response.ok) {
        throw new ApiError(
          response.status,
          data?.detail || data?.message || `HTTP Error ${response.status}`,
          data
        );
      }
      return data as T;
    } catch (error: any) {
      clearTimeout(id);
      if (error.name === "AbortError") {
        if (isDev) console.error(`[API TIMEOUT] ${url}`);
        throw new ApiError(408, "Request timed out. Please check your internet connection.");
      }
      if (error instanceof ApiError) {
        throw error;
      }
      if (!navigator.onLine) {
        throw new ApiError(0, "No internet connection. Please check your network.");
      }
      if (isDev) console.error(`[API NETWORK ERROR]`, error);
      throw new ApiError(503, "Service unavailable. Could not connect to the backend.");
    }
  }

  get<T = any>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "GET"
    });
  }

  post<T = any>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T> {
    const isFormData = data instanceof FormData;
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: isFormData ? data : data ? JSON.stringify(data) : undefined
    });
  }

  put<T = any>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T> {
    const isFormData = data instanceof FormData;
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: isFormData ? data : data ? JSON.stringify(data) : undefined
    });
  }

  patch<T = any>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T> {
    const isFormData = data instanceof FormData;
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: isFormData ? data : data ? JSON.stringify(data) : undefined
    });
  }

  delete<T = any>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "DELETE"
    });
  }

  /**
   * Dedicated method for uploading files with FormData.
   */
  upload<T = any>(endpoint: string, formData: FormData, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: formData
    });
  }

  /**
   * Dedicated method for downloading Blobs (PDF, ZIP, DOCX, etc.)
   */
  async download(endpoint: string, filename: string, options?: ApiRequestOptions & { body?: any; method?: string }): Promise<void> {
    const url = this.buildUrl(endpoint, options?.params);
    const headers = this.getHeaders(options || {}, false);
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), options?.timeout || DEFAULT_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        method: options?.method || "GET",
        headers,
        signal: controller.signal,
        body: options?.body
      });
      clearTimeout(id);
      this.handleGlobalErrors(response.status, options?.redirectOnAuthError);
      if (!response.ok) {
        throw new ApiError(response.status, "Download failed.");
      }
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
export default apiClient;

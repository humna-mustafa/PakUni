/**
 * Unified HTTP Client with Retry Logic & Request Timeout
 * 
 * Features:
 * - Automatic retry with exponential backoff
 * - Request timeout protection
 * - Connection error handling
 * - Response validation
 * - Network status awareness
 */

import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface HttpRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: string | object;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface HttpResponse<T = any> {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: T;
  error?: Error;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_TIMEOUT_MS = 15000; // 15 seconds
const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 1000;
const MAX_TIMEOUT_MS = 30000; // Hard limit 30s
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504]; // Timeout, Too Many Requests, Server errors

// ============================================================================
// HTTP CLIENT
// ============================================================================

class HttpClient {
  private activeRequests = new Map<string, AbortController>();

  /**
   * Perform HTTP request with automatic retry and timeout
   */
  async request<T = any>(
    url: string,
    config: HttpRequestConfig = {}
  ): Promise<HttpResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = DEFAULT_TIMEOUT_MS,
      retries = DEFAULT_RETRIES,
      retryDelay = DEFAULT_RETRY_DELAY_MS,
    } = config;

    // Validate timeout
    const safeTimeout = Math.min(timeout, MAX_TIMEOUT_MS);

    // Generate request ID for logging
    const requestId = `${method.toUpperCase()} ${url} [${Date.now()}]`;

    logger.debug(`HTTP Request: ${requestId}`, { method, url, timeout: safeTimeout }, 'HttpClient');

    let lastError: Error | null = null;
    let lastResponse: HttpResponse<T> | null = null;

    // Retry loop with exponential backoff
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
          logger.debug(
            `Retry attempt ${attempt}/${retries} after ${delay}ms`,
            { url, attempt },
            'HttpClient'
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        const response = await this.performFetch<T>(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
          timeout: safeTimeout,
        });

        // If successful, return immediately
        if (response.ok || !RETRYABLE_STATUS_CODES.includes(response.status)) {
          logger.debug(`HTTP Response: ${response.status} ${response.statusText}`, { url }, 'HttpClient');
          return response;
        }

        // Store for retry logic
        lastResponse = response;
        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);

        // If not retryable status, break
        if (!RETRYABLE_STATUS_CODES.includes(response.status)) {
          break;
        }

        logger.warn(
          `Retryable HTTP error: ${response.status}`,
          { url, status: response.status },
          'HttpClient'
        );
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        logger.warn(
          `HTTP request failed: ${lastError.message}`,
          { url, attempt, error: lastError.message },
          'HttpClient'
        );
      }
    }

    // All retries exhausted
    logger.error(
      `HTTP request failed after ${retries + 1} attempts`,
      lastError || new Error('Unknown error'),
      'HttpClient'
    );

    // Return last response if available, otherwise create error response
    if (lastResponse) {
      return lastResponse;
    }

    return {
      ok: false,
      status: 0,
      statusText: 'Network Error',
      headers: {},
      data: null as any,
      error: lastError || new Error('Unknown network error'),
    };
  }

  /**
   * Perform actual fetch with timeout
   */
  private performFetch<T = any>(
    url: string,
    config: {
      method?: string;
      headers?: Record<string, string>;
      body?: string;
      timeout: number;
    }
  ): Promise<HttpResponse<T>> {
    return new Promise((resolve) => {
      let timedOut = false;
      let completed = false;

      // Setup timeout
      const timeoutId = setTimeout(() => {
        timedOut = true;
        if (!completed) {
          completed = true;
          resolve({
            ok: false,
            status: 408,
            statusText: 'Request Timeout',
            headers: {},
            data: null as any,
            error: new Error(`Request timeout after ${config.timeout}ms`),
          });
        }
      }, config.timeout);

      // Perform fetch
      fetch(url, {
        method: config.method || 'GET',
        headers: config.headers,
        body: config.body,
      })
        .then(async (response) => {
          clearTimeout(timeoutId);

          if (timedOut || completed) return;
          completed = true;

          try {
            let data: any = null;
            const contentType = response.headers.get('content-type');

            if (contentType?.includes('application/json')) {
              data = await response.json();
            } else {
              data = await response.text();
            }

            resolve({
              ok: response.ok,
              status: response.status,
              statusText: response.statusText,
              headers: Object.fromEntries(response.headers),
              data,
            });
          } catch (error) {
            resolve({
              ok: false,
              status: response.status,
              statusText: response.statusText,
              headers: Object.fromEntries(response.headers),
              data: null as any,
              error: error instanceof Error ? error : new Error(String(error)),
            });
          }
        })
        .catch((error) => {
          clearTimeout(timeoutId);

          if (timedOut || completed) return;
          completed = true;

          resolve({
            ok: false,
            status: 0,
            statusText: 'Network Error',
            headers: {},
            data: null as any,
            error: error instanceof Error ? error : new Error(String(error)),
          });
        });
    });
  }

  /**
   * GET request
   */
  get<T = any>(url: string, config?: Omit<HttpRequestConfig, 'method' | 'body'>): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  /**
   * POST request
   */
  post<T = any>(
    url: string,
    body?: any,
    config?: Omit<HttpRequestConfig, 'method' | 'body'>
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...config, method: 'POST', body });
  }

  /**
   * PUT request
   */
  put<T = any>(
    url: string,
    body?: any,
    config?: Omit<HttpRequestConfig, 'method' | 'body'>
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...config, method: 'PUT', body });
  }

  /**
   * DELETE request
   */
  delete<T = any>(url: string, config?: Omit<HttpRequestConfig, 'method' | 'body'>): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }

  /**
   * Cancel a request by URL pattern
   */
  cancel(urlPattern: string | RegExp): void {
    const pattern = typeof urlPattern === 'string' ? new RegExp(urlPattern) : urlPattern;

    for (const [url, controller] of this.activeRequests.entries()) {
      if (pattern.test(url)) {
        controller.abort();
        this.activeRequests.delete(url);
      }
    }
  }

  /**
   * Cancel all requests
   */
  cancelAll(): void {
    for (const controller of this.activeRequests.values()) {
      controller.abort();
    }
    this.activeRequests.clear();
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const httpClient = new HttpClient();

// Convenience methods
export const http = {
  get: (url: string, config?: Omit<HttpRequestConfig, 'method' | 'body'>) =>
    httpClient.get(url, config),
  post: (url: string, body?: any, config?: Omit<HttpRequestConfig, 'method' | 'body'>) =>
    httpClient.post(url, body, config),
  put: (url: string, body?: any, config?: Omit<HttpRequestConfig, 'method' | 'body'>) =>
    httpClient.put(url, body, config),
  delete: (url: string, config?: Omit<HttpRequestConfig, 'method' | 'body'>) =>
    httpClient.delete(url, config),
  cancel: (urlPattern: string | RegExp) => httpClient.cancel(urlPattern),
  cancelAll: () => httpClient.cancelAll(),
};

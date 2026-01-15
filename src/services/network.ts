/**
 * Network Service - Enterprise-grade API and network utilities
 * Handles API calls, caching, offline support, and error handling
 */

import {Platform} from 'react-native';
import NetInfo, {NetInfoState} from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {logger} from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
  details: any;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  status: number;
  cached: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  status?: number;
  details?: any;
}

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  cache?: boolean;
  cacheDuration?: number; // in milliseconds
  retryCount?: number;
  retryDelay?: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

// ============================================================================
// ERROR CODES
// ============================================================================

export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  SERVER_ERROR: 'SERVER_ERROR',
  CLIENT_ERROR: 'CLIENT_ERROR',
  PARSE_ERROR: 'PARSE_ERROR',
  OFFLINE: 'OFFLINE',
  UNKNOWN: 'UNKNOWN',
  CANCELED: 'CANCELED',
} as const;

// ============================================================================
// CACHE KEYS
// ============================================================================

const CACHE_PREFIX = '@pakuni_cache_';
const CACHE_INDEX_KEY = '@pakuni_cache_index';

// ============================================================================
// NETWORK SERVICE
// ============================================================================

class NetworkService {
  private baseUrl: string = '';
  private defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  private authToken: string | null = null;
  private networkState: NetworkState = {
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
    details: null,
  };
  private networkListeners: Set<(state: NetworkState) => void> = new Set();
  private pendingRequests: Map<string, AbortController> = new Map();
  private cacheIndex: Set<string> = new Set();

  constructor() {
    this.initNetworkListener();
    this.loadCacheIndex();
  }

  /**
   * Initialize network state listener
   */
  private initNetworkListener(): void {
    // Note: NetInfo needs to be installed: @react-native-community/netinfo
    try {
      NetInfo.addEventListener((state: NetInfoState) => {
        this.networkState = {
          isConnected: state.isConnected ?? false,
          isInternetReachable: state.isInternetReachable,
          type: state.type,
          details: state.details,
        };
        this.notifyNetworkListeners();
      });
    } catch (error) {
      logger.warn('NetInfo not available, using fallback');
    }
  }

  /**
   * Notify all network listeners
   */
  private notifyNetworkListeners(): void {
    this.networkListeners.forEach(listener => listener(this.networkState));
  }

  /**
   * Subscribe to network state changes
   */
  subscribeToNetwork(listener: (state: NetworkState) => void): () => void {
    this.networkListeners.add(listener);
    listener(this.networkState); // Immediate callback with current state
    return () => this.networkListeners.delete(listener);
  }

  /**
   * Get current network state
   */
  getNetworkState(): NetworkState {
    return this.networkState;
  }

  /**
   * Check if device is online
   */
  isOnline(): boolean {
    return this.networkState.isConnected;
  }

  /**
   * Set base URL for API calls
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string | null): void {
    this.authToken = token;
    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.defaultHeaders['Authorization'];
    }
  }

  /**
   * Set default headers
   */
  setDefaultHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = {...this.defaultHeaders, ...headers};
  }

  /**
   * Make an API request with full error handling
   */
  async request<T>(
    endpoint: string,
    config: RequestConfig = {},
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = 30000,
      cache = false,
      cacheDuration = 5 * 60 * 1000, // 5 minutes default
      retryCount = 0,
      retryDelay = 1000,
    } = config;

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    const cacheKey = this.getCacheKey(url, method, body);

    // Check cache first for GET requests
    if (method === 'GET' && cache) {
      const cachedResponse = await this.getFromCache<T>(cacheKey);
      if (cachedResponse) {
        return {
          data: cachedResponse,
          error: null,
          status: 200,
          cached: true,
        };
      }
    }

    // Check if offline
    if (!this.isOnline()) {
      // Try to return cached data even if expired
      if (method === 'GET') {
        const cachedResponse = await this.getFromCache<T>(cacheKey, true);
        if (cachedResponse) {
          return {
            data: cachedResponse,
            error: null,
            status: 200,
            cached: true,
          };
        }
      }

      return {
        data: null,
        error: {
          code: ERROR_CODES.OFFLINE,
          message: 'No internet connection. Please check your network and try again.',
        },
        status: 0,
        cached: false,
      };
    }

    // Create abort controller for timeout
    const abortController = new AbortController();
    const requestId = `${method}-${url}-${Date.now()}`;
    this.pendingRequests.set(requestId, abortController);

    const timeoutId = setTimeout(() => abortController.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {...this.defaultHeaders, ...headers},
        body: body ? JSON.stringify(body) : undefined,
        signal: abortController.signal,
      });

      clearTimeout(timeoutId);
      this.pendingRequests.delete(requestId);

      // Parse response
      let data: T | null = null;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        try {
          data = await response.json();
        } catch (e) {
          // Empty response or invalid JSON
        }
      }

      // Handle error responses
      if (!response.ok) {
        const error = this.createErrorFromResponse(response.status, data);
        
        // Retry logic
        if (retryCount > 0 && this.shouldRetry(response.status)) {
          await this.delay(retryDelay);
          return this.request<T>(endpoint, {
            ...config,
            retryCount: retryCount - 1,
            retryDelay: retryDelay * 2, // Exponential backoff
          });
        }

        return {
          data: null,
          error,
          status: response.status,
          cached: false,
        };
      }

      // Cache successful GET responses
      if (method === 'GET' && cache && data) {
        await this.saveToCache(cacheKey, data, cacheDuration);
      }

      return {
        data,
        error: null,
        status: response.status,
        cached: false,
      };

    } catch (error: any) {
      clearTimeout(timeoutId);
      this.pendingRequests.delete(requestId);

      if (error.name === 'AbortError') {
        return {
          data: null,
          error: {
            code: ERROR_CODES.TIMEOUT,
            message: 'Request timed out. Please try again.',
          },
          status: 0,
          cached: false,
        };
      }

      // Retry on network errors
      if (retryCount > 0) {
        await this.delay(retryDelay);
        return this.request<T>(endpoint, {
          ...config,
          retryCount: retryCount - 1,
          retryDelay: retryDelay * 2,
        });
      }

      return {
        data: null,
        error: {
          code: ERROR_CODES.NETWORK_ERROR,
          message: 'Network error. Please check your connection and try again.',
          details: error.message,
        },
        status: 0,
        cached: false,
      };
    }
  }

  /**
   * Convenience methods for HTTP verbs
   */
  async get<T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {...config, method: 'GET'});
  }

  async post<T>(endpoint: string, body?: any, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {...config, method: 'POST', body});
  }

  async put<T>(endpoint: string, body?: any, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {...config, method: 'PUT', body});
  }

  async patch<T>(endpoint: string, body?: any, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {...config, method: 'PATCH', body});
  }

  async delete<T>(endpoint: string, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {...config, method: 'DELETE'});
  }

  /**
   * Cancel all pending requests
   */
  cancelAllRequests(): void {
    this.pendingRequests.forEach(controller => controller.abort());
    this.pendingRequests.clear();
  }

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  /**
   * Generate cache key
   */
  private getCacheKey(url: string, method: string, body?: any): string {
    const bodyHash = body ? JSON.stringify(body) : '';
    return `${CACHE_PREFIX}${method}_${url}_${bodyHash}`;
  }

  /**
   * Load cache index from storage
   */
  private async loadCacheIndex(): Promise<void> {
    try {
      const indexJson = await AsyncStorage.getItem(CACHE_INDEX_KEY);
      if (indexJson) {
        this.cacheIndex = new Set(JSON.parse(indexJson));
      }
    } catch (error) {
      logger.warn('Failed to load cache index:', error);
    }
  }

  /**
   * Save cache index to storage
   */
  private async saveCacheIndex(): Promise<void> {
    try {
      await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify([...this.cacheIndex]));
    } catch (error) {
      logger.warn('Failed to save cache index:', error);
    }
  }

  /**
   * Get data from cache
   */
  private async getFromCache<T>(key: string, ignoreExpiry = false): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      
      if (!ignoreExpiry && Date.now() > entry.expiry) {
        // Cache expired, remove it
        await this.removeFromCache(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      logger.warn('Cache read error:', error);
      return null;
    }
  }

  /**
   * Save data to cache
   */
  private async saveToCache<T>(key: string, data: T, duration: number): Promise<void> {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + duration,
      };
      
      await AsyncStorage.setItem(key, JSON.stringify(entry));
      this.cacheIndex.add(key);
      await this.saveCacheIndex();
    } catch (error) {
      logger.warn('Cache write error:', error);
    }
  }

  /**
   * Remove item from cache
   */
  private async removeFromCache(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      this.cacheIndex.delete(key);
      await this.saveCacheIndex();
    } catch (error) {
      logger.warn('Cache remove error:', error);
    }
  }

  /**
   * Clear all cache
   */
  async clearCache(): Promise<void> {
    try {
      const keys = [...this.cacheIndex];
      await AsyncStorage.multiRemove(keys);
      this.cacheIndex.clear();
      await this.saveCacheIndex();
    } catch (error) {
      logger.warn('Cache clear error:', error);
    }
  }

  /**
   * Get cache size (approximate)
   */
  getCacheSize(): number {
    return this.cacheIndex.size;
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  /**
   * Create error from response
   */
  private createErrorFromResponse(status: number, data: any): ApiError {
    if (status >= 500) {
      return {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Server error. Please try again later.',
        status,
        details: data,
      };
    }

    if (status >= 400) {
      return {
        code: ERROR_CODES.CLIENT_ERROR,
        message: data?.message || 'Request failed. Please check your input.',
        status,
        details: data,
      };
    }

    return {
      code: ERROR_CODES.UNKNOWN,
      message: 'An unexpected error occurred.',
      status,
    };
  }

  /**
   * Check if should retry based on status code
   */
  private shouldRetry(status: number): boolean {
    return status >= 500 || status === 408 || status === 429;
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const network = new NetworkService();

// ============================================================================
// REACT HOOKS
// ============================================================================

import {useState, useEffect, useCallback, useRef} from 'react';

/**
 * Hook to track network state
 */
export const useNetworkState = (): NetworkState => {
  const [state, setState] = useState<NetworkState>(network.getNetworkState());

  useEffect(() => {
    return network.subscribeToNetwork(setState);
  }, []);

  return state;
};

/**
 * Hook to check if online
 */
export const useIsOnline = (): boolean => {
  const state = useNetworkState();
  return state.isConnected;
};

/**
 * Hook for data fetching with loading/error states
 */
export const useFetch = <T>(
  endpoint: string,
  config?: RequestConfig & {
    enabled?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: ApiError) => void;
  },
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const mountedRef = useRef(true);

  const enabled = config?.enabled ?? true;

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    const response = await network.get<T>(endpoint, config);

    if (!mountedRef.current) return;

    if (response.error) {
      setError(response.error);
      config?.onError?.(response.error);
    } else {
      setData(response.data);
      if (response.data) {
        config?.onSuccess?.(response.data);
      }
    }

    setLoading(false);
  }, [endpoint, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    isFromCache: false,
  };
};

export default network;

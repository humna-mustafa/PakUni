/**
 * useDebounce Hook
 * Debounces a value or callback for optimal performance
 */

import {useState, useEffect, useCallback, useRef} from 'react';

/**
 * Debounces a value - returns the debounced version after delay
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns Debounced value
 * 
 * @example
 * const [searchQuery, setSearchQuery] = useState('');
 * const debouncedQuery = useDebouncedValue(searchQuery, 300);
 * 
 * useEffect(() => {
 *   // This only runs when user stops typing for 300ms
 *   searchAPI(debouncedQuery);
 * }, [debouncedQuery]);
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Debounces a callback function
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns Debounced callback and cancel function
 * 
 * @example
 * const handleSearch = useDebouncedCallback((query: string) => {
 *   searchAPI(query);
 * }, 300);
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300,
): [(...args: Parameters<T>) => void, () => void] {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      cancel();
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay, cancel],
  );

  // Cleanup on unmount
  useEffect(() => {
    return cancel;
  }, [cancel]);

  return [debouncedCallback, cancel];
}

/**
 * Throttles a callback - only allows one call per interval
 * @param callback - The function to throttle
 * @param interval - Minimum time between calls in milliseconds
 * @returns Throttled callback
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  interval: number = 300,
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback);
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallRef.current;

      if (timeSinceLastCall >= interval) {
        lastCallRef.current = now;
        callbackRef.current(...args);
      } else {
        // Schedule a call for when the interval expires
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          callbackRef.current(...args);
        }, interval - timeSinceLastCall);
      }
    },
    [interval],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
}

/**
 * Hook for search functionality with debouncing
 * @param initialValue - Initial search value
 * @param delay - Debounce delay (default: 300ms)
 */
export function useSearch(initialValue: string = '', delay: number = 300) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const debouncedSearchTerm = useDebouncedValue(searchTerm, delay);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setIsSearching(searchTerm !== debouncedSearchTerm);
  }, [searchTerm, debouncedSearchTerm]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    isSearching,
    clearSearch,
  };
}

export default {
  useDebouncedValue,
  useDebouncedCallback,
  useThrottledCallback,
  useSearch,
};

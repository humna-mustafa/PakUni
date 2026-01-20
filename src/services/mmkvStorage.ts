/**
 * MMKV Storage Service
 * Uses react-native-mmkv - 30x faster than AsyncStorage
 * 
 * Why MMKV?
 * - Created by Tencent (WeChat), handles billions of users
 * - Synchronous API (no async/await needed)
 * - 30x faster than AsyncStorage
 * - Encrypted storage option
 * - Cross-platform (iOS, Android)
 * - Used by major apps: WeChat, Instagram, Discord
 */

import {MMKV} from 'react-native-mmkv';

// Create storage instances
const storage = new MMKV({
  id: 'pakuni-main-storage',
});


// Secure storage for sensitive data (encrypted)
const secureStorage = new MMKV({
  id: 'pakuni-secure-storage',
  encryptionKey: 'pakuni-encryption-key-2025',
});

// Cache storage (can be cleared without affecting user data)
const cacheStorage = new MMKV({
  id: 'pakuni-cache-storage',
});

// Type-safe storage wrapper
export const MMKVStorage = {
  // ============================================
  // STRING OPERATIONS
  // ============================================
  
  getString: (key: string): string | undefined => {
    return storage.getString(key);
  },
  
  setString: (key: string, value: string): void => {
    storage.set(key, value);
  },
  
  // ============================================
  // NUMBER OPERATIONS
  // ============================================
  
  getNumber: (key: string): number | undefined => {
    return storage.getNumber(key);
  },
  
  setNumber: (key: string, value: number): void => {
    storage.set(key, value);
  },
  
  // ============================================
  // BOOLEAN OPERATIONS
  // ============================================
  
  getBoolean: (key: string): boolean | undefined => {
    return storage.getBoolean(key);
  },
  
  setBoolean: (key: string, value: boolean): void => {
    storage.set(key, value);
  },
  
  // ============================================
  // OBJECT OPERATIONS (JSON serialized)
  // ============================================
  
  getObject: <T>(key: string): T | undefined => {
    const value = storage.getString(key);
    if (value) {
      try {
        return JSON.parse(value) as T;
      } catch (e) {
        console.warn(`MMKV: Failed to parse object for key ${key}`);
        return undefined;
      }
    }
    return undefined;
  },
  
  setObject: <T>(key: string, value: T): void => {
    storage.set(key, JSON.stringify(value));
  },
  
  // ============================================
  // UTILITY OPERATIONS
  // ============================================
  
  delete: (key: string): void => {
    storage.delete(key);
  },
  
  contains: (key: string): boolean => {
    return storage.contains(key);
  },
  
  getAllKeys: (): string[] => {
    return storage.getAllKeys();
  },
  
  clearAll: (): void => {
    storage.clearAll();
  },
};

// Secure storage for tokens, passwords, etc.
export const SecureMMKVStorage = {
  getString: (key: string): string | undefined => {
    return secureStorage.getString(key);
  },
  
  setString: (key: string, value: string): void => {
    secureStorage.set(key, value);
  },
  
  getObject: <T>(key: string): T | undefined => {
    const value = secureStorage.getString(key);
    if (value) {
      try {
        return JSON.parse(value) as T;
      } catch (e) {
        return undefined;
      }
    }
    return undefined;
  },
  
  setObject: <T>(key: string, value: T): void => {
    secureStorage.set(key, JSON.stringify(value));
  },
  
  delete: (key: string): void => {
    secureStorage.delete(key);
  },
  
  clearAll: (): void => {
    secureStorage.clearAll();
  },
};

// Cache storage with TTL support
export const CacheMMKVStorage = {
  get: <T>(key: string): T | undefined => {
    const cached = cacheStorage.getString(key);
    if (!cached) return undefined;
    
    try {
      const {value, expiry} = JSON.parse(cached);
      
      // Check if expired
      if (expiry && Date.now() > expiry) {
        cacheStorage.delete(key);
        return undefined;
      }
      
      return value as T;
    } catch (e) {
      return undefined;
    }
  },
  
  set: <T>(key: string, value: T, ttlMs?: number): void => {
    const cached = {
      value,
      expiry: ttlMs ? Date.now() + ttlMs : null,
      timestamp: Date.now(),
    };
    cacheStorage.set(key, JSON.stringify(cached));
  },
  
  delete: (key: string): void => {
    cacheStorage.delete(key);
  },
  
  clearAll: (): void => {
    cacheStorage.clearAll();
  },
  
  // Clear expired entries
  clearExpired: (): number => {
    let cleared = 0;
    const keys = cacheStorage.getAllKeys();
    
    for (const key of keys) {
      const cached = cacheStorage.getString(key);
      if (cached) {
        try {
          const {expiry} = JSON.parse(cached);
          if (expiry && Date.now() > expiry) {
            cacheStorage.delete(key);
            cleared++;
          }
        } catch (e) {
          // Invalid entry, delete it
          cacheStorage.delete(key);
          cleared++;
        }
      }
    }
    
    return cleared;
  },
};

// Pre-defined cache keys for type safety
export const CACHE_KEYS = {
  // User data
  USER_PROFILE: 'user_profile',
  USER_FAVORITES: 'user_favorites',
  USER_PREFERENCES: 'user_preferences',
  
  // App data
  UNIVERSITIES: 'universities_cache',
  SCHOLARSHIPS: 'scholarships_cache',
  ENTRY_TESTS: 'entry_tests_cache',
  CAREERS: 'careers_cache',
  
  // UI state
  LAST_TAB: 'last_active_tab',
  THEME_MODE: 'theme_mode',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  
  // Analytics
  SESSION_COUNT: 'session_count',
  LAST_SESSION: 'last_session_timestamp',
} as const;

// TTL constants
export const CACHE_TTL = {
  SHORT: 5 * 60 * 1000,        // 5 minutes
  MEDIUM: 30 * 60 * 1000,      // 30 minutes
  LONG: 24 * 60 * 60 * 1000,   // 24 hours
  WEEK: 7 * 24 * 60 * 60 * 1000, // 1 week
} as const;

// React hook for MMKV storage
import {useState, useCallback, useEffect} from 'react';

export function useMMKVStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T) => void, () => void] {
  const [value, setValue] = useState<T>(() => {
    const stored = MMKVStorage.getObject<T>(key);
    return stored !== undefined ? stored : defaultValue;
  });

  const setStoredValue = useCallback((newValue: T) => {
    setValue(newValue);
    MMKVStorage.setObject(key, newValue);
  }, [key]);

  const removeValue = useCallback(() => {
    setValue(defaultValue);
    MMKVStorage.delete(key);
  }, [key, defaultValue]);

  return [value, setStoredValue, removeValue];
}

// Hook for cached data with TTL
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = CACHE_TTL.MEDIUM
): {
  data: T | undefined;
  isLoading: boolean;
  error: Error | undefined;
  refresh: () => Promise<void>;
} {
  const [data, setData] = useState<T | undefined>(() => CacheMMKVStorage.get<T>(key));
  const [isLoading, setIsLoading] = useState(!data);
  const [error, setError] = useState<Error | undefined>();

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      const freshData = await fetcher();
      CacheMMKVStorage.set(key, freshData, ttlMs);
      setData(freshData);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, ttlMs]);

  useEffect(() => {
    if (!data) {
      refresh();
    }
  }, []);

  return {data, isLoading, error, refresh};
}

// ============================================
// CacheStorage - Compatible API for cache.ts service
// Uses the cacheStorage instance directly for cache.ts integration
// ============================================
export const CacheStorage = {
  getString: (key: string): string | undefined => {
    return cacheStorage.getString(key);
  },
  
  setString: (key: string, value: string): void => {
    cacheStorage.set(key, value);
  },
  
  getObject: <T>(key: string): T | undefined => {
    const value = cacheStorage.getString(key);
    if (value) {
      try {
        return JSON.parse(value) as T;
      } catch (e) {
        console.warn(`CacheStorage: Failed to parse object for key ${key}`);
        return undefined;
      }
    }
    return undefined;
  },
  
  setObject: <T>(key: string, value: T): void => {
    cacheStorage.set(key, JSON.stringify(value));
  },
  
  delete: (key: string): void => {
    cacheStorage.delete(key);
  },
  
  getAllKeys: (): string[] => {
    return cacheStorage.getAllKeys();
  },
  
  clearAll: (): void => {
    cacheStorage.clearAll();
  },
};

export default MMKVStorage;

/**
 * Cache Service - Optimized for Supabase Free Tier
 * 
 * CRITICAL: This service minimizes egress by:
 * - Caching all data locally with AsyncStorage
 * - Using stale-while-revalidate pattern
 * - Batching requests to reduce API calls
 * - No real-time subscriptions (saves massive egress)
 * - Manual refresh triggers only
 * 
 * Supabase Free Tier Limits:
 * - 500MB Database
 * - 5GB Bandwidth (egress) per month
 * - 1GB Storage
 * - 50,000 MAUs
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {logger} from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface CacheConfig {
  /** Time-to-live in milliseconds (default: 24 hours) */
  ttl: number;
  /** Whether to return stale data while fetching fresh (default: true) */
  staleWhileRevalidate: boolean;
  /** Maximum cache size in bytes (default: 10MB) */
  maxSize: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  version: number;
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitCount: number;
  missCount: number;
  lastCleanup: number;
}

// ============================================================================
// CACHE KEYS - Centralized key management
// ============================================================================

export const CACHE_KEYS = {
  // Main data
  UNIVERSITIES: 'pakuni_cache_universities',
  SCHOLARSHIPS: 'pakuni_cache_scholarships',
  PROGRAMS: 'pakuni_cache_programs',
  FIELDS: 'pakuni_cache_fields',
  MERIT_FORMULAS: 'pakuni_cache_merit_formulas',
  ENTRY_TESTS: 'pakuni_cache_entry_tests',
  CAREERS: 'pakuni_cache_careers',
  
  // User data
  USER_PROFILE: 'pakuni_cache_user_profile',
  USER_FAVORITES: 'pakuni_cache_user_favorites',
  USER_CALCULATIONS: 'pakuni_cache_user_calculations',
  USER_GOALS: 'pakuni_cache_user_goals',
  
  // App data
  ANNOUNCEMENTS: 'pakuni_cache_announcements',
  APP_SETTINGS: 'pakuni_cache_app_settings',
  
  // Admin data (only for admins)
  ADMIN_STATS: 'pakuni_cache_admin_stats',
  ADMIN_USERS: 'pakuni_cache_admin_users',
  ADMIN_REPORTS: 'pakuni_cache_admin_reports',
  ADMIN_FEEDBACK: 'pakuni_cache_admin_feedback',
  ADMIN_AUDIT_LOGS: 'pakuni_cache_admin_audit_logs',
  
  // Metadata
  CACHE_STATS: 'pakuni_cache_stats',
  CACHE_VERSION: 'pakuni_cache_version',
  LAST_SYNC: 'pakuni_cache_last_sync',
} as const;

// ============================================================================
// CACHE CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: CacheConfig = {
  ttl: 24 * 60 * 60 * 1000, // 24 hours - minimize API calls
  staleWhileRevalidate: true,
  maxSize: 10 * 1024 * 1024, // 10MB
};

// Different TTLs for different data types
export const CACHE_TTL = {
  // Static data - rarely changes (7 days)
  UNIVERSITIES: 7 * 24 * 60 * 60 * 1000,
  SCHOLARSHIPS: 7 * 24 * 60 * 60 * 1000,
  PROGRAMS: 7 * 24 * 60 * 60 * 1000,
  MERIT_FORMULAS: 7 * 24 * 60 * 60 * 1000,
  ENTRY_TESTS: 7 * 24 * 60 * 60 * 1000,
  CAREERS: 7 * 24 * 60 * 60 * 1000,
  FIELDS: 7 * 24 * 60 * 60 * 1000,
  
  // Semi-static data (24 hours)
  APP_SETTINGS: 24 * 60 * 60 * 1000,
  
  // Dynamic data (1 hour) - refresh more often
  ANNOUNCEMENTS: 60 * 60 * 1000,
  USER_PROFILE: 60 * 60 * 1000,
  
  // Admin data (15 minutes) - needs fresher data
  ADMIN_STATS: 15 * 60 * 1000,
  ADMIN_USERS: 15 * 60 * 1000,
  ADMIN_REPORTS: 15 * 60 * 1000,
  ADMIN_FEEDBACK: 15 * 60 * 1000,
};

// Current cache version - increment to invalidate all caches
const CACHE_VERSION = 1;

// ============================================================================
// CACHE SERVICE CLASS
// ============================================================================

class CacheService {
  private config: CacheConfig;
  private stats: CacheStats;
  private memoryCache: Map<string, CacheEntry<any>>;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {...DEFAULT_CONFIG, ...config};
    this.stats = {
      totalEntries: 0,
      totalSize: 0,
      hitCount: 0,
      missCount: 0,
      lastCleanup: Date.now(),
    };
    this.memoryCache = new Map();
    
    // Initialize cache
    this.initialize();
  }

  // -------------------------------------------------------------------------
  // INITIALIZATION
  // -------------------------------------------------------------------------

  private async initialize(): Promise<void> {
    try {
      // Check cache version
      const storedVersion = await AsyncStorage.getItem(CACHE_KEYS.CACHE_VERSION);
      if (storedVersion !== String(CACHE_VERSION)) {
        logger.debug('Version mismatch, clearing cache', null, 'Cache');
        await this.clearAll();
        await AsyncStorage.setItem(CACHE_KEYS.CACHE_VERSION, String(CACHE_VERSION));
      }

      // Load stats
      const statsStr = await AsyncStorage.getItem(CACHE_KEYS.CACHE_STATS);
      if (statsStr) {
        this.stats = JSON.parse(statsStr);
      }

      // Cleanup expired entries on startup
      await this.cleanup();
    } catch (error) {
      logger.error('Initialization error', error, 'Cache');
    }
  }

  // -------------------------------------------------------------------------
  // CORE CACHE OPERATIONS
  // -------------------------------------------------------------------------

  /**
   * Get data from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      // Check memory cache first
      const memEntry = this.memoryCache.get(key);
      if (memEntry && memEntry.expiresAt > Date.now()) {
        this.stats.hitCount++;
        return memEntry.data as T;
      }

      // Check persistent cache
      const stored = await AsyncStorage.getItem(key);
      if (!stored) {
        this.stats.missCount++;
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(stored);
      
      // Check if expired
      if (entry.expiresAt < Date.now()) {
        this.stats.missCount++;
        // Don't delete - might use stale data
        return this.config.staleWhileRevalidate ? entry.data : null;
      }

      // Update memory cache
      this.memoryCache.set(key, entry);
      this.stats.hitCount++;
      
      return entry.data;
    } catch (error) {
      logger.error(`Get error for ${key}`, error, 'Cache');
      this.stats.missCount++;
      return null;
    }
  }

  /**
   * Set data in cache
   */
  async set<T>(key: string, data: T, ttl?: number): Promise<boolean> {
    try {
      const now = Date.now();
      const entry: CacheEntry<T> = {
        data,
        timestamp: now,
        expiresAt: now + (ttl || this.config.ttl),
        version: CACHE_VERSION,
      };

      const serialized = JSON.stringify(entry);
      
      // Check size
      if (serialized.length > this.config.maxSize) {
        logger.warn(`Entry too large for ${key}`, null, 'Cache');
        return false;
      }

      // Save to both caches
      await AsyncStorage.setItem(key, serialized);
      this.memoryCache.set(key, entry);
      
      this.stats.totalEntries++;
      await this.saveStats();
      
      return true;
    } catch (error) {
      logger.error(`Set error for ${key}`, error, 'Cache');
      return false;
    }
  }

  /**
   * Remove data from cache
   */
  async remove(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      this.memoryCache.delete(key);
      this.stats.totalEntries = Math.max(0, this.stats.totalEntries - 1);
      await this.saveStats();
      return true;
    } catch (error) {
      logger.error(`Remove error for ${key}`, error, 'Cache');
      return false;
    }
  }

  /**
   * Check if cache entry exists and is valid
   */
  async has(key: string): Promise<boolean> {
    const data = await this.get(key);
    return data !== null;
  }

  /**
   * Get data with stale-while-revalidate pattern
   * Returns stale data immediately and fetches fresh data in background
   */
  async getWithRevalidate<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number,
  ): Promise<T | null> {
    try {
      // Try to get from cache first
      const cached = await this.get<T>(key);
      
      // Check if we need to revalidate
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        const entry: CacheEntry<T> = JSON.parse(stored);
        const isStale = entry.expiresAt < Date.now();
        
        if (isStale && this.config.staleWhileRevalidate) {
          // Return stale data and revalidate in background
          this.revalidateInBackground(key, fetcher, ttl);
          return cached;
        }
      }

      // If no cached data, fetch fresh
      if (!cached) {
        const fresh = await fetcher();
        await this.set(key, fresh, ttl);
        return fresh;
      }

      return cached;
    } catch (error) {
      logger.error(`GetWithRevalidate error for ${key}`, error, 'Cache');
      return null;
    }
  }

  /**
   * Revalidate cache entry in background
   */
  private async revalidateInBackground<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number,
  ): Promise<void> {
    try {
      const fresh = await fetcher();
      await this.set(key, fresh, ttl);
    } catch (error) {
      logger.error(`Background revalidate error for ${key}`, error, 'Cache');
    }
  }

  // -------------------------------------------------------------------------
  // BATCH OPERATIONS
  // -------------------------------------------------------------------------

  /**
   * Get multiple cache entries at once
   */
  async getMany<T>(keys: string[]): Promise<Record<string, T | null>> {
    const results: Record<string, T | null> = {};
    
    // Use Promise.all for parallel fetching
    await Promise.all(
      keys.map(async (key) => {
        results[key] = await this.get<T>(key);
      })
    );
    
    return results;
  }

  /**
   * Set multiple cache entries at once
   */
  async setMany<T>(entries: Array<{key: string; data: T; ttl?: number}>): Promise<boolean> {
    try {
      await Promise.all(
        entries.map(({key, data, ttl}) => this.set(key, data, ttl))
      );
      return true;
    } catch (error) {
      logger.error('SetMany error', error, 'Cache');
      return false;
    }
  }

  // -------------------------------------------------------------------------
  // CACHE MANAGEMENT
  // -------------------------------------------------------------------------

  /**
   * Clear all cache entries
   */
  async clearAll(): Promise<void> {
    try {
      const keys = Object.values(CACHE_KEYS);
      await AsyncStorage.multiRemove(keys);
      this.memoryCache.clear();
      this.stats = {
        totalEntries: 0,
        totalSize: 0,
        hitCount: 0,
        missCount: 0,
        lastCleanup: Date.now(),
      };
      await this.saveStats();
      logger.debug('All entries cleared', null, 'Cache');
    } catch (error) {
      logger.error('Clear all error', error, 'Cache');
    }
  }

  /**
   * Clear cache entries by prefix
   */
  async clearByPrefix(prefix: string): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const keysToRemove = allKeys.filter(key => key.startsWith(prefix));
      await AsyncStorage.multiRemove(keysToRemove);
      
      // Also clear from memory cache
      for (const key of keysToRemove) {
        this.memoryCache.delete(key);
      }
      
      logger.debug(`Cleared ${keysToRemove.length} entries with prefix ${prefix}`, null, 'Cache');
    } catch (error) {
      logger.error('Clear by prefix error', error, 'Cache');
    }
  }

  /**
   * Cleanup expired entries
   */
  async cleanup(): Promise<void> {
    try {
      const now = Date.now();
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith('pakuni_cache_'));
      
      let cleaned = 0;
      
      for (const key of cacheKeys) {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          try {
            const entry = JSON.parse(stored);
            // Only remove if really old (2x TTL)
            if (entry.expiresAt && entry.expiresAt < now - this.config.ttl) {
              await AsyncStorage.removeItem(key);
              this.memoryCache.delete(key);
              cleaned++;
            }
          } catch {
            // Invalid entry, remove it
            await AsyncStorage.removeItem(key);
            cleaned++;
          }
        }
      }
      
      this.stats.lastCleanup = now;
      await this.saveStats();
      
      if (cleaned > 0) {
        logger.debug(`Cleaned up ${cleaned} expired entries`, null, 'Cache');
      }
    } catch (error) {
      logger.error('Cleanup error', error, 'Cache');
    }
  }

  // -------------------------------------------------------------------------
  // STATS & MONITORING
  // -------------------------------------------------------------------------

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return {...this.stats};
  }

  /**
   * Get cache hit rate
   */
  getHitRate(): number {
    const total = this.stats.hitCount + this.stats.missCount;
    return total > 0 ? this.stats.hitCount / total : 0;
  }

  /**
   * Save stats to storage
   */
  private async saveStats(): Promise<void> {
    try {
      await AsyncStorage.setItem(CACHE_KEYS.CACHE_STATS, JSON.stringify(this.stats));
    } catch (error) {
      logger.error('Save stats error', error, 'Cache');
    }
  }

  /**
   * Get last sync timestamp
   */
  async getLastSync(): Promise<number | null> {
    try {
      const lastSync = await AsyncStorage.getItem(CACHE_KEYS.LAST_SYNC);
      return lastSync ? parseInt(lastSync, 10) : null;
    } catch {
      return null;
    }
  }

  /**
   * Update last sync timestamp
   */
  async updateLastSync(): Promise<void> {
    await AsyncStorage.setItem(CACHE_KEYS.LAST_SYNC, String(Date.now()));
  }

  // -------------------------------------------------------------------------
  // SPECIALIZED GETTERS (Type-safe convenience methods)
  // -------------------------------------------------------------------------

  async getUniversities<T>(): Promise<T | null> {
    return this.get<T>(CACHE_KEYS.UNIVERSITIES);
  }

  async getScholarships<T>(): Promise<T | null> {
    return this.get<T>(CACHE_KEYS.SCHOLARSHIPS);
  }

  async getPrograms<T>(): Promise<T | null> {
    return this.get<T>(CACHE_KEYS.PROGRAMS);
  }

  async getAnnouncements<T>(): Promise<T | null> {
    return this.get<T>(CACHE_KEYS.ANNOUNCEMENTS);
  }

  async getAppSettings<T>(): Promise<T | null> {
    return this.get<T>(CACHE_KEYS.APP_SETTINGS);
  }

  async getUserProfile<T>(): Promise<T | null> {
    return this.get<T>(CACHE_KEYS.USER_PROFILE);
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const cache = new CacheService();
export default cache;

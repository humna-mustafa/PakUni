/**
 * Offline Service - Complete Offline-First Architecture
 * 
 * Features:
 * - Automatic data sync when online
 * - Queue for offline actions
 * - Network state detection
 * - Data freshness indicators
 * - Sync progress tracking
 * 
 * Designed for Pakistan's variable internet connectivity
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, {NetInfoState} from '@react-native-community/netinfo';
import {cache, CACHE_KEYS, CACHE_TTL} from './cache';
import {UNIVERSITIES} from '../data/universities';
import {SCHOLARSHIPS} from '../data/scholarships';
import {PROGRAMS} from '../data/programs';
import {ENTRY_TESTS_DATA} from '../data/entryTests';
import {MERIT_FORMULAS} from '../data/meritFormulas';
import {CAREER_FIELDS, CAREER_PATHS} from '../data/careers';
import {POLLS_DATA} from '../data/polls';
import {ADMISSION_DEADLINES} from '../data/deadlines';
import {MERIT_RECORDS} from '../data/meritArchive';
import {logger} from '../utils/logger';

// Scoped logger for offline service
const log = logger.scope('Offline');

// ============================================================================
// TYPES
// ============================================================================

export interface OfflineAction {
  id: string;
  type: 'vote' | 'follow' | 'calculation' | 'favorite' | 'feedback';
  payload: any;
  timestamp: number;
  retryCount: number;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: number | null;
  isSyncing: boolean;
  syncProgress: number;
  pendingActions: number;
  dataFreshness: 'fresh' | 'stale' | 'offline';
}

export interface DataModule {
  key: string;
  name: string;
  data: any;
  size: number;
  lastUpdated: number;
  isCritical: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const OFFLINE_KEYS = {
  OFFLINE_QUEUE: '@pakuni_offline_queue',
  SYNC_STATUS: '@pakuni_sync_status',
  DATA_MANIFEST: '@pakuni_data_manifest',
  INITIAL_LOAD_COMPLETE: '@pakuni_initial_load',
} as const;

// Data modules to sync (in priority order)
const DATA_MODULES: Array<{
  key: string;
  name: string;
  getData: () => any;
  cacheKey: string;
  ttl: number;
  isCritical: boolean;
}> = [
  {
    key: 'universities',
    name: 'Universities',
    getData: () => UNIVERSITIES,
    cacheKey: CACHE_KEYS.UNIVERSITIES,
    ttl: CACHE_TTL.UNIVERSITIES,
    isCritical: true,
  },
  {
    key: 'scholarships',
    name: 'Scholarships',
    getData: () => SCHOLARSHIPS,
    cacheKey: CACHE_KEYS.SCHOLARSHIPS,
    ttl: CACHE_TTL.SCHOLARSHIPS,
    isCritical: true,
  },
  {
    key: 'programs',
    name: 'Programs',
    getData: () => PROGRAMS,
    cacheKey: CACHE_KEYS.PROGRAMS,
    ttl: CACHE_TTL.PROGRAMS,
    isCritical: true,
  },
  {
    key: 'entryTests',
    name: 'Entry Tests',
    getData: () => ENTRY_TESTS_DATA,
    cacheKey: CACHE_KEYS.ENTRY_TESTS,
    ttl: CACHE_TTL.ENTRY_TESTS,
    isCritical: true,
  },
  {
    key: 'meritFormulas',
    name: 'Merit Formulas',
    getData: () => MERIT_FORMULAS,
    cacheKey: CACHE_KEYS.MERIT_FORMULAS,
    ttl: CACHE_TTL.MERIT_FORMULAS,
    isCritical: true,
  },
  {
    key: 'careers',
    name: 'Careers',
    getData: () => ({fields: CAREER_FIELDS, paths: CAREER_PATHS}),
    cacheKey: CACHE_KEYS.CAREERS,
    ttl: CACHE_TTL.CAREERS,
    isCritical: false,
  },
  {
    key: 'polls',
    name: 'Polls',
    getData: () => POLLS_DATA,
    cacheKey: '@pakuni_cache_polls',
    ttl: 60 * 60 * 1000, // 1 hour
    isCritical: false,
  },
  {
    key: 'deadlines',
    name: 'Deadlines',
    getData: () => ADMISSION_DEADLINES,
    cacheKey: '@pakuni_cache_deadlines',
    ttl: 60 * 60 * 1000, // 1 hour
    isCritical: false,
  },
  {
    key: 'meritArchive',
    name: 'Merit Archive',
    getData: () => MERIT_RECORDS,
    cacheKey: '@pakuni_cache_merit_archive',
    ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
    isCritical: false,
  },
];

// ============================================================================
// OFFLINE SERVICE CLASS
// ============================================================================

class OfflineService {
  private isOnline: boolean = true;
  private syncStatus: SyncStatus;
  private offlineQueue: OfflineAction[] = [];
  private listeners: Set<(status: SyncStatus) => void> = new Set();
  private networkUnsubscribe: (() => void) | null = null;

  constructor() {
    this.syncStatus = {
      isOnline: true,
      lastSyncTime: null,
      isSyncing: false,
      syncProgress: 0,
      pendingActions: 0,
      dataFreshness: 'fresh',
    };

    this.initialize();
  }

  // -------------------------------------------------------------------------
  // INITIALIZATION
  // -------------------------------------------------------------------------

  private async initialize(): Promise<void> {
    try {
      // Load offline queue
      const queueStr = await AsyncStorage.getItem(OFFLINE_KEYS.OFFLINE_QUEUE);
      if (queueStr) {
        this.offlineQueue = JSON.parse(queueStr);
      }

      // Load sync status
      const statusStr = await AsyncStorage.getItem(OFFLINE_KEYS.SYNC_STATUS);
      if (statusStr) {
        const saved = JSON.parse(statusStr);
        this.syncStatus = {...this.syncStatus, ...saved};
      }

      // Setup network listener
      this.networkUnsubscribe = NetInfo.addEventListener(this.handleNetworkChange.bind(this));

      // Check initial network state
      const state = await NetInfo.fetch();
      this.handleNetworkChange(state);

      log.info('Service initialized');
    } catch (error) {
      log.error('Initialization error', error);
    }
  }

  // -------------------------------------------------------------------------
  // NETWORK HANDLING
  // -------------------------------------------------------------------------

  private handleNetworkChange(state: NetInfoState): void {
    const wasOnline = this.isOnline;
    this.isOnline = state.isConnected === true && state.isInternetReachable !== false;

    this.syncStatus.isOnline = this.isOnline;
    this.notifyListeners();

    // Coming back online - sync pending actions
    if (!wasOnline && this.isOnline) {
      log.info('Back online - syncing pending actions');
      this.syncPendingActions();
    }

    // Going offline
    if (wasOnline && !this.isOnline) {
      log.info('Gone offline');
    }
  }

  /**
   * Check if device is currently online
   */
  getIsOnline(): boolean {
    return this.isOnline;
  }

  // -------------------------------------------------------------------------
  // DATA SYNC
  // -------------------------------------------------------------------------

  /**
   * Perform initial data load (run on app first launch)
   */
  async performInitialLoad(): Promise<boolean> {
    try {
      // Check if already loaded
      const loaded = await AsyncStorage.getItem(OFFLINE_KEYS.INITIAL_LOAD_COMPLETE);
      if (loaded === 'true') {
        log.debug('Initial load already complete');
        return true;
      }

      log.info('Performing initial data load...');
      
      this.syncStatus.isSyncing = true;
      this.syncStatus.syncProgress = 0;
      this.notifyListeners();

      const totalModules = DATA_MODULES.length;
      let loadedModules = 0;

      for (const module of DATA_MODULES) {
        try {
          const data = module.getData();
          await cache.set(module.cacheKey, data, module.ttl);
          loadedModules++;
          this.syncStatus.syncProgress = (loadedModules / totalModules) * 100;
          this.notifyListeners();
        } catch (error) {
          log.error(`Failed to cache ${module.name}`, error);
          if (module.isCritical) {
            throw error;
          }
        }
      }

      // Mark initial load as complete
      await AsyncStorage.setItem(OFFLINE_KEYS.INITIAL_LOAD_COMPLETE, 'true');
      
      this.syncStatus.isSyncing = false;
      this.syncStatus.lastSyncTime = Date.now();
      this.syncStatus.dataFreshness = 'fresh';
      this.notifyListeners();
      await this.saveSyncStatus();

      log.info('Initial load complete');
      return true;
    } catch (error) {
      log.error('Initial load failed', error);
      this.syncStatus.isSyncing = false;
      this.notifyListeners();
      return false;
    }
  }

  /**
   * Sync all data (for manual refresh)
   */
  async syncAllData(): Promise<boolean> {
    if (this.syncStatus.isSyncing) {
      log.debug('Sync already in progress');
      return false;
    }

    if (!this.isOnline) {
      log.warn('Cannot sync - device is offline');
      return false;
    }

    try {
      log.info('Starting full data sync...');
      
      this.syncStatus.isSyncing = true;
      this.syncStatus.syncProgress = 0;
      this.notifyListeners();

      const totalModules = DATA_MODULES.length;
      let syncedModules = 0;

      for (const module of DATA_MODULES) {
        try {
          const data = module.getData();
          await cache.set(module.cacheKey, data, module.ttl);
          syncedModules++;
          this.syncStatus.syncProgress = (syncedModules / totalModules) * 100;
          this.notifyListeners();
        } catch (error) {
          log.error(`Failed to sync ${module.name}`, error);
        }
      }

      // Sync pending actions
      await this.syncPendingActions();

      this.syncStatus.isSyncing = false;
      this.syncStatus.lastSyncTime = Date.now();
      this.syncStatus.dataFreshness = 'fresh';
      this.notifyListeners();
      await this.saveSyncStatus();

      log.info('Full sync complete');
      return true;
    } catch (error) {
      log.error('Sync failed', error);
      this.syncStatus.isSyncing = false;
      this.notifyListeners();
      return false;
    }
  }

  // -------------------------------------------------------------------------
  // OFFLINE QUEUE
  // -------------------------------------------------------------------------

  /**
   * Add action to offline queue
   */
  async queueAction(type: OfflineAction['type'], payload: any): Promise<string> {
    const action: OfflineAction = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.offlineQueue.push(action);
    this.syncStatus.pendingActions = this.offlineQueue.length;
    this.notifyListeners();
    await this.saveQueue();

    // If online, try to process immediately
    if (this.isOnline) {
      this.syncPendingActions();
    }

    return action.id;
  }

  /**
   * Sync pending actions when online
   */
  private async syncPendingActions(): Promise<void> {
    if (!this.isOnline || this.offlineQueue.length === 0) {
      return;
    }

    log.info(`Syncing ${this.offlineQueue.length} pending actions...`);

    const actionsToRemove: string[] = [];

    for (const action of this.offlineQueue) {
      try {
        // Process based on action type
        switch (action.type) {
          case 'vote':
            // In production: await api.submitVote(action.payload);
            log.debug('Syncing vote', action.payload);
            break;
          case 'follow':
            // In production: await api.updateFollow(action.payload);
            log.debug('Syncing follow', action.payload);
            break;
          case 'calculation':
            // In production: await api.saveCalculation(action.payload);
            log.debug('Syncing calculation', action.payload);
            break;
          case 'favorite':
            // In production: await api.updateFavorite(action.payload);
            log.debug('Syncing favorite', action.payload);
            break;
          case 'feedback':
            // In production: await api.submitFeedback(action.payload);
            log.debug('Syncing feedback', action.payload);
            break;
        }
        
        actionsToRemove.push(action.id);
      } catch (error) {
        log.error(`Failed to sync action ${action.id}`, error);
        action.retryCount++;
        
        // Remove after 3 retries
        if (action.retryCount >= 3) {
          actionsToRemove.push(action.id);
        }
      }
    }

    // Remove processed actions
    this.offlineQueue = this.offlineQueue.filter(a => !actionsToRemove.includes(a.id));
    this.syncStatus.pendingActions = this.offlineQueue.length;
    this.notifyListeners();
    await this.saveQueue();

    log.info('Pending actions synced');
  }

  /**
   * Get pending actions count
   */
  getPendingActionsCount(): number {
    return this.offlineQueue.length;
  }

  // -------------------------------------------------------------------------
  // DATA ACCESS (Offline-First)
  // -------------------------------------------------------------------------

  /**
   * Get data with offline-first approach
   */
  async getData<T>(key: string): Promise<T | null> {
    // Always try cache first
    const cached = await cache.get<T>(key);
    
    if (cached) {
      return cached;
    }

    // If online, try to fetch fresh
    if (this.isOnline) {
      const module = DATA_MODULES.find(m => m.cacheKey === key);
      if (module) {
        const data = module.getData();
        await cache.set(key, data, module.ttl);
        return data as T;
      }
    }

    return null;
  }

  /**
   * Check data freshness
   */
  async checkDataFreshness(): Promise<'fresh' | 'stale' | 'offline'> {
    if (!this.isOnline) {
      return 'offline';
    }

    const lastSync = this.syncStatus.lastSyncTime;
    if (!lastSync) {
      return 'stale';
    }

    // Data is fresh if synced within last 24 hours
    const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
    if (lastSync > dayAgo) {
      return 'fresh';
    }

    return 'stale';
  }

  // -------------------------------------------------------------------------
  // STATUS & LISTENERS
  // -------------------------------------------------------------------------

  /**
   * Get current sync status
   */
  getSyncStatus(): SyncStatus {
    return {...this.syncStatus};
  }

  /**
   * Subscribe to sync status changes
   */
  subscribe(listener: (status: SyncStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(): void {
    const status = this.getSyncStatus();
    this.listeners.forEach(listener => listener(status));
  }

  // -------------------------------------------------------------------------
  // PERSISTENCE
  // -------------------------------------------------------------------------

  private async saveQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        OFFLINE_KEYS.OFFLINE_QUEUE,
        JSON.stringify(this.offlineQueue)
      );
    } catch (error) {
      log.error('Failed to save queue', error);
    }
  }

  private async saveSyncStatus(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        OFFLINE_KEYS.SYNC_STATUS,
        JSON.stringify({
          lastSyncTime: this.syncStatus.lastSyncTime,
          dataFreshness: this.syncStatus.dataFreshness,
        })
      );
    } catch (error) {
      log.error('Failed to save sync status', error);
    }
  }

  // -------------------------------------------------------------------------
  // CLEANUP
  // -------------------------------------------------------------------------

  /**
   * Cleanup service (call on app unmount)
   */
  cleanup(): void {
    if (this.networkUnsubscribe) {
      this.networkUnsubscribe();
    }
    this.listeners.clear();
  }

  /**
   * Clear all offline data
   */
  async clearAllData(): Promise<void> {
    await cache.clearAll();
    this.offlineQueue = [];
    this.syncStatus = {
      isOnline: this.isOnline,
      lastSyncTime: null,
      isSyncing: false,
      syncProgress: 0,
      pendingActions: 0,
      dataFreshness: 'offline',
    };
    await AsyncStorage.removeItem(OFFLINE_KEYS.INITIAL_LOAD_COMPLETE);
    await this.saveQueue();
    await this.saveSyncStatus();
    this.notifyListeners();
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const offlineService = new OfflineService();
export default offlineService;

// ============================================================================
// REACT HOOK
// ============================================================================

import {useState, useEffect} from 'react';

export function useOfflineStatus(): SyncStatus {
  const [status, setStatus] = useState<SyncStatus>(offlineService.getSyncStatus());

  useEffect(() => {
    const unsubscribe = offlineService.subscribe(setStatus);
    return unsubscribe;
  }, []);

  return status;
}

export function useIsOffline(): boolean {
  const status = useOfflineStatus();
  return !status.isOnline;
}

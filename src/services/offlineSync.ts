/**
 * Offline Sync Service
 * 
 * Handles offline queue, intelligent retry with exponential backoff,
 * and conflict resolution for user data operations.
 * 
 * Features:
 * - Auto-queue operations when offline
 * - Smart retry with exponential backoff
 * - Conflict detection and resolution
 * - Batch operation support
 * - Deduplication
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { logger } from '../utils/logger';
import { hybridDataService } from './hybridData';

// ============================================================================
// TYPES
// ============================================================================

export type SyncOperation = 'create' | 'update' | 'delete' | 'custom';

export interface QueuedOperation {
  id: string;
  type: SyncOperation;
  resource: string; // e.g., 'user_profile', 'favorite_university'
  resourceId?: string;
  action: string; // e.g., 'updateProfile', 'addFavorite'
  payload: Record<string, any>;
  timestamp: number;
  retries: number;
  maxRetries: number;
  lastError?: string;
  priority: 'low' | 'normal' | 'high'; // high priority syncs first
}

export interface SyncConflict {
  operationId: string;
  reason: 'version_mismatch' | 'deleted_remotely' | 'modified_remotely';
  localData: Record<string, any>;
  remoteData?: Record<string, any>;
  resolution?: 'keep_local' | 'use_remote' | 'merge';
}

export interface SyncResult {
  success: boolean;
  operationId: string;
  error?: string;
  conflict?: SyncConflict;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const QUEUE_STORAGE_KEY = '@pakuni_sync_queue';
const CONFLICTS_STORAGE_KEY = '@pakuni_sync_conflicts';
const SYNC_STATUS_KEY = '@pakuni_sync_status';
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY_MS = 1000; // 1 second
const MAX_RETRY_DELAY_MS = 60000; // 1 minute
const BATCH_SIZE = 10; // Process 10 ops at a time

// ============================================================================
// OFFLINE SYNC SERVICE
// ============================================================================

class OfflineSyncService {
  private queue: QueuedOperation[] = [];
  private isOnline = true;
  private isSyncing = false;
  private syncInProgress = new Map<string, Promise<SyncResult>>();
  private networkUnsubscribe: (() => void) | null = null;

  /**
   * Initialize the sync service
   */
  async initialize(): Promise<void> {
    try {
      // Load queue from storage
      await this.loadQueue();

      // Check initial network status
      const state = await NetInfo.fetch();
      this.isOnline = state.isConnected ?? false;

      // Listen to network changes
      this.networkUnsubscribe = NetInfo.addEventListener((state) => {
        this.handleNetworkStatusChange(state.isConnected ?? false);
      });

      logger.info('Offline sync service initialized', { isOnline: this.isOnline }, 'OfflineSync');

      // Start syncing if online
      if (this.isOnline) {
        this.startSync();
      }
    } catch (error) {
      logger.error('Failed to initialize offline sync service', error as Error, 'OfflineSync');
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.networkUnsubscribe) {
      this.networkUnsubscribe();
    }
  }

  /**
   * Add operation to queue
   */
  async queueOperation(
    operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retries'>
  ): Promise<string> {
    const operationId = `${operation.resource}_${operation.resourceId}_${Date.now()}`;

    const queuedOp: QueuedOperation = {
      ...operation,
      id: operationId,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: operation.maxRetries || MAX_RETRIES,
    };

    this.queue.push(queuedOp);
    await this.persistQueue();

    logger.debug(`Operation queued: ${operationId}`, { operation: queuedOp }, 'OfflineSync');

    // If online, attempt immediate sync
    if (this.isOnline) {
      this.startSync();
    }

    return operationId;
  }

  /**
   * Get queue status
   */
  getQueueStatus() {
    return {
      pending: this.queue.length,
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      operations: this.queue.map((op) => ({
        id: op.id,
        resource: op.resource,
        action: op.action,
        retries: op.retries,
        priority: op.priority,
      })),
    };
  }

  /**
   * Clear queue (use with caution - for logout, etc)
   */
  async clearQueue(): Promise<void> {
    this.queue = [];
    await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);
    logger.warn('Sync queue cleared', undefined, 'OfflineSync');
  }

  /**
   * Handle network status change
   */
  private handleNetworkStatusChange(isOnline: boolean): void {
    const wasOnline = this.isOnline;
    this.isOnline = isOnline;

    if (!wasOnline && isOnline) {
      logger.info('Network reconnected', undefined, 'OfflineSync');
      this.startSync();
    } else if (wasOnline && !isOnline) {
      logger.warn('Network disconnected', undefined, 'OfflineSync');
    }
  }

  /**
   * Start syncing queued operations
   */
  private async startSync(): Promise<void> {
    if (this.isSyncing || !this.isOnline || this.queue.length === 0) {
      return;
    }

    this.isSyncing = true;
    logger.info(`Starting sync: ${this.queue.length} operations pending`, undefined, 'OfflineSync');

    try {
      // Sort by priority and timestamp
      this.queue.sort((a, b) => {
        const priorityMap = { high: 0, normal: 1, low: 2 };
        const priorityDiff = priorityMap[a.priority] - priorityMap[b.priority];
        return priorityDiff !== 0 ? priorityDiff : a.timestamp - b.timestamp;
      });

      // Process in batches
      for (let i = 0; i < this.queue.length; i += BATCH_SIZE) {
        const batch = this.queue.slice(i, i + BATCH_SIZE);
        const results = await Promise.all(batch.map((op) => this.syncOperation(op)));

        // Handle results
        for (const result of results) {
          if (result.success) {
            this.queue = this.queue.filter((op) => op.id !== result.operationId);
          } else if (result.conflict) {
            await this.handleConflict(result.conflict);
          }
        }

        // Check if still online
        if (!this.isOnline) {
          break;
        }
      }

      // Persist updated queue
      await this.persistQueue();

      logger.info(
        `Sync completed: ${this.queue.length} operations remaining`,
        undefined,
        'OfflineSync'
      );
    } catch (error) {
      logger.error('Sync error', error as Error, 'OfflineSync');
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync a single operation
   */
  private async syncOperation(operation: QueuedOperation): Promise<SyncResult> {
    // Check for in-progress sync
    if (this.syncInProgress.has(operation.id)) {
      return this.syncInProgress.get(operation.id)!;
    }

    const promise = this.performSync(operation);
    this.syncInProgress.set(operation.id, promise);

    try {
      const result = await promise;
      return result;
    } finally {
      this.syncInProgress.delete(operation.id);
    }
  }

  /**
   * Perform actual sync with retry logic
   */
  private async performSync(operation: QueuedOperation): Promise<SyncResult> {
    while (operation.retries < operation.maxRetries) {
      try {
        // Execute the operation (this would call the actual API)
        const result = await this.executeOperation(operation);

        logger.info(`Operation synced: ${operation.id}`, undefined, 'OfflineSync');
        return { success: true, operationId: operation.id };
      } catch (error) {
        operation.retries++;
        operation.lastError = (error as Error).message;

        if (operation.retries >= operation.maxRetries) {
          logger.error(
            `Operation failed after ${operation.maxRetries} retries: ${operation.id}`,
            error as Error,
            'OfflineSync'
          );
          return {
            success: false,
            operationId: operation.id,
            error: `Max retries exceeded: ${(error as Error).message}`,
          };
        }

        // Exponential backoff
        const delay = Math.min(
          INITIAL_RETRY_DELAY_MS * Math.pow(2, operation.retries - 1),
          MAX_RETRY_DELAY_MS
        );

        logger.warn(
          `Retry ${operation.retries}/${operation.maxRetries} after ${delay}ms`,
          { operationId: operation.id },
          'OfflineSync'
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    return {
      success: false,
      operationId: operation.id,
      error: 'Max retries exceeded',
    };
  }

  /**
   * Execute operation against backend via hybridDataService
   */
  private async executeOperation(operation: QueuedOperation): Promise<void> {
    const { action, payload, resourceId } = operation;

    switch (action) {
      case 'addFavorite': {
        const success = await hybridDataService.addFavorite(payload.type, payload.itemId);
        if (!success) throw new Error('addFavorite failed');
        break;
      }
      case 'removeFavorite': {
        const success = await hybridDataService.removeFavorite(resourceId || payload.favoriteId);
        if (!success) throw new Error('removeFavorite failed');
        break;
      }
      case 'saveCalculation': {
        const success = await hybridDataService.saveCalculation(payload as any);
        if (!success) throw new Error('saveCalculation failed');
        break;
      }
      case 'updateGoal': {
        const success = await hybridDataService.updateGoal(resourceId || payload.goalId, payload.updates);
        if (!success) throw new Error('updateGoal failed');
        break;
      }
      case 'deleteGoal': {
        const success = await hybridDataService.deleteGoal(resourceId || payload.goalId);
        if (!success) throw new Error('deleteGoal failed');
        break;
      }
      default:
        logger.warn(`Unknown sync action: ${action}`, { operation }, 'OfflineSync');
        throw new Error(`Unknown sync action: ${action}`);
    }
  }

  /**
   * Handle sync conflicts
   */
  private async handleConflict(conflict: SyncConflict): Promise<void> {
    const conflicts = await this.loadConflicts();
    conflicts.push(conflict);
    await AsyncStorage.setItem(CONFLICTS_STORAGE_KEY, JSON.stringify(conflicts));

    logger.warn(`Sync conflict detected: ${conflict.operationId}`, { conflict }, 'OfflineSync');
  }

  /**
   * Load queue from storage
   */
  private async loadQueue(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      this.queue = data ? JSON.parse(data) : [];
    } catch (error) {
      logger.warn('Failed to load sync queue', error as Error, 'OfflineSync');
      this.queue = [];
    }
  }

  /**
   * Persist queue to storage
   */
  private async persistQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      logger.error('Failed to persist sync queue', error as Error, 'OfflineSync');
    }
  }

  /**
   * Load conflicts from storage
   */
  private async loadConflicts(): Promise<SyncConflict[]> {
    try {
      const data = await AsyncStorage.getItem(CONFLICTS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      logger.warn('Failed to load conflicts', error as Error, 'OfflineSync');
      return [];
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const offlineSyncService = new OfflineSyncService();

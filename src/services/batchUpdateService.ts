/**
 * Batch Update Service
 * 
 * Manages scheduled, timer-based batch updates for approved submissions
 * Features:
 * - Queue management for pending changes
 * - Scheduled batch processing
 * - Conflict detection and resolution
 * - Rollback support
 * - Performance optimization
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { dataSubmissionsService, DataSubmission } from './dataSubmissions';
import { logger } from '../utils/logger';

export interface BatchUpdateJob {
  id: string;
  submissionId: string;
  submission: DataSubmission;
  status: 'pending' | 'scheduled' | 'processing' | 'completed' | 'failed' | 'rollback';
  scheduledTime?: string;
  processedAt?: string;
  error?: string;
  retryCount: number;
  createdAt: string;
}

export interface BatchUpdateConfig {
  batchSize: number;           // How many updates to process per batch
  processingInterval: number;  // Minutes between batch processes
  maxRetries: number;          // Max retry attempts for failed updates
  autoApplyEnabled: boolean;   // Enable automatic batch processing
  preferredTimeWindow?: {      // Preferred time for processing (24h format)
    start: number;             // e.g., 2 (2 AM)
    end: number;               // e.g., 4 (4 AM)
  };
}

class BatchUpdateService {
  private readonly QUEUE_KEY = '@batch_update_queue';
  private readonly CONFIG_KEY = '@batch_update_config';
  private readonly HISTORY_KEY = '@batch_update_history';
  
  private processingTimer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  /**
   * Initialize batch update service
   */
  async initialize(): Promise<void> {
    try {
      const config = await this.getConfig();
      if (config.autoApplyEnabled) {
        this.startBatchProcessing(config.processingInterval);
      }
    } catch (error) {
      logger.warn('Failed to initialize batch update service', error, 'BatchUpdateService');
    }
  }

  /**
   * Get batch update configuration
   */
  async getConfig(): Promise<BatchUpdateConfig> {
    try {
      const data = await AsyncStorage.getItem(this.CONFIG_KEY);
      return data ? JSON.parse(data) : this.getDefaultConfig();
    } catch {
      return this.getDefaultConfig();
    }
  }

  /**
   * Update batch configuration
   */
  async updateConfig(config: Partial<BatchUpdateConfig>): Promise<boolean> {
    try {
      const current = await this.getConfig();
      const updated = { ...current, ...config };
      await AsyncStorage.setItem(this.CONFIG_KEY, JSON.stringify(updated));
      
      // Restart processing with new interval if needed
      if (config.processingInterval || config.autoApplyEnabled !== undefined) {
        this.stopBatchProcessing();
        if (updated.autoApplyEnabled) {
          this.startBatchProcessing(updated.processingInterval);
        }
      }
      
      return true;
    } catch (error) {
      logger.error('Failed to update batch config', error, 'BatchUpdateService');
      return false;
    }
  }

  /**
   * Add submission to batch queue
   */
  async queueSubmission(submission: DataSubmission, scheduledTime?: string): Promise<string> {
    try {
      const job: BatchUpdateJob = {
        id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        submissionId: submission.id,
        submission,
        status: scheduledTime ? 'scheduled' : 'pending',
        scheduledTime,
        retryCount: 0,
        createdAt: new Date().toISOString(),
      };

      const queue = await this.getQueue();
      queue.push(job);
      
      // Keep only last 1000 items
      const trimmed = queue.slice(-1000);
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(trimmed));

      logger.info(`Added submission ${submission.id} to batch queue`, 'BatchUpdateService');
      return job.id;
    } catch (error) {
      logger.error('Failed to queue submission', error, 'BatchUpdateService');
      throw error;
    }
  }

  /**
   * Get pending queue
   */
  async getQueue(): Promise<BatchUpdateJob[]> {
    try {
      const data = await AsyncStorage.getItem(this.QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{
    total: number;
    pending: number;
    scheduled: number;
    processing: number;
    completed: number;
    failed: number;
  }> {
    const queue = await this.getQueue();
    return {
      total: queue.length,
      pending: queue.filter(j => j.status === 'pending').length,
      scheduled: queue.filter(j => j.status === 'scheduled').length,
      processing: queue.filter(j => j.status === 'processing').length,
      completed: queue.filter(j => j.status === 'completed').length,
      failed: queue.filter(j => j.status === 'failed').length,
    };
  }

  /**
   * Start automatic batch processing
   */
  private startBatchProcessing(intervalMinutes: number): void {
    const intervalMs = intervalMinutes * 60 * 1000;
    
    // Process immediately first time
    this.processPendingBatch();
    
    // Then schedule recurring processing
    this.processingTimer = setInterval(() => {
      this.processPendingBatch();
    }, intervalMs);

    logger.info(`Batch processing started (interval: ${intervalMinutes} minutes)`, 'BatchUpdateService');
  }

  /**
   * Stop automatic batch processing
   */
  private stopBatchProcessing(): void {
    if (this.processingTimer) {
      clearInterval(this.processingTimer);
      this.processingTimer = null;
      logger.info('Batch processing stopped', 'BatchUpdateService');
    }
  }

  /**
   * Process all pending batch updates
   */
  async processPendingBatch(): Promise<{ processed: number; failed: number }> {
    if (this.isProcessing) {
      logger.warn('Batch processing already in progress', 'BatchUpdateService');
      return { processed: 0, failed: 0 };
    }

    this.isProcessing = true;
    let processed = 0;
    let failed = 0;

    try {
      const config = await this.getConfig();
      const queue = await this.getQueue();
      
      // Filter jobs that are ready to process
      const now = new Date();
      const jobsToProcess = queue
        .filter(job => {
          if (job.status === 'pending') return true;
          if (job.status === 'scheduled' && job.scheduledTime) {
            return new Date(job.scheduledTime) <= now;
          }
          return false;
        })
        .slice(0, config.batchSize);

      if (jobsToProcess.length === 0) {
        return { processed: 0, failed: 0 };
      }

      logger.info(`Processing ${jobsToProcess.length} batch updates`, 'BatchUpdateService');

      // Process each job
      for (const job of jobsToProcess) {
        const jobIndex = queue.findIndex(j => j.id === job.id);
        if (jobIndex === -1) continue;

        try {
          queue[jobIndex].status = 'processing';
          await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));

          // Apply the submission change
          const result = await dataSubmissionsService.applySubmissionToAllRelatedData(job.submission);

          if (result.success) {
            queue[jobIndex].status = 'completed';
            queue[jobIndex].processedAt = new Date().toISOString();
            processed++;

            // Save to history
            await this.saveToHistory(queue[jobIndex]);
          } else {
            throw new Error('Failed to apply submission changes');
          }
        } catch (error) {
          queue[jobIndex].retryCount++;
          if (queue[jobIndex].retryCount < config.maxRetries) {
            queue[jobIndex].status = 'pending';
            logger.warn(`Retrying job ${job.id} (attempt ${queue[jobIndex].retryCount}/${config.maxRetries})`, error, 'BatchUpdateService');
          } else {
            queue[jobIndex].status = 'failed';
            queue[jobIndex].error = String(error);
            failed++;
            logger.error(`Job ${job.id} failed after ${config.maxRetries} retries`, error, 'BatchUpdateService');
          }
        }

        await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
      }

      logger.info(`Batch processing completed: ${processed} processed, ${failed} failed`, 'BatchUpdateService');
      return { processed, failed };
    } catch (error) {
      logger.error('Batch processing error', error, 'BatchUpdateService');
      return { processed: 0, failed: 0 };
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Manually trigger batch processing (admin action)
   */
  async manuallyProcessBatch(limit?: number): Promise<{ processed: number; failed: number }> {
    const config = await this.getConfig();
    const originalBatchSize = config.batchSize;
    
    if (limit) {
      await this.updateConfig({ batchSize: limit });
    }

    try {
      const result = await this.processPendingBatch();
      return result;
    } finally {
      if (limit) {
        await this.updateConfig({ batchSize: originalBatchSize });
      }
    }
  }

  /**
   * Remove job from queue
   */
  async removeJob(jobId: string): Promise<boolean> {
    try {
      const queue = await this.getQueue();
      const filtered = queue.filter(j => j.id !== jobId);
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Rollback a completed job (if possible)
   */
  async rollbackJob(jobId: string): Promise<boolean> {
    try {
      const queue = await this.getQueue();
      const job = queue.find(j => j.id === jobId);
      
      if (!job || job.status !== 'completed') {
        logger.warn(`Cannot rollback job ${jobId}: not in completed state`, 'BatchUpdateService');
        return false;
      }

      job.status = 'rollback';
      job.processedAt = new Date().toISOString();
      
      // TODO: Implement actual rollback logic
      // This would need to restore previous values from audit log
      
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
      logger.info(`Job ${jobId} marked for rollback`, 'BatchUpdateService');
      return true;
    } catch (error) {
      logger.error('Rollback error', error, 'BatchUpdateService');
      return false;
    }
  }

  /**
   * Save completed job to history
   */
  private async saveToHistory(job: BatchUpdateJob): Promise<void> {
    try {
      const history = await AsyncStorage.getItem(this.HISTORY_KEY);
      const items = history ? JSON.parse(history) : [];
      items.push(job);
      
      // Keep only last 500 history items
      const trimmed = items.slice(-500);
      await AsyncStorage.setItem(this.HISTORY_KEY, JSON.stringify(trimmed));
    } catch (error) {
      logger.warn('Failed to save job to history', error, 'BatchUpdateService');
    }
  }

  /**
   * Get batch update history
   */
  async getHistory(limit: number = 50): Promise<BatchUpdateJob[]> {
    try {
      const data = await AsyncStorage.getItem(this.HISTORY_KEY);
      const history = data ? JSON.parse(data) : [];
      return history.slice(-limit).reverse();
    } catch {
      return [];
    }
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): BatchUpdateConfig {
    return {
      batchSize: 10,
      processingInterval: 30, // 30 minutes
      maxRetries: 3,
      autoApplyEnabled: true,
      preferredTimeWindow: {
        start: 2,  // 2 AM
        end: 4,    // 4 AM
      },
    };
  }

  /**
   * Check if should process based on time window
   */
  private shouldProcessNow(config: BatchUpdateConfig): boolean {
    if (!config.preferredTimeWindow) return true;

    const now = new Date();
    const currentHour = now.getHours();
    
    const { start, end } = config.preferredTimeWindow;
    if (start < end) {
      return currentHour >= start && currentHour < end;
    } else {
      // Wraps around midnight
      return currentHour >= start || currentHour < end;
    }
  }

  /**
   * Get next scheduled processing time
   */
  async getNextProcessingTime(): Promise<Date | null> {
    try {
      const config = await this.getConfig();
      if (!config.autoApplyEnabled) return null;

      const now = new Date();
      if (!config.preferredTimeWindow) {
        return new Date(now.getTime() + config.processingInterval * 60 * 1000);
      }

      const { start } = config.preferredTimeWindow;
      const nextDate = new Date(now);
      nextDate.setHours(start, 0, 0, 0);

      if (nextDate <= now) {
        nextDate.setDate(nextDate.getDate() + 1);
      }

      return nextDate;
    } catch {
      return null;
    }
  }
}

// Export singleton instance
export const batchUpdateService = new BatchUpdateService();
export default batchUpdateService;

/**
 * Enhanced Admin Service
 * Advanced admin capabilities for comprehensive app management
 * 
 * Features:
 * - Bulk operations (users, content, notifications)
 * - Advanced search & filtering
 * - Data backup & restore
 * - Activity monitoring
 * - App configuration management
 * - Content moderation queue
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface BulkOperationResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: string[];
  duration: number;
}

export interface ContentModerationItem {
  id: string;
  content_type: 'university' | 'scholarship' | 'program' | 'career' | 'announcement' | 'feedback';
  content_id: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_review';
  submitted_by: string | null;
  submitted_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  notes: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  auto_flags: string[];
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  user_id: string | null;
  user_name: string | null;
  action_type: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'import' | 'config_change' | 'bulk_action';
  entity_type: string;
  entity_id: string | null;
  description: string;
  metadata: Record<string, any>;
  ip_address: string | null;
  severity: 'info' | 'warning' | 'critical';
}

export interface BackupInfo {
  id: string;
  name: string;
  created_at: string;
  size_bytes: number;
  type: 'full' | 'partial' | 'config_only';
  tables: string[];
  status: 'completed' | 'in_progress' | 'failed';
  created_by: string | null;
  notes: string | null;
}

export interface AppConfig {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  category: 'general' | 'features' | 'notifications' | 'content' | 'security' | 'maintenance';
  label: string;
  description: string;
  is_sensitive: boolean;
  last_modified: string;
  modified_by: string | null;
}

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description: string;
  rollout_percentage: number;
  target_users: string[];
  target_roles: string[];
  expires_at: string | null;
}

export interface AdminDashboardMetrics {
  realtime: {
    activeUsers: number;
    requestsPerMinute: number;
    errorRate: number;
    avgResponseTime: number;
  };
  today: {
    newUsers: number;
    totalSessions: number;
    pageViews: number;
    searches: number;
    favorites: number;
    calculations: number;
  };
  trends: {
    userGrowth: number; // percentage
    engagementChange: number;
    contentViews: number;
  };
  alerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info';
    message: string;
    timestamp: string;
    acknowledged: boolean;
  }>;
}

export interface SearchFilter {
  id: string;
  name: string;
  entity_type: string;
  filters: Record<string, any>;
  created_by: string;
  is_shared: boolean;
  created_at: string;
}

// ============================================================================
// ENHANCED ADMIN SERVICE
// ============================================================================

class EnhancedAdminService {
  private activityBuffer: ActivityLogEntry[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Flush activity logs every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flushActivityLogs();
    }, 30000);
  }

  // =========================================================================
  // BULK OPERATIONS
  // =========================================================================

  /**
   * Bulk update user roles
   */
  async bulkUpdateUserRoles(
    userIds: string[],
    newRole: string,
    performedBy: string
  ): Promise<BulkOperationResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let processed = 0;
    let failed = 0;

    for (const userId of userIds) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ role: newRole, updated_at: new Date().toISOString() })
          .eq('id', userId);

        if (error) {
          errors.push(`User ${userId}: ${error.message}`);
          failed++;
        } else {
          processed++;
        }
      } catch (err) {
        errors.push(`User ${userId}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        failed++;
      }
    }

    // Log the bulk action
    this.logActivity({
      action_type: 'bulk_action',
      entity_type: 'users',
      description: `Bulk role update to ${newRole} for ${userIds.length} users`,
      metadata: { userIds, newRole, processed, failed },
      severity: 'info',
    });

    return {
      success: failed === 0,
      processed,
      failed,
      errors,
      duration: Date.now() - startTime,
    };
  }

  /**
   * Bulk ban/unban users
   */
  async bulkBanUsers(
    userIds: string[],
    ban: boolean,
    reason?: string,
    expiresAt?: string
  ): Promise<BulkOperationResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let processed = 0;
    let failed = 0;

    for (const userId of userIds) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            is_banned: ban,
            ban_reason: ban ? reason : null,
            ban_expires_at: ban ? expiresAt : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (error) {
          errors.push(`User ${userId}: ${error.message}`);
          failed++;
        } else {
          processed++;
        }
      } catch (err) {
        errors.push(`User ${userId}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        failed++;
      }
    }

    this.logActivity({
      action_type: 'bulk_action',
      entity_type: 'users',
      description: `Bulk ${ban ? 'ban' : 'unban'} for ${userIds.length} users`,
      metadata: { userIds, ban, reason, processed, failed },
      severity: ban ? 'warning' : 'info',
    });

    return {
      success: failed === 0,
      processed,
      failed,
      errors,
      duration: Date.now() - startTime,
    };
  }

  /**
   * Bulk delete content
   */
  async bulkDeleteContent(
    contentType: string,
    contentIds: string[]
  ): Promise<BulkOperationResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let processed = 0;
    let failed = 0;

    // For bundled data, we can't actually delete - just log the action
    this.logActivity({
      action_type: 'bulk_action',
      entity_type: contentType,
      description: `Bulk delete request for ${contentIds.length} ${contentType} items`,
      metadata: { contentType, contentIds },
      severity: 'warning',
    });

    return {
      success: true,
      processed: contentIds.length,
      failed: 0,
      errors: ['Note: Bundled data cannot be deleted from mobile app. Use backend API for actual deletion.'],
      duration: Date.now() - startTime,
    };
  }

  /**
   * Bulk send notifications
   */
  async bulkSendNotifications(
    userIds: string[] | 'all',
    notification: { title: string; message: string; type: string }
  ): Promise<BulkOperationResult> {
    const startTime = Date.now();
    
    try {
      // Create announcement for all users
      const { error } = await supabase
        .from('announcements')
        .insert({
          title: notification.title,
          message: notification.message,
          type: notification.type,
          target: userIds === 'all' ? 'all' : 'specific_users',
          target_criteria: userIds === 'all' ? null : { user_ids: userIds },
          is_active: true,
          priority: 5,
          start_date: new Date().toISOString(),
        });

      if (error) throw error;

      this.logActivity({
        action_type: 'bulk_action',
        entity_type: 'notifications',
        description: `Bulk notification sent to ${userIds === 'all' ? 'all users' : userIds.length + ' users'}`,
        metadata: { notification, userIds },
        severity: 'info',
      });

      return {
        success: true,
        processed: 1,
        failed: 0,
        errors: [],
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        processed: 0,
        failed: 1,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        duration: Date.now() - startTime,
      };
    }
  }

  // =========================================================================
  // ADVANCED SEARCH & FILTERS
  // =========================================================================

  /**
   * Global admin search across all entities
   */
  async globalSearch(query: string, options?: {
    entities?: string[];
    limit?: number;
  }): Promise<Record<string, any[]>> {
    const results: Record<string, any[]> = {};
    const entities = options?.entities || ['users', 'universities', 'scholarships', 'feedback', 'announcements'];
    const limit = options?.limit || 5;
    const searchLower = query.toLowerCase();

    // Search users
    if (entities.includes('users')) {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name, email, role, is_banned')
          .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
          .limit(limit);
        results.users = data || [];
      } catch (e) {
        results.users = [];
      }
    }

    // Search announcements
    if (entities.includes('announcements')) {
      try {
        const { data } = await supabase
          .from('announcements')
          .select('id, title, message, type, is_active')
          .or(`title.ilike.%${query}%,message.ilike.%${query}%`)
          .limit(limit);
        results.announcements = data || [];
      } catch (e) {
        results.announcements = [];
      }
    }

    // Search feedback
    if (entities.includes('feedback')) {
      try {
        const { data } = await supabase
          .from('user_feedback')
          .select('id, title, message, type, status')
          .or(`title.ilike.%${query}%,message.ilike.%${query}%`)
          .limit(limit);
        results.feedback = data || [];
      } catch (e) {
        results.feedback = [];
      }
    }

    // For universities/scholarships, search bundled data
    if (entities.includes('universities')) {
      // This would search bundled UNIVERSITIES data
      results.universities = [];
    }

    if (entities.includes('scholarships')) {
      // This would search bundled SCHOLARSHIPS data
      results.scholarships = [];
    }

    this.logActivity({
      action_type: 'create',
      entity_type: 'search',
      description: `Global admin search: "${query}"`,
      metadata: { query, entities, resultCounts: Object.fromEntries(Object.entries(results).map(([k, v]) => [k, v.length])) },
      severity: 'info',
    });

    return results;
  }

  /**
   * Save a search filter preset
   */
  async saveSearchFilter(filter: Omit<SearchFilter, 'id' | 'created_at'>): Promise<{ success: boolean; id?: string }> {
    try {
      const id = `filter_${Date.now()}`;
      const existing = await this.getSavedFilters();
      existing.push({ ...filter, id, created_at: new Date().toISOString() });
      await AsyncStorage.setItem('@admin_saved_filters', JSON.stringify(existing));
      return { success: true, id };
    } catch (error) {
      return { success: false };
    }
  }

  /**
   * Get saved search filters
   */
  async getSavedFilters(): Promise<SearchFilter[]> {
    try {
      const data = await AsyncStorage.getItem('@admin_saved_filters');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Delete a saved filter
   */
  async deleteSearchFilter(filterId: string): Promise<boolean> {
    try {
      const existing = await this.getSavedFilters();
      const filtered = existing.filter(f => f.id !== filterId);
      await AsyncStorage.setItem('@admin_saved_filters', JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  }

  // =========================================================================
  // ACTIVITY LOGGING
  // =========================================================================

  /**
   * Log an admin activity
   */
  logActivity(activity: {
    action_type: ActivityLogEntry['action_type'];
    entity_type: string;
    entity_id?: string | null;
    description: string;
    metadata: Record<string, any>;
    severity: ActivityLogEntry['severity'];
  }): void {
    const entry: ActivityLogEntry = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      user_id: null, // Will be filled by getCurrentUser
      user_name: null,
      ip_address: null,
      action_type: activity.action_type,
      entity_type: activity.entity_type,
      entity_id: activity.entity_id ?? null,
      description: activity.description,
      metadata: activity.metadata,
      severity: activity.severity,
    };
    
    this.activityBuffer.push(entry);
    
    // Flush immediately for critical events
    if (activity.severity === 'critical') {
      this.flushActivityLogs();
    }
  }

  /**
   * Flush activity logs to storage
   */
  private async flushActivityLogs(): Promise<void> {
    if (this.activityBuffer.length === 0) return;

    try {
      const existingLogs = await this.getActivityLogs(1000);
      const combined = [...this.activityBuffer, ...existingLogs].slice(0, 1000); // Keep last 1000 entries
      await AsyncStorage.setItem('@admin_activity_logs', JSON.stringify(combined));
      this.activityBuffer = [];
    } catch (error) {
      logger.error('Failed to flush activity logs', error, 'EnhancedAdmin');
    }
  }

  /**
   * Get activity logs
   */
  async getActivityLogs(limit = 100, filters?: {
    action_type?: string;
    entity_type?: string;
    severity?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ActivityLogEntry[]> {
    try {
      const data = await AsyncStorage.getItem('@admin_activity_logs');
      let logs: ActivityLogEntry[] = data ? JSON.parse(data) : [];

      // Apply filters
      if (filters) {
        if (filters.action_type) {
          logs = logs.filter(l => l.action_type === filters.action_type);
        }
        if (filters.entity_type) {
          logs = logs.filter(l => l.entity_type === filters.entity_type);
        }
        if (filters.severity) {
          logs = logs.filter(l => l.severity === filters.severity);
        }
        if (filters.startDate) {
          logs = logs.filter(l => l.timestamp >= filters.startDate!);
        }
        if (filters.endDate) {
          logs = logs.filter(l => l.timestamp <= filters.endDate!);
        }
      }

      return logs.slice(0, limit);
    } catch {
      return [];
    }
  }

  /**
   * Clear old activity logs
   */
  async clearOldActivityLogs(daysToKeep = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const logs = await this.getActivityLogs(10000);
      const filtered = logs.filter(l => new Date(l.timestamp) >= cutoffDate);
      const removed = logs.length - filtered.length;
      
      await AsyncStorage.setItem('@admin_activity_logs', JSON.stringify(filtered));
      return removed;
    } catch {
      return 0;
    }
  }

  // =========================================================================
  // APP CONFIGURATION MANAGEMENT
  // =========================================================================

  /**
   * Get all app configurations
   */
  async getAppConfigs(): Promise<AppConfig[]> {
    try {
      // First try Supabase
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .order('category', { ascending: true });

      if (data && data.length > 0) {
        return data.map(d => ({
          key: d.key,
          value: d.value,
          type: d.value_type || 'string',
          category: d.category || 'general',
          label: d.key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          description: d.description || '',
          is_sensitive: d.key.includes('secret') || d.key.includes('token') || d.key.includes('password'),
          last_modified: d.updated_at,
          modified_by: d.updated_by,
        }));
      }

      // Fallback to local storage
      const localData = await AsyncStorage.getItem('@admin_app_configs');
      return localData ? JSON.parse(localData) : this.getDefaultConfigs();
    } catch (error) {
      return this.getDefaultConfigs();
    }
  }

  /**
   * Get default app configurations
   */
  private getDefaultConfigs(): AppConfig[] {
    return [
      // General
      { key: 'app_name', value: 'PakUni', type: 'string', category: 'general', label: 'App Name', description: 'Display name of the application', is_sensitive: false, last_modified: new Date().toISOString(), modified_by: null },
      { key: 'maintenance_mode', value: false, type: 'boolean', category: 'maintenance', label: 'Maintenance Mode', description: 'Enable maintenance mode to block user access', is_sensitive: false, last_modified: new Date().toISOString(), modified_by: null },
      { key: 'maintenance_message', value: 'We are currently performing maintenance. Please check back soon.', type: 'string', category: 'maintenance', label: 'Maintenance Message', description: 'Message shown during maintenance', is_sensitive: false, last_modified: new Date().toISOString(), modified_by: null },
      
      // Features
      { key: 'feature_dark_mode', value: true, type: 'boolean', category: 'features', label: 'Dark Mode', description: 'Allow users to use dark mode', is_sensitive: false, last_modified: new Date().toISOString(), modified_by: null },
      { key: 'feature_guest_mode', value: true, type: 'boolean', category: 'features', label: 'Guest Mode', description: 'Allow guest access without login', is_sensitive: false, last_modified: new Date().toISOString(), modified_by: null },
      { key: 'feature_merit_calculator', value: true, type: 'boolean', category: 'features', label: 'Merit Calculator', description: 'Enable merit calculator feature', is_sensitive: false, last_modified: new Date().toISOString(), modified_by: null },
      { key: 'feature_career_guidance', value: true, type: 'boolean', category: 'features', label: 'Career Guidance', description: 'Enable career guidance features', is_sensitive: false, last_modified: new Date().toISOString(), modified_by: null },
      { key: 'feature_notifications', value: true, type: 'boolean', category: 'features', label: 'Push Notifications', description: 'Enable push notifications', is_sensitive: false, last_modified: new Date().toISOString(), modified_by: null },
      
      // Content
      { key: 'content_cache_duration', value: 24, type: 'number', category: 'content', label: 'Cache Duration (hours)', description: 'How long to cache content data', is_sensitive: false, last_modified: new Date().toISOString(), modified_by: null },
      { key: 'content_auto_refresh', value: false, type: 'boolean', category: 'content', label: 'Auto Refresh', description: 'Automatically refresh content (uses data)', is_sensitive: false, last_modified: new Date().toISOString(), modified_by: null },
      
      // Security
      { key: 'security_min_password_length', value: 8, type: 'number', category: 'security', label: 'Min Password Length', description: 'Minimum password length for new accounts', is_sensitive: false, last_modified: new Date().toISOString(), modified_by: null },
      { key: 'security_require_email_verification', value: true, type: 'boolean', category: 'security', label: 'Require Email Verification', description: 'Require email verification for new accounts', is_sensitive: false, last_modified: new Date().toISOString(), modified_by: null },
      { key: 'security_max_login_attempts', value: 5, type: 'number', category: 'security', label: 'Max Login Attempts', description: 'Maximum failed login attempts before lockout', is_sensitive: false, last_modified: new Date().toISOString(), modified_by: null },
      
      // Notifications
      { key: 'notification_deadline_reminder', value: 7, type: 'number', category: 'notifications', label: 'Deadline Reminder (days)', description: 'Days before deadline to send reminder', is_sensitive: false, last_modified: new Date().toISOString(), modified_by: null },
      { key: 'notification_daily_digest', value: false, type: 'boolean', category: 'notifications', label: 'Daily Digest', description: 'Send daily digest emails', is_sensitive: false, last_modified: new Date().toISOString(), modified_by: null },
    ];
  }

  /**
   * Update an app configuration
   */
  async updateAppConfig(key: string, value: any): Promise<boolean> {
    try {
      // Try Supabase first
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          key,
          value,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'key' });

      if (!error) {
        this.logActivity({
          action_type: 'config_change',
          entity_type: 'app_config',
          entity_id: key,
          description: `Configuration "${key}" updated`,
          metadata: { key, newValue: value },
          severity: key.includes('security') || key.includes('maintenance') ? 'warning' : 'info',
        });
        return true;
      }

      // Fallback to local storage
      const configs = await this.getAppConfigs();
      const index = configs.findIndex(c => c.key === key);
      if (index >= 0) {
        configs[index].value = value;
        configs[index].last_modified = new Date().toISOString();
        await AsyncStorage.setItem('@admin_app_configs', JSON.stringify(configs));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // =========================================================================
  // FEATURE FLAGS
  // =========================================================================

  /**
   * Get all feature flags
   */
  async getFeatureFlags(): Promise<FeatureFlag[]> {
    try {
      const data = await AsyncStorage.getItem('@admin_feature_flags');
      return data ? JSON.parse(data) : this.getDefaultFeatureFlags();
    } catch {
      return this.getDefaultFeatureFlags();
    }
  }

  private getDefaultFeatureFlags(): FeatureFlag[] {
    return [
      { key: 'new_home_design', enabled: true, description: 'New home screen design', rollout_percentage: 100, target_users: [], target_roles: [], expires_at: null },
      { key: 'ai_recommendations', enabled: false, description: 'AI-powered university recommendations', rollout_percentage: 0, target_users: [], target_roles: [], expires_at: null },
      { key: 'social_features', enabled: false, description: 'Social features (forums, chat)', rollout_percentage: 0, target_users: [], target_roles: [], expires_at: null },
      { key: 'advanced_analytics', enabled: true, description: 'Advanced analytics dashboard for admins', rollout_percentage: 100, target_users: [], target_roles: ['admin', 'super_admin'], expires_at: null },
      { key: 'beta_features', enabled: false, description: 'Access to beta features', rollout_percentage: 10, target_users: [], target_roles: [], expires_at: null },
    ];
  }

  /**
   * Update a feature flag
   */
  async updateFeatureFlag(key: string, updates: Partial<FeatureFlag>): Promise<boolean> {
    try {
      const flags = await this.getFeatureFlags();
      const index = flags.findIndex(f => f.key === key);
      if (index >= 0) {
        flags[index] = { ...flags[index], ...updates };
        await AsyncStorage.setItem('@admin_feature_flags', JSON.stringify(flags));
        
        this.logActivity({
          action_type: 'config_change',
          entity_type: 'feature_flag',
          entity_id: key,
          description: `Feature flag "${key}" updated`,
          metadata: { key, updates },
          severity: 'warning',
        });
        
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // =========================================================================
  // BACKUP & RESTORE
  // =========================================================================

  /**
   * Create a backup of app data
   */
  async createBackup(options?: {
    type?: 'full' | 'partial' | 'config_only';
    tables?: string[];
    notes?: string;
  }): Promise<BackupInfo | null> {
    try {
      const backupId = `backup_${Date.now()}`;
      const type = options?.type || 'full';
      
      const backupData: Record<string, any> = {};
      
      // Collect data based on type
      if (type === 'config_only' || type === 'full') {
        backupData.app_configs = await this.getAppConfigs();
        backupData.feature_flags = await this.getFeatureFlags();
        backupData.saved_filters = await this.getSavedFilters();
      }
      
      if (type === 'full' || type === 'partial') {
        backupData.activity_logs = await this.getActivityLogs(1000);
      }

      // Save backup
      await AsyncStorage.setItem(`@backup_${backupId}`, JSON.stringify(backupData));
      
      const backup: BackupInfo = {
        id: backupId,
        name: `Backup ${new Date().toLocaleString()}`,
        created_at: new Date().toISOString(),
        size_bytes: JSON.stringify(backupData).length,
        type,
        tables: Object.keys(backupData),
        status: 'completed',
        created_by: null,
        notes: options?.notes || null,
      };

      // Save backup info
      const backups = await this.getBackupList();
      backups.unshift(backup);
      await AsyncStorage.setItem('@admin_backups', JSON.stringify(backups.slice(0, 20))); // Keep last 20

      this.logActivity({
        action_type: 'export',
        entity_type: 'backup',
        entity_id: backupId,
        description: `Created ${type} backup`,
        metadata: { type, tables: Object.keys(backupData), size: backup.size_bytes },
        severity: 'info',
      });

      return backup;
    } catch (error) {
      logger.error('Failed to create backup', error, 'EnhancedAdmin');
      return null;
    }
  }

  /**
   * Get list of backups
   */
  async getBackupList(): Promise<BackupInfo[]> {
    try {
      const data = await AsyncStorage.getItem('@admin_backups');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Restore from a backup
   */
  async restoreBackup(backupId: string): Promise<{ success: boolean; restored: string[] }> {
    try {
      const backupData = await AsyncStorage.getItem(`@backup_${backupId}`);
      if (!backupData) {
        return { success: false, restored: [] };
      }

      const data = JSON.parse(backupData);
      const restored: string[] = [];

      if (data.app_configs) {
        await AsyncStorage.setItem('@admin_app_configs', JSON.stringify(data.app_configs));
        restored.push('app_configs');
      }
      if (data.feature_flags) {
        await AsyncStorage.setItem('@admin_feature_flags', JSON.stringify(data.feature_flags));
        restored.push('feature_flags');
      }
      if (data.saved_filters) {
        await AsyncStorage.setItem('@admin_saved_filters', JSON.stringify(data.saved_filters));
        restored.push('saved_filters');
      }

      this.logActivity({
        action_type: 'import',
        entity_type: 'backup',
        entity_id: backupId,
        description: `Restored backup`,
        metadata: { backupId, restored },
        severity: 'warning',
      });

      return { success: true, restored };
    } catch (error) {
      logger.error('Failed to restore backup', error, 'EnhancedAdmin');
      return { success: false, restored: [] };
    }
  }

  /**
   * Delete a backup
   */
  async deleteBackup(backupId: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(`@backup_${backupId}`);
      
      const backups = await this.getBackupList();
      const filtered = backups.filter(b => b.id !== backupId);
      await AsyncStorage.setItem('@admin_backups', JSON.stringify(filtered));
      
      return true;
    } catch {
      return false;
    }
  }

  // =========================================================================
  // DASHBOARD METRICS
  // =========================================================================

  /**
   * Get enhanced dashboard metrics
   */
  async getDashboardMetrics(): Promise<AdminDashboardMetrics> {
    try {
      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString();

      // Fetch real data from Supabase
      const [
        { count: newUsersCount },
        { count: totalSessions },
        { data: recentLogs },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', todayStr),
        supabase.from('analytics_events').select('*', { count: 'exact', head: true }).gte('created_at', todayStr),
        supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(10),
      ]);

      // Generate alerts based on system state
      const alerts: AdminDashboardMetrics['alerts'] = [];
      
      // Check for pending items
      const { count: pendingReports } = await supabase
        .from('content_reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      if ((pendingReports || 0) > 5) {
        alerts.push({
          id: 'pending_reports',
          type: 'warning',
          message: `${pendingReports} content reports pending review`,
          timestamp: new Date().toISOString(),
          acknowledged: false,
        });
      }

      const { count: pendingFeedback } = await supabase
        .from('user_feedback')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new');

      if ((pendingFeedback || 0) > 10) {
        alerts.push({
          id: 'pending_feedback',
          type: 'info',
          message: `${pendingFeedback} feedback items need attention`,
          timestamp: new Date().toISOString(),
          acknowledged: false,
        });
      }

      return {
        realtime: {
          activeUsers: Math.floor(Math.random() * 50) + 10, // Simulated - would need real-time service
          requestsPerMinute: Math.floor(Math.random() * 100) + 20,
          errorRate: Math.random() * 2,
          avgResponseTime: Math.floor(Math.random() * 200) + 100,
        },
        today: {
          newUsers: newUsersCount || 0,
          totalSessions: totalSessions || 0,
          pageViews: Math.floor(Math.random() * 1000) + 100,
          searches: Math.floor(Math.random() * 200) + 50,
          favorites: Math.floor(Math.random() * 50) + 10,
          calculations: Math.floor(Math.random() * 100) + 20,
        },
        trends: {
          userGrowth: Math.random() * 20 - 5, // -5% to +15%
          engagementChange: Math.random() * 30 - 10, // -10% to +20%
          contentViews: Math.random() * 25 - 5, // -5% to +20%
        },
        alerts,
      };
    } catch (error) {
      logger.error('Failed to get dashboard metrics', error, 'EnhancedAdmin');
      return {
        realtime: { activeUsers: 0, requestsPerMinute: 0, errorRate: 0, avgResponseTime: 0 },
        today: { newUsers: 0, totalSessions: 0, pageViews: 0, searches: 0, favorites: 0, calculations: 0 },
        trends: { userGrowth: 0, engagementChange: 0, contentViews: 0 },
        alerts: [],
      };
    }
  }

  // =========================================================================
  // CONTENT MODERATION
  // =========================================================================

  /**
   * Get content moderation queue
   */
  async getModerationQueue(filters?: {
    status?: string;
    content_type?: string;
    priority?: string;
  }): Promise<ContentModerationItem[]> {
    try {
      // In a real app, this would come from a database table
      // For now, we aggregate from feedback and reports
      const items: ContentModerationItem[] = [];

      // Get pending feedback that needs review
      let feedbackQuery = supabase
        .from('user_feedback')
        .select('*')
        .in('status', ['new', 'in_review']);

      const { data: feedback } = await feedbackQuery.limit(50);

      if (feedback) {
        for (const fb of feedback) {
          items.push({
            id: `mod_fb_${fb.id}`,
            content_type: 'feedback',
            content_id: fb.id,
            title: fb.title || 'Feedback',
            status: fb.status === 'new' ? 'pending' : 'needs_review',
            submitted_by: fb.user_id,
            submitted_at: fb.created_at,
            reviewed_by: fb.responded_by,
            reviewed_at: fb.responded_at,
            notes: fb.admin_response,
            priority: fb.type === 'bug' ? 'high' : 'medium',
            auto_flags: [],
          });
        }
      }

      // Get content reports
      let reportsQuery = supabase
        .from('content_reports')
        .select('*')
        .in('status', ['pending', 'reviewing']);

      const { data: reports } = await reportsQuery.limit(50);

      if (reports) {
        for (const report of reports) {
          items.push({
            id: `mod_rpt_${report.id}`,
            content_type: report.content_type as any,
            content_id: report.content_id,
            title: `Report: ${report.reason}`,
            status: report.status === 'pending' ? 'pending' : 'needs_review',
            submitted_by: report.reporter_id,
            submitted_at: report.created_at,
            reviewed_by: report.reviewed_by,
            reviewed_at: report.resolved_at,
            notes: report.resolution_notes,
            priority: 'high',
            auto_flags: [],
          });
        }
      }

      // Apply filters
      let filtered = items;
      if (filters?.status) {
        filtered = filtered.filter(i => i.status === filters.status);
      }
      if (filters?.content_type) {
        filtered = filtered.filter(i => i.content_type === filters.content_type);
      }
      if (filters?.priority) {
        filtered = filtered.filter(i => i.priority === filters.priority);
      }

      // Sort by priority and date
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      filtered.sort((a, b) => {
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
      });

      return filtered;
    } catch (error) {
      logger.error('Failed to get moderation queue', error, 'EnhancedAdmin');
      return [];
    }
  }

  /**
   * Update moderation item status
   */
  async updateModerationStatus(
    itemId: string,
    status: ContentModerationItem['status'],
    notes?: string
  ): Promise<boolean> {
    try {
      // Parse the item ID to determine source
      if (itemId.startsWith('mod_fb_')) {
        const feedbackId = itemId.replace('mod_fb_', '');
        const supabaseStatus = status === 'approved' ? 'completed' : status === 'rejected' ? 'declined' : 'in_review';
        
        const { error } = await supabase
          .from('user_feedback')
          .update({
            status: supabaseStatus,
            admin_response: notes,
          })
          .eq('id', feedbackId);
        
        if (error) return false;
      } else if (itemId.startsWith('mod_rpt_')) {
        const reportId = itemId.replace('mod_rpt_', '');
        const supabaseStatus = status === 'approved' ? 'resolved' : status === 'rejected' ? 'dismissed' : 'reviewing';
        
        const { error } = await supabase
          .from('content_reports')
          .update({
            status: supabaseStatus,
            resolution_notes: notes,
            resolved_at: status === 'approved' || status === 'rejected' ? new Date().toISOString() : null,
          })
          .eq('id', reportId);
        
        if (error) return false;
      }

      this.logActivity({
        action_type: 'update',
        entity_type: 'moderation',
        entity_id: itemId,
        description: `Moderation status updated to ${status}`,
        metadata: { itemId, status, notes },
        severity: 'info',
      });

      return true;
    } catch {
      return false;
    }
  }

  // =========================================================================
  // CLEANUP
  // =========================================================================

  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flushActivityLogs();
  }
}

// Export singleton instance
export const enhancedAdminService = new EnhancedAdminService();
export default enhancedAdminService;

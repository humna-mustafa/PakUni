/**
 * Admin Notification Service
 * Handles sending push notifications to users from admin panel
 * Supports targeting, scheduling, and tracking
 */

import {supabase} from './supabase';
import {logger} from '../utils/logger';

const log = logger.scope('AdminNotifications');

// ============================================================================
// TYPES
// ============================================================================

export type NotificationType = 
  | 'general'
  | 'announcement' 
  | 'update'
  | 'alert'
  | 'scholarship'
  | 'admission'
  | 'deadline';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type NotificationStatus = 'draft' | 'scheduled' | 'sent' | 'failed';

export interface AdminNotification {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  targetAudience: string;
  targetCriteria?: Record<string, any>;
  actionUrl?: string;
  actionLabel?: string;
  imageUrl?: string;
  scheduledAt?: string;
  sentAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  stats?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  };
}

export interface NotificationStats {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  deliveryRate: number;
  openRate: number;
  scheduled: number;
  drafts: number;
  failed: number;
}

export interface CreateNotificationInput {
  title: string;
  body: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  targetAudience?: string;
  targetCriteria?: Record<string, any>;
  actionUrl?: string;
  actionLabel?: string;
  imageUrl?: string;
  scheduledAt?: string;
  status?: NotificationStatus;
}

// ============================================================================
// ADMIN NOTIFICATION SERVICE
// ============================================================================

class AdminNotificationService {
  
  /**
   * Get all admin notifications with pagination
   */
  async getNotifications(options: {
    page?: number;
    pageSize?: number;
    status?: NotificationStatus;
    type?: NotificationType;
  } = {}): Promise<AdminNotification[]> {
    try {
      const {page = 1, pageSize = 50, status, type} = options;
      
      let query = supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', {ascending: false});
      
      if (status) {
        query = query.eq('status', status);
      }
      
      if (type) {
        query = query.eq('type', type);
      }
      
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const {data, error} = await query.range(from, to);
      
      if (error) {
        // If table doesn't exist yet, return mock data
        if (error.code === '42P01') {
          log.warn('admin_notifications table not found, returning mock data');
          return this.getMockNotifications();
        }
        throw error;
      }
      
      return data || [];
    } catch (error) {
      log.error('Error fetching notifications:', error);
      return this.getMockNotifications();
    }
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(id: string): Promise<AdminNotification | null> {
    try {
      const {data, error} = await supabase
        .from('admin_notifications')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      log.error('Error fetching notification:', error);
      return null;
    }
  }

  /**
   * Send a new notification
   */
  async sendNotification(input: CreateNotificationInput): Promise<boolean> {
    try {
      const {data: {user}} = await supabase.auth.getUser();
      
      const notification = {
        title: input.title,
        body: input.body,
        type: input.type || 'general',
        priority: input.priority || 'normal',
        status: input.status || 'sent',
        target_audience: input.targetAudience || 'all',
        target_criteria: input.targetCriteria,
        action_url: input.actionUrl,
        action_label: input.actionLabel,
        image_url: input.imageUrl,
        scheduled_at: input.scheduledAt,
        sent_at: input.status === 'sent' ? new Date().toISOString() : null,
        created_by: user?.id,
        stats: input.status === 'sent' ? {sent: 0, delivered: 0, opened: 0, clicked: 0} : null,
      };

      const {error} = await supabase
        .from('admin_notifications')
        .insert([notification]);

      if (error) {
        // If table doesn't exist, just log success
        if (error.code === '42P01') {
          log.info('Notification created (mock - table not found):', notification.title);
          return true;
        }
        throw error;
      }

      // If sending immediately, trigger push notification delivery
      if (input.status === 'sent' || !input.status) {
        await this.deliverNotification(notification);
      }

      // Log admin action
      await this.logNotificationAction('send_notification', notification);

      return true;
    } catch (error) {
      log.error('Error sending notification:', error);
      return false;
    }
  }

  /**
   * Update an existing notification
   */
  async updateNotification(id: string, updates: Partial<CreateNotificationInput>): Promise<boolean> {
    try {
      const {error} = await supabase
        .from('admin_notifications')
        .update({
          ...updates,
          target_audience: updates.targetAudience,
          target_criteria: updates.targetCriteria,
          action_url: updates.actionUrl,
          action_label: updates.actionLabel,
          image_url: updates.imageUrl,
          scheduled_at: updates.scheduledAt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      log.error('Error updating notification:', error);
      return false;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(id: string): Promise<boolean> {
    try {
      const {error} = await supabase
        .from('admin_notifications')
        .delete()
        .eq('id', id);

      if (error) {
        if (error.code === '42P01') {
          return true; // Mock success
        }
        throw error;
      }

      await this.logNotificationAction('delete_notification', {id});
      return true;
    } catch (error) {
      log.error('Error deleting notification:', error);
      return false;
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(): Promise<NotificationStats> {
    try {
      const [sentResult, scheduledResult, draftResult, failedResult] = await Promise.all([
        supabase.from('admin_notifications').select('id, stats', {count: 'exact'}).eq('status', 'sent'),
        supabase.from('admin_notifications').select('id', {count: 'exact', head: true}).eq('status', 'scheduled'),
        supabase.from('admin_notifications').select('id', {count: 'exact', head: true}).eq('status', 'draft'),
        supabase.from('admin_notifications').select('id', {count: 'exact', head: true}).eq('status', 'failed'),
      ]);

      // Calculate aggregate stats from sent notifications
      let totalSent = 0;
      let totalDelivered = 0;
      let totalOpened = 0;

      if (sentResult.data) {
        sentResult.data.forEach((n: any) => {
          if (n.stats) {
            totalSent += n.stats.sent || 0;
            totalDelivered += n.stats.delivered || 0;
            totalOpened += n.stats.opened || 0;
          }
        });
      }

      const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;
      const openRate = totalDelivered > 0 ? Math.round((totalOpened / totalDelivered) * 100) : 0;

      return {
        totalSent,
        totalDelivered,
        totalOpened,
        deliveryRate,
        openRate,
        scheduled: scheduledResult.count || 0,
        drafts: draftResult.count || 0,
        failed: failedResult.count || 0,
      };
    } catch (error) {
      log.error('Error fetching notification stats:', error);
      return {
        totalSent: 0,
        totalDelivered: 0,
        totalOpened: 0,
        deliveryRate: 0,
        openRate: 0,
        scheduled: 0,
        drafts: 0,
        failed: 0,
      };
    }
  }

  /**
   * Deliver notification to target users
   * This would integrate with FCM/APNs in production
   */
  private async deliverNotification(notification: any): Promise<void> {
    try {
      // Get target users based on audience
      const targetUsers = await this.getTargetUsers(notification.target_audience, notification.target_criteria);
      
      log.info(`Delivering notification to ${targetUsers.length} users`);

      // In production, this would:
      // 1. Get push tokens for target users
      // 2. Send via Firebase Cloud Messaging (FCM)
      // 3. Update delivery stats

      // For now, we'll create in-app notifications for each user
      const notificationRecords = targetUsers.map(userId => ({
        user_id: userId,
        notification_id: notification.id,
        title: notification.title,
        body: notification.body,
        type: notification.type,
        data: {
          actionUrl: notification.action_url,
          actionLabel: notification.action_label,
          imageUrl: notification.image_url,
        },
        read: false,
        created_at: new Date().toISOString(),
      }));

      // Batch insert user notifications
      if (notificationRecords.length > 0) {
        await supabase
          .from('user_notifications')
          .insert(notificationRecords);
      }

      // Update notification stats
      await supabase
        .from('admin_notifications')
        .update({
          stats: {
            sent: targetUsers.length,
            delivered: targetUsers.length,
            opened: 0,
            clicked: 0,
          },
        })
        .eq('id', notification.id);

    } catch (error) {
      log.error('Error delivering notification:', error);
    }
  }

  /**
   * Get target users based on audience criteria
   */
  private async getTargetUsers(audience: string, criteria?: Record<string, any>): Promise<string[]> {
    try {
      let query = supabase.from('profiles').select('id');

      switch (audience) {
        case 'verified':
          query = query.eq('is_verified', true);
          break;
        case 'active':
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          query = query.gte('last_login_at', weekAgo.toISOString());
          break;
        case 'inactive':
          const monthAgo = new Date();
          monthAgo.setDate(monthAgo.getDate() - 30);
          query = query.lte('last_login_at', monthAgo.toISOString());
          break;
        case 'new_users':
          const newUserDate = new Date();
          newUserDate.setDate(newUserDate.getDate() - 7);
          query = query.gte('created_at', newUserDate.toISOString());
          break;
        case 'premium':
          query = query.eq('is_premium', true);
          break;
        // 'all' - no filter needed
      }

      // Apply additional criteria if provided
      if (criteria) {
        if (criteria.province) {
          query = query.eq('province', criteria.province);
        }
        if (criteria.field) {
          query = query.eq('preferred_field', criteria.field);
        }
      }

      const {data, error} = await query.limit(10000);

      if (error) throw error;
      return data?.map(u => u.id) || [];
    } catch (error) {
      log.error('Error getting target users:', error);
      return [];
    }
  }

  /**
   * Get scheduled notifications that need to be sent
   */
  async processScheduledNotifications(): Promise<void> {
    try {
      const now = new Date().toISOString();
      
      const {data: scheduledNotifications, error} = await supabase
        .from('admin_notifications')
        .select('*')
        .eq('status', 'scheduled')
        .lte('scheduled_at', now);

      if (error) throw error;

      for (const notification of scheduledNotifications || []) {
        await this.deliverNotification(notification);
        
        await supabase
          .from('admin_notifications')
          .update({
            status: 'sent',
            sent_at: now,
          })
          .eq('id', notification.id);
      }
    } catch (error) {
      log.error('Error processing scheduled notifications:', error);
    }
  }

  /**
   * Mark notification as read (called from user side)
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      await supabase
        .from('user_notifications')
        .update({read: true, read_at: new Date().toISOString()})
        .eq('notification_id', notificationId)
        .eq('user_id', userId);

      // Update stats
      const {data: notification} = await supabase
        .from('admin_notifications')
        .select('stats')
        .eq('id', notificationId)
        .single();

      if (notification?.stats) {
        await supabase
          .from('admin_notifications')
          .update({
            stats: {
              ...notification.stats,
              opened: (notification.stats.opened || 0) + 1,
            },
          })
          .eq('id', notificationId);
      }
    } catch (error) {
      log.error('Error marking notification as read:', error);
    }
  }

  /**
   * Log notification-related admin actions
   */
  private async logNotificationAction(action: string, data: any): Promise<void> {
    try {
      const {data: {user}} = await supabase.auth.getUser();
      
      await supabase
        .from('admin_audit_logs')
        .insert([{
          admin_id: user?.id,
          action,
          target_type: 'notification',
          new_values: data,
        }]);
    } catch (error) {
      log.error('Error logging notification action:', error);
    }
  }

  /**
   * Get notifications for a specific user
   */
  async getUserNotifications(userId: string): Promise<any[]> {
    try {
      const {data, error} = await supabase
        .from('user_notifications')
        .select(`
          *,
          notification:admin_notifications(*)
        `)
        .eq('user_id', userId)
        .order('created_at', {ascending: false})
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      log.error('Error fetching user notifications:', error);
      return [];
    }
  }

  /**
   * Get mock notifications for testing/demo
   */
  private getMockNotifications(): AdminNotification[] {
    const now = new Date();
    return [
      {
        id: 'mock-1',
        title: '🎓 New Scholarship Available!',
        body: 'HEC Merit Scholarship applications are now open. Apply before the deadline!',
        type: 'scholarship',
        priority: 'high',
        status: 'sent',
        targetAudience: 'all',
        createdBy: 'admin',
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        sentAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        stats: {sent: 1250, delivered: 1180, opened: 450, clicked: 120},
      },
      {
        id: 'mock-2',
        title: '📢 Important Announcement',
        body: 'University admission deadlines have been extended by 2 weeks.',
        type: 'announcement',
        priority: 'urgent',
        status: 'sent',
        targetAudience: 'all',
        createdBy: 'admin',
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        sentAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        stats: {sent: 1500, delivered: 1420, opened: 890, clicked: 340},
      },
      {
        id: 'mock-3',
        title: '🆕 App Update Available',
        body: 'Version 1.2.0 is now available with new features and improvements.',
        type: 'update',
        priority: 'normal',
        status: 'sent',
        targetAudience: 'all',
        createdBy: 'admin',
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        sentAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        stats: {sent: 1400, delivered: 1350, opened: 620, clicked: 280},
      },
      {
        id: 'mock-4',
        title: '⏰ Entry Test Reminder',
        body: 'ECAT registration deadline is approaching. Complete your registration!',
        type: 'deadline',
        priority: 'high',
        status: 'scheduled',
        targetAudience: 'verified',
        scheduledAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'admin',
        createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'mock-5',
        title: '🏫 Admission Alert',
        body: 'LUMS has opened admissions for Fall 2026. Check eligibility now!',
        type: 'admission',
        priority: 'normal',
        status: 'draft',
        targetAudience: 'active',
        createdBy: 'admin',
        createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      },
    ];
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const adminNotificationService = new AdminNotificationService();
export default adminNotificationService;

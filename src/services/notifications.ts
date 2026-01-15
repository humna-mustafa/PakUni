/**
 * Notification Service - Local and Push Notifications
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform, Alert} from 'react-native';
import {logger} from '../utils/logger';

// Scoped logger for notification service
const log = logger.scope('Notifications');

// ============================================================================
// TYPES
// ============================================================================

export interface NotificationPreferences {
  enabled: boolean;
  scholarships: boolean;
  admissions: boolean;
  entryTests: boolean;
  tips: boolean;
  updates: boolean;
}

export interface LocalNotification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  scheduledAt?: Date;
  read: boolean;
  createdAt: string;
  type: 'scholarship' | 'admission' | 'test' | 'tip' | 'update' | 'general';
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEYS = {
  NOTIFICATION_PREFS: '@pakuni_notification_prefs',
  NOTIFICATIONS: '@pakuni_notifications',
  PUSH_TOKEN: '@pakuni_push_token',
};

const DEFAULT_PREFS: NotificationPreferences = {
  enabled: true,
  scholarships: true,
  admissions: true,
  entryTests: true,
  tips: true,
  updates: true,
};

// ============================================================================
// NOTIFICATION SERVICE
// ============================================================================

class NotificationService {
  private preferences: NotificationPreferences = DEFAULT_PREFS;
  private notifications: LocalNotification[] = [];
  private pushToken: string | null = null;
  private isInitialized: boolean = false;

  /**
   * Initialize notification service
   */
  async initialize(): Promise<void> {
    try {
      // Load preferences
      const prefsStr = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_PREFS);
      if (prefsStr) {
        this.preferences = JSON.parse(prefsStr);
      }

      // Load notifications
      const notifStr = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (notifStr) {
        this.notifications = JSON.parse(notifStr);
      }

      // Load push token
      this.pushToken = await AsyncStorage.getItem(STORAGE_KEYS.PUSH_TOKEN);

      this.isInitialized = true;

      // Clean old notifications
      await this.cleanOldNotifications();
    } catch (error) {
      log.error('Service init error', error);
      this.isInitialized = true;
    }
  }

  /**
   * Save preferences
   */
  private async savePreferences(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.NOTIFICATION_PREFS,
        JSON.stringify(this.preferences)
      );
    } catch (error) {
      log.error('Save preferences error', error);
    }
  }

  /**
   * Save notifications
   */
  private async saveNotifications(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.NOTIFICATIONS,
        JSON.stringify(this.notifications)
      );
    } catch (error) {
      log.error('Save notifications error', error);
    }
  }

  /**
   * Get notification preferences
   */
  getPreferences(): NotificationPreferences {
    return {...this.preferences};
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(updates: Partial<NotificationPreferences>): Promise<void> {
    this.preferences = {...this.preferences, ...updates};
    await this.savePreferences();
  }

  /**
   * Toggle specific notification type
   */
  async toggleNotificationType(
    type: keyof NotificationPreferences
  ): Promise<boolean> {
    this.preferences[type] = !this.preferences[type];
    await this.savePreferences();
    return this.preferences[type];
  }

  /**
   * Add local notification
   */
  async addNotification(
    notification: Omit<LocalNotification, 'id' | 'read' | 'createdAt'>
  ): Promise<LocalNotification> {
    const newNotification: LocalNotification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      read: false,
      createdAt: new Date().toISOString(),
    };

    this.notifications.unshift(newNotification);
    await this.saveNotifications();

    return newNotification;
  }

  /**
   * Get all notifications
   */
  getNotifications(): LocalNotification[] {
    return [...this.notifications];
  }

  /**
   * Get unread notification count
   */
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<void> {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications[index].read = true;
      await this.saveNotifications();
    }
  }

  /**
   * Mark all as read
   */
  async markAllAsRead(): Promise<void> {
    this.notifications = this.notifications.map(n => ({...n, read: true}));
    await this.saveNotifications();
  }

  /**
   * Delete notification
   */
  async deleteNotification(id: string): Promise<void> {
    this.notifications = this.notifications.filter(n => n.id !== id);
    await this.saveNotifications();
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<void> {
    this.notifications = [];
    await this.saveNotifications();
  }

  /**
   * Clean old notifications (older than 30 days)
   */
  private async cleanOldNotifications(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const originalLength = this.notifications.length;
    this.notifications = this.notifications.filter(n => {
      const createdAt = new Date(n.createdAt);
      return createdAt > thirtyDaysAgo;
    });

    if (this.notifications.length !== originalLength) {
      await this.saveNotifications();
    }
  }

  /**
   * Create scholarship notification
   */
  async notifyScholarship(
    name: string,
    provider: string,
    deadline?: string
  ): Promise<void> {
    if (!this.preferences.scholarships) return;

    const deadlineText = deadline ? ` Deadline: ${deadline}` : '';
    await this.addNotification({
      title: '🎓 New Scholarship Available!',
      body: `${name} by ${provider}.${deadlineText}`,
      type: 'scholarship',
      data: {name, provider, deadline},
    });
  }

  /**
   * Create admission notification
   */
  async notifyAdmission(
    university: string,
    program?: string
  ): Promise<void> {
    if (!this.preferences.admissions) return;

    const programText = program ? ` for ${program}` : '';
    await this.addNotification({
      title: '📝 Admissions Open!',
      body: `${university} has opened admissions${programText}. Apply now!`,
      type: 'admission',
      data: {university, program},
    });
  }

  /**
   * Create entry test notification
   */
  async notifyEntryTest(
    testName: string,
    date: string,
    registrationDeadline?: string
  ): Promise<void> {
    if (!this.preferences.entryTests) return;

    const regText = registrationDeadline 
      ? ` Registration deadline: ${registrationDeadline}` 
      : '';
    await this.addNotification({
      title: '📋 Entry Test Reminder',
      body: `${testName} is scheduled for ${date}.${regText}`,
      type: 'test',
      data: {testName, date, registrationDeadline},
    });
  }

  /**
   * Create study tip notification
   */
  async notifyStudyTip(tip: string): Promise<void> {
    if (!this.preferences.tips) return;

    await this.addNotification({
      title: '💡 Study Tip',
      body: tip,
      type: 'tip',
    });
  }

  /**
   * Create app update notification
   */
  async notifyUpdate(title: string, message: string): Promise<void> {
    if (!this.preferences.updates) return;

    await this.addNotification({
      title: `🆕 ${title}`,
      body: message,
      type: 'update',
    });
  }

  // ==========================================================================
  // SPECIAL OCCASION NOTIFICATIONS
  // ==========================================================================

  /**
   * Send birthday wishes notification
   */
  async sendBirthdayWishes(userName?: string): Promise<void> {
    const name = userName || 'there';
    const messages = [
      `🎂 Happy Birthday, ${name}! May this year bring you success in all your academic goals! 🎓✨`,
      `🎉 Wishing you an amazing birthday, ${name}! May all your university dreams come true! 🌟`,
      `🎈 Happy Birthday! Here's to a year full of achievements and new opportunities! 🎊`,
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    await this.addNotification({
      title: '🎂 Happy Birthday!',
      body: randomMessage,
      type: 'general',
      data: {occasion: 'birthday'},
    });
  }

  /**
   * Send exam day encouragement
   */
  async sendExamDayWishes(examName?: string): Promise<void> {
    const exam = examName || 'your exam';
    const messages = [
      `💪 Best of luck for ${exam} today! You've got this! 🌟`,
      `📝 Exam day is here! Stay calm, trust your preparation, and shine! ✨`,
      `🎯 All the best for ${exam}! Remember: you're more prepared than you think! 💫`,
      `🍀 Good luck on ${exam}! Take a deep breath, you've prepared well! 🙏`,
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    await this.addNotification({
      title: '📝 Exam Day!',
      body: randomMessage,
      type: 'general',
      data: {occasion: 'exam', examName},
    });
  }

  /**
   * Send result day encouragement
   */
  async sendResultDayWishes(resultType?: string): Promise<void> {
    const result = resultType || 'results';
    const messages = [
      `🤲 ${result} are out today! Whatever the outcome, remember you did your best! 🌟`,
      `📊 Result day! Trust your efforts and stay positive. You're amazing regardless! 💪`,
      `🎯 ${result} announcement day! Remember: grades don't define your worth! ✨`,
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    await this.addNotification({
      title: '📊 Result Day!',
      body: randomMessage,
      type: 'general',
      data: {occasion: 'result', resultType},
    });
  }

  /**
   * Send merit list announcement excitement
   */
  async sendMeritListWishes(universityName?: string): Promise<void> {
    const uni = universityName || 'your university';
    const messages = [
      `📜 Merit list update from ${uni}! Check your status now! 🎓`,
      `🎉 Good news! ${uni} merit list has been updated. Best of luck! 🍀`,
      `📝 Merit list alert for ${uni}! May the odds be in your favor! ✨`,
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    await this.addNotification({
      title: '📜 Merit List Update!',
      body: randomMessage,
      type: 'admission',
      data: {occasion: 'merit_list', universityName},
    });
  }

  /**
   * Send achievement unlocked notification
   */
  async sendAchievementUnlocked(badgeName: string, badgeEmoji: string): Promise<void> {
    await this.addNotification({
      title: `${badgeEmoji} Achievement Unlocked!`,
      body: `Congratulations! You've earned the "${badgeName}" badge! Keep up the great work! 🎉`,
      type: 'general',
      data: {occasion: 'achievement', badgeName},
    });
  }

  /**
   * Send streak celebration
   */
  async sendStreakCelebration(days: number): Promise<void> {
    await this.addNotification({
      title: '🔥 Streak Milestone!',
      body: `Wow! ${days}-day streak! Your consistency is inspiring! Keep going! 💪`,
      type: 'general',
      data: {occasion: 'streak', days},
    });
  }

  /**
   * Send motivational message
   */
  async sendMotivationalMessage(): Promise<void> {
    const messages = [
      {title: '💪 Stay Strong!', body: 'Every hour of study brings you closer to your dream university! Keep going! 🎓'},
      {title: '🌟 You\'ve Got This!', body: 'Success is built one day at a time. Today is your day to shine! ✨'},
      {title: '🚀 Keep Pushing!', body: 'The harder you work now, the brighter your future will be! 💫'},
      {title: '📚 Study Smart!', body: 'Remember: consistency beats intensity. A little every day goes a long way! 🎯'},
      {title: '🌈 Stay Positive!', body: 'Challenges are just stepping stones to success. You\'re doing great! 🙌'},
      {title: '⭐ Believe in Yourself!', body: 'You have what it takes. Trust your journey and keep moving forward! 🌟'},
    ];
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];

    await this.addNotification({
      title: randomMsg.title,
      body: randomMsg.body,
      type: 'tip',
      data: {occasion: 'motivation'},
    });
  }

  /**
   * Send admission season reminder
   */
  async sendAdmissionSeasonAlert(): Promise<void> {
    await this.addNotification({
      title: '📅 Admission Season Alert!',
      body: 'University admissions are opening soon! Make sure your documents are ready! 📋',
      type: 'admission',
      data: {occasion: 'admission_season'},
    });
  }

  /**
   * Request notification permissions (placeholder for actual implementation)
   */
  async requestPermissions(): Promise<boolean> {
    try {
      // In a real implementation, you would request push notification permissions here
      // using libraries like react-native-push-notification or expo-notifications
      
      // For now, we'll just simulate permission granted
      return true;
    } catch (error) {
      log.error('Request permissions error', error);
      return false;
    }
  }

  /**
   * Register for push notifications
   * Note: In production, integrate with Firebase Cloud Messaging (FCM)
   * Install: npm install @react-native-firebase/app @react-native-firebase/messaging
   */
  async registerForPushNotifications(): Promise<string | null> {
    try {
      // TODO: Implement Firebase Cloud Messaging integration
      // Example with @react-native-firebase/messaging:
      // 
      // import messaging from '@react-native-firebase/messaging';
      // 
      // const authStatus = await messaging().requestPermission();
      // const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED;
      // 
      // if (enabled) {
      //   const token = await messaging().getToken();
      //   this.pushToken = token;
      //   await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, token);
      //   return token;
      // }
      
      // For development: Return device-specific identifier
      // Push notifications will use local notifications until FCM is integrated
      const deviceId = `${Platform.OS}_${Platform.Version}_${Date.now()}`;
      this.pushToken = deviceId;
      await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, deviceId);
      
      // Log for development awareness
      if (__DEV__) {
        log.info('Push notifications: Using local-only mode. Integrate FCM for production.');
      }
      
      return deviceId;
    } catch (error) {
      log.warn('Push notification registration error', error);
      return null;
    }
  }

  /**
   * Get push token
   */
  getPushToken(): string | null {
    return this.pushToken;
  }
}

// Singleton instance
export const notificationService = new NotificationService();

// ============================================================================
// HOOK
// ============================================================================

import {useState, useEffect, useCallback} from 'react';

export const useNotifications = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFS);
  const [notifications, setNotifications] = useState<LocalNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const init = async () => {
      await notificationService.initialize();
      setPreferences(notificationService.getPreferences());
      setNotifications(notificationService.getNotifications());
      setUnreadCount(notificationService.getUnreadCount());
    };
    init();
  }, []);

  const updatePreferences = useCallback(async (updates: Partial<NotificationPreferences>) => {
    await notificationService.updatePreferences(updates);
    setPreferences(notificationService.getPreferences());
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications(notificationService.getNotifications());
    setUnreadCount(notificationService.getUnreadCount());
  }, []);

  const markAllAsRead = useCallback(async () => {
    await notificationService.markAllAsRead();
    setNotifications(notificationService.getNotifications());
    setUnreadCount(0);
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    await notificationService.deleteNotification(id);
    setNotifications(notificationService.getNotifications());
    setUnreadCount(notificationService.getUnreadCount());
  }, []);

  const clearAll = useCallback(async () => {
    await notificationService.clearAllNotifications();
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const refresh = useCallback(() => {
    setNotifications(notificationService.getNotifications());
    setUnreadCount(notificationService.getUnreadCount());
  }, []);

  return {
    preferences,
    notifications,
    unreadCount,
    updatePreferences,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refresh,
  };
};

export default notificationService;

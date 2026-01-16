/**
 * Analytics Service - Enterprise-grade analytics abstraction
 * Provides unified interface for analytics and crash reporting
 * 
 * OPTIMIZED FOR SUPABASE FREE TIER:
 * - Events are batched and sent periodically (not real-time)
 * - Local queue with deferred persistence
 * - No real-time subscriptions
 */

import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {supabase} from './supabase';
import DeviceInfo from 'react-native-device-info';
import {logger} from '../utils/logger';

// Constants for batching
const BATCH_SIZE = 20;
const FLUSH_INTERVAL = 60000; // 1 minute
const STORAGE_KEY = '@pakuni_analytics_queue';

// ============================================================================
// TYPES
// ============================================================================

export interface AnalyticsUser {
  userId?: string;
  email?: string;
  name?: string;
  city?: string;
  currentClass?: string;
  board?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface AnalyticsEvent {
  name: string;
  params?: Record<string, string | number | boolean | null | undefined>;
  timestamp?: number;
}

export interface ScreenView {
  screenName: string;
  screenClass?: string;
  params?: Record<string, string | number | boolean>;
}

export interface ErrorReport {
  error: Error;
  context?: string;
  metadata?: Record<string, any>;
  isFatal?: boolean;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// ============================================================================
// ANALYTICS EVENT NAMES - Type-safe event names
// ============================================================================

export const ANALYTICS_EVENTS = {
  // Navigation
  SCREEN_VIEW: 'screen_view',
  TAB_CHANGE: 'tab_change',
  
  // User Actions
  BUTTON_CLICK: 'button_click',
  CARD_TAP: 'card_tap',
  SEARCH: 'search',
  FILTER_APPLIED: 'filter_applied',
  SORT_APPLIED: 'sort_applied',
  
  // Feature Usage
  MERIT_CALCULATED: 'merit_calculated',
  UNIVERSITY_VIEWED: 'university_viewed',
  UNIVERSITY_SAVED: 'university_saved',
  SCHOLARSHIP_VIEWED: 'scholarship_viewed',
  SCHOLARSHIP_SAVED: 'scholarship_saved',
  COMPARISON_MADE: 'comparison_made',
  ENTRY_TEST_VIEWED: 'entry_test_viewed',
  RECOMMENDATION_VIEWED: 'recommendation_viewed',
  
  // Career Features
  CAREER_QUIZ_STARTED: 'career_quiz_started',
  CAREER_QUIZ_COMPLETED: 'career_quiz_completed',
  CAREER_GUIDANCE_VIEWED: 'career_guidance_viewed',
  GOAL_SET: 'goal_set',
  
  // Profile
  PROFILE_UPDATED: 'profile_updated',
  MARKS_ENTERED: 'marks_entered',
  INTERESTS_UPDATED: 'interests_updated',
  
  // Settings
  THEME_CHANGED: 'theme_changed',
  LANGUAGE_CHANGED: 'language_changed',
  NOTIFICATION_TOGGLED: 'notification_toggled',
  
  // Errors
  ERROR_OCCURRED: 'error_occurred',
  NETWORK_ERROR: 'network_error',
  
  // Engagement
  APP_OPENED: 'app_opened',
  APP_BACKGROUNDED: 'app_backgrounded',
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',
  
  // Kids Features
  KIDS_HUB_OPENED: 'kids_hub_opened',
  KIDS_CAREER_EXPLORER: 'kids_career_explorer',
} as const;

export type AnalyticsEventName = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];

// ============================================================================
// ANALYTICS SERVICE IMPLEMENTATION
// ============================================================================

class AnalyticsService {
  private isEnabled: boolean = true;
  private isDebugMode: boolean = __DEV__;
  private user: AnalyticsUser = {};
  private sessionId: string = '';
  private sessionStartTime: number = 0;
  private eventQueue: AnalyticsEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private deviceInfo: {type: string; osVersion: string; appVersion: string} = {
    type: Platform.OS,
    osVersion: Platform.Version.toString(),
    appVersion: '1.0.0',
  };
  
  // Provider references (would be initialized with actual SDKs)
  private providers: {
    firebase?: any;
    amplitude?: any;
    mixpanel?: any;
    crashlytics?: any;
    sentry?: any;
  } = {};

  constructor() {
    this.initSession();
    this.loadQueuedEvents();
    this.startFlushTimer();
    this.initDeviceInfo();
  }

  /**
   * Initialize device info
   */
  private async initDeviceInfo(): Promise<void> {
    try {
      const [deviceType, systemVersion, appVersion] = await Promise.all([
        DeviceInfo.getDeviceType(),
        DeviceInfo.getSystemVersion(),
        DeviceInfo.getVersion(),
      ]);
      this.deviceInfo = {
        type: deviceType,
        osVersion: systemVersion,
        appVersion: appVersion,
      };
    } catch (error) {
      // Fallback to default values
      this.log('Could not get device info:', error);
    }
  }

  /**
   * Initialize analytics session
   */
  private initSession(): void {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    
    this.log('Analytics session started', {
      sessionId: this.sessionId,
      platform: Platform.OS,
      version: Platform.Version,
    });
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Start the flush timer for batched event sending
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushTimer = setInterval(() => {
      this.flush();
    }, FLUSH_INTERVAL);
  }

  /**
   * Load queued events from storage
   */
  private async loadQueuedEvents(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const events = JSON.parse(stored);
        this.eventQueue = [...events, ...this.eventQueue];
        this.log(`Loaded ${events.length} queued events from storage`);
      }
    } catch (error) {
      this.log('Error loading queued events:', error);
    }
  }

  /**
   * Save event queue to storage (for persistence across app restarts)
   */
  private async saveQueueToStorage(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.eventQueue));
    } catch (error) {
      this.log('Error saving event queue:', error);
    }
  }

  /**
   * Initialize analytics providers
   */
  async initialize(config?: {
    firebaseEnabled?: boolean;
    amplitudeApiKey?: string;
    mixpanelToken?: string;
    sentryDsn?: string;
  }): Promise<void> {
    try {
      // Initialize providers based on config
      // In production, you would initialize actual SDKs here:
      // 
      // if (config?.firebaseEnabled) {
      //   this.providers.firebase = await require('@react-native-firebase/analytics').default;
      //   this.providers.crashlytics = await require('@react-native-firebase/crashlytics').default;
      // }
      
      this.log('Analytics initialized', config);
      this.trackEvent(ANALYTICS_EVENTS.SESSION_START);
    } catch (error) {
      this.logError('Failed to initialize analytics', error as Error);
    }
  }

  /**
   * Set user identification
   */
  setUser(user: AnalyticsUser): void {
    this.user = {...this.user, ...user};
    
    // Set user in all providers
    // this.providers.firebase?.setUserId(user.userId);
    // this.providers.amplitude?.setUserId(user.userId);
    
    this.log('User set', {userId: user.userId});
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: Record<string, string | number | boolean>): void {
    Object.assign(this.user, properties);
    
    // Set properties in all providers
    // this.providers.firebase?.setUserProperties(properties);
    
    this.log('User properties set', properties);
  }

  /**
   * Track a custom event
   */
  trackEvent(
    eventName: AnalyticsEventName | string,
    params?: Record<string, string | number | boolean | null | undefined>,
  ): void {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      name: eventName,
      params: {
        ...params,
        session_id: this.sessionId,
        platform: Platform.OS,
      },
      timestamp: Date.now(),
    };

    // Send to providers
    // this.providers.firebase?.logEvent(eventName, event.params);
    // this.providers.amplitude?.track(eventName, event.params);

    this.log(`Event: ${eventName}`, event.params);
    this.eventQueue.push(event);
  }

  /**
   * Track screen view
   */
  trackScreen(screenName: string, params?: Record<string, string | number | boolean>): void {
    if (!this.isEnabled) return;

    const screenView: ScreenView = {
      screenName,
      screenClass: screenName,
      params: {
        ...params,
        session_id: this.sessionId,
      },
    };

    // Send to providers
    // this.providers.firebase?.logScreenView(screenView);

    this.log(`Screen: ${screenName}`, params);
    this.trackEvent(ANALYTICS_EVENTS.SCREEN_VIEW, {screen_name: screenName, ...params});
  }

  /**
   * Track button click
   */
  trackButtonClick(buttonName: string, context?: string): void {
    this.trackEvent(ANALYTICS_EVENTS.BUTTON_CLICK, {
      button_name: buttonName,
      context: context || 'unknown',
    });
  }

  /**
   * Track search
   */
  trackSearch(query: string, resultsCount?: number, category?: string): void {
    this.trackEvent(ANALYTICS_EVENTS.SEARCH, {
      search_query: query,
      results_count: resultsCount ?? 0,
      category: category || 'all',
    });
  }

  /**
   * Track university view
   */
  trackUniversityView(universityId: string, universityName: string): void {
    this.trackEvent(ANALYTICS_EVENTS.UNIVERSITY_VIEWED, {
      university_id: universityId,
      university_name: universityName,
    });
  }

  /**
   * Track scholarship view
   */
  trackScholarshipView(scholarshipId: string, scholarshipName: string): void {
    this.trackEvent(ANALYTICS_EVENTS.SCHOLARSHIP_VIEWED, {
      scholarship_id: scholarshipId,
      scholarship_name: scholarshipName,
    });
  }

  /**
   * Track merit calculation
   */
  trackMeritCalculation(params: {
    university?: string;
    program?: string;
    calculatedMerit?: number;
  }): void {
    this.trackEvent(ANALYTICS_EVENTS.MERIT_CALCULATED, {
      university: params.university || 'unknown',
      program: params.program || 'unknown',
      calculated_merit: params.calculatedMerit ?? 0,
    });
  }

  /**
   * Track theme change
   */
  trackThemeChange(theme: 'light' | 'dark' | 'system'): void {
    this.trackEvent(ANALYTICS_EVENTS.THEME_CHANGED, {theme});
  }

  /**
   * Report an error (non-fatal)
   */
  reportError(error: Error, context?: string, metadata?: Record<string, any>): void {
    const errorReport: ErrorReport = {
      error,
      context,
      metadata: {
        ...metadata,
        sessionId: this.sessionId,
        userId: this.user.userId,
        platform: Platform.OS,
      },
      isFatal: false,
    };

    // Send to crash reporting services
    // this.providers.crashlytics?.recordError(error);
    // this.providers.sentry?.captureException(error, {extra: errorReport.metadata});

    this.logError(`Error reported: ${context}`, error);
    this.trackEvent(ANALYTICS_EVENTS.ERROR_OCCURRED, {
      error_message: error.message,
      error_name: error.name,
      context: context || 'unknown',
    });
  }

  /**
   * Report a fatal error (crash)
   */
  reportFatalError(error: Error, context?: string): void {
    const errorReport: ErrorReport = {
      error,
      context,
      metadata: {
        sessionId: this.sessionId,
        userId: this.user.userId,
        platform: Platform.OS,
      },
      isFatal: true,
    };

    // Send to crash reporting services
    // this.providers.crashlytics?.crash();
    // this.providers.sentry?.captureException(error, {level: 'fatal'});

    this.logError(`FATAL Error: ${context}`, error);
  }

  /**
   * Report network error
   */
  reportNetworkError(endpoint: string, statusCode?: number, message?: string): void {
    this.trackEvent(ANALYTICS_EVENTS.NETWORK_ERROR, {
      endpoint,
      status_code: statusCode ?? 0,
      error_message: message || 'Unknown network error',
    });
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    this.log(`Analytics ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Enable/disable debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.isDebugMode = enabled;
  }

  /**
   * Get session duration
   */
  getSessionDuration(): number {
    return Date.now() - this.sessionStartTime;
  }

  /**
   * End session (call when app goes to background)
   */
  endSession(): void {
    this.trackEvent(ANALYTICS_EVENTS.SESSION_END, {
      session_duration_ms: this.getSessionDuration(),
      events_count: this.eventQueue.length,
    });

    this.log('Session ended', {
      duration: this.getSessionDuration(),
      eventsCount: this.eventQueue.length,
    });
  }

  /**
   * Flush event queue (send pending events to Supabase)
   * OPTIMIZED: Batched inserts to minimize database calls
   */
  async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return;
    
    // Take events in batches to avoid large inserts
    const eventsToSend = this.eventQueue.splice(0, BATCH_SIZE);
    
    if (eventsToSend.length === 0) return;
    
    this.log(`Flushing ${eventsToSend.length} events to Supabase`);
    
    try {
      // Get current user for event association
      const {data: {user}} = await supabase.auth.getUser();
      
      // Prepare events for Supabase
      const dbEvents = eventsToSend.map(event => ({
        user_id: user?.id || null,
        event_name: event.name,
        event_category: this.getEventCategory(event.name),
        event_data: event.params || {},
        screen_name: event.params?.screen_name as string || null,
        session_id: this.sessionId,
        device_type: this.deviceInfo.type,
        os_version: this.deviceInfo.osVersion,
        app_version: this.deviceInfo.appVersion,
        created_at: new Date(event.timestamp || Date.now()).toISOString(),
      }));
      
      // Insert events in batch
      const {error} = await supabase
        .from('analytics_events')
        .insert(dbEvents);
      
      if (error) {
        // If insert fails, put events back in queue
        this.eventQueue.unshift(...eventsToSend);
        this.logError('Failed to flush events to Supabase', error as any);
      } else {
        this.log(`Successfully flushed ${eventsToSend.length} events`);
      }
      
      // Save remaining queue to storage
      await this.saveQueueToStorage();
    } catch (error) {
      // Put events back in queue on failure
      this.eventQueue.unshift(...eventsToSend);
      this.logError('Error flushing events', error as Error);
      await this.saveQueueToStorage();
    }
  }

  /**
   * Get event category from event name
   */
  private getEventCategory(eventName: string): string {
    if (eventName.includes('screen') || eventName.includes('tab')) return 'navigation';
    if (eventName.includes('button') || eventName.includes('click') || eventName.includes('tap')) return 'interaction';
    if (eventName.includes('search')) return 'search';
    if (eventName.includes('university') || eventName.includes('scholarship') || eventName.includes('program')) return 'content';
    if (eventName.includes('session') || eventName.includes('app')) return 'session';
    if (eventName.includes('error') || eventName.includes('network')) return 'error';
    if (eventName.includes('theme') || eventName.includes('notification') || eventName.includes('language')) return 'settings';
    if (eventName.includes('career') || eventName.includes('quiz') || eventName.includes('goal')) return 'feature';
    if (eventName.includes('merit') || eventName.includes('calculated')) return 'calculator';
    return 'general';
  }

  /**
   * Reset analytics (e.g., on logout)
   */
  async reset(): Promise<void> {
    // Flush remaining events before reset
    await this.flush();
    
    this.user = {};
    this.eventQueue = [];
    this.initSession();
    
    // Clear storage
    await AsyncStorage.removeItem(STORAGE_KEY);
    
    // Reset providers
    // this.providers.amplitude?.reset();
    
    this.log('Analytics reset');
  }

  /**
   * Cleanup (call when app is closing)
   */
  async cleanup(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    // Flush remaining events
    await this.flush();
    
    // Save any remaining events to storage
    await this.saveQueueToStorage();
  }

  /**
   * Internal logging (only in debug mode)
   */
  private log(message: string, data?: any): void {
    if (this.isDebugMode) {
      logger.debug(message, data, 'Analytics');
    }
  }

  /**
   * Internal error logging
   */
  private logError(message: string, error: Error): void {
    if (this.isDebugMode) {
      logger.error(message, error, 'Analytics');
    }
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// ============================================================================
// REACT HOOKS
// ============================================================================

import {useEffect, useRef} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';

/**
 * Hook to track screen views automatically
 */
export const useAnalyticsScreen = (screenName: string): void => {
  useEffect(() => {
    analytics.trackScreen(screenName);
  }, [screenName]);
};

/**
 * Hook to track time spent on screen
 */
export const useScreenTime = (screenName: string): void => {
  const startTime = useRef(Date.now());

  useEffect(() => {
    startTime.current = Date.now();

    return () => {
      const duration = Date.now() - startTime.current;
      analytics.trackEvent('screen_time', {
        screen_name: screenName,
        duration_ms: duration,
      });
    };
  }, [screenName]);
};

/**
 * Hook to create tracked event handlers
 */
export const useTrackedCallback = <T extends (...args: any[]) => any>(
  eventName: string,
  callback: T,
  eventParams?: Record<string, string | number | boolean>,
): T => {
  const wrappedCallback = useRef<T>(callback);

  useEffect(() => {
    wrappedCallback.current = callback;
  }, [callback]);

  return ((...args: Parameters<T>) => {
    analytics.trackEvent(eventName, eventParams);
    return wrappedCallback.current(...args);
  }) as T;
};

export default analytics;

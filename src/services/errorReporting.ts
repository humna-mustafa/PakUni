/**
 * Error Reporting Service
 * Enterprise-grade error handling with admin reporting
 * 
 * Features:
 * - User-friendly error messages
 * - Automatic error reporting to admin portal
 * - Error categorization and severity levels
 * - Device and context info collection
 * - Offline error queuing
 */

import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {supabase} from './supabase';
import DeviceInfo from 'react-native-device-info';

// ============================================================================
// TYPES
// ============================================================================

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory = 
  | 'network'
  | 'authentication'
  | 'permission'
  | 'validation'
  | 'server'
  | 'database'
  | 'ui_crash'
  | 'navigation'
  | 'data_sync'
  | 'payment'
  | 'unknown';

export type ErrorStatus = 'new' | 'acknowledged' | 'investigating' | 'resolved' | 'wont_fix';

export interface ErrorReport {
  id?: string;
  user_id?: string;
  error_message: string;
  error_name: string;
  error_stack?: string;
  component_stack?: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  status: ErrorStatus;
  screen_name?: string;
  user_action?: string;
  device_info: DeviceInfoData;
  app_version: string;
  additional_context?: Record<string, any>;
  user_feedback?: string;
  resolved_by?: string;
  resolution_notes?: string;
  resolved_at?: string;
  occurrence_count: number;
  first_occurred_at: string;
  last_occurred_at: string;
  created_at?: string;
}

export interface DeviceInfoData {
  platform: string;
  os_version: string;
  device_model: string;
  device_brand: string;
  app_version: string;
  build_number: string;
  is_emulator: boolean;
  screen_width?: number;
  screen_height?: number;
}

export interface UserFriendlyError {
  title: string;
  message: string;
  icon: string;
  actionLabel?: string;
  canRetry: boolean;
  canReport: boolean;
  severity: ErrorSeverity;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const OFFLINE_ERRORS_KEY = '@pakuni/offline_errors';
const MAX_OFFLINE_ERRORS = 50;
const ERROR_DEDUPE_WINDOW_MS = 60000; // 1 minute

// User-friendly error messages map
const ERROR_MESSAGES: Record<ErrorCategory, {title: string; message: string; icon: string}> = {
  network: {
    title: 'Connection Issue',
    message: 'We\'re having trouble connecting to our servers. Please check your internet connection and try again.',
    icon: 'wifi-outline',
  },
  authentication: {
    title: 'Session Expired',
    message: 'Your session has expired for security reasons. Please log in again to continue.',
    icon: 'lock-closed-outline',
  },
  permission: {
    title: 'Access Denied',
    message: 'You don\'t have permission to access this feature. Please contact support if you believe this is an error.',
    icon: 'shield-outline',
  },
  validation: {
    title: 'Invalid Input',
    message: 'Please check your information and try again. Some fields may contain invalid data.',
    icon: 'alert-circle-outline',
  },
  server: {
    title: 'Server Issue',
    message: 'Our servers are experiencing some issues. We\'re working on it! Please try again in a few moments.',
    icon: 'server-outline',
  },
  database: {
    title: 'Data Error',
    message: 'We couldn\'t load or save your data. Please try again or contact support if the issue persists.',
    icon: 'folder-outline',
  },
  ui_crash: {
    title: 'Something Went Wrong',
    message: 'The app encountered an unexpected error. We\'ve been notified and are working on a fix.',
    icon: 'bug-outline',
  },
  navigation: {
    title: 'Navigation Error',
    message: 'We couldn\'t navigate to that screen. Please go back and try again.',
    icon: 'navigate-outline',
  },
  data_sync: {
    title: 'Sync Failed',
    message: 'We couldn\'t sync your data. Your changes are saved locally and will sync when the connection is restored.',
    icon: 'sync-outline',
  },
  payment: {
    title: 'Payment Issue',
    message: 'There was a problem processing your payment. Please try again or use a different payment method.',
    icon: 'card-outline',
  },
  unknown: {
    title: 'Unexpected Error',
    message: 'Something unexpected happened. Our team has been notified. Please try again.',
    icon: 'help-circle-outline',
  },
};

// ============================================================================
// ERROR REPORTING SERVICE CLASS
// ============================================================================

class ErrorReportingService {
  private recentErrors: Map<string, number> = new Map();
  private deviceInfo: DeviceInfoData | null = null;
  private currentScreen: string = 'Unknown';
  private isInitialized: boolean = false;

  // Helper to safely get current user ID
  private async getCurrentUserId(): Promise<string | undefined> {
    try {
      const {data} = await supabase.auth.getSession();
      return data?.session?.user?.id;
    } catch {
      return undefined;
    }
  }

  // -------------------------------------------------------------------------
  // INITIALIZATION
  // -------------------------------------------------------------------------

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.deviceInfo = await this.collectDeviceInfo();
      await this.syncOfflineErrors();
      this.isInitialized = true;
      console.log('[ErrorReporting] Service initialized');
    } catch (error) {
      console.error('[ErrorReporting] Initialization failed:', error);
    }
  }

  private async collectDeviceInfo(): Promise<DeviceInfoData> {
    try {
      const [
        model,
        brand,
        version,
        buildNumber,
        isEmulator,
      ] = await Promise.all([
        DeviceInfo.getModel(),
        DeviceInfo.getBrand(),
        DeviceInfo.getVersion(),
        DeviceInfo.getBuildNumber(),
        DeviceInfo.isEmulator(),
      ]);

      return {
        platform: Platform.OS,
        os_version: Platform.Version.toString(),
        device_model: model,
        device_brand: brand,
        app_version: version,
        build_number: buildNumber,
        is_emulator: isEmulator,
      };
    } catch (error) {
      return {
        platform: Platform.OS,
        os_version: Platform.Version.toString(),
        device_model: 'Unknown',
        device_brand: 'Unknown',
        app_version: '1.0.0',
        build_number: '1',
        is_emulator: __DEV__,
      };
    }
  }

  // -------------------------------------------------------------------------
  // SCREEN TRACKING
  // -------------------------------------------------------------------------

  setCurrentScreen(screenName: string): void {
    this.currentScreen = screenName;
  }

  // -------------------------------------------------------------------------
  // ERROR CATEGORIZATION
  // -------------------------------------------------------------------------

  categorizeError(error: Error): {category: ErrorCategory; severity: ErrorSeverity} {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    // Network errors
    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('timeout') ||
      message.includes('connection')
    ) {
      return {category: 'network', severity: 'medium'};
    }

    // Authentication errors
    if (
      message.includes('401') ||
      message.includes('unauthorized') ||
      message.includes('auth') ||
      message.includes('token') ||
      message.includes('session')
    ) {
      return {category: 'authentication', severity: 'medium'};
    }

    // Permission errors
    if (
      message.includes('403') ||
      message.includes('forbidden') ||
      message.includes('permission') ||
      message.includes('access denied')
    ) {
      return {category: 'permission', severity: 'medium'};
    }

    // Validation errors
    if (
      message.includes('validation') ||
      message.includes('invalid') ||
      message.includes('required') ||
      message.includes('format')
    ) {
      return {category: 'validation', severity: 'low'};
    }

    // Server errors
    if (
      message.includes('500') ||
      message.includes('502') ||
      message.includes('503') ||
      message.includes('server') ||
      message.includes('internal')
    ) {
      return {category: 'server', severity: 'high'};
    }

    // Database errors
    if (
      message.includes('database') ||
      message.includes('supabase') ||
      message.includes('postgres') ||
      message.includes('query')
    ) {
      return {category: 'database', severity: 'high'};
    }

    // Navigation errors
    if (
      message.includes('navigate') ||
      message.includes('route') ||
      message.includes('screen')
    ) {
      return {category: 'navigation', severity: 'low'};
    }

    // UI Crash (likely from render errors)
    if (
      name.includes('typeerror') ||
      name.includes('referenceerror') ||
      message.includes('undefined') ||
      message.includes('null')
    ) {
      return {category: 'ui_crash', severity: 'high'};
    }

    return {category: 'unknown', severity: 'medium'};
  }

  // -------------------------------------------------------------------------
  // USER-FRIENDLY ERROR FORMATTING
  // -------------------------------------------------------------------------

  formatUserFriendlyError(error: Error, category?: ErrorCategory): UserFriendlyError {
    const {category: detectedCategory, severity} = this.categorizeError(error);
    const finalCategory = category || detectedCategory;
    const errorConfig = ERROR_MESSAGES[finalCategory];

    return {
      title: errorConfig.title,
      message: errorConfig.message,
      icon: errorConfig.icon,
      canRetry: ['network', 'server', 'data_sync'].includes(finalCategory),
      canReport: true,
      severity,
      actionLabel: this.getActionLabel(finalCategory),
    };
  }

  private getActionLabel(category: ErrorCategory): string | undefined {
    switch (category) {
      case 'network':
        return 'Retry';
      case 'authentication':
        return 'Log In';
      case 'server':
        return 'Try Again';
      case 'data_sync':
        return 'Retry Sync';
      default:
        return undefined;
    }
  }

  // -------------------------------------------------------------------------
  // ERROR REPORTING
  // -------------------------------------------------------------------------

  async reportError(
    error: Error,
    options: {
      userAction?: string;
      additionalContext?: Record<string, any>;
      userFeedback?: string;
      componentStack?: string;
    } = {}
  ): Promise<{success: boolean; reportId?: string}> {
    try {
      // Dedupe check - don't report the same error too frequently
      const errorKey = `${error.name}:${error.message}`;
      const lastReported = this.recentErrors.get(errorKey);
      if (lastReported && Date.now() - lastReported < ERROR_DEDUPE_WINDOW_MS) {
        console.log('[ErrorReporting] Skipping duplicate error');
        return {success: true};
      }
      this.recentErrors.set(errorKey, Date.now());

      const {category, severity} = this.categorizeError(error);
      const userId = await this.getCurrentUserId();

      const errorReport: Omit<ErrorReport, 'id' | 'created_at'> = {
        user_id: userId,
        error_message: error.message,
        error_name: error.name,
        error_stack: error.stack,
        component_stack: options.componentStack,
        category,
        severity,
        status: 'new',
        screen_name: this.currentScreen,
        user_action: options.userAction,
        device_info: this.deviceInfo || await this.collectDeviceInfo(),
        app_version: this.deviceInfo?.app_version || '1.0.0',
        additional_context: options.additionalContext,
        user_feedback: options.userFeedback,
        occurrence_count: 1,
        first_occurred_at: new Date().toISOString(),
        last_occurred_at: new Date().toISOString(),
      };

      // Try to send to Supabase
      const {data, error: dbError} = await supabase
        .from('error_reports')
        .insert([errorReport])
        .select()
        .single();

      if (dbError) {
        // If offline or error, queue for later
        await this.queueOfflineError(errorReport);
        console.log('[ErrorReporting] Error queued for offline sync');
        return {success: true};
      }

      console.log('[ErrorReporting] Error reported:', data?.id);
      return {success: true, reportId: data?.id};
    } catch (err) {
      console.error('[ErrorReporting] Failed to report error:', err);
      return {success: false};
    }
  }

  // -------------------------------------------------------------------------
  // USER FEEDBACK SUBMISSION
  // -------------------------------------------------------------------------

  async submitUserFeedback(
    error: Error,
    feedback: string,
    contactEmail?: string
  ): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();
      const {category, severity} = this.categorizeError(error);

      // Check if error was already reported
      const {data: existingReport} = await supabase
        .from('error_reports')
        .select('id, occurrence_count')
        .eq('error_message', error.message)
        .eq('error_name', error.name)
        .single();

      if (existingReport) {
        // Update existing report with user feedback
        await supabase
          .from('error_reports')
          .update({
            user_feedback: feedback,
            occurrence_count: existingReport.occurrence_count + 1,
            last_occurred_at: new Date().toISOString(),
          })
          .eq('id', existingReport.id);
      } else {
        // Create new report with feedback
        await this.reportError(error, {userFeedback: feedback});
      }

      // Also submit as user feedback for admin response
      await supabase
        .from('user_feedback')
        .insert([{
          user_id: userId,
          type: 'bug',
          category: 'bug',
          title: `Error Report: ${error.name}`,
          message: feedback,
          contact_email: contactEmail,
          status: 'new',
          metadata: {
            error_message: error.message,
            error_name: error.name,
            category,
            severity,
            screen_name: this.currentScreen,
            device_info: this.deviceInfo,
          },
        }]);

      return true;
    } catch (err) {
      console.error('[ErrorReporting] Failed to submit feedback:', err);
      return false;
    }
  }

  // -------------------------------------------------------------------------
  // OFFLINE ERROR QUEUING
  // -------------------------------------------------------------------------

  private async queueOfflineError(error: Omit<ErrorReport, 'id' | 'created_at'>): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(OFFLINE_ERRORS_KEY);
      let errors: Omit<ErrorReport, 'id' | 'created_at'>[] = stored ? JSON.parse(stored) : [];

      // Limit queue size
      if (errors.length >= MAX_OFFLINE_ERRORS) {
        errors = errors.slice(-MAX_OFFLINE_ERRORS + 1);
      }

      errors.push(error);
      await AsyncStorage.setItem(OFFLINE_ERRORS_KEY, JSON.stringify(errors));
    } catch (err) {
      console.error('[ErrorReporting] Failed to queue offline error:', err);
    }
  }

  async syncOfflineErrors(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(OFFLINE_ERRORS_KEY);
      if (!stored) return;

      const errors: Omit<ErrorReport, 'id' | 'created_at'>[] = JSON.parse(stored);
      if (errors.length === 0) return;

      console.log(`[ErrorReporting] Syncing ${errors.length} offline errors`);

      const {error} = await supabase
        .from('error_reports')
        .insert(errors);

      if (!error) {
        await AsyncStorage.removeItem(OFFLINE_ERRORS_KEY);
        console.log('[ErrorReporting] Offline errors synced successfully');
      }
    } catch (err) {
      console.error('[ErrorReporting] Failed to sync offline errors:', err);
    }
  }

  // -------------------------------------------------------------------------
  // ADMIN FUNCTIONS
  // -------------------------------------------------------------------------

  async getErrorReports(options: {
    page?: number;
    pageSize?: number;
    status?: ErrorStatus;
    category?: ErrorCategory;
    severity?: ErrorSeverity;
  } = {}): Promise<{reports: ErrorReport[]; total: number}> {
    try {
      const {page = 1, pageSize = 20, status, category, severity} = options;

      let query = supabase
        .from('error_reports')
        .select('*', {count: 'exact'});

      if (status) {
        query = query.eq('status', status);
      }

      if (category) {
        query = query.eq('category', category);
      }

      if (severity) {
        query = query.eq('severity', severity);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const {data, error, count} = await query
        .order('created_at', {ascending: false})
        .range(from, to);

      if (error) throw error;

      return {reports: data || [], total: count || 0};
    } catch (err) {
      console.error('[ErrorReporting] Failed to get error reports:', err);
      return {reports: [], total: 0};
    }
  }

  async updateErrorStatus(
    reportId: string,
    status: ErrorStatus,
    resolutionNotes?: string
  ): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();

      const updates: any = {
        status,
      };

      if (status === 'resolved') {
        updates.resolved_by = userId;
        updates.resolved_at = new Date().toISOString();
        updates.resolution_notes = resolutionNotes;
      }

      const {error} = await supabase
        .from('error_reports')
        .update(updates)
        .eq('id', reportId);

      if (error) throw error;

      return true;
    } catch (err) {
      console.error('[ErrorReporting] Failed to update error status:', err);
      return false;
    }
  }

  async getErrorStats(): Promise<{
    total: number;
    newCount: number;
    criticalCount: number;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
  }> {
    try {
      // Get counts using parallel queries
      const [
        totalResult,
        newResult,
        criticalResult,
      ] = await Promise.all([
        supabase.from('error_reports').select('*', {count: 'exact', head: true}),
        supabase.from('error_reports').select('*', {count: 'exact', head: true}).eq('status', 'new'),
        supabase.from('error_reports').select('*', {count: 'exact', head: true}).eq('severity', 'critical'),
      ]);

      // Get category breakdown
      const {data: categoryData} = await supabase
        .from('error_reports')
        .select('category')
        .limit(500);

      const byCategory: Record<string, number> = {};
      categoryData?.forEach(item => {
        byCategory[item.category] = (byCategory[item.category] || 0) + 1;
      });

      // Get severity breakdown
      const {data: severityData} = await supabase
        .from('error_reports')
        .select('severity')
        .limit(500);

      const bySeverity: Record<string, number> = {};
      severityData?.forEach(item => {
        bySeverity[item.severity] = (bySeverity[item.severity] || 0) + 1;
      });

      return {
        total: totalResult.count || 0,
        newCount: newResult.count || 0,
        criticalCount: criticalResult.count || 0,
        byCategory,
        bySeverity,
      };
    } catch (err) {
      console.error('[ErrorReporting] Failed to get error stats:', err);
      return {
        total: 0,
        newCount: 0,
        criticalCount: 0,
        byCategory: {},
        bySeverity: {},
      };
    }
  }

  async deleteErrorReport(reportId: string): Promise<boolean> {
    try {
      const {error} = await supabase
        .from('error_reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      return true;
    } catch (err) {
      console.error('[ErrorReporting] Failed to delete error report:', err);
      return false;
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const errorReportingService = new ErrorReportingService();
export default errorReportingService;

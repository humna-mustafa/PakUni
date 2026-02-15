/**
 * Enhanced ErrorBoundary Component - Enterprise-grade error handling
 * Features: Global error handling, crash reporting, recovery options, themed UI
 */

import React, {Component, ErrorInfo, ReactNode, createContext, useContext} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  Linking,
  Share,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from './icons';
import {PREMIUM_DESIGN, TYPOGRAPHY} from '../constants/design';
import {errorReportingService} from '../services/errorReporting';

// ============================================================================
// TYPES
// ============================================================================

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback component */
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  /** Error callback */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Reset callback */
  onReset?: () => void;
  /** Error level for styling */
  level?: 'screen' | 'component' | 'critical';
  /** Show detailed error info in production */
  showDetails?: boolean;
  /** Enable crash reporting */
  reportCrash?: boolean;
  /** Support email for contact */
  supportEmail?: string;
  /** Custom action buttons */
  actions?: ErrorAction[];
}

export interface ErrorAction {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
  isRecovering: boolean;
  showStackTrace: boolean;
}

interface GlobalErrorContextType {
  handleError: (error: Error, context?: string) => void;
  clearErrors: () => void;
  lastError: Error | null;
}

// ============================================================================
// GLOBAL ERROR CONTEXT
// ============================================================================

const GlobalErrorContext = createContext<GlobalErrorContextType>({
  handleError: () => {},
  clearErrors: () => {},
  lastError: null,
});

export const useGlobalError = () => useContext(GlobalErrorContext);

// ============================================================================
// ERROR UTILITIES
// ============================================================================

/**
 * Parse error for readable display
 */
const parseError = (error: Error): {type: string; message: string; stack?: string} => {
  // Network errors
  if (error.message.includes('Network request failed')) {
    return {
      type: 'Network Error',
      message: 'Unable to connect to the server. Please check your internet connection.',
    };
  }

  // Timeout errors
  if (error.message.includes('timeout') || error.message.includes('Timeout')) {
    return {
      type: 'Timeout Error',
      message: 'The request took too long. Please try again.',
    };
  }

  // Authentication errors
  if (error.message.includes('401') || error.message.includes('Unauthorized')) {
    return {
      type: 'Authentication Error',
      message: 'Your session has expired. Please log in again.',
    };
  }

  // Permission errors
  if (error.message.includes('403') || error.message.includes('Forbidden')) {
    return {
      type: 'Permission Error',
      message: 'You do not have permission to access this resource.',
    };
  }

  // Not found errors
  if (error.message.includes('404') || error.message.includes('Not found')) {
    return {
      type: 'Not Found',
      message: 'The requested resource could not be found.',
    };
  }

  // Server errors
  if (error.message.includes('500') || error.message.includes('Internal Server')) {
    return {
      type: 'Server Error',
      message: 'Something went wrong on our end. Please try again later.',
    };
  }

  // Default
  return {
    type: error.name || 'Error',
    message: error.message || 'An unexpected error occurred.',
    stack: error.stack,
  };
};

/**
 * Get error icon name based on error type
 */
const getErrorIconName = (errorType: string): string => {
  switch (errorType.toLowerCase()) {
    case 'network error':
      return 'wifi';
    case 'timeout error':
      return 'time';
    case 'authentication error':
      return 'lock-closed';
    case 'permission error':
      return 'ban';
    case 'not found':
      return 'search';
    case 'server error':
      return 'server';
    default:
      return 'warning';
  }
};

/**
 * Get recovery suggestions based on error type
 */
const getRecoverySuggestions = (errorType: string): string[] => {
  switch (errorType.toLowerCase()) {
    case 'network error':
      return [
        'Check your internet connection',
        'Try switching between WiFi and mobile data',
        'Restart the app',
      ];
    case 'timeout error':
      return [
        'The server might be busy, try again in a moment',
        'Check your connection speed',
        'Try restarting the app',
      ];
    case 'authentication error':
      return [
        'Try logging in again',
        'Make sure your credentials are correct',
        'Reset your password if needed',
      ];
    case 'permission error':
      return [
        'You may need additional permissions',
        'Contact support if this persists',
        'Try logging out and back in',
      ];
    default:
      return [
        'Try refreshing or restarting the app',
        'Clear app cache if the issue persists',
        'Contact support if the problem continues',
      ];
  }
};

// ============================================================================
// ENHANCED ERROR BOUNDARY COMPONENT
// ============================================================================

export class EnhancedErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private animatedValue = new Animated.Value(0);
  private shakeAnimation = new Animated.Value(0);

  static defaultProps = {
    level: 'screen',
    showDetails: false,
    reportCrash: true,
    supportEmail: 'PakUni Support',
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      isRecovering: false,
      showStackTrace: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {hasError: true, error};
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState(prev => ({
      errorInfo,
      errorCount: prev.errorCount + 1,
    }));

    // Log error
    console.error('EnhancedErrorBoundary caught an error:', error);
    console.error('Component stack:', errorInfo.componentStack);

    // Call error callback
    this.props.onError?.(error, errorInfo);

    // Report to crash analytics
    if (this.props.reportCrash) {
      this.reportCrash(error, errorInfo);
    }

    // Start animation
    this.startEntranceAnimation();
  }

  private startEntranceAnimation = (): void => {
    this.animatedValue.setValue(0);
    Animated.spring(this.animatedValue, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  private shake = (): void => {
    Animated.sequence([
      Animated.timing(this.shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(this.shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(this.shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(this.shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  private reportCrash = async (error: Error, errorInfo: ErrorInfo): Promise<void> => {
    try {
      // Report to Supabase error_reports table via errorReportingService
      await errorReportingService.reportError(error, {
        category: 'ui_crash',
        severity: 'high',
        context: 'ErrorBoundary',
        additionalData: {
          componentStack: errorInfo.componentStack,
          platform: Platform.OS,
          platformVersion: Platform.Version,
        },
      });
    } catch (reportError) {
      // Silently fail - don't crash the error boundary itself
      if (__DEV__) {
        console.error('Failed to report crash:', reportError);
      }
    }
  };

  private handleRetry = async (): Promise<void> => {
    // Prevent rapid retries
    if (this.state.errorCount >= 3) {
      this.shake();
      return;
    }

    this.setState({isRecovering: true});

    // Small delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 500));

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isRecovering: false,
    });

    this.props.onReset?.();
  };

  private handleContactSupport = (): void => {
    const {supportEmail} = this.props;
    const {error} = this.state;
    
    const subject = encodeURIComponent('PakUni App Error Report');
    const body = encodeURIComponent(
      `Hi,\n\nI encountered an error in the PakUni app:\n\n` +
      `Error: ${error?.message || 'Unknown error'}\n\n` +
      `Device: ${Platform.OS} ${Platform.Version}\n` +
      `Time: ${new Date().toISOString()}\n\n` +
      `Please help!\n\nThank you.`
    );
    
    Linking.openURL(`mailto:${supportEmail}?subject=${subject}&body=${body}`);
  };

  private handleShareError = async (): Promise<void> => {
    const {error, errorInfo} = this.state;
    
    try {
      await Share.share({
        message: 
          `PakUni App Error:\n\n` +
          `Error: ${error?.message || 'Unknown error'}\n\n` +
          `Stack: ${error?.stack?.substring(0, 500) || 'N/A'}`,
        title: 'Error Report',
      });
    } catch (shareError) {
      console.error('Failed to share error:', shareError);
    }
  };

  private toggleStackTrace = (): void => {
    this.setState(prev => ({showStackTrace: !prev.showStackTrace}));
  };

  render(): ReactNode {
    const {children, fallback, level, showDetails, actions} = this.props;
    const {hasError, error, errorInfo, errorCount, isRecovering, showStackTrace} = this.state;

    if (!hasError) {
      return children;
    }

    // Custom fallback
    if (fallback) {
      if (typeof fallback === 'function') {
        return fallback(error!, this.handleRetry);
      }
      return fallback;
    }

    const parsedError = parseError(error!);
    const iconName = getErrorIconName(parsedError.type);
    const suggestions = getRecoverySuggestions(parsedError.type);
    const isCritical = errorCount >= 3;

    const containerStyle = level === 'component' ? styles.componentContainer : styles.screenContainer;

    return (
      <Animated.View
        style={[
          containerStyle,
          {
            opacity: this.animatedValue,
            transform: [
              {
                scale: this.animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1],
                }),
              },
              {translateX: this.shakeAnimation},
            ],
          },
        ]}>
        <LinearGradient
          colors={isCritical 
            ? ['#2A1F1F', '#1D2127'] 
            : ['#1D2127', '#272C34']}
          style={styles.gradient}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {/* Icon */}
            <Animated.Text
              style={[
                styles.icon,
                {
                  transform: [
                    {
                      scale: this.animatedValue.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, 1.2, 1],
                      }),
                    },
                  ],
                },
              ]}>
              <Icon name={iconName} family="Ionicons" size={48} color="#FFFFFF" />
            </Animated.Text>

            {/* Error Type Badge */}
            <View
              style={[
                styles.errorBadge,
                isCritical && styles.criticalBadge,
              ]}>
              <Text style={styles.errorBadgeText}>
                {isCritical ? '⚡ Critical Error' : parsedError.type}
              </Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>
              {isCritical ? 'Multiple Errors Detected' : 'Oops! Something went wrong'}
            </Text>

            {/* Message */}
            <Text style={styles.message}>{parsedError.message}</Text>

            {/* Retry count warning */}
            {errorCount >= 2 && (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  ⚠️ Error occurred {errorCount} time(s). 
                  {isCritical 
                    ? ' Please restart the app or contact support.'
                    : ' Consider restarting the app.'}
                </Text>
              </View>
            )}

            {/* Recovery suggestions */}
            <View style={styles.suggestionsContainer}>
              <View style={styles.suggestionsTitleRow}>
                <Icon name="bulb" family="Ionicons" size={18} color="#F59E0B" />
                <Text style={styles.suggestionsTitle}>Try these steps:</Text>
              </View>
              {suggestions.map((suggestion, index) => (
                <View key={index} style={styles.suggestionItem}>
                  <Text style={styles.suggestionBullet}>•</Text>
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </View>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              {/* Retry Button */}
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  isRecovering && styles.disabledButton,
                  isCritical && styles.criticalButton,
                ]}
                onPress={this.handleRetry}
                disabled={isRecovering}
                activeOpacity={0.8}>
                <View style={styles.buttonContent}>
                  <Icon name={isRecovering ? 'reload' : 'refresh'} family="Ionicons" size={18} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>
                    {isRecovering ? 'Recovering...' : 'Try Again'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Contact Support */}
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={this.handleContactSupport}
                activeOpacity={0.8}>
                <View style={styles.buttonContent}>
                  <Icon name="mail" family="Ionicons" size={18} color="#4573DF" />
                  <Text style={styles.secondaryButtonText}>Contact Support</Text>
                </View>
              </TouchableOpacity>

              {/* Custom Actions */}
              {actions?.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.secondaryButton,
                    action.variant === 'primary' && styles.primaryButton,
                    action.variant === 'danger' && styles.dangerButton,
                  ]}
                  onPress={action.onPress}
                  activeOpacity={0.8}>
                  <Text
                    style={
                      action.variant === 'primary'
                        ? styles.primaryButtonText
                        : styles.secondaryButtonText
                    }>
                    {action.icon ? `${action.icon} ` : ''}{action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Developer Details */}
            {(__DEV__ || showDetails) && (
              <View style={styles.devSection}>
                <TouchableOpacity
                  style={styles.devToggle}
                  onPress={this.toggleStackTrace}>
                  <Text style={styles.devToggleText}>
                    {showStackTrace ? '▼ Hide' : '▶ Show'} Technical Details
                  </Text>
                </TouchableOpacity>

                {showStackTrace && (
                  <View style={styles.stackContainer}>
                    <Text style={styles.stackTitle}>Error Stack:</Text>
                    <ScrollView
                      horizontal
                      style={styles.stackScrollView}
                      showsHorizontalScrollIndicator={true}>
                      <Text style={styles.stackText} selectable>
                        {error?.stack || 'No stack trace available'}
                      </Text>
                    </ScrollView>

                    {errorInfo?.componentStack && (
                      <>
                        <Text style={styles.stackTitle}>Component Stack:</Text>
                        <ScrollView
                          horizontal
                          style={styles.stackScrollView}
                          showsHorizontalScrollIndicator={true}>
                          <Text style={styles.stackText} selectable>
                            {errorInfo.componentStack}
                          </Text>
                        </ScrollView>
                      </>
                    )}

                    <TouchableOpacity
                      style={styles.shareButton}
                      onPress={this.handleShareError}>
                      <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                        <Icon name="share-outline" family="Ionicons" size={16} color="#FFFFFF" />
                        <Text style={styles.shareButtonText}>Share Error Details</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </LinearGradient>
      </Animated.View>
    );
  }
}

// ============================================================================
// GLOBAL ERROR PROVIDER
// ============================================================================

interface GlobalErrorProviderProps {
  children: ReactNode;
  onError?: (error: Error, context?: string) => void;
}

interface GlobalErrorProviderState {
  lastError: Error | null;
}

export class GlobalErrorProvider extends Component<
  GlobalErrorProviderProps,
  GlobalErrorProviderState
> {
  constructor(props: GlobalErrorProviderProps) {
    super(props);
    this.state = {lastError: null};
  }

  componentDidMount(): void {
    // Set up global error handlers
    if (typeof ErrorUtils !== 'undefined') {
      ErrorUtils.setGlobalHandler((error: Error) => {
        this.handleError(error, 'GlobalHandler');
      });
    }

    // Handle unhandled promise rejections
    const originalHandler = (global as any).onunhandledrejection;
    (global as any).onunhandledrejection = (event: any) => {
      const error = event?.reason || new Error('Unhandled Promise Rejection');
      this.handleError(error, 'UnhandledRejection');
      if (originalHandler) {
        originalHandler(event);
      }
    };
  }

  handleError = (error: Error, context?: string): void => {
    console.error(`Global Error [${context || 'Unknown'}]:`, error);
    this.setState({lastError: error});
    this.props.onError?.(error, context);
  };

  clearErrors = (): void => {
    this.setState({lastError: null});
  };

  render(): ReactNode {
    const contextValue: GlobalErrorContextType = {
      handleError: this.handleError,
      clearErrors: this.clearErrors,
      lastError: this.state.lastError,
    };

    return (
      <GlobalErrorContext.Provider value={contextValue}>
        <EnhancedErrorBoundary
          level="screen"
          onError={(error, errorInfo) => {
            this.handleError(error, 'ErrorBoundary');
          }}>
          {this.props.children}
        </EnhancedErrorBoundary>
      </GlobalErrorContext.Provider>
    );
  }
}

// ============================================================================
// STYLES
// ============================================================================

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  componentContainer: {
    minHeight: 200,
    borderRadius: PREMIUM_DESIGN.borderRadius.xl,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: PREMIUM_DESIGN.spacing.xl,
    paddingTop: PREMIUM_DESIGN.spacing.xxl,
  },
  icon: {
    fontSize: 72,
    marginBottom: PREMIUM_DESIGN.spacing.md,
  },
  errorBadge: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    paddingHorizontal: PREMIUM_DESIGN.spacing.md,
    paddingVertical: PREMIUM_DESIGN.spacing.xs,
    borderRadius: PREMIUM_DESIGN.borderRadius.full,
    marginBottom: PREMIUM_DESIGN.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  criticalBadge: {
    backgroundColor: 'rgba(255, 59, 48, 0.3)',
    borderColor: 'rgba(255, 59, 48, 0.5)',
  },
  errorBadgeText: {
    color: '#FF6B6B',
    fontSize: PREMIUM_DESIGN.typography.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  title: {
    fontSize: PREMIUM_DESIGN.typography.sizes.xxl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFFFFF',
    marginBottom: PREMIUM_DESIGN.spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: PREMIUM_DESIGN.typography.sizes.md,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: PREMIUM_DESIGN.spacing.lg,
    lineHeight: 24,
    maxWidth: width * 0.85,
  },
  warningBox: {
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    padding: PREMIUM_DESIGN.spacing.md,
    borderRadius: PREMIUM_DESIGN.borderRadius.md,
    marginBottom: PREMIUM_DESIGN.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
    width: '100%',
  },
  warningText: {
    color: '#FFC107',
    fontSize: PREMIUM_DESIGN.typography.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  suggestionsContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: PREMIUM_DESIGN.spacing.md,
    borderRadius: PREMIUM_DESIGN.borderRadius.lg,
    marginBottom: PREMIUM_DESIGN.spacing.lg,
  },
  suggestionsTitle: {
    color: '#FFFFFF',
    fontSize: PREMIUM_DESIGN.typography.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: PREMIUM_DESIGN.spacing.sm,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: PREMIUM_DESIGN.spacing.xs,
  },
  suggestionBullet: {
    color: PREMIUM_DESIGN.colors.primary.main,
    fontSize: PREMIUM_DESIGN.typography.sizes.md,
    marginRight: PREMIUM_DESIGN.spacing.sm,
    lineHeight: 22,
  },
  suggestionText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: PREMIUM_DESIGN.typography.sizes.sm,
    flex: 1,
    lineHeight: 22,
  },
  actionsContainer: {
    width: '100%',
    gap: PREMIUM_DESIGN.spacing.sm,
  },
  primaryButton: {
    backgroundColor: PREMIUM_DESIGN.colors.primary.main,
    paddingVertical: PREMIUM_DESIGN.spacing.md,
    paddingHorizontal: PREMIUM_DESIGN.spacing.xl,
    borderRadius: PREMIUM_DESIGN.borderRadius.lg,
    alignItems: 'center',
    shadowColor: PREMIUM_DESIGN.colors.primary.main,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: PREMIUM_DESIGN.typography.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: PREMIUM_DESIGN.spacing.md,
    paddingHorizontal: PREMIUM_DESIGN.spacing.xl,
    borderRadius: PREMIUM_DESIGN.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  secondaryButtonText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: PREMIUM_DESIGN.typography.sizes.md,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  dangerButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  criticalButton: {
    backgroundColor: PREMIUM_DESIGN.colors.error,
  },
  disabledButton: {
    opacity: 0.6,
  },
  devSection: {
    width: '100%',
    marginTop: PREMIUM_DESIGN.spacing.xl,
    paddingTop: PREMIUM_DESIGN.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  devToggle: {
    paddingVertical: PREMIUM_DESIGN.spacing.sm,
  },
  devToggleText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: PREMIUM_DESIGN.typography.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  stackContainer: {
    marginTop: PREMIUM_DESIGN.spacing.sm,
  },
  stackTitle: {
    color: '#FF6B6B',
    fontSize: PREMIUM_DESIGN.typography.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: PREMIUM_DESIGN.spacing.xs,
    marginTop: PREMIUM_DESIGN.spacing.sm,
  },
  stackScrollView: {
    maxHeight: 150,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: PREMIUM_DESIGN.borderRadius.md,
    padding: PREMIUM_DESIGN.spacing.sm,
  },
  stackText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 16,
  },
  shareButton: {
    marginTop: PREMIUM_DESIGN.spacing.md,
    padding: PREMIUM_DESIGN.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: PREMIUM_DESIGN.borderRadius.md,
    alignItems: 'center',
  },
  shareButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: PREMIUM_DESIGN.typography.sizes.sm,
  },
  suggestionsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: PREMIUM_DESIGN.spacing.sm,
    gap: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

// Keep the original ErrorBoundary for backward compatibility
export {ErrorBoundary} from './ErrorBoundary';

// Export new enhanced components
export default EnhancedErrorBoundary;

/**
 * Enhanced Error Toast Component
 * Beautiful, user-friendly error display with reporting capability
 * 
 * Features:
 * - Stunning visual design with animations
 * - User-friendly error messages
 * - Report error functionality
 * - Retry action support
 * - Haptic feedback
 * - Accessibility support
 */

import React, {useRef, useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Modal,
  TextInput,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {TYPOGRAPHY, SPACING, RADIUS} from '../constants/design';
import {ANIMATION_SCALES} from '../constants/ui';
import {Haptics} from '../utils/haptics';
import {Icon} from './icons';
import {
  errorReportingService,
  UserFriendlyError,
  ErrorSeverity,
} from '../services/errorReporting';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// ============================================================================
// TYPES
// ============================================================================

export interface EnhancedErrorToastConfig {
  error: Error;
  userFriendlyError?: UserFriendlyError;
  onRetry?: () => void;
  onDismiss?: () => void;
  showReportButton?: boolean;
  autoHide?: boolean;
  duration?: number;
}

interface EnhancedErrorToastProps extends EnhancedErrorToastConfig {
  visible: boolean;
  onHide: () => void;
}

// ============================================================================
// SEVERITY PRESETS
// ============================================================================

const SEVERITY_STYLES: Record<ErrorSeverity, {
  gradientColors: string[];
  iconBgColor: string;
  accentColor: string;
}> = {
  low: {
    gradientColors: ['#F59E0B', '#D97706'],
    iconBgColor: 'rgba(255,255,255,0.2)',
    accentColor: '#FCD34D',
  },
  medium: {
    gradientColors: ['#EF4444', '#DC2626'],
    iconBgColor: 'rgba(255,255,255,0.2)',
    accentColor: '#F87171',
  },
  high: {
    gradientColors: ['#DC2626', '#B91C1C'],
    iconBgColor: 'rgba(255,255,255,0.2)',
    accentColor: '#FECACA',
  },
  critical: {
    gradientColors: ['#991B1B', '#7F1D1D'],
    iconBgColor: 'rgba(255,255,255,0.25)',
    accentColor: '#FCA5A5',
  },
};

// ============================================================================
// ENHANCED ERROR TOAST COMPONENT
// ============================================================================

export const EnhancedErrorToast: React.FC<EnhancedErrorToastProps> = ({
  visible,
  onHide,
  error,
  userFriendlyError,
  onRetry,
  onDismiss,
  showReportButton = true,
  autoHide = true,
  duration = 6000,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-200)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportFeedback, setReportFeedback] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Get formatted error info
  const errorInfo = userFriendlyError || errorReportingService.formatUserFriendlyError(error);
  const severityStyle = SEVERITY_STYLES[errorInfo.severity];

  // -------------------------------------------------------------------------
  // ANIMATIONS
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (visible) {
      // Haptic feedback
      if (errorInfo.severity === 'critical' || errorInfo.severity === 'high') {
        Haptics.error();
      } else {
        Haptics.warning();
      }

      // Animate in with bounce
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 7,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Shake animation for high severity
      if (errorInfo.severity === 'high' || errorInfo.severity === 'critical') {
        Animated.sequence([
          Animated.timing(shakeAnim, {toValue: 8, duration: 50, useNativeDriver: true}),
          Animated.timing(shakeAnim, {toValue: -8, duration: 50, useNativeDriver: true}),
          Animated.timing(shakeAnim, {toValue: 6, duration: 50, useNativeDriver: true}),
          Animated.timing(shakeAnim, {toValue: -6, duration: 50, useNativeDriver: true}),
          Animated.timing(shakeAnim, {toValue: 0, duration: 50, useNativeDriver: true}),
        ]).start();
      }

      // Pulse animation for critical
      if (errorInfo.severity === 'critical') {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {toValue: 1.02, duration: 500, useNativeDriver: true}),
            Animated.timing(pulseAnim, {toValue: 1, duration: 500, useNativeDriver: true}),
          ])
        ).start();
      }

      // Auto hide timer
      if (autoHide) {
        const timer = setTimeout(() => {
          handleHide();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [visible]);

  const handleHide = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -200,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: ANIMATION_SCALES.ICON_PRESS,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
      onDismiss?.();
    });
  }, [onHide, onDismiss]);

  const handleRetry = useCallback(() => {
    handleHide();
    setTimeout(() => {
      onRetry?.();
    }, 300);
  }, [onRetry, handleHide]);

  // -------------------------------------------------------------------------
  // REPORT FUNCTIONALITY
  // -------------------------------------------------------------------------

  const handleOpenReport = () => {
    setShowReportModal(true);
    setReportFeedback('');
    setReportSubmitted(false);
  };

  const handleSubmitReport = async () => {
    if (!reportFeedback.trim()) {
      Haptics.error();
      return;
    }

    setIsSubmitting(true);
    
    try {
      const success = await errorReportingService.submitUserFeedback(
        error,
        reportFeedback,
        contactEmail || undefined
      );

      if (success) {
        Haptics.success();
        setReportSubmitted(true);
        setTimeout(() => {
          setShowReportModal(false);
          handleHide();
        }, 2000);
      } else {
        Haptics.error();
      }
    } catch (err) {
      Haptics.error();
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------

  if (!visible) return null;

  return (
    <>
      <Animated.View
        style={[
          styles.container,
          {
            top: insets.top + SPACING.md,
            opacity,
            transform: [
              {translateY},
              {scale: Animated.multiply(scale, pulseAnim)},
              {translateX: shakeAnim},
            ],
          },
        ]}
        accessibilityRole="alert"
        accessibilityLiveRegion="assertive"
        accessibilityLabel={`Error: ${errorInfo.title}. ${errorInfo.message}`}>
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={handleHide}
          style={styles.touchable}>
          <LinearGradient
            colors={severityStyle.gradientColors}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.toast}>
            {/* Icon */}
            <View style={[styles.iconContainer, {backgroundColor: severityStyle.iconBgColor}]}>
              <Icon
                name={errorInfo.icon}
                family="Ionicons"
                size={24}
                color="#FFFFFF"
              />
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.title} numberOfLines={1}>
                {errorInfo.title}
              </Text>
              <Text style={styles.message} numberOfLines={2}>
                {errorInfo.message}
              </Text>
            </View>

            {/* Close button */}
            <TouchableOpacity
              onPress={handleHide}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Dismiss error"
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Icon name="close" family="Ionicons" size={20} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </LinearGradient>

          {/* Actions Row */}
          <View style={[styles.actionsRow, {backgroundColor: severityStyle.gradientColors[1]}]}>
            {errorInfo.canRetry && onRetry && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={handleRetry}
                accessibilityRole="button"
                accessibilityLabel={errorInfo.actionLabel || 'Retry'}>
                <Icon name="refresh-outline" family="Ionicons" size={16} color="#FFFFFF" />
                <Text style={styles.actionText}>{errorInfo.actionLabel || 'Retry'}</Text>
              </TouchableOpacity>
            )}
            
            {showReportButton && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={handleOpenReport}
                accessibilityRole="button"
                accessibilityLabel="Report this error">
                <Icon name="flag-outline" family="Ionicons" size={16} color="#FFFFFF" />
                <Text style={styles.actionText}>Report</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Report Modal */}
      <Modal
        visible={showReportModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowReportModal(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}>
          <View style={styles.reportModal}>
            {/* Header */}
            <LinearGradient
              colors={severityStyle.gradientColors}
              style={styles.reportHeader}>
              <View style={styles.reportHeaderContent}>
                <Icon name="flag" family="Ionicons" size={24} color="#FFFFFF" />
                <Text style={styles.reportTitle}>Report This Error</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowReportModal(false)}
                style={styles.reportCloseBtn}>
                <Icon name="close" family="Ionicons" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={styles.reportBody} keyboardShouldPersistTaps="handled">
              {reportSubmitted ? (
                <View style={styles.successContainer}>
                  <View style={styles.successIcon}>
                    <Icon name="checkmark-circle" family="Ionicons" size={64} color="#10B981" />
                  </View>
                  <Text style={styles.successTitle}>Thank You! 💚</Text>
                  <Text style={styles.successMessage}>
                    Your report has been submitted. Our team will look into this issue.
                  </Text>
                </View>
              ) : (
                <>
                  {/* Error Summary */}
                  <View style={styles.errorSummary}>
                    <Text style={styles.summaryLabel}>Error Detected:</Text>
                    <Text style={styles.summaryTitle}>{errorInfo.title}</Text>
                    <Text style={styles.summaryMessage}>{error.message}</Text>
                  </View>

                  {/* Feedback Input */}
                  <Text style={styles.inputLabel}>What were you trying to do?</Text>
                  <TextInput
                    style={styles.feedbackInput}
                    placeholder="Describe what happened before this error..."
                    placeholderTextColor="#9CA3AF"
                    value={reportFeedback}
                    onChangeText={setReportFeedback}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />

                  {/* Email Input (Optional) */}
                  <Text style={styles.inputLabel}>
                    Email (Optional - if you want updates)
                  </Text>
                  <TextInput
                    style={styles.emailInput}
                    placeholder="your@email.com"
                    placeholderTextColor="#9CA3AF"
                    value={contactEmail}
                    onChangeText={setContactEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  {/* Privacy Note */}
                  <View style={styles.privacyNote}>
                    <Icon name="shield-checkmark-outline" family="Ionicons" size={16} color="#6B7280" />
                    <Text style={styles.privacyText}>
                      We'll include device info to help debug. No personal data is shared.
                    </Text>
                  </View>

                  {/* Submit Button */}
                  <TouchableOpacity
                    style={[
                      styles.submitBtn,
                      (!reportFeedback.trim() || isSubmitting) && styles.submitBtnDisabled,
                    ]}
                    onPress={handleSubmitReport}
                    disabled={!reportFeedback.trim() || isSubmitting}>
                    <LinearGradient
                      colors={reportFeedback.trim() && !isSubmitting
                        ? ['#10B981', '#059669']
                        : ['#9CA3AF', '#6B7280']
                      }
                      style={styles.submitBtnGradient}>
                      {isSubmitting ? (
                        <Text style={styles.submitBtnText}>Submitting...</Text>
                      ) : (
                        <>
                          <Icon name="send" family="Ionicons" size={18} color="#FFFFFF" />
                          <Text style={styles.submitBtnText}>Submit Report</Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Cancel Button */}
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setShowReportModal(false)}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 10000,
    elevation: 10000,
  },
  touchable: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  content: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  message: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    gap: 4,
  },
  actionText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#FFFFFF',
  },

  // Report Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  reportModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  reportHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  reportTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFFFFF',
  },
  reportCloseBtn: {
    padding: SPACING.xs,
  },
  reportBody: {
    padding: SPACING.lg,
  },
  errorSummary: {
    backgroundColor: '#FEF2F2',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#DC2626',
    marginBottom: 4,
  },
  summaryMessage: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#7F1D1D',
    lineHeight: 18,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#272C34',
    marginBottom: SPACING.xs,
  },
  feedbackInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#1D2127',
    minHeight: 100,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emailInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#1D2127',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F3F4F6',
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
    gap: SPACING.xs,
  },
  privacyText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#6B7280',
    lineHeight: 16,
  },
  submitBtn: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.xs,
  },
  submitBtnText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFFFFF',
  },
  cancelBtn: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  cancelBtnText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#6B7280',
  },

  // Success state
  successContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  successIcon: {
    marginBottom: SPACING.md,
  },
  successTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#10B981',
    marginBottom: SPACING.xs,
  },
  successMessage: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default EnhancedErrorToast;


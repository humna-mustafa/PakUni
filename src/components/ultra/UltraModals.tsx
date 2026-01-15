/**
 * Ultra Premium Modal Components
 * Crystal Clear, Blur-Free Overlays
 */

import React, { useRef, useEffect, memo, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
  ViewStyle,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import {
  ULTRA_TYPOGRAPHY,
  ULTRA_SPACING,
  ULTRA_RADIUS,
  ULTRA_SHADOWS,
  ULTRA_MOTION,
  ULTRA_GLASS,
  ULTRA_A11Y,
  pixelPerfect,
} from '../../constants/ultra-design';
import { Icon } from '../icons';
import type { IconFamily } from '../icons';
import { Haptics } from '../../utils/haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// ULTRA BOTTOM SHEET - Professional Bottom Sheet Modal
// ============================================================================

interface UltraBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  showHandle?: boolean;
  showCloseButton?: boolean;
  snapPoints?: number[];
  enableDragToClose?: boolean;
  style?: ViewStyle;
}

export const UltraBottomSheet = memo<UltraBottomSheetProps>(({
  visible,
  onClose,
  title,
  subtitle,
  children,
  showHandle = true,
  showCloseButton = true,
  snapPoints = [0.5],
  enableDragToClose = true,
  style,
}) => {
  const { colors, isDark } = useTheme();
  const shadowStyle = isDark ? ULTRA_SHADOWS.dark : ULTRA_SHADOWS.light;
  
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const currentHeight = snapPoints[0] * SCREEN_HEIGHT;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          ...ULTRA_MOTION.spring.default,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: ULTRA_MOTION.duration.normal,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: SCREEN_HEIGHT,
          useNativeDriver: true,
          ...ULTRA_MOTION.spring.default,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: ULTRA_MOTION.duration.fast,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, overlayOpacity]);

  const handleClose = useCallback(() => {
    Haptics.light();
    onClose();
  }, [onClose]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalContainer}
      >
        {/* Overlay */}
        <TouchableWithoutFeedback onPress={enableDragToClose ? handleClose : undefined}>
          <Animated.View
            style={[
              styles.overlay,
              {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                opacity: overlayOpacity,
              },
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Sheet */}
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              backgroundColor: colors.card,
              maxHeight: currentHeight,
              transform: [{ translateY }],
            },
            shadowStyle.xl,
            style,
          ]}
        >
          {/* Handle */}
          {showHandle && (
            <View style={styles.handleContainer}>
              <View
                style={[
                  styles.handle,
                  { backgroundColor: colors.border },
                ]}
              />
            </View>
          )}

          {/* Header */}
          {(title || showCloseButton) && (
            <View style={styles.sheetHeader}>
              <View style={styles.headerTitles}>
                {title && (
                  <Text
                    style={[
                      styles.sheetTitle,
                      { color: colors.text },
                    ]}
                    numberOfLines={1}
                  >
                    {title}
                  </Text>
                )}
                {subtitle && (
                  <Text
                    style={[
                      styles.sheetSubtitle,
                      { color: colors.textSecondary },
                    ]}
                    numberOfLines={1}
                  >
                    {subtitle}
                  </Text>
                )}
              </View>
              
              {showCloseButton && (
                <TouchableOpacity
                  style={[
                    styles.closeButton,
                    { backgroundColor: colors.background },
                  ]}
                  onPress={handleClose}
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon
                    name="close"
                    family="Ionicons"
                    size={pixelPerfect(18)}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Content */}
          <ScrollView
            style={styles.sheetContent}
            contentContainerStyle={styles.sheetContentInner}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {children}
          </ScrollView>

          <SafeAreaView />
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
});

// ============================================================================
// ULTRA ALERT MODAL - Clean Alert Dialog
// ============================================================================

interface UltraAlertProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showIcon?: boolean;
}

const ALERT_ICONS = {
  info: { name: 'information-circle', color: '#3B82F6' },
  success: { name: 'checkmark-circle', color: '#10B981' },
  warning: { name: 'warning', color: '#F59E0B' },
  error: { name: 'alert-circle', color: '#EF4444' },
};

export const UltraAlert = memo<UltraAlertProps>(({
  visible,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  cancelText,
  onConfirm,
  onCancel,
  showIcon = true,
}) => {
  const { colors, isDark } = useTheme();
  const shadowStyle = isDark ? ULTRA_SHADOWS.dark : ULTRA_SHADOWS.light;
  
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          ...ULTRA_MOTION.spring.bouncy,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: ULTRA_MOTION.duration.fast,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: ULTRA_MOTION.duration.normal,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 0.9,
          useNativeDriver: true,
          ...ULTRA_MOTION.spring.snappy,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: ULTRA_MOTION.duration.fast,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: ULTRA_MOTION.duration.fast,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scale, opacity, overlayOpacity]);

  const handleConfirm = useCallback(() => {
    Haptics.medium();
    onConfirm?.();
    onClose();
  }, [onConfirm, onClose]);

  const handleCancel = useCallback(() => {
    Haptics.light();
    onCancel?.();
    onClose();
  }, [onCancel, onClose]);

  const iconConfig = ALERT_ICONS[type];

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleCancel}
    >
      <View style={styles.modalContainer}>
        {/* Overlay */}
        <TouchableWithoutFeedback onPress={cancelText ? handleCancel : undefined}>
          <Animated.View
            style={[
              styles.overlay,
              {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                opacity: overlayOpacity,
              },
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Alert Box */}
        <Animated.View
          style={[
            styles.alertBox,
            {
              backgroundColor: colors.card,
              transform: [{ scale }],
              opacity,
            },
            shadowStyle.xl,
          ]}
        >
          {/* Icon */}
          {showIcon && (
            <View
              style={[
                styles.alertIconContainer,
                { backgroundColor: `${iconConfig.color}15` },
              ]}
            >
              <Icon
                name={iconConfig.name}
                family="Ionicons"
                size={pixelPerfect(32)}
                color={iconConfig.color}
              />
            </View>
          )}

          {/* Content */}
          <Text
            style={[
              styles.alertTitle,
              { color: colors.text },
            ]}
          >
            {title}
          </Text>
          
          {message && (
            <Text
              style={[
                styles.alertMessage,
                { color: colors.textSecondary },
              ]}
            >
              {message}
            </Text>
          )}

          {/* Actions */}
          <View style={styles.alertActions}>
            {cancelText && (
              <TouchableOpacity
                style={[
                  styles.alertButton,
                  styles.alertCancelButton,
                  { borderColor: colors.border },
                ]}
                onPress={handleCancel}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.alertButtonText,
                    { color: colors.textSecondary },
                  ]}
                >
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[
                styles.alertButton,
                styles.alertConfirmButton,
                { backgroundColor: colors.primary },
                !cancelText && styles.alertFullButton,
              ]}
              onPress={handleConfirm}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.alertButtonText,
                  styles.alertConfirmText,
                ]}
              >
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
});

// ============================================================================
// ULTRA ACTION SHEET - iOS-style Action Sheet
// ============================================================================

interface UltraActionSheetAction {
  label: string;
  icon?: string;
  iconFamily?: string;
  destructive?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

interface UltraActionSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  actions: UltraActionSheetAction[];
  showCancelButton?: boolean;
  cancelLabel?: string;
}

export const UltraActionSheet = memo<UltraActionSheetProps>(({
  visible,
  onClose,
  title,
  message,
  actions,
  showCancelButton = true,
  cancelLabel = 'Cancel',
}) => {
  const { colors, isDark } = useTheme();
  const shadowStyle = isDark ? ULTRA_SHADOWS.dark : ULTRA_SHADOWS.light;
  
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          ...ULTRA_MOTION.spring.default,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: ULTRA_MOTION.duration.normal,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: SCREEN_HEIGHT,
          useNativeDriver: true,
          ...ULTRA_MOTION.spring.default,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: ULTRA_MOTION.duration.fast,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, overlayOpacity]);

  const handleClose = useCallback(() => {
    Haptics.light();
    onClose();
  }, [onClose]);

  const handleActionPress = useCallback((action: UltraActionSheetAction) => {
    if (action.disabled) return;
    Haptics.medium();
    action.onPress();
    onClose();
  }, [onClose]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        {/* Overlay */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View
            style={[
              styles.overlay,
              {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                opacity: overlayOpacity,
              },
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Action Sheet */}
        <Animated.View
          style={[
            styles.actionSheetContainer,
            { transform: [{ translateY }] },
          ]}
        >
          {/* Main Group */}
          <View
            style={[
              styles.actionGroup,
              { backgroundColor: colors.card },
              shadowStyle.lg,
            ]}
          >
            {/* Header */}
            {(title || message) && (
              <View style={styles.actionHeader}>
                {title && (
                  <Text
                    style={[
                      styles.actionTitle,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {title}
                  </Text>
                )}
                {message && (
                  <Text
                    style={[
                      styles.actionMessage,
                      { color: colors.textMuted },
                    ]}
                  >
                    {message}
                  </Text>
                )}
              </View>
            )}

            {/* Actions */}
            {actions.map((action, index) => (
              <TouchableOpacity
                key={action.label}
                style={[
                  styles.actionItem,
                  index > 0 && { borderTopWidth: pixelPerfect(1), borderTopColor: colors.border },
                  action.disabled && styles.actionDisabled,
                ]}
                onPress={() => handleActionPress(action)}
                disabled={action.disabled}
                accessibilityRole="button"
              >
                {action.icon && (
                  <Icon
                    name={action.icon}
                    family={(action.iconFamily || 'Ionicons') as IconFamily}
                    size={pixelPerfect(22)}
                    color={action.destructive ? colors.error : colors.primary}
                  />
                )}
                <Text
                  style={[
                    styles.actionLabel,
                    {
                      color: action.destructive ? colors.error : colors.primary,
                      opacity: action.disabled ? 0.5 : 1,
                    },
                  ]}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Cancel Button */}
          {showCancelButton && (
            <TouchableOpacity
              style={[
                styles.actionGroup,
                styles.cancelButton,
                { backgroundColor: colors.card },
                shadowStyle.md,
              ]}
              onPress={handleClose}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.cancelLabel,
                  { color: colors.primary },
                ]}
              >
                {cancelLabel}
              </Text>
            </TouchableOpacity>
          )}

          <SafeAreaView />
        </Animated.View>
      </View>
    </Modal>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },

  // Bottom Sheet
  bottomSheet: {
    borderTopLeftRadius: ULTRA_RADIUS['2xl'],
    borderTopRightRadius: ULTRA_RADIUS['2xl'],
    overflow: 'hidden',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: ULTRA_SPACING[3],
  },
  handle: {
    width: pixelPerfect(40),
    height: pixelPerfect(4),
    borderRadius: pixelPerfect(2),
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ULTRA_SPACING[5],
    paddingBottom: ULTRA_SPACING[3],
  },
  headerTitles: {
    flex: 1,
    marginRight: ULTRA_SPACING[3],
  },
  sheetTitle: {
    fontSize: ULTRA_TYPOGRAPHY.scale.title3,
    fontWeight: ULTRA_TYPOGRAPHY.weight.bold,
    letterSpacing: ULTRA_TYPOGRAPHY.tracking.tight,
  },
  sheetSubtitle: {
    fontSize: ULTRA_TYPOGRAPHY.scale.footnote,
    marginTop: ULTRA_SPACING[0.5],
  },
  closeButton: {
    width: pixelPerfect(32),
    height: pixelPerfect(32),
    borderRadius: pixelPerfect(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetContent: {
    flex: 1,
  },
  sheetContentInner: {
    paddingHorizontal: ULTRA_SPACING[5],
    paddingBottom: ULTRA_SPACING[5],
  },

  // Alert
  alertBox: {
    width: SCREEN_WIDTH - ULTRA_SPACING[10],
    maxWidth: pixelPerfect(320),
    borderRadius: ULTRA_RADIUS.xl,
    padding: ULTRA_SPACING[6],
    alignItems: 'center',
  },
  alertIconContainer: {
    width: pixelPerfect(64),
    height: pixelPerfect(64),
    borderRadius: pixelPerfect(32),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: ULTRA_SPACING[4],
  },
  alertTitle: {
    fontSize: ULTRA_TYPOGRAPHY.scale.title3,
    fontWeight: ULTRA_TYPOGRAPHY.weight.bold,
    textAlign: 'center',
    marginBottom: ULTRA_SPACING[2],
  },
  alertMessage: {
    fontSize: ULTRA_TYPOGRAPHY.scale.subhead,
    textAlign: 'center',
    lineHeight: ULTRA_TYPOGRAPHY.scale.subhead * ULTRA_TYPOGRAPHY.lineHeight.relaxed,
    marginBottom: ULTRA_SPACING[5],
  },
  alertActions: {
    flexDirection: 'row',
    gap: ULTRA_SPACING[3],
  },
  alertButton: {
    flex: 1,
    height: pixelPerfect(48),
    borderRadius: ULTRA_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: pixelPerfect(100),
  },
  alertCancelButton: {
    borderWidth: pixelPerfect(1),
  },
  alertConfirmButton: {},
  alertFullButton: {
    flex: 2,
  },
  alertButtonText: {
    fontSize: ULTRA_TYPOGRAPHY.scale.subhead,
    fontWeight: ULTRA_TYPOGRAPHY.weight.semibold,
  },
  alertConfirmText: {
    color: '#FFFFFF',
  },

  // Action Sheet
  actionSheetContainer: {
    paddingHorizontal: ULTRA_SPACING[3],
    paddingBottom: ULTRA_SPACING[3],
  },
  actionGroup: {
    borderRadius: ULTRA_RADIUS.xl,
    overflow: 'hidden',
  },
  actionHeader: {
    paddingVertical: ULTRA_SPACING[4],
    paddingHorizontal: ULTRA_SPACING[5],
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: ULTRA_TYPOGRAPHY.scale.footnote,
    fontWeight: ULTRA_TYPOGRAPHY.weight.semibold,
    textAlign: 'center',
  },
  actionMessage: {
    fontSize: ULTRA_TYPOGRAPHY.scale.caption,
    textAlign: 'center',
    marginTop: ULTRA_SPACING[1],
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ULTRA_SPACING[4],
    paddingHorizontal: ULTRA_SPACING[5],
  },
  actionLabel: {
    fontSize: ULTRA_TYPOGRAPHY.scale.body,
    fontWeight: ULTRA_TYPOGRAPHY.weight.medium,
  },
  actionDisabled: {
    opacity: 0.5,
  },
  cancelButton: {
    marginTop: ULTRA_SPACING[2],
    paddingVertical: ULTRA_SPACING[4],
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelLabel: {
    fontSize: ULTRA_TYPOGRAPHY.scale.body,
    fontWeight: ULTRA_TYPOGRAPHY.weight.semibold,
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  UltraBottomSheet,
  UltraAlert,
  UltraActionSheet,
};

/**
 * Premium Toast & Notification System
 * Beautiful, non-intrusive feedback with animations
 */

import React, {useRef, useEffect, useState, createContext, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {TYPOGRAPHY, SPACING, RADIUS, SHADOWS} from '../constants/design';
import {Haptics} from '../utils/haptics';
import {Icon} from './icons';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// ============================================================================
// TYPES
// ============================================================================

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'default';
type ToastPosition = 'top' | 'bottom';

interface ToastConfig {
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number;
  position?: ToastPosition;
  icon?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  haptic?: boolean;
}

interface ToastContextType {
  show: (config: ToastConfig) => void;
  hide: () => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

// ============================================================================
// TOAST PRESETS
// ============================================================================

const TOAST_PRESETS: Record<ToastType, {
  iconName: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
}> = {
  success: {
    iconName: 'checkmark-circle',
    bgColor: '#10B981',
    textColor: '#FFFFFF',
    accentColor: '#34D399',
  },
  error: {
    iconName: 'close-circle',
    bgColor: '#EF4444',
    textColor: '#FFFFFF',
    accentColor: '#F87171',
  },
  warning: {
    iconName: 'warning',
    bgColor: '#F59E0B',
    textColor: '#FFFFFF',
    accentColor: '#FBBF24',
  },
  info: {
    iconName: 'information-circle',
    bgColor: '#3B82F6',
    textColor: '#FFFFFF',
    accentColor: '#60A5FA',
  },
  default: {
    iconName: 'bulb',
    bgColor: '#1E293B',
    textColor: '#FFFFFF',
    accentColor: '#64748B',
  },
};

// ============================================================================
// TOAST COMPONENT
// ============================================================================

interface ToastProps extends ToastConfig {
  visible: boolean;
  onHide: () => void;
}

const Toast: React.FC<ToastProps> = ({
  visible,
  onHide,
  type = 'default',
  title,
  message,
  duration = 3000,
  position = 'top',
  icon,
  action,
  haptic = true,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  const preset = TOAST_PRESETS[type];

  useEffect(() => {
    if (visible) {
      // Haptic feedback
      if (haptic) {
        switch (type) {
          case 'success':
            Haptics.success();
            break;
          case 'error':
            Haptics.error();
            break;
          case 'warning':
            Haptics.warning();
            break;
          default:
            Haptics.light();
        }
      }

      // Animate in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          tension: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Progress animation
      progressWidth.setValue(1);
      Animated.timing(progressWidth, {
        toValue: 0,
        duration: duration,
        useNativeDriver: false,
      }).start();

      // Auto hide
      const timer = setTimeout(() => {
        handleHide();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleHide = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: position === 'top' ? -100 : 100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  if (!visible) return null;

  const containerStyle = {
    [position]: position === 'top' ? insets.top + SPACING.md : insets.bottom + SPACING.md,
  };

  const progressWidthStyle = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        containerStyle,
        {
          opacity,
          transform: [
            {translateY: position === 'top' ? translateY : Animated.multiply(translateY, -1)},
            {scale},
          ],
        },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      accessibilityLabel={title ? `${title}: ${message}` : message}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleHide}
        accessibilityRole="button"
        accessibilityLabel="Dismiss notification"
        accessibilityHint="Double tap to dismiss"
        style={[styles.toast, {backgroundColor: preset.bgColor}]}>
        {/* Icon */}
        <View style={[styles.iconContainer, {backgroundColor: preset.accentColor}]}>
          <Icon
            name={preset.iconName}
            family="Ionicons"
            size={20}
            color={preset.textColor}
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {title && <Text style={[styles.title, {color: preset.textColor}]}>{title}</Text>}
          <Text style={[styles.message, {color: preset.textColor}]} numberOfLines={2}>
            {message}
          </Text>
        </View>

        {/* Action Button */}
        {action && (
          <TouchableOpacity
            onPress={() => {
              action.onPress();
              handleHide();
            }}
            style={styles.actionBtn}>
            <Text style={[styles.actionText, {color: preset.textColor}]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        )}

        {/* Close button */}
        <TouchableOpacity 
          onPress={handleHide} 
          style={styles.closeBtn}
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Icon
            name="close"
            family="Ionicons"
            size={18}
            color={preset.textColor}
          />
        </TouchableOpacity>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressWidthStyle,
                backgroundColor: preset.accentColor,
              },
            ]}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ============================================================================
// TOAST CONTEXT & PROVIDER
// ============================================================================

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<ToastConfig>({message: ''});

  const show = (newConfig: ToastConfig) => {
    setConfig(newConfig);
    setVisible(true);
  };

  const hide = () => {
    setVisible(false);
  };

  const success = (message: string, title?: string) => {
    show({type: 'success', message, title});
  };

  const error = (message: string, title?: string) => {
    show({type: 'error', message, title});
  };

  const warning = (message: string, title?: string) => {
    show({type: 'warning', message, title});
  };

  const info = (message: string, title?: string) => {
    show({type: 'info', message, title});
  };

  return (
    <ToastContext.Provider value={{show, hide, success, error, warning, info}}>
      {children}
      <Toast visible={visible} onHide={hide} {...config} />
    </ToastContext.Provider>
  );
};

// ============================================================================
// INLINE NOTIFICATION BANNER
// ============================================================================

interface NotificationBannerProps {
  type?: ToastType;
  title?: string;
  message: string;
  icon?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  dismissible?: boolean;
  onDismiss?: () => void;
  style?: any;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  type = 'info',
  title,
  message,
  icon,
  action,
  dismissible = true,
  onDismiss,
  style,
}) => {
  const [visible, setVisible] = useState(true);
  const heightAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const preset = TOAST_PRESETS[type];

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      onDismiss?.();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          backgroundColor: `${preset.bgColor}15`,
          borderLeftColor: preset.bgColor,
          opacity: opacityAnim,
          transform: [{scaleY: heightAnim}],
        },
        style,
      ]}
      accessibilityRole="alert"
      accessibilityLabel={title ? `${title}: ${message}` : message}>
      <View style={[styles.bannerIcon, {backgroundColor: `${preset.bgColor}20`}]} accessibilityElementsHidden>
        <Text style={styles.bannerIconText}>{icon || preset.iconName}</Text>
      </View>
      
      <View style={styles.bannerContent}>
        {title && <Text style={[styles.bannerTitle, {color: preset.bgColor}]}>{title}</Text>}
        <Text style={styles.bannerMessage}>{message}</Text>
      </View>

      {action && (
        <TouchableOpacity onPress={action.onPress} style={styles.bannerAction}>
          <Text style={[styles.bannerActionText, {color: preset.bgColor}]}>
            {action.label}
          </Text>
        </TouchableOpacity>
      )}

      {dismissible && (
        <TouchableOpacity 
          onPress={handleDismiss} 
          style={styles.bannerDismiss}
          accessibilityRole="button"
          accessibilityLabel="Dismiss banner"
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Text style={[styles.bannerDismissText, {color: preset.bgColor}]} accessibilityElementsHidden>×</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 9999,
    elevation: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    ...SHADOWS.soft.lg,
    overflow: 'hidden',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  icon: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
    marginBottom: 2,
  },
  message: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
    opacity: 0.9,
  },
  actionBtn: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginLeft: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  actionText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
  },
  closeBtn: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  closeIcon: {
    fontSize: 24,
    fontWeight: '300',
    opacity: 0.7,
  },
  progressTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  progressBar: {
    height: '100%',
    borderRadius: 1.5,
  },

  // Banner styles
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderLeftWidth: 4,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
  },
  bannerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  bannerIconText: {
    fontSize: 16,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
    marginBottom: 2,
  },
  bannerMessage: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#64748B',
  },
  bannerAction: {
    paddingHorizontal: SPACING.sm,
  },
  bannerActionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
  bannerDismiss: {
    padding: SPACING.xs,
  },
  bannerDismissText: {
    fontSize: 20,
    fontWeight: '300',
  },
});

export default {
  Toast,
  ToastProvider,
  useToast,
  NotificationBanner,
};

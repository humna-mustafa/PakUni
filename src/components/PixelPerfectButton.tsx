/**
 * Pixel Perfect Button Component
 * 
 * High-quality button with:
 * - Precise touch targets (44px minimum)
 * - Smooth 60fps animations
 * - Platform-optimized ripple/press effects
 * - Crisp borders and shadows
 */

import React, { useRef, useCallback, memo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import {
  PP_BUTTONS,
  PP_BORDERS,
  PP_SHADOWS,
  PP_MOTION,
  PP_TYPOGRAPHY,
  roundToPixel,
} from '../constants/pixel-perfect';

// ============================================================================
// TYPES
// ============================================================================

type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'soft';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type ButtonColor = 'primary' | 'success' | 'warning' | 'error' | 'neutral';

interface PPButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  color?: ButtonColor;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
  testID?: string;
}

// ============================================================================
// COLOR DEFINITIONS
// ============================================================================

const BUTTON_COLORS = {
  primary: {
    solid: { bg: '#0066DC', text: '#FFFFFF', border: '#0066DC' },
    outline: { bg: 'transparent', text: '#0066DC', border: '#0066DC' },
    ghost: { bg: 'transparent', text: '#0066DC', border: 'transparent' },
    soft: { bg: '#E8F4FD', text: '#0066DC', border: 'transparent' },
  },
  success: {
    solid: { bg: '#059669', text: '#FFFFFF', border: '#059669' },
    outline: { bg: 'transparent', text: '#059669', border: '#059669' },
    ghost: { bg: 'transparent', text: '#059669', border: 'transparent' },
    soft: { bg: '#ECFDF5', text: '#059669', border: 'transparent' },
  },
  warning: {
    solid: { bg: '#D97706', text: '#FFFFFF', border: '#D97706' },
    outline: { bg: 'transparent', text: '#D97706', border: '#D97706' },
    ghost: { bg: 'transparent', text: '#D97706', border: 'transparent' },
    soft: { bg: '#FFFBEB', text: '#D97706', border: 'transparent' },
  },
  error: {
    solid: { bg: '#DC2626', text: '#FFFFFF', border: '#DC2626' },
    outline: { bg: 'transparent', text: '#DC2626', border: '#DC2626' },
    ghost: { bg: 'transparent', text: '#DC2626', border: 'transparent' },
    soft: { bg: '#FEF2F2', text: '#DC2626', border: 'transparent' },
  },
  neutral: {
    solid: { bg: '#374151', text: '#FFFFFF', border: '#374151' },
    outline: { bg: 'transparent', text: '#374151', border: '#D1D5DB' },
    ghost: { bg: 'transparent', text: '#374151', border: 'transparent' },
    soft: { bg: '#F3F4F6', text: '#374151', border: 'transparent' },
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export const PPButton: React.FC<PPButtonProps> = memo(({
  children,
  variant = 'solid',
  size = 'md',
  color = 'primary',
  onPress,
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  accessibilityLabel,
  testID,
}) => {
  const { colors: themeColors, isDark } = useTheme();
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Get size config
  const sizeConfig = PP_BUTTONS[size];

  // Get color config with dark mode adjustments
  const getColorConfig = () => {
    const baseConfig = BUTTON_COLORS[color][variant];
    
    if (isDark) {
      // Adjust colors for dark mode
      if (variant === 'soft') {
        return {
          ...baseConfig,
          bg: baseConfig.bg.replace('F', '3').replace('E', '2'),
        };
      }
      if (variant === 'outline' || variant === 'ghost') {
        return {
          ...baseConfig,
          text: color === 'primary' ? '#60A5FA' : baseConfig.text,
          border: color === 'primary' ? '#60A5FA' : baseConfig.border,
        };
      }
    }
    
    return baseConfig;
  };

  const colorConfig = getColorConfig();

  // Press handlers
  const handlePressIn = useCallback(() => {
    if (disabled || loading) return;
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: PP_MOTION.scale.pressed,
        useNativeDriver: true,
        ...PP_MOTION.spring.snappy,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.9,
        duration: PP_MOTION.duration.fast,
        useNativeDriver: true,
      }),
    ]).start();
  }, [disabled, loading, scaleAnim, opacityAnim]);

  const handlePressOut = useCallback(() => {
    if (disabled || loading) return;
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        ...PP_MOTION.spring.default,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: PP_MOTION.duration.fast,
        useNativeDriver: true,
      }),
    ]).start();
  }, [disabled, loading, scaleAnim, opacityAnim]);

  // Build button styles
  const buttonStyle: ViewStyle = {
    height: roundToPixel(sizeConfig.height),
    paddingHorizontal: sizeConfig.paddingHorizontal,
    borderRadius: sizeConfig.borderRadius,
    backgroundColor: colorConfig.bg,
    borderWidth: variant === 'outline' ? PP_BORDERS.width.medium : 0,
    borderColor: colorConfig.border,
    opacity: disabled ? PP_MOTION.opacity.disabled : 1,
    ...(variant === 'solid' && !disabled && PP_SHADOWS.sm),
  };

  // Build text styles
  const buttonTextStyle: TextStyle = {
    fontSize: sizeConfig.fontSize,
    fontWeight: sizeConfig.fontWeight,
    color: colorConfig.text,
    letterSpacing: PP_TYPOGRAPHY.letterSpacing.wide,
  };

  // Render content
  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={colorConfig.text}
        />
      );
    }

    return (
      <>
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        {typeof children === 'string' ? (
          <Text style={[buttonTextStyle, textStyle]}>
            {children}
          </Text>
        ) : (
          children
        )}
        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </>
    );
  };

  return (
    <Animated.View
      style={[
        styles.wrapper,
        fullWidth && styles.fullWidth,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
        style,
      ]}
      testID={testID}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[styles.button, buttonStyle]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : undefined)}
        accessibilityState={{ disabled: disabled || loading }}
        android_ripple={Platform.OS === 'android' ? {
          color: variant === 'solid' ? 'rgba(255,255,255,0.2)' : `${colorConfig.text}15`,
          borderless: false,
        } : undefined}
      >
        {renderContent()}
      </Pressable>
    </Animated.View>
  );
});

// ============================================================================
// ICON BUTTON
// ============================================================================

type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface PPIconButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: IconButtonSize;
  color?: ButtonColor;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  accessibilityLabel: string;
  testID?: string;
}

export const PPIconButton: React.FC<PPIconButtonProps> = memo(({
  children,
  variant = 'ghost',
  size = 'md',
  color = 'neutral',
  onPress,
  disabled = false,
  loading = false,
  style,
  accessibilityLabel,
  testID,
}) => {
  const { isDark } = useTheme();
  
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Get icon button size config
  const sizeConfig = (size === 'xs' ? PP_BUTTONS.iconXs
    : size === 'sm' ? PP_BUTTONS.iconSm
    : size === 'md' ? PP_BUTTONS.iconMd
    : size === 'lg' ? PP_BUTTONS.iconLg
    : PP_BUTTONS.iconXl) as { width: number; height: number; borderRadius: number; iconSize: number };
  
  const colorConfig = BUTTON_COLORS[color][variant];

  const handlePressIn = useCallback(() => {
    if (disabled || loading) return;
    Animated.spring(scaleAnim, {
      toValue: PP_MOTION.scale.pressed,
      useNativeDriver: true,
      ...PP_MOTION.spring.snappy,
    }).start();
  }, [disabled, loading, scaleAnim]);

  const handlePressOut = useCallback(() => {
    if (disabled || loading) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...PP_MOTION.spring.default,
    }).start();
  }, [disabled, loading, scaleAnim]);

  const buttonStyle: ViewStyle = {
    width: sizeConfig.width,
    height: sizeConfig.height,
    borderRadius: sizeConfig.borderRadius,
    backgroundColor: variant === 'ghost' ? 'transparent' : colorConfig.bg,
    borderWidth: variant === 'outline' ? PP_BORDERS.width.thin : 0,
    borderColor: colorConfig.border,
    opacity: disabled ? PP_MOTION.opacity.disabled : 1,
  };

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        style,
      ]}
      testID={testID}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[styles.iconButton, buttonStyle]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled: disabled || loading }}
        android_ripple={Platform.OS === 'android' ? {
          color: `${colorConfig.text}15`,
          borderless: true,
        } : undefined}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colorConfig.text} />
        ) : (
          children
        )}
      </Pressable>
    </Animated.View>
  );
});

// ============================================================================
// FAB (Floating Action Button)
// ============================================================================

interface PPFabProps {
  children: React.ReactNode;
  onPress?: () => void;
  color?: ButtonColor;
  size?: 'default' | 'small';
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel: string;
}

export const PPFab: React.FC<PPFabProps> = memo(({
  children,
  onPress,
  color = 'primary',
  size = 'default',
  disabled = false,
  style,
  accessibilityLabel,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const sizeConfig = size === 'small' ? PP_BUTTONS.fabSmall : PP_BUTTONS.fab;
  const colorConfig = BUTTON_COLORS[color].solid;

  const handlePressIn = useCallback(() => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      ...PP_MOTION.spring.snappy,
    }).start();
  }, [disabled, scaleAnim]);

  const handlePressOut = useCallback(() => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...PP_MOTION.spring.bouncy,
    }).start();
  }, [disabled, scaleAnim]);

  return (
    <Animated.View
      style={[
        styles.fab,
        {
          width: sizeConfig.width,
          height: sizeConfig.height,
          borderRadius: sizeConfig.borderRadius,
          backgroundColor: colorConfig.bg,
          transform: [{ scale: scaleAnim }],
          opacity: disabled ? PP_MOTION.opacity.disabled : 1,
        },
        PP_SHADOWS.lg,
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={styles.fabPressable}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'flex-start',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fab: {
    overflow: 'hidden',
  },
  fabPressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// Display names
PPButton.displayName = 'PPButton';
PPIconButton.displayName = 'PPIconButton';
PPFab.displayName = 'PPFab';

export default PPButton;

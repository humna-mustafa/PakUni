/**
 * CleanButton Component - 2025 Design Standards
 * 
 * A minimal, accessible button component that follows:
 * - Clear visual hierarchy through variants
 * - Consistent sizing and spacing
 * - Subtle, meaningful animations
 * - Full accessibility support
 * 
 * Design Philosophy: Buttons should be obvious but not loud
 */

import React, { useRef, useCallback, memo } from 'react';
import {
  Animated,
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import {
  CLEAN_SPACING,
  CLEAN_RADIUS,
  CLEAN_TYPOGRAPHY,
  CLEAN_MOTION,
  CLEAN_COLORS,
  CLEAN_COLORS_DARK,
  CLEAN_A11Y,
} from '../constants/clean-design-2025';
import { Haptics } from '../utils/haptics';

// ============================================================================
// TYPES
// ============================================================================

type ButtonVariant = 
  | 'primary'    // Filled, high emphasis
  | 'secondary'  // Outlined, medium emphasis  
  | 'tertiary'   // Text-only, low emphasis
  | 'ghost'      // Invisible until hover/press
  | 'danger';    // Destructive actions

type ButtonSize = 'sm' | 'md' | 'lg';

interface CleanButtonProps {
  /** Button label text */
  title: string;
  /** Press handler */
  onPress: () => void;
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size preset */
  size?: ButtonSize;
  /** Optional left icon */
  leftIcon?: React.ReactNode;
  /** Optional right icon */
  rightIcon?: React.ReactNode;
  /** Show loading spinner */
  loading?: boolean;
  /** Disable interaction */
  disabled?: boolean;
  /** Expand to full width */
  fullWidth?: boolean;
  /** Enable haptic feedback */
  haptic?: boolean;
  /** Custom styles */
  style?: ViewStyle;
  /** Custom text styles */
  textStyle?: TextStyle;
  /** Accessibility label (defaults to title) */
  accessibilityLabel?: string;
  /** Accessibility hint */
  accessibilityHint?: string;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// SIZE CONFIGURATIONS
// ============================================================================

interface SizeConfig {
  height: number;
  paddingHorizontal: number;
  fontSize: number;
  iconSize: number;
  borderRadius: number;
}

const SIZE_CONFIGS: Record<ButtonSize, SizeConfig> = {
  sm: {
    height: 34,
    paddingHorizontal: CLEAN_SPACING[3],
    fontSize: CLEAN_TYPOGRAPHY.size.sm,
    iconSize: 16,
    borderRadius: CLEAN_RADIUS.sm,
  },
  md: {
    height: 42,
    paddingHorizontal: CLEAN_SPACING[4],
    fontSize: CLEAN_TYPOGRAPHY.size.base,
    iconSize: 18,
    borderRadius: CLEAN_RADIUS.sm,
  },
  lg: {
    height: 48,
    paddingHorizontal: CLEAN_SPACING[6],
    fontSize: CLEAN_TYPOGRAPHY.size.md,
    iconSize: 20,
    borderRadius: CLEAN_RADIUS.md,
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export const CleanButton: React.FC<CleanButtonProps> = memo(({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  loading = false,
  disabled = false,
  fullWidth = false,
  haptic = true,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
  testID,
}) => {
  const { colors, isDark } = useTheme();
  const palette = isDark ? CLEAN_COLORS_DARK : CLEAN_COLORS;
  const sizeConfig = SIZE_CONFIGS[size];
  
  // Animation refs
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Press handlers
  const handlePressIn = useCallback(() => {
    if (haptic) {
      Haptics.buttonPress();
    }
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        ...CLEAN_MOTION.spring.snappy,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.9,
        duration: CLEAN_MOTION.duration.fast,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim, haptic]);

  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        ...CLEAN_MOTION.spring.default,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: CLEAN_MOTION.duration.fast,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  // Get variant-specific styles
  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    const primary = colors.primary || palette.primary[500];
    const primaryLight = colors.primaryLight || palette.primary[100];
    const textColor = colors.text || palette.neutral[800];
    const textSecondary = colors.textSecondary || palette.neutral[600];
    const border = colors.border || palette.neutral[200];
    const error = palette.semantic.error.main;
    const errorLight = palette.semantic.error.light;

    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: primary,
            borderWidth: 0,
          },
          text: {
            color: isDark ? palette.neutral[900] : '#FFFFFF',
          },
        };

      case 'secondary':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: primary,
          },
          text: {
            color: primary,
          },
        };

      case 'tertiary':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 0,
          },
          text: {
            color: primary,
          },
        };

      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 0,
          },
          text: {
            color: textSecondary,
          },
        };

      case 'danger':
        return {
          container: {
            backgroundColor: error,
            borderWidth: 0,
          },
          text: {
            color: '#FFFFFF',
          },
        };

      default:
        return {
          container: {
            backgroundColor: primary,
          },
          text: {
            color: '#FFFFFF',
          },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const isDisabled = disabled || loading;

  // Build container style
  const containerStyle: ViewStyle = {
    ...variantStyles.container,
    height: sizeConfig.height,
    paddingHorizontal: sizeConfig.paddingHorizontal,
    borderRadius: sizeConfig.borderRadius,
    opacity: isDisabled ? 0.5 : 1,
    minWidth: CLEAN_A11Y.minTouchTarget,
    ...(fullWidth && { width: '100%' }),
  };

  // Build text style
  const labelStyle: TextStyle = {
    ...variantStyles.text,
    fontSize: sizeConfig.fontSize,
    fontWeight: CLEAN_TYPOGRAPHY.weight.semibold,
    letterSpacing: 0.2,
  };

  // Loading indicator color
  const spinnerColor = variantStyles.text.color as string;

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
        style,
      ]}
      testID={testID}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[styles.container, containerStyle]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        android_ripple={
          variant === 'primary' || variant === 'danger'
            ? { color: 'rgba(255,255,255,0.2)', borderless: false }
            : { color: `${palette.primary[500]}15`, borderless: false }
        }
      >
        {loading ? (
          <ActivityIndicator size="small" color={spinnerColor} />
        ) : (
          <View style={styles.content}>
            {leftIcon && (
              <View style={styles.leftIcon}>{leftIcon}</View>
            )}
            <Text style={[styles.text, labelStyle, textStyle]}>
              {title}
            </Text>
            {rightIcon && (
              <View style={styles.rightIcon}>{rightIcon}</View>
            )}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
});

// ============================================================================
// ICON BUTTON - For icon-only buttons
// ============================================================================

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  size?: ButtonSize;
  variant?: 'default' | 'primary' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel: string; // Required for icon buttons
  accessibilityHint?: string;
  testID?: string;
}

const ICON_BUTTON_SIZES: Record<ButtonSize, number> = {
  sm: 36,
  md: 44,
  lg: 52,
};

export const CleanIconButton: React.FC<IconButtonProps> = memo(({
  icon,
  onPress,
  size = 'md',
  variant = 'default',
  disabled = false,
  style,
  accessibilityLabel,
  accessibilityHint,
  testID,
}) => {
  const { colors, isDark } = useTheme();
  const palette = isDark ? CLEAN_COLORS_DARK : CLEAN_COLORS;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      ...CLEAN_MOTION.spring.snappy,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...CLEAN_MOTION.spring.default,
    }).start();
  }, [scaleAnim]);

  const buttonSize = ICON_BUTTON_SIZES[size];

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary || palette.primary[500],
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
        };
      default:
        return {
          backgroundColor: colors.background || palette.neutral[100],
          borderWidth: 1,
          borderColor: colors.border || palette.neutral[200],
        };
    }
  };

  return (
    <Animated.View
      style={[{ transform: [{ scale: scaleAnim }] }, style]}
      testID={testID}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={[
          styles.iconButton,
          getVariantStyle(),
          {
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        {icon}
      </Pressable>
    </Animated.View>
  );
});

// ============================================================================
// TEXT BUTTON - Minimal text-only button
// ============================================================================

interface TextButtonProps {
  title: string;
  onPress: () => void;
  color?: string;
  size?: ButtonSize;
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityHint?: string;
}

export const CleanTextButton: React.FC<TextButtonProps> = memo(({
  title,
  onPress,
  color,
  size = 'md',
  disabled = false,
  style,
  accessibilityHint,
}) => {
  const { colors, isDark } = useTheme();
  const palette = isDark ? CLEAN_COLORS_DARK : CLEAN_COLORS;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.timing(opacityAnim, {
      toValue: 0.6,
      duration: CLEAN_MOTION.duration.fast,
      useNativeDriver: true,
    }).start();
  }, [opacityAnim]);

  const handlePressOut = useCallback(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: CLEAN_MOTION.duration.fast,
      useNativeDriver: true,
    }).start();
  }, [opacityAnim]);

  const textColor = color || colors.primary || palette.primary[500];
  const fontSize = SIZE_CONFIGS[size].fontSize;

  return (
    <Animated.View style={[{ opacity: opacityAnim }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={[
          styles.textButton,
          { opacity: disabled ? 0.5 : 1 },
        ]}
      >
        <Text
          style={[
            styles.textButtonLabel,
            {
              color: textColor,
              fontSize,
            },
          ]}
        >
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: CLEAN_SPACING[2],
  },
  rightIcon: {
    marginLeft: CLEAN_SPACING[2],
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textButton: {
    paddingVertical: CLEAN_SPACING[2],
    paddingHorizontal: CLEAN_SPACING[1],
  },
  textButtonLabel: {
    fontWeight: CLEAN_TYPOGRAPHY.weight.medium,
  },
});

// Display names
CleanButton.displayName = 'CleanButton';
CleanIconButton.displayName = 'CleanIconButton';
CleanTextButton.displayName = 'CleanTextButton';

export default CleanButton;

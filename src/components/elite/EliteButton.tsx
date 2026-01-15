/**
 * Elite Button Component
 * World-class button with Apple/Google/Microsoft design standards
 * Features: Spring animations, haptic feedback, proper accessibility, variants
 */

import React, { useRef, useCallback, useMemo } from 'react';
import {
  Animated,
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
  AccessibilityRole,
  Platform,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import {
  ELITE_TYPOGRAPHY,
  ELITE_SPACING,
  ELITE_RADIUS,
  ELITE_SHADOWS,
  ELITE_MOTION,
  ELITE_A11Y,
} from '../../constants/elite';
import { Haptics } from '../../utils/haptics';

// ============================================================================
// TYPES
// ============================================================================
type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text' | 'elevated';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type ButtonColor = 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'error' | 'neutral';

interface EliteButtonProps {
  // Content
  title?: string;
  children?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;

  // Behavior
  onPress: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  loading?: boolean;

  // Appearance
  variant?: ButtonVariant;
  size?: ButtonSize;
  color?: ButtonColor;
  fullWidth?: boolean;
  rounded?: boolean;

  // Customization
  style?: ViewStyle;
  textStyle?: TextStyle;
  hapticEnabled?: boolean;

  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

// ============================================================================
// SIZE CONFIGURATIONS
// ============================================================================
const SIZE_CONFIG: Record<ButtonSize, {
  height: number;
  paddingH: number;
  fontSize: number;
  iconSize: number;
  iconGap: number;
  borderRadius: number;
}> = {
  xs: {
    height: 32,
    paddingH: ELITE_SPACING[3],
    fontSize: ELITE_TYPOGRAPHY.fluid.caption,
    iconSize: 14,
    iconGap: ELITE_SPACING[1],
    borderRadius: ELITE_RADIUS.sm,
  },
  sm: {
    height: 38,
    paddingH: ELITE_SPACING[4],
    fontSize: ELITE_TYPOGRAPHY.fluid.footnote,
    iconSize: 16,
    iconGap: ELITE_SPACING[1.5],
    borderRadius: ELITE_RADIUS.md,
  },
  md: {
    height: ELITE_A11Y.touchTarget.min,
    paddingH: ELITE_SPACING[5],
    fontSize: ELITE_TYPOGRAPHY.fluid.subhead,
    iconSize: 18,
    iconGap: ELITE_SPACING[2],
    borderRadius: ELITE_RADIUS.button,
  },
  lg: {
    height: ELITE_A11Y.touchTarget.comfortable,
    paddingH: ELITE_SPACING[6],
    fontSize: ELITE_TYPOGRAPHY.fluid.body,
    iconSize: 20,
    iconGap: ELITE_SPACING[2],
    borderRadius: ELITE_RADIUS.lg,
  },
  xl: {
    height: ELITE_A11Y.touchTarget.large,
    paddingH: ELITE_SPACING[8],
    fontSize: ELITE_TYPOGRAPHY.fluid.callout,
    iconSize: 22,
    iconGap: ELITE_SPACING[2.5],
    borderRadius: ELITE_RADIUS.xl,
  },
};

// ============================================================================
// ELITE BUTTON COMPONENT
// ============================================================================
export const EliteButton: React.FC<EliteButtonProps> = ({
  title,
  children,
  leftIcon,
  rightIcon,
  onPress,
  onLongPress,
  disabled = false,
  loading = false,
  variant = 'filled',
  size = 'md',
  color = 'primary',
  fullWidth = false,
  rounded = false,
  style,
  textStyle,
  hapticEnabled = true,
  accessibilityLabel,
  accessibilityHint,
  testID,
}) => {
  const { colors, isDark } = useTheme();

  // Animation refs
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const pressedAnim = useRef(new Animated.Value(0)).current;

  // Get size configuration
  const sizeConfig = SIZE_CONFIG[size];

  // Get color values based on color prop
  const colorValues = useMemo(() => {
    switch (color) {
      case 'secondary':
        return {
          main: colors.secondary,
          light: colors.secondaryLight,
          dark: colors.secondary,
          onMain: colors.textOnPrimary,
        };
      case 'tertiary':
        return {
          main: colors.primary, // Using primary as tertiary fallback
          light: colors.primaryLight,
          dark: colors.primaryDark,
          onMain: colors.textOnPrimary,
        };
      case 'success':
        return {
          main: colors.success,
          light: colors.successLight,
          dark: colors.success,
          onMain: '#FFFFFF',
        };
      case 'warning':
        return {
          main: colors.warning,
          light: colors.warningLight,
          dark: colors.warning,
          onMain: '#000000',
        };
      case 'error':
        return {
          main: colors.error,
          light: colors.errorLight,
          dark: colors.error,
          onMain: '#FFFFFF',
        };
      case 'neutral':
        return {
          main: colors.textSecondary,
          light: colors.background,
          dark: colors.text,
          onMain: colors.textOnPrimary,
        };
      default:
        return {
          main: colors.primary,
          light: colors.primaryLight,
          dark: colors.primaryDark,
          onMain: colors.textOnPrimary,
        };
    }
  }, [color, colors]);

  // Get variant styles
  const variantStyles = useMemo((): { container: ViewStyle; text: TextStyle } => {
    const shadowStyle = isDark ? ELITE_SHADOWS.dark : ELITE_SHADOWS.light;

    switch (variant) {
      case 'tonal':
        return {
          container: {
            backgroundColor: colorValues.light,
          },
          text: {
            color: colorValues.main,
          },
        };
      case 'outlined':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: colorValues.main,
          },
          text: {
            color: colorValues.main,
          },
        };
      case 'text':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: {
            color: colorValues.main,
          },
        };
      case 'elevated':
        return {
          container: {
            backgroundColor: colors.card,
            ...shadowStyle.md,
          },
          text: {
            color: colorValues.main,
          },
        };
      default: // filled
        return {
          container: {
            backgroundColor: colorValues.main,
            ...ELITE_SHADOWS.colored(colorValues.main, 0.3),
          },
          text: {
            color: colorValues.onMain,
          },
        };
    }
  }, [variant, colorValues, colors, isDark]);

  // Press animation handlers
  const handlePressIn = useCallback(() => {
    if (hapticEnabled && !disabled && !loading) {
      Haptics.light();
    }

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: ELITE_MOTION.presets.buttonPress.scale.pressed,
        useNativeDriver: true,
        ...ELITE_MOTION.spring.snappy,
      }),
      Animated.timing(pressedAnim, {
        toValue: 1,
        duration: ELITE_MOTION.duration.fast,
        useNativeDriver: false,
      }),
    ]).start();
  }, [hapticEnabled, disabled, loading, scaleAnim, pressedAnim]);

  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: ELITE_MOTION.presets.buttonPress.scale.default,
        useNativeDriver: true,
        ...ELITE_MOTION.spring.default,
      }),
      Animated.timing(pressedAnim, {
        toValue: 0,
        duration: ELITE_MOTION.duration.fast,
        useNativeDriver: false,
      }),
    ]).start();
  }, [scaleAnim, pressedAnim]);

  // Handle press
  const handlePress = useCallback(() => {
    if (!disabled && !loading) {
      if (hapticEnabled) {
        Haptics.medium();
      }
      onPress();
    }
  }, [disabled, loading, hapticEnabled, onPress]);

  // Handle long press
  const handleLongPress = useCallback(() => {
    if (onLongPress && !disabled && !loading) {
      if (hapticEnabled) {
        Haptics.heavy();
      }
      onLongPress();
    }
  }, [onLongPress, disabled, loading, hapticEnabled]);

  // Interpolate pressed background
  const pressedBackgroundColor = pressedAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      variantStyles.container.backgroundColor as string || 'transparent',
      variant === 'filled' 
        ? colorValues.dark 
        : variant === 'text' || variant === 'outlined'
          ? `${colorValues.main}15`
          : colorValues.light,
    ],
  });

  // Combine container styles
  const containerStyle: ViewStyle = {
    height: sizeConfig.height,
    paddingHorizontal: sizeConfig.paddingH,
    borderRadius: rounded ? ELITE_RADIUS.full : sizeConfig.borderRadius,
    opacity: disabled ? 0.4 : 1,
    ...(fullWidth && { width: '100%' }),
  };

  // Combine text styles
  const labelStyle: TextStyle = {
    fontSize: sizeConfig.fontSize,
    fontWeight: ELITE_TYPOGRAPHY.weight.semibold,
    letterSpacing: ELITE_TYPOGRAPHY.tracking.wide,
    ...variantStyles.text,
  };

  const isDisabled = disabled || loading;

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        testID={testID}
        style={({ pressed }) => [
          styles.container,
          containerStyle,
          variantStyles.container,
        ]}
        android_ripple={
          variant === 'filled'
            ? { color: 'rgba(255,255,255,0.25)', borderless: false }
            : { color: `${colorValues.main}25`, borderless: false }
        }
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: pressedBackgroundColor,
              borderRadius: rounded ? ELITE_RADIUS.full : sizeConfig.borderRadius,
            },
          ]}
        />
        
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator
              size="small"
              color={variantStyles.text.color as string}
            />
          ) : (
            <>
              {leftIcon && (
                <View style={[styles.icon, { marginRight: sizeConfig.iconGap }]}>
                  {leftIcon}
                </View>
              )}
              
              {title ? (
                <Text
                  style={[labelStyle, textStyle]}
                  numberOfLines={1}
                >
                  {title}
                </Text>
              ) : (
                children
              )}
              
              {rightIcon && (
                <View style={[styles.icon, { marginLeft: sizeConfig.iconGap }]}>
                  {rightIcon}
                </View>
              )}
            </>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

// ============================================================================
// ELITE ICON BUTTON
// ============================================================================
interface EliteIconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  onLongPress?: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'filled' | 'tonal' | 'outlined' | 'standard';
  color?: ButtonColor;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  accessibilityLabel: string; // Required for icon buttons
}

const ICON_BUTTON_SIZE = {
  sm: { size: 36, iconSize: 18 },
  md: { size: ELITE_A11Y.touchTarget.min, iconSize: 22 },
  lg: { size: ELITE_A11Y.touchTarget.comfortable, iconSize: 26 },
};

export const EliteIconButton: React.FC<EliteIconButtonProps> = ({
  icon,
  onPress,
  onLongPress,
  size = 'md',
  variant = 'standard',
  color = 'primary',
  disabled = false,
  loading = false,
  style,
  accessibilityLabel,
}) => {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const sizeConfig = ICON_BUTTON_SIZE[size];

  const colorValue = useMemo(() => {
    switch (color) {
      case 'secondary': return colors.secondary;
      case 'success': return colors.success;
      case 'warning': return colors.warning;
      case 'error': return colors.error;
      case 'neutral': return colors.textSecondary;
      default: return colors.primary;
    }
  }, [color, colors]);

  const handlePressIn = useCallback(() => {
    Haptics.light();
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      ...ELITE_MOTION.spring.snappy,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...ELITE_MOTION.spring.default,
    }).start();
  }, [scaleAnim]);

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: colorValue,
          ...ELITE_SHADOWS.colored(colorValue, 0.25),
        };
      case 'tonal':
        return {
          backgroundColor: `${colorValue}20`,
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: colorValue,
        };
      default:
        return {
          backgroundColor: 'transparent',
        };
    }
  };

  const isDisabled = disabled || loading;

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled: isDisabled }}
        style={[
          styles.iconButton,
          getVariantStyle(),
          {
            width: sizeConfig.size,
            height: sizeConfig.size,
            borderRadius: sizeConfig.size / 2,
            opacity: isDisabled ? 0.4 : 1,
          },
        ]}
        android_ripple={{ color: `${colorValue}30`, borderless: true }}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'filled' ? '#FFFFFF' : colorValue}
          />
        ) : (
          icon
        )}
      </Pressable>
    </Animated.View>
  );
};

// ============================================================================
// FLOATING ACTION BUTTON
// ============================================================================
interface EliteFABProps {
  icon: React.ReactNode;
  onPress: () => void;
  label?: string; // Extended FAB
  size?: 'sm' | 'md' | 'lg';
  color?: ButtonColor;
  style?: ViewStyle;
  accessibilityLabel: string;
}

const FAB_SIZE = {
  sm: { size: 40, iconSize: 20, padding: 8 },
  md: { size: 56, iconSize: 24, padding: 16 },
  lg: { size: 96, iconSize: 36, padding: 28 },
};

export const EliteFAB: React.FC<EliteFABProps> = ({
  icon,
  onPress,
  label,
  size = 'md',
  color = 'primary',
  style,
  accessibilityLabel,
}) => {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const sizeConfig = FAB_SIZE[size];

  const colorValue = useMemo(() => {
    switch (color) {
      case 'secondary': return colors.secondary;
      case 'success': return colors.success;
      case 'error': return colors.error;
      default: return colors.primary;
    }
  }, [color, colors]);

  const handlePressIn = useCallback(() => {
    Haptics.medium();
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      ...ELITE_MOTION.spring.snappy,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...ELITE_MOTION.spring.bouncy,
    }).start();
  }, [scaleAnim]);

  return (
    <Animated.View
      style={[
        styles.fab,
        ELITE_SHADOWS.colored(colorValue, 0.4),
        {
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={[
          styles.fabContent,
          {
            minWidth: sizeConfig.size,
            height: sizeConfig.size,
            paddingHorizontal: label ? ELITE_SPACING[4] : sizeConfig.padding,
            borderRadius: label ? ELITE_RADIUS.xl : sizeConfig.size / 2,
            backgroundColor: colorValue,
          },
        ]}
        android_ripple={{ color: 'rgba(255,255,255,0.25)', borderless: false }}
      >
        {icon}
        {label && (
          <Text style={[styles.fabLabel, { marginLeft: ELITE_SPACING[2] }]}>
            {label}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
};

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fab: {
    borderRadius: ELITE_RADIUS.xl,
  },
  fabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabLabel: {
    color: '#FFFFFF',
    fontSize: ELITE_TYPOGRAPHY.fluid.subhead,
    fontWeight: ELITE_TYPOGRAPHY.weight.semibold,
  },
});

export default EliteButton;

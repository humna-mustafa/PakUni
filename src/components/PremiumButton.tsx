/**
 * PremiumButton Component - Material Design 3 (2025) Compliant
 * 
 * Production-ready button following Google Material 3 specifications:
 * - M3 Button types: Elevated, Filled, FilledTonal, Outlined, Text
 * - State layers with proper opacity values
 * - Accessible touch targets (48dp minimum)
 * - Focus indicators for accessibility
 * - Reduced motion support
 * - Haptic feedback patterns
 * 
 * FAANG Standards Applied:
 * - Meta: Memoized callbacks, optimized re-renders
 * - Apple: Native-feeling spring animations
 * - Google: Material 3 specs, state layers
 * - Netflix: Loading state patterns
 */

import React, {useRef, useCallback, useMemo, memo} from 'react';
import {
  Animated,
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
  Platform,
  AccessibilityInfo,
} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import {RADIUS, SPACING, SHADOWS, TYPOGRAPHY, ANIMATION} from '../constants/design';
import {
  CLEAN_COMPONENTS,
  CLEAN_A11Y,
  CLEAN_MOTION,
  CLEAN_RADIUS,
  STATE_LAYERS,
  getSpringConfig,
} from '../constants/clean-design-2025';
import {Haptics} from '../utils/haptics';

// Material 3 Button Types
type ButtonVariant = 'elevated' | 'filled' | 'filledTonal' | 'outlined' | 'text' | 
  // Legacy aliases for backwards compatibility
  'solid' | 'outline' | 'ghost' | 'soft' | 'link';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type ButtonColor = 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'error' | 'neutral';

interface PremiumButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  color?: ButtonColor;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  rounded?: boolean;
  hapticEnabled?: boolean;
  // M3 additions
  elevated?: boolean;
  tonal?: boolean;
  // Accessibility
  reducedMotion?: boolean;
  // Styles
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

// Material 3 compliant size configurations
const SIZE_CONFIG: Record<ButtonSize, {
  height: number;
  paddingH: number;
  paddingV: number;
  fontSize: number;
  iconSize: number;
  borderRadius: number;
}> = {
  xs: {
    height: CLEAN_COMPONENTS.button.xs.height,
    paddingH: CLEAN_COMPONENTS.button.xs.paddingHorizontal,
    paddingV: 4,
    fontSize: CLEAN_COMPONENTS.button.xs.fontSize,
    iconSize: CLEAN_COMPONENTS.button.xs.iconSize,
    borderRadius: CLEAN_COMPONENTS.button.xs.borderRadius,
  },
  sm: {
    height: CLEAN_COMPONENTS.button.sm.height,
    paddingH: CLEAN_COMPONENTS.button.sm.paddingHorizontal,
    paddingV: 6,
    fontSize: CLEAN_COMPONENTS.button.sm.fontSize,
    iconSize: CLEAN_COMPONENTS.button.sm.iconSize,
    borderRadius: CLEAN_COMPONENTS.button.sm.borderRadius,
  },
  md: {
    height: CLEAN_COMPONENTS.button.md.height,
    paddingH: CLEAN_COMPONENTS.button.md.paddingHorizontal,
    paddingV: 8,
    fontSize: CLEAN_COMPONENTS.button.md.fontSize,
    iconSize: CLEAN_COMPONENTS.button.md.iconSize,
    borderRadius: CLEAN_COMPONENTS.button.md.borderRadius,
  },
  lg: {
    height: CLEAN_COMPONENTS.button.lg.height,
    paddingH: CLEAN_COMPONENTS.button.lg.paddingHorizontal,
    paddingV: 10,
    fontSize: CLEAN_COMPONENTS.button.lg.fontSize,
    iconSize: CLEAN_COMPONENTS.button.lg.iconSize,
    borderRadius: CLEAN_COMPONENTS.button.lg.borderRadius,
  },
  xl: {
    height: CLEAN_COMPONENTS.button.xl.height,
    paddingH: CLEAN_COMPONENTS.button.xl.paddingHorizontal,
    paddingV: 12,
    fontSize: CLEAN_COMPONENTS.button.xl.fontSize,
    iconSize: CLEAN_COMPONENTS.button.xl.iconSize,
    borderRadius: CLEAN_COMPONENTS.button.xl.borderRadius,
  },
};

// Map legacy variants to M3 variants
const VARIANT_MAP: Record<string, string> = {
  solid: 'filled',
  outline: 'outlined',
  ghost: 'text',
  soft: 'filledTonal',
  link: 'text',
};

export const PremiumButton: React.FC<PremiumButtonProps> = memo(({
  title,
  onPress,
  variant = 'filled',
  size = 'md',
  color = 'primary',
  leftIcon,
  rightIcon,
  loading = false,
  disabled = false,
  fullWidth = false,
  rounded = false,
  hapticEnabled = true,
  elevated = false,
  reducedMotion = false,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
  testID,
}) => {
  const {colors, isDark} = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const stateLayerAnim = useRef(new Animated.Value(0)).current;
  
  // Map legacy variant to M3 variant
  const m3Variant = VARIANT_MAP[variant] || variant;

  // Get spring config based on reduced motion preference
  const springConfig = useMemo(() => 
    getSpringConfig('snappy', reducedMotion),
    [reducedMotion]
  );

  const handlePressIn = useCallback(() => {
    if (hapticEnabled && !reducedMotion) {
      Haptics.buttonPress();
    }
    
    const duration = reducedMotion ? 0 : CLEAN_MOTION.duration.short2;
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: reducedMotion ? 1 : 0.97,
        useNativeDriver: true,
        ...springConfig,
      }),
      Animated.timing(stateLayerAnim, {
        toValue: STATE_LAYERS.pressed.light,
        duration,
        useNativeDriver: false,
      }),
    ]).start();
  }, [scaleAnim, stateLayerAnim, hapticEnabled, reducedMotion, springConfig]);

  const handlePressOut = useCallback(() => {
    const duration = reducedMotion ? 0 : CLEAN_MOTION.duration.short3;
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        ...getSpringConfig('default', reducedMotion),
      }),
      Animated.timing(stateLayerAnim, {
        toValue: 0,
        duration,
        useNativeDriver: false,
      }),
    ]).start();
  }, [scaleAnim, stateLayerAnim, reducedMotion]);

  // Get color values based on color prop
  const colorValues = useMemo(() => {
    switch (color) {
      case 'secondary':
        return {
          main: colors.secondary,
          container: colors.secondaryLight,
          onContainer: colors.secondary,
        };
      case 'tertiary':
        return {
          main: colors.tertiary || colors.primary,
          container: colors.tertiaryLight || colors.primaryLight,
          onContainer: colors.tertiary || colors.primary,
        };
      case 'success':
        return {
          main: colors.success,
          container: colors.successLight,
          onContainer: colors.success,
        };
      case 'warning':
        return {
          main: colors.warning,
          container: colors.warningLight,
          onContainer: colors.warning,
        };
      case 'error':
        return {
          main: colors.error,
          container: colors.errorLight,
          onContainer: colors.error,
        };
      case 'neutral':
        return {
          main: colors.textSecondary,
          container: colors.background,
          onContainer: colors.text,
        };
      default:
        return {
          main: colors.primary,
          container: colors.primaryLight,
          onContainer: colors.primary,
        };
    }
  }, [color, colors]);

  const sizeConfig = SIZE_CONFIG[size];

  // Get M3-compliant variant styles
  const variantStyles = useMemo((): {container: ViewStyle; text: TextStyle; stateLayerColor: string} => {
    switch (m3Variant) {
      case 'elevated':
        return {
          container: {
            backgroundColor: isDark ? colors.surfaceContainer : colors.surface,
            ...SHADOWS.soft.md,
          },
          text: {
            color: colorValues.main,
          },
          stateLayerColor: colorValues.main,
        };
      case 'filledTonal':
        return {
          container: {
            backgroundColor: colorValues.container,
          },
          text: {
            color: colorValues.onContainer,
          },
          stateLayerColor: colorValues.onContainer,
        };
      case 'outlined':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: isDark ? colors.border : colorValues.main,
          },
          text: {
            color: colorValues.main,
          },
          stateLayerColor: colorValues.main,
        };
      case 'text':
        return {
          container: {
            backgroundColor: 'transparent',
            paddingHorizontal: sizeConfig.paddingH / 2,
          },
          text: {
            color: colorValues.main,
          },
          stateLayerColor: colorValues.main,
        };
      case 'filled':
      default:
        return {
          container: {
            backgroundColor: colorValues.main,
            // Subtle shadow for depth (M3 filled buttons can have elevation)
            ...(elevated ? SHADOWS.soft.sm : {}),
          },
          text: {
            color: colors.textOnPrimary,
          },
          stateLayerColor: colors.textOnPrimary,
        };
    }
  }, [m3Variant, colorValues, colors, isDark, elevated, sizeConfig.paddingH]);

  const isDisabled = disabled || loading;

  // Container style with M3 specs
  const containerStyle: ViewStyle = useMemo(() => ({
    ...styles.container,
    ...variantStyles.container,
    height: sizeConfig.height,
    minHeight: Math.max(sizeConfig.height, CLEAN_A11Y.minTouchTarget), // WCAG minimum
    paddingHorizontal: sizeConfig.paddingH,
    borderRadius: rounded ? CLEAN_RADIUS.full : sizeConfig.borderRadius,
    opacity: isDisabled ? STATE_LAYERS.disabled.content : 1,
    ...(fullWidth && {width: '100%'}),
  }), [variantStyles.container, sizeConfig, rounded, isDisabled, fullWidth]);

  // Text style with M3 specs
  const labelStyle: TextStyle = useMemo(() => ({
    ...styles.text,
    ...variantStyles.text,
    fontSize: sizeConfig.fontSize,
    opacity: isDisabled ? STATE_LAYERS.disabled.content : 1,
  }), [variantStyles.text, sizeConfig.fontSize, isDisabled]);

  // State layer overlay color (animated)
  const stateLayerStyle = useMemo(() => ({
    ...StyleSheet.absoluteFillObject,
    backgroundColor: variantStyles.stateLayerColor,
    borderRadius: rounded ? CLEAN_RADIUS.full : sizeConfig.borderRadius,
  }), [variantStyles.stateLayerColor, rounded, sizeConfig.borderRadius]);

  return (
    <Animated.View 
      style={[
        {transform: [{scale: scaleAnim}]}, 
        style
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={containerStyle}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityState={{disabled: isDisabled, busy: loading}}
        testID={testID}
        android_ripple={
          Platform.OS === 'android' && m3Variant === 'filled'
            ? {
                color: 'rgba(255,255,255,0.2)',
                borderless: false,
                foreground: true,
              }
            : undefined
        }
      >
        {/* State layer overlay (M3 spec) */}
        <Animated.View
          style={[stateLayerStyle, {opacity: stateLayerAnim}]}
          pointerEvents="none"
        />
        
        {/* Button content */}
        {loading ? (
          <ActivityIndicator
            size="small"
            color={m3Variant === 'filled' ? colors.textOnPrimary : colorValues.main}
          />
        ) : (
          <View style={styles.content}>
            {leftIcon && (
              <View style={styles.leftIcon} accessibilityElementsHidden>
                {leftIcon}
              </View>
            )}
            <Text 
              style={[labelStyle, textStyle]}
              numberOfLines={1}
              allowFontScaling
              maxFontSizeMultiplier={CLEAN_A11Y.text.maxScaleFactor}
            >
              {title}
            </Text>
            {rightIcon && (
              <View style={styles.rightIcon} accessibilityElementsHidden>
                {rightIcon}
              </View>
            )}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
});

PremiumButton.displayName = 'PremiumButton';

// Icon Button Variant - Material 3 Compliant
interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  size?: ButtonSize;
  color?: ButtonColor;
  variant?: 'standard' | 'filled' | 'filledTonal' | 'outlined' | 'ghost';
  disabled?: boolean;
  selected?: boolean;
  toggle?: boolean;
  reducedMotion?: boolean;
  style?: ViewStyle;
  accessibilityLabel: string; // Required for icon buttons
  accessibilityHint?: string;
  testID?: string;
}

export const IconButton: React.FC<IconButtonProps> = memo(({
  icon,
  onPress,
  size = 'md',
  color = 'primary',
  variant = 'standard',
  disabled = false,
  selected = false,
  toggle = false,
  reducedMotion = false,
  style,
  accessibilityLabel,
  accessibilityHint,
  testID,
}) => {
  const {colors, isDark} = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const stateLayerAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = useCallback(() => {
    if (!reducedMotion) {
      Haptics.light();
    }
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: reducedMotion ? 1 : 0.9,
        useNativeDriver: true,
        ...getSpringConfig('snappy', reducedMotion),
      }),
      Animated.timing(stateLayerAnim, {
        toValue: STATE_LAYERS.pressed.light,
        duration: reducedMotion ? 0 : CLEAN_MOTION.duration.short2,
        useNativeDriver: false,
      }),
    ]).start();
  }, [scaleAnim, stateLayerAnim, reducedMotion]);

  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        ...getSpringConfig('default', reducedMotion),
      }),
      Animated.timing(stateLayerAnim, {
        toValue: 0,
        duration: reducedMotion ? 0 : CLEAN_MOTION.duration.short3,
        useNativeDriver: false,
      }),
    ]).start();
  }, [scaleAnim, stateLayerAnim, reducedMotion]);

  const sizeConfig = SIZE_CONFIG[size];
  // M3 icon button sizes: standard 40, small 40, large 48
  const buttonSize = Math.max(
    sizeConfig.height,
    CLEAN_A11Y.minTouchTarget // Ensure WCAG minimum
  );

  // Get color based on variant and selected state
  const getIconColor = useMemo(() => {
    if (disabled) {
      return colors.textTertiary;
    }
    
    switch (color) {
      case 'secondary':
        return colors.secondary;
      case 'tertiary':
        return colors.tertiary || colors.primary;
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.error;
      case 'neutral':
        return colors.text;
      default:
        return colors.primary;
    }
  }, [color, colors, disabled]);

  // Get variant-specific styles
  const variantStyles = useMemo((): {backgroundColor: string; stateLayerColor: string} => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: selected ? getIconColor : colors.primary,
          stateLayerColor: colors.textOnPrimary,
        };
      case 'filledTonal':
        return {
          backgroundColor: colors.primaryLight,
          stateLayerColor: getIconColor,
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          stateLayerColor: getIconColor,
        };
      case 'standard':
      case 'ghost':
      default:
        return {
          backgroundColor: 'transparent',
          stateLayerColor: getIconColor,
        };
    }
  }, [variant, selected, getIconColor, colors]);

  return (
    <Animated.View style={[{transform: [{scale: scaleAnim}]}, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole={toggle ? 'togglebutton' : 'button'}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{
          disabled,
          selected: toggle ? selected : undefined,
        }}
        testID={testID}
        hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
        style={[
          styles.iconButton,
          {
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
            backgroundColor: variantStyles.backgroundColor,
            borderWidth: variant === 'outlined' ? 1 : 0,
            borderColor: variant === 'outlined' ? colors.border : 'transparent',
            opacity: disabled ? STATE_LAYERS.disabled.content : 1,
          },
        ]}
      >
        {/* State layer */}
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: variantStyles.stateLayerColor,
              borderRadius: buttonSize / 2,
              opacity: stateLayerAnim,
            },
          ]}
          pointerEvents="none"
        />
        {icon}
      </Pressable>
    </Animated.View>
  );
});

IconButton.displayName = 'IconButton';

// Floating Action Button (FAB) - Material 3 Compliant
interface FABProps {
  icon: React.ReactNode;
  onPress: () => void;
  label?: string; // Extended FAB
  size?: 'small' | 'default' | 'large';
  color?: ButtonColor;
  variant?: 'surface' | 'primary' | 'secondary' | 'tertiary';
  lowered?: boolean;
  disabled?: boolean;
  reducedMotion?: boolean;
  style?: ViewStyle;
  accessibilityLabel: string;
  testID?: string;
}

export const FAB: React.FC<FABProps> = memo(({
  icon,
  onPress,
  label,
  size = 'default',
  color = 'primary',
  variant = 'primary',
  lowered = false,
  disabled = false,
  reducedMotion = false,
  style,
  accessibilityLabel,
  testID,
}) => {
  const {colors} = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const fabConfig = useMemo(() => {
    switch (size) {
      case 'small':
        return CLEAN_COMPONENTS.fab.small;
      case 'large':
        return CLEAN_COMPONENTS.fab.large;
      default:
        return label ? CLEAN_COMPONENTS.fab.extended : CLEAN_COMPONENTS.fab.default;
    }
  }, [size, label]);

  const handlePressIn = useCallback(() => {
    Haptics.medium();
    Animated.spring(scaleAnim, {
      toValue: reducedMotion ? 1 : 0.95,
      useNativeDriver: true,
      ...getSpringConfig('snappy', reducedMotion),
    }).start();
  }, [scaleAnim, reducedMotion]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...getSpringConfig('default', reducedMotion),
    }).start();
  }, [scaleAnim, reducedMotion]);

  // Get background color based on variant
  const backgroundColor = useMemo(() => {
    switch (variant) {
      case 'surface':
        return colors.surface;
      case 'secondary':
        return colors.secondaryLight;
      case 'tertiary':
        return colors.tertiaryLight || colors.primaryLight;
      case 'primary':
      default:
        return colors.primaryLight;
    }
  }, [variant, colors]);

  const contentColor = useMemo(() => {
    switch (variant) {
      case 'surface':
        return colors.primary;
      case 'secondary':
        return colors.secondary;
      case 'tertiary':
        return colors.tertiary || colors.primary;
      case 'primary':
      default:
        return colors.primary;
    }
  }, [variant, colors]);

  const isExtended = !!label;

  return (
    <Animated.View style={[{transform: [{scale: scaleAnim}]}, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        testID={testID}
        style={[
          styles.fab,
          {
            width: isExtended ? undefined : fabConfig.size,
            height: isExtended ? fabConfig.height : fabConfig.size,
            minWidth: isExtended ? fabConfig.size : undefined,
            paddingHorizontal: isExtended ? fabConfig.paddingHorizontal : 0,
            borderRadius: fabConfig.borderRadius,
            backgroundColor,
            ...(lowered ? SHADOWS.soft.sm : SHADOWS.soft.lg),
            opacity: disabled ? STATE_LAYERS.disabled.content : 1,
          },
        ]}
      >
        <View style={styles.fabContent}>
          {icon}
          {label && (
            <Text
              style={[
                styles.fabLabel,
                {color: contentColor},
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
});

FAB.displayName = 'FAB';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // For state layer clipping
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1, // Above state layer
  },
  text: {
    fontWeight: TYPOGRAPHY.weight.semibold,
    textAlign: 'center',
    letterSpacing: 0.1, // M3 label letter spacing
  },
  leftIcon: {
    marginRight: SPACING[2],
  },
  rightIcon: {
    marginLeft: SPACING[2],
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fab: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING[2],
  },
  fabLabel: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
});

export default PremiumButton;

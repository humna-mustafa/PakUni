/**
 * Ultra Premium Components - World-Class Visual Quality
 * No Blur, Crisp Rendering, Designer-Grade Standards
 * 
 * This file provides the highest quality UI components with:
 * - Pixel-perfect rendering
 * - Smooth 60fps animations
 * - Crystal-clear typography
 * - Professional shadows and effects
 */

import React, { useRef, useCallback, useMemo, memo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
  Platform,
  ActivityIndicator,
  PixelRatio,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import {
  ULTRA_COLORS,
  ULTRA_TYPOGRAPHY,
  ULTRA_SPACING,
  ULTRA_RADIUS,
  ULTRA_SHADOWS,
  ULTRA_MOTION,
  ULTRA_GLASS,
  ULTRA_A11Y,
  pixelPerfect,
} from '../../constants/ultra-design';
import { Haptics } from '../../utils/haptics';

// ============================================================================
// TYPES
// ============================================================================

type ColorVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'neutral';
type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// ============================================================================
// ULTRA CARD - Crystal Clear Card Component
// ============================================================================

interface UltraPremiumCardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled' | 'glass' | 'gradient';
  padding?: SizeVariant | 'none';
  borderRadius?: SizeVariant | 'full';
  shadowLevel?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  accentColor?: string;
  accessibilityLabel?: string;
}

const CARD_PADDING: Record<SizeVariant | 'none', number> = {
  none: 0,
  xs: ULTRA_SPACING[2],
  sm: ULTRA_SPACING[3],
  md: ULTRA_SPACING[4],
  lg: ULTRA_SPACING[5],
  xl: ULTRA_SPACING[6],
};

const CARD_RADIUS: Record<SizeVariant | 'full', number> = {
  xs: ULTRA_RADIUS.sm,
  sm: ULTRA_RADIUS.md,
  md: ULTRA_RADIUS.lg,
  lg: ULTRA_RADIUS.xl,
  xl: ULTRA_RADIUS['2xl'],
  full: ULTRA_RADIUS.full,
};

export const UltraPremiumCard = memo<UltraPremiumCardProps>(({
  children,
  variant = 'elevated',
  padding = 'md',
  borderRadius = 'lg',
  shadowLevel = 'md',
  onPress,
  onLongPress,
  disabled = false,
  style,
  contentStyle,
  accentColor,
  accessibilityLabel,
}) => {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const paddingValue = CARD_PADDING[padding];
  const radiusValue = CARD_RADIUS[borderRadius];
  const shadowStyle = isDark ? ULTRA_SHADOWS.dark : ULTRA_SHADOWS.light;

  // Get variant-specific styles
  const variantStyles = useMemo((): ViewStyle => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: colors.card,
          borderWidth: pixelPerfect(1),
          borderColor: colors.border,
        };
      case 'filled':
        return {
          backgroundColor: colors.background,
        };
      case 'glass':
        const glass = isDark ? ULTRA_GLASS.dark.medium : ULTRA_GLASS.light.medium;
        return {
          backgroundColor: glass.backgroundColor,
          borderWidth: glass.borderWidth,
          borderColor: glass.borderColor,
          ...(Platform.OS === 'ios' && shadowStyle.sm),
        };
      case 'gradient':
        return {
          backgroundColor: accentColor ? `${accentColor}10` : colors.primaryLight,
          borderWidth: pixelPerfect(1),
          borderColor: accentColor ? `${accentColor}25` : `${colors.primary}20`,
        };
      case 'elevated':
      default:
        return {
          backgroundColor: colors.card,
          ...shadowStyle[shadowLevel as keyof typeof shadowStyle],
        };
    }
  }, [variant, colors, isDark, shadowLevel, accentColor]);

  // Press handlers with smooth animations
  const handlePressIn = useCallback(() => {
    if (!onPress || disabled) return;
    Haptics.light();
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: ULTRA_MOTION.presets.cardTap.scale.pressed,
        useNativeDriver: true,
        ...ULTRA_MOTION.spring.snappy,
      }),
      Animated.timing(opacityAnim, {
        toValue: ULTRA_MOTION.presets.cardTap.opacity.pressed,
        duration: ULTRA_MOTION.duration.fast,
        useNativeDriver: true,
      }),
    ]).start();
  }, [onPress, disabled, scaleAnim, opacityAnim]);

  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: ULTRA_MOTION.presets.cardTap.scale.default,
        useNativeDriver: true,
        ...ULTRA_MOTION.spring.default,
      }),
      Animated.timing(opacityAnim, {
        toValue: ULTRA_MOTION.presets.cardTap.opacity.default,
        duration: ULTRA_MOTION.duration.fast,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const handlePress = useCallback(() => {
    if (onPress && !disabled) {
      Haptics.medium();
      onPress();
    }
  }, [onPress, disabled]);

  const cardStyle: ViewStyle = {
    padding: paddingValue,
    borderRadius: radiusValue,
    opacity: disabled ? 0.5 : 1,
    overflow: 'hidden',
    ...variantStyles,
  };

  const content = (
    <View style={[styles.cardContent, contentStyle]}>
      {children}
    </View>
  );

  if (onPress || onLongPress) {
    return (
      <Animated.View
        style={[
          cardStyle,
          {
            transform: [{ scale: scaleAnim }],
            opacity: Animated.multiply(opacityAnim, disabled ? 0.5 : 1),
          },
          style,
        ]}
      >
        <Pressable
          onPress={handlePress}
          onLongPress={onLongPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityState={{ disabled }}
          style={styles.pressable}
          android_ripple={{
            color: `${colors.primary}15`,
            borderless: false,
          }}
        >
          {content}
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <View style={[cardStyle, style]} accessibilityLabel={accessibilityLabel}>
      {content}
    </View>
  );
});

// ============================================================================
// ULTRA BUTTON - Pixel-Perfect Button Component
// ============================================================================

interface UltraPremiumButtonProps {
  title?: string;
  children?: React.ReactNode;
  onPress: () => void;
  onLongPress?: () => void;
  variant?: 'filled' | 'outlined' | 'ghost' | 'soft' | 'link';
  color?: ColorVariant;
  size?: SizeVariant;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  rounded?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const BUTTON_SIZE = {
  xs: { height: pixelPerfect(32), paddingH: ULTRA_SPACING[3], fontSize: ULTRA_TYPOGRAPHY.scale.caption, iconGap: ULTRA_SPACING[1] },
  sm: { height: pixelPerfect(38), paddingH: ULTRA_SPACING[4], fontSize: ULTRA_TYPOGRAPHY.scale.footnote, iconGap: ULTRA_SPACING[1.5] },
  md: { height: ULTRA_A11Y.touchTarget.min, paddingH: ULTRA_SPACING[5], fontSize: ULTRA_TYPOGRAPHY.scale.subhead, iconGap: ULTRA_SPACING[2] },
  lg: { height: ULTRA_A11Y.touchTarget.comfortable, paddingH: ULTRA_SPACING[6], fontSize: ULTRA_TYPOGRAPHY.scale.body, iconGap: ULTRA_SPACING[2] },
  xl: { height: ULTRA_A11Y.touchTarget.large, paddingH: ULTRA_SPACING[8], fontSize: ULTRA_TYPOGRAPHY.scale.headline, iconGap: ULTRA_SPACING[2.5] },
};

export const UltraPremiumButton = memo<UltraPremiumButtonProps>(({
  title,
  children,
  onPress,
  onLongPress,
  variant = 'filled',
  color = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  loading = false,
  disabled = false,
  fullWidth = false,
  rounded = false,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pressedAnim = useRef(new Animated.Value(0)).current;

  const sizeConfig = BUTTON_SIZE[size];

  // Get color values
  const colorValues = useMemo(() => {
    const colorMap: Record<ColorVariant, { main: string; light: string; dark: string; onMain: string }> = {
      primary: { main: colors.primary, light: colors.primaryLight, dark: colors.primaryDark, onMain: '#FFFFFF' },
      secondary: { main: colors.secondary, light: colors.secondaryLight, dark: colors.secondary, onMain: '#FFFFFF' },
      accent: { main: ULTRA_COLORS.accent[500], light: ULTRA_COLORS.accent[100], dark: ULTRA_COLORS.accent[700], onMain: '#FFFFFF' },
      success: { main: colors.success, light: colors.successLight, dark: colors.success, onMain: '#FFFFFF' },
      warning: { main: colors.warning, light: colors.warningLight, dark: colors.warning, onMain: '#000000' },
      error: { main: colors.error, light: colors.errorLight, dark: colors.error, onMain: '#FFFFFF' },
      neutral: { main: colors.textSecondary, light: colors.background, dark: colors.text, onMain: '#FFFFFF' },
    };
    return colorMap[color];
  }, [color, colors]);

  // Get variant styles
  const variantStyles = useMemo((): { container: ViewStyle; text: TextStyle } => {
    const shadowStyle = isDark ? ULTRA_SHADOWS.dark : ULTRA_SHADOWS.light;
    
    switch (variant) {
      case 'outlined':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: pixelPerfect(1.5),
            borderColor: colorValues.main,
          },
          text: { color: colorValues.main },
        };
      case 'ghost':
        return {
          container: { backgroundColor: 'transparent' },
          text: { color: colorValues.main },
        };
      case 'soft':
        return {
          container: { backgroundColor: colorValues.light },
          text: { color: colorValues.main },
        };
      case 'link':
        return {
          container: { backgroundColor: 'transparent', paddingHorizontal: 0 },
          text: { color: colorValues.main, textDecorationLine: 'underline' as const },
        };
      case 'filled':
      default:
        return {
          container: {
            backgroundColor: colorValues.main,
            ...ULTRA_SHADOWS.colored(colorValues.main, 0.25),
          },
          text: { color: colorValues.onMain },
        };
    }
  }, [variant, colorValues, isDark]);

  // Animation handlers
  const handlePressIn = useCallback(() => {
    if (disabled || loading) return;
    Haptics.light();
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: ULTRA_MOTION.presets.buttonPress.scale.pressed,
        useNativeDriver: true,
        ...ULTRA_MOTION.spring.snappy,
      }),
      Animated.timing(pressedAnim, {
        toValue: 1,
        duration: ULTRA_MOTION.duration.fast,
        useNativeDriver: false,
      }),
    ]).start();
  }, [disabled, loading, scaleAnim, pressedAnim]);

  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: ULTRA_MOTION.presets.buttonPress.scale.default,
        useNativeDriver: true,
        ...ULTRA_MOTION.spring.default,
      }),
      Animated.timing(pressedAnim, {
        toValue: 0,
        duration: ULTRA_MOTION.duration.fast,
        useNativeDriver: false,
      }),
    ]).start();
  }, [scaleAnim, pressedAnim]);

  const handlePress = useCallback(() => {
    if (!disabled && !loading) {
      Haptics.medium();
      onPress();
    }
  }, [disabled, loading, onPress]);

  const isDisabled = disabled || loading;

  // Pressed background color interpolation
  const pressedBgColor = pressedAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      variantStyles.container.backgroundColor as string || 'transparent',
      variant === 'filled' ? colorValues.dark : `${colorValues.main}15`,
    ],
  });

  const containerStyle: ViewStyle = {
    height: sizeConfig.height,
    paddingHorizontal: variant === 'link' ? 0 : sizeConfig.paddingH,
    borderRadius: rounded ? ULTRA_RADIUS.full : ULTRA_RADIUS.button,
    opacity: isDisabled ? 0.45 : 1,
    ...(fullWidth && { width: '100%' }),
    overflow: 'hidden',
  };

  const labelStyle: TextStyle = {
    fontSize: sizeConfig.fontSize,
    fontWeight: ULTRA_TYPOGRAPHY.weight.semibold,
    letterSpacing: ULTRA_TYPOGRAPHY.tracking.wide,
    ...variantStyles.text,
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        onPress={handlePress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        style={[styles.buttonContainer, containerStyle, variantStyles.container]}
        android_ripple={
          variant === 'filled'
            ? { color: 'rgba(255,255,255,0.2)', borderless: false }
            : { color: `${colorValues.main}20`, borderless: false }
        }
      >
        {/* Pressed overlay */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: pressedBgColor,
              borderRadius: rounded ? ULTRA_RADIUS.full : ULTRA_RADIUS.button,
            },
          ]}
        />
        
        {/* Content */}
        <View style={styles.buttonContent}>
          {loading ? (
            <ActivityIndicator
              size="small"
              color={variantStyles.text.color as string}
            />
          ) : (
            <>
              {leftIcon && (
                <View style={{ marginRight: sizeConfig.iconGap }}>
                  {leftIcon}
                </View>
              )}
              {title ? (
                <Text style={[labelStyle, textStyle]} numberOfLines={1}>
                  {title}
                </Text>
              ) : (
                children
              )}
              {rightIcon && (
                <View style={{ marginLeft: sizeConfig.iconGap }}>
                  {rightIcon}
                </View>
              )}
            </>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
});

// ============================================================================
// ULTRA BADGE - Clean Status Indicators
// ============================================================================

interface UltraPremiumBadgeProps {
  text?: string;
  variant?: 'solid' | 'soft' | 'outlined' | 'dot';
  color?: ColorVariant;
  size?: 'xs' | 'sm' | 'md';
  icon?: React.ReactNode;
  pill?: boolean;
  style?: ViewStyle;
}

const BADGE_SIZE = {
  xs: { paddingH: ULTRA_SPACING[1.5], paddingV: ULTRA_SPACING[0.5], fontSize: pixelPerfect(9), dotSize: pixelPerfect(6) },
  sm: { paddingH: ULTRA_SPACING[2], paddingV: ULTRA_SPACING[0.5], fontSize: ULTRA_TYPOGRAPHY.scale.micro, dotSize: pixelPerfect(8) },
  md: { paddingH: ULTRA_SPACING[2.5], paddingV: ULTRA_SPACING[1], fontSize: ULTRA_TYPOGRAPHY.scale.caption, dotSize: pixelPerfect(10) },
};

export const UltraPremiumBadge = memo<UltraPremiumBadgeProps>(({
  text,
  variant = 'solid',
  color = 'primary',
  size = 'md',
  icon,
  pill = true,
  style,
}) => {
  const { colors } = useTheme();
  const sizeConfig = BADGE_SIZE[size];

  // Get color values
  const colorValues = useMemo(() => {
    const colorMap: Record<ColorVariant, { main: string; light: string }> = {
      primary: { main: colors.primary, light: colors.primaryLight },
      secondary: { main: colors.secondary, light: colors.secondaryLight },
      accent: { main: ULTRA_COLORS.accent[500], light: ULTRA_COLORS.accent[100] },
      success: { main: colors.success, light: colors.successLight },
      warning: { main: colors.warning, light: colors.warningLight },
      error: { main: colors.error, light: colors.errorLight },
      neutral: { main: colors.textSecondary, light: colors.background },
    };
    return colorMap[color];
  }, [color, colors]);

  // Get variant styles
  const variantStyles = useMemo((): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'soft':
        return {
          container: { backgroundColor: colorValues.light },
          text: { color: colorValues.main },
        };
      case 'outlined':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: pixelPerfect(1),
            borderColor: colorValues.main,
          },
          text: { color: colorValues.main },
        };
      case 'dot':
        return {
          container: {
            width: sizeConfig.dotSize,
            height: sizeConfig.dotSize,
            borderRadius: sizeConfig.dotSize / 2,
            backgroundColor: colorValues.main,
            padding: 0,
          },
          text: { display: 'none' as const },
        };
      case 'solid':
      default:
        return {
          container: { backgroundColor: colorValues.main },
          text: { color: '#FFFFFF' },
        };
    }
  }, [variant, colorValues, sizeConfig]);

  if (variant === 'dot') {
    return <View style={[variantStyles.container, style]} />;
  }

  return (
    <View
      style={[
        styles.badge,
        {
          paddingHorizontal: sizeConfig.paddingH,
          paddingVertical: sizeConfig.paddingV,
          borderRadius: pill ? ULTRA_RADIUS.full : ULTRA_RADIUS.xs,
        },
        variantStyles.container,
        style,
      ]}
    >
      {icon && <View style={styles.badgeIcon}>{icon}</View>}
      {text && (
        <Text
          style={[
            styles.badgeText,
            { fontSize: sizeConfig.fontSize },
            variantStyles.text,
          ]}
        >
          {text}
        </Text>
      )}
    </View>
  );
});

// ============================================================================
// ULTRA TEXT - Crystal Clear Typography
// ============================================================================

interface UltraPremiumTextProps {
  children: React.ReactNode;
  variant?: 'display' | 'title' | 'headline' | 'body' | 'caption' | 'label';
  weight?: keyof typeof ULTRA_TYPOGRAPHY.weight;
  color?: 'primary' | 'secondary' | 'muted' | 'accent' | 'success' | 'error' | 'inherit';
  align?: 'left' | 'center' | 'right';
  numberOfLines?: number;
  style?: TextStyle;
}

const TEXT_VARIANTS = {
  display: { fontSize: ULTRA_TYPOGRAPHY.scale.largeTitle, lineHeight: 1.2 },
  title: { fontSize: ULTRA_TYPOGRAPHY.scale.title1, lineHeight: 1.25 },
  headline: { fontSize: ULTRA_TYPOGRAPHY.scale.headline, lineHeight: 1.35 },
  body: { fontSize: ULTRA_TYPOGRAPHY.scale.body, lineHeight: 1.5 },
  caption: { fontSize: ULTRA_TYPOGRAPHY.scale.caption, lineHeight: 1.4 },
  label: { fontSize: ULTRA_TYPOGRAPHY.scale.footnote, lineHeight: 1.35 },
};

export const UltraPremiumText = memo<UltraPremiumTextProps>(({
  children,
  variant = 'body',
  weight = 'regular',
  color = 'primary',
  align = 'left',
  numberOfLines,
  style,
}) => {
  const { colors } = useTheme();

  const textColor = useMemo(() => {
    const colorMap = {
      primary: colors.text,
      secondary: colors.textSecondary,
      muted: colors.textMuted,
      accent: colors.primary,
      success: colors.success,
      error: colors.error,
      inherit: undefined,
    };
    return colorMap[color];
  }, [color, colors]);

  const variantStyle = TEXT_VARIANTS[variant];

  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        {
          fontSize: variantStyle.fontSize,
          lineHeight: variantStyle.fontSize * variantStyle.lineHeight,
          fontWeight: ULTRA_TYPOGRAPHY.weight[weight],
          color: textColor,
          textAlign: align,
          fontFamily: variant === 'display' || variant === 'title'
            ? ULTRA_TYPOGRAPHY.fontFamily.display
            : ULTRA_TYPOGRAPHY.fontFamily.text,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
});

// ============================================================================
// ULTRA DIVIDER - Clean Separator
// ============================================================================

interface UltraPremiumDividerProps {
  orientation?: 'horizontal' | 'vertical';
  thickness?: number;
  color?: string;
  spacing?: number;
  style?: ViewStyle;
}

export const UltraPremiumDivider = memo<UltraPremiumDividerProps>(({
  orientation = 'horizontal',
  thickness = pixelPerfect(1),
  color,
  spacing = ULTRA_SPACING[4],
  style,
}) => {
  const { colors } = useTheme();
  const dividerColor = color || colors.divider;

  if (orientation === 'vertical') {
    return (
      <View
        style={[
          {
            width: thickness,
            backgroundColor: dividerColor,
            marginHorizontal: spacing,
          },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        {
          height: thickness,
          backgroundColor: dividerColor,
          marginVertical: spacing,
        },
        style,
      ]}
    />
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  cardContent: {
    flexGrow: 1,
  },
  pressable: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  badgeIcon: {
    marginRight: ULTRA_SPACING[1],
  },
  badgeText: {
    fontWeight: ULTRA_TYPOGRAPHY.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: ULTRA_TYPOGRAPHY.tracking.wide,
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  UltraPremiumCard,
  UltraPremiumButton,
  UltraPremiumBadge,
  UltraPremiumText,
  UltraPremiumDivider,
};

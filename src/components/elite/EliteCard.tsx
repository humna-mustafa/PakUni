/**
 * Elite Card Component
 * Premium card with Apple/Google/Microsoft design standards
 * Features: Glass morphism, elevation system, micro-animations
 */

import React, { useRef, useCallback, useMemo } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Animated,
  ViewStyle,
  StyleProp,
  Platform,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import {
  ELITE_SPACING,
  ELITE_RADIUS,
  ELITE_SHADOWS,
  ELITE_MOTION,
  ELITE_GLASS,
} from '../../constants/elite';
import { Haptics } from '../../utils/haptics';

// ============================================================================
// TYPES
// ============================================================================
type CardVariant = 'filled' | 'outlined' | 'elevated' | 'glass' | 'tonal';
type CardPadding = 'none' | 'compact' | 'default' | 'spacious';

interface EliteCardProps {
  children: React.ReactNode;
  
  // Appearance
  variant?: CardVariant;
  padding?: CardPadding;
  borderRadius?: keyof typeof ELITE_RADIUS;
  
  // Interaction
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  
  // Customization
  style?: StyleProp<ViewStyle>;
  contentStyle?: ViewStyle;
  glowColor?: string;
  accentColor?: string;
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

// ============================================================================
// PADDING CONFIG
// ============================================================================
const PADDING_CONFIG: Record<CardPadding, number> = {
  none: 0,
  compact: ELITE_SPACING[3],
  default: ELITE_SPACING[4],
  spacious: ELITE_SPACING[6],
};

// ============================================================================
// ELITE CARD COMPONENT
// ============================================================================
export const EliteCard: React.FC<EliteCardProps> = ({
  children,
  variant = 'elevated',
  padding = 'default',
  borderRadius = 'card',
  onPress,
  onLongPress,
  disabled = false,
  style,
  contentStyle,
  glowColor,
  accentColor,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const { colors, isDark } = useTheme();
  
  // Animation refs
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const elevationAnim = useRef(new Animated.Value(0)).current;

  // Get padding value
  const paddingValue = PADDING_CONFIG[padding];
  const radiusValue = ELITE_RADIUS[borderRadius];

  // Get variant styles
  const variantStyles = useMemo((): ViewStyle => {
    const shadowStyle = isDark ? ELITE_SHADOWS.dark : ELITE_SHADOWS.light;

    switch (variant) {
      case 'filled':
        return {
          backgroundColor: colors.card,
        };
      case 'outlined':
        return {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'glass':
        return {
          backgroundColor: isDark
            ? ELITE_GLASS.dark.backgroundColor
            : ELITE_GLASS.light.backgroundColor,
          borderWidth: 1,
          borderColor: isDark
            ? ELITE_GLASS.dark.borderColor
            : ELITE_GLASS.light.borderColor,
          ...(Platform.OS === 'ios' && shadowStyle.sm),
        };
      case 'tonal':
        return {
          backgroundColor: accentColor
            ? `${accentColor}15`
            : colors.primaryLight,
          borderWidth: 1,
          borderColor: accentColor
            ? `${accentColor}25`
            : `${colors.primary}20`,
        };
      case 'elevated':
      default:
        return {
          backgroundColor: colors.card,
          ...shadowStyle.md,
        };
    }
  }, [variant, colors, isDark, accentColor]);

  // Glow style
  const glowStyle: ViewStyle | undefined = glowColor
    ? ELITE_SHADOWS.glow(glowColor, 0.25)
    : undefined;

  // Press handlers
  const handlePressIn = useCallback(() => {
    if (onPress && !disabled) {
      Haptics.light();
      
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: ELITE_MOTION.presets.cardTap.scale.pressed,
          useNativeDriver: true,
          ...ELITE_MOTION.spring.snappy,
        }),
        Animated.timing(opacityAnim, {
          toValue: ELITE_MOTION.presets.cardTap.opacity.pressed,
          duration: ELITE_MOTION.duration.fast,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [onPress, disabled, scaleAnim, opacityAnim]);

  const handlePressOut = useCallback(() => {
    if (onPress && !disabled) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: ELITE_MOTION.presets.cardTap.scale.default,
          useNativeDriver: true,
          ...ELITE_MOTION.spring.default,
        }),
        Animated.timing(opacityAnim, {
          toValue: ELITE_MOTION.presets.cardTap.opacity.default,
          duration: ELITE_MOTION.duration.fast,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [onPress, disabled, scaleAnim, opacityAnim]);

  const handlePress = useCallback(() => {
    if (onPress && !disabled) {
      Haptics.cardTap();
      onPress();
    }
  }, [onPress, disabled]);

  const handleLongPress = useCallback(() => {
    if (onLongPress && !disabled) {
      Haptics.heavy();
      onLongPress();
    }
  }, [onLongPress, disabled]);

  // Card style
  const cardStyle: ViewStyle = {
    padding: paddingValue,
    borderRadius: radiusValue,
    opacity: disabled ? 0.5 : 1,
    overflow: 'hidden',
  };

  // Content wrapper
  const content = (
    <View style={[styles.content, contentStyle]}>
      {children}
    </View>
  );

  // If interactive, wrap in Pressable
  if (onPress || onLongPress) {
    return (
      <Animated.View
        style={[
          cardStyle,
          variantStyles,
          glowStyle,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
          style,
        ]}
      >
        <Pressable
          onPress={handlePress}
          onLongPress={handleLongPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityState={{ disabled }}
          style={styles.pressable}
          android_ripple={{
            color: colors.primary + '20',
            borderless: false,
          }}
        >
          {content}
        </Pressable>
      </Animated.View>
    );
  }

  // Static card
  return (
    <View
      style={[cardStyle, variantStyles, glowStyle, style]}
      accessibilityLabel={accessibilityLabel}
    >
      {content}
    </View>
  );
};

// ============================================================================
// ELITE GLASS CARD - Specialized glass variant
// ============================================================================
interface EliteGlassCardProps extends Omit<EliteCardProps, 'variant'> {
  blur?: 'light' | 'heavy';
}

export const EliteGlassCard: React.FC<EliteGlassCardProps> = ({
  blur = 'light',
  ...props
}) => {
  const { isDark } = useTheme();
  
  const glassConfig = isDark ? ELITE_GLASS.dark : ELITE_GLASS.light;

  return (
    <EliteCard
      {...props}
      variant="glass"
      style={[
        {
          backgroundColor: glassConfig.backgroundColor,
          borderWidth: 1,
          borderColor: glassConfig.borderColor,
        },
        props.style,
      ]}
    />
  );
};

// ============================================================================
// ELITE SURFACE - Minimal container with subtle depth
// ============================================================================
interface EliteSurfaceProps {
  children: React.ReactNode;
  level?: 0 | 1 | 2 | 3;
  padding?: CardPadding;
  borderRadius?: keyof typeof ELITE_RADIUS;
  style?: ViewStyle;
}

export const EliteSurface: React.FC<EliteSurfaceProps> = ({
  children,
  level = 1,
  padding = 'default',
  borderRadius = 'lg',
  style,
}) => {
  const { colors, isDark } = useTheme();

  const getSurfaceColor = () => {
    if (isDark) {
      const colors = ['#0F172A', '#1E293B', '#334155', '#475569'];
      return colors[level] || colors[1];
    }
    const colors = ['#FFFFFF', '#F8FAFC', '#F1F5F9', '#E2E8F0'];
    return colors[level] || colors[1];
  };

  return (
    <View
      style={[
        {
          backgroundColor: getSurfaceColor(),
          padding: PADDING_CONFIG[padding],
          borderRadius: ELITE_RADIUS[borderRadius],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

// ============================================================================
// ELITE LIST CARD - Card optimized for list items
// ============================================================================
interface EliteListCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  showChevron?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export const EliteListCard: React.FC<EliteListCardProps> = ({
  children,
  onPress,
  leftContent,
  rightContent,
  showChevron = false,
  style,
  accessibilityLabel,
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    if (onPress) {
      Haptics.light();
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        ...ELITE_MOTION.spring.snappy,
      }).start();
    }
  }, [onPress, scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...ELITE_MOTION.spring.default,
    }).start();
  }, [scaleAnim]);

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={accessibilityLabel}
        style={[
          styles.listCard,
          {
            backgroundColor: colors.card,
          },
        ]}
        android_ripple={
          onPress ? { color: colors.primary + '15', borderless: false } : undefined
        }
      >
        {leftContent && (
          <View style={styles.listCardLeft}>{leftContent}</View>
        )}
        
        <View style={styles.listCardContent}>{children}</View>
        
        {(rightContent || showChevron) && (
          <View style={styles.listCardRight}>
            {rightContent}
            {showChevron && (
              <View style={styles.chevron}>
                <View
                  style={[
                    styles.chevronArrow,
                    { borderColor: colors.textSecondary },
                  ]}
                />
              </View>
            )}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

// ============================================================================
// ELITE FEATURE CARD - Highlighted card for promotions/features
// ============================================================================
interface EliteFeatureCardProps {
  children: React.ReactNode;
  gradient?: string[];
  onPress?: () => void;
  style?: ViewStyle;
}

export const EliteFeatureCard: React.FC<EliteFeatureCardProps> = ({
  children,
  gradient,
  onPress,
  style,
}) => {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const defaultGradient = isDark
    ? ['#1E293B', '#0F172A']
    : [colors.primary, colors.primaryDark];

  const handlePressIn = useCallback(() => {
    if (onPress) {
      Haptics.light();
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        useNativeDriver: true,
        ...ELITE_MOTION.spring.snappy,
      }).start();
    }
  }, [onPress, scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...ELITE_MOTION.spring.default,
    }).start();
  }, [scaleAnim]);

  // Since we may not have LinearGradient, use solid color fallback
  const bgColor = gradient ? gradient[0] : defaultGradient[0];

  return (
    <Animated.View
      style={[
        styles.featureCard,
        ELITE_SHADOWS.colored(bgColor, 0.35),
        { transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.featureCardInner,
          { backgroundColor: bgColor },
        ]}
        android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: false }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
};

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  pressable: {
    flex: 1,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ELITE_SPACING[3],
    paddingHorizontal: ELITE_SPACING[4],
    borderRadius: ELITE_RADIUS.lg,
  },
  listCardLeft: {
    marginRight: ELITE_SPACING[3],
  },
  listCardContent: {
    flex: 1,
  },
  listCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: ELITE_SPACING[2],
  },
  chevron: {
    marginLeft: ELITE_SPACING[2],
    width: 8,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronArrow: {
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
    transform: [{ rotate: '45deg' }],
  },
  featureCard: {
    borderRadius: ELITE_RADIUS.xl,
    overflow: 'hidden',
  },
  featureCardInner: {
    padding: ELITE_SPACING[5],
    borderRadius: ELITE_RADIUS.xl,
  },
});

export default EliteCard;

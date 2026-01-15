/**
 * PixelPerfectCard Component
 * 
 * A high-quality card component designed to eliminate visual artifacts:
 * - Uses precise pixel-aligned values
 * - Platform-optimized shadows
 * - Proper overflow handling
 * - Consistent border rendering
 * - Smooth animations at 60fps
 */

import React, { useRef, useCallback, memo } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  ViewStyle,
  Animated,
  Platform,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import {
  PP_SPACING,
  PP_BORDERS,
  PP_SHADOWS,
  PP_MOTION,
  HAIRLINE_WIDTH,
  roundToPixel,
} from '../constants/pixel-perfect';

// ============================================================================
// TYPES
// ============================================================================

type CardVariant = 
  | 'outlined'    // Clean border, no shadow
  | 'elevated'    // Subtle shadow, no border
  | 'filled'      // Solid background, no border
  | 'glass'       // Glassmorphism (iOS optimized)
  | 'interactive' // Optimized for press interactions
  | 'flat';       // Transparent, for nested cards

type CardSize = 'compact' | 'default' | 'spacious';

interface PixelPerfectCardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  size?: CardSize;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  /** Custom border radius (must be even number) */
  borderRadius?: number;
  /** Enable press animation */
  animated?: boolean;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// SIZE CONFIG - All even values for crisp rendering
// ============================================================================

const CARD_PADDING: Record<CardSize, number> = {
  compact: PP_SPACING.cardCompact,   // 12
  default: PP_SPACING.cardDefault,   // 16
  spacious: PP_SPACING.cardSpacious, // 20
};

const DEFAULT_RADIUS = PP_BORDERS.radius.lg; // 12

// ============================================================================
// COMPONENT
// ============================================================================

export const PixelPerfectCard: React.FC<PixelPerfectCardProps> = memo(({
  children,
  variant = 'outlined',
  size = 'default',
  onPress,
  disabled = false,
  style,
  contentStyle,
  borderRadius = DEFAULT_RADIUS,
  animated = true,
  accessibilityLabel,
  testID,
}) => {
  const { colors, isDark } = useTheme();
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Press handlers with optimized spring animations
  const handlePressIn = useCallback(() => {
    if (!animated || !onPress || disabled) return;
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: PP_MOTION.scale.pressed,
        useNativeDriver: true,
        ...PP_MOTION.spring.snappy,
      }),
      Animated.timing(opacityAnim, {
        toValue: PP_MOTION.opacity.pressed,
        duration: PP_MOTION.duration.fast,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animated, onPress, disabled, scaleAnim, opacityAnim]);

  const handlePressOut = useCallback(() => {
    if (!animated || !onPress || disabled) return;
    
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
  }, [animated, onPress, disabled, scaleAnim, opacityAnim]);

  // Get variant-specific styles
  const getVariantStyle = (): ViewStyle => {
    const baseBackground = colors.card || '#FFFFFF';
    const borderColor = colors.border || '#E5E7EB';
    const darkBackground = colors.background || '#1F2937';

    switch (variant) {
      case 'flat':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };

      case 'filled':
        return {
          backgroundColor: isDark 
            ? `${colors.primary}10` 
            : '#F9FAFB',
          borderWidth: 0,
        };

      case 'elevated':
        return {
          backgroundColor: baseBackground,
          borderWidth: isDark ? PP_BORDERS.width.thin : 0,
          borderColor: isDark ? borderColor : 'transparent',
          ...PP_SHADOWS.sm,
        };

      case 'glass':
        const glassStyle: ViewStyle = {
          backgroundColor: Platform.OS === 'ios'
            ? (isDark ? 'rgba(31, 41, 55, 0.85)' : 'rgba(255, 255, 255, 0.85)')
            : (isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)'),
          borderWidth: PP_BORDERS.width.thin,
          borderColor: Platform.OS === 'ios'
            ? (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)')
            : borderColor,
        };
        if (Platform.OS === 'ios') {
          Object.assign(glassStyle, PP_SHADOWS.md);
        } else {
          glassStyle.elevation = 4;
        }
        return glassStyle;

      case 'interactive':
        return {
          backgroundColor: baseBackground,
          borderWidth: PP_BORDERS.width.thin,
          borderColor: borderColor,
          // No shadow by default, scale provides feedback
        };

      case 'outlined':
      default:
        return {
          backgroundColor: baseBackground,
          borderWidth: PP_BORDERS.width.thin,
          borderColor: borderColor,
        };
    }
  };

  // Ensure border radius is pixel-aligned
  const radiusValue = roundToPixel(borderRadius);

  // Build card style
  const cardStyle: ViewStyle = {
    ...getVariantStyle(),
    padding: CARD_PADDING[size],
    borderRadius: radiusValue,
    opacity: disabled ? PP_MOTION.opacity.disabled : 1,
    overflow: 'hidden', // Critical for clean rendering
  };

  // Content wrapper
  const content = (
    <View style={[styles.content, contentStyle]}>
      {children}
    </View>
  );

  // Interactive card
  if (onPress) {
    return (
      <Animated.View
        style={[
          cardStyle,
          style,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
        testID={testID}
      >
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          style={styles.pressable}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityState={{ disabled }}
          android_ripple={Platform.OS === 'android' ? {
            color: `${colors.primary}15`,
            borderless: false,
            foreground: true,
          } : undefined}
        >
          {content}
        </Pressable>
      </Animated.View>
    );
  }

  // Static card
  return (
    <View
      style={[cardStyle, style]}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    >
      {content}
    </View>
  );
});

// ============================================================================
// SPECIALIZED CARD VARIANTS
// ============================================================================

/** Clean outlined card - best for lists */
export const PPOutlinedCard: React.FC<Omit<PixelPerfectCardProps, 'variant'>> = memo((props) => (
  <PixelPerfectCard {...props} variant="outlined" />
));

/** Elevated card with shadow */
export const PPElevatedCard: React.FC<Omit<PixelPerfectCardProps, 'variant'>> = memo((props) => (
  <PixelPerfectCard {...props} variant="elevated" />
));

/** Glass morphism card (iOS optimized) */
export const PPGlassCard: React.FC<Omit<PixelPerfectCardProps, 'variant'>> = memo((props) => (
  <PixelPerfectCard {...props} variant="glass" />
));

/** Optimized for press interactions */
export const PPInteractiveCard: React.FC<Omit<PixelPerfectCardProps, 'variant'>> = memo((props) => (
  <PixelPerfectCard {...props} variant="interactive" />
));

/** Transparent card for nesting */
export const PPFlatCard: React.FC<Omit<PixelPerfectCardProps, 'variant'>> = memo((props) => (
  <PixelPerfectCard {...props} variant="flat" />
));

// ============================================================================
// LIST ITEM CARD - Optimized for lists
// ============================================================================

interface PPListItemCardProps extends Omit<PixelPerfectCardProps, 'size' | 'variant'> {
  isLastItem?: boolean;
}

export const PPListItemCard: React.FC<PPListItemCardProps> = memo(({
  isLastItem = false,
  style,
  ...props
}) => {
  const combinedStyle: ViewStyle = {
    ...((style as ViewStyle) || {}),
    ...(!isLastItem ? { marginBottom: PP_SPACING.listItemGap } : {}),
  };
  return (
    <PixelPerfectCard
      {...props}
      variant="outlined"
      size="compact"
      borderRadius={PP_BORDERS.radius.md}
      style={combinedStyle}
    />
  );
});

// ============================================================================
// FEATURE CARD - For highlighted content
// ============================================================================

interface PPFeatureCardProps extends Omit<PixelPerfectCardProps, 'size'> {
  accentColor?: string;
  accentPosition?: 'left' | 'top';
}

export const PPFeatureCard: React.FC<PPFeatureCardProps> = memo(({
  accentColor,
  accentPosition = 'left',
  style,
  children,
  ...props
}) => {
  const combinedStyle: ViewStyle = {
    ...((style as ViewStyle) || {}),
    ...(accentColor ? (
      accentPosition === 'left' 
        ? { borderLeftWidth: 3, borderLeftColor: accentColor }
        : { borderTopWidth: 3, borderTopColor: accentColor }
    ) : {}),
  };

  return (
    <PixelPerfectCard
      {...props}
      size="spacious"
      borderRadius={PP_BORDERS.radius.xl}
      style={combinedStyle}
    >
      {children}
    </PixelPerfectCard>
  );
});

// ============================================================================
// STATS CARD - For metrics display
// ============================================================================

interface PPStatsCardProps {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  valueColor?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export const PPStatsCard: React.FC<PPStatsCardProps> = memo(({
  value,
  label,
  icon,
  valueColor,
  onPress,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <PixelPerfectCard
      variant="outlined"
      size="default"
      onPress={onPress}
      style={style}
    >
      <View style={styles.statsContent}>
        {icon && <View style={styles.statsIcon}>{icon}</View>}
        <View style={styles.statsText}>
          <Animated.Text
            style={[
              styles.statsValue,
              { color: valueColor || colors.primary },
            ]}
          >
            {value}
          </Animated.Text>
          <Animated.Text
            style={[
              styles.statsLabel,
              { color: colors.textSecondary },
            ]}
          >
            {label}
          </Animated.Text>
        </View>
      </View>
    </PixelPerfectCard>
  );
});

// ============================================================================
// HORIZONTAL CARD - Image + content side by side
// ============================================================================

interface PPHorizontalCardProps extends Omit<PixelPerfectCardProps, 'size'> {
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
}

export const PPHorizontalCard: React.FC<PPHorizontalCardProps> = memo(({
  leftContent,
  rightContent,
  children,
  ...props
}) => {
  return (
    <PixelPerfectCard {...props} size="compact">
      <View style={styles.horizontalWrapper}>
        {leftContent && <View style={styles.horizontalLeft}>{leftContent}</View>}
        <View style={styles.horizontalCenter}>{children}</View>
        {rightContent && <View style={styles.horizontalRight}>{rightContent}</View>}
      </View>
    </PixelPerfectCard>
  );
});

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
  // Stats card
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsIcon: {
    marginRight: PP_SPACING.sm,
  },
  statsText: {
    flex: 1,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  statsLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
    lineHeight: 18,
  },
  // Horizontal card
  horizontalWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  horizontalLeft: {
    marginRight: PP_SPACING.sm,
  },
  horizontalCenter: {
    flex: 1,
  },
  horizontalRight: {
    marginLeft: PP_SPACING.sm,
  },
});

// Display names for debugging
PixelPerfectCard.displayName = 'PixelPerfectCard';
PPOutlinedCard.displayName = 'PPOutlinedCard';
PPElevatedCard.displayName = 'PPElevatedCard';
PPGlassCard.displayName = 'PPGlassCard';
PPInteractiveCard.displayName = 'PPInteractiveCard';
PPFlatCard.displayName = 'PPFlatCard';
PPListItemCard.displayName = 'PPListItemCard';
PPFeatureCard.displayName = 'PPFeatureCard';
PPStatsCard.displayName = 'PPStatsCard';
PPHorizontalCard.displayName = 'PPHorizontalCard';

export default PixelPerfectCard;

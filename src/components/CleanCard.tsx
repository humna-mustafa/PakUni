/**
 * CleanCard Component - 2025 Design Standards
 * 
 * A minimal, content-focused card component that prioritizes:
 * - Clean borders over heavy shadows
 * - Subtle hover/press states
 * - Clear visual hierarchy
 * - Accessibility compliance
 * 
 * Philosophy: The card should be invisible - only the content matters
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
  CLEAN_SPACING,
  CLEAN_RADIUS,
  CLEAN_SHADOWS,
  CLEAN_SHADOWS_DARK,
  CLEAN_MOTION,
  CLEAN_COLORS,
  CLEAN_COLORS_DARK,
} from '../constants/clean-design-2025';

// ============================================================================
// TYPES
// ============================================================================

type CardVariant = 
  | 'default'      // Border + subtle shadow on press
  | 'flat'         // No border, no shadow (for nested cards)
  | 'outlined'     // Border only, no shadow
  | 'elevated'     // Subtle shadow (use sparingly)
  | 'interactive'; // Designed for clickable cards

type CardSize = 'compact' | 'default' | 'spacious';

interface CleanCardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  size?: CardSize;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  contentStyle?: ViewStyle;
  /** Whether to animate on press (default: true for interactive) */
  animated?: boolean;
  /** Custom border radius */
  borderRadius?: keyof typeof CLEAN_RADIUS | number;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Accessibility hint */
  accessibilityHint?: string;
  /** Test ID for automation */
  testID?: string;
}

// ============================================================================
// SIZE CONFIGURATIONS
// ============================================================================

const CARD_PADDING: Record<CardSize, number> = {
  compact: CLEAN_SPACING[3],   // 12px
  default: CLEAN_SPACING[4],   // 16px
  spacious: CLEAN_SPACING[5],  // 20px
};

// ============================================================================
// COMPONENT
// ============================================================================

export const CleanCard: React.FC<CleanCardProps> = memo(({
  children,
  variant = 'default',
  size = 'default',
  onPress,
  disabled = false,
  style,
  contentStyle,
  animated = true,
  borderRadius = 'lg',
  accessibilityLabel,
  accessibilityHint,
  testID,
}) => {
  const { colors, isDark } = useTheme();
  const shadows = isDark ? CLEAN_SHADOWS_DARK : CLEAN_SHADOWS;
  const palette = isDark ? CLEAN_COLORS_DARK : CLEAN_COLORS;
  
  // Animation refs
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Press handlers for interactive states
  const handlePressIn = useCallback(() => {
    if (!animated || !onPress) return;
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        ...CLEAN_MOTION.spring.snappy,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.85,
        duration: CLEAN_MOTION.duration.fast,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animated, onPress, scaleAnim, opacityAnim]);

  const handlePressOut = useCallback(() => {
    if (!animated || !onPress) return;
    
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
  }, [animated, onPress, scaleAnim, opacityAnim]);

  // Get variant-specific styles
  const getVariantStyle = (): ViewStyle => {
    const baseBackground = colors.card || palette.neutral[0];
    const borderColor = colors.border || palette.neutral[200];
    
    switch (variant) {
      case 'flat':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
        
      case 'outlined':
        return {
          backgroundColor: baseBackground,
          borderWidth: 1,
          borderColor: borderColor,
        };
        
      case 'elevated':
        return {
          backgroundColor: baseBackground,
          borderWidth: isDark ? 1 : 0,
          borderColor: isDark ? borderColor : 'transparent',
          ...shadows.sm,
        };
        
      case 'interactive':
        return {
          backgroundColor: baseBackground,
          borderWidth: 1,
          borderColor: borderColor,
          // Subtle shadow only, main feedback comes from scale/opacity
        };
        
      default: // 'default'
        return {
          backgroundColor: baseBackground,
          borderWidth: 1,
          borderColor: borderColor,
        };
    }
  };

  // Calculate border radius
  const radiusValue = typeof borderRadius === 'number' 
    ? borderRadius 
    : CLEAN_RADIUS[borderRadius];

  // Build card style
  const cardStyle: ViewStyle = {
    ...getVariantStyle(),
    padding: CARD_PADDING[size],
    borderRadius: radiusValue,
    opacity: disabled ? 0.5 : 1,
    overflow: 'hidden',
  };

  // Render content
  const content = (
    <View style={[styles.content, contentStyle]}>
      {children}
    </View>
  );

  // Interactive card (with press handling)
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
          accessibilityHint={accessibilityHint}
          accessibilityState={{ disabled }}
          android_ripple={{
            color: `${palette.neutral[400]}20`,
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
      style={[cardStyle, style]} 
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    >
      {content}
    </View>
  );
});

// ============================================================================
// SPECIALIZED CARD VARIANTS (Convenience exports)
// ============================================================================

/** Card with border only, no elevation */
export const OutlinedCard: React.FC<Omit<CleanCardProps, 'variant'>> = memo((props) => (
  <CleanCard {...props} variant="outlined" />
));

/** Card with subtle shadow elevation */
export const ElevatedCard2025: React.FC<Omit<CleanCardProps, 'variant'>> = memo((props) => (
  <CleanCard {...props} variant="elevated" />
));

/** Transparent card for nested content */
export const FlatCard: React.FC<Omit<CleanCardProps, 'variant'>> = memo((props) => (
  <CleanCard {...props} variant="flat" />
));

/** Optimized for press interactions */
export const InteractiveCard: React.FC<Omit<CleanCardProps, 'variant'>> = memo((props) => (
  <CleanCard {...props} variant="interactive" />
));

// ============================================================================
// LIST ITEM CARD - Optimized for list contexts
// ============================================================================

interface ListItemCardProps extends Omit<CleanCardProps, 'size' | 'variant'> {
  /** Add bottom margin for list spacing */
  isLastItem?: boolean;
}

export const ListItemCard: React.FC<ListItemCardProps> = memo(({
  isLastItem = false,
  style,
  ...props
}) => (
  <CleanCard
    {...props}
    variant="outlined"
    size="compact"
    borderRadius="md"
    style={[
      style,
      !isLastItem ? { marginBottom: CLEAN_SPACING.listItemGap } : undefined,
    ].filter(Boolean) as ViewStyle[]}
  />
));

// ============================================================================
// FEATURE CARD - For highlighted content
// ============================================================================

interface FeatureCardProps extends Omit<CleanCardProps, 'size'> {
  /** Optional accent color for left border */
  accentColor?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = memo(({
  accentColor,
  style,
  children,
  ...props
}) => {
  const { colors, isDark } = useTheme();
  
  return (
    <CleanCard
      {...props}
      size="spacious"
      borderRadius="xl"
      style={[
        style,
        accentColor ? {
          borderLeftWidth: 3,
          borderLeftColor: accentColor,
        } : undefined,
      ].filter(Boolean) as ViewStyle[]}
    >
      {children}
    </CleanCard>
  );
});

// ============================================================================
// STATS CARD - For displaying metrics
// ============================================================================

interface StatsCardProps {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  onPress?: () => void;
  style?: ViewStyle;
}

export const StatsCard: React.FC<StatsCardProps> = memo(({
  value,
  label,
  icon,
  trend,
  onPress,
  style,
}) => {
  const { colors, isDark } = useTheme();
  const palette = isDark ? CLEAN_COLORS_DARK : CLEAN_COLORS;
  
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return palette.semantic.success.main;
      case 'down': return palette.semantic.error.main;
      default: return colors.textSecondary;
    }
  };

  return (
    <CleanCard
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
              { color: colors.text || palette.neutral[800] },
            ]}
          >
            {value}
          </Animated.Text>
          <Animated.Text
            style={[
              styles.statsLabel,
              { color: colors.textSecondary || palette.neutral[500] },
            ]}
          >
            {label}
          </Animated.Text>
        </View>
      </View>
    </CleanCard>
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
  // Stats card styles
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsIcon: {
    marginRight: CLEAN_SPACING[3],
  },
  statsText: {
    flex: 1,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  statsLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
});

// Set display names for debugging
CleanCard.displayName = 'CleanCard';
OutlinedCard.displayName = 'OutlinedCard';
ElevatedCard2025.displayName = 'ElevatedCard2025';
FlatCard.displayName = 'FlatCard';
InteractiveCard.displayName = 'InteractiveCard';
ListItemCard.displayName = 'ListItemCard';
FeatureCard.displayName = 'FeatureCard';
StatsCard.displayName = 'StatsCard';

export default CleanCard;

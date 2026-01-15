/**
 * PremiumCard Component
 * Production-ready card with glassmorphism, shadows, and micro-interactions
 */

import React, {useRef, useCallback} from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  ViewStyle,
  Animated,
  Platform,
} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import {RADIUS, SPACING, SHADOWS, ANIMATION} from '../constants/design';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'glass' | 'filled' | 'gradient';
type CardSize = 'compact' | 'default' | 'spacious';

interface PremiumCardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  size?: CardSize;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  borderRadius?: keyof typeof RADIUS;
  shadowLevel?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  glowColor?: string;
}

const SIZE_PADDING: Record<CardSize, number> = {
  compact: SPACING[3],
  default: SPACING[4],
  spacious: SPACING[6],
};

export const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  variant = 'default',
  size = 'default',
  onPress,
  disabled = false,
  style,
  contentStyle,
  borderRadius = 'xl',
  shadowLevel = 'md',
  animated = true,
  glowColor,
}) => {
  const {colors, isDark} = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    if (!animated || !onPress) return;
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        ...ANIMATION.spring.snappy,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.92,
        duration: ANIMATION.duration.fast,
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
        ...ANIMATION.spring.default,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: ANIMATION.duration.fast,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animated, onPress, scaleAnim, opacityAnim]);

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.card,
          ...SHADOWS.soft[shadowLevel === 'none' ? 'xs' : shadowLevel as keyof typeof SHADOWS.soft],
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
            ? 'rgba(15, 23, 42, 0.85)' 
            : 'rgba(255, 255, 255, 0.82)',
          borderWidth: 1.5,
          borderColor: isDark 
            ? 'rgba(148, 163, 184, 0.15)' 
            : 'rgba(255, 255, 255, 0.7)',
          ...(Platform.OS === 'ios' && SHADOWS.glass),
          // Enhanced elevation for glassmorphism effect
          shadowColor: isDark ? '#1E293B' : '#94A3B8',
          shadowOffset: {width: 0, height: 8},
          shadowOpacity: isDark ? 0.4 : 0.15,
          shadowRadius: 16,
          elevation: 6,
        };
      case 'filled':
        return {
          backgroundColor: colors.background,
        };
      case 'gradient':
        return {
          backgroundColor: colors.primaryLight,
          borderWidth: 1,
          borderColor: colors.primary + '20',
        };
      default:
        return {
          backgroundColor: colors.card,
          ...(shadowLevel !== 'none' && SHADOWS.soft[shadowLevel as keyof typeof SHADOWS.soft]),
        };
    }
  };

  const cardStyle: ViewStyle = {
    ...getVariantStyle(),
    padding: SIZE_PADDING[size],
    borderRadius: RADIUS[borderRadius],
    opacity: disabled ? 0.5 : 1,
    overflow: 'hidden',
  };

  // Add glow effect if specified
  const glowStyle: ViewStyle | null = glowColor ? {
    shadowColor: glowColor,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  } : null;

  const content = (
    <View style={[styles.content, contentStyle]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Animated.View
        style={[
          cardStyle,
          glowStyle,
          style,
          {
            transform: [{scale: scaleAnim}],
            opacity: opacityAnim,
          },
        ]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          style={styles.pressable}
          accessibilityRole="button"
          accessibilityState={{disabled}}>
          {content}
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <View style={[cardStyle, glowStyle, style]}>
      {content}
    </View>
  );
};

// Specialized card variants
export const GlassCard: React.FC<Omit<PremiumCardProps, 'variant'>> = (props) => (
  <PremiumCard {...props} variant="glass" />
);

export const ElevatedCard: React.FC<Omit<PremiumCardProps, 'variant'>> = (props) => (
  <PremiumCard {...props} variant="elevated" />
);

export const OutlinedCard: React.FC<Omit<PremiumCardProps, 'variant'>> = (props) => (
  <PremiumCard {...props} variant="outlined" />
);

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  pressable: {
    flex: 1,
  },
});

export default PremiumCard;

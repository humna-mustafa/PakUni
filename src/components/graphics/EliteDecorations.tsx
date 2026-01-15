/**
 * Elite Decorative Components
 * Premium badges, tags, dividers, and decorative elements
 */

import React, { memo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { TYPOGRAPHY, RADIUS, SPACING, ANIMATION } from '../../constants/design';
import Icon from '../icons/Icon';

// Try to import LinearGradient
let LinearGradient: React.ComponentType<any>;
try {
  LinearGradient = require('react-native-linear-gradient').default;
} catch (e) {
  LinearGradient = ({ children, colors, style, ...props }: any) => (
    <View style={[style, { backgroundColor: colors?.[0] || '#1A7AEB' }]} {...props}>
      {children}
    </View>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// PREMIUM BADGE - For status indicators
// ============================================================================

type BadgeVariant = 'solid' | 'outline' | 'gradient' | 'glow' | 'glass';
type BadgeColor = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'gold' | 'purple' | 'teal';
type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

interface PremiumBadgeProps {
  label: string;
  variant?: BadgeVariant;
  color?: BadgeColor;
  size?: BadgeSize;
  icon?: string;
  iconFamily?: 'Ionicons' | 'MaterialCommunityIcons' | 'Feather';
  pulse?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const BADGE_COLORS = {
  primary: { bg: '#1A7AEB', light: '#E3F2FD', gradient: ['#1A7AEB', '#0F62CC'] },
  success: { bg: '#22C55E', light: '#DCFCE7', gradient: ['#22C55E', '#16A34A'] },
  warning: { bg: '#F59E0B', light: '#FEF3C7', gradient: ['#F59E0B', '#D97706'] },
  error: { bg: '#EF4444', light: '#FEE2E2', gradient: ['#EF4444', '#DC2626'] },
  info: { bg: '#3B82F6', light: '#DBEAFE', gradient: ['#3B82F6', '#2563EB'] },
  gold: { bg: '#D97706', light: '#FEF3C7', gradient: ['#F59E0B', '#D97706', '#B45309'] },
  purple: { bg: '#8B5CF6', light: '#F3E8FF', gradient: ['#8B5CF6', '#7C3AED'] },
  teal: { bg: '#14B8A6', light: '#CCFBF1', gradient: ['#14B8A6', '#0D9488'] },
};

const BADGE_SIZES = {
  xs: { paddingH: 6, paddingV: 2, fontSize: 9, iconSize: 10 },
  sm: { paddingH: 8, paddingV: 3, fontSize: 10, iconSize: 12 },
  md: { paddingH: 10, paddingV: 4, fontSize: 11, iconSize: 14 },
  lg: { paddingH: 12, paddingV: 5, fontSize: 12, iconSize: 16 },
};

export const PremiumBadge = memo(({
  label,
  variant = 'solid',
  color = 'primary',
  size = 'md',
  icon,
  iconFamily = 'Ionicons',
  pulse = false,
  style,
  textStyle,
}: PremiumBadgeProps) => {
  const { isDark } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const colorConfig = BADGE_COLORS[color];
  const sizeConfig = BADGE_SIZES[size];

  useEffect(() => {
    if (pulse) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [pulse]);

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: colorConfig.bg,
          },
          text: { color: colorConfig.bg },
        };
      case 'glow':
        return {
          container: {
            backgroundColor: colorConfig.light,
            shadowColor: colorConfig.bg,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 8,
            elevation: 6,
          },
          text: { color: colorConfig.bg },
        };
      case 'glass':
        return {
          container: {
            backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.8)',
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.5)',
          },
          text: { color: isDark ? '#FFFFFF' : colorConfig.bg },
        };
      case 'gradient':
        return {
          container: {},
          text: { color: '#FFFFFF' },
        };
      case 'solid':
      default:
        return {
          container: { backgroundColor: colorConfig.bg },
          text: { color: '#FFFFFF' },
        };
    }
  };

  const variantStyles = getVariantStyles();

  const badgeContent = (
    <View style={styles.badgeContent}>
      {icon && (
        <Icon
          name={icon}
          family={iconFamily}
          size={sizeConfig.iconSize}
          color={variantStyles.text.color as string}
        />
      )}
      <Text
        style={[
          styles.badgeText,
          {
            fontSize: sizeConfig.fontSize,
            marginLeft: icon ? 4 : 0,
          },
          variantStyles.text,
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );

  const containerStyle: ViewStyle = {
    paddingHorizontal: sizeConfig.paddingH,
    paddingVertical: sizeConfig.paddingV,
    borderRadius: RADIUS.full,
    ...variantStyles.container,
  };

  if (variant === 'gradient') {
    return (
      <Animated.View style={[{ transform: [{ scale: pulseAnim }] }, style]}>
        <LinearGradient
          colors={colorConfig.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.badge, containerStyle]}
        >
          {badgeContent}
        </LinearGradient>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[styles.badge, containerStyle, { transform: [{ scale: pulseAnim }] }, style]}
    >
      {badgeContent}
    </Animated.View>
  );
});

// ============================================================================
// PREMIUM LIVE DOT - Animated status indicator
// ============================================================================

interface LiveDotProps {
  color?: string;
  size?: number;
  animated?: boolean;
  style?: ViewStyle;
}

export const LiveDot = memo(({
  color = '#22C55E',
  size = 8,
  animated = true,
  style,
}: LiveDotProps) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (animated) {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, { toValue: 2, duration: 1000, useNativeDriver: true }),
            Animated.timing(pulseAnim, { toValue: 1, duration: 0, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(opacityAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
            Animated.timing(opacityAnim, { toValue: 0.6, duration: 0, useNativeDriver: true }),
          ]),
        ])
      ).start();
    }
  }, [animated]);

  return (
    <View style={[styles.liveDotContainer, { width: size * 2.5, height: size * 2.5 }, style]}>
      {animated && (
        <Animated.View
          style={[
            styles.liveDotPulse,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
              transform: [{ scale: pulseAnim }],
              opacity: opacityAnim,
            },
          ]}
        />
      )}
      <View
        style={[
          styles.liveDotCore,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 4,
          },
        ]}
      />
    </View>
  );
});

// ============================================================================
// GRADIENT DIVIDER - Premium section separator
// ============================================================================

interface GradientDividerProps {
  gradient?: string[];
  height?: number;
  marginVertical?: number;
  style?: ViewStyle;
}

export const GradientDivider = memo(({
  gradient = ['transparent', '#CBD5E1', 'transparent'],
  height = 1,
  marginVertical = 16,
  style,
}: GradientDividerProps) => {
  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.gradientDivider, { height, marginVertical }, style]}
    />
  );
});

// ============================================================================
// FEATURE TAG - For highlighting features
// ============================================================================

interface FeatureTagProps {
  label: string;
  icon?: string;
  iconFamily?: 'Ionicons' | 'MaterialCommunityIcons' | 'Feather';
  gradient?: string[];
  style?: ViewStyle;
}

export const FeatureTag = memo(({
  label,
  icon,
  iconFamily = 'Ionicons',
  gradient = ['#667eea', '#764ba2'],
  style,
}: FeatureTagProps) => {
  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.featureTag, style]}
    >
      {icon && (
        <Icon
          name={icon}
          family={iconFamily}
          size={12}
          color="#FFFFFF"
        />
      )}
      <Text style={[styles.featureTagText, icon && { marginLeft: 4 }]}>
        {label}
      </Text>
    </LinearGradient>
  );
});

// ============================================================================
// DECORATIVE PATTERN - Background pattern effect
// ============================================================================

interface DecorativePatternProps {
  type?: 'dots' | 'grid' | 'circles';
  color?: string;
  opacity?: number;
  style?: ViewStyle;
}

export const DecorativePattern = memo(({
  type = 'dots',
  color = '#94A3B8',
  opacity = 0.1,
  style,
}: DecorativePatternProps) => {
  const renderPattern = () => {
    switch (type) {
      case 'dots':
        return Array.from({ length: 35 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.patternDot,
              {
                backgroundColor: color,
                left: (i % 7) * 20,
                top: Math.floor(i / 7) * 20,
              },
            ]}
          />
        ));
      case 'circles':
        return (
          <>
            <View style={[styles.patternCircle, { borderColor: color, width: 80, height: 80, top: -20, right: -20 }]} />
            <View style={[styles.patternCircle, { borderColor: color, width: 120, height: 120, top: -40, right: -40 }]} />
            <View style={[styles.patternCircle, { borderColor: color, width: 60, height: 60, bottom: -10, left: 20 }]} />
          </>
        );
      case 'grid':
        return (
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <View
                key={`h${i}`}
                style={[
                  styles.patternLine,
                  { backgroundColor: color, top: i * 25, width: '100%', height: 1 },
                ]}
              />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <View
                key={`v${i}`}
                style={[
                  styles.patternLine,
                  { backgroundColor: color, left: i * 25, width: 1, height: '100%' },
                ]}
              />
            ))}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.patternContainer, { opacity }, style]} pointerEvents="none">
      {renderPattern()}
    </View>
  );
});

// ============================================================================
// STATS HIGHLIGHT - For key metrics
// ============================================================================

interface StatsHighlightProps {
  value: string;
  label: string;
  icon?: string;
  iconFamily?: 'Ionicons' | 'MaterialCommunityIcons' | 'Feather';
  color?: string;
  gradient?: string[];
  style?: ViewStyle;
}

export const StatsHighlight = memo(({
  value,
  label,
  icon,
  iconFamily = 'Ionicons',
  color = '#1A7AEB',
  gradient,
  style,
}: StatsHighlightProps) => {
  const { colors, isDark } = useTheme();

  const content = (
    <>
      {icon && (
        <View style={[styles.statsIcon, { backgroundColor: `${color}15` }]}>
          <Icon name={icon} family={iconFamily} size={20} color={gradient ? '#FFFFFF' : color} />
        </View>
      )}
      <Text style={[styles.statsValue, { color: gradient ? '#FFFFFF' : color }]}>
        {value}
      </Text>
      <Text style={[styles.statsLabel, { color: gradient ? 'rgba(255,255,255,0.8)' : colors.textSecondary }]}>
        {label}
      </Text>
    </>
  );

  if (gradient) {
    return (
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.statsHighlight, style]}
      >
        {content}
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        styles.statsHighlight,
        {
          backgroundColor: isDark ? colors.card : '#FFFFFF',
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {content}
    </View>
  );
});

// ============================================================================
// SHIMMER LINE - Premium loading effect
// ============================================================================

interface ShimmerLineProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const ShimmerLine = memo(({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}: ShimmerLineProps) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const { colors, isDark } = useTheme();

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  return (
    <View
      style={[
        styles.shimmerLine,
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: isDark ? '#334155' : '#E2E8F0',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmerGlow,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            'transparent',
            isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
});

// ============================================================================
// PREMIUM CHIP - For tags and filters
// ============================================================================

interface PremiumChipProps {
  label: string;
  icon?: string;
  iconFamily?: 'Ionicons' | 'MaterialCommunityIcons' | 'Feather';
  selected?: boolean;
  onPress?: () => void;
  color?: string;
  style?: ViewStyle;
}

export const PremiumChip = memo(({
  label,
  icon,
  iconFamily = 'Ionicons',
  selected = false,
  onPress,
  color = '#1A7AEB',
  style,
}: PremiumChipProps) => {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      ...ANIMATION.spring.snappy,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...ANIMATION.spring.default,
    }).start();
  };

  if (selected) {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
        <LinearGradient
          colors={[color, `${color}DD`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.premiumChipSelected}
        >
          {icon && <Icon name={icon} family={iconFamily} size={14} color="#FFFFFF" />}
          <Text style={[styles.premiumChipText, { color: '#FFFFFF', marginLeft: icon ? 4 : 0 }]}>
            {label}
          </Text>
        </LinearGradient>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.premiumChip,
        {
          backgroundColor: isDark ? colors.card : '#FFFFFF',
          borderColor: colors.border,
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      {icon && <Icon name={icon} family={iconFamily} size={14} color={colors.textSecondary} />}
      <Text style={[styles.premiumChipText, { color: colors.text, marginLeft: icon ? 4 : 0 }]}>
        {label}
      </Text>
    </Animated.View>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
  },
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  liveDotContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveDotPulse: {
    position: 'absolute',
  },
  liveDotCore: {},
  gradientDivider: {
    width: '100%',
  },
  featureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  featureTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  patternContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  patternDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  patternCircle: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
  },
  patternLine: {
    position: 'absolute',
  },
  statsHighlight: {
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    minWidth: 100,
  },
  statsIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statsLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  shimmerLine: {
    overflow: 'hidden',
  },
  shimmerGlow: {
    ...StyleSheet.absoluteFillObject,
    width: 100,
  },
  premiumChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  premiumChipSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  premiumChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default {
  PremiumBadge,
  LiveDot,
  GradientDivider,
  FeatureTag,
  DecorativePattern,
  StatsHighlight,
  ShimmerLine,
  PremiumChip,
};

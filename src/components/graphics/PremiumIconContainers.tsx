/**
 * Premium Icon Containers
 * High-quality icon backgrounds with gradients, glow effects, and modern styling
 */

import React, { memo, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Animated,
  Pressable,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { RADIUS, SHADOWS, ANIMATION } from '../../constants/design';
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

// ============================================================================
// ICON CONTAINER PRESETS
// ============================================================================

export const ICON_PRESETS = {
  // Feature categories with professional colors
  education: {
    gradient: ['#1976D2', '#1565C0'],
    glow: '#1976D2',
    bg: '#1976D215',
    icon: '#1976D2',
  },
  calculator: {
    gradient: ['#2E7D32', '#1B5E20'],
    glow: '#2E7D32',
    bg: '#2E7D3215',
    icon: '#2E7D32',
  },
  scholarship: {
    gradient: ['#C62828', '#B71C1C'],
    glow: '#C62828',
    bg: '#C6282815',
    icon: '#C62828',
  },
  test: {
    gradient: ['#E65100', '#EF6C00'],
    glow: '#E65100',
    bg: '#E6510015',
    icon: '#E65100',
  },
  ai: {
    gradient: ['#7B1FA2', '#9C27B0'],
    glow: '#7B1FA2',
    bg: '#7B1FA215',
    icon: '#7B1FA2',
  },
  career: {
    gradient: ['#00838F', '#00ACC1'],
    glow: '#00838F',
    bg: '#00838F15',
    icon: '#00838F',
  },
  quiz: {
    gradient: ['#D84315', '#E64A19'],
    glow: '#D84315',
    bg: '#D8431515',
    icon: '#D84315',
  },
  kids: {
    gradient: ['#EC407A', '#F06292'],
    glow: '#EC407A',
    bg: '#EC407A15',
    icon: '#EC407A',
  },
  // Status colors
  success: {
    gradient: ['#22C55E', '#16A34A'],
    glow: '#22C55E',
    bg: '#22C55E15',
    icon: '#22C55E',
  },
  warning: {
    gradient: ['#F59E0B', '#D97706'],
    glow: '#F59E0B',
    bg: '#F59E0B15',
    icon: '#F59E0B',
  },
  error: {
    gradient: ['#EF4444', '#DC2626'],
    glow: '#EF4444',
    bg: '#EF444415',
    icon: '#EF4444',
  },
  info: {
    gradient: ['#3B82F6', '#2563EB'],
    glow: '#3B82F6',
    bg: '#3B82F615',
    icon: '#3B82F6',
  },
  // Premium accents
  gold: {
    gradient: ['#F59E0B', '#D97706', '#B45309'],
    glow: '#F59E0B',
    bg: '#F59E0B18',
    icon: '#D97706',
  },
  purple: {
    gradient: ['#8B5CF6', '#7C3AED'],
    glow: '#8B5CF6',
    bg: '#8B5CF615',
    icon: '#8B5CF6',
  },
  teal: {
    gradient: ['#14B8A6', '#0D9488'],
    glow: '#14B8A6',
    bg: '#14B8A615',
    icon: '#14B8A6',
  },
};

// ============================================================================
// TYPES
// ============================================================================

type IconPreset = keyof typeof ICON_PRESETS;
type ContainerVariant = 'solid' | 'gradient' | 'glow' | 'glass' | 'outlined' | 'floating';
type ContainerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

interface PremiumIconContainerProps {
  iconName: string;
  iconFamily?: 'Ionicons' | 'MaterialCommunityIcons' | 'Feather';
  preset?: IconPreset;
  variant?: ContainerVariant;
  size?: ContainerSize;
  customColors?: {
    gradient?: string[];
    bg?: string;
    icon?: string;
    glow?: string;
  };
  onPress?: () => void;
  animated?: boolean;
  showShadow?: boolean;
  style?: ViewStyle;
}

// Size configurations
const SIZE_CONFIG: Record<ContainerSize, { container: number; icon: number; radius: number }> = {
  xs: { container: 32, icon: 16, radius: 8 },
  sm: { container: 40, icon: 20, radius: 10 },
  md: { container: 48, icon: 24, radius: 12 },
  lg: { container: 56, icon: 28, radius: 14 },
  xl: { container: 64, icon: 32, radius: 16 },
  xxl: { container: 80, icon: 40, radius: 20 },
};

// ============================================================================
// PREMIUM ICON CONTAINER COMPONENT
// ============================================================================

export const PremiumIconContainer = memo(({
  iconName,
  iconFamily = 'Ionicons',
  preset = 'education',
  variant = 'solid',
  size = 'md',
  customColors,
  onPress,
  animated = true,
  showShadow = true,
  style,
}: PremiumIconContainerProps) => {
  const { colors: themeColors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const presetConfig = ICON_PRESETS[preset];
  
  const colorConfig = {
    gradient: customColors?.gradient || presetConfig.gradient,
    bg: customColors?.bg || presetConfig.bg,
    icon: customColors?.icon || presetConfig.icon,
    glow: customColors?.glow || presetConfig.glow,
  };

  const sizeConfig = SIZE_CONFIG[size];

  const handlePressIn = useCallback(() => {
    if (animated && onPress) {
      Animated.spring(scaleAnim, {
        toValue: 0.92,
        useNativeDriver: true,
        ...ANIMATION.spring.snappy,
      }).start();
    }
  }, [animated, onPress, scaleAnim]);

  const handlePressOut = useCallback(() => {
    if (animated && onPress) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        ...ANIMATION.spring.default,
      }).start();
    }
  }, [animated, onPress, scaleAnim]);

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'gradient':
        return {};
      case 'glow':
        return {
          backgroundColor: colorConfig.bg,
          shadowColor: colorConfig.glow,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 12,
          elevation: 8,
        };
      case 'glass':
        return {
          backgroundColor: isDark 
            ? 'rgba(255,255,255,0.1)' 
            : 'rgba(255,255,255,0.8)',
          borderWidth: 1,
          borderColor: isDark 
            ? 'rgba(255,255,255,0.15)' 
            : 'rgba(255,255,255,0.5)',
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: colorConfig.icon,
        };
      case 'floating':
        return {
          backgroundColor: isDark ? themeColors.card : '#FFFFFF',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 6,
        };
      case 'solid':
      default:
        return {
          backgroundColor: colorConfig.bg,
        };
    }
  };

  const getShadowStyle = (): ViewStyle => {
    if (!showShadow || variant === 'outlined') return {};
    return {
      shadowColor: colorConfig.glow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
    };
  };

  const containerStyle: ViewStyle = {
    width: sizeConfig.container,
    height: sizeConfig.container,
    borderRadius: sizeConfig.radius,
    ...getVariantStyle(),
    ...getShadowStyle(),
  };

  const iconColor = variant === 'gradient' ? '#FFFFFF' : colorConfig.icon;

  const renderContent = () => (
    <Icon
      name={iconName}
      family={iconFamily}
      size={sizeConfig.icon}
      color={iconColor}
    />
  );

  const renderContainer = () => {
    if (variant === 'gradient') {
      return (
        <LinearGradient
          colors={colorConfig.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.container, containerStyle, style]}
        >
          {renderContent()}
        </LinearGradient>
      );
    }

    return (
      <View style={[styles.container, containerStyle, style]}>
        {renderContent()}
      </View>
    );
  };

  if (onPress) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          {renderContainer()}
        </Pressable>
      </Animated.View>
    );
  }

  return renderContainer();
});

// ============================================================================
// GRADIENT ICON BADGE - For feature highlights
// ============================================================================

interface GradientIconBadgeProps {
  iconName: string;
  iconFamily?: 'Ionicons' | 'MaterialCommunityIcons' | 'Feather';
  gradient?: string[];
  size?: number;
  iconSize?: number;
  style?: ViewStyle;
}

export const GradientIconBadge = memo(({
  iconName,
  iconFamily = 'Ionicons',
  gradient = ['#667eea', '#764ba2'],
  size = 48,
  iconSize,
  style,
}: GradientIconBadgeProps) => {
  const calculatedIconSize = iconSize || size * 0.5;

  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.gradientBadge,
        {
          width: size,
          height: size,
          borderRadius: size * 0.28,
        },
        style,
      ]}
    >
      <Icon
        name={iconName}
        family={iconFamily}
        size={calculatedIconSize}
        color="#FFFFFF"
      />
    </LinearGradient>
  );
});

// ============================================================================
// GLOWING ICON CIRCLE - For prominent features
// ============================================================================

interface GlowingIconCircleProps {
  iconName: string;
  iconFamily?: 'Ionicons' | 'MaterialCommunityIcons' | 'Feather';
  color?: string;
  glowColor?: string;
  size?: number;
  glowIntensity?: number;
  style?: ViewStyle;
}

export const GlowingIconCircle = memo(({
  iconName,
  iconFamily = 'Ionicons',
  color = '#1A7AEB',
  glowColor,
  size = 56,
  glowIntensity = 0.5,
  style,
}: GlowingIconCircleProps) => {
  const effectiveGlowColor = glowColor || color;
  
  return (
    <View
      style={[
        styles.glowingCircle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: `${color}15`,
          shadowColor: effectiveGlowColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: glowIntensity,
          shadowRadius: size * 0.3,
          elevation: 10,
        },
        style,
      ]}
    >
      {/* Inner glow ring */}
      <View
        style={[
          styles.glowingCircleInner,
          {
            width: size * 0.85,
            height: size * 0.85,
            borderRadius: size * 0.425,
            backgroundColor: `${color}20`,
            borderWidth: 1,
            borderColor: `${color}30`,
          },
        ]}
      >
        <Icon
          name={iconName}
          family={iconFamily}
          size={size * 0.4}
          color={color}
        />
      </View>
    </View>
  );
});

// ============================================================================
// ANIMATED ICON WITH PULSE - For notifications/alerts
// ============================================================================

interface PulsingIconProps {
  iconName: string;
  iconFamily?: 'Ionicons' | 'MaterialCommunityIcons' | 'Feather';
  color?: string;
  size?: number;
  pulseColor?: string;
  style?: ViewStyle;
}

export const PulsingIcon = memo(({
  iconName,
  iconFamily = 'Ionicons',
  color = '#EF4444',
  size = 48,
  pulseColor,
  style,
}: PulsingIconProps) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;
  const effectivePulseColor = pulseColor || color;

  React.useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.4,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.6,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <View style={[styles.pulsingContainer, { width: size * 1.5, height: size * 1.5 }, style]}>
      {/* Pulse ring */}
      <Animated.View
        style={[
          styles.pulseRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: effectivePulseColor,
            transform: [{ scale: pulseAnim }],
            opacity: opacityAnim,
          },
        ]}
      />
      {/* Icon container */}
      <View
        style={[
          styles.pulseIconContainer,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: `${color}15`,
          },
        ]}
      >
        <Icon
          name={iconName}
          family={iconFamily}
          size={size * 0.5}
          color={color}
        />
      </View>
    </View>
  );
});

// ============================================================================
// RANK BADGE - For leaderboards and rankings
// ============================================================================

interface RankBadgeProps {
  rank: number;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const RankBadge = memo(({
  rank,
  size = 'md',
  style,
}: RankBadgeProps) => {
  const sizeMap = { sm: 24, md: 32, lg: 40 };
  const badgeSize = sizeMap[size];

  const getGradient = () => {
    if (rank === 1) return ['#FFD700', '#FFA500', '#FF8C00'];
    if (rank === 2) return ['#E8E8E8', '#C0C0C0', '#A8A8A8'];
    if (rank === 3) return ['#CD7F32', '#B87333', '#8B4513'];
    return ['#1A7AEB', '#0F62CC', '#0A4FA3'];
  };

  const getIconName = () => {
    if (rank === 1) return 'trophy';
    if (rank === 2) return 'medal';
    if (rank === 3) return 'ribbon';
    return 'star';
  };

  return (
    <LinearGradient
      colors={getGradient()}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.rankBadge,
        {
          width: badgeSize,
          height: badgeSize,
          borderRadius: badgeSize * 0.25,
        },
        style,
      ]}
    >
      {rank <= 3 ? (
        <Icon
          name={getIconName()}
          family="Ionicons"
          size={badgeSize * 0.5}
          color="#FFFFFF"
        />
      ) : (
        <View style={styles.rankNumber}>
          <Icon
            name="star"
            family="Ionicons"
            size={badgeSize * 0.45}
            color="#FFFFFF"
          />
        </View>
      )}
    </LinearGradient>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientBadge: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  glowingCircle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowingCircleInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulsingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 2,
  },
  pulseIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankBadge: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  rankNumber: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default {
  ICON_PRESETS,
  PremiumIconContainer,
  GradientIconBadge,
  GlowingIconCircle,
  PulsingIcon,
  RankBadge,
};

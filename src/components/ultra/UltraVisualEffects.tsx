/**
 * Ultra Premium Visual Effects - Highest Quality
 * No Blur, No Artifacts, Crystal Clear Graphics
 * Designer-Grade Visual Effects
 */

import React, { useRef, useEffect, memo, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  ViewStyle,
  Easing,
  PixelRatio,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import {
  ULTRA_RADIUS,
  ULTRA_SPACING,
  ULTRA_SHADOWS,
  ULTRA_MOTION,
  ULTRA_GRADIENTS,
  pixelPerfect,
} from '../../constants/ultra-design';

// Try to import LinearGradient
let LinearGradient: React.ComponentType<any>;
try {
  LinearGradient = require('react-native-linear-gradient').default;
} catch (e) {
  // Fallback component that renders solid color
  LinearGradient = ({ children, colors, style, ...props }: any) => (
    <View style={[style, { backgroundColor: colors?.[0] || '#3399FF' }]} {...props}>
      {children}
    </View>
  );
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// ULTRA SHIMMER - Crystal Clear Loading Effect
// ============================================================================

interface UltraShimmerProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const UltraShimmer = memo<UltraShimmerProps>(({
  width = '100%',
  height = pixelPerfect(20),
  borderRadius = ULTRA_RADIUS.md,
  style,
}) => {
  const { isDark } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1400,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  // Use carefully calibrated colors for crisp rendering
  const baseColor = isDark ? '#1E293B' : '#E2E8F0';
  const highlightColor = isDark ? '#334155' : '#F1F5F9';

  return (
    <View
      style={[
        styles.shimmerBase,
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: baseColor,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmerHighlight,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={[baseColor, highlightColor, baseColor]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
});

// ============================================================================
// ULTRA GLOW ORB - Premium Ambient Effect
// ============================================================================

interface UltraGlowOrbProps {
  color?: string;
  size?: number;
  intensity?: number;
  position?: { top?: number; left?: number; right?: number; bottom?: number };
  animated?: boolean;
  style?: ViewStyle;
}

export const UltraGlowOrb = memo<UltraGlowOrbProps>(({
  color = '#3399FF',
  size = pixelPerfect(80),
  intensity = 0.35,
  position = { top: pixelPerfect(20), left: pixelPerfect(-20) },
  animated = true,
  style,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(intensity)).current;

  useEffect(() => {
    if (animated) {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseAnim, {
              toValue: 1.12,
              duration: 3500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: intensity * 0.7,
              duration: 3500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 3500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: intensity,
              duration: 3500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    }
  }, [animated, intensity, pulseAnim, opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.glowOrb,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          ...position,
          transform: [{ scale: pulseAnim }],
          opacity: opacityAnim,
          // Use optimized shadow for glow effect
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: size * 0.35,
        },
        style,
      ]}
      pointerEvents="none"
    />
  );
});

// ============================================================================
// ULTRA HERO BANNER - Premium Header Component
// ============================================================================

interface UltraHeroBannerProps {
  gradientColors?: string[];
  showGlowOrbs?: boolean;
  showDecorations?: boolean;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const UltraHeroBanner = memo<UltraHeroBannerProps>(({
  gradientColors,
  showGlowOrbs = true,
  showDecorations = true,
  style,
  children,
}) => {
  const { isDark } = useTheme();

  const colors = gradientColors || (isDark
    ? ULTRA_GRADIENTS.hero.dark.colors
    : ULTRA_GRADIENTS.hero.light.colors);

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.heroBanner, style]}
    >
      {/* Decorative circles - crisp edges */}
      {showDecorations && (
        <>
          <View style={[styles.heroDecoCircle, styles.heroDecoCircle1]} />
          <View style={[styles.heroDecoCircle, styles.heroDecoCircle2]} />
          <View style={[styles.heroDecoCircle, styles.heroDecoCircle3]} />
        </>
      )}

      {/* Glow orbs */}
      {showGlowOrbs && (
        <>
          <UltraGlowOrb
            color="#667EEA"
            size={pixelPerfect(80)}
            intensity={0.35}
            position={{ top: pixelPerfect(16), left: pixelPerfect(-20) }}
          />
          <UltraGlowOrb
            color="#764BA2"
            size={pixelPerfect(60)}
            intensity={0.3}
            position={{ bottom: pixelPerfect(8), right: pixelPerfect(16) }}
          />
        </>
      )}

      {/* Content */}
      <View style={styles.heroBannerContent}>
        {children}
      </View>
    </LinearGradient>
  );
});

// ============================================================================
// ULTRA GRADIENT BORDER - Premium Bordered Card
// ============================================================================

interface UltraGradientBorderProps {
  gradientColors?: string[];
  borderWidth?: number;
  borderRadius?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const UltraGradientBorder = memo<UltraGradientBorderProps>(({
  gradientColors = ['#667EEA', '#764BA2'],
  borderWidth = pixelPerfect(2),
  borderRadius = ULTRA_RADIUS.xl,
  style,
  children,
}) => {
  const { colors } = useTheme();

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.gradientBorder,
        { borderRadius, padding: borderWidth },
        style,
      ]}
    >
      <View
        style={[
          styles.gradientBorderInner,
          {
            backgroundColor: colors.card,
            borderRadius: borderRadius - borderWidth,
          },
        ]}
      >
        {children}
      </View>
    </LinearGradient>
  );
});

// ============================================================================
// ULTRA SPINNER - Clean Loading Indicator
// ============================================================================

interface UltraSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  strokeWidth?: number;
  style?: ViewStyle;
}

export const UltraSpinner = memo<UltraSpinnerProps>(({
  size = 'md',
  color,
  strokeWidth,
  style,
}) => {
  const { colors } = useTheme();
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const spinnerColor = color || colors.primary;
  const sizeMap = { sm: pixelPerfect(20), md: pixelPerfect(28), lg: pixelPerfect(40) };
  const strokeMap = { sm: pixelPerfect(2), md: pixelPerfect(3), lg: pixelPerfect(4) };
  const spinnerSize = sizeMap[size];
  const stroke = strokeWidth || strokeMap[size];

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [rotateAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        {
          width: spinnerSize,
          height: spinnerSize,
          borderRadius: spinnerSize / 2,
          borderWidth: stroke,
          borderColor: `${spinnerColor}25`,
          borderTopColor: spinnerColor,
          transform: [{ rotate }],
        },
        style,
      ]}
    />
  );
});

// ============================================================================
// ULTRA PULSE DOTS - Premium Loading Dots
// ============================================================================

interface UltraPulseDotsProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  count?: number;
  style?: ViewStyle;
}

export const UltraPulseDots = memo<UltraPulseDotsProps>(({
  size = 'md',
  color,
  count = 3,
  style,
}) => {
  const { colors } = useTheme();
  const dotColor = color || colors.primary;
  const dotSizeMap = { sm: pixelPerfect(6), md: pixelPerfect(8), lg: pixelPerfect(10) };
  const dotSize = dotSizeMap[size];

  return (
    <View style={[styles.pulseDots, style]}>
      {Array.from({ length: count }).map((_, index) => (
        <AnimatedDot key={index} dotSize={dotSize} color={dotColor} delay={index * 150} />
      ))}
    </View>
  );
});

const AnimatedDot = memo<{ dotSize: number; color: string; delay: number }>(({
  dotSize,
  color,
  delay,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const opacityAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.6,
            duration: 400,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.4,
            duration: 400,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [delay, scaleAnim, opacityAnim]);

  return (
    <Animated.View
      style={[
        {
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: color,
          marginHorizontal: dotSize / 3,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    />
  );
});

// ============================================================================
// ULTRA SKELETON CARD - Clean Loading Placeholder
// ============================================================================

interface UltraSkeletonCardProps {
  variant?: 'default' | 'horizontal' | 'compact' | 'list';
  style?: ViewStyle;
}

export const UltraSkeletonCard = memo<UltraSkeletonCardProps>(({
  variant = 'default',
  style,
}) => {
  const { colors, isDark } = useTheme();
  const shadowStyle = isDark ? ULTRA_SHADOWS.dark.sm : ULTRA_SHADOWS.light.sm;

  if (variant === 'horizontal') {
    return (
      <View style={[styles.skeletonCard, styles.horizontalCard, { backgroundColor: colors.card }, shadowStyle, style]}>
        <UltraShimmer width={pixelPerfect(60)} height={pixelPerfect(60)} borderRadius={ULTRA_RADIUS.lg} />
        <View style={styles.horizontalContent}>
          <UltraShimmer width="70%" height={pixelPerfect(16)} style={styles.mb8} />
          <UltraShimmer width="50%" height={pixelPerfect(12)} />
        </View>
      </View>
    );
  }

  if (variant === 'compact') {
    return (
      <View style={[styles.skeletonCard, styles.compactCard, { backgroundColor: colors.card }, shadowStyle, style]}>
        <UltraShimmer width={pixelPerfect(40)} height={pixelPerfect(40)} borderRadius={ULTRA_RADIUS.md} />
        <UltraShimmer width="60%" height={pixelPerfect(14)} style={{ marginTop: ULTRA_SPACING[2] }} />
      </View>
    );
  }

  if (variant === 'list') {
    return (
      <View style={[styles.listSkeleton, { backgroundColor: colors.card }, shadowStyle, style]}>
        <UltraShimmer width={pixelPerfect(48)} height={pixelPerfect(48)} borderRadius={ULTRA_RADIUS.md} />
        <View style={styles.listSkeletonContent}>
          <UltraShimmer width="65%" height={pixelPerfect(16)} style={styles.mb6} />
          <UltraShimmer width="45%" height={pixelPerfect(12)} />
        </View>
        <UltraShimmer width={pixelPerfect(60)} height={pixelPerfect(28)} borderRadius={ULTRA_RADIUS.full} />
      </View>
    );
  }

  // Default card skeleton
  return (
    <View style={[styles.skeletonCard, { backgroundColor: colors.card }, shadowStyle, style]}>
      <View style={styles.cardHeader}>
        <UltraShimmer width={pixelPerfect(56)} height={pixelPerfect(56)} borderRadius={ULTRA_RADIUS.lg} />
        <View style={styles.headerText}>
          <UltraShimmer width="70%" height={pixelPerfect(18)} style={styles.mb8} />
          <UltraShimmer width="50%" height={pixelPerfect(14)} />
        </View>
      </View>
      <UltraShimmer width="100%" height={pixelPerfect(12)} style={styles.mb8} />
      <UltraShimmer width="85%" height={pixelPerfect(12)} style={styles.mb8} />
      <UltraShimmer width="40%" height={pixelPerfect(12)} />
    </View>
  );
});

// ============================================================================
// ULTRA FLOATING PARTICLES - Ambient Effect
// ============================================================================

interface UltraFloatingParticlesProps {
  count?: number;
  color?: string;
  style?: ViewStyle;
}

export const UltraFloatingParticles = memo<UltraFloatingParticlesProps>(({
  count = 6,
  color = 'rgba(255,255,255,0.35)',
  style,
}) => {
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      size: pixelPerfect(4 + Math.random() * 5),
      left: Math.random() * 100,
      delay: Math.random() * 4000,
      duration: 4500 + Math.random() * 3500,
    })),
  [count]);

  return (
    <View style={[styles.particlesContainer, style]} pointerEvents="none">
      {particles.map((particle) => (
        <FloatingParticle key={particle.id} particle={particle} color={color} />
      ))}
    </View>
  );
});

const FloatingParticle = memo<{ particle: any; color: string }>(({ particle, color }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(particle.delay),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -180,
            duration: particle.duration,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 1,
              duration: particle.duration * 0.2,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: particle.duration * 0.8,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [particle, translateY, opacity]);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          left: `${particle.left}%`,
          backgroundColor: color,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    />
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Shimmer
  shimmerBase: {
    overflow: 'hidden',
  },
  shimmerHighlight: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH * 2,
  },

  // Glow Orb
  glowOrb: {
    position: 'absolute',
  },

  // Hero Banner
  heroBanner: {
    borderRadius: ULTRA_RADIUS['2xl'],
    padding: ULTRA_SPACING[5],
    paddingTop: ULTRA_SPACING[7],
    paddingBottom: ULTRA_SPACING[7],
    overflow: 'hidden',
    minHeight: pixelPerfect(200),
    shadowColor: '#3399FF',
    shadowOffset: { width: 0, height: pixelPerfect(8) },
    shadowOpacity: 0.28,
    shadowRadius: pixelPerfect(16),
    elevation: 10,
  },
  heroDecoCircle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroDecoCircle1: {
    top: pixelPerfect(-40),
    right: pixelPerfect(-40),
    width: pixelPerfect(120),
    height: pixelPerfect(120),
  },
  heroDecoCircle2: {
    bottom: pixelPerfect(-30),
    left: pixelPerfect(-30),
    width: pixelPerfect(100),
    height: pixelPerfect(100),
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroDecoCircle3: {
    top: pixelPerfect(60),
    right: pixelPerfect(40),
    width: pixelPerfect(60),
    height: pixelPerfect(60),
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroBannerContent: {
    position: 'relative',
    zIndex: 1,
  },

  // Gradient Border
  gradientBorder: {
    overflow: 'hidden',
  },
  gradientBorderInner: {
    flex: 1,
    overflow: 'hidden',
  },

  // Pulse Dots
  pulseDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Skeleton Card
  skeletonCard: {
    padding: ULTRA_SPACING[4],
    borderRadius: ULTRA_RADIUS.xl,
  },
  horizontalCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  horizontalContent: {
    flex: 1,
    marginLeft: ULTRA_SPACING[3],
  },
  compactCard: {
    alignItems: 'center',
    padding: ULTRA_SPACING[3],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ULTRA_SPACING[4],
  },
  headerText: {
    flex: 1,
    marginLeft: ULTRA_SPACING[3],
  },
  listSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ULTRA_SPACING[3],
    borderRadius: ULTRA_RADIUS.lg,
  },
  listSkeletonContent: {
    flex: 1,
    marginLeft: ULTRA_SPACING[3],
  },

  // Particles
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
    bottom: 0,
  },

  // Margin helpers
  mb6: { marginBottom: pixelPerfect(6) },
  mb8: { marginBottom: pixelPerfect(8) },
  mb12: { marginBottom: pixelPerfect(12) },
});

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  UltraShimmer,
  UltraGlowOrb,
  UltraHeroBanner,
  UltraGradientBorder,
  UltraSpinner,
  UltraPulseDots,
  UltraSkeletonCard,
  UltraFloatingParticles,
};

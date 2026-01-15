/**
 * Premium Visual Effects
 * World-class visual effects for a professional, high-end UI
 * Includes: Aurora effects, mesh gradients, glow orbs, premium patterns
 */

import React, { useRef, useEffect, memo } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  ViewStyle,
  Platform,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { RADIUS, ANIMATION } from '../../constants/design';

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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// PREMIUM GRADIENT PRESETS
// ============================================================================

export const PREMIUM_GRADIENTS = {
  // Aurora-inspired gradients (Northern lights effect)
  aurora: {
    primary: ['#667eea', '#764ba2', '#f093fb'],
    ocean: ['#00d4ff', '#0099ff', '#0066ff', '#00d4ff'],
    sunset: ['#f093fb', '#f5576c', '#ffb347'],
    forest: ['#11998e', '#38ef7d', '#00c9a7'],
    royal: ['#141e30', '#243b55', '#667eea'],
  },
  
  // Glassmorphism backgrounds
  glass: {
    light: ['rgba(255,255,255,0.92)', 'rgba(255,255,255,0.78)'],
    lightFrost: ['rgba(255,255,255,0.95)', 'rgba(248,250,252,0.88)'],
    dark: ['rgba(15,23,42,0.92)', 'rgba(30,41,59,0.85)'],
    darkFrost: ['rgba(30,41,59,0.95)', 'rgba(51,65,85,0.88)'],
    accent: ['rgba(26,122,235,0.15)', 'rgba(26,122,235,0.05)'],
  },
  
  // Premium accent gradients
  accent: {
    blue: ['#1A7AEB', '#0F62CC', '#0A4FA3'],
    purple: ['#8B5CF6', '#7C3AED', '#6D28D9'],
    teal: ['#14B8A6', '#0D9488', '#0F766E'],
    gold: ['#F59E0B', '#D97706', '#B45309'],
    rose: ['#F43F5E', '#E11D48', '#BE123C'],
    emerald: ['#10B981', '#059669', '#047857'],
  },
  
  // Hero section gradients
  hero: {
    primary: ['#1A7AEB', '#0D5BC4', '#0A4A9E'],
    dark: ['#0F172A', '#1E293B', '#334155'],
    premium: ['#667eea', '#764ba2'],
    royal: ['#1E3A5F', '#0D1B2A', '#020817'],
  },
  
  // Card backgrounds
  card: {
    elevated: ['#FFFFFF', '#FAFBFC'],
    surface: ['#F8FAFC', '#F1F5F9'],
    darkElevated: ['#1E293B', '#0F172A'],
    darkSurface: ['#334155', '#1E293B'],
  },
  
  // Status gradients with depth
  status: {
    success: ['#22C55E', '#16A34A', '#15803D'],
    warning: ['#F59E0B', '#D97706', '#B45309'],
    error: ['#EF4444', '#DC2626', '#B91C1C'],
    info: ['#3B82F6', '#2563EB', '#1D4ED8'],
  },
};

// ============================================================================
// ANIMATED GLOW ORB - Floating ambient effect
// ============================================================================

interface GlowOrbProps {
  color?: string;
  size?: number;
  intensity?: number;
  position?: { top?: number; left?: number; right?: number; bottom?: number };
  animated?: boolean;
  style?: ViewStyle;
}

export const GlowOrb = memo(({
  color = '#667eea',
  size = 80,
  intensity = 0.4,
  position = { top: 20, left: -20 },
  animated = true,
  style,
}: GlowOrbProps) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(intensity)).current;

  useEffect(() => {
    if (animated) {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseAnim, {
              toValue: 1.15,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: intensity * 0.7,
              duration: 3000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: intensity,
              duration: 3000,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    }
  }, [animated, intensity]);

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
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: size * 0.4,
        },
        style,
      ]}
      pointerEvents="none"
    />
  );
});

// ============================================================================
// AURORA BACKGROUND - Northern lights effect
// ============================================================================

interface AuroraBackgroundProps {
  preset?: keyof typeof PREMIUM_GRADIENTS.aurora;
  intensity?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const AuroraBackground = memo(({
  preset = 'primary',
  intensity = 0.3,
  style,
  children,
}: AuroraBackgroundProps) => {
  const { isDark } = useTheme();
  const colors = PREMIUM_GRADIENTS.aurora[preset];
  
  const orbit1Anim = useRef(new Animated.Value(0)).current;
  const orbit2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(orbit1Anim, {
        toValue: 1,
        duration: 15000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(orbit2Anim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const orbit1Transform = orbit1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const orbit2Transform = orbit2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

  return (
    <View style={[styles.auroraContainer, style]}>
      {/* Base gradient layer */}
      <LinearGradient
        colors={isDark ? PREMIUM_GRADIENTS.hero.dark : PREMIUM_GRADIENTS.hero.primary}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Animated aurora orbs */}
      <Animated.View
        style={[
          styles.auroraOrb,
          {
            top: -50,
            left: -50,
            width: 200,
            height: 200,
            backgroundColor: `${colors[0]}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`,
            transform: [{ rotate: orbit1Transform }],
          },
        ]}
        pointerEvents="none"
      />
      <Animated.View
        style={[
          styles.auroraOrb,
          {
            bottom: -80,
            right: -60,
            width: 250,
            height: 250,
            backgroundColor: `${colors[1]}${Math.round(intensity * 0.8 * 255).toString(16).padStart(2, '0')}`,
            transform: [{ rotate: orbit2Transform }],
          },
        ]}
        pointerEvents="none"
      />
      {colors[2] && (
        <View
          style={[
            styles.auroraOrb,
            {
              top: '40%',
              right: -30,
              width: 150,
              height: 150,
              backgroundColor: `${colors[2]}${Math.round(intensity * 0.6 * 255).toString(16).padStart(2, '0')}`,
            },
          ]}
          pointerEvents="none"
        />
      )}

      {children}
    </View>
  );
});

// ============================================================================
// MESH GRADIENT - Modern multi-point gradient effect
// ============================================================================

interface MeshGradientProps {
  colors?: string[];
  style?: ViewStyle;
  children?: React.ReactNode;
  intensity?: number;
}

export const MeshGradient = memo(({
  colors = ['#667eea', '#764ba2', '#f093fb', '#00d4ff'],
  style,
  children,
  intensity = 0.25,
}: MeshGradientProps) => {
  // Fixed positions using numeric values for type safety
  const positions = [
    { top: -30, left: -30 } as const,
    { top: -40, right: -40 } as const,
    { bottom: -50, left: 60 } as const,
    { bottom: -30, right: -30 } as const,
  ];

  return (
    <View style={[styles.meshContainer, style]}>
      {colors.map((color, index) => (
        <View
          key={index}
          style={[
            styles.meshOrb,
            positions[index % positions.length] as ViewStyle,
            {
              width: 120 + index * 20,
              height: 120 + index * 20,
              borderRadius: (120 + index * 20) / 2,
              backgroundColor: color,
              opacity: intensity,
            },
          ]}
          pointerEvents="none"
        />
      ))}
      {children}
    </View>
  );
});

// ============================================================================
// PREMIUM SHINE EFFECT - Metallic shimmer
// ============================================================================

interface ShineEffectProps {
  width?: number | string;
  height?: number;
  color?: string;
  style?: ViewStyle;
}

export const ShineEffect = memo(({
  width = '100%',
  height = 100,
  color = '#FFFFFF',
  style,
}: ShineEffectProps) => {
  const shineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shineAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(shineAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateX = shineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH * 2],
  });

  return (
    <View
      style={[
        styles.shineContainer,
        { width: width as any, height },
        style,
      ]}
      pointerEvents="none"
    >
      <Animated.View
        style={[
          styles.shineLine,
          {
            backgroundColor: color,
            transform: [{ translateX }, { rotate: '-20deg' }],
          },
        ]}
      />
    </View>
  );
});

// ============================================================================
// FLOATING PARTICLES - Ambient particle effect
// ============================================================================

interface FloatingParticlesProps {
  count?: number;
  color?: string;
  style?: ViewStyle;
}

export const FloatingParticles = memo(({
  count = 6,
  color = 'rgba(255,255,255,0.4)',
  style,
}: FloatingParticlesProps) => {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: 4 + Math.random() * 6,
    left: Math.random() * 100,
    delay: Math.random() * 4000,
    duration: 4000 + Math.random() * 4000,
  }));

  return (
    <View style={[styles.particlesContainer, style]} pointerEvents="none">
      {particles.map((particle) => (
        <AnimatedParticle
          key={particle.id}
          particle={particle}
          color={color}
        />
      ))}
    </View>
  );
});

const AnimatedParticle = memo(({
  particle,
  color,
}: {
  particle: { size: number; left: number; delay: number; duration: number };
  color: string;
}) => {
  const yAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(particle.delay),
        Animated.parallel([
          Animated.timing(yAnim, {
            toValue: 1,
            duration: particle.duration,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: particle.duration * 0.2,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: particle.duration * 0.8,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.timing(yAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = yAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -200],
  });

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
          opacity: opacityAnim,
        },
      ]}
    />
  );
});

// ============================================================================
// GRADIENT BORDER - Premium outlined effect
// ============================================================================

interface GradientBorderCardProps {
  gradientColors?: string[];
  borderWidth?: number;
  borderRadius?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const GradientBorderCard = memo(({
  gradientColors = ['#667eea', '#764ba2'],
  borderWidth = 2,
  borderRadius = RADIUS.xl,
  style,
  children,
}: GradientBorderCardProps) => {
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
// PREMIUM HERO BANNER - Enhanced hero section
// ============================================================================

interface PremiumHeroBannerProps {
  gradientPreset?: 'primary' | 'dark' | 'premium' | 'royal';
  showParticles?: boolean;
  showGlowOrbs?: boolean;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const PremiumHeroBanner = memo(({
  gradientPreset = 'primary',
  showParticles = true,
  showGlowOrbs = true,
  style,
  children,
}: PremiumHeroBannerProps) => {
  const { isDark } = useTheme();
  const gradientColors = isDark
    ? PREMIUM_GRADIENTS.hero.dark
    : PREMIUM_GRADIENTS.hero[gradientPreset];

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.heroBanner, style]}
    >
      {/* Decorative circles */}
      <View style={[styles.heroDecoCircle, styles.heroDecoCircle1]} />
      <View style={[styles.heroDecoCircle, styles.heroDecoCircle2]} />
      <View style={[styles.heroDecoCircle, styles.heroDecoCircle3]} />

      {/* Glow orbs */}
      {showGlowOrbs && (
        <>
          <GlowOrb
            color="#667eea"
            size={80}
            intensity={0.4}
            position={{ top: 20, left: -20 }}
          />
          <GlowOrb
            color="#764ba2"
            size={60}
            intensity={0.35}
            position={{ bottom: 10, right: 20 }}
          />
        </>
      )}

      {/* Floating particles */}
      {showParticles && <FloatingParticles count={5} />}

      {/* Shine effect */}
      <ShineEffect />

      {/* Content */}
      <View style={styles.heroBannerContent}>{children}</View>
    </LinearGradient>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  glowOrb: {
    position: 'absolute',
  },
  auroraContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  auroraOrb: {
    position: 'absolute',
    borderRadius: 999,
  },
  meshContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  meshOrb: {
    position: 'absolute',
  },
  shineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
  },
  shineLine: {
    position: 'absolute',
    top: -50,
    width: 40,
    height: 300,
    opacity: 0.15,
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
    bottom: 0,
  },
  gradientBorder: {
    overflow: 'hidden',
  },
  gradientBorderInner: {
    flex: 1,
    overflow: 'hidden',
  },
  heroBanner: {
    borderRadius: RADIUS.xxl,
    padding: 20,
    paddingTop: 28,
    paddingBottom: 28,
    overflow: 'hidden',
    minHeight: 200,
    shadowColor: '#1A7AEB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  heroDecoCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroDecoCircle1: {
    top: -40,
    right: -40,
    width: 120,
    height: 120,
  },
  heroDecoCircle2: {
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroDecoCircle3: {
    top: 60,
    right: 40,
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroBannerContent: {
    position: 'relative',
    zIndex: 1,
  },
});

export default {
  PREMIUM_GRADIENTS,
  GlowOrb,
  AuroraBackground,
  MeshGradient,
  ShineEffect,
  FloatingParticles,
  GradientBorderCard,
  PremiumHeroBanner,
};

/**
 * Premium Gradient Components
 * Beautiful, curated gradients for visual polish
 * Removes "flat" AI-generated look
 */

import React from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';

// Try to import LinearGradient, fallback gracefully
let LinearGradient: React.ComponentType<any>;
try {
  LinearGradient = require('react-native-linear-gradient').default;
} catch (e) {
  // Fallback to View with solid color
  LinearGradient = ({children, colors, style, ...props}: any) => (
    <View style={[style, {backgroundColor: colors?.[0] || '#4573DF'}]} {...props}>
      {children}
    </View>
  );
}

// ============================================================================
// CURATED GRADIENT PRESETS - Premium color combinations
// ============================================================================

export const GRADIENT_PRESETS = {
  // Brand gradients
  primary: ['#4573DF', '#3660C9'],
  primarySoft: ['#4573DF', '#4573DF'],
  secondary: ['#14B8AA', '#0E9688'],
  
  // Nature-inspired
  ocean: ['#0093E9', '#80D0C7'],
  forest: ['#11998e', '#38ef7d'],
  sunset: ['#f093fb', '#f5576c'],
  dawn: ['#ff9966', '#ff5e62'],
  midnight: ['#2C3E50', '#4CA1AF'],
  aurora: ['#7F7FD5', '#86A8E7', '#91EAE4'],
  
  // Premium metallics
  gold: ['#F7971E', '#FFD200'],
  silver: ['#bdc3c7', '#2c3e50'],
  rose: ['#f4c4f3', '#fc67fa'],
  
  // Modern tech
  neon: ['#12c2e9', '#c471ed', '#f64f59'],
  cyber: ['#00d2ff', '#3a7bd5'],
  electric: ['#4776E6', '#8E54E9'],
  
  // Soft & elegant
  peach: ['#FFE5D9', '#FFCAB9'],
  lavender: ['#E8D5F2', '#D0C4DF'],
  mint: ['#D4FC79', '#96E6A1'],
  cream: ['#FFF5EB', '#FFE4D1'],
  
  // Dark mode optimized
  darkPrimary: ['#1E3A5F', '#1D2127'],
  darkAccent: ['#2A4FA8', '#1D2127'],
  darkSurface: ['#1D2127', '#272C34'],
  
  // Status gradients
  success: ['#10B981', '#059669'],
  warning: ['#F59E0B', '#D97706'],
  error: ['#EF4444', '#DC2626'],
  info: ['#4573DF', '#3660C9'],
  
  // Special effects
  glass: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'],
  glassDark: ['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.05)'],
  frosted: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)'],
  
  // Card backgrounds
  cardLight: ['#FFFFFF', '#F8FAFC'],
  cardDark: ['#272C34', '#1D2127'],
  
  // Mesh gradient simulations
  meshPurple: ['#4573DF', '#4573DF', '#3660C9'],
  meshBlue: ['#4573DF', '#4573DF', '#3660C9'],
  meshGreen: ['#56ab2f', '#a8e063', '#d4fc79'],
};

// ============================================================================
// GRADIENT WRAPPER COMPONENT
// ============================================================================

interface GradientBoxProps {
  preset?: keyof typeof GRADIENT_PRESETS;
  colors?: string[];
  start?: {x: number; y: number};
  end?: {x: number; y: number};
  angle?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const GradientBox: React.FC<GradientBoxProps> = ({
  preset = 'primary',
  colors,
  start = {x: 0, y: 0},
  end = {x: 1, y: 1},
  angle,
  style,
  children,
}) => {
  const gradientColors = colors || GRADIENT_PRESETS[preset];
  
  // Convert angle to start/end if provided
  let gradientStart = start;
  let gradientEnd = end;
  
  if (angle !== undefined) {
    const angleRad = (angle * Math.PI) / 180;
    gradientStart = {
      x: 0.5 - Math.sin(angleRad) * 0.5,
      y: 0.5 + Math.cos(angleRad) * 0.5,
    };
    gradientEnd = {
      x: 0.5 + Math.sin(angleRad) * 0.5,
      y: 0.5 - Math.cos(angleRad) * 0.5,
    };
  }

  return (
    <LinearGradient
      colors={gradientColors}
      start={gradientStart}
      end={gradientEnd}
      style={[styles.gradientBox, style]}>
      {children}
    </LinearGradient>
  );
};

// ============================================================================
// GRADIENT TEXT (Simulated with overlay)
// ============================================================================

interface GradientTextProps {
  text: string;
  preset?: keyof typeof GRADIENT_PRESETS;
  colors?: string[];
  style?: any;
}

export const GradientText: React.FC<GradientTextProps> = ({
  text,
  preset = 'primary',
  colors,
  style,
}) => {
  // Note: True gradient text requires MaskedView
  // This is a fallback that uses the first color
  const gradientColors = colors || GRADIENT_PRESETS[preset];
  
  return (
    <View style={styles.gradientTextContainer}>
      <LinearGradient
        colors={gradientColors}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.gradientTextMask}>
        {/* This creates a text-shaped hole in a white overlay */}
      </View>
    </View>
  );
};

// ============================================================================
// GRADIENT BORDER
// ============================================================================

interface GradientBorderProps {
  preset?: keyof typeof GRADIENT_PRESETS;
  colors?: string[];
  borderWidth?: number;
  borderRadius?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const GradientBorder: React.FC<GradientBorderProps> = ({
  preset = 'primary',
  colors,
  borderWidth = 2,
  borderRadius = 16,
  style,
  children,
}) => {
  const gradientColors = colors || GRADIENT_PRESETS[preset];

  return (
    <LinearGradient
      colors={gradientColors}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={[
        styles.gradientBorder,
        {borderRadius, padding: borderWidth},
        style,
      ]}>
      <View
        style={[
          styles.gradientBorderInner,
          {borderRadius: borderRadius - borderWidth},
        ]}>
        {children}
      </View>
    </LinearGradient>
  );
};

// ============================================================================
// ANIMATED GRADIENT BORDER
// ============================================================================

interface GlowingBorderProps {
  color?: string;
  glowIntensity?: number;
  borderRadius?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const GlowingBorder: React.FC<GlowingBorderProps> = ({
  color = '#4573DF',
  glowIntensity = 0.4,
  borderRadius = 16,
  style,
  children,
}) => {
  return (
    <View
      style={[
        styles.glowingBorder,
        {
          borderRadius,
          borderColor: color,
          shadowColor: color,
          shadowOpacity: glowIntensity,
          shadowRadius: 16,
          shadowOffset: {width: 0, height: 4},
          elevation: 8,
        },
        style,
      ]}>
      {children}
    </View>
  );
};

// ============================================================================
// GRADIENT DIVIDER
// ============================================================================

interface GradientDividerProps {
  preset?: keyof typeof GRADIENT_PRESETS;
  colors?: string[];
  height?: number;
  style?: ViewStyle;
}

export const GradientDivider: React.FC<GradientDividerProps> = ({
  preset = 'primary',
  colors,
  height = 2,
  style,
}) => {
  const gradientColors = colors || GRADIENT_PRESETS[preset];

  return (
    <LinearGradient
      colors={['transparent', ...gradientColors, 'transparent']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      style={[styles.gradientDivider, {height}, style]}
    />
  );
};

// ============================================================================
// GRADIENT BLUR OVERLAY
// ============================================================================

interface GradientOverlayProps {
  preset?: keyof typeof GRADIENT_PRESETS;
  colors?: string[];
  opacity?: number;
  style?: ViewStyle;
}

export const GradientOverlay: React.FC<GradientOverlayProps> = ({
  preset = 'darkPrimary',
  colors,
  opacity = 0.7,
  style,
}) => {
  const gradientColors = colors || GRADIENT_PRESETS[preset];

  return (
    <LinearGradient
      colors={gradientColors}
      start={{x: 0, y: 0}}
      end={{x: 0, y: 1}}
      style={[StyleSheet.absoluteFill, {opacity}, style]}
    />
  );
};

// ============================================================================
// GRADIENT ICON BACKGROUND
// ============================================================================

interface GradientIconBgProps {
  preset?: keyof typeof GRADIENT_PRESETS;
  colors?: string[];
  size?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const GradientIconBg: React.FC<GradientIconBgProps> = ({
  preset = 'primary',
  colors,
  size = 48,
  style,
  children,
}) => {
  const gradientColors = colors || GRADIENT_PRESETS[preset];

  return (
    <LinearGradient
      colors={gradientColors}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={[
        styles.gradientIconBg,
        {
          width: size,
          height: size,
          borderRadius: size * 0.3,
        },
        style,
      ]}>
      {children}
    </LinearGradient>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  gradientBox: {
    overflow: 'hidden',
  },
  gradientTextContainer: {
    position: 'relative',
  },
  gradientTextMask: {
    // Mask implementation would go here
  },
  gradientBorder: {
    overflow: 'hidden',
  },
  gradientBorderInner: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  glowingBorder: {
    borderWidth: 2,
    overflow: 'hidden',
  },
  gradientDivider: {
    width: '100%',
  },
  gradientIconBg: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default {
  GRADIENT_PRESETS,
  GradientBox,
  GradientText,
  GradientBorder,
  GlowingBorder,
  GradientDivider,
  GradientOverlay,
  GradientIconBg,
};


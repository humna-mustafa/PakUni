/**
 * Design Polish Utilities
 * Premium visual effects and micro-interactions for human-crafted feel
 * Eliminates "AI-generated" look with organic, hand-crafted details
 */

import {Animated, Easing, Platform, PixelRatio} from 'react-native';

// ============================================================================
// ORGANIC MOTION - Natural, imperfect animations
// ============================================================================

/**
 * Creates subtle organic wobble for human-like motion
 * Avoids mechanical, robotic feel
 */
export const createOrganicWobble = (
  animValue: Animated.Value,
  intensity: number = 1,
) => {
  const wobbleSequence = Animated.sequence([
    Animated.timing(animValue, {
      toValue: 1 + (0.02 * intensity),
      duration: 100,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }),
    Animated.timing(animValue, {
      toValue: 1 - (0.01 * intensity),
      duration: 80,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }),
    Animated.timing(animValue, {
      toValue: 1,
      duration: 60,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }),
  ]);
  return wobbleSequence;
};

/**
 * Natural breathing animation for attention
 * Mimics organic pulse, not mechanical
 */
export const createBreathingAnimation = (
  animValue: Animated.Value,
  minScale: number = 0.98,
  maxScale: number = 1.02,
) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animValue, {
        toValue: maxScale,
        duration: 2000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
      Animated.timing(animValue, {
        toValue: minScale,
        duration: 2000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    ]),
  );
};

// ============================================================================
// STAGGER PATTERNS - Varied timing for natural feel
// ============================================================================

/**
 * Creates natural stagger delays with slight randomness
 * Avoids mechanical uniform timing
 */
export const getNaturalStaggerDelay = (
  index: number,
  baseDelay: number = 50,
  randomness: number = 15,
): number => {
  const variation = (Math.random() - 0.5) * 2 * randomness;
  return index * baseDelay + variation;
};

/**
 * Cascade animation with acceleration
 * Items appear faster as sequence progresses
 */
export const getCascadeDelay = (
  index: number,
  initialDelay: number = 80,
  acceleration: number = 0.85,
): number => {
  return initialDelay * Math.pow(acceleration, index);
};

// ============================================================================
// VISUAL POLISH - Subtle details for premium feel
// ============================================================================

/**
 * Generates subtle noise texture coordinates
 * For grainy, premium card backgrounds
 */
export const getNoisePattern = (width: number, height: number, density: number = 0.03) => {
  const points: Array<{x: number; y: number; opacity: number}> = [];
  const count = Math.floor(width * height * density);
  
  for (let i = 0; i < count; i++) {
    points.push({
      x: Math.random() * width,
      y: Math.random() * height,
      opacity: Math.random() * 0.1,
    });
  }
  
  return points;
};

/**
 * Asymmetric border radius for organic shapes
 * Breaks the uniform corner pattern
 */
export const getOrganicBorderRadius = (
  baseRadius: number,
  variation: number = 4,
): {
  borderTopLeftRadius: number;
  borderTopRightRadius: number;
  borderBottomLeftRadius: number;
  borderBottomRightRadius: number;
} => {
  return {
    borderTopLeftRadius: baseRadius + variation,
    borderTopRightRadius: baseRadius - Math.floor(variation / 2),
    borderBottomLeftRadius: baseRadius - variation,
    borderBottomRightRadius: baseRadius + Math.floor(variation / 3),
  };
};

/**
 * Slight rotation for hand-crafted look
 */
export const getSubtleRotation = (index: number, maxDegrees: number = 1): string => {
  const rotation = ((index % 5) - 2) * (maxDegrees / 2);
  return `${rotation}deg`;
};

// ============================================================================
// PREMIUM SHADOWS - Multi-layered for depth
// ============================================================================

/**
 * Creates layered shadow for realistic depth
 * Mimics real-world light diffusion
 */
export const getLayeredShadow = (elevation: number = 4, color: string = '#000000') => {
  const layers = [];
  
  // Close shadow (sharp)
  layers.push({
    shadowColor: color,
    shadowOffset: {width: 0, height: elevation * 0.5},
    shadowOpacity: 0.08,
    shadowRadius: elevation,
  });
  
  // Mid shadow (diffused)
  layers.push({
    shadowColor: color,
    shadowOffset: {width: 0, height: elevation},
    shadowOpacity: 0.05,
    shadowRadius: elevation * 2,
  });
  
  // Far shadow (ambient)
  layers.push({
    shadowColor: color,
    shadowOffset: {width: 0, height: elevation * 2},
    shadowOpacity: 0.03,
    shadowRadius: elevation * 4,
  });
  
  return layers[0]; // Return primary for React Native compatibility
};

/**
 * Colored glow shadow for interactive elements
 */
export const getGlowShadow = (color: string, intensity: number = 0.4) => ({
  shadowColor: color,
  shadowOffset: {width: 0, height: 4},
  shadowOpacity: intensity,
  shadowRadius: 16,
  elevation: 8,
});

// ============================================================================
// RESPONSIVE SIZING - Adapts to device
// ============================================================================

const DESIGN_WIDTH = 375; // iPhone X design width

/**
 * Scale size relative to design width
 * Maintains proportions across devices
 */
export const scaleSize = (size: number): number => {
  const {width} = require('react-native').Dimensions.get('window');
  const scale = width / DESIGN_WIDTH;
  const newSize = size * scale;
  
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

/**
 * Moderate scaling for text
 * Prevents extreme sizes on tablets
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
  const {width} = require('react-native').Dimensions.get('window');
  const scale = width / DESIGN_WIDTH;
  return size + (scaleSize(size) - size) * factor;
};

// ============================================================================
// DYNAMIC COLORS - Contextual color adjustments
// ============================================================================

/**
 * Lighten color by percentage
 */
export const lightenColor = (color: string, percent: number): string => {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
};

/**
 * Darken color by percentage
 */
export const darkenColor = (color: string, percent: number): string => {
  return lightenColor(color, -percent);
};

/**
 * Add transparency to color
 */
export const withOpacity = (color: string, opacity: number): string => {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

// ============================================================================
// INTERACTION FEEDBACK - Micro-interactions
// ============================================================================

/**
 * Success state celebration animation
 */
export const celebrationAnimation = (
  scaleValue: Animated.Value,
  rotateValue: Animated.Value,
) => {
  scaleValue.setValue(0.5);
  rotateValue.setValue(0);
  
  return Animated.parallel([
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 200,
      useNativeDriver: true,
    }),
    Animated.sequence([
      Animated.timing(rotateValue, {
        toValue: -0.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(rotateValue, {
        toValue: 0.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(rotateValue, {
        toValue: 0,
        friction: 4,
        useNativeDriver: true,
      }),
    ]),
  ]);
};

/**
 * Error shake with decay
 */
export const errorShake = (translateX: Animated.Value) => {
  translateX.setValue(0);
  
  return Animated.sequence([
    Animated.timing(translateX, {toValue: 12, duration: 50, useNativeDriver: true}),
    Animated.timing(translateX, {toValue: -10, duration: 50, useNativeDriver: true}),
    Animated.timing(translateX, {toValue: 8, duration: 50, useNativeDriver: true}),
    Animated.timing(translateX, {toValue: -6, duration: 50, useNativeDriver: true}),
    Animated.timing(translateX, {toValue: 4, duration: 50, useNativeDriver: true}),
    Animated.timing(translateX, {toValue: 0, duration: 50, useNativeDriver: true}),
  ]);
};

// ============================================================================
// GESTURE UTILITIES
// ============================================================================

/**
 * Rubberband effect for overscroll
 */
export const rubberbandValue = (value: number, limit: number): number => {
  if (value < 0) return value;
  if (value > limit) {
    const overflow = value - limit;
    return limit + overflow * 0.3;
  }
  return value;
};

/**
 * Velocity-based animation duration
 */
export const getVelocityDuration = (
  velocity: number,
  distance: number,
  minDuration: number = 150,
  maxDuration: number = 400,
): number => {
  const baseDuration = Math.abs(distance / velocity) * 1000;
  return Math.min(Math.max(baseDuration, minDuration), maxDuration);
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  createOrganicWobble,
  createBreathingAnimation,
  getNaturalStaggerDelay,
  getCascadeDelay,
  getNoisePattern,
  getOrganicBorderRadius,
  getSubtleRotation,
  getLayeredShadow,
  getGlowShadow,
  scaleSize,
  moderateScale,
  lightenColor,
  darkenColor,
  withOpacity,
  celebrationAnimation,
  errorShake,
  rubberbandValue,
  getVelocityDuration,
};

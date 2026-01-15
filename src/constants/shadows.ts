/**
 * Shadow presets for consistent elevation throughout the app
 * Following Material Design-like shadow system
 * 
 * PIXEL PERFECT UPDATES:
 * - All offset values are even numbers
 * - Shadow radius values optimized for crisp rendering
 * - Platform-specific values for best results
 */

import {Platform, StyleSheet} from 'react-native';

// Hairline width for crisp 1px borders
export const HAIRLINE = StyleSheet.hairlineWidth;

// Platform-optimized shadow generator
const createShadow = (
  offsetY: number,
  opacity: number,
  radius: number,
  elevation: number,
  color: string = '#000000'
) => Platform.select({
  ios: {
    shadowColor: color,
    shadowOffset: {width: 0, height: offsetY},
    shadowOpacity: opacity,
    shadowRadius: radius,
  },
  android: {
    elevation: elevation,
    shadowColor: color,
  },
  default: {},
});

export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  
  // Ultra-subtle - barely visible lift
  xs: createShadow(1, 0.04, 2, 1),
  
  // Small - default card shadow  
  sm: createShadow(2, 0.06, 4, 2),
  
  // Medium - elevated cards
  md: createShadow(4, 0.08, 8, 4),
  
  // Large - modals, popovers
  lg: createShadow(8, 0.12, 16, 8),
  
  // Extra large - FABs, prominent elements
  xl: createShadow(12, 0.16, 24, 12),
  
  // ============================================================================
  // SEMANTIC SHADOWS - Use case specific
  // ============================================================================
  
  // Card shadow - soft, professional
  card: createShadow(2, 0.05, 6, 2),
  
  // Button shadow with brand color
  button: createShadow(4, 0.25, 8, 4, '#0066DC'),
  
  // Modal shadow
  modal: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: {width: 0, height: -4},
      shadowOpacity: 0.12,
      shadowRadius: 16,
    },
    android: {
      elevation: 16,
      shadowColor: '#000000',
    },
    default: {},
  }),
  
  // Floating elements (FAB, tooltips)
  floating: createShadow(8, 0.2, 20, 10),
  
  // Soft diffuse shadow for premium cards
  soft: createShadow(2, 0.03, 12, 2),
  
  // Focus ring shadow (accessibility)
  focus: Platform.select({
    ios: {
      shadowColor: '#0066DC',
      shadowOffset: {width: 0, height: 0},
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    android: {
      elevation: 0,
    },
    default: {},
  }),
};

/**
 * Animation timing constants
 * PIXEL PERFECT: All durations optimized for 60fps
 */
export const ANIMATION = {
  // Duration in milliseconds (multiples of ~16.67ms frame time)
  duration: {
    instant: 50,    // ~3 frames
    fast: 150,      // ~9 frames
    normal: 250,    // ~15 frames
    slow: 350,      // ~21 frames
    slower: 500,    // ~30 frames
  },
  
  // Spring configurations for react-native-reanimated
  spring: {
    gentle: {
      damping: 20,
      stiffness: 180,
      mass: 1,
    },
    default: {
      damping: 24,
      stiffness: 200,
      mass: 1,
    },
    snappy: {
      damping: 28,
      stiffness: 350,
      mass: 0.8,
    },
    bouncy: {
      damping: 12,
      stiffness: 300,
      mass: 0.8,
    },
  },
  
  // Scale values for press animations
  scale: {
    pressed: 0.97,
    hover: 1.02,
    subtle: 0.99,
  },
};

/**
 * Opacity values for consistent transparency
 */
export const OPACITY = {
  disabled: 0.5,
  muted: 0.6,
  subtle: 0.8,
  full: 1,
  
  overlay: {
    light: 0.3,
    medium: 0.5,
    dark: 0.7,
    heavy: 0.85,
  },
};

/**
 * Z-index values for layering
 */
export const Z_INDEX = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  toast: 800,
};

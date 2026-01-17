/**
 * Elite Design System
 * Google Material You + Apple HIG + Microsoft Fluent Design Standards
 * Premium design tokens for world-class mobile experiences
 */

import { Dimensions, Platform, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// RESPONSIVE TYPOGRAPHY - Fluid Type Scale (Like Apple Dynamic Type)
// ============================================================================
const fontScale = PixelRatio.getFontScale();
const baseUnit = 4;

// Calculate fluid font size based on screen width
const fluidSize = (minSize: number, maxSize: number): number => {
  const scale = SCREEN_WIDTH / 375; // Base on iPhone 8/SE width
  const clampedScale = Math.min(Math.max(scale, 0.85), 1.25);
  return Math.round((minSize + (maxSize - minSize) * (clampedScale - 0.85) / 0.4) * fontScale);
};

export const ELITE_TYPOGRAPHY = {
  // Apple SF Pro / Google Sans inspired font stack
  fontFamily: {
    display: Platform.select({ ios: 'SF Pro Display', android: 'sans-serif' }),
    text: Platform.select({ ios: 'SF Pro Text', android: 'sans-serif' }),
    rounded: Platform.select({ ios: 'SF Pro Rounded', android: 'sans-serif-medium' }),
    mono: Platform.select({ ios: 'SF Mono', android: 'monospace' }),
  },

  // Fluid Type Scale - Adjusts to screen size
  fluid: {
    micro: fluidSize(9, 10),      // Tiny labels, badges
    caption2: fluidSize(10, 11),  // Secondary captions
    caption: fluidSize(11, 12),   // Captions
    footnote: fluidSize(12, 13),  // Footnotes
    subhead: fluidSize(14, 15),   // Subheadings
    body: fluidSize(15, 17),      // Body text (Primary)
    callout: fluidSize(16, 18),   // Callouts
    headline: fluidSize(17, 19),  // Headlines
    title3: fluidSize(20, 22),    // Title 3
    title2: fluidSize(22, 26),    // Title 2
    title1: fluidSize(28, 32),    // Title 1
    largeTitle: fluidSize(34, 40), // Large titles
    display: fluidSize(48, 56),   // Hero displays
  },

  // Line Heights - Optimal for readability
  lineHeight: {
    none: 1,
    tight: 1.2,
    snug: 1.35,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter Spacing - Refined tracking
  tracking: {
    tighter: -0.8,
    tight: -0.4,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
    widest: 1.2,
  },

  // Font Weights - Semantic naming
  weight: {
    thin: '100' as const,
    extralight: '200' as const,
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
    black: '900' as const,
  },
};

// ============================================================================
// ELITE COLOR SYSTEM - Material You + Apple Color Harmony
// ============================================================================
export const ELITE_COLORS = {
  // Primary - Refined Blue (Material You Tonal Palette)
  primary: {
    5: '#F5F9FF',
    10: '#E8F2FF',
    20: '#CCDCFF',
    30: '#A8C4FF',
    40: '#7AA8FF',
    50: '#4C8DFF',
    60: '#1A73E8',  // Main
    70: '#1557B0',
    80: '#0D3C7A',
    90: '#062350',
    95: '#021333',
    99: '#010920',
  },

  // Secondary - Teal Harmony
  secondary: {
    5: '#F0FDFB',
    10: '#CCFBF1',
    20: '#99F6E4',
    30: '#5EEAD4',
    40: '#2DD4BF',
    50: '#14B8A6',  // Main
    60: '#0D9488',
    70: '#0F766E',
    80: '#115E59',
    90: '#134E4A',
    95: '#042F2E',
    99: '#021716',
  },

  // Tertiary - Violet Accent
  tertiary: {
    5: '#FAF5FF',
    10: '#F3E8FF',
    20: '#E9D5FF',
    30: '#D8B4FE',
    40: '#C084FC',
    50: '#4573DF',  // Main
    60: '#9333EA',
    70: '#7E22CE',
    80: '#6B21A8',
    90: '#581C87',
    95: '#3B0764',
    99: '#1E0338',
  },

  // Semantic - Status Colors
  success: {
    light: '#DCFCE7',
    main: '#22C55E',
    dark: '#15803D',
    contrast: '#FFFFFF',
  },
  warning: {
    light: '#FEF3C7',
    main: '#F59E0B',
    dark: '#B45309',
    contrast: '#000000',
  },
  error: {
    light: '#FEE2E2',
    main: '#EF4444',
    dark: '#B91C1C',
    contrast: '#FFFFFF',
  },
  info: {
    light: '#DBEAFE',
    main: '#4573DF',
    dark: '#1D4ED8',
    contrast: '#FFFFFF',
  },

  // Neutral - Slate Harmony (Perfect for dark mode)
  neutral: {
    0: '#FFFFFF',
    5: '#F8FAFC',
    10: '#F1F5F9',
    20: '#E2E8F0',
    30: '#CBD5E1',
    40: '#94A3B8',
    50: '#64748B',
    60: '#475569',
    70: '#334155',
    80: '#1E293B',
    90: '#0F172A',
    95: '#0B1120',
    99: '#030712',
    100: '#000000',
  },
};

// ============================================================================
// ELITE SPACING - 4px Grid with Golden Ratio Hints
// ============================================================================
export const ELITE_SPACING = {
  // Base 4px grid
  0: 0,
  px: 1,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,

  // Semantic Spacing
  touch: 44,        // Minimum touch target (Apple HIG)
  gutter: 16,       // Screen edge gutter
  cardPadding: 16,  // Card internal padding
  sectionGap: 24,   // Gap between sections
  screenPadding: 20, // Screen edge padding
  
  // Component-specific
  iconMargin: 8,
  buttonPadding: { h: 20, v: 12 },
  inputPadding: { h: 16, v: 14 },
  chipPadding: { h: 12, v: 6 },
};

// ============================================================================
// ELITE RADIUS - Squircle-inspired corners (Apple style)
// ============================================================================
export const ELITE_RADIUS = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  full: 9999,
  
  // Component-specific
  button: 12,
  card: 16,
  modal: 24,
  bottomSheet: 28,
  avatar: 9999,
  chip: 9999,
  input: 12,
};

// ============================================================================
// ELITE SHADOWS - Layered shadows for natural depth (Apple-style)
// ============================================================================
export const ELITE_SHADOWS = {
  // Light Theme Shadows
  light: {
    xs: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
      elevation: 1,
    },
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.16,
      shadowRadius: 32,
      elevation: 12,
    },
    '2xl': {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 24 },
      shadowOpacity: 0.2,
      shadowRadius: 48,
      elevation: 16,
    },
  },

  // Dark Theme Shadows - More subtle
  dark: {
    xs: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 1,
    },
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 2,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 20,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.4,
      shadowRadius: 32,
      elevation: 12,
    },
    '2xl': {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 24 },
      shadowOpacity: 0.5,
      shadowRadius: 48,
      elevation: 16,
    },
  },

  // Colored Shadows - For buttons and accents
  colored: (color: string, intensity: number = 0.35) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: intensity,
    shadowRadius: 16,
    elevation: 8,
  }),

  // Glow Effect
  glow: (color: string, intensity: number = 0.4) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: intensity,
    shadowRadius: 20,
    elevation: 10,
  }),
};

// ============================================================================
// ELITE MOTION - Spring Physics (Apple/Google Natural Motion)
// ============================================================================
export const ELITE_MOTION = {
  // Duration Tokens
  duration: {
    instant: 50,
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
    slowest: 700,
  },

  // Spring Configs - Natural physics-based animation
  spring: {
    // Micro - For tiny UI elements (checkboxes, toggles)
    micro: {
      damping: 20,
      stiffness: 400,
      mass: 0.5,
    },
    // Snappy - Quick response (buttons, selections)
    snappy: {
      damping: 26,
      stiffness: 350,
      mass: 0.8,
    },
    // Default - Balanced feel (cards, modals)
    default: {
      damping: 28,
      stiffness: 260,
      mass: 1,
    },
    // Expressive - Rich, dramatic motion
    expressive: {
      damping: 22,
      stiffness: 200,
      mass: 1.3,
    },
    // Gentle - Smooth transitions (page transitions)
    gentle: {
      damping: 24,
      stiffness: 180,
      mass: 1.2,
    },
    // Bouncy - Playful interactions
    bouncy: {
      damping: 10,
      stiffness: 280,
      mass: 0.8,
    },
    // Slow - Dramatic reveals
    slow: {
      damping: 35,
      stiffness: 120,
      mass: 1.5,
    },
  },

  // Cubic Bezier Curves (for non-spring animations)
  easing: {
    // Standard - Default for most animations
    standard: [0.4, 0.0, 0.2, 1.0],
    // Decelerate - Elements entering
    decelerate: [0.0, 0.0, 0.2, 1.0],
    // Accelerate - Elements leaving
    accelerate: [0.4, 0.0, 1.0, 1.0],
    // Sharp - Quick transitions
    sharp: [0.4, 0.0, 0.6, 1.0],
    // Emphasized - iOS style
    emphasized: [0.2, 0.0, 0.0, 1.0],
  },

  // Animation Presets
  presets: {
    // Button press
    buttonPress: {
      scale: { pressed: 0.96, default: 1 },
      duration: 100,
    },
    // Card tap
    cardTap: {
      scale: { pressed: 0.98, default: 1 },
      opacity: { pressed: 0.9, default: 1 },
    },
    // Page transition
    pageEnter: {
      translateX: { from: 100, to: 0 },
      opacity: { from: 0, to: 1 },
      duration: 350,
    },
    // Fade in
    fadeIn: {
      opacity: { from: 0, to: 1 },
      duration: 200,
    },
    // Slide up
    slideUp: {
      translateY: { from: 50, to: 0 },
      opacity: { from: 0, to: 1 },
      duration: 300,
    },
  },
};

// ============================================================================
// ELITE GLASS - Frosted Glass / Neumorphism
// ============================================================================
export const ELITE_GLASS = {
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    blur: 20,
  },
  lightSolid: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    blur: 16,
  },
  dark: {
    backgroundColor: 'rgba(29, 33, 39, 0.75)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    blur: 20,
  },
  darkSolid: {
    backgroundColor: 'rgba(39, 44, 52, 0.95)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    blur: 16,
  },
  accent: (color: string, opacity: number = 0.15) => ({
    backgroundColor: `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
    borderColor: `${color}30`,
    blur: 12,
  }),
};

// ============================================================================
// ELITE GRADIENTS
// ============================================================================
export const ELITE_GRADIENTS = {
  // Brand Gradients
  primary: ['#1A73E8', '#1557B0'],
  primarySoft: ['#E8F2FF', '#CCDCFF'],
  secondary: ['#14B8A6', '#0D9488'],
  tertiary: ['#4573DF', '#7E22CE'],

  // Premium Gradients
  sunset: ['#F97316', '#4573DF'],
  ocean: ['#06B6D4', '#4573DF'],
  aurora: ['#22D3EE', '#A78BFA', '#4573DF'],
  gold: ['#F59E0B', '#D97706'],
  emerald: ['#10B981', '#059669'],

  // Dark Mode Gradients
  darkCard: ['#1E293B', '#0F172A'],
  darkSurface: ['#334155', '#1E293B'],

  // Mesh-like multi-color
  mesh: {
    purple: ['#667EEA', '#764BA2', '#4573DF'],
    blue: ['#06B6D4', '#4573DF', '#4573DF'],
    green: ['#22C55E', '#14B8A6', '#06B6D4'],
  },
};

// ============================================================================
// Z-INDEX SYSTEM
// ============================================================================
export const ELITE_Z_INDEX = {
  base: 0,
  card: 1,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  popover: 50,
  tooltip: 60,
  toast: 70,
  notification: 80,
  max: 100,
};

// ============================================================================
// ACCESSIBILITY
// ============================================================================
export const ELITE_A11Y = {
  // Minimum touch target sizes
  touchTarget: {
    min: 44,      // Apple/Google minimum
    comfortable: 48,
    large: 56,
  },

  // Focus ring
  focusRing: {
    width: 3,
    offset: 2,
    color: ELITE_COLORS.primary[60],
  },

  // Contrast ratios (WCAG 2.1)
  contrast: {
    normal: 4.5,     // AA for normal text
    large: 3,        // AA for large text
    enhanced: 7,     // AAA for normal text
  },

  // Animation preferences
  motion: {
    reducedMotionDuration: 1,
    reducedMotionScale: 1,
  },
};

// ============================================================================
// SCREEN INFO
// ============================================================================
export const ELITE_SCREEN = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmall: SCREEN_WIDTH < 360,
  isMedium: SCREEN_WIDTH >= 360 && SCREEN_WIDTH < 390,
  isLarge: SCREEN_WIDTH >= 390 && SCREEN_WIDTH < 430,
  isXLarge: SCREEN_WIDTH >= 430,
  isTablet: SCREEN_WIDTH >= 768,
};

// ============================================================================
// ICON SIZES
// ============================================================================
export const ELITE_ICON_SIZE = {
  xs: 14,
  sm: 18,
  md: 22,
  lg: 26,
  xl: 30,
  '2xl': 36,
  '3xl': 44,
  '4xl': 56,
};

export default {
  ELITE_TYPOGRAPHY,
  ELITE_COLORS,
  ELITE_SPACING,
  ELITE_RADIUS,
  ELITE_SHADOWS,
  ELITE_MOTION,
  ELITE_GLASS,
  ELITE_GRADIENTS,
  ELITE_Z_INDEX,
  ELITE_A11Y,
  ELITE_SCREEN,
  ELITE_ICON_SIZE,
};




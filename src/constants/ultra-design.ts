/**
 * Ultra Premium Design System v2.0
 * World-Class Visual Quality - No Blur, No Artifacts
 * Crisp, Clean, Professional Designer-Grade Standards
 * 
 * Following Apple Human Interface Guidelines + Google Material Design 3
 * + Microsoft Fluent Design System
 */

import { Dimensions, Platform, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const pixelDensity = PixelRatio.get();

// ============================================================================
// PIXEL-PERFECT UTILITIES
// ============================================================================

/**
 * Ensures pixel-perfect rendering by rounding to nearest pixel
 * Prevents blurry rendering on high-DPI screens
 */
export const pixelPerfect = (size: number): number => {
  return PixelRatio.roundToNearestPixel(size);
};

/**
 * Get font size that scales properly without blur
 */
export const scaledFont = (size: number): number => {
  const scale = SCREEN_WIDTH / 375; // Base iPhone width
  const newSize = size * Math.min(Math.max(scale, 0.9), 1.15);
  return Math.round(newSize * PixelRatio.getFontScale());
};

// ============================================================================
// ULTRA COLOR PALETTE - Lab Color Space Optimized
// ============================================================================

export const ULTRA_COLORS = {
  // Primary Brand - Professionally calibrated blue
  primary: {
    50: '#EBF5FF',
    100: '#D6EBFF',
    200: '#ADD6FF',
    300: '#85C1FF',
    400: '#5CADFF',
    500: '#3399FF',  // Main - Optimal contrast ratio
    600: '#0077E6',
    700: '#005CB3',
    800: '#004080',
    900: '#00264D',
    950: '#001A33',
  },

  // Secondary - Teal Accent
  secondary: {
    50: '#EFFEFB',
    100: '#C7FFF3',
    200: '#8FFFE7',
    300: '#50F5D6',
    400: '#1AE5C1',
    500: '#00CDA8',  // Main
    600: '#00A88A',
    700: '#00856E',
    800: '#006655',
    900: '#00473C',
    950: '#002D26',
  },

  // Accent - Premium Purple
  accent: {
    50: '#F6F3FF',
    100: '#EDE8FF',
    200: '#DCD4FF',
    300: '#C4B5FF',
    400: '#A890FF',
    500: '#4573DF',  // Main
    600: '#3660C9',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
    950: '#2E1065',
  },

  // Success - Vibrant Green (WCAG AAA)
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',  // Main
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
    950: '#022C22',
  },

  // Warning - Amber (High visibility)
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',  // Main
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
    950: '#451A03',
  },

  // Error - Crisp Red (Clear visibility)
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',  // Main
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
    950: '#450A0A',
  },

  // Neutral - Carefully balanced slate
  neutral: {
    0: '#FFFFFF',
    50: '#F8FAFC',
    100: '#F1F5F9',
    150: '#EAEFF5',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    850: '#172032',
    900: '#0F172A',
    950: '#020617',
  },
};

// ============================================================================
// ULTRA TYPOGRAPHY - Crystal Clear Text
// ============================================================================

export const ULTRA_TYPOGRAPHY = {
  // Font family - Native system fonts for best rendering
  fontFamily: {
    display: Platform.select({
      ios: 'SF Pro Display',
      android: 'sans-serif-medium',
      default: 'System',
    }),
    text: Platform.select({
      ios: 'SF Pro Text',
      android: 'sans-serif',
      default: 'System',
    }),
    rounded: Platform.select({
      ios: 'SF Pro Rounded',
      android: 'sans-serif-medium',
      default: 'System',
    }),
    mono: Platform.select({
      ios: 'SF Mono',
      android: 'monospace',
      default: 'monospace',
    }),
  },

  // Precise type scale - No fractional pixels
  scale: {
    micro: pixelPerfect(10),
    caption2: pixelPerfect(11),
    caption: pixelPerfect(12),
    footnote: pixelPerfect(13),
    subhead: pixelPerfect(14),
    callout: pixelPerfect(15),
    body: pixelPerfect(16),
    headline: pixelPerfect(17),
    title3: pixelPerfect(20),
    title2: pixelPerfect(22),
    title1: pixelPerfect(26),
    largeTitle: pixelPerfect(34),
    display2: pixelPerfect(44),
    display1: pixelPerfect(56),
  },

  // Line heights - Optimal for readability (always even numbers)
  lineHeight: {
    tight: 1.2,
    snug: 1.35,
    normal: 1.5,
    relaxed: 1.625,
    loose: 1.75,
  },

  // Letter spacing - Precise tracking
  tracking: {
    tighter: -0.8,
    tight: -0.4,
    normal: 0,
    wide: 0.2,
    wider: 0.4,
    widest: 0.8,
  },

  // Font weights - Use numeric for consistency
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
// ULTRA SPACING - Pixel-Perfect 4px Grid
// ============================================================================

export const ULTRA_SPACING = {
  // Base grid (4px)
  0: 0,
  px: pixelPerfect(1),
  0.5: pixelPerfect(2),
  1: pixelPerfect(4),
  1.5: pixelPerfect(6),
  2: pixelPerfect(8),
  2.5: pixelPerfect(10),
  3: pixelPerfect(12),
  3.5: pixelPerfect(14),
  4: pixelPerfect(16),
  5: pixelPerfect(20),
  6: pixelPerfect(24),
  7: pixelPerfect(28),
  8: pixelPerfect(32),
  9: pixelPerfect(36),
  10: pixelPerfect(40),
  11: pixelPerfect(44),
  12: pixelPerfect(48),
  14: pixelPerfect(56),
  16: pixelPerfect(64),
  20: pixelPerfect(80),
  24: pixelPerfect(96),
  32: pixelPerfect(128),

  // Semantic spacing
  none: 0,
  xxs: pixelPerfect(2),
  xs: pixelPerfect(4),
  sm: pixelPerfect(8),
  md: pixelPerfect(16),
  lg: pixelPerfect(24),
  xl: pixelPerfect(32),
  xxl: pixelPerfect(40),
  xxxl: pixelPerfect(48),

  // Component spacing
  screenPadding: pixelPerfect(20),
  cardPadding: pixelPerfect(16),
  sectionGap: pixelPerfect(24),
  touchTarget: pixelPerfect(44),
};

// ============================================================================
// ULTRA RADIUS - Smooth Rounded Corners
// ============================================================================

export const ULTRA_RADIUS = {
  none: 0,
  xs: pixelPerfect(4),
  sm: pixelPerfect(6),
  md: pixelPerfect(8),
  lg: pixelPerfect(12),
  xl: pixelPerfect(16),
  '2xl': pixelPerfect(20),
  '3xl': pixelPerfect(24),
  '4xl': pixelPerfect(32),
  full: 9999,

  // Component-specific
  button: pixelPerfect(12),
  card: pixelPerfect(16),
  modal: pixelPerfect(24),
  sheet: pixelPerfect(28),
  input: pixelPerfect(12),
  chip: pixelPerfect(20),
  avatar: 9999,
};

// ============================================================================
// ULTRA SHADOWS - Crisp, Non-Blurry Shadows
// ============================================================================

/**
 * Shadow system designed for crisp rendering:
 * - Uses optimal offset values for sharp edges
 * - Controlled opacity prevents muddy appearance
 * - Proper elevation for Android
 */
export const ULTRA_SHADOWS = {
  // Light theme shadows - Soft and professional
  light: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    xs: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: pixelPerfect(1) },
      shadowOpacity: 0.03,
      shadowRadius: pixelPerfect(3),
      elevation: 1,
    },
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: pixelPerfect(2) },
      shadowOpacity: 0.05,
      shadowRadius: pixelPerfect(6),
      elevation: 2,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: pixelPerfect(4) },
      shadowOpacity: 0.08,
      shadowRadius: pixelPerfect(12),
      elevation: 4,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: pixelPerfect(8) },
      shadowOpacity: 0.1,
      shadowRadius: pixelPerfect(24),
      elevation: 8,
    },
    xl: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: pixelPerfect(12) },
      shadowOpacity: 0.12,
      shadowRadius: pixelPerfect(32),
      elevation: 12,
    },
    '2xl': {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: pixelPerfect(20) },
      shadowOpacity: 0.15,
      shadowRadius: pixelPerfect(48),
      elevation: 16,
    },
  },

  // Dark theme shadows - Deeper for dark mode
  dark: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    xs: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: pixelPerfect(1) },
      shadowOpacity: 0.15,
      shadowRadius: pixelPerfect(3),
      elevation: 1,
    },
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: pixelPerfect(2) },
      shadowOpacity: 0.2,
      shadowRadius: pixelPerfect(6),
      elevation: 2,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: pixelPerfect(4) },
      shadowOpacity: 0.25,
      shadowRadius: pixelPerfect(12),
      elevation: 4,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: pixelPerfect(8) },
      shadowOpacity: 0.3,
      shadowRadius: pixelPerfect(24),
      elevation: 8,
    },
    xl: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: pixelPerfect(12) },
      shadowOpacity: 0.35,
      shadowRadius: pixelPerfect(32),
      elevation: 12,
    },
    '2xl': {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: pixelPerfect(20) },
      shadowOpacity: 0.4,
      shadowRadius: pixelPerfect(48),
      elevation: 16,
    },
  },

  // Colored shadows for buttons and accents
  colored: (color: string, intensity: number = 0.3) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: pixelPerfect(6) },
    shadowOpacity: intensity,
    shadowRadius: pixelPerfect(16),
    elevation: 8,
  }),

  // Glow effect for focus/accent
  glow: (color: string, intensity: number = 0.35) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: intensity,
    shadowRadius: pixelPerfect(20),
    elevation: 10,
  }),

  // Inner shadow simulation (for pressed states)
  inner: {
    light: {
      backgroundColor: 'rgba(0,0,0,0.03)',
    },
    dark: {
      backgroundColor: 'rgba(0,0,0,0.15)',
    },
  },
};

// ============================================================================
// ULTRA MOTION - Smooth, Jank-Free Animations
// ============================================================================

export const ULTRA_MOTION = {
  // Duration tokens (ms)
  duration: {
    instant: 50,
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
    slowest: 700,
  },

  // Spring configurations - Physics-based for natural feel
  spring: {
    // Micro interactions (checkboxes, toggles)
    micro: {
      damping: 22,
      stiffness: 450,
      mass: 0.5,
    },
    // Quick response (buttons, selections)
    snappy: {
      damping: 28,
      stiffness: 380,
      mass: 0.8,
    },
    // Default balanced motion
    default: {
      damping: 26,
      stiffness: 280,
      mass: 1,
    },
    // Smooth transitions (modals, sheets)
    gentle: {
      damping: 24,
      stiffness: 200,
      mass: 1.2,
    },
    // Expressive motion (hero elements)
    expressive: {
      damping: 18,
      stiffness: 240,
      mass: 1.1,
    },
    // Bouncy feedback
    bouncy: {
      damping: 12,
      stiffness: 320,
      mass: 0.8,
    },
  },

  // Easing curves for timing-based animations
  easing: {
    // Standard Material curve
    standard: [0.4, 0.0, 0.2, 1.0],
    // Elements entering screen
    decelerate: [0.0, 0.0, 0.2, 1.0],
    // Elements leaving screen
    accelerate: [0.4, 0.0, 1.0, 1.0],
    // Apple-style emphasis
    emphasized: [0.2, 0.0, 0.0, 1.0],
  },

  // Pre-defined animation presets
  presets: {
    buttonPress: {
      scale: { pressed: 0.97, default: 1 },
      duration: 100,
    },
    cardTap: {
      scale: { pressed: 0.985, default: 1 },
      opacity: { pressed: 0.92, default: 1 },
    },
    listItem: {
      scale: { pressed: 0.99, default: 1 },
    },
    fab: {
      scale: { pressed: 0.94, default: 1 },
    },
  },
};

// ============================================================================
// ULTRA GLASS - Premium Glassmorphism
// ============================================================================

export const ULTRA_GLASS = {
  // Light theme glass
  light: {
    subtle: {
      backgroundColor: 'rgba(255, 255, 255, 0.72)',
      borderColor: 'rgba(255, 255, 255, 0.4)',
      borderWidth: pixelPerfect(1),
    },
    medium: {
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      borderColor: 'rgba(255, 255, 255, 0.6)',
      borderWidth: pixelPerfect(1),
    },
    solid: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0.8)',
      borderWidth: pixelPerfect(1),
    },
  },

  // Dark theme glass
  dark: {
    subtle: {
      backgroundColor: 'rgba(29, 33, 39, 0.72)',
      borderColor: 'rgba(255, 255, 255, 0.08)',
      borderWidth: pixelPerfect(1),
    },
    medium: {
      backgroundColor: 'rgba(39, 44, 52, 0.85)',
      borderColor: 'rgba(255, 255, 255, 0.12)',
      borderWidth: pixelPerfect(1),
    },
    solid: {
      backgroundColor: 'rgba(39, 44, 52, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0.15)',
      borderWidth: pixelPerfect(1),
    },
  },

  // Accent glass (for colored backgrounds)
  accent: (color: string, opacity: number = 0.15) => ({
    backgroundColor: `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
    borderColor: `${color}30`,
    borderWidth: pixelPerfect(1),
  }),
};

// ============================================================================
// ULTRA GRADIENTS - Smooth Color Transitions
// ============================================================================

export const ULTRA_GRADIENTS = {
  // Brand gradients
  primary: {
    colors: ['#3399FF', '#0077E6'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  secondary: {
    colors: ['#00CDA8', '#00A88A'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  accent: {
    colors: ['#4573DF', '#6D28D9'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },

  // Premium gradients
  premium: {
    colors: ['#667EEA', '#764BA2'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  sunset: {
    colors: ['#F97316', '#4573DF'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  ocean: {
    colors: ['#06B6D4', '#4573DF'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  aurora: {
    colors: ['#22D3EE', '#A78BFA', '#4573DF'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  gold: {
    colors: ['#F59E0B', '#D97706'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  emerald: {
    colors: ['#10B981', '#059669'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },

  // Hero gradients
  hero: {
    light: {
      colors: ['#3399FF', '#0077E6', '#005CB3'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    dark: {
      colors: ['#0F172A', '#1E293B', '#334155'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
  },

  // Card backgrounds
  card: {
    light: {
      colors: ['#FFFFFF', '#F8FAFC'],
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
    },
    dark: {
      colors: ['#1E293B', '#0F172A'],
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
    },
  },

  // Status gradients
  success: {
    colors: ['#22C55E', '#16A34A'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  warning: {
    colors: ['#F59E0B', '#D97706'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  error: {
    colors: ['#EF4444', '#DC2626'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
};

// ============================================================================
// Z-INDEX LAYERING SYSTEM
// ============================================================================

export const ULTRA_Z_INDEX = {
  hide: -1,
  base: 0,
  raised: 1,
  card: 5,
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
// ACCESSIBILITY CONSTANTS
// ============================================================================

export const ULTRA_A11Y = {
  // Touch targets (Apple HIG minimum: 44px)
  touchTarget: {
    min: pixelPerfect(44),
    comfortable: pixelPerfect(48),
    large: pixelPerfect(56),
  },

  // Focus indicators
  focus: {
    width: pixelPerfect(3),
    offset: pixelPerfect(2),
    color: ULTRA_COLORS.primary[500],
  },

  // Contrast ratios (WCAG 2.1)
  contrast: {
    normal: 4.5,
    large: 3,
    enhanced: 7,
  },

  // Reduced motion preferences
  motion: {
    reducedDuration: 0,
    reducedScale: 1,
  },
};

// ============================================================================
// SCREEN INFORMATION
// ============================================================================

export const ULTRA_SCREEN = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  pixelDensity,
  isHighDensity: pixelDensity >= 3,
  isSmall: SCREEN_WIDTH < 360,
  isMedium: SCREEN_WIDTH >= 360 && SCREEN_WIDTH < 390,
  isLarge: SCREEN_WIDTH >= 390 && SCREEN_WIDTH < 430,
  isXLarge: SCREEN_WIDTH >= 430,
  isTablet: SCREEN_WIDTH >= 768,
};

// ============================================================================
// ICON SIZES
// ============================================================================

export const ULTRA_ICON_SIZE = {
  xs: pixelPerfect(14),
  sm: pixelPerfect(18),
  md: pixelPerfect(22),
  lg: pixelPerfect(26),
  xl: pixelPerfect(30),
  '2xl': pixelPerfect(36),
  '3xl': pixelPerfect(44),
  '4xl': pixelPerfect(56),
};

// ============================================================================
// BORDER WIDTHS
// ============================================================================

export const ULTRA_BORDER = {
  none: 0,
  hairline: pixelPerfect(1 / pixelDensity), // True hairline
  thin: pixelPerfect(1),
  medium: pixelPerfect(1.5),
  thick: pixelPerfect(2),
  heavy: pixelPerfect(3),
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  pixelPerfect,
  scaledFont,
  ULTRA_COLORS,
  ULTRA_TYPOGRAPHY,
  ULTRA_SPACING,
  ULTRA_RADIUS,
  ULTRA_SHADOWS,
  ULTRA_MOTION,
  ULTRA_GLASS,
  ULTRA_GRADIENTS,
  ULTRA_Z_INDEX,
  ULTRA_A11Y,
  ULTRA_SCREEN,
  ULTRA_ICON_SIZE,
  ULTRA_BORDER,
};




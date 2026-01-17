/**
 * Premium Design System Constants
 * Professional-grade design tokens for production-ready UI
 */

import {Dimensions, Platform} from 'react-native';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// ============================================================================
// TYPOGRAPHY SCALE - Modular Scale (1.25 ratio)
// ============================================================================
export const TYPOGRAPHY = {
  // Font families - Premium font stack with fallbacks
  fontFamily: {
    regular: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    medium: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    semibold: Platform.select({
      ios: 'System',
      android: 'sans-serif-medium',
      default: 'System',
    }),
    bold: Platform.select({
      ios: 'System',
      android: 'sans-serif-medium',
      default: 'System',
    }),
    mono: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
  
  // Type scale using modular scale (1.25)
  scale: {
    caption2: 10,
    caption: 11,
    footnote: 12,
    subhead: 13,
    callout: 14,
    body: 15,
    bodyLarge: 16,
    headline: 17,
    title3: 19,
    title2: 22,
    title1: 26,
    largeTitle: 32,
    display3: 40,
    display2: 48,
    display1: 56,
  },
  
  // Semantic sizes alias for convenience
  sizes: {
    '2xs': 10,
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    xxl: 22,
    '3xl': 28,
    xxxl: 28,
    display: 32,
  },
  
  // Line heights for optimal readability
  lineHeight: {
    tight: 1.15,
    snug: 1.25,
    normal: 1.4,
    relaxed: 1.5,
    loose: 1.65,
  },
  
  // Letter spacing
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
    widest: 1,
  },
  
  // Font weights
  weight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
};

// ============================================================================
// PREMIUM COLOR PALETTE
// ============================================================================
export const PALETTE = {
  // Primary Brand Colors - Refined blue
  primary: {
    50: '#EEF6FF',
    100: '#D9EBFF',
    200: '#B5D7FF',
    300: '#7ABBFF',
    400: '#3B97FF',
    500: '#1A7AEB',
    600: '#0F62CC',
    700: '#0A4FA3',
    800: '#084086',
    900: '#06336B',
    950: '#041F45',
  },
  
  // Secondary - Teal accent
  secondary: {
    50: '#EEFDFB',
    100: '#D5F9F5',
    200: '#AEF2EC',
    300: '#76E7DF',
    400: '#38D4C9',
    500: '#14B8AA',
    600: '#0E9688',
    700: '#107770',
    800: '#125F5B',
    900: '#144E4B',
    950: '#052E2C',
  },
  
  // Success - Emerald green
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
    950: '#022C22',
  },
  
  // Warning - Amber
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
    950: '#451A03',
  },
  
  // Error - Red
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
    950: '#450A0A',
  },
  
  // Neutral - Slate gray
  neutral: {
    0: '#FFFFFF',
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },
};

// ============================================================================
// PREMIUM SHADOWS - Layered shadow system
// ============================================================================
export const SHADOWS = {
  // Soft shadows for cards and surfaces
  soft: {
    xs: {
      shadowColor: PALETTE.neutral[900],
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.04,
      shadowRadius: 2,
      elevation: 1,
    },
    sm: {
      shadowColor: PALETTE.neutral[900],
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    md: {
      shadowColor: PALETTE.neutral[900],
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    lg: {
      shadowColor: PALETTE.neutral[900],
      shadowOffset: {width: 0, height: 8},
      shadowOpacity: 0.10,
      shadowRadius: 20,
      elevation: 6,
    },
    xl: {
      shadowColor: PALETTE.neutral[900],
      shadowOffset: {width: 0, height: 12},
      shadowOpacity: 0.12,
      shadowRadius: 28,
      elevation: 8,
    },
  },
  
  // Colored shadows for buttons and accents
  colored: {
    primary: {
      shadowColor: PALETTE.primary[500],
      shadowOffset: {width: 0, height: 3},
      shadowOpacity: 0.18,
      shadowRadius: 8,
      elevation: 4,
    },
    secondary: {
      shadowColor: PALETTE.secondary[500],
      shadowOffset: {width: 0, height: 3},
      shadowOpacity: 0.18,
      shadowRadius: 8,
      elevation: 4,
    },
    success: {
      shadowColor: PALETTE.success[500],
      shadowOffset: {width: 0, height: 3},
      shadowOpacity: 0.18,
      shadowRadius: 8,
      elevation: 4,
    },
    warning: {
      shadowColor: PALETTE.warning[500],
      shadowOffset: {width: 0, height: 3},
      shadowOpacity: 0.18,
      shadowRadius: 8,
      elevation: 4,
    },
  },
  
  // Glass shadow for floating elements
  glass: {
    shadowColor: PALETTE.neutral[900],
    shadowOffset: {width: 0, height: 16},
    shadowOpacity: 0.06,
    shadowRadius: 32,
    elevation: 10,
  },
  
  // Inner shadow simulation
  inner: {
    shadowColor: PALETTE.neutral[900],
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 0,
  },
};

// ============================================================================
// SPACING SYSTEM - 4px base grid with semantic aliases
// ============================================================================
export const SPACING = {
  // Numeric scale (Tailwind-style)
  px: 1,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
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
  36: 144,
  40: 160,
  
  // Semantic aliases for common usage
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
  '2xl': 40,
  '3xl': 48,
  '4xl': 64,
  '5xl': 80,
};

// ============================================================================
// BORDER RADIUS - Consistent corner rounding
// ============================================================================
export const RADIUS = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  xxxl: 24,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
  full: 9999,
};

// ============================================================================
// ANIMATION CONSTANTS
// ============================================================================
export const ANIMATION = {
  // Durations
  duration: {
    instant: 50,
    faster: 100,
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 450,
    slowest: 600,
  },
  
  // Easing curves for natural motion
  easing: {
    // Standard Material Design easing
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    // Deceleration curve for entering elements
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    // Acceleration curve for leaving elements  
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
    // Sharp curve for elements that leave & return
    sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
  },
  
  // Spring configurations
  spring: {
    // Gentle - for large elements
    gentle: {
      damping: 20,
      stiffness: 180,
      mass: 1,
    },
    // Default - balanced feel
    default: {
      damping: 26,
      stiffness: 240,
      mass: 1,
    },
    // Snappy - for small UI elements
    snappy: {
      damping: 32,
      stiffness: 400,
      mass: 0.8,
    },
    // Bouncy - for playful interactions
    bouncy: {
      damping: 12,
      stiffness: 300,
      mass: 0.8,
    },
  },
};

// ============================================================================
// GLASSMORPHISM PRESETS
// ============================================================================
export const GLASS = {
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    backdropBlur: 20,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  dark: {
    backgroundColor: 'rgba(30, 41, 59, 0.78)',
    backdropBlur: 20,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  frosted: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropBlur: 16,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  // Ultra-modern aurora glass effect
  aurora: {
    light: {
      backgroundColor: 'rgba(255, 255, 255, 0.65)',
      borderColor: 'rgba(255, 255, 255, 0.35)',
      borderWidth: 1.5,
    },
    dark: {
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
    },
  },
  // Premium card glass
  premium: {
    light: {
      backgroundColor: 'rgba(255, 255, 255, 0.88)',
      borderColor: 'rgba(26, 122, 235, 0.15)',
      borderWidth: 1,
    },
    dark: {
      backgroundColor: 'rgba(30, 41, 59, 0.88)',
      borderColor: 'rgba(26, 122, 235, 0.2)',
      borderWidth: 1,
    },
  },
};

// ============================================================================
// MODERN UI EFFECTS - Advanced visual enhancements
// ============================================================================
export const EFFECTS = {
  // Glow effects for emphasis
  glow: {
    primary: {
      shadowColor: PALETTE.primary[500],
      shadowOffset: {width: 0, height: 0},
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 6,
    },
    success: {
      shadowColor: PALETTE.success[500],
      shadowOffset: {width: 0, height: 0},
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 6,
    },
    accent: {
      shadowColor: '#667eea',
      shadowOffset: {width: 0, height: 0},
      shadowOpacity: 0.18,
      shadowRadius: 14,
      elevation: 6,
    },
  },
  // Depth layers for 3D effect
  depth: {
    subtle: {
      transform: [{perspective: 1000}],
    },
    medium: {
      transform: [{perspective: 800}],
    },
    strong: {
      transform: [{perspective: 600}],
    },
  },
  // Shimmer animation timings
  shimmer: {
    fast: 800,
    normal: 1200,
    slow: 1800,
  },
};

// ============================================================================
// GRADIENTS - Modern gradient presets
// ============================================================================
export const GRADIENTS = {
  primary: {
    colors: [PALETTE.primary[500], PALETTE.primary[600]],
    start: {x: 0, y: 0},
    end: {x: 1, y: 1},
  },
  secondary: {
    colors: [PALETTE.secondary[500], PALETTE.secondary[600]],
    start: {x: 0, y: 0},
    end: {x: 1, y: 1},
  },
  success: {
    colors: [PALETTE.success[500], PALETTE.success[600]],
    start: {x: 0, y: 0},
    end: {x: 1, y: 1},
  },
  premium: {
    colors: ['#667eea', '#764ba2'],
    start: {x: 0, y: 0},
    end: {x: 1, y: 1},
  },
  sunset: {
    colors: ['#f093fb', '#f5576c'],
    start: {x: 0, y: 0},
    end: {x: 1, y: 1},
  },
  ocean: {
    colors: ['#00d4ff', '#0099ff'],
    start: {x: 0, y: 0},
    end: {x: 1, y: 1},
  },
  // Mesh gradient simulation
  meshPrimary: {
    colors: [PALETTE.primary[400], PALETTE.primary[500], PALETTE.secondary[500]],
    start: {x: 0, y: 0},
    end: {x: 1, y: 1},
  },
  // Modern aurora gradients
  aurora: {
    colors: ['#667eea', '#764ba2', '#f093fb'],
    start: {x: 0, y: 0},
    end: {x: 1, y: 1},
  },
  auroraLight: {
    colors: ['#E8F4FD', '#F3E8FF', '#FCE7F3'],
    start: {x: 0, y: 0},
    end: {x: 1, y: 1},
  },
  auroraDark: {
    colors: ['#1a1a2e', '#16213e', '#0f3460'],
    start: {x: 0, y: 0},
    end: {x: 1, y: 1},
  },
  // Glassmorphism backgrounds
  glassDark: {
    colors: ['rgba(30, 41, 59, 0.9)', 'rgba(15, 23, 42, 0.85)'],
    start: {x: 0, y: 0},
    end: {x: 0, y: 1},
  },
  glassLight: {
    colors: ['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.9)'],
    start: {x: 0, y: 0},
    end: {x: 0, y: 1},
  },
  // Hero section gradients
  heroBlue: {
    colors: ['#1A7AEB', '#0F62CC', '#0A4FA3'],
    start: {x: 0, y: 0},
    end: {x: 1, y: 1},
  },
  heroNight: {
    colors: ['#0F172A', '#1E293B', '#334155'],
    start: {x: 0, y: 0},
    end: {x: 1, y: 1},
  },
  // Card accent gradients
  cardAccent: {
    medical: ['#E53935', '#EF5350'],
    engineering: ['#1565C0', '#1E88E5'],
    business: ['#2E7D32', '#43A047'],
    arts: ['#7B1FA2', '#9C27B0'],
    tech: ['#00897B', '#26A69A'],
  },
};

// ============================================================================
// Z-INDEX LAYERS
// ============================================================================
export const Z_INDEX = {
  hide: -1,
  base: 0,
  raised: 1,
  dropdown: 10,
  sticky: 20,
  banner: 30,
  overlay: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80,
  max: 100,
};

// ============================================================================
// OPACITY LEVELS
// ============================================================================
export const OPACITY = {
  0: 0,
  5: 0.05,
  10: 0.1,
  20: 0.2,
  25: 0.25,
  30: 0.3,
  40: 0.4,
  50: 0.5,
  60: 0.6,
  70: 0.7,
  75: 0.75,
  80: 0.8,
  90: 0.9,
  95: 0.95,
  100: 1,
};

// ============================================================================
// SCREEN DIMENSIONS
// ============================================================================
export const SCREEN = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmall: SCREEN_WIDTH < 375,
  isMedium: SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414,
  isLarge: SCREEN_WIDTH >= 414,
};

// ============================================================================
// BREAKPOINTS
// ============================================================================
export const BREAKPOINTS = {
  xs: 0,
  sm: 360,
  md: 375,
  lg: 414,
  xl: 480,
};

// ============================================================================
// ICON SIZES
// ============================================================================
export const ICON_SIZE = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
};

// ============================================================================
// HAPTIC FEEDBACK PATTERNS
// ============================================================================
export const HAPTIC = {
  light: 'impactLight',
  medium: 'impactMedium',
  heavy: 'impactHeavy',
  selection: 'selection',
  success: 'notificationSuccess',
  warning: 'notificationWarning',
  error: 'notificationError',
};

// ============================================================================
// ACCESSIBILITY
// ============================================================================
export const A11Y = {
  minTouchTarget: 44,
  minContrastRatio: 4.5,
  largeTextContrastRatio: 3,
  focusRingWidth: 2,
  focusRingOffset: 2,
};

// ============================================================================
// PREMIUM_DESIGN - Backward-compatible alias
// Some parts of the codebase expect a consolidated design-token object.
// ============================================================================

export const PREMIUM_DESIGN = {
  typography: TYPOGRAPHY,
  spacing: {
    xxs: SPACING.xxs,
    xs: SPACING.xs,
    sm: SPACING.sm,
    md: SPACING.md,
    lg: SPACING.lg,
    xl: SPACING.xl,
    xxl: SPACING.xxl,
    xxxl: SPACING.xxxl,
  },
  borderRadius: RADIUS,
  colors: {
    primary: {
      main: PALETTE.primary[500],
      light: PALETTE.primary[300],
      dark: PALETTE.primary[700],
    },
    secondary: {
      main: PALETTE.secondary[500],
      light: PALETTE.secondary[300],
      dark: PALETTE.secondary[700],
    },
    success: PALETTE.success[500],
    warning: PALETTE.warning[500],
    error: PALETTE.error[500],
    neutral: PALETTE.neutral,
  },
} as const;

// ============================================================================
// SEMANTIC STATUS COLORS - For urgency, countdown, and status indicators
// ============================================================================
export const STATUS_COLORS = {
  // Urgency levels for countdowns and deadlines
  urgency: {
    critical: PALETTE.error[500],    // <= 7 days
    warning: PALETTE.warning[500],   // <= 30 days  
    safe: PALETTE.success[500],      // > 30 days
    neutral: PALETTE.neutral[400],   // No deadline
  },
  
  // Category colors for entry tests
  category: {
    engineering: PALETTE.primary[500],
    medical: PALETTE.error[500],
    business: PALETTE.secondary[500],
    general: PALETTE.neutral[500],
  },
  
  // Badge/chip backgrounds (with alpha)
  backgrounds: {
    error: `${PALETTE.error[500]}15`,
    warning: `${PALETTE.warning[500]}15`,
    success: `${PALETTE.success[500]}15`,
    info: `${PALETTE.primary[500]}15`,
    neutral: `${PALETTE.neutral[500]}15`,
  },
};

// Helper function to get urgency color based on days remaining
export const getUrgencyColor = (days: number | null): string => {
  if (days === null) return STATUS_COLORS.urgency.neutral;
  if (days <= 7) return STATUS_COLORS.urgency.critical;
  if (days <= 30) return STATUS_COLORS.urgency.warning;
  return STATUS_COLORS.urgency.safe;
};

// Default export includes all tokens
export default {
  TYPOGRAPHY,
  PALETTE,
  STATUS_COLORS,
  getUrgencyColor,
  SHADOWS,
  SPACING,
  RADIUS,
  ANIMATION,
  GLASS,
  EFFECTS,
  GRADIENTS,
  Z_INDEX,
  OPACITY,
  SCREEN,
  BREAKPOINTS,
  ICON_SIZE,
  HAPTIC,
  A11Y,
  PREMIUM_DESIGN,
};

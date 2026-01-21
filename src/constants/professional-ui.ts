/**
 * Professional UI Constants
 * Senior Developer Level Design Tokens & Utilities
 * 
 * These constants ensure visual consistency and professional polish
 * across the entire PakUni application.
 * 
 * @author PakUni Development Team
 * @version 2.1.0
 */

import {Platform, Dimensions, PixelRatio, StyleSheet} from 'react-native';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// ============================================================================
// PIXEL PERFECT UTILITIES
// ============================================================================

/**
 * Round to nearest pixel for crisp rendering
 */
export const toPixel = (size: number): number => {
  return PixelRatio.roundToNearestPixel(size);
};

/**
 * Scale based on screen width (375 is base iPhone width)
 */
export const scaleWidth = (size: number): number => {
  const scale = SCREEN_WIDTH / 375;
  return toPixel(size * Math.min(scale, 1.3)); // Cap at 1.3x
};

/**
 * Scale font size with accessibility consideration
 */
export const scaleFont = (size: number): number => {
  const scale = SCREEN_WIDTH / 375;
  const fontScale = PixelRatio.getFontScale();
  return toPixel(size * Math.min(scale, 1.2) * Math.min(fontScale, 1.3));
};

// ============================================================================
// PROFESSIONAL SHADOW PRESETS
// iOS-quality shadows that work cross-platform
// ============================================================================

export const SHADOWS = {
  /** Subtle elevation for cards */
  card: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.04,
      shadowRadius: 8,
    },
    android: {
      elevation: 2,
    },
  }),

  /** Medium elevation for buttons & active elements */
  button: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: {width: 0, height: 3},
      shadowOpacity: 0.08,
      shadowRadius: 12,
    },
    android: {
      elevation: 4,
    },
  }),

  /** Strong elevation for modals & overlays */
  modal: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: {width: 0, height: 8},
      shadowOpacity: 0.15,
      shadowRadius: 24,
    },
    android: {
      elevation: 12,
    },
  }),

  /** Floating action button shadow */
  fab: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: {width: 0, height: 6},
      shadowOpacity: 0.18,
      shadowRadius: 16,
    },
    android: {
      elevation: 8,
    },
  }),

  /** Colored shadow for primary buttons */
  primary: (color: string) => Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.25,
      shadowRadius: 12,
    },
    android: {
      elevation: 6,
    },
  }),

  /** No shadow */
  none: {
    shadowColor: 'transparent',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
} as const;

// ============================================================================
// PROFESSIONAL TYPOGRAPHY
// ============================================================================

export const FONT_WEIGHTS = {
  thin: '100' as const,
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const,
};

export const LINE_HEIGHTS = {
  tight: 1.15,
  normal: 1.4,
  relaxed: 1.6,
  loose: 1.8,
};

export const LETTER_SPACING = {
  tighter: -0.8,
  tight: -0.4,
  normal: 0,
  wide: 0.4,
  wider: 0.8,
  widest: 1.2,
};

// ============================================================================
// PROFESSIONAL ANIMATION TIMINGS
// ============================================================================

export const DURATIONS = {
  instant: 100,
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 800,
} as const;

export const EASINGS = {
  // Standard Material Design easings
  standard: {tension: 40, friction: 7},
  decelerate: {tension: 30, friction: 10},
  accelerate: {tension: 60, friction: 5},
  
  // Snappy micro-interactions
  snappy: {tension: 300, friction: 20},
  bouncy: {tension: 200, friction: 15, mass: 1},
  
  // Gentle, premium feel
  gentle: {tension: 120, friction: 14},
  soft: {tension: 80, friction: 12},
} as const;

// ============================================================================
// PROFESSIONAL SPACING SCALE
// Based on 4px grid system
// ============================================================================

export const SPACE = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  massive: 64,
} as const;

// ============================================================================
// PROFESSIONAL BORDER RADIUS
// ============================================================================

export const RADII = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  round: 9999,
} as const;

// ============================================================================
// PROFESSIONAL OPACITY VALUES
// ============================================================================

export const OPACITY = {
  disabled: 0.4,
  muted: 0.6,
  secondary: 0.7,
  primary: 0.9,
  full: 1,
} as const;

// ============================================================================
// HITSLOP PRESETS
// For touch targets that are visually small but need larger tap areas
// ============================================================================

export const HITSLOP = {
  small: {top: 8, bottom: 8, left: 8, right: 8},
  medium: {top: 12, bottom: 12, left: 12, right: 12},
  large: {top: 16, bottom: 16, left: 16, right: 16},
} as const;

// ============================================================================
// Z-INDEX SCALE
// ============================================================================

export const Z_INDEX = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  toast: 50,
  tooltip: 60,
} as const;

// ============================================================================
// RESPONSIVE BREAKPOINTS
// ============================================================================

export const BREAKPOINTS = {
  sm: 320,
  md: 375,
  lg: 414,
  xl: 480,
} as const;

export const isSmallDevice = SCREEN_WIDTH < BREAKPOINTS.md;
export const isMediumDevice = SCREEN_WIDTH >= BREAKPOINTS.md && SCREEN_WIDTH < BREAKPOINTS.lg;
export const isLargeDevice = SCREEN_WIDTH >= BREAKPOINTS.lg;

// ============================================================================
// PROFESSIONAL CARD STYLES
// ============================================================================

export const createCardStyle = (isDark: boolean) => ({
  backgroundColor: isDark ? '#1E2330' : '#FFFFFF',
  borderRadius: RADII.xl,
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
  ...SHADOWS.card,
});

export const createElevatedCardStyle = (isDark: boolean) => ({
  backgroundColor: isDark ? '#252B3B' : '#FFFFFF',
  borderRadius: RADII.xl,
  borderWidth: 0,
  ...SHADOWS.button,
});

// ============================================================================
// INPUT STYLES
// ============================================================================

export const createInputStyle = (isDark: boolean, focused: boolean) => ({
  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F8FAFC',
  borderRadius: RADII.lg,
  borderWidth: focused ? 1.5 : 1,
  borderColor: focused 
    ? '#4573DF' 
    : isDark 
      ? 'rgba(255,255,255,0.08)' 
      : 'rgba(0,0,0,0.06)',
  paddingHorizontal: SPACE.lg,
  paddingVertical: SPACE.md,
});

// ============================================================================
// BUTTON STYLES
// ============================================================================

export const createButtonStyle = (
  variant: 'primary' | 'secondary' | 'outline' | 'ghost',
  isDark: boolean,
  primaryColor: string = '#4573DF'
) => {
  const base = {
    borderRadius: RADII.lg,
    paddingVertical: SPACE.md,
    paddingHorizontal: SPACE.xl,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: SPACE.sm,
  };

  switch (variant) {
    case 'primary':
      return {
        ...base,
        backgroundColor: primaryColor,
        ...SHADOWS.primary(primaryColor),
      };
    case 'secondary':
      return {
        ...base,
        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F1F5F9',
      };
    case 'outline':
      return {
        ...base,
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: primaryColor,
      };
    case 'ghost':
      return {
        ...base,
        backgroundColor: 'transparent',
      };
  }
};

// ============================================================================
// BADGE STYLES
// ============================================================================

export const createBadgeStyle = (
  color: string,
  variant: 'solid' | 'soft' | 'outline' = 'soft'
) => {
  switch (variant) {
    case 'solid':
      return {
        backgroundColor: color,
        paddingHorizontal: SPACE.sm,
        paddingVertical: SPACE.xs,
        borderRadius: RADII.round,
      };
    case 'soft':
      return {
        backgroundColor: `${color}15`,
        paddingHorizontal: SPACE.sm,
        paddingVertical: SPACE.xs,
        borderRadius: RADII.round,
      };
    case 'outline':
      return {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: color,
        paddingHorizontal: SPACE.sm,
        paddingVertical: SPACE.xs,
        borderRadius: RADII.round,
      };
  }
};

// ============================================================================
// STATUS COLORS
// Semantic color palette for consistent status representation
// ============================================================================

export const STATUS_COLORS = {
  success: {
    main: '#10B981',
    light: '#D1FAE5',
    dark: '#059669',
  },
  warning: {
    main: '#F59E0B',
    light: '#FEF3C7',
    dark: '#D97706',
  },
  error: {
    main: '#EF4444',
    light: '#FEE2E2',
    dark: '#DC2626',
  },
  info: {
    main: '#4573DF',
    light: '#DBEAFE',
    dark: '#3660C9',
  },
} as const;

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  SHADOWS,
  SPACE,
  RADII,
  DURATIONS,
  EASINGS,
  FONT_WEIGHTS,
  LINE_HEIGHTS,
  LETTER_SPACING,
  OPACITY,
  HITSLOP,
  Z_INDEX,
  BREAKPOINTS,
  STATUS_COLORS,
  toPixel,
  scaleWidth,
  scaleFont,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  createCardStyle,
  createElevatedCardStyle,
  createInputStyle,
  createButtonStyle,
  createBadgeStyle,
};

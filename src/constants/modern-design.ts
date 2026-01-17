/**
 * Modern Design System 2025
 * 
 * Inspired by: Google Material You 3, Apple Human Interface Guidelines 2025
 * Philosophy: Clean, intentional, content-first design with purposeful use of color
 * 
 * Key Principles:
 * - Content First: UI should support content, not compete with it
 * - Purposeful Color: Use color with intention, not decoration
 * - Clear Hierarchy: Typography and spacing create natural flow
 * - Subtle Depth: Minimal shadows, focused elevation
 * - Accessibility: WCAG 2.1 AA compliance minimum
 */

import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// MODERN COLOR SYSTEM - Refined Professional Palette
// ============================================================================

/**
 * Color Philosophy:
 * - Primary: Used sparingly for key actions and branding (Sky Blue)
 * - Neutral: Dominant for backgrounds, text, and UI elements
 * - Semantic: Reserved for status communication only
 */
export const MODERN_COLORS = {
  // Brand Primary - Beautiful Sky Blue
  primary: {
    main: '#4573DF',      // Primary brand color (Sky Blue)
    light: '#E0F2FE',     // Subtle backgrounds
    lighter: '#F0F9FF',   // Very subtle tints
    dark: '#0284C7',      // Pressed states
    onPrimary: '#FFFFFF', // Text on primary
  },

  // Neutral Palette - Zinc-based for cleaner look
  neutral: {
    white: '#FFFFFF',
    50: '#FAFAFA',        // Page background
    100: '#F4F4F5',       // Card backgrounds, surfaces
    200: '#E4E4E7',       // Borders, dividers
    300: '#D4D4D8',       // Disabled states
    400: '#A1A1AA',       // Placeholder text
    500: '#71717A',       // Secondary text
    600: '#52525B',       // Body text
    700: '#3F3F46',       // Primary text
    800: '#27272A',       // Headlines
    900: '#18181B',       // High emphasis text
    black: '#000000',
  },

  // Semantic Colors - Muted professional tones
  semantic: {
    success: '#059669',
    successLight: '#ECFDF5',
    successDark: '#047857',
    
    warning: '#D97706',
    warningLight: '#FFFBEB',
    warningDark: '#B45309',
    
    error: '#DC2626',
    errorLight: '#FEF2F2',
    errorDark: '#B91C1C',
    
    info: '#0284C7',
    infoLight: '#F0F9FF',
    infoDark: '#0369A1',
  },

  // Surface Colors - For layering
  surface: {
    background: '#FAFAFA',
    elevated: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.4)',
  },
};

// Dark mode palette
export const MODERN_COLORS_DARK = {
  primary: {
    main: '#38BDF8',      // Softer Sky Blue for dark mode
    light: '#082F49',
    lighter: '#0C4A6E',
    dark: '#7DD3FC',
    onPrimary: '#FFFFFF',
  },

  neutral: {
    white: '#FFFFFF',
    50: '#0F1419',
    100: '#1A2332',
    200: '#2D3B4D',
    300: '#415166',
    400: '#5A6B80',
    500: '#8899AA',
    600: '#A8B8C8',
    700: '#C8D4E0',
    800: '#E2EAF1',
    900: '#F5F8FA',
    black: '#000000',
  },

  semantic: {
    success: '#34D399',
    successLight: '#022C22',
    successDark: '#6EE7B7',
    
    warning: '#FBBF24',
    warningLight: '#422006',
    warningDark: '#FCD34D',
    
    error: '#F87171',
    errorLight: '#450A0A',
    errorDark: '#FCA5A5',
    
    info: '#38BDF8',
    infoLight: '#082F49',
    infoDark: '#7DD3FC',
  },

  surface: {
    background: '#0F1419',
    elevated: '#1A2332',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
};

// ============================================================================
// TYPOGRAPHY - Clean & Readable
// ============================================================================

export const MODERN_TYPOGRAPHY = {
  // System fonts for performance and native feel
  fontFamily: Platform.select({
    ios: {
      regular: 'SF Pro Text',
      medium: 'SF Pro Text',
      semibold: 'SF Pro Text',
      bold: 'SF Pro Display',
    },
    android: {
      regular: 'Roboto',
      medium: 'Roboto',
      semibold: 'Roboto',
      bold: 'Roboto',
    },
    default: {
      regular: 'System',
      medium: 'System',
      semibold: 'System',
      bold: 'System',
    },
  }),

  // Type Scale - Based on 4px grid
  size: {
    xs: 11,           // Tiny labels
    sm: 13,           // Secondary text
    md: 15,           // Primary body text
    lg: 18,           // Subtitles, section titles
    xl: 22,           // Card titles
    xxl: 28,          // Page titles
    caption: 11,      // Labels, timestamps
    body2: 13,        // Secondary text
    body1: 15,        // Primary body text
    subtitle: 16,     // Subtitles
    title3: 18,       // Section titles
    title2: 20,       // Card titles
    title1: 24,       // Page titles
    headline: 28,     // Headlines
    display: 34,      // Hero text
  },

  // Alias for convenience
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
  },

  // Line heights for readability
  lineHeight: {
    tight: 1.2,       // Headlines
    normal: 1.5,      // Body text
    relaxed: 1.75,    // Long-form reading
  },

  // Font weights
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Letter spacing
  tracking: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
};

// ============================================================================
// SPACING - 4px Base Grid
// ============================================================================

export const MODERN_SPACING = {
  // Atomic spacing scale
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,

  // Semantic spacing
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,

  // Layout spacing
  screenPadding: 20,
  cardPadding: 16,
  sectionGap: 24,
  itemGap: 12,
};

// ============================================================================
// BORDER RADIUS - Consistent Corners
// ============================================================================

export const MODERN_RADIUS = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 24,
  full: 9999,
};

// ============================================================================
// SHADOWS - Minimal & Purposeful
// ============================================================================

/**
 * Shadow Philosophy:
 * - Use shadows sparingly - borders often work better
 * - Softer, more diffuse shadows look more professional
 * - Dark mode uses less shadow, more border contrast
 */
export const MODERN_SHADOWS = {
  // Light theme shadows - Very subtle
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  xs: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },

  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },

  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },

  // No colored shadows - more professional
  primary: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
};

// Dark mode shadows
export const MODERN_SHADOWS_DARK = {
  none: MODERN_SHADOWS.none,
  xs: {
    ...MODERN_SHADOWS.xs,
    shadowOpacity: 0.15,
  },
  sm: {
    ...MODERN_SHADOWS.sm,
    shadowOpacity: 0.2,
  },
  md: {
    ...MODERN_SHADOWS.md,
    shadowOpacity: 0.3,
  },
  lg: {
    ...MODERN_SHADOWS.lg,
    shadowOpacity: 0.4,
  },
  primary: {
    ...MODERN_SHADOWS.primary,
    shadowColor: '#4DA3FF',
    shadowOpacity: 0.3,
  },
};

// ============================================================================
// MOTION - Subtle & Meaningful
// ============================================================================

export const MODERN_MOTION = {
  // Durations
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 400,
  },

  // Spring configs for natural feel
  spring: {
    gentle: {
      damping: 20,
      stiffness: 150,
      mass: 1,
    },
    default: {
      damping: 25,
      stiffness: 200,
      mass: 1,
    },
    snappy: {
      damping: 30,
      stiffness: 300,
      mass: 0.8,
    },
  },
};

// ============================================================================
// ICON SIZES - Consistent Scale
// ============================================================================

export const MODERN_ICON_SIZE = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
};

// ============================================================================
// TOUCH TARGETS - Accessibility
// ============================================================================

export const MODERN_TOUCH = {
  minSize: 44,      // Minimum touch target
  recommended: 48,  // Recommended for comfort
};

// ============================================================================
// SCREEN UTILITIES
// ============================================================================

export const MODERN_SCREEN = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmall: SCREEN_WIDTH < 375,
  isMedium: SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414,
  isLarge: SCREEN_WIDTH >= 414,
};

// ============================================================================
// COMPONENT TOKENS - Ready-to-use styles
// ============================================================================

export const MODERN_TOKENS = {
  // Card styles
  card: {
    padding: MODERN_SPACING.cardPadding,
    borderRadius: MODERN_RADIUS.lg,
    backgroundColor: MODERN_COLORS.neutral.white,
  },

  // Input styles
  input: {
    height: 48,
    paddingHorizontal: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.md,
    borderWidth: 1,
  },

  // Button styles
  button: {
    height: 48,
    paddingHorizontal: MODERN_SPACING.lg,
    borderRadius: MODERN_RADIUS.md,
  },

  // Chip/Tag styles
  chip: {
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: MODERN_SPACING.xs,
    borderRadius: MODERN_RADIUS.sm,
  },
};

export default {
  MODERN_COLORS,
  MODERN_COLORS_DARK,
  MODERN_TYPOGRAPHY,
  MODERN_SPACING,
  MODERN_RADIUS,
  MODERN_SHADOWS,
  MODERN_SHADOWS_DARK,
  MODERN_MOTION,
  MODERN_ICON_SIZE,
  MODERN_TOUCH,
  MODERN_SCREEN,
  MODERN_TOKENS,
};

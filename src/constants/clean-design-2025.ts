/**
 * Clean Design System 2025
 * 
 * Philosophy: Content-first, minimal, intentional design
 * Inspired by: Google Material Design 3, Apple HIG 2025, Linear, Stripe, Notion
 * 
 * Key Principles:
 * 1. Content First - UI supports content, never competes
 * 2. Purposeful Color - Semantic colors only, no decorative gradients
 * 3. Clear Hierarchy - Typography and whitespace create natural flow
 * 4. Quiet UI - Minimal shadows, subtle borders, no visual noise
 * 5. Accessible - WCAG 2.1 AAA compliant where possible
 * 6. Performance - No unnecessary visual effects that impact FPS
 */

import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// REFINED COLOR SYSTEM - Professional & Corporate
// ============================================================================

/**
 * Color Usage Guidelines:
 * - Primary: Key actions, links, active states ONLY
 * - Neutral: 90% of UI (backgrounds, text, borders)
 * - Semantic: Status indicators ONLY (success/error/warning)
 * - Never use color purely for decoration
 */
export const CLEAN_COLORS = {
  // Brand Primary - Refined indigo, sophisticated and modern
  primary: {
    50: '#EEF2FF',     // Subtle backgrounds
    100: '#E0E7FF',    // Hover states, badges
    200: '#C7D2FE',    // Light accents
    500: '#4F46E5',    // Primary action color
    600: '#4338CA',    // Pressed/active states
    700: '#3730A3',    // Dark text on light primary bg
  },

  // Neutral Palette - Zinc-based for clean look
  neutral: {
    0: '#FFFFFF',      // Pure white - card backgrounds
    25: '#FAFAFA',     // Off-white - page background alternative
    50: '#F4F4F5',     // Light gray - page background
    100: '#E4E4E7',    // Subtle backgrounds, surfaces
    200: '#D4D4D8',    // Borders, dividers
    300: '#A1A1AA',    // Disabled borders
    400: '#71717A',    // Placeholder text, icons
    500: '#52525B',    // Secondary text
    600: '#3F3F46',    // Body text
    700: '#27272A',    // Primary text
    800: '#18181B',    // Headlines, emphasis
    900: '#09090B',    // High contrast text
    950: '#030712',    // Maximum contrast
  },

  // Semantic Colors - Status communication only
  semantic: {
    // Success - Teal-green for positive feedback
    success: {
      light: '#F0FDF4',
      main: '#059669',
      dark: '#047857',
      text: '#065F46',
    },
    // Warning - Amber for caution
    warning: {
      light: '#FFFBEB',
      main: '#D97706',
      dark: '#B45309',
      text: '#92400E',
    },
    // Error - Red for destructive/errors
    error: {
      light: '#FEF2F2',
      main: '#DC2626',
      dark: '#B91C1C',
      text: '#991B1B',
    },
    // Info - Blue for informational
    info: {
      light: '#F0F9FF',
      main: '#0284C7',
      dark: '#0369A1',
      text: '#075985',
    },
  },
};

// Dark mode - True dark with proper contrast
export const CLEAN_COLORS_DARK = {
  primary: {
    50: '#0C1929',
    100: '#122440',
    200: '#1E3A5F',
    500: '#60A5FA',
    600: '#93C5FD',
    700: '#BFDBFE',
  },

  neutral: {
    0: '#18181B',      // Elevated surfaces
    25: '#141416',     // Subtle elevation
    50: '#0F0F11',     // Page background
    100: '#1C1C1F',    // Card backgrounds
    200: '#27272A',    // Borders
    300: '#3F3F46',    // Subtle borders
    400: '#52525B',    // Icons, placeholders
    500: '#71717A',    // Secondary text
    600: '#A1A1AA',    // Body text
    700: '#D4D4D8',    // Primary text
    800: '#E4E4E7',    // Headlines
    900: '#F4F4F5',    // High contrast
    950: '#FAFAFA',    // Maximum contrast
  },

  semantic: {
    success: {
      light: '#052E16',
      main: '#34D399',
      dark: '#6EE7B7',
      text: '#A7F3D0',
    },
    warning: {
      light: '#422006',
      main: '#FBBF24',
      dark: '#FCD34D',
      text: '#FDE68A',
    },
    error: {
      light: '#450A0A',
      main: '#F87171',
      dark: '#FCA5A5',
      text: '#FECACA',
    },
    info: {
      light: '#082F49',
      main: '#38BDF8',
      dark: '#7DD3FC',
      text: '#BAE6FD',
    },
  },
};

// ============================================================================
// TYPOGRAPHY - Clean, Readable, Hierarchical
// ============================================================================

export const CLEAN_TYPOGRAPHY = {
  // System fonts for optimal performance
  family: Platform.select({
    ios: {
      regular: 'SF Pro Text',
      medium: 'SF Pro Text',
      semibold: 'SF Pro Display',
      bold: 'SF Pro Display',
    },
    android: {
      regular: 'Roboto',
      medium: 'Roboto-Medium',
      semibold: 'Roboto-Medium',
      bold: 'Roboto-Bold',
    },
    default: {
      regular: 'System',
      medium: 'System',
      semibold: 'System',
      bold: 'System',
    },
  }),

  // Simplified scale - fewer options, clearer hierarchy
  size: {
    xs: 11,        // Captions, labels, timestamps
    sm: 13,        // Secondary text, metadata
    base: 15,      // Body text (default)
    md: 17,        // Emphasized body, subtitles
    lg: 20,        // Section headers, card titles
    xl: 24,        // Page titles
    '2xl': 30,     // Feature headlines
    '3xl': 36,     // Hero text (use rarely)
  },

  // Line heights optimized for readability
  leading: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Font weights
  weight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Letter spacing (tracking)
  tracking: {
    tighter: -0.8,
    tight: -0.4,
    normal: 0,
    wide: 0.4,
  },
};

// Pre-composed text styles for consistency
export const TEXT_STYLES = {
  // Headlines
  displayLarge: {
    fontSize: CLEAN_TYPOGRAPHY.size['3xl'],
    fontWeight: CLEAN_TYPOGRAPHY.weight.bold,
    lineHeight: CLEAN_TYPOGRAPHY.size['3xl'] * CLEAN_TYPOGRAPHY.leading.tight,
    letterSpacing: CLEAN_TYPOGRAPHY.tracking.tighter,
  },
  displayMedium: {
    fontSize: CLEAN_TYPOGRAPHY.size['2xl'],
    fontWeight: CLEAN_TYPOGRAPHY.weight.bold,
    lineHeight: CLEAN_TYPOGRAPHY.size['2xl'] * CLEAN_TYPOGRAPHY.leading.tight,
    letterSpacing: CLEAN_TYPOGRAPHY.tracking.tight,
  },
  headline: {
    fontSize: CLEAN_TYPOGRAPHY.size.xl,
    fontWeight: CLEAN_TYPOGRAPHY.weight.semibold,
    lineHeight: CLEAN_TYPOGRAPHY.size.xl * CLEAN_TYPOGRAPHY.leading.snug,
    letterSpacing: CLEAN_TYPOGRAPHY.tracking.tight,
  },
  title: {
    fontSize: CLEAN_TYPOGRAPHY.size.lg,
    fontWeight: CLEAN_TYPOGRAPHY.weight.semibold,
    lineHeight: CLEAN_TYPOGRAPHY.size.lg * CLEAN_TYPOGRAPHY.leading.snug,
  },
  subtitle: {
    fontSize: CLEAN_TYPOGRAPHY.size.md,
    fontWeight: CLEAN_TYPOGRAPHY.weight.medium,
    lineHeight: CLEAN_TYPOGRAPHY.size.md * CLEAN_TYPOGRAPHY.leading.normal,
  },
  // Body text
  bodyLarge: {
    fontSize: CLEAN_TYPOGRAPHY.size.md,
    fontWeight: CLEAN_TYPOGRAPHY.weight.normal,
    lineHeight: CLEAN_TYPOGRAPHY.size.md * CLEAN_TYPOGRAPHY.leading.relaxed,
  },
  body: {
    fontSize: CLEAN_TYPOGRAPHY.size.base,
    fontWeight: CLEAN_TYPOGRAPHY.weight.normal,
    lineHeight: CLEAN_TYPOGRAPHY.size.base * CLEAN_TYPOGRAPHY.leading.normal,
  },
  bodySmall: {
    fontSize: CLEAN_TYPOGRAPHY.size.sm,
    fontWeight: CLEAN_TYPOGRAPHY.weight.normal,
    lineHeight: CLEAN_TYPOGRAPHY.size.sm * CLEAN_TYPOGRAPHY.leading.normal,
  },
  // Labels & captions
  label: {
    fontSize: CLEAN_TYPOGRAPHY.size.sm,
    fontWeight: CLEAN_TYPOGRAPHY.weight.medium,
    lineHeight: CLEAN_TYPOGRAPHY.size.sm * CLEAN_TYPOGRAPHY.leading.normal,
  },
  caption: {
    fontSize: CLEAN_TYPOGRAPHY.size.xs,
    fontWeight: CLEAN_TYPOGRAPHY.weight.normal,
    lineHeight: CLEAN_TYPOGRAPHY.size.xs * CLEAN_TYPOGRAPHY.leading.normal,
  },
};

// ============================================================================
// SPACING - Consistent 4px Grid
// ============================================================================

export const CLEAN_SPACING = {
  // Base scale (4px increments)
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,

  // Semantic aliases
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,

  // Layout-specific
  screenPadding: 20,
  cardPadding: 16,
  cardPaddingLarge: 20,
  sectionGap: 32,
  itemGap: 12,
  listItemGap: 8,
};

// ============================================================================
// BORDER RADIUS - Consistent & Subtle
// ============================================================================

export const CLEAN_RADIUS = {
  none: 0,
  xs: 4,        // Small elements (badges, tags)
  sm: 6,        // Buttons, inputs
  md: 8,        // Small cards, list items
  lg: 12,       // Cards, modals
  xl: 16,       // Large cards, feature cards
  '2xl': 20,    // Full-width cards
  full: 9999,   // Circular elements, pills
};

// ============================================================================
// SHADOWS - Minimal & Purposeful
// ============================================================================

/**
 * Shadow Philosophy:
 * - Use shadows sparingly - borders often work better
 * - Prefer subtle, diffuse shadows
 * - Only elevate interactive or overlapping elements
 */
export const CLEAN_SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  // Subtle - barely visible, for slight lift
  xs: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },

  // Small - default card shadow
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  // Medium - elevated cards, dropdowns
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  // Large - modals, popovers
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },

  // Focus ring shadow (accessibility)
  focus: {
    shadowColor: '#0066DC',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 0,
  },
};

// Dark mode shadows (less opacity, more border reliance)
export const CLEAN_SHADOWS_DARK = {
  ...CLEAN_SHADOWS,
  xs: { ...CLEAN_SHADOWS.xs, shadowOpacity: 0.15 },
  sm: { ...CLEAN_SHADOWS.sm, shadowOpacity: 0.2 },
  md: { ...CLEAN_SHADOWS.md, shadowOpacity: 0.25 },
  lg: { ...CLEAN_SHADOWS.lg, shadowOpacity: 0.3 },
  focus: { ...CLEAN_SHADOWS.focus, shadowColor: '#60A5FA' },
};

// ============================================================================
// BORDERS - Clean & Subtle
// ============================================================================

export const CLEAN_BORDERS = {
  width: {
    none: 0,
    thin: 0.5,
    default: 1,
    thick: 2,
  },
  // Use border instead of shadow when possible for cleaner look
  style: {
    subtle: {
      borderWidth: 1,
      borderColor: CLEAN_COLORS.neutral[200],
    },
    default: {
      borderWidth: 1,
      borderColor: CLEAN_COLORS.neutral[300],
    },
    strong: {
      borderWidth: 1,
      borderColor: CLEAN_COLORS.neutral[400],
    },
  },
};

// ============================================================================
// ANIMATION - Subtle & Meaningful
// ============================================================================

export const CLEAN_MOTION = {
  // Durations - quick and responsive
  duration: {
    instant: 50,
    fast: 150,
    normal: 250,
    slow: 350,
  },

  // Spring configurations - natural feel
  spring: {
    // For micro-interactions (buttons, toggles)
    snappy: {
      damping: 28,
      stiffness: 350,
      mass: 0.8,
    },
    // For UI transitions (modals, panels)
    default: {
      damping: 24,
      stiffness: 200,
      mass: 1,
    },
    // For larger movements (page transitions)
    gentle: {
      damping: 20,
      stiffness: 150,
      mass: 1,
    },
  },
};

// ============================================================================
// COMPONENT TOKENS - Ready-to-use configurations
// ============================================================================

export const CLEAN_COMPONENTS = {
  // Card configurations
  card: {
    default: {
      padding: CLEAN_SPACING.cardPadding,
      borderRadius: CLEAN_RADIUS.lg,
      borderWidth: 1,
      // Shadow only on hover/press in most cases
    },
    compact: {
      padding: CLEAN_SPACING.sm,
      borderRadius: CLEAN_RADIUS.md,
      borderWidth: 1,
    },
    feature: {
      padding: CLEAN_SPACING.cardPaddingLarge,
      borderRadius: CLEAN_RADIUS.xl,
      borderWidth: 1,
    },
  },

  // Button configurations
  button: {
    sm: {
      height: 32,
      paddingHorizontal: CLEAN_SPACING.sm,
      borderRadius: CLEAN_RADIUS.sm,
      fontSize: CLEAN_TYPOGRAPHY.size.sm,
    },
    md: {
      height: 40,
      paddingHorizontal: CLEAN_SPACING.md,
      borderRadius: CLEAN_RADIUS.sm,
      fontSize: CLEAN_TYPOGRAPHY.size.base,
    },
    lg: {
      height: 48,
      paddingHorizontal: CLEAN_SPACING.lg,
      borderRadius: CLEAN_RADIUS.md,
      fontSize: CLEAN_TYPOGRAPHY.size.md,
    },
  },

  // Input configurations
  input: {
    height: 44,
    paddingHorizontal: CLEAN_SPACING.md,
    borderRadius: CLEAN_RADIUS.md,
    borderWidth: 1,
    fontSize: CLEAN_TYPOGRAPHY.size.base,
  },

  // Badge/chip configurations
  badge: {
    paddingHorizontal: CLEAN_SPACING.sm,
    paddingVertical: CLEAN_SPACING.xs,
    borderRadius: CLEAN_RADIUS.xs,
    fontSize: CLEAN_TYPOGRAPHY.size.xs,
  },

  // Icon sizes
  icon: {
    xs: 14,
    sm: 18,
    md: 22,
    lg: 26,
    xl: 32,
  },
};

// ============================================================================
// ACCESSIBILITY
// ============================================================================

export const CLEAN_A11Y = {
  // Minimum touch target size (44x44 recommended)
  minTouchTarget: 44,
  // Focus indicator width
  focusRingWidth: 2,
  focusRingOffset: 2,
  // Contrast ratios (for reference)
  contrastMinimum: 4.5,  // WCAG AA for normal text
  contrastLarge: 3,      // WCAG AA for large text
};

// ============================================================================
// SCREEN UTILITIES
// ============================================================================

export const CLEAN_SCREEN = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmall: SCREEN_WIDTH < 375,
  isMedium: SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414,
  isLarge: SCREEN_WIDTH >= 414,
  // Content max width for larger screens
  maxContentWidth: 428,
};

// ============================================================================
// THEME HELPER - Quick access to themed colors
// ============================================================================

export const getCleanThemeColors = (isDark: boolean) => {
  const colors = isDark ? CLEAN_COLORS_DARK : CLEAN_COLORS;
  return {
    // Backgrounds
    background: colors.neutral[50],
    backgroundSecondary: colors.neutral[100],
    surface: colors.neutral[0],
    surfaceElevated: isDark ? colors.neutral[100] : colors.neutral[0],
    
    // Text
    text: colors.neutral[800],
    textSecondary: colors.neutral[500],
    textTertiary: colors.neutral[400],
    textOnPrimary: isDark ? colors.neutral[900] : colors.neutral[0],
    
    // Interactive
    primary: colors.primary[500],
    primaryLight: colors.primary[100],
    primaryDark: colors.primary[600],
    
    // Borders
    border: colors.neutral[200],
    borderStrong: colors.neutral[300],
    borderSubtle: colors.neutral[100],
    
    // Status
    success: colors.semantic.success.main,
    successLight: colors.semantic.success.light,
    warning: colors.semantic.warning.main,
    warningLight: colors.semantic.warning.light,
    error: colors.semantic.error.main,
    errorLight: colors.semantic.error.light,
    info: colors.semantic.info.main,
    infoLight: colors.semantic.info.light,
    
    // Shadows
    shadows: isDark ? CLEAN_SHADOWS_DARK : CLEAN_SHADOWS,
  };
};

export default {
  CLEAN_COLORS,
  CLEAN_COLORS_DARK,
  CLEAN_TYPOGRAPHY,
  TEXT_STYLES,
  CLEAN_SPACING,
  CLEAN_RADIUS,
  CLEAN_SHADOWS,
  CLEAN_SHADOWS_DARK,
  CLEAN_BORDERS,
  CLEAN_MOTION,
  CLEAN_COMPONENTS,
  CLEAN_A11Y,
  CLEAN_SCREEN,
  getCleanThemeColors,
};

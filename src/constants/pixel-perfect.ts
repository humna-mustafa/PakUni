/**
 * Pixel Perfect Design System
 * 
 * Eliminates visual artifacts, ensures crisp rendering, and provides
 * mathematically precise values for React Native components.
 *
 * Key Principles:
 * 1. Use even numbers for dimensions (avoids sub-pixel rendering)
 * 2. Border radius should be ≤ half the smallest dimension
 * 3. Shadows must be optimized for each platform
 * 4. Use hairline widths where supported
 * 5. Maintain consistent grid alignment (4px base)
 */

import { Dimensions, Platform, PixelRatio, StyleSheet } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// PIXEL RATIO UTILITIES - Crisp rendering on all densities
// ============================================================================

const pixelRatio = PixelRatio.get();
const fontScale = PixelRatio.getFontScale();

/**
 * Rounds a value to the nearest pixel for crisp rendering
 * Prevents sub-pixel rendering artifacts
 */
export const roundToPixel = (value: number): number => {
  return PixelRatio.roundToNearestPixel(value);
};

/**
 * Gets the size in actual pixels for the device
 */
export const getPixelSize = (dp: number): number => {
  return PixelRatio.getPixelSizeForLayoutSize(dp);
};

/**
 * Hairline width - thinnest possible line on the device
 */
export const HAIRLINE_WIDTH = StyleSheet.hairlineWidth;

/**
 * Ensures values align to the 4px grid for visual consistency
 */
export const snapToGrid = (value: number, gridSize: number = 4): number => {
  return Math.round(value / gridSize) * gridSize;
};

/**
 * Scale size based on screen width (responsive sizing)
 */
export const scaleSize = (size: number, baseWidth: number = 375): number => {
  return roundToPixel((SCREEN_WIDTH / baseWidth) * size);
};

/**
 * Scale font with accessibility support
 */
export const scaleFontSize = (size: number): number => {
  return roundToPixel(size * fontScale);
};

// ============================================================================
// PIXEL PERFECT SPACING - Even values, grid-aligned
// ============================================================================

export const PP_SPACING = {
  // Base 4px grid - all values are even for crisp rendering
  0: 0,
  1: 2,
  2: 4,
  3: 6,
  4: 8,
  5: 10,
  6: 12,
  7: 14,
  8: 16,
  10: 20,
  12: 24,
  14: 28,
  16: 32,
  18: 36,
  20: 40,
  24: 48,
  28: 56,
  32: 64,

  // Semantic (always even)
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,

  // Screen padding
  screenHorizontal: 20,
  screenVertical: 16,
  
  // Card padding
  cardCompact: 12,
  cardDefault: 16,
  cardSpacious: 20,
  
  // List items
  listItemGap: 8,
  listSectionGap: 24,
};

// ============================================================================
// PIXEL PERFECT BORDERS - Crisp, artifact-free
// ============================================================================

export const PP_BORDERS = {
  // Widths - use hairline for thinnest, then even values
  width: {
    hairline: HAIRLINE_WIDTH,
    thin: 1,
    medium: 2,
    thick: 4,
  },

  // Border radius - always even values for smooth curves
  radius: {
    none: 0,
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
    xxxl: 24,
    full: 9999,
  },

  // Pre-built border styles for common use cases
  styles: {
    // Subtle divider
    divider: {
      borderBottomWidth: HAIRLINE_WIDTH,
    },
    // Card border
    card: {
      borderWidth: 1,
      borderRadius: 12,
    },
    // Input field
    input: {
      borderWidth: 1,
      borderRadius: 8,
    },
    // Button
    button: {
      borderWidth: 2,
      borderRadius: 8,
    },
    // Pill/badge
    pill: {
      borderWidth: 1,
      borderRadius: 9999,
    },
    // Circle avatar
    circle: (size: number) => ({
      borderRadius: size / 2,
    }),
  },
};

// ============================================================================
// PIXEL PERFECT SHADOWS - Platform-optimized, no artifacts
// ============================================================================

/**
 * Shadow configuration that eliminates jagged edges and artifacts
 * Uses precise values tested on both iOS and Android
 */
export const PP_SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  // Ultra-subtle - barely visible lift
  xs: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
    },
    android: {
      elevation: 1,
      shadowColor: '#000000',
    },
    default: {},
  }),

  // Small - default card shadow
  sm: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
      shadowColor: '#000000',
    },
    default: {},
  }),

  // Medium - elevated cards
  md: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
      shadowColor: '#000000',
    },
    default: {},
  }),

  // Large - modals, popovers
  lg: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
    },
    android: {
      elevation: 8,
      shadowColor: '#000000',
    },
    default: {},
  }),

  // Extra large - floating action buttons
  xl: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.16,
      shadowRadius: 24,
    },
    android: {
      elevation: 12,
      shadowColor: '#000000',
    },
    default: {},
  }),

  // Colored shadows for buttons (iOS only, graceful fallback on Android)
  primary: (color: string) => Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    android: {
      elevation: 6,
      shadowColor: color,
    },
    default: {},
  }),

  // Soft diffuse shadow for premium cards
  soft: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 12,
    },
    android: {
      elevation: 2,
      shadowColor: '#000000',
    },
    default: {},
  }),

  // Inner shadow simulation (uses overlay technique)
  innerLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
};

// ============================================================================
// PIXEL PERFECT CARD STYLES - Complete, artifact-free card definitions
// ============================================================================

export const PP_CARD_STYLES = {
  // Basic outlined card
  outlined: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden' as const,
  },

  // Elevated card with shadow
  elevated: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden' as const,
    ...PP_SHADOWS.sm,
  },

  // Premium glass card
  glass: {
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.5)' : '#E5E7EB',
    borderRadius: 16,
    overflow: 'hidden' as const,
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    } : {
      elevation: 4,
    }),
  },

  // Interactive card (for touchable)
  interactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden' as const,
  },

  // Compact list item card
  listItem: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 8,
    overflow: 'hidden' as const,
  },

  // Feature highlight card
  feature: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    overflow: 'hidden' as const,
    ...PP_SHADOWS.sm,
  },
};

// ============================================================================
// PIXEL PERFECT ICON CONTAINERS - Properly sized and aligned
// ============================================================================

export const PP_ICON_CONTAINERS = {
  // Size should always be even numbers
  xs: {
    width: 24,
    height: 24,
    borderRadius: 6,
    iconSize: 14,
  },
  sm: {
    width: 32,
    height: 32,
    borderRadius: 8,
    iconSize: 16,
  },
  md: {
    width: 40,
    height: 40,
    borderRadius: 10,
    iconSize: 20,
  },
  lg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    iconSize: 24,
  },
  xl: {
    width: 56,
    height: 56,
    borderRadius: 14,
    iconSize: 28,
  },
  xxl: {
    width: 64,
    height: 64,
    borderRadius: 16,
    iconSize: 32,
  },

  // Circle variants
  circleXs: {
    width: 24,
    height: 24,
    borderRadius: 12,
    iconSize: 12,
  },
  circleSm: {
    width: 32,
    height: 32,
    borderRadius: 16,
    iconSize: 16,
  },
  circleMd: {
    width: 40,
    height: 40,
    borderRadius: 20,
    iconSize: 20,
  },
  circleLg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    iconSize: 24,
  },
  circleXl: {
    width: 56,
    height: 56,
    borderRadius: 28,
    iconSize: 28,
  },
};

// ============================================================================
// PIXEL PERFECT AVATAR SIZES - Consistent, properly rounded
// ============================================================================

export const PP_AVATARS = {
  xs: {
    size: 24,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 10,
  },
  sm: {
    size: 32,
    borderRadius: 16,
    borderWidth: 1,
    fontSize: 12,
  },
  md: {
    size: 40,
    borderRadius: 20,
    borderWidth: 2,
    fontSize: 14,
  },
  lg: {
    size: 48,
    borderRadius: 24,
    borderWidth: 2,
    fontSize: 16,
  },
  xl: {
    size: 64,
    borderRadius: 32,
    borderWidth: 2,
    fontSize: 20,
  },
  xxl: {
    size: 80,
    borderRadius: 40,
    borderWidth: 3,
    fontSize: 24,
  },
  profile: {
    size: 96,
    borderRadius: 48,
    borderWidth: 3,
    fontSize: 28,
  },
};

// ============================================================================
// PIXEL PERFECT BADGE STYLES - Crisp badges and chips
// ============================================================================

export const PP_BADGES = {
  // Dot indicator
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  
  // Small count badge
  count: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 6,
    fontSize: 10,
    fontWeight: '600' as const,
  },

  // Tag/label badge
  tag: {
    height: 24,
    borderRadius: 4,
    paddingHorizontal: 8,
    fontSize: 11,
    fontWeight: '500' as const,
  },

  // Pill badge
  pill: {
    height: 28,
    borderRadius: 14,
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: '500' as const,
  },

  // Status badge
  status: {
    height: 22,
    borderRadius: 4,
    paddingHorizontal: 8,
    fontSize: 11,
    fontWeight: '600' as const,
  },
};

// ============================================================================
// PIXEL PERFECT BUTTON STYLES - Precise touch targets
// ============================================================================

export const PP_BUTTONS = {
  // Minimum touch target: 44px (Apple HIG)
  xs: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: '600' as const,
    iconSize: 14,
  },
  sm: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 8,
    fontSize: 13,
    fontWeight: '600' as const,
    iconSize: 16,
  },
  md: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 8,
    fontSize: 14,
    fontWeight: '600' as const,
    iconSize: 18,
  },
  lg: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 10,
    fontSize: 15,
    fontWeight: '600' as const,
    iconSize: 20,
  },
  xl: {
    height: 56,
    paddingHorizontal: 24,
    borderRadius: 12,
    fontSize: 16,
    fontWeight: '600' as const,
    iconSize: 22,
  },
  
  // Icon-only buttons (square)
  iconXs: { width: 32, height: 32, borderRadius: 8, iconSize: 16 },
  iconSm: { width: 36, height: 36, borderRadius: 8, iconSize: 18 },
  iconMd: { width: 44, height: 44, borderRadius: 10, iconSize: 20 },
  iconLg: { width: 48, height: 48, borderRadius: 12, iconSize: 22 },
  iconXl: { width: 56, height: 56, borderRadius: 14, iconSize: 24 },

  // Floating action button
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    iconSize: 24,
    ...PP_SHADOWS.lg,
  },
  fabSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    iconSize: 20,
    ...PP_SHADOWS.md,
  },
};

// ============================================================================
// PIXEL PERFECT INPUT STYLES - Form elements
// ============================================================================

export const PP_INPUTS = {
  // Text input
  default: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 15,
  },
  
  // Compact input
  compact: {
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 14,
  },

  // Large input
  large: {
    height: 56,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },

  // Search input
  search: {
    height: 44,
    paddingHorizontal: 44, // Account for icon
    borderRadius: 22,
    borderWidth: 1,
    fontSize: 15,
    iconSize: 20,
    iconLeft: 14,
  },

  // Textarea
  textarea: {
    minHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 15,
    lineHeight: 22,
  },
};

// ============================================================================
// PIXEL PERFECT TYPOGRAPHY - Precise text sizing
// ============================================================================

export const PP_TYPOGRAPHY = {
  // Font sizes (use even numbers where possible)
  size: {
    xxs: 10,
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 30,
    display: 36,
  },

  // Line heights (as multipliers)
  lineHeight: {
    tight: 1.2,
    snug: 1.35,
    normal: 1.5,
    relaxed: 1.625,
    loose: 1.8,
  },

  // Letter spacing
  letterSpacing: {
    tighter: -0.8,
    tight: -0.4,
    normal: 0,
    wide: 0.4,
    wider: 0.8,
  },

  // Font weights
  weight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Pre-composed text styles
  styles: {
    displayLarge: {
      fontSize: 36,
      fontWeight: '700' as const,
      letterSpacing: -0.8,
      lineHeight: 44,
    },
    displayMedium: {
      fontSize: 30,
      fontWeight: '700' as const,
      letterSpacing: -0.6,
      lineHeight: 38,
    },
    headline: {
      fontSize: 24,
      fontWeight: '600' as const,
      letterSpacing: -0.4,
      lineHeight: 32,
    },
    title: {
      fontSize: 20,
      fontWeight: '600' as const,
      letterSpacing: -0.4,
      lineHeight: 28,
    },
    subtitle: {
      fontSize: 17,
      fontWeight: '500' as const,
      letterSpacing: 0,
      lineHeight: 24,
    },
    body: {
      fontSize: 15,
      fontWeight: '400' as const,
      letterSpacing: 0,
      lineHeight: 22,
    },
    bodySmall: {
      fontSize: 13,
      fontWeight: '400' as const,
      letterSpacing: 0,
      lineHeight: 20,
    },
    caption: {
      fontSize: 11,
      fontWeight: '400' as const,
      letterSpacing: 0,
      lineHeight: 16,
    },
    label: {
      fontSize: 13,
      fontWeight: '500' as const,
      letterSpacing: 0.2,
      lineHeight: 18,
    },
    button: {
      fontSize: 14,
      fontWeight: '600' as const,
      letterSpacing: 0.2,
      lineHeight: 20,
    },
  },
};

// ============================================================================
// PIXEL PERFECT ANIMATIONS - Smooth, 60fps motion
// ============================================================================

export const PP_MOTION = {
  // Durations (in ms) - optimized for 60fps
  duration: {
    instant: 50,
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
  },

  // Spring configs for smooth animations
  spring: {
    // Micro-interactions (buttons, toggles)
    snappy: {
      damping: 28,
      stiffness: 400,
      mass: 0.8,
    },
    // UI transitions
    default: {
      damping: 24,
      stiffness: 200,
      mass: 1,
    },
    // Large movements
    gentle: {
      damping: 20,
      stiffness: 150,
      mass: 1,
    },
    // Bouncy effect
    bouncy: {
      damping: 12,
      stiffness: 350,
      mass: 0.8,
    },
  },

  // Scale values for press animations
  scale: {
    pressed: 0.97,
    hover: 1.02,
    subtle: 0.99,
  },

  // Opacity values
  opacity: {
    pressed: 0.85,
    disabled: 0.5,
    overlay: 0.6,
  },
};

// ============================================================================
// SCREEN UTILITIES
// ============================================================================

export const PP_SCREEN = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  pixelRatio,
  fontScale,
  
  // Breakpoints
  isSmall: SCREEN_WIDTH < 375,
  isMedium: SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414,
  isLarge: SCREEN_WIDTH >= 414,
  
  // Safe max content width
  maxContentWidth: Math.min(SCREEN_WIDTH, 428),
  
  // Card widths
  cardWidthFull: SCREEN_WIDTH - (PP_SPACING.screenHorizontal * 2),
  cardWidthHalf: (SCREEN_WIDTH - (PP_SPACING.screenHorizontal * 2) - PP_SPACING.sm) / 2,
  cardWidthThird: (SCREEN_WIDTH - (PP_SPACING.screenHorizontal * 2) - PP_SPACING.sm * 2) / 3,
  cardWidthQuarter: (SCREEN_WIDTH - (PP_SPACING.screenHorizontal * 2) - PP_SPACING.sm * 3) / 4,
  
  // Carousel item width
  carouselItemWidth: SCREEN_WIDTH * 0.75,
  carouselItemWidthSmall: SCREEN_WIDTH * 0.4,
};

// ============================================================================
// ACCESSIBILITY
// ============================================================================

export const PP_A11Y = {
  // Minimum touch target
  minTouchTarget: 44,
  
  // Focus ring
  focusRing: {
    width: 2,
    offset: 2,
    color: '#0066DC',
  },
  
  // Minimum contrast ratios
  contrastNormal: 4.5,
  contrastLarge: 3,
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  // Utilities
  roundToPixel,
  getPixelSize,
  snapToGrid,
  scaleSize,
  scaleFontSize,
  HAIRLINE_WIDTH,
  
  // Design tokens
  PP_SPACING,
  PP_BORDERS,
  PP_SHADOWS,
  PP_CARD_STYLES,
  PP_ICON_CONTAINERS,
  PP_AVATARS,
  PP_BADGES,
  PP_BUTTONS,
  PP_INPUTS,
  PP_TYPOGRAPHY,
  PP_MOTION,
  PP_SCREEN,
  PP_A11Y,
};

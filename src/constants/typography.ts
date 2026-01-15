/**
 * Premium Typography System v2.0
 * 
 * A comprehensive, production-ready typography system designed for
 * React Native applications with cross-platform consistency.
 * 
 * Features:
 * - Platform-optimized font families
 * - Modular type scale (1.25 ratio)
 * - Pre-composed text styles for quick implementation
 * - Accessibility-focused line heights
 * - Dynamic font scaling utilities
 */

import { Platform, PixelRatio, TextStyle, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// FONT FAMILY DEFINITIONS
// ============================================================================

/**
 * Platform-optimized font families
 * Uses system fonts for best rendering quality and performance
 * 
 * iOS: SF Pro (Display for headlines, Text for body, Rounded for friendly UI)
 * Android: Roboto family with appropriate weights
 */
export const FontFamily = {
  // Primary text font - optimized for readability
  primary: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  
  // Display font - for headlines and large text
  display: Platform.select({
    ios: 'System',
    android: 'sans-serif-medium',
    default: 'System',
  }),
  
  // Rounded font - for friendly, approachable UI elements
  rounded: Platform.select({
    ios: 'System',
    android: 'sans-serif-medium',
    default: 'System',
  }),
  
  // Monospace font - for code, numbers, data
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }),
  
  // Condensed font - for space-constrained areas
  condensed: Platform.select({
    ios: 'System',
    android: 'sans-serif-condensed',
    default: 'System',
  }),
} as const;

// ============================================================================
// FONT WEIGHTS
// ============================================================================

/**
 * Consistent font weights across platforms
 * React Native requires string values for fontWeight
 */
export const FontWeight = {
  thin: '100' as const,
  extraLight: '200' as const,
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
  black: '900' as const,
} as const;

// ============================================================================
// TYPE SCALE - Modular Scale (1.25 ratio)
// ============================================================================

/**
 * Font sizes following a modular scale
 * Base: 16px, Ratio: 1.25
 * Each step up multiplies by 1.25
 */
export const FontSize = {
  // Extra small - legal text, timestamps
  '2xs': 10,
  
  // Extra small - captions, labels
  xs: 11,
  
  // Small - secondary text, metadata
  sm: 13,
  
  // Base - body text, default
  base: 15,
  
  // Medium - emphasized body, subheadings
  md: 16,
  
  // Large - section titles
  lg: 18,
  
  // Extra large - card titles
  xl: 20,
  
  // 2X large - page subtitles
  '2xl': 24,
  
  // 3X large - page titles
  '3xl': 28,
  
  // 4X large - hero headings
  '4xl': 34,
  
  // 5X large - display text
  '5xl': 42,
  
  // 6X large - huge display
  '6xl': 52,
} as const;

// ============================================================================
// LINE HEIGHTS
// ============================================================================

/**
 * Line height multipliers for optimal readability
 * Tighter for headlines, looser for body text
 */
export const LineHeight = {
  // Tight - headlines, display text
  none: 1.0,
  tight: 1.15,
  
  // Snug - subheadings
  snug: 1.25,
  
  // Normal - short paragraphs
  normal: 1.4,
  
  // Relaxed - body text, paragraphs
  relaxed: 1.5,
  
  // Loose - long-form reading
  loose: 1.65,
  
  // Extra loose - accessibility
  extraLoose: 1.8,
} as const;

// ============================================================================
// LETTER SPACING (Tracking)
// ============================================================================

/**
 * Letter spacing values for different contexts
 * Negative for headlines, positive for all-caps
 */
export const LetterSpacing = {
  // Tighter - large headlines
  tighter: -1.0,
  tight: -0.5,
  
  // Normal - most text
  normal: 0,
  
  // Wide - labels, buttons
  wide: 0.25,
  wider: 0.5,
  
  // Widest - all-caps text
  widest: 1.0,
} as const;

// ============================================================================
// PRE-COMPOSED TEXT STYLES
// ============================================================================

/**
 * Ready-to-use text styles following design system conventions
 * Each style is optimized for its intended use case
 */
export const TextStyles: Record<string, TextStyle> = {
  // ==========================================================================
  // DISPLAY STYLES - Hero sections, splash screens
  // ==========================================================================
  displayLarge: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['6xl'],
    fontWeight: FontWeight.bold,
    letterSpacing: LetterSpacing.tighter,
    lineHeight: FontSize['6xl'] * LineHeight.tight,
  },
  
  displayMedium: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['5xl'],
    fontWeight: FontWeight.bold,
    letterSpacing: LetterSpacing.tighter,
    lineHeight: FontSize['5xl'] * LineHeight.tight,
  },
  
  displaySmall: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['4xl'],
    fontWeight: FontWeight.bold,
    letterSpacing: LetterSpacing.tight,
    lineHeight: FontSize['4xl'] * LineHeight.tight,
  },
  
  // ==========================================================================
  // HEADLINE STYLES - Page titles, section headers
  // ==========================================================================
  headlineLarge: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
    letterSpacing: LetterSpacing.tight,
    lineHeight: FontSize['3xl'] * LineHeight.snug,
  },
  
  headlineMedium: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.semiBold,
    letterSpacing: LetterSpacing.tight,
    lineHeight: FontSize['2xl'] * LineHeight.snug,
  },
  
  headlineSmall: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semiBold,
    letterSpacing: LetterSpacing.normal,
    lineHeight: FontSize.xl * LineHeight.snug,
  },
  
  // ==========================================================================
  // TITLE STYLES - Card titles, list headers
  // ==========================================================================
  titleLarge: {
    fontFamily: FontFamily.primary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semiBold,
    letterSpacing: LetterSpacing.normal,
    lineHeight: FontSize.lg * LineHeight.snug,
  },
  
  titleMedium: {
    fontFamily: FontFamily.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semiBold,
    letterSpacing: LetterSpacing.normal,
    lineHeight: FontSize.md * LineHeight.normal,
  },
  
  titleSmall: {
    fontFamily: FontFamily.primary,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    letterSpacing: LetterSpacing.normal,
    lineHeight: FontSize.base * LineHeight.normal,
  },
  
  // ==========================================================================
  // BODY STYLES - Paragraphs, descriptions
  // ==========================================================================
  bodyLarge: {
    fontFamily: FontFamily.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
    letterSpacing: LetterSpacing.normal,
    lineHeight: FontSize.md * LineHeight.relaxed,
  },
  
  bodyMedium: {
    fontFamily: FontFamily.primary,
    fontSize: FontSize.base,
    fontWeight: FontWeight.regular,
    letterSpacing: LetterSpacing.normal,
    lineHeight: FontSize.base * LineHeight.relaxed,
  },
  
  bodySmall: {
    fontFamily: FontFamily.primary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    letterSpacing: LetterSpacing.normal,
    lineHeight: FontSize.sm * LineHeight.relaxed,
  },
  
  // ==========================================================================
  // LABEL STYLES - Form labels, button text
  // ==========================================================================
  labelLarge: {
    fontFamily: FontFamily.primary,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    letterSpacing: LetterSpacing.wide,
    lineHeight: FontSize.base * LineHeight.normal,
  },
  
  labelMedium: {
    fontFamily: FontFamily.primary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    letterSpacing: LetterSpacing.wide,
    lineHeight: FontSize.sm * LineHeight.normal,
  },
  
  labelSmall: {
    fontFamily: FontFamily.primary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    letterSpacing: LetterSpacing.wider,
    lineHeight: FontSize.xs * LineHeight.normal,
  },
  
  // ==========================================================================
  // CAPTION STYLES - Metadata, timestamps, footnotes
  // ==========================================================================
  caption: {
    fontFamily: FontFamily.primary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.regular,
    letterSpacing: LetterSpacing.normal,
    lineHeight: FontSize.xs * LineHeight.normal,
  },
  
  captionSmall: {
    fontFamily: FontFamily.primary,
    fontSize: FontSize['2xs'],
    fontWeight: FontWeight.regular,
    letterSpacing: LetterSpacing.wide,
    lineHeight: FontSize['2xs'] * LineHeight.normal,
  },
  
  // ==========================================================================
  // BUTTON STYLES
  // ==========================================================================
  buttonLarge: {
    fontFamily: FontFamily.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semiBold,
    letterSpacing: LetterSpacing.wide,
    lineHeight: FontSize.md * LineHeight.tight,
  },
  
  buttonMedium: {
    fontFamily: FontFamily.primary,
    fontSize: FontSize.base,
    fontWeight: FontWeight.semiBold,
    letterSpacing: LetterSpacing.wide,
    lineHeight: FontSize.base * LineHeight.tight,
  },
  
  buttonSmall: {
    fontFamily: FontFamily.primary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    letterSpacing: LetterSpacing.wide,
    lineHeight: FontSize.sm * LineHeight.tight,
  },
  
  // ==========================================================================
  // SPECIAL STYLES
  // ==========================================================================
  overline: {
    fontFamily: FontFamily.primary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    letterSpacing: LetterSpacing.widest,
    lineHeight: FontSize.xs * LineHeight.normal,
    textTransform: 'uppercase',
  },
  
  code: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    letterSpacing: LetterSpacing.normal,
    lineHeight: FontSize.sm * LineHeight.relaxed,
  },
  
  number: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    letterSpacing: LetterSpacing.normal,
    lineHeight: FontSize.md * LineHeight.tight,
  },
  
  badge: {
    fontFamily: FontFamily.primary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: LetterSpacing.wide,
    lineHeight: FontSize.xs * LineHeight.tight,
  },
  
  chip: {
    fontFamily: FontFamily.primary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    letterSpacing: LetterSpacing.normal,
    lineHeight: FontSize.sm * LineHeight.tight,
  },
  
  tabLabel: {
    fontFamily: FontFamily.primary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    letterSpacing: LetterSpacing.wide,
    lineHeight: FontSize.xs * LineHeight.tight,
  },
  
  link: {
    fontFamily: FontFamily.primary,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    letterSpacing: LetterSpacing.normal,
    lineHeight: FontSize.base * LineHeight.relaxed,
    textDecorationLine: 'underline',
  },
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Rounds a font size to the nearest pixel for crisp rendering
 */
export const pixelPerfectFont = (size: number): number => {
  return Math.round(PixelRatio.roundToNearestPixel(size));
};

/**
 * Scales font size based on screen width
 * Useful for responsive typography
 * 
 * @param size - Base font size
 * @param minScale - Minimum scale factor (default 0.85)
 * @param maxScale - Maximum scale factor (default 1.15)
 */
export const responsiveFontSize = (
  size: number,
  minScale: number = 0.85,
  maxScale: number = 1.15,
): number => {
  const baseWidth = 375; // iPhone standard width
  const scale = SCREEN_WIDTH / baseWidth;
  const clampedScale = Math.max(minScale, Math.min(maxScale, scale));
  return pixelPerfectFont(size * clampedScale);
};

/**
 * Gets scaled font size respecting user's accessibility settings
 */
export const accessibleFontSize = (size: number): number => {
  return pixelPerfectFont(size * PixelRatio.getFontScale());
};

/**
 * Creates a text style with custom properties
 * Useful for one-off styling needs
 */
export const createTextStyle = (
  size: keyof typeof FontSize,
  weight: keyof typeof FontWeight = 'regular',
  options?: {
    family?: keyof typeof FontFamily;
    lineHeight?: keyof typeof LineHeight;
    letterSpacing?: keyof typeof LetterSpacing;
    color?: string;
  },
): TextStyle => {
  const fontSize = FontSize[size];
  return {
    fontFamily: FontFamily[options?.family || 'primary'],
    fontSize,
    fontWeight: FontWeight[weight],
    letterSpacing: LetterSpacing[options?.letterSpacing || 'normal'],
    lineHeight: fontSize * LineHeight[options?.lineHeight || 'normal'],
    ...(options?.color && { color: options.color }),
  };
};

/**
 * Applies truncation to text style
 */
export const withTruncation = (
  style: TextStyle,
  numberOfLines: number = 1,
): TextStyle & { numberOfLines: number } => ({
  ...style,
  numberOfLines,
});

// ============================================================================
// SEMANTIC TYPOGRAPHY ALIASES
// ============================================================================

/**
 * Semantic aliases for common use cases
 * Makes code more readable and intentional
 */
export const Typography = {
  // Screen titles
  screenTitle: TextStyles.headlineLarge,
  screenSubtitle: TextStyles.bodyLarge,
  
  // Section headers
  sectionTitle: TextStyles.titleLarge,
  sectionSubtitle: TextStyles.bodyMedium,
  
  // Card content
  cardTitle: TextStyles.titleMedium,
  cardSubtitle: TextStyles.bodySmall,
  cardBody: TextStyles.bodyMedium,
  
  // List items
  listTitle: TextStyles.titleSmall,
  listSubtitle: TextStyles.caption,
  
  // Form elements
  inputLabel: TextStyles.labelMedium,
  inputText: TextStyles.bodyMedium,
  inputError: TextStyles.caption,
  inputHelper: TextStyles.captionSmall,
  
  // Navigation
  navTitle: TextStyles.titleMedium,
  tabLabel: TextStyles.tabLabel,
  
  // Buttons
  primaryButton: TextStyles.buttonMedium,
  secondaryButton: TextStyles.buttonMedium,
  textButton: TextStyles.labelMedium,
  
  // Status & info
  badge: TextStyles.badge,
  chip: TextStyles.chip,
  tag: TextStyles.labelSmall,
  
  // Data display
  statValue: TextStyles.headlineMedium,
  statLabel: TextStyles.caption,
  
  // Empty states
  emptyTitle: TextStyles.titleLarge,
  emptyBody: TextStyles.bodyMedium,
} as const;

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  FontFamily,
  FontWeight,
  FontSize,
  LineHeight,
  LetterSpacing,
  TextStyles,
  Typography,
  // Utilities
  pixelPerfectFont,
  responsiveFontSize,
  accessibleFontSize,
  createTextStyle,
  withTruncation,
};

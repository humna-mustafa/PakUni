/**
 * AppText - Enhanced Text Component
 * 
 * A drop-in replacement for React Native's Text component with
 * built-in typography system support and theme awareness.
 * 
 * Usage:
 * <AppText variant="headlineLarge">Hello World</AppText>
 * <AppText variant="bodyMedium" color="secondary">Subtitle</AppText>
 * <AppText size="lg" weight="semiBold">Custom Text</AppText>
 */

import React, { useMemo } from 'react';
import {
  Text,
  TextProps,
  TextStyle,
  StyleSheet,
  StyleProp,
} from 'react-native';
import { useTheme, ThemeColors } from '../contexts/ThemeContext';
import {
  TextStyles,
  FontFamily,
  FontWeight,
  FontSize,
  LineHeight,
  LetterSpacing,
  pixelPerfectFont,
} from '../constants/typography';

// ============================================================================
// TYPES
// ============================================================================

type TextVariant = keyof typeof TextStyles;
type FontSizeKey = keyof typeof FontSize;
type FontWeightKey = keyof typeof FontWeight;
type LineHeightKey = keyof typeof LineHeight;
type LetterSpacingKey = keyof typeof LetterSpacing;
type FontFamilyKey = keyof typeof FontFamily;

type TextColorKey =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'inverse'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'onPrimary';

interface AppTextProps extends TextProps {
  /**
   * Pre-defined text style variant
   * Takes precedence over individual style props
   */
  variant?: TextVariant;
  
  /**
   * Font size - use predefined scale
   */
  size?: FontSizeKey;
  
  /**
   * Font weight
   */
  weight?: FontWeightKey;
  
  /**
   * Line height multiplier
   */
  lineHeight?: LineHeightKey;
  
  /**
   * Letter spacing
   */
  letterSpacing?: LetterSpacingKey;
  
  /**
   * Font family
   */
  family?: FontFamilyKey;
  
  /**
   * Semantic color from theme
   */
  color?: TextColorKey;
  
  /**
   * Text alignment
   */
  align?: 'left' | 'center' | 'right' | 'justify';
  
  /**
   * Whether to use uppercase
   */
  uppercase?: boolean;
  
  /**
   * Custom color (hex or rgba)
   * Use `color` prop for theme colors instead when possible
   */
  customColor?: string;
  
  /**
   * Children
   */
  children?: React.ReactNode;
}

// ============================================================================
// COLOR MAPPING
// ============================================================================

const getThemeColor = (
  colors: ThemeColors,
  colorKey: TextColorKey,
): string => {
  const colorMap: Record<TextColorKey, string> = {
    primary: colors.primary,
    secondary: colors.textSecondary,
    muted: colors.textMuted,
    inverse: colors.textInverse,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
    onPrimary: colors.textOnPrimary,
  };
  return colorMap[colorKey];
};

// ============================================================================
// COMPONENT
// ============================================================================

export const AppText: React.FC<AppTextProps> = ({
  variant,
  size,
  weight,
  lineHeight,
  letterSpacing,
  family,
  color,
  align,
  uppercase,
  customColor,
  style,
  children,
  ...props
}) => {
  const { colors } = useTheme();
  
  const computedStyle = useMemo((): StyleProp<TextStyle> => {
    let baseStyle: TextStyle = {};
    
    // Apply variant if specified
    if (variant && TextStyles[variant]) {
      baseStyle = { ...TextStyles[variant] };
    }
    
    // Override with individual props
    if (size) {
      const fontSize = FontSize[size];
      baseStyle.fontSize = pixelPerfectFont(fontSize);
      // Recalculate line height if not explicitly set
      if (!lineHeight && !variant) {
        baseStyle.lineHeight = pixelPerfectFont(fontSize * LineHeight.normal);
      }
    }
    
    if (weight) {
      baseStyle.fontWeight = FontWeight[weight];
    }
    
    if (family) {
      baseStyle.fontFamily = FontFamily[family];
    }
    
    if (lineHeight) {
      const fontSize = baseStyle.fontSize || FontSize.base;
      baseStyle.lineHeight = pixelPerfectFont(
        (typeof fontSize === 'number' ? fontSize : FontSize.base) * LineHeight[lineHeight],
      );
    }
    
    if (letterSpacing) {
      baseStyle.letterSpacing = LetterSpacing[letterSpacing];
    }
    
    // Apply color
    if (customColor) {
      baseStyle.color = customColor;
    } else if (color) {
      baseStyle.color = getThemeColor(colors, color);
    } else if (!variant) {
      // Default to theme text color if no variant or color specified
      baseStyle.color = colors.text;
    }
    
    // Apply alignment
    if (align) {
      baseStyle.textAlign = align;
    }
    
    // Apply uppercase
    if (uppercase) {
      baseStyle.textTransform = 'uppercase';
    }
    
    return baseStyle;
  }, [
    variant,
    size,
    weight,
    lineHeight,
    letterSpacing,
    family,
    color,
    customColor,
    align,
    uppercase,
    colors,
  ]);
  
  return (
    <Text style={[computedStyle, style]} {...props}>
      {children}
    </Text>
  );
};

// ============================================================================
// CONVENIENCE COMPONENTS
// ============================================================================

type SizeOption = 'large' | 'medium' | 'small';

const getVariantForSize = (
  size: SizeOption | undefined,
  prefix: string,
): TextVariant => {
  const sizeValue = size || 'medium';
  const capitalizedSize = sizeValue.charAt(0).toUpperCase() + sizeValue.slice(1);
  return `${prefix}${capitalizedSize}` as TextVariant;
};

/**
 * Display text - for hero sections and splash screens
 */
export const DisplayText: React.FC<Omit<AppTextProps, 'variant'> & { size?: SizeOption }> = ({
  size,
  ...props
}) => {
  return <AppText variant={getVariantForSize(size, 'display')} {...props} />;
};

/**
 * Headline text - for page titles
 */
export const HeadlineText: React.FC<Omit<AppTextProps, 'variant'> & { size?: SizeOption }> = ({
  size,
  ...props
}) => {
  return <AppText variant={getVariantForSize(size, 'headline')} {...props} />;
};

/**
 * Title text - for section headers and cards
 */
export const TitleText: React.FC<Omit<AppTextProps, 'variant'> & { size?: SizeOption }> = ({
  size,
  ...props
}) => {
  return <AppText variant={getVariantForSize(size, 'title')} {...props} />;
};

/**
 * Body text - for paragraphs and descriptions
 */
export const BodyText: React.FC<Omit<AppTextProps, 'variant'> & { size?: SizeOption }> = ({
  size,
  ...props
}) => {
  return <AppText variant={getVariantForSize(size, 'body')} {...props} />;
};

/**
 * Label text - for form labels and buttons
 */
export const LabelText: React.FC<Omit<AppTextProps, 'variant'> & { size?: SizeOption }> = ({
  size,
  ...props
}) => {
  return <AppText variant={getVariantForSize(size, 'label')} {...props} />;
};

/**
 * Caption text - for metadata and footnotes
 */
export const CaptionText: React.FC<Omit<AppTextProps, 'variant'> & { small?: boolean }> = ({
  small = false,
  ...props
}) => {
  return <AppText variant={small ? 'captionSmall' : 'caption'} {...props} />;
};

/**
 * Button text - for button labels
 */
export const ButtonText: React.FC<Omit<AppTextProps, 'variant'> & { size?: SizeOption }> = ({
  size,
  ...props
}) => {
  return <AppText variant={getVariantForSize(size, 'button')} {...props} />;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default AppText;

/**
 * Elite Typography Components
 * Fluid, accessible text components with semantic hierarchy
 */

import React from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  StyleSheet,
  TextStyle,
  Platform,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { ELITE_TYPOGRAPHY } from '../../constants/elite';

// ============================================================================
// TYPES
// ============================================================================
type TextVariant =
  | 'displayLarge'
  | 'displayMedium'
  | 'displaySmall'
  | 'headlineLarge'
  | 'headlineMedium'
  | 'headlineSmall'
  | 'titleLarge'
  | 'titleMedium'
  | 'titleSmall'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'bodySmall'
  | 'labelLarge'
  | 'labelMedium'
  | 'labelSmall';

type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';
type TextColor = 'primary' | 'secondary' | 'tertiary' | 'muted' | 'inverse' | 'error' | 'success' | 'warning' | 'accent';

interface EliteTextProps extends RNTextProps {
  variant?: TextVariant;
  weight?: TextWeight;
  color?: TextColor;
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

// ============================================================================
// VARIANT CONFIGURATIONS
// ============================================================================
const VARIANT_CONFIG: Record<TextVariant, { fontSize: number; lineHeight: number; letterSpacing: number; weight: TextWeight }> = {
  displayLarge: {
    fontSize: ELITE_TYPOGRAPHY.fluid.display,
    lineHeight: ELITE_TYPOGRAPHY.lineHeight.tight,
    letterSpacing: ELITE_TYPOGRAPHY.tracking.tighter,
    weight: 'bold',
  },
  displayMedium: {
    fontSize: ELITE_TYPOGRAPHY.fluid.largeTitle,
    lineHeight: ELITE_TYPOGRAPHY.lineHeight.tight,
    letterSpacing: ELITE_TYPOGRAPHY.tracking.tight,
    weight: 'bold',
  },
  displaySmall: {
    fontSize: ELITE_TYPOGRAPHY.fluid.title1,
    lineHeight: ELITE_TYPOGRAPHY.lineHeight.snug,
    letterSpacing: ELITE_TYPOGRAPHY.tracking.tight,
    weight: 'bold',
  },
  headlineLarge: {
    fontSize: ELITE_TYPOGRAPHY.fluid.title1,
    lineHeight: ELITE_TYPOGRAPHY.lineHeight.snug,
    letterSpacing: ELITE_TYPOGRAPHY.tracking.normal,
    weight: 'semibold',
  },
  headlineMedium: {
    fontSize: ELITE_TYPOGRAPHY.fluid.title2,
    lineHeight: ELITE_TYPOGRAPHY.lineHeight.snug,
    letterSpacing: ELITE_TYPOGRAPHY.tracking.normal,
    weight: 'semibold',
  },
  headlineSmall: {
    fontSize: ELITE_TYPOGRAPHY.fluid.title3,
    lineHeight: ELITE_TYPOGRAPHY.lineHeight.normal,
    letterSpacing: ELITE_TYPOGRAPHY.tracking.normal,
    weight: 'semibold',
  },
  titleLarge: {
    fontSize: ELITE_TYPOGRAPHY.fluid.headline,
    lineHeight: ELITE_TYPOGRAPHY.lineHeight.normal,
    letterSpacing: ELITE_TYPOGRAPHY.tracking.normal,
    weight: 'semibold',
  },
  titleMedium: {
    fontSize: ELITE_TYPOGRAPHY.fluid.body,
    lineHeight: ELITE_TYPOGRAPHY.lineHeight.normal,
    letterSpacing: ELITE_TYPOGRAPHY.tracking.wide,
    weight: 'medium',
  },
  titleSmall: {
    fontSize: ELITE_TYPOGRAPHY.fluid.subhead,
    lineHeight: ELITE_TYPOGRAPHY.lineHeight.normal,
    letterSpacing: ELITE_TYPOGRAPHY.tracking.wide,
    weight: 'medium',
  },
  bodyLarge: {
    fontSize: ELITE_TYPOGRAPHY.fluid.body,
    lineHeight: ELITE_TYPOGRAPHY.lineHeight.relaxed,
    letterSpacing: ELITE_TYPOGRAPHY.tracking.normal,
    weight: 'regular',
  },
  bodyMedium: {
    fontSize: ELITE_TYPOGRAPHY.fluid.subhead,
    lineHeight: ELITE_TYPOGRAPHY.lineHeight.relaxed,
    letterSpacing: ELITE_TYPOGRAPHY.tracking.normal,
    weight: 'regular',
  },
  bodySmall: {
    fontSize: ELITE_TYPOGRAPHY.fluid.footnote,
    lineHeight: ELITE_TYPOGRAPHY.lineHeight.relaxed,
    letterSpacing: ELITE_TYPOGRAPHY.tracking.normal,
    weight: 'regular',
  },
  labelLarge: {
    fontSize: ELITE_TYPOGRAPHY.fluid.subhead,
    lineHeight: ELITE_TYPOGRAPHY.lineHeight.normal,
    letterSpacing: ELITE_TYPOGRAPHY.tracking.wide,
    weight: 'medium',
  },
  labelMedium: {
    fontSize: ELITE_TYPOGRAPHY.fluid.caption,
    lineHeight: ELITE_TYPOGRAPHY.lineHeight.normal,
    letterSpacing: ELITE_TYPOGRAPHY.tracking.wider,
    weight: 'medium',
  },
  labelSmall: {
    fontSize: ELITE_TYPOGRAPHY.fluid.caption2,
    lineHeight: ELITE_TYPOGRAPHY.lineHeight.normal,
    letterSpacing: ELITE_TYPOGRAPHY.tracking.widest,
    weight: 'medium',
  },
};

// ============================================================================
// ELITE TEXT COMPONENT
// ============================================================================
export const EliteText: React.FC<EliteTextProps> = ({
  variant = 'bodyMedium',
  weight,
  color = 'primary',
  align = 'left',
  style,
  children,
  ...props
}) => {
  const { colors } = useTheme();
  
  const variantConfig = VARIANT_CONFIG[variant];
  const finalWeight = weight || variantConfig.weight;

  // Get color value
  const getColor = (): string => {
    switch (color) {
      case 'primary': return colors.text;
      case 'secondary': return colors.textSecondary;
      case 'tertiary': return colors.textMuted;
      case 'muted': return colors.textMuted;
      case 'inverse': return colors.textInverse;
      case 'error': return colors.error;
      case 'success': return colors.success;
      case 'warning': return colors.warning;
      case 'accent': return colors.primary;
      default: return colors.text;
    }
  };

  // Get weight value
  const getWeight = (): TextStyle['fontWeight'] => {
    switch (finalWeight) {
      case 'regular': return ELITE_TYPOGRAPHY.weight.regular;
      case 'medium': return ELITE_TYPOGRAPHY.weight.medium;
      case 'semibold': return ELITE_TYPOGRAPHY.weight.semibold;
      case 'bold': return ELITE_TYPOGRAPHY.weight.bold;
      default: return ELITE_TYPOGRAPHY.weight.regular;
    }
  };

  const textStyle: TextStyle = {
    fontSize: variantConfig.fontSize,
    lineHeight: variantConfig.fontSize * variantConfig.lineHeight,
    letterSpacing: variantConfig.letterSpacing,
    fontWeight: getWeight(),
    color: getColor(),
    textAlign: align,
    fontFamily: variant.startsWith('display') || variant.startsWith('headline')
      ? ELITE_TYPOGRAPHY.fontFamily.display
      : ELITE_TYPOGRAPHY.fontFamily.text,
  };

  return (
    <RNText style={[textStyle, style]} {...props}>
      {children}
    </RNText>
  );
};

// ============================================================================
// SEMANTIC TEXT SHORTCUTS
// ============================================================================
interface SimpleTextProps extends Omit<EliteTextProps, 'variant'> {}

// Display variants
export const DisplayLarge: React.FC<SimpleTextProps> = (props) => (
  <EliteText variant="displayLarge" {...props} />
);
export const DisplayMedium: React.FC<SimpleTextProps> = (props) => (
  <EliteText variant="displayMedium" {...props} />
);
export const DisplaySmall: React.FC<SimpleTextProps> = (props) => (
  <EliteText variant="displaySmall" {...props} />
);

// Headline variants
export const HeadlineLarge: React.FC<SimpleTextProps> = (props) => (
  <EliteText variant="headlineLarge" {...props} />
);
export const HeadlineMedium: React.FC<SimpleTextProps> = (props) => (
  <EliteText variant="headlineMedium" {...props} />
);
export const HeadlineSmall: React.FC<SimpleTextProps> = (props) => (
  <EliteText variant="headlineSmall" {...props} />
);

// Title variants
export const TitleLarge: React.FC<SimpleTextProps> = (props) => (
  <EliteText variant="titleLarge" {...props} />
);
export const TitleMedium: React.FC<SimpleTextProps> = (props) => (
  <EliteText variant="titleMedium" {...props} />
);
export const TitleSmall: React.FC<SimpleTextProps> = (props) => (
  <EliteText variant="titleSmall" {...props} />
);

// Body variants
export const BodyLarge: React.FC<SimpleTextProps> = (props) => (
  <EliteText variant="bodyLarge" {...props} />
);
export const BodyMedium: React.FC<SimpleTextProps> = (props) => (
  <EliteText variant="bodyMedium" {...props} />
);
export const BodySmall: React.FC<SimpleTextProps> = (props) => (
  <EliteText variant="bodySmall" {...props} />
);

// Label variants
export const LabelLarge: React.FC<SimpleTextProps> = (props) => (
  <EliteText variant="labelLarge" {...props} />
);
export const LabelMedium: React.FC<SimpleTextProps> = (props) => (
  <EliteText variant="labelMedium" {...props} />
);
export const LabelSmall: React.FC<SimpleTextProps> = (props) => (
  <EliteText variant="labelSmall" {...props} />
);

// ============================================================================
// GRADIENT TEXT (Decorative)
// ============================================================================
interface GradientTextProps extends SimpleTextProps {
  gradient?: string[];
}

export const GradientText: React.FC<GradientTextProps> = ({
  gradient,
  style,
  children,
  ...props
}) => {
  const { colors } = useTheme();
  
  // Fallback to solid color since MaskedView may not be available
  return (
    <EliteText
      variant="displaySmall"
      style={[{ color: gradient?.[0] || colors.primary }, style]}
      {...props}
    >
      {children}
    </EliteText>
  );
};

export default EliteText;

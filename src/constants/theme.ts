import { Platform } from 'react-native';

// Theme constants for consistent styling
export const COLORS = {
  primary: '#1E88E5',
  primaryLight: '#E3F2FD',
  primaryDark: '#1565C0',
  secondary: '#00897B',
  success: '#43A047',
  warning: '#FB8C00',
  error: '#E53935',
  info: '#0288D1',
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  gray100: '#F8F9FA',
  gray200: '#E9ECEF',
  gray300: '#DEE2E6',
  gray400: '#CED4DA',
  gray500: '#ADB5BD',
  gray600: '#6C757D',
  gray700: '#495057',
  gray800: '#343A40',
  gray900: '#212529',
  
  // Background colors
  background: '#F5F7FA',
  backgroundSecondary: '#FFFFFF',
  
  // Text colors
  text: '#212529',
  textSecondary: '#6C757D',
  textLight: '#FFFFFF',
  
  // Border
  border: '#E9ECEF',
};

/**
 * Enhanced Font System
 * Platform-optimized font families with comprehensive weight and size options
 */
export const FONTS = {
  // Font families - platform optimized
  family: {
    primary: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    display: Platform.select({
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
  
  // Legacy aliases (backward compatibility)
  regular: 'System',
  medium: 'System',
  bold: 'System',
  
  // Font weights
  weight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
    extraBold: '800' as const,
  },
  
  // Font sizes - refined scale
  sizes: {
    '2xs': 10,
    xs: 11,
    sm: 13,
    md: 15,
    base: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    xxl: 24,
    '3xl': 28,
    xxxl: 32,
    '4xl': 34,
    display: 42,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.15,
    snug: 1.25,
    normal: 1.4,
    relaxed: 1.5,
    loose: 1.65,
  },
  
  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

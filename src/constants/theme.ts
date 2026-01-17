import { Platform } from 'react-native';

// Theme constants for consistent styling
// Brand Color: #4573DF - Professional blue
export const COLORS = {
  primary: '#4573DF',  // Brand blue
  primaryLight: '#E8EFFC',
  primaryDark: '#3660C9',
  secondary: '#10B981',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#4573DF',  // Use brand blue for info
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  gray100: '#F8FAFC',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',
  
  // Background colors
  background: '#F8FAFC',
  backgroundSecondary: '#FFFFFF',
  
  // Text colors
  text: '#0F172A',
  textSecondary: '#475569',
  textLight: '#FFFFFF',
  
  // Border
  border: '#E2E8F0',
  
  // Dark mode specific
  darkBackground: '#1D2127',
  darkBackgroundSecondary: '#232930',
  darkCard: '#272C34',
  darkCardElevated: '#2E343D',
  darkBorder: '#2E343D',
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

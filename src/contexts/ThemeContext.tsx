/**
 * ThemeContext - Global theme management with auto-detection
 * Provides dark mode support throughout the app
 */

import React, {createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback} from 'react';
import {useColorScheme, Appearance, ColorSchemeName} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {logger} from '../utils/logger';

// Storage key for theme preference
const THEME_STORAGE_KEY = '@pakuni_theme_preference';

// Theme mode types
export type ThemeMode = 'light' | 'dark' | 'system';

// Color palette interface
export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  
  // Status colors
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  info: string;
  infoLight: string;
  
  // Background colors
  background: string;
  backgroundSecondary: string;
  surface: string;
  card: string;
  cardElevated: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  textOnPrimary: string;
  
  // Border colors
  border: string;
  borderLight: string;
  borderFocused: string;
  
  // Semantic colors
  overlay: string;
  shadow: string;
  divider: string;
  highlight: string;
  
  // Gradient colors
  gradientStart: string;
  gradientEnd: string;
  
  // Tab bar
  tabBarBackground: string;
  tabBarActive: string;
  tabBarInactive: string;
  
  // Input colors
  inputBackground: string;
  inputBorder: string;
  inputText: string;
  placeholder: string;
  
  // Skeleton loading
  skeletonBase: string;
  skeletonHighlight: string;
  
  // Badge colors
  badgeBackground: string;
  badgeText: string;
  
  // Header colors  
  headerBackground: string;
  headerText: string;
  
  // Base colors
  white: string;
  black: string;
}

// Light theme colors - Sky Blue Education Palette
// Inspired by top universities (Oxford, Cambridge), calm, professional, inviting
export const lightColors: ThemeColors = {
  // Primary - Beautiful sky blue, trust, learning, wisdom
  primary: '#0EA5E9',  // Sky blue - warm, friendly, educational
  primaryLight: '#E0F2FE',
  primaryDark: '#0284C7',
  secondary: '#10B981',  // Soft green for achievements
  secondaryLight: '#ECFDF5',
  
  // Status colors - Professional, warm tones
  success: '#059669',
  successLight: '#ECFDF5',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#0EA5E9',
  infoLight: '#E0F2FE',
  
  // Background - Subtle warmth, clean
  background: '#FAFBFC',
  backgroundSecondary: '#FFFFFF',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  
  // Text - High contrast, readable
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',
  textOnPrimary: '#FFFFFF',
  
  // Borders - Subtle, elegant
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderFocused: '#0EA5E9',
  
  // Semantic
  overlay: 'rgba(0, 0, 0, 0.4)',
  shadow: 'rgba(0, 0, 0, 0.05)',
  divider: '#E2E8F0',
  highlight: '#FEF9E7',
  
  // Gradients - Sky blue focused
  gradientStart: '#0EA5E9',
  gradientEnd: '#06B6D4',  // Cyan for depth
  
  // Tab bar - Clean, minimal
  tabBarBackground: '#FFFFFF',
  tabBarActive: '#0EA5E9',
  tabBarInactive: '#94A3B8',
  
  // Input - Refined
  inputBackground: '#F8FAFC',
  inputBorder: '#E2E8F0',
  inputText: '#0F172A',
  placeholder: '#94A3B8',
  
  // Skeleton - Subtle animation
  skeletonBase: '#F1F5F9',
  skeletonHighlight: '#F8FAFC',
  
  // Badge - Accent color
  badgeBackground: '#EF4444',
  badgeText: '#FFFFFF',
  
  // Header - Clean, light
  headerBackground: '#FFFFFF',
  headerText: '#0F172A',
  
  // Base colors
  white: '#FFFFFF',
  black: '#000000',
};

// Dark theme colors - AMOLED-optimized with softer blues, eye-comfortable
// Softer than pure black/white, better for extended reading and learning
export const darkColors: ThemeColors = {
  // Primary - Softer sky blue for dark mode, not harsh
  primary: '#38BDF8',  // Lighter, warmer sky blue for dark
  primaryLight: '#082F49',  // Deep but soft blue
  primaryDark: '#7DD3FC',
  secondary: '#6EE7B7',  // Softer green
  secondaryLight: '#082F49',
  
  // Status colors - Softened pastels for dark mode, eye-friendly
  success: '#6EE7B7',
  successLight: '#064E3B',
  warning: '#FCD34D',
  warningLight: '#451A03',
  error: '#FB7185',  // Softer red for dark
  errorLight: '#500724',
  info: '#38BDF8',
  infoLight: '#0C2D3E',
  
  // Background - Deep but soft, not pure black (better for OLED eyes)
  background: '#0B1118',  // Soft black instead of #09090B
  backgroundSecondary: '#161B22',  // Softer dark
  surface: '#161B22',
  card: '#1C2128',  // Softer than #1F1F23
  cardElevated: '#262C34',  // Softer than #27272A
  
  // Text - Optimized for dark mode readability, softer
  text: '#F5F6F8',  // Slightly softer white
  textSecondary: '#8B949E',  // Softer gray
  textMuted: '#6E7681',  // Softer muted
  textInverse: '#0B1118',
  textOnPrimary: '#FFFFFF',
  
  // Borders - Subtle separation, softer
  border: '#262C34',
  borderLight: '#1C2128',
  borderFocused: '#38BDF8',
  
  // Semantic - Softer overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.25)',
  divider: '#262C34',
  highlight: '#3D2817',
  
  // Gradients - Softer, sky-focused
  gradientStart: '#38BDF8',
  gradientEnd: '#22D3EE',  // Cyan
  
  // Tab bar - Soft dark
  tabBarBackground: '#161B22',
  tabBarActive: '#38BDF8',
  tabBarInactive: '#6E7681',
  
  // Input - Soft dark
  inputBackground: '#262C34',
  inputBorder: '#3D444D',
  inputText: '#F5F6F8',
  placeholder: '#6E7681',
  
  // Skeleton - Subtle animation
  skeletonBase: '#262C34',
  skeletonHighlight: '#3D444D',
  
  // Badge - Softer red
  badgeBackground: '#FB7185',
  badgeText: '#0B1118',
  
  // Header - Soft dark
  headerBackground: '#161B22',
  headerText: '#F5F6F8',
  
  // Base colors
  white: '#FFFFFF',
  black: '#000000',
};

// Theme context interface
interface ThemeContextType {
  // Current colors based on active theme
  colors: ThemeColors;
  // Whether dark mode is active
  isDark: boolean;
  // Current theme mode setting
  themeMode: ThemeMode;
  // Set theme mode (light, dark, or system)
  setThemeMode: (mode: ThemeMode) => void;
  // Toggle between light and dark (ignores system)
  toggleTheme: () => void;
  // Get a color with optional opacity
  getColor: (colorKey: keyof ThemeColors, opacity?: number) => string;
  // Check if theme is loaded from storage
  isThemeLoaded: boolean;
}

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  colors: lightColors,
  isDark: false,
  themeMode: 'system',
  setThemeMode: () => {},
  toggleTheme: () => {},
  getColor: () => '',
  isThemeLoaded: false,
});

// Provider props
interface ThemeProviderProps {
  children: ReactNode;
}

// Theme Provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({children}) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  // Determine if dark mode should be active
  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemColorScheme]);

  // Get current colors based on theme
  const colors = useMemo(() => (isDark ? darkColors : lightColors), [isDark]);

  // Load saved theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          setThemeModeState(savedTheme as ThemeMode);
        }
      } catch (error) {
        logger.warn('Failed to load theme preference:', error);
      } finally {
        setIsThemeLoaded(true);
      }
    };
    loadThemePreference();
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({colorScheme}) => {
      // Only update if theme mode is 'system'
      if (themeMode === 'system') {
        // The isDark memo will automatically update based on systemColorScheme
      }
    });
    return () => subscription.remove();
  }, [themeMode]);

  // Set theme mode and persist to storage
  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      logger.warn('Failed to save theme preference:', error);
    }
  }, []);

  // Toggle between light and dark (explicit modes)
  const toggleTheme = useCallback(() => {
    const newMode = isDark ? 'light' : 'dark';
    setThemeMode(newMode);
  }, [isDark, setThemeMode]);

  // Get color with optional opacity
  const getColor = useCallback(
    (colorKey: keyof ThemeColors, opacity?: number): string => {
      const color = colors[colorKey];
      if (opacity === undefined || opacity === 1) {
        return color;
      }
      // Convert hex to rgba
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    },
    [colors],
  );

  const contextValue = useMemo(
    () => ({
      colors,
      isDark,
      themeMode,
      setThemeMode,
      toggleTheme,
      getColor,
      isThemeLoaded,
    }),
    [colors, isDark, themeMode, setThemeMode, toggleTheme, getColor, isThemeLoaded],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Export context for advanced use cases
export {ThemeContext};

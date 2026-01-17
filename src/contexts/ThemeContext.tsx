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
  
  // Added for Premium Components
  tertiary: string;
  tertiaryLight: string;
  tertiaryDark: string;
  surfaceContainer: string;
  surfaceContainerLow: string;
  surfaceContainerHigh: string;
  textTertiary: string;
  
  // Base colors
  white: string;
  black: string;
}

// Light theme colors - Brand Color Palette
// Brand Primary: #4573df - Professional, trustworthy blue
// Inspired by megicode.com brand identity - tech-forward, clean
export const lightColors: ThemeColors = {
  // Primary - Brand blue (#4573df) - professional, trustworthy
  primary: '#4573DF',  // Brand primary - professional blue
  primaryLight: '#E8EFFC',  // Light variant for backgrounds
  primaryDark: '#3660C9',  // Darker variant for pressed states
  secondary: '#10B981',  // Green for achievements/success
  secondaryLight: '#ECFDF5',
  
  // Tertiary - Brand accent (#8B5CF6)
  tertiary: '#8B5CF6',
  tertiaryLight: '#F5F3FF',
  tertiaryDark: '#7C3AED',
  surfaceContainer: '#F1F5F9',
  surfaceContainerLow: '#F8FAFC',
  surfaceContainerHigh: '#E2E8F0',
  textTertiary: '#6366F1',
  
  // Status colors - Consistent, professional
  success: '#10B981',  // Emerald green
  successLight: '#ECFDF5',
  warning: '#F59E0B',  // Amber
  warningLight: '#FFFBEB',
  error: '#EF4444',  // Red
  errorLight: '#FEE2E2',
  info: '#4573DF',  // Use brand blue for info
  infoLight: '#E8EFFC',
  
  // Background - Clean, minimal
  background: '#F8FAFC',
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
  borderFocused: '#4573DF',  // Brand color for focus
  
  // Semantic
  overlay: 'rgba(0, 0, 0, 0.4)',
  shadow: 'rgba(0, 0, 0, 0.05)',
  divider: '#E2E8F0',
  highlight: '#E8EFFC',  // Brand light for highlights
  
  // Gradients - Brand blue focused
  gradientStart: '#4573DF',
  gradientEnd: '#4573DF',  // Lighter brand blue
  
  // Tab bar - Clean, minimal
  tabBarBackground: '#FFFFFF',
  tabBarActive: '#4573DF',  // Brand color
  tabBarInactive: '#94A3B8',
  
  // Input - Refined
  inputBackground: '#F8FAFC',
  inputBorder: '#E2E8F0',
  inputText: '#0F172A',
  placeholder: '#94A3B8',
  
  // Skeleton - Subtle animation
  skeletonBase: '#F1F5F9',
  skeletonHighlight: '#F8FAFC',
  
  // Badge - Brand accent
  badgeBackground: '#EF4444',
  badgeText: '#FFFFFF',
  
  // Header - Clean, light
  headerBackground: '#FFFFFF',
  headerText: '#0F172A',
  
  // Base colors
  white: '#FFFFFF',
  black: '#000000',
};

// Dark theme colors - Brand palette with AMOLED-optimized backgrounds
// Using user's dark mode colors: #1d2127 and #272c34
// Softer than pure black, better for extended reading
export const darkColors: ThemeColors = {
  // Primary - Same brand blue for consistency across modes
  primary: '#4573DF',  // Same brand blue in both modes for consistency
  primaryLight: '#1A2540',  // Deep blue tinted dark
  primaryDark: '#3660C9',  // Same darker variant for consistency
  secondary: '#6EE7B7',  // Softer green
  secondaryLight: '#1A2F2A',
  
  // Tertiary - Brand accent
  tertiary: '#A78BFA',
  tertiaryLight: '#2D2545',
  tertiaryDark: '#C4B5FD',
  surfaceContainer: '#272C34',
  surfaceContainerLow: '#1D2127',
  surfaceContainerHigh: '#323945',
  textTertiary: '#C4B5FD',
  
  // Status colors - Softened pastels for dark mode, eye-friendly
  success: '#6EE7B7',
  successLight: '#1A2F2A',
  warning: '#FCD34D',
  warningLight: '#2D2517',
  error: '#FB7185',  // Softer red for dark
  errorLight: '#2D1A1F',
  info: '#4573DF',  // Same brand blue
  infoLight: '#1A2540',
  
  // Background - Using brand dark colors #1d2127 and #272c34
  background: '#1D2127',  // Primary dark background
  backgroundSecondary: '#232930',  // Slightly lighter
  surface: '#232930',
  card: '#272C34',  // Card/elevated surface color
  cardElevated: '#2E343D',  // Higher elevation
  
  // Text - Optimized for dark mode readability
  text: '#F1F5F9',  // Slightly softer white
  textSecondary: '#94A3B8',  // Muted gray
  textMuted: '#64748B',  // More muted
  textInverse: '#1D2127',
  textOnPrimary: '#FFFFFF',
  
  // Borders - Subtle separation
  border: '#2E343D',
  borderLight: '#272C34',
  borderFocused: '#4573DF',  // Same brand blue
  
  // Semantic - Softer overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.3)',
  divider: '#2E343D',
  highlight: '#1A2540',
  
  // Gradients - Same brand blue
  gradientStart: '#4573DF',
  gradientEnd: '#3660C9',
  
  // Tab bar - Dark themed
  tabBarBackground: '#232930',
  tabBarActive: '#4573DF',  // Same brand blue
  tabBarInactive: '#64748B',
  
  // Input - Dark themed
  inputBackground: '#272C34',
  inputBorder: '#3D444D',
  inputText: '#F1F5F9',
  placeholder: '#64748B',
  
  // Skeleton - Subtle animation
  skeletonBase: '#272C34',
  skeletonHighlight: '#3D444D',
  
  // Badge - Softer red
  badgeBackground: '#FB7185',
  badgeText: '#1D2127',
  
  // Header - Dark themed
  headerBackground: '#232930',
  headerText: '#F1F5F9',
  
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


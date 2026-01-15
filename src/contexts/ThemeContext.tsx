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

// Light theme colors - Refined corporate palette inspired by Stripe, Linear, Notion
export const lightColors: ThemeColors = {
  // Primary - Refined indigo-blue, sophisticated and trustworthy
  primary: '#4F46E5',
  primaryLight: '#EEF2FF',
  primaryDark: '#4338CA',
  secondary: '#0D9488',
  secondaryLight: '#F0FDFA',
  
  // Status colors - Muted, professional tones
  success: '#059669',
  successLight: '#ECFDF5',
  warning: '#D97706',
  warningLight: '#FFFBEB',
  error: '#DC2626',
  errorLight: '#FEF2F2',
  info: '#0284C7',
  infoLight: '#F0F9FF',
  
  // Background - Pure, clean whites with subtle warmth
  background: '#FAFAFA',
  backgroundSecondary: '#FFFFFF',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  
  // Text - High contrast, readable
  text: '#18181B',
  textSecondary: '#52525B',
  textMuted: '#A1A1AA',
  textInverse: '#FFFFFF',
  textOnPrimary: '#FFFFFF',
  
  // Borders - Barely visible, elegant
  border: '#E4E4E7',
  borderLight: '#F4F4F5',
  borderFocused: '#4F46E5',
  
  // Semantic
  overlay: 'rgba(0, 0, 0, 0.4)',
  shadow: 'rgba(0, 0, 0, 0.04)',
  divider: '#E4E4E7',
  highlight: '#FEF9C3',
  
  // Gradients - Subtle, professional
  gradientStart: '#4F46E5',
  gradientEnd: '#6366F1',
  
  // Tab bar - Clean, minimal
  tabBarBackground: '#FFFFFF',
  tabBarActive: '#4F46E5',
  tabBarInactive: '#A1A1AA',
  
  // Input - Refined
  inputBackground: '#FAFAFA',
  inputBorder: '#E4E4E7',
  inputText: '#18181B',
  placeholder: '#A1A1AA',
  
  // Skeleton - Subtle animation
  skeletonBase: '#F4F4F5',
  skeletonHighlight: '#FAFAFA',
  
  // Badge - Muted red
  badgeBackground: '#DC2626',
  badgeText: '#FFFFFF',
  
  // Header - Clean, not gradient-heavy
  headerBackground: '#FFFFFF',
  headerText: '#18181B',
  
  // Base colors
  white: '#FFFFFF',
  black: '#000000',
};

// Dark theme colors - True dark, OLED-friendly with refined contrast
export const darkColors: ThemeColors = {
  // Primary - Softer blue for dark mode eye comfort
  primary: '#818CF8',
  primaryLight: '#1E1B4B',
  primaryDark: '#A5B4FC',
  secondary: '#5EEAD4',
  secondaryLight: '#134E4A',
  
  // Status colors - Softened pastels for dark mode
  success: '#6EE7B7',
  successLight: '#064E3B',
  warning: '#FCD34D',
  warningLight: '#451A03',
  error: '#FCA5A5',
  errorLight: '#450A0A',
  info: '#93C5FD',
  infoLight: '#1E3A5F',
  
  // Background - Pure dark, clean layers
  background: '#09090B',
  backgroundSecondary: '#18181B',
  surface: '#18181B',
  card: '#1F1F23',
  cardElevated: '#27272A',
  
  // Text - Optimized for dark mode readability
  text: '#FAFAFA',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  textInverse: '#18181B',
  textOnPrimary: '#FFFFFF',
  
  // Borders - Subtle separation
  border: '#27272A',
  borderLight: '#1F1F23',
  borderFocused: '#818CF8',
  
  // Semantic
  overlay: 'rgba(0, 0, 0, 0.6)',
  shadow: 'rgba(0, 0, 0, 0.3)',
  divider: '#27272A',
  highlight: '#422006',
  
  // Gradients - Subtle
  gradientStart: '#6366F1',
  gradientEnd: '#818CF8',
  
  // Tab bar - Clean
  tabBarBackground: '#18181B',
  tabBarActive: '#818CF8',
  tabBarInactive: '#71717A',
  
  // Input
  inputBackground: '#27272A',
  inputBorder: '#3F3F46',
  inputText: '#FAFAFA',
  placeholder: '#71717A',
  
  // Skeleton
  skeletonBase: '#27272A',
  skeletonHighlight: '#3F3F46',
  
  // Badge
  badgeBackground: '#FCA5A5',
  badgeText: '#18181B',
  
  // Header - Clean dark
  headerBackground: '#18181B',
  headerText: '#FAFAFA',
  
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

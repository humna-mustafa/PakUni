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

// Light theme colors - Premium, refined, and accessible
export const lightColors: ThemeColors = {
  // Primary - Premium blue with depth
  primary: '#1A7AEB',
  primaryLight: '#EEF6FF',
  primaryDark: '#0F62CC',
  secondary: '#14B8AA',
  secondaryLight: '#EEFDFB',
  
  // Status colors with refined light variants
  success: '#10B981',
  successLight: '#ECFDF5',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  error: '#EF4444',
  errorLight: '#FEF2F2',
  info: '#3B97FF',
  infoLight: '#EEF6FF',
  
  // Background - Refined neutral with subtle warmth
  background: '#F8FAFC',
  backgroundSecondary: '#FFFFFF',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  
  // Text - Carefully balanced contrast
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',
  textOnPrimary: '#FFFFFF',
  
  // Borders - Subtle but defined
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderFocused: '#1A7AEB',
  
  // Semantic
  overlay: 'rgba(15, 23, 42, 0.6)',
  shadow: 'rgba(15, 23, 42, 0.08)',
  divider: '#E2E8F0',
  highlight: '#FEF3C7',
  
  // Gradients - Premium
  gradientStart: '#1A7AEB',
  gradientEnd: '#0F62CC',
  
  // Tab bar - Refined
  tabBarBackground: '#FFFFFF',
  tabBarActive: '#1A7AEB',
  tabBarInactive: '#94A3B8',
  
  // Input - Clean
  inputBackground: '#FFFFFF',
  inputBorder: '#E2E8F0',
  inputText: '#0F172A',
  placeholder: '#94A3B8',
  
  // Skeleton - Smooth shimmer
  skeletonBase: '#E2E8F0',
  skeletonHighlight: '#F1F5F9',
  
  // Badge
  badgeBackground: '#EF4444',
  badgeText: '#FFFFFF',
  
  // Header - Premium gradient ready
  headerBackground: '#1A7AEB',
  headerText: '#FFFFFF',
  
  // Base colors
  white: '#FFFFFF',
  black: '#000000',
};

// Dark theme colors - True dark with premium feel
export const darkColors: ThemeColors = {
  // Primary - Bright blue for dark mode visibility
  primary: '#3B97FF',
  primaryLight: '#1A365D',
  primaryDark: '#7ABBFF',
  secondary: '#38D4C9',
  secondaryLight: '#134E4A',
  
  // Status colors - Softened for dark mode comfort
  success: '#34D399',
  successLight: '#14532D',
  warning: '#FBBF24',
  warningLight: '#451A03',
  error: '#F87171',
  errorLight: '#450A0A',
  info: '#7ABBFF',
  infoLight: '#1A365D',
  
  // Background - Rich dark with depth
  background: '#0F172A',
  backgroundSecondary: '#1E293B',
  surface: '#1E293B',
  card: '#1E293B',
  cardElevated: '#334155',
  
  // Text - Balanced for dark mode
  text: '#F1F5F9',
  textSecondary: '#CBD5E1',
  textMuted: '#64748B',
  textInverse: '#0F172A',
  textOnPrimary: '#FFFFFF',
  
  // Borders - Visible yet subtle
  border: '#334155',
  borderLight: '#1E293B',
  borderFocused: '#3B97FF',
  
  // Semantic
  overlay: 'rgba(0, 0, 0, 0.75)',
  shadow: 'rgba(0, 0, 0, 0.4)',
  divider: '#334155',
  highlight: '#422006',
  
  // Gradients
  gradientStart: '#3B97FF',
  gradientEnd: '#1A7AEB',
  
  // Tab bar
  tabBarBackground: '#1E293B',
  tabBarActive: '#3B97FF',
  tabBarInactive: '#64748B',
  
  // Input
  inputBackground: '#1E293B',
  inputBorder: '#475569',
  inputText: '#F1F5F9',
  placeholder: '#64748B',
  
  // Skeleton
  skeletonBase: '#334155',
  skeletonHighlight: '#475569',
  
  // Badge
  badgeBackground: '#F87171',
  badgeText: '#FFFFFF',
  
  // Header
  headerBackground: '#1E293B',
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

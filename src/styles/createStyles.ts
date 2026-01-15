/**
 * createStyles - Utility for creating themed StyleSheets
 * Provides a scalable approach to styling with theme support
 */

import {StyleSheet, ViewStyle, TextStyle, ImageStyle} from 'react-native';
import {ThemeColors, lightColors} from '../contexts/ThemeContext';

// Style types
type NamedStyles<T> = {[P in keyof T]: ViewStyle | TextStyle | ImageStyle};

/**
 * Creates a style factory function that generates themed styles
 * 
 * Usage:
 * const useStyles = createStyles((colors) => ({
 *   container: {
 *     backgroundColor: colors.background,
 *   },
 *   text: {
 *     color: colors.text,
 *   },
 * }));
 * 
 * // In component:
 * const {colors} = useTheme();
 * const styles = useStyles(colors);
 */
export function createStyles<T extends NamedStyles<T>>(
  styleFactory: (colors: ThemeColors) => T,
): (colors: ThemeColors) => T {
  // Cache for created stylesheets
  const cache = new Map<string, T>();
  
  return (colors: ThemeColors): T => {
    // Create a cache key based on whether dark or light
    const cacheKey = colors === lightColors ? 'light' : 'dark';
    
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)!;
    }
    
    const styles = StyleSheet.create(styleFactory(colors)) as T;
    cache.set(cacheKey, styles);
    return styles;
  };
}

/**
 * Common style mixins for reuse
 */
export const styleMixins = {
  // Flexbox helpers
  center: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  rowBetween: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  rowAround: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-around' as const,
  },
  flexGrow: {
    flex: 1,
  },
  
  // Text helpers
  textCenter: {
    textAlign: 'center' as const,
  },
  bold: {
    fontWeight: 'bold' as const,
  },
  semiBold: {
    fontWeight: '600' as const,
  },
  
  // Absolute positioning
  absoluteFill: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  // Shadow preset (iOS)
  shadowSmall: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  shadowMedium: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  shadowLarge: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
};

/**
 * Dynamic styles that need to be computed at runtime
 */
export const dynamicStyles = {
  // Background with opacity
  backgroundWithOpacity: (color: string, opacity: number): ViewStyle => ({
    backgroundColor: `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
  }),
  
  // Border radius shorthand
  rounded: (radius: number): ViewStyle => ({
    borderRadius: radius,
  }),
  
  // Padding shorthand
  padding: (value: number): ViewStyle => ({
    padding: value,
  }),
  paddingH: (value: number): ViewStyle => ({
    paddingHorizontal: value,
  }),
  paddingV: (value: number): ViewStyle => ({
    paddingVertical: value,
  }),
  
  // Margin shorthand
  margin: (value: number): ViewStyle => ({
    margin: value,
  }),
  marginH: (value: number): ViewStyle => ({
    marginHorizontal: value,
  }),
  marginV: (value: number): ViewStyle => ({
    marginVertical: value,
  }),
  
  // Size shorthand
  size: (value: number): ViewStyle => ({
    width: value,
    height: value,
  }),
  
  // Circle
  circle: (size: number): ViewStyle => ({
    width: size,
    height: size,
    borderRadius: size / 2,
  }),
};

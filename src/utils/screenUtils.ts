/**
 * Screen Utilities
 * Reusable utilities and hooks for screen-level components
 * 
 * @author PakUni Development Team
 * @version 1.0.0
 */

import {useRef, useCallback, useMemo} from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Dimensions,
  type ViewStyle,
} from 'react-native';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// ============================================================================
// SCREEN ANIMATION HOOKS
// ============================================================================

/**
 * Hook for smooth entrance animations
 * Use for screen content that fades/slides in
 */
export const useScreenEntrance = (delay: number = 0) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const animate = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, [fadeAnim, slideAnim, delay]);

  const style: Animated.WithAnimatedObject<ViewStyle> = {
    opacity: fadeAnim,
    transform: [{translateY: slideAnim}],
  };

  return {animate, style, fadeAnim, slideAnim};
};

/**
 * Hook for staggered list item animations
 */
export const useStaggeredEntrance = (itemCount: number) => {
  const animations = useRef(
    Array.from({length: itemCount}, () => new Animated.Value(0))
  ).current;

  const animate = useCallback(() => {
    const staggeredAnimations = animations.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 350,
        delay: index * 50,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      })
    );
    Animated.stagger(50, staggeredAnimations).start();
  }, [animations]);

  const getItemStyle = useCallback(
    (index: number): Animated.WithAnimatedObject<ViewStyle> => {
      const anim = animations[index] || new Animated.Value(1);
      return {
        opacity: anim,
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [15, 0],
            }),
          },
        ],
      };
    },
    [animations]
  );

  return {animate, getItemStyle, animations};
};

/**
 * Hook for header scroll animations
 */
export const useHeaderAnimation = () => {
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 100],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 56],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [0, 80, 120],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  const onScroll = Animated.event(
    [{nativeEvent: {contentOffset: {y: scrollY}}}],
    {useNativeDriver: false}
  );

  return {scrollY, headerOpacity, headerHeight, titleOpacity, onScroll};
};

// ============================================================================
// SCREEN LAYOUT UTILITIES
// ============================================================================

/**
 * Common screen padding adjusted for device size
 */
export const getScreenPadding = () => {
  if (SCREEN_WIDTH < 350) return 14;
  if (SCREEN_WIDTH < 400) return 18;
  return 20;
};

/**
 * Responsive content width (centered content on tablets)
 */
export const getContentWidth = () => {
  return Math.min(SCREEN_WIDTH - getScreenPadding() * 2, 600);
};

/**
 * Safe area fallback for older devices
 */
export const getSafeAreaInsets = () => ({
  top: Platform.select({ios: 44, android: 24}) || 24,
  bottom: Platform.select({ios: 34, android: 16}) || 16,
});

// ============================================================================
// LIST OPTIMIZATION UTILITIES
// ============================================================================

/**
 * Optimized key extractor for lists
 */
export const createKeyExtractor = <T extends {id?: string | number}>(
  prefix: string = 'item'
) => {
  return (item: T, index: number): string => {
    if (item.id !== undefined) return `${prefix}-${item.id}`;
    return `${prefix}-${index}`;
  };
};

/**
 * Optimized getItemLayout for fixed-height items
 * Improves FlashList/FlatList performance
 */
export const createGetItemLayout = (itemHeight: number, headerHeight: number = 0) => {
  return (_data: unknown, index: number) => ({
    length: itemHeight,
    offset: itemHeight * index + headerHeight,
    index,
  });
};

// ============================================================================
// PERFORMANCE UTILITIES
// ============================================================================

/**
 * Debounce function for search inputs
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function for scroll handlers
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// ============================================================================
// FILTER UTILITIES
// ============================================================================

/**
 * Create filter options from data
 */
export const createFilterOptions = <T, K extends keyof T>(
  data: T[],
  key: K,
  labelKey?: K
): Array<{value: string; label: string}> => {
  const unique = new Set<string>();
  const options: Array<{value: string; label: string}> = [];

  data.forEach(item => {
    const value = String(item[key] || '');
    if (value && !unique.has(value)) {
      unique.add(value);
      options.push({
        value,
        label: labelKey ? String(item[labelKey]) : value,
      });
    }
  });

  return options.sort((a, b) => a.label.localeCompare(b.label));
};

// ============================================================================
// COMMON SCREEN STYLES
// ============================================================================

export const screenStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 100, // Tab bar clearance
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginTop: -8,
    marginBottom: 12,
    opacity: 0.7,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerPadding: {
    paddingTop: Platform.select({ios: 60, android: 48}),
  },
});

// ============================================================================
// DIMENSION HELPERS
// ============================================================================

export const DIMENSIONS = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  isSmall: SCREEN_WIDTH < 350,
  isMedium: SCREEN_WIDTH >= 350 && SCREEN_WIDTH < 400,
  isLarge: SCREEN_WIDTH >= 400,
  cardWidth: SCREEN_WIDTH - 40,
  avatarSizes: {
    xs: 28,
    sm: 36,
    md: 48,
    lg: 64,
    xl: 80,
    xxl: 100,
  },
  iconSizes: {
    xs: 14,
    sm: 18,
    md: 22,
    lg: 28,
    xl: 36,
  },
} as const;

// ============================================================================
// ACCESSIBILITY HELPERS
// ============================================================================

export const a11y = {
  button: (label: string) => ({
    accessibilityRole: 'button' as const,
    accessibilityLabel: label,
  }),
  header: (label: string) => ({
    accessibilityRole: 'header' as const,
    accessibilityLabel: label,
  }),
  link: (label: string) => ({
    accessibilityRole: 'link' as const,
    accessibilityLabel: label,
  }),
  image: (label: string) => ({
    accessibilityRole: 'image' as const,
    accessibilityLabel: label,
  }),
  tab: (label: string, selected: boolean) => ({
    accessibilityRole: 'tab' as const,
    accessibilityLabel: label,
    accessibilityState: {selected},
  }),
};

export default {
  useScreenEntrance,
  useStaggeredEntrance,
  useHeaderAnimation,
  getScreenPadding,
  getContentWidth,
  getSafeAreaInsets,
  createKeyExtractor,
  createGetItemLayout,
  debounce,
  throttle,
  createFilterOptions,
  screenStyles,
  DIMENSIONS,
  a11y,
};

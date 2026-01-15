/**
 * Premium Animations Utility
 * Silicon Valley-grade animation presets and helpers
 */

import {Animated, Easing, Platform, Dimensions} from 'react-native';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// ============================================================================
// SPRING CONFIGURATIONS - Physics-based animations
// ============================================================================
export const Springs = {
  // Gentle - For large elements (modals, sheets)
  gentle: {
    tension: 40,
    friction: 7,
    useNativeDriver: true,
  },
  
  // Default - Balanced feel for most interactions
  default: {
    tension: 100,
    friction: 10,
    useNativeDriver: true,
  },
  
  // Snappy - For small UI elements (buttons, chips)
  snappy: {
    tension: 200,
    friction: 15,
    useNativeDriver: true,
  },
  
  // Bouncy - For playful interactions
  bouncy: {
    tension: 180,
    friction: 6,
    useNativeDriver: true,
  },
  
  // Stiff - For quick, precise movements
  stiff: {
    tension: 300,
    friction: 20,
    useNativeDriver: true,
  },
  
  // Wobbly - For attention-grabbing animations
  wobbly: {
    tension: 180,
    friction: 4,
    useNativeDriver: true,
  },
  
  // Slow - For smooth, elegant transitions
  slow: {
    tension: 60,
    friction: 8,
    useNativeDriver: true,
  },
};

// ============================================================================
// TIMING CONFIGURATIONS
// ============================================================================
export const Timings = {
  instant: 50,
  faster: 100,
  fast: 150,
  normal: 250,
  slow: 350,
  slower: 500,
  slowest: 700,
};

// ============================================================================
// EASING CURVES
// ============================================================================
export const Easings = {
  // Standard Material Design curves
  standard: Easing.bezier(0.4, 0.0, 0.2, 1),
  decelerate: Easing.bezier(0.0, 0.0, 0.2, 1),
  accelerate: Easing.bezier(0.4, 0.0, 1, 1),
  sharp: Easing.bezier(0.4, 0.0, 0.6, 1),
  
  // iOS-style curves
  ios: Easing.bezier(0.25, 0.1, 0.25, 1),
  
  // Elastic effects
  elastic: Easing.elastic(1),
  bounce: Easing.bounce,
  
  // Smooth in-out
  smooth: Easing.inOut(Easing.ease),
};

// ============================================================================
// ANIMATION FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a press animation (scale down on press)
 */
export const createPressAnimation = (
  animValue: Animated.Value,
  toValue: number = 0.95,
) => ({
  pressIn: () => {
    Animated.spring(animValue, {
      toValue,
      ...Springs.snappy,
    }).start();
  },
  pressOut: () => {
    Animated.spring(animValue, {
      toValue: 1,
      ...Springs.default,
    }).start();
  },
});

/**
 * Create a fade-in animation
 */
export const fadeIn = (
  animValue: Animated.Value,
  duration: number = Timings.normal,
  delay: number = 0,
) => {
  return Animated.timing(animValue, {
    toValue: 1,
    duration,
    delay,
    easing: Easings.decelerate,
    useNativeDriver: true,
  });
};

/**
 * Create a fade-out animation
 */
export const fadeOut = (
  animValue: Animated.Value,
  duration: number = Timings.fast,
) => {
  return Animated.timing(animValue, {
    toValue: 0,
    duration,
    easing: Easings.accelerate,
    useNativeDriver: true,
  });
};

/**
 * Create a slide-up animation
 */
export const slideUp = (
  animValue: Animated.Value,
  fromValue: number = 50,
  duration: number = Timings.normal,
  delay: number = 0,
) => {
  animValue.setValue(fromValue);
  return Animated.timing(animValue, {
    toValue: 0,
    duration,
    delay,
    easing: Easings.decelerate,
    useNativeDriver: true,
  });
};

/**
 * Create a slide-in-from-right animation
 */
export const slideInRight = (
  animValue: Animated.Value,
  duration: number = Timings.normal,
  delay: number = 0,
) => {
  animValue.setValue(SCREEN_WIDTH);
  return Animated.timing(animValue, {
    toValue: 0,
    duration,
    delay,
    easing: Easings.decelerate,
    useNativeDriver: true,
  });
};

/**
 * Create a scale-in animation (zoom in)
 */
export const scaleIn = (
  animValue: Animated.Value,
  fromValue: number = 0.8,
) => {
  animValue.setValue(fromValue);
  return Animated.spring(animValue, {
    toValue: 1,
    ...Springs.bouncy,
  });
};

/**
 * Create a staggered list animation
 */
export const staggeredList = (
  animations: Animated.CompositeAnimation[],
  staggerDelay: number = 50,
) => {
  return Animated.stagger(staggerDelay, animations);
};

/**
 * Create a pulsing animation for attention
 */
export const pulse = (animValue: Animated.Value) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animValue, {
        toValue: 1.05,
        duration: Timings.slow,
        easing: Easings.smooth,
        useNativeDriver: true,
      }),
      Animated.timing(animValue, {
        toValue: 1,
        duration: Timings.slow,
        easing: Easings.smooth,
        useNativeDriver: true,
      }),
    ]),
  );
};

/**
 * Create a shake animation for errors
 */
export const shake = (animValue: Animated.Value) => {
  animValue.setValue(0);
  return Animated.sequence([
    Animated.timing(animValue, {toValue: 10, duration: 40, useNativeDriver: true}),
    Animated.timing(animValue, {toValue: -10, duration: 40, useNativeDriver: true}),
    Animated.timing(animValue, {toValue: 10, duration: 40, useNativeDriver: true}),
    Animated.timing(animValue, {toValue: -10, duration: 40, useNativeDriver: true}),
    Animated.timing(animValue, {toValue: 0, duration: 40, useNativeDriver: true}),
  ]);
};

/**
 * Create a shimmer animation for loading states
 */
export const shimmer = (animValue: Animated.Value) => {
  return Animated.loop(
    Animated.timing(animValue, {
      toValue: 1,
      duration: 1200,
      easing: Easing.linear,
      useNativeDriver: true,
    }),
  );
};

/**
 * Create a rotation animation
 */
export const rotate = (animValue: Animated.Value, duration: number = 1000) => {
  return Animated.loop(
    Animated.timing(animValue, {
      toValue: 1,
      duration,
      easing: Easing.linear,
      useNativeDriver: true,
    }),
  );
};

/**
 * Create a bounce animation
 */
export const bounce = (animValue: Animated.Value) => {
  return Animated.sequence([
    Animated.spring(animValue, {
      toValue: 1.2,
      ...Springs.bouncy,
    }),
    Animated.spring(animValue, {
      toValue: 1,
      ...Springs.gentle,
    }),
  ]);
};

// ============================================================================
// INTERPOLATION HELPERS
// ============================================================================

/**
 * Create a rotation interpolation (0 to 1 -> 0deg to 360deg)
 */
export const rotateInterpolation = (animValue: Animated.Value) => {
  return animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
};

/**
 * Create an opacity interpolation from scroll position
 */
export const scrollFadeInterpolation = (
  scrollY: Animated.Value,
  inputRange: [number, number] = [0, 100],
) => {
  return scrollY.interpolate({
    inputRange,
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
};

/**
 * Create a parallax effect interpolation
 */
export const parallaxInterpolation = (
  scrollY: Animated.Value,
  ratio: number = 0.5,
) => {
  return scrollY.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: [ratio * 100, 0, -ratio * 100],
    extrapolate: 'clamp',
  });
};

// ============================================================================
// COMPOSITE ANIMATIONS
// ============================================================================

/**
 * Entry animation combining fade + slide up + scale
 */
export const entryAnimation = (
  fadeValue: Animated.Value,
  slideValue: Animated.Value,
  scaleValue: Animated.Value,
  delay: number = 0,
) => {
  fadeValue.setValue(0);
  slideValue.setValue(30);
  scaleValue.setValue(0.9);
  
  return Animated.parallel([
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: Timings.normal,
      delay,
      easing: Easings.decelerate,
      useNativeDriver: true,
    }),
    Animated.timing(slideValue, {
      toValue: 0,
      duration: Timings.normal,
      delay,
      easing: Easings.decelerate,
      useNativeDriver: true,
    }),
    Animated.spring(scaleValue, {
      toValue: 1,
      delay,
      ...Springs.gentle,
    }),
  ]);
};

/**
 * Exit animation combining fade + slide down
 */
export const exitAnimation = (
  fadeValue: Animated.Value,
  slideValue: Animated.Value,
) => {
  return Animated.parallel([
    Animated.timing(fadeValue, {
      toValue: 0,
      duration: Timings.fast,
      easing: Easings.accelerate,
      useNativeDriver: true,
    }),
    Animated.timing(slideValue, {
      toValue: 20,
      duration: Timings.fast,
      easing: Easings.accelerate,
      useNativeDriver: true,
    }),
  ]);
};

// Export all utilities
export default {
  Springs,
  Timings,
  Easings,
  createPressAnimation,
  fadeIn,
  fadeOut,
  slideUp,
  slideInRight,
  scaleIn,
  staggeredList,
  pulse,
  shake,
  shimmer,
  rotate,
  bounce,
  rotateInterpolation,
  scrollFadeInterpolation,
  parallaxInterpolation,
  entryAnimation,
  exitAnimation,
};

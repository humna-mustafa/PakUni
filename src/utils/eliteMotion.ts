/**
 * Elite Motion System
 * Physics-based animations matching Google, Apple, and Microsoft standards
 * 
 * Inspired by:
 * - Apple's spring animations from SwiftUI
 * - Google's Material Motion
 * - Microsoft's Fluent Design motion principles
 */

import { Animated, Easing, LayoutAnimation, Platform, UIManager } from 'react-native';
import { ELITE_MOTION } from '../constants/elite';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ============================================================================
// SPRING ANIMATIONS
// ============================================================================

/**
 * Create a spring animation with world-class physics
 */
export const springAnimation = (
  value: Animated.Value,
  toValue: number,
  type: 'micro' | 'snappy' | 'default' | 'expressive' = 'default'
): Animated.CompositeAnimation => {
  const config = ELITE_MOTION.spring[type];
  
  return Animated.spring(value, {
    toValue,
    useNativeDriver: true,
    damping: config.damping,
    stiffness: config.stiffness,
    mass: config.mass,
    overshootClamping: false,
    restDisplacementThreshold: 0.001,
    restSpeedThreshold: 0.001,
  });
};

/**
 * Scale animation - perfect for button presses
 */
export const scaleSpring = (
  value: Animated.Value,
  toValue: number,
  onComplete?: () => void
) => {
  Animated.spring(value, {
    toValue,
    useNativeDriver: true,
    ...ELITE_MOTION.spring.snappy,
  }).start(onComplete);
};

/**
 * Press in animation - for tactile feedback
 */
export const pressIn = (value: Animated.Value, scale = 0.96) => {
  Animated.spring(value, {
    toValue: scale,
    useNativeDriver: true,
    ...ELITE_MOTION.spring.micro,
  }).start();
};

/**
 * Press out animation - return to original state
 */
export const pressOut = (value: Animated.Value) => {
  Animated.spring(value, {
    toValue: 1,
    useNativeDriver: true,
    ...ELITE_MOTION.spring.snappy,
  }).start();
};

// ============================================================================
// FADE ANIMATIONS
// ============================================================================

/**
 * Fade in animation
 */
export const fadeIn = (
  value: Animated.Value,
  duration = ELITE_MOTION.duration.normal,
  delay = 0,
  onComplete?: () => void
): Animated.CompositeAnimation => {
  return Animated.timing(value, {
    toValue: 1,
    duration,
    delay,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  });
};

/**
 * Fade out animation
 */
export const fadeOut = (
  value: Animated.Value,
  duration = ELITE_MOTION.duration.fast,
  onComplete?: () => void
): Animated.CompositeAnimation => {
  return Animated.timing(value, {
    toValue: 0,
    duration,
    easing: Easing.in(Easing.cubic),
    useNativeDriver: true,
  });
};

// ============================================================================
// SLIDE ANIMATIONS
// ============================================================================

/**
 * Slide in from bottom (like bottom sheets)
 */
export const slideInFromBottom = (value: Animated.Value, distance = 100) => {
  value.setValue(distance);
  return Animated.spring(value, {
    toValue: 0,
    useNativeDriver: true,
    ...ELITE_MOTION.spring.default,
  });
};

/**
 * Slide in from right (navigation transitions)
 */
export const slideInFromRight = (value: Animated.Value, distance = 100) => {
  value.setValue(distance);
  return Animated.spring(value, {
    toValue: 0,
    useNativeDriver: true,
    ...ELITE_MOTION.spring.default,
  });
};

/**
 * Slide in from left
 */
export const slideInFromLeft = (value: Animated.Value, distance = -100) => {
  value.setValue(distance);
  return Animated.spring(value, {
    toValue: 0,
    useNativeDriver: true,
    ...ELITE_MOTION.spring.default,
  });
};

// ============================================================================
// STAGGER ANIMATIONS
// ============================================================================

/**
 * Staggered entrance animation for lists
 */
export const staggeredEntrance = (
  values: Animated.Value[],
  staggerDelay = 50
): Animated.CompositeAnimation => {
  const animations = values.map((value, index) => {
    return Animated.sequence([
      Animated.delay(index * staggerDelay),
      Animated.parallel([
        fadeIn(value, ELITE_MOTION.duration.normal),
        slideInFromBottom(value, 20),
      ]),
    ]);
  });
  
  return Animated.parallel(animations);
};

/**
 * Create stagger config for list items
 */
export const createStaggerConfig = (itemCount: number, baseDelay = 50) => {
  return Array.from({ length: itemCount }, (_, index) => ({
    delay: index * baseDelay,
    opacity: new Animated.Value(0),
    translateY: new Animated.Value(20),
  }));
};

// ============================================================================
// GESTURE-BASED ANIMATIONS
// ============================================================================

/**
 * Interpolate value for drag gestures
 */
export const createDragInterpolation = (
  value: Animated.Value,
  inputRange: number[],
  outputRange: number[]
) => {
  return value.interpolate({
    inputRange,
    outputRange,
    extrapolate: 'clamp',
  });
};

/**
 * Snap to point animation (for bottom sheets, drawers)
 */
export const snapToPoint = (
  value: Animated.Value,
  toValue: number,
  velocity = 0
): Animated.CompositeAnimation => {
  return Animated.spring(value, {
    toValue,
    velocity,
    useNativeDriver: true,
    ...ELITE_MOTION.spring.default,
  });
};

// ============================================================================
// MICRO-INTERACTIONS
// ============================================================================

/**
 * Bounce animation for success states
 */
export const successBounce = (value: Animated.Value) => {
  return Animated.sequence([
    Animated.timing(value, {
      toValue: 1.1,
      duration: 150,
      easing: Easing.out(Easing.back(2)),
      useNativeDriver: true,
    }),
    Animated.spring(value, {
      toValue: 1,
      useNativeDriver: true,
      ...ELITE_MOTION.spring.snappy,
    }),
  ]);
};

/**
 * Shake animation for error states
 */
export const errorShake = (value: Animated.Value) => {
  const shakeSequence = [0, -10, 10, -10, 10, -5, 5, 0];
  
  return Animated.sequence(
    shakeSequence.map((toValue, index) =>
      Animated.timing(value, {
        toValue,
        duration: 50,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    )
  );
};

/**
 * Pulse animation for attention
 */
export const pulseAttention = (value: Animated.Value) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(value, {
        toValue: 1.05,
        duration: 500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: 1,
        duration: 500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ])
  );
};

/**
 * Rotate animation for loading indicators
 */
export const infiniteRotate = (value: Animated.Value) => {
  return Animated.loop(
    Animated.timing(value, {
      toValue: 1,
      duration: ELITE_MOTION.duration.slow,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  );
};

// ============================================================================
// LAYOUT ANIMATIONS
// ============================================================================

/**
 * Layout animation presets
 */
export const EliteLayoutAnimations = {
  /**
   * Smooth layout change (like adding/removing items)
   */
  smooth: () => {
    LayoutAnimation.configureNext({
      duration: ELITE_MOTION.duration.normal,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
  },

  /**
   * Spring layout animation
   */
  spring: () => {
    LayoutAnimation.configureNext({
      duration: ELITE_MOTION.duration.normal,
      create: {
        type: LayoutAnimation.Types.spring,
        property: LayoutAnimation.Properties.scaleXY,
        springDamping: 0.7,
      },
      update: {
        type: LayoutAnimation.Types.spring,
        springDamping: 0.7,
      },
    });
  },

  /**
   * Fast layout transition
   */
  fast: () => {
    LayoutAnimation.configureNext({
      duration: ELITE_MOTION.duration.fast,
      create: {
        type: LayoutAnimation.Types.easeOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeOut,
      },
      delete: {
        type: LayoutAnimation.Types.easeIn,
        property: LayoutAnimation.Properties.opacity,
      },
    });
  },
};

// ============================================================================
// UTILITY HOOKS HELPERS
// ============================================================================

/**
 * Create an animated value with initial state
 */
export const createAnimatedValue = (initial = 0): Animated.Value => {
  return new Animated.Value(initial);
};

/**
 * Create animated values for XY translation
 */
export const createAnimatedXY = (x = 0, y = 0): Animated.ValueXY => {
  return new Animated.ValueXY({ x, y });
};

/**
 * Parallel animation helper
 */
export const parallelAnimations = (
  animations: Animated.CompositeAnimation[],
  options?: { stopTogether?: boolean }
): Animated.CompositeAnimation => {
  return Animated.parallel(animations, options);
};

/**
 * Sequence animation helper
 */
export const sequenceAnimations = (
  animations: Animated.CompositeAnimation[]
): Animated.CompositeAnimation => {
  return Animated.sequence(animations);
};

// ============================================================================
// INTERPOLATION HELPERS
// ============================================================================

/**
 * Create opacity interpolation from scroll position
 */
export const scrollOpacity = (
  scrollY: Animated.Value,
  startOffset: number,
  endOffset: number
) => {
  return scrollY.interpolate({
    inputRange: [startOffset, endOffset],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
};

/**
 * Create header parallax effect
 */
export const headerParallax = (
  scrollY: Animated.Value,
  headerHeight: number
) => {
  return {
    translateY: scrollY.interpolate({
      inputRange: [0, headerHeight],
      outputRange: [0, -headerHeight / 2],
      extrapolate: 'clamp',
    }),
    scale: scrollY.interpolate({
      inputRange: [-headerHeight, 0],
      outputRange: [1.5, 1],
      extrapolate: 'clamp',
    }),
  };
};

/**
 * Create collapsing header effect
 */
export const collapsingHeader = (
  scrollY: Animated.Value,
  maxHeight: number,
  minHeight: number
) => {
  return scrollY.interpolate({
    inputRange: [0, maxHeight - minHeight],
    outputRange: [maxHeight, minHeight],
    extrapolate: 'clamp',
  });
};

export default {
  springAnimation,
  scaleSpring,
  pressIn,
  pressOut,
  fadeIn,
  fadeOut,
  slideInFromBottom,
  slideInFromRight,
  slideInFromLeft,
  staggeredEntrance,
  createStaggerConfig,
  snapToPoint,
  successBounce,
  errorShake,
  pulseAttention,
  infiniteRotate,
  EliteLayoutAnimations,
  createAnimatedValue,
  createAnimatedXY,
  parallelAnimations,
  sequenceAnimations,
  scrollOpacity,
  headerParallax,
  collapsingHeader,
};

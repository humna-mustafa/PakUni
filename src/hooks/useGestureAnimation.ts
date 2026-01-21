/**
 * useGestureAnimation Hook
 * Simple animation utilities using React Native's Animated API
 */

import {useCallback, useRef} from 'react';
import {Animated, Easing} from 'react-native';

// Spring configurations (compatible format)
export const SPRING_CONFIGS = {
  snappy: {speed: 50, bounciness: 4},
  responsive: {speed: 20, bounciness: 8},
  bouncy: {speed: 12, bounciness: 12},
  smooth: {speed: 14, bounciness: 4},
  gentle: {speed: 12, bounciness: 6},
};

// Timing configurations
export const TIMING_CONFIGS = {
  fast: {duration: 150, easing: Easing.out(Easing.quad)},
  normal: {duration: 250, easing: Easing.inOut(Easing.quad)},
  slow: {duration: 400, easing: Easing.inOut(Easing.cubic)},
  emphasized: {duration: 500, easing: Easing.bezier(0.2, 0, 0, 1)},
};

/**
 * Hook for scale animation on press
 */
export function useScalePress(
  initialScale = 1,
  pressedScale = 0.97,
  springConfig = SPRING_CONFIGS.snappy
) {
  const scale = useRef(new Animated.Value(initialScale)).current;

  const onPressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: pressedScale,
      useNativeDriver: true,
      ...springConfig,
    }).start();
  }, [scale, pressedScale, springConfig]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: initialScale,
      useNativeDriver: true,
      ...springConfig,
    }).start();
  }, [scale, initialScale, springConfig]);

  const animatedStyle = {
    transform: [{scale}],
  };

  return {
    scale,
    onPressIn,
    onPressOut,
    animatedStyle,
  };
}

/**
 * Hook for entrance/exit animations
 */
export function useEntranceAnimation(options: {
  type?: 'fade' | 'slide' | 'scale' | 'slideUp' | 'slideDown';
  delay?: number;
  duration?: number;
  autoStart?: boolean;
} = {}) {
  const {
    type = 'fade',
    delay = 0,
    duration = 300,
    autoStart = true,
  } = options;

  const progress = useRef(new Animated.Value(autoStart ? 0 : 1)).current;

  const start = useCallback(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [progress, duration, delay]);

  const reset = useCallback(() => {
    progress.setValue(0);
  }, [progress]);

  const getAnimatedStyle = () => {
    switch (type) {
      case 'fade':
        return {opacity: progress};
      case 'scale':
        return {
          opacity: progress,
          transform: [{
            scale: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.9, 1],
            }),
          }],
        };
      case 'slide':
        return {
          opacity: progress,
          transform: [{
            translateX: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [30, 0],
            }),
          }],
        };
      case 'slideUp':
        return {
          opacity: progress,
          transform: [{
            translateY: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [30, 0],
            }),
          }],
        };
      case 'slideDown':
        return {
          opacity: progress,
          transform: [{
            translateY: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [-30, 0],
            }),
          }],
        };
      default:
        return {opacity: progress};
    }
  };

  // Auto-start
  if (autoStart) {
    setTimeout(() => start(), delay);
  }

  return {
    progress,
    animatedStyle: getAnimatedStyle(),
    start,
    reset,
  };
}

export default {
  SPRING_CONFIGS,
  TIMING_CONFIGS,
  useScalePress,
  useEntranceAnimation,
};

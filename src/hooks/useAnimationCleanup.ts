/**
 * useAnimationCleanup Hook
 * Properly manages Animated values with cleanup to prevent memory leaks
 */

import {useRef, useEffect, useCallback} from 'react';
import {Animated, Easing} from 'react-native';
import {ANIMATION} from '../constants/design';

interface AnimationConfig {
  /** Animation type */
  type: 'spring' | 'timing';
  /** For spring animations */
  spring?: typeof ANIMATION.spring.gentle;
  /** For timing animations */
  timing?: {
    duration: number;
    easing?: typeof Easing.ease;
    delay?: number;
  };
}

interface UseAnimationReturn {
  /** The animated value */
  value: Animated.Value;
  /** Animate to a target value with cleanup */
  animateTo: (toValue: number, config?: AnimationConfig) => void;
  /** Reset to initial value */
  reset: () => void;
  /** Stop any running animation */
  stop: () => void;
  /** Current animation reference (for composition) */
  currentAnimation: React.MutableRefObject<Animated.CompositeAnimation | null>;
}

/**
 * Hook for managing animated values with proper cleanup
 * Prevents memory leaks by stopping animations on unmount
 * 
 * @example
 * const {value, animateTo} = useAnimatedValue(0);
 * 
 * useEffect(() => {
 *   if (isVisible) {
 *     animateTo(1, { type: 'spring' });
 *   } else {
 *     animateTo(0, { type: 'timing', timing: { duration: 200 } });
 *   }
 * }, [isVisible]);
 * 
 * return <Animated.View style={{ opacity: value }} />;
 */
export function useAnimatedValue(
  initialValue: number = 0,
): UseAnimationReturn {
  const value = useRef(new Animated.Value(initialValue)).current;
  const currentAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const initialValueRef = useRef(initialValue);

  // Stop animation on unmount
  useEffect(() => {
    return () => {
      if (currentAnimation.current) {
        currentAnimation.current.stop();
        currentAnimation.current = null;
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (currentAnimation.current) {
      currentAnimation.current.stop();
      currentAnimation.current = null;
    }
  }, []);

  const animateTo = useCallback(
    (toValue: number, config: AnimationConfig = {type: 'spring'}) => {
      // Stop any existing animation
      stop();

      let animation: Animated.CompositeAnimation;

      if (config.type === 'spring') {
        animation = Animated.spring(value, {
          toValue,
          ...(config.spring || ANIMATION.spring.gentle),
          useNativeDriver: true,
        });
      } else {
        animation = Animated.timing(value, {
          toValue,
          duration: config.timing?.duration || 300,
          easing: config.timing?.easing || Easing.out(Easing.cubic),
          delay: config.timing?.delay || 0,
          useNativeDriver: true,
        });
      }

      currentAnimation.current = animation;
      animation.start(({finished}) => {
        if (finished) {
          currentAnimation.current = null;
        }
      });
    },
    [value, stop],
  );

  const reset = useCallback(() => {
    stop();
    value.setValue(initialValueRef.current);
  }, [value, stop]);

  return {
    value,
    animateTo,
    reset,
    stop,
    currentAnimation,
  };
}

/**
 * Hook for managing multiple animated values
 */
export function useAnimatedValues(
  initialValues: Record<string, number>,
): {animations: Record<string, UseAnimationReturn>; stopAll: () => void; resetAll: () => void} {
  const animations = useRef<Record<string, UseAnimationReturn>>({});

  // Initialize values only once
  if (Object.keys(animations.current).length === 0) {
    for (const key of Object.keys(initialValues)) {
      animations.current[key] = {
        value: new Animated.Value(initialValues[key]),
        animateTo: () => {},
        reset: () => {},
        stop: () => {},
        currentAnimation: {current: null},
      };
    }
  }

  const stopAll = useCallback(() => {
    Object.values(animations.current).forEach(anim => anim.stop());
  }, []);

  const resetAll = useCallback(() => {
    Object.keys(initialValues).forEach(key => {
      animations.current[key]?.value.setValue(initialValues[key]);
    });
  }, [initialValues]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAll();
    };
  }, [stopAll]);

  return {
    animations: animations.current,
    stopAll,
    resetAll,
  };
}

/**
 * Hook for press animation with cleanup
 */
export function usePressAnimation(
  options: {
    activeScale?: number;
    inactiveScale?: number;
    duration?: number;
  } = {},
) {
  const {
    activeScale = 0.97,
    inactiveScale = 1,
    duration = 100,
  } = options;

  const scale = useRef(new Animated.Value(inactiveScale)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    return () => {
      animationRef.current?.stop();
    };
  }, []);

  const handlePressIn = useCallback(() => {
    animationRef.current?.stop();
    animationRef.current = Animated.spring(scale, {
      toValue: activeScale,
      ...ANIMATION.spring.snappy,
      useNativeDriver: true,
    });
    animationRef.current.start();
  }, [scale, activeScale]);

  const handlePressOut = useCallback(() => {
    animationRef.current?.stop();
    animationRef.current = Animated.spring(scale, {
      toValue: inactiveScale,
      ...ANIMATION.spring.snappy,
      useNativeDriver: true,
    });
    animationRef.current.start();
  }, [scale, inactiveScale]);

  return {
    scale,
    handlePressIn,
    handlePressOut,
    animatedStyle: {transform: [{scale}]},
  };
}

/**
 * Hook for fade animation with cleanup
 */
export function useFadeAnimation(initialVisible: boolean = false) {
  const opacity = useRef(new Animated.Value(initialVisible ? 1 : 0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    return () => {
      animationRef.current?.stop();
    };
  }, []);

  const fadeIn = useCallback(
    (duration: number = 300, callback?: () => void) => {
      animationRef.current?.stop();
      animationRef.current = Animated.timing(opacity, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      });
      animationRef.current.start(callback);
    },
    [opacity],
  );

  const fadeOut = useCallback(
    (duration: number = 300, callback?: () => void) => {
      animationRef.current?.stop();
      animationRef.current = Animated.timing(opacity, {
        toValue: 0,
        duration,
        useNativeDriver: true,
      });
      animationRef.current.start(callback);
    },
    [opacity],
  );

  return {
    opacity,
    fadeIn,
    fadeOut,
    animatedStyle: {opacity},
  };
}

/**
 * Hook for slide animation with cleanup
 */
export function useSlideAnimation(
  direction: 'up' | 'down' | 'left' | 'right' = 'up',
  distance: number = 50,
) {
  const translateValue = useRef(new Animated.Value(distance)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    return () => {
      animationRef.current?.stop();
    };
  }, []);

  const slideIn = useCallback(
    (config?: {delay?: number; duration?: number}) => {
      animationRef.current?.stop();
      animationRef.current = Animated.parallel([
        Animated.timing(translateValue, {
          toValue: 0,
          duration: config?.duration || 300,
          delay: config?.delay || 0,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: config?.duration || 300,
          delay: config?.delay || 0,
          useNativeDriver: true,
        }),
      ]);
      animationRef.current.start();
    },
    [translateValue, opacity],
  );

  const slideOut = useCallback(
    (callback?: () => void) => {
      animationRef.current?.stop();
      animationRef.current = Animated.parallel([
        Animated.timing(translateValue, {
          toValue: distance,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]);
      animationRef.current.start(callback);
    },
    [translateValue, opacity, distance],
  );

  const getTransform = () => {
    switch (direction) {
      case 'up':
        return {translateY: translateValue};
      case 'down':
        return {translateY: Animated.multiply(translateValue, -1)};
      case 'left':
        return {translateX: translateValue};
      case 'right':
        return {translateX: Animated.multiply(translateValue, -1)};
    }
  };

  return {
    translateValue,
    opacity,
    slideIn,
    slideOut,
    animatedStyle: {
      opacity,
      transform: [getTransform()],
    },
  };
}

export default {
  useAnimatedValue,
  useAnimatedValues,
  usePressAnimation,
  useFadeAnimation,
  useSlideAnimation,
};

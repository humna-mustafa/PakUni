/**
 * useGestureAnimation Hook
 * Advanced gesture animations with reanimated worklets
 * 
 * Features:
 * - Smooth spring animations
 * - Drag with inertia
 * - Snap to points
 * - Velocity-based physics
 * - Boundary constraints
 */

import {useCallback} from 'react';
import {Dimensions} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDecay,
  withTiming,
  Easing,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Spring configurations
export const SPRING_CONFIGS = {
  /** Ultra responsive - micro interactions */
  snappy: {
    damping: 20,
    stiffness: 400,
    mass: 0.5,
  },
  /** Natural feeling - cards, sheets */
  responsive: {
    damping: 22,
    stiffness: 280,
    mass: 0.8,
  },
  /** Bouncy - success states, celebrations */
  bouncy: {
    damping: 12,
    stiffness: 180,
    mass: 1,
  },
  /** Smooth - page transitions */
  smooth: {
    damping: 30,
    stiffness: 200,
    mass: 1,
  },
  /** Gentle - subtle movements */
  gentle: {
    damping: 25,
    stiffness: 150,
    mass: 1.2,
  },
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
  const scale = useSharedValue(initialScale);
  const isPressed = useSharedValue(false);

  const onPressIn = useCallback(() => {
    'worklet';
    isPressed.value = true;
    scale.value = withSpring(pressedScale, springConfig);
  }, [pressedScale, springConfig]);

  const onPressOut = useCallback(() => {
    'worklet';
    isPressed.value = false;
    scale.value = withSpring(initialScale, springConfig);
  }, [initialScale, springConfig]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  return {
    scale,
    isPressed,
    onPressIn,
    onPressOut,
    animatedStyle,
  };
}

/**
 * Hook for drag with physics
 */
export function useDragAnimation(options: {
  boundaries?: {
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
  };
  snapPoints?: {x?: number[]; y?: number[]};
  rubberBand?: boolean;
  onSnapToPoint?: (point: {x: number; y: number}) => void;
} = {}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const velocityX = useSharedValue(0);
  const velocityY = useSharedValue(0);

  const {
    boundaries = {},
    snapPoints,
    rubberBand = true,
    onSnapToPoint,
  } = options;

  const clampWithRubberBand = useCallback(
    (value: number, min: number | undefined, max: number | undefined) => {
      'worklet';
      if (min !== undefined && value < min) {
        return rubberBand ? min - (min - value) * 0.15 : min;
      }
      if (max !== undefined && value > max) {
        return rubberBand ? max + (value - max) * 0.15 : max;
      }
      return value;
    },
    [rubberBand]
  );

  const findClosestSnapPoint = useCallback(
    (value: number, points: number[]) => {
      'worklet';
      return points.reduce((prev, curr) =>
        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
      );
    },
    []
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {translateX: translateX.value},
      {translateY: translateY.value},
    ],
  }));

  const onGestureStart = useCallback(() => {
    'worklet';
    cancelAnimation(translateX);
    cancelAnimation(translateY);
  }, []);

  const onGestureActive = useCallback(
    (x: number, y: number) => {
      'worklet';
      translateX.value = clampWithRubberBand(x, boundaries.minX, boundaries.maxX);
      translateY.value = clampWithRubberBand(y, boundaries.minY, boundaries.maxY);
    },
    [boundaries, clampWithRubberBand]
  );

  const onGestureEnd = useCallback(
    (velX: number, velY: number) => {
      'worklet';
      velocityX.value = velX;
      velocityY.value = velY;

      if (snapPoints?.x?.length) {
        const targetX = findClosestSnapPoint(translateX.value + velX * 0.1, snapPoints.x);
        translateX.value = withSpring(targetX, {
          ...SPRING_CONFIGS.responsive,
          velocity: velX,
        });
      } else if (boundaries.minX !== undefined || boundaries.maxX !== undefined) {
        translateX.value = withDecay({
          velocity: velX,
          clamp: [boundaries.minX ?? -Infinity, boundaries.maxX ?? Infinity],
        });
      }

      if (snapPoints?.y?.length) {
        const targetY = findClosestSnapPoint(translateY.value + velY * 0.1, snapPoints.y);
        translateY.value = withSpring(targetY, {
          ...SPRING_CONFIGS.responsive,
          velocity: velY,
        });

        if (onSnapToPoint) {
          const targetX = snapPoints.x?.length
            ? findClosestSnapPoint(translateX.value, snapPoints.x)
            : translateX.value;
          runOnJS(onSnapToPoint)({x: targetX, y: targetY});
        }
      } else if (boundaries.minY !== undefined || boundaries.maxY !== undefined) {
        translateY.value = withDecay({
          velocity: velY,
          clamp: [boundaries.minY ?? -Infinity, boundaries.maxY ?? Infinity],
        });
      }
    },
    [boundaries, snapPoints, findClosestSnapPoint, onSnapToPoint]
  );

  const reset = useCallback((animated = true) => {
    'worklet';
    if (animated) {
      translateX.value = withSpring(0, SPRING_CONFIGS.responsive);
      translateY.value = withSpring(0, SPRING_CONFIGS.responsive);
    } else {
      translateX.value = 0;
      translateY.value = 0;
    }
  }, []);

  return {
    translateX,
    translateY,
    velocityX,
    velocityY,
    animatedStyle,
    onGestureStart,
    onGestureActive,
    onGestureEnd,
    reset,
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

  const progress = useSharedValue(autoStart ? 0 : 1);
  const hasStarted = useSharedValue(false);

  const start = useCallback(() => {
    'worklet';
    if (hasStarted.value) return;
    hasStarted.value = true;
    progress.value = withTiming(1, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [duration]);

  const reset = useCallback(() => {
    'worklet';
    hasStarted.value = false;
    progress.value = 0;
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const p = progress.value;

    switch (type) {
      case 'fade':
        return {opacity: p};
      case 'scale':
        return {
          opacity: p,
          transform: [{scale: 0.9 + p * 0.1}],
        };
      case 'slide':
        return {
          opacity: p,
          transform: [{translateX: (1 - p) * 30}],
        };
      case 'slideUp':
        return {
          opacity: p,
          transform: [{translateY: (1 - p) * 30}],
        };
      case 'slideDown':
        return {
          opacity: p,
          transform: [{translateY: (p - 1) * 30}],
        };
      default:
        return {opacity: p};
    }
  });

  // Auto-start with delay
  if (autoStart && delay > 0) {
    setTimeout(() => {
      start();
    }, delay);
  } else if (autoStart) {
    start();
  }

  return {
    progress,
    animatedStyle,
    start,
    reset,
  };
}

/**
 * Hook for staggered list animations
 */
export function useStaggeredAnimation(itemCount: number, staggerDelay = 50) {
  const getItemAnimation = useCallback(
    (index: number) => {
      const progress = useSharedValue(0);
      
      const delay = index * staggerDelay;
      
      setTimeout(() => {
        progress.value = withSpring(1, SPRING_CONFIGS.gentle);
      }, delay);

      const animatedStyle = useAnimatedStyle(() => ({
        opacity: progress.value,
        transform: [
          {translateY: (1 - progress.value) * 20},
          {scale: 0.95 + progress.value * 0.05},
        ],
      }));

      return {progress, animatedStyle};
    },
    [staggerDelay]
  );

  return {getItemAnimation};
}

/**
 * Hook for parallax scroll effects
 */
export function useParallaxScroll(scrollY: Animated.SharedValue<number>) {
  const createParallaxStyle = useCallback(
    (ratio: number, offset = 0) => {
      return useAnimatedStyle(() => ({
        transform: [{translateY: scrollY.value * ratio + offset}],
      }));
    },
    [scrollY]
  );

  const createOpacityStyle = useCallback(
    (fadeStart: number, fadeEnd: number) => {
      return useAnimatedStyle(() => {
        const opacity =
          scrollY.value < fadeStart
            ? 1
            : scrollY.value > fadeEnd
            ? 0
            : 1 - (scrollY.value - fadeStart) / (fadeEnd - fadeStart);
        return {opacity: Math.max(0, Math.min(1, opacity))};
      });
    },
    [scrollY]
  );

  const createScaleStyle = useCallback(
    (scaleStart: number, minScale = 0.8) => {
      return useAnimatedStyle(() => {
        const scale =
          scrollY.value < 0
            ? 1 + Math.abs(scrollY.value) * 0.001
            : scrollY.value > scaleStart
            ? Math.max(minScale, 1 - (scrollY.value - scaleStart) * 0.001)
            : 1;
        return {transform: [{scale}]};
      });
    },
    [scrollY]
  );

  return {
    createParallaxStyle,
    createOpacityStyle,
    createScaleStyle,
  };
}

export default {
  SPRING_CONFIGS,
  TIMING_CONFIGS,
  useScalePress,
  useDragAnimation,
  useEntranceAnimation,
  useStaggeredAnimation,
  useParallaxScroll,
};

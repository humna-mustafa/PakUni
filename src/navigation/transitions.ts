/**
 * Page Transitions Configuration
 * Modern page transition animations using react-native-reanimated
 * 
 * Features:
 * - Shared element transitions
 * - Custom screen transitions
 * - Modal presentations
 * - iOS-style interactive dismiss
 */

import {Animated, Easing} from 'react-native';
import {
  TransitionPresets,
  StackCardStyleInterpolator,
  StackCardInterpolationProps,
} from '@react-navigation/stack';

// ============================================================================
// CUSTOM TRANSITION PRESETS
// ============================================================================

/**
 * Smooth fade transition for overlays and modals
 */
export const FadeTransition: StackCardStyleInterpolator = ({
  current,
}: StackCardInterpolationProps) => ({
  cardStyle: {
    opacity: current.progress,
  },
});

/**
 * Scale and fade for detail screens
 */
export const ScaleFadeTransition: StackCardStyleInterpolator = ({
  current,
  next,
  layouts,
}: StackCardInterpolationProps) => ({
  cardStyle: {
    opacity: current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    transform: [
      {
        scale: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.95, 1],
        }),
      },
      {
        translateY: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  },
  overlayStyle: {
    opacity: current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.3],
    }),
  },
});

/**
 * Slide from bottom for bottom sheets and modals
 */
export const SlideFromBottomTransition: StackCardStyleInterpolator = ({
  current,
  layouts,
}: StackCardInterpolationProps) => ({
  cardStyle: {
    transform: [
      {
        translateY: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [layouts.screen.height, 0],
        }),
      },
    ],
  },
  overlayStyle: {
    opacity: current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.5],
    }),
  },
});

/**
 * iOS-style slide with parallax
 */
export const iOSSlideTransition: StackCardStyleInterpolator = ({
  current,
  next,
  layouts,
}: StackCardInterpolationProps) => ({
  cardStyle: {
    transform: [
      {
        translateX: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [layouts.screen.width, 0],
        }),
      },
      {
        scale: next
          ? next.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0.95],
            })
          : 1,
      },
    ],
    borderRadius: next
      ? next.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 12],
        })
      : 0,
  },
  overlayStyle: {
    opacity: current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.15],
    }),
  },
});

/**
 * Material Design shared axis (forward)
 */
export const MaterialSharedAxisTransition: StackCardStyleInterpolator = ({
  current,
  next,
  layouts,
}: StackCardInterpolationProps) => ({
  cardStyle: {
    opacity: current.progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.5, 1],
    }),
    transform: [
      {
        translateX: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [layouts.screen.width * 0.3, 0],
        }),
      },
    ],
  },
  overlayStyle: {
    opacity: current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.1],
    }),
  },
});

// ============================================================================
// NAVIGATION CONFIG PRESETS
// ============================================================================

/**
 * Default screen options with smooth transitions
 */
export const DefaultScreenOptions = {
  headerShown: false,
  gestureEnabled: true,
  gestureDirection: 'horizontal' as const,
  cardStyleInterpolator: iOSSlideTransition,
  transitionSpec: {
    open: {
      animation: 'spring' as const,
      config: {
        stiffness: 1000,
        damping: 500,
        mass: 3,
        overshootClamping: true,
        restDisplacementThreshold: 10,
        restSpeedThreshold: 10,
      },
    },
    close: {
      animation: 'spring' as const,
      config: {
        stiffness: 1000,
        damping: 500,
        mass: 3,
        overshootClamping: true,
        restDisplacementThreshold: 10,
        restSpeedThreshold: 10,
      },
    },
  },
};

/**
 * Modal screen options
 */
export const ModalScreenOptions = {
  headerShown: false,
  gestureEnabled: true,
  gestureDirection: 'vertical' as const,
  cardStyleInterpolator: SlideFromBottomTransition,
  presentation: 'modal' as const,
};

/**
 * Detail screen options (scale + fade)
 */
export const DetailScreenOptions = {
  headerShown: false,
  gestureEnabled: true,
  cardStyleInterpolator: ScaleFadeTransition,
};

/**
 * Fade overlay options
 */
export const FadeOverlayOptions = {
  headerShown: false,
  gestureEnabled: false,
  cardStyleInterpolator: FadeTransition,
  cardOverlayEnabled: true,
};

// ============================================================================
// SPRING ANIMATION CONFIGS
// ============================================================================

export const NAVIGATION_SPRINGS = {
  /** Fast, snappy navigation */
  snappy: {
    stiffness: 1000,
    damping: 500,
    mass: 3,
    overshootClamping: true,
    restDisplacementThreshold: 10,
    restSpeedThreshold: 10,
  },
  /** Smooth, natural feeling */
  smooth: {
    stiffness: 800,
    damping: 350,
    mass: 4,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
  /** Bouncy, playful */
  bouncy: {
    stiffness: 600,
    damping: 200,
    mass: 3,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create custom transition with spring config
 */
export const createCustomTransition = (
  interpolator: StackCardStyleInterpolator,
  springConfig = NAVIGATION_SPRINGS.snappy
) => ({
  cardStyleInterpolator: interpolator,
  transitionSpec: {
    open: {
      animation: 'spring' as const,
      config: springConfig,
    },
    close: {
      animation: 'spring' as const,
      config: springConfig,
    },
  },
});

export default {
  // Transitions
  FadeTransition,
  ScaleFadeTransition,
  SlideFromBottomTransition,
  iOSSlideTransition,
  MaterialSharedAxisTransition,
  // Presets
  DefaultScreenOptions,
  ModalScreenOptions,
  DetailScreenOptions,
  FadeOverlayOptions,
  // Springs
  NAVIGATION_SPRINGS,
  // Utility
  createCustomTransition,
};

/**
 * LottieAnimation Component
 * Uses lottie-react-native - Industry standard for high-quality animations
 * 
 * Why Lottie?
 * - Created by Airbnb, used by Uber, Google, Netflix
 * - After Effects animations exported to JSON
 * - 10x smaller than GIF/video
 * - Infinitely scalable (vector-based)
 * - Native performance
 */

import React, {useRef, useCallback, useEffect, memo} from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';
import LottieView, {LottieViewProps} from 'lottie-react-native';
import {useReducedMotion} from '../../hooks/useAccessibility';

// Note: Add your Lottie JSON files to src/assets/lottie/
// Download free animations from: https://lottiefiles.com/
// For now, we'll use a fallback for missing animations

// Try to load animation, return undefined if not found
const tryRequire = (path: string) => {
  try {
    switch (path) {
      case 'loading': return require('../../assets/lottie/loading.json');
      case 'loading-dots': return require('../../assets/lottie/loading-dots.json');
      case 'success': return require('../../assets/lottie/success.json');
      case 'error': return require('../../assets/lottie/error.json');
      case 'warning': return require('../../assets/lottie/warning.json');
      case 'empty-search': return require('../../assets/lottie/empty-search.json');
      case 'empty-list': return require('../../assets/lottie/empty-list.json');
      case 'no-internet': return require('../../assets/lottie/no-internet.json');
      case 'confetti': return require('../../assets/lottie/confetti.json');
      case 'celebration': return require('../../assets/lottie/celebration.json');
      case 'heart': return require('../../assets/lottie/heart.json');
      case 'star': return require('../../assets/lottie/star.json');
      case 'refresh': return require('../../assets/lottie/refresh.json');
      default: return undefined;
    }
  } catch (e) {
    return undefined;
  }
};

// Pre-bundled animation paths (add your Lottie JSON files to assets/lottie/)
export const LOTTIE_ANIMATIONS = {
  // Loading states
  loading: tryRequire('loading'),
  loadingDots: tryRequire('loading-dots'),
  
  // Success/Error states
  success: tryRequire('success'),
  error: tryRequire('error'),
  warning: tryRequire('warning'),
  
  // Empty states
  emptySearch: tryRequire('empty-search'),
  emptyList: tryRequire('empty-list'),
  noInternet: tryRequire('no-internet'),
  
  // Features
  confetti: tryRequire('confetti'),
  celebration: tryRequire('celebration'),
  heart: tryRequire('heart'),
  star: tryRequire('star'),
  
  // Pull to refresh
  refresh: tryRequire('refresh'),
} as const;

export type LottieAnimationName = keyof typeof LOTTIE_ANIMATIONS;

interface LottieAnimationProps {
  /** Animation name from LOTTIE_ANIMATIONS or custom source */
  name?: LottieAnimationName;
  /** Custom animation source (JSON file) */
  source?: LottieViewProps['source'];
  /** Animation size */
  size?: number;
  /** Width override */
  width?: number;
  /** Height override */
  height?: number;
  /** Auto play animation */
  autoPlay?: boolean;
  /** Loop animation */
  loop?: boolean;
  /** Animation speed (1 = normal) */
  speed?: number;
  /** Play animation on mount */
  playOnMount?: boolean;
  /** Callback when animation finishes */
  onAnimationFinish?: () => void;
  /** Container style */
  style?: ViewStyle;
  /** Color filters for dynamic theming */
  colorFilters?: Array<{
    keypath: string;
    color: string;
  }>;
}

export interface LottieAnimationRef {
  play: (startFrame?: number, endFrame?: number) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

const LottieAnimation = React.forwardRef<LottieAnimationRef, LottieAnimationProps>(({
  name,
  source,
  size = 100,
  width,
  height,
  autoPlay = true,
  loop = true,
  speed = 1,
  playOnMount = true,
  onAnimationFinish,
  style,
  colorFilters,
}, ref) => {
  const lottieRef = useRef<LottieView>(null);
  const reducedMotion = useReducedMotion();

  // Get animation source
  const animationSource = source || (name ? LOTTIE_ANIMATIONS[name] : undefined);

  // Expose ref methods
  React.useImperativeHandle(ref, () => ({
    play: (startFrame?: number, endFrame?: number) => {
      if (!reducedMotion) {
        lottieRef.current?.play(startFrame, endFrame);
      }
    },
    pause: () => lottieRef.current?.pause(),
    resume: () => {
      if (!reducedMotion) {
        lottieRef.current?.resume();
      }
    },
    reset: () => lottieRef.current?.reset(),
  }));

  // Play on mount if requested
  useEffect(() => {
    if (playOnMount && !reducedMotion) {
      lottieRef.current?.play();
    }
  }, [playOnMount, reducedMotion]);

  // Handle reduced motion preference
  const shouldAnimate = !reducedMotion;

  if (!animationSource) {
    console.warn('LottieAnimation: No animation source provided');
    return null;
  }

  return (
    <View style={[styles.container, {width: width || size, height: height || size}, style]}>
      <LottieView
        ref={lottieRef}
        source={animationSource}
        style={styles.animation}
        autoPlay={autoPlay && shouldAnimate}
        loop={loop}
        speed={shouldAnimate ? speed : 0}
        onAnimationFinish={onAnimationFinish}
        colorFilters={colorFilters}
        renderMode="AUTOMATIC"
        cacheComposition={true}
      />
    </View>
  );
});

// Pre-built animation components for common use cases

export const LoadingAnimation: React.FC<{size?: number; style?: ViewStyle}> = memo(({
  size = 60,
  style,
}) => (
  <LottieAnimation name="loading" size={size} style={style} />
));

export const SuccessAnimation: React.FC<{
  size?: number;
  style?: ViewStyle;
  onFinish?: () => void;
}> = memo(({size = 100, style, onFinish}) => (
  <LottieAnimation
    name="success"
    size={size}
    loop={false}
    onAnimationFinish={onFinish}
    style={style}
  />
));

export const ErrorAnimation: React.FC<{
  size?: number;
  style?: ViewStyle;
  onFinish?: () => void;
}> = memo(({size = 100, style, onFinish}) => (
  <LottieAnimation
    name="error"
    size={size}
    loop={false}
    onAnimationFinish={onFinish}
    style={style}
  />
));

export const ConfettiAnimation: React.FC<{
  size?: number;
  style?: ViewStyle;
  onFinish?: () => void;
}> = memo(({size = 200, style, onFinish}) => (
  <LottieAnimation
    name="confetti"
    size={size}
    loop={false}
    onAnimationFinish={onFinish}
    style={style}
  />
));

export const EmptySearchAnimation: React.FC<{size?: number; style?: ViewStyle}> = memo(({
  size = 150,
  style,
}) => (
  <LottieAnimation name="emptySearch" size={size} speed={0.8} style={style} />
));

export const NoInternetAnimation: React.FC<{size?: number; style?: ViewStyle}> = memo(({
  size = 150,
  style,
}) => (
  <LottieAnimation name="noInternet" size={size} speed={0.7} style={style} />
));

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
});

export default memo(LottieAnimation);

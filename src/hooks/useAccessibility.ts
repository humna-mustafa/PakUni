/**
 * useAccessibility Hook - React hook for accessibility features
 * Provides real-time accessibility preferences and utilities
 */

import {useState, useEffect, useCallback, useMemo} from 'react';
import {AccessibilityInfo, Animated} from 'react-native';

interface AccessibilityState {
  isScreenReaderEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isBoldTextEnabled: boolean;
  isGrayscaleEnabled: boolean;
  isInvertColorsEnabled: boolean;
  isReduceTransparencyEnabled: boolean;
}

/**
 * Hook to track accessibility settings and provide utilities
 */
export const useAccessibility = () => {
  const [state, setState] = useState<AccessibilityState>({
    isScreenReaderEnabled: false,
    isReduceMotionEnabled: false,
    isBoldTextEnabled: false,
    isGrayscaleEnabled: false,
    isInvertColorsEnabled: false,
    isReduceTransparencyEnabled: false,
  });

  // Fetch initial values
  useEffect(() => {
    const fetchInitialValues = async () => {
      const [
        screenReader,
        reduceMotion,
        boldText,
        grayscale,
        invertColors,
        reduceTransparency,
      ] = await Promise.all([
        AccessibilityInfo.isScreenReaderEnabled(),
        AccessibilityInfo.isReduceMotionEnabled(),
        AccessibilityInfo.isBoldTextEnabled(),
        AccessibilityInfo.isGrayscaleEnabled(),
        AccessibilityInfo.isInvertColorsEnabled(),
        AccessibilityInfo.isReduceTransparencyEnabled(),
      ]);

      setState({
        isScreenReaderEnabled: screenReader,
        isReduceMotionEnabled: reduceMotion,
        isBoldTextEnabled: boldText,
        isGrayscaleEnabled: grayscale,
        isInvertColorsEnabled: invertColors,
        isReduceTransparencyEnabled: reduceTransparency,
      });
    };

    fetchInitialValues();
  }, []);

  // Subscribe to changes
  useEffect(() => {
    const subscriptions = [
      AccessibilityInfo.addEventListener('screenReaderChanged', (isEnabled) => {
        setState(prev => ({...prev, isScreenReaderEnabled: isEnabled}));
      }),
      AccessibilityInfo.addEventListener('reduceMotionChanged', (isEnabled) => {
        setState(prev => ({...prev, isReduceMotionEnabled: isEnabled}));
      }),
      AccessibilityInfo.addEventListener('boldTextChanged', (isEnabled) => {
        setState(prev => ({...prev, isBoldTextEnabled: isEnabled}));
      }),
      AccessibilityInfo.addEventListener('grayscaleChanged', (isEnabled) => {
        setState(prev => ({...prev, isGrayscaleEnabled: isEnabled}));
      }),
      AccessibilityInfo.addEventListener('invertColorsChanged', (isEnabled) => {
        setState(prev => ({...prev, isInvertColorsEnabled: isEnabled}));
      }),
      AccessibilityInfo.addEventListener('reduceTransparencyChanged', (isEnabled) => {
        setState(prev => ({...prev, isReduceTransparencyEnabled: isEnabled}));
      }),
    ];

    return () => {
      subscriptions.forEach(sub => sub.remove());
    };
  }, []);

  // Announce message to screen readers
  const announce = useCallback((message: string) => {
    AccessibilityInfo.announceForAccessibility(message);
  }, []);

  // Get animation duration based on reduce motion preference
  const getAnimationDuration = useCallback(
    (normalDuration: number): number => {
      return state.isReduceMotionEnabled ? 0 : normalDuration;
    },
    [state.isReduceMotionEnabled],
  );

  // Get spring config based on reduce motion preference
  const getSpringConfig = useCallback(
    (normalConfig: Animated.SpringAnimationConfig): Animated.SpringAnimationConfig => {
      if (state.isReduceMotionEnabled) {
        return {
          ...normalConfig,
          speed: 100,
          bounciness: 0,
        };
      }
      return normalConfig;
    },
    [state.isReduceMotionEnabled],
  );

  return {
    ...state,
    announce,
    getAnimationDuration,
    getSpringConfig,
  };
};

/**
 * Hook to get animation values that respect reduce motion
 */
export const useReducedMotion = () => {
  const [isReduceMotionEnabled, setIsReduceMotionEnabled] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setIsReduceMotionEnabled);

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setIsReduceMotionEnabled,
    );

    return () => subscription.remove();
  }, []);

  const animationValue = useMemo(
    () => ({
      duration: isReduceMotionEnabled ? 0 : undefined,
      useNativeDriver: true,
    }),
    [isReduceMotionEnabled],
  );

  return {
    isReduceMotionEnabled,
    animationValue,
    getDuration: (normal: number) => (isReduceMotionEnabled ? 0 : normal),
  };
};

/**
 * Hook to detect screen reader status
 */
export const useScreenReader = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then(setIsEnabled);

    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsEnabled,
    );

    return () => subscription.remove();
  }, []);

  const announce = useCallback((message: string) => {
    if (isEnabled) {
      AccessibilityInfo.announceForAccessibility(message);
    }
  }, [isEnabled]);

  return {
    isEnabled,
    announce,
  };
};

export default useAccessibility;

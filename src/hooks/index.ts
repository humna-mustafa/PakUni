/**
 * Hooks index file
 * Export all custom hooks for easy importing
 */

// ============================================================================
// DOMAIN HOOKS
// ============================================================================

export {useUniversities} from './useUniversities';
export type {SortOption, UniversityType} from './useUniversities';

export {useMeritCalculation} from './useMeritCalculation';
export type {MarksInput, CalculationResult} from './useMeritCalculation';

export {useScholarships} from './useScholarships';
export type {ScholarshipData, ScholarshipType} from './useScholarships';

// ============================================================================
// ACCESSIBILITY HOOKS
// ============================================================================

export {
  useAccessibility,
  useReducedMotion,
  useScreenReader,
} from './useAccessibility';

// ============================================================================
// PERFORMANCE HOOKS
// ============================================================================

export {
  useDeferredValue,
  useDeferredRender,
  useDebounce,
  useDebouncedCallback,
  useThrottledCallback,
  useDeepMemo,
  usePrevious,
  useAppState,
  useOnAppForeground,
  useOnAppBackground,
  useScreenDimensions,
  useInterval,
  useTimeout,
  useIsMounted,
  useSafeState,
  useStableCallback,
  useActionLock,
  useRateLimitedAction,
} from './usePerformance';

// ============================================================================
// INPUT SANITIZATION HOOKS
// ============================================================================

export {
  useSanitizedInput,
  useSanitizedForm,
  sanitizeValue,
  validateValue,
} from './useSanitizedInput';

export type {
  SanitizedInputConfig,
  SanitizedInputState,
  UseSanitizedInputReturn,
  FormFieldConfigs,
  UseSanitizedFormReturn,
} from './useSanitizedInput';

// ============================================================================
// DEBOUNCE & SEARCH HOOKS
// ============================================================================

export {
  useDebouncedValue,
  useDebouncedCallback as useDebouncedCallbackNew,
  useThrottledCallback as useThrottledCallbackNew,
  useSearch,
} from './useDebounce';

// ============================================================================
// IMAGE LOADING HOOKS
// ============================================================================

export {
  useImageLoader,
  usePreloadImages,
  preloadImages,
} from './useImageLoader';

// ============================================================================
// PULL TO REFRESH HOOKS
// ============================================================================

export {usePullToRefresh} from './usePullToRefresh';

// ============================================================================
// ANIMATION CLEANUP HOOKS
// ============================================================================

export {
  useAnimatedValue,
  useAnimatedValues,
  usePressAnimation,
  useFadeAnimation,
  useSlideAnimation,
} from './useAnimationCleanup';

// ============================================================================
// FLATLIST OPTIMIZATION HOOKS
// ============================================================================

export {
  useFlatListOptimization,
  useKeyExtractor,
  useItemSeparator,
} from './useFlatListOptimization';

// ============================================================================
// NETWORK STATUS HOOKS
// ============================================================================

export {
  useNetworkStatus,
  useIsOnline,
  useOfflineRetry,
} from './useNetworkStatus';

// ============================================================================
// ERROR HANDLING HOOKS
// ============================================================================

export {
  ErrorHandlerProvider,
  useErrorHandler,
  useAsyncHandler,
  useFormErrorHandler,
} from './useErrorHandler';

// ============================================================================
// AUTH WITH TOAST FEEDBACK
// ============================================================================

export {useAuthToast} from './useAuthToast';
// ============================================================================
// GESTURE ANIMATION HOOKS (Standard React Native Animated)
// ============================================================================

export {
  useScalePress,
  useEntranceAnimation,
  SPRING_CONFIGS,
  TIMING_CONFIGS,
} from './useGestureAnimation';
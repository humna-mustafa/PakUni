/**
 * Utils index file
 * Export all utility functions for easy importing
 */

// ============================================================================
// HAPTIC FEEDBACK
// ============================================================================

export {Haptics, haptic} from './haptics';
export type {HapticType} from './haptics';

// ============================================================================
// ANIMATIONS
// ============================================================================

// ============================================================================
// ANIMATIONS (moved to component-level - see gestures/ and hooks/useAnimationCleanup)
// ============================================================================

// ============================================================================
// DESIGN POLISH
// ============================================================================

// ============================================================================
// DESIGN POLISH (consolidated into constants/design.ts)
// ============================================================================

// ============================================================================
// ACCESSIBILITY
// ============================================================================

export {
  A11Y_ROLES,
  buttonA11y,
  linkA11y,
  headerA11y,
  imageA11y,
  cardA11y,
  tabA11y,
  toggleA11y,
  progressA11y,
  searchA11y,
  inputA11y,
  alertA11y,
  isScreenReaderEnabled,
  isReduceMotionEnabled,
  announceForAccessibility,
  onScreenReaderChanged,
  onReduceMotionChanged,
  getLuminance,
  getContrastRatio,
  meetsContrastAA,
  meetsContrastAAA,
  setAccessibilityFocus,
  formatNumberForA11y,
  formatCurrencyForA11y,
  formatPercentageForA11y,
  formatDateForA11y,
} from './accessibility';
export { default as a11y } from './accessibility';
export type { A11yState } from './accessibility';

// ============================================================================
// SECURITY
// ============================================================================

export {
  secureStorage,
  sanitize,
  validate,
  rateLimiter,
  isSecureContext,
  isDeviceCompromised,
  maskSensitive,
  containsHarmfulContent,
  isUrlSafe,
} from './security';
export type {ValidationResult} from './security';

// ============================================================================
// FORM VALIDATION
// ============================================================================

// ============================================================================
// FORM VALIDATION (removed - unused)
// ============================================================================

// ============================================================================
// LOADING STATES
// ============================================================================

export {
  LoadingProvider,
  useLoading,
  useAsyncLoading,
  Skeleton,
  SkeletonCard,
  SkeletonList,
  SkeletonProfile,
  SkeletonHeader,
  ProgressiveLoad,
  LoadingOverlay,
} from './loadingStates';
export type {LoadingState} from './loadingStates';

// ============================================================================
// INPUT VALIDATION
// ============================================================================

export {
  validateMarks,
  validatePercentage,
  validateObtainedVsTotal,
  validateSearchQuery,
  sanitizeText,
  validateCalculatorForm,
  createNumericInputHandler,
} from './validation';
export type {
  ValidationResult as InputValidationResult,
  MarksValidationOptions,
  CalculatorFormData,
  CalculatorValidationResult,
} from './validation';

// ============================================================================
// LOGGER
// ============================================================================

export {
  logger,
  log,
} from './logger';
export type {
  LogLevel,
  LogEntry,
  LoggerConfig,
} from './logger';

// ============================================================================
// FEE RANGE UTILITY
// ============================================================================

export {
  getFeeRange,
  formatCurrency,
  displayFeeRange,
  analyzeFeeRange,
  compareFees,
  getFeeInsights,
  getFeeDisplaySettings,
} from './feeRange';
export type {
  FeeRange,
  FeeRangeOptions,
  FeeDisplaySettings,
} from './feeRange';

// ============================================================================
// SCREEN UTILITIES
// ============================================================================

export {
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
  a11y as screenA11y,
} from './screenUtils';
export {default as ScreenUtils} from './screenUtils';

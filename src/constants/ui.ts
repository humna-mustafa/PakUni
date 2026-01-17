/**
 * UI Constants - Centralized magic numbers and timing values
 * Eliminates hardcoded values throughout the codebase
 */

// ============================================================================
// LIST ITEM HEIGHTS (for FlatList getItemLayout optimization)
// ============================================================================

export const LIST_ITEM_HEIGHTS = {
  /** University card height in PremiumUniversitiesScreen */
  UNIVERSITY_CARD: 180,
  /** Scholarship card height in PremiumScholarshipsScreen - optimized for better space usage */
  SCHOLARSHIP_CARD: 240,
  /** Entry test item height */
  ENTRY_TEST_ITEM: 120,
  /** Career item height */
  CAREER_ITEM: 100,
  /** Notification item height */
  NOTIFICATION_ITEM: 80,
  /** Standard list item */
  STANDARD_ITEM: 60,
} as const;

// ============================================================================
// ANIMATION TIMINGS (in milliseconds)
// ============================================================================

export const ANIMATION_TIMINGS = {
  /** Standard fade animation duration */
  FADE_DURATION: 300,
  /** Slide animation duration */
  SLIDE_DURATION: 250,
  /** Page transition duration */
  PAGE_TRANSITION: 400,
  /** Toast/snackbar display duration */
  TOAST_DURATION: 3000,
  /** Confetti display duration */
  CONFETTI_DURATION: 3000,
  /** Splash screen minimum display */
  SPLASH_DURATION: 1500,
  /** Debounce delay for search inputs */
  SEARCH_DEBOUNCE: 300,
  /** Throttle delay for scroll events */
  SCROLL_THROTTLE: 100,
} as const;

// ============================================================================
// DELAYS (in milliseconds)
// ============================================================================

export const DELAYS = {
  /** Simulated network delay for skeleton states */
  SKELETON_MIN_DISPLAY: 800,
  /** Delay before retry button animation */
  RETRY_BUTTON_DELAY: 500,
  /** Delay for haptic feedback */
  HAPTIC_DELAY: 50,
  /** Pull-to-refresh minimum delay */
  REFRESH_MIN_DURATION: 500,
} as const;

// ============================================================================
// RATE LIMITING
// ============================================================================

export const RATE_LIMITS = {
  /** Minimum time between favorite toggles */
  FAVORITE_ACTION: 1000,
  /** Minimum time between votes */
  VOTE_ACTION: 1500,
  /** Minimum time between form submissions */
  FORM_SUBMIT: 2000,
  /** Minimum time between feedback submissions */
  FEEDBACK_SUBMIT: 5000,
  /** Minimum time between share actions */
  SHARE_ACTION: 1000,
} as const;

// ============================================================================
// PAGINATION
// ============================================================================

export const PAGINATION = {
  /** Default page size for list views */
  DEFAULT_PAGE_SIZE: 20,
  /** Large page size for admin views */
  ADMIN_PAGE_SIZE: 50,
  /** Infinite scroll trigger threshold */
  LOAD_MORE_THRESHOLD: 0.5,
} as const;

// ============================================================================
// SESSION & TIMEOUT
// ============================================================================

export const SESSION = {
  /** Session timeout in milliseconds (30 minutes) */
  TIMEOUT_MS: 30 * 60 * 1000,
  /** Activity check interval (1 minute) */
  ACTIVITY_CHECK_INTERVAL: 60 * 1000,
  /** Cache expiration for static data (24 hours) */
  STATIC_CACHE_TTL: 24 * 60 * 60 * 1000,
  /** Cache expiration for user data (5 minutes) */
  USER_CACHE_TTL: 5 * 60 * 1000,
} as const;

// ============================================================================
// ACCESSIBILITY & TOUCH TARGETS (WCAG 2.2 Compliance)
// ============================================================================

export const ACCESSIBILITY = {
  /** Minimum touch target size (iOS HIG & Material Design) - WCAG 2.2 */
  MIN_TOUCH_TARGET: 44,
  /** Comfortable touch target for important actions */
  COMFORTABLE_TOUCH_TARGET: 48,
  /** Large touch target for primary CTAs */
  LARGE_TOUCH_TARGET: 56,
  /** Minimum contrast ratio for text (WCAG AA) */
  MIN_CONTRAST_RATIO: 4.5,
  /** Enhanced contrast ratio (WCAG AAA) */
  ENHANCED_CONTRAST_RATIO: 7,
  /** Reduced motion duration */
  REDUCED_MOTION_DURATION: 0,
  /** Minimum spacing between interactive elements */
  MIN_TARGET_SPACING: 8,
  /** Hit slop configurations */
  HIT_SLOP: {
    small: { top: 4, bottom: 4, left: 4, right: 4 },
    medium: { top: 8, bottom: 8, left: 8, right: 8 },
    large: { top: 12, bottom: 12, left: 12, right: 12 },
  },
} as const;

// ============================================================================
// ANIMATION CONSTANTS - Standardized Values
// ============================================================================

export const ANIMATION_SCALES = {
  /** Standard press scale (98% = subtle, professional) */
  PRESS: 0.98,
  /** Button press scale (97% = slightly more feedback) */
  BUTTON_PRESS: 0.97,
  /** Icon button scale (92% = visible feedback) */
  ICON_PRESS: 0.92,
  /** Card press scale */
  CARD_PRESS: 0.985,
  /** Chip/tag press scale */
  CHIP_PRESS: 0.95,
} as const;

export const SPRING_CONFIGS = {
  /** Snappy - for buttons and quick interactions */
  snappy: { tension: 300, friction: 10 },
  /** Responsive - for cards and medium elements */
  responsive: { tension: 200, friction: 12 },
  /** Gentle - for modals and large elements */
  gentle: { tension: 100, friction: 14 },
  /** Bouncy - for celebratory animations */
  bouncy: { tension: 150, friction: 6 },
  /** Default - balanced for most use cases */
  default: { tension: 170, friction: 10 },
} as const;

export const STAGGER_DELAYS = {
  /** Fast stagger for short lists */
  FAST: 50,
  /** Normal stagger for standard lists */
  NORMAL: 80,
  /** Slow stagger for emphasis */
  SLOW: 120,
} as const;

// ============================================================================
// OPACITY VALUES - Consistent Interaction Feedback
// ============================================================================

export const OPACITY = {
  /** Pressed state opacity */
  PRESSED: 0.8,
  /** Disabled state opacity */
  DISABLED: 0.5,
  /** Hover/focus state */
  HOVER: 0.9,
  /** Inactive/muted elements */
  MUTED: 0.6,
  /** Overlay backgrounds */
  OVERLAY_LIGHT: 0.5,
  OVERLAY_MEDIUM: 0.7,
  OVERLAY_HEAVY: 0.85,
} as const;

// ============================================================================
// IMAGE DIMENSIONS
// ============================================================================

export const IMAGE_SIZES = {
  /** University logo thumbnail */
  LOGO_THUMBNAIL: { width: 48, height: 48 },
  /** University logo standard */
  LOGO_STANDARD: { width: 80, height: 80 },
  /** Avatar small */
  AVATAR_SMALL: { width: 32, height: 32 },
  /** Avatar medium */
  AVATAR_MEDIUM: { width: 48, height: 48 },
  /** Avatar large */
  AVATAR_LARGE: { width: 80, height: 80 },
  /** Card hero image */
  CARD_HERO: { width: 320, height: 180 },
} as const;

export default {
  LIST_ITEM_HEIGHTS,
  ANIMATION_TIMINGS,
  DELAYS,
  RATE_LIMITS,
  PAGINATION,
  SESSION,
  ACCESSIBILITY,
  IMAGE_SIZES,
};

/**
 * Accessibility Utilities - Enterprise-grade a11y support
 * Following WCAG 2.1 AA guidelines and Google/Microsoft standards
 */

import {Platform, AccessibilityInfo} from 'react-native';

// ============================================================================
// ACCESSIBILITY ROLES - Standard roles for screen readers
// ============================================================================
export const A11Y_ROLES = {
  button: 'button' as const,
  link: 'link' as const,
  header: 'header' as const,
  image: 'image' as const,
  imagebutton: 'imagebutton' as const,
  text: 'text' as const,
  search: 'search' as const,
  adjustable: 'adjustable' as const,
  checkbox: 'checkbox' as const,
  radio: 'radio' as const,
  switch: 'switch' as const,
  progressbar: 'progressbar' as const,
  tab: 'tab' as const,
  tablist: 'tablist' as const,
  menu: 'menu' as const,
  menuitem: 'menuitem' as const,
  alert: 'alert' as const,
  none: 'none' as const,
};

// ============================================================================
// ACCESSIBILITY STATES
// ============================================================================
export interface A11yState {
  disabled?: boolean;
  selected?: boolean;
  checked?: boolean | 'mixed';
  busy?: boolean;
  expanded?: boolean;
}

// ============================================================================
// ACCESSIBILITY PROPS GENERATOR
// ============================================================================

/**
 * Generate accessibility props for buttons
 */
export const buttonA11y = (
  label: string,
  options?: {
    hint?: string;
    disabled?: boolean;
    selected?: boolean;
  },
) => ({
  accessible: true,
  accessibilityRole: A11Y_ROLES.button,
  accessibilityLabel: label,
  accessibilityHint: options?.hint || `Tap to ${label.toLowerCase()}`,
  accessibilityState: {
    disabled: options?.disabled || false,
    selected: options?.selected || false,
  },
});

/**
 * Generate accessibility props for links
 */
export const linkA11y = (label: string, hint?: string) => ({
  accessible: true,
  accessibilityRole: A11Y_ROLES.link,
  accessibilityLabel: label,
  accessibilityHint: hint || 'Opens in browser',
});

/**
 * Generate accessibility props for headers
 */
export const headerA11y = (label: string, level?: 1 | 2 | 3 | 4 | 5 | 6) => ({
  accessible: true,
  accessibilityRole: A11Y_ROLES.header,
  accessibilityLabel: label,
  // iOS uses accessibilityTraits for heading levels
  ...(Platform.OS === 'ios' && level && {
    accessibilityValue: {text: `Heading level ${level}`},
  }),
});

/**
 * Generate accessibility props for images
 */
export const imageA11y = (description: string, isDecorative = false) => ({
  accessible: !isDecorative,
  accessibilityRole: A11Y_ROLES.image,
  accessibilityLabel: isDecorative ? undefined : description,
  // Decorative images should be hidden from screen readers
  importantForAccessibility: isDecorative ? 'no' as const : 'yes' as const,
});

/**
 * Generate accessibility props for cards/touchable containers
 */
export const cardA11y = (
  title: string,
  subtitle?: string,
  options?: {
    hint?: string;
    isButton?: boolean;
  },
) => ({
  accessible: true,
  accessibilityRole: options?.isButton ? A11Y_ROLES.button : A11Y_ROLES.text,
  accessibilityLabel: subtitle ? `${title}. ${subtitle}` : title,
  accessibilityHint: options?.hint,
});

/**
 * Generate accessibility props for tabs
 */
export const tabA11y = (
  label: string,
  isSelected: boolean,
  tabIndex: number,
  totalTabs: number,
) => ({
  accessible: true,
  accessibilityRole: A11Y_ROLES.tab,
  accessibilityLabel: label,
  accessibilityHint: `Tab ${tabIndex + 1} of ${totalTabs}`,
  accessibilityState: {selected: isSelected},
});

/**
 * Generate accessibility props for checkboxes/switches
 */
export const toggleA11y = (
  label: string,
  isChecked: boolean,
  options?: {
    hint?: string;
    type?: 'checkbox' | 'switch' | 'radio';
  },
) => ({
  accessible: true,
  accessibilityRole: A11Y_ROLES[options?.type || 'checkbox'],
  accessibilityLabel: label,
  accessibilityHint: options?.hint || (isChecked ? 'Double tap to uncheck' : 'Double tap to check'),
  accessibilityState: {checked: isChecked},
});

/**
 * Generate accessibility props for progress indicators
 */
export const progressA11y = (
  label: string,
  value: number,
  max: number = 100,
) => ({
  accessible: true,
  accessibilityRole: A11Y_ROLES.progressbar,
  accessibilityLabel: label,
  accessibilityValue: {
    min: 0,
    max,
    now: value,
    text: `${Math.round((value / max) * 100)} percent`,
  },
});

/**
 * Generate accessibility props for search inputs
 */
export const searchA11y = (
  placeholder: string,
  value?: string,
) => ({
  accessible: true,
  accessibilityRole: A11Y_ROLES.search,
  accessibilityLabel: value ? `Search: ${value}` : placeholder,
  accessibilityHint: 'Enter search terms',
});

/**
 * Generate accessibility props for text inputs
 */
export const inputA11y = (
  label: string,
  options?: {
    hint?: string;
    error?: string;
    required?: boolean;
    value?: string;
  },
) => ({
  accessible: true,
  accessibilityLabel: options?.error 
    ? `${label}. Error: ${options.error}`
    : options?.required 
      ? `${label}, required`
      : label,
  accessibilityHint: options?.hint || 'Double tap to edit',
  accessibilityValue: options?.value ? {text: options.value} : undefined,
});

/**
 * Generate accessibility props for alerts/notifications
 */
export const alertA11y = (
  message: string,
  type: 'error' | 'warning' | 'success' | 'info' = 'info',
) => ({
  accessible: true,
  accessibilityRole: A11Y_ROLES.alert,
  accessibilityLabel: `${type.charAt(0).toUpperCase() + type.slice(1)}: ${message}`,
  accessibilityLiveRegion: 'polite' as const,
});

// ============================================================================
// ACCESSIBILITY UTILITIES
// ============================================================================

/**
 * Check if screen reader is enabled
 */
export const isScreenReaderEnabled = async (): Promise<boolean> => {
  return AccessibilityInfo.isScreenReaderEnabled();
};

/**
 * Check if reduce motion is enabled
 */
export const isReduceMotionEnabled = async (): Promise<boolean> => {
  return AccessibilityInfo.isReduceMotionEnabled();
};

/**
 * Announce message to screen reader
 */
export const announceForAccessibility = (message: string): void => {
  AccessibilityInfo.announceForAccessibility(message);
};

/**
 * Subscribe to screen reader changes
 */
export const onScreenReaderChanged = (
  callback: (isEnabled: boolean) => void,
): (() => void) => {
  const subscription = AccessibilityInfo.addEventListener(
    'screenReaderChanged',
    callback,
  );
  return () => subscription.remove();
};

/**
 * Subscribe to reduce motion changes
 */
export const onReduceMotionChanged = (
  callback: (isEnabled: boolean) => void,
): (() => void) => {
  const subscription = AccessibilityInfo.addEventListener(
    'reduceMotionChanged',
    callback,
  );
  return () => subscription.remove();
};

// ============================================================================
// CONTRAST & COLOR UTILITIES
// ============================================================================

/**
 * Calculate relative luminance of a color
 */
export const getLuminance = (hex: string): number => {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/**
 * Calculate contrast ratio between two colors
 * WCAG 2.1 requires 4.5:1 for normal text, 3:1 for large text
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Check if contrast meets WCAG AA requirements
 */
export const meetsContrastAA = (
  color1: string,
  color2: string,
  isLargeText = false,
): boolean => {
  const ratio = getContrastRatio(color1, color2);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
};

/**
 * Check if contrast meets WCAG AAA requirements
 */
export const meetsContrastAAA = (
  color1: string,
  color2: string,
  isLargeText = false,
): boolean => {
  const ratio = getContrastRatio(color1, color2);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
};

/**
 * Helper: Convert hex to RGB
 */
const hexToRgb = (hex: string): {r: number; g: number; b: number} | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

// ============================================================================
// FOCUS MANAGEMENT
// ============================================================================

/**
 * Set accessibility focus to a specific element (for modals, sheets, etc.)
 */
export const setAccessibilityFocus = (ref: React.RefObject<any>): void => {
  if (ref.current) {
    AccessibilityInfo.setAccessibilityFocus(ref.current);
  }
};

// ============================================================================
// SEMANTIC HELPERS
// ============================================================================

/**
 * Format numbers for screen readers (e.g., "1.5K" -> "one thousand five hundred")
 */
export const formatNumberForA11y = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)} million`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)} thousand`;
  }
  return num.toString();
};

/**
 * Format currency for screen readers
 */
export const formatCurrencyForA11y = (
  amount: number,
  currency = 'PKR',
): string => {
  const formatted = new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  
  return formatted.replace('PKR', 'Pakistani Rupees');
};

/**
 * Format percentage for screen readers
 */
export const formatPercentageForA11y = (value: number): string => {
  return `${Math.round(value)} percent`;
};

/**
 * Format date for screen readers
 */
export const formatDateForA11y = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default {
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
};

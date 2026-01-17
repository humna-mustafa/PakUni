/**
 * PakUni Brand Colors
 * 
 * Brand Primary: #4573DF - Professional, trustworthy blue
 * Inspired by megicode.com brand identity
 * 
 * Usage: Import these for hardcoded cases where theme colors can't be used
 * (e.g., static data, gradients, test badges)
 * 
 * For dynamic theming, always prefer useTheme() hook
 */

// ============================================================================
// PRIMARY BRAND COLORS
// ============================================================================

export const BRAND = {
  // Primary Blue - Main brand color
  primary: '#4573DF',
  primaryLight: '#4573DF',
  primaryDark: '#3660C9',
  primaryLighter: '#5A8AE6',
  primaryDarkest: '#2A4FA8',
  
  // Primary backgrounds (light mode)
  primaryBg: '#E8EFFC',
  primaryBgLight: '#F3F7FE',
  
  // Primary for dark mode
  primaryDarkMode: '#4573DF',
  primaryDarkModeDark: '#4573DF',
  primaryDarkModeLight: '#5A8AE6',
};

// ============================================================================
// DARK MODE BACKGROUNDS
// ============================================================================

export const DARK_BG = {
  // Main backgrounds
  background: '#1D2127',      // Primary dark bg
  backgroundSecondary: '#232930',
  
  // Surface/Card colors
  surface: '#232930',
  card: '#272C34',           // Secondary dark bg
  cardElevated: '#2E343D',
  cardHover: '#363D47',
  
  // Borders
  border: '#2E343D',
  borderLight: '#272C34',
  borderStrong: '#3D444D',
};

// ============================================================================
// LIGHT MODE BACKGROUNDS
// ============================================================================

export const LIGHT_BG = {
  // Main backgrounds
  background: '#F8FAFC',
  backgroundSecondary: '#FFFFFF',
  
  // Surface/Card colors
  surface: '#FFFFFF',
  card: '#FFFFFF',
  cardHover: '#F1F5F9',
  
  // Borders
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderStrong: '#CBD5E1',
};

// ============================================================================
// SEMANTIC COLORS (Theme-independent)
// ============================================================================

export const SEMANTIC = {
  // Success - Emerald green
  success: '#10B981',
  successLight: '#6EE7B7',
  successDark: '#059669',
  successBg: '#ECFDF5',
  successBgDark: '#1A2F2A',
  successText: '#065F46',
  
  // Warning - Amber
  warning: '#F59E0B',
  warningLight: '#FCD34D',
  warningDark: '#D97706',
  warningBg: '#FFFBEB',
  warningBgDark: '#2D2517',
  warningText: '#92400E',
  
  // Error - Red
  error: '#EF4444',
  errorLight: '#FB7185',
  errorDark: '#DC2626',
  errorBg: '#FEE2E2',
  errorBgDark: '#2D1A1F',
  errorText: '#991B1B',
  
  // Info - Brand blue
  info: '#4573DF',
  infoLight: '#4573DF',
  infoDark: '#3660C9',
  infoBg: '#E8EFFC',
  infoBgDark: '#1A2540',
  infoText: '#1A4A8F',
};

// ============================================================================
// GRADIENT PRESETS (For cards, buttons, headers)
// ============================================================================

export const GRADIENTS = {
  // Primary brand gradient
  primary: ['#4573DF', '#4573DF'],
  primaryDark: ['#3660C9', '#4573DF'],
  primaryVibrant: ['#4573DF', '#5A8AE6'],
  
  // Success gradient
  success: ['#10B981', '#059669', '#047857'],
  successLight: ['#6EE7B7', '#10B981'],
  
  // Warning gradient
  warning: ['#F59E0B', '#D97706', '#B45309'],
  
  // Error gradient
  error: ['#EF4444', '#DC2626', '#B91C1C'],
  
  // Purple accent (for special features)
  accent: ['#4573DF', '#3660C9', '#6D28D9'],
  
  // Pink accent (for highlights)
  highlight: ['#4573DF', '#3660C9', '#BE185D'],
  
  // Dark overlay gradients
  darkOverlay: ['rgba(29, 33, 39, 0.8)', 'rgba(29, 33, 39, 0.95)'],
  darkCard: ['#272C34', '#1D2127'],
};

// ============================================================================
// STATUS/BADGE COLORS
// ============================================================================

export const STATUS = {
  pending: {
    bg: '#FFFBEB',
    bgDark: '#2D2517',
    text: '#92400E',
    textDark: '#FCD34D',
  },
  under_review: {
    bg: '#E8EFFC',        // Brand blue bg
    bgDark: '#1A2540',
    text: '#3660C9',
    textDark: '#5A8AE6',
  },
  approved: {
    bg: '#ECFDF5',
    bgDark: '#1A2F2A',
    text: '#065F46',
    textDark: '#6EE7B7',
  },
  rejected: {
    bg: '#FEE2E2',
    bgDark: '#2D1A1F',
    text: '#991B1B',
    textDark: '#FB7185',
  },
  auto_approved: {
    bg: '#EDE9FE',
    bgDark: '#1F1D2E',
    text: '#5B21B6',
    textDark: '#A78BFA',
  },
};

// ============================================================================
// PRIORITY COLORS
// ============================================================================

export const PRIORITY = {
  low: { color: '#64748B', bg: '#F1F5F9' },
  medium: { color: '#F59E0B', bg: '#FFFBEB' },
  high: { color: '#F97316', bg: '#FFF7ED' },
  urgent: { color: '#EF4444', bg: '#FEE2E2' },
};

// ============================================================================
// PROVIDER COLORS (Google, Email, etc.)
// ============================================================================

export const PROVIDERS = {
  google: '#4285F4',
  email: '#10B981',
  guest: '#94A3B8',
  apple: '#000000',
  facebook: '#1877F2',
};

// ============================================================================
// ENTRY TEST COLORS (For countdown cards)
// ============================================================================

export const ENTRY_TESTS = {
  ECAT: ['#4573DF', '#3660C9', '#2A4FA8'],  // Brand blue
  MDCAT: ['#EF4444', '#DC2626', '#B91C1C'],
  NET: ['#10B981', '#059669', '#047857'],
  GAT: ['#4573DF', '#3660C9', '#6D28D9'],
  HAT: ['#F59E0B', '#D97706', '#B45309'],
  NTS: ['#4573DF', '#3660C9', '#BE185D'],
  DEFAULT: ['#4573DF', '#3660C9', '#2A4FA8'],  // Brand blue as default
};

// ============================================================================
// TEXT COLORS
// ============================================================================

export const TEXT = {
  // Light mode
  primary: '#0F172A',
  secondary: '#475569',
  muted: '#94A3B8',
  inverse: '#FFFFFF',
  
  // Dark mode
  primaryDark: '#F1F5F9',
  secondaryDark: '#94A3B8',
  mutedDark: '#64748B',
  inverseDark: '#1D2127',
};

// ============================================================================
// HELPER: Get themed color
// ============================================================================

export const getThemedColor = (lightColor: string, darkColor: string, isDark: boolean) => {
  return isDark ? darkColor : lightColor;
};

export const getStatusColors = (status: keyof typeof STATUS, isDark: boolean) => {
  const statusColors = STATUS[status];
  return {
    bg: isDark ? statusColors.bgDark : statusColors.bg,
    text: isDark ? statusColors.textDark : statusColors.text,
  };
};

export default {
  BRAND,
  DARK_BG,
  LIGHT_BG,
  SEMANTIC,
  GRADIENTS,
  STATUS,
  PRIORITY,
  PROVIDERS,
  ENTRY_TESTS,
  TEXT,
  getThemedColor,
  getStatusColors,
};



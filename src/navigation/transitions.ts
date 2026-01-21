/**
 * Page Transitions Configuration
 * Modern page transition animations for React Navigation Native Stack
 * 
 * Features:
 * - Native stack animations
 * - Modal presentations
 * - iOS-style interactive dismiss
 */

import type {
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import {Platform} from 'react-native';

// ============================================================================
// NAVIGATION CONFIG PRESETS FOR NATIVE STACK
// ============================================================================

/**
 * Default screen options with native transitions
 */
export const DefaultScreenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  gestureEnabled: true,
  animation: 'slide_from_right',
  animationDuration: 250,
};

/**
 * Modal screen options
 */
export const ModalScreenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  gestureEnabled: true,
  presentation: 'modal',
  animation: 'slide_from_bottom',
};

/**
 * Fade transition options
 */
export const FadeScreenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  animation: 'fade',
  animationDuration: 200,
};

/**
 * iOS-style card presentation
 */
export const CardScreenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  presentation: 'card',
  animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right',
};

/**
 * Transparent modal (for overlays)
 */
export const TransparentModalOptions: NativeStackNavigationOptions = {
  headerShown: false,
  presentation: 'transparentModal',
  animation: 'fade',
};

/**
 * Full screen modal
 */
export const FullScreenModalOptions: NativeStackNavigationOptions = {
  headerShown: false,
  presentation: 'fullScreenModal',
  animation: 'slide_from_bottom',
};

/**
 * Contained modal (iOS 13+ style)
 */
export const ContainedModalOptions: NativeStackNavigationOptions = {
  headerShown: false,
  presentation: 'containedModal',
  animation: 'slide_from_bottom',
};

// ============================================================================
// ANIMATION PRESETS
// ============================================================================

export const ANIMATIONS = {
  /** Slide from right (default) */
  slideFromRight: 'slide_from_right' as const,
  /** Slide from left */
  slideFromLeft: 'slide_from_left' as const,
  /** Slide from bottom */
  slideFromBottom: 'slide_from_bottom' as const,
  /** Fade in/out */
  fade: 'fade' as const,
  /** Fade from bottom (iOS-style) */
  fadeFromBottom: 'fade_from_bottom' as const,
  /** Native default animation */
  default: 'default' as const,
  /** Flip animation */
  flip: 'flip' as const,
  /** Simple push animation */
  simplePush: 'simple_push' as const,
  /** No animation */
  none: 'none' as const,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create screen options with custom animation
 */
export const createScreenOptions = (
  animation: keyof typeof ANIMATIONS,
  options?: Partial<NativeStackNavigationOptions>
): NativeStackNavigationOptions => ({
  headerShown: false,
  animation: ANIMATIONS[animation],
  ...options,
});

export default {
  // Presets
  DefaultScreenOptions,
  ModalScreenOptions,
  FadeScreenOptions,
  CardScreenOptions,
  TransparentModalOptions,
  FullScreenModalOptions,
  ContainedModalOptions,
  // Animations
  ANIMATIONS,
  // Utility
  createScreenOptions,
};


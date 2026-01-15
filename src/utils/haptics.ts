/**
 * Haptic Feedback Utility
 * Silicon Valley-grade tactile interactions for premium feel
 */

import {Platform} from 'react-native';

// Try to import react-native-haptic-feedback, fall back gracefully
let HapticFeedback: any = null;

try {
  HapticFeedback = require('react-native-haptic-feedback').default;
} catch (e) {
  // Haptic feedback not available, will use fallback
}

// Haptic feedback types
export type HapticType =
  | 'selection'        // Light tap for selections
  | 'impactLight'      // Light impact
  | 'impactMedium'     // Medium impact
  | 'impactHeavy'      // Heavy impact
  | 'notificationSuccess'  // Success notification
  | 'notificationWarning'  // Warning notification
  | 'notificationError'    // Error notification
  | 'clockTick'        // Clock tick (iOS only)
  | 'contextClick'     // Context menu (Android only)
  | 'keyboardPress'    // Keyboard press
  | 'keyboardRelease'  // Keyboard release
  | 'longPress'        // Long press;

// Default options for haptic feedback
const defaultOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

/**
 * Trigger haptic feedback
 * Falls back to Vibration API if haptic feedback library not available
 */
export const haptic = (type: HapticType = 'selection'): void => {
  if (HapticFeedback) {
    HapticFeedback.trigger(type, defaultOptions);
  } else {
    // Fallback to basic vibration (requires react-native Vibration import)
    try {
      const {Vibration} = require('react-native');
      switch (type) {
        case 'selection':
        case 'impactLight':
          Vibration.vibrate(10);
          break;
        case 'impactMedium':
          Vibration.vibrate(20);
          break;
        case 'impactHeavy':
        case 'longPress':
          Vibration.vibrate(30);
          break;
        case 'notificationSuccess':
          Vibration.vibrate([0, 50, 50, 50]);
          break;
        case 'notificationWarning':
          Vibration.vibrate([0, 100]);
          break;
        case 'notificationError':
          Vibration.vibrate([0, 50, 50, 50, 50, 50]);
          break;
        default:
          Vibration.vibrate(10);
      }
    } catch (e) {
      // Vibration not available, silently fail
    }
  }
};

/**
 * Semantic haptic helpers for common interactions
 */
export const Haptics = {
  // Light tap for buttons and selections
  light: () => haptic('selection'),
  
  // Medium impact for toggling states
  medium: () => haptic('impactMedium'),
  
  // Heavy impact for important actions
  heavy: () => haptic('impactHeavy'),
  
  // Success feedback (save, complete)
  success: () => haptic('notificationSuccess'),
  
  // Warning feedback (delete confirmation)
  warning: () => haptic('notificationWarning'),
  
  // Error feedback (validation error)
  error: () => haptic('notificationError'),
  
  // Button press feedback
  buttonPress: () => haptic('impactLight'),
  
  // Tab switch feedback
  tabSwitch: () => haptic('selection'),
  
  // Card tap feedback
  cardTap: () => haptic('selection'),
  
  // Long press feedback
  longPress: () => haptic('longPress'),
  
  // Pull-to-refresh threshold reached
  refreshThreshold: () => haptic('impactMedium'),
  
  // Slider tick feedback
  sliderTick: () => Platform.OS === 'ios' ? haptic('clockTick') : haptic('selection'),
};

export default Haptics;

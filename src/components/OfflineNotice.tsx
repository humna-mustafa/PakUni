/**
 * OfflineNotice Component
 * Shows a notice banner when the device is offline
 * Provides retry functionality and visual feedback
 */

import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNetworkStatus} from '../hooks/useNetworkStatus';
import {useTheme} from '../contexts/ThemeContext';
import {TYPOGRAPHY, SPACING, RADIUS} from '../constants/design';
import {Haptics} from '../utils/haptics';
import {Icon} from './icons';

interface OfflineNoticeProps {
  /**
   * Custom message to display when offline
   */
  message?: string;
  /**
   * Whether to show retry button
   */
  showRetry?: boolean;
  /**
   * Callback when retry is pressed
   */
  onRetry?: () => void;
  /**
   * Whether to show at top of screen (default) or bottom
   */
  position?: 'top' | 'bottom';
}

export const OfflineNotice: React.FC<OfflineNoticeProps> = ({
  message = 'No internet connection',
  showRetry = true,
  onRetry,
  position = 'top',
}) => {
  const {isConnected, isInternetReachable} = useNetworkStatus();
  const {colors} = useTheme();
  const insets = useSafeAreaInsets();

  // Determine if we should show the offline notice
  const isOffline = !isConnected || isInternetReachable === false;

  // Animation values
  const slideAnim = useRef(new Animated.Value(isOffline ? 0 : -100)).current;
  const opacityAnim = useRef(new Animated.Value(isOffline ? 1 : 0)).current;

  useEffect(() => {
    if (isOffline) {
      // Slide in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 12,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      Haptics.warning();
    } else {
      // Slide out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: position === 'top' ? -100 : 100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }

    // Cleanup animations
    return () => {
      slideAnim.stopAnimation();
      opacityAnim.stopAnimation();
    };
  }, [isOffline, position, slideAnim, opacityAnim]);

  const handleRetry = () => {
    Haptics.light();
    onRetry?.();
  };

  if (!isOffline) {
    return null;
  }

  const positionStyle =
    position === 'top'
      ? {top: insets.top}
      : {bottom: insets.bottom + (Platform.OS === 'ios' ? 80 : 70)};

  return (
    <Animated.View
      style={[
        styles.container,
        positionStyle,
        {
          backgroundColor: colors.error,
          transform: [{translateY: slideAnim}],
          opacity: opacityAnim,
        },
      ]}
      accessibilityRole="alert"
      accessibilityLabel={message}
      accessibilityLiveRegion="assertive"
      importantForAccessibility="yes">
      <View style={styles.content}>
        <Icon name="wifi-outline" family="Ionicons" size={22} color="#FFFFFF" />
        <Text style={styles.message}>{message}</Text>
        {showRetry && onRetry && (
          <TouchableOpacity
            style={[styles.retryButton, {backgroundColor: 'rgba(255,255,255,0.2)'}]}
            onPress={handleRetry}
            accessibilityRole="button"
            accessibilityLabel="Retry connection">
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

/**
 * Connection Restored Toast
 * Shows briefly when connection is restored
 */
export const ConnectionRestoredToast: React.FC = () => {
  const {isConnected} = useNetworkStatus();
  const {colors} = useTheme();
  const insets = useSafeAreaInsets();
  const wasOffline = useRef(false);
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [showToast, setShowToast] = React.useState(false);

  useEffect(() => {
    if (!isConnected) {
      wasOffline.current = true;
    } else if (wasOffline.current && isConnected) {
      // Connection restored
      wasOffline.current = false;
      setShowToast(true);
      Haptics.success();

      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowToast(false);
      });
    }

    return () => {
      opacityAnim.stopAnimation();
    };
  }, [isConnected, opacityAnim]);

  if (!showToast) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.restoredToast,
        {
          top: insets.top + SPACING.md,
          backgroundColor: colors.success,
          opacity: opacityAnim,
        },
      ]}>
      <Text style={styles.icon}>✓</Text>
      <Text style={styles.restoredText}>Connection restored</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: SPACING.md,
    right: SPACING.md,
    borderRadius: RADIUS.lg,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
  },
  icon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  message: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  retryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
    marginLeft: SPACING.sm,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  restoredToast: {
    position: 'absolute',
    left: SPACING.xl,
    right: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    zIndex: 1000,
  },
  restoredText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginLeft: SPACING.xs,
  },
});

export default OfflineNotice;

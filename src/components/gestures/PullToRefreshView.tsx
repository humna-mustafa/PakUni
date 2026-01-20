/**
 * PullToRefreshView Component
 * Custom pull-to-refresh with animated Lottie-style indicator
 * 
 * Features:
 * - Custom animated refresh indicator
 * - Smooth spring physics
 * - Haptic feedback
 * - Progress-based animation
 */

import React, {useCallback, memo} from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  Extrapolate,
  runOnJS,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import {useTheme} from '../../contexts/ThemeContext';
import {Icon} from '../icons';
import {Haptics} from '../../utils/haptics';
import {SPRING_CONFIGS} from '../../hooks/useGestureAnimation';

const REFRESH_THRESHOLD = 80;
const MAX_PULL = 120;

interface PullToRefreshViewProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  refreshing?: boolean;
}

const PullToRefreshView: React.FC<PullToRefreshViewProps> = memo(({
  children,
  onRefresh,
  refreshing = false,
}) => {
  const {colors, isDark} = useTheme();
  const pullDistance = useSharedValue(0);
  const isRefreshing = useSharedValue(false);
  const rotation = useSharedValue(0);
  const hasTriggeredHaptic = useSharedValue(false);

  const triggerThresholdHaptic = useCallback(() => {
    Haptics.impact('medium');
  }, []);

  const triggerSuccessHaptic = useCallback(() => {
    Haptics.success();
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      await onRefresh();
      triggerSuccessHaptic();
    } catch (error) {
      Haptics.error();
    }
  }, [onRefresh, triggerSuccessHaptic]);

  // Start rotation animation when refreshing
  const startRotation = useCallback(() => {
    'worklet';
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1, // Infinite repeat
      false
    );
  }, []);

  const stopRotation = useCallback(() => {
    'worklet';
    cancelAnimation(rotation);
    rotation.value = withTiming(0, {duration: 200});
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const y = event.contentOffset.y;
      
      if (y < 0 && !isRefreshing.value) {
        pullDistance.value = Math.min(Math.abs(y), MAX_PULL);
        
        // Trigger haptic at threshold
        if (Math.abs(y) >= REFRESH_THRESHOLD && !hasTriggeredHaptic.value) {
          hasTriggeredHaptic.value = true;
          runOnJS(triggerThresholdHaptic)();
        } else if (Math.abs(y) < REFRESH_THRESHOLD) {
          hasTriggeredHaptic.value = false;
        }
      }
    },
    onEndDrag: (event) => {
      const y = event.contentOffset.y;
      
      if (y < -REFRESH_THRESHOLD && !isRefreshing.value) {
        isRefreshing.value = true;
        pullDistance.value = withSpring(REFRESH_THRESHOLD, SPRING_CONFIGS.responsive);
        startRotation();
        runOnJS(handleRefresh)();
      } else {
        pullDistance.value = withSpring(0, SPRING_CONFIGS.responsive);
      }
    },
  });

  // Update refreshing state
  React.useEffect(() => {
    if (!refreshing && isRefreshing.value) {
      isRefreshing.value = false;
      stopRotation();
      pullDistance.value = withSpring(0, SPRING_CONFIGS.responsive);
    }
  }, [refreshing]);

  // Indicator container style
  const indicatorContainerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      pullDistance.value,
      [0, REFRESH_THRESHOLD],
      [-60, 0],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      pullDistance.value,
      [0, REFRESH_THRESHOLD * 0.5, REFRESH_THRESHOLD],
      [0, 0.5, 1],
      Extrapolate.CLAMP
    );

    return {
      transform: [{translateY}],
      opacity,
    };
  });

  // Icon animation style
  const iconStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      pullDistance.value,
      [0, REFRESH_THRESHOLD],
      [0.5, 1],
      Extrapolate.CLAMP
    );

    const progress = interpolate(
      pullDistance.value,
      [0, REFRESH_THRESHOLD],
      [0, 180],
      Extrapolate.CLAMP
    );

    const rotationValue = isRefreshing.value ? rotation.value : progress;

    return {
      transform: [
        {scale},
        {rotate: `${rotationValue}deg`},
      ],
    };
  });

  // Progress ring style
  const progressRingStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      pullDistance.value,
      [0, REFRESH_THRESHOLD],
      [0, 1],
      Extrapolate.CLAMP
    );

    const borderWidth = isRefreshing.value ? 3 : interpolate(
      pullDistance.value,
      [0, REFRESH_THRESHOLD],
      [1, 3],
      Extrapolate.CLAMP
    );

    return {
      borderWidth,
      borderColor: isRefreshing.value
        ? colors.primary
        : `rgba(${isDark ? '255,255,255' : '0,0,0'}, ${progress * 0.3})`,
    };
  });

  // Text style
  const textStyle = useAnimatedStyle(() => {
    const opacity = pullDistance.value >= REFRESH_THRESHOLD ? 1 : 0;
    return {opacity};
  });

  return (
    <View style={styles.container}>
      {/* Refresh Indicator */}
      <Animated.View style={[styles.indicatorContainer, indicatorContainerStyle]}>
        <Animated.View style={[styles.progressRing, progressRingStyle]}>
          <Animated.View style={iconStyle}>
            <Icon
              name={isRefreshing.value ? 'sync' : 'arrow-down'}
              family="Ionicons"
              size={20}
              color={colors.primary}
            />
          </Animated.View>
        </Animated.View>
        <Animated.Text style={[styles.refreshText, {color: colors.textSecondary}, textStyle]}>
          {isRefreshing.value ? 'Refreshing...' : 'Release to refresh'}
        </Animated.Text>
      </Animated.View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        bounces={true}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {children}
      </Animated.ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  indicatorContainer: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  progressRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  refreshText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '500',
  },
  scrollContent: {
    flexGrow: 1,
  },
});

export default PullToRefreshView;

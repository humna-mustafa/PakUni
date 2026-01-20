/**
 * AnimatedPressable Component
 * Modern pressable with spring animations, haptic feedback, and scale effects
 * 
 * Features:
 * - Smooth scale animation on press
 * - Haptic feedback support
 * - Long press detection with visual feedback
 * - Disabled state handling
 */

import React, {useCallback, memo} from 'react';
import {StyleSheet, ViewStyle, Platform} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {
  TapGestureHandler,
  TapGestureHandlerGestureEvent,
  LongPressGestureHandler,
  LongPressGestureHandlerGestureEvent,
  State,
} from 'react-native-gesture-handler';
import {Haptics} from '../../utils/haptics';

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 400,
  mass: 0.3,
};

interface AnimatedPressableProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  hapticFeedback?: boolean;
  scaleOnPress?: number;
  style?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

const AnimatedPressable: React.FC<AnimatedPressableProps> = memo(({
  children,
  onPress,
  onLongPress,
  disabled = false,
  hapticFeedback = true,
  scaleOnPress = 0.97,
  style,
  accessibilityLabel,
  accessibilityHint,
  testID,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const triggerHaptic = useCallback(() => {
    if (hapticFeedback) {
      Haptics.impact('light');
    }
  }, [hapticFeedback]);

  const triggerPress = useCallback(() => {
    if (onPress && !disabled) {
      onPress();
    }
  }, [onPress, disabled]);

  const triggerLongPress = useCallback(() => {
    if (onLongPress && !disabled) {
      Haptics.impact('heavy');
      onLongPress();
    }
  }, [onLongPress, disabled]);

  const onTapHandlerStateChange = useCallback(
    ({nativeEvent}: TapGestureHandlerGestureEvent) => {
      if (disabled) return;

      if (nativeEvent.state === State.BEGAN) {
        scale.value = withSpring(scaleOnPress, SPRING_CONFIG);
        opacity.value = withTiming(0.9, {duration: 50});
      } else if (nativeEvent.state === State.END) {
        scale.value = withSpring(1, SPRING_CONFIG);
        opacity.value = withTiming(1, {duration: 100});
        runOnJS(triggerHaptic)();
        runOnJS(triggerPress)();
      } else if (
        nativeEvent.state === State.CANCELLED ||
        nativeEvent.state === State.FAILED
      ) {
        scale.value = withSpring(1, SPRING_CONFIG);
        opacity.value = withTiming(1, {duration: 100});
      }
    },
    [disabled, scaleOnPress, triggerHaptic, triggerPress]
  );

  const onLongPressHandlerStateChange = useCallback(
    ({nativeEvent}: LongPressGestureHandlerGestureEvent) => {
      if (disabled || !onLongPress) return;

      if (nativeEvent.state === State.ACTIVE) {
        runOnJS(triggerLongPress)();
      }
      if (
        nativeEvent.state === State.END ||
        nativeEvent.state === State.CANCELLED
      ) {
        scale.value = withSpring(1, SPRING_CONFIG);
        opacity.value = withTiming(1, {duration: 100});
      }
    },
    [disabled, onLongPress, triggerLongPress]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
    opacity: disabled ? 0.5 : opacity.value,
  }));

  const content = (
    <Animated.View
      style={[styles.container, style, animatedStyle]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{disabled}}
      testID={testID}>
      {children}
    </Animated.View>
  );

  if (onLongPress) {
    return (
      <LongPressGestureHandler
        onHandlerStateChange={onLongPressHandlerStateChange}
        minDurationMs={500}>
        <TapGestureHandler
          onHandlerStateChange={onTapHandlerStateChange}
          enabled={!disabled}>
          {content}
        </TapGestureHandler>
      </LongPressGestureHandler>
    );
  }

  return (
    <TapGestureHandler
      onHandlerStateChange={onTapHandlerStateChange}
      enabled={!disabled}>
      {content}
    </TapGestureHandler>
  );
});

const styles = StyleSheet.create({
  container: {
    // Base container
  },
});

export default AnimatedPressable;

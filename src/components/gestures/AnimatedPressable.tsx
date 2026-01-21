/**
 * AnimatedPressable Component
 * Simple pressable with scale animation and haptic feedback
 */

import React, {useCallback, memo, useRef} from 'react';
import {
  Pressable,
  Animated,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import {Haptics} from '../../utils/haptics';

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
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: scaleOnPress,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim, scaleOnPress]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    if (hapticFeedback) {
      Haptics.light();
    }
    onPress?.();
  }, [hapticFeedback, onPress]);

  const handleLongPress = useCallback(() => {
    if (hapticFeedback) {
      Haptics.heavy();
    }
    onLongPress?.();
  }, [hapticFeedback, onLongPress]);

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={onLongPress ? handleLongPress : undefined}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{disabled}}
      testID={testID}>
      <Animated.View
        style={[
          styles.container,
          style,
          {
            transform: [{scale: scaleAnim}],
            opacity: disabled ? 0.5 : 1,
          },
        ]}>
        {children}
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {},
});

export default AnimatedPressable;

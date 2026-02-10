/**
 * AnimatedPressable - Card with spring press effect
 */

import React, { useRef } from 'react';
import { TouchableOpacity, Animated } from 'react-native';

interface AnimatedPressableProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: any;
  disabled?: boolean;
}

const AnimatedPressableComponent: React.FC<AnimatedPressableProps> = ({
  children,
  onPress,
  style,
  disabled,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}>
      <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

export const AnimatedPressable = React.memo(AnimatedPressableComponent);

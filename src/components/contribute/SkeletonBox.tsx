/**
 * SkeletonBox - Pulsing skeleton loading placeholder
 */

import React, { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

interface SkeletonBoxProps {
  width: number | string;
  height: number;
  style?: any;
}

const SkeletonBoxComponent: React.FC<SkeletonBoxProps> = ({ width, height, style }) => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: '#E5E7EB',
          borderRadius: 8,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
};

export const SkeletonBox = React.memo(SkeletonBoxComponent);

/**
 * AnimatedTypeCard - Animated selectable card for submission type grid
 */

import React, {useEffect, useRef} from 'react';
import {TouchableOpacity, Animated} from 'react-native';

interface AnimatedTypeCardProps {
  children: React.ReactNode;
  index: number;
  style?: any;
  onPress?: () => void;
}

const AnimatedTypeCard: React.FC<AnimatedTypeCardProps> = ({children, index, style, onPress}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    const delay = index * 50;
    Animated.parallel([
      Animated.timing(fadeAnim, {toValue: 1, duration: 300, delay, useNativeDriver: true}),
      Animated.spring(scaleAnim, {toValue: 1, tension: 50, friction: 8, delay, useNativeDriver: true}),
    ]).start();
  }, [index]);

  return (
    <Animated.View style={[style, {opacity: fadeAnim, transform: [{scale: scaleAnim}]}]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default React.memo(AnimatedTypeCard);

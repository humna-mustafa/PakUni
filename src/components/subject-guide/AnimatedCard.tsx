/**
 * AnimatedCard - Staggered entrance animation wrapper for cards.
 */
import React, {useRef, useEffect} from 'react';
import {Animated, TouchableOpacity} from 'react-native';

interface AnimatedCardProps {
  children: React.ReactNode;
  index: number;
  style?: any;
  onPress?: () => void;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({children, index, style, onPress}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    const delay = index * 60;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  const animatedStyle = [
    style,
    {
      opacity: fadeAnim,
      transform: [{translateY: slideAnim}, {scale: scaleAnim}],
    },
  ];

  if (onPress) {
    return (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
          {children}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

export default AnimatedCard;

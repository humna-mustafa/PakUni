import React, {useRef, useEffect} from 'react';
import {Animated, Easing} from 'react-native';

interface FloatingDecorationProps {
  emoji: string;
  delay: number;
  startX: number;
  startY: number;
}

const FloatingDecoration: React.FC<FloatingDecorationProps> = ({emoji, delay, startX, startY}) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {toValue: 1, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true}),
          Animated.timing(floatAnim, {toValue: 0, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true}),
        ]),
      ).start();
    };

    setTimeout(() => {
      Animated.timing(fadeAnim, {toValue: 1, duration: 500, useNativeDriver: true}).start();
      startAnimation();
    }, delay);
  }, [delay, floatAnim, fadeAnim]);

  const translateY = floatAnim.interpolate({inputRange: [0, 1], outputRange: [0, -15]});
  const rotate = floatAnim.interpolate({inputRange: [0, 1], outputRange: ['0deg', '10deg']});

  return (
    <Animated.Text
      style={{
        position: 'absolute',
        left: startX,
        top: startY,
        fontSize: 20,
        opacity: fadeAnim.interpolate({inputRange: [0, 1], outputRange: [0, 0.4]}),
        transform: [{translateY}, {rotate}],
      }}>
      {emoji}
    </Animated.Text>
  );
};

export default FloatingDecoration;

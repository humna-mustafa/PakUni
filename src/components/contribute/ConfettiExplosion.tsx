/**
 * ConfettiExplosion - Celebration confetti effect with particles
 */

import React, { useRef, useEffect, useMemo } from 'react';
import { View, Animated, Easing, Dimensions, StyleSheet } from 'react-native';
import { BRAND, GRADIENTS, SEMANTIC } from '../../constants/brand';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Internal particle component
const ConfettiParticle: React.FC<{ delay: number; color: string }> = ({ delay, color }) => {
  const translateY = useRef(new Animated.Value(-50)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const xOffset = (Math.random() - 0.5) * SCREEN_WIDTH;

    const timeoutId = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT + 100,
          duration: 2500,
          easing: Easing.quad,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: xOffset,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 10,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 2500,
          delay: 1500,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      translateY.stopAnimation();
      translateX.stopAnimation();
      rotate.stopAnimation();
      opacity.stopAnimation();
    };
  }, [delay, translateY, translateX, rotate, opacity]);

  const spin = rotate.interpolate({
    inputRange: [0, 10],
    outputRange: ['0deg', '720deg'],
  });

  return (
    <Animated.View
      style={[
        particleStyles.particle,
        {
          left: SCREEN_WIDTH / 2,
          backgroundColor: color,
          opacity,
          transform: [{ translateY }, { translateX }, { rotate: spin }],
        },
      ]}
    />
  );
};

const particleStyles = StyleSheet.create({
  particle: {
    position: 'absolute',
    top: 0,
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});

const CONFETTI_COLORS = [
  BRAND.primary,
  GRADIENTS.highlight[0],
  SEMANTIC.success,
  SEMANTIC.warning,
  SEMANTIC.error,
  GRADIENTS.accent[0],
];

const ConfettiExplosionComponent: React.FC<{ visible: boolean }> = ({ visible }) => {
  // Memoize particles to avoid recreating 50 objects on every render
  const particles = useMemo(() => {
    if (!visible) return [];
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      delay: Math.random() * 500,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    }));
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map(p => (
        <ConfettiParticle key={p.id} delay={p.delay} color={p.color} />
      ))}
    </View>
  );
};

export const ConfettiExplosion = React.memo(ConfettiExplosionComponent);

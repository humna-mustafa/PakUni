/**
 * AnimatedLoader Component
 * Beautiful animated loading states with multiple variants
 */

import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated, Easing, ViewStyle} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import {SPACING, FONTS, BORDER_RADIUS} from '../constants/theme';

// Loader variants
type LoaderVariant = 'dots' | 'pulse' | 'spinner' | 'bounce' | 'wave';

interface AnimatedLoaderProps {
  variant?: LoaderVariant;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  message?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

// Dot animation component
const DotsLoader: React.FC<{color: string; size: number}> = ({color, size}) => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createAnimation = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 400,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 400,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ]),
      );

    const anim1 = createAnimation(dot1, 0);
    const anim2 = createAnimation(dot2, 150);
    const anim3 = createAnimation(dot3, 300);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [dot1, dot2, dot3]);

  const dotSize = size * 0.3;
  const translateY = (value: Animated.Value) =>
    value.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -size * 0.4],
    });

  const scale = (value: Animated.Value) =>
    value.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 1.2, 1],
    });

  return (
    <View style={[styles.dotsContainer, {width: size, height: size}]}>
      {[dot1, dot2, dot3].map((dot, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: color,
              transform: [{translateY: translateY(dot)}, {scale: scale(dot)}],
            },
          ]}
        />
      ))}
    </View>
  );
};

// Pulse animation component
const PulseLoader: React.FC<{color: string; size: number}> = ({color, size}) => {
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createPulse = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 1200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );

    const anim1 = createPulse(pulse1, 0);
    const anim2 = createPulse(pulse2, 600);

    anim1.start();
    anim2.start();

    return () => {
      anim1.stop();
      anim2.stop();
    };
  }, [pulse1, pulse2]);

  const scale = (value: Animated.Value) =>
    value.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1.5],
    });

  const opacity = (value: Animated.Value) =>
    value.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 0],
    });

  return (
    <View style={[styles.pulseContainer, {width: size, height: size}]}>
      {[pulse1, pulse2].map((pulse, index) => (
        <Animated.View
          key={index}
          style={[
            styles.pulseRing,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: color,
              transform: [{scale: scale(pulse)}],
              opacity: opacity(pulse),
            },
          ]}
        />
      ))}
      <View
        style={[
          styles.pulseCenter,
          {
            width: size * 0.3,
            height: size * 0.3,
            borderRadius: size * 0.15,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
};

// Spinner animation component
const SpinnerLoader: React.FC<{color: string; size: number}> = ({color, size}) => {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    anim.start();
    return () => anim.stop();
  }, [rotation]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.spinner,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: size * 0.08,
          borderTopColor: color,
          borderRightColor: `${color}40`,
          borderBottomColor: `${color}20`,
          borderLeftColor: `${color}60`,
          transform: [{rotate: spin}],
        },
      ]}
    />
  );
};

// Bounce animation component
const BounceLoader: React.FC<{color: string; size: number}> = ({color, size}) => {
  const bounce1 = useRef(new Animated.Value(0)).current;
  const bounce2 = useRef(new Animated.Value(0)).current;
  const bounce3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createBounce = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.spring(value, {
            toValue: 1,
            friction: 3,
            tension: 200,
            useNativeDriver: true,
          }),
          Animated.spring(value, {
            toValue: 0,
            friction: 3,
            tension: 200,
            useNativeDriver: true,
          }),
        ]),
      );

    const anim1 = createBounce(bounce1, 0);
    const anim2 = createBounce(bounce2, 100);
    const anim3 = createBounce(bounce3, 200);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [bounce1, bounce2, bounce3]);

  const dotSize = size * 0.25;
  const scale = (value: Animated.Value) =>
    value.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.5],
    });

  return (
    <View style={[styles.bounceContainer, {width: size, height: size}]}>
      {[bounce1, bounce2, bounce3].map((bounce, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bounceDot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: color,
              transform: [{scale: scale(bounce)}],
            },
          ]}
        />
      ))}
    </View>
  );
};

// Wave animation component
const WaveLoader: React.FC<{color: string; size: number}> = ({color, size}) => {
  const waves = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    const animations = waves.map((wave, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 100),
          Animated.timing(wave, {
            toValue: 1,
            duration: 500,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(wave, {
            toValue: 0,
            duration: 500,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ]),
      ),
    );

    animations.forEach(anim => anim.start());
    return () => animations.forEach(anim => anim.stop());
  }, [waves]);

  const barWidth = size * 0.1;
  const barHeight = (value: Animated.Value) =>
    value.interpolate({
      inputRange: [0, 1],
      outputRange: [size * 0.3, size],
    });

  return (
    <View style={[styles.waveContainer, {width: size, height: size}]}>
      {waves.map((wave, index) => (
        <Animated.View
          key={index}
          style={[
            styles.waveBar,
            {
              width: barWidth,
              backgroundColor: color,
              height: barHeight(wave),
              borderRadius: barWidth / 2,
            },
          ]}
        />
      ))}
    </View>
  );
};

// Main AnimatedLoader component
export const AnimatedLoader: React.FC<AnimatedLoaderProps> = ({
  variant = 'dots',
  size = 'medium',
  color,
  message,
  fullScreen = false,
  overlay = false,
}) => {
  const {colors} = useTheme();
  const loaderColor = color || colors.primary;

  const sizeMap = {
    small: 40,
    medium: 60,
    large: 80,
  };
  const loaderSize = sizeMap[size];

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return <DotsLoader color={loaderColor} size={loaderSize} />;
      case 'pulse':
        return <PulseLoader color={loaderColor} size={loaderSize} />;
      case 'spinner':
        return <SpinnerLoader color={loaderColor} size={loaderSize} />;
      case 'bounce':
        return <BounceLoader color={loaderColor} size={loaderSize} />;
      case 'wave':
        return <WaveLoader color={loaderColor} size={loaderSize} />;
      default:
        return <DotsLoader color={loaderColor} size={loaderSize} />;
    }
  };

  const content = (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      {renderLoader()}
      {message && (
        <Text style={[styles.message, {color: colors.textSecondary}]}>{message}</Text>
      )}
    </View>
  );

  if (overlay) {
    return (
      <View style={[styles.overlay, {backgroundColor: colors.overlay}]}>
        <View style={[styles.overlayContent, {backgroundColor: colors.card}]}>
          {renderLoader()}
          {message && (
            <Text style={[styles.message, {color: colors.textSecondary}]}>{message}</Text>
          )}
        </View>
      </View>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  fullScreen: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  overlayContent: {
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    minWidth: 150,
  },
  message: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.md,
    textAlign: 'center',
  },
  // Dots
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {},
  // Pulse
  pulseContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 3,
  },
  pulseCenter: {},
  // Spinner
  spinner: {},
  // Bounce
  bounceContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  bounceDot: {},
  // Wave
  waveContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 4,
  },
  waveBar: {},
});

export default AnimatedLoader;

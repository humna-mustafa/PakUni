/**
 * Premium Animated List Components
 * Staggered, natural list animations that feel handcrafted
 */

import React, {useRef, useEffect} from 'react';
import {
  View,
  FlatList,
  Animated,
  StyleSheet,
  ViewStyle,
  FlatListProps,
} from 'react-native';
import {ANIMATION, SPACING} from '../constants/design';

// ============================================================================
// ANIMATED LIST ITEM WRAPPER
// ============================================================================

interface AnimatedListItemProps {
  index: number;
  children: React.ReactNode;
  style?: ViewStyle;
  animationType?: 'fadeSlide' | 'scale' | 'slideLeft' | 'slideRight' | 'bounce';
  staggerDelay?: number;
  duration?: number;
}

export const AnimatedListItem: React.FC<AnimatedListItemProps> = ({
  index,
  children,
  style,
  animationType = 'fadeSlide',
  staggerDelay = 50,
  duration = 400,
}) => {
  const translateY = useRef(new Animated.Value(30)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const delay = index * staggerDelay;

    // Add slight randomness for natural feel
    const randomOffset = (Math.random() - 0.5) * 20;
    const actualDelay = Math.max(0, delay + randomOffset);

    switch (animationType) {
      case 'scale':
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: duration * 0.8,
            delay: actualDelay,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            friction: 6,
            tension: 100,
            delay: actualDelay,
            useNativeDriver: true,
          }),
        ]).start();
        break;

      case 'slideLeft':
        translateX.setValue(60);
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: duration,
            delay: actualDelay,
            useNativeDriver: true,
          }),
          Animated.spring(translateX, {
            toValue: 0,
            friction: 8,
            tension: 80,
            delay: actualDelay,
            useNativeDriver: true,
          }),
        ]).start();
        break;

      case 'slideRight':
        translateX.setValue(-60);
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: duration,
            delay: actualDelay,
            useNativeDriver: true,
          }),
          Animated.spring(translateX, {
            toValue: 0,
            friction: 8,
            tension: 80,
            delay: actualDelay,
            useNativeDriver: true,
          }),
        ]).start();
        break;

      case 'bounce':
        scale.setValue(0.3);
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: duration * 0.6,
            delay: actualDelay,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            friction: 3,
            tension: 200,
            delay: actualDelay,
            useNativeDriver: true,
          }),
        ]).start();
        break;

      default: // fadeSlide
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: duration,
            delay: actualDelay,
            useNativeDriver: true,
          }),
          Animated.spring(translateY, {
            toValue: 0,
            friction: 10,
            tension: 100,
            delay: actualDelay,
            useNativeDriver: true,
          }),
        ]).start();
    }
  }, []);

  const getTransformStyle = () => {
    switch (animationType) {
      case 'scale':
      case 'bounce':
        return {transform: [{scale}]};
      case 'slideLeft':
      case 'slideRight':
        return {transform: [{translateX}]};
      default:
        return {transform: [{translateY}]};
    }
  };

  return (
    <Animated.View style={[{opacity}, getTransformStyle(), style]}>
      {children}
    </Animated.View>
  );
};

// ============================================================================
// ANIMATED FLATLIST
// ============================================================================

interface AnimatedFlatListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  renderItem: (item: T, index: number) => React.ReactNode;
  animationType?: 'fadeSlide' | 'scale' | 'slideLeft' | 'slideRight' | 'bounce';
  staggerDelay?: number;
  itemStyle?: ViewStyle;
}

export function AnimatedFlatList<T>({
  data,
  renderItem,
  animationType = 'fadeSlide',
  staggerDelay = 50,
  itemStyle,
  ...props
}: AnimatedFlatListProps<T>) {
  return (
    <FlatList
      data={data}
      renderItem={({item, index}) => (
        <AnimatedListItem
          index={index}
          animationType={animationType}
          staggerDelay={staggerDelay}
          style={itemStyle}>
          {renderItem(item, index)}
        </AnimatedListItem>
      )}
      {...props}
    />
  );
}

// ============================================================================
// PARALLAX SCROLL HEADER
// ============================================================================

interface ParallaxHeaderProps {
  scrollY: Animated.Value;
  headerHeight: number;
  parallaxRatio?: number;
  children: React.ReactNode;
  backgroundComponent?: React.ReactNode;
  stickyComponent?: React.ReactNode;
  stickyHeight?: number;
}

export const ParallaxHeader: React.FC<ParallaxHeaderProps> = ({
  scrollY,
  headerHeight,
  parallaxRatio = 0.5,
  children,
  backgroundComponent,
  stickyComponent,
  stickyHeight = 60,
}) => {
  const headerTranslate = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight * parallaxRatio],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, headerHeight * 0.5, headerHeight],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const backgroundScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.2, 1],
    extrapolate: 'clamp',
  });

  const stickyOpacity = scrollY.interpolate({
    inputRange: [headerHeight - stickyHeight - 20, headerHeight - stickyHeight],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <>
      {/* Parallax Background */}
      <Animated.View
        style={[
          styles.parallaxBackground,
          {
            height: headerHeight,
            transform: [{translateY: headerTranslate}, {scale: backgroundScale}],
          },
        ]}>
        {backgroundComponent}
      </Animated.View>

      {/* Main Header Content */}
      <Animated.View
        style={[
          styles.parallaxContent,
          {
            height: headerHeight,
            opacity: headerOpacity,
            transform: [{translateY: headerTranslate}],
          },
        ]}>
        {children}
      </Animated.View>

      {/* Sticky Header */}
      {stickyComponent && (
        <Animated.View
          style={[
            styles.stickyHeader,
            {
              height: stickyHeight,
              opacity: stickyOpacity,
            },
          ]}>
          {stickyComponent}
        </Animated.View>
      )}
    </>
  );
};

// ============================================================================
// FADE IN VIEW
// ============================================================================

interface FadeInViewProps {
  delay?: number;
  duration?: number;
  children: React.ReactNode;
  style?: ViewStyle;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
}

export const FadeInView: React.FC<FadeInViewProps> = ({
  delay = 0,
  duration = 500,
  children,
  style,
  direction = 'up',
  distance = 30,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translate, {
        toValue: 0,
        friction: 8,
        tension: 80,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getTransform = () => {
    switch (direction) {
      case 'up':
        return [{translateY: translate}];
      case 'down':
        return [{translateY: Animated.multiply(translate, -1)}];
      case 'left':
        return [{translateX: translate}];
      case 'right':
        return [{translateX: Animated.multiply(translate, -1)}];
      default:
        return [];
    }
  };

  return (
    <Animated.View
      style={[
        {
          opacity,
          transform: getTransform(),
        },
        style,
      ]}>
      {children}
    </Animated.View>
  );
};

// ============================================================================
// SCALE ON PRESS
// ============================================================================

interface ScaleOnPressProps {
  children: React.ReactNode;
  onPress?: () => void;
  scale?: number;
  style?: ViewStyle;
}

export const ScaleOnPress: React.FC<ScaleOnPressProps> = ({
  children,
  onPress,
  scale = 0.96,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: scale,
      useNativeDriver: true,
      ...ANIMATION.spring.snappy,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...ANIMATION.spring.default,
    }).start();
  };

  return (
    <Animated.View
      style={[{transform: [{scale: scaleAnim}]}, style]}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
      onTouchCancel={handlePressOut}>
      {children}
    </Animated.View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  parallaxBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  parallaxContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
});

export default {
  AnimatedListItem,
  AnimatedFlatList,
  ParallaxHeader,
  FadeInView,
  ScaleOnPress,
};

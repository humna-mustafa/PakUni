import React, {memo, useRef, useEffect} from 'react';
import {Text, StyleSheet, Animated, Easing} from 'react-native';
import {MODERN_TYPOGRAPHY} from '../../constants/modern-design';
import {useTheme} from '../../contexts/ThemeContext';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  delay?: number;
}

const AnimatedSectionHeader = memo<SectionHeaderProps>(({title, subtitle, delay = 0}) => {
  const {colors} = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 400,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{translateX}],
        },
      ]}>
      <Text style={[styles.title, {color: colors.text}]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, {color: colors.textSecondary}]}>{subtitle}</Text>
      )}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 14,
    marginTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: MODERN_TYPOGRAPHY.weight.bold,
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: MODERN_TYPOGRAPHY.weight.regular,
    marginTop: 2,
    letterSpacing: 0,
  },
});

export default AnimatedSectionHeader;

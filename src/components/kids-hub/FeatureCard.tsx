/**
 * FeatureCard - Animated card for Kids Hub features
 */

import React, {useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../../constants/design';
import {ANIMATION_SCALES, SPRING_CONFIGS} from '../../constants/ui';
import {Icon} from '../icons';
import type {KidsFeature} from './data';

const {width} = Dimensions.get('window');

interface FeatureCardProps {
  feature: KidsFeature;
  index: number;
  onPress: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({feature, index, onPress}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      delay: index * 80,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(bounceAnim, {
      toValue: ANIMATION_SCALES.CHIP_PRESS,
      useNativeDriver: true,
      ...SPRING_CONFIGS.snappy,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(bounceAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...SPRING_CONFIGS.responsive,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.featureCardContainer,
        {
          transform: [{scale: Animated.multiply(scaleAnim, bounceAnim)}],
          opacity: scaleAnim,
        },
      ]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}>
        <LinearGradient
          colors={feature.gradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.featureCard}>
          <View style={styles.bubble1} />
          <View style={styles.bubble2} />
          <Icon name={feature.iconName} family="Ionicons" size={48} color="#FFFFFF" />
          <Text style={styles.featureTitle}>{feature.title}</Text>
          <Text style={styles.featureDesc}>{feature.description}</Text>
          <View style={styles.featureTagline}>
            <Text style={styles.featureTaglineText}>{feature.tagline}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  featureCardContainer: {
    width: (width - SPACING.md * 2 - SPACING.sm) / 2,
  },
  featureCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    alignItems: 'center',
    minHeight: 160,
    overflow: 'hidden',
  },
  bubble1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  bubble2: {
    position: 'absolute',
    bottom: -10,
    left: -10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  featureTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  featureTagline: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
  },
  featureTaglineText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#fff',
  },
});

export default React.memo(FeatureCard);

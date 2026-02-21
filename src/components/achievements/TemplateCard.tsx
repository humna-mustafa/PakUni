/**
 * TemplateCard - Animated card for selecting achievement template type.
 */
import React, {useRef, useEffect} from 'react';
import {Text, TouchableOpacity, Animated, Easing, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../../constants/design';
import {ANIMATION_SCALES, SPRING_CONFIGS} from '../../constants/ui';
import type {AchievementTemplate} from '../../services/achievements';

interface TemplateCardProps {
  template: AchievementTemplate;
  onPress: () => void;
  colors: any;
  index?: number;
}

const TemplateCard: React.FC<TemplateCardProps> = ({template, onPress, colors, index = 0}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = index * 100;
    Animated.parallel([
      Animated.timing(fadeAnim, {toValue: 1, duration: 400, delay, useNativeDriver: true}),
      Animated.spring(slideAnim, {toValue: 0, tension: 50, friction: 8, delay, useNativeDriver: true}),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {toValue: 1, duration: 2000, delay: index * 200, easing: Easing.inOut(Easing.ease), useNativeDriver: false}),
        Animated.timing(shimmerAnim, {toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: false}),
      ]),
    ).start();
  }, [index]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {toValue: ANIMATION_SCALES.CHIP_PRESS, useNativeDriver: true, ...SPRING_CONFIGS.snappy}).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {toValue: 1, useNativeDriver: true, ...SPRING_CONFIGS.responsive}).start();
  };

  const shimmerOpacity = shimmerAnim.interpolate({inputRange: [0, 1], outputRange: [0, 0.3]});

  return (
    <Animated.View style={{transform: [{scale: scaleAnim}, {translateX: slideAnim}], opacity: fadeAnim}}>
      <TouchableOpacity activeOpacity={1} onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}
        style={[styles.card, {backgroundColor: colors.card}]}>
        <LinearGradient colors={template.gradientColors} style={styles.gradient}>
          <Animated.View style={[styles.shimmer, {opacity: shimmerOpacity, backgroundColor: '#FFFFFF'}]} />
          <Text style={styles.emoji}>{template.icon}</Text>
        </LinearGradient>
        <Text style={[styles.title, {color: colors.text}]} numberOfLines={2}>{template.title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {width: 100, minHeight: 110, alignItems: 'center', justifyContent: 'flex-start', padding: SPACING.sm, borderRadius: RADIUS.lg},
  gradient: {width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xs, overflow: 'hidden'},
  shimmer: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0},
  emoji: {fontSize: 24},
  title: {fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weight.semibold, textAlign: 'center'},
});

export default TemplateCard;

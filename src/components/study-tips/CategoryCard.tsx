/**
 * CategoryCard - Animated study category card with bounce
 */

import React, {useRef, useEffect} from 'react';
import {StyleSheet, TouchableOpacity, Animated, Dimensions} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {View, Text} from 'react-native';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../../constants/design';
import {ANIMATION_SCALES, SPRING_CONFIGS} from '../../constants/ui';
import {Icon} from '../icons';
import type {StudyCategory} from './data';

const {width} = Dimensions.get('window');

interface Props {
  category: StudyCategory;
  index: number;
  onPress: () => void;
}

const CategoryCard: React.FC<Props> = React.memo(({category, index, onPress}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {toValue: 1, tension: 50, friction: 7, delay: index * 80, useNativeDriver: true}).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(bounceAnim, {toValue: ANIMATION_SCALES.CHIP_PRESS, useNativeDriver: true, ...SPRING_CONFIGS.snappy}).start();
  };
  const handlePressOut = () => {
    Animated.spring(bounceAnim, {toValue: 1, useNativeDriver: true, ...SPRING_CONFIGS.responsive}).start();
  };

  return (
    <Animated.View style={[styles.container, {transform: [{scale: Animated.multiply(scaleAnim, bounceAnim)}], opacity: scaleAnim}]}>
      <TouchableOpacity activeOpacity={1} onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <LinearGradient colors={category.gradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.card}>
          <View style={styles.bubble1} />
          <View style={styles.bubble2} />
          <Icon name={category.iconName} family="Ionicons" size={36} color="#FFFFFF" />
          <Text style={styles.title}>{category.title}</Text>
          <View style={styles.badge}>
            <Text style={styles.count}>{category.tips.length} tips</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {width: (width - SPACING.md * 2 - SPACING.sm) / 2},
  card: {borderRadius: RADIUS.xl, padding: SPACING.md, alignItems: 'center', minHeight: 140, overflow: 'hidden'},
  bubble1: {position: 'absolute', top: -20, right: -20, width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.2)'},
  bubble2: {position: 'absolute', bottom: -10, left: -10, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)'},
  title: {fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.bold, color: '#fff', textAlign: 'center', marginBottom: SPACING.xs},
  badge: {backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.full},
  count: {fontSize: 11, fontWeight: TYPOGRAPHY.weight.semibold, color: '#fff'},
});

export default CategoryCard;

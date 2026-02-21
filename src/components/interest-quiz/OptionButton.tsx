/**
 * OptionButton - Animated quiz option with selection pulse
 */

import React, {useRef, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Animated} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '../icons';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../../constants/design';
import type {QuizOption} from './data';

interface OptionButtonProps {
  option: QuizOption;
  isSelected: boolean;
  onPress: () => void;
  index: number;
  colors: any;
}

export const OptionButton: React.FC<OptionButtonProps> = React.memo(({
  option, isSelected, onPress, index, colors,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1, delay: index * 100, tension: 50, friction: 8, useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (isSelected) {
      Animated.sequence([
        Animated.timing(pulseAnim, {toValue: 1.05, duration: 150, useNativeDriver: true}),
        Animated.spring(pulseAnim, {toValue: 1, friction: 4, useNativeDriver: true}),
      ]).start();
    }
  }, [isSelected]);

  return (
    <Animated.View style={{transform: [{scale: Animated.multiply(scaleAnim, pulseAnim)}]}}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {isSelected ? (
          <LinearGradient colors={['#4573DF', '#3660C9']} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.optionSelected}>
            <Icon name={option.iconName} family="Ionicons" size={22} color="#FFFFFF" />
            <Text style={styles.optionTextSelected}>{option.text}</Text>
            <Icon name="checkmark-circle" family="Ionicons" size={22} color="#FFFFFF" />
          </LinearGradient>
        ) : (
          <View style={[styles.option, {backgroundColor: colors.card, borderColor: colors.border}]}>
            <Icon name={option.iconName} family="Ionicons" size={22} color={colors.primary} />
            <Text style={[styles.optionText, {color: colors.text}]}>{option.text}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  option: {flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 2},
  optionSelected: {flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderRadius: RADIUS.lg},
  optionText: {flex: 1, fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.medium},
  optionTextSelected: {flex: 1, fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.semibold, color: '#fff'},
});

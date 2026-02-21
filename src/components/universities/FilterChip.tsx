/**
 * FilterChip - Animated chip for sort/filter selection (universities variant)
 */

import React, {useRef} from 'react';
import {Text, TouchableOpacity, StyleSheet, Animated} from 'react-native';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS, ANIMATION} from '../../constants/design';
import {ANIMATION_SCALES} from '../../constants/ui';

interface Props {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  colors: any;
  variant?: 'default' | 'primary' | 'secondary';
}

const FilterChip = ({label, isSelected, onPress, colors, variant = 'default'}: Props) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: ANIMATION_SCALES.CHIP_PRESS,
      ...ANIMATION.spring.snappy,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      ...ANIMATION.spring.snappy,
      useNativeDriver: true,
    }).start();
  };

  const getColors = () => {
    if (!isSelected) {
      return {bg: colors.card, text: colors.text, border: colors.border};
    }
    switch (variant) {
      case 'primary':
        return {bg: colors.primary, text: '#FFFFFF', border: colors.primary};
      case 'secondary':
        return {bg: colors.secondary, text: '#FFFFFF', border: colors.secondary};
      default:
        return {bg: `${colors.primary}15`, text: colors.primary, border: colors.primary};
    }
  };

  const chipColors = getColors();

  return (
    <Animated.View style={{transform: [{scale: scaleAnim}]}}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${label} filter${isSelected ? ', selected' : ''}`}
        accessibilityState={{selected: isSelected}}
        style={[
          styles.chip,
          {backgroundColor: chipColors.bg, borderColor: chipColors.border},
        ]}>
        <Text
          style={[
            styles.text,
            {
              color: chipColors.text,
              fontWeight: isSelected ? TYPOGRAPHY.weight.semibold : TYPOGRAPHY.weight.medium,
            },
          ]}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
  },
  text: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
});

export default FilterChip;

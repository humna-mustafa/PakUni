/**
 * FilterChip - Animated category filter chip
 */

import React, {useRef} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Animated} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../../constants/design';
import {ANIMATION_SCALES, SPRING_CONFIGS} from '../../constants/ui';

interface Props {
  label: string;
  isActive: boolean;
  onPress: () => void;
  colors: any;
}

const FilterChip = ({label, isActive, onPress, colors}: Props) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: ANIMATION_SCALES.ICON_PRESS,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        ...SPRING_CONFIGS.snappy,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{transform: [{scale: scaleAnim}]}}>
      <TouchableOpacity onPress={handlePress}>
        {isActive ? (
          <LinearGradient
            colors={[colors.primary, colors.primaryDark || colors.primary]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.chip}>
            <Text style={styles.activeText}>{label}</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.chip, {backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1}]}>
            <Text style={[styles.text, {color: colors.textSecondary}]}>{label}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  text: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  activeText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#fff',
  },
});

export default FilterChip;

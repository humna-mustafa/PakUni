/**
 * FilterChip - Animated filter chip for scholarship type filtering
 */

import React, {useRef} from 'react';
import {View, Text, TouchableOpacity, Animated, StyleSheet} from 'react-native';
import {TYPOGRAPHY, SPACING, RADIUS} from '../../constants/design';
import {ANIMATION_SCALES} from '../../constants/ui';
import {Icon} from '../icons';
import type {FilterConfig} from '../../types/scholarships';

// Fallback LinearGradient
let LinearGradient: React.ComponentType<any>;
try {
  LinearGradient = require('react-native-linear-gradient').default;
} catch (e) {
  LinearGradient = ({children, colors, style, ...props}: any) => (
    <View style={[style, {backgroundColor: colors?.[0] || '#4573DF'}]} {...props}>
      {children}
    </View>
  );
}

interface FilterChipProps {
  filter: FilterConfig;
  isSelected: boolean;
  onPress: () => void;
  colors: any;
}

const FilterChip = ({filter, isSelected, onPress, colors}: FilterChipProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: ANIMATION_SCALES.CHIP_PRESS,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{transform: [{scale: scaleAnim}]}}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`${filter.label} filter${isSelected ? ', selected' : ''}`}
        accessibilityState={{selected: isSelected}}>
        {isSelected ? (
          <LinearGradient
            colors={filter.gradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.filterChipActive}>
            <Icon name={filter.iconName} family="Ionicons" size={16} color="#FFFFFF" />
            <Text style={styles.filterTextActive}>{filter.label}</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.filterChip, {backgroundColor: colors.card, borderColor: colors.border}]}>
            <Icon name={filter.iconName} family="Ionicons" size={16} color={colors.text} />
            <Text style={[styles.filterText, {color: colors.text}]}>{filter.label}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    marginRight: SPACING.sm,
    borderWidth: 1,
  },
  filterChipActive: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    marginRight: SPACING.sm,
  },
  filterText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  filterTextActive: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#FFFFFF',
  },
});

export default React.memo(FilterChip);

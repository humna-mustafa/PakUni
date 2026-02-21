/**
 * ChipSelector - Multi or single-select chip group
 */

import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../../constants/design';

interface ChipSelectorProps {
  options: string[];
  selected: string | string[];
  onSelect: (value: any) => void;
  colors: any;
  multiSelect?: boolean;
}

const ChipSelector = ({options, selected, onSelect, colors, multiSelect = false}: ChipSelectorProps) => {
  const handleSelect = (option: string) => {
    if (multiSelect) {
      const arr = selected as string[];
      if (arr.includes(option)) {
        onSelect(arr.filter((s: string) => s !== option));
      } else {
        onSelect([...arr, option]);
      }
    } else {
      onSelect(option);
    }
  };

  return (
    <View style={styles.chipsContainer}>
      {options.map((option: string) => {
        const isSelected = multiSelect
          ? (selected as string[]).includes(option)
          : selected === option;
        return (
          <TouchableOpacity key={option} onPress={() => handleSelect(option)}>
            {isSelected ? (
              <LinearGradient colors={['#4573DF', '#3660C9']} style={styles.chip}>
                <Text style={styles.chipTextActive}>{option}</Text>
              </LinearGradient>
            ) : (
              <View
                style={[styles.chip, {backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1}]}>
                <Text style={[styles.chipText, {color: colors.textSecondary}]}>{option}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  chipsContainer: {flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm},
  chip: {paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full},
  chipText: {fontSize: TYPOGRAPHY.sizes.sm},
  chipTextActive: {fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.semibold, color: '#fff'},
});

export default React.memo(ChipSelector);

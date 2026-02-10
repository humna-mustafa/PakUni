/**
 * PollCategoryFilter - Horizontal scrollable category chips
 */

import React from 'react';
import {View, Text, ScrollView, TouchableOpacity, StyleSheet} from 'react-native';
import {TYPOGRAPHY, SPACING, RADIUS} from '../../constants/design';
import {Icon} from '../icons';
import {POLL_CATEGORIES} from '../../services/polls';
import type {ThemeColors} from '../../contexts/ThemeContext';

interface Props {
  selected: string;
  onSelect: (categoryId: string) => void;
  colors: ThemeColors;
}

const PollCategoryFilter: React.FC<Props> = ({selected, onSelect, colors}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.container}>
    {POLL_CATEGORIES.map(cat => {
      const isActive = selected === cat.id;
      return (
        <TouchableOpacity
          key={cat.id}
          style={[
            styles.chip,
            {
              backgroundColor: isActive ? colors.primary : colors.card,
              borderColor: isActive ? colors.primary : colors.border,
            },
          ]}
          onPress={() => onSelect(cat.id)}
          activeOpacity={0.8}>
          <Icon
            name={cat.iconName}
            family="Ionicons"
            size={16}
            color={isActive ? '#FFFFFF' : colors.textSecondary}
          />
          <Text
            style={[
              styles.chipText,
              {color: isActive ? '#FFFFFF' : colors.text},
            ]}>
            {cat.name}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    marginRight: SPACING.sm,
    gap: SPACING.xs,
  },
  chipText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
});

export default React.memo(PollCategoryFilter);

/**
 * Chip Component
 * Selectable tags for filtering and categories
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {COLORS, FONTS, SPACING, BORDER_RADIUS} from '../constants/theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const SIZE_STYLES = {
  sm: {
    paddingH: SPACING.sm,
    paddingV: SPACING.xs,
    fontSize: FONTS.sizes.xs,
    iconSize: 12,
  },
  md: {
    paddingH: SPACING.md,
    paddingV: SPACING.sm,
    fontSize: FONTS.sizes.sm,
    iconSize: 14,
  },
  lg: {
    paddingH: SPACING.lg,
    paddingV: SPACING.sm + 2,
    fontSize: FONTS.sizes.md,
    iconSize: 16,
  },
};

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  icon,
  disabled = false,
  size = 'md',
  style,
  textStyle,
}) => {
  const sizeStyle = SIZE_STYLES[size];

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          paddingHorizontal: sizeStyle.paddingH,
          paddingVertical: sizeStyle.paddingV,
        },
        selected && styles.selected,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}>
      {icon && (
        <Text style={[styles.icon, {fontSize: sizeStyle.iconSize}]}>{icon}</Text>
      )}
      <Text
        style={[
          styles.label,
          {fontSize: sizeStyle.fontSize},
          selected && styles.labelSelected,
          textStyle,
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// Chip Group for multiple chips
interface ChipGroupProps {
  chips: {label: string; value: string; icon?: string}[];
  selectedValue?: string;
  onSelect?: (value: string) => void;
  style?: ViewStyle;
}

export const ChipGroup: React.FC<ChipGroupProps> = ({
  chips,
  selectedValue,
  onSelect,
  style,
}) => {
  return (
    <TouchableOpacity style={[styles.group, style]} activeOpacity={1}>
      {chips.map(chip => (
        <Chip
          key={chip.value}
          label={chip.label}
          icon={chip.icon}
          selected={selectedValue === chip.value}
          onPress={() => onSelect?.(chip.value)}
          style={styles.groupChip}
        />
      ))}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    marginRight: SPACING.xs,
  },
  label: {
    color: COLORS.text,
    fontWeight: '500',
  },
  labelSelected: {
    color: COLORS.white,
  },
  group: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  groupChip: {
    marginBottom: SPACING.xs,
  },
});

export default Chip;

/**
 * UniversitiesFilters - Sort, province dropdown, type filter
 */

import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../../constants/design';
import {Icon} from '../icons';
import FilterChip from './FilterChip';
import SearchableDropdown, {PROVINCE_OPTIONS} from '../SearchableDropdown';
import {SORT_OPTIONS} from '../../hooks/useUniversitiesScreen';

interface Props {
  colors: any;
  sortBy: string;
  setSortBy: (v: string) => void;
  selectedProvince: string;
  setSelectedProvince: (v: string) => void;
  selectedType: string;
  setSelectedType: (v: string) => void;
}

const TYPE_FILTERS = [
  {key: 'all', label: 'All', icon: 'school-outline'},
  {key: 'public', label: 'Public', icon: 'business-outline'},
  {key: 'private', label: 'Private', icon: 'briefcase-outline'},
] as const;

const UniversitiesFilters = ({
  colors,
  sortBy,
  setSortBy,
  selectedProvince,
  setSelectedProvince,
  selectedType,
  setSelectedType,
}: Props) => (
  <View style={styles.container}>
    {/* Sort Options */}
    <View style={styles.sortSection}>
      <Text style={[styles.sortLabel, {color: colors.textSecondary}]}>Sort by</Text>
      <View style={styles.sortOptions}>
        {SORT_OPTIONS.map(opt => (
          <FilterChip
            key={opt.value}
            label={opt.label}
            isSelected={sortBy === opt.value}
            onPress={() => setSortBy(opt.value)}
            colors={colors}
          />
        ))}
      </View>
    </View>

    {/* Province Filter */}
    <View style={styles.filterRow}>
      <View style={styles.filterDropdownContainer}>
        <SearchableDropdown
          options={PROVINCE_OPTIONS}
          value={selectedProvince}
          onSelect={(_option, value) => setSelectedProvince(value || 'all')}
          placeholder="Select Province"
          searchPlaceholder="Search provinces..."
          emptyMessage="No provinces found"
        />
      </View>
    </View>

    {/* Type Filter */}
    <View style={styles.typeFilter}>
      {TYPE_FILTERS.map(({key, label, icon}) => {
        const isActive = selectedType === key;
        const btnColor = isActive
          ? key === 'public'
            ? colors.success
            : key === 'private'
            ? colors.primary
            : colors.secondary
          : colors.card;
        const borderColor = isActive ? btnColor : colors.border;

        return (
          <TouchableOpacity
            key={key}
            style={[styles.typeBtn, {backgroundColor: btnColor, borderColor}]}
            onPress={() => setSelectedType(key)}
            accessibilityRole="button"
            accessibilityLabel={`Filter by ${key === 'all' ? 'all universities' : key} universities${isActive ? ', currently selected' : ''}`}>
            <View style={styles.typeBtnRow}>
              <Icon
                name={icon}
                family="Ionicons"
                size={14}
                color={isActive ? '#FFFFFF' : colors.text}
              />
              <Text
                style={[
                  styles.typeBtnText,
                  {
                    color: isActive ? '#FFFFFF' : colors.text,
                    fontWeight: isActive ? TYPOGRAPHY.weight.bold : TYPOGRAPHY.weight.medium,
                  },
                ]}>
                {label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingBottom: SPACING.md,
  },
  sortSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  sortLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sortOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  filterRow: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  filterDropdownContainer: {
    marginBottom: SPACING.sm,
  },
  typeFilter: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
  },
  typeBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typeBtnText: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
});

export default UniversitiesFilters;

/**
 * ScholarshipsFilters - Search bar, university dropdown, type chips, and disclaimer
 */

import React from 'react';
import {View, Text, ScrollView, TouchableOpacity, StyleSheet} from 'react-native';
import {TYPOGRAPHY, SPACING, RADIUS} from '../../constants/design';
import {Icon} from '../icons';
import {PremiumSearchBar} from '../PremiumSearchBar';
import SearchableDropdown from '../SearchableDropdown';
import FilterChip from './FilterChip';
import {typeFilters} from '../../constants/scholarshipFilters';
import type {FilterType} from '../../types/scholarships';

interface ScholarshipsFiltersProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  selectedType: FilterType;
  onTypeSelect: (type: FilterType) => void;
  selectedUniversity: string | null;
  onUniversitySelect: (value: string | null) => void;
  universityOptions: Array<{label: string; value: string}>;
  showFilters: boolean;
  colors: any;
}

const ScholarshipsFilters = ({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeSelect,
  selectedUniversity,
  onUniversitySelect,
  universityOptions,
  showFilters,
  colors,
}: ScholarshipsFiltersProps) => {
  return (
    <>
      {/* Search */}
      <View style={styles.searchContainer}>
        <PremiumSearchBar
          value={searchQuery}
          onChangeText={onSearchChange}
          onClear={() => onSearchChange('')}
          placeholder="Search scholarships..."
          variant="default"
          size="md"
        />
      </View>

      {/* Collapsible Filters */}
      {showFilters && (
        <View style={styles.filterContainer}>
          <View style={styles.universityDropdownWrapper}>
            <SearchableDropdown
              options={universityOptions}
              onSelect={(_option, value) => onUniversitySelect(value)}
              placeholder="Filter by University"
              label="Selected University"
              emptyMessage="All Universities"
            />
          </View>

          {/* Active university filter chip */}
          {selectedUniversity && (
            <View style={styles.activeFiltersRow}>
              <View style={[styles.activeFilterChip, {backgroundColor: colors.primary + '20'}]}>
                <Icon name="school" family="Ionicons" size={14} color={colors.primary} />
                <Text style={[styles.activeFilterText, {color: colors.primary}]} numberOfLines={1}>
                  {selectedUniversity}
                </Text>
                <TouchableOpacity
                  onPress={() => onUniversitySelect(null)}
                  hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                  <Icon name="close-circle" family="Ionicons" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}>
            {typeFilters.map(filter => (
              <FilterChip
                key={filter.value}
                filter={filter}
                isSelected={selectedType === filter.value}
                onPress={() => onTypeSelect(filter.value)}
                colors={colors}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Application Process Disclaimer */}
      <View style={[styles.disclaimerBanner, {backgroundColor: colors.warningLight, borderColor: colors.warning + '40'}]}>
        <Icon name="information-circle-outline" family="Ionicons" size={18} color={colors.warning} />
        <Text style={[styles.disclaimerText, {color: colors.text}]}>
          Note: Application process varies by university. Many universities process scholarship applications offline
          through their focal person. Please confirm with your university's financial aid office.
        </Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  filterContainer: {
    marginBottom: SPACING.md,
  },
  universityDropdownWrapper: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  filterList: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  activeFiltersRow: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    gap: 6,
    alignSelf: 'flex-start',
  },
  activeFilterText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    maxWidth: 200,
  },
  disclaimerBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: 8,
  },
  disclaimerText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.xs,
    lineHeight: 16,
  },
});

export default React.memo(ScholarshipsFilters);

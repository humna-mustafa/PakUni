/**
 * PremiumUniversitiesScreen - Thin composition layer
 * All logic in useUniversitiesScreen hook, UI in sub-components.
 */

import React, {useCallback} from 'react';
import {View, Text, StyleSheet, StatusBar, TouchableOpacity, RefreshControl} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SPACING, TYPOGRAPHY, RADIUS} from '../constants/design';
import {Icon} from '../components/icons';
import {PremiumSearchBar} from '../components/PremiumSearchBar';
import FloatingToolsButton from '../components/FloatingToolsButton';
import {UniversitiesListSkeleton} from '../components/ListSkeletons';
import {useUniversitiesScreen} from '../hooks/useUniversitiesScreen';
import type {UniversityItem} from '../hooks/useUniversitiesScreen';
import {UniversityCard, UniversitiesHeader, UniversitiesFilters} from '../components/universities';

// ── Component ──────────────────────────────────────────────────────────

const PremiumUniversitiesScreen = () => {
  const {
    colors,
    isDark,
    user,
    loading,
    searchQuery,
    handleSearchChange,
    handleSearchClear,
    selectedProvince,
    setSelectedProvince,
    selectedType,
    setSelectedType,
    sortBy,
    setSortBy,
    showFilters,
    setShowFilters,
    showForYou,
    setShowForYou,
    userFieldLabel,
    refreshing,
    handleRefresh,
    filteredUniversities,
    handleUniversityPress,
    handleToggleFavorite,
    isFavorite,
    navigateToProfile,
    getUserInitials,
    resetFilters,
    onViewableItemsChanged,
    viewabilityConfig,
  } = useUniversitiesScreen();

  const renderUniversityCard = useCallback(
    ({item, index}: {item: UniversityItem; index: number}) => (
      <UniversityCard
        item={item as any}
        onPress={() => handleUniversityPress(item)}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={isFavorite(item.short_name, 'university')}
        colors={colors}
        isDark={isDark}
        index={index}
      />
    ),
    [handleUniversityPress, handleToggleFavorite, isFavorite, colors, isDark],
  );

  const renderHeader = useCallback(
    () =>
      showFilters ? (
        <UniversitiesFilters
          colors={colors}
          sortBy={sortBy}
          setSortBy={setSortBy}
          selectedProvince={selectedProvince}
          setSelectedProvince={setSelectedProvince}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
        />
      ) : null,
    [colors, showFilters, sortBy, selectedProvince, selectedType, setSortBy, setSelectedProvince, setSelectedType],
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <UniversitiesHeader
          colors={colors}
          filteredCount={filteredUniversities.length}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          user={user}
          getUserInitials={getUserInitials}
          onProfilePress={navigateToProfile}
        />

        <View style={styles.searchContainer}>
          <PremiumSearchBar
            value={searchQuery}
            onChangeText={handleSearchChange}
            onClear={handleSearchClear}
            placeholder="Search universities, cities..."
            variant="default"
            size="md"
          />
        </View>

        {/* For You personalisation chip – only shown for users with a target field */}
        {!!user?.targetField && (
          <View style={styles.forYouRow}>
            <TouchableOpacity
              style={[
                styles.forYouChip,
                showForYou
                  ? {backgroundColor: colors.primary}
                  : {
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.border,
                    },
              ]}
              onPress={() => setShowForYou(!showForYou)}
              activeOpacity={0.7}>
              <Icon
                name={showForYou ? 'sparkles' : 'sparkles-outline'}
                size={14}
                color={showForYou ? '#fff' : colors.primary}
              />
              <Text
                style={[
                  styles.forYouChipText,
                  {color: showForYou ? '#fff' : colors.primary},
                ]}>
                {showForYou ? `For You: ${userFieldLabel}` : 'For You'}
              </Text>
            </TouchableOpacity>
            {showForYou && (
              <Text style={[styles.forYouCount, {color: colors.textSecondary}]}>
                {filteredUniversities.length} universities
              </Text>
            )}
          </View>
        )}

        {loading ? (
          <UniversitiesListSkeleton />
        ) : (
          <FlashList
            data={filteredUniversities}
            keyExtractor={item => item.short_name}
            renderItem={renderUniversityCard}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="always"
            removeClippedSubviews={false}
            estimatedItemSize={120}
            onViewableItemsChanged={onViewableItemsChanged.current}
            viewabilityConfig={viewabilityConfig.current}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
                progressBackgroundColor={colors.card}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={[styles.emptyIconBg, {backgroundColor: `${colors.primary}10`}]}>
                  <Icon name="school-outline" family="Ionicons" size={48} color={colors.primary} />
                </View>
                <Text style={[styles.emptyTitle, {color: colors.text}]}>No universities found</Text>
                <Text style={[styles.emptySubtitle, {color: colors.textSecondary}]}>
                  Try adjusting your filters or search query
                </Text>
                <TouchableOpacity
                  style={[styles.resetBtn, {backgroundColor: colors.primary}]}
                  onPress={resetFilters}
                  accessibilityRole="button"
                  accessibilityLabel="Reset all filters to show all universities">
                  <Text style={styles.resetBtnText}>Reset Filters</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </SafeAreaView>

      <FloatingToolsButton bottomOffset={100} />
    </View>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  forYouRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  forYouChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
  },
  forYouChipText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  forYouCount: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 120,
  },
  emptyContainer: {
    padding: SPACING.xxxl,
    alignItems: 'center',
  },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  resetBtn: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.full,
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
});

export default PremiumUniversitiesScreen;

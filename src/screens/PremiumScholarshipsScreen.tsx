/**
 * PremiumScholarshipsScreen - Thin composition layer
 * All logic in useScholarshipsScreen hook, UI in scholarships/ components
 */

import React from 'react';
import {View, StyleSheet, FlatList, StatusBar, RefreshControl, Platform} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SPACING} from '../constants/design';
import {useScholarshipsScreen} from '../hooks/useScholarshipsScreen';
import {
  ScholarshipCard,
  ScholarshipDetailModal,
  ScholarshipsHeader,
  ScholarshipsFilters,
  EmptyState,
} from '../components/scholarships';
import FloatingToolsButton from '../components/FloatingToolsButton';

const PremiumScholarshipsScreen = () => {
  const {
    colors,
    isDark,
    user,
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    selectedUniversity,
    setSelectedUniversity,
    showFilters,
    setShowFilters,
    showDetail,
    setShowDetail,
    selectedScholarship,
    setSelectedScholarship,
    refreshing,
    filteredScholarships,
    universityOptions,
    isFav,
    handleToggleFavorite,
    handleCardToggleFavorite,
    handleRefresh,
    openLink,
    getUserInitials,
    navigateToProfile,
    isFavorite,
    analytics,
  } = useScholarshipsScreen();

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScholarshipsHeader
          colors={colors}
          filteredCount={filteredScholarships.length}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          user={user}
          getUserInitials={getUserInitials}
          onProfilePress={navigateToProfile}
        />

        <ScholarshipsFilters
          colors={colors}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showFilters={showFilters}
          selectedType={selectedType}
          onTypeSelect={setSelectedType}
          selectedUniversity={selectedUniversity}
          onUniversitySelect={setSelectedUniversity}
          universityOptions={universityOptions}
        />

        <FlatList
          data={filteredScholarships}
          keyExtractor={item => item.id}
          renderItem={({item, index}) => (
            <ScholarshipCard
              item={item}
              colors={colors}
              isDark={isDark}
              index={index}
              onToggleFavorite={handleCardToggleFavorite}
              isFavorited={isFavorite(item.id, 'scholarship')}
              onPress={() => {
                analytics.trackScholarshipView(item.name, item.name);
                setSelectedScholarship(item);
                setShowDetail(true);
              }}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
              progressBackgroundColor={colors.card}
            />
          }
          ListEmptyComponent={<EmptyState colors={colors} />}
        />

        <ScholarshipDetailModal
          visible={showDetail}
          scholarship={selectedScholarship}
          colors={colors}
          isFav={isFav}
          onClose={() => setShowDetail(false)}
          onToggleFavorite={handleToggleFavorite}
          onOpenLink={openLink}
        />
      </SafeAreaView>

      <FloatingToolsButton bottomOffset={100} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  listContent: {
    padding: SPACING.md,
    paddingTop: 0,
    paddingBottom: 120,
  },
});

export default PremiumScholarshipsScreen;



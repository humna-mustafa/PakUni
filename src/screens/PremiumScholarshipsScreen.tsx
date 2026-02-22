/**
 * PremiumScholarshipsScreen - Thin composition layer
 * All logic in useScholarshipsScreen hook, UI in scholarships/ components
 */

import React from 'react';
import {View, Text, StyleSheet, FlatList, StatusBar, RefreshControl, Platform, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SPACING} from '../constants/design';
import {useScholarshipsScreen} from '../hooks/useScholarshipsScreen';
import {Icon} from '../components/icons';
import {
  ScholarshipCard,
  ScholarshipDetailModal,
  ScholarshipsHeader,
  ScholarshipsFilters,
} from '../components/scholarships';
import {EmptyState} from '../components/EmptyState';
import FloatingToolsButton from '../components/FloatingToolsButton';
import {useNavigation} from '@react-navigation/native';

const PremiumScholarshipsScreen = () => {
  const navigation = useNavigation<any>();
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
    showForYou,
    setShowForYou,
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
          avatarUrl={user?.avatarUrl}
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

        {/* For You Toggle */}
        {user && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setShowForYou(!showForYou)}
            style={[styles.forYouBanner, {
              backgroundColor: showForYou ? (isDark ? '#1C3A2E' : '#DCFCE7') : colors.card,
              borderColor: showForYou ? '#16A34A' : colors.border,
            }]}>
            <Icon name={showForYou ? 'sparkles' : 'sparkles-outline'} family="Ionicons" size={16} color={showForYou ? '#16A34A' : colors.textSecondary} />
            <Text style={[styles.forYouText, {color: showForYou ? '#15803D' : colors.text}]}>
              {showForYou ? 'Showing scholarships for you' : 'Show scholarships for you'}
            </Text>
            <Icon name={showForYou ? 'checkmark-circle' : 'chevron-forward'} family="Ionicons" size={16} color={showForYou ? '#16A34A' : colors.textSecondary} />
          </TouchableOpacity>
        )}

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
          ListEmptyComponent={
            <EmptyState
              title="No Scholarships Found"
              subtitle="Try adjusting your filters or search query"
              iconName="school-outline"
              variant="search"
            />
          }
        />

        <ScholarshipDetailModal
          visible={showDetail}
          scholarship={selectedScholarship}
          colors={colors}
          isFav={isFav}
          onClose={() => setShowDetail(false)}
          onToggleFavorite={handleToggleFavorite}
          openLink={openLink}
          onFixData={(scholarshipId, scholarshipName) =>
            navigation.navigate('DataCorrection', {
              entityType: 'scholarship',
              entityId: scholarshipId,
              entityName: scholarshipName,
            })
          }
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
  forYouBanner: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm, padding: SPACING.sm + 2, borderRadius: 12, borderWidth: 1, gap: SPACING.sm,
  },
  forYouText: {
    flex: 1, fontSize: 13, fontWeight: '600',
  },
});

export default PremiumScholarshipsScreen;



/**
 * PremiumEntryTestsScreen - Thin composition layer
 * All logic in useEntryTestsScreen hook, UI in entryTests/ components
 */

import React, {useCallback} from 'react';
import {View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, Platform, RefreshControl} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SPACING, TYPOGRAPHY} from '../constants/design';
import {PremiumSearchBar} from '../components/PremiumSearchBar';
import {Icon} from '../components/icons';
import {useEntryTestsScreen} from '../hooks/useEntryTestsScreen';
import {
  TestCard,
  TestDetailModal,
  DatePickerModal,
  EntryTestsHeader,
  FilterChip,
  CATEGORIES,
} from '../components/entryTests';
import {EmptyState} from '../components/EmptyState';
import {useNavigation} from '@react-navigation/native';
import type {EntryTestData} from '../data';

const PremiumEntryTestsScreen = () => {
  const navigation = useNavigation<any>();
  const {
    colors,
    isDark,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    filteredTests,
    selectedTest,
    modalVisible,
    modalAnim,
    openModal,
    closeModal,
    openRegistrationUrl,
    customDates,
    dateModalVisible,
    editingTestId,
    dateInput,
    setDateInput,
    setDateModalVisible,
    openDateModal,
    handleSaveDate,
    handleClearDate,
    headerAnim,
  } = useEntryTestsScreen();

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}
      edges={['top']}>
      <EntryTestsHeader headerAnim={headerAnim} isDark={isDark} />

      <View style={styles.searchContainer}>
        <PremiumSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Search tests (MDCAT, ECAT, NET, NAT...)"
          variant="default"
          size="md"
        />
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}>
          {CATEGORIES.map(category => (
            <FilterChip
              key={category}
              label={category}
              isActive={activeFilter === category}
              onPress={() => setActiveFilter(category)}
              colors={colors}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.resultsBar}>
        <Text style={[styles.resultsText, {color: colors.textSecondary}]}>
          {filteredTests.length} {filteredTests.length === 1 ? 'test' : 'tests'} found
        </Text>
        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('Deadlines' as never)}
          style={[styles.deadlinesLink, {backgroundColor: colors.card, borderColor: '#EF444440'}]}>
          <Icon name="calendar-outline" family="Ionicons" size={14} color="#EF4444" />
          <Text style={[styles.deadlinesLinkText, {color: '#EF4444'}]}>View Deadlines</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredTests}
        keyExtractor={item => item.id}
        renderItem={({item, index}) => (
          <TestCard
            key={item.id}
            test={item}
            onPress={() => openModal(item)}
            index={index}
            colors={colors}
          />
        )}
        contentContainerStyle={styles.testsContainer}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <EmptyState
            title="No Entry Tests Found"
            subtitle="Try adjusting your search or filters"
            iconName="clipboard-outline"
            variant="search"
          />
        }
      />

      <TestDetailModal
        visible={modalVisible}
        test={selectedTest}
        modalAnim={modalAnim}
        colors={colors}
        isDark={isDark}
        customDate={selectedTest ? customDates[selectedTest.id] : undefined}
        onClose={closeModal}
        onEditDate={openDateModal}
        onRegister={openRegistrationUrl}
        onFixData={(testId, testName) =>
          navigation.navigate('DataCorrection', {
            entityType: 'entry_test',
            entityId: testId,
            entityName: testName,
          })
        }
      />

      <DatePickerModal
        visible={dateModalVisible}
        colors={colors}
        dateInput={dateInput}
        onChangeText={setDateInput}
        hasCustomDate={!!customDates[editingTestId || '']}
        onSave={handleSaveDate}
        onClear={handleClearDate}
        onClose={() => setDateModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  filtersContainer: {
    marginTop: SPACING.xs,
    zIndex: 10,
  },
  filtersContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    flexDirection: 'row',
  },
  resultsBar: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultsText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  deadlinesLink: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: SPACING.sm, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1,
  },
  deadlinesLinkText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  testsContainer: {
    padding: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: 120,
  },
});

export default PremiumEntryTestsScreen;

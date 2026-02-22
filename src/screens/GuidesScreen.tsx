/**
 * GuidesScreen - Comprehensive Guides Hub (Thin Composition Layer)
 * Categories: Admission, Study Tips, Career, Test Prep, University Life, etc.
 * All guides stored locally - no Supabase dependency
 *
 * Decomposed into:
 *   src/types/guides.ts - interfaces
 *   src/data/guidesData.ts - static data
 *   src/hooks/useGuides.ts - state & filtering
 *   src/components/guides/ - sub-components
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Animated,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {Icon} from '../components/icons';
import {useTheme} from '../contexts/ThemeContext';
import {TYPOGRAPHY, SPACING} from '../constants/design';
import {PremiumSearchBar} from '../components/PremiumSearchBar';

import {useGuides} from '../hooks/useGuides';
import {
  CategoryCard,
  GuideListItem,
  GuideDetail,
  GuidesHeader,
  SuggestCard,
  CategoryBackHeader,
} from '../components/guides';
import {EmptyState} from '../components/EmptyState';

const GuidesScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors, isDark} = useTheme();
  const {
    selectedCategory,
    selectedGuide,
    searchQuery,
    filteredGuides,
    selectedCategoryData,
    categories,
    setSelectedCategory,
    setSelectedGuide,
    setSearchQuery,
    clearSearch,
    clearCategory,
    clearGuide,
    headerFadeAnim,
    headerSlideAnim,
    floatTranslateY,
  } = useGuides();

  // If a guide is selected, show detail view
  if (selectedGuide) {
    return (
      <GuideDetail
        guide={selectedGuide}
        onClose={clearGuide}
        colors={colors}
      />
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Decorative floating circles */}
      <Animated.View
        style={[
          styles.floatingCircle1,
          {
            backgroundColor: colors.primary + '10',
            transform: [{translateY: floatTranslateY}],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.floatingCircle2,
          {
            backgroundColor: colors.secondary + '08',
            transform: [
              {translateY: Animated.multiply(floatTranslateY, -1)},
            ],
          },
        ]}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Animated Header */}
        <GuidesHeader
          colors={colors}
          onBack={() => navigation.goBack()}
          headerFadeAnim={headerFadeAnim}
          headerSlideAnim={headerSlideAnim}
          floatTranslateY={floatTranslateY}
        />

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <PremiumSearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={clearSearch}
            placeholder="Search guides..."
            variant="default"
            size="md"
          />
        </View>

        <FlatList
          data={filteredGuides}
          keyExtractor={item => item.id}
          renderItem={({item, index}) => (
            <View style={styles.section}>
              <GuideListItem
                guide={item}
                onPress={() => setSelectedGuide(item)}
                colors={colors}
                index={index}
              />
            </View>
          )}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={7}
          contentContainerStyle={{paddingBottom: 120}}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <>
              {/* Categories Section - Hidden when searching or category is selected */}
              {!selectedCategory && !searchQuery && (
                <View style={styles.section}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 12,
                    }}>
                    <Icon
                      name="library-outline"
                      size={20}
                      color={colors.primary}
                    />
                    <Text
                      style={[
                        styles.sectionTitle,
                        {color: colors.text, marginLeft: 8},
                      ]}>
                      Categories
                    </Text>
                  </View>
                  <View style={styles.categoriesGrid}>
                    {categories.map((category, index) => (
                      <CategoryCard
                        key={category.id}
                        category={category}
                        onPress={() => setSelectedCategory(category.id)}
                        colors={colors}
                        index={index}
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* Selected Category Header */}
              {selectedCategory && selectedCategoryData && (
                <CategoryBackHeader
                  colors={colors}
                  categoryTitle={selectedCategoryData.title}
                  onBack={clearCategory}
                />
              )}

              {/* Section Title */}
              {!selectedCategory && filteredGuides.length > 0 && (
                <View style={[styles.section, {marginBottom: 0}]}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 12,
                    }}>
                    <Icon
                      name="book-outline"
                      size={20}
                      color={colors.primary}
                    />
                    <Text
                      style={[
                        styles.sectionTitle,
                        {color: colors.text, marginLeft: 8},
                      ]}>
                      {searchQuery ? 'Search Results' : 'Popular Guides'}
                    </Text>
                  </View>
                </View>
              )}
            </>
          }
          ListEmptyComponent={
            <View style={styles.section}>
              <EmptyState
                title="No guides found"
                variant="search"
              />
            </View>
          }
          ListFooterComponent={
            <SuggestCard colors={colors} floatTranslateY={floatTranslateY} />
          }
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
  },
  floatingCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -50,
    right: -50,
  },
  floatingCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    bottom: 100,
    left: -50,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: SPACING.md,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

export default GuidesScreen;



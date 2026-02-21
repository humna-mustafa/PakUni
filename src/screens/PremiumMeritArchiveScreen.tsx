/**
 * PremiumMeritArchiveScreen - Thin composition layer
 * Logic in useMeritArchiveScreen, UI in merit-archive/ sub-components.
 */

import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, RefreshControl} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {TYPOGRAPHY, SPACING, RADIUS} from '../constants/design';
import {Icon} from '../components/icons';
import {PremiumSearchBar} from '../components/PremiumSearchBar';
import {DisclaimerBanner, InsightCard, UniversityCard} from '../components/merit-archive';
import {useMeritArchiveScreen} from '../hooks/useMeritArchiveScreen';
import {AVAILABLE_YEARS, MERIT_CATEGORIES} from '../services/meritLists';

const PremiumMeritArchiveScreen = () => {
  const {
    navigation, colors, isDark,
    selectedYear, setSelectedYear, selectedCategory, setSelectedCategory,
    searchQuery, setSearchQuery,
    refreshing, headerAnim, handleRefresh,
    meritTree, insights, uniqueUniversities, meritRecords,
  } = useMeritArchiveScreen();

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <Animated.View
          style={[styles.headerContainer, {
            opacity: headerAnim,
            transform: [{translateY: headerAnim.interpolate({inputRange: [0, 1], outputRange: [-20, 0]})}],
          }]}>
          <LinearGradient
            colors={isDark ? ['#059669', '#047857', '#065F46'] : ['#10B981', '#059669', '#047857']}
            start={{x: 0, y: 0}} end={{x: 1, y: 1}}
            style={styles.header}>
            <View style={styles.headerDecoCircle1} />
            <View style={styles.headerDecoCircle2} />
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" family="Ionicons" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <View style={styles.headerIconCircle}>
                <Icon name="archive-outline" family="Ionicons" size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.headerTitle}>Merit Archive</Text>
              <Text style={styles.headerSubtitle}>
                {uniqueUniversities} universities {'\u00B7'} {meritRecords.length} records
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Search */}
        <View style={styles.searchWrapper}>
          <PremiumSearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder="Search university, program, city..."
            variant="default"
            size="md"
          />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#059669']} tintColor="#059669" />
          }>
          {/* Year Selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.yearContainer}>
            <TouchableOpacity
              style={[styles.yearChip, {
                backgroundColor: selectedYear === null ? colors.primary : colors.card,
                borderColor: selectedYear === null ? colors.primary : colors.border,
              }]}
              onPress={() => setSelectedYear(null)}
              activeOpacity={0.8}>
              <Text style={[styles.yearText, {color: selectedYear === null ? '#FFFFFF' : colors.text}]}>All Years</Text>
            </TouchableOpacity>
            {AVAILABLE_YEARS.map(year => (
              <TouchableOpacity
                key={year}
                style={[styles.yearChip, {
                  backgroundColor: selectedYear === year ? colors.primary : colors.card,
                  borderColor: selectedYear === year ? colors.primary : colors.border,
                }]}
                onPress={() => setSelectedYear(year)}
                activeOpacity={0.8}>
                <Text style={[styles.yearText, {color: selectedYear === year ? '#FFFFFF' : colors.text}]}>{year}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Category Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContainer}>
            {MERIT_CATEGORIES.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryChip, {
                  backgroundColor: selectedCategory === category.id ? `${colors.primary}15` : 'transparent',
                  borderColor: selectedCategory === category.id ? colors.primary : colors.border,
                }]}
                onPress={() => setSelectedCategory(category.id)}
                activeOpacity={0.8}>
                <Icon
                  name={category.iconName}
                  family="Ionicons"
                  size={14}
                  color={selectedCategory === category.id ? colors.primary : colors.textSecondary}
                />
                <Text style={[styles.categoryText, {
                  color: selectedCategory === category.id ? colors.primary : colors.text,
                }]}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Insights */}
          {insights && (
            <View style={styles.insightsContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <InsightCard title="Average Merit" value={`${insights.avgMerit.toFixed(1)}%`}
                  subtitle={selectedYear ? `${selectedYear} session` : 'All years'}
                  iconName="analytics-outline" color={colors.primary} colors={colors} />
                <InsightCard title="Highest Merit" value={`${insights.highestMerit.toFixed(1)}%`}
                  subtitle={insights.highestProgram?.universityShortName || ''}
                  iconName="arrow-up-circle-outline" color="#EF4444" colors={colors} />
                <InsightCard title="Lowest Merit" value={`${insights.lowestMerit.toFixed(1)}%`}
                  subtitle={insights.lowestProgram?.universityShortName || ''}
                  iconName="arrow-down-circle-outline" color="#10B981" colors={colors} />
                <InsightCard title="Programs" value={`${insights.totalPrograms}`}
                  subtitle="in database" iconName="school-outline" color="#F59E0B" colors={colors} />
              </ScrollView>
            </View>
          )}

          {/* Disclaimer */}
          <DisclaimerBanner colors={colors} isDark={isDark} />

          {/* Results count */}
          <View style={styles.resultsCount}>
            <Text style={[styles.resultsText, {color: colors.textSecondary}]}>
              {meritTree.length} {meritTree.length === 1 ? 'university' : 'universities'}
              {searchQuery ? ` matching "${searchQuery}"` : ''}
              {selectedYear ? ` ${'\u00B7'} ${selectedYear}` : ` ${'\u00B7'} All years`}
            </Text>
          </View>

          {/* University Tree */}
          {meritTree.length > 0 ? (
            meritTree.map((university, index) => (
              <UniversityCard key={university.universityId} university={university}
                colors={colors} isDark={isDark} index={index} />
            ))
          ) : (
            <View style={[styles.emptyState, {backgroundColor: colors.card}]}>
              <Icon name="search-outline" family="Ionicons" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, {color: colors.text}]}>No Records Found</Text>
              <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
                {searchQuery ? 'Try a different search term or adjust filters' : 'No merit data available for the selected filters'}
              </Text>
            </View>
          )}

          <View style={{height: 100}} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  safeArea: {flex: 1},
  scrollContent: {paddingBottom: SPACING.xl},
  headerContainer: {},
  header: {
    paddingTop: SPACING.xl, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: RADIUS.xxl, borderBottomRightRadius: RADIUS.xxl, overflow: 'hidden',
  },
  headerDecoCircle1: {
    position: 'absolute', top: -30, right: -30, width: 100, height: 100,
    borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerDecoCircle2: {
    position: 'absolute', bottom: 20, left: -20, width: 60, height: 60,
    borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.08)',
  },
  backBtn: {
    position: 'absolute', top: SPACING.lg, left: SPACING.lg, width: 40, height: 40,
    borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center', zIndex: 10,
  },
  headerContent: {alignItems: 'center', paddingTop: SPACING.xl},
  headerIconCircle: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md,
  },
  headerTitle: {fontSize: TYPOGRAPHY.sizes.xxl, fontWeight: TYPOGRAPHY.weight.bold as any, color: '#FFFFFF', marginBottom: 4},
  headerSubtitle: {fontSize: TYPOGRAPHY.sizes.sm, color: 'rgba(255,255,255,0.9)'},
  searchWrapper: {paddingHorizontal: SPACING.lg, marginTop: -20, marginBottom: SPACING.md},
  yearContainer: {paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, gap: SPACING.sm},
  yearChip: {paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, borderWidth: 1, marginRight: SPACING.sm},
  yearText: {fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.semibold as any},
  categoryContainer: {paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md, gap: SPACING.sm},
  categoryChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full, borderWidth: 1, marginRight: SPACING.sm, gap: SPACING.xs,
  },
  categoryText: {fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weight.semibold as any},
  insightsContainer: {paddingLeft: SPACING.lg, marginBottom: SPACING.md},
  resultsCount: {paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm},
  resultsText: {fontSize: TYPOGRAPHY.sizes.xs},
  emptyState: {
    alignItems: 'center', marginHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl * 2, paddingHorizontal: SPACING.xl, borderRadius: RADIUS.lg,
  },
  emptyTitle: {fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weight.bold as any, marginTop: SPACING.md, marginBottom: SPACING.xs},
  emptyText: {fontSize: TYPOGRAPHY.sizes.sm, textAlign: 'center'},
});

export default PremiumMeritArchiveScreen;

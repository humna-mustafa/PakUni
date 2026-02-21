/**
 * PremiumDeadlinesScreen - Admission Deadline Tracker
 * Thin composition using DeadlineCard + useDeadlinesScreen
 */

import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, StatusBar} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {TYPOGRAPHY, SPACING, RADIUS} from '../constants/design';
import {Icon} from '../components/icons';
import {DeadlineCard} from '../components/deadlines';
import {useDeadlinesScreen} from '../hooks/useDeadlinesScreen';
import {PROGRAM_CATEGORIES} from '../data/deadlines';

const PremiumDeadlinesScreen = () => {
  const {
    colors, isDark, navigation,
    selectedCategory, setSelectedCategory,
    followedUniversities, showFollowedOnly, setShowFollowedOnly,
    headerAnim, filteredDeadlines, stats,
    handleFollowToggle, handleApply,
    getRelatedEntryTests, handleEntryTestPress,
    isPersonalized, showPersonalized, setShowPersonalized, userFieldLabel, userName,
  } = useDeadlinesScreen();

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <Animated.View style={[styles.headerContainer, {opacity: headerAnim, transform: [{translateY: headerAnim.interpolate({inputRange: [0, 1], outputRange: [-20, 0]})}]}]}>
          <LinearGradient
            colors={isDark ? ['#DC2626', '#B91C1C', '#991B1B'] : ['#EF4444', '#DC2626', '#B91C1C']}
            start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.header}>
            <View style={styles.headerDecoCircle1} />
            <View style={styles.headerDecoCircle2} />
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" family="Ionicons" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <View style={styles.headerIconCircle}>
                <Icon name="calendar-outline" family="Ionicons" size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.headerTitle}>Admission Deadlines</Text>
              <Text style={styles.headerSubtitle}>Never miss an application deadline</Text>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.openCount}</Text>
                <Text style={styles.statLabel}>Open Now</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, {color: '#FCD34D'}]}>{stats.closingSoonCount}</Text>
                <Text style={styles.statLabel}>Closing Soon</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.upcomingCount}</Text>
                <Text style={styles.statLabel}>Upcoming</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Personalization Banner */}
          {isPersonalized && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setShowPersonalized(!showPersonalized)}
              style={[styles.personalizationBanner, {
                backgroundColor: showPersonalized ? (isDark ? '#1C3A2E' : '#DCFCE7') : colors.card,
                borderColor: showPersonalized ? '#16A34A' : colors.border,
              }]}>
              <Icon name={showPersonalized ? 'sparkles' : 'sparkles-outline'} family="Ionicons" size={18} color={showPersonalized ? '#16A34A' : colors.textSecondary} />
              <View style={styles.personalizationText}>
                <Text style={[styles.personalizationTitle, {color: showPersonalized ? '#15803D' : colors.text}]}>
                  {showPersonalized ? `For You: ${userFieldLabel} deadlines` : 'Show For You deadlines'}
                </Text>
                <Text style={[styles.personalizationSub, {color: colors.textSecondary}]}>
                  {showPersonalized ? (userName ? `Based on your profile, ${userName}` : 'Based on your profile') : 'Tap to filter by your field'}
                </Text>
              </View>
              <Icon name={showPersonalized ? 'checkmark-circle' : 'chevron-forward'} family="Ionicons" size={18} color={showPersonalized ? '#16A34A' : colors.textSecondary} />
            </TouchableOpacity>
          )}

          {/* Filters */}
          <View style={styles.filtersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContainer}>
              {PROGRAM_CATEGORIES.map(category => (
                <TouchableOpacity key={category.id}
                  style={[styles.categoryChip, {
                    backgroundColor: selectedCategory === category.id ? colors.primary : colors.card,
                    borderColor: selectedCategory === category.id ? colors.primary : colors.border,
                    opacity: showPersonalized ? 0.5 : 1,
                  }]}
                  onPress={() => { setShowPersonalized(false); setSelectedCategory(category.id); }} activeOpacity={0.8}
                  disabled={showPersonalized}>
                  <Icon name={category.iconName} family="Ionicons" size={14} color={selectedCategory === category.id ? '#FFFFFF' : colors.textSecondary} />
                  <Text style={[styles.categoryChipText, {color: selectedCategory === category.id ? '#FFFFFF' : colors.text}]}>{category.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.followingToggle, {backgroundColor: showFollowedOnly ? colors.primary : colors.card, borderColor: showFollowedOnly ? colors.primary : colors.border}]}
              onPress={() => setShowFollowedOnly(!showFollowedOnly)} activeOpacity={0.8}>
              <Icon name={showFollowedOnly ? 'notifications' : 'notifications-outline'} family="Ionicons" size={16} color={showFollowedOnly ? '#FFFFFF' : colors.textSecondary} />
              <Text style={[styles.followingToggleText, {color: showFollowedOnly ? '#FFFFFF' : colors.text}]}>Following ({followedUniversities.length})</Text>
            </TouchableOpacity>
          </View>

          {/* Deadlines List */}
          <View style={styles.deadlinesList}>
            {filteredDeadlines.map((deadline, index) => (
              <DeadlineCard key={deadline.id} deadline={deadline}
                isFollowed={followedUniversities.includes(deadline.universityId)}
                onFollowToggle={handleFollowToggle} onApply={handleApply}
                relatedEntryTests={getRelatedEntryTests(deadline)}
                onEntryTestPress={handleEntryTestPress}
                colors={colors} isDark={isDark} index={index} />
            ))}
          </View>

          {/* Empty State */}
          {filteredDeadlines.length === 0 && (
            <View style={styles.emptyState}>
              <Icon name="calendar-outline" family="Ionicons" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, {color: colors.text}]}>No Deadlines Found</Text>
              <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
                {showFollowedOnly ? 'Follow universities to see their deadlines here' : 'No deadlines match your filters'}
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
  headerDecoCircle1: {position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.1)'},
  headerDecoCircle2: {position: 'absolute', bottom: 40, left: -20, width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.08)'},
  backBtn: {position: 'absolute', top: SPACING.lg, left: SPACING.lg, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', zIndex: 10},
  headerContent: {alignItems: 'center', paddingTop: SPACING.xl},
  headerIconCircle: {width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md},
  headerTitle: {fontSize: TYPOGRAPHY.sizes.xxl, fontWeight: TYPOGRAPHY.weight.bold, color: '#FFFFFF', marginBottom: 4},
  headerSubtitle: {fontSize: TYPOGRAPHY.sizes.sm, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: SPACING.md},
  statsRow: {flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: RADIUS.lg, padding: SPACING.sm, marginTop: SPACING.sm},
  statItem: {flex: 1, alignItems: 'center'},
  statValue: {fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weight.bold, color: '#FFFFFF'},
  statLabel: {fontSize: TYPOGRAPHY.sizes.xs, color: 'rgba(255,255,255,0.8)', marginTop: 2},
  statDivider: {width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.2)'},
  filtersContainer: {paddingVertical: SPACING.md},
  categoryContainer: {paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm, gap: SPACING.sm},
  categoryChip: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, borderWidth: 1, marginRight: SPACING.sm, gap: SPACING.xs},
  categoryChipText: {fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weight.semibold},
  followingToggle: {flexDirection: 'row', alignItems: 'center', marginHorizontal: SPACING.lg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, borderWidth: 1, gap: SPACING.xs, alignSelf: 'flex-start'},
  followingToggleText: {fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.semibold},
  deadlinesList: {paddingHorizontal: SPACING.lg, gap: SPACING.md},
  emptyState: {alignItems: 'center', paddingVertical: SPACING.xxl * 2, paddingHorizontal: SPACING.xl},
  emptyTitle: {fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weight.bold, marginTop: SPACING.md, marginBottom: SPACING.xs},
  emptyText: {fontSize: TYPOGRAPHY.sizes.sm, textAlign: 'center'},
  personalizationBanner: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: SPACING.lg, marginTop: SPACING.md,
    marginBottom: SPACING.xs, padding: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1, gap: SPACING.sm,
  },
  personalizationText: {flex: 1},
  personalizationTitle: {fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.semibold},
  personalizationSub: {fontSize: TYPOGRAPHY.sizes.xs, marginTop: 2},
});

export default PremiumDeadlinesScreen;

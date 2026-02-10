import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import {TYPOGRAPHY, SPACING, RADIUS} from '../constants/design';
import {Icon} from '../components/icons';
import {ErrorBoundary} from '../components/ErrorBoundary';
import {useUniversityDetail} from '../hooks/useUniversityDetail';
import {
  DetailHeader,
  AnimatedTab,
  OverviewTab,
  ProgramsTab,
  AdmissionTab,
  MeritsTab,
  ScholarshipsTab,
} from '../components/university-detail';
import type {TabConfig} from '../types/universityDetail';

const TABS: TabConfig[] = [
  {key: 'overview', label: 'Overview', iconName: 'clipboard-outline'},
  {key: 'programs', label: 'Programs', iconName: 'library-outline'},
  {key: 'merits', label: 'Merits', iconName: 'trending-up-outline'},
  {key: 'admission', label: 'Admission', iconName: 'document-text-outline'},
  {key: 'scholarships', label: 'Aid', iconName: 'wallet-outline'},
];

const PremiumUniversityDetailScreen = () => {
  const {
    navigation,
    colors,
    isDark,
    activeTab,
    setActiveTab,
    isFav,
    university,
    universityPrograms,
    universityScholarships,
    meritFormulas,
    meritSummary,
    scrollY,
    headerHeight,
    headerTitleOpacity,
    heroOpacity,
    handleToggleFavorite,
    openLink,
  } = useUniversityDetail();

  if (!university) {
    return (
      <View style={[styles.errorContainer, {backgroundColor: colors.background}]}>
        <Icon name="search-outline" family="Ionicons" size={48} color={colors.textSecondary} />
        <Text style={[styles.errorText, {color: colors.text}]}>University not found</Text>
        <TouchableOpacity
          style={[styles.errorButton, {backgroundColor: colors.primary}]}
          onPress={() => navigation.goBack()}>
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar barStyle="light-content" />

      {/* Animated Header */}
      <DetailHeader
        university={university}
        headerHeight={headerHeight}
        headerTitleOpacity={headerTitleOpacity}
        heroOpacity={heroOpacity}
        isFav={isFav}
        onBack={() => navigation.goBack()}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Tabs */}
      <View style={[styles.tabsContainer, {backgroundColor: colors.card, borderBottomColor: colors.border}]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {TABS.map((tab, index) => (
            <AnimatedTab
              key={tab.key}
              label={tab.label}
              iconName={tab.iconName}
              isActive={activeTab === tab.key}
              onPress={() => setActiveTab(tab.key)}
              index={index}
              colors={colors}
            />
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: false},
        )}
        scrollEventThrottle={16}>
        <ErrorBoundary
          fallback={
            <View style={styles.tabContent}>
              <View style={[styles.emptyFallback, {backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.card}]}>
                <Icon name="information-circle-outline" family="Ionicons" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, {color: colors.text}]}>Information coming soon</Text>
                <Text style={[styles.emptySubtext, {color: colors.textSecondary}]}>
                  We're working on adding this content
                </Text>
              </View>
            </View>
          }>
          {activeTab === 'overview' && (
            <OverviewTab university={university} colors={colors} isDark={isDark} openLink={openLink} />
          )}
          {activeTab === 'programs' && (
            <ProgramsTab university={university} programs={universityPrograms} colors={colors} isDark={isDark} />
          )}
          {activeTab === 'merits' && (
            <MeritsTab meritSummary={meritSummary} universityId={university?.id} colors={colors} isDark={isDark} />
          )}
          {activeTab === 'admission' && (
            <AdmissionTab
              university={university}
              meritFormulas={meritFormulas}
              colors={colors}
              isDark={isDark}
              openLink={openLink}
            />
          )}
          {activeTab === 'scholarships' && (
            <ScholarshipsTab
              university={university}
              scholarships={universityScholarships}
              colors={colors}
              isDark={isDark}
              openLink={openLink}
            />
          )}
        </ErrorBoundary>
        <View style={{height: 100}} />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: SPACING.lg,
  },
  errorButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  tabsContainer: {
    borderBottomWidth: 1,
  },
  tabsScroll: {
    paddingHorizontal: SPACING.md,
  },
  tabContent: {
    padding: SPACING.md,
  },
  emptyFallback: {
    alignItems: 'center',
    padding: SPACING.xxl,
    borderRadius: RADIUS.lg,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default PremiumUniversityDetailScreen;



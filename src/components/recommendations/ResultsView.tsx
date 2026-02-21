/**
 * ResultsView - Full results display with header + cards + tips
 */

import React from 'react';
import {View, Text, TouchableOpacity, ScrollView, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../../constants/design';
import {Icon} from '../icons';
import ResultCard from './ResultCard';
import type {UniversityRecommendation} from '../../utils/recommendationEngine';

interface ResultsViewProps {
  colors: any;
  isDark: boolean;
  recommendations: UniversityRecommendation[];
  recommendationStats: {
    tier1Count: number;
    tier2Count: number;
    reachCount: number;
    targetCount?: number;
    safetyCount?: number;
    total: number;
  } | null;
  fscMarks: string;
  fscTotal: string;
  onBack: () => void;
  onViewDetails: (universityId: string) => void;
}

const ResultsView = ({
  colors, isDark, recommendations, recommendationStats,
  fscMarks, fscTotal, onBack, onViewDetails,
}: ResultsViewProps) => {
  const fscPercentage = parseFloat(fscMarks) / parseFloat(fscTotal) * 100;

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]} edges={['top']}>
      {/* Results Header */}
      <LinearGradient
        colors={isDark ? ['#27ae60', '#219a52'] : ['#2ecc71', '#27ae60']}
        style={styles.resultsHeader}>
        <View style={styles.headerDecoration1} />
        <View style={styles.headerDecoration2} />
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
            <Icon name="chevron-back" family="Ionicons" size={18} color="#FFFFFF" />
            <Text style={styles.backButtonText}>Back</Text>
          </View>
        </TouchableOpacity>
        <Icon name="trophy" family="Ionicons" size={48} color="#FFFFFF" />
        <Text style={styles.resultsTitle}>Your Matches!</Text>
        <Text style={styles.resultsSubtitle}>
          Found {recommendations.length} universities matching your criteria
        </Text>
        {recommendationStats && (
          <View style={styles.statsRow}>
            {(recommendationStats.safetyCount ?? 0) > 0 && (
              <View style={[styles.statBadge, {backgroundColor: '#16A34A30'}]}>
                <Text style={[styles.statText, {color: '#FFFFFF'}]}>✅ {recommendationStats.safetyCount} Safety</Text>
              </View>
            )}
            {(recommendationStats.targetCount ?? 0) > 0 && (
              <View style={[styles.statBadge, {backgroundColor: '#2563EB30'}]}>
                <Text style={[styles.statText, {color: '#FFFFFF'}]}>🎓 {recommendationStats.targetCount} Target</Text>
              </View>
            )}
            {recommendationStats.reachCount > 0 && (
              <View style={[styles.statBadge, {backgroundColor: '#DC262630'}]}>
                <Text style={[styles.statText, {color: '#FFFFFF'}]}>🎯 {recommendationStats.reachCount} Reach</Text>
              </View>
            )}
          </View>
        )}
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.resultsContainer}>
        {recommendations.length > 0 ? (
          recommendations.map((uni, index) => (
            <ResultCard
              key={uni.short_name || uni.name}
              university={uni}
              matchScore={uni.matchScore}
              matchReasons={uni.matchReasons || []}
              index={index}
              colors={colors}
              onViewDetails={() => onViewDetails(uni.short_name)}
              tier={uni.tier}
              isReachSchool={uni.isReachSchool}
              isSafetySchool={uni.isSafetySchool}
              recommendedCategory={uni.recommendedCategory}
              matchBreakdown={uni.matchBreakdown}
              meritInsight={uni.meritInsight}
              semesterFee={uni.semesterFee}
              quotaOpportunities={uni.quotaOpportunities}
            />
          ))
        ) : (
          <View style={[styles.noResultsCard, {backgroundColor: colors.card}]}>
            <Icon name="school-outline" family="Ionicons" size={48} color={colors.textSecondary} />
            <Text style={[styles.noResultsTitle, {color: colors.text}]}>
              {fscPercentage < 50 ? 'Focus on Improving Your Marks' : 'No Matches Found'}
            </Text>
            <Text style={[styles.noResultsText, {color: colors.textSecondary}]}>
              {fscPercentage < 50
                ? 'With your current marks, we recommend focusing on improving your academic performance. Consider taking extra classes, joining study groups, or exploring vocational training programs.'
                : 'Try selecting different cities, programs, or university types to find more options. You can also try selecting "Both" for university type.'}
            </Text>
            {fscPercentage < 60 && (
              <View style={[styles.guidanceCard, {backgroundColor: colors.background, marginTop: SPACING.md}]}>
                <Text style={[styles.guidanceTitle, {color: colors.text}]}>📚 Improvement Tips:</Text>
                <Text style={[styles.guidanceText, {color: colors.textSecondary}]}>• Consider retaking your exams</Text>
                <Text style={[styles.guidanceText, {color: colors.textSecondary}]}>• Look into technical/vocational programs</Text>
                <Text style={[styles.guidanceText, {color: colors.textSecondary}]}>• Explore AIOU or VU distance learning</Text>
                <Text style={[styles.guidanceText, {color: colors.textSecondary}]}>• Check diploma programs at polytechnics</Text>
              </View>
            )}
          </View>
        )}

        {/* Tips Card */}
        <View style={[styles.tipsCard, {backgroundColor: colors.card}]}>
          <LinearGradient colors={['rgba(52, 152, 219, 0.1)', 'transparent']} style={styles.tipsGradient}>
            <Icon name="bulb-outline" family="Ionicons" size={32} color="#f1c40f" />
            <Text style={[styles.tipsTitle, {color: colors.text}]}>Next Steps</Text>
            {['Check admission deadlines for your top picks', 'Prepare for entry tests (ECAT, MDCAT, etc.)', 'Gather required documents early'].map((tip, i) => (
              <View key={i} style={styles.tipItem}>
                <Text style={styles.tipBullet}>{i + 1}.</Text>
                <Text style={[styles.tipText, {color: colors.textSecondary}]}>{tip}</Text>
              </View>
            ))}
          </LinearGradient>
        </View>

        <View style={{height: SPACING.xxl * 2}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  resultsHeader: {
    paddingTop: SPACING.md, paddingBottom: SPACING.xl, paddingHorizontal: SPACING.md,
    alignItems: 'center', borderBottomLeftRadius: RADIUS.xxl, borderBottomRightRadius: RADIUS.xxl, overflow: 'hidden',
  },
  headerDecoration1: {
    position: 'absolute', top: -30, right: -30, width: 120, height: 120,
    borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerDecoration2: {
    position: 'absolute', bottom: -20, left: -20, width: 80, height: 80,
    borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.08)',
  },
  backButton: {alignSelf: 'flex-start', marginBottom: SPACING.sm},
  backButtonText: {color: '#fff', fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.medium},
  resultsTitle: {fontSize: TYPOGRAPHY.sizes.xxl, fontWeight: TYPOGRAPHY.weight.bold, color: '#fff', marginBottom: 4},
  resultsSubtitle: {fontSize: TYPOGRAPHY.sizes.sm, color: 'rgba(255,255,255,0.9)', textAlign: 'center'},
  statsRow: {flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm, flexWrap: 'wrap', justifyContent: 'center'},
  statBadge: {backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.full},
  statText: {color: '#fff', fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weight.semibold},
  resultsContainer: {padding: SPACING.md},
  noResultsCard: {padding: SPACING.xl, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center'},
  noResultsTitle: {fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weight.bold, marginTop: SPACING.md},
  noResultsText: {fontSize: TYPOGRAPHY.sizes.sm, textAlign: 'center', marginTop: SPACING.xs, paddingHorizontal: SPACING.md},
  guidanceCard: {padding: SPACING.md, borderRadius: RADIUS.md, width: '100%'},
  guidanceTitle: {fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.bold, marginBottom: SPACING.xs},
  guidanceText: {fontSize: TYPOGRAPHY.sizes.sm, marginBottom: 4},
  tipsCard: {borderRadius: RADIUS.lg, overflow: 'hidden', marginTop: SPACING.md},
  tipsGradient: {padding: SPACING.md},
  tipsTitle: {fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.bold, marginBottom: SPACING.sm},
  tipItem: {flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6},
  tipBullet: {fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.bold, marginRight: 6, color: '#4573DF'},
  tipText: {flex: 1, fontSize: TYPOGRAPHY.sizes.sm},
});

export default React.memo(ResultsView);

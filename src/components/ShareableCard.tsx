/**
 * ShareableCard Component - Premium Shareable Cards for Social Media
 * Used for Merit Results, University Comparisons, and other shareable content
 * 
 * Features:
 * - Premium PakUni branding with graduation cap logo
 * - High quality graphics optimized for social sharing
 * - Instagram Story, WhatsApp Status compatible (1080px quality)
 * 
 * @author PakUni Team
 * @version 2.0.0
 */

import React, {forwardRef} from 'react';
import {View, Text, StyleSheet, Platform} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from './icons';
import {TYPOGRAPHY, RADIUS, SPACING} from '../constants/design';

// ============================================================================
// BRAND CONSTANTS - PakUni Identity
// ============================================================================

const PAKUNI_BRAND = {
  colors: {
    primary: '#6366F1',       // Indigo
    primaryDark: '#4F46E5',
    secondary: '#10B981',     // Emerald
    accent: '#8B5CF6',        // Violet
    gold: '#F59E0B',          // Amber
    goldLight: '#FBBF24',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  gradients: {
    primary: ['#6366F1', '#8B5CF6'],
    success: ['#10B981', '#059669'],
    premium: ['#6366F1', '#8B5CF6', '#EC4899'],
    dark: ['#1E293B', '#0F172A', '#020617'],
  },
};

// ============================================================================
// PREMIUM APP LOGO COMPONENT - For Shareable Cards
// ============================================================================

interface PakUniLogoBadgeProps {
  size?: number;
  variant?: 'light' | 'dark';
}

const PakUniLogoBadge: React.FC<PakUniLogoBadgeProps> = ({
  size = 36,
  variant = 'light',
}) => {
  const bgColor = variant === 'light' 
    ? 'rgba(255,255,255,0.2)' 
    : 'rgba(99,102,241,0.15)';
  
  const capSize = size * 0.6;
  const bookSize = size * 0.35;
  
  return (
    <View style={[logoStyles.container, {width: size, height: size, backgroundColor: bgColor, borderRadius: size / 2}]}>
      {/* Graduation Cap */}
      <View style={logoStyles.capWrapper}>
        {/* Cap Top (Mortarboard) */}
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={[logoStyles.capTop, {
            width: capSize,
            height: capSize * 0.35,
            borderRadius: 2,
          }]}
        />
        {/* Cap Base */}
        <LinearGradient
          colors={['#4F46E5', '#6366F1']}
          style={[logoStyles.capBase, {
            width: capSize * 0.5,
            height: capSize * 0.3,
            borderRadius: 2,
            marginTop: -2,
          }]}
        />
        {/* Tassel */}
        <View style={[logoStyles.tassel, {
          width: 2,
          height: capSize * 0.35,
          backgroundColor: PAKUNI_BRAND.colors.gold,
          right: size * 0.12,
          top: capSize * 0.2,
        }]}>
          <View style={[logoStyles.tasselKnot, {
            width: 5,
            height: 5,
            borderRadius: 2.5,
            backgroundColor: PAKUNI_BRAND.colors.goldLight,
          }]} />
        </View>
      </View>
      {/* Book at bottom */}
      <View style={[logoStyles.book, {marginTop: -2}]}>
        <LinearGradient
          colors={['#10B981', '#059669']}
          style={[logoStyles.bookPage, {
            width: bookSize,
            height: bookSize * 0.5,
            borderRadius: 2,
          }]}
        />
      </View>
    </View>
  );
};

const logoStyles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  capWrapper: {
    alignItems: 'center',
    position: 'relative',
  },
  capTop: {
    transform: [{perspective: 100}, {rotateX: '15deg'}],
  },
  capBase: {},
  tassel: {
    position: 'absolute',
  },
  tasselKnot: {
    position: 'absolute',
    bottom: -3,
    left: -1.5,
  },
  book: {
    alignItems: 'center',
  },
  bookPage: {},
});

// ============================================================================
// MERIT SUCCESS CARD - "I have X% chance at NUST!"
// ============================================================================

interface MeritSuccessCardProps {
  aggregate: number;
  universityName: string;
  universityShortName: string;
  chance: 'high' | 'medium' | 'low';
  breakdown?: {
    matricContribution: number;
    interContribution: number;
    testContribution: number;
  };
}

export const MeritSuccessCard = forwardRef<View, MeritSuccessCardProps>(
  ({aggregate, universityName, universityShortName, chance, breakdown}, ref) => {
    const getChanceText = () => {
      switch (chance) {
        case 'high':
          return 'Excellent Chance';
        case 'medium':
          return 'Good Chance';
        case 'low':
          return 'Fair Chance';
      }
    };

    const getChanceEmoji = () => {
      switch (chance) {
        case 'high':
          return '🎯';
        case 'medium':
          return '📈';
        case 'low':
          return '💪';
      }
    };

    const getGradientColors = (): string[] => {
      switch (chance) {
        case 'high':
          return ['#10B981', '#059669', '#047857'];
        case 'medium':
          return ['#6366F1', '#4F46E5', '#3730A3'];
        case 'low':
          return ['#F59E0B', '#D97706', '#B45309'];
      }
    };

    return (
      <View ref={ref} style={styles.cardContainer} collapsable={false}>
        <LinearGradient
          colors={getGradientColors()}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.cardGradient}>
          {/* Premium Decorative Elements */}
          <View style={styles.decoCircle1} />
          <View style={styles.decoCircle2} />
          <View style={styles.decoCircle3} />
          <View style={styles.decoStar1}>
            <Text style={styles.starEmoji}>✦</Text>
          </View>
          <View style={styles.decoStar2}>
            <Text style={styles.starEmoji}>✧</Text>
          </View>

          {/* Premium Header with PakUni Logo */}
          <View style={styles.cardHeader}>
            <PakUniLogoBadge size={42} variant="light" />
            <View style={styles.brandTextContainer}>
              <Text style={styles.appBrand}>PakUni</Text>
              <Text style={styles.appTagline}>Your University Guide</Text>
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            <Text style={styles.chanceEmoji}>{getChanceEmoji()}</Text>
            <Text style={styles.mainTitle}>
              I have an{' '}
              <Text style={styles.highlightText}>{getChanceText()}</Text>
            </Text>
            <Text style={styles.mainSubtitle}>of getting into</Text>
            <Text style={styles.universityName}>{universityShortName}</Text>
            <Text style={styles.universityFullName}>{universityName}</Text>
          </View>

          {/* Premium Aggregate Display */}
          <View style={styles.aggregateBox}>
            <View style={styles.aggregateLabelRow}>
              <Icon name="stats-chart" family="Ionicons" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.aggregateLabel}>My Merit Score</Text>
            </View>
            <View style={styles.aggregateValueRow}>
              <Text style={styles.aggregateValue}>{aggregate.toFixed(2)}</Text>
              <Text style={styles.aggregatePercent}>%</Text>
            </View>
          </View>

          {/* Breakdown (if provided) */}
          {breakdown && (
            <View style={styles.breakdownRow}>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>Matric</Text>
                <Text style={styles.breakdownValue}>
                  {breakdown.matricContribution.toFixed(1)}
                </Text>
              </View>
              <View style={styles.breakdownDivider} />
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>Inter</Text>
                <Text style={styles.breakdownValue}>
                  {breakdown.interContribution.toFixed(1)}
                </Text>
              </View>
              {breakdown.testContribution > 0 && (
                <>
                  <View style={styles.breakdownDivider} />
                  <View style={styles.breakdownItem}>
                    <Text style={styles.breakdownLabel}>Test</Text>
                    <Text style={styles.breakdownValue}>
                      {breakdown.testContribution.toFixed(1)}
                    </Text>
                  </View>
                </>
              )}
            </View>
          )}

          {/* Premium Footer CTA */}
          <View style={styles.cardFooter}>
            <Text style={styles.ctaText}>
              Calculate your chances on PakUni App
            </Text>
            <View style={styles.downloadBadge}>
              <Icon name="sparkles" family="Ionicons" size={14} color="#FFFFFF" />
              <Text style={styles.downloadText}>Download Free</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  },
);

// ============================================================================
// UNIVERSITY COMPARISON CARD - "FAST vs PUCIT"
// ============================================================================

interface UniversityComparisonData {
  name: string;
  shortName: string;
  type: string;
  city: string;
  ranking: string | null;
}

interface ComparisonCardProps {
  university1: UniversityComparisonData;
  university2: UniversityComparisonData;
}

export const ComparisonCard = forwardRef<View, ComparisonCardProps>(
  ({university1, university2}, ref) => {
    return (
      <View ref={ref} style={styles.comparisonContainer} collapsable={false}>
        <LinearGradient
          colors={['#1E293B', '#0F172A', '#020617']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.comparisonGradient}>
          {/* Decorative Elements */}
          <View style={styles.comparisonDeco1} />
          <View style={styles.comparisonDeco2} />
          
          {/* Premium Header with PakUni Logo */}
          <View style={styles.comparisonHeader}>
            <PakUniLogoBadge size={36} variant="light" />
            <View style={styles.comparisonBrandContainer}>
              <Text style={styles.comparisonBrand}>PakUni</Text>
              <Text style={styles.comparisonSubBrand}>University Comparison</Text>
            </View>
          </View>

          {/* VS Section */}
          <View style={styles.vsContainer}>
            {/* University 1 */}
            <View style={styles.uniBox}>
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                style={styles.uniIconCircle}>
                <Icon name="school" family="Ionicons" size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.uniShortName}>{university1.shortName}</Text>
              <Text style={styles.uniFullName} numberOfLines={2}>
                {university1.name}
              </Text>
              <View style={styles.uniMetaRow}>
                <View style={styles.uniMetaBadge}>
                  <Text style={styles.uniMetaText}>{university1.type}</Text>
                </View>
                <View style={styles.uniMetaBadge}>
                  <Text style={styles.uniMetaText}>{university1.city}</Text>
                </View>
              </View>
              {university1.ranking && (
                <View style={styles.rankingBadge}>
                  <Icon name="trophy" family="Ionicons" size={12} color="#FFD700" />
                  <Text style={styles.rankingText}>#{university1.ranking}</Text>
                </View>
              )}
            </View>

            {/* VS Badge */}
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              style={styles.vsBadge}>
              <Text style={styles.vsText}>VS</Text>
            </LinearGradient>

            {/* University 2 */}
            <View style={styles.uniBox}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.uniIconCircle}>
                <Icon name="school" family="Ionicons" size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.uniShortName}>{university2.shortName}</Text>
              <Text style={styles.uniFullName} numberOfLines={2}>
                {university2.name}
              </Text>
              <View style={styles.uniMetaRow}>
                <View style={styles.uniMetaBadge}>
                  <Text style={styles.uniMetaText}>{university2.type}</Text>
                </View>
                <View style={styles.uniMetaBadge}>
                  <Text style={styles.uniMetaText}>{university2.city}</Text>
                </View>
              </View>
              {university2.ranking && (
                <View style={styles.rankingBadge}>
                  <Icon name="trophy" family="Ionicons" size={12} color="#FFD700" />
                  <Text style={styles.rankingText}>#{university2.ranking}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Footer */}
          <View style={styles.comparisonFooter}>
            <Text style={styles.comparisonCta}>
              Compare universities on PakUni App 🚀
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  },
);

// ============================================================================
// POLL RESULT CARD - Share poll results
// ============================================================================

interface PollResultCardProps {
  question: string;
  winner: string;
  winnerVotes: number;
  totalVotes: number;
  options: Array<{name: string; votes: number; percentage: number}>;
}

export const PollResultCard = forwardRef<View, PollResultCardProps>(
  ({question, winner, winnerVotes, totalVotes, options}, ref) => {
    return (
      <View ref={ref} style={styles.pollContainer} collapsable={false}>
        <LinearGradient
          colors={['#6366F1', '#7C3AED', '#5B21B6']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.pollGradient}>
          {/* Decorative Elements */}
          <View style={styles.pollDeco1} />
          <View style={styles.pollDeco2} />
          
          {/* Premium Header with PakUni Logo */}
          <View style={styles.pollHeader}>
            <PakUniLogoBadge size={36} variant="light" />
            <View style={styles.pollBrandContainer}>
              <Text style={styles.pollBrand}>PakUni</Text>
              <Text style={styles.pollSubBrand}>Student Polls</Text>
            </View>
            <View style={styles.pollLiveBadge}>
              <View style={styles.pollLiveDot} />
              <Text style={styles.pollLiveText}>LIVE</Text>
            </View>
          </View>

          {/* Question */}
          <Text style={styles.pollQuestion}>{question}</Text>

          {/* Results */}
          <View style={styles.pollResults}>
            {options.slice(0, 4).map((option, index) => (
              <View key={index} style={styles.pollOption}>
                <View style={styles.pollOptionHeader}>
                  <View style={styles.pollOptionNameRow}>
                    {option.name === winner && (
                      <Icon name="trophy" family="Ionicons" size={14} color="#FFD700" />
                    )}
                    <Text style={[
                      styles.pollOptionName,
                      option.name === winner && styles.pollWinnerName
                    ]} numberOfLines={1}>
                      {option.name}
                    </Text>
                  </View>
                  <Text style={styles.pollOptionPercent}>
                    {option.percentage.toFixed(0)}%
                  </Text>
                </View>
                <View style={styles.pollBarBg}>
                  <LinearGradient
                    colors={option.name === winner 
                      ? ['#FFD700', '#FFC107'] 
                      : ['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.2)']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={[
                      styles.pollBarFill,
                      {width: `${Math.max(option.percentage, 5)}%`},
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Total Votes */}
          <View style={styles.pollTotalRow}>
            <Icon name="people" family="Ionicons" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.pollTotalText}>
              {totalVotes.toLocaleString()} students voted
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.pollFooter}>
            <Text style={styles.pollCta}>Vote on PakUni App ✨</Text>
          </View>
        </LinearGradient>
      </View>
    );
  },
);

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Merit Success Card Styles
  cardContainer: {
    width: 340,
    borderRadius: RADIUS.xxl,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 12},
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  cardGradient: {
    padding: SPACING.xl,
    position: 'relative',
  },
  decoCircle1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  decoCircle2: {
    position: 'absolute',
    bottom: 80,
    left: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  decoCircle3: {
    position: 'absolute',
    top: '45%',
    right: 30,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  decoStar1: {
    position: 'absolute',
    top: 60,
    right: 50,
    opacity: 0.4,
  },
  decoStar2: {
    position: 'absolute',
    bottom: 120,
    left: 30,
    opacity: 0.3,
  },
  starEmoji: {
    fontSize: 16,
    color: '#FFD700',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  brandTextContainer: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  logoCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 20,
  },
  appBrand: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  appTagline: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginTop: 1,
  },
  mainContent: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  chanceEmoji: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  mainTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    fontWeight: '500',
  },
  highlightText: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  mainSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
    marginBottom: SPACING.sm,
  },
  universityName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  universityFullName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: SPACING.md,
  },
  aggregateBox: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  aggregateLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aggregateLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  aggregateValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  aggregateValue: {
    fontSize: 56,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -2,
  },
  aggregatePercent: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
    marginLeft: 2,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
  },
  breakdownItem: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  breakdownLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
    marginBottom: 2,
  },
  breakdownValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  breakdownDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  cardFooter: {
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  ctaText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.95)',
    marginBottom: SPACING.sm,
    fontWeight: '500',
  },
  downloadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    gap: 6,
  },
  downloadText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // Comparison Card Styles
  comparisonContainer: {
    width: 360,
    borderRadius: RADIUS.xxl,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 10},
        shadowOpacity: 0.35,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  comparisonGradient: {
    padding: SPACING.lg,
    position: 'relative',
  },
  comparisonDeco1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(99,102,241,0.15)',
  },
  comparisonDeco2: {
    position: 'absolute',
    bottom: 40,
    left: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(16,185,129,0.1)',
  },
  comparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  comparisonBrandContainer: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  comparisonLogoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  comparisonBrand: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  comparisonSubBrand: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  vsContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: SPACING.md,
  },
  uniBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  uniIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  uniShortName: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  uniFullName: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: SPACING.sm,
  },
  uniMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
    marginBottom: SPACING.xs,
  },
  uniMetaBadge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  uniMetaText: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  rankingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    gap: 4,
    marginTop: SPACING.xs,
  },
  rankingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFD700',
  },
  vsBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginHorizontal: SPACING.xs,
  },
  vsText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  comparisonFooter: {
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  comparisonCta: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '600',
  },

  // Poll Result Card Styles
  pollContainer: {
    width: 340,
    borderRadius: RADIUS.xxl,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: {width: 0, height: 10},
        shadowOpacity: 0.35,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  pollGradient: {
    padding: SPACING.lg,
    position: 'relative',
  },
  pollDeco1: {
    position: 'absolute',
    top: -25,
    right: -25,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  pollDeco2: {
    position: 'absolute',
    bottom: 60,
    left: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  pollHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  pollBrandContainer: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  pollLogoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pollBrand: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  pollSubBrand: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  pollLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    gap: 5,
  },
  pollLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  pollLiveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EF4444',
    letterSpacing: 0.5,
  },
  pollQuestion: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 26,
  },
  pollResults: {
    marginBottom: SPACING.md,
  },
  pollOption: {
    marginBottom: SPACING.sm,
  },
  pollOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  pollOptionNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  pollOptionName: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  pollWinnerName: {
    fontWeight: '700',
    color: '#FFD700',
  },
  pollOptionPercent: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pollBarBg: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  pollBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  pollTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: SPACING.md,
  },
  pollTotalText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  pollFooter: {
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  pollCta: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

// ============================================================================
// ADMISSION CELEBRATION CARD - "I got into NUST!" 🎉
// ============================================================================

interface AdmissionCelebrationCardProps {
  universityName: string;
  universityShortName: string;
  programName?: string;
  studentName?: string;
  year?: number;
}

export const AdmissionCelebrationCard = forwardRef<View, AdmissionCelebrationCardProps>(
  ({universityName, universityShortName, programName, studentName, year}, ref) => {
    return (
      <View ref={ref} style={celebrationStyles.container} collapsable={false}>
        <LinearGradient
          colors={['#10B981', '#059669', '#047857']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={celebrationStyles.gradient}>
          {/* Decorative Elements */}
          <View style={celebrationStyles.confetti1}>
            <Text style={{fontSize: 20}}>🎊</Text>
          </View>
          <View style={celebrationStyles.confetti2}>
            <Text style={{fontSize: 16}}>✨</Text>
          </View>
          <View style={celebrationStyles.confetti3}>
            <Text style={{fontSize: 18}}>🎉</Text>
          </View>
          <View style={celebrationStyles.confetti4}>
            <Text style={{fontSize: 14}}>⭐</Text>
          </View>
          
          {/* Header */}
          <View style={celebrationStyles.header}>
            <PakUniLogoBadge size={36} variant="light" />
            <View style={{marginLeft: 8, flex: 1}}>
              <Text style={celebrationStyles.brand}>PakUni</Text>
              <Text style={celebrationStyles.subBrand}>Success Story</Text>
            </View>
          </View>

          {/* Main Celebration Content */}
          <View style={celebrationStyles.mainContent}>
            <Text style={celebrationStyles.celebrationEmoji}>🎓</Text>
            <Text style={celebrationStyles.bigText}>ADMISSION</Text>
            <Text style={celebrationStyles.securedText}>SECURED!</Text>
            
            {studentName && (
              <Text style={celebrationStyles.studentName}>{studentName}</Text>
            )}
            <Text style={celebrationStyles.gotIntoText}>got admitted to</Text>
            
            <View style={celebrationStyles.universityBox}>
              <Text style={celebrationStyles.uniShort}>{universityShortName}</Text>
              <Text style={celebrationStyles.uniName}>{universityName}</Text>
              {programName && (
                <Text style={celebrationStyles.programName}>📚 {programName}</Text>
              )}
              {year && (
                <View style={celebrationStyles.yearBadge}>
                  <Text style={celebrationStyles.yearText}>Class of {year}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Footer */}
          <View style={celebrationStyles.footer}>
            <Text style={celebrationStyles.hashtags}>#Alhamdulillah #{universityShortName}{year || ''}</Text>
            <Text style={celebrationStyles.cta}>Plan your journey on PakUni App 🚀</Text>
          </View>
        </LinearGradient>
      </View>
    );
  },
);

// ============================================================================
// ENTRY TEST SUCCESS CARD - "I cleared ECAT!" ✅
// ============================================================================

interface EntryTestSuccessCardProps {
  testName: string;
  testShortName: string;
  score?: number;
  maxScore?: number;
  percentile?: number;
  studentName?: string;
}

export const EntryTestSuccessCard = forwardRef<View, EntryTestSuccessCardProps>(
  ({testName, testShortName, score, maxScore, percentile, studentName}, ref) => {
    return (
      <View ref={ref} style={celebrationStyles.container} collapsable={false}>
        <LinearGradient
          colors={['#6366F1', '#4F46E5', '#3730A3']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={celebrationStyles.gradient}>
          {/* Decorative Elements */}
          <View style={celebrationStyles.confetti1}>
            <Text style={{fontSize: 18}}>📝</Text>
          </View>
          <View style={celebrationStyles.confetti2}>
            <Text style={{fontSize: 16}}>✅</Text>
          </View>
          <View style={celebrationStyles.confetti3}>
            <Text style={{fontSize: 18}}>💪</Text>
          </View>
          
          {/* Header */}
          <View style={celebrationStyles.header}>
            <PakUniLogoBadge size={36} variant="light" />
            <View style={{marginLeft: 8, flex: 1}}>
              <Text style={celebrationStyles.brand}>PakUni</Text>
              <Text style={celebrationStyles.subBrand}>Achievement Unlocked</Text>
            </View>
          </View>

          {/* Main Content */}
          <View style={celebrationStyles.mainContent}>
            <Text style={celebrationStyles.celebrationEmoji}>📝</Text>
            <Text style={celebrationStyles.bigText}>{testShortName}</Text>
            <Text style={celebrationStyles.securedText}>CLEARED! ✅</Text>
            
            {studentName && (
              <Text style={celebrationStyles.studentName}>{studentName}</Text>
            )}
            <Text style={celebrationStyles.gotIntoText}>successfully passed the</Text>
            <Text style={celebrationStyles.testFullName}>{testName}</Text>
            
            {(score || percentile) && (
              <View style={celebrationStyles.scoreBox}>
                {score && (
                  <View style={celebrationStyles.scoreItem}>
                    <Text style={celebrationStyles.scoreLabel}>Score</Text>
                    <Text style={celebrationStyles.scoreValue}>{score}{maxScore ? `/${maxScore}` : ''}</Text>
                  </View>
                )}
                {percentile && (
                  <View style={celebrationStyles.scoreItem}>
                    <Text style={celebrationStyles.scoreLabel}>Percentile</Text>
                    <Text style={celebrationStyles.scoreValue}>{percentile}%</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={celebrationStyles.footer}>
            <Text style={celebrationStyles.hashtags}>#{testShortName}Cleared #AdmissionSeason</Text>
            <Text style={celebrationStyles.cta}>Prepare for tests on PakUni App 📱</Text>
          </View>
        </LinearGradient>
      </View>
    );
  },
);

// ============================================================================
// MERIT LIST CELEBRATION CARD - "I'm on the merit list!" 📜
// ============================================================================

interface MeritListCardProps {
  universityName: string;
  universityShortName: string;
  meritListNumber?: number;
  studentName?: string;
  meritPosition?: number;
}

export const MeritListCard = forwardRef<View, MeritListCardProps>(
  ({universityName, universityShortName, meritListNumber, studentName, meritPosition}, ref) => {
    return (
      <View ref={ref} style={celebrationStyles.container} collapsable={false}>
        <LinearGradient
          colors={['#F59E0B', '#D97706', '#B45309']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={celebrationStyles.gradient}>
          {/* Decorative Elements */}
          <View style={celebrationStyles.confetti1}>
            <Text style={{fontSize: 20}}>📜</Text>
          </View>
          <View style={celebrationStyles.confetti2}>
            <Text style={{fontSize: 18}}>🎯</Text>
          </View>
          <View style={celebrationStyles.confetti3}>
            <Text style={{fontSize: 16}}>⭐</Text>
          </View>
          
          {/* Header */}
          <View style={celebrationStyles.header}>
            <PakUniLogoBadge size={36} variant="light" />
            <View style={{marginLeft: 8, flex: 1}}>
              <Text style={celebrationStyles.brand}>PakUni</Text>
              <Text style={celebrationStyles.subBrand}>Merit Announcement</Text>
            </View>
          </View>

          {/* Main Content */}
          <View style={celebrationStyles.mainContent}>
            <Text style={celebrationStyles.celebrationEmoji}>📜</Text>
            <Text style={celebrationStyles.bigText}>MERIT</Text>
            <Text style={celebrationStyles.securedText}>LISTED! 🎯</Text>
            
            {studentName && (
              <Text style={celebrationStyles.studentName}>{studentName}</Text>
            )}
            <Text style={celebrationStyles.gotIntoText}>made it to</Text>
            
            <View style={celebrationStyles.universityBox}>
              {meritListNumber && (
                <View style={celebrationStyles.listBadge}>
                  <Text style={celebrationStyles.listBadgeText}>Merit List {meritListNumber}</Text>
                </View>
              )}
              <Text style={celebrationStyles.uniShort}>{universityShortName}</Text>
              <Text style={celebrationStyles.uniName}>{universityName}</Text>
              {meritPosition && (
                <Text style={celebrationStyles.positionText}>Position: #{meritPosition}</Text>
              )}
            </View>
          </View>

          {/* Footer */}
          <View style={celebrationStyles.footer}>
            <Text style={celebrationStyles.hashtags}>#MeritListed #{universityShortName}</Text>
            <Text style={celebrationStyles.cta}>Calculate your merit on PakUni 📊</Text>
          </View>
        </LinearGradient>
      </View>
    );
  },
);

// ============================================================================
// SCHOLARSHIP CARD - "I received a scholarship!" 💰
// ============================================================================

interface ScholarshipCelebrationCardProps {
  scholarshipName: string;
  provider: string;
  coverage?: string;
  studentName?: string;
}

export const ScholarshipCelebrationCard = forwardRef<View, ScholarshipCelebrationCardProps>(
  ({scholarshipName, provider, coverage, studentName}, ref) => {
    return (
      <View ref={ref} style={celebrationStyles.container} collapsable={false}>
        <LinearGradient
          colors={['#8B5CF6', '#7C3AED', '#5B21B6']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={celebrationStyles.gradient}>
          {/* Decorative Elements */}
          <View style={celebrationStyles.confetti1}>
            <Text style={{fontSize: 18}}>💰</Text>
          </View>
          <View style={celebrationStyles.confetti2}>
            <Text style={{fontSize: 16}}>🎓</Text>
          </View>
          <View style={celebrationStyles.confetti3}>
            <Text style={{fontSize: 18}}>✨</Text>
          </View>
          
          {/* Header */}
          <View style={celebrationStyles.header}>
            <PakUniLogoBadge size={36} variant="light" />
            <View style={{marginLeft: 8, flex: 1}}>
              <Text style={celebrationStyles.brand}>PakUni</Text>
              <Text style={celebrationStyles.subBrand}>Scholarship Award</Text>
            </View>
          </View>

          {/* Main Content */}
          <View style={celebrationStyles.mainContent}>
            <Text style={celebrationStyles.celebrationEmoji}>🎓💰</Text>
            <Text style={celebrationStyles.bigText}>SCHOLARSHIP</Text>
            <Text style={celebrationStyles.securedText}>AWARDED!</Text>
            
            {studentName && (
              <Text style={celebrationStyles.studentName}>{studentName}</Text>
            )}
            <Text style={celebrationStyles.gotIntoText}>has been awarded</Text>
            
            <View style={celebrationStyles.universityBox}>
              <Text style={celebrationStyles.scholarshipTitle}>{scholarshipName}</Text>
              <Text style={celebrationStyles.providerText}>By: {provider}</Text>
              {coverage && (
                <View style={celebrationStyles.coverageBadge}>
                  <Text style={celebrationStyles.coverageText}>{coverage}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Footer */}
          <View style={celebrationStyles.footer}>
            <Text style={celebrationStyles.hashtags}>#Scholarship #EducationFunding</Text>
            <Text style={celebrationStyles.cta}>Find scholarships on PakUni 💰</Text>
          </View>
        </LinearGradient>
      </View>
    );
  },
);

// ============================================================================
// CELEBRATION STYLES
// ============================================================================

const celebrationStyles = StyleSheet.create({
  container: {
    width: 340,
    borderRadius: RADIUS.xxl,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 12},
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  gradient: {
    padding: SPACING.lg,
    position: 'relative',
  },
  confetti1: {
    position: 'absolute',
    top: 20,
    right: 30,
  },
  confetti2: {
    position: 'absolute',
    top: 80,
    left: 25,
  },
  confetti3: {
    position: 'absolute',
    bottom: 100,
    right: 25,
  },
  confetti4: {
    position: 'absolute',
    bottom: 140,
    left: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  brand: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subBrand: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  mainContent: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  celebrationEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  bigText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
  },
  securedText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: SPACING.md,
  },
  studentName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  gotIntoText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: SPACING.sm,
  },
  universityBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    width: '100%',
  },
  uniShort: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  uniName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 4,
  },
  programName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#FFFFFF',
    marginTop: 8,
    fontWeight: '600',
  },
  yearBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginTop: 8,
  },
  yearText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  testFullName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  scoreBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.lg,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  listBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginBottom: 8,
  },
  listBadgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  positionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 8,
  },
  scholarshipTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  providerText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  coverageBadge: {
    backgroundColor: 'rgba(255,215,0,0.3)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    marginTop: 10,
  },
  coverageText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
    color: '#FFD700',
  },
  footer: {
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    marginTop: SPACING.sm,
  },
  hashtags: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 6,
  },
  cta: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default {
  MeritSuccessCard,
  ComparisonCard,
  PollResultCard,
  AdmissionCelebrationCard,
  EntryTestSuccessCard,
  MeritListCard,
  ScholarshipCelebrationCard,
};

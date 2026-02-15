/**
 * ShareableCard Component - Premium Shareable Cards for Social Media
 * Used for Merit Results, University Comparisons, and other shareable content
 * 
 * Features:
 * - Premium PakUni branding with graduation cap logo
 * - High quality graphics optimized for social sharing
 * - Instagram Story, WhatsApp Status compatible (1080px quality)
 * - Personalized brand colors for scholarships and universities
 * 
 * @author PakUni Team
 * @version 2.1.0
 */

import React, {forwardRef} from 'react';
import {View, Text, StyleSheet, Platform, Image} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from './icons';
import {TYPOGRAPHY, RADIUS, SPACING} from '../constants/design';
import {getUniversityBrandColor, getLogo} from '../utils/universityLogos';
import UniversityLogo from './UniversityLogo';

// SVG file import — the logo artwork is in a standalone .svg file
import PakUniIconWhite from '../assets/svg/pakuni-icon-white.svg';

// ============================================================================
// BRAND CONSTANTS - PakUni Identity
// ============================================================================

const PAKUNI_BRAND = {
  colors: {
    primary: '#4573DF',       // Brand Blue
    primaryDark: '#3660C9',
    primaryLight: '#6B93F0',  // Lighter brand blue
    secondary: '#10B981',     // Emerald
    accent: '#3660C9',        // Darker blue for contrast
    gold: '#F59E0B',          // Amber
    goldLight: '#FBBF24',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  gradients: {
    primary: ['#6B93F0', '#4573DF', '#3660C9'],
    success: ['#10B981', '#059669'],
    premium: ['#6B93F0', '#4573DF', '#3660C9'],
    dark: ['#0B1118', '#010203'],
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
    : 'rgba(69, 115, 223,0.15)';
  
  const iconSize = Math.round(size * 0.75);

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="PakUni logo"
      style={[logoStyles.container, {width: size, height: size, backgroundColor: bgColor, borderRadius: size / 2}]}
    >
      <PakUniIconWhite width={iconSize} height={iconSize} />
    </View>
  );
};

const logoStyles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});

// ============================================================================
// MERIT SUCCESS CARD - "I have X% chance at NUST!"
// ============================================================================

interface MeritSuccessCardProps {
  aggregate: number;
  universityName: string;
  universityShortName: string;
  chance: 'high' | 'medium' | 'low' | 'unlikely';
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
          return 'Strong Chances';
        case 'medium':
          return 'Building Momentum';
        case 'low':
          return 'Room to Grow';
        case 'unlikely':
          return 'Focus Area';
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
        case 'unlikely':
          return '📚';
      }
    };

    const getGradientColors = (): string[] => {
      switch (chance) {
        case 'high':
          return ['#10B981', '#059669', '#047857'];
        case 'medium':
          return ['#4573DF', '#3660C9', '#3730A3'];
        case 'low':
          return ['#F59E0B', '#D97706', '#B45309'];
        case 'unlikely':
          return ['#EF4444', '#DC2626', '#B91C1C'];
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
                colors={['#4573DF', '#3660C9']}
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
          colors={['#4573DF', '#3660C9', '#3660C9']}
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
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  appTagline: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: TYPOGRAPHY.weight.medium,
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
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  highlightText: {
    fontWeight: TYPOGRAPHY.weight.bold,
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
    fontWeight: TYPOGRAPHY.weight.heavy,
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
    fontWeight: TYPOGRAPHY.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  aggregateValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  aggregateValue: {
    fontSize: 56,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#FFFFFF',
    letterSpacing: -2,
  },
  aggregatePercent: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weight.bold,
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
    fontWeight: TYPOGRAPHY.weight.medium,
    marginBottom: 2,
  },
  breakdownValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
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
    fontWeight: TYPOGRAPHY.weight.medium,
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
    fontWeight: TYPOGRAPHY.weight.bold,
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
    backgroundColor: 'rgba(69, 115, 223,0.15)',
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
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#FFFFFF',
  },
  comparisonSubBrand: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: TYPOGRAPHY.weight.medium,
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
    fontWeight: TYPOGRAPHY.weight.heavy,
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
    fontWeight: TYPOGRAPHY.weight.semibold,
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
    fontWeight: TYPOGRAPHY.weight.bold,
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
    fontWeight: TYPOGRAPHY.weight.heavy,
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
    fontWeight: TYPOGRAPHY.weight.semibold,
  },

  // Poll Result Card Styles
  pollContainer: {
    width: 340,
    borderRadius: RADIUS.xxl,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#4573DF',
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
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#FFFFFF',
  },
  pollSubBrand: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: TYPOGRAPHY.weight.medium,
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
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#EF4444',
    letterSpacing: 0.5,
  },
  pollQuestion: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
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
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  pollWinnerName: {
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFD700',
  },
  pollOptionPercent: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.bold,
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
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  pollFooter: {
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  pollCta: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.bold,
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
          colors={['#4573DF', '#3660C9', '#3730A3']}
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
          colors={['#4573DF', '#3660C9', '#3660C9']}
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
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#FFFFFF',
  },
  subBrand: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: TYPOGRAPHY.weight.medium,
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
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#FFFFFF',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
  },
  securedText: {
    fontSize: 28,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#FFFFFF',
    marginBottom: SPACING.md,
  },
  studentName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
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
    fontWeight: TYPOGRAPHY.weight.heavy,
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
    fontWeight: TYPOGRAPHY.weight.semibold,
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
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFFFFF',
  },
  testFullName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
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
    fontWeight: TYPOGRAPHY.weight.heavy,
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
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFFFFF',
  },
  positionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#FFFFFF',
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginTop: 8,
  },
  scholarshipTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
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
    fontWeight: TYPOGRAPHY.weight.bold,
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
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#FFFFFF',
  },
});

// ============================================================================
// PERSONALIZED SCHOLARSHIP CARD - With Real Brand Colors & Logos 🎓💰
// ============================================================================

interface PersonalizedScholarshipCardProps {
  scholarshipName: string;
  provider: string;
  coverage?: string;
  coveragePercentage?: number;
  studentName?: string;
  universityName?: string;
  programName?: string;
  yearAwarded?: string;
}

export const PersonalizedScholarshipCard = forwardRef<View, PersonalizedScholarshipCardProps>(
  ({scholarshipName, provider, coverage, coveragePercentage, studentName, universityName, programName, yearAwarded}, ref) => {
    // Get brand colors based on scholarship/provider name keywords
    const getScholarshipColors = () => {
      const lowerName = (scholarshipName + ' ' + provider).toLowerCase();
      if (lowerName.includes('ehsaas') || lowerName.includes('ehsas')) return { primary: '#059669', secondary: '#D1FAE5' };
      if (lowerName.includes('hec')) return { primary: '#2563EB', secondary: '#DBEAFE' };
      if (lowerName.includes('peef')) return { primary: '#7C3AED', secondary: '#EDE9FE' };
      if (lowerName.includes('pm') || lowerName.includes('prime minister')) return { primary: '#DC2626', secondary: '#FEE2E2' };
      if (lowerName.includes('government') || lowerName.includes('govt')) return { primary: '#059669', secondary: '#D1FAE5' };
      return { primary: '#4573DF', secondary: '#DBEAFE' };
    };
    
    const brandColors = getScholarshipColors();
    const uniColor = universityName ? getUniversityBrandColor(universityName) : null;
    
    // Default gradient using primary and secondary
    const gradientColors: string[] = [brandColors.primary, brandColors.secondary, brandColors.secondary];
    
    // Determine provider type for decorative elements
    const getProviderIcon = () => {
      const lowerName = scholarshipName.toLowerCase();
      if (lowerName.includes('ehsaas') || lowerName.includes('ehsas')) return '🌙';
      if (lowerName.includes('hec')) return '📚';
      if (lowerName.includes('peef')) return '🏛️';
      if (lowerName.includes('lums')) return '🎓';
      if (lowerName.includes('nust')) return '⚙️';
      if (lowerName.includes('sef')) return '📖';
      if (lowerName.includes('bef')) return '📘';
      if (lowerName.includes('pm') || lowerName.includes('prime minister')) return '🇵🇰';
      return '💰';
    };

    const hasUniversity = universityName && universityName.length > 0;

    return (
      <View ref={ref} style={personalizedStyles.container} collapsable={false}>
        <LinearGradient
          colors={gradientColors}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={personalizedStyles.gradient}>
          
          {/* Decorative Pattern */}
          <View style={personalizedStyles.patternOverlay}>
            <View style={personalizedStyles.pattern1} />
            <View style={personalizedStyles.pattern2} />
            <View style={personalizedStyles.pattern3} />
          </View>

          {/* Decorative Elements */}
          <View style={personalizedStyles.confetti1}>
            <Text style={{fontSize: 22}}>{getProviderIcon()}</Text>
          </View>
          <View style={personalizedStyles.confetti2}>
            <Text style={{fontSize: 18}}>✨</Text>
          </View>
          <View style={personalizedStyles.confetti3}>
            <Text style={{fontSize: 16}}>🎓</Text>
          </View>
          
          {/* Header with Logo */}
          <View style={personalizedStyles.header}>
            <PakUniLogoBadge size={40} variant="light" />
            <View style={{marginLeft: 10, flex: 1}}>
              <Text style={personalizedStyles.brand}>PakUni</Text>
              <Text style={personalizedStyles.subBrand}>Scholarship Award Certificate</Text>
            </View>
            {yearAwarded && (
              <View style={personalizedStyles.yearBadge}>
                <Text style={personalizedStyles.yearText}>{yearAwarded}</Text>
              </View>
            )}
          </View>

          {/* Main Content */}
          <View style={personalizedStyles.mainContent}>
            {/* Award Icon */}
            <View style={personalizedStyles.awardIconContainer}>
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                style={personalizedStyles.awardIconBg}>
                <Text style={{fontSize: 42}}>🏆</Text>
              </LinearGradient>
            </View>
            
            <Text style={personalizedStyles.awardedText}>SCHOLARSHIP</Text>
            <Text style={personalizedStyles.awardedSubText}>AWARDED!</Text>
            
            {studentName && (
              <View style={personalizedStyles.studentBadge}>
                <Text style={personalizedStyles.studentName}>{studentName}</Text>
              </View>
            )}
            
            <Text style={personalizedStyles.receivedText}>has been selected for</Text>
            
            {/* Scholarship Box */}
            <View style={personalizedStyles.scholarshipBox}>
              <Text style={personalizedStyles.scholarshipName}>{scholarshipName}</Text>
              <Text style={personalizedStyles.providerName}>by {provider}</Text>
              
              {/* Coverage Badge */}
              {(coverage || coveragePercentage) && (
                <View style={personalizedStyles.coverageBadgeRow}>
                  <LinearGradient
                    colors={['#FFD700', '#FFA500']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={personalizedStyles.coverageBadgeGradient}>
                    <Icon name="star" family="Ionicons" size={14} color="#000" />
                    <Text style={personalizedStyles.coverageBadgeText}>
                      {coveragePercentage ? `${coveragePercentage}% Coverage` : coverage}
                    </Text>
                  </LinearGradient>
                </View>
              )}
            </View>

            {/* University Info if provided */}
            {hasUniversity && (
              <View style={personalizedStyles.universitySection}>
                <Text style={personalizedStyles.atText}>at</Text>
                <View style={[personalizedStyles.universityCard, uniColor && {borderColor: uniColor}]}>
                  <UniversityLogo
                    universityName={universityName}
                    size={44}
                    style={personalizedStyles.uniLogo}
                  />
                  <View style={personalizedStyles.uniInfo}>
                    <Text style={personalizedStyles.uniName} numberOfLines={2}>{universityName}</Text>
                    {programName && (
                      <Text style={personalizedStyles.programText}>{programName}</Text>
                    )}
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={personalizedStyles.footerSection}>
            <View style={personalizedStyles.footerDivider} />
            <Text style={personalizedStyles.hashtags}>
              #Scholarship #{provider.replace(/\s/g, '')} #EducationFunding
            </Text>
            <Text style={personalizedStyles.cta}>Find scholarships on PakUni 📱</Text>
          </View>
        </LinearGradient>
      </View>
    );
  },
);

// ============================================================================
// PERSONALIZED CARD STYLES
// ============================================================================

const personalizedStyles = StyleSheet.create({
  container: {
    width: 360,
    borderRadius: RADIUS.xxl,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 16},
        shadowOpacity: 0.35,
        shadowRadius: 24,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  gradient: {
    paddingVertical: SPACING.lg + 4,
    paddingHorizontal: SPACING.lg,
    position: 'relative',
  },
  patternOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  pattern1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  pattern2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  pattern3: {
    position: 'absolute',
    top: '40%',
    right: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  confetti1: {
    position: 'absolute',
    top: 24,
    right: 24,
  },
  confetti2: {
    position: 'absolute',
    top: 90,
    left: 20,
  },
  confetti3: {
    position: 'absolute',
    bottom: 120,
    right: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  brand: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  subBrand: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: TYPOGRAPHY.weight.medium,
    letterSpacing: 0.3,
  },
  yearBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  yearText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFFFFF',
  },
  mainContent: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  awardIconContainer: {
    marginBottom: SPACING.sm,
  },
  awardIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  awardedText: {
    fontSize: 34,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#FFFFFF',
    letterSpacing: 3,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 6,
  },
  awardedSubText: {
    fontSize: 26,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#FFFFFF',
    marginBottom: SPACING.sm,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 4,
  },
  studentBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  studentName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFFFFF',
  },
  receivedText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: SPACING.md,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  scholarshipBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: RADIUS.lg + 4,
    paddingVertical: SPACING.md + 4,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    width: '100%',
  },
  scholarshipName: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 28,
  },
  providerName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  coverageBadgeRow: {
    marginTop: SPACING.sm + 2,
  },
  coverageBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md + 2,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    gap: 6,
  },
  coverageBadgeText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#000',
  },
  universitySection: {
    marginTop: SPACING.md,
    alignItems: 'center',
    width: '100%',
  },
  atText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  universityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.lg,
    padding: SPACING.sm + 2,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    width: '100%',
  },
  uniLogo: {
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
  },
  uniInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  uniName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFFFFF',
    lineHeight: 18,
  },
  programText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  footerSection: {
    alignItems: 'center',
    paddingTop: SPACING.md,
    marginTop: SPACING.sm,
  },
  footerDivider: {
    width: '60%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: SPACING.sm,
  },
  hashtags: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 6,
  },
  cta: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#FFFFFF',
  },
});

// ============================================================================
// PERSONALIZED MERIT CARD - With University Logo & Brand Colors 🎯
// ============================================================================

interface PersonalizedMeritCardProps {
  aggregate: number;
  universityName: string;
  universityShortName?: string;
  programName?: string;
  chance: 'high' | 'medium' | 'low';
  studentName?: string;
  breakdown?: {
    matricContribution: number;
    interContribution: number;
    testContribution: number;
  };
}

export const PersonalizedMeritCard = forwardRef<View, PersonalizedMeritCardProps>(
  ({aggregate, universityName, universityShortName, programName, chance, studentName, breakdown}, ref) => {
    // Get university brand color
    const uniColor = getUniversityBrandColor(universityName);
    const brandColor = uniColor || PAKUNI_BRAND.colors.primary;
    
    const getChanceConfig = () => {
      switch (chance) {
        case 'high':
          return {
            text: 'Strong Chances',
            emoji: '🎉',
            gradient: [brandColor, shadeColor(brandColor, -20), shadeColor(brandColor, -40)] as [string, string, string],
          };
        case 'medium':
          return {
            text: 'Building Momentum',
            emoji: '📊',
            gradient: [brandColor, shadeColor(brandColor, -15), shadeColor(brandColor, -30)] as [string, string, string],
          };
        case 'low':
          return {
            text: 'Room to Grow',
            emoji: '📈',
            gradient: ['#F59E0B', '#D97706', '#B45309'] as [string, string, string],
          };
      }
    };

    const config = getChanceConfig();

    return (
      <View ref={ref} style={meritPersonalizedStyles.container} collapsable={false}>
        <LinearGradient
          colors={config.gradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={meritPersonalizedStyles.gradient}>
          
          {/* Decorative Elements */}
          <View style={meritPersonalizedStyles.decoCircle1} />
          <View style={meritPersonalizedStyles.decoCircle2} />
          
          {/* Header */}
          <View style={meritPersonalizedStyles.header}>
            <PakUniLogoBadge size={36} variant="light" />
            <View style={{marginLeft: 10, flex: 1}}>
              <Text style={meritPersonalizedStyles.brand}>PakUni</Text>
              <Text style={meritPersonalizedStyles.subBrand}>Merit Calculator</Text>
            </View>
            <Text style={{fontSize: 28}}>{config.emoji}</Text>
          </View>

          {/* University Logo Section */}
          <View style={meritPersonalizedStyles.uniSection}>
            <View style={meritPersonalizedStyles.uniLogoContainer}>
              <UniversityLogo
                universityName={universityName}
                size={64}
                style={meritPersonalizedStyles.uniLogoImage}
              />
            </View>
            <Text style={meritPersonalizedStyles.uniNameText} numberOfLines={2}>
              {universityName}
            </Text>
            {programName && (
              <Text style={meritPersonalizedStyles.programNameText}>{programName}</Text>
            )}
          </View>

          {/* Main Score Section */}
          <View style={meritPersonalizedStyles.scoreSection}>
            {studentName && (
              <Text style={meritPersonalizedStyles.studentText}>{studentName}</Text>
            )}
            <View style={meritPersonalizedStyles.aggregateBox}>
              <Text style={meritPersonalizedStyles.aggregateValue}>{aggregate.toFixed(2)}%</Text>
              <Text style={meritPersonalizedStyles.aggregateLabel}>Merit Aggregate</Text>
            </View>
            <View style={meritPersonalizedStyles.chanceBadge}>
              <Text style={meritPersonalizedStyles.chanceText}>{config.text}</Text>
            </View>
          </View>

          {/* Breakdown */}
          {breakdown && (
            <View style={meritPersonalizedStyles.breakdownRow}>
              <View style={meritPersonalizedStyles.breakdownItem}>
                <Text style={meritPersonalizedStyles.breakdownLabel}>Matric</Text>
                <Text style={meritPersonalizedStyles.breakdownValue}>{breakdown.matricContribution.toFixed(1)}%</Text>
              </View>
              <View style={meritPersonalizedStyles.breakdownDivider} />
              <View style={meritPersonalizedStyles.breakdownItem}>
                <Text style={meritPersonalizedStyles.breakdownLabel}>Inter</Text>
                <Text style={meritPersonalizedStyles.breakdownValue}>{breakdown.interContribution.toFixed(1)}%</Text>
              </View>
              <View style={meritPersonalizedStyles.breakdownDivider} />
              <View style={meritPersonalizedStyles.breakdownItem}>
                <Text style={meritPersonalizedStyles.breakdownLabel}>Test</Text>
                <Text style={meritPersonalizedStyles.breakdownValue}>{breakdown.testContribution.toFixed(1)}%</Text>
              </View>
            </View>
          )}

          {/* Footer */}
          <View style={meritPersonalizedStyles.footerSection}>
            <Text style={meritPersonalizedStyles.hashtag}>
              #{universityShortName || universityName.split(' ')[0]} #MeritCalculation
            </Text>
            <Text style={meritPersonalizedStyles.ctaText}>Calculate yours on PakUni 🎯</Text>
          </View>
        </LinearGradient>
      </View>
    );
  },
);

// Helper function to shade colors
function shadeColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
}

const meritPersonalizedStyles = StyleSheet.create({
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
        elevation: 14,
      },
    }),
  },
  gradient: {
    padding: SPACING.lg,
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
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  brand: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#FFFFFF',
  },
  subBrand: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  uniSection: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  uniLogoContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  uniLogoImage: {
    borderRadius: 32,
  },
  uniNameText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
  },
  programNameText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  studentText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: SPACING.xs,
  },
  aggregateBox: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  aggregateValue: {
    fontSize: 42,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#FFFFFF',
    letterSpacing: -1,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
  },
  aggregateLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: TYPOGRAPHY.weight.medium,
    marginTop: 2,
  },
  chanceBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    marginTop: SPACING.sm,
  },
  chanceText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFFFFF',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: RADIUS.lg,
    padding: SPACING.sm + 2,
    marginBottom: SPACING.md,
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  breakdownValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFFFFF',
    marginTop: 2,
  },
  breakdownDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  footerSection: {
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  hashtag: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  ctaText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
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
  PersonalizedScholarshipCard,
  PersonalizedMeritCard,
};





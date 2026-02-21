/**
 * ResultCard - University recommendation result with match score, tier, badges
 * IMPROVED: Shows Safety/Target/Reach category, merit formula, confidence level
 */

import React, {useEffect, useRef} from 'react';
import {View, Text, TouchableOpacity, Animated, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../../constants/design';
import {Icon} from '../icons';

export interface MatchBreakdown {
  cityMatch: boolean;
  programMatch: boolean;
  typeMatch: boolean;
  academicTier: string;
  meetsMinimum: boolean;
  meritFormula?: string;
}

interface ResultCardProps {
  university: any;
  matchScore: number;
  matchReasons: string[];
  index: number;
  colors: any;
  onViewDetails: () => void;
  tier?: number;
  isReachSchool?: boolean;
  isSafetySchool?: boolean;
  recommendedCategory?: 'safety' | 'target' | 'reach';
  matchBreakdown?: MatchBreakdown;
  meritInsight?: {
    userMerit: number;
    closingMerit: number;
    gapToMerit: number;
    chanceLevel: string;
    confidenceLevel?: string;
    year: number;
    session: string;
  };
  semesterFee?: { openMerit?: number; selfFinance?: number; formatted: string };
  quotaOpportunities?: Array<{ quotaType: string; quotaLabel: string; closingMerit: number; gapPoints: number }>;
}

const getMatchColor = (score: number) => {
  if (score >= 80) return '#27ae60';
  if (score >= 60) return '#f39c12';
  return '#e74c3c';
};

const getTierColor = (t: number) => {
  if (t === 1) return '#9b59b6';
  if (t === 2) return '#3498db';
  if (t === 3) return '#1abc9c';
  return '#95a5a6';
};

const getCategoryConfig = (category?: 'safety' | 'target' | 'reach') => {
  switch (category) {
    case 'safety': return { label: '✅ SAFETY', color: '#16A34A', bg: '#DCFCE7' };
    case 'reach':  return { label: '🎯 REACH',  color: '#DC2626', bg: '#FEE2E2' };
    default:       return { label: '🎓 TARGET', color: '#2563EB', bg: '#DBEAFE' };
  }
};

const getChanceIcon = (level: string) => {
  switch (level) {
    case 'excellent': return { icon: 'checkmark-circle', color: '#16A34A' };
    case 'good':      return { icon: 'thumbs-up',        color: '#22C55E' };
    case 'moderate':  return { icon: 'alert-circle',     color: '#F59E0B' };
    case 'low':       return { icon: 'flag',             color: '#EF4444' };
    default:          return { icon: 'close-circle',     color: '#DC2626' };
  }
};

const ResultCard = ({
  university, matchScore, matchReasons, index, colors,
  onViewDetails, tier, isReachSchool, isSafetySchool,
  recommendedCategory, matchBreakdown, meritInsight, semesterFee, quotaOpportunities,
}: ResultCardProps) => {
  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {toValue: 0, duration: 450, delay: index * 80, useNativeDriver: true}),
      Animated.timing(fadeAnim, {toValue: 1, duration: 450, delay: index * 80, useNativeDriver: true}),
    ]).start();
  }, []);

  const catConfig = getCategoryConfig(recommendedCategory);
  const matchColor = getMatchColor(matchScore);

  return (
    <Animated.View
      style={[
        styles.resultCard,
        {
          backgroundColor: colors.card,
          transform: [{translateY: slideAnim}],
          opacity: fadeAnim,
          borderLeftWidth: 4,
          borderLeftColor: catConfig.color,
        },
      ]}>
      <LinearGradient
        colors={[catConfig.color + '10', 'transparent']}
        style={styles.resultGradient}
      />

      {/* Category Badge */}
      <View style={[styles.categoryBadge, {backgroundColor: catConfig.bg}]}>
        <Text style={[styles.categoryText, {color: catConfig.color}]}>{catConfig.label}</Text>
      </View>

      {/* Tier Badge */}
      {tier && (
        <View style={[styles.tierBadge, {backgroundColor: getTierColor(tier)}]}>
          <Text style={styles.tierText}>T{tier}</Text>
        </View>
      )}

      <View style={styles.resultContent}>
        <View style={styles.resultHeader}>
          <View style={styles.resultInfo}>
            <Text style={[styles.resultName, {color: colors.text}]}>{university.name}</Text>
            <View style={styles.resultMeta}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                <Icon name="location-outline" family="Ionicons" size={13} color={colors.textSecondary} />
                <Text style={[styles.resultCity, {color: colors.textSecondary}]}>{university.city}</Text>
              </View>
              <View style={[styles.resultType, {backgroundColor: university.type === 'public' ? '#22C55E20' : colors.primary + '20'}]}>
                <Text style={{color: university.type === 'public' ? '#16A34A' : colors.primary, fontSize: 10, fontWeight: TYPOGRAPHY.weight.semibold}}>
                  {university.type?.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Fee Comparison */}
            {semesterFee ? (
              <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4, flexWrap: 'wrap'}}>
                <Icon name="cash-outline" family="Ionicons" size={13} color={'#16A34A'} />
                {semesterFee.openMerit ? (
                  <Text style={{fontSize: 11, color: '#16A34A', fontWeight: TYPOGRAPHY.weight.semibold}}>
                    Open: {semesterFee.formatted}/sem
                  </Text>
                ) : null}
                {semesterFee.selfFinance && semesterFee.openMerit ? (
                  <Text style={{fontSize: 10, color: colors.textSecondary}}>•</Text>
                ) : null}
                {semesterFee.selfFinance ? (
                  <Text style={{fontSize: 11, color: colors.textSecondary}}>
                    Self-fin: {semesterFee.selfFinance >= 1000
                      ? `Rs ${(semesterFee.selfFinance/1000).toFixed(0)}K`
                      : `Rs ${semesterFee.selfFinance}`}/sem
                  </Text>
                ) : null}
              </View>
            ) : (
              <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4}}>
                <Icon name="cash-outline" family="Ionicons" size={13} color={'#16A34A'} />
                <Text style={{fontSize: 11, color: colors.textSecondary, fontWeight: TYPOGRAPHY.weight.medium}}>
                  {university.estimatedFeeRange || 'Fee varies by program'}
                </Text>
              </View>
            )}
          </View>

          {/* Match Score */}
          <View style={styles.matchContainer}>
            <View style={[styles.matchCircle, {borderColor: matchColor}]}>
              <Text style={[styles.matchScore, {color: matchColor}]}>{matchScore}%</Text>
            </View>
            <Text style={[styles.matchLabel, {color: colors.textSecondary}]}>Match</Text>
          </View>
        </View>

        {/* Merit Score Banner */}
        {meritInsight && (
          <View style={[styles.meritBanner, {backgroundColor: colors.background, borderColor: colors.border}]}>
            <View style={styles.meritRow}>
              <View style={styles.meritItem}>
                <Text style={[styles.meritLabel, {color: colors.textSecondary}]}>Your Merit</Text>
                <Text style={[styles.meritValue, {color: matchColor}]}>{meritInsight.userMerit.toFixed(1)}%</Text>
              </View>
              <View style={[styles.meritDivider, {backgroundColor: colors.border}]} />
              <View style={styles.meritItem}>
                <Text style={[styles.meritLabel, {color: colors.textSecondary}]}>Closing Merit</Text>
                <Text style={[styles.meritValue, {color: colors.text}]}>{meritInsight.closingMerit}%</Text>
              </View>
              <View style={[styles.meritDivider, {backgroundColor: colors.border}]} />
              <View style={styles.meritItem}>
                <Text style={[styles.meritLabel, {color: colors.textSecondary}]}>Gap</Text>
                <Text style={[styles.meritValue, {color: meritInsight.gapToMerit >= 0 ? '#16A34A' : '#EF4444'}]}>
                  {meritInsight.gapToMerit >= 0 ? '+' : ''}{meritInsight.gapToMerit.toFixed(1)}%
                </Text>
              </View>
            </View>
            {matchBreakdown?.meritFormula && (
              <Text style={[styles.formulaText, {color: colors.textSecondary}]}>
                Formula: {matchBreakdown.meritFormula}
              </Text>
            )}
          </View>
        )}

        {/* Quota Opportunity Pills */}
        {quotaOpportunities && quotaOpportunities.length > 0 && (
          <View style={[styles.quotaPillsRow]}>
            <Icon name="ribbon-outline" family="Ionicons" size={12} color={'#7C3AED'} />
            {quotaOpportunities.slice(0, 3).map((qo, idx) => (
              <View
                key={idx}
                style={[styles.quotaPill, {
                  backgroundColor: qo.gapPoints >= 0 ? '#7C3AED15' : '#F59E0B15',
                  borderColor: qo.gapPoints >= 0 ? '#7C3AED' : '#F59E0B',
                }]}>
                <Text style={[styles.quotaPillText, {color: qo.gapPoints >= 0 ? '#7C3AED' : '#B45309'}]}>
                  {qo.quotaLabel}{qo.gapPoints >= 0 ? ' ✓' : ''}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Why this matches */}
        <View style={[styles.matchReasons, {backgroundColor: colors.background}]}>
          <Text style={[styles.matchReasonsTitle, {color: colors.text}]}>Why this matches you:</Text>
          {matchReasons.slice(0, 4).map((reason, idx) => (
            <Text key={idx} style={[styles.matchReason, {color: colors.textSecondary}]}>{reason}</Text>
          ))}
        </View>

        <TouchableOpacity style={[styles.viewDetailBtn, {backgroundColor: catConfig.color + '15', borderColor: catConfig.color}]} onPress={onViewDetails}>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6}}>
            <Text style={[styles.viewDetailText, {color: catConfig.color}]}>View University Details</Text>
            <Icon name="arrow-forward" family="Ionicons" size={16} color={catConfig.color} />
          </View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  resultCard: {
    borderRadius: RADIUS.xl, marginBottom: SPACING.md, overflow: 'hidden',
    elevation: 4, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 8,
  },
  resultGradient: {...StyleSheet.absoluteFillObject},
  categoryBadge: {
    position: 'absolute', top: SPACING.sm, right: SPACING.sm,
    paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.full,
  },
  categoryText: {fontSize: 11, fontWeight: TYPOGRAPHY.weight.bold},
  tierBadge: {
    position: 'absolute', top: SPACING.sm, left: SPACING.sm,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.full,
  },
  tierText: {color: '#fff', fontSize: 10, fontWeight: TYPOGRAPHY.weight.bold},
  resultContent: {padding: SPACING.md, paddingTop: SPACING.xl + 4},
  resultHeader: {flexDirection: 'row', marginBottom: SPACING.sm},
  resultInfo: {flex: 1},
  resultName: {fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.bold, marginBottom: 4},
  resultMeta: {flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flexWrap: 'wrap'},
  resultCity: {fontSize: 12},
  resultType: {paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6},
  matchContainer: {alignItems: 'center', marginLeft: SPACING.sm},
  matchCircle: {width: 54, height: 54, borderRadius: 27, borderWidth: 3, alignItems: 'center', justifyContent: 'center'},
  matchScore: {fontSize: 14, fontWeight: TYPOGRAPHY.weight.bold},
  matchLabel: {fontSize: 10, marginTop: 2},
  meritBanner: {borderWidth: 1, borderRadius: RADIUS.lg, padding: SPACING.sm, marginBottom: SPACING.sm},
  meritRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around'},
  meritItem: {alignItems: 'center', flex: 1},
  meritLabel: {fontSize: 10, marginBottom: 2},
  meritValue: {fontSize: 14, fontWeight: TYPOGRAPHY.weight.bold},
  meritDivider: {width: 1, height: 28, marginHorizontal: 4},
  formulaText: {fontSize: 10, marginTop: 6, textAlign: 'center', fontStyle: 'italic'},
  matchReasons: {padding: SPACING.sm, borderRadius: RADIUS.md, marginBottom: SPACING.sm},
  matchReasonsTitle: {fontSize: 12, fontWeight: TYPOGRAPHY.weight.semibold, marginBottom: 4},
  matchReason: {fontSize: 11, marginBottom: 2, lineHeight: 16},
  viewDetailBtn: {borderWidth: 1.5, borderRadius: RADIUS.lg, paddingVertical: SPACING.sm + 2, alignItems: 'center'},
  viewDetailText: {fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.bold},
  quotaPillsRow: {flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: SPACING.sm},
  quotaPill: {borderWidth: 1, borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3},
  quotaPillText: {fontSize: 10, fontWeight: TYPOGRAPHY.weight.semibold},
});

export default React.memo(ResultCard);

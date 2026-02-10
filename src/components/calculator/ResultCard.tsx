import React, {useRef, useEffect} from 'react';
import {View, Text, TouchableOpacity, Animated, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '../icons';
import {TYPOGRAPHY, SPACING, RADIUS, ANIMATION} from '../../constants/design';
import type {CalculationResult} from '../../types/calculator';

interface ResultCardProps {
  result: CalculationResult;
  index: number;
  isTop: boolean;
  colors: any;
  isDark: boolean;
  onShare: (result: CalculationResult) => void;
}

const ResultCard = React.memo(({
  result,
  index,
  isTop,
  colors,
  isDark,
  onShare,
}: ResultCardProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 150,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay: index * 150,
        ...ANIMATION.spring.gentle,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: index * 150,
        ...ANIMATION.spring.bouncy,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getAggregateGradient = (aggregate: number) => {
    if (aggregate >= 90) return ['#10B981', '#059669'];
    if (aggregate >= 80) return ['#4573DF', '#3660C9'];
    if (aggregate >= 70) return ['#4573DF', '#3660C9'];
    if (aggregate >= 60) return ['#F59E0B', '#D97706'];
    return ['#EF4444', '#DC2626'];
  };

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{translateY: slideAnim}, {scale: scaleAnim}],
        },
      ]}>
      <View
        style={[
          styles.resultCard,
          {
            backgroundColor: colors.card,
            borderColor: isTop ? colors.primary : 'transparent',
            borderWidth: isTop ? 2 : 0,
          },
        ]}>
        {/* Best Match Badge */}
        {isTop && (
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.bestBadge}>
            <View style={styles.bestBadgeContent}>
              <Icon name="trophy-outline" family="Ionicons" size={12} color="#000" />
              <Text style={styles.bestBadgeText}> BEST MATCH</Text>
            </View>
          </LinearGradient>
        )}

        {/* Formula Info */}
        <View style={styles.resultHeader}>
          <View style={styles.resultInfo}>
            <Text style={[styles.resultFormulaName, {color: colors.text}]}>
              {result.formula.name}
            </Text>
            <Text style={[styles.resultUniversity, {color: colors.textSecondary}]}>
              {result.formula.university}
            </Text>
          </View>
        </View>

        {/* Aggregate Display */}
        <LinearGradient
          colors={getAggregateGradient(result.aggregate)}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.aggregateBox}>
          <Text style={styles.aggregateLabel}>Your Aggregate</Text>
          <View style={styles.aggregateValueRow}>
            <Text style={styles.aggregateValue}>
              {result.aggregate.toFixed(2)}
            </Text>
            <Text style={styles.aggregatePercent}>%</Text>
          </View>
        </LinearGradient>

        {/* Breakdown */}
        <View style={[styles.breakdownSection, {backgroundColor: isDark ? colors.background : '#F8FAFC'}]}>
          <Text style={[styles.breakdownTitle, {color: colors.textSecondary}]}>
            Score Breakdown
          </Text>

          <View style={styles.breakdownRow}>
            <View style={styles.breakdownItem}>
              <Text style={[styles.breakdownLabel, {color: colors.textSecondary}]}>
                Matric ({result.formula.matric_weightage}%)
              </Text>
              <Text style={[styles.breakdownValue, {color: colors.text}]}>
                {result.breakdown.matricContribution.toFixed(2)}
              </Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={[styles.breakdownLabel, {color: colors.textSecondary}]}>
                Inter ({result.formula.inter_weightage}%)
              </Text>
              <Text style={[styles.breakdownValue, {color: colors.text}]}>
                {result.breakdown.interContribution.toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={styles.breakdownRow}>
            {result.formula.entry_test_weightage > 0 && (
              <View style={styles.breakdownItem}>
                <Text style={[styles.breakdownLabel, {color: colors.textSecondary}]}>
                  Test ({result.formula.entry_test_weightage}%)
                </Text>
                <Text style={[styles.breakdownValue, {color: colors.text}]}>
                  {result.breakdown.testContribution.toFixed(2)}
                </Text>
              </View>
            )}
            {result.breakdown.hafizBonus > 0 && (
              <View style={styles.breakdownItem}>
                <Text style={[styles.breakdownLabel, {color: colors.textSecondary}]}>
                  Hafiz Bonus
                </Text>
                <Text style={[styles.breakdownValue, {color: colors.success}]}>
                  +{result.breakdown.hafizBonus}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Share Button */}
        <TouchableOpacity
          style={[styles.shareResultBtn, {backgroundColor: `${colors.primary}10`, borderColor: colors.primary}]}
          onPress={() => onShare(result)}
          activeOpacity={0.8}>
          <Icon name="share-social-outline" family="Ionicons" size={18} color={colors.primary} />
          <Text style={[styles.shareResultBtnText, {color: colors.primary}]}>
            Share My Score
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  resultCard: {
    borderRadius: RADIUS.xxl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  bestBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderBottomLeftRadius: RADIUS.lg,
  },
  bestBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bestBadgeText: {
    color: '#000',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.heavy,
  },
  resultHeader: {
    marginBottom: SPACING.md,
  },
  resultInfo: {},
  resultFormulaName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  resultUniversity: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
    marginTop: 2,
  },
  aggregateBox: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  aggregateLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: 4,
  },
  aggregateValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  aggregateValue: {
    color: '#FFFFFF',
    fontSize: 52,
    fontWeight: TYPOGRAPHY.weight.heavy,
    letterSpacing: -1,
  },
  aggregatePercent: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: 8,
    marginLeft: 2,
  },
  breakdownSection: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  breakdownTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  breakdownItem: {
    flex: 1,
    marginBottom: SPACING.xs,
  },
  breakdownLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  breakdownValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginTop: 2,
  },
  shareResultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  shareResultBtnText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
});

export default ResultCard;

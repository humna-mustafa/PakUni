/**
 * CareerResultCard - Animated result with rank, progress bar, and career details
 */

import React, {useRef, useEffect} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '../icons';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../../constants/design';
import {CAREER_METADATA} from './data';

const RESULT_COLORS = ['#27ae60', '#4573DF', '#9b59b6', '#e67e22'];

interface CareerResultCardProps {
  career: string;
  careerId: string;
  percentage: number;
  index: number;
  colors: any;
}

export const CareerResultCard: React.FC<CareerResultCardProps> = React.memo(({
  career, careerId, percentage, index, colors,
}) => {
  const slideAnim = useRef(new Animated.Value(100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const color = RESULT_COLORS[index] || RESULT_COLORS[3];
  const meta = CAREER_METADATA[careerId];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {toValue: 0, duration: 500, delay: index * 200, useNativeDriver: true}),
      Animated.timing(fadeAnim, {toValue: 1, duration: 500, delay: index * 200, useNativeDriver: true}),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.resultCard, {backgroundColor: colors.card, transform: [{translateY: slideAnim}], opacity: fadeAnim}]}>
      <LinearGradient colors={[color + '15', 'transparent']} style={styles.resultGradient} />
      {index === 0 && (
        <View style={[styles.topBadge, {backgroundColor: color}]}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
            <Icon name="trophy" family="Ionicons" size={14} color="#FFFFFF" />
            <Text style={styles.topBadgeText}>Best Match</Text>
          </View>
        </View>
      )}
      <View style={styles.resultContent}>
        <View style={[styles.resultRank, {backgroundColor: color}]}>
          <Text style={styles.resultRankText}>#{index + 1}</Text>
        </View>
        <View style={styles.resultInfo}>
          <Text style={[styles.resultName, {color: colors.text}]}>{career}</Text>
          <View style={styles.resultBarContainer}>
            <View style={[styles.resultBar, {backgroundColor: colors.background}]}>
              <View style={[styles.resultBarFill, {backgroundColor: color, width: `${percentage}%`}]} />
            </View>
            <Text style={[styles.resultPercent, {color}]}>{percentage}%</Text>
          </View>
        </View>
      </View>

      {/* Career Metadata */}
      {meta && (
        <View style={[styles.metaSection, {borderTopColor: colors.border}]}>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Icon name="create-outline" family="Ionicons" size={12} color={colors.textSecondary} />
              <Text style={[styles.metaLabel, {color: colors.textSecondary}]}>Entry Test</Text>
              <Text style={[styles.metaValue, {color: colors.text}]}>{meta.entryTest}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Icon name="cash-outline" family="Ionicons" size={12} color={colors.textSecondary} />
              <Text style={[styles.metaLabel, {color: colors.textSecondary}]}>Salary (PK)</Text>
              <Text style={[styles.metaValue, {color: colors.text}]}>{meta.salaryRange}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Icon name="trending-up-outline" family="Ionicons" size={12} color={meta.outlookColor} />
              <Text style={[styles.metaLabel, {color: colors.textSecondary}]}>Demand</Text>
              <Text style={[styles.metaValue, {color: meta.outlookColor}]}>{meta.outlook}</Text>
            </View>
          </View>
          <View style={[styles.uniRow, {backgroundColor: colors.background}]}>
            <Icon name="school-outline" family="Ionicons" size={12} color={color} />
            <Text style={[styles.uniText, {color: colors.textSecondary}]}>Top unis: </Text>
            <Text style={[styles.uniValue, {color: colors.text}]}>{meta.topUniversities}</Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  resultCard: {borderRadius: RADIUS.lg, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 6},
  resultGradient: {...StyleSheet.absoluteFillObject},
  topBadge: {position: 'absolute', top: 0, right: 0, paddingHorizontal: SPACING.md, paddingVertical: 6, borderBottomLeftRadius: RADIUS.md},
  topBadgeText: {color: '#fff', fontSize: 11, fontWeight: TYPOGRAPHY.weight.bold},
  resultContent: {flexDirection: 'row', alignItems: 'center', padding: SPACING.md},
  resultRank: {width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md},
  resultRankText: {color: '#fff', fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.bold},
  resultInfo: {flex: 1},
  resultName: {fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.bold, marginBottom: 6},
  resultBarContainer: {flexDirection: 'row', alignItems: 'center'},
  resultBar: {flex: 1, height: 8, borderRadius: 4, overflow: 'hidden', marginRight: SPACING.sm},
  resultBarFill: {height: '100%', borderRadius: 4},
  resultPercent: {fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.bold, minWidth: 45, textAlign: 'right'},
  metaSection: {borderTopWidth: 1, paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm},
  metaRow: {flexDirection: 'row', justifyContent: 'space-around', paddingVertical: SPACING.sm},
  metaItem: {alignItems: 'center', flex: 1, gap: 2},
  metaLabel: {fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600'},
  metaValue: {fontSize: 11, fontWeight: TYPOGRAPHY.weight.bold, textAlign: 'center'},
  metaDivider: {width: 1, backgroundColor: 'rgba(0,0,0,0.08)', marginVertical: 4},
  uniRow: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.sm, paddingVertical: 6, borderRadius: RADIUS.sm, gap: 4},
  uniText: {fontSize: 11},
  uniValue: {fontSize: 11, fontWeight: '600', flex: 1},
});

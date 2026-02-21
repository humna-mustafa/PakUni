/**
 * ComparisonRow - Animated row showing a metric across universities
 */

import React, {useRef, useEffect} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {Icon} from '../icons';
import {UniversityData} from '../../data';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY} from '../../constants/design';
import {ComparisonMetric, getMetricValue} from './data';

interface ComparisonRowProps {
  metric: ComparisonMetric;
  universities: (UniversityData | null)[];
  colors: any;
  index: number;
}

export const ComparisonRow: React.FC<ComparisonRowProps> = React.memo(({
  metric, universities, colors, index,
}) => {
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {toValue: 0, duration: 400, delay: index * 80, useNativeDriver: true}),
      Animated.timing(fadeAnim, {toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true}),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.comparisonRow,
        {
          backgroundColor: index % 2 === 0 ? colors.card : colors.background,
          transform: [{translateX: slideAnim}],
          opacity: fadeAnim,
        },
      ]}>
      <View style={styles.metricLabel}>
        <Icon name={metric.iconName} family="Ionicons" size={16} color={colors.primary} />
        <Text style={[styles.metricText, {color: colors.text}]}>{metric.label}</Text>
      </View>
      <View style={styles.valuesContainer}>
        {universities.map((uni, i) => (
          <View key={i} style={styles.valueCell}>
            <Text style={[styles.valueText, {
              color: uni ? colors.text : colors.textMuted,
              fontWeight: uni ? '600' : '400',
            }]}>
              {getMetricValue(uni, metric.key)}
            </Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  comparisonRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
  },
  metricLabel: {flexDirection: 'row', alignItems: 'center', width: 100, gap: 6},
  metricText: {fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.medium},
  valuesContainer: {flex: 1, flexDirection: 'row'},
  valueCell: {flex: 1, alignItems: 'center'},
  valueText: {fontSize: TYPOGRAPHY.sizes.sm, textAlign: 'center'},
});

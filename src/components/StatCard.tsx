/**
 * StatCard Component
 * Displays statistics with optional trend indicator
 */

import React from 'react';
import {View, Text, StyleSheet, ViewStyle} from 'react-native';
import {COLORS, FONTS, SPACING, BORDER_RADIUS} from '../constants/theme';
import {SHADOWS} from '../constants/shadows';

interface StatCardProps {
  value: string | number;
  label: string;
  icon?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
  style?: ViewStyle;
  compact?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  icon,
  trend,
  color = COLORS.primary,
  style,
  compact = false,
}) => {
  return (
    <View style={[styles.container, compact && styles.compact, style]}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={[styles.value, {color}]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {trend && (
        <View
          style={[
            styles.trendContainer,
            {backgroundColor: trend.isPositive ? '#E8F5E9' : '#FFEBEE'},
          ]}>
          <Text
            style={[
              styles.trendText,
              {color: trend.isPositive ? '#2E7D32' : '#C62828'},
            ]}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </Text>
        </View>
      )}
    </View>
  );
};

// Stat Row for horizontal display
interface StatRowProps {
  stats: {value: string | number; label: string; icon?: string}[];
  style?: ViewStyle;
}

export const StatRow: React.FC<StatRowProps> = ({stats, style}) => {
  return (
    <View style={[styles.row, style]}>
      {stats.map((stat, index) => (
        <View
          key={index}
          style={[styles.rowItem, index < stats.length - 1 && styles.rowItemBorder]}>
          {stat.icon && <Text style={styles.rowIcon}>{stat.icon}</Text>}
          <Text style={styles.rowValue}>{stat.value}</Text>
          <Text style={styles.rowLabel}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  compact: {
    padding: SPACING.sm,
  },
  icon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  value: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
  },
  label: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  trendContainer: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.xs,
  },
  trendText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  rowItem: {
    flex: 1,
    alignItems: 'center',
  },
  rowItemBorder: {
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  rowIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  rowValue: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  rowLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

export default StatCard;

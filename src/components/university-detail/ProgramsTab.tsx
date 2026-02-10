/**
 * ProgramsTab - University programs listing
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {TYPOGRAPHY, SPACING, RADIUS, GRADIENTS} from '../../constants/design';
import {Icon} from '../icons';
import type {ProgramData} from '../../data';

// Fallback LinearGradient
let LinearGradient: React.ComponentType<any>;
try {
  LinearGradient = require('react-native-linear-gradient').default;
} catch {
  LinearGradient = ({children, style, colors}: any) => (
    <View style={[style, {backgroundColor: colors?.[0] || '#667eea'}]}>
      {children}
    </View>
  );
}

interface ProgramsTabProps {
  university: {short_name?: string; name?: string};
  programs: ProgramData[];
  colors: any;
  isDark: boolean;
}

const ProgramsTab: React.FC<ProgramsTabProps> = ({
  university,
  programs,
  colors,
  isDark,
}) => {
  return (
    <View style={styles.tabContent}>
      <Text style={[styles.programsNote, {color: colors.textSecondary}]}>
        {programs.length} Programs at{' '}
        {university?.short_name || university?.name || 'University'}
      </Text>
      {programs.map((program, index) => (
        <View
          key={program.id}
          style={[
            styles.programCard,
            {
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.05)'
                : colors.card,
            },
          ]}>
          <View style={styles.programHeader}>
            <LinearGradient
              colors={
                program.field === 'Medical'
                  ? ['#EF4444', '#DC2626']
                  : program.field === 'Engineering'
                  ? ['#F59E0B', '#D97706']
                  : program.field === 'Computer Science'
                  ? ['#4573DF', '#3660C9']
                  : program.field === 'Business'
                  ? ['#10B981', '#059669']
                  : GRADIENTS.primary
              }
              style={styles.programIcon}>
              <Icon
                name={
                  program.field === 'Medical'
                    ? 'medkit'
                    : program.field === 'Engineering'
                    ? 'construct'
                    : program.field === 'Computer Science'
                    ? 'laptop'
                    : program.field === 'Business'
                    ? 'briefcase'
                    : 'library'
                }
                family="Ionicons"
                size={24}
                color="#FFFFFF"
              />
            </LinearGradient>
            <View style={styles.programInfo}>
              <Text style={[styles.programName, {color: colors.text}]}>
                {program.degree_title}
              </Text>
              <Text style={[styles.programFullName, {color: colors.textSecondary}]}>
                {program.name}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.programDetails,
              {
                backgroundColor: isDark
                  ? 'rgba(255,255,255,0.03)'
                  : 'rgba(0,0,0,0.02)',
              },
            ]}>
            <View style={styles.programDetail}>
              <Icon name="time-outline" family="Ionicons" size={16} color={colors.textSecondary} />
              <Text style={[styles.detailValue, {color: colors.text}]}>
                {program.duration_years || '-'} Years
              </Text>
            </View>
            <View style={[styles.programDetailDivider, {backgroundColor: colors.border}]} />
            <View style={styles.programDetail}>
              <Icon name="cash-outline" family="Ionicons" size={16} color={colors.textSecondary} />
              <Text style={[styles.detailValue, {color: colors.text}]}>
                PKR {((program.avg_fee_per_semester || 0) / 1000).toFixed(0)}K/sem
              </Text>
            </View>
          </View>

          <View style={styles.eligibilitySection}>
            <View style={[styles.eligibilityChip, {backgroundColor: `${colors.success}15`}]}>
              <View style={styles.eligibilityContent}>
                <Icon name="checkmark" family="Ionicons" size={14} color={colors.success} />
                <Text style={[styles.eligibilityText, {color: colors.success}]}>
                  {program.eligibility || 'Contact university'}
                </Text>
              </View>
            </View>
            {program.entry_test && (
              <View style={[styles.eligibilityChip, {backgroundColor: `${colors.primary}15`}]}>
                <View style={styles.eligibilityContent}>
                  <Icon name="document-text-outline" family="Ionicons" size={14} color={colors.primary} />
                  <Text style={[styles.eligibilityText, {color: colors.primary}]}>
                    {program.entry_test}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tabContent: {
    padding: SPACING.md,
  },
  programsNote: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: SPACING.md,
  },
  programCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  programHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  programIcon: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  programInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  programName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  programFullName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 2,
  },
  programDetails: {
    flexDirection: 'row',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  programDetail: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  programDetailDivider: {
    width: 1,
    height: 24,
  },
  detailValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  eligibilitySection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  eligibilityChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  eligibilityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eligibilityText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
});

export default React.memo(ProgramsTab);

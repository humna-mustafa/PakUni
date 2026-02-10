/**
 * MeritsTab - Merit history, stats, program-wise merit lists
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {TYPOGRAPHY, SPACING, RADIUS} from '../../constants/design';
import {Icon} from '../icons';
import type {MeritSummary} from '../../types/universityDetail';

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

interface MeritsTabProps {
  meritSummary: MeritSummary;
  colors: any;
  isDark: boolean;
}

const MeritsTab: React.FC<MeritsTabProps> = ({meritSummary, colors, isDark}) => {
  const meritPrograms = meritSummary?.programs || [];
  const meritYears = meritSummary?.years || [];
  const totalRecords = meritSummary?.totalRecords || 0;
  const trend = meritSummary?.trend || null;

  return (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="trending-up-outline" family="Ionicons" size={22} color={colors.primary} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Merit History</Text>
        </View>

        {meritPrograms.length === 0 ? (
          <View style={[styles.emptyState, {backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.card}]}>
            <Icon name="analytics-outline" family="Ionicons" size={48} color={colors.textMuted || colors.textSecondary} />
            <Text style={[styles.emptyText, {color: colors.text}]}>No merit data available yet</Text>
            <Text style={[styles.emptySubtext, {color: colors.textSecondary}]}>
              Merit records for this university will be available soon
            </Text>
          </View>
        ) : (
          <>
            {/* Overall Stats */}
            <View style={[styles.statsCard, {backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.card, marginBottom: SPACING.md}]}>
              <View style={styles.meritStatsRow}>
                <View style={styles.meritStatItem}>
                  <Text style={[styles.meritStatValue, {color: colors.primary}]}>{meritPrograms.length}</Text>
                  <Text style={[styles.meritStatLabel, {color: colors.textSecondary}]}>Programs</Text>
                </View>
                <View style={styles.meritStatItem}>
                  <Text style={[styles.meritStatValue, {color: colors.primary}]}>{meritYears.length}</Text>
                  <Text style={[styles.meritStatLabel, {color: colors.textSecondary}]}>Years Data</Text>
                </View>
                <View style={styles.meritStatItem}>
                  <Text style={[styles.meritStatValue, {color: colors.primary}]}>{totalRecords}</Text>
                  <Text style={[styles.meritStatLabel, {color: colors.textSecondary}]}>Records</Text>
                </View>
              </View>

              {trend && (
                <View style={styles.trendBadgeContainer}>
                  <LinearGradient
                    colors={
                      trend === 'increasing'
                        ? ['#EF4444', '#F87171']
                        : trend === 'decreasing'
                        ? ['#10B981', '#34D399']
                        : ['#6B7280', '#9CA3AF']
                    }
                    style={styles.trendBadge}>
                    <Icon
                      name={
                        trend === 'increasing'
                          ? 'trending-up'
                          : trend === 'decreasing'
                          ? 'trending-down'
                          : 'remove'
                      }
                      family="Ionicons"
                      size={14}
                      color="#FFFFFF"
                    />
                    <Text style={styles.trendBadgeText}>
                      {trend === 'increasing'
                        ? 'Merit Rising'
                        : trend === 'decreasing'
                        ? 'Merit Dropping'
                        : 'Stable'}
                    </Text>
                  </LinearGradient>
                </View>
              )}
            </View>

            {/* Program-wise Merit List */}
            {meritPrograms.map((program, progIndex) => {
              const programName = program?.programName || 'Unknown Program';
              const programCategory = program?.category || 'General';
              const programYears = program?.years || [];

              return (
                <View
                  key={programName + progIndex}
                  style={[styles.meritProgramCard, {backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.card}]}>
                  <View style={styles.meritProgramHeader}>
                    <View style={[styles.programIconBg, {backgroundColor: `${colors.primary}15`}]}>
                      <Icon name="school-outline" family="Ionicons" size={20} color={colors.primary} />
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={[styles.meritProgramName, {color: colors.text}]}>{programName}</Text>
                      <Text style={[styles.meritProgramMeta, {color: colors.textSecondary}]}>
                        {programCategory} • {programYears.length} years data
                      </Text>
                    </View>
                  </View>

                  {/* Year-wise merits */}
                  <View style={styles.yearMeritsContainer}>
                    {programYears
                      .sort((a, b) => (b?.year || 0) - (a?.year || 0))
                      .slice(0, 5)
                      .map((yearData, idx) => {
                        const year = yearData?.year || 'N/A';
                        const closingMerit = yearData?.closingMerit || 0;
                        const list2Merit = yearData?.list2Merit;
                        const list3Merit = yearData?.list3Merit;

                        return (
                          <View key={`${year}-${idx}`} style={styles.yearMeritRow}>
                            <Text style={[styles.yearLabel, {color: colors.textSecondary}]}>{year}</Text>
                            <View style={styles.meritValuesRow}>
                              <View style={styles.meritValueItem}>
                                <Text style={[styles.meritValueLabel, {color: colors.textMuted || colors.textSecondary}]}>
                                  List 1
                                </Text>
                                <Text style={[styles.meritValue, {color: colors.text}]}>
                                  {closingMerit.toFixed(1)}%
                                </Text>
                              </View>
                              {list2Merit != null && (
                                <View style={styles.meritValueItem}>
                                  <Text style={[styles.meritValueLabel, {color: colors.textMuted || colors.textSecondary}]}>
                                    List 2
                                  </Text>
                                  <Text style={[styles.meritValue, {color: colors.textSecondary}]}>
                                    {list2Merit.toFixed(1)}%
                                  </Text>
                                </View>
                              )}
                              {list3Merit != null && (
                                <View style={styles.meritValueItem}>
                                  <Text style={[styles.meritValueLabel, {color: colors.textMuted || colors.textSecondary}]}>
                                    List 3
                                  </Text>
                                  <Text style={[styles.meritValue, {color: colors.textSecondary}]}>
                                    {list3Merit.toFixed(1)}%
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                        );
                      })}
                  </View>
                </View>
              );
            })}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContent: {
    padding: SPACING.md,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  emptyState: {
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
  statsCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  meritStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
  },
  meritStatItem: {
    alignItems: 'center',
  },
  meritStatValue: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  meritStatLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 4,
  },
  trendBadgeContainer: {
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.2)',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  trendBadgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#FFFFFF',
  },
  meritProgramCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  meritProgramHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  programIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  meritProgramName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  meritProgramMeta: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
  },
  yearMeritsContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.15)',
    paddingTop: SPACING.sm,
  },
  yearMeritRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  yearLabel: {
    width: 50,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  meritValuesRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.md,
  },
  meritValueItem: {
    alignItems: 'center',
    minWidth: 50,
  },
  meritValueLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  meritValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
});

export default React.memo(MeritsTab);

/**
 * ScholarshipsTab - Scholarship cards with coverage badges and apply buttons
 */

import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {TYPOGRAPHY, SPACING, RADIUS, GRADIENTS} from '../../constants/design';
import {Icon} from '../icons';
import type {ScholarshipData} from '../../data';

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

interface ScholarshipsTabProps {
  university: {website?: string};
  scholarships: ScholarshipData[];
  colors: any;
  isDark: boolean;
  openLink: (url?: string) => void;
}

/** Extracted coverage detail chips to avoid IIFE re-creation per render */
const CoverageDetails = React.memo(({
  scholarship,
  tuitionCoverage,
  colors,
}: {
  scholarship: ScholarshipData;
  tuitionCoverage: number;
  colors: any;
}) => {
  const coverageType = scholarship?.coverageType || '';
  const otherBenefits = scholarship?.otherBenefits || [];
  const coversTuition =
    coverageType === 'full' || coverageType === 'tuition' || tuitionCoverage > 0;
  const coversHostel =
    coverageType === 'full' ||
    otherBenefits.some(
      (b: string) =>
        (b?.toLowerCase() || '').includes('hostel') ||
        (b?.toLowerCase() || '').includes('accommodation'),
    );
  const coversBooks = otherBenefits.some((b: string) =>
    (b?.toLowerCase() || '').includes('book'),
  );

  return (
    <View style={styles.coverageDetails}>
      {coversTuition && (
        <View style={[styles.coverageChip, {backgroundColor: `${colors.success}10`, flexDirection: 'row', alignItems: 'center', gap: 4}]}>
          <Icon name="checkmark-circle" family="Ionicons" size={14} color={colors.success} />
          <Text style={[styles.coverageChipText, {color: colors.success}]}>Tuition</Text>
        </View>
      )}
      {coversHostel && (
        <View style={[styles.coverageChip, {backgroundColor: `${colors.success}10`, flexDirection: 'row', alignItems: 'center', gap: 4}]}>
          <Icon name="checkmark-circle" family="Ionicons" size={14} color={colors.success} />
          <Text style={[styles.coverageChipText, {color: colors.success}]}>Hostel</Text>
        </View>
      )}
      {coversBooks && (
        <View style={[styles.coverageChip, {backgroundColor: `${colors.success}10`, flexDirection: 'row', alignItems: 'center', gap: 4}]}>
          <Icon name="checkmark-circle" family="Ionicons" size={14} color={colors.success} />
          <Text style={[styles.coverageChipText, {color: colors.success}]}>Books</Text>
        </View>
      )}
    </View>
  );
});

const ScholarshipsTab: React.FC<ScholarshipsTabProps> = ({
  university,
  scholarships,
  colors,
  isDark,
  openLink,
}) => {
  const scholarshipsCount = scholarships?.length || 0;

  return (
    <View style={styles.tabContent}>
      <View style={styles.scholarshipsHeader}>
        <Text style={[styles.scholarshipsNote, {color: colors.textSecondary}]}>
          {scholarshipsCount} scholarship{scholarshipsCount !== 1 ? 's' : ''} available
        </Text>
      </View>

      {scholarshipsCount === 0 ? (
        <View style={[styles.emptyState, {backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.card}]}>
          <Icon name="wallet-outline" family="Ionicons" size={48} color={colors.textMuted || colors.textSecondary} />
          <Text style={[styles.emptyText, {color: colors.text}]}>No financial aid information available yet</Text>
          <Text style={[styles.emptySubtext, {color: colors.textSecondary}]}>
            Check HEC or university website for scholarship opportunities
          </Text>
          {university?.website && (
            <TouchableOpacity
              style={[styles.actionButton, {backgroundColor: colors.primary, marginTop: 16}]}
              onPress={() => openLink(university?.website)}
              activeOpacity={0.7}>
              <Text style={styles.actionButtonText}>Visit Website</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        scholarships.map((scholarship: ScholarshipData, index) => {
          const scholarshipName = scholarship?.name || 'Scholarship';
          const scholarshipProvider = scholarship?.provider || 'Provider';
          const scholarshipType = scholarship?.type || 'institutional';
          const tuitionCoverage = scholarship?.tuitionCoverage || 0;
          const scholarshipDesc = scholarship?.description || 'Details available on application';

          return (
            <View
              key={scholarship?.id || `scholarship-${index}`}
              style={[styles.scholarshipCard, {backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.card}]}>
              <View style={styles.scholarshipHeader}>
                <View style={[styles.scholarshipIconContainer, {backgroundColor: `${colors.primary}15`}]}>
                  <Icon
                    name={
                      scholarshipType === 'government'
                        ? 'business'
                        : scholarshipType === 'need_based'
                        ? 'wallet'
                        : scholarshipType === 'merit_based'
                        ? 'trophy'
                        : scholarshipType === 'hafiz_e_quran'
                        ? 'book'
                        : scholarshipType === 'sports'
                        ? 'football'
                        : scholarshipType === 'disabled'
                        ? 'accessibility'
                        : 'school'
                    }
                    family="Ionicons"
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.scholarshipInfo}>
                  <Text style={[styles.scholarshipName, {color: colors.text}]}>{scholarshipName}</Text>
                  <Text style={[styles.scholarshipProvider, {color: colors.textSecondary}]}>{scholarshipProvider}</Text>
                </View>
                <LinearGradient
                  colors={
                    tuitionCoverage === 100
                      ? ['#10B981', '#059669']
                      : tuitionCoverage >= 75
                      ? ['#F59E0B', '#D97706']
                      : GRADIENTS.primary
                  }
                  style={styles.coverageBadge}>
                  <Text style={styles.coverageText}>{tuitionCoverage}%</Text>
                </LinearGradient>
              </View>

              <Text style={[styles.scholarshipDesc, {color: colors.textSecondary}]}>
                {scholarshipDesc}
              </Text>

              {/* Coverage Details */}
              <CoverageDetails scholarship={scholarship} tuitionCoverage={tuitionCoverage} colors={colors} />

              {scholarship?.monthlyStipend && scholarship.monthlyStipend > 0 && (
                <View style={[styles.scholarshipStats, {backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'}]}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statLabel, {color: colors.textSecondary}]}>Monthly Stipend</Text>
                    <Text style={[styles.statValue, {color: colors.success}]}>
                      PKR {scholarship.monthlyStipend.toLocaleString()}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.scholarshipFooter}>
                <View style={[styles.deadlineBadge, {backgroundColor: `${colors.warning}15`}]}>
                  <View style={styles.deadlineRow}>
                    <Icon name="calendar-outline" family="Ionicons" size={14} color={colors.warning} />
                    <Text style={[styles.deadlineText, {color: colors.warning}]}>
                      {scholarship?.deadline || 'Check website'}
                    </Text>
                  </View>
                </View>
                {scholarship?.website && (
                  <TouchableOpacity activeOpacity={0.8} onPress={() => openLink(scholarship.website)}>
                    <LinearGradient
                      colors={GRADIENTS.primary}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 0}}
                      style={styles.applyBtn}>
                      <Text style={styles.applyBtnText}>Apply</Text>
                      <Icon name="arrow-forward" family="Ionicons" size={16} color="#FFFFFF" />
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tabContent: {
    padding: SPACING.md,
  },
  scholarshipsHeader: {
    marginBottom: SPACING.md,
  },
  scholarshipsNote: {
    fontSize: TYPOGRAPHY.sizes.sm,
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
  actionButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  scholarshipCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  scholarshipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  scholarshipIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  scholarshipInfo: {
    flex: 1,
  },
  scholarshipName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  scholarshipProvider: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 2,
  },
  coverageBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  coverageText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFFFFF',
  },
  scholarshipDesc: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  coverageDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  coverageChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  coverageChipText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  scholarshipStats: {
    flexDirection: 'row',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginBottom: 2,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  scholarshipFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deadlineBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deadlineText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  applyBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  applyBtnText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFFFFF',
  },
});

export default React.memo(ScholarshipsTab);

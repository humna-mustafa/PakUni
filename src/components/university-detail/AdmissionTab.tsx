/**
 * AdmissionTab - Apply banner, status notes, application steps, merit formulas, timeline
 */

import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {TYPOGRAPHY, SPACING, RADIUS, GRADIENTS} from '../../constants/design';
import {Icon} from '../icons';
import TimelineItem from './TimelineItem';
import type {UniversityData} from '../../data/universities';
import type {MeritFormulaData} from '../../data';

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

interface AdmissionTabProps {
  university: UniversityData;
  meritFormulas: MeritFormulaData[];
  colors: any;
  isDark: boolean;
  openLink: (url?: string) => void;
}

const AdmissionTab: React.FC<AdmissionTabProps> = ({
  university,
  meritFormulas,
  colors,
  isDark,
  openLink,
}) => {
  const hasAdmissionData =
    university?.admission_url ||
    university?.status_notes ||
    (university?.application_steps && university.application_steps.length > 0) ||
    meritFormulas.length > 0;

  if (!hasAdmissionData) {
    return (
      <View style={styles.tabContent}>
        <View style={[styles.emptyState, {backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.card}]}>
          <Icon name="document-text-outline" family="Ionicons" size={48} color={colors.textMuted || colors.textSecondary} />
          <Text style={[styles.emptyText, {color: colors.text}]}>No admission information available yet</Text>
          <Text style={[styles.emptySubtext, {color: colors.textSecondary}]}>
            Check the university website for the latest admission details
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
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      {/* Apply Banner */}
      {university?.admission_url && (
        <TouchableOpacity activeOpacity={0.9} onPress={() => openLink(university?.admission_url)}>
          <LinearGradient
            colors={GRADIENTS.primary}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.admissionBanner}>
            <View style={styles.admissionBannerContent}>
              <View style={styles.admissionBannerIconContainer}>
                <Icon name="document-text" family="Ionicons" size={28} color="#FFFFFF" />
              </View>
              <View style={styles.admissionBannerInfo}>
                <Text style={styles.admissionBannerTitle}>Apply Online</Text>
                <Text style={styles.admissionBannerSubtitle}>Visit official admission portal</Text>
              </View>
            </View>
            <View style={styles.admissionBannerArrow}>
              <Icon name="arrow-forward" family="Ionicons" size={24} color="#FFFFFF" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Admission Status Note */}
      {university?.status_notes && (
        <View style={[styles.statusNoteCard, {backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF', borderColor: colors.primary}]}>
          <View style={styles.statusNoteHeader}>
            <Icon name="notifications-outline" family="Ionicons" size={20} color={colors.primary} />
            <Text style={[styles.statusNoteTitle, {color: colors.primary}]}>Latest Admission Status</Text>
          </View>
          <Text style={[styles.statusNoteText, {color: colors.text}]}>{university.status_notes}</Text>
        </View>
      )}

      {/* Application Steps */}
      {university?.application_steps && university.application_steps.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="list-outline" family="Ionicons" size={22} color={colors.primary} />
            <Text style={[styles.sectionTitle, {color: colors.text}]}>How to Apply (Steps)</Text>
          </View>
          <View style={[styles.stepsContainer, {backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.card}]}>
            {university.application_steps.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={[styles.stepNumber, {backgroundColor: colors.primary}]}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={[styles.stepText, {color: colors.textSecondary}]}>
                  {step || 'Step information not available'}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Merit Formulas */}
      {meritFormulas.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="calculator-outline" family="Ionicons" size={22} color={colors.primary} />
            <Text style={[styles.sectionTitle, {color: colors.text}]}>Merit Calculation</Text>
          </View>
          {meritFormulas.map((formula, index) => (
            <View
              key={formula?.id || index}
              style={[styles.formulaCard, {backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.card}]}>
              <Text style={[styles.formulaName, {color: colors.text}]}>{formula?.name || 'Merit Formula'}</Text>
              <Text style={[styles.formulaUniversity, {color: colors.textSecondary}]}>{formula?.university || 'General'}</Text>

              <View style={styles.formulaWeights}>
                <View style={styles.weightItem}>
                  <LinearGradient colors={['#4573DF', '#3660C9']} style={styles.weightCircle}>
                    <Text style={styles.weightValue}>{formula?.matric_weightage || 0}%</Text>
                  </LinearGradient>
                  <Text style={[styles.weightLabel, {color: colors.textSecondary}]}>Matric</Text>
                </View>
                <View style={styles.weightItem}>
                  <LinearGradient colors={['#4573DF', '#3660C9']} style={styles.weightCircle}>
                    <Text style={styles.weightValue}>{formula?.inter_weightage || 0}%</Text>
                  </LinearGradient>
                  <Text style={[styles.weightLabel, {color: colors.textSecondary}]}>Inter</Text>
                </View>
                <View style={styles.weightItem}>
                  <LinearGradient colors={['#10B981', '#059669']} style={styles.weightCircle}>
                    <Text style={styles.weightValue}>{formula?.entry_test_weightage || 0}%</Text>
                  </LinearGradient>
                  <Text style={[styles.weightLabel, {color: colors.textSecondary}]}>
                    {formula?.entry_test_name || 'Test'}
                  </Text>
                </View>
              </View>

              {formula?.hafiz_bonus != null && formula.hafiz_bonus > 0 && (
                <View style={styles.bonusBadge}>
                  <LinearGradient
                    colors={['#F59E0B', '#D97706']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={styles.bonusGradient}>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                      <Icon name="moon-outline" family="Ionicons" size={14} color="#FFFFFF" />
                      <Text style={styles.bonusText}>+{formula.hafiz_bonus} Hafiz Bonus</Text>
                    </View>
                  </LinearGradient>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Admission Timeline */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="calendar-outline" family="Ionicons" size={22} color={colors.primary} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Admission Timeline</Text>
        </View>
        <View style={[styles.timeline, {backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.card}]}>
          <TimelineItem title="Applications Open" date="June - July" isLast={false} index={0} colors={colors} />
          <TimelineItem title="Entry Test" date="July - August" isLast={false} index={1} colors={colors} />
          <TimelineItem title="Merit Lists" date="August - September" isLast={false} index={2} colors={colors} />
          <TimelineItem title="Classes Begin" date="September - October" isLast={true} index={3} colors={colors} />
        </View>
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
  admissionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  admissionBannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  admissionBannerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  admissionBannerInfo: {
    flex: 1,
  },
  admissionBannerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFFFFF',
  },
  admissionBannerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  admissionBannerArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusNoteCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
  },
  statusNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  statusNoteTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  statusNoteText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  stepsContainer: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  stepText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
  },
  formulaCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  formulaName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  formulaUniversity: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: SPACING.md,
  },
  formulaWeights: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  weightItem: {
    alignItems: 'center',
  },
  weightCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  weightValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFFFFF',
  },
  weightLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    textAlign: 'center',
  },
  bonusBadge: {
    alignSelf: 'center',
  },
  bonusGradient: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  bonusText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#FFFFFF',
  },
  timeline: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
});

export default React.memo(AdmissionTab);

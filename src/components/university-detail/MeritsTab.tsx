/**
 * MeritsTab - Merit history with campus-based grouping
 * Tree: Campus → Program → Year-wise merit data
 * Includes data disclaimers, portal links, social media links
 */

import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Linking} from 'react-native';
import {TYPOGRAPHY, SPACING, RADIUS} from '../../constants/design';
import {Icon} from '../icons';
import type {MeritSummary, MeritCampusData} from '../../types/universityDetail';
import {getUniversityMeritInfo} from '../../services/meritLists';
import type {UniversityMeritInfo} from '../../data/meritArchive';

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
  universityId?: string;
  colors: any;
  isDark: boolean;
}

const MeritsTab: React.FC<MeritsTabProps> = ({meritSummary, universityId, colors, isDark}) => {
  const meritPrograms = meritSummary?.programs || [];
  const meritCampuses: MeritCampusData[] = meritSummary?.campuses || [];
  const meritYears = meritSummary?.years || [];
  const totalRecords = meritSummary?.totalRecords || 0;
  const trend = meritSummary?.trend || null;

  // Get university merit info for portal links, social links, notes
  const meritInfo: UniversityMeritInfo | null = universityId
    ? getUniversityMeritInfo(universityId)
    : null;

  const hasCampusData = meritCampuses.length > 0;
  const hasMultipleCampuses = meritCampuses.length > 1;
  const isPortalOnly = meritInfo?.status === 'portal_only';

  return (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="trending-up-outline" family="Ionicons" size={22} color={colors.primary} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Merit History</Text>
        </View>

        {meritPrograms.length === 0 ? (
          <View>
            {/* Empty state - no merit data */}
            <View style={[styles.emptyState, {backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.card}]}>
              <Icon name="analytics-outline" family="Ionicons" size={48} color={colors.textMuted || colors.textSecondary} />
              <Text style={[styles.emptyText, {color: colors.text}]}>No merit data available yet</Text>
              <Text style={[styles.emptySubtext, {color: colors.textSecondary}]}>
                {isPortalOnly
                  ? 'This university publishes merit lists on their own portal'
                  : 'Merit records for this university will be available soon'}
              </Text>
            </View>

            {/* Portal link for portal_only universities */}
            {meritInfo && isPortalOnly && meritInfo.portalUrl && (
              <View style={[styles.portalCard, {backgroundColor: isDark ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.06)'}]}>
                <View style={styles.portalHeader}>
                  <Icon name="globe-outline" family="Ionicons" size={16} color="#3B82F6" />
                  <Text style={[styles.portalTitle, {color: '#3B82F6'}]}>Internal Merit Portal</Text>
                </View>
                {meritInfo.note && (
                  <Text style={[styles.portalNote, {color: colors.textSecondary}]}>{meritInfo.note}</Text>
                )}
                <TouchableOpacity
                  style={[styles.portalLinkBtn, {backgroundColor: '#3B82F6'}]}
                  onPress={() => Linking.openURL(meritInfo.portalUrl!)}
                  activeOpacity={0.7}>
                  <Icon name="open-outline" family="Ionicons" size={14} color="#FFFFFF" />
                  <Text style={styles.portalLinkText}>Visit Merit Portal</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Admission URL suggestion */}
            {meritInfo?.admissionUrl && (
              <TouchableOpacity
                style={[styles.visitWebsite, {backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'}]}
                onPress={() => Linking.openURL(meritInfo.admissionUrl!)}
                activeOpacity={0.7}>
                <Icon name="school-outline" family="Ionicons" size={14} color={colors.primary} />
                <Text style={[styles.visitWebsiteText, {color: colors.primary}]}>
                  Visit official admissions page
                </Text>
              </TouchableOpacity>
            )}

            {/* Social links for empty state */}
            {meritInfo?.socialLinks && (
              <View style={[styles.socialRow, {marginTop: SPACING.sm}]}>
                <Text style={[styles.socialLabel, {color: colors.textSecondary}]}>Follow for updates:</Text>
                <View style={styles.socialIcons}>
                  {meritInfo.socialLinks.facebook && (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(meritInfo.socialLinks!.facebook!)}
                      style={[styles.socialBtn, {backgroundColor: '#1877F215'}]}
                      activeOpacity={0.7}>
                      <Icon name="logo-facebook" family="Ionicons" size={16} color="#1877F2" />
                    </TouchableOpacity>
                  )}
                  {meritInfo.socialLinks.youtube && (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(meritInfo.socialLinks!.youtube!)}
                      style={[styles.socialBtn, {backgroundColor: '#FF000015'}]}
                      activeOpacity={0.7}>
                      <Icon name="logo-youtube" family="Ionicons" size={16} color="#FF0000" />
                    </TouchableOpacity>
                  )}
                  {meritInfo.socialLinks.instagram && (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(meritInfo.socialLinks!.instagram!)}
                      style={[styles.socialBtn, {backgroundColor: '#E4405F15'}]}
                      activeOpacity={0.7}>
                      <Icon name="logo-instagram" family="Ionicons" size={16} color="#E4405F" />
                    </TouchableOpacity>
                  )}
                  {meritInfo.socialLinks.linkedin && (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(meritInfo.socialLinks!.linkedin!)}
                      style={[styles.socialBtn, {backgroundColor: '#0A66C215'}]}
                      activeOpacity={0.7}>
                      <Icon name="logo-linkedin" family="Ionicons" size={16} color="#0A66C2" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>
        ) : (
          <>
            {/* Data Disclaimer */}
            <View style={[styles.disclaimerBanner, {backgroundColor: isDark ? 'rgba(251, 191, 36, 0.1)' : 'rgba(251, 191, 36, 0.08)'}]}>
              <Icon name="information-circle" family="Ionicons" size={16} color="#F59E0B" />
              <Text style={[styles.disclaimerBody, {color: colors.textSecondary}]}>
                Data from public sources. Verify with official website.
              </Text>
            </View>

            {/* Portal info if portal_only but we have some data */}
            {meritInfo && isPortalOnly && meritInfo.portalUrl && (
              <TouchableOpacity
                style={[styles.portalCard, {backgroundColor: isDark ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.06)'}]}
                onPress={() => Linking.openURL(meritInfo.portalUrl!)}
                activeOpacity={0.7}>
                <View style={styles.portalHeader}>
                  <Icon name="globe-outline" family="Ionicons" size={14} color="#3B82F6" />
                  <Text style={[styles.portalTitle, {color: '#3B82F6'}]}>Check latest merits on official portal</Text>
                  <Icon name="open-outline" family="Ionicons" size={12} color="#3B82F6" />
                </View>
              </TouchableOpacity>
            )}

            {/* Overall Stats */}
            <View style={[styles.statsCard, {backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.card, marginBottom: SPACING.md}]}>
              <View style={styles.meritStatsRow}>
                <View style={styles.meritStatItem}>
                  <Text style={[styles.meritStatValue, {color: colors.primary}]}>{meritPrograms.length}</Text>
                  <Text style={[styles.meritStatLabel, {color: colors.textSecondary}]}>Programs</Text>
                </View>
                {hasMultipleCampuses && (
                  <View style={styles.meritStatItem}>
                    <Text style={[styles.meritStatValue, {color: colors.primary}]}>{meritCampuses.length}</Text>
                    <Text style={[styles.meritStatLabel, {color: colors.textSecondary}]}>Campuses</Text>
                  </View>
                )}
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

            {/* Campus-based grouping (if available) or flat program list */}
            {hasCampusData ? (
              meritCampuses.map((campusData, campusIdx) => (
                <View key={`campus-${campusData.campus}-${campusIdx}`}>
                  {/* Campus header (only if multiple campuses) */}
                  {hasMultipleCampuses && (
                    <View style={[styles.campusHeader, {backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'}]}>
                      <Icon name="location-outline" family="Ionicons" size={14} color={colors.primary} />
                      <Text style={[styles.campusName, {color: colors.text}]}>
                        {campusData.campus} Campus
                      </Text>
                      <View style={[styles.campusBadge, {backgroundColor: `${colors.primary}15`}]}>
                        <Text style={[styles.campusBadgeText, {color: colors.primary}]}>
                          {campusData.programs.length} {campusData.programs.length === 1 ? 'program' : 'programs'}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Programs under this campus */}
                  {campusData.programs.map((program, progIndex) => {
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
                              {programCategory} {'\u00B7'} {programYears.length} years data
                            </Text>
                          </View>
                        </View>

                        <View style={styles.yearMeritsContainer}>
                          {[...programYears]
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
                </View>
              ))
            ) : (
              /* Fallback: flat program list (backward compat) */
              meritPrograms.map((program, progIndex) => {
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
                          {programCategory} {'\u00B7'} {programYears.length} years data
                        </Text>
                      </View>
                    </View>

                    <View style={styles.yearMeritsContainer}>
                      {[...programYears]
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
              })
            )}

            {/* Visit official admissions page */}
            {meritInfo?.admissionUrl && (
              <TouchableOpacity
                style={[styles.visitWebsite, {backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'}]}
                onPress={() => Linking.openURL(meritInfo.admissionUrl!)}
                activeOpacity={0.7}>
                <Icon name="open-outline" family="Ionicons" size={14} color={colors.primary} />
                <Text style={[styles.visitWebsiteText, {color: colors.primary}]}>
                  Visit official admissions website for latest merit lists
                </Text>
              </TouchableOpacity>
            )}

            {/* Social links */}
            {meritInfo?.socialLinks && (
              <View style={[styles.socialRow, {marginTop: SPACING.xs}]}>
                <Text style={[styles.socialLabel, {color: colors.textSecondary}]}>Follow for updates:</Text>
                <View style={styles.socialIcons}>
                  {meritInfo.socialLinks.facebook && (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(meritInfo.socialLinks!.facebook!)}
                      style={[styles.socialBtn, {backgroundColor: '#1877F215'}]}
                      activeOpacity={0.7}>
                      <Icon name="logo-facebook" family="Ionicons" size={16} color="#1877F2" />
                    </TouchableOpacity>
                  )}
                  {meritInfo.socialLinks.youtube && (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(meritInfo.socialLinks!.youtube!)}
                      style={[styles.socialBtn, {backgroundColor: '#FF000015'}]}
                      activeOpacity={0.7}>
                      <Icon name="logo-youtube" family="Ionicons" size={16} color="#FF0000" />
                    </TouchableOpacity>
                  )}
                  {meritInfo.socialLinks.instagram && (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(meritInfo.socialLinks!.instagram!)}
                      style={[styles.socialBtn, {backgroundColor: '#E4405F15'}]}
                      activeOpacity={0.7}>
                      <Icon name="logo-instagram" family="Ionicons" size={16} color="#E4405F" />
                    </TouchableOpacity>
                  )}
                  {meritInfo.socialLinks.linkedin && (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(meritInfo.socialLinks!.linkedin!)}
                      style={[styles.socialBtn, {backgroundColor: '#0A66C215'}]}
                      activeOpacity={0.7}>
                      <Icon name="logo-linkedin" family="Ionicons" size={16} color="#0A66C2" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
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
    fontWeight: TYPOGRAPHY.weight.bold as any,
    marginLeft: SPACING.xs,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xxl,
    borderRadius: RADIUS.lg,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.semibold as any,
    marginTop: SPACING.sm,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 4,
    textAlign: 'center',
  },
  // Disclaimer
  disclaimerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  disclaimerBody: {
    fontSize: 11,
    flex: 1,
  },
  // Portal
  portalCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  portalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  portalTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.bold as any,
    flex: 1,
  },
  portalNote: {
    fontSize: 11,
    lineHeight: 16,
    marginBottom: SPACING.sm,
  },
  portalLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.md,
    gap: SPACING.xs,
    alignSelf: 'flex-start',
  },
  portalLinkText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.bold as any,
    color: '#FFFFFF',
  },
  // Visit website
  visitWebsite: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  visitWebsiteText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weight.semibold as any,
  },
  // Social
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  socialLabel: {fontSize: 11},
  socialIcons: {flexDirection: 'row', gap: SPACING.xs},
  socialBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Campus header
  campusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.xs,
    gap: SPACING.xs,
  },
  campusName: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.bold as any,
    flex: 1,
  },
  campusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  campusBadgeText: {
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weight.semibold as any,
  },
  // Stats
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
    fontWeight: TYPOGRAPHY.weight.bold as any,
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
    fontWeight: TYPOGRAPHY.weight.semibold as any,
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
    fontWeight: TYPOGRAPHY.weight.semibold as any,
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
    fontWeight: TYPOGRAPHY.weight.semibold as any,
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
    fontWeight: TYPOGRAPHY.weight.semibold as any,
  },
});

export default React.memo(MeritsTab);

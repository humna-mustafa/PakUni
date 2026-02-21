/**
 * Merit Archive - Tree View Components
 * UniversityCard > CampusSection > ProgramMeritRow hierarchy
 * Plus PortalInfoCard and SocialLinksRow helpers.
 */

import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Linking,
  LayoutAnimation,
  Platform,
} from 'react-native';
import {TYPOGRAPHY, SPACING, RADIUS} from '../../constants/design';
import {Icon} from '../icons';
import {Haptics} from '../../utils/haptics';
import type {MeritTreeUniversity} from '../../services/meritLists';
import type {UniversityMeritInfo} from '../../data/meritArchive';

// ============================================================================
// HELPERS
// ============================================================================

const getMeritColor = (merit: number, primaryColor: string) => {
  if (merit >= 95) return '#EF4444';
  if (merit >= 90) return '#F59E0B';
  if (merit >= 85) return primaryColor;
  if (merit >= 75) return '#10B981';
  return '#6B7280';
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'medical':
      return 'medkit-outline';
    case 'computer-science':
      return 'code-slash-outline';
    case 'electrical-engineering':
    case 'mechanical-engineering':
    case 'civil-engineering':
      return 'construct-outline';
    case 'business':
      return 'briefcase-outline';
    default:
      return 'school-outline';
  }
};

// ============================================================================
// PORTAL INFO CARD
// ============================================================================

const PortalInfoCard: React.FC<{
  meritInfo: UniversityMeritInfo;
  colors: any;
  isDark: boolean;
}> = ({meritInfo, colors, isDark}) => {
  if (meritInfo.status !== 'portal_only' && !meritInfo.note) {
    return null;
  }

  return (
    <View
      style={[
        styles.portalCard,
        {
          backgroundColor: isDark
            ? 'rgba(59, 130, 246, 0.08)'
            : 'rgba(59, 130, 246, 0.06)',
        },
      ]}>
      <View style={styles.portalHeader}>
        <Icon name="globe-outline" family="Ionicons" size={16} color="#3B82F6" />
        <Text style={[styles.portalTitle, {color: '#3B82F6'}]}>
          {meritInfo.status === 'portal_only' ? 'Internal Merit Portal' : 'Note'}
        </Text>
      </View>
      {meritInfo.note && (
        <Text style={[styles.portalNote, {color: colors.textSecondary}]}>
          {meritInfo.note}
        </Text>
      )}
      <View style={styles.portalLinks}>
        {meritInfo.portalUrl && (
          <TouchableOpacity
            style={[styles.portalLinkBtn, {backgroundColor: '#3B82F6'}]}
            onPress={() => Linking.openURL(meritInfo.portalUrl!)}
            activeOpacity={0.7}>
            <Icon name="open-outline" family="Ionicons" size={14} color="#FFFFFF" />
            <Text style={styles.portalLinkText}>Visit Merit Portal</Text>
          </TouchableOpacity>
        )}
        {meritInfo.admissionUrl && (
          <TouchableOpacity
            style={[
              styles.portalLinkBtn,
              {
                backgroundColor: isDark
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(0,0,0,0.06)',
              },
            ]}
            onPress={() => Linking.openURL(meritInfo.admissionUrl!)}
            activeOpacity={0.7}>
            <Icon name="school-outline" family="Ionicons" size={14} color={colors.primary} />
            <Text style={[styles.portalLinkTextAlt, {color: colors.primary}]}>
              Admissions Page
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// ============================================================================
// SOCIAL LINKS ROW
// ============================================================================

const SocialLinksRow: React.FC<{
  meritInfo: UniversityMeritInfo;
  colors: any;
}> = ({meritInfo, colors}) => {
  const socialLinks = meritInfo.socialLinks;
  if (!socialLinks) return null;

  const links: {icon: string; url: string; color: string}[] = [];
  if (socialLinks.facebook) links.push({icon: 'logo-facebook', url: socialLinks.facebook, color: '#1877F2'});
  if (socialLinks.youtube) links.push({icon: 'logo-youtube', url: socialLinks.youtube, color: '#FF0000'});
  if (socialLinks.instagram) links.push({icon: 'logo-instagram', url: socialLinks.instagram, color: '#E4405F'});
  if (socialLinks.linkedin) links.push({icon: 'logo-linkedin', url: socialLinks.linkedin, color: '#0A66C2'});
  if (socialLinks.twitter) links.push({icon: 'logo-twitter', url: socialLinks.twitter, color: '#1DA1F2'});

  if (links.length === 0) return null;

  return (
    <View style={styles.socialRow}>
      <Text style={[styles.socialLabel, {color: colors.textSecondary}]}>
        Follow for updates:
      </Text>
      <View style={styles.socialIcons}>
        {links.map((link, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => Linking.openURL(link.url)}
            style={[styles.socialBtn, {backgroundColor: `${link.color}15`}]}
            activeOpacity={0.7}>
            <Icon name={link.icon} family="Ionicons" size={16} color={link.color} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// ============================================================================
// PROGRAM MERIT ROW
// ============================================================================

type ProgramData = MeritTreeUniversity['campuses'][0]['programs'][0];

const ProgramMeritRow: React.FC<{
  program: ProgramData;
  colors: any;
  isDark: boolean;
}> = ({program, colors, isDark}) => {
  const [expanded, setExpanded] = useState(false);
  const latestYear = program.years[0];

  return (
    <View
      style={[
        styles.programRow,
        {borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'},
      ]}>
      <TouchableOpacity
        style={styles.programHeader}
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setExpanded(!expanded);
          Haptics.light();
        }}
        activeOpacity={0.7}>
        <View style={styles.programInfo}>
          <Icon
            name={getCategoryIcon(program.category)}
            family="Ionicons"
            size={14}
            color={colors.textSecondary}
          />
          <Text style={[styles.programName, {color: colors.text}]} numberOfLines={1}>
            {program.programName}
          </Text>
        </View>
        <View style={styles.programMeritBadge}>
          {latestYear && (
            <Text
              style={[
                styles.programMeritValue,
                {color: getMeritColor(latestYear.closingMerit, colors.primary)},
              ]}>
              {latestYear.closingMerit.toFixed(1)}%
            </Text>
          )}
          <Icon
            name={expanded ? 'chevron-up' : 'chevron-down'}
            family="Ionicons"
            size={16}
            color={colors.textSecondary}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.programYears}>
          <View style={styles.yearTableHeader}>
            <Text style={[styles.yearTableHeaderText, {color: colors.textSecondary}]}>Year</Text>
            <Text style={[styles.yearTableHeaderText, {color: colors.textSecondary}]}>Session</Text>
            <Text style={[styles.yearTableHeaderText, {color: colors.textSecondary, textAlign: 'right'}]}>Merit</Text>
            <Text style={[styles.yearTableHeaderText, {color: colors.textSecondary, textAlign: 'right'}]}>Seats</Text>
            <Text style={[styles.yearTableHeaderText, {color: colors.textSecondary, textAlign: 'right'}]}>Change</Text>
          </View>
          {program.years.map((yearData, idx) => {
            const prevYear = program.years[idx + 1];
            const change = prevYear ? yearData.closingMerit - prevYear.closingMerit : null;
            return (
              <View
                key={yearData.year}
                style={[
                  styles.yearRow,
                  {
                    backgroundColor:
                      idx % 2 === 0
                        ? isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
                        : 'transparent',
                  },
                ]}>
                <Text style={[styles.yearValue, {color: colors.text}]}>{yearData.year}</Text>
                <Text style={[styles.yearSession, {color: colors.textSecondary}]}>{yearData.session}</Text>
                <Text style={[styles.yearMerit, {color: getMeritColor(yearData.closingMerit, colors.primary)}]}>
                  {yearData.closingMerit.toFixed(1)}%
                </Text>
                <Text style={[styles.yearSeats, {color: colors.textSecondary}]}>{yearData.totalSeats}</Text>
                <View style={styles.yearChange}>
                  {change !== null ? (
                    <View style={styles.changeRow}>
                      <Icon
                        name={change >= 0 ? 'caret-up' : 'caret-down'}
                        family="Ionicons"
                        size={10}
                        color={change >= 0 ? '#10B981' : '#EF4444'}
                      />
                      <Text style={[styles.changeValue, {color: change >= 0 ? '#10B981' : '#EF4444'}]}>
                        {change >= 0 ? '+' : ''}{change.toFixed(1)}
                      </Text>
                    </View>
                  ) : (
                    <Text style={[styles.changeValue, {color: colors.textSecondary}]}>{'\u2014'}</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

// ============================================================================
// CAMPUS SECTION
// ============================================================================

const CampusSection: React.FC<{
  campus: MeritTreeUniversity['campuses'][0];
  showCampusHeader: boolean;
  colors: any;
  isDark: boolean;
}> = ({campus, showCampusHeader, colors, isDark}) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <View style={styles.campusSection}>
      {showCampusHeader && (
        <TouchableOpacity
          style={[
            styles.campusHeader,
            {backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'},
          ]}
          onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setExpanded(!expanded);
            Haptics.light();
          }}
          activeOpacity={0.7}>
          <View style={styles.campusInfo}>
            <Icon name="location-outline" family="Ionicons" size={14} color={colors.primary} />
            <Text style={[styles.campusName, {color: colors.text}]}>
              {campus.campus} Campus
            </Text>
            <View style={[styles.campusBadge, {backgroundColor: `${colors.primary}15`}]}>
              <Text style={[styles.campusBadgeText, {color: colors.primary}]}>
                {campus.programs.length} {campus.programs.length === 1 ? 'program' : 'programs'}
              </Text>
            </View>
          </View>
          <Icon
            name={expanded ? 'chevron-up' : 'chevron-down'}
            family="Ionicons"
            size={16}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      )}

      {expanded &&
        campus.programs.map((program, idx) => (
          <ProgramMeritRow
            key={`${program.programName}-${idx}`}
            program={program}
            colors={colors}
            isDark={isDark}
          />
        ))}
    </View>
  );
};

// ============================================================================
// UNIVERSITY CARD (exported)
// ============================================================================

export const UniversityCard: React.FC<{
  university: MeritTreeUniversity;
  colors: any;
  isDark: boolean;
  index: number;
}> = ({university, colors, isDark, index}) => {
  const [expanded, setExpanded] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const meritInfo = university.meritInfo;
  const isPortalOnly = meritInfo?.status === 'portal_only';

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      delay: Math.min(index * 50, 500),
      useNativeDriver: true,
    }).start();
  }, [index]);

  return (
    <Animated.View
      style={[styles.universityCard, {backgroundColor: colors.card, opacity: fadeAnim}]}>
      {/* University header */}
      <TouchableOpacity
        style={styles.uniHeader}
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setExpanded(!expanded);
          Haptics.light();
        }}
        activeOpacity={0.7}>
        <View style={styles.uniHeaderLeft}>
          <View style={[styles.uniInitial, {backgroundColor: `${colors.primary}15`}]}>
            <Text style={[styles.uniInitialText, {color: colors.primary}]}>
              {university.shortName.substring(0, 3)}
            </Text>
          </View>
          <View style={styles.uniHeaderInfo}>
            <View style={styles.uniNameRow}>
              <Text style={[styles.uniName, {color: colors.text}]} numberOfLines={1}>
                {university.universityName}
              </Text>
              {isPortalOnly && (
                <View style={[styles.portalBadge, {backgroundColor: 'rgba(59, 130, 246, 0.1)'}]}>
                  <Icon name="globe-outline" family="Ionicons" size={10} color="#3B82F6" />
                  <Text style={styles.portalBadgeText}>Portal</Text>
                </View>
              )}
            </View>
            <View style={styles.uniMeta}>
              <Text style={[styles.uniMetaText, {color: colors.textSecondary}]}>
                {university.campusCount} {university.campusCount === 1 ? 'campus' : 'campuses'}{' '}
                {'\u00B7'} {university.programCount} {university.programCount === 1 ? 'program' : 'programs'}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.uniHeaderRight}>
          {university.latestMerit && (
            <Text
              style={[
                styles.uniMeritBadge,
                {color: getMeritColor(university.latestMerit, colors.primary)},
              ]}>
              {university.latestMerit.toFixed(1)}%
            </Text>
          )}
          <Icon
            name={expanded ? 'chevron-up-outline' : 'chevron-down-outline'}
            family="Ionicons"
            size={20}
            color={colors.textSecondary}
          />
        </View>
      </TouchableOpacity>

      {/* Expanded content */}
      {expanded && (
        <View
          style={[
            styles.uniBody,
            {borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'},
          ]}>
          {meritInfo && <PortalInfoCard meritInfo={meritInfo} colors={colors} isDark={isDark} />}
          {meritInfo && <SocialLinksRow meritInfo={meritInfo} colors={colors} />}

          {university.campuses.map((campus, idx) => (
            <CampusSection
              key={`${campus.campus}-${idx}`}
              campus={campus}
              showCampusHeader={university.campusCount > 1}
              colors={colors}
              isDark={isDark}
            />
          ))}

          {meritInfo?.admissionUrl && (
            <TouchableOpacity
              style={[
                styles.visitWebsite,
                {backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'},
              ]}
              onPress={() => Linking.openURL(meritInfo.admissionUrl!)}
              activeOpacity={0.7}>
              <Icon name="open-outline" family="Ionicons" size={14} color={colors.primary} />
              <Text style={[styles.visitWebsiteText, {color: colors.primary}]}>
                Visit official admissions website for latest merit lists
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Animated.View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Portal
  portalCard: {
    margin: SPACING.sm, marginBottom: 0, padding: SPACING.md, borderRadius: RADIUS.md,
  },
  portalHeader: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.xs,
  },
  portalTitle: {fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weight.bold as any},
  portalNote: {fontSize: 11, lineHeight: 16, marginBottom: SPACING.sm},
  portalLinks: {flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm},
  portalLinkBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.md, gap: SPACING.xs,
  },
  portalLinkText: {fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weight.bold as any, color: '#FFFFFF'},
  portalLinkTextAlt: {fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weight.bold as any},

  // Social
  socialRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.sm,
  },
  socialLabel: {fontSize: 11},
  socialIcons: {flexDirection: 'row', gap: SPACING.xs},
  socialBtn: {width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center'},

  // Program
  programRow: {marginHorizontal: SPACING.sm, borderBottomWidth: StyleSheet.hairlineWidth},
  programHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm, paddingVertical: SPACING.sm,
  },
  programInfo: {flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, flex: 1},
  programName: {fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weight.semibold as any, flex: 1},
  programMeritBadge: {flexDirection: 'row', alignItems: 'center', gap: SPACING.xs},
  programMeritValue: {fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.bold as any},
  programYears: {paddingHorizontal: SPACING.sm, paddingBottom: SPACING.sm},
  yearTableHeader: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: SPACING.xs, marginBottom: 2,
  },
  yearTableHeaderText: {
    fontSize: 10, fontWeight: TYPOGRAPHY.weight.semibold as any, flex: 1, textTransform: 'uppercase',
  },
  yearRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: SPACING.xs, borderRadius: 4,
  },
  yearValue: {fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weight.bold as any, flex: 1},
  yearSession: {fontSize: 11, flex: 1},
  yearMerit: {fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weight.bold as any, flex: 1, textAlign: 'right'},
  yearSeats: {fontSize: 11, flex: 1, textAlign: 'right'},
  yearChange: {flex: 1, alignItems: 'flex-end'},
  changeRow: {flexDirection: 'row', alignItems: 'center', gap: 1},
  changeValue: {fontSize: 10, fontWeight: TYPOGRAPHY.weight.semibold as any},

  // Campus
  campusSection: {marginTop: 2},
  campusHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.sm, marginTop: SPACING.xs, borderRadius: RADIUS.sm,
  },
  campusInfo: {flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, flex: 1},
  campusName: {fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weight.bold as any},
  campusBadge: {paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4},
  campusBadgeText: {fontSize: 9, fontWeight: TYPOGRAPHY.weight.semibold as any},

  // University Card
  universityCard: {
    marginHorizontal: SPACING.lg, marginBottom: SPACING.sm, borderRadius: RADIUS.lg, overflow: 'hidden',
    ...Platform.select({
      ios: {shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.06, shadowRadius: 8},
      android: {elevation: 2},
    }),
  },
  uniHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.md,
  },
  uniHeaderLeft: {flexDirection: 'row', alignItems: 'center', flex: 1, gap: SPACING.sm},
  uniInitial: {width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center'},
  uniInitialText: {fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.bold as any},
  uniHeaderInfo: {flex: 1},
  uniNameRow: {flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, flexWrap: 'wrap'},
  uniName: {fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.bold as any, flexShrink: 1},
  portalBadge: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, gap: 3,
  },
  portalBadgeText: {fontSize: 9, fontWeight: TYPOGRAPHY.weight.bold as any, color: '#3B82F6'},
  uniMeta: {marginTop: 2},
  uniMetaText: {fontSize: 11},
  uniHeaderRight: {alignItems: 'flex-end', gap: 4},
  uniMeritBadge: {fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.bold as any},
  uniBody: {borderTopWidth: StyleSheet.hairlineWidth, paddingBottom: SPACING.sm},
  visitWebsite: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: SPACING.sm, margin: SPACING.sm, padding: SPACING.sm,
    borderRadius: RADIUS.sm, gap: SPACING.xs,
  },
  visitWebsiteText: {fontSize: 11, fontWeight: TYPOGRAPHY.weight.semibold as any},
});

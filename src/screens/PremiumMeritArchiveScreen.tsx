/**
 * PremiumMeritArchiveScreen - Merit Lists Archive (Tree View)
 *
 * Tree structure: University -> Campus -> Program -> Year/Cycle Merit Lists
 * Features:
 * - Expandable university cards showing campuses and programs
 * - Year and category filters
 * - Search across universities, programs, cities
 * - Data accuracy disclaimers
 * - Portal links for universities with internal merit systems (FAST, LUMS)
 * - Social media & official website links
 * - Graceful handling of missing data
 */

import React, {useState, useRef, useEffect, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  RefreshControl,
  Linking,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {TYPOGRAPHY, SPACING, RADIUS} from '../constants/design';
import {useTheme} from '../contexts/ThemeContext';
import {Icon} from '../components/icons';
import {logger} from '../utils/logger';
import {PremiumSearchBar} from '../components/PremiumSearchBar';
import {Haptics} from '../utils/haptics';
import {
  fetchMeritLists,
  getMeritInsights,
  getYearlyTrendData,
  buildMeritTree,
  AVAILABLE_YEARS,
  MERIT_CATEGORIES,
  UNIVERSITY_MERIT_INFO,
} from '../services/meritLists';
import type {MeritTreeUniversity} from '../services/meritLists';
import {MERIT_RECORDS, MeritRecord} from '../data/meritArchive';
import type {UniversityMeritInfo} from '../data/meritArchive';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// ============================================================================
// DATA DISCLAIMER BANNER
// ============================================================================

const DisclaimerBanner: React.FC<{colors: any; isDark: boolean}> = ({
  colors,
  isDark,
}) => (
  <View
    style={[
      styles.disclaimerBanner,
      {
        backgroundColor: isDark
          ? 'rgba(251, 191, 36, 0.1)'
          : 'rgba(251, 191, 36, 0.08)',
      },
    ]}>
    <Icon
      name="information-circle"
      family="Ionicons"
      size={18}
      color="#F59E0B"
    />
    <View style={styles.disclaimerBannerText}>
      <Text style={[styles.disclaimerTitle, {color: colors.text}]}>
        Data Accuracy Notice
      </Text>
      <Text style={[styles.disclaimerBody, {color: colors.textSecondary}]}>
        Merit data is collected from public sources and may not be 100%
        accurate. Always verify with the university's official website or
        admission office. Visit university social media pages for the latest
        updates.
      </Text>
    </View>
  </View>
);

// ============================================================================
// PORTAL INFO CARD - For universities with internal merit portals
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
        <Icon
          name="globe-outline"
          family="Ionicons"
          size={16}
          color="#3B82F6"
        />
        <Text style={[styles.portalTitle, {color: '#3B82F6'}]}>
          {meritInfo.status === 'portal_only'
            ? 'Internal Merit Portal'
            : 'Note'}
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
            <Icon
              name="open-outline"
              family="Ionicons"
              size={14}
              color="#FFFFFF"
            />
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
            <Icon
              name="school-outline"
              family="Ionicons"
              size={14}
              color={colors.primary}
            />
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
  if (!socialLinks) {
    return null;
  }

  const links: {icon: string; url: string; color: string}[] = [];
  if (socialLinks.facebook) {
    links.push({
      icon: 'logo-facebook',
      url: socialLinks.facebook,
      color: '#1877F2',
    });
  }
  if (socialLinks.youtube) {
    links.push({
      icon: 'logo-youtube',
      url: socialLinks.youtube,
      color: '#FF0000',
    });
  }
  if (socialLinks.instagram) {
    links.push({
      icon: 'logo-instagram',
      url: socialLinks.instagram,
      color: '#E4405F',
    });
  }
  if (socialLinks.linkedin) {
    links.push({
      icon: 'logo-linkedin',
      url: socialLinks.linkedin,
      color: '#0A66C2',
    });
  }
  if (socialLinks.twitter) {
    links.push({
      icon: 'logo-twitter',
      url: socialLinks.twitter,
      color: '#1DA1F2',
    });
  }

  if (links.length === 0) {
    return null;
  }

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
            <Icon
              name={link.icon}
              family="Ionicons"
              size={16}
              color={link.color}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// ============================================================================
// PROGRAM MERIT ROW - Shows year-by-year merit for a program
// ============================================================================

type ProgramData =
  MeritTreeUniversity['campuses'][0]['programs'][0];

const ProgramMeritRow: React.FC<{
  program: ProgramData;
  colors: any;
  isDark: boolean;
}> = ({program, colors, isDark}) => {
  const [expanded, setExpanded] = useState(false);
  const latestYear = program.years[0]; // years sorted desc

  const getMeritColor = (merit: number) => {
    if (merit >= 95) return '#EF4444';
    if (merit >= 90) return '#F59E0B';
    if (merit >= 85) return colors.primary;
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
          <Text
            style={[styles.programName, {color: colors.text}]}
            numberOfLines={1}>
            {program.programName}
          </Text>
        </View>
        <View style={styles.programMeritBadge}>
          {latestYear && (
            <Text
              style={[
                styles.programMeritValue,
                {color: getMeritColor(latestYear.closingMerit)},
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
          {/* Year header */}
          <View style={styles.yearTableHeader}>
            <Text
              style={[styles.yearTableHeaderText, {color: colors.textSecondary}]}>
              Year
            </Text>
            <Text
              style={[styles.yearTableHeaderText, {color: colors.textSecondary}]}>
              Session
            </Text>
            <Text
              style={[
                styles.yearTableHeaderText,
                {color: colors.textSecondary, textAlign: 'right'},
              ]}>
              Merit
            </Text>
            <Text
              style={[
                styles.yearTableHeaderText,
                {color: colors.textSecondary, textAlign: 'right'},
              ]}>
              Seats
            </Text>
            <Text
              style={[
                styles.yearTableHeaderText,
                {color: colors.textSecondary, textAlign: 'right'},
              ]}>
              Change
            </Text>
          </View>
          {program.years.map((yearData, idx) => {
            const prevYear = program.years[idx + 1];
            const change = prevYear
              ? yearData.closingMerit - prevYear.closingMerit
              : null;
            return (
              <View
                key={yearData.year}
                style={[
                  styles.yearRow,
                  {
                    backgroundColor:
                      idx % 2 === 0
                        ? isDark
                          ? 'rgba(255,255,255,0.02)'
                          : 'rgba(0,0,0,0.02)'
                        : 'transparent',
                  },
                ]}>
                <Text style={[styles.yearValue, {color: colors.text}]}>
                  {yearData.year}
                </Text>
                <Text
                  style={[styles.yearSession, {color: colors.textSecondary}]}>
                  {yearData.session}
                </Text>
                <Text
                  style={[
                    styles.yearMerit,
                    {color: getMeritColor(yearData.closingMerit)},
                  ]}>
                  {yearData.closingMerit.toFixed(1)}%
                </Text>
                <Text
                  style={[styles.yearSeats, {color: colors.textSecondary}]}>
                  {yearData.totalSeats}
                </Text>
                <View style={styles.yearChange}>
                  {change !== null ? (
                    <View style={styles.changeRow}>
                      <Icon
                        name={change >= 0 ? 'caret-up' : 'caret-down'}
                        family="Ionicons"
                        size={10}
                        color={change >= 0 ? '#10B981' : '#EF4444'}
                      />
                      <Text
                        style={[
                          styles.changeValue,
                          {color: change >= 0 ? '#10B981' : '#EF4444'},
                        ]}>
                        {change >= 0 ? '+' : ''}
                        {change.toFixed(1)}
                      </Text>
                    </View>
                  ) : (
                    <Text
                      style={[
                        styles.changeValue,
                        {color: colors.textSecondary},
                      ]}>
                      {'\u2014'}
                    </Text>
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
// CAMPUS SECTION - Shows programs under a campus
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
            {
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.04)'
                : 'rgba(0,0,0,0.03)',
            },
          ]}
          onPress={() => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut,
            );
            setExpanded(!expanded);
            Haptics.light();
          }}
          activeOpacity={0.7}>
          <View style={styles.campusInfo}>
            <Icon
              name="location-outline"
              family="Ionicons"
              size={14}
              color={colors.primary}
            />
            <Text style={[styles.campusName, {color: colors.text}]}>
              {campus.campus} Campus
            </Text>
            <View
              style={[
                styles.campusBadge,
                {backgroundColor: `${colors.primary}15`},
              ]}>
              <Text
                style={[styles.campusBadgeText, {color: colors.primary}]}>
                {campus.programs.length}{' '}
                {campus.programs.length === 1 ? 'program' : 'programs'}
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
// UNIVERSITY CARD - Expandable with campuses and programs
// ============================================================================

const UniversityCard: React.FC<{
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

  const getMeritColor = (merit: number) => {
    if (merit >= 95) return '#EF4444';
    if (merit >= 90) return '#F59E0B';
    if (merit >= 85) return colors.primary;
    if (merit >= 75) return '#10B981';
    return '#6B7280';
  };

  return (
    <Animated.View
      style={[
        styles.universityCard,
        {backgroundColor: colors.card, opacity: fadeAnim},
      ]}>
      {/* University header - always visible */}
      <TouchableOpacity
        style={styles.uniHeader}
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setExpanded(!expanded);
          Haptics.light();
        }}
        activeOpacity={0.7}>
        <View style={styles.uniHeaderLeft}>
          <View
            style={[
              styles.uniInitial,
              {backgroundColor: `${colors.primary}15`},
            ]}>
            <Text style={[styles.uniInitialText, {color: colors.primary}]}>
              {university.shortName.substring(0, 3)}
            </Text>
          </View>
          <View style={styles.uniHeaderInfo}>
            <View style={styles.uniNameRow}>
              <Text
                style={[styles.uniName, {color: colors.text}]}
                numberOfLines={1}>
                {university.universityName}
              </Text>
              {isPortalOnly && (
                <View
                  style={[
                    styles.portalBadge,
                    {backgroundColor: 'rgba(59, 130, 246, 0.1)'},
                  ]}>
                  <Icon
                    name="globe-outline"
                    family="Ionicons"
                    size={10}
                    color="#3B82F6"
                  />
                  <Text style={styles.portalBadgeText}>Portal</Text>
                </View>
              )}
            </View>
            <View style={styles.uniMeta}>
              <Text
                style={[styles.uniMetaText, {color: colors.textSecondary}]}>
                {university.campusCount}{' '}
                {university.campusCount === 1 ? 'campus' : 'campuses'}{' '}
                {'\u00B7'} {university.programCount}{' '}
                {university.programCount === 1 ? 'program' : 'programs'}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.uniHeaderRight}>
          {university.latestMerit && (
            <Text
              style={[
                styles.uniMeritBadge,
                {color: getMeritColor(university.latestMerit)},
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
            {
              borderTopColor: isDark
                ? 'rgba(255,255,255,0.06)'
                : 'rgba(0,0,0,0.06)',
            },
          ]}>
          {/* Portal info card for portal_only universities */}
          {meritInfo && (
            <PortalInfoCard
              meritInfo={meritInfo}
              colors={colors}
              isDark={isDark}
            />
          )}

          {/* Social links */}
          {meritInfo && (
            <SocialLinksRow meritInfo={meritInfo} colors={colors} />
          )}

          {/* Campus -> Program tree */}
          {university.campuses.map((campus, idx) => (
            <CampusSection
              key={`${campus.campus}-${idx}`}
              campus={campus}
              showCampusHeader={university.campusCount > 1}
              colors={colors}
              isDark={isDark}
            />
          ))}

          {/* Visit official website suggestion */}
          {meritInfo?.admissionUrl && (
            <TouchableOpacity
              style={[
                styles.visitWebsite,
                {
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.04)'
                    : 'rgba(0,0,0,0.03)',
                },
              ]}
              onPress={() => Linking.openURL(meritInfo.admissionUrl!)}
              activeOpacity={0.7}>
              <Icon
                name="open-outline"
                family="Ionicons"
                size={14}
                color={colors.primary}
              />
              <Text
                style={[styles.visitWebsiteText, {color: colors.primary}]}>
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
// INSIGHT CARD COMPONENT
// ============================================================================

const InsightCard: React.FC<{
  title: string;
  value: string;
  subtitle: string;
  iconName: string;
  color: string;
  colors: any;
}> = ({title, value, subtitle, iconName, color, colors}) => (
  <View style={[styles.insightCard, {backgroundColor: colors.card}]}>
    <View style={[styles.insightIcon, {backgroundColor: `${color}15`}]}>
      <Icon name={iconName} family="Ionicons" size={20} color={color} />
    </View>
    <Text style={[styles.insightTitle, {color: colors.textSecondary}]}>
      {title}
    </Text>
    <Text style={[styles.insightValue, {color: colors.text}]}>{value}</Text>
    <Text style={[styles.insightSubtitle, {color: colors.textSecondary}]}>
      {subtitle}
    </Text>
  </View>
);

// ============================================================================
// MAIN SCREEN COMPONENT
// ============================================================================

const PremiumMeritArchiveScreen = () => {
  const navigation = useNavigation();
  const {colors, isDark} = useTheme();

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [meritRecords, setMeritRecords] =
    useState<MeritRecord[]>(MERIT_RECORDS);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const headerAnim = useRef(new Animated.Value(0)).current;

  // Load merit data
  const loadMeritData = useCallback(async () => {
    try {
      const {data} = await fetchMeritLists();
      if (data && data.length > 0) {
        setMeritRecords(data);
      }
    } catch (err) {
      logger.debug('Using local merit data', err, 'MeritArchive');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMeritData();
  }, [loadMeritData]);

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.refreshThreshold();
    await loadMeritData();
    setRefreshing(false);
    Haptics.success();
  }, [loadMeritData]);

  // Build the merit tree with filters
  const meritTree = useMemo(() => {
    let tree = buildMeritTree(
      meritRecords,
      selectedYear || undefined,
      selectedCategory !== 'all' ? selectedCategory : undefined,
    );

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      tree = tree.filter(
        uni =>
          uni.universityName.toLowerCase().includes(query) ||
          uni.shortName.toLowerCase().includes(query) ||
          uni.campuses.some(
            c =>
              c.campus.toLowerCase().includes(query) ||
              c.programs.some(p =>
                p.programName.toLowerCase().includes(query),
              ),
          ),
      );
    }

    return tree;
  }, [meritRecords, selectedYear, selectedCategory, searchQuery]);

  // Insights for selected year
  const insights = useMemo(() => {
    return getMeritInsights(
      meritRecords,
      selectedYear || AVAILABLE_YEARS[0],
    );
  }, [meritRecords, selectedYear]);

  // Stats
  const uniqueUniversities = useMemo(() => {
    return new Set(meritRecords.map(r => r.universityId)).size;
  }, [meritRecords]);

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <Animated.View
          style={[
            styles.headerContainer,
            {
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}>
          <LinearGradient
            colors={
              isDark
                ? ['#059669', '#047857', '#065F46']
                : ['#10B981', '#059669', '#047857']
            }
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.header}>
            <View style={styles.headerDecoCircle1} />
            <View style={styles.headerDecoCircle2} />

            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}>
              <Icon
                name="arrow-back"
                family="Ionicons"
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <View style={styles.headerIconCircle}>
                <Icon
                  name="archive-outline"
                  family="Ionicons"
                  size={32}
                  color="#FFFFFF"
                />
              </View>
              <Text style={styles.headerTitle}>Merit Archive</Text>
              <Text style={styles.headerSubtitle}>
                {uniqueUniversities} universities {'\u00B7'}{' '}
                {meritRecords.length} records
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Search */}
        <View style={styles.searchWrapper}>
          <PremiumSearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder="Search university, program, city..."
            variant="default"
            size="md"
          />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#059669']}
              tintColor="#059669"
            />
          }>
          {/* Year Selector - All Years option + individual years */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.yearContainer}>
            <TouchableOpacity
              style={[
                styles.yearChip,
                {
                  backgroundColor:
                    selectedYear === null ? colors.primary : colors.card,
                  borderColor:
                    selectedYear === null ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSelectedYear(null)}
              activeOpacity={0.8}>
              <Text
                style={[
                  styles.yearText,
                  {color: selectedYear === null ? '#FFFFFF' : colors.text},
                ]}>
                All Years
              </Text>
            </TouchableOpacity>
            {AVAILABLE_YEARS.map(year => (
              <TouchableOpacity
                key={year}
                style={[
                  styles.yearChip,
                  {
                    backgroundColor:
                      selectedYear === year ? colors.primary : colors.card,
                    borderColor:
                      selectedYear === year ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedYear(year)}
                activeOpacity={0.8}>
                <Text
                  style={[
                    styles.yearText,
                    {color: selectedYear === year ? '#FFFFFF' : colors.text},
                  ]}>
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Category Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContainer}>
            {MERIT_CATEGORIES.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor:
                      selectedCategory === category.id
                        ? `${colors.primary}15`
                        : 'transparent',
                    borderColor:
                      selectedCategory === category.id
                        ? colors.primary
                        : colors.border,
                  },
                ]}
                onPress={() => setSelectedCategory(category.id)}
                activeOpacity={0.8}>
                <Icon
                  name={category.iconName}
                  family="Ionicons"
                  size={14}
                  color={
                    selectedCategory === category.id
                      ? colors.primary
                      : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color:
                        selectedCategory === category.id
                          ? colors.primary
                          : colors.text,
                    },
                  ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Insights Cards */}
          {insights && (
            <View style={styles.insightsContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <InsightCard
                  title="Average Merit"
                  value={`${insights.avgMerit.toFixed(1)}%`}
                  subtitle={
                    selectedYear ? `${selectedYear} session` : 'All years'
                  }
                  iconName="analytics-outline"
                  color={colors.primary}
                  colors={colors}
                />
                <InsightCard
                  title="Highest Merit"
                  value={`${insights.highestMerit.toFixed(1)}%`}
                  subtitle={
                    insights.highestProgram?.universityShortName || ''
                  }
                  iconName="arrow-up-circle-outline"
                  color="#EF4444"
                  colors={colors}
                />
                <InsightCard
                  title="Lowest Merit"
                  value={`${insights.lowestMerit.toFixed(1)}%`}
                  subtitle={
                    insights.lowestProgram?.universityShortName || ''
                  }
                  iconName="arrow-down-circle-outline"
                  color="#10B981"
                  colors={colors}
                />
                <InsightCard
                  title="Programs"
                  value={`${insights.totalPrograms}`}
                  subtitle="in database"
                  iconName="school-outline"
                  color="#F59E0B"
                  colors={colors}
                />
              </ScrollView>
            </View>
          )}

          {/* Data Disclaimer */}
          <DisclaimerBanner colors={colors} isDark={isDark} />

          {/* Results count */}
          <View style={styles.resultsCount}>
            <Text
              style={[styles.resultsText, {color: colors.textSecondary}]}>
              {meritTree.length}{' '}
              {meritTree.length === 1 ? 'university' : 'universities'}
              {searchQuery ? ` matching "${searchQuery}"` : ''}
              {selectedYear
                ? ` ${'\u00B7'} ${selectedYear}`
                : ` ${'\u00B7'} All years`}
            </Text>
          </View>

          {/* University Tree */}
          {meritTree.length > 0 ? (
            meritTree.map((university, index) => (
              <UniversityCard
                key={university.universityId}
                university={university}
                colors={colors}
                isDark={isDark}
                index={index}
              />
            ))
          ) : (
            <View style={[styles.emptyState, {backgroundColor: colors.card}]}>
              <Icon
                name="search-outline"
                family="Ionicons"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyTitle, {color: colors.text}]}>
                No Records Found
              </Text>
              <Text
                style={[styles.emptyText, {color: colors.textSecondary}]}>
                {searchQuery
                  ? 'Try a different search term or adjust filters'
                  : 'No merit data available for the selected filters'}
              </Text>
            </View>
          )}

          <View style={{height: 100}} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {flex: 1},
  safeArea: {flex: 1},
  scrollContent: {paddingBottom: SPACING.xl},

  // Header
  headerContainer: {},
  header: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: RADIUS.xxl,
    borderBottomRightRadius: RADIUS.xxl,
    overflow: 'hidden',
  },
  headerDecoCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerDecoCircle2: {
    position: 'absolute',
    bottom: 20,
    left: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  backBtn: {
    position: 'absolute',
    top: SPACING.lg,
    left: SPACING.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  headerContent: {alignItems: 'center', paddingTop: SPACING.xl},
  headerIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weight.bold as any,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
  },

  // Search
  searchWrapper: {
    paddingHorizontal: SPACING.lg,
    marginTop: -20,
    marginBottom: SPACING.md,
  },

  // Year Selector
  yearContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  yearChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginRight: SPACING.sm,
  },
  yearText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold as any,
  },

  // Category Filter
  categoryContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    marginRight: SPACING.sm,
    gap: SPACING.xs,
  },
  categoryText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.semibold as any,
  },

  // Insights
  insightsContainer: {paddingLeft: SPACING.lg, marginBottom: SPACING.md},
  insightCard: {
    width: 130,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginRight: SPACING.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {elevation: 2},
    }),
  },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  insightTitle: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weight.medium as any,
    marginBottom: 2,
  },
  insightValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold as any,
  },
  insightSubtitle: {fontSize: 10, marginTop: 2},

  // Disclaimer Banner
  disclaimerBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
  },
  disclaimerBannerText: {flex: 1},
  disclaimerTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.bold as any,
    marginBottom: 2,
  },
  disclaimerBody: {fontSize: 11, lineHeight: 16},

  // Results Count
  resultsCount: {paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm},
  resultsText: {fontSize: TYPOGRAPHY.sizes.xs},

  // University Card
  universityCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {elevation: 2},
    }),
  },
  uniHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  uniHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  uniInitial: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uniInitialText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.bold as any,
  },
  uniHeaderInfo: {flex: 1},
  uniNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flexWrap: 'wrap',
  },
  uniName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.bold as any,
    flexShrink: 1,
  },
  portalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  portalBadgeText: {
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weight.bold as any,
    color: '#3B82F6',
  },
  uniMeta: {marginTop: 2},
  uniMetaText: {fontSize: 11},
  uniHeaderRight: {alignItems: 'flex-end', gap: 4},
  uniMeritBadge: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold as any,
  },

  // University Body (expanded)
  uniBody: {borderTopWidth: StyleSheet.hairlineWidth, paddingBottom: SPACING.sm},

  // Portal Info Card
  portalCard: {
    margin: SPACING.sm,
    marginBottom: 0,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
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
  },
  portalNote: {fontSize: 11, lineHeight: 16, marginBottom: SPACING.sm},
  portalLinks: {flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm},
  portalLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.md,
    gap: SPACING.xs,
  },
  portalLinkText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.bold as any,
    color: '#FFFFFF',
  },
  portalLinkTextAlt: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.bold as any,
  },

  // Social Links
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
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

  // Campus Section
  campusSection: {marginTop: 2},
  campusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.sm,
    marginTop: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  campusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flex: 1,
  },
  campusName: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.bold as any,
  },
  campusBadge: {paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4},
  campusBadgeText: {
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weight.semibold as any,
  },

  // Program Row
  programRow: {
    marginHorizontal: SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  programHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  programInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flex: 1,
  },
  programName: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.semibold as any,
    flex: 1,
  },
  programMeritBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  programMeritValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.bold as any,
  },

  // Year table within program
  programYears: {paddingHorizontal: SPACING.sm, paddingBottom: SPACING.sm},
  yearTableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: SPACING.xs,
    marginBottom: 2,
  },
  yearTableHeaderText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weight.semibold as any,
    flex: 1,
    textTransform: 'uppercase',
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: SPACING.xs,
    borderRadius: 4,
  },
  yearValue: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.bold as any,
    flex: 1,
  },
  yearSession: {fontSize: 11, flex: 1},
  yearMerit: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.bold as any,
    flex: 1,
    textAlign: 'right',
  },
  yearSeats: {fontSize: 11, flex: 1, textAlign: 'right'},
  yearChange: {flex: 1, alignItems: 'flex-end'},
  changeRow: {flexDirection: 'row', alignItems: 'center', gap: 1},
  changeValue: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weight.semibold as any,
  },

  // Visit Website
  visitWebsite: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
    margin: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    gap: SPACING.xs,
  },
  visitWebsiteText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weight.semibold as any,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold as any,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
  },
});

export default PremiumMeritArchiveScreen;
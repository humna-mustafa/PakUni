import React, {useRef, useEffect, useState, useCallback, memo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  StatusBar,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, CompositeNavigationProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import LinearGradient from 'react-native-linear-gradient';
import {
  MODERN_SPACING,
  MODERN_RADIUS,
  MODERN_TYPOGRAPHY,
  MODERN_SHADOWS,
  MODERN_MOTION,
} from '../constants/modern-design';
import {
  PP_SPACING,
  PP_BORDERS,
  PP_SHADOWS,
  PP_MOTION,
  PP_TYPOGRAPHY,
  roundToPixel,
  HAIRLINE_WIDTH,
} from '../constants/pixel-perfect';
import {useTheme} from '../contexts/ThemeContext';
import {UNIVERSITIES, SCHOLARSHIPS, ENTRY_TESTS_DATA} from '../data';
import {Icon} from '../components/icons';
import UniversityLogo from '../components/UniversityLogo';
import {
  ModernCard,
  ModernSectionHeader,
  PremiumSearchBar,
  LogoBadge,
} from '../components';
import NotificationBell from '../components/NotificationBell';
import type {RootStackParamList, TabParamList} from '../navigation/AppNavigator';

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList>,
  BottomTabNavigationProp<TabParamList>
>;

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// ============================================================================
// PREMIUM HERO CARD - Refined "Discover Your University" Design
// Crafted with attention to visual hierarchy, spacing, and modern aesthetics
// ============================================================================

interface HeroCardProps {
  onExplorePress: () => void;
  onAIMatchPress: () => void;
  colors: any;
  isDark: boolean;
}

const HeroCard = memo<HeroCardProps>(({
  onExplorePress,
  onAIMatchPress,
  colors,
  isDark,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Refined color palette based on primary
  const accentLight = isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.08)';
  const cardBg = isDark ? '#1A1F2E' : '#FFFFFF';

  return (
    <Animated.View 
      style={[
        heroStyles.heroWrapper,
        {
          opacity: fadeAnim,
          transform: [{translateY: slideAnim}],
        }
      ]}
    >
      <View style={[heroStyles.heroCard, {backgroundColor: cardBg}]}>
        {/* Subtle gradient overlay at top */}
        <LinearGradient
          colors={[
            isDark ? 'rgba(99, 102, 241, 0.12)' : 'rgba(99, 102, 241, 0.06)',
            'transparent',
          ]}
          style={heroStyles.heroGradientOverlay}
        />

        {/* Main Content */}
        <View style={heroStyles.heroContent}>
          {/* Top Row: Icon + Badge */}
          <View style={heroStyles.heroTopRow}>
            <View style={[heroStyles.heroIconWrap, {backgroundColor: colors.primary}]}>
              <Icon name="school" family="Ionicons" size={20} color="#FFFFFF" />
            </View>
            <View style={[heroStyles.heroBadge, {backgroundColor: accentLight}]}>
              <View style={[heroStyles.heroBadgeDot, {backgroundColor: colors.primary}]} />
              <Text style={[heroStyles.heroBadgeText, {color: colors.primary}]}>
                Smart Matching
              </Text>
            </View>
          </View>

          {/* Title Section */}
          <View style={heroStyles.heroTitleSection}>
            <Text style={[heroStyles.heroTitle, {color: colors.text}]}>
              Discover Your
            </Text>
            <Text style={[heroStyles.heroTitleAccent, {color: colors.primary}]}>
              Perfect University
            </Text>
          </View>

          {/* Description */}
          <Text style={[heroStyles.heroDescription, {color: colors.textSecondary}]}>
            Explore 200+ universities with AI-powered recommendations tailored to your academic profile
          </Text>

          {/* Action Row */}
          <View style={heroStyles.heroActionRow}>
            <TouchableOpacity
              style={[heroStyles.heroPrimaryAction, {backgroundColor: colors.primary}]}
              onPress={onExplorePress}
              activeOpacity={0.9}
            >
              <Text style={heroStyles.heroPrimaryText}>Explore Universities</Text>
              <View style={heroStyles.heroArrowWrap}>
                <Icon name="arrow-forward" family="Ionicons" size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                heroStyles.heroSecondaryAction,
                {borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}
              ]}
              onPress={onAIMatchPress}
              activeOpacity={0.8}
            >
              <Icon name="sparkles" family="Ionicons" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );
});

// ============================================================================
// PREMIUM CTA CARD - "Start Your Journey" with Refined Aesthetics
// ============================================================================

interface JourneyCTACardProps {
  onPress: () => void;
  colors: any;
  isDark: boolean;
}

const JourneyCTACard = memo<JourneyCTACardProps>(({
  onPress,
  colors,
  isDark,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.985,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
      friction: 8,
    }).start();
  };

  return (
    <Animated.View style={[journeyStyles.ctaWrapper, {transform: [{scale: scaleAnim}]}]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <LinearGradient
          colors={[
            colors.primary,
            `${colors.primary}F2`,
            `${colors.primary}E0`,
          ]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={journeyStyles.ctaCard}
        >
          {/* Subtle decorative circle */}
          <View style={journeyStyles.ctaDecoCircle} />

          {/* Content Layout - Horizontal for cleaner look */}
          <View style={journeyStyles.ctaLayout}>
            {/* Left: Icon */}
            <View style={journeyStyles.ctaIconSection}>
              <View style={journeyStyles.ctaIconCircle}>
                <Icon name="calculator" family="Ionicons" size={24} color="#FFFFFF" />
              </View>
            </View>

            {/* Center: Text */}
            <View style={journeyStyles.ctaTextSection}>
              <Text style={journeyStyles.ctaEyebrow}>MERIT CALCULATOR</Text>
              <Text style={journeyStyles.ctaHeadline}>Calculate Your Score</Text>
              <Text style={journeyStyles.ctaCaption}>
                Find universities matching your profile
              </Text>
            </View>

            {/* Right: Arrow */}
            <View style={journeyStyles.ctaArrowSection}>
              <View style={journeyStyles.ctaArrowCircle}>
                <Icon name="chevron-forward" family="Ionicons" size={20} color={colors.primary} />
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
});

// ============================================================================
// QUICK ACTION CARD - Clean, minimal design
// ============================================================================

const QuickActionCard = ({
  action,
  index,
  colors,
  onPress,
}: {
  action: any;
  index: number;
  colors: any;
  onPress: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      ...MODERN_MOTION.spring.snappy,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...MODERN_MOTION.spring.snappy,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.actionCardWrapper,
        {transform: [{scale: scaleAnim}]},
      ]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={action.title}
        style={[styles.actionCard, {backgroundColor: colors.card}]}>
        <View style={[styles.actionIconContainer, {backgroundColor: colors.primaryLight}]}>
          <Icon name={action.iconName} family="Ionicons" size={22} color={colors.primary} />
        </View>
        <Text style={[styles.actionTitle, {color: colors.text}]} numberOfLines={1}>
          {action.title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ============================================================================
// UNIVERSITY CARD - Clean, informative design
// ============================================================================

const UniversityCard = ({
  uni,
  rank,
  colors,
  isDark,
  onPress,
}: {
  uni: any;
  rank: number;
  colors: any;
  isDark: boolean;
  onPress: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      ...MODERN_MOTION.spring.snappy,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...MODERN_MOTION.spring.snappy,
    }).start();
  };

  return (
    <Animated.View style={{transform: [{scale: scaleAnim}]}}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={`${uni.name}, ranked number ${rank}`}
        style={[styles.uniCard, {backgroundColor: colors.card}]}>
        {/* Rank Badge */}
        <View style={[styles.uniRankBadge, {backgroundColor: colors.primary}]}>
          <Text style={styles.uniRankText}>#{rank}</Text>
        </View>

        {/* Logo - Using UniversityLogo for static Supabase storage */}
        <UniversityLogo
          shortName={uni.short_name}
          universityName={uni.name}
          size={48}
          borderRadius={10}
          style={styles.uniLogoContainer}
        />

        {/* Info */}
        <Text style={[styles.uniName, {color: colors.text}]} numberOfLines={2}>
          {uni.name}
        </Text>

        <View style={styles.uniLocationRow}>
          <Icon name="location-outline" family="Ionicons" size={12} color={colors.textSecondary} />
          <Text style={[styles.uniCity, {color: colors.textSecondary, marginLeft: 4}]} numberOfLines={1}>
            {uni.city}
          </Text>
        </View>

        {/* Type Badge */}
        <View
          style={[
            styles.uniTypeBadge,
            {backgroundColor: uni.type === 'public' ? `${colors.success}15` : `${colors.primary}15`},
          ]}>
          <Text
            style={[
              styles.uniTypeText,
              {color: uni.type === 'public' ? colors.success : colors.primary},
            ]}>
            {uni.type.toUpperCase()}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const PremiumHomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const {colors, isDark} = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [searchQuery, setSearchQuery] = useState('');

  const topUniversities = UNIVERSITIES
    .filter(u => u.ranking_national)
    .sort((a, b) => (a.ranking_national || 999) - (b.ranking_national || 999))
    .slice(0, 6);

  const featuredScholarships = SCHOLARSHIPS.filter(
    (s: {type: string}) => s.type === 'government',
  ).slice(0, 3);

  // Clean, simple quick actions
  const quickActions = [
    {id: '1', iconName: 'school', title: 'Universities', screen: 'Universities'},
    {id: '2', iconName: 'calculator', title: 'Merit Calc', screen: 'Calculator'},
    {id: '3', iconName: 'ribbon', title: 'Scholarships', screen: 'Scholarships'},
    {id: '4', iconName: 'clipboard', title: 'Entry Tests', screen: 'EntryTests'},
    {id: '5', iconName: 'sparkles', title: 'AI Match', screen: 'Recommendations'},
    {id: '6', iconName: 'navigate', title: 'Careers', screen: 'CareerGuidance'},
    {id: '7', iconName: 'book', title: 'Guides', screen: 'Guides'},
    {id: '8', iconName: 'construct', title: 'Tools', screen: 'Tools'},
    {id: '9', iconName: 'game-controller', title: 'Fun Game', screen: 'ResultGame'},
    {id: '10', iconName: 'podium', title: 'Polls', screen: 'Polls'},
    {id: '11', iconName: 'time', title: 'Deadlines', screen: 'Deadlines'},
    {id: '12', iconName: 'archive', title: 'Merit Lists', screen: 'MeritArchive'},
    {id: '13', iconName: 'trophy', title: 'Achievements', screen: 'Achievements'},
    {id: '14', iconName: 'happy', title: 'For Kids', screen: 'KidsHub'},
  ];

  const handleNavigate = useCallback((screen: string) => {
    switch (screen) {
      case 'Calculator':
        navigation.navigate('Calculator');
        break;
      case 'EntryTests':
        navigation.navigate('EntryTests');
        break;
      case 'Compare':
        navigation.navigate('Compare');
        break;
      case 'CareerGuidance':
        navigation.navigate('CareerGuidance');
        break;
      case 'Recommendations':
        navigation.navigate('Recommendations');
        break;
      case 'Polls':
        navigation.navigate('Polls');
        break;
      case 'Deadlines':
        navigation.navigate('Deadlines');
        break;
      case 'MeritArchive':
        navigation.navigate('MeritArchive');
        break;
      case 'KidsHub':
        navigation.navigate('KidsHub');
        break;
      case 'InterestQuiz':
        navigation.navigate('InterestQuiz');
        break;
      case 'Guides':
        navigation.navigate('Guides');
        break;
      case 'Tools':
        navigation.navigate('Tools');
        break;
      case 'ResultGame':
        navigation.navigate('ResultGame');
        break;
      case 'Achievements':
        navigation.navigate('Achievements');
        break;
      case 'Universities':
        navigation.navigate('MainTabs', {screen: 'Universities'});
        break;
      case 'Scholarships':
        navigation.navigate('MainTabs', {screen: 'Scholarships'});
        break;
      default:
        break;
    }
  }, [navigation]);

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Clean Header with Logo + Notification Bell */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <LogoBadge size="sm" showGlow />
            <View style={styles.headerTextContainer}>
              <Text style={[styles.greeting, {color: colors.textSecondary}]}>
                Welcome back,
              </Text>
              <Text style={[styles.appName, {color: colors.text}]}>Student</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            {/* Notification Bell with Dropdown */}
            <NotificationBell
              size={40}
              onNotificationPress={(notification) => {
                // Handle notification navigation
                if (notification.actionRoute) {
                  navigation.navigate(notification.actionRoute as any);
                }
              }}
              onSeeAllPress={() => navigation.navigate('Notifications')}
            />
            {/* Profile Button */}
            <TouchableOpacity
              style={[styles.profileBtn, {backgroundColor: colors.primary}]}
              onPress={() => navigation.navigate('MainTabs', {screen: 'Profile'})}
              accessibilityRole="button"
              accessibilityLabel="View your profile">
              <Icon name="person" family="Ionicons" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{nativeEvent: {contentOffset: {y: scrollY}}}],
            {useNativeDriver: false},
          )}
          scrollEventThrottle={16}
          contentContainerStyle={{paddingBottom: 120}}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag">
          
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <PremiumSearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search universities, scholarships..."
              variant="filled"
            />
          </View>

          {/* Pixel Perfect Hero Card - "Discover Your University" */}
          <HeroCard
            onExplorePress={() => navigation.navigate('MainTabs', {screen: 'Universities'})}
            onAIMatchPress={() => navigation.navigate('Recommendations')}
            colors={colors}
            isDark={isDark}
          />

          {/* Quick Actions */}
          <View style={styles.section}>
            <ModernSectionHeader title="Quick Actions" subtitle="Explore features" />
            <View style={styles.actionsGrid}>
              {quickActions.map((action, index) => (
                <QuickActionCard
                  key={action.id}
                  action={action}
                  index={index}
                  colors={colors}
                  onPress={() => handleNavigate(action.screen)}
                />
              ))}
            </View>
          </View>

          {/* Top Universities */}
          <View style={styles.section}>
            <ModernSectionHeader
              title="Top Universities"
              subtitle="Highest ranked"
              action="See All"
              onActionPress={() => navigation.navigate('MainTabs', {screen: 'Universities'})}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.uniCarousel}
              decelerationRate="fast">
              {topUniversities.map((uni, index) => (
                <UniversityCard
                  key={uni.short_name}
                  uni={uni}
                  rank={index + 1}
                  colors={colors}
                  isDark={isDark}
                  onPress={() =>
                    navigation.navigate('UniversityDetail', {
                      universityId: uni.short_name,
                    })
                  }
                />
              ))}
            </ScrollView>
          </View>

          {/* Entry Tests Section */}
          <View style={styles.section}>
            <ModernSectionHeader
              title="Entry Tests"
              subtitle="Prepare for success"
              action="View All"
              onActionPress={() => navigation.navigate('EntryTests')}
            />
            <View style={styles.testsContainer}>
              {ENTRY_TESTS_DATA.slice(0, 4).map((test) => (
                <TouchableOpacity
                  key={test.id}
                  style={[styles.testCard, {backgroundColor: colors.card}]}
                  onPress={() => navigation.navigate('EntryTests')}
                  accessibilityRole="button"
                  accessibilityLabel={`${test.name} - ${test.full_name}`}
                  activeOpacity={0.7}>
                  <View style={[styles.testIconContainer, {backgroundColor: colors.primaryLight}]}>
                    <Icon name="document-text-outline" family="Ionicons" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.testInfo}>
                    <Text style={[styles.testName, {color: colors.text}]} numberOfLines={1}>
                      {test.name}
                    </Text>
                    <Text style={[styles.testFullName, {color: colors.textSecondary}]} numberOfLines={1}>
                      {test.full_name}
                    </Text>
                  </View>
                  <Icon name="chevron-forward" family="Ionicons" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Featured Scholarships */}
          <View style={styles.section}>
            <ModernSectionHeader
              title="Featured Scholarships"
              subtitle="Fund your education"
              action="See All"
              onActionPress={() => navigation.navigate('MainTabs', {screen: 'Scholarships'})}
            />
            <View style={styles.scholarshipsContainer}>
              {featuredScholarships.map((scholarship: any) => (
                <View key={scholarship.id} style={[styles.scholarshipCard, {backgroundColor: colors.card}]}>
                  <View style={styles.scholarshipHeader}>
                    <View style={[styles.scholarshipIconBg, {backgroundColor: `${colors.success}15`}]}>
                      <Icon name="ribbon-outline" family="Ionicons" size={20} color={colors.success} />
                    </View>
                    <View style={styles.scholarshipTitleContainer}>
                      <Text style={[styles.scholarshipName, {color: colors.text}]} numberOfLines={1}>
                        {scholarship.name}
                      </Text>
                      <Text style={[styles.scholarshipProvider, {color: colors.textSecondary}]} numberOfLines={1}>
                        {scholarship.provider}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.coverageTag,
                        {
                          backgroundColor:
                            scholarship.coverage_percentage === 100
                              ? `${colors.success}15`
                              : `${colors.warning}15`,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.coverageText,
                          {
                            color:
                              scholarship.coverage_percentage === 100
                                ? colors.success
                                : colors.warning,
                          },
                        ]}>
                        {scholarship.coverage_percentage}%
                      </Text>
                    </View>
                  </View>
                  {scholarship.monthly_stipend && (
                    <View style={styles.scholarshipDetails}>
                      <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>
                        Monthly Stipend
                      </Text>
                      <Text style={[styles.detailValue, {color: colors.success}]}>
                        PKR {scholarship.monthly_stipend.toLocaleString()}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Pixel Perfect CTA Card - "Ready to Start Your Journey" */}
          <JourneyCTACard
            onPress={() => navigation.navigate('Calculator')}
            colors={colors}
            isDark={isDark}
          />
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: MODERN_SPACING.lg,
    paddingTop: MODERN_SPACING.md,
    paddingBottom: MODERN_SPACING.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MODERN_SPACING.sm,
  },
  headerTextContainer: {
    marginLeft: 4,
  },
  greeting: {
    fontSize: MODERN_TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
  },
  appName: {
    fontSize: MODERN_TYPOGRAPHY.sizes.xl,
    fontWeight: '600',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MODERN_SPACING.sm,
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: MODERN_SPACING.lg,
    marginBottom: MODERN_SPACING.md,
  },
  // Hero Section - Clean solid background
  heroSection: {
    marginHorizontal: MODERN_SPACING.lg,
    borderRadius: MODERN_RADIUS.xl,
    padding: MODERN_SPACING.xl,
    marginBottom: MODERN_SPACING.lg,
  },
  heroContent: {
    alignItems: 'flex-start',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: MODERN_SPACING.sm,
    lineHeight: 32,
  },
  heroSubtitle: {
    fontSize: MODERN_TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: MODERN_SPACING.lg,
    lineHeight: 20,
  },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: MODERN_SPACING.lg,
    paddingVertical: MODERN_SPACING.sm + 2,
    borderRadius: MODERN_RADIUS.full,
    gap: MODERN_SPACING.xs,
  },
  heroBtnText: {
    fontWeight: '600',
    fontSize: MODERN_TYPOGRAPHY.sizes.sm,
  },
  // Stats Section - Clean card
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: MODERN_SPACING.lg,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.lg,
    ...MODERN_SHADOWS.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: MODERN_TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: MODERN_TYPOGRAPHY.sizes.xs,
    marginTop: 2,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: '60%',
    alignSelf: 'center',
  },
  // Sections
  section: {
    marginBottom: MODERN_SPACING.xl,
  },
  // Quick Actions Grid
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: MODERN_SPACING.lg,
    gap: MODERN_SPACING.sm,
  },
  actionCardWrapper: {
    width: (SCREEN_WIDTH - MODERN_SPACING.lg * 2 - MODERN_SPACING.sm * 3) / 4,
  },
  actionCard: {
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.sm,
    paddingVertical: MODERN_SPACING.md,
    alignItems: 'center',
    minHeight: 88,
    justifyContent: 'center',
    ...MODERN_SHADOWS.xs,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: MODERN_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: MODERN_SPACING.xs,
  },
  actionTitle: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  // University Carousel
  uniCarousel: {
    paddingHorizontal: MODERN_SPACING.lg,
    gap: MODERN_SPACING.sm,
  },
  uniCard: {
    width: SCREEN_WIDTH * 0.38,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.sm,
    alignItems: 'center',
    ...MODERN_SHADOWS.sm,
  },
  uniRankBadge: {
    position: 'absolute',
    top: MODERN_SPACING.xs,
    left: MODERN_SPACING.xs,
    paddingHorizontal: MODERN_SPACING.xs + 2,
    paddingVertical: 3,
    borderRadius: MODERN_RADIUS.sm,
  },
  uniRankText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  uniLogoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: MODERN_SPACING.xs,
    marginBottom: MODERN_SPACING.xs,
    overflow: 'hidden',
  },
  uniLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  uniLogoPlaceholder: {
    fontSize: 22,
  },
  uniName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
    paddingHorizontal: 2,
    lineHeight: 16,
    height: 32,
  },
  uniLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: MODERN_SPACING.xs,
  },
  uniCity: {
    fontSize: MODERN_TYPOGRAPHY.sizes.xs,
    fontWeight: '500',
    marginLeft: 2,
  },
  uniTypeBadge: {
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: 3,
    borderRadius: MODERN_RADIUS.sm,
  },
  uniTypeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  // Entry Tests
  testsContainer: {
    paddingHorizontal: MODERN_SPACING.lg,
    gap: MODERN_SPACING.xs,
  },
  testCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.sm,
    ...MODERN_SHADOWS.xs,
  },
  testIconContainer: {
    width: 40,
    height: 40,
    borderRadius: MODERN_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: MODERN_SPACING.sm,
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    fontSize: MODERN_TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
  testFullName: {
    fontSize: 11,
    marginTop: 1,
    fontWeight: '400',
  },
  // Scholarships
  scholarshipsContainer: {
    paddingHorizontal: MODERN_SPACING.lg,
    gap: MODERN_SPACING.sm,
  },
  scholarshipCard: {
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
    ...MODERN_SHADOWS.sm,
  },
  scholarshipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scholarshipIconBg: {
    width: 40,
    height: 40,
    borderRadius: MODERN_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: MODERN_SPACING.sm,
  },
  scholarshipTitleContainer: {
    flex: 1,
    marginRight: MODERN_SPACING.sm,
  },
  scholarshipName: {
    fontSize: MODERN_TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
  scholarshipProvider: {
    fontSize: MODERN_TYPOGRAPHY.sizes.xs,
    fontWeight: '400',
    marginTop: 2,
  },
  coverageTag: {
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: 4,
    borderRadius: MODERN_RADIUS.sm,
  },
  coverageText: {
    fontSize: MODERN_TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
  },
  scholarshipDetails: {
    marginTop: MODERN_SPACING.sm,
    paddingTop: MODERN_SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  detailLabel: {
    fontSize: MODERN_TYPOGRAPHY.sizes.xs,
    fontWeight: '400',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: MODERN_TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
});

// ============================================================================
// REFINED HERO CARD STYLES - Professional UI/UX Design
// ============================================================================

const heroStyles = StyleSheet.create({
  heroWrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  heroCard: {
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  heroGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  heroContent: {
    padding: 24,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  heroBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  heroTitleSection: {
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  heroTitleAccent: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  heroDescription: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    marginBottom: 16,
  },
  heroActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroPrimaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 14,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: {width: 0, height: 6},
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  heroPrimaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  heroArrowWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSecondaryAction: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// ============================================================================
// REFINED JOURNEY CTA STYLES - Clean, Horizontal Layout
// ============================================================================

const journeyStyles = StyleSheet.create({
  ctaWrapper: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 24,
  },
  ctaCard: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: {width: 0, height: 8},
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  ctaDecoCircle: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  ctaLayout: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaIconSection: {
    marginRight: 16,
  },
  ctaIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaTextSection: {
    flex: 1,
  },
  ctaEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  ctaHeadline: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  ctaCaption: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
  },
  ctaArrowSection: {
    marginLeft: 12,
  },
  ctaArrowCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
});

export default PremiumHomeScreen;

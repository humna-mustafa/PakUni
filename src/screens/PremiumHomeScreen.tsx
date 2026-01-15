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
import {useAuth} from '../contexts/AuthContext';
import {UNIVERSITIES, SCHOLARSHIPS, ENTRY_TESTS_DATA, getUpcomingDeadlines} from '../data';
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
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 12,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Clean, refined styling
  const accentLight = isDark ? 'rgba(129, 140, 248, 0.12)' : 'rgba(79, 70, 229, 0.06)';
  const cardBg = isDark ? '#1F1F23' : '#FFFFFF';

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
        {/* Subtle background accent */}
        <View style={[heroStyles.heroAccentBg, {backgroundColor: accentLight}]} />

        {/* Main Content */}
        <View style={heroStyles.heroContent}>
          {/* Compact status row */}
          <View style={heroStyles.heroTopRow}>
            <View style={[heroStyles.heroBadge, {backgroundColor: accentLight}]}>
              <View style={[heroStyles.heroBadgeDot, {backgroundColor: colors.primary}]} />
              <Text style={[heroStyles.heroBadgeText, {color: colors.primary}]}>
                AI-Powered Matching
              </Text>
            </View>
          </View>

          {/* Title Section - Clean typography */}
          <View style={heroStyles.heroTitleSection}>
            <Text style={[heroStyles.heroTitle, {color: colors.textSecondary}]}>
              Find Your Ideal
            </Text>
            <Text style={[heroStyles.heroTitleAccent, {color: colors.text}]}>
              University Match
            </Text>
          </View>

          {/* Description - Concise */}
          <Text style={[heroStyles.heroDescription, {color: colors.textSecondary}]}>
            Explore 200+ Pakistani universities with personalized recommendations
          </Text>

          {/* Action Row - Clean buttons */}
          <View style={heroStyles.heroActionRow}>
            <TouchableOpacity
              style={[heroStyles.heroPrimaryAction, {backgroundColor: colors.primary}]}
              onPress={onExplorePress}
              activeOpacity={0.8}
            >
              <Text style={heroStyles.heroPrimaryText}>Browse Universities</Text>
              <Icon name="arrow-forward" family="Ionicons" size={16} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                heroStyles.heroSecondaryAction,
                {
                  backgroundColor: accentLight,
                }
              ]}
              onPress={onAIMatchPress}
              activeOpacity={0.7}
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
      toValue: 0.98,
      useNativeDriver: true,
      tension: 400,
      friction: 15,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 12,
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
          colors={isDark 
            ? [colors.primary, '#6366F1']
            : [colors.primary, '#6366F1']
          }
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0.5}}
          style={journeyStyles.ctaCard}
        >
          {/* Subtle decorative element */}
          <View style={journeyStyles.ctaDecoCircle} />

          {/* Content Layout */}
          <View style={journeyStyles.ctaLayout}>
            {/* Left: Icon */}
            <View style={journeyStyles.ctaIconSection}>
              <View style={journeyStyles.ctaIconCircle}>
                <Icon name="calculator" family="Ionicons" size={22} color="#FFFFFF" />
              </View>
            </View>

            {/* Center: Text */}
            <View style={journeyStyles.ctaTextSection}>
              <Text style={journeyStyles.ctaEyebrow}>Merit Calculator</Text>
              <Text style={journeyStyles.ctaHeadline}>Calculate Your Score</Text>
              <Text style={journeyStyles.ctaCaption}>
                Find matching universities
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
// DASHBOARD WIDGETS - Real Data with Animations
// ============================================================================

interface DashboardWidgetsProps {
  user: any;
  colors: any;
  isDark: boolean;
  onNavigate: (screen: string) => void;
}

const DashboardWidgets = memo<DashboardWidgetsProps>(({user, colors, isDark, onNavigate}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // Get real data
  const upcomingDeadlines = getUpcomingDeadlines(3);
  const favoriteCount = (user?.favoriteUniversities?.length || 0) + 
                        (user?.favoriteScholarships?.length || 0);
  
  // Calculate real profile completion
  const getProfileCompletion = () => {
    if (!user) return 0;
    let completed = 0;
    const fields = ['fullName', 'email', 'city', 'currentClass', 'board', 'targetField'];
    fields.forEach(field => { if (user[field]) completed++; });
    if (user.matricMarks) completed++;
    if (user.interests?.length > 0) completed++;
    return Math.round((completed / 8) * 100);
  };
  
  const profileCompletion = getProfileCompletion();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: profileCompletion,
        duration: 1200,
        delay: 500,
        useNativeDriver: false,
      }),
    ]).start();
  }, [profileCompletion]);

  const widgetBg = isDark ? '#1E293B' : '#FFFFFF';

  return (
    <Animated.View
      style={[
        widgetStyles.container,
        {
          opacity: fadeAnim,
          transform: [{translateY: slideAnim}],
        },
      ]}>
      {/* Profile Completion Widget */}
      <TouchableOpacity
        style={[widgetStyles.profileWidget, {backgroundColor: widgetBg}]}
        onPress={() => onNavigate('Profile')}
        activeOpacity={0.9}>
        <LinearGradient
          colors={isDark ? ['rgba(99, 102, 241, 0.15)', 'rgba(99, 102, 241, 0.05)'] : ['rgba(99, 102, 241, 0.1)', 'rgba(99, 102, 241, 0.02)']}
          style={StyleSheet.absoluteFillObject}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
        />
        <View style={widgetStyles.profileHeader}>
          <View style={[widgetStyles.profileIconBg, {backgroundColor: colors.primaryLight}]}>
            <Icon name="person" family="Ionicons" size={18} color={colors.primary} />
          </View>
          <View style={widgetStyles.profileInfo}>
            <Text style={[widgetStyles.profileTitle, {color: colors.text}]}>Profile</Text>
            <Text style={[widgetStyles.profileSubtitle, {color: colors.textSecondary}]}>
              {profileCompletion}% complete
            </Text>
          </View>
          <View style={[widgetStyles.profileBadge, {backgroundColor: profileCompletion >= 80 ? '#10B98120' : colors.warningLight}]}>
            <Text style={[widgetStyles.profileBadgeText, {color: profileCompletion >= 80 ? '#10B981' : colors.warning}]}>
              {profileCompletion >= 80 ? '✓' : '!'}
            </Text>
          </View>
        </View>
        <View style={[widgetStyles.progressBar, {backgroundColor: colors.border}]}>
          <Animated.View
            style={[
              widgetStyles.progressFill,
              {
                backgroundColor: profileCompletion >= 80 ? '#10B981' : colors.primary,
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </TouchableOpacity>

      {/* Stats Row */}
      <View style={widgetStyles.statsRow}>
        {/* Favorites Widget */}
        <TouchableOpacity
          style={[widgetStyles.statWidget, {backgroundColor: widgetBg}]}
          onPress={() => onNavigate('Favorites')}
          activeOpacity={0.9}>
          <LinearGradient
            colors={['rgba(239, 68, 68, 0.1)', 'transparent']}
            style={widgetStyles.statGradient}>
            <Icon name="heart" family="Ionicons" size={20} color="#EF4444" />
            <Text style={[widgetStyles.statValue, {color: colors.text}]}>{favoriteCount}</Text>
            <Text style={[widgetStyles.statLabel, {color: colors.textSecondary}]}>Saved</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Universities Widget */}
        <TouchableOpacity
          style={[widgetStyles.statWidget, {backgroundColor: widgetBg}]}
          onPress={() => onNavigate('Universities')}
          activeOpacity={0.9}>
          <LinearGradient
            colors={['rgba(59, 130, 246, 0.1)', 'transparent']}
            style={widgetStyles.statGradient}>
            <Icon name="school" family="Ionicons" size={20} color="#3B82F6" />
            <Text style={[widgetStyles.statValue, {color: colors.text}]}>{UNIVERSITIES.length}+</Text>
            <Text style={[widgetStyles.statLabel, {color: colors.textSecondary}]}>Unis</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Deadlines Widget */}
        <TouchableOpacity
          style={[widgetStyles.statWidget, {backgroundColor: widgetBg}]}
          onPress={() => onNavigate('Deadlines')}
          activeOpacity={0.9}>
          <LinearGradient
            colors={['rgba(245, 158, 11, 0.1)', 'transparent']}
            style={widgetStyles.statGradient}>
            <Icon name="calendar" family="Ionicons" size={20} color="#F59E0B" />
            <Text style={[widgetStyles.statValue, {color: colors.text}]}>{upcomingDeadlines.length}</Text>
            <Text style={[widgetStyles.statLabel, {color: colors.textSecondary}]}>Soon</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Achievements Widget */}
        <TouchableOpacity
          style={[widgetStyles.statWidget, {backgroundColor: widgetBg}]}
          onPress={() => onNavigate('Achievements')}
          activeOpacity={0.9}>
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.1)', 'transparent']}
            style={widgetStyles.statGradient}>
            <Icon name="trophy" family="Ionicons" size={20} color="#8B5CF6" />
            <Text style={[widgetStyles.statValue, {color: colors.text}]}>🏆</Text>
            <Text style={[widgetStyles.statLabel, {color: colors.textSecondary}]}>Track</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Upcoming Deadlines Preview */}
      {upcomingDeadlines.length > 0 && (
        <TouchableOpacity
          style={[widgetStyles.deadlineWidget, {backgroundColor: widgetBg}]}
          onPress={() => onNavigate('Deadlines')}
          activeOpacity={0.9}>
          <View style={widgetStyles.deadlineHeader}>
            <View style={[widgetStyles.deadlineIconBg, {backgroundColor: '#F59E0B20'}]}>
              <Icon name="time" family="Ionicons" size={16} color="#F59E0B" />
            </View>
            <Text style={[widgetStyles.deadlineTitle, {color: colors.text}]}>Upcoming Deadlines</Text>
            <Icon name="chevron-forward" family="Ionicons" size={16} color={colors.textSecondary} />
          </View>
          <View style={widgetStyles.deadlineList}>
            {upcomingDeadlines.slice(0, 2).map((deadline, index) => (
              <View key={deadline.id} style={[widgetStyles.deadlineItem, index > 0 && {marginTop: 8}]}>
                <View style={[widgetStyles.deadlineDot, {backgroundColor: deadline.status === 'closing-soon' ? '#EF4444' : '#10B981'}]} />
                <View style={widgetStyles.deadlineInfo}>
                  <Text style={[widgetStyles.deadlineName, {color: colors.text}]} numberOfLines={1}>
                    {deadline.universityShortName} - {deadline.title.slice(0, 25)}...
                  </Text>
                  <Text style={[widgetStyles.deadlineDate, {color: colors.textSecondary}]}>
                    {new Date(deadline.applicationDeadline).toLocaleDateString('en-PK', {month: 'short', day: 'numeric'})}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
});

const widgetStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  profileWidget: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    overflow: 'hidden',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileIconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 10,
  },
  profileTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  profileSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  profileBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  statWidget: {
    flex: 1,
    minWidth: (SCREEN_WIDTH - 40 - 24) / 4,
    maxWidth: (SCREEN_WIDTH - 40 - 24) / 2,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  statGradient: {
    padding: 10,
    alignItems: 'center',
    minHeight: 72,
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  deadlineWidget: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  deadlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  deadlineIconBg: {
    width: 26,
    height: 26,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deadlineTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
  deadlineList: {},
  deadlineItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deadlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  deadlineInfo: {
    flex: 1,
    marginLeft: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deadlineName: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  deadlineDate: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 8,
  },
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
  const {user} = useAuth();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [searchQuery, setSearchQuery] = useState('');

  const topUniversities = UNIVERSITIES
    .filter(u => u.ranking_national)
    .sort((a, b) => (a.ranking_national || 999) - (b.ranking_national || 999))
    .slice(0, 6);

  const featuredScholarships = SCHOLARSHIPS.filter(
    (s: {type: string}) => s.type === 'government',
  ).slice(0, 3);

  // Clean, simple quick actions with improved UX labels
  const quickActions = [
    {id: '1', iconName: 'school', title: 'Universities', screen: 'Universities'},
    {id: '2', iconName: 'calculator', title: 'Calculate Merit', screen: 'Calculator'},
    {id: '3', iconName: 'ribbon', title: 'Scholarships', screen: 'Scholarships'},
    {id: '4', iconName: 'clipboard', title: 'Entry Tests', screen: 'EntryTests'},
    {id: '5', iconName: 'sparkles', title: 'AI Match', screen: 'Recommendations'},
    {id: '6', iconName: 'compass', title: 'Career Guide', screen: 'CareerGuidance'},
    {id: '7', iconName: 'library', title: 'Study Guides', screen: 'Guides'},
    {id: '8', iconName: 'apps', title: 'Useful Tools', screen: 'Tools'},
    {id: '9', iconName: 'game-controller', title: 'Score Game', screen: 'ResultGame'},
    {id: '10', iconName: 'stats-chart', title: 'Live Polls', screen: 'Polls'},
    {id: '11', iconName: 'calendar', title: 'Deadlines', screen: 'Deadlines'},
    {id: '12', iconName: 'documents', title: 'Merit Lists', screen: 'MeritArchive'},
    {id: '13', iconName: 'trophy', title: 'Achievements', screen: 'Achievements'},
    {id: '14', iconName: 'happy', title: 'Kids Zone', screen: 'KidsHub'},
    {id: '15', iconName: 'chatbubbles', title: 'Help & Support', screen: 'ContactSupport'},
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
      case 'ContactSupport':
        navigation.navigate('ContactSupport');
        break;
      case 'Profile':
        navigation.navigate('MainTabs', {screen: 'Profile'});
        break;
      case 'Favorites':
        navigation.navigate('MainTabs', {screen: 'Profile'});
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

          {/* Dashboard Widgets with Real Data */}
          <DashboardWidgets
            user={user}
            colors={colors}
            isDark={isDark}
            onNavigate={handleNavigate}
          />

          {/* Quick Actions */}
          <View style={styles.section}>
            <ModernSectionHeader title="What would you like to do?" subtitle="Your tools & resources" />
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTextContainer: {
    marginLeft: 2,
  },
  greeting: {
    fontSize: 12,
    fontWeight: '400',
  },
  appName: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 1,
    letterSpacing: -0.3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
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
  // Quick Actions Grid - Cleaner sizing
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: MODERN_SPACING.lg,
    gap: 8,
    justifyContent: 'flex-start',
  },
  actionCardWrapper: {
    width: Math.max((SCREEN_WIDTH - MODERN_SPACING.lg * 2 - 24) / 4, 72),
    minWidth: 72,
  },
  actionCard: {
    borderRadius: 12,
    padding: MODERN_SPACING.sm,
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 84,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  actionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionTitle: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  // University Carousel - Refined cards
  uniCarousel: {
    paddingHorizontal: MODERN_SPACING.lg,
    gap: 10,
  },
  uniCard: {
    width: Math.max(SCREEN_WIDTH * 0.36, 136),
    minWidth: 136,
    maxWidth: 170,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  uniRankBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  uniRankText: {
    fontSize: 10,
    fontWeight: '600',
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
    marginBottom: 16,
  },
  heroCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  heroGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  heroIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  heroArrowWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroAccentBg: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 200,
    height: 200,
    borderBottomLeftRadius: 200,
  },
  heroContent: {
    padding: 20,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  heroBadgeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  heroTitleSection: {
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 20,
  },
  heroTitleAccent: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  heroDescription: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    marginBottom: 16,
  },
  heroActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroPrimaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    gap: 8,
  },
  heroPrimaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  heroSecondaryAction: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// ============================================================================
// REFINED JOURNEY CTA STYLES - Professional, Minimal Design
// ============================================================================

const journeyStyles = StyleSheet.create({
  ctaWrapper: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 24,
  },
  ctaCard: {
    borderRadius: 14,
    padding: 18,
    overflow: 'hidden',
  },
  ctaDecoCircle: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  ctaLayout: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaIconSection: {
    marginRight: 14,
  },
  ctaIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaTextSection: {
    flex: 1,
  },
  ctaEyebrow: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 0.8,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  ctaHeadline: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  ctaCaption: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 16,
  },
  ctaArrowSection: {
    marginLeft: 10,
  },
  ctaArrowCircle: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PremiumHomeScreen;

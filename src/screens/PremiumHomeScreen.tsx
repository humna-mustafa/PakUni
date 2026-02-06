import React, {useRef, useEffect, useState, useCallback, memo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  Platform,
  Easing,
  Image,
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
  PP_MOTION,
  roundToPixel,
} from '../constants/pixel-perfect';
import {ANIMATION_SCALES, SPRING_CONFIGS} from '../constants/ui';
import {useTheme} from '../contexts/ThemeContext';
import {useAuth} from '../contexts/AuthContext';
import {getUpcomingDeadlines} from '../data';
import {Icon} from '../components/icons';
import {
  PremiumSearchBar,
  LogoBadge,
} from '../components';
import NotificationBell, {Notification} from '../components/NotificationBell';
import {useNotifications, LocalNotification} from '../services/notifications';
import {findUniversitiesByAlias} from '../utils/universityAliases';
import {UNIVERSITIES} from '../data/universities';
import {SCHOLARSHIPS} from '../data/scholarships';
import type {RootStackParamList, TabParamList} from '../navigation/AppNavigator';

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList>,
  BottomTabNavigationProp<TabParamList>
>;

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// ============================================================================
// PREMIUM HERO CARD - Clean, Modern Design (2025)
// Minimalist approach with clear visual hierarchy
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
  const cardBg = isDark ? '#1E2228' : '#FFFFFF';
  const subtleBg = isDark ? 'rgba(69, 115, 223, 0.08)' : 'rgba(69, 115, 223, 0.04)';

  return (
    <View style={heroStyles.heroWrapper}>
      <View style={[heroStyles.heroCard, {backgroundColor: cardBg}]}>
        {/* Subtle gradient accent */}
        <LinearGradient
          colors={[subtleBg, 'transparent']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={heroStyles.heroGradient}
        />

        {/* Content */}
        <View style={heroStyles.heroContent}>
          <Text style={[heroStyles.heroLabel, {color: colors.textTertiary}]}>
            200+ Universities
          </Text>
          
          <View style={heroStyles.heroTitleGroup}>
            <Text style={[heroStyles.heroTitle, {color: colors.text}]}>
              Find Your Perfect
            </Text>
            <Text style={[heroStyles.heroTitleAccent, {color: colors.primary}]}>
              University
            </Text>
          </View>

          <Text style={[heroStyles.heroDesc, {color: colors.textSecondary}]}>
            Personalized recommendations based on your marks and interests
          </Text>

          {/* Actions */}
          <View style={heroStyles.heroActions}>
            <TouchableOpacity
              style={[heroStyles.heroPrimary, {backgroundColor: colors.primary}]}
              onPress={onExplorePress}
              activeOpacity={0.85}
            >
              <Text style={heroStyles.heroPrimaryText}>Explore All</Text>
              <Icon name="arrow-forward" family="Ionicons" size={16} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[heroStyles.heroSecondary, {borderColor: colors.border}]}
              onPress={onAIMatchPress}
              activeOpacity={0.7}
            >
              <Icon name="sparkles" family="Ionicons" size={18} color={colors.primary} />
              <Text style={[heroStyles.heroSecondaryText, {color: colors.primary}]}>AI Match</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
});

// ============================================================================
// JOURNEY CTA CARD - Clean, Focused Design
// ============================================================================

interface JourneyCTACardProps {
  onPress: () => void;
  colors: any;
  isDark: boolean;
}

const JourneyCTACard = memo<JourneyCTACardProps>(({
  onPress,
  colors,
}) => {
  return (
    <View style={journeyStyles.ctaWrapper}>
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark || '#3660C9']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={journeyStyles.ctaCard}
        >
          <View style={journeyStyles.ctaLayout}>
            <View style={journeyStyles.ctaIcon}>
              <Icon name="calculator" family="Ionicons" size={22} color="#FFFFFF" />
            </View>
            <View style={journeyStyles.ctaText}>
              <Text style={journeyStyles.ctaTitle}>Calculate Your Merit</Text>
              <Text style={journeyStyles.ctaSubtitle}>Find matching universities</Text>
            </View>
            <Icon name="chevron-forward" family="Ionicons" size={20} color="rgba(255,255,255,0.8)" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
});

// ============================================================================
// DEADLINE WIDGET - Clean, Professional Design
// ============================================================================

interface DeadlineWidgetProps {
  colors: any;
  isDark: boolean;
  onNavigate: (screen: string) => void;
}

const DeadlineWidget = memo<DeadlineWidgetProps>(({colors, isDark, onNavigate}) => {
  const upcomingDeadlines = getUpcomingDeadlines(3);
  
  if (upcomingDeadlines.length === 0) return null;

  const cardBg = isDark ? '#1E2228' : '#FFFFFF';
  const borderStyle = isDark ? {borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.18)'} : {};

  return (
    <View style={deadlineWidgetStyles.container}>
      <TouchableOpacity
        style={[deadlineWidgetStyles.widget, {backgroundColor: cardBg}, borderStyle]}
        onPress={() => onNavigate('Deadlines')}
        activeOpacity={0.7}>
        
        {/* Header */}
        <View style={deadlineWidgetStyles.header}>
          <Icon name="calendar-outline" family="Ionicons" size={18} color="#F59E0B" />
          <Text style={[deadlineWidgetStyles.title, {color: colors.text}]}>
            Upcoming Deadlines
          </Text>
          <Text style={[deadlineWidgetStyles.count, {color: colors.textTertiary}]}>
            {upcomingDeadlines.length}
          </Text>
        </View>
        
        {/* List */}
        <View style={deadlineWidgetStyles.list}>
          {upcomingDeadlines.slice(0, 2).map((deadline: any, index: number) => (
            <View 
              key={deadline.id} 
              style={[
                deadlineWidgetStyles.item,
                index > 0 && {borderTopWidth: 1, borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}
              ]}>
              <View style={deadlineWidgetStyles.itemLeft}>
                <Text style={[deadlineWidgetStyles.itemTitle, {color: colors.text}]} numberOfLines={1}>
                  {deadline.universityShortName}
                </Text>
                <Text style={[deadlineWidgetStyles.itemSub, {color: colors.textSecondary}]} numberOfLines={1}>
                  {deadline.title}
                </Text>
              </View>
              <Text style={[
                deadlineWidgetStyles.itemDate,
                {color: deadline.status === 'closing-soon' ? '#DC2626' : colors.textSecondary}
              ]}>
                {new Date(deadline.applicationDeadline).toLocaleDateString('en-PK', {month: 'short', day: 'numeric'})}
              </Text>
            </View>
          ))}
        </View>
        
        {/* Footer */}
        <View style={[deadlineWidgetStyles.footer, {borderTopColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)'}]}>
          <Text style={[deadlineWidgetStyles.footerText, {color: colors.primary}]}>View all</Text>
          <Icon name="chevron-forward" family="Ionicons" size={14} color={colors.primary} />
        </View>
      </TouchableOpacity>
    </View>
  );
});

const deadlineWidgetStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  widget: {
    borderRadius: 14,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: MODERN_TYPOGRAPHY.weight.semibold,
    letterSpacing: -0.2,
  },
  count: {
    fontSize: 13,
    fontWeight: MODERN_TYPOGRAPHY.weight.medium,
  },
  list: {},
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  itemLeft: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: MODERN_TYPOGRAPHY.weight.medium,
  },
  itemSub: {
    fontSize: 12,
    marginTop: 2,
  },
  itemDate: {
    fontSize: 13,
    fontWeight: MODERN_TYPOGRAPHY.weight.semibold,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.04)',
    gap: 4,
  },
  footerText: {
    fontSize: 13,
    fontWeight: MODERN_TYPOGRAPHY.weight.medium,
  },
});

// ============================================================================
// STATS WIDGET - Clean, Modern Design
// ============================================================================

interface StudyProgressWidgetProps {
  colors: any;
  isDark: boolean;
  onNavigate: (screen: string) => void;
  universitiesCount: number;
  scholarshipsCount: number;
}

const StudyProgressWidget = memo<StudyProgressWidgetProps>(({colors, isDark, onNavigate, universitiesCount, scholarshipsCount}) => {
  const cardBg = isDark ? '#1E2228' : '#FFFFFF';
  const borderStyle = isDark ? {borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.18)'} : {};
  const total = universitiesCount + scholarshipsCount;

  const stats = [
    {label: 'Universities', value: universitiesCount, color: colors.primary, screen: 'Universities'},
    {label: 'Scholarships', value: scholarshipsCount, color: '#10B981', screen: 'Scholarships'},
    {label: 'Total Saved', value: total, color: '#F59E0B', screen: 'Favorites'},
  ];

  return (
    <View style={statsWidgetStyles.container}>
      <View style={[statsWidgetStyles.widget, {backgroundColor: cardBg}, borderStyle]}>
        <View style={statsWidgetStyles.header}>
          <Icon name="heart-outline" family="Ionicons" size={18} color={colors.primary} />
          <Text style={[statsWidgetStyles.title, {color: colors.text}]}>Your Saved Items</Text>
        </View>
        
        <View style={statsWidgetStyles.statsRow}>
          {stats.map((stat, index) => (
            <TouchableOpacity
              key={stat.label}
              style={[
                statsWidgetStyles.statItem,
                index < stats.length - 1 && {
                  borderRightWidth: 1,
                  borderRightColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)'
                }
              ]}
              onPress={() => onNavigate(stat.screen)}
              activeOpacity={0.6}
            >
              <Text style={[statsWidgetStyles.statValue, {color: stat.color}]}>{stat.value}</Text>
              <Text style={[statsWidgetStyles.statLabel, {color: colors.textSecondary}]}>{stat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
});

const statsWidgetStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  widget: {
    borderRadius: 14,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: MODERN_TYPOGRAPHY.weight.semibold,
    letterSpacing: -0.2,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: MODERN_TYPOGRAPHY.weight.bold,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: MODERN_TYPOGRAPHY.weight.medium,
    marginTop: 2,
  },
});

// ============================================================================
// ANIMATED QUICK ACTION CARD - Staggered Animation
// ============================================================================

interface QuickActionCardProps {
  action: {id: string; iconName: string; title: string; color: string; screen: string};
  index: number;
  colors: any;
  isDark: boolean;
  onPress: () => void;
}

const QuickActionCard = memo<QuickActionCardProps>(({
  action,
  index,
  colors,
  isDark,
  onPress,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Simple fade-in, no stagger - feels more intentional
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 300,
      delay: 100,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    // Subtle, professional press feedback
    Animated.timing(scaleAnim, {
      toValue: 0.97,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 20,
      useNativeDriver: true,
    }).start();
  };

  const cardBg = isDark ? 'rgba(39, 44, 52, 0.98)' : '#FFFFFF';
  const iconBg = isDark ? `${action.color}22` : `${action.color}10`;

  return (
    <Animated.View
      style={[
        quickActionStyles.wrapper,
        {
          opacity: opacityAnim,
          transform: [{scale: scaleAnim}],
        },
      ]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={action.title}
        style={[quickActionStyles.card, {backgroundColor: cardBg}]}>
        <View style={[quickActionStyles.iconContainer, {backgroundColor: iconBg}]}>
          <Icon name={action.iconName} family="Ionicons" size={24} color={action.color} />
        </View>
        <Text style={[quickActionStyles.title, {color: colors.text}]} numberOfLines={1}>
          {action.title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

const quickActionStyles = StyleSheet.create({
  wrapper: {
    width: (SCREEN_WIDTH - 40 - 24) / 3,
    marginBottom: 12,
  },
  card: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.06)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 11,
    fontWeight: MODERN_TYPOGRAPHY.weight.medium,
    textAlign: 'center',
    letterSpacing: -0.1,
  },
});

// ============================================================================
// SECTION HEADER - Animated with Clean Typography
// ============================================================================

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  delay?: number;
}

const AnimatedSectionHeader = memo<SectionHeaderProps>(({title, subtitle, delay = 0}) => {
  const {colors} = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 400,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay]);

  return (
    <Animated.View
      style={[
        sectionHeaderStyles.container,
        {
          opacity: fadeAnim,
          transform: [{translateX}],
        },
      ]}>
      <Text style={[sectionHeaderStyles.title, {color: colors.text}]}>{title}</Text>
      {subtitle && (
        <Text style={[sectionHeaderStyles.subtitle, {color: colors.textSecondary}]}>{subtitle}</Text>
      )}
    </Animated.View>
  );
});

const sectionHeaderStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 14,
    marginTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: MODERN_TYPOGRAPHY.weight.bold,
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: MODERN_TYPOGRAPHY.weight.regular,
    marginTop: 2,
    letterSpacing: 0,
  },
});

// Helper to convert local notifications to NotificationBell format
const convertToNotification = (local: LocalNotification): Notification => {
  const typeMap: Record<string, Notification['type']> = {
    'scholarship': 'scholarship',
    'admission': 'deadline',
    'test': 'alert',
    'tip': 'news',
    'update': 'update',
    'general': 'news',
  };
  return {
    id: local.id,
    type: typeMap[local.type] || 'news',
    title: local.title,
    message: local.body,
    timestamp: new Date(local.createdAt),
    read: local.read,
  };
};

const PremiumHomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const {colors, isDark} = useTheme();
  const {user} = useAuth();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real notifications from notification service
  const {notifications: localNotifications, markAsRead, clearAll} = useNotifications();

  // Scholarship-related keywords for intelligent search routing
  const SCHOLARSHIP_KEYWORDS = [
    'scholarship', 'scholarships', 'hec', 'ehsaas', 'peef', 'need-based', 'need based',
    'merit-based', 'merit based', 'stipend', 'financial aid', 'funding', 'grant',
    'fulbright', 'chevening', 'usaid', 'daad', 'commonwealth'
  ];

  // Handle search submission - intelligently routes to Universities or Scholarships
  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      
      // Check if search matches a university by abbreviation/alias
      const aliasMatches = findUniversitiesByAlias(query);
      const universityMatch = UNIVERSITIES.some(u => 
        u.short_name.toLowerCase().includes(query) ||
        u.name.toLowerCase().includes(query) ||
        u.name.toLowerCase().split(/[\s,\-()]+/).some(w => w.startsWith(query))
      ) || aliasMatches.length > 0;
      
      // Check if search is scholarship-related
      const isScholarshipSearch = SCHOLARSHIP_KEYWORDS.some(keyword => 
        query.includes(keyword)
      );
      
      // Check if it matches a scholarship name
      const scholarshipMatch = typeof SCHOLARSHIPS !== 'undefined' && Array.isArray(SCHOLARSHIPS) && SCHOLARSHIPS.some((s: any) =>
        s.name?.toLowerCase().includes(query) ||
        s.short_name?.toLowerCase().includes(query)
      );
      
      if (isScholarshipSearch || (scholarshipMatch && !universityMatch)) {
        // Navigate to Scholarships tab with search query
        navigation.navigate('MainTabs', {
          screen: 'Scholarships',
          params: {searchQuery: searchQuery.trim()},
        });
      } else {
        // Navigate to Universities tab with search query
        navigation.navigate('MainTabs', {
          screen: 'Universities',
          params: {searchQuery: searchQuery.trim()},
        });
      }
    }
  }, [searchQuery, navigation]);
  
  // Convert to NotificationBell format
  const bellNotifications: Notification[] = localNotifications.map(convertToNotification);

  // STREAMLINED Quick Actions - Only essential tools not in main nav bar
  // Universities, Scholarships, Profile are in bottom tabs - REMOVED
  // Using outline icons for consistency with navbar and profile page
  const quickActions = [
    {id: '1', iconName: 'calculator-outline', title: 'Calculate Merit', color: colors.primary, screen: 'Calculator'},
    {id: '2', iconName: 'clipboard-outline', title: 'Entry Tests', color: '#DC2626', screen: 'EntryTests'},
    {id: '3', iconName: 'sparkles-outline', title: 'AI Match', color: colors.primary, screen: 'Recommendations'},
    {id: '4', iconName: 'compass-outline', title: 'Career Guide', color: '#059669', screen: 'CareerGuidance'},
    {id: '5', iconName: 'library-outline', title: 'Study Guides', color: colors.primary, screen: 'Guides'},
    {id: '6', iconName: 'game-controller-outline', title: 'Score Game', color: '#F59E0B', screen: 'ResultGame'},
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
        navigation.navigate('Profile');
        break;
      case 'Favorites':
        navigation.navigate('Favorites');
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
                {user ? 'Welcome back,' : 'Welcome to PakUni,'}
              </Text>
              <Text style={[styles.appName, {color: colors.text}]}>
                {user?.fullName?.split(' ')[0] || 'Explorer'}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            {/* Notification Bell with Dropdown - Real notifications from service */}
            <NotificationBell
              notifications={bellNotifications}
              size={40}
              onNotificationPress={(notification) => {
                // Mark as read
                markAsRead(notification.id);
                // Handle notification navigation
                if (notification.actionRoute) {
                  navigation.navigate(notification.actionRoute as any);
                }
              }}
              onSeeAllPress={() => navigation.navigate('Notifications')}
              onClearAll={clearAll}
            />
            {/* Profile Button */}
            <TouchableOpacity
              style={[
                styles.profileBtn,
                !user?.avatarUrl && {backgroundColor: colors.primary}
              ]}
              onPress={() => navigation.navigate('Profile')}
              accessibilityRole="button"
              accessibilityLabel="View your profile">
              {user?.avatarUrl ? (
                <Image
                  source={{uri: user.avatarUrl}}
                  style={styles.profileImage}
                  accessibilityIgnoresInvertColors
                />
              ) : (
                <Text style={styles.profileInitials}>
                  {user?.fullName ? user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                </Text>
              )}
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
          contentContainerStyle={{paddingBottom: 100}}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag">
          
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <PremiumSearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search universities, scholarships..."
              variant="filled"
              onSubmit={handleSearch}
            />
          </View>

          {/* Pixel Perfect Hero Card - "Discover Your University" */}
          <HeroCard
            onExplorePress={() => navigation.navigate('MainTabs', {screen: 'Universities'})}
            onAIMatchPress={() => navigation.navigate('Recommendations')}
            colors={colors}
            isDark={isDark}
          />

          {/* Upcoming Deadlines Widget */}
          <DeadlineWidget
            colors={colors}
            isDark={isDark}
            onNavigate={handleNavigate}
          />

          {/* Study Progress Widget */}
          <StudyProgressWidget
            colors={colors}
            isDark={isDark}
            onNavigate={handleNavigate}
            universitiesCount={user?.favoriteUniversities?.length || 0}
            scholarshipsCount={user?.favoriteScholarships?.length || 0}
          />

          {/* Quick Actions - Streamlined Grid */}
          <AnimatedSectionHeader
            title="Quick Actions"
            subtitle="Your essential tools"
            delay={200}
          />
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <QuickActionCard
                key={action.id}
                action={action}
                index={index}
                colors={colors}
                isDark={isDark}
                onPress={() => handleNavigate(action.screen)}
              />
            ))}
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
    fontWeight: MODERN_TYPOGRAPHY.weight.regular,
  },
  appName: {
    fontSize: 18,
    fontWeight: MODERN_TYPOGRAPHY.weight.semibold,
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
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  profileInitials: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: MODERN_TYPOGRAPHY.weight.bold,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  // Quick Actions Grid - 3 column layout
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
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
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroContent: {
    padding: 20,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: MODERN_TYPOGRAPHY.weight.semibold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heroTitleGroup: {
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: MODERN_TYPOGRAPHY.weight.medium,
    letterSpacing: 0,
    lineHeight: 20,
  },
  heroTitleAccent: {
    fontSize: 24,
    fontWeight: MODERN_TYPOGRAPHY.weight.bold,
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  heroDesc: {
    fontSize: 14,
    fontWeight: MODERN_TYPOGRAPHY.weight.regular,
    lineHeight: 20,
    marginBottom: 16,
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroPrimary: {
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
    fontWeight: MODERN_TYPOGRAPHY.weight.semibold,
    letterSpacing: 0.1,
  },
  heroSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  heroSecondaryText: {
    fontSize: 14,
    fontWeight: MODERN_TYPOGRAPHY.weight.semibold,
  },
});

// ============================================================================
// REFINED JOURNEY CTA STYLES - Clean, Professional Design
// ============================================================================

const journeyStyles = StyleSheet.create({
  ctaWrapper: {
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 24,
  },
  ctaCard: {
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  ctaLayout: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ctaText: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 15,
    fontWeight: MODERN_TYPOGRAPHY.weight.semibold,
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  ctaSubtitle: {
    fontSize: 12,
    fontWeight: MODERN_TYPOGRAPHY.weight.regular,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
});

export default PremiumHomeScreen;

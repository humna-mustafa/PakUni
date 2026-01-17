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
      toValue: ANIMATION_SCALES.PRESS,
      useNativeDriver: true,
      ...SPRING_CONFIGS.snappy,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...SPRING_CONFIGS.responsive,
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
            ? [colors.primary, colors.primaryDark || '#0284C7']
            : [colors.primary, colors.primaryDark || '#0284C7']
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
// ANIMATED DEADLINE WIDGET - Compact & Informative
// ============================================================================

interface DeadlineWidgetProps {
  colors: any;
  isDark: boolean;
  onNavigate: (screen: string) => void;
}

const DeadlineWidget = memo<DeadlineWidgetProps>(({colors, isDark, onNavigate}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  
  const upcomingDeadlines = getUpcomingDeadlines(3);
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (upcomingDeadlines.length === 0) return null;

  const widgetBg = isDark ? 'rgba(30, 41, 59, 0.9)' : '#FFFFFF';

  return (
    <Animated.View
      style={[
        deadlineWidgetStyles.container,
        {
          opacity: fadeAnim,
          transform: [{translateY: slideAnim}],
        },
      ]}>
      <TouchableOpacity
        style={[deadlineWidgetStyles.widget, {backgroundColor: widgetBg}]}
        onPress={() => onNavigate('Deadlines')}
        activeOpacity={0.8}>
        <View style={deadlineWidgetStyles.header}>
          <View style={[deadlineWidgetStyles.iconBg, {backgroundColor: '#F59E0B15'}]}>
            <Icon name="time" family="Ionicons" size={18} color="#F59E0B" />
          </View>
          <View style={deadlineWidgetStyles.headerText}>
            <Text style={[deadlineWidgetStyles.title, {color: colors.text}]}>
              Upcoming Deadlines
            </Text>
            <Text style={[deadlineWidgetStyles.subtitle, {color: colors.textSecondary}]}>
              {upcomingDeadlines.length} applications closing soon
            </Text>
          </View>
          <View style={[deadlineWidgetStyles.arrow, {backgroundColor: colors.primaryLight}]}>
            <Icon name="chevron-forward" family="Ionicons" size={16} color={colors.primary} />
          </View>
        </View>
        
        <View style={deadlineWidgetStyles.list}>
          {upcomingDeadlines.slice(0, 2).map((deadline, index) => (
            <View 
              key={deadline.id} 
              style={[
                deadlineWidgetStyles.item, 
                index > 0 && deadlineWidgetStyles.itemBorder,
                {borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}
              ]}>
              <View style={[
                deadlineWidgetStyles.dot, 
                {backgroundColor: deadline.status === 'closing-soon' ? '#EF4444' : '#10B981'}
              ]} />
              <View style={deadlineWidgetStyles.itemContent}>
                <Text style={[deadlineWidgetStyles.itemName, {color: colors.text}]} numberOfLines={1}>
                  {deadline.universityShortName}
                </Text>
                <Text style={[deadlineWidgetStyles.itemDesc, {color: colors.textSecondary}]} numberOfLines={1}>
                  {deadline.title}
                </Text>
              </View>
              <View style={[
                deadlineWidgetStyles.dateBadge,
                {backgroundColor: deadline.status === 'closing-soon' ? '#FEF2F2' : '#ECFDF5'}
              ]}>
                <Text style={[
                  deadlineWidgetStyles.dateText,
                  {color: deadline.status === 'closing-soon' ? '#DC2626' : '#059669'}
                ]}>
                  {new Date(deadline.applicationDeadline).toLocaleDateString('en-PK', {month: 'short', day: 'numeric'})}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const deadlineWidgetStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  widget: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
  },
  arrow: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {},
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  itemBorder: {
    borderTopWidth: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  itemContent: {
    flex: 1,
    marginLeft: 10,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  itemDesc: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 1,
  },
  dateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '600',
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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const delay = 100 + index * 60; // Staggered entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: ANIMATION_SCALES.ICON_PRESS,
      useNativeDriver: true,
      ...SPRING_CONFIGS.snappy,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...SPRING_CONFIGS.responsive,
    }).start();
  };

  const cardBg = isDark ? 'rgba(30, 41, 59, 0.9)' : '#FFFFFF';
  const iconBg = isDark ? `${action.color}25` : `${action.color}12`;

  return (
    <Animated.View
      style={[
        quickActionStyles.wrapper,
        {
          opacity: fadeAnim,
          transform: [{scale: scaleAnim}, {translateY}],
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
        <Text style={[quickActionStyles.title, {color: colors.text}]} numberOfLines={2}>
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
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    height: 100,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.03,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
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
    fontWeight: '700',
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
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
  
  // Convert to NotificationBell format
  const bellNotifications: Notification[] = localNotifications.map(convertToNotification);

  // STREAMLINED Quick Actions - Only essential tools not in main nav bar
  // Universities, Scholarships, Profile are in bottom tabs - REMOVED
  // Using outline icons for consistency with navbar and profile page
  const quickActions = [
    {id: '1', iconName: 'calculator-outline', title: 'Calculate Merit', color: colors.primary, screen: 'Calculator'},
    {id: '2', iconName: 'clipboard-outline', title: 'Entry Tests', color: '#10B981', screen: 'EntryTests'},
    {id: '3', iconName: 'sparkles-outline', title: 'AI Match', color: '#0EA5E9', screen: 'Recommendations'},
    {id: '4', iconName: 'compass-outline', title: 'Career Guide', color: '#0284C7', screen: 'CareerGuidance'},
    {id: '5', iconName: 'library-outline', title: 'Study Guides', color: '#0EA5E9', screen: 'Guides'},
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
    fontWeight: '700',
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

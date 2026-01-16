/**
 * MoreScreen - Central hub for all tools, resources, and features
 * Replaces Profile in bottom navigation for better discoverability
 */

import React, {useRef, useCallback, memo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../contexts/ThemeContext';
import {useAuth} from '../contexts/AuthContext';
import {Icon} from '../components/icons';
import {TYPOGRAPHY, SPACING, RADIUS} from '../constants/design';
import type {RootStackParamList} from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// ============================================================================
// MENU ITEM DATA
// ============================================================================

interface MenuItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  color: string;
  screen: keyof RootStackParamList | 'Universities' | 'Scholarships';
  badge?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const MENU_SECTIONS: MenuSection[] = [
  {
    title: '🧮 Tools & Calculators',
    items: [
      {
        id: 'tools',
        title: 'All Tools',
        subtitle: 'Merit calculator, grade converter & more',
        icon: 'calculator',
        color: '#6366F1',
        screen: 'Tools',
      },
      {
        id: 'calculator',
        title: 'Merit Calculator',
        subtitle: 'Calculate your admission score',
        icon: 'calculator-outline',
        color: '#8B5CF6',
        screen: 'Calculator',
      },
      {
        id: 'compare',
        title: 'Compare Universities',
        subtitle: 'Side-by-side comparison',
        icon: 'git-compare-outline',
        color: '#0891B2',
        screen: 'Compare',
      },
    ],
  },
  {
    title: '🎯 Career & Guidance',
    items: [
      {
        id: 'career',
        title: 'Career Guidance',
        subtitle: 'Find your ideal career path',
        icon: 'compass-outline',
        color: '#059669',
        screen: 'CareerGuidance',
      },
      {
        id: 'recommendations',
        title: 'AI Recommendations',
        subtitle: 'Personalized university matches',
        icon: 'sparkles-outline',
        color: '#EC4899',
        screen: 'Recommendations',
      },
      {
        id: 'roadmaps',
        title: 'Career Roadmaps',
        subtitle: 'Step-by-step career paths',
        icon: 'map-outline',
        color: '#F59E0B',
        screen: 'CareerRoadmaps',
      },
    ],
  },
  {
    title: '📚 Resources & Guides',
    items: [
      {
        id: 'entrytests',
        title: 'Entry Tests',
        subtitle: 'MDCAT, ECAT, NET & more',
        icon: 'clipboard-outline',
        color: '#DC2626',
        screen: 'EntryTests',
      },
      {
        id: 'guides',
        title: 'Study Guides',
        subtitle: 'Subject-wise preparation',
        icon: 'library-outline',
        color: '#7C3AED',
        screen: 'Guides',
      },
      {
        id: 'studytips',
        title: 'Study Tips',
        subtitle: 'Improve your learning',
        icon: 'bulb-outline',
        color: '#FBBF24',
        screen: 'StudyTips',
      },
      {
        id: 'meritarchive',
        title: 'Merit Archive',
        subtitle: 'Historical merit data',
        icon: 'archive-outline',
        color: '#64748B',
        screen: 'MeritArchive',
      },
    ],
  },
  {
    title: '📅 Deadlines & Updates',
    items: [
      {
        id: 'deadlines',
        title: 'Deadlines',
        subtitle: 'Application due dates',
        icon: 'calendar-outline',
        color: '#EF4444',
        screen: 'Deadlines',
        badge: 'NEW',
      },
      {
        id: 'polls',
        title: 'Live Polls',
        subtitle: 'Community voting',
        icon: 'stats-chart-outline',
        color: '#8B5CF6',
        screen: 'Polls',
      },
    ],
  },
  {
    title: '🎮 Fun & Learning',
    items: [
      {
        id: 'resultgame',
        title: 'Score Prediction Game',
        subtitle: 'Guess your results',
        icon: 'game-controller-outline',
        color: '#10B981',
        screen: 'ResultGame',
      },
      {
        id: 'achievements',
        title: 'Achievements',
        subtitle: 'Track your progress',
        icon: 'trophy-outline',
        color: '#F59E0B',
        screen: 'Achievements',
      },
      {
        id: 'kidshub',
        title: 'Kids Zone',
        subtitle: 'Fun learning for young ones',
        icon: 'happy-outline',
        color: '#EC4899',
        screen: 'KidsHub',
      },
      {
        id: 'interestquiz',
        title: 'Interest Quiz',
        subtitle: 'Discover your interests',
        icon: 'help-circle-outline',
        color: '#06B6D4',
        screen: 'InterestQuiz',
      },
    ],
  },
  {
    title: '⚙️ Settings & Support',
    items: [
      {
        id: 'settings',
        title: 'Settings',
        subtitle: 'App preferences',
        icon: 'settings-outline',
        color: '#64748B',
        screen: 'Settings',
      },
      {
        id: 'favorites',
        title: 'Favorites',
        subtitle: 'Your saved items',
        icon: 'heart-outline',
        color: '#EF4444',
        screen: 'Favorites',
      },
      {
        id: 'notifications',
        title: 'Notifications',
        subtitle: 'Manage alerts',
        icon: 'notifications-outline',
        color: '#3B82F6',
        screen: 'Notifications',
      },
      {
        id: 'support',
        title: 'Contact Support',
        subtitle: 'Get help',
        icon: 'chatbubbles-outline',
        color: '#0891B2',
        screen: 'ContactSupport',
      },
    ],
  },
];

// ============================================================================
// MENU ITEM COMPONENT
// ============================================================================

interface MenuItemCardProps {
  item: MenuItem;
  colors: any;
  isDark: boolean;
  onPress: () => void;
}

const MenuItemCard = memo<MenuItemCardProps>(({item, colors, isDark, onPress}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
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

  const iconBg = isDark ? `${item.color}25` : `${item.color}12`;

  return (
    <Animated.View style={{transform: [{scale: scaleAnim}]}}>
      <TouchableOpacity
        style={[styles.menuItem, {backgroundColor: colors.card}]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={item.title}>
        <View style={[styles.menuIconContainer, {backgroundColor: iconBg}]}>
          <Icon name={item.icon} family="Ionicons" size={22} color={item.color} />
        </View>
        <View style={styles.menuContent}>
          <View style={styles.menuTitleRow}>
            <Text style={[styles.menuTitle, {color: colors.text}]}>{item.title}</Text>
            {item.badge && (
              <View style={[styles.menuBadge, {backgroundColor: '#EF4444'}]}>
                <Text style={styles.menuBadgeText}>{item.badge}</Text>
              </View>
            )}
          </View>
          {item.subtitle && (
            <Text style={[styles.menuSubtitle, {color: colors.textSecondary}]} numberOfLines={1}>
              {item.subtitle}
            </Text>
          )}
        </View>
        <Icon name="chevron-forward" family="Ionicons" size={18} color={colors.textSecondary} />
      </TouchableOpacity>
    </Animated.View>
  );
});

MenuItemCard.displayName = 'MenuItemCard';

// ============================================================================
// MAIN SCREEN
// ============================================================================

const MoreScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const {colors, isDark} = useTheme();
  const {user} = useAuth();
  
  // Check if user is admin based on role
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const handleNavigate = useCallback((screen: string) => {
    // Handle tab navigation vs stack navigation
    if (screen === 'Universities' || screen === 'Scholarships') {
      navigation.navigate('MainTabs', {screen} as any);
    } else {
      // Cast to any to handle dynamic navigation
      (navigation as any).navigate(screen);
    }
  }, [navigation]);

  const handleProfilePress = useCallback(() => {
    navigation.navigate('Profile');
  }, [navigation]);

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, {color: colors.text}]}>More</Text>
            <Text style={[styles.headerSubtitle, {color: colors.textSecondary}]}>
              Tools, resources & features
            </Text>
          </View>
          {/* Profile Button */}
          <TouchableOpacity
            style={[styles.profileButton, {backgroundColor: colors.primary}]}
            onPress={handleProfilePress}
            accessibilityRole="button"
            accessibilityLabel="View profile">
            <Icon name="person" family="Ionicons" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          
          {/* Quick Access Cards */}
          <View style={styles.quickAccessRow}>
            <TouchableOpacity
              style={[styles.quickCard, {backgroundColor: colors.card}]}
              onPress={() => handleNavigate('Tools')}
              activeOpacity={0.8}>
              <LinearGradient
                colors={['#6366F1', '#8B5CF6']}
                style={styles.quickCardGradient}>
                <Icon name="calculator" family="Ionicons" size={28} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[styles.quickCardTitle, {color: colors.text}]}>Tools</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickCard, {backgroundColor: colors.card}]}
              onPress={() => handleNavigate('Guides')}
              activeOpacity={0.8}>
              <LinearGradient
                colors={['#059669', '#10B981']}
                style={styles.quickCardGradient}>
                <Icon name="library" family="Ionicons" size={28} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[styles.quickCardTitle, {color: colors.text}]}>Guides</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickCard, {backgroundColor: colors.card}]}
              onPress={() => handleNavigate('EntryTests')}
              activeOpacity={0.8}>
              <LinearGradient
                colors={['#DC2626', '#EF4444']}
                style={styles.quickCardGradient}>
                <Icon name="clipboard" family="Ionicons" size={28} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[styles.quickCardTitle, {color: colors.text}]}>Tests</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickCard, {backgroundColor: colors.card}]}
              onPress={() => handleNavigate('CareerGuidance')}
              activeOpacity={0.8}>
              <LinearGradient
                colors={['#F59E0B', '#FBBF24']}
                style={styles.quickCardGradient}>
                <Icon name="compass" family="Ionicons" size={28} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[styles.quickCardTitle, {color: colors.text}]}>Career</Text>
            </TouchableOpacity>
          </View>

          {/* Admin Section (if admin) */}
          {isAdmin && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, {color: colors.text}]}>👑 Admin Panel</Text>
              <TouchableOpacity
                style={[styles.adminCard, {backgroundColor: colors.card}]}
                onPress={() => navigation.navigate('AdminDashboard')}
                activeOpacity={0.8}>
                <LinearGradient
                  colors={['#7C3AED', '#A855F7']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.adminCardGradient}>
                  <Icon name="shield-checkmark" family="Ionicons" size={24} color="#FFFFFF" />
                  <View style={styles.adminCardContent}>
                    <Text style={styles.adminCardTitle}>Admin Dashboard</Text>
                    <Text style={styles.adminCardSubtitle}>Manage users, content & settings</Text>
                  </View>
                  <Icon name="chevron-forward" family="Ionicons" size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Menu Sections */}
          {MENU_SECTIONS.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={[styles.sectionTitle, {color: colors.text}]}>{section.title}</Text>
              <View style={[styles.sectionCard, {backgroundColor: colors.card}]}>
                {section.items.map((item, index) => (
                  <View key={item.id}>
                    <MenuItemCard
                      item={item}
                      colors={colors}
                      isDark={isDark}
                      onPress={() => handleNavigate(item.screen)}
                    />
                    {index < section.items.length - 1 && (
                      <View style={[styles.divider, {backgroundColor: colors.border}]} />
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* Legal Links */}
          <View style={styles.legalSection}>
            <TouchableOpacity
              style={styles.legalLink}
              onPress={() => navigation.navigate('PrivacyPolicy')}>
              <Text style={[styles.legalText, {color: colors.textSecondary}]}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={[styles.legalDot, {color: colors.textSecondary}]}>•</Text>
            <TouchableOpacity
              style={styles.legalLink}
              onPress={() => navigation.navigate('TermsOfService')}>
              <Text style={[styles.legalText, {color: colors.textSecondary}]}>Terms of Service</Text>
            </TouchableOpacity>
          </View>

          {/* App Version */}
          <Text style={[styles.versionText, {color: colors.textSecondary}]}>
            PakUni v1.2.0
          </Text>

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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  headerLeft: {},
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 2,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },
  quickAccessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  quickCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  quickCardGradient: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  quickCardTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  sectionCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  menuTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
  menuBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  menuBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  menuSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 56 + SPACING.md,
  },
  adminCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  adminCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  adminCardContent: {
    flex: 1,
  },
  adminCardTitle: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
  },
  adminCardSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 2,
  },
  legalSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  legalLink: {
    padding: SPACING.xs,
  },
  legalText: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  legalDot: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  versionText: {
    textAlign: 'center',
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: SPACING.md,
  },
});

export default MoreScreen;

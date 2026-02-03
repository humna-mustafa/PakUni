/**
 * MoreScreen - Central hub for all tools, resources, and features
 * Replaces Profile in bottom navigation for better discoverability
 * 
 * ENHANCED: Premium animations, floating effects, staggered entrances
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
  Image,
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
// MENU ITEM DATA - Compact Grid Layout
// ============================================================================

interface GridItem {
  id: string;
  title: string;
  icon: string;
  color: string;
  screen: keyof RootStackParamList | 'Universities' | 'Scholarships';
  badge?: string;
  params?: any;
}

interface MenuSection {
  title: string;
  icon: string;
  items: GridItem[];
}

// Organized into logical sections with grid layout
const MENU_SECTIONS: MenuSection[] = [
  {
    title: 'Tools',
    icon: 'calculator-outline',
    items: [
      {id: 'tools', title: 'All Tools', icon: 'calculator', color: '#4573DF', screen: 'Tools'},
      {id: 'calculator', title: 'Merit Calc', icon: 'calculator-outline', color: '#4573DF', screen: 'Calculator'},
      {id: 'compare', title: 'Compare', icon: 'git-compare-outline', color: '#0891B2', screen: 'Compare'},
      {id: 'meritarchive', title: 'Merit Data', icon: 'archive-outline', color: '#64748B', screen: 'MeritArchive'},
    ],
  },
  {
    title: 'Career',
    icon: 'compass-outline',
    items: [
      {id: 'careercenter', title: 'Career Hub', icon: 'compass-outline', color: '#059669', screen: 'CareerCenter'},
      {id: 'recommendations', title: 'AI Match', icon: 'sparkles-outline', color: '#4573DF', screen: 'Recommendations'},
      {id: 'roadmaps', title: 'Roadmaps', icon: 'map-outline', color: '#F59E0B', screen: 'CareerRoadmaps'},
      {id: 'interestquiz', title: 'Quiz', icon: 'help-circle-outline', color: '#06B6D4', screen: 'InterestQuiz'},
    ],
  },
  {
    title: 'Study',
    icon: 'library-outline',
    items: [
      {id: 'entrytests', title: 'Entry Tests', icon: 'clipboard-outline', color: '#DC2626', screen: 'EntryTests'},
      {id: 'guides', title: 'Guides', icon: 'library-outline', color: '#3660C9', screen: 'Guides'},
      {id: 'studytips', title: 'Study Tips', icon: 'bulb-outline', color: '#FBBF24', screen: 'StudyTips'},
      {id: 'goals', title: 'My Goals', icon: 'flag-outline', color: '#10B981', screen: 'GoalSetting'},
    ],
  },
  {
    title: 'Explore',
    icon: 'game-controller-outline',
    items: [
      {id: 'deadlines', title: 'Deadlines', icon: 'calendar-outline', color: '#EF4444', screen: 'Deadlines', badge: 'NEW'},
      {id: 'polls', title: 'Polls', icon: 'stats-chart-outline', color: '#3660C9', screen: 'Polls'},
      {id: 'resultgame', title: 'Predict', icon: 'game-controller-outline', color: '#10B981', screen: 'ResultGame'},
      {id: 'achievements', title: 'Badges', icon: 'trophy-outline', color: '#F59E0B', screen: 'Achievements'},
    ],
  },
  // Removed Contribute section - now using dedicated motivational card
];

// ============================================================================
// GRID ITEM COMPONENT - Compact 4-column grid (ENHANCED)
// ============================================================================

interface GridItemCardProps {
  item: GridItem;
  colors: any;
  isDark: boolean;
  onPress: () => void;
}

const GridItemCard = memo<GridItemCardProps>(({item, colors, isDark, onPress}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.96,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const iconBg = isDark ? `${item.color}25` : `${item.color}12`;

  return (
    <Animated.View style={[styles.gridItemWrapper, {transform: [{scale: scaleAnim}]}]}>
      <TouchableOpacity
        style={[styles.gridItem, {backgroundColor: colors.card}]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={item.title}>
        <View style={[styles.gridIconContainer, {backgroundColor: iconBg}]}>
          <Icon name={item.icon} family="Ionicons" size={22} color={item.color} />
          {item.badge && (
            <View style={styles.gridBadge}>
              <Text style={styles.gridBadgeText}>{item.badge}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.gridTitle, {color: colors.text}]} numberOfLines={1}>
          {item.title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

GridItemCard.displayName = 'GridItemCard';

// ============================================================================
// MAIN SCREEN (ENHANCED)
// ============================================================================

const MoreScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const {colors, isDark} = useTheme();
  const {user} = useAuth();
  
  // Check if user is admin based on role
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const handleNavigate = useCallback((screen: string, params?: any) => {
    // Handle tab navigation vs stack navigation
    if (screen === 'Universities' || screen === 'Scholarships') {
      navigation.navigate('MainTabs', {screen} as any);
    } else {
      // Cast to any to handle dynamic navigation with params
      (navigation as any).navigate(screen, params);
    }
  }, [navigation]);

  const handleProfilePress = useCallback(() => {
    navigation.navigate('Profile');
  }, [navigation]);

  // Get user initials for profile button
  const getUserInitials = () => {
    if (user?.fullName) {
      const names = user.fullName.split(' ');
      return names.map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

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
            <Text style={[styles.headerTitle, {color: colors.text}]}>
              {user?.fullName ? `Hi, ${user.fullName.split(' ')[0]}` : 'More'}
            </Text>
            <Text style={[styles.headerSubtitle, {color: colors.textSecondary}]}>
              Tools, resources & features
            </Text>
          </View>
          {/* Profile Button */}
          <TouchableOpacity
            style={[
              styles.profileButton,
              !user?.avatarUrl && {backgroundColor: colors.primary}
            ]}
            onPress={handleProfilePress}
            accessibilityRole="button"
            accessibilityLabel="View profile">
            {user?.avatarUrl ? (
              <Image
                source={{uri: user.avatarUrl}}
                style={styles.profileImage}
                accessibilityIgnoresInvertColors
              />
            ) : (
              <Text style={styles.profileInitials}>{getUserInitials()}</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          
          {/* Quick Access Row - Top 4 most used */}
          <View style={styles.quickAccessRow}>
            <TouchableOpacity
              style={[styles.quickCard, {backgroundColor: colors.card}]}
              onPress={() => handleNavigate('Calculator')}
              activeOpacity={0.7}>
              <LinearGradient
                colors={['#4573DF', '#3660C9']}
                style={styles.quickCardGradient}>
                <Icon name="calculator-outline" family="Ionicons" size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[styles.quickCardTitle, {color: colors.text}]}>Merit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickCard, {backgroundColor: colors.card}]}
              onPress={() => handleNavigate('EntryTests')}
              activeOpacity={0.7}>
              <LinearGradient
                colors={['#DC2626', '#EF4444']}
                style={styles.quickCardGradient}>
                <Icon name="clipboard-outline" family="Ionicons" size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[styles.quickCardTitle, {color: colors.text}]}>Tests</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickCard, {backgroundColor: colors.card}]}
              onPress={() => handleNavigate('Deadlines')}
              activeOpacity={0.7}>
              <LinearGradient
                colors={['#EF4444', '#F87171']}
                style={styles.quickCardGradient}>
                <Icon name="calendar-outline" family="Ionicons" size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[styles.quickCardTitle, {color: colors.text}]}>Dates</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickCard, {backgroundColor: colors.card}]}
              onPress={() => handleNavigate('CareerCenter')}
              activeOpacity={0.7}>
              <LinearGradient
                colors={['#059669', '#10B981']}
                style={styles.quickCardGradient}>
                <Icon name="compass-outline" family="Ionicons" size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[styles.quickCardTitle, {color: colors.text}]}>Career</Text>
            </TouchableOpacity>
          </View>

          {/* Admin Section (if admin) */}
          {isAdmin && (
            <TouchableOpacity
              style={[styles.adminCard, {backgroundColor: colors.card}]}
              onPress={() => navigation.navigate('AdminDashboard')}
              activeOpacity={0.8}>
              <LinearGradient
                colors={['#3660C9', '#4573DF']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.adminCardGradient}>
                <Icon name="shield-checkmark" family="Ionicons" size={22} color="#FFFFFF" />
                <View style={styles.adminCardContent}>
                  <Text style={styles.adminCardTitle}>Admin Dashboard</Text>
                  <Text style={styles.adminCardSubtitle}>Manage app content</Text>
                </View>
                <Icon name="chevron-forward" family="Ionicons" size={18} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* 🌟 Data Correction Card - Ultra Clear Banner */}
          <TouchableOpacity
            style={[styles.contributeCard, {backgroundColor: colors.card}]}
            onPress={() => navigation.navigate('SubmitDataCorrection')}
            activeOpacity={0.8}>
            <LinearGradient
              colors={['#10B981', '#059669', '#047857']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.contributeCardGradient}>
              <View style={styles.contributeIconBg}>
                <Icon name="create" family="Ionicons" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.contributeCardContent}>
                <Text style={styles.contributeCardTitle}>🔧 Report Wrong Data</Text>
                <Text style={styles.contributeCardSubtitle}>
                  Found incorrect fee, merit or date? Fix it now!
                </Text>
              </View>
              <View style={styles.contributeArrow}>
                <Icon name="arrow-forward-circle" family="Ionicons" size={28} color="rgba(255,255,255,0.9)" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Compact Grid Sections */}
          {MENU_SECTIONS.map((section) => (
            <View key={section.title} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name={section.icon} family="Ionicons" size={16} color={colors.textSecondary} />
                <Text style={[styles.sectionTitle, {color: colors.textSecondary}]}>{section.title}</Text>
              </View>
              <View style={styles.gridContainer}>
                {section.items.map((item) => (
                  <GridItemCard
                    key={item.id}
                    item={item}
                    colors={colors}
                    isDark={isDark}
                    onPress={() => handleNavigate(item.screen, item.params)}
                  />
                ))}
              </View>
            </View>
          ))}

          {/* Bottom Quick Links - Settings & Support in compact row */}
          <View style={styles.bottomLinks}>
            <TouchableOpacity
              style={[styles.bottomLinkItem, {backgroundColor: colors.card}]}
              onPress={() => handleNavigate('Settings')}
              activeOpacity={0.8}>
              <Icon name="settings-outline" family="Ionicons" size={20} color={colors.textSecondary} />
              <Text style={[styles.bottomLinkText, {color: colors.text}]}>Settings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.bottomLinkItem, {backgroundColor: colors.card}]}
              onPress={() => handleNavigate('Favorites')}
              activeOpacity={0.8}>
              <Icon name="heart-outline" family="Ionicons" size={20} color="#EF4444" />
              <Text style={[styles.bottomLinkText, {color: colors.text}]}>Saved</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.bottomLinkItem, {backgroundColor: colors.card}]}
              onPress={() => handleNavigate('Notifications')}
              activeOpacity={0.8}>
              <Icon name="notifications-outline" family="Ionicons" size={20} color="#4573DF" />
              <Text style={[styles.bottomLinkText, {color: colors.text}]}>Alerts</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.bottomLinkItem, {backgroundColor: colors.card}]}
              onPress={() => handleNavigate('ContactSupport')}
              activeOpacity={0.8}>
              <Icon name="chatbubbles-outline" family="Ionicons" size={20} color="#10B981" />
              <Text style={[styles.bottomLinkText, {color: colors.text}]}>Help</Text>
            </TouchableOpacity>
          </View>

          {/* Kids Hub - Special link */}
          <TouchableOpacity
            style={[styles.kidsHubCard, {backgroundColor: colors.card}]}
            onPress={() => handleNavigate('KidsHub')}
            activeOpacity={0.8}>
            <LinearGradient
              colors={['#4573DF', '#F472B6']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.kidsHubGradient}>
              <Icon name="happy-outline" family="Ionicons" size={22} color="#FFFFFF" />
              <Text style={styles.kidsHubTitle}>Kids Zone</Text>
              <Text style={styles.kidsHubSubtitle}>Fun learning!</Text>
              <Icon name="chevron-forward" family="Ionicons" size={18} color="rgba(255,255,255,0.7)" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Legal & Version */}
          <View style={styles.footer}>
            <View style={styles.legalSection}>
              <TouchableOpacity
                style={styles.legalLink}
                onPress={() => navigation.navigate('PrivacyPolicy')}>
                <Text style={[styles.legalText, {color: colors.textSecondary}]}>Privacy</Text>
              </TouchableOpacity>
              <Text style={[styles.legalDot, {color: colors.textSecondary}]}>•</Text>
              <TouchableOpacity
                style={styles.legalLink}
                onPress={() => navigation.navigate('TermsOfService')}>
                <Text style={[styles.legalText, {color: colors.textSecondary}]}>Terms</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.versionText, {color: colors.textSecondary}]}>
              PakUni v1.2.0
            </Text>
          </View>

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
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  headerLeft: {},
  headerTitle: {
    fontSize: 26,
    fontWeight: TYPOGRAPHY.weight.heavy,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
  },
  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
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
  profileInitials: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  profileImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
  },
  // Quick Access Row
  quickAccessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  quickCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: RADIUS.lg,
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
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  quickCardTitle: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weight.semibold,
    textAlign: 'center',
  },
  // Admin Card
  adminCard: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  adminCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  adminCardContent: {
    flex: 1,
  },
  adminCardTitle: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  adminCardSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    marginTop: 1,
  },
  // Contribute Card - Motivational Banner
  contributeCard: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    ...Platform.select({
      ios: {
        shadowColor: '#4573DF',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  contributeCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  contributeIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contributeCardContent: {
    flex: 1,
  },
  contributeCardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weight.heavy,
    letterSpacing: -0.3,
  },
  contributeCardSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginTop: 3,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  contributeArrow: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Section
  section: {
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Grid Layout
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  gridItemWrapper: {
    width: (SCREEN_WIDTH - SPACING.md * 2 - SPACING.xs * 3) / 4,
  },
  gridItem: {
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: RADIUS.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.04,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  gridIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    position: 'relative',
  },
  gridTitle: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weight.semibold,
    textAlign: 'center',
  },
  gridBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  gridBadgeText: {
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  // Bottom Links Row
  bottomLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  bottomLinkItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
    borderRadius: RADIUS.lg,
    gap: 6,
  },
  bottomLinkText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  // Kids Hub Card
  kidsHubCard: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  kidsHubGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  kidsHubTitle: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.bold,
    flex: 1,
  },
  kidsHubSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  // Footer
  footer: {
    alignItems: 'center',
    paddingTop: SPACING.xs,
  },
  legalSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  legalLink: {
    padding: SPACING.xs,
  },
  legalText: {
    fontSize: 11,
  },
  legalDot: {
    fontSize: 11,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 10,
    marginTop: SPACING.xs,
  },
});

export default MoreScreen;


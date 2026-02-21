import React from 'react';
import {View, Text} from 'react-native';
import {TYPOGRAPHY} from '../constants/design';
import {NavigationContainer, DefaultTheme, DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator, NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {createBottomTabNavigator, type BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {Icon} from '../components';
import {
  DefaultScreenOptions,
  ModalScreenOptions,
  FadeScreenOptions,
} from './transitions';

// ─── Auth & Onboarding ─────────────────────────────────────────────────────
import AuthScreen from '../screens/AuthScreen';
import UltraOnboardingScreen from '../screens/UltraOnboardingScreen';

// ─── Tab Screens ────────────────────────────────────────────────────────────
import PremiumHomeScreen from '../screens/PremiumHomeScreen';
import PremiumUniversitiesScreen from '../screens/PremiumUniversitiesScreen';
import PremiumScholarshipsScreen from '../screens/PremiumScholarshipsScreen';
import MoreScreen from '../screens/MoreScreen';

// ─── University Flow ────────────────────────────────────────────────────────
import PremiumUniversityDetailScreen from '../screens/PremiumUniversityDetailScreen';
import PremiumCompareScreen from '../screens/PremiumCompareScreen';
import PremiumCalculatorScreen from '../screens/PremiumCalculatorScreen';
import PremiumEntryTestsScreen from '../screens/PremiumEntryTestsScreen';
import PremiumMeritArchiveScreen from '../screens/PremiumMeritArchiveScreen';
import PremiumDeadlinesScreen from '../screens/PremiumDeadlinesScreen';

// ─── Career Flow ────────────────────────────────────────────────────────────
import PremiumCareerCenterScreen from '../screens/PremiumCareerCenterScreen';
import CareerDetailScreen from '../screens/CareerDetailScreen';
import PremiumCareerGuidanceScreen from '../screens/PremiumCareerGuidanceScreen';
import PremiumRecommendationsScreen from '../screens/PremiumRecommendationsScreen';
import PremiumCareerRoadmapsScreen from '../screens/PremiumCareerRoadmapsScreen';
import PremiumInterestQuizScreen from '../screens/PremiumInterestQuizScreen';

// ─── Study & Learning ───────────────────────────────────────────────────────
import GuidesScreen from '../screens/GuidesScreen';
import PremiumStudyTipsScreen from '../screens/PremiumStudyTipsScreen';
import PremiumGoalSettingScreen from '../screens/PremiumGoalSettingScreen';
import SubjectGuideScreen from '../screens/SubjectGuideScreen';

// ─── Kids Zone ──────────────────────────────────────────────────────────────
import PremiumKidsHubScreen from '../screens/PremiumKidsHubScreen';
import CareerExplorerKidsScreen from '../screens/CareerExplorerKidsScreen';

// ─── Engagement & Social ────────────────────────────────────────────────────
import PremiumPollsScreen from '../screens/PremiumPollsScreen';
import ResultGameScreen from '../screens/ResultGameScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import ToolsScreen from '../screens/ToolsScreen';

// ─── User Account ───────────────────────────────────────────────────────────
import PremiumProfileScreen from '../screens/PremiumProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ContactSupportScreen from '../screens/ContactSupportScreen';

// ─── Legal ──────────────────────────────────────────────────────────────────
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';
import FAQScreen from '../screens/FAQScreen';

// ─── Data Contribution ──────────────────────────────────────────────────────
import { UltraContributeScreen } from '../screens/UltraContributeScreen';
import DataCorrectionScreen from '../screens/DataCorrectionScreen';

// ─── Admin Screens ──────────────────────────────────────────────────────────
import {
  AdminDashboardScreen,
  AdminUsersScreen,
  AdminContentScreen,
  AdminReportsScreen,
  AdminAnnouncementsScreen,
  AdminFeedbackScreen,
  AdminAnalyticsScreen,
  AdminSettingsScreen,
  AdminAuditLogsScreen,
  AdminNotificationsScreen,
  AdminErrorReportsScreen,
  AdminDataManagementScreen,
  AdminTursoDataManagementScreen,
  AdminTursoNotificationsScreen,
  AdminSystemHealthScreen,
  AdminBulkOperationsScreen,
  AdminAppConfigScreen,
  AdminActivityDashboardScreen,
  AdminContentModerationScreen,
  AdminDataSubmissionsScreen,
  AdminAutoApprovalRulesScreen,
  AdminMeritDeadlinesScreen,
  AdminNotificationTriggersScreen,
  AdminApprovalAnalyticsScreen,
  AdminDataCorrectionReviewScreen,
} from '../screens/admin';

// ─── Components & Contexts ──────────────────────────────────────────────────
import {ErrorBoundary, PremiumTabBar, withAdminGuard} from '../components';
import {useTheme} from '../contexts/ThemeContext';
import {useAuth} from '../contexts/AuthContext';
import type {NavigatorScreenParams} from '@react-navigation/native';

// ─── Admin Role Guards ──────────────────────────────────────────────────────
const GuardedAdminDashboardScreen = withAdminGuard(AdminDashboardScreen);
const GuardedAdminUsersScreen = withAdminGuard(AdminUsersScreen, ['admin', 'super_admin']);
const GuardedAdminContentScreen = withAdminGuard(AdminContentScreen);
const GuardedAdminReportsScreen = withAdminGuard(AdminReportsScreen);
const GuardedAdminAnnouncementsScreen = withAdminGuard(AdminAnnouncementsScreen);
const GuardedAdminFeedbackScreen = withAdminGuard(AdminFeedbackScreen);
const GuardedAdminAnalyticsScreen = withAdminGuard(AdminAnalyticsScreen);
const GuardedAdminSettingsScreen = withAdminGuard(AdminSettingsScreen, ['admin', 'super_admin']);
const GuardedAdminAuditLogsScreen = withAdminGuard(AdminAuditLogsScreen, ['admin', 'super_admin']);
const GuardedAdminNotificationsScreen = withAdminGuard(AdminNotificationsScreen);
const GuardedAdminErrorReportsScreen = withAdminGuard(AdminErrorReportsScreen);
const GuardedAdminDataManagementScreen = withAdminGuard(AdminDataManagementScreen);
const GuardedAdminTursoDataManagementScreen = withAdminGuard(AdminTursoDataManagementScreen);
const GuardedAdminTursoNotificationsScreen = withAdminGuard(AdminTursoNotificationsScreen);
const GuardedAdminSystemHealthScreen = withAdminGuard(AdminSystemHealthScreen);
const GuardedAdminBulkOperationsScreen = withAdminGuard(AdminBulkOperationsScreen, ['admin', 'super_admin']);
const GuardedAdminAppConfigScreen = withAdminGuard(AdminAppConfigScreen, ['super_admin']);
const GuardedAdminActivityDashboardScreen = withAdminGuard(AdminActivityDashboardScreen);
const GuardedAdminContentModerationScreen = withAdminGuard(AdminContentModerationScreen);
const GuardedAdminDataSubmissionsScreen = withAdminGuard(AdminDataSubmissionsScreen);
const GuardedAdminAutoApprovalRulesScreen = withAdminGuard(AdminAutoApprovalRulesScreen, ['admin', 'super_admin']);
const GuardedAdminMeritDeadlinesScreen = withAdminGuard(AdminMeritDeadlinesScreen);
const GuardedAdminNotificationTriggersScreen = withAdminGuard(AdminNotificationTriggersScreen, ['admin', 'super_admin']);
const GuardedAdminApprovalAnalyticsScreen = withAdminGuard(AdminApprovalAnalyticsScreen);
const GuardedAdminDataCorrectionReviewScreen = withAdminGuard(AdminDataCorrectionReviewScreen);

// =============================================================================
// TYPE DEFINITIONS — Organized by flow hierarchy
// =============================================================================

export type TabParamList = {
  Home: undefined;
  Universities: {searchQuery?: string} | undefined;
  Scholarships: {searchQuery?: string} | undefined;
  More: undefined;
};

export type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminUsers: undefined;
  AdminContent: undefined;
  AdminReports: undefined;
  AdminAnnouncements: undefined;
  AdminFeedback: undefined;
  AdminAnalytics: undefined;
  AdminSettings: undefined;
  AdminAuditLogs: undefined;
  AdminNotifications: undefined;
  AdminErrorReports: undefined;
  AdminDataManagement: undefined;
  AdminTursoDataManagement: undefined;
  AdminTursoNotifications: undefined;
  AdminSystemHealth: undefined;
  AdminBulkOperations: undefined;
  AdminAppConfig: undefined;
  AdminActivityDashboard: undefined;
  AdminContentModeration: undefined;
  AdminDataSubmissions: undefined;
  AdminAutoApprovalRules: undefined;
  AdminMeritDeadlines: undefined;
  AdminNotificationTriggers: undefined;
  AdminApprovalAnalytics: undefined;
  AdminDataCorrectionReview: undefined;
};

export type RootStackParamList = {
  // Auth Flow
  Auth: undefined;
  Onboarding: undefined;

  // Main App
  MainTabs: NavigatorScreenParams<TabParamList> | undefined;

  // University Flow
  UniversityDetail: {universityId: string};
  Calculator: undefined;
  Compare: undefined;
  EntryTests: undefined;
  MeritArchive: undefined;
  Deadlines: undefined;

  // Career Flow
  CareerCenter: undefined;
  CareerDetail: {careerId: string};
  CareerGuidance: undefined;
  Recommendations: undefined;
  CareerRoadmaps: undefined;
  InterestQuiz: undefined;

  // Study & Learning
  Guides: {initialCategory?: string} | undefined;
  StudyTips: undefined;
  GoalSetting: undefined;
  SubjectGuide: undefined;

  // Kids Zone
  KidsHub: undefined;
  CareerExplorerKids: undefined;

  // Engagement
  Polls: undefined;
  ResultGame: undefined;
  Achievements: undefined;
  Tools: undefined;

  // User Account
  Profile: undefined;
  Notifications: undefined;
  Favorites: undefined;
  Settings: undefined;
  ContactSupport: undefined;

  // Legal
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  FAQ: undefined;

  // Data Contribution
  SubmitDataCorrection: {type?: string; entityName?: string; fieldName?: string; currentValue?: string; showHistory?: boolean} | undefined;
  DataCorrection: {entityType: string; entityId: string; entityName?: string; prefillField?: string};

  // Shared Deep Links
  SharedAchievement: {achievementId: string};
  SharedCard: {cardType: string; cardId: string};

  // Admin (nested stack)
  Admin: NavigatorScreenParams<AdminStackParamList> | undefined;
};

// =============================================================================
// NAVIGATORS
// =============================================================================

const Stack = createNativeStackNavigator<RootStackParamList>();
const AdminStackNav = createNativeStackNavigator<AdminStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const renderPremiumTabBar = (props: BottomTabBarProps) => <PremiumTabBar {...props} />;

// ─── Admin Stack (nested) ───────────────────────────────────────────────────
const AdminStack = () => {
  const {colors} = useTheme();
  return (
    <AdminStackNav.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {backgroundColor: colors.background},
      }}>
      <AdminStackNav.Screen name="AdminDashboard" component={GuardedAdminDashboardScreen} />
      <AdminStackNav.Screen name="AdminUsers" component={GuardedAdminUsersScreen} />
      <AdminStackNav.Screen name="AdminContent" component={GuardedAdminContentScreen} />
      <AdminStackNav.Screen name="AdminReports" component={GuardedAdminReportsScreen} />
      <AdminStackNav.Screen name="AdminAnnouncements" component={GuardedAdminAnnouncementsScreen} />
      <AdminStackNav.Screen name="AdminFeedback" component={GuardedAdminFeedbackScreen} />
      <AdminStackNav.Screen name="AdminAnalytics" component={GuardedAdminAnalyticsScreen} />
      <AdminStackNav.Screen name="AdminSettings" component={GuardedAdminSettingsScreen} />
      <AdminStackNav.Screen name="AdminAuditLogs" component={GuardedAdminAuditLogsScreen} />
      <AdminStackNav.Screen name="AdminNotifications" component={GuardedAdminNotificationsScreen} />
      <AdminStackNav.Screen name="AdminErrorReports" component={GuardedAdminErrorReportsScreen} />
      <AdminStackNav.Screen name="AdminDataManagement" component={GuardedAdminDataManagementScreen} />
      <AdminStackNav.Screen name="AdminTursoDataManagement" component={GuardedAdminTursoDataManagementScreen} />
      <AdminStackNav.Screen name="AdminTursoNotifications" component={GuardedAdminTursoNotificationsScreen} />
      <AdminStackNav.Screen name="AdminSystemHealth" component={GuardedAdminSystemHealthScreen} />
      <AdminStackNav.Screen name="AdminBulkOperations" component={GuardedAdminBulkOperationsScreen} />
      <AdminStackNav.Screen name="AdminAppConfig" component={GuardedAdminAppConfigScreen} />
      <AdminStackNav.Screen name="AdminActivityDashboard" component={GuardedAdminActivityDashboardScreen} />
      <AdminStackNav.Screen name="AdminContentModeration" component={GuardedAdminContentModerationScreen} />
      <AdminStackNav.Screen name="AdminDataSubmissions" component={GuardedAdminDataSubmissionsScreen} />
      <AdminStackNav.Screen name="AdminAutoApprovalRules" component={GuardedAdminAutoApprovalRulesScreen} />
      <AdminStackNav.Screen name="AdminMeritDeadlines" component={GuardedAdminMeritDeadlinesScreen} />
      <AdminStackNav.Screen name="AdminNotificationTriggers" component={GuardedAdminNotificationTriggersScreen} />
      <AdminStackNav.Screen name="AdminApprovalAnalytics" component={GuardedAdminApprovalAnalyticsScreen} />
      <AdminStackNav.Screen name="AdminDataCorrectionReview" component={GuardedAdminDataCorrectionReviewScreen} />
    </AdminStackNav.Navigator>
  );
};

// ─── Main Tabs ──────────────────────────────────────────────────────────────
const MainTabs = () => {
  const {colors} = useTheme();
  
  return (
    <Tab.Navigator
      tabBar={renderPremiumTabBar}
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: TYPOGRAPHY.weight.bold,
          fontSize: 18,
        },
        headerShadowVisible: false,
        tabBarHideOnKeyboard: true,
      }}>
      <Tab.Screen 
        name="Home" 
        component={PremiumHomeScreen} 
        options={{headerShown: false}} 
      />
      <Tab.Screen 
        name="Universities" 
        component={PremiumUniversitiesScreen}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Scholarships" 
        component={PremiumScholarshipsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="More" 
        component={MoreScreen}
        options={{
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

interface AppNavigatorProps {
  linking?: any;
}

const AppNavigator: React.FC<AppNavigatorProps> = ({linking}) => {
  const {colors, isDark} = useTheme();
  const {isAuthenticated, isLoading, hasCompletedOnboarding} = useAuth();
  
  // Custom navigation themes
  const CustomLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.error,
    },
  };

  const CustomDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.error,
    },
  };

  // Determine initial route based on auth state
  const getInitialRoute = (): keyof RootStackParamList => {
    if (!isAuthenticated) return 'Auth';
    if (!hasCompletedOnboarding) return 'Onboarding';
    return 'MainTabs';
  };

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background}}>
        <View style={{width: 80, height: 80, borderRadius: 24, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16}}>
          <Icon name="school-outline" family="Ionicons" size={36} color="#FFFFFF" />
        </View>
        <Text style={{fontSize: 24, fontWeight: TYPOGRAPHY.weight.bold, color: colors.text, marginBottom: 8}}>PakUni</Text>
        <Text style={{fontSize: 14, color: colors.textSecondary}}>Loading...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <NavigationContainer theme={isDark ? CustomDarkTheme : CustomLightTheme} linking={linking}>
        <Stack.Navigator
          initialRouteName={getInitialRoute()}
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.card,
            },
            headerTintColor: colors.text,
            headerTitleStyle: {
              fontWeight: TYPOGRAPHY.weight.bold,
              fontSize: 18,
            },
            headerShadowVisible: false,
            // Modern iOS-style slide with spring animation
            animation: 'slide_from_right',
            animationDuration: 300,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            contentStyle: {backgroundColor: colors.background},
          }}>
          {/* Auth Flow - Fade transition */}
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{
              headerShown: false,
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="Onboarding"
            component={UltraOnboardingScreen}
            options={{
              headerShown: false,
              animation: 'fade',
              gestureEnabled: false,
            }}
          />
          {/* Main App */}
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{
              headerShown: false,
              animation: 'fade',
            }}
          />
          {/* ─── Detail & University Flow ────────────────────── */}
          <Stack.Screen
            name="UniversityDetail"
            component={PremiumUniversityDetailScreen}
            options={{
              headerShown: false,
              animation: 'fade_from_bottom',
              animationDuration: 250,
            }}
          />
          <Stack.Screen
            name="Calculator"
            component={PremiumCalculatorScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_bottom',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="Compare"
            component={PremiumCompareScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_bottom',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="EntryTests"
            component={PremiumEntryTestsScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="MeritArchive"
            component={PremiumMeritArchiveScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Deadlines"
            component={PremiumDeadlinesScreen}
            options={{headerShown: false}}
          />

          {/* ─── Career Flow ──────────────────────────────────── */}
          <Stack.Screen
            name="CareerCenter"
            component={PremiumCareerCenterScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="CareerDetail"
            component={CareerDetailScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="CareerGuidance"
            component={PremiumCareerGuidanceScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Recommendations"
            component={PremiumRecommendationsScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="CareerRoadmaps"
            component={PremiumCareerRoadmapsScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="InterestQuiz"
            component={PremiumInterestQuizScreen}
            options={{headerShown: false}}
          />

          {/* ─── Study & Learning ─────────────────────────────── */}
          <Stack.Screen
            name="Guides"
            component={GuidesScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="StudyTips"
            component={PremiumStudyTipsScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="GoalSetting"
            component={PremiumGoalSettingScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="SubjectGuide"
            component={SubjectGuideScreen}
            options={{title: 'Subject Guide'}}
          />

          {/* ─── Kids Zone ────────────────────────────────────── */}
          <Stack.Screen
            name="KidsHub"
            component={PremiumKidsHubScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="CareerExplorerKids"
            component={CareerExplorerKidsScreen}
            options={{title: 'Career Explorer'}}
          />

          {/* ─── Engagement & Tools ───────────────────────────── */}
          <Stack.Screen
            name="Polls"
            component={PremiumPollsScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="ResultGame"
            component={ResultGameScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Achievements"
            component={AchievementsScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Tools"
            component={ToolsScreen}
            options={{headerShown: false}}
          />
          {/* ─── User Account ──────────────────────────────────── */}
          <Stack.Screen
            name="Profile"
            component={PremiumProfileScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Favorites"
            component={FavoritesScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="ContactSupport"
            component={ContactSupportScreen}
            options={{headerShown: false}}
          />

          {/* ─── Legal ────────────────────────────────────────── */}
          <Stack.Screen
            name="PrivacyPolicy"
            component={PrivacyPolicyScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="TermsOfService"
            component={TermsOfServiceScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="FAQ"
            component={FAQScreen}
            options={{headerShown: false}}
          />

          {/* ─── Admin (nested stack) ─────────────────────────── */}
          <Stack.Screen
            name="Admin"
            component={AdminStack}
            options={{headerShown: false}}
          />

          {/* ─── Data Contribution ────────────────────────────── */}
          <Stack.Screen
            name="SubmitDataCorrection"
            component={UltraContributeScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="DataCorrection"
            component={DataCorrectionScreen}
            options={{...ModalScreenOptions, headerShown: false}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
};

export default AppNavigator;

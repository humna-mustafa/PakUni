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

// Auth & Onboarding Screens
import AuthScreen from '../screens/AuthScreen';
import UltraOnboardingScreen from '../screens/UltraOnboardingScreen';

// Premium Screens - Main
import PremiumHomeScreen from '../screens/PremiumHomeScreen';
import PremiumUniversitiesScreen from '../screens/PremiumUniversitiesScreen';
import PremiumCalculatorScreen from '../screens/PremiumCalculatorScreen';
import PremiumScholarshipsScreen from '../screens/PremiumScholarshipsScreen';
import PremiumProfileScreen from '../screens/PremiumProfileScreen';
import PremiumUniversityDetailScreen from '../screens/PremiumUniversityDetailScreen';

// Premium Screens - Feature
import PremiumCompareScreen from '../screens/PremiumCompareScreen';
import PremiumEntryTestsScreen from '../screens/PremiumEntryTestsScreen';
import PremiumCareerGuidanceScreen from '../screens/PremiumCareerGuidanceScreen';
import PremiumRecommendationsScreen from '../screens/PremiumRecommendationsScreen';
import PremiumCareerCenterScreen from '../screens/PremiumCareerCenterScreen';
import CareerDetailScreen from '../screens/CareerDetailScreen';

// Premium Screens - Kids Zone
import PremiumKidsHubScreen from '../screens/PremiumKidsHubScreen';
import CareerExplorerKidsScreen from '../screens/CareerExplorerKidsScreen';
import PremiumInterestQuizScreen from '../screens/PremiumInterestQuizScreen';
import PremiumGoalSettingScreen from '../screens/PremiumGoalSettingScreen';
import SubjectGuideScreen from '../screens/SubjectGuideScreen';
import PremiumCareerRoadmapsScreen from '../screens/PremiumCareerRoadmapsScreen';
import PremiumStudyTipsScreen from '../screens/PremiumStudyTipsScreen';
import PremiumPollsScreen from '../screens/PremiumPollsScreen';
import PremiumDeadlinesScreen from '../screens/PremiumDeadlinesScreen';
import PremiumMeritArchiveScreen from '../screens/PremiumMeritArchiveScreen';

// New Feature Screens
import GuidesScreen from '../screens/GuidesScreen';
import ToolsScreen from '../screens/ToolsScreen';
import ResultGameScreen from '../screens/ResultGameScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import MoreScreen from '../screens/MoreScreen';

// Legal Screens
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';
import FAQScreen from '../screens/FAQScreen';

// User Feature Screens
import NotificationsScreen from '../screens/NotificationsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ContactSupportScreen from '../screens/ContactSupportScreen';

// Admin Screens
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
  // EnterpriseAdminDashboardScreen removed - AdminDashboard wraps it
  AdminTursoDataManagementScreen,
  AdminTursoNotificationsScreen,
  AdminSystemHealthScreen,
  // Advanced Admin Screens
  AdminBulkOperationsScreen,
  AdminAppConfigScreen,
  AdminActivityDashboardScreen,
  AdminContentModerationScreen,
  // Data Management & Approval Workflow
  AdminDataSubmissionsScreen,
  AdminAutoApprovalRulesScreen,
  AdminMeritDeadlinesScreen,
  AdminNotificationTriggersScreen,
  AdminApprovalAnalyticsScreen,
} from '../screens/admin';

// User Feature Screens - Data Submission
import UserDataSubmissionScreen from '../screens/UserDataSubmissionScreen';
import { UltraContributeScreen } from '../screens/UltraContributeScreen';

// Components
import {ErrorBoundary, PremiumTabBar, withAdminGuard} from '../components';

// Wrap admin screens with role guards
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

// Contexts
import {useTheme} from '../contexts/ThemeContext';
import {useAuth} from '../contexts/AuthContext';


import type {NavigatorScreenParams} from '@react-navigation/native';

export type TabParamList = {
  Home: undefined;
  Universities: {searchQuery?: string} | undefined;
  Scholarships: {searchQuery?: string} | undefined;
  More: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  // Auth Flow
  Auth: undefined;
  Onboarding: undefined;
  // Main App
  MainTabs: NavigatorScreenParams<TabParamList> | undefined;
  UniversityDetail: {universityId: string};
  CareerDetail: {careerId: string};
  Calculator: undefined;
  Compare: undefined;
  EntryTests: undefined;
  CareerGuidance: undefined;
  CareerCenter: undefined;
  Recommendations: undefined;
  CareerExplorerKids: undefined;
  InterestQuiz: undefined;
  GoalSetting: undefined;
  SubjectGuide: undefined;
  KidsHub: undefined;
  CareerRoadmaps: undefined;
  StudyTips: undefined;
  Polls: undefined;
  Deadlines: undefined;
  MeritArchive: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  FAQ: undefined;
  // New Feature Screens
  Guides: undefined;
  Tools: undefined;
  ResultGame: undefined;
  Achievements: undefined;
  // Shared Achievement/Card Deep Links (for viral sharing)
  SharedAchievement: {achievementId: string};
  SharedCard: {cardType: string; cardId: string};
  // User Feature Screens
  Profile: undefined;
  Notifications: undefined;
  Favorites: undefined;
  Settings: undefined;
  ContactSupport: undefined;
  // Admin Screens
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
  // Turso Admin Screens
  AdminTursoDataManagement: undefined;
  AdminTursoNotifications: undefined;
  AdminSystemHealth: undefined;
  // Advanced Admin Screens
  AdminBulkOperations: undefined;
  AdminAppConfig: undefined;
  AdminActivityDashboard: undefined;
  AdminContentModeration: undefined;
  // Data Management & Approval Workflow
  AdminDataSubmissions: undefined;
  AdminAutoApprovalRules: undefined;
  AdminMeritDeadlines: undefined;
  AdminNotificationTriggers: undefined;
  AdminApprovalAnalytics: undefined;
  // User Screens
  SubmitDataCorrection: {type?: string; entityName?: string; fieldName?: string; currentValue?: string; showHistory?: boolean} | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const renderPremiumTabBar = (props: BottomTabBarProps) => <PremiumTabBar {...props} />;

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
          {/* Detail screens - Scale fade for immersive feel */}
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
            name="CareerGuidance"
            component={PremiumCareerGuidanceScreen}
            options={{headerShown: false}}
          />
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
            name="Recommendations"
            component={PremiumRecommendationsScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="CareerExplorerKids"
            component={CareerExplorerKidsScreen}
            options={{title: 'Career Explorer'}}
          />
          <Stack.Screen
            name="InterestQuiz"
            component={PremiumInterestQuizScreen}
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
          <Stack.Screen
            name="KidsHub"
            component={PremiumKidsHubScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="CareerRoadmaps"
            component={PremiumCareerRoadmapsScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="StudyTips"
            component={PremiumStudyTipsScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Polls"
            component={PremiumPollsScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Deadlines"
            component={PremiumDeadlinesScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="MeritArchive"
            component={PremiumMeritArchiveScreen}
            options={{headerShown: false}}
          />
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
          {/* New Feature Screens */}
          <Stack.Screen
            name="Guides"
            component={GuidesScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Tools"
            component={ToolsScreen}
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
          {/* User Feature Screens */}
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
          {/* Admin Screens - Protected with role guards */}
          <Stack.Screen
            name="AdminDashboard"
            component={GuardedAdminDashboardScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AdminUsers"
            component={GuardedAdminUsersScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AdminContent"
            component={GuardedAdminContentScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AdminReports"
            component={GuardedAdminReportsScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AdminAnnouncements"
            component={GuardedAdminAnnouncementsScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AdminFeedback"
            component={GuardedAdminFeedbackScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AdminAnalytics"
            component={GuardedAdminAnalyticsScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AdminSettings"
            component={GuardedAdminSettingsScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AdminAuditLogs"
            component={GuardedAdminAuditLogsScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AdminNotifications"
            component={GuardedAdminNotificationsScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AdminErrorReports"
            component={GuardedAdminErrorReportsScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AdminDataManagement"
            component={GuardedAdminDataManagementScreen}
            options={{headerShown: false}}
          />
          {/* Turso Admin Screens - Protected */}
          <Stack.Screen
            name="AdminTursoDataManagement"
            component={GuardedAdminTursoDataManagementScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AdminTursoNotifications"
            component={GuardedAdminTursoNotificationsScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AdminSystemHealth"
            component={GuardedAdminSystemHealthScreen}
            options={{headerShown: false}}
          />
          {/* Advanced Admin Screens - Protected */}
          <Stack.Screen
            name="AdminBulkOperations"
            component={GuardedAdminBulkOperationsScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AdminAppConfig"
            component={GuardedAdminAppConfigScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AdminActivityDashboard"
            component={GuardedAdminActivityDashboardScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AdminContentModeration"
            component={GuardedAdminContentModerationScreen}
            options={{headerShown: false}}
          />
          {/* Data Management & Approval Workflow - Protected */}
          <Stack.Screen
            name="AdminDataSubmissions"
            component={GuardedAdminDataSubmissionsScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AdminAutoApprovalRules"
            component={GuardedAdminAutoApprovalRulesScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AdminMeritDeadlines"
            component={GuardedAdminMeritDeadlinesScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AdminNotificationTriggers"
            component={GuardedAdminNotificationTriggersScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AdminApprovalAnalytics"
            component={GuardedAdminApprovalAnalyticsScreen}
            options={{headerShown: false}}
          />
          {/* User Data Submission - Ultra Contribute Screen */}
          <Stack.Screen
            name="SubmitDataCorrection"
            component={UltraContributeScreen}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
};

export default AppNavigator;

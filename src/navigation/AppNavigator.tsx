import React from 'react';
import {View, Text} from 'react-native';
import {NavigationContainer, DefaultTheme, DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator, type BottomTabBarProps} from '@react-navigation/bottom-tabs';

// Auth & Onboarding Screens
import AuthScreen from '../screens/AuthScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

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

// Legal Screens
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';

// User Feature Screens
import NotificationsScreen from '../screens/NotificationsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import SettingsScreen from '../screens/SettingsScreen';

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
} from '../screens/admin';

// Components
import {ErrorBoundary, PremiumTabBar} from '../components';

// Contexts
import {useTheme} from '../contexts/ThemeContext';
import {useAuth} from '../contexts/AuthContext';


import type {NavigatorScreenParams} from '@react-navigation/native';

export type TabParamList = {
  Home: undefined;
  Universities: undefined;
  Scholarships: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  // Auth Flow
  Auth: undefined;
  Onboarding: undefined;
  // Main App
  MainTabs: NavigatorScreenParams<TabParamList> | undefined;
  UniversityDetail: {universityId: string};
  Calculator: undefined;
  Compare: undefined;
  EntryTests: undefined;
  CareerGuidance: undefined;
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
  // New Feature Screens
  Guides: undefined;
  Tools: undefined;
  ResultGame: undefined;
  Achievements: undefined;
  // User Feature Screens
  Notifications: undefined;
  Favorites: undefined;
  Settings: undefined;
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
          fontWeight: '700',
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
        name="Profile" 
        component={PremiumProfileScreen}
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
          <Text style={{fontSize: 32, color: '#FFFFFF'}}>🎓</Text>
        </View>
        <Text style={{fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 8}}>PakUni</Text>
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
              fontWeight: '700',
              fontSize: 18,
            },
            headerShadowVisible: false,
            animation: 'slide_from_right',
            contentStyle: {backgroundColor: colors.background},
          }}>
          {/* Auth Flow */}
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{headerShown: false}}
          />
          {/* Main App */}
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="UniversityDetail"
            component={PremiumUniversityDetailScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Calculator"
            component={PremiumCalculatorScreen}
            options={{title: 'Merit Calculator'}}
          />
          <Stack.Screen
            name="Compare"
            component={PremiumCompareScreen}
            options={{headerShown: false}}
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
          {/* Admin Screens */}
          <Stack.Screen
            name="AdminDashboard"
            component={AdminDashboardScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AdminUsers"
            component={AdminUsersScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AdminContent"
            component={AdminContentScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AdminReports"
            component={AdminReportsScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AdminAnnouncements"
            component={AdminAnnouncementsScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AdminFeedback"
            component={AdminFeedbackScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AdminAnalytics"
            component={AdminAnalyticsScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AdminSettings"
            component={AdminSettingsScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AdminAuditLogs"
            component={AdminAuditLogsScreen}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
};

export default AppNavigator;

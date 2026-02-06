/**
 * PakUni - React Native App
 * Your gateway to Pakistan's universities
 *
 * @format
 */


import React, {useEffect} from 'react';
import {StatusBar, Linking} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import AppNavigator from './src/navigation/AppNavigator';
import {ThemeProvider, useTheme, AuthProvider} from './src/contexts';
import {GlobalErrorProvider, ToastProvider, OfflineNotice, ConnectionRestoredToast, preloadUniversityLogos} from './src/components';
import {View, Text} from 'react-native';
import {analytics} from './src/services/analytics';
import {supabase} from './src/services/supabase';
import {errorReportingService} from './src/services/errorReporting';
import {offlineSyncService} from './src/services/offlineSync';
import {contributionAutomationService} from './src/services/contributionAutomation';
import {logger} from './src/utils/logger';

// Top 30 university IDs to preload logos for instant display
// These are the most popular universities that users frequently browse
const TOP_UNIVERSITY_IDS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, // Top 10 ranked
  11, 12, 13, 14, 15, 16, 17, 18, 19, 20, // Next 10
  21, 22, 23, 24, 25, 26, 27, 28, 29, 30, // Top 30
];

// Deep linking configuration for OAuth callbacks and shared content
const linking = {
  prefixes: [
    'pakuni://',
    'https://pakuni.app',
    'https://therewjnnidxlddgkaca.supabase.co',
  ],
  config: {
    screens: {
      Auth: 'auth',
      AuthCallback: 'auth/callback',
      MainTabs: {
        screens: {
          Home: 'home',
          Universities: 'universities',
          Scholarships: 'scholarships',
          Profile: 'profile',
        },
      },
      UniversityDetail: 'university/:universityId',
      Calculator: 'calculator',
      // Achievement & Card sharing deep links
      Achievements: 'achievements',
      SharedAchievement: 'achievement/:achievementId',
      SharedCard: 'card/:cardType/:cardId',
      // Feature screens
      Guides: 'guides',
      Tools: 'tools',
      EntryTests: 'entry-tests',
      CareerGuidance: 'career-guidance',
      Compare: 'compare',
    },
  },
};

function AppContent(): React.JSX.Element {
  const {isDark, colors} = useTheme();
  const [showNav, setShowNav] = React.useState(false);

  React.useEffect(() => {
    console.log('[App] AppContent mounted, waiting 500ms for nav...');
    // Delay navigation rendering - gives React time to stabilize
    const delay = setTimeout(() => {
      console.log('[App] Setting showNav = true');
      setShowNav(true);
    }, 500);
    return () => clearTimeout(delay);
  }, []);

  React.useEffect(() => {
    console.log('[App] showNav changed to:', showNav);
  }, [showNav]);

  React.useEffect(() => {
    // Fire and forget  initialization - don't block UI
    Promise.resolve().then(() => {
      analytics.initialize && analytics.initialize();
      analytics.trackEvent && analytics.trackEvent('app_opened');
    }).catch(e => logger.error('Analytics failed', e as Error, 'App'));
  }, []);

  return (
    <GlobalErrorProvider>
      <ToastProvider>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        {showNav && <>
          <OfflineNotice position="top" />
          <ConnectionRestoredToast />
          <AppNavigator linking={linking} />
        </>}
        {!showNav && <View style={{flex: 1, backgroundColor: colors.background}} />}
      </ToastProvider>
    </GlobalErrorProvider>
  );
}

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;

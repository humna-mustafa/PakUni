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
import {GlobalErrorProvider, ToastProvider, OfflineNotice, ConnectionRestoredToast} from './src/components';
import {analytics} from './src/services/analytics';

// Deep linking configuration for OAuth callbacks
const linking = {
  prefixes: ['pakuni://', 'https://pakuni.app'],
  config: {
    screens: {
      Auth: 'auth',
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
    },
  },
};

function AppContent(): React.JSX.Element {
  const {isDark, colors} = useTheme();

  useEffect(() => {
    // Initialize analytics
    analytics.initialize();
    analytics.trackEvent('app_opened');
    
    return () => {
      analytics.endSession();
      analytics.cleanup();
    };
  }, []);

  return (
    <GlobalErrorProvider>
      <ToastProvider>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <OfflineNotice position="top" />
        <ConnectionRestoredToast />
        <AppNavigator linking={linking} />
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

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
import {supabase} from './src/services/supabase';
import {errorReportingService} from './src/services/errorReporting';
import {offlineSyncService} from './src/services/offlineSync';
import {contributionAutomationService} from './src/services/contributionAutomation';
import {logger} from './src/utils/logger';

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

  useEffect(() => {
    // Initialize all services
    const initializeServices = async () => {
      try {
        // Initialize analytics
        analytics.initialize();
        analytics.trackEvent('app_opened');
        
        // Initialize error reporting
        await errorReportingService.initialize();
        
        // Initialize offline sync
        await offlineSyncService.initialize();
        
        // Initialize contribution automation service
        await contributionAutomationService.initialize();
        
        logger.info('All services initialized successfully', undefined, 'App');
      } catch (error) {
        logger.error('Service initialization failed', error as Error, 'App');
      }
    };
    
    initializeServices();
    
    // Handle deep links for OAuth
    const handleDeepLink = async (event: {url: string}) => {
      logger.debug('Received deep link URL', {url: event.url}, 'DeepLink');
      
      // Handle Supabase OAuth callback
      if (event.url.includes('auth/callback') || event.url.includes('auth/v1/callback')) {
        try {
          const url = new URL(event.url);
          const accessToken = url.searchParams.get('access_token') || 
                             url.hash?.match(/access_token=([^&]*)/)?.[1];
          const refreshToken = url.searchParams.get('refresh_token') || 
                              url.hash?.match(/refresh_token=([^&]*)/)?.[1];
          
          if (accessToken && refreshToken) {
            logger.debug('Setting session from OAuth callback', null, 'DeepLink');
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
          }
        } catch (error) {
          logger.error('Error processing OAuth callback', error as Error, 'DeepLink');
          await errorReportingService.reportError(
            error instanceof Error ? error : new Error(String(error)),
            {
              userAction: 'OAuthCallback',
              additionalContext: { severity: 'high' }
            }
          );
        }
      }
    };

    // Listen for deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    // Check for initial URL (app opened via deep link)
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({url});
      }
    });
    
    return () => {
      subscription.remove();
      analytics.endSession();
      analytics.cleanup();
      offlineSyncService.cleanup();
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

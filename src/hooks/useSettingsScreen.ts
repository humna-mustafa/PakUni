/**
 * useSettingsScreen - State, animations, and handlers for SettingsScreen
 */

import {useState, useCallback, useEffect, useRef} from 'react';
import {Alert, Animated, Easing, Linking, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../contexts/ThemeContext';
import {useAuth} from '../contexts/AuthContext';
import {
  NotificationPreferences,
  useNotifications,
} from '../services/notifications';
import {logger} from '../utils/logger';

export const useSettingsScreen = () => {
  const navigation = useNavigation();
  const {colors, isDark, toggleTheme} = useTheme();
  const {user, signOut, deleteAccount} = useAuth();
  const {
    preferences: notificationPrefs,
    updatePreferences,
    clearAll: clearAllNotifications,
  } = useNotifications();

  const [cacheSize, setCacheSize] = useState<string>('Calculating...');
  const [isGoogleLinked, setIsGoogleLinked] = useState<boolean>(false);
  const [isLinkingGoogle, setIsLinkingGoogle] = useState<boolean>(false);

  // Animation refs
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlideAnim = useRef(new Animated.Value(-30)).current;
  const gearRotateAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  // Derived animation values
  const gearRotateZ = gearRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const floatTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  useEffect(() => {
    calculateCacheSize();
    checkGoogleLinkStatus();

    // Header entrance animation
    Animated.parallel([
      Animated.timing(headerFadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(headerSlideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating gear rotation
    Animated.loop(
      Animated.timing(gearRotateAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    // Floating decorations
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const checkGoogleLinkStatus = async () => {
    try {
      const currentUser = await GoogleSignin.getCurrentUser();
      setIsGoogleLinked(!!currentUser || user?.provider === 'google');
    } catch (error) {
      setIsGoogleLinked(user?.provider === 'google');
      logger.debug('Error checking Google status', error, 'Settings');
    }
  };

  const handleLinkGoogleAccount = async () => {
    try {
      setIsLinkingGoogle(true);
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      if (userInfo) {
        setIsGoogleLinked(true);
        Alert.alert(
          'Account Linked',
          `Successfully linked Google account: ${userInfo.data?.user?.email || 'your Google account'}`,
          [{text: 'OK'}],
        );
      }
    } catch (error: any) {
      logger.error('Google link error', error, 'Settings');
      if (error.code === '12501') return;
      Alert.alert(
        'Link Failed',
        error.message || 'Failed to link Google account. Please try again.',
        [{text: 'OK'}],
      );
    } finally {
      setIsLinkingGoogle(false);
    }
  };

  const handleUnlinkGoogleAccount = async () => {
    Alert.alert(
      'Unlink Google Account',
      'Are you sure you want to unlink your Google account? You can link it again later.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Unlink',
          style: 'destructive',
          onPress: async () => {
            try {
              await GoogleSignin.signOut();
              setIsGoogleLinked(false);
              Alert.alert('Success', 'Google account unlinked successfully');
            } catch (error: any) {
              logger.error('Unlink error', error, 'Settings');
              Alert.alert('Error', 'Failed to unlink Google account');
            }
          },
        },
      ],
    );
  };

  const calculateCacheSize = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(k => k.startsWith('cache_'));
      setCacheSize(`${cacheKeys.length} items`);
    } catch {
      setCacheSize('Unknown');
    }
  };

  const handleToggleNotification = async (
    key: keyof NotificationPreferences,
    value: boolean,
  ) => {
    await updatePreferences({[key]: value});
  };

  const handleClearCache = useCallback(async () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. The app may load slower until data is cached again.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              const keys = await AsyncStorage.getAllKeys();
              const cacheKeys = keys.filter(k => k.startsWith('cache_'));
              await AsyncStorage.multiRemove(cacheKeys);
              setCacheSize('0 items');
              Alert.alert('Success', 'Cache cleared successfully');
            } catch {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ],
    );
  }, []);

  const handleClearNotifications = useCallback(async () => {
    Alert.alert(
      'Clear All Notifications',
      'This will delete all your notifications. This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearAllNotifications();
            Alert.alert('Success', 'All notifications cleared');
          },
        },
      ],
    );
  }, []);

  const handleSignOut = useCallback(() => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => signOut(),
      },
    ]);
  }, [signOut]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteAccount();
          },
        },
      ],
    );
  }, [deleteAccount]);

  const handleRateApp = () => {
    const storeUrl = Platform.select({
      ios: 'https://apps.apple.com/app/pakuni',
      android: 'https://play.google.com/store/apps/details?id=com.pakuni',
    });
    if (storeUrl) {
      Linking.openURL(storeUrl).catch(() => {
        Alert.alert('Error', 'Could not open the app store');
      });
    }
  };

  const handleShareApp = async () => {
    const {shareApp} = await import('../services/share');
    shareApp();
  };

  return {
    // Navigation
    navigation,
    // Theme
    colors,
    isDark,
    toggleTheme,
    // Auth
    user,
    // State
    cacheSize,
    isGoogleLinked,
    isLinkingGoogle,
    notificationPrefs,
    // Animations
    headerFadeAnim,
    headerSlideAnim,
    gearRotateZ,
    floatTranslateY,
    // Handlers
    handleLinkGoogleAccount,
    handleUnlinkGoogleAccount,
    handleToggleNotification,
    handleClearCache,
    handleClearNotifications,
    handleSignOut,
    handleDeleteAccount,
    handleRateApp,
    handleShareApp,
  };
};

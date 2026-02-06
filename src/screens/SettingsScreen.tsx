/**
 * SettingsScreen - App settings and preferences
 * Enhanced with premium animations and polished UI
 */

import React, {useState, useCallback, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
  Platform,
  Alert,
  Linking,
  Animated,
  Easing,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GoogleSignin,
} from '@react-native-google-signin/google-signin';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '../components/icons';
import {logger} from '../utils/logger';
import {useTheme} from '../contexts/ThemeContext';
import {useAuth} from '../contexts/AuthContext';
import {SPACING, FONTS} from '../constants/theme';

// Semantic color constants - mapped from theme at render time
const SEMANTIC_COLORS = {
  favorites: '#EF4444',    // Red - hearts/favorites
  notification: '#F59E0B', // Amber - alerts
  success: '#10B981',      // Green - success/linked
  info: '#4573DF',         // Blue - primary info
  danger: '#EF4444',       // Red - destructive
  cache: '#06B6D4',        // Cyan - storage
  google: '#4285F4',       // Google brand
  tertiary: '#14B8A6',     // Teal - tertiary actions
} as const;
import {
  NotificationPreferences,
  notificationService,
  useNotifications,
} from '../services/notifications';

// ============================================================================
// TYPES
// ============================================================================

interface SettingItemProps {
  icon: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
  colors: any;
  showArrow?: boolean;
  destructive?: boolean;
  index?: number;
  disabled?: boolean;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  colors: any;
  index?: number;
}

// ============================================================================
// SETTING ITEM COMPONENT - With Entrance Animation
// ============================================================================

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  iconColor,
  title,
  subtitle,
  onPress,
  rightComponent,
  colors,
  showArrow = true,
  destructive = false,
  index = 0,
  disabled = false,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const delay = index * 30;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, disabled ? 0.5 : 1],
        }),
        transform: [{translateX: slideAnim}, {scale: scaleAnim}],
      }}>
      <TouchableOpacity
        style={[styles.settingItem, {backgroundColor: colors.card}]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!onPress}
        activeOpacity={onPress ? 0.7 : 1}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityHint={subtitle}
        accessibilityState={{disabled: disabled || !onPress}}>
        <View style={[styles.settingIcon, {backgroundColor: `${iconColor}15`}]}>
          <Icon name={icon} family="Ionicons" size={20} color={iconColor} />
        </View>
        <View style={styles.settingContent}>
          <Text
            style={[
              styles.settingTitle,
              {color: destructive ? colors.error : colors.text},
            ]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, {color: colors.textSecondary}]}>
              {subtitle}
            </Text>
          )}
        </View>
        {rightComponent}
        {showArrow && onPress && !rightComponent && (
          <Icon
            name="chevron-forward"
            family="Ionicons"
            size={20}
            color={colors.textSecondary}
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ============================================================================
// SECTION COMPONENT - With Entrance Animation
// ============================================================================

const Section: React.FC<SectionProps> = ({title, children, colors, index = 0}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const delay = index * 80;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  return (
    <Animated.View 
      style={[
        styles.section,
        {
          opacity: fadeAnim,
          transform: [{translateY: slideAnim}],
        },
      ]}>
      <Text style={[styles.sectionTitle, {color: colors.textSecondary}]}>
        {title}
      </Text>
      <View style={[styles.sectionContent, {backgroundColor: colors.card}]}>
        {children}
      </View>
    </Animated.View>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors, isDark, toggleTheme} = useTheme();
  const {user, signOut, deleteAccount} = useAuth();
  const {preferences: notificationPrefs, updatePreferences, clearAll: clearAllNotifications} = useNotifications();
  const [cacheSize, setCacheSize] = useState<string>('Calculating...');
  const [isGoogleLinked, setIsGoogleLinked] = useState<boolean>(false);
  const [isLinkingGoogle, setIsLinkingGoogle] = useState<boolean>(false);

  // Animation refs
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlideAnim = useRef(new Animated.Value(-30)).current;
  const gearRotateAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

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
      })
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
      ])
    ).start();
  }, []);

  const gearRotateZ = gearRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const floatTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const checkGoogleLinkStatus = async () => {
    try {
      // Check if user signed in with Google or has Google linked
      // Note: isSignedIn() was removed in newer versions - check provider instead
      const currentUser = await GoogleSignin.getCurrentUser();
      setIsGoogleLinked(!!currentUser || user?.provider === 'google');
    } catch (error) {
      // If error, just check provider
      setIsGoogleLinked(user?.provider === 'google');
      logger.debug('Error checking Google status', error, 'Settings');
    }
  };

  const handleLinkGoogleAccount = async () => {
    try {
      setIsLinkingGoogle(true);
      
      // Check if Google Play Services are available
      await GoogleSignin.hasPlayServices();
      
      // Sign in with Google
      const userInfo = await GoogleSignin.signIn();
      
      if (userInfo) {
        setIsGoogleLinked(true);
        Alert.alert(
          'Account Linked',
          `Successfully linked Google account: ${userInfo.data?.user?.email || 'your Google account'}`,
          [{text: 'OK'}]
        );
      }
    } catch (error: any) {
      logger.error('Google link error', error, 'Settings');
      
      if (error.code === '12501') {
        // User cancelled
        return;
      }
      
      Alert.alert(
        'Link Failed',
        error.message || 'Failed to link Google account. Please try again.',
        [{text: 'OK'}]
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
      ]
    );
  };

  useEffect(() => {
    calculateCacheSize();
  }, []);

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
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ],
    );
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
            const success = await deleteAccount();
            if (success) {
              // Navigation will be handled by auth state change
            }
          },
        },
      ],
    );
  }, [deleteAccount]);

  const handleRateApp = () => {
    // Open app store for rating
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
    // Use share service
    const {shareApp} = await import('../services/share');
    shareApp();
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Floating Decorative Elements */}
        <Animated.View
          style={[
            styles.floatingGear1,
            {
              transform: [{rotate: gearRotateZ}, {translateY: floatTranslateY}],
              opacity: 0.08,
            },
          ]}>
          <Icon name="settings" family="Ionicons" size={60} color={colors.primary} />
        </Animated.View>
        <Animated.View
          style={[
            styles.floatingGear2,
            {
              transform: [{rotate: gearRotateZ}],
              opacity: 0.05,
            },
          ]}>
          <Icon name="cog" family="Ionicons" size={40} color={colors.primary} />
        </Animated.View>

        {/* Header with Animation */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerFadeAnim,
              transform: [{translateY: headerSlideAnim}],
            },
          ]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityHint="Navigate to previous screen">
            <Icon name="arrow-back" family="Ionicons" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Animated.View style={[styles.headerIcon, {transform: [{translateY: floatTranslateY}]}]}>
              <LinearGradient
                colors={[colors.primary, colors.secondary || '#6366F1']}
                style={styles.headerIconGradient}>
                <Icon name="settings-outline" family="Ionicons" size={18} color="#FFFFFF" />
              </LinearGradient>
            </Animated.View>
            <Text style={[styles.headerTitle, {color: colors.text}]}>Settings</Text>
          </View>
          <View style={styles.headerSpacer} />
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* My Account - Favorites & Notifications */}
          <Section title="MY ACCOUNT" colors={colors} index={0}>
            <SettingItem
              icon="heart-outline"
              iconColor="#EF4444"
              title="My Favorites"
              subtitle="Saved universities, scholarships & programs"
              colors={colors}
              onPress={() => navigation.navigate('Favorites' as never)}
              index={0}
            />
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            <SettingItem
              icon="notifications-outline"
              iconColor="#4573DF"
              title="Notifications"
              subtitle="View all your alerts & updates"
              colors={colors}
              onPress={() => navigation.navigate('Notifications' as never)}
              index={1}
            />
          </Section>

          {/* Linked Accounts */}
          <Section title="LINKED ACCOUNTS" colors={colors} index={1}>
            <SettingItem
              icon="logo-google"
              iconColor="#4285F4"
              title="Google Account"
              subtitle={isGoogleLinked 
                ? `Connected${user?.provider === 'google' ? ' (Primary)' : ''}` 
                : 'Not connected'}
              colors={colors}
              onPress={isGoogleLinked ? handleUnlinkGoogleAccount : handleLinkGoogleAccount}
              index={2}
              rightComponent={
                isLinkingGoogle ? (
                  <View style={styles.loadingIndicator}>
                    <Text style={{color: colors.textSecondary, fontSize: 12}}>Linking...</Text>
                  </View>
                ) : (
                  <View style={[
                    styles.linkBadge, 
                    {backgroundColor: isGoogleLinked ? '#D1FAE5' : colors.primaryLight}
                  ]}>
                    <Text style={[
                      styles.linkBadgeText, 
                      {color: isGoogleLinked ? '#059669' : colors.primary}
                    ]}>
                      {isGoogleLinked ? 'Linked' : 'Link'}
                    </Text>
                  </View>
                )
              }
            />
            {!isGoogleLinked && (
              <View style={[styles.helpText, {backgroundColor: colors.background}]}>
                <Icon name="information-circle-outline" family="Ionicons" size={14} color={colors.textSecondary} />
                <Text style={[styles.helpTextContent, {color: colors.textSecondary}]}>
                  Link your Google account for faster sign-in and backup
                </Text>
              </View>
            )}
          </Section>

          {/* Appearance */}
          <Section title="APPEARANCE" colors={colors} index={2}>
            <SettingItem
              icon="moon-outline"
              iconColor="#4573DF"
              title="Dark Mode"
              subtitle={isDark ? 'On' : 'Off'}
              colors={colors}
              showArrow={false}
              index={3}
              rightComponent={
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{false: colors.border, true: colors.primaryLight}}
                  thumbColor={isDark ? colors.primary : '#FFFFFF'}
                />
              }
            />
          </Section>

          {/* Notifications */}
          <Section title="NOTIFICATIONS" colors={colors} index={3}>
            <SettingItem
              icon="notifications-outline"
              iconColor="#F59E0B"
              title="Push Notifications"
              subtitle={notificationPrefs.enabled ? 'Enabled' : 'Disabled'}
              colors={colors}
              showArrow={false}
              index={4}
              rightComponent={
                <Switch
                  value={notificationPrefs.enabled}
                  onValueChange={(v) => handleToggleNotification('enabled', v)}
                  trackColor={{false: colors.border, true: colors.primaryLight}}
                  thumbColor={notificationPrefs.enabled ? colors.primary : '#FFFFFF'}
                />
              }
            />
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            
            <SettingItem
              icon="school-outline"
              iconColor={notificationPrefs.enabled ? "#10B981" : colors.textSecondary}
              title="Scholarship Alerts"
              colors={colors}
              showArrow={false}
              index={5}
              disabled={!notificationPrefs.enabled}
              rightComponent={
                <Switch
                  value={notificationPrefs.enabled && notificationPrefs.scholarships}
                  onValueChange={(v) => handleToggleNotification('scholarships', v)}
                  trackColor={{false: colors.border, true: colors.primaryLight}}
                  thumbColor={notificationPrefs.enabled && notificationPrefs.scholarships ? colors.primary : '#FFFFFF'}
                  disabled={!notificationPrefs.enabled}
                />
              }
            />
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            
            <SettingItem
              icon="calendar-outline"
              iconColor={notificationPrefs.enabled ? "#EF4444" : colors.textSecondary}
              title="Admission Deadlines"
              colors={colors}
              showArrow={false}
              index={6}
              disabled={!notificationPrefs.enabled}
              rightComponent={
                <Switch
                  value={notificationPrefs.enabled && notificationPrefs.admissions}
                  onValueChange={(v) => handleToggleNotification('admissions', v)}
                  trackColor={{false: colors.border, true: colors.primaryLight}}
                  thumbColor={notificationPrefs.enabled && notificationPrefs.admissions ? colors.primary : '#FFFFFF'}
                  disabled={!notificationPrefs.enabled}
                />
              }
            />
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            
            <SettingItem
              icon="document-text-outline"
              iconColor={notificationPrefs.enabled ? "#4573DF" : colors.textSecondary}
              title="Test Date Reminders"
              colors={colors}
              showArrow={false}
              index={7}
              disabled={!notificationPrefs.enabled}
              rightComponent={
                <Switch
                  value={notificationPrefs.enabled && notificationPrefs.entryTests}
                  onValueChange={(v) => handleToggleNotification('entryTests', v)}
                  trackColor={{false: colors.border, true: colors.primaryLight}}
                  thumbColor={notificationPrefs.enabled && notificationPrefs.entryTests ? colors.primary : '#FFFFFF'}
                  disabled={!notificationPrefs.enabled}
                />
              }
            />
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            
            <SettingItem
              icon="bulb-outline"
              iconColor={notificationPrefs.enabled ? "#F97316" : colors.textSecondary}
              title="Daily Tips"
              colors={colors}
              showArrow={false}
              index={8}
              disabled={!notificationPrefs.enabled}
              rightComponent={
                <Switch
                  value={notificationPrefs.enabled && notificationPrefs.tips}
                  onValueChange={(v) => handleToggleNotification('tips', v)}
                  trackColor={{false: colors.border, true: colors.primaryLight}}
                  thumbColor={notificationPrefs.enabled && notificationPrefs.tips ? colors.primary : '#FFFFFF'}
                  disabled={!notificationPrefs.enabled}
                />
              }
            />
          </Section>

          {/* Data & Storage */}
          <Section title="DATA & STORAGE" colors={colors} index={4}>
            <SettingItem
              icon="folder-outline"
              iconColor="#06B6D4"
              title="Cache"
              subtitle={cacheSize}
              colors={colors}
              onPress={handleClearCache}
              index={9}
            />
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            <SettingItem
              icon="trash-outline"
              iconColor="#EF4444"
              title="Clear Notifications"
              colors={colors}
              onPress={handleClearNotifications}
              index={10}
            />
          </Section>

          {/* Help & Support - Prominent Section */}
          <Section title="HELP & SUPPORT" colors={colors} index={5}>
            <SettingItem
              icon="chatbubbles-outline"
              iconColor="#4573DF"
              title="Contact & Support Center"
              subtitle="Report issues, suggest features, share resources"
              colors={colors}
              onPress={() => navigation.navigate('ContactSupport' as never)}
              index={11}
            />
          </Section>

          {/* Support */}
          <Section title="MORE" colors={colors} index={6}>
            <SettingItem
              icon="star-outline"
              iconColor="#F59E0B"
              title="Rate App"
              subtitle="Help us improve"
              colors={colors}
              onPress={handleRateApp}
              index={15}
            />
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            <SettingItem
              icon="share-social-outline"
              iconColor="#10B981"
              title="Share App"
              subtitle="Tell your friends"
              colors={colors}
              onPress={handleShareApp}
              index={16}
            />
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            <SettingItem
              icon="help-circle-outline"
              iconColor="#4573DF"
              title="Help & FAQ"
              colors={colors}
              onPress={() => navigation.navigate('FAQ' as never)}
              index={17}
            />
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            <SettingItem
              icon="document-outline"
              iconColor="#4573DF"
              title="Privacy Policy"
              colors={colors}
              onPress={() => navigation.navigate('PrivacyPolicy' as never)}
              index={18}
            />
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            <SettingItem
              icon="shield-checkmark-outline"
              iconColor="#14B8A6"
              title="Terms of Service"
              colors={colors}
              onPress={() => navigation.navigate('TermsOfService' as never)}
              index={19}
            />
          </Section>

          {/* Account */}
          {user && !user.isGuest && (
            <Section title="ACCOUNT" colors={colors} index={7}>
              <SettingItem
                icon="log-out-outline"
                iconColor="#F59E0B"
                title="Sign Out"
                colors={colors}
                onPress={handleSignOut}
                index={20}
              />
              <View style={[styles.divider, {backgroundColor: colors.border}]} />
              <SettingItem
                icon="person-remove-outline"
                iconColor="#EF4444"
                title="Delete Account"
                colors={colors}
                onPress={handleDeleteAccount}
                destructive
                index={21}
              />
            </Section>
          )}

          {/* Version - Enhanced with animation */}
          <Animated.View 
            style={[
              styles.versionContainer,
              {
                opacity: headerFadeAnim,
              },
            ]}>
            <LinearGradient
              colors={[`${colors.primary}10`, 'transparent']}
              style={styles.versionGradient}>
              <Text style={[styles.versionText, {color: colors.textSecondary}]}>
                PakUni v1.0.0
              </Text>
              <View style={styles.madeWithRow}>
                <Text style={[styles.copyrightText, {color: colors.textSecondary}]}>Made with</Text>
                <Animated.View style={{transform: [{scale: floatAnim.interpolate({inputRange: [0, 1], outputRange: [1, 1.2]})}]}}>
                  <Icon name="heart" family="Ionicons" size={14} color="#EF4444" />
                </Animated.View>
                <Text style={[styles.copyrightText, {color: colors.textSecondary}]}>in Pakistan</Text>
              </View>
            </LinearGradient>
          </Animated.View>
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
  // Floating decorations
  floatingGear1: {
    position: 'absolute',
    top: 80,
    right: -20,
    zIndex: 0,
  },
  floatingGear2: {
    position: 'absolute',
    top: 200,
    left: -15,
    zIndex: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    zIndex: 1,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerIcon: {
    marginRight: 4,
  },
  headerIconGradient: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    width: 44, // Minimum touch target (WCAG 2.1)
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: FONTS.weight.semiBold,
  },
  headerSpacer: {
    width: 36,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: FONTS.weight.semiBold,
    letterSpacing: 0.8,
    marginLeft: SPACING.lg, // Use spacing constants
    marginBottom: SPACING.xs,
  },
  sectionContent: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: FONTS.weight.medium,
  },
  settingSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 58,
  },
  linkBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  linkBadgeText: {
    fontSize: 12,
    fontWeight: FONTS.weight.semiBold,
  },
  loadingIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  helpText: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
  },
  helpTextContent: {
    flex: 1,
    fontSize: 12,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 12,
    marginHorizontal: 16,
  },
  versionGradient: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 24,
    borderRadius: 16,
  },
  madeWithRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  versionText: {
    fontSize: 13,
    fontWeight: FONTS.weight.medium,
    marginBottom: SPACING.sm,
  },
  copyrightText: {
    fontSize: 11,
  },
});

export default SettingsScreen;



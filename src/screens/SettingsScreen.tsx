/**
 * SettingsScreen - App settings and preferences
 */

import React, {useState, useCallback, useEffect} from 'react';
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
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GoogleSignin,
} from '@react-native-google-signin/google-signin';
import {Icon} from '../components/icons';
import {useTheme} from '../contexts/ThemeContext';
import {useAuth} from '../contexts/AuthContext';
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
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  colors: any;
}

// ============================================================================
// SETTING ITEM COMPONENT
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
}) => (
  <TouchableOpacity
    style={[styles.settingItem, {backgroundColor: colors.card}]}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.7 : 1}>
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
);

// ============================================================================
// SECTION COMPONENT
// ============================================================================

const Section: React.FC<SectionProps> = ({title, children, colors}) => (
  <View style={styles.section}>
    <Text style={[styles.sectionTitle, {color: colors.textSecondary}]}>
      {title}
    </Text>
    <View style={[styles.sectionContent, {backgroundColor: colors.card}]}>
      {children}
    </View>
  </View>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors, isDark, toggleTheme} = useTheme();
  const {user, signOut} = useAuth();
  const {preferences: notificationPrefs, updatePreferences, clearAll: clearAllNotifications} = useNotifications();
  const [cacheSize, setCacheSize] = useState<string>('Calculating...');
  const [isGoogleLinked, setIsGoogleLinked] = useState<boolean>(false);
  const [isLinkingGoogle, setIsLinkingGoogle] = useState<boolean>(false);

  useEffect(() => {
    calculateCacheSize();
    checkGoogleLinkStatus();
  }, []);

  const checkGoogleLinkStatus = async () => {
    try {
      // Check if user signed in with Google or has Google linked
      const isSignedIn = await GoogleSignin.isSignedIn();
      setIsGoogleLinked(isSignedIn || user?.provider === 'google');
    } catch (error) {
      console.log('Error checking Google status:', error);
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
      console.error('Google link error:', error);
      
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
              console.error('Unlink error:', error);
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
          onPress: () => {
            // In production, implement actual account deletion
            Alert.alert('Contact Support', 'Please contact support@pakuni.app to delete your account.');
          },
        },
      ],
    );
  }, []);

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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" family="Ionicons" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, {color: colors.text}]}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* My Account - Favorites & Notifications */}
          <Section title="MY ACCOUNT" colors={colors}>
            <SettingItem
              icon="heart-outline"
              iconColor="#EF4444"
              title="My Favorites"
              subtitle="Saved universities, scholarships & programs"
              colors={colors}
              onPress={() => navigation.navigate('Favorites' as never)}
            />
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            <SettingItem
              icon="notifications-outline"
              iconColor="#3B82F6"
              title="Notifications"
              subtitle="View all your alerts & updates"
              colors={colors}
              onPress={() => navigation.navigate('Notifications' as never)}
            />
          </Section>

          {/* Linked Accounts */}
          <Section title="LINKED ACCOUNTS" colors={colors}>
            <SettingItem
              icon="logo-google"
              iconColor="#4285F4"
              title="Google Account"
              subtitle={isGoogleLinked 
                ? `Connected${user?.provider === 'google' ? ' (Primary)' : ''}` 
                : 'Not connected'}
              colors={colors}
              onPress={isGoogleLinked ? handleUnlinkGoogleAccount : handleLinkGoogleAccount}
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
          <Section title="APPEARANCE" colors={colors}>
            <SettingItem
              icon="moon-outline"
              iconColor="#6366F1"
              title="Dark Mode"
              subtitle={isDark ? 'On' : 'Off'}
              colors={colors}
              showArrow={false}
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
          <Section title="NOTIFICATIONS" colors={colors}>
            <SettingItem
              icon="notifications-outline"
              iconColor="#F59E0B"
              title="Push Notifications"
              subtitle={notificationPrefs.enabled ? 'Enabled' : 'Disabled'}
              colors={colors}
              showArrow={false}
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
              iconColor="#10B981"
              title="Scholarship Alerts"
              colors={colors}
              showArrow={false}
              rightComponent={
                <Switch
                  value={notificationPrefs.scholarships}
                  onValueChange={(v) => handleToggleNotification('scholarships', v)}
                  trackColor={{false: colors.border, true: colors.primaryLight}}
                  thumbColor={notificationPrefs.scholarships ? colors.primary : '#FFFFFF'}
                  disabled={!notificationPrefs.enabled}
                />
              }
            />
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            
            <SettingItem
              icon="calendar-outline"
              iconColor="#EF4444"
              title="Admission Deadlines"
              colors={colors}
              showArrow={false}
              rightComponent={
                <Switch
                  value={notificationPrefs.admissions}
                  onValueChange={(v) => handleToggleNotification('admissions', v)}
                  trackColor={{false: colors.border, true: colors.primaryLight}}
                  thumbColor={notificationPrefs.admissions ? colors.primary : '#FFFFFF'}
                  disabled={!notificationPrefs.enabled}
                />
              }
            />
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            
            <SettingItem
              icon="document-text-outline"
              iconColor="#8B5CF6"
              title="Test Date Reminders"
              colors={colors}
              showArrow={false}
              rightComponent={
                <Switch
                  value={notificationPrefs.entryTests}
                  onValueChange={(v) => handleToggleNotification('entryTests', v)}
                  trackColor={{false: colors.border, true: colors.primaryLight}}
                  thumbColor={notificationPrefs.entryTests ? colors.primary : '#FFFFFF'}
                  disabled={!notificationPrefs.enabled}
                />
              }
            />
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            
            <SettingItem
              icon="bulb-outline"
              iconColor="#F97316"
              title="Daily Tips"
              colors={colors}
              showArrow={false}
              rightComponent={
                <Switch
                  value={notificationPrefs.tips}
                  onValueChange={(v) => handleToggleNotification('tips', v)}
                  trackColor={{false: colors.border, true: colors.primaryLight}}
                  thumbColor={notificationPrefs.tips ? colors.primary : '#FFFFFF'}
                  disabled={!notificationPrefs.enabled}
                />
              }
            />
          </Section>

          {/* Data & Storage */}
          <Section title="DATA & STORAGE" colors={colors}>
            <SettingItem
              icon="folder-outline"
              iconColor="#06B6D4"
              title="Cache"
              subtitle={cacheSize}
              colors={colors}
              onPress={handleClearCache}
            />
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            <SettingItem
              icon="trash-outline"
              iconColor="#EF4444"
              title="Clear Notifications"
              colors={colors}
              onPress={handleClearNotifications}
            />
          </Section>

          {/* Help & Support - Prominent Section */}
          <Section title="HELP & SUPPORT" colors={colors}>
            <SettingItem
              icon="chatbubbles-outline"
              iconColor="#1A7AEB"
              title="Contact & Support Center"
              subtitle="Report issues, suggest features, share resources"
              colors={colors}
              onPress={() => navigation.navigate('ContactSupport' as never)}
            />
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            <SettingItem
              icon="bug-outline"
              iconColor="#EF4444"
              title="Report an Issue"
              subtitle="Found a bug? Let us know"
              colors={colors}
              onPress={() => navigation.navigate('ContactSupport' as never)}
            />
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            <SettingItem
              icon="bulb-outline"
              iconColor="#F59E0B"
              title="Suggest a Feature"
              subtitle="Help us improve the app"
              colors={colors}
              onPress={() => navigation.navigate('ContactSupport' as never)}
            />
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            <SettingItem
              icon="document-attach-outline"
              iconColor="#10B981"
              title="Submit Resources"
              subtitle="Share merit lists, past papers & more"
              colors={colors}
              onPress={() => navigation.navigate('ContactSupport' as never)}
            />
          </Section>

          {/* Support */}
          <Section title="MORE" colors={colors}>
            <SettingItem
              icon="star-outline"
              iconColor="#F59E0B"
              title="Rate App"
              subtitle="Help us improve"
              colors={colors}
              onPress={handleRateApp}
            />
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            <SettingItem
              icon="share-social-outline"
              iconColor="#10B981"
              title="Share App"
              subtitle="Tell your friends"
              colors={colors}
              onPress={handleShareApp}
            />
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            <SettingItem
              icon="help-circle-outline"
              iconColor="#6366F1"
              title="Help & FAQ"
              colors={colors}
              onPress={() => navigation.navigate('Guides' as never)}
            />
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            <SettingItem
              icon="document-outline"
              iconColor="#8B5CF6"
              title="Privacy Policy"
              colors={colors}
              onPress={() => navigation.navigate('PrivacyPolicy' as never)}
            />
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            <SettingItem
              icon="shield-checkmark-outline"
              iconColor="#14B8A6"
              title="Terms of Service"
              colors={colors}
              onPress={() => navigation.navigate('TermsOfService' as never)}
            />
          </Section>

          {/* Account */}
          {user && !user.isGuest && (
            <Section title="ACCOUNT" colors={colors}>
              <SettingItem
                icon="log-out-outline"
                iconColor="#F59E0B"
                title="Sign Out"
                colors={colors}
                onPress={handleSignOut}
              />
              <View style={[styles.divider, {backgroundColor: colors.border}]} />
              <SettingItem
                icon="person-remove-outline"
                iconColor="#EF4444"
                title="Delete Account"
                colors={colors}
                onPress={handleDeleteAccount}
                destructive
              />
            </Section>
          )}

          {/* Version */}
          <View style={styles.versionContainer}>
            <Text style={[styles.versionText, {color: colors.textSecondary}]}>
              PakUni v1.0.0
            </Text>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
              <Text style={[styles.copyrightText, {color: colors.textSecondary}]}>Made with</Text>
              <Icon name="heart" family="Ionicons" size={14} color="#EF4444" />
              <Text style={[styles.copyrightText, {color: colors.textSecondary}]}>in Pakistan</Text>
            </View>
          </View>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
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
    fontWeight: '600',
    letterSpacing: 0.8,
    marginLeft: 32,
    marginBottom: 6,
  },
  sectionContent: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.03,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
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
    fontWeight: '500',
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
    fontWeight: '600',
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
    paddingVertical: 20,
    marginTop: 12,
  },
  versionText: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 11,
  },
});

export default SettingsScreen;

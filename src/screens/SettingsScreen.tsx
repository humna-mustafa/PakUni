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
            <Text style={[styles.copyrightText, {color: colors.textSecondary}]}>
              Made with ❤️ in Pakistan
            </Text>
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
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginLeft: 32,
    marginBottom: 8,
  },
  sectionContent: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
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
    padding: 16,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 66,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginTop: 16,
  },
  versionText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
  },
});

export default SettingsScreen;

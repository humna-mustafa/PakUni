/**
 * SettingsScreen - App settings and preferences
 * Thin composition using extracted components and hook
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
  Animated,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '../components/icons';
import {SettingItem, SettingsSection} from '../components/settings';
import {useSettingsScreen} from '../hooks/useSettingsScreen';
import {FONTS} from '../constants/theme';

const SettingsScreen: React.FC = () => {
  const {
    navigation,
    colors,
    isDark,
    toggleTheme,
    user,
    cacheSize,
    isGoogleLinked,
    isLinkingGoogle,
    notificationPrefs,
    headerFadeAnim,
    headerSlideAnim,
    gearRotateZ,
    floatTranslateY,
    handleLinkGoogleAccount,
    handleUnlinkGoogleAccount,
    handleToggleNotification,
    handleClearCache,
    handleClearNotifications,
    handleSignOut,
    handleDeleteAccount,
    handleRateApp,
    handleShareApp,
  } = useSettingsScreen();

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Floating Decorative Gears */}
        <Animated.View
          style={[
            styles.floatingGear1,
            {transform: [{rotate: gearRotateZ}, {translateY: floatTranslateY}], opacity: 0.08},
          ]}>
          <Icon name="settings" family="Ionicons" size={60} color={colors.primary} />
        </Animated.View>
        <Animated.View
          style={[styles.floatingGear2, {transform: [{rotate: gearRotateZ}], opacity: 0.05}]}>
          <Icon name="cog" family="Ionicons" size={40} color={colors.primary} />
        </Animated.View>

        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {opacity: headerFadeAnim, transform: [{translateY: headerSlideAnim}]},
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

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* My Account */}
          <SettingsSection title="MY ACCOUNT" colors={colors} index={0}>
            <SettingItem
              icon="heart-outline" iconColor="#EF4444"
              title="My Favorites" subtitle="Saved universities, scholarships & programs"
              colors={colors} onPress={() => navigation.navigate('Favorites' as never)} index={0}
            />
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            <SettingItem
              icon="notifications-outline" iconColor="#4573DF"
              title="Notifications" subtitle="View all your alerts & updates"
              colors={colors} onPress={() => navigation.navigate('Notifications' as never)} index={1}
            />
          </SettingsSection>

          {/* Linked Accounts */}
          <SettingsSection title="LINKED ACCOUNTS" colors={colors} index={1}>
            <SettingItem
              icon="logo-google" iconColor="#4285F4"
              title="Google Account"
              subtitle={isGoogleLinked ? `Connected${user?.provider === 'google' ? ' (Primary)' : ''}` : 'Not connected'}
              colors={colors}
              onPress={isGoogleLinked ? handleUnlinkGoogleAccount : handleLinkGoogleAccount}
              index={2}
              rightComponent={
                isLinkingGoogle ? (
                  <View style={styles.loadingIndicator}>
                    <Text style={{color: colors.textSecondary, fontSize: 12}}>Linking...</Text>
                  </View>
                ) : (
                  <View style={[styles.linkBadge, {backgroundColor: isGoogleLinked ? '#D1FAE5' : colors.primaryLight}]}>
                    <Text style={[styles.linkBadgeText, {color: isGoogleLinked ? '#059669' : colors.primary}]}>
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
          </SettingsSection>

          {/* Appearance */}
          <SettingsSection title="APPEARANCE" colors={colors} index={2}>
            <SettingItem
              icon="moon-outline" iconColor="#4573DF"
              title="Dark Mode" subtitle={isDark ? 'On' : 'Off'}
              colors={colors} showArrow={false} index={3}
              rightComponent={
                <Switch value={isDark} onValueChange={toggleTheme}
                  trackColor={{false: colors.border, true: colors.primaryLight}}
                  thumbColor={isDark ? colors.primary : '#FFFFFF'} />
              }
            />
          </SettingsSection>

          {/* Notifications */}
          <SettingsSection title="NOTIFICATIONS" colors={colors} index={3}>
            <SettingItem
              icon="notifications-outline" iconColor="#F59E0B"
              title="Push Notifications" subtitle={notificationPrefs.enabled ? 'Enabled' : 'Disabled'}
              colors={colors} showArrow={false} index={4}
              rightComponent={
                <Switch value={notificationPrefs.enabled}
                  onValueChange={(v) => handleToggleNotification('enabled', v)}
                  trackColor={{false: colors.border, true: colors.primaryLight}}
                  thumbColor={notificationPrefs.enabled ? colors.primary : '#FFFFFF'} />
              }
            />
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            <SettingItem
              icon="school-outline" iconColor={notificationPrefs.enabled ? '#10B981' : colors.textSecondary}
              title="Scholarship Alerts" colors={colors} showArrow={false} index={5}
              disabled={!notificationPrefs.enabled}
              rightComponent={
                <Switch value={notificationPrefs.enabled && notificationPrefs.scholarships}
                  onValueChange={(v) => handleToggleNotification('scholarships', v)}
                  trackColor={{false: colors.border, true: colors.primaryLight}}
                  thumbColor={notificationPrefs.enabled && notificationPrefs.scholarships ? colors.primary : '#FFFFFF'}
                  disabled={!notificationPrefs.enabled} />
              }
            />
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            <SettingItem
              icon="calendar-outline" iconColor={notificationPrefs.enabled ? '#EF4444' : colors.textSecondary}
              title="Admission Deadlines" colors={colors} showArrow={false} index={6}
              disabled={!notificationPrefs.enabled}
              rightComponent={
                <Switch value={notificationPrefs.enabled && notificationPrefs.admissions}
                  onValueChange={(v) => handleToggleNotification('admissions', v)}
                  trackColor={{false: colors.border, true: colors.primaryLight}}
                  thumbColor={notificationPrefs.enabled && notificationPrefs.admissions ? colors.primary : '#FFFFFF'}
                  disabled={!notificationPrefs.enabled} />
              }
            />
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            <SettingItem
              icon="document-text-outline" iconColor={notificationPrefs.enabled ? '#4573DF' : colors.textSecondary}
              title="Test Date Reminders" colors={colors} showArrow={false} index={7}
              disabled={!notificationPrefs.enabled}
              rightComponent={
                <Switch value={notificationPrefs.enabled && notificationPrefs.entryTests}
                  onValueChange={(v) => handleToggleNotification('entryTests', v)}
                  trackColor={{false: colors.border, true: colors.primaryLight}}
                  thumbColor={notificationPrefs.enabled && notificationPrefs.entryTests ? colors.primary : '#FFFFFF'}
                  disabled={!notificationPrefs.enabled} />
              }
            />
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            <SettingItem
              icon="bulb-outline" iconColor={notificationPrefs.enabled ? '#F97316' : colors.textSecondary}
              title="Daily Tips" colors={colors} showArrow={false} index={8}
              disabled={!notificationPrefs.enabled}
              rightComponent={
                <Switch value={notificationPrefs.enabled && notificationPrefs.tips}
                  onValueChange={(v) => handleToggleNotification('tips', v)}
                  trackColor={{false: colors.border, true: colors.primaryLight}}
                  thumbColor={notificationPrefs.enabled && notificationPrefs.tips ? colors.primary : '#FFFFFF'}
                  disabled={!notificationPrefs.enabled} />
              }
            />
          </SettingsSection>

          {/* Data & Storage */}
          <SettingsSection title="DATA & STORAGE" colors={colors} index={4}>
            <SettingItem
              icon="folder-outline" iconColor="#06B6D4"
              title="Cache" subtitle={cacheSize}
              colors={colors} onPress={handleClearCache} index={9}
            />
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            <SettingItem
              icon="trash-outline" iconColor="#EF4444"
              title="Clear Notifications"
              colors={colors} onPress={handleClearNotifications} index={10}
            />
          </SettingsSection>

          {/* Help & Support */}
          <SettingsSection title="HELP & SUPPORT" colors={colors} index={5}>
            <SettingItem
              icon="chatbubbles-outline" iconColor="#4573DF"
              title="Contact & Support Center" subtitle="Report issues, suggest features, share resources"
              colors={colors} onPress={() => navigation.navigate('ContactSupport' as never)} index={11}
            />
          </SettingsSection>

          {/* More */}
          <SettingsSection title="MORE" colors={colors} index={6}>
            <SettingItem icon="star-outline" iconColor="#F59E0B" title="Rate App" subtitle="Help us improve" colors={colors} onPress={handleRateApp} index={15} />
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            <SettingItem icon="share-social-outline" iconColor="#10B981" title="Share App" subtitle="Tell your friends" colors={colors} onPress={handleShareApp} index={16} />
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            <SettingItem icon="help-circle-outline" iconColor="#4573DF" title="Help & FAQ" colors={colors} onPress={() => navigation.navigate('FAQ' as never)} index={17} />
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            <SettingItem icon="document-outline" iconColor="#4573DF" title="Privacy Policy" colors={colors} onPress={() => navigation.navigate('PrivacyPolicy' as never)} index={18} />
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            <SettingItem icon="shield-checkmark-outline" iconColor="#14B8A6" title="Terms of Service" colors={colors} onPress={() => navigation.navigate('TermsOfService' as never)} index={19} />
          </SettingsSection>

          {/* Account (Sign Out / Delete) */}
          {user && !user.isGuest && (
            <SettingsSection title="ACCOUNT" colors={colors} index={7}>
              <SettingItem icon="log-out-outline" iconColor="#F59E0B" title="Sign Out" colors={colors} onPress={handleSignOut} index={20} />
              <View style={[styles.divider, {backgroundColor: colors.border}]} />
              <SettingItem icon="person-remove-outline" iconColor="#EF4444" title="Delete Account" colors={colors} onPress={handleDeleteAccount} destructive index={21} />
            </SettingsSection>
          )}

          {/* Version Footer */}
          <Animated.View style={[styles.versionContainer, {opacity: headerFadeAnim}]}>
            <LinearGradient colors={[`${colors.primary}10`, 'transparent']} style={styles.versionGradient}>
              <Text style={[styles.versionText, {color: colors.textSecondary}]}>PakUni v1.0.0</Text>
              <View style={styles.madeWithRow}>
                <Text style={[styles.copyrightText, {color: colors.textSecondary}]}>Made with</Text>
                <Animated.View style={{transform: [{scale: floatTranslateY.interpolate({inputRange: [-8, 0], outputRange: [1.2, 1]})}]}}>
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

const styles = StyleSheet.create({
  container: {flex: 1},
  safeArea: {flex: 1},
  floatingGear1: {position: 'absolute', top: 80, right: -20, zIndex: 0},
  floatingGear2: {position: 'absolute', top: 200, left: -15, zIndex: 0},
  header: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, zIndex: 1},
  headerCenter: {flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8},
  headerIcon: {marginRight: 4},
  headerIconGradient: {width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center'},
  backButton: {width: 44, height: 44, justifyContent: 'center', alignItems: 'center'},
  headerTitle: {fontSize: 18, fontWeight: FONTS.weight.semiBold},
  headerSpacer: {width: 44},
  scrollContent: {paddingBottom: 100},
  divider: {height: StyleSheet.hairlineWidth, marginLeft: 58},
  linkBadge: {paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16},
  linkBadgeText: {fontSize: 12, fontWeight: FONTS.weight.semiBold},
  loadingIndicator: {paddingHorizontal: 12, paddingVertical: 6},
  helpText: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 6},
  helpTextContent: {flex: 1, fontSize: 12},
  versionContainer: {alignItems: 'center', marginTop: 12, marginHorizontal: 16},
  versionGradient: {width: '100%', alignItems: 'center', paddingVertical: 24, borderRadius: 16},
  madeWithRow: {flexDirection: 'row', alignItems: 'center', gap: 4},
  versionText: {fontSize: 13, fontWeight: FONTS.weight.medium, marginBottom: 4},
  copyrightText: {fontSize: 11},
});

export default SettingsScreen;

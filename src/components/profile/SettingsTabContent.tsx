/**
 * SettingsTabContent - Admin access, app settings, auth buttons
 */

import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../../constants/design';
import {Icon} from '../icons';
import type {UserRole} from '../../services/admin';

// Fallback LinearGradient
let LinearGradient: React.ComponentType<any>;
try {
  LinearGradient = require('react-native-linear-gradient').default;
} catch (e) {
  LinearGradient = ({children, colors: c, style, ...props}: any) => (
    <View style={[style, {backgroundColor: c?.[0] || '#4573DF'}]} {...props}>{children}</View>
  );
}

interface Props {
  colors: any;
  isGuest: boolean;
  isAdmin: boolean;
  userRole: UserRole;
  signOut: () => void;
  onAdminPress: () => void;
  onSettingsPress: () => void;
  onSupportPress: () => void;
}

const SettingsTabContent = ({
  colors, isGuest, isAdmin, userRole,
  signOut, onAdminPress, onSettingsPress, onSupportPress,
}: Props) => (
  <>
    {/* Admin Panel Access */}
    {isAdmin && (
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.settingRow, {backgroundColor: colors.card, borderLeftWidth: 4, borderLeftColor: '#EF4444'}]}
          onPress={onAdminPress}>
          <View style={[styles.settingIconBg, {backgroundColor: '#FEE2E2'}]}>
            <Icon name="grid-outline" family="Ionicons" size={20} color="#EF4444" />
          </View>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, {color: colors.text}]}>Admin Dashboard</Text>
            <Text style={[styles.settingValue, {color: colors.textSecondary}]}>
              {userRole.toUpperCase().replace('_', ' ')}
            </Text>
          </View>
          <Icon name="chevron-forward" family="Ionicons" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    )}

    {/* App Settings & Support */}
    <View style={styles.section}>
      <TouchableOpacity
        style={[styles.settingRow, {backgroundColor: colors.card}]}
        onPress={onSettingsPress}
        accessibilityRole="button"
        accessibilityLabel="App Settings">
        <View style={[styles.settingIconBg, {backgroundColor: '#E8EFFC'}]}>
          <Icon name="settings-outline" family="Ionicons" size={20} color={colors.primary} />
        </View>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingLabel, {color: colors.text}]}>App Settings</Text>
          <Text style={[styles.settingValue, {color: colors.textSecondary}]}>Theme, notifications, privacy & more</Text>
        </View>
        <Icon name="chevron-forward" family="Ionicons" size={18} color={colors.primary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.settingRow, {backgroundColor: colors.card}]}
        onPress={onSupportPress}
        accessibilityRole="button"
        accessibilityLabel="Help and Support">
        <View style={[styles.settingIconBg, {backgroundColor: '#D1FAE5'}]}>
          <Icon name="chatbubbles-outline" family="Ionicons" size={20} color="#10B981" />
        </View>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingLabel, {color: colors.text}]}>Help & Support</Text>
          <Text style={[styles.settingValue, {color: colors.textSecondary}]}>Contact us, report issues</Text>
        </View>
        <Icon name="chevron-forward" family="Ionicons" size={18} color={colors.primary} />
      </TouchableOpacity>
    </View>

    {/* Auth Button */}
    {isGuest ? (
      <TouchableOpacity style={styles.logoutBtn} onPress={signOut}
        accessibilityRole="button" accessibilityLabel="Sign in or create account">
        <LinearGradient colors={[colors.primary, colors.primaryDark || '#3660C9']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.logoutGradient}>
          <Icon name="log-in-outline" family="Ionicons" size={22} color="#FFFFFF" />
          <Text style={styles.logoutText}>Sign In / Create Account</Text>
        </LinearGradient>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity style={styles.logoutBtn}
        onPress={() => Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Sign Out', style: 'destructive', onPress: signOut},
        ])}
        accessibilityRole="button" accessibilityLabel="Sign out of your account">
        <LinearGradient colors={['#EF4444', '#DC2626']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.logoutGradient}>
          <Icon name="log-out-outline" family="Ionicons" size={22} color="#FFFFFF" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </LinearGradient>
      </TouchableOpacity>
    )}

    {/* Compact About */}
    <View style={styles.compactAbout}>
      <View style={styles.aboutRow}>
        <Text style={[styles.aboutText, {color: colors.textSecondary}]}>PakUni v1.0.0 • Made with</Text>
        <Icon name="heart" family="Ionicons" size={12} color="#EF4444" />
        <Text style={[styles.aboutText, {color: colors.textSecondary}]}>in Pakistan</Text>
      </View>
    </View>
  </>
);

const styles = StyleSheet.create({
  section: {paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg},
  settingRow: {flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.xs},
  settingIconBg: {width: 44, height: 44, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md},
  settingInfo: {flex: 1},
  settingLabel: {fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.medium},
  settingValue: {fontSize: TYPOGRAPHY.sizes.xs, marginTop: 2},
  logoutBtn: {marginHorizontal: SPACING.lg},
  logoutGradient: {flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: SPACING.md, borderRadius: RADIUS.lg},
  logoutText: {color: '#FFFFFF', fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.bold, marginLeft: SPACING.sm},
  compactAbout: {alignItems: 'center', paddingVertical: SPACING.md, marginTop: SPACING.sm},
  aboutRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4},
  aboutText: {fontSize: TYPOGRAPHY.sizes.xs},
});

export default SettingsTabContent;

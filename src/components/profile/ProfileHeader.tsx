/**
 * ProfileHeader - Gradient header with avatar, name, notification bell
 */

import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image, Animated} from 'react-native';
import {TYPOGRAPHY, SPACING, RADIUS} from '../../constants/design';
import {Icon} from '../icons';

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
  isDark: boolean;
  user: any;
  isGuest: boolean;
  profileName: string;
  profileClass: string;
  headerAnim: Animated.Value;
  onNotificationPress: () => void;
  onSignIn: () => void;
}

const ProfileHeader = ({
  colors, isDark, user, isGuest,
  profileName, profileClass,
  headerAnim, onNotificationPress, onSignIn,
}: Props) => (
  <Animated.View style={{
    opacity: headerAnim,
    transform: [{translateY: headerAnim.interpolate({inputRange: [0, 1], outputRange: [-20, 0]})}],
  }}>
    <LinearGradient
      colors={isDark ? [colors.backgroundSecondary, colors.background, colors.primaryDark] : [colors.primary, colors.primaryDark, '#3660C9']}
      start={{x: 0, y: 0}} end={{x: 1, y: 1}}
      style={styles.headerGradient}>
      <View style={styles.decoCircle1} />
      <View style={styles.decoCircle2} />
      <View style={styles.decoCircle3} />

      <TouchableOpacity style={styles.notificationBell} onPress={onNotificationPress}>
        <Icon name="notifications-outline" family="Ionicons" size={24} color="#FFFFFF" />
        <View style={styles.notificationDot} />
      </TouchableOpacity>

      <View style={[styles.avatarContainer, !user?.avatarUrl && {backgroundColor: colors.card}]}>
        {user?.avatarUrl ? (
          <Image source={{uri: user.avatarUrl}} style={styles.avatarImage} accessibilityIgnoresInvertColors />
        ) : (user?.fullName || profileName) ? (
          <Text style={[styles.avatarText, {color: colors.primary}]}>
            {(user?.fullName || profileName).charAt(0).toUpperCase()}
          </Text>
        ) : isGuest ? (
          <Icon name="person-outline" family="Ionicons" size={32} color={colors.primary} />
        ) : (
          <Icon name="person" family="Ionicons" size={32} color={colors.primary} />
        )}
      </View>
      <Text style={styles.name}>{isGuest ? 'Guest User' : (user?.fullName || profileName || 'Your Profile')}</Text>
      <Text style={styles.classLabel}>{isGuest ? 'Sign in for full features' : (user?.email || profileClass)}</Text>
      {isGuest && (
        <TouchableOpacity style={styles.signInBadge} onPress={onSignIn}>
          <Icon name="log-in-outline" family="Ionicons" size={14} color="#4573DF" />
          <Text style={styles.signInBadgeText}>Sign In</Text>
        </TouchableOpacity>
      )}
    </LinearGradient>
  </Animated.View>
);

const styles = StyleSheet.create({
  headerGradient: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl + SPACING.lg,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    borderBottomLeftRadius: RADIUS.xxl,
    borderBottomRightRadius: RADIUS.xxl,
    overflow: 'hidden',
  },
  decoCircle1: {position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.12)'},
  decoCircle2: {position: 'absolute', bottom: -30, left: -30, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.08)'},
  decoCircle3: {position: 'absolute', top: 20, left: 40, width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.05)'},
  notificationBell: {
    position: 'absolute', top: 16, right: 16,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  notificationDot: {
    position: 'absolute', top: 10, right: 10,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#EF4444', borderWidth: 2, borderColor: '#FFFFFF',
  },
  avatarContainer: {
    width: 72, height: 72, borderRadius: 36,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: SPACING.sm, elevation: 6,
    shadowColor: '#000', shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.15, shadowRadius: 8,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', overflow: 'hidden',
  },
  avatarImage: {width: 72, height: 72, borderRadius: 36},
  avatarText: {fontSize: 30, fontWeight: TYPOGRAPHY.weight.heavy, letterSpacing: -0.5},
  name: {
    fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weight.bold, color: '#FFFFFF',
    marginBottom: 2, letterSpacing: -0.3,
    textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: {width: 0, height: 1}, textShadowRadius: 4,
  },
  classLabel: {fontSize: TYPOGRAPHY.sizes.xs, color: 'rgba(255,255,255,0.9)', fontWeight: TYPOGRAPHY.weight.medium, letterSpacing: 0.2},
  signInBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 12, gap: 6,
  },
  signInBadgeText: {color: '#4573DF', fontSize: 13, fontWeight: TYPOGRAPHY.weight.bold},
});

export default ProfileHeader;

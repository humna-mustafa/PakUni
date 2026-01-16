/**
 * UniversalHeader - Consistent header with profile access across all screens
 * Features: Back button (optional), title, subtitle, profile avatar, notifications
 */

import React, {memo, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../contexts/ThemeContext';
import {useAuth} from '../contexts/AuthContext';
import {Icon} from './icons';
import {SPACING, RADIUS, TYPOGRAPHY} from '../constants/design';
import type {RootStackParamList} from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface UniversalHeaderProps {
  /** Screen title */
  title?: string;
  /** Subtitle text */
  subtitle?: string;
  /** Show back button */
  showBack?: boolean;
  /** Show profile avatar */
  showProfile?: boolean;
  /** Show notification bell */
  showNotifications?: boolean;
  /** Custom back handler */
  onBack?: () => void;
  /** Transparent background (for gradient headers) */
  transparent?: boolean;
  /** Light text mode (for dark backgrounds) */
  lightMode?: boolean;
  /** Right side custom content */
  rightContent?: React.ReactNode;
  /** Large title style */
  largeTitle?: boolean;
}

const UniversalHeader = memo<UniversalHeaderProps>(({
  title,
  subtitle,
  showBack = false,
  showProfile = true,
  showNotifications = false,
  onBack,
  transparent = false,
  lightMode = false,
  rightContent,
  largeTitle = false,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const {colors, isDark} = useTheme();
  const {user} = useAuth();

  const textColor = lightMode ? '#FFFFFF' : colors.text;
  const subtitleColor = lightMode ? 'rgba(255,255,255,0.8)' : colors.textSecondary;
  const iconColor = lightMode ? '#FFFFFF' : colors.text;
  const buttonBg = lightMode 
    ? 'rgba(255,255,255,0.2)' 
    : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)');

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  }, [navigation, onBack]);

  const handleProfilePress = useCallback(() => {
    navigation.navigate('Profile');
  }, [navigation]);

  const handleNotificationsPress = useCallback(() => {
    navigation.navigate('Notifications');
  }, [navigation]);

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (user?.fullName) {
      const names = user.fullName.split(' ');
      return names.map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <View style={[
      styles.container,
      !transparent && {backgroundColor: colors.background},
    ]}>
      <View style={styles.row}>
        {/* Left Side: Back button or spacer */}
        <View style={styles.leftSection}>
          {showBack ? (
            <TouchableOpacity
              style={[styles.iconButton, {backgroundColor: buttonBg}]}
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Icon name="arrow-back" family="Ionicons" size={22} color={iconColor} />
            </TouchableOpacity>
          ) : (
            <View style={styles.spacer} />
          )}
        </View>

        {/* Center: Title */}
        {title && !largeTitle && (
          <View style={styles.centerSection}>
            <Text 
              style={[styles.title, {color: textColor}]} 
              numberOfLines={1}
              accessibilityRole="header">
              {title}
            </Text>
            {subtitle && (
              <Text style={[styles.subtitle, {color: subtitleColor}]} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
        )}

        {/* Right Side: Actions */}
        <View style={styles.rightSection}>
          {rightContent}
          
          {showNotifications && (
            <TouchableOpacity
              style={[styles.iconButton, {backgroundColor: buttonBg}]}
              onPress={handleNotificationsPress}
              accessibilityRole="button"
              accessibilityLabel="View notifications">
              <Icon name="notifications-outline" family="Ionicons" size={22} color={iconColor} />
              {/* Notification dot - can be made dynamic */}
            </TouchableOpacity>
          )}

          {showProfile && (
            <TouchableOpacity
              style={[styles.profileButton, {backgroundColor: colors.primary}]}
              onPress={handleProfilePress}
              accessibilityRole="button"
              accessibilityLabel="View your profile">
              {user?.avatarUrl ? (
                <Image
                  source={{uri: user.avatarUrl}}
                  style={styles.profileImage}
                />
              ) : (
                <Text style={styles.profileInitials}>{getUserInitials()}</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Large Title (below header row) */}
      {title && largeTitle && (
        <View style={styles.largeTitleContainer}>
          <Text style={[styles.largeTitle, {color: textColor}]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.largeSubtitle, {color: subtitleColor}]}>{subtitle}</Text>
          )}
        </View>
      )}
    </View>
  );
});

UniversalHeader.displayName = 'UniversalHeader';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  leftSection: {
    width: 44,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  spacer: {
    width: 44,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profileInitials: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 1,
    textAlign: 'center',
  },
  largeTitleContainer: {
    marginTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  largeTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  largeSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '400',
    marginTop: 2,
  },
});

export default UniversalHeader;

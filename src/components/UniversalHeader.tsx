/**
 * UniversalHeader - Consistent header with profile access across all screens
 * Features: Back button (optional), title, subtitle, profile avatar, notifications
 * 
 * UI/UX Standards Applied:
 * - Pressable with proper press states (scale + opacity)
 * - 44pt minimum touch targets (WCAG 2.2)
 * - Consistent haptic feedback
 * - Proper accessibility labels
 */

import React, {memo, useCallback, useRef} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Image,
  Animated,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../contexts/ThemeContext';
import {useAuth} from '../contexts/AuthContext';
import {Icon} from './icons';
import {SPACING, RADIUS, TYPOGRAPHY} from '../constants/design';
import {ANIMATION_SCALES, SPRING_CONFIGS} from '../constants/ui';
import {Haptics} from '../utils/haptics';
import type {RootStackParamList} from '../navigation/AppNavigator';

// Minimum touch target per WCAG 2.2
const MIN_TOUCH_TARGET = 44;

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

// Animated button component with proper press states
const HeaderButton = memo<{
  onPress: () => void;
  style?: any;
  accessibilityLabel: string;
  accessibilityHint?: string;
  children: React.ReactNode;
}>(({onPress, style, accessibilityLabel, accessibilityHint, children}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Haptics.light();
    Animated.spring(scaleAnim, {
      toValue: ANIMATION_SCALES.ICON_PRESS,
      useNativeDriver: true,
      ...SPRING_CONFIGS.snappy,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...SPRING_CONFIGS.snappy,
    }).start();
  }, [scaleAnim]);

  return (
    <Animated.View style={{transform: [{scale: scaleAnim}]}}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({pressed}) => [
          style,
          {opacity: pressed ? 0.8 : 1},
        ]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
        {children}
      </Pressable>
    </Animated.View>
  );
});

HeaderButton.displayName = 'HeaderButton';

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
            <HeaderButton
              style={[styles.iconButton, {backgroundColor: buttonBg}]}
              onPress={handleBack}
              accessibilityLabel="Go back"
              accessibilityHint="Returns to previous screen">
              <Icon name="arrow-back" family="Ionicons" size={22} color={iconColor} />
            </HeaderButton>
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
            <HeaderButton
              style={[styles.iconButton, {backgroundColor: buttonBg}]}
              onPress={handleNotificationsPress}
              accessibilityLabel="View notifications"
              accessibilityHint="Opens your notification center">
              <Icon name="notifications-outline" family="Ionicons" size={22} color={iconColor} />
            </HeaderButton>
          )}

          {showProfile && (
            <HeaderButton
              style={[
                styles.profileButton,
                !user?.avatarUrl && {backgroundColor: colors.primary}
              ]}
              onPress={handleProfilePress}
              accessibilityLabel={`View profile${user?.fullName ? ` for ${user.fullName}` : ''}`}
              accessibilityHint="Opens your profile and settings">
              {user?.avatarUrl ? (
                <Image
                  source={{uri: user.avatarUrl}}
                  style={styles.profileImage}
                  accessibilityIgnoresInvertColors
                />
              ) : (
                <Text style={styles.profileInitials}>{getUserInitials()}</Text>
              )}
            </HeaderButton>
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
    minHeight: MIN_TOUCH_TARGET,
  },
  leftSection: {
    width: MIN_TOUCH_TARGET,
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
    width: MIN_TOUCH_TARGET,
  },
  iconButton: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButton: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    borderRadius: MIN_TOUCH_TARGET / 2,
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
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    borderRadius: MIN_TOUCH_TARGET / 2,
  },
  profileInitials: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  title: {
    fontSize: 17,
    fontWeight: TYPOGRAPHY.weight.bold,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.regular,
    marginTop: 1,
    textAlign: 'center',
  },
  largeTitleContainer: {
    marginTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  largeTitle: {
    fontSize: 28,
    fontWeight: TYPOGRAPHY.weight.heavy,
    letterSpacing: -0.5,
  },
  largeSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.regular,
    marginTop: 2,
  },
});

export default UniversalHeader;

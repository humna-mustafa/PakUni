/**
 * BrandHeader Component - Reusable Header with PakUni Branding
 * 
 * A premium header component featuring the PakUni logo and branding.
 * Use this component for consistent branding across screens.
 * 
 * @author PakUni Team
 * @version 1.0.0
 */

import React, {memo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '../contexts/ThemeContext';
import {LogoBadge, BRAND_COLORS} from './AppLogo';
import {Icon} from './icons';
import {MODERN_SPACING, MODERN_TYPOGRAPHY, MODERN_RADIUS} from '../constants/modern-design';

// ============================================================================
// TYPES
// ============================================================================

interface BrandHeaderProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  showBackButton?: boolean;
  showProfileButton?: boolean;
  rightIcon?: string;
  onBackPress?: () => void;
  onProfilePress?: () => void;
  onRightPress?: () => void;
  variant?: 'default' | 'minimal' | 'prominent';
  transparent?: boolean;
}

// ============================================================================
// BRAND HEADER COMPONENT
// ============================================================================

export const BrandHeader: React.FC<BrandHeaderProps> = memo(({
  title,
  subtitle,
  showLogo = true,
  showBackButton = false,
  showProfileButton = false,
  rightIcon,
  onBackPress,
  onProfilePress,
  onRightPress,
  variant = 'default',
  transparent = false,
}) => {
  const {colors, isDark} = useTheme();

  const renderLeftSection = () => {
    if (showBackButton) {
      return (
        <TouchableOpacity
          style={[styles.iconButton, {backgroundColor: colors.card}]}
          onPress={onBackPress}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Icon name="chevron-back" family="Ionicons" size={22} color={colors.text} />
        </TouchableOpacity>
      );
    }

    if (showLogo) {
      return <LogoBadge size="sm" showGlow={variant === 'prominent'} />;
    }

    return <View style={styles.placeholder} />;
  };

  const renderCenterSection = () => {
    if (title) {
      return (
        <View style={styles.titleContainer}>
          <Text style={[styles.title, {color: colors.text}]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, {color: colors.textSecondary}]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      );
    }

    // Show brand name with logo
    if (showLogo && variant !== 'minimal') {
      return (
        <View style={styles.brandContainer}>
          <Text style={[styles.brandName, {color: colors.text}]}>
            Pak<Text style={{color: BRAND_COLORS.primary}}>Uni</Text>
          </Text>
        </View>
      );
    }

    return <View style={styles.placeholder} />;
  };

  const renderRightSection = () => {
    if (rightIcon && onRightPress) {
      return (
        <TouchableOpacity
          style={[styles.iconButton, {backgroundColor: colors.card}]}
          onPress={onRightPress}
          accessibilityRole="button"
        >
          <Icon name={rightIcon} family="Ionicons" size={20} color={colors.text} />
        </TouchableOpacity>
      );
    }

    if (showProfileButton && onProfilePress) {
      return (
        <TouchableOpacity
          style={[styles.profileButton, {backgroundColor: colors.primary}]}
          onPress={onProfilePress}
          accessibilityRole="button"
          accessibilityLabel="View profile"
        >
          <Icon name="person" family="Ionicons" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      );
    }

    return <View style={styles.placeholder} />;
  };

  const containerStyle = [
    styles.container,
    variant === 'prominent' && styles.prominentContainer,
    !transparent && {backgroundColor: colors.background},
  ];

  return (
    <SafeAreaView edges={['top']} style={containerStyle}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={transparent ? 'transparent' : colors.background}
      />
      <View style={styles.content}>
        <View style={styles.leftSection}>
          {renderLeftSection()}
        </View>
        <View style={styles.centerSection}>
          {renderCenterSection()}
        </View>
        <View style={styles.rightSection}>
          {renderRightSection()}
        </View>
      </View>
    </SafeAreaView>
  );
});

// ============================================================================
// COMPACT BRAND BAR - For secondary screens
// ============================================================================

interface CompactBrandBarProps {
  onLogoPress?: () => void;
}

export const CompactBrandBar: React.FC<CompactBrandBarProps> = memo(({onLogoPress}) => {
  const {colors} = useTheme();

  return (
    <TouchableOpacity
      style={[styles.compactBar, {backgroundColor: colors.card}]}
      onPress={onLogoPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="PakUni Home"
    >
      <LogoBadge size="sm" />
      <Text style={[styles.compactBrandName, {color: colors.text}]}>
        Pak<Text style={{color: BRAND_COLORS.primary}}>Uni</Text>
      </Text>
    </TouchableOpacity>
  );
});

// ============================================================================
// BRAND FOOTER - For screens bottom
// ============================================================================

interface BrandFooterProps {
  showVersion?: boolean;
}

export const BrandFooter: React.FC<BrandFooterProps> = memo(({showVersion = false}) => {
  const {colors} = useTheme();

  return (
    <View style={styles.footer}>
      <Text style={[styles.footerText, {color: colors.textSecondary}]}>
        Powered by{' '}
        <Text style={{color: BRAND_COLORS.primary, fontWeight: '600'}}>PakUni</Text>
      </Text>
      {showVersion && (
        <Text style={[styles.versionText, {color: colors.textSecondary}]}>
          v2.0.0
        </Text>
      )}
    </View>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: MODERN_SPACING.lg,
    paddingVertical: MODERN_SPACING.sm,
  },
  prominentContainer: {
    paddingVertical: MODERN_SPACING.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  placeholder: {
    width: 40,
    height: 40,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: MODERN_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: MODERN_TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: MODERN_TYPOGRAPHY.sizes.xs,
    marginTop: 2,
    textAlign: 'center',
  },
  brandContainer: {
    alignItems: 'center',
  },
  brandName: {
    fontSize: MODERN_TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    letterSpacing: -0.5,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif-medium',
    }),
  },
  compactBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.lg,
    gap: MODERN_SPACING.sm,
    alignSelf: 'flex-start',
  },
  compactBrandName: {
    fontSize: MODERN_TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: MODERN_SPACING.lg,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
  },
  versionText: {
    fontSize: 10,
    marginTop: 4,
    opacity: 0.6,
  },
});

export default BrandHeader;

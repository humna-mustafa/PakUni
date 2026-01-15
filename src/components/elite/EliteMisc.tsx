/**
 * Elite Misc Components
 * Badges, Chips, Dividers, and utility components
 */

import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Icon } from '../icons';
import {
  ELITE_TYPOGRAPHY,
  ELITE_SPACING,
  ELITE_RADIUS,
  ELITE_MOTION,
  ELITE_SHADOWS,
} from '../../constants/elite';
import { Haptics } from '../../utils/haptics';

// ============================================================================
// ELITE BADGE
// ============================================================================
type BadgeVariant = 'filled' | 'soft' | 'outlined';
type BadgeSize = 'sm' | 'md' | 'lg';
type BadgeColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';

interface EliteBadgeProps {
  text: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  color?: BadgeColor;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const BADGE_SIZE_CONFIG = {
  sm: { paddingH: 6, paddingV: 2, fontSize: 10 },
  md: { paddingH: 8, paddingV: 4, fontSize: 11 },
  lg: { paddingH: 10, paddingV: 5, fontSize: 12 },
};

export const EliteBadge: React.FC<EliteBadgeProps> = ({
  text,
  variant = 'soft',
  size = 'md',
  color = 'primary',
  icon,
  style,
  textStyle,
}) => {
  const { colors } = useTheme();
  const sizeConfig = BADGE_SIZE_CONFIG[size];

  const getColors = () => {
    switch (color) {
      case 'secondary':
        return { main: colors.secondary, light: colors.secondaryLight };
      case 'success':
        return { main: colors.success, light: colors.successLight };
      case 'warning':
        return { main: colors.warning, light: colors.warningLight };
      case 'error':
        return { main: colors.error, light: colors.errorLight };
      case 'neutral':
        return { main: colors.textSecondary, light: colors.background };
      default:
        return { main: colors.primary, light: colors.primaryLight };
    }
  };

  const colorValues = getColors();

  const getVariantStyle = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'filled':
        return {
          container: { backgroundColor: colorValues.main },
          text: { color: '#FFFFFF' },
        };
      case 'outlined':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: colorValues.main,
          },
          text: { color: colorValues.main },
        };
      default: // soft
        return {
          container: { backgroundColor: colorValues.light },
          text: { color: colorValues.main },
        };
    }
  };

  const variantStyle = getVariantStyle();

  return (
    <View
      style={[
        styles.badge,
        {
          paddingHorizontal: sizeConfig.paddingH,
          paddingVertical: sizeConfig.paddingV,
        },
        variantStyle.container,
        style,
      ]}
    >
      {icon && <View style={styles.badgeIcon}>{icon}</View>}
      <Text
        style={[
          styles.badgeText,
          { fontSize: sizeConfig.fontSize },
          variantStyle.text,
          textStyle,
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

// ============================================================================
// ELITE CHIP
// ============================================================================
interface EliteChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onClose?: () => void;
  leftIcon?: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
}

export const EliteChip: React.FC<EliteChipProps> = ({
  label,
  selected = false,
  onPress,
  onClose,
  leftIcon,
  disabled = false,
  style,
}) => {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        ...ELITE_MOTION.spring.micro,
      }).start();
    }
  }, [onPress, scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...ELITE_MOTION.spring.snappy,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    if (onPress && !disabled) {
      Haptics.light();
      onPress();
    }
  }, [onPress, disabled]);

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || !onPress}
        style={[
          styles.chip,
          {
            backgroundColor: selected
              ? colors.primaryLight
              : isDark
                ? colors.card
                : colors.background,
            borderColor: selected ? colors.primary : colors.border,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
        android_ripple={{ color: colors.primary + '20', borderless: false }}
      >
        {leftIcon && <View style={styles.chipIcon}>{leftIcon}</View>}
        
        <Text
          style={[
            styles.chipLabel,
            {
              color: selected ? colors.primary : colors.text,
              fontWeight: selected
                ? ELITE_TYPOGRAPHY.weight.semibold
                : ELITE_TYPOGRAPHY.weight.medium,
            },
          ]}
        >
          {label}
        </Text>

        {onClose && (
          <Pressable
            onPress={() => {
              Haptics.light();
              onClose();
            }}
            style={styles.chipClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>✕</Text>
          </Pressable>
        )}
      </Pressable>
    </Animated.View>
  );
};

// ============================================================================
// ELITE DIVIDER
// ============================================================================
interface EliteDividerProps {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed';
  thickness?: number;
  color?: string;
  spacing?: number;
  label?: string;
  style?: ViewStyle;
}

export const EliteDivider: React.FC<EliteDividerProps> = ({
  orientation = 'horizontal',
  variant = 'solid',
  thickness = 1,
  color,
  spacing = ELITE_SPACING[4],
  label,
  style,
}) => {
  const { colors } = useTheme();
  const dividerColor = color || colors.divider;

  if (label && orientation === 'horizontal') {
    return (
      <View style={[styles.dividerWithLabel, { marginVertical: spacing }, style]}>
        <View
          style={[
            styles.dividerLine,
            {
              height: thickness,
              backgroundColor: dividerColor,
              flex: 1,
            },
          ]}
        />
        <Text
          style={[
            styles.dividerLabel,
            { color: colors.textSecondary },
          ]}
        >
          {label}
        </Text>
        <View
          style={[
            styles.dividerLine,
            {
              height: thickness,
              backgroundColor: dividerColor,
              flex: 1,
            },
          ]}
        />
      </View>
    );
  }

  if (orientation === 'vertical') {
    return (
      <View
        style={[
          {
            width: thickness,
            backgroundColor: dividerColor,
            marginHorizontal: spacing,
            alignSelf: 'stretch',
          },
          variant === 'dashed' && { borderStyle: 'dashed' },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        {
          height: thickness,
          backgroundColor: dividerColor,
          marginVertical: spacing,
        },
        variant === 'dashed' && { borderStyle: 'dashed' },
        style,
      ]}
    />
  );
};

// ============================================================================
// ELITE AVATAR
// ============================================================================
interface EliteAvatarProps {
  source?: { uri: string };
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onPress?: () => void;
  badge?: boolean;
  badgeColor?: string;
  style?: ViewStyle;
}

const AVATAR_SIZE = {
  sm: { size: 32, fontSize: 12, badgeSize: 8 },
  md: { size: 40, fontSize: 14, badgeSize: 10 },
  lg: { size: 56, fontSize: 18, badgeSize: 14 },
  xl: { size: 80, fontSize: 24, badgeSize: 18 },
};

export const EliteAvatar: React.FC<EliteAvatarProps> = ({
  source,
  name,
  size = 'md',
  onPress,
  badge = false,
  badgeColor,
  style,
}) => {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const sizeConfig = AVATAR_SIZE[size];

  const handlePressIn = useCallback(() => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 0.92,
        useNativeDriver: true,
        ...ELITE_MOTION.spring.snappy,
      }).start();
    }
  }, [onPress, scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...ELITE_MOTION.spring.default,
    }).start();
  }, [scaleAnim]);

  // Get initials from name
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate consistent color from name
  const getColorFromName = (name: string): string => {
    const colors = ['#6366F1', '#EC4899', '#14B8A6', '#F59E0B', '#EF4444', '#8B5CF6'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const avatarContent = source ? (
    <View
      style={[
        styles.avatarImage,
        {
          width: sizeConfig.size,
          height: sizeConfig.size,
          borderRadius: sizeConfig.size / 2,
          backgroundColor: colors.background,
        },
      ]}
    >
      {/* Placeholder for image - would use Image component */}
      <Icon name="person" family="Ionicons" size={sizeConfig.fontSize} color={colors.textSecondary} />
    </View>
  ) : (
    <View
      style={[
        styles.avatarPlaceholder,
        {
          width: sizeConfig.size,
          height: sizeConfig.size,
          borderRadius: sizeConfig.size / 2,
          backgroundColor: name ? getColorFromName(name) : colors.primary,
        },
      ]}
    >
      <Text
        style={[
          styles.avatarInitials,
          { fontSize: sizeConfig.fontSize },
        ]}
      >
        {name ? getInitials(name) : '?'}
      </Text>
    </View>
  );

  const content = (
    <>
      {avatarContent}
      {badge && (
        <View
          style={[
            styles.avatarBadge,
            {
              width: sizeConfig.badgeSize,
              height: sizeConfig.badgeSize,
              borderRadius: sizeConfig.badgeSize / 2,
              backgroundColor: badgeColor || colors.success,
              borderColor: isDark ? colors.card : '#FFFFFF',
              borderWidth: 2,
            },
          ]}
        />
      )}
    </>
  );

  if (onPress) {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.avatarContainer}
        >
          {content}
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <View style={[styles.avatarContainer, style]}>
      {content}
    </View>
  );
};

// ============================================================================
// ELITE SECTION HEADER
// ============================================================================
interface EliteSectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: string;
  onActionPress?: () => void;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const EliteSectionHeader: React.FC<EliteSectionHeaderProps> = ({
  title,
  subtitle,
  action,
  onActionPress,
  icon,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.sectionHeader, style]}>
      <View style={styles.sectionHeaderLeft}>
        {icon && <View style={styles.sectionHeaderIcon}>{icon}</View>}
        <View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {action && (
        <Pressable onPress={onActionPress}>
          <Text style={[styles.sectionAction, { color: colors.primary }]}>
            {action}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

// ============================================================================
// ELITE STAT
// ============================================================================
interface EliteStatProps {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  color?: string;
  trend?: { value: number; isPositive: boolean };
  style?: ViewStyle;
}

export const EliteStat: React.FC<EliteStatProps> = ({
  value,
  label,
  icon,
  color,
  trend,
  style,
}) => {
  const { colors, isDark } = useTheme();
  const accentColor = color || colors.primary;

  return (
    <View
      style={[
        styles.stat,
        {
          backgroundColor: colors.card,
        },
        isDark ? ELITE_SHADOWS.dark.sm : ELITE_SHADOWS.light.sm,
        style,
      ]}
    >
      {icon && <View style={styles.statIcon}>{icon}</View>}
      <Text style={[styles.statValue, { color: accentColor }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
      {trend && (
        <View
          style={[
            styles.statTrend,
            {
              backgroundColor: trend.isPositive
                ? colors.successLight
                : colors.errorLight,
            },
          ]}
        >
          <Text
            style={[
              styles.statTrendText,
              {
                color: trend.isPositive ? colors.success : colors.error,
              },
            ]}
          >
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </Text>
        </View>
      )}
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: ELITE_RADIUS.full,
    alignSelf: 'flex-start',
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeText: {
    fontWeight: ELITE_TYPOGRAPHY.weight.semibold,
    letterSpacing: ELITE_TYPOGRAPHY.tracking.wide,
    textTransform: 'uppercase',
  },

  // Chip
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ELITE_SPACING[3],
    paddingVertical: ELITE_SPACING[2],
    borderRadius: ELITE_RADIUS.full,
    borderWidth: 1,
  },
  chipIcon: {
    marginRight: ELITE_SPACING[1.5],
  },
  chipLabel: {
    fontSize: ELITE_TYPOGRAPHY.fluid.footnote,
  },
  chipClose: {
    marginLeft: ELITE_SPACING[1.5],
    padding: 2,
  },

  // Divider
  dividerWithLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dividerLine: {
    flex: 1,
  },
  dividerLabel: {
    marginHorizontal: ELITE_SPACING[3],
    fontSize: ELITE_TYPOGRAPHY.fluid.caption,
    fontWeight: ELITE_TYPOGRAPHY.weight.medium,
  },

  // Avatar
  avatarContainer: {
    position: 'relative',
  },
  avatarImage: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontWeight: ELITE_TYPOGRAPHY.weight.semibold,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ELITE_SPACING[4],
    marginBottom: ELITE_SPACING[3],
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeaderIcon: {
    marginRight: ELITE_SPACING[2],
  },
  sectionTitle: {
    fontSize: ELITE_TYPOGRAPHY.fluid.headline,
    fontWeight: ELITE_TYPOGRAPHY.weight.semibold,
    letterSpacing: ELITE_TYPOGRAPHY.tracking.tight,
  },
  sectionSubtitle: {
    fontSize: ELITE_TYPOGRAPHY.fluid.caption,
    marginTop: 2,
  },
  sectionAction: {
    fontSize: ELITE_TYPOGRAPHY.fluid.subhead,
    fontWeight: ELITE_TYPOGRAPHY.weight.medium,
  },

  // Stat
  stat: {
    alignItems: 'center',
    padding: ELITE_SPACING[4],
    borderRadius: ELITE_RADIUS.xl,
  },
  statIcon: {
    marginBottom: ELITE_SPACING[2],
  },
  statValue: {
    fontSize: ELITE_TYPOGRAPHY.fluid.title2,
    fontWeight: ELITE_TYPOGRAPHY.weight.bold,
  },
  statLabel: {
    fontSize: ELITE_TYPOGRAPHY.fluid.caption,
    marginTop: 2,
  },
  statTrend: {
    paddingHorizontal: ELITE_SPACING[2],
    paddingVertical: 2,
    borderRadius: ELITE_RADIUS.sm,
    marginTop: ELITE_SPACING[2],
  },
  statTrendText: {
    fontSize: ELITE_TYPOGRAPHY.fluid.caption2,
    fontWeight: ELITE_TYPOGRAPHY.weight.semibold,
  },
});

export default {
  EliteBadge,
  EliteChip,
  EliteDivider,
  EliteAvatar,
  EliteSectionHeader,
  EliteStat,
};

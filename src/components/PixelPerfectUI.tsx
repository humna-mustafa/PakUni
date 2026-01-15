/**
 * Pixel Perfect UI Components
 * 
 * A collection of crisp, artifact-free UI components:
 * - Badges and tags
 * - Icon containers
 * - Avatars
 * - Dividers
 * - Surfaces
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import {
  PP_SPACING,
  PP_BORDERS,
  PP_SHADOWS,
  PP_BADGES,
  PP_ICON_CONTAINERS,
  PP_AVATARS,
  PP_TYPOGRAPHY,
  HAIRLINE_WIDTH,
  roundToPixel,
} from '../constants/pixel-perfect';

// ============================================================================
// BADGE COMPONENT - Clean, crisp badges
// ============================================================================

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'dot' | 'count' | 'tag' | 'pill' | 'status';

interface PPBadgeProps {
  children?: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  count?: number;
  maxCount?: number;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const getBadgeColors = (variant: BadgeVariant, colors: any) => {
  switch (variant) {
    case 'primary':
      return { bg: `${colors.primary}15`, text: colors.primary };
    case 'success':
      return { bg: '#ECFDF5', text: '#059669' };
    case 'warning':
      return { bg: '#FFFBEB', text: '#D97706' };
    case 'error':
      return { bg: '#FEF2F2', text: '#DC2626' };
    case 'info':
      return { bg: '#F0F9FF', text: '#0284C7' };
    default:
      return { bg: '#F3F4F6', text: '#6B7280' };
  }
};

export const PPBadge: React.FC<PPBadgeProps> = memo(({
  children,
  variant = 'default',
  size = 'tag',
  count,
  maxCount = 99,
  style,
  textStyle,
}) => {
  const { colors, isDark } = useTheme();
  const badgeColors = getBadgeColors(variant, colors);

  // For dot badge
  if (size === 'dot') {
    return (
      <View
        style={[
          styles.badgeDot,
          { backgroundColor: variant === 'default' ? colors.primary : badgeColors.text },
          style,
        ]}
      />
    );
  }

  // For count badge
  if (size === 'count' && count !== undefined) {
    const displayCount = count > maxCount ? `${maxCount}+` : `${count}`;
    const countConfig = PP_BADGES.count;
    return (
      <View
        style={[
          styles.badgeCount,
          { backgroundColor: badgeColors.bg },
          style,
        ]}
      >
        <Text style={[styles.badgeCountText, { color: badgeColors.text }, textStyle]}>
          {displayCount}
        </Text>
      </View>
    );
  }

  // Get config for tag, pill, status
  const sizeConfig = size === 'tag' ? PP_BADGES.tag 
    : size === 'pill' ? PP_BADGES.pill 
    : PP_BADGES.status;

  // For tag, pill, status badges
  return (
    <View
      style={[
        styles.badge,
        {
          height: sizeConfig.height,
          borderRadius: sizeConfig.borderRadius,
          paddingHorizontal: sizeConfig.paddingHorizontal,
          backgroundColor: badgeColors.bg,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          {
            fontSize: sizeConfig.fontSize,
            fontWeight: sizeConfig.fontWeight as any,
            color: badgeColors.text,
          },
          textStyle,
        ]}
      >
        {children}
      </Text>
    </View>
  );
});

// ============================================================================
// ICON CONTAINER - Perfect icon backgrounds
// ============================================================================

type IconContainerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
type IconContainerShape = 'rounded' | 'circle';

interface PPIconContainerProps {
  children: React.ReactNode;
  size?: IconContainerSize;
  shape?: IconContainerShape;
  backgroundColor?: string;
  borderColor?: string;
  style?: ViewStyle;
}

export const PPIconContainer: React.FC<PPIconContainerProps> = memo(({
  children,
  size = 'md',
  shape = 'rounded',
  backgroundColor,
  borderColor,
  style,
}) => {
  const { colors } = useTheme();
  const config = shape === 'circle' 
    ? PP_ICON_CONTAINERS[`circle${size.charAt(0).toUpperCase()}${size.slice(1)}` as keyof typeof PP_ICON_CONTAINERS]
    : PP_ICON_CONTAINERS[size];

  return (
    <View
      style={[
        styles.iconContainer,
        {
          width: config.width,
          height: config.height,
          borderRadius: config.borderRadius,
          backgroundColor: backgroundColor || `${colors.primary}15`,
          borderWidth: borderColor ? PP_BORDERS.width.thin : 0,
          borderColor: borderColor,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
});

// ============================================================================
// AVATAR - Crisp avatars with proper borders
// ============================================================================

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'profile';

interface PPAvatarProps {
  size?: AvatarSize;
  source?: { uri: string };
  name?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  style?: ViewStyle;
  children?: React.ReactNode;
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export const PPAvatar: React.FC<PPAvatarProps> = memo(({
  size = 'md',
  source,
  name,
  backgroundColor,
  textColor,
  borderColor,
  style,
  children,
}) => {
  const { colors } = useTheme();
  const config = PP_AVATARS[size];

  return (
    <View
      style={[
        styles.avatar,
        {
          width: config.size,
          height: config.size,
          borderRadius: config.borderRadius,
          backgroundColor: backgroundColor || `${colors.primary}15`,
          borderWidth: borderColor ? config.borderWidth : 0,
          borderColor: borderColor || 'transparent',
        },
        style,
      ]}
    >
      {children ? (
        children
      ) : name ? (
        <Text
          style={[
            styles.avatarText,
            {
              fontSize: config.fontSize,
              color: textColor || colors.primary,
            },
          ]}
        >
          {getInitials(name)}
        </Text>
      ) : null}
    </View>
  );
});

// ============================================================================
// DIVIDER - Hairline dividers
// ============================================================================

interface PPDividerProps {
  direction?: 'horizontal' | 'vertical';
  color?: string;
  spacing?: number;
  thickness?: 'hairline' | 'thin' | 'medium';
  style?: ViewStyle;
}

export const PPDivider: React.FC<PPDividerProps> = memo(({
  direction = 'horizontal',
  color,
  spacing = PP_SPACING.md,
  thickness = 'hairline',
  style,
}) => {
  const { colors } = useTheme();
  const thicknessValue = 
    thickness === 'hairline' ? HAIRLINE_WIDTH :
    thickness === 'thin' ? 1 : 2;

  const dividerStyle: ViewStyle = direction === 'horizontal'
    ? {
        height: thicknessValue,
        backgroundColor: color || colors.border,
        marginVertical: spacing,
      }
    : {
        width: thicknessValue,
        backgroundColor: color || colors.border,
        marginHorizontal: spacing,
        alignSelf: 'stretch',
      };

  return <View style={[dividerStyle, style]} />;
});

// ============================================================================
// SURFACE - Clean background surfaces
// ============================================================================

type SurfaceVariant = 'primary' | 'secondary' | 'elevated' | 'inset';

interface PPSurfaceProps {
  children: React.ReactNode;
  variant?: SurfaceVariant;
  padding?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const PPSurface: React.FC<PPSurfaceProps> = memo(({
  children,
  variant = 'primary',
  padding = PP_SPACING.md,
  borderRadius = PP_BORDERS.radius.lg,
  style,
}) => {
  const { colors, isDark } = useTheme();

  const getSurfaceStyle = (): ViewStyle => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: isDark ? colors.card : '#F9FAFB',
        };
      case 'elevated':
        return {
          backgroundColor: colors.card,
          ...PP_SHADOWS.sm,
        };
      case 'inset':
        return {
          backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
        };
      default:
        return {
          backgroundColor: colors.card,
        };
    }
  };

  return (
    <View
      style={[
        styles.surface,
        getSurfaceStyle(),
        {
          padding,
          borderRadius: roundToPixel(borderRadius),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
});

// ============================================================================
// SKELETON LOADER - Crisp loading placeholders
// ============================================================================

interface PPSkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const PPSkeleton: React.FC<PPSkeletonProps> = memo(({
  width = '100%',
  height = 16,
  borderRadius = PP_BORDERS.radius.sm,
  style,
}) => {
  const { isDark } = useTheme();

  return (
    <View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height: roundToPixel(height),
          borderRadius: roundToPixel(borderRadius),
          backgroundColor: isDark ? '#374151' : '#E5E7EB',
        },
        style,
      ]}
    />
  );
});

// ============================================================================
// SECTION HEADER - Clean section headers
// ============================================================================

interface PPSectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
}

export const PPSectionHeader: React.FC<PPSectionHeaderProps> = memo(({
  title,
  subtitle,
  action,
  onActionPress,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.sectionHeader, style]}>
      <View style={styles.sectionTitleContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {action && onActionPress && (
        <Text
          style={[styles.sectionAction, { color: colors.primary }]}
          onPress={onActionPress}
        >
          {action}
        </Text>
      )}
    </View>
  );
});

// ============================================================================
// EMPTY STATE - Clean empty states
// ============================================================================

interface PPEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  style?: ViewStyle;
}

export const PPEmptyState: React.FC<PPEmptyStateProps> = memo(({
  icon,
  title,
  description,
  action,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.emptyState, style]}>
      {icon && <View style={styles.emptyStateIcon}>{icon}</View>}
      <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
        {title}
      </Text>
      {description && (
        <Text style={[styles.emptyStateDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      )}
      {action && <View style={styles.emptyStateAction}>{action}</View>}
    </View>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Badge styles
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    textAlign: 'center',
  },
  badgeDot: {
    width: PP_BADGES.dot.width,
    height: PP_BADGES.dot.height,
    borderRadius: PP_BADGES.dot.borderRadius,
  },
  badgeCount: {
    minWidth: PP_BADGES.count.minWidth,
    height: PP_BADGES.count.height,
    borderRadius: PP_BADGES.count.borderRadius,
    paddingHorizontal: PP_BADGES.count.paddingHorizontal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCountText: {
    fontSize: PP_BADGES.count.fontSize,
    fontWeight: PP_BADGES.count.fontWeight,
    textAlign: 'center',
  },

  // Icon container
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  // Avatar
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarText: {
    fontWeight: '600',
    textAlign: 'center',
  },

  // Surface
  surface: {
    overflow: 'hidden',
  },

  // Skeleton
  skeleton: {
    overflow: 'hidden',
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PP_SPACING.screenHorizontal,
    paddingVertical: PP_SPACING.sm,
    marginBottom: PP_SPACING.sm,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: PP_TYPOGRAPHY.size.lg,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  sectionSubtitle: {
    fontSize: PP_TYPOGRAPHY.size.sm,
    marginTop: 2,
  },
  sectionAction: {
    fontSize: PP_TYPOGRAPHY.size.sm,
    fontWeight: '600',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: PP_SPACING.xxl,
    paddingHorizontal: PP_SPACING.xl,
  },
  emptyStateIcon: {
    marginBottom: PP_SPACING.md,
  },
  emptyStateTitle: {
    fontSize: PP_TYPOGRAPHY.size.lg,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: PP_SPACING.xs,
  },
  emptyStateDescription: {
    fontSize: PP_TYPOGRAPHY.size.base,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyStateAction: {
    marginTop: PP_SPACING.lg,
  },
});

// Display names
PPBadge.displayName = 'PPBadge';
PPIconContainer.displayName = 'PPIconContainer';
PPAvatar.displayName = 'PPAvatar';
PPDivider.displayName = 'PPDivider';
PPSurface.displayName = 'PPSurface';
PPSkeleton.displayName = 'PPSkeleton';
PPSectionHeader.displayName = 'PPSectionHeader';
PPEmptyState.displayName = 'PPEmptyState';

export default {
  PPBadge,
  PPIconContainer,
  PPAvatar,
  PPDivider,
  PPSurface,
  PPSkeleton,
  PPSectionHeader,
  PPEmptyState,
};

/**
 * Premium UI Components - Badges, Stats, and Misc
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import {RADIUS, SPACING, TYPOGRAPHY, SHADOWS} from '../constants/design';

// ============================================================================
// PREMIUM BADGE
// ============================================================================
type BadgeVariant = 'solid' | 'soft' | 'outlined' | 'dot';
type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';
type BadgeColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';

interface PremiumBadgeProps {
  text?: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  color?: BadgeColor;
  icon?: React.ReactNode;
  pill?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const BADGE_SIZE_CONFIG = {
  xs: {paddingH: SPACING[1.5], paddingV: SPACING[0.5], fontSize: 9, dotSize: 6},
  sm: {paddingH: SPACING[2], paddingV: SPACING[0.5], fontSize: TYPOGRAPHY.scale.caption2, dotSize: 8},
  md: {paddingH: SPACING[2.5], paddingV: SPACING[1], fontSize: TYPOGRAPHY.scale.caption, dotSize: 10},
  lg: {paddingH: SPACING[3], paddingV: SPACING[1.5], fontSize: TYPOGRAPHY.scale.footnote, dotSize: 12},
};

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({
  text,
  variant = 'solid',
  size = 'md',
  color = 'primary',
  icon,
  pill = true,
  style,
  textStyle,
}) => {
  const {colors} = useTheme();
  const sizeConfig = BADGE_SIZE_CONFIG[size];

  const getColors = () => {
    switch (color) {
      case 'secondary':
        return {main: colors.secondary, light: colors.secondaryLight};
      case 'success':
        return {main: colors.success, light: colors.successLight};
      case 'warning':
        return {main: colors.warning, light: colors.warningLight};
      case 'error':
        return {main: colors.error, light: colors.errorLight};
      case 'neutral':
        return {main: colors.textSecondary, light: colors.background};
      default:
        return {main: colors.primary, light: colors.primaryLight};
    }
  };

  const colorValues = getColors();

  const getVariantStyle = (): {container: ViewStyle; text: TextStyle} => {
    switch (variant) {
      case 'soft':
        return {
          container: {backgroundColor: colorValues.light},
          text: {color: colorValues.main},
        };
      case 'outlined':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: colorValues.main,
          },
          text: {color: colorValues.main},
        };
      case 'dot':
        return {
          container: {
            backgroundColor: colorValues.main,
            width: sizeConfig.dotSize,
            height: sizeConfig.dotSize,
            borderRadius: sizeConfig.dotSize / 2,
            padding: 0,
          },
          text: {display: 'none'},
        };
      default:
        return {
          container: {backgroundColor: colorValues.main},
          text: {color: colors.white},
        };
    }
  };

  const variantStyle = getVariantStyle();

  if (variant === 'dot') {
    return <View style={[variantStyle.container, style]} />;
  }

  return (
    <View
      style={[
        styles.badge,
        {
          paddingHorizontal: sizeConfig.paddingH,
          paddingVertical: sizeConfig.paddingV,
          borderRadius: pill ? RADIUS.full : RADIUS.sm,
        },
        variantStyle.container,
        style,
      ]}>
      {icon && <View style={styles.badgeIcon}>{icon}</View>}
      {text && (
        <Text
          style={[
            styles.badgeText,
            {fontSize: sizeConfig.fontSize},
            variantStyle.text,
            textStyle,
          ]}>
          {text}
        </Text>
      )}
    </View>
  );
};

// ============================================================================
// STAT CARD
// ============================================================================
interface PremiumStatCardProps {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  variant?: 'default' | 'outlined' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

const STAT_SIZE_CONFIG = {
  sm: {valueFontSize: TYPOGRAPHY.scale.title3, labelFontSize: TYPOGRAPHY.scale.caption, iconSize: 20, padding: SPACING[3]},
  md: {valueFontSize: TYPOGRAPHY.scale.title2, labelFontSize: TYPOGRAPHY.scale.footnote, iconSize: 24, padding: SPACING[4]},
  lg: {valueFontSize: TYPOGRAPHY.scale.title1, labelFontSize: TYPOGRAPHY.scale.subhead, iconSize: 28, padding: SPACING[5]},
};

export const PremiumStatCard: React.FC<PremiumStatCardProps> = ({
  value,
  label,
  icon,
  trend,
  color = 'primary',
  variant = 'default',
  size = 'md',
  style,
}) => {
  const {colors, isDark} = useTheme();
  const sizeConfig = STAT_SIZE_CONFIG[size];

  const getColor = () => {
    switch (color) {
      case 'secondary': return colors.secondary;
      case 'success': return colors.success;
      case 'warning': return colors.warning;
      case 'error': return colors.error;
      default: return colors.primary;
    }
  };

  const accentColor = getColor();

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'glass':
        return {
          backgroundColor: isDark 
            ? 'rgba(30, 41, 59, 0.7)' 
            : 'rgba(255, 255, 255, 0.85)',
        };
      default:
        return {
          backgroundColor: colors.card,
          ...SHADOWS.soft.sm,
        };
    }
  };

  return (
    <View
      style={[
        styles.statCard,
        getVariantStyle(),
        {padding: sizeConfig.padding},
        style,
      ]}>
      {icon && (
        <View style={[styles.statIcon, {marginBottom: SPACING[2]}]}>
          {icon}
        </View>
      )}
      <Text
        style={[
          styles.statValue,
          {fontSize: sizeConfig.valueFontSize, color: accentColor},
        ]}>
        {value}
      </Text>
      <Text
        style={[
          styles.statLabel,
          {fontSize: sizeConfig.labelFontSize, color: colors.textSecondary},
        ]}>
        {label}
      </Text>
      {trend && (
        <View
          style={[
            styles.trendBadge,
            {backgroundColor: trend.isPositive ? colors.successLight : colors.errorLight},
          ]}>
          <Text
            style={[
              styles.trendText,
              {color: trend.isPositive ? colors.success : colors.error},
            ]}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </Text>
        </View>
      )}
    </View>
  );
};

// ============================================================================
// STAT ROW
// ============================================================================
interface StatRowItem {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  color?: string;
}

interface PremiumStatRowProps {
  stats: StatRowItem[];
  variant?: 'default' | 'outlined' | 'glass';
  style?: ViewStyle;
}

export const PremiumStatRow: React.FC<PremiumStatRowProps> = ({
  stats,
  variant = 'default',
  style,
}) => {
  const {colors, isDark} = useTheme();

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'glass':
        return {
          backgroundColor: isDark 
            ? 'rgba(30, 41, 59, 0.7)' 
            : 'rgba(255, 255, 255, 0.85)',
        };
      default:
        return {
          backgroundColor: colors.card,
          ...SHADOWS.soft.sm,
        };
    }
  };

  return (
    <View style={[styles.statRow, getVariantStyle(), style]}>
      {stats.map((stat, index) => (
        <View
          key={index}
          style={[
            styles.statRowItem,
            index < stats.length - 1 && {
              borderRightWidth: 1,
              borderRightColor: colors.border,
            },
          ]}>
          {stat.icon && <View style={styles.statRowIcon}>{stat.icon}</View>}
          <Text style={[styles.statRowValue, {color: stat.color || colors.primary}]}>
            {stat.value}
          </Text>
          <Text style={[styles.statRowLabel, {color: colors.textSecondary}]}>
            {stat.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

// ============================================================================
// SECTION HEADER
// ============================================================================
interface PremiumSectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: string;
  onActionPress?: () => void;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const PremiumSectionHeader: React.FC<PremiumSectionHeaderProps> = ({
  title,
  subtitle,
  action,
  onActionPress,
  icon,
  style,
}) => {
  const {colors} = useTheme();

  return (
    <View style={[styles.sectionHeader, style]}>
      <View style={styles.sectionHeaderLeft}>
        {icon && <View style={styles.sectionHeaderIcon}>{icon}</View>}
        <View>
          <Text style={[styles.sectionTitle, {color: colors.text}]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.sectionSubtitle, {color: colors.textSecondary}]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {action && (
        <Text
          style={[styles.sectionAction, {color: colors.primary}]}
          onPress={onActionPress}>
          {action}
        </Text>
      )}
    </View>
  );
};

// ============================================================================
// DIVIDER
// ============================================================================
interface PremiumDividerProps {
  orientation?: 'horizontal' | 'vertical';
  thickness?: number;
  color?: string;
  spacing?: number;
  style?: ViewStyle;
}

export const PremiumDivider: React.FC<PremiumDividerProps> = ({
  orientation = 'horizontal',
  thickness = 1,
  color,
  spacing = SPACING[4],
  style,
}) => {
  const {colors} = useTheme();
  const dividerColor = color || colors.divider;

  if (orientation === 'vertical') {
    return (
      <View
        style={[
          {
            width: thickness,
            backgroundColor: dividerColor,
            marginHorizontal: spacing,
          },
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
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  badgeIcon: {
    marginRight: SPACING[1],
  },
  badgeText: {
    fontWeight: TYPOGRAPHY.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
  
  // Stat Card
  statCard: {
    borderRadius: RADIUS.xl,
    alignItems: 'center',
  },
  statIcon: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  statLabel: {
    marginTop: SPACING[0.5],
    textAlign: 'center',
  },
  trendBadge: {
    paddingHorizontal: SPACING[2],
    paddingVertical: SPACING[0.5],
    borderRadius: RADIUS.sm,
    marginTop: SPACING[2],
  },
  trendText: {
    fontSize: TYPOGRAPHY.scale.caption,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  
  // Stat Row
  statRow: {
    flexDirection: 'row',
    borderRadius: RADIUS.xl,
    padding: SPACING[4],
  },
  statRowItem: {
    flex: 1,
    alignItems: 'center',
  },
  statRowIcon: {
    marginBottom: SPACING[1],
  },
  statRowValue: {
    fontSize: TYPOGRAPHY.scale.title3,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  statRowLabel: {
    fontSize: TYPOGRAPHY.scale.caption,
    marginTop: SPACING[0.5],
  },
  
  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING[4],
    marginBottom: SPACING[3],
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeaderIcon: {
    marginRight: SPACING[2.5],
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.scale.headline + 1,
    fontWeight: TYPOGRAPHY.weight.bold,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.scale.footnote,
    marginTop: SPACING[0.5],
    letterSpacing: 0.1,
    opacity: 0.8,
  },
  sectionAction: {
    fontSize: TYPOGRAPHY.scale.subhead,
    fontWeight: TYPOGRAPHY.weight.semibold,
    letterSpacing: 0.2,
  },
});

export default {
  PremiumBadge,
  PremiumStatCard,
  PremiumStatRow,
  PremiumSectionHeader,
  PremiumDivider,
};

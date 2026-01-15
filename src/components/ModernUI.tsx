/**
 * Modern UI Components
 * Clean, professional components following Material Design 3 principles
 * 
 * Design Philosophy:
 * - Content-first: UI supports content, doesn't compete
 * - Purposeful: Every element serves a function
 * - Accessible: Clear contrast, proper touch targets
 * - Consistent: Predictable patterns throughout
 */

import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ViewStyle,
  TextStyle,
  Animated,
  Platform,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import {
  MODERN_SPACING,
  MODERN_RADIUS,
  MODERN_SHADOWS,
  MODERN_TYPOGRAPHY,
  MODERN_MOTION,
  MODERN_ICON_SIZE,
  MODERN_TOUCH,
} from '../constants/modern-design';

// ============================================================================
// MODERN CARD - Clean, elevated surface
// ============================================================================

type CardVariant = 'elevated' | 'outlined' | 'filled';

interface ModernCardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  padding?: keyof typeof MODERN_SPACING | number;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  disabled?: boolean;
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  variant = 'elevated',
  onPress,
  padding = 'cardPadding',
  style,
  contentStyle,
  disabled = false,
}) => {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const paddingValue = typeof padding === 'number' 
    ? padding 
    : MODERN_SPACING[padding as keyof typeof MODERN_SPACING] || MODERN_SPACING.cardPadding;

  const handlePressIn = useCallback(() => {
    if (!onPress) return;
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      ...MODERN_MOTION.spring.snappy,
    }).start();
  }, [onPress, scaleAnim]);

  const handlePressOut = useCallback(() => {
    if (!onPress) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...MODERN_MOTION.spring.default,
    }).start();
  }, [onPress, scaleAnim]);

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'filled':
        return {
          backgroundColor: isDark ? colors.backgroundSecondary : '#F4F6F8',
        };
      default: // elevated
        return {
          backgroundColor: colors.card,
          ...MODERN_SHADOWS.md,
        };
    }
  };

  const cardStyle: ViewStyle = {
    ...getVariantStyle(),
    padding: paddingValue,
    borderRadius: MODERN_RADIUS.lg,
    opacity: disabled ? 0.5 : 1,
  };

  const content = <View style={contentStyle}>{children}</View>;

  if (onPress) {
    return (
      <Animated.View style={[cardStyle, style, { transform: [{ scale: scaleAnim }] }]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          style={styles.pressable}
          accessibilityRole="button"
          accessibilityState={{ disabled }}>
          {content}
        </Pressable>
      </Animated.View>
    );
  }

  return <View style={[cardStyle, style]}>{content}</View>;
};

// ============================================================================
// MODERN BUTTON - Clean action button
// ============================================================================

type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text';
type ButtonSize = 'small' | 'medium' | 'large';

interface ModernButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const BUTTON_SIZES = {
  small: { height: 36, paddingH: 12, fontSize: 13 },
  medium: { height: 44, paddingH: 20, fontSize: 14 },
  large: { height: 52, paddingH: 24, fontSize: 15 },
};

export const ModernButton: React.FC<ModernButtonProps> = ({
  label,
  onPress,
  variant = 'filled',
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const sizeConfig = BUTTON_SIZES[size];

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      ...MODERN_MOTION.spring.snappy,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...MODERN_MOTION.spring.snappy,
    }).start();
  };

  const getVariantStyle = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'tonal':
        return {
          container: { backgroundColor: colors.primaryLight },
          text: { color: colors.primary },
        };
      case 'outlined':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: colors.primary,
          },
          text: { color: colors.primary },
        };
      case 'text':
        return {
          container: { backgroundColor: 'transparent' },
          text: { color: colors.primary },
        };
      default: // filled
        return {
          container: { backgroundColor: colors.primary },
          text: { color: '#FFFFFF' },
        };
    }
  };

  const variantStyle = getVariantStyle();

  return (
    <Animated.View 
      style={[
        { transform: [{ scale: scaleAnim }] },
        fullWidth && { flex: 1 }
      ]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: disabled || loading }}
        style={[
          styles.button,
          variantStyle.container,
          {
            height: sizeConfig.height,
            paddingHorizontal: sizeConfig.paddingH,
            opacity: disabled ? 0.5 : 1,
          },
          fullWidth && { width: '100%' },
          style,
        ]}>
        {icon && iconPosition === 'left' && (
          <View style={styles.buttonIconLeft}>{icon}</View>
        )}
        <Text
          style={[
            styles.buttonText,
            variantStyle.text,
            { fontSize: sizeConfig.fontSize },
            textStyle,
          ]}>
          {loading ? 'Loading...' : label}
        </Text>
        {icon && iconPosition === 'right' && (
          <View style={styles.buttonIconRight}>{icon}</View>
        )}
      </Pressable>
    </Animated.View>
  );
};

// ============================================================================
// MODERN SECTION HEADER - Clean section divider
// ============================================================================

interface ModernSectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
}

export const ModernSectionHeader: React.FC<ModernSectionHeaderProps> = ({
  title,
  subtitle,
  action,
  onActionPress,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.sectionHeader, style]}>
      <View style={styles.sectionHeaderLeft}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {action && (
        <Pressable 
          onPress={onActionPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={action}>
          <Text style={[styles.sectionAction, { color: colors.primary }]}>
            {action}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

// ============================================================================
// MODERN CHIP - Clean tag/filter
// ============================================================================

interface ModernChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  variant?: 'filled' | 'outlined';
  size?: 'small' | 'medium';
  style?: ViewStyle;
}

export const ModernChip: React.FC<ModernChipProps> = ({
  label,
  selected = false,
  onPress,
  icon,
  variant = 'filled',
  size = 'medium',
  style,
}) => {
  const { colors } = useTheme();

  const getChipStyle = (): { container: ViewStyle; text: TextStyle } => {
    if (selected) {
      return {
        container: { backgroundColor: colors.primary },
        text: { color: '#FFFFFF' },
      };
    }
    
    if (variant === 'outlined') {
      return {
        container: {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.border,
        },
        text: { color: colors.textSecondary },
      };
    }
    
    return {
      container: { backgroundColor: colors.primaryLight },
      text: { color: colors.primary },
    };
  };

  const chipStyle = getChipStyle();
  const isSmall = size === 'small';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={[
        styles.chip,
        chipStyle.container,
        {
          paddingHorizontal: isSmall ? 10 : 14,
          paddingVertical: isSmall ? 4 : 8,
        },
        style,
      ]}>
      {icon && <View style={styles.chipIcon}>{icon}</View>}
      <Text
        style={[
          styles.chipText,
          chipStyle.text,
          { fontSize: isSmall ? 12 : 13 },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
};

// ============================================================================
// MODERN STAT - Clean statistic display
// ============================================================================

interface ModernStatProps {
  value: string | number;
  label: string;
  style?: ViewStyle;
}

export const ModernStat: React.FC<ModernStatProps> = ({ value, label, style }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.stat, style]}>
      <Text style={[styles.statValue, { color: colors.primary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
};

// ============================================================================
// MODERN DIVIDER - Clean separator
// ============================================================================

interface ModernDividerProps {
  style?: ViewStyle;
}

export const ModernDivider: React.FC<ModernDividerProps> = ({ style }) => {
  const { colors } = useTheme();

  return <View style={[styles.divider, { backgroundColor: colors.border }, style]} />;
};

// ============================================================================
// MODERN LIST ITEM - Clean list row
// ============================================================================

interface ModernListItemProps {
  title: string;
  subtitle?: string;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  style?: ViewStyle;
}

export const ModernListItem: React.FC<ModernListItemProps> = ({
  title,
  subtitle,
  leftContent,
  rightContent,
  onPress,
  showChevron = true,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={`${title}${subtitle ? `, ${subtitle}` : ''}`}
      style={({ pressed }) => [
        styles.listItem,
        { backgroundColor: pressed && onPress ? colors.primaryLight : 'transparent' },
        style,
      ]}>
      {leftContent && <View style={styles.listItemLeft}>{leftContent}</View>}
      <View style={styles.listItemContent}>
        <Text style={[styles.listItemTitle, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.listItemSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightContent && <View style={styles.listItemRight}>{rightContent}</View>}
      {showChevron && onPress && (
        <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
      )}
    </Pressable>
  );
};

// ============================================================================
// MODERN ICON CONTAINER - Clean icon wrapper
// ============================================================================

interface ModernIconContainerProps {
  children: React.ReactNode;
  color?: string;
  backgroundColor?: string;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

const ICON_CONTAINER_SIZES = {
  small: 36,
  medium: 44,
  large: 52,
};

export const ModernIconContainer: React.FC<ModernIconContainerProps> = ({
  children,
  color,
  backgroundColor,
  size = 'medium',
  style,
}) => {
  const { colors } = useTheme();
  const containerSize = ICON_CONTAINER_SIZES[size];

  return (
    <View
      style={[
        styles.iconContainer,
        {
          width: containerSize,
          height: containerSize,
          borderRadius: MODERN_RADIUS.md,
          backgroundColor: backgroundColor || colors.primaryLight,
        },
        style,
      ]}>
      {children}
    </View>
  );
};

// ============================================================================
// MODERN BADGE - Clean status indicator
// ============================================================================

interface ModernBadgeProps {
  text?: string;
  variant?: 'filled' | 'soft' | 'outlined';
  color?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'small' | 'medium';
  style?: ViewStyle;
}

export const ModernBadge: React.FC<ModernBadgeProps> = ({
  text,
  variant = 'soft',
  color = 'primary',
  size = 'medium',
  style,
}) => {
  const { colors } = useTheme();

  const getColorValues = () => {
    switch (color) {
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

  const colorValues = getColorValues();

  const getVariantStyle = () => {
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
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        variantStyle.container,
        {
          paddingHorizontal: isSmall ? 6 : 10,
          paddingVertical: isSmall ? 2 : 4,
        },
        style,
      ]}>
      {text && (
        <Text
          style={[
            styles.badgeText,
            variantStyle.text,
            { fontSize: isSmall ? 10 : 11 },
          ]}>
          {text}
        </Text>
      )}
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
  },

  // Button
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: MODERN_RADIUS.md,
  },
  buttonText: {
    fontWeight: MODERN_TYPOGRAPHY.weight.semibold,
    letterSpacing: 0.2,
  },
  buttonIconLeft: {
    marginRight: 8,
  },
  buttonIconRight: {
    marginLeft: 8,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: MODERN_SPACING.screenPadding,
    marginBottom: MODERN_SPACING.md,
  },
  sectionHeaderLeft: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: MODERN_TYPOGRAPHY.size.title3,
    fontWeight: MODERN_TYPOGRAPHY.weight.semibold,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: MODERN_TYPOGRAPHY.size.body2,
    marginTop: 2,
  },
  sectionAction: {
    fontSize: MODERN_TYPOGRAPHY.size.body2,
    fontWeight: MODERN_TYPOGRAPHY.weight.medium,
  },

  // Chip
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: MODERN_RADIUS.full,
  },
  chipIcon: {
    marginRight: 6,
  },
  chipText: {
    fontWeight: MODERN_TYPOGRAPHY.weight.medium,
  },

  // Stat
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: MODERN_TYPOGRAPHY.size.title2,
    fontWeight: MODERN_TYPOGRAPHY.weight.bold,
  },
  statLabel: {
    fontSize: MODERN_TYPOGRAPHY.size.caption,
    marginTop: 4,
    textAlign: 'center',
  },

  // Divider
  divider: {
    height: 1,
    marginVertical: MODERN_SPACING.md,
  },

  // List Item
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: MODERN_SPACING.sm + 4,
    paddingHorizontal: MODERN_SPACING.screenPadding,
    minHeight: MODERN_TOUCH.minSize,
  },
  listItemLeft: {
    marginRight: MODERN_SPACING.md,
  },
  listItemContent: {
    flex: 1,
    marginRight: MODERN_SPACING.sm,
  },
  listItemTitle: {
    fontSize: MODERN_TYPOGRAPHY.size.body1,
    fontWeight: MODERN_TYPOGRAPHY.weight.medium,
  },
  listItemSubtitle: {
    fontSize: MODERN_TYPOGRAPHY.size.body2,
    marginTop: 2,
  },
  listItemRight: {
    marginLeft: MODERN_SPACING.sm,
  },
  chevron: {
    fontSize: 20,
    fontWeight: '300',
  },

  // Icon Container
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Badge
  badge: {
    alignSelf: 'flex-start',
    borderRadius: MODERN_RADIUS.sm,
  },
  badgeText: {
    fontWeight: MODERN_TYPOGRAPHY.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default {
  ModernCard,
  ModernButton,
  ModernSectionHeader,
  ModernChip,
  ModernStat,
  ModernDivider,
  ModernListItem,
  ModernIconContainer,
  ModernBadge,
};

/**
 * CleanSectionHeader Component - 2025 Design Standards
 * 
 * Simple, consistent section headers with clear hierarchy.
 * No decorations, just clear typography and optional actions.
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import {
  CLEAN_SPACING,
  CLEAN_TYPOGRAPHY,
  TEXT_STYLES,
  CLEAN_COLORS,
  CLEAN_COLORS_DARK,
} from '../constants/clean-design-2025';
import { Icon } from './icons';

// ============================================================================
// TYPES
// ============================================================================

interface CleanSectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: string;
  onActionPress?: () => void;
  actionIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  style?: ViewStyle;
  /** Smaller variant for subsections */
  compact?: boolean;
  testID?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const CleanSectionHeader: React.FC<CleanSectionHeaderProps> = memo(({
  title,
  subtitle,
  action,
  onActionPress,
  actionIcon,
  leftIcon,
  style,
  compact = false,
  testID,
}) => {
  const { colors, isDark } = useTheme();
  const palette = isDark ? CLEAN_COLORS_DARK : CLEAN_COLORS;

  const textPrimary = colors.text || palette.neutral[800];
  const textSecondary = colors.textSecondary || palette.neutral[500];
  const primaryColor = colors.primary || palette.primary[500];

  return (
    <View
      style={[
        styles.container,
        compact ? styles.containerCompact : styles.containerDefault,
        style,
      ]}
      testID={testID}
      accessibilityRole="header"
    >
      {/* Left Content */}
      <View style={styles.leftContent}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        <View style={styles.textContainer}>
          <Text
            style={[
              compact ? styles.titleCompact : styles.title,
              { color: textPrimary },
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          
          {subtitle && (
            <Text
              style={[
                styles.subtitle,
                { color: textSecondary },
              ]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {/* Action Button */}
      {action && onActionPress && (
        <Pressable
          onPress={onActionPress}
          accessibilityRole="button"
          accessibilityLabel={action}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.actionButtonPressed,
          ]}
        >
          <Text style={[styles.actionText, { color: primaryColor }]}>
            {action}
          </Text>
          {actionIcon || (
            <Icon
              name="chevron-forward"
              family="Ionicons"
              size={16}
              color={primaryColor}
            />
          )}
        </Pressable>
      )}
    </View>
  );
});

// ============================================================================
// PAGE HEADER - For main page titles
// ============================================================================

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backButton?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
}

export const CleanPageHeader: React.FC<PageHeaderProps> = memo(({
  title,
  subtitle,
  backButton = false,
  onBackPress,
  rightAction,
  style,
}) => {
  const { colors, isDark } = useTheme();
  const palette = isDark ? CLEAN_COLORS_DARK : CLEAN_COLORS;

  return (
    <View style={[styles.pageHeader, style]}>
      {/* Back Button */}
      {backButton && onBackPress && (
        <Pressable
          onPress={onBackPress}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.backButton}
        >
          <Icon
            name="arrow-back"
            family="Ionicons"
            size={24}
            color={colors.text || palette.neutral[800]}
          />
        </Pressable>
      )}

      {/* Title Area */}
      <View style={styles.pageTitleContainer}>
        <Text
          style={[
            styles.pageTitle,
            { color: colors.text || palette.neutral[800] },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        
        {subtitle && (
          <Text
            style={[
              styles.pageSubtitle,
              { color: colors.textSecondary || palette.neutral[500] },
            ]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {/* Right Action */}
      {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
    </View>
  );
});

// ============================================================================
// DIVIDER WITH LABEL
// ============================================================================

interface LabeledDividerProps {
  label?: string;
  style?: ViewStyle;
}

export const LabeledDivider: React.FC<LabeledDividerProps> = memo(({
  label,
  style,
}) => {
  const { colors, isDark } = useTheme();
  const palette = isDark ? CLEAN_COLORS_DARK : CLEAN_COLORS;

  if (!label) {
    return (
      <View
        style={[
          styles.divider,
          { backgroundColor: colors.border || palette.neutral[200] },
          style,
        ]}
      />
    );
  }

  return (
    <View style={[styles.labeledDividerContainer, style]}>
      <View
        style={[
          styles.dividerLine,
          { backgroundColor: colors.border || palette.neutral[200] },
        ]}
      />
      <Text
        style={[
          styles.dividerLabel,
          { color: colors.textSecondary || palette.neutral[400] },
        ]}
      >
        {label}
      </Text>
      <View
        style={[
          styles.dividerLine,
          { backgroundColor: colors.border || palette.neutral[200] },
        ]}
      />
    </View>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Section Header
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: CLEAN_SPACING.screenPadding,
  },
  containerDefault: {
    marginBottom: CLEAN_SPACING[4],
    marginTop: CLEAN_SPACING[2],
  },
  containerCompact: {
    marginBottom: CLEAN_SPACING[3],
    marginTop: CLEAN_SPACING[1],
  },
  leftContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftIcon: {
    marginRight: CLEAN_SPACING[3],
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...TEXT_STYLES.title,
  },
  titleCompact: {
    ...TEXT_STYLES.subtitle,
  },
  subtitle: {
    ...TEXT_STYLES.caption,
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: CLEAN_SPACING[1],
    paddingLeft: CLEAN_SPACING[2],
  },
  actionButtonPressed: {
    opacity: 0.6,
  },
  actionText: {
    fontSize: CLEAN_TYPOGRAPHY.size.sm,
    fontWeight: CLEAN_TYPOGRAPHY.weight.medium,
    marginRight: 2,
  },

  // Page Header
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: CLEAN_SPACING.screenPadding,
    paddingVertical: CLEAN_SPACING[4],
  },
  backButton: {
    marginRight: CLEAN_SPACING[3],
    padding: CLEAN_SPACING[1],
  },
  pageTitleContainer: {
    flex: 1,
  },
  pageTitle: {
    ...TEXT_STYLES.headline,
  },
  pageSubtitle: {
    ...TEXT_STYLES.bodySmall,
    marginTop: 2,
  },
  rightAction: {
    marginLeft: CLEAN_SPACING[3],
  },

  // Divider
  divider: {
    height: 1,
    width: '100%',
    marginVertical: CLEAN_SPACING[4],
  },
  labeledDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: CLEAN_SPACING[4],
    paddingHorizontal: CLEAN_SPACING.screenPadding,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerLabel: {
    fontSize: CLEAN_TYPOGRAPHY.size.xs,
    fontWeight: CLEAN_TYPOGRAPHY.weight.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginHorizontal: CLEAN_SPACING[3],
  },
});

// Display names
CleanSectionHeader.displayName = 'CleanSectionHeader';
CleanPageHeader.displayName = 'CleanPageHeader';
LabeledDivider.displayName = 'LabeledDivider';

export default CleanSectionHeader;

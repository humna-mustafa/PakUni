/**
 * EmptyState Component
 * Displays when there's no data to show
 * Updated with theme support for dark mode
 */

import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import {FONTS, SPACING, BORDER_RADIUS} from '../constants/theme';
import {Icon} from './icons';

interface EmptyStateProps {
  iconName?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  iconName = 'mail-open-outline',
  title,
  subtitle,
  actionLabel,
  onAction,
  compact = false,
}) => {
  const {colors} = useTheme();
  
  return (
    <View style={[styles.container, compact && styles.compact]}>
      <View style={[styles.iconContainer, compact && styles.iconCompact]}>
        <Icon name={iconName} family="Ionicons" size={compact ? 40 : 64} color={colors.textSecondary} />
      </View>
      <Text style={[styles.title, compact && styles.titleCompact, {color: colors.text}]}>{title}</Text>
      {subtitle && <Text style={[styles.subtitle, {color: colors.textSecondary}]}>{subtitle}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity 
          style={[styles.actionButton, {backgroundColor: colors.primary}]} 
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}>
          <Text style={[styles.actionText, {color: colors.textOnPrimary}]}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compact: {
    padding: SPACING.lg,
  },
  iconContainer: {
    marginBottom: SPACING.md,
  },
  iconCompact: {
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  titleCompact: {
    fontSize: FONTS.sizes.md,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    textAlign: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    lineHeight: 22,
  },
  actionButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
  },
  actionText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
});

export default EmptyState;

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
        <Icon name={iconName} family="Ionicons" size={compact ? 36 : 56} color={colors.textSecondary} />
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
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compact: {
    padding: 20,
  },
  iconContainer: {
    marginBottom: 14,
    opacity: 0.5,
  },
  iconCompact: {
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  titleCompact: {
    fontSize: 15,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 14,
    paddingHorizontal: 12,
    lineHeight: 20,
    opacity: 0.85,
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default EmptyState;

/**
 * Badge Component
 * Displays status, labels, or counts in a compact format
 */

import React from 'react';
import {View, Text, StyleSheet, ViewStyle, TextStyle} from 'react-native';
import {COLORS, FONTS, SPACING, BORDER_RADIUS} from '../constants/theme';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: string;
  rounded?: boolean;
  outlined?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const VARIANT_COLORS: Record<BadgeVariant, {bg: string; text: string; border: string}> = {
  default: {bg: COLORS.gray200, text: COLORS.gray700, border: COLORS.gray300},
  success: {bg: '#E8F5E9', text: '#2E7D32', border: '#81C784'},
  warning: {bg: '#FFF3E0', text: '#E65100', border: '#FFB74D'},
  error: {bg: '#FFEBEE', text: '#C62828', border: '#EF5350'},
  info: {bg: '#E3F2FD', text: '#1565C0', border: '#64B5F6'},
  primary: {bg: COLORS.primaryLight, text: COLORS.primaryDark, border: COLORS.primary},
  secondary: {bg: '#E0F2F1', text: COLORS.secondary, border: COLORS.secondary},
};

const SIZE_STYLES: Record<BadgeSize, {paddingH: number; paddingV: number; fontSize: number}> = {
  sm: {paddingH: SPACING.xs, paddingV: 2, fontSize: FONTS.sizes.xs - 1},
  md: {paddingH: SPACING.sm, paddingV: SPACING.xs, fontSize: FONTS.sizes.xs},
  lg: {paddingH: SPACING.md, paddingV: SPACING.sm, fontSize: FONTS.sizes.sm},
};

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'default',
  size = 'md',
  icon,
  rounded = false,
  outlined = false,
  style,
  textStyle,
}) => {
  const colors = VARIANT_COLORS[variant];
  const sizeStyle = SIZE_STYLES[size];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: outlined ? 'transparent' : colors.bg,
          borderColor: colors.border,
          borderWidth: outlined ? 1 : 0,
          paddingHorizontal: sizeStyle.paddingH,
          paddingVertical: sizeStyle.paddingV,
          borderRadius: rounded ? BORDER_RADIUS.full : BORDER_RADIUS.sm,
        },
        style,
      ]}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text
        style={[
          styles.text,
          {
            color: colors.text,
            fontSize: sizeStyle.fontSize,
          },
          textStyle,
        ]}>
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
    fontSize: 12,
  },
  text: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

export default Badge;

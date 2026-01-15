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
  default: {bg: '#F4F4F5', text: '#52525B', border: '#E4E4E7'},
  success: {bg: '#ECFDF5', text: '#047857', border: '#A7F3D0'},
  warning: {bg: '#FFFBEB', text: '#B45309', border: '#FDE68A'},
  error: {bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA'},
  info: {bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE'},
  primary: {bg: '#EEF2FF', text: '#4338CA', border: '#C7D2FE'},
  secondary: {bg: '#F0FDFA', text: '#0F766E', border: '#99F6E4'},
};

const SIZE_STYLES: Record<BadgeSize, {paddingH: number; paddingV: number; fontSize: number}> = {
  sm: {paddingH: 6, paddingV: 2, fontSize: 10},
  md: {paddingH: 8, paddingV: 3, fontSize: 11},
  lg: {paddingH: 10, paddingV: 4, fontSize: 12},
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
    marginRight: 3,
    fontSize: 11,
  },
  text: {
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});

export default Badge;

/**
 * Reusable Card Component
 * A flexible card component with various styles and optional press handling
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Pressable,
} from 'react-native';
import {COLORS, BORDER_RADIUS, SPACING} from '../constants/theme';
import {SHADOWS} from '../constants/shadows';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated' | 'filled';
  padding?: keyof typeof SPACING | number;
  borderRadius?: keyof typeof BORDER_RADIUS | number;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  activeOpacity?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  borderRadius = 'lg',
  onPress,
  disabled = false,
  style,
  activeOpacity = 0.7,
}) => {
  const paddingValue = typeof padding === 'number' ? padding : SPACING[padding];
  const borderRadiusValue = typeof borderRadius === 'number' ? borderRadius : BORDER_RADIUS[borderRadius];

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: COLORS.white,
          borderWidth: 1,
          borderColor: COLORS.border,
        };
      case 'elevated':
        return {
          backgroundColor: COLORS.white,
          ...SHADOWS.md,
        };
      case 'filled':
        return {
          backgroundColor: COLORS.gray100,
        };
      default:
        return {
          backgroundColor: COLORS.white,
          ...SHADOWS.card,
        };
    }
  };

  const cardStyle: ViewStyle = {
    ...getVariantStyle(),
    padding: paddingValue,
    borderRadius: borderRadiusValue,
    opacity: disabled ? 0.5 : 1,
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({pressed}) => [
          cardStyle,
          style,
          pressed && {transform: [{scale: 0.98}], opacity: activeOpacity},
        ]}>
        {children}
      </Pressable>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
};

export default Card;

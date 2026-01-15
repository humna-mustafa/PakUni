import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {COLORS, BORDER_RADIUS, SPACING, FONTS} from '../constants';
import {Haptics} from '../utils/haptics';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BORDER_RADIUS.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
    };

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.paddingVertical = SPACING.xs;
        baseStyle.paddingHorizontal = SPACING.md;
        break;
      case 'large':
        baseStyle.paddingVertical = SPACING.md;
        baseStyle.paddingHorizontal = SPACING.xl;
        break;
      default:
        baseStyle.paddingVertical = SPACING.sm;
        baseStyle.paddingHorizontal = SPACING.lg;
    }

    // Variant styles
    switch (variant) {
      case 'secondary':
        baseStyle.backgroundColor = COLORS.secondary;
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 2;
        baseStyle.borderColor = COLORS.primary;
        break;
      default:
        baseStyle.backgroundColor = COLORS.primary;
    }

    if (disabled) {
      baseStyle.opacity = 0.5;
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontWeight: '600',
    };

    switch (size) {
      case 'small':
        baseTextStyle.fontSize = FONTS.sizes.sm;
        break;
      case 'large':
        baseTextStyle.fontSize = FONTS.sizes.lg;
        break;
      default:
        baseTextStyle.fontSize = FONTS.sizes.md;
    }

    baseTextStyle.color =
      variant === 'outline' ? COLORS.primary : COLORS.white;

    return baseTextStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      accessibilityRole="button"
      accessibilityState={{disabled: disabled || loading}}
      onPress={() => {
        Haptics.buttonPress();
        onPress();
      }}
      disabled={disabled || loading}
      activeOpacity={0.75}
      hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? COLORS.primary : COLORS.white}
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({});

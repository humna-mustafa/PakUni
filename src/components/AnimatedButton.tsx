/**
 * AnimatedButton Component
 * Button with press animation and loading state
 */

import React, {useRef} from 'react';
import {
  Animated,
  TouchableWithoutFeedback,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import {COLORS, FONTS, SPACING, BORDER_RADIUS} from '../constants/theme';
import {SHADOWS} from '../constants/shadows';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const VARIANT_STYLES: Record<
  ButtonVariant,
  {bg: string; text: string; border: string}
> = {
  primary: {bg: COLORS.primary, text: COLORS.white, border: COLORS.primary},
  secondary: {bg: COLORS.secondary, text: COLORS.white, border: COLORS.secondary},
  outline: {bg: 'transparent', text: COLORS.primary, border: COLORS.primary},
  ghost: {bg: 'transparent', text: COLORS.text, border: 'transparent'},
  danger: {bg: COLORS.error, text: COLORS.white, border: COLORS.error},
};

const SIZE_STYLES: Record<ButtonSize, {paddingH: number; paddingV: number; fontSize: number}> = {
  sm: {paddingH: SPACING.md, paddingV: SPACING.sm - 2, fontSize: FONTS.sizes.sm},
  md: {paddingH: SPACING.lg, paddingV: SPACING.sm + 2, fontSize: FONTS.sizes.md},
  lg: {paddingH: SPACING.xl, paddingV: SPACING.md, fontSize: FONTS.sizes.lg},
};

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}>
      <Animated.View
        style={[
          styles.button,
          {
            backgroundColor: variantStyle.bg,
            borderColor: variantStyle.border,
            borderWidth: variant === 'outline' ? 2 : 0,
            paddingHorizontal: sizeStyle.paddingH,
            paddingVertical: sizeStyle.paddingV,
            transform: [{scale: scaleAnim}],
            opacity: isDisabled ? 0.5 : 1,
          },
          fullWidth && styles.fullWidth,
          variant !== 'ghost' && variant !== 'outline' && SHADOWS.button,
          style,
        ]}>
        {loading ? (
          <ActivityIndicator color={variantStyle.text} size="small" />
        ) : (
          <View style={styles.content}>
            {icon && iconPosition === 'left' && (
              <Text style={[styles.icon, {fontSize: sizeStyle.fontSize}]}>{icon}</Text>
            )}
            <Text
              style={[
                styles.text,
                {
                  color: variantStyle.text,
                  fontSize: sizeStyle.fontSize,
                },
                textStyle,
              ]}>
              {title}
            </Text>
            {icon && iconPosition === 'right' && (
              <Text style={[styles.icon, styles.iconRight, {fontSize: sizeStyle.fontSize}]}>
                {icon}
              </Text>
            )}
          </View>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  icon: {
    marginRight: SPACING.xs,
  },
  iconRight: {
    marginRight: 0,
    marginLeft: SPACING.xs,
  },
});

export default AnimatedButton;

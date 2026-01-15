/**
 * PremiumButton Component
 * Production-ready button with multiple variants, loading states, haptic feedback, and animations
 * Silicon Valley-grade quality with micro-interactions
 */

import React, {useRef, useCallback} from 'react';
import {
  Animated,
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import {RADIUS, SPACING, SHADOWS, TYPOGRAPHY, ANIMATION} from '../constants/design';
import {Haptics} from '../utils/haptics';

type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'soft' | 'link';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type ButtonColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';

interface PremiumButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  color?: ButtonColor;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  rounded?: boolean;
  hapticEnabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const SIZE_CONFIG: Record<ButtonSize, {paddingH: number; paddingV: number; fontSize: number; iconSize: number}> = {
  xs: {paddingH: SPACING[2.5], paddingV: SPACING[1.5], fontSize: TYPOGRAPHY.scale.caption, iconSize: 14},
  sm: {paddingH: SPACING[3], paddingV: SPACING[2], fontSize: TYPOGRAPHY.scale.subhead, iconSize: 16},
  md: {paddingH: SPACING[4], paddingV: SPACING[2.5], fontSize: TYPOGRAPHY.scale.callout, iconSize: 18},
  lg: {paddingH: SPACING[5], paddingV: SPACING[3], fontSize: TYPOGRAPHY.scale.body, iconSize: 20},
  xl: {paddingH: SPACING[6], paddingV: SPACING[3.5], fontSize: TYPOGRAPHY.scale.bodyLarge, iconSize: 22},
};

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  title,
  onPress,
  variant = 'solid',
  size = 'md',
  color = 'primary',
  leftIcon,
  rightIcon,
  loading = false,
  disabled = false,
  fullWidth = false,
  rounded = false,
  hapticEnabled = true,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const {colors} = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    if (hapticEnabled) {
      Haptics.buttonPress();
    }
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
        ...ANIMATION.spring.snappy,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim, hapticEnabled]);

  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        ...ANIMATION.spring.default,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const getColorValues = () => {
    switch (color) {
      case 'secondary':
        return {main: colors.secondary, light: colors.secondaryLight, dark: colors.secondary};
      case 'success':
        return {main: colors.success, light: colors.successLight, dark: colors.success};
      case 'warning':
        return {main: colors.warning, light: colors.warningLight, dark: colors.warning};
      case 'error':
        return {main: colors.error, light: colors.errorLight, dark: colors.error};
      case 'neutral':
        return {main: colors.textSecondary, light: colors.background, dark: colors.text};
      default:
        return {main: colors.primary, light: colors.primaryLight, dark: colors.primaryDark};
    }
  };

  const colorValues = getColorValues();
  const sizeConfig = SIZE_CONFIG[size];

  const getVariantStyles = (): {container: ViewStyle; text: TextStyle} => {
    switch (variant) {
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: colorValues.main,
          },
          text: {
            color: colorValues.main,
          },
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: {
            color: colorValues.main,
          },
        };
      case 'soft':
        return {
          container: {
            backgroundColor: colorValues.light,
          },
          text: {
            color: colorValues.main,
          },
        };
      case 'link':
        return {
          container: {
            backgroundColor: 'transparent',
            paddingHorizontal: 0,
            paddingVertical: 0,
          },
          text: {
            color: colorValues.main,
            textDecorationLine: 'underline',
          },
        };
      default: // solid
        return {
          container: {
            backgroundColor: colorValues.main,
            ...SHADOWS.colored[color === 'neutral' ? 'primary' : color as keyof typeof SHADOWS.colored] || SHADOWS.colored.primary,
          },
          text: {
            color: colors.textOnPrimary,
          },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const isDisabled = disabled || loading;

  const containerStyle: ViewStyle = {
    ...styles.container,
    ...variantStyles.container,
    paddingHorizontal: sizeConfig.paddingH,
    paddingVertical: sizeConfig.paddingV,
    borderRadius: rounded ? RADIUS.full : RADIUS.lg,
    opacity: isDisabled ? 0.5 : 1,
    ...(fullWidth && {width: '100%'}),
  };

  const labelStyle: TextStyle = {
    ...styles.text,
    ...variantStyles.text,
    fontSize: sizeConfig.fontSize,
  };

  return (
    <Animated.View style={[{transform: [{scale: scaleAnim}], opacity: opacityAnim}, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={containerStyle}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityState={{disabled: isDisabled, busy: loading}}
        android_ripple={variant === 'solid' ? {color: 'rgba(255,255,255,0.2)', borderless: false} : undefined}>
        {loading ? (
          <ActivityIndicator 
            size="small" 
            color={variant === 'solid' ? colors.textOnPrimary : colorValues.main} 
          />
        ) : (
          <View style={styles.content}>
            {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
            <Text style={[labelStyle, textStyle]}>{title}</Text>
            {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

// Icon Button Variant
interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  size?: ButtonSize;
  color?: ButtonColor;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 'md',
  color = 'primary',
  variant = 'ghost',
  disabled = false,
  style,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const {colors} = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      ...ANIMATION.spring.snappy,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...ANIMATION.spring.default,
    }).start();
  }, [scaleAnim]);

  const sizeConfig = SIZE_CONFIG[size];
  const buttonSize = sizeConfig.paddingV * 2 + sizeConfig.iconSize + 4;

  return (
    <Animated.View style={[{transform: [{scale: scaleAnim}]}, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{disabled}}
        hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
        style={[
          styles.iconButton,
          {
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
            backgroundColor: variant === 'solid' ? colors.primary : 'transparent',
            opacity: disabled ? 0.5 : 1,
          },
        ]}>
        {icon}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: TYPOGRAPHY.weight.semibold,
    textAlign: 'center',
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
  leftIcon: {
    marginRight: SPACING[2],
  },
  rightIcon: {
    marginLeft: SPACING[2],
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PremiumButton;

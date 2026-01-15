/**
 * Elite Input Components
 * Material You + iOS style text inputs with fluid animations
 * Features: Floating labels, validation states, haptic feedback
 */

import React, { useRef, useState, useCallback, useMemo, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
  TextInputProps,
  Pressable,
  Platform,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import {
  ELITE_TYPOGRAPHY,
  ELITE_SPACING,
  ELITE_RADIUS,
  ELITE_SHADOWS,
  ELITE_MOTION,
  ELITE_COLORS,
  ELITE_A11Y,
} from '../../constants/elite';
import { Haptics } from '../../utils/haptics';
import { Icon } from '../icons';

// ============================================================================
// TYPES
// ============================================================================
type InputVariant = 'outlined' | 'filled' | 'underlined';
type InputSize = 'sm' | 'md' | 'lg';
type InputState = 'default' | 'focused' | 'error' | 'success' | 'disabled';

interface EliteInputProps extends Omit<TextInputProps, 'style'> {
  // Content
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  
  // Appearance
  variant?: InputVariant;
  size?: InputSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  
  // State
  error?: boolean;
  success?: boolean;
  disabled?: boolean;
  required?: boolean;
  
  // Customization
  style?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  
  // Callbacks
  onFocus?: () => void;
  onBlur?: () => void;
}

// ============================================================================
// SIZE CONFIGURATIONS
// ============================================================================
const SIZE_CONFIG: Record<InputSize, {
  height: number;
  paddingH: number;
  fontSize: number;
  labelSize: number;
  iconSize: number;
}> = {
  sm: {
    height: 44,
    paddingH: ELITE_SPACING[3],
    fontSize: ELITE_TYPOGRAPHY.fluid.footnote,
    labelSize: ELITE_TYPOGRAPHY.fluid.caption2,
    iconSize: 18,
  },
  md: {
    height: 52,
    paddingH: ELITE_SPACING[4],
    fontSize: ELITE_TYPOGRAPHY.fluid.body,
    labelSize: ELITE_TYPOGRAPHY.fluid.caption,
    iconSize: 20,
  },
  lg: {
    height: 60,
    paddingH: ELITE_SPACING[5],
    fontSize: ELITE_TYPOGRAPHY.fluid.callout,
    labelSize: ELITE_TYPOGRAPHY.fluid.footnote,
    iconSize: 22,
  },
};

// ============================================================================
// ELITE INPUT COMPONENT
// ============================================================================
export const EliteInput = forwardRef<TextInput, EliteInputProps>(({
  label,
  placeholder,
  helperText,
  errorText,
  variant = 'outlined',
  size = 'md',
  leftIcon,
  rightIcon,
  error = false,
  success = false,
  disabled = false,
  required = false,
  style,
  inputStyle,
  labelStyle,
  value,
  onFocus,
  onBlur,
  onChangeText,
  ...textInputProps
}, ref) => {
  const { colors, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!value);

  // Animations
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const sizeConfig = SIZE_CONFIG[size];

  // Determine current state
  const currentState: InputState = useMemo(() => {
    if (disabled) return 'disabled';
    if (error || errorText) return 'error';
    if (success) return 'success';
    if (isFocused) return 'focused';
    return 'default';
  }, [disabled, error, success, isFocused, errorText]);

  // Get state colors
  const stateColors = useMemo(() => {
    switch (currentState) {
      case 'error':
        return {
          border: colors.error,
          label: colors.error,
          icon: colors.error,
        };
      case 'success':
        return {
          border: colors.success,
          label: colors.success,
          icon: colors.success,
        };
      case 'focused':
        return {
          border: colors.primary,
          label: colors.primary,
          icon: colors.primary,
        };
      case 'disabled':
        return {
          border: colors.border,
          label: colors.textMuted,
          icon: colors.textMuted,
        };
      default:
        return {
          border: colors.border,
          label: colors.textSecondary,
          icon: colors.textSecondary,
        };
    }
  }, [currentState, colors]);

  // Animate label on focus/blur
  const animateLabel = useCallback((toValue: number) => {
    Animated.parallel([
      Animated.spring(labelAnim, {
        toValue,
        useNativeDriver: false,
        ...ELITE_MOTION.spring.snappy,
      }),
      Animated.timing(borderAnim, {
        toValue,
        duration: ELITE_MOTION.duration.fast,
        useNativeDriver: false,
      }),
    ]).start();
  }, [labelAnim, borderAnim]);

  // Shake animation for errors
  const triggerShake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  // Handle focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    Haptics.light();
    
    if (!hasValue) {
      animateLabel(1);
    }

    Animated.spring(scaleAnim, {
      toValue: 1.01,
      useNativeDriver: true,
      ...ELITE_MOTION.spring.gentle,
    }).start();

    onFocus?.();
  }, [hasValue, animateLabel, scaleAnim, onFocus]);

  // Handle blur
  const handleBlur = useCallback(() => {
    setIsFocused(false);

    if (!hasValue) {
      animateLabel(0);
    }

    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...ELITE_MOTION.spring.gentle,
    }).start();

    // Trigger shake if error
    if (error || errorText) {
      triggerShake();
      Haptics.warning();
    }

    onBlur?.();
  }, [hasValue, animateLabel, scaleAnim, error, errorText, triggerShake, onBlur]);

  // Handle text change
  const handleChangeText = useCallback((text: string) => {
    setHasValue(!!text);

    if (text && !hasValue) {
      animateLabel(1);
    } else if (!text && hasValue && !isFocused) {
      animateLabel(0);
    }

    onChangeText?.(text);
  }, [hasValue, isFocused, animateLabel, onChangeText]);

  // Get variant styles
  const getVariantStyle = (): ViewStyle => {
    const shadowStyle = isDark ? ELITE_SHADOWS.dark : ELITE_SHADOWS.light;

    switch (variant) {
      case 'filled':
        return {
          backgroundColor: isDark ? colors.card : colors.background,
          borderWidth: 0,
          borderBottomWidth: 2,
          borderRadius: ELITE_RADIUS.md,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        };
      case 'underlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
          borderBottomWidth: 2,
          borderRadius: 0,
        };
      default: // outlined
        return {
          backgroundColor: isDark ? colors.card : colors.background,
          borderWidth: 1.5,
          borderRadius: ELITE_RADIUS.input,
          ...(isFocused && shadowStyle.xs),
        };
    }
  };

  // Animated border color
  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, stateColors.border],
  });

  // Animated label position
  const labelTop = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [sizeConfig.height / 2 - 8, variant === 'outlined' ? -8 : 6],
  });

  const labelFontSize = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [sizeConfig.fontSize, sizeConfig.labelSize],
  });

  const labelColor = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.textMuted, stateColors.label],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateX: shakeAnim }] },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.inputContainer,
          getVariantStyle(),
          {
            height: sizeConfig.height,
            borderColor,
            opacity: disabled ? 0.5 : 1,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Left Icon */}
        {leftIcon && (
          <View style={[styles.iconContainer, { marginRight: ELITE_SPACING[2] }]}>
            {leftIcon}
          </View>
        )}

        {/* Input Wrapper */}
        <View style={styles.inputWrapper}>
          {/* Floating Label */}
          {label && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.labelContainer,
                {
                  top: labelTop,
                  left: leftIcon ? sizeConfig.paddingH + sizeConfig.iconSize + ELITE_SPACING[2] : sizeConfig.paddingH,
                },
              ]}
            >
              <Animated.Text
                style={[
                  styles.label,
                  {
                    fontSize: labelFontSize,
                    color: labelColor,
                    backgroundColor: variant === 'outlined' && (isFocused || hasValue)
                      ? (isDark ? colors.card : colors.background)
                      : 'transparent',
                    paddingHorizontal: variant === 'outlined' && (isFocused || hasValue) ? 4 : 0,
                  },
                  labelStyle,
                ]}
              >
                {label}{required && <Text style={{ color: colors.error }}> *</Text>}
              </Animated.Text>
            </Animated.View>
          )}

          {/* Text Input */}
          <TextInput
            ref={ref}
            style={[
              styles.input,
              {
                fontSize: sizeConfig.fontSize,
                color: colors.text,
                paddingHorizontal: sizeConfig.paddingH,
                paddingTop: label && variant !== 'underlined' ? ELITE_SPACING[2] : 0,
              },
              inputStyle,
            ]}
            value={value}
            placeholder={isFocused || !label ? placeholder : undefined}
            placeholderTextColor={colors.textMuted}
            editable={!disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChangeText={handleChangeText}
            {...textInputProps}
          />
        </View>

        {/* Right Icon */}
        {rightIcon && (
          <View style={[styles.iconContainer, { marginLeft: ELITE_SPACING[2] }]}>
            {rightIcon}
          </View>
        )}
      </Animated.View>

      {/* Helper/Error Text */}
      {(helperText || errorText) && (
        <Text
          style={[
            styles.helperText,
            {
              color: currentState === 'error' ? colors.error : colors.textSecondary,
            },
          ]}
        >
          {errorText || helperText}
        </Text>
      )}
    </Animated.View>
  );
});

EliteInput.displayName = 'EliteInput';

// ============================================================================
// ELITE SEARCH INPUT
// ============================================================================
interface EliteSearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  onClear?: () => void;
  autoFocus?: boolean;
  style?: ViewStyle;
}

export const EliteSearchInput: React.FC<EliteSearchInputProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  onSubmit,
  onClear,
  autoFocus = false,
  style,
}) => {
  const { colors, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    Haptics.light();

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1.01,
        useNativeDriver: true,
        ...ELITE_MOTION.spring.gentle,
      }),
      Animated.timing(focusAnim, {
        toValue: 1,
        duration: ELITE_MOTION.duration.fast,
        useNativeDriver: false,
      }),
    ]).start();
  }, [scaleAnim, focusAnim]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        ...ELITE_MOTION.spring.gentle,
      }),
      Animated.timing(focusAnim, {
        toValue: 0,
        duration: ELITE_MOTION.duration.fast,
        useNativeDriver: false,
      }),
    ]).start();
  }, [scaleAnim, focusAnim]);

  const handleClear = useCallback(() => {
    Haptics.light();
    onChangeText('');
    onClear?.();
  }, [onChangeText, onClear]);

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  const shadowStyle = isDark ? ELITE_SHADOWS.dark : ELITE_SHADOWS.light;

  return (
    <Animated.View
      style={[
        styles.searchContainer,
        {
          backgroundColor: isDark ? colors.card : colors.background,
          borderColor,
          transform: [{ scale: scaleAnim }],
        },
        isFocused && shadowStyle.sm,
        style,
      ]}
    >
      {/* Search Icon */}
      <View style={styles.searchIcon}>
        <Icon
          name="search"
          family="Ionicons"
          size={18}
          color={isFocused ? colors.primary : colors.textMuted}
        />
      </View>

      {/* Input */}
      <TextInput
        style={[
          styles.searchInput,
          { color: colors.text },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
      />

      {/* Clear Button */}
      {value.length > 0 && (
        <Pressable
          onPress={handleClear}
          style={styles.clearButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View
            style={[
              styles.clearIcon,
              { backgroundColor: colors.textMuted + '30' },
            ]}
          >
            <Icon
              name="close"
              family="Ionicons"
              size={12}
              color={colors.textSecondary}
            />
          </View>
        </Pressable>
      )}
    </Animated.View>
  );
};

// ============================================================================
// ELITE OTP INPUT
// ============================================================================
interface EliteOTPInputProps {
  length?: number;
  value: string;
  onChangeText: (text: string) => void;
  onComplete?: (code: string) => void;
  error?: boolean;
  style?: ViewStyle;
}

export const EliteOTPInput: React.FC<EliteOTPInputProps> = ({
  length = 6,
  value,
  onChangeText,
  onComplete,
  error = false,
  style,
}) => {
  const { colors, isDark } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const handlePress = useCallback(() => {
    inputRef.current?.focus();
    Haptics.light();
  }, []);

  const handleChangeText = useCallback((text: string) => {
    // Only allow digits
    const filtered = text.replace(/[^0-9]/g, '').slice(0, length);
    onChangeText(filtered);

    if (filtered.length === length) {
      Haptics.success();
      onComplete?.(filtered);
    }
  }, [length, onChangeText, onComplete]);

  // Shake on error
  React.useEffect(() => {
    if (error) {
      Haptics.error();
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  }, [error, shakeAnim]);

  return (
    <Animated.View
      style={[
        styles.otpContainer,
        { transform: [{ translateX: shakeAnim }] },
        style,
      ]}
    >
      <Pressable onPress={handlePress} style={styles.otpBoxes}>
        {Array.from({ length }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.otpBox,
              {
                backgroundColor: isDark ? colors.card : colors.background,
                borderColor: error
                  ? colors.error
                  : value.length === index
                    ? colors.primary
                    : colors.border,
                borderWidth: value.length === index ? 2 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.otpText,
                { color: colors.text },
              ]}
            >
              {value[index] || ''}
            </Text>
            {value.length === index && (
              <Animated.View
                style={[
                  styles.otpCursor,
                  { backgroundColor: colors.primary },
                ]}
              />
            )}
          </View>
        ))}
      </Pressable>

      {/* Hidden Input */}
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={value}
        onChangeText={handleChangeText}
        keyboardType="number-pad"
        maxLength={length}
        autoFocus
      />
    </Animated.View>
  );
};

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    marginBottom: ELITE_SPACING[4],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  inputWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  labelContainer: {
    position: 'absolute',
    zIndex: 1,
  },
  label: {
    fontWeight: ELITE_TYPOGRAPHY.weight.medium,
  },
  input: {
    flex: 1,
    fontWeight: ELITE_TYPOGRAPHY.weight.regular,
    paddingVertical: 0,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
  },
  helperText: {
    marginTop: ELITE_SPACING[1],
    marginLeft: ELITE_SPACING[4],
    fontSize: ELITE_TYPOGRAPHY.fluid.caption,
    fontWeight: ELITE_TYPOGRAPHY.weight.regular,
  },

  // Search Input
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ELITE_A11Y.touchTarget.comfortable,
    borderRadius: ELITE_RADIUS.xl,
    paddingHorizontal: ELITE_SPACING[4],
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: ELITE_SPACING[2],
  },
  searchInput: {
    flex: 1,
    fontSize: ELITE_TYPOGRAPHY.fluid.body,
    fontWeight: ELITE_TYPOGRAPHY.weight.regular,
    paddingVertical: 0,
  },
  clearButton: {
    padding: ELITE_SPACING[1],
    marginLeft: ELITE_SPACING[2],
  },
  clearIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // OTP Input
  otpContainer: {
    position: 'relative',
  },
  otpBoxes: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: ELITE_SPACING[2],
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: ELITE_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  otpText: {
    fontSize: ELITE_TYPOGRAPHY.fluid.title2,
    fontWeight: ELITE_TYPOGRAPHY.weight.semibold,
  },
  otpCursor: {
    position: 'absolute',
    bottom: 12,
    width: 20,
    height: 2,
    borderRadius: 1,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
});

export default EliteInput;

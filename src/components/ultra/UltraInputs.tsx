/**
 * Ultra Premium Input Components
 * Crystal Clear, No Blur, Professional-Grade
 */

import React, { useRef, useState, useCallback, memo, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ViewStyle,
  TextInputProps,
  Platform,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import {
  ULTRA_TYPOGRAPHY,
  ULTRA_SPACING,
  ULTRA_RADIUS,
  ULTRA_SHADOWS,
  ULTRA_MOTION,
  ULTRA_GLASS,
  ULTRA_A11Y,
  pixelPerfect,
} from '../../constants/ultra-design';
import { Icon } from '../icons';
import { Haptics } from '../../utils/haptics';

// ============================================================================
// ULTRA SEARCH BAR - Crystal Clear Search Input
// ============================================================================

interface UltraSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  variant?: 'default' | 'filled' | 'outlined' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onSubmit?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

const SEARCH_SIZE = {
  sm: { height: pixelPerfect(40), fontSize: ULTRA_TYPOGRAPHY.scale.footnote, iconSize: pixelPerfect(16), padding: ULTRA_SPACING[3] },
  md: { height: pixelPerfect(48), fontSize: ULTRA_TYPOGRAPHY.scale.subhead, iconSize: pixelPerfect(18), padding: ULTRA_SPACING[4] },
  lg: { height: pixelPerfect(56), fontSize: ULTRA_TYPOGRAPHY.scale.body, iconSize: pixelPerfect(20), padding: ULTRA_SPACING[5] },
};

export const UltraSearchBar = memo<UltraSearchBarProps>(({
  value,
  onChangeText,
  placeholder = 'Search...',
  autoFocus = false,
  variant = 'default',
  size = 'md',
  leftIcon,
  rightIcon,
  onSubmit,
  onFocus,
  onBlur,
  disabled = false,
  style,
}) => {
  const { colors, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const sizeConfig = SEARCH_SIZE[size];
  const shadowStyle = isDark ? ULTRA_SHADOWS.dark : ULTRA_SHADOWS.light;

  const handleFocus = useCallback((e?: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(true);
    Haptics.light();
    
    Animated.parallel([
      Animated.spring(focusAnim, {
        toValue: 1,
        useNativeDriver: false,
        ...ULTRA_MOTION.spring.snappy,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1.005,
        useNativeDriver: true,
        ...ULTRA_MOTION.spring.gentle,
      }),
    ]).start();
    
    onFocus?.();
  }, [focusAnim, scaleAnim, onFocus]);

  const handleBlur = useCallback((e?: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(false);
    
    Animated.parallel([
      Animated.spring(focusAnim, {
        toValue: 0,
        useNativeDriver: false,
        ...ULTRA_MOTION.spring.snappy,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        ...ULTRA_MOTION.spring.gentle,
      }),
    ]).start();
    
    onBlur?.();
  }, [focusAnim, scaleAnim, onBlur]);

  const handleClear = useCallback(() => {
    Haptics.light();
    onChangeText('');
  }, [onChangeText]);

  // Get variant styles
  const getVariantStyle = useCallback((): ViewStyle => {
    const glass = isDark ? ULTRA_GLASS.dark.medium : ULTRA_GLASS.light.medium;
    
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: colors.background,
          borderWidth: 0,
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: pixelPerfect(1.5),
          borderColor: isFocused ? colors.primary : colors.border,
        };
      case 'glass':
        return {
          backgroundColor: glass.backgroundColor,
          borderWidth: glass.borderWidth,
          borderColor: glass.borderColor,
        };
      default:
        return {
          backgroundColor: colors.card,
          borderWidth: pixelPerfect(1),
          borderColor: isFocused ? colors.primary : colors.border,
        };
    }
  }, [variant, colors, isDark, isFocused]);

  const borderColorAnimated = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  return (
    <Animated.View
      style={[
        styles.searchContainer,
        getVariantStyle(),
        {
          height: sizeConfig.height,
          borderRadius: ULTRA_RADIUS.xl,
          borderColor: variant !== 'filled' ? borderColorAnimated : undefined,
          transform: [{ scale: scaleAnim }],
          opacity: disabled ? 0.5 : 1,
        },
        isFocused && variant !== 'glass' && shadowStyle.sm,
        style,
      ]}
    >
      {/* Search Icon */}
      <View style={[styles.searchIcon, { marginRight: ULTRA_SPACING[2] }]}>
        {leftIcon || (
          <Icon
            name="search"
            family="Ionicons"
            size={sizeConfig.iconSize}
            color={isFocused ? colors.primary : colors.textMuted}
          />
        )}
      </View>

      {/* Input */}
      <TextInput
        style={[
          styles.searchInput,
          {
            fontSize: sizeConfig.fontSize,
            color: colors.text,
            fontFamily: ULTRA_TYPOGRAPHY.fontFamily.text,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
        onFocus={() => handleFocus()}
        onBlur={() => handleBlur()}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        editable={!disabled}
        selectionColor={colors.primary}
      />

      {/* Clear Button */}
      {value.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClear}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <View
            style={[
              styles.clearIcon,
              { backgroundColor: `${colors.textMuted}20` },
            ]}
          >
            <Icon
              name="close"
              family="Ionicons"
              size={sizeConfig.iconSize - 4}
              color={colors.textMuted}
            />
          </View>
        </TouchableOpacity>
      )}

      {/* Right Icon */}
      {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
    </Animated.View>
  );
});

// ============================================================================
// ULTRA TEXT INPUT - Professional Form Input
// ============================================================================

interface UltraTextInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  hint?: string;
  error?: string;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
}

const INPUT_SIZE = {
  sm: { height: pixelPerfect(44), fontSize: ULTRA_TYPOGRAPHY.scale.footnote, padding: ULTRA_SPACING[3], labelSize: ULTRA_TYPOGRAPHY.scale.caption },
  md: { height: pixelPerfect(52), fontSize: ULTRA_TYPOGRAPHY.scale.subhead, padding: ULTRA_SPACING[4], labelSize: ULTRA_TYPOGRAPHY.scale.footnote },
  lg: { height: pixelPerfect(60), fontSize: ULTRA_TYPOGRAPHY.scale.body, padding: ULTRA_SPACING[5], labelSize: ULTRA_TYPOGRAPHY.scale.subhead },
};

export const UltraTextInput = memo(forwardRef<TextInput, UltraTextInputProps>(({
  label,
  hint,
  error,
  variant = 'default',
  size = 'md',
  leftIcon,
  rightIcon,
  disabled = false,
  required = false,
  containerStyle,
  inputStyle,
  ...textInputProps
}, ref) => {
  const { colors, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  const sizeConfig = INPUT_SIZE[size];
  const shadowStyle = isDark ? ULTRA_SHADOWS.dark : ULTRA_SHADOWS.light;
  const hasError = !!error;

  const handleFocus = useCallback((e?: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(true);
    Haptics.light();
    
    Animated.spring(focusAnim, {
      toValue: 1,
      useNativeDriver: false,
      ...ULTRA_MOTION.spring.snappy,
    }).start();
    
    if (e) textInputProps.onFocus?.(e);
  }, [focusAnim, textInputProps]);

  const handleBlur = useCallback((e?: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(false);
    
    Animated.spring(focusAnim, {
      toValue: 0,
      useNativeDriver: false,
      ...ULTRA_MOTION.spring.snappy,
    }).start();
    
    if (e) textInputProps.onBlur?.(e);
  }, [focusAnim, textInputProps]);

  // Get border color
  const getBorderColor = () => {
    if (hasError) return colors.error;
    if (isFocused) return colors.primary;
    return colors.border;
  };

  // Get variant styles
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: colors.background,
          borderWidth: 0,
          borderBottomWidth: pixelPerfect(2),
          borderBottomColor: getBorderColor(),
          borderRadius: 0,
          borderTopLeftRadius: ULTRA_RADIUS.md,
          borderTopRightRadius: ULTRA_RADIUS.md,
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: pixelPerfect(1.5),
          borderColor: getBorderColor(),
          borderRadius: ULTRA_RADIUS.input,
        };
      default:
        return {
          backgroundColor: colors.card,
          borderWidth: pixelPerfect(1),
          borderColor: getBorderColor(),
          borderRadius: ULTRA_RADIUS.input,
          ...(isFocused && shadowStyle.sm),
        };
    }
  };

  const borderColorAnimated = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [hasError ? colors.error : colors.border, hasError ? colors.error : colors.primary],
  });

  return (
    <View style={[styles.inputContainer, containerStyle]}>
      {/* Label */}
      {label && (
        <View style={styles.labelRow}>
          <Text
            style={[
              styles.label,
              {
                fontSize: sizeConfig.labelSize,
                color: hasError ? colors.error : (isFocused ? colors.primary : colors.textSecondary),
              },
            ]}
          >
            {label}
            {required && <Text style={{ color: colors.error }}> *</Text>}
          </Text>
        </View>
      )}

      {/* Input Container */}
      <Animated.View
        style={[
          styles.inputWrapper,
          getVariantStyle(),
          {
            minHeight: sizeConfig.height,
            borderColor: variant !== 'filled' ? borderColorAnimated : undefined,
            opacity: disabled ? 0.5 : 1,
          },
          inputStyle,
        ]}
      >
        {leftIcon && (
          <View style={[styles.inputIcon, { marginRight: ULTRA_SPACING[2] }]}>
            {leftIcon}
          </View>
        )}

        <TextInput
          ref={ref}
          style={[
            styles.textInput,
            {
              fontSize: sizeConfig.fontSize,
              color: colors.text,
              paddingHorizontal: !leftIcon && !rightIcon ? sizeConfig.padding : ULTRA_SPACING[1],
              fontFamily: ULTRA_TYPOGRAPHY.fontFamily.text,
            },
          ]}
          placeholderTextColor={colors.placeholder}
          editable={!disabled}
          selectionColor={colors.primary}
          onFocus={() => handleFocus()}
          onBlur={() => handleBlur()}
          {...textInputProps}
        />

        {rightIcon && (
          <View style={[styles.inputIcon, { marginLeft: ULTRA_SPACING[2] }]}>
            {rightIcon}
          </View>
        )}
      </Animated.View>

      {/* Error or Hint */}
      {(error || hint) && (
        <Text
          style={[
            styles.helperText,
            {
              color: hasError ? colors.error : colors.textMuted,
              fontSize: ULTRA_TYPOGRAPHY.scale.caption,
            },
          ]}
        >
          {error || hint}
        </Text>
      )}
    </View>
  );
}));

// ============================================================================
// ULTRA SELECT / DROPDOWN (Basic)
// ============================================================================

interface UltraSelectOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface UltraSelectProps {
  label?: string;
  placeholder?: string;
  value?: string;
  options: UltraSelectOption[];
  onSelect: (value: string) => void;
  error?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export const UltraSelect = memo<UltraSelectProps>(({
  label,
  placeholder = 'Select an option',
  value,
  options,
  onSelect,
  error,
  disabled = false,
  style,
}) => {
  const { colors, isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const shadowStyle = isDark ? ULTRA_SHADOWS.dark : ULTRA_SHADOWS.light;
  const hasError = !!error;

  const selectedOption = options.find(opt => opt.value === value);

  const handlePress = useCallback(() => {
    if (disabled) return;
    Haptics.light();
    
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      ...ULTRA_MOTION.spring.snappy,
    }).start(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        ...ULTRA_MOTION.spring.default,
      }).start();
    });
    
    setIsOpen(!isOpen);
  }, [disabled, scaleAnim, isOpen]);

  const handleSelect = useCallback((optionValue: string) => {
    Haptics.medium();
    onSelect(optionValue);
    setIsOpen(false);
  }, [onSelect]);

  return (
    <View style={[styles.selectContainer, style]}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              fontSize: ULTRA_TYPOGRAPHY.scale.footnote,
              color: hasError ? colors.error : colors.textSecondary,
            },
          ]}
        >
          {label}
        </Text>
      )}

      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[
            styles.selectTrigger,
            {
              backgroundColor: colors.card,
              borderColor: hasError ? colors.error : colors.border,
              opacity: disabled ? 0.5 : 1,
            },
            shadowStyle.xs,
          ]}
          onPress={handlePress}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={label || 'Select'}
          accessibilityState={{ expanded: isOpen }}
        >
          {selectedOption?.icon && (
            <View style={{ marginRight: ULTRA_SPACING[2] }}>
              {selectedOption.icon}
            </View>
          )}
          <Text
            style={[
              styles.selectText,
              {
                color: selectedOption ? colors.text : colors.placeholder,
                fontSize: ULTRA_TYPOGRAPHY.scale.subhead,
              },
            ]}
            numberOfLines={1}
          >
            {selectedOption?.label || placeholder}
          </Text>
          <Icon
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            family="Ionicons"
            size={pixelPerfect(18)}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </Animated.View>

      {/* Dropdown Options */}
      {isOpen && (
        <View
          style={[
            styles.selectDropdown,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
            shadowStyle.lg,
          ]}
        >
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.selectOption,
                option.value === value && { backgroundColor: colors.primaryLight },
              ]}
              onPress={() => handleSelect(option.value)}
              accessibilityRole="button"
              accessibilityState={{ selected: option.value === value }}
            >
              {option.icon && (
                <View style={{ marginRight: ULTRA_SPACING[2] }}>
                  {option.icon}
                </View>
              )}
              <Text
                style={[
                  styles.selectOptionText,
                  {
                    color: option.value === value ? colors.primary : colors.text,
                    fontSize: ULTRA_TYPOGRAPHY.scale.subhead,
                    fontWeight: option.value === value
                      ? ULTRA_TYPOGRAPHY.weight.semibold
                      : ULTRA_TYPOGRAPHY.weight.regular,
                  },
                ]}
              >
                {option.label}
              </Text>
              {option.value === value && (
                <Icon
                  name="checkmark"
                  family="Ionicons"
                  size={pixelPerfect(18)}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {error && (
        <Text
          style={[
            styles.helperText,
            {
              color: colors.error,
              fontSize: ULTRA_TYPOGRAPHY.scale.caption,
            },
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ULTRA_SPACING[4],
  },
  searchIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 0,
  },
  clearButton: {
    padding: ULTRA_SPACING[1],
    marginLeft: ULTRA_SPACING[2],
  },
  clearIcon: {
    width: pixelPerfect(24),
    height: pixelPerfect(24),
    borderRadius: pixelPerfect(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIcon: {
    marginLeft: ULTRA_SPACING[2],
  },

  // Text Input
  inputContainer: {
    marginBottom: ULTRA_SPACING[4],
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ULTRA_SPACING[1.5],
  },
  label: {
    fontWeight: ULTRA_TYPOGRAPHY.weight.medium,
    letterSpacing: ULTRA_TYPOGRAPHY.tracking.wide,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ULTRA_SPACING[4],
  },
  inputIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    paddingVertical: 0,
  },
  helperText: {
    marginTop: ULTRA_SPACING[1],
    paddingLeft: ULTRA_SPACING[1],
  },

  // Select
  selectContainer: {
    marginBottom: ULTRA_SPACING[4],
    zIndex: 10,
  },
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: pixelPerfect(52),
    paddingHorizontal: ULTRA_SPACING[4],
    borderRadius: ULTRA_RADIUS.input,
    borderWidth: pixelPerfect(1),
  },
  selectText: {
    flex: 1,
  },
  selectDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: ULTRA_SPACING[1],
    borderRadius: ULTRA_RADIUS.lg,
    borderWidth: pixelPerfect(1),
    overflow: 'hidden',
    zIndex: 100,
  },
  selectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ULTRA_SPACING[3],
    paddingHorizontal: ULTRA_SPACING[4],
  },
  selectOptionText: {
    flex: 1,
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  UltraSearchBar,
  UltraTextInput,
  UltraSelect,
};

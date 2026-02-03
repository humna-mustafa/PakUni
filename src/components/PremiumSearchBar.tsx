/**
 * PremiumSearchBar Component  
 * Production-ready search input with animations and advanced features
 * 
 * UNIFIED SEARCH BAR - Use this component across ALL screens for consistency
 * Supports multiple variants and sizes for different contexts
 */

import React, {useRef, useState, useCallback, memo} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
  Platform,
  Pressable,
} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import {RADIUS, SPACING, SHADOWS, TYPOGRAPHY, ANIMATION} from '../constants/design';
import {Icon} from './icons';

interface PremiumSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onSubmit?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onClear?: () => void;
  style?: ViewStyle;
  containerStyle?: ViewStyle;
  variant?: 'default' | 'filled' | 'outlined' | 'glass' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showClearButton?: boolean;
  disabled?: boolean;
  testID?: string;
}

// Consistent sizing across all screens
const SIZE_CONFIG = {
  sm: {height: 40, fontSize: 14, iconSize: 16, padding: SPACING[3], clearSize: 18},
  md: {height: 48, fontSize: 15, iconSize: 18, padding: SPACING[4], clearSize: 20},
  lg: {height: 54, fontSize: 16, iconSize: 20, padding: SPACING[5], clearSize: 22},
};

export const PremiumSearchBar: React.FC<PremiumSearchBarProps> = memo(({
  value,
  onChangeText,
  placeholder = 'Search...',
  autoFocus = false,
  leftIcon,
  rightIcon,
  onSubmit,
  onFocus,
  onBlur,
  onClear,
  style,
  containerStyle,
  variant = 'default',
  size = 'md',
  showClearButton = true,
  disabled = false,
  testID,
}) => {
  const {colors, isDark} = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const inputRef = useRef<TextInput>(null);

  const sizeConfig = SIZE_CONFIG[size];

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    Animated.parallel([
      Animated.timing(focusAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1.005,
        useNativeDriver: true,
        tension: 300,
        friction: 20,
      }),
    ]).start();
    onFocus?.();
  }, [focusAnim, scaleAnim, onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    Animated.parallel([
      Animated.timing(focusAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 20,
      }),
    ]).start();
    onBlur?.();
  }, [focusAnim, scaleAnim, onBlur]);

  const handleClear = useCallback(() => {
    onChangeText('');
    onClear?.();
    inputRef.current?.focus();
  }, [onChangeText, onClear]);

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: isDark ? 'rgba(39, 44, 52, 0.9)' : colors.background,
          borderWidth: 1.5,
          borderColor: isFocused ? colors.primary : 'transparent',
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: isFocused ? colors.primary : colors.border,
        };
      case 'glass':
        return {
          backgroundColor: isDark 
            ? 'rgba(39, 44, 52, 0.75)' 
            : 'rgba(255, 255, 255, 0.8)',
          borderWidth: 1,
          borderColor: isDark 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(255, 255, 255, 0.6)',
        };
      case 'minimal':
        return {
          backgroundColor: isDark ? 'rgba(39, 44, 52, 0.6)' : 'rgba(0, 0, 0, 0.04)',
          borderWidth: 0,
        };
      default:
        return {
          backgroundColor: colors.card,
          borderWidth: 1.5,
          borderColor: isFocused ? colors.primary : colors.border,
        };
    }
  };

  const borderColorAnimated = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  return (
    <View style={containerStyle}>
      <Animated.View
        style={[
          styles.container,
          getVariantStyle(),
          {
            height: sizeConfig.height,
            borderRadius: RADIUS.xl,
            borderColor: variant !== 'filled' && variant !== 'minimal' ? borderColorAnimated : undefined,
            transform: [{scale: scaleAnim}],
            opacity: disabled ? 0.5 : 1,
          },
          isFocused && variant !== 'glass' && variant !== 'minimal' && SHADOWS.soft.sm,
          style,
        ]}
        testID={testID}>
        {/* Left Icon / Search Icon */}
        <View style={[styles.leftIcon, {marginRight: SPACING[2]}]}>
          {leftIcon || (
            <SearchIcon size={sizeConfig.iconSize} color={isFocused ? colors.primary : colors.textSecondary} />
          )}
        </View>

        {/* Input */}
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            {
              fontSize: sizeConfig.fontSize,
              color: colors.text,
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          autoFocus={autoFocus}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
          accessibilityLabel={placeholder}
          accessibilityHint="Type to search"
          accessibilityRole="search"
        />

        {/* Clear Button */}
        {showClearButton && value.length > 0 && (
          <Pressable 
            style={styles.clearButton} 
            onPress={handleClear}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
            <ClearIcon size={sizeConfig.clearSize - 4} color={colors.textSecondary} bgColor={colors.background} />
          </Pressable>
        )}

        {/* Right Icon */}
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </Animated.View>
    </View>
  );
});

// Premium Search Icon using vector icons
const SearchIcon: React.FC<{size: number; color: string}> = ({size, color}) => (
  <Icon
    name="search"
    family="Ionicons"
    size={size}
    color={color}
  />
);

const ClearIcon: React.FC<{size: number; color: string; bgColor: string}> = ({size, color, bgColor}) => (
  <View
    style={{
      width: size + 10,
      height: size + 10,
      borderRadius: (size + 10) / 2,
      backgroundColor: bgColor,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
    <Icon
      name="close"
      family="Ionicons"
      size={size}
      color={color}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[4],
  },
  leftIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    fontWeight: TYPOGRAPHY.weight.regular,
    ...Platform.select({
      android: {
        paddingVertical: 0,
      },
    }),
  },
  clearButton: {
    padding: SPACING[1],
    marginLeft: SPACING[2],
  },
  rightIcon: {
    marginLeft: SPACING[2],
  },
});

// Display name for debugging
PremiumSearchBar.displayName = 'PremiumSearchBar';

export default PremiumSearchBar;

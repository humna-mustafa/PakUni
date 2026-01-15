/**
 * PremiumSearchBar Component  
 * Production-ready search input with animations and advanced features
 */

import React, {useRef, useState, useCallback} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
  Platform,
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
  style?: ViewStyle;
  variant?: 'default' | 'filled' | 'outlined' | 'glass';
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CONFIG = {
  sm: {height: 40, fontSize: TYPOGRAPHY.scale.subhead, iconSize: 16, padding: SPACING[3]},
  md: {height: 48, fontSize: TYPOGRAPHY.scale.callout, iconSize: 18, padding: SPACING[4]},
  lg: {height: 56, fontSize: TYPOGRAPHY.scale.body, iconSize: 20, padding: SPACING[5]},
};

export const PremiumSearchBar: React.FC<PremiumSearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  autoFocus = false,
  leftIcon,
  rightIcon,
  onSubmit,
  onFocus,
  onBlur,
  style,
  variant = 'default',
  size = 'md',
}) => {
  const {colors, isDark} = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const sizeConfig = SIZE_CONFIG[size];

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    Animated.parallel([
      Animated.spring(focusAnim, {
        toValue: 1,
        useNativeDriver: false,
        ...ANIMATION.spring.snappy,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1.01,
        useNativeDriver: true,
        ...ANIMATION.spring.gentle,
      }),
    ]).start();
    onFocus?.();
  }, [focusAnim, scaleAnim, onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    Animated.parallel([
      Animated.spring(focusAnim, {
        toValue: 0,
        useNativeDriver: false,
        ...ANIMATION.spring.snappy,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        ...ANIMATION.spring.gentle,
      }),
    ]).start();
    onBlur?.();
  }, [focusAnim, scaleAnim, onBlur]);

  const handleClear = useCallback(() => {
    onChangeText('');
  }, [onChangeText]);

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: colors.background,
          borderWidth: 0,
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
            ? 'rgba(30, 41, 59, 0.6)' 
            : 'rgba(255, 255, 255, 0.8)',
          borderWidth: 1,
          borderColor: isDark 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(255, 255, 255, 0.6)',
        };
      default:
        return {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: isFocused ? colors.primary : colors.border,
        };
    }
  };

  const borderColorAnimated = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        getVariantStyle(),
        {
          height: sizeConfig.height,
          borderRadius: RADIUS.xl,
          borderColor: variant !== 'filled' ? borderColorAnimated : undefined,
          transform: [{scale: scaleAnim}],
        },
        isFocused && variant !== 'glass' && SHADOWS.soft.sm,
        style,
      ]}>
      {/* Left Icon / Search Icon */}
      <View style={[styles.leftIcon, {marginRight: SPACING[2]}]}>
        {leftIcon || (
          <SearchIcon size={sizeConfig.iconSize} color={isFocused ? colors.primary : colors.textMuted} />
        )}
      </View>

      {/* Input */}
      <TextInput
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
        placeholderTextColor={colors.placeholder}
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
        <TouchableOpacity 
          style={styles.clearButton} 
          onPress={handleClear}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
          <ClearIcon size={sizeConfig.iconSize - 2} color={colors.textMuted} />
        </TouchableOpacity>
      )}

      {/* Right Icon */}
      {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
    </Animated.View>
  );
};

// Premium Search Icon using vector icons
const SearchIcon: React.FC<{size: number; color: string}> = ({size, color}) => (
  <Icon
    name="search"
    family="Ionicons"
    size={size}
    color={color}
  />
);

const ClearIcon: React.FC<{size: number; color: string}> = ({size, color}) => (
  <View
    style={{
      width: size + 8,
      height: size + 8,
      borderRadius: (size + 8) / 2,
      backgroundColor: color + '20',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
    <Icon
      name="close"
      family="Ionicons"
      size={size - 2}
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
  },
  clearButton: {
    padding: SPACING[1],
    marginLeft: SPACING[2],
  },
  rightIcon: {
    marginLeft: SPACING[2],
  },
});

export default PremiumSearchBar;

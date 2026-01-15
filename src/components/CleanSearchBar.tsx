/**
 * CleanSearchBar Component - 2025 Design Standards
 * 
 * A minimal, focused search input that:
 * - Blends quietly into the UI until focused
 * - Provides clear visual feedback for states
 * - Follows accessibility best practices
 */

import React, { useRef, useState, useCallback, memo } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  ViewStyle,
  Animated,
  Platform,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import {
  CLEAN_SPACING,
  CLEAN_RADIUS,
  CLEAN_TYPOGRAPHY,
  CLEAN_MOTION,
  CLEAN_SHADOWS,
  CLEAN_COLORS,
  CLEAN_COLORS_DARK,
  CLEAN_A11Y,
} from '../constants/clean-design-2025';
import { Icon } from './icons';

// ============================================================================
// TYPES
// ============================================================================

type SearchVariant = 'default' | 'filled' | 'outlined';
type SearchSize = 'sm' | 'md' | 'lg';

interface CleanSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  variant?: SearchVariant;
  size?: SearchSize;
  autoFocus?: boolean;
  showClearButton?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onSubmit?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
}

// ============================================================================
// SIZE CONFIGURATIONS
// ============================================================================

interface SearchSizeConfig {
  height: number;
  paddingHorizontal: number;
  fontSize: number;
  iconSize: number;
  borderRadius: number;
}

const SEARCH_SIZES: Record<SearchSize, SearchSizeConfig> = {
  sm: {
    height: 36,
    paddingHorizontal: CLEAN_SPACING[3],
    fontSize: CLEAN_TYPOGRAPHY.size.sm,
    iconSize: 16,
    borderRadius: CLEAN_RADIUS.sm,
  },
  md: {
    height: 44,
    paddingHorizontal: CLEAN_SPACING[4],
    fontSize: CLEAN_TYPOGRAPHY.size.base,
    iconSize: 18,
    borderRadius: CLEAN_RADIUS.md,
  },
  lg: {
    height: 52,
    paddingHorizontal: CLEAN_SPACING[5],
    fontSize: CLEAN_TYPOGRAPHY.size.md,
    iconSize: 20,
    borderRadius: CLEAN_RADIUS.lg,
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export const CleanSearchBar: React.FC<CleanSearchBarProps> = memo(({
  value,
  onChangeText,
  placeholder = 'Search...',
  variant = 'default',
  size = 'md',
  autoFocus = false,
  showClearButton = true,
  leftIcon,
  rightIcon,
  onSubmit,
  onFocus,
  onBlur,
  disabled = false,
  style,
  testID,
}) => {
  const { colors, isDark } = useTheme();
  const palette = isDark ? CLEAN_COLORS_DARK : CLEAN_COLORS;
  const sizeConfig = SEARCH_SIZES[size];
  
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const borderColorAnim = useRef(new Animated.Value(0)).current;

  // Handle focus state animation
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
    
    Animated.timing(borderColorAnim, {
      toValue: 1,
      duration: CLEAN_MOTION.duration.fast,
      useNativeDriver: false,
    }).start();
  }, [borderColorAnim, onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
    
    Animated.timing(borderColorAnim, {
      toValue: 0,
      duration: CLEAN_MOTION.duration.fast,
      useNativeDriver: false,
    }).start();
  }, [borderColorAnim, onBlur]);

  // Clear button handler
  const handleClear = useCallback(() => {
    onChangeText('');
    inputRef.current?.focus();
  }, [onChangeText]);

  // Get variant styles
  const getVariantStyles = (): ViewStyle => {
    const borderColor = colors.border || palette.neutral[200];
    const focusBorder = colors.primary || palette.primary[500];
    const bgColor = colors.card || palette.neutral[0];
    const surfaceColor = colors.background || palette.neutral[100];

    switch (variant) {
      case 'filled':
        return {
          backgroundColor: surfaceColor,
          borderWidth: 1,
          borderColor: isFocused ? focusBorder : 'transparent',
        };

      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: isFocused ? focusBorder : borderColor,
        };

      case 'default':
      default:
        return {
          backgroundColor: bgColor,
          borderWidth: 1,
          borderColor: isFocused ? focusBorder : borderColor,
        };
    }
  };

  const containerStyle: ViewStyle = {
    ...getVariantStyles(),
    height: sizeConfig.height,
    borderRadius: sizeConfig.borderRadius,
    paddingHorizontal: sizeConfig.paddingHorizontal,
    opacity: disabled ? 0.5 : 1,
  };

  // Icon colors
  const iconColor = isFocused 
    ? (colors.primary || palette.primary[500])
    : (colors.textSecondary || palette.neutral[400]);

  return (
    <View style={[styles.container, containerStyle, style]} testID={testID}>
      {/* Left Icon (Search) */}
      {leftIcon || (
        <View style={styles.leftIcon}>
          <Icon
            name="search"
            family="Ionicons"
            size={sizeConfig.iconSize}
            color={iconColor}
          />
        </View>
      )}

      {/* Input */}
      <TextInput
        ref={inputRef}
        style={[
          styles.input,
          {
            fontSize: sizeConfig.fontSize,
            color: colors.text || palette.neutral[800],
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary || palette.neutral[400]}
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
          onPress={handleClear}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          accessibilityHint="Clears the current search text"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.clearButton}
        >
          <View
            style={[
              styles.clearIconContainer,
              {
                backgroundColor: colors.background || palette.neutral[200],
              },
            ]}
          >
            <Icon
              name="close"
              family="Ionicons"
              size={12}
              color={colors.textSecondary || palette.neutral[500]}
            />
          </View>
        </Pressable>
      )}

      {/* Right Icon (optional) */}
      {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
    </View>
  );
});

// ============================================================================
// SEARCH FIELD - Variant with label
// ============================================================================

interface SearchFieldProps extends CleanSearchBarProps {
  label?: string;
  error?: string;
  helperText?: string;
}

export const CleanSearchField: React.FC<SearchFieldProps> = memo(({
  label,
  error,
  helperText,
  style,
  ...searchProps
}) => {
  const { colors, isDark } = useTheme();
  const palette = isDark ? CLEAN_COLORS_DARK : CLEAN_COLORS;

  return (
    <View style={[styles.fieldContainer, style]}>
      {label && (
        <Animated.Text
          style={[
            styles.label,
            { color: colors.textSecondary || palette.neutral[600] },
          ]}
        >
          {label}
        </Animated.Text>
      )}
      
      <CleanSearchBar {...searchProps} />
      
      {(error || helperText) && (
        <Animated.Text
          style={[
            styles.helperText,
            {
              color: error
                ? palette.semantic.error.main
                : (colors.textSecondary || palette.neutral[500]),
            },
          ]}
        >
          {error || helperText}
        </Animated.Text>
      )}
    </View>
  );
});

// ============================================================================
// EXPANDABLE SEARCH - Collapses to icon, expands on tap
// ============================================================================

interface ExpandableSearchProps extends Omit<CleanSearchBarProps, 'style'> {
  expandedWidth?: number;
  collapsedWidth?: number;
}

export const ExpandableSearch: React.FC<ExpandableSearchProps> = memo(({
  expandedWidth = 280,
  collapsedWidth = 44,
  onFocus,
  onBlur,
  ...searchProps
}) => {
  const { colors, isDark } = useTheme();
  const palette = isDark ? CLEAN_COLORS_DARK : CLEAN_COLORS;
  
  const [isExpanded, setIsExpanded] = useState(false);
  const widthAnim = useRef(new Animated.Value(collapsedWidth)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const expand = useCallback(() => {
    setIsExpanded(true);
    Animated.parallel([
      Animated.spring(widthAnim, {
        toValue: expandedWidth,
        useNativeDriver: false,
        ...CLEAN_MOTION.spring.default,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: CLEAN_MOTION.duration.fast,
        useNativeDriver: false,
      }),
    ]).start();
    onFocus?.();
  }, [widthAnim, opacityAnim, expandedWidth, onFocus]);

  const collapse = useCallback(() => {
    if (searchProps.value.length > 0) return; // Keep expanded if there's text
    
    Animated.parallel([
      Animated.spring(widthAnim, {
        toValue: collapsedWidth,
        useNativeDriver: false,
        ...CLEAN_MOTION.spring.default,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: CLEAN_MOTION.duration.fast,
        useNativeDriver: false,
      }),
    ]).start(() => setIsExpanded(false));
    onBlur?.();
  }, [widthAnim, opacityAnim, collapsedWidth, searchProps.value, onBlur]);

  if (!isExpanded) {
    return (
      <Pressable
        onPress={expand}
        style={[
          styles.collapsedSearch,
          {
            width: collapsedWidth,
            height: collapsedWidth,
            borderRadius: collapsedWidth / 2,
            backgroundColor: colors.background || palette.neutral[100],
            borderWidth: 1,
            borderColor: colors.border || palette.neutral[200],
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Open search"
      >
        <Icon
          name="search"
          family="Ionicons"
          size={20}
          color={colors.textSecondary || palette.neutral[500]}
        />
      </Pressable>
    );
  }

  return (
    <Animated.View style={{ width: widthAnim }}>
      <CleanSearchBar
        {...searchProps}
        autoFocus
        onFocus={expand}
        onBlur={collapse}
      />
    </Animated.View>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftIcon: {
    marginRight: CLEAN_SPACING[2],
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    ...Platform.select({
      android: {
        paddingVertical: 0,
      },
    }),
  },
  clearButton: {
    marginLeft: CLEAN_SPACING[2],
  },
  clearIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIcon: {
    marginLeft: CLEAN_SPACING[2],
  },
  // Field styles
  fieldContainer: {
    width: '100%',
  },
  label: {
    fontSize: CLEAN_TYPOGRAPHY.size.sm,
    fontWeight: CLEAN_TYPOGRAPHY.weight.medium,
    marginBottom: CLEAN_SPACING[2],
  },
  helperText: {
    fontSize: CLEAN_TYPOGRAPHY.size.xs,
    marginTop: CLEAN_SPACING[1],
  },
  // Expandable styles
  collapsedSearch: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Display names
CleanSearchBar.displayName = 'CleanSearchBar';
CleanSearchField.displayName = 'CleanSearchField';
ExpandableSearch.displayName = 'ExpandableSearch';

export default CleanSearchBar;

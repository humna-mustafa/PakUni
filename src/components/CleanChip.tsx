/**
 * CleanChip Component - 2025 Design Standards
 * 
 * Clean, minimal chips/tags for filtering and categories.
 * Design focuses on clarity and subtle state changes.
 */

import React, { useRef, useCallback, memo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import {
  CLEAN_SPACING,
  CLEAN_RADIUS,
  CLEAN_TYPOGRAPHY,
  CLEAN_MOTION,
  CLEAN_COLORS,
  CLEAN_COLORS_DARK,
} from '../constants/clean-design-2025';

// ============================================================================
// TYPES
// ============================================================================

type ChipVariant = 'outlined' | 'filled' | 'subtle';
type ChipSize = 'sm' | 'md' | 'lg';

interface CleanChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  variant?: ChipVariant;
  size?: ChipSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
  /** Color for selected state */
  selectedColor?: string;
  testID?: string;
}

// ============================================================================
// SIZE CONFIGURATIONS
// ============================================================================

interface ChipSizeConfig {
  height: number;
  paddingHorizontal: number;
  fontSize: number;
  iconSize: number;
}

const CHIP_SIZES: Record<ChipSize, ChipSizeConfig> = {
  sm: {
    height: 28,
    paddingHorizontal: CLEAN_SPACING[2],
    fontSize: CLEAN_TYPOGRAPHY.size.xs,
    iconSize: 14,
  },
  md: {
    height: 34,
    paddingHorizontal: CLEAN_SPACING[3],
    fontSize: CLEAN_TYPOGRAPHY.size.sm,
    iconSize: 16,
  },
  lg: {
    height: 40,
    paddingHorizontal: CLEAN_SPACING[4],
    fontSize: CLEAN_TYPOGRAPHY.size.base,
    iconSize: 18,
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export const CleanChip: React.FC<CleanChipProps> = memo(({
  label,
  selected = false,
  onPress,
  variant = 'outlined',
  size = 'md',
  leftIcon,
  rightIcon,
  disabled = false,
  style,
  textStyle,
  selectedColor,
  testID,
}) => {
  const { colors, isDark } = useTheme();
  const palette = isDark ? CLEAN_COLORS_DARK : CLEAN_COLORS;
  const sizeConfig = CHIP_SIZES[size];
  
  // Animation
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      ...CLEAN_MOTION.spring.snappy,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...CLEAN_MOTION.spring.snappy,
    }).start();
  }, [scaleAnim]);

  // Colors
  const accentColor = selectedColor || colors.primary || palette.primary[500];
  const borderColor = colors.border || palette.neutral[200];
  const textColor = colors.text || palette.neutral[800];
  const textSecondary = colors.textSecondary || palette.neutral[500];

  // Get variant styles
  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    if (selected) {
      // Selected state - consistent across variants
      return {
        container: {
          backgroundColor: accentColor,
          borderWidth: 1,
          borderColor: accentColor,
        },
        text: {
          color: isDark ? palette.neutral[900] : '#FFFFFF',
          fontWeight: CLEAN_TYPOGRAPHY.weight.medium,
        },
      };
    }

    // Unselected states by variant
    switch (variant) {
      case 'filled':
        return {
          container: {
            backgroundColor: palette.neutral[100],
            borderWidth: 0,
          },
          text: {
            color: textSecondary,
          },
        };

      case 'subtle':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 0,
          },
          text: {
            color: textSecondary,
          },
        };

      case 'outlined':
      default:
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: borderColor,
          },
          text: {
            color: textSecondary,
          },
        };
    }
  };

  const variantStyles = getVariantStyles();

  const containerStyle: ViewStyle = {
    ...variantStyles.container,
    height: sizeConfig.height,
    paddingHorizontal: sizeConfig.paddingHorizontal,
    borderRadius: CLEAN_RADIUS.full,
    opacity: disabled ? 0.5 : 1,
  };

  const labelStyle: TextStyle = {
    ...variantStyles.text,
    fontSize: sizeConfig.fontSize,
  };

  const content = (
    <View style={styles.content}>
      {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
      <Text style={[styles.label, labelStyle, textStyle]} numberOfLines={1}>
        {label}
      </Text>
      {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
    </View>
  );

  if (onPress) {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          style={[styles.container, containerStyle]}
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityState={{ selected, disabled }}
          testID={testID}
        >
          {content}
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <View style={[styles.container, containerStyle, style]} testID={testID}>
      {content}
    </View>
  );
});

// ============================================================================
// CHIP GROUP - For multiple selection chips
// ============================================================================

interface ChipOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface ChipGroupProps {
  options: ChipOption[];
  selectedValue?: string | string[];
  onSelect?: (value: string) => void;
  multiple?: boolean;
  variant?: ChipVariant;
  size?: ChipSize;
  style?: ViewStyle;
  chipStyle?: ViewStyle;
  scrollable?: boolean;
}

export const CleanChipGroup: React.FC<ChipGroupProps> = memo(({
  options,
  selectedValue,
  onSelect,
  multiple = false,
  variant = 'outlined',
  size = 'md',
  style,
  chipStyle,
}) => {
  const isSelected = (value: string): boolean => {
    if (multiple && Array.isArray(selectedValue)) {
      return selectedValue.includes(value);
    }
    return selectedValue === value;
  };

  return (
    <View style={[styles.group, style]}>
      {options.map((option) => (
        <CleanChip
          key={option.value}
          label={option.label}
          leftIcon={option.icon}
          selected={isSelected(option.value)}
          onPress={() => onSelect?.(option.value)}
          variant={variant}
          size={size}
          style={[styles.groupChip, chipStyle].filter(Boolean) as ViewStyle[]}
        />
      ))}
    </View>
  );
});

// ============================================================================
// STATUS CHIP - For displaying status indicators
// ============================================================================

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusChipProps {
  label: string;
  status: StatusType;
  size?: ChipSize;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const StatusChip: React.FC<StatusChipProps> = memo(({
  label,
  status,
  size = 'sm',
  icon,
  style,
}) => {
  const { isDark } = useTheme();
  const palette = isDark ? CLEAN_COLORS_DARK : CLEAN_COLORS;
  const sizeConfig = CHIP_SIZES[size];

  const getStatusColors = () => {
    switch (status) {
      case 'success':
        return {
          bg: palette.semantic.success.light,
          text: palette.semantic.success.text,
        };
      case 'warning':
        return {
          bg: palette.semantic.warning.light,
          text: palette.semantic.warning.text,
        };
      case 'error':
        return {
          bg: palette.semantic.error.light,
          text: palette.semantic.error.text,
        };
      case 'info':
        return {
          bg: palette.semantic.info.light,
          text: palette.semantic.info.text,
        };
      default:
        return {
          bg: palette.neutral[100],
          text: palette.neutral[600],
        };
    }
  };

  const statusColors = getStatusColors();

  return (
    <View
      style={[
        styles.statusChip,
        {
          backgroundColor: statusColors.bg,
          height: sizeConfig.height,
          paddingHorizontal: sizeConfig.paddingHorizontal,
        },
        style,
      ]}
      accessibilityRole="text"
      accessibilityLabel={`Status: ${label}`}
    >
      {icon && <View style={styles.statusIcon}>{icon}</View>}
      <Text
        style={[
          styles.statusLabel,
          {
            color: statusColors.text,
            fontSize: sizeConfig.fontSize,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontWeight: '500',
  },
  leftIcon: {
    marginRight: CLEAN_SPACING[1.5],
  },
  rightIcon: {
    marginLeft: CLEAN_SPACING[1.5],
  },
  // Group styles
  group: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  groupChip: {
    marginRight: CLEAN_SPACING[2],
    marginBottom: CLEAN_SPACING[2],
  },
  // Status chip styles
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: CLEAN_RADIUS.xs,
  },
  statusIcon: {
    marginRight: CLEAN_SPACING[1],
  },
  statusLabel: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

// Display names
CleanChip.displayName = 'CleanChip';
CleanChipGroup.displayName = 'CleanChipGroup';
StatusChip.displayName = 'StatusChip';

export default CleanChip;

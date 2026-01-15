/**
 * PremiumChip Component
 * Production-ready filter chips with animations and multiple variants
 */

import React, {useRef, useCallback} from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
  View,
} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import {RADIUS, SPACING, TYPOGRAPHY, ANIMATION} from '../constants/design';

type ChipVariant = 'solid' | 'outlined' | 'soft';
type ChipSize = 'sm' | 'md' | 'lg';

interface PremiumChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  variant?: ChipVariant;
  size?: ChipSize;
  color?: 'primary' | 'secondary' | 'neutral';
  style?: ViewStyle;
  textStyle?: TextStyle;
  animated?: boolean;
}

const SIZE_CONFIG = {
  sm: {paddingH: SPACING[2.5], paddingV: SPACING[1], fontSize: TYPOGRAPHY.scale.caption, iconSize: 12, gap: SPACING[1]},
  md: {paddingH: SPACING[3], paddingV: SPACING[1.5], fontSize: TYPOGRAPHY.scale.subhead, iconSize: 14, gap: SPACING[1.5]},
  lg: {paddingH: SPACING[4], paddingV: SPACING[2], fontSize: TYPOGRAPHY.scale.callout, iconSize: 16, gap: SPACING[2]},
};

export const PremiumChip: React.FC<PremiumChipProps> = ({
  label,
  selected = false,
  onPress,
  icon,
  iconPosition = 'left',
  disabled = false,
  variant = 'solid',
  size = 'md',
  color = 'primary',
  style,
  textStyle,
  animated = true,
}) => {
  const {colors} = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const sizeConfig = SIZE_CONFIG[size];

  const handlePressIn = useCallback(() => {
    if (!animated) return;
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      ...ANIMATION.spring.snappy,
    }).start();
  }, [animated, scaleAnim]);

  const handlePressOut = useCallback(() => {
    if (!animated) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...ANIMATION.spring.default,
    }).start();
  }, [animated, scaleAnim]);

  const getColors = () => {
    switch (color) {
      case 'secondary':
        return {main: colors.secondary, light: colors.secondaryLight};
      case 'neutral':
        return {main: colors.textSecondary, light: colors.background};
      default:
        return {main: colors.primary, light: colors.primaryLight};
    }
  };

  const colorValues = getColors();

  const getVariantStyle = (): {container: ViewStyle; text: TextStyle} => {
    if (selected) {
      switch (variant) {
        case 'outlined':
          return {
            container: {
              backgroundColor: 'transparent',
              borderWidth: 1.5,
              borderColor: colorValues.main,
            },
            text: {color: colorValues.main},
          };
        case 'soft':
          return {
            container: {
              backgroundColor: colorValues.light,
              borderWidth: 1,
              borderColor: colorValues.main + '30',
            },
            text: {color: colorValues.main},
          };
        default:
          return {
            container: {
              backgroundColor: colorValues.main,
              borderWidth: 1.5,
              borderColor: colorValues.main,
            },
            text: {color: colors.textOnPrimary},
          };
      }
    }

    // Not selected
    return {
      container: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
      },
      text: {color: colors.text},
    };
  };

  const variantStyle = getVariantStyle();

  return (
    <Animated.View style={{transform: [{scale: scaleAnim}]}}>
      <TouchableOpacity
        style={[
          styles.container,
          {
            paddingHorizontal: sizeConfig.paddingH,
            paddingVertical: sizeConfig.paddingV,
          },
          variantStyle.container,
          disabled && styles.disabled,
          style,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.8}>
        {icon && iconPosition === 'left' && (
          <View style={{marginRight: sizeConfig.gap}}>{icon}</View>
        )}
        <Text
          style={[
            styles.label,
            {fontSize: sizeConfig.fontSize},
            variantStyle.text,
            textStyle,
          ]}>
          {label}
        </Text>
        {icon && iconPosition === 'right' && (
          <View style={{marginLeft: sizeConfig.gap}}>{icon}</View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Chip Group for multiple selections
interface ChipGroupProps {
  chips: {label: string; value: string; icon?: React.ReactNode}[];
  selectedValue?: string | string[];
  onSelect?: (value: string) => void;
  multiSelect?: boolean;
  variant?: ChipVariant;
  size?: ChipSize;
  color?: 'primary' | 'secondary' | 'neutral';
  style?: ViewStyle;
  chipStyle?: ViewStyle;
  scrollable?: boolean;
}

export const ChipGroup: React.FC<ChipGroupProps> = ({
  chips,
  selectedValue,
  onSelect,
  multiSelect = false,
  variant = 'solid',
  size = 'md',
  color = 'primary',
  style,
  chipStyle,
}) => {
  const isSelected = (value: string) => {
    if (Array.isArray(selectedValue)) {
      return selectedValue.includes(value);
    }
    return selectedValue === value;
  };

  return (
    <View style={[styles.group, style]}>
      {chips.map(chip => (
        <PremiumChip
          key={chip.value}
          label={chip.label}
          icon={chip.icon}
          selected={isSelected(chip.value)}
          onPress={() => onSelect?.(chip.value)}
          variant={variant}
          size={size}
          color={color}
          style={chipStyle}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.full,
  },
  label: {
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  disabled: {
    opacity: 0.5,
  },
  group: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[2],
  },
});

export default PremiumChip;

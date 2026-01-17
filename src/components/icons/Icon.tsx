/**
 * Premium Icon Component
 * Unified icon component supporting multiple icon families
 * Provides consistent sizing, colors, and accessibility
 */

import React, { memo } from 'react';
import { StyleSheet, View, ViewStyle, AccessibilityProps } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../../contexts/ThemeContext';
import { IconFamily, getIcon } from './iconMappings';

// Icon size presets following Apple/Google design guidelines
export const ICON_SIZES = {
  xs: 14,
  sm: 18,
  md: 22,
  lg: 28,
  xl: 36,
  xxl: 48,
  hero: 64,
} as const;

export type IconSize = keyof typeof ICON_SIZES | number;

export interface IconProps extends AccessibilityProps {
  // Icon identification - either name+family OR a mapping key
  name?: string;
  family?: IconFamily;
  mappingKey?: string; // Use predefined mapping from iconMappings

  // Appearance
  size?: IconSize;
  color?: string;

  // States
  focused?: boolean;
  disabled?: boolean;
  muted?: boolean;

  // Container
  containerStyle?: ViewStyle;
  withBackground?: boolean;
  backgroundColor?: string;
  backgroundOpacity?: number;
  borderRadius?: number;

  // Accessibility - when true, icon is hidden from screen readers (default: true for decorative icons)
  decorative?: boolean;
}

const Icon: React.FC<IconProps> = memo(({
  name,
  family = 'Ionicons',
  mappingKey,
  size = 'md',
  color,
  focused = false,
  disabled = false,
  muted = false,
  containerStyle,
  withBackground = false,
  backgroundColor,
  backgroundOpacity = 0.12,
  borderRadius,
  accessibilityLabel,
  decorative = true, // Most icons are decorative (paired with text)
  ...accessibilityProps
}) => {
  const { colors } = useTheme();

  // Resolve icon from mapping if mappingKey provided
  let resolvedName = name || 'help-circle';
  let resolvedFamily = family;

  if (mappingKey) {
    const iconConfig = getIcon(mappingKey);
    resolvedName = iconConfig.name;
    resolvedFamily = iconConfig.family;
  }

  // Resolve size
  const resolvedSize = typeof size === 'number' ? size : ICON_SIZES[size];

  // Resolve color
  let resolvedColor = color || colors.text;
  if (disabled) {
    resolvedColor = colors.textMuted;
  } else if (muted) {
    resolvedColor = colors.textSecondary;
  } else if (focused) {
    resolvedColor = colors.primary;
  }

  // Get the correct icon component based on family
  const IconComponent = getIconComponent(resolvedFamily);

  // For decorative icons without explicit label, hide from screen reader
  const a11yProps = decorative && !accessibilityLabel
    ? {
        accessible: false,
        accessibilityElementsHidden: true,
        importantForAccessibility: 'no-hide-descendants' as const,
      }
    : {
        accessible: true,
        accessibilityLabel: accessibilityLabel || resolvedName.replace(/-/g, ' '),
        accessibilityRole: 'image' as const,
      };

  const icon = (
    <IconComponent
      name={resolvedName}
      size={resolvedSize}
      color={resolvedColor}
      {...a11yProps}
      {...accessibilityProps}
    />
  );

  // Return with background container if needed
  if (withBackground) {
    const bgColor = backgroundColor || resolvedColor;
    const bgSize = resolvedSize * 1.8;
    const radius = borderRadius ?? bgSize / 2;

    return (
      <View
        style={[
          styles.backgroundContainer,
          {
            width: bgSize,
            height: bgSize,
            borderRadius: radius,
            backgroundColor: `${bgColor}${Math.round(backgroundOpacity * 255).toString(16).padStart(2, '0')}`,
          },
          containerStyle,
        ]}
      >
        {icon}
      </View>
    );
  }

  if (containerStyle) {
    return <View style={containerStyle}>{icon}</View>;
  }

  return icon;
});

// Helper to get the correct icon component
function getIconComponent(family: IconFamily) {
  switch (family) {
    case 'MaterialCommunityIcons':
      return MaterialCommunityIcons;
    case 'Feather':
      return Feather;
    case 'Ionicons':
    default:
      return Ionicons;
  }
}

const styles = StyleSheet.create({
  backgroundContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

Icon.displayName = 'Icon';

export default Icon;

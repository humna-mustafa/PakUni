/**
 * FeatureIcon Component
 * Icon with decorative background for feature cards, stats, etc.
 */

import React, { memo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon, { ICON_SIZES, IconSize } from './Icon';
import { IconFamily, IconConfig } from './iconMappings';
import { useTheme } from '../../contexts/ThemeContext';
import { RADIUS } from '../../constants/design';

type FeatureIconVariant = 'solid' | 'soft' | 'gradient' | 'outlined';

interface FeatureIconProps {
  // Icon
  name?: string;
  family?: IconFamily;
  mappingKey?: string;
  
  // Appearance
  size?: IconSize;
  variant?: FeatureIconVariant;
  color?: string;
  gradientColors?: string[];
  
  // Container
  containerSize?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

const FeatureIcon: React.FC<FeatureIconProps> = memo(({
  name,
  family = 'Ionicons',
  mappingKey,
  size = 'md',
  variant = 'soft',
  color,
  gradientColors,
  containerSize,
  borderRadius,
  style,
}) => {
  const { colors, isDark } = useTheme();
  
  const resolvedColor = color || colors.primary;
  const iconSize = typeof size === 'number' ? size : ICON_SIZES[size];
  const resolvedContainerSize = containerSize || iconSize * 2;
  const resolvedBorderRadius = borderRadius ?? resolvedContainerSize / 2;

  const renderIcon = () => (
    <Icon
      name={name}
      family={family}
      mappingKey={mappingKey}
      size={iconSize}
      color={variant === 'solid' || variant === 'gradient' ? '#FFFFFF' : resolvedColor}
    />
  );

  const containerStyles: ViewStyle = {
    width: resolvedContainerSize,
    height: resolvedContainerSize,
    borderRadius: resolvedBorderRadius,
    alignItems: 'center',
    justifyContent: 'center',
  };

  if (variant === 'gradient') {
    const defaultGradient = [resolvedColor, adjustColorBrightness(resolvedColor, -20)];
    return (
      <LinearGradient
        colors={gradientColors || defaultGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[containerStyles, styles.shadow, style]}
      >
        {renderIcon()}
      </LinearGradient>
    );
  }

  if (variant === 'solid') {
    return (
      <View style={[containerStyles, { backgroundColor: resolvedColor }, styles.shadow, style]}>
        {renderIcon()}
      </View>
    );
  }

  if (variant === 'outlined') {
    return (
      <View
        style={[
          containerStyles,
          {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: resolvedColor,
          },
          style,
        ]}
      >
        {renderIcon()}
      </View>
    );
  }

  // Default: soft
  return (
    <View
      style={[
        containerStyles,
        {
          backgroundColor: isDark
            ? `${resolvedColor}20`
            : `${resolvedColor}15`,
        },
        style,
      ]}
    >
      {renderIcon()}
    </View>
  );
});

// Helper function to adjust color brightness
function adjustColorBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
});

FeatureIcon.displayName = 'FeatureIcon';

export default FeatureIcon;

/**
 * TabIcon Component
 * Premium tab bar icon with focus states and animations
 */

import React, { memo, useRef, useEffect } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Icon, { ICON_SIZES } from './Icon';
import { TAB_ICONS } from './iconMappings';
import { useTheme } from '../../contexts/ThemeContext';

interface TabIconProps {
  routeName: string;
  focused: boolean;
  size?: number;
  color?: string;
  focusedColor?: string;
}

const TabIcon: React.FC<TabIconProps> = memo(({
  routeName,
  focused,
  size = ICON_SIZES.lg,
  color,
  focusedColor,
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(focused ? 1.1 : 1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1.12 : 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  }, [focused, scaleAnim]);

  // Get icon name based on route and focus state
  const getIconName = (): string => {
    const key = focused ? routeName : `${routeName}Outline`;
    const iconConfig = TAB_ICONS[key as keyof typeof TAB_ICONS];
    
    if (iconConfig) {
      return iconConfig.name;
    }
    
    // Fallback to non-outline version
    const fallbackConfig = TAB_ICONS[routeName as keyof typeof TAB_ICONS];
    return fallbackConfig?.name || 'help-circle';
  };

  const resolvedColor = focused 
    ? (focusedColor || colors.primary) 
    : (color || colors.textSecondary);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Icon
        name={getIconName()}
        family="Ionicons"
        size={size}
        color={resolvedColor}
      />
    </Animated.View>
  );
});

TabIcon.displayName = 'TabIcon';

export default TabIcon;

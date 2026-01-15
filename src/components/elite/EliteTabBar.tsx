/**
 * Elite Tab Bar Component
 * World-class bottom navigation with Apple/Google design standards
 * Features: Fluid animations, haptic feedback, accessibility
 */

import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { TabIcon } from '../icons';
import {
  ELITE_TYPOGRAPHY,
  ELITE_SPACING,
  ELITE_RADIUS,
  ELITE_MOTION,
  ELITE_SHADOWS,
  ELITE_GLASS,
} from '../../constants/elite';
import { Haptics } from '../../utils/haptics';

const { width } = Dimensions.get('window');

// ============================================================================
// TAB ITEM COMPONENT
// ============================================================================
interface TabItemProps {
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  label: string;
  routeName: string;
  colors: any;
  index: number;
  totalTabs: number;
}

const TabItem: React.FC<TabItemProps> = ({
  isFocused,
  onPress,
  onLongPress,
  label,
  routeName,
  colors,
  index,
  totalTabs,
}) => {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(isFocused ? 1 : 0.95)).current;
  const translateYAnim = useRef(new Animated.Value(isFocused ? -2 : 0)).current;
  const opacityAnim = useRef(new Animated.Value(isFocused ? 1 : 0.6)).current;
  const bgOpacityAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
  const labelOpacityAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
  const iconScaleAnim = useRef(new Animated.Value(isFocused ? 1.1 : 1)).current;

  // Animate on focus change
  useEffect(() => {
    const springConfig = ELITE_MOTION.spring.snappy;

    Animated.parallel([
      // Icon scale - subtle pop
      Animated.spring(iconScaleAnim, {
        toValue: isFocused ? 1.12 : 1,
        useNativeDriver: true,
        ...springConfig,
      }),
      // Icon opacity
      Animated.timing(opacityAnim, {
        toValue: isFocused ? 1 : 0.6,
        duration: ELITE_MOTION.duration.fast,
        useNativeDriver: true,
      }),
      // Translate up when focused
      Animated.spring(translateYAnim, {
        toValue: isFocused ? -2 : 0,
        useNativeDriver: true,
        ...springConfig,
      }),
      // Background pill
      Animated.timing(bgOpacityAnim, {
        toValue: isFocused ? 1 : 0,
        duration: ELITE_MOTION.duration.normal,
        useNativeDriver: true,
      }),
      // Label visibility
      Animated.timing(labelOpacityAnim, {
        toValue: isFocused ? 1 : 0,
        duration: isFocused ? ELITE_MOTION.duration.normal : ELITE_MOTION.duration.fast,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused]);

  // Press animation
  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      ...ELITE_MOTION.spring.micro,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: isFocused ? 1 : 0.95,
      useNativeDriver: true,
      ...ELITE_MOTION.spring.snappy,
    }).start();
  }, [scaleAnim, isFocused]);

  const handlePress = useCallback(() => {
    Haptics.tabSwitch();
    onPress();
  }, [onPress]);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={label}
      onPress={handlePress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={styles.tabItem}
    >
      <Animated.View
        style={[
          styles.tabItemContent,
          {
            transform: [
              { scale: scaleAnim },
              { translateY: translateYAnim },
            ],
          },
        ]}
      >
        {/* Active Background Pill */}
        <Animated.View
          style={[
            styles.activePill,
            {
              backgroundColor: colors.primaryLight,
              opacity: bgOpacityAnim,
            },
          ]}
        />

        {/* Icon Container */}
        <Animated.View
          style={[
            styles.iconWrapper,
            {
              transform: [{ scale: iconScaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <TabIcon
            routeName={routeName}
            focused={isFocused}
            size={24}
            color={colors.textSecondary}
            focusedColor={colors.primary}
          />
        </Animated.View>

        {/* Label - Only visible when focused */}
        <Animated.Text
          numberOfLines={1}
          style={[
            styles.label,
            {
              color: isFocused ? colors.primary : colors.textSecondary,
              opacity: labelOpacityAnim,
              fontWeight: isFocused
                ? ELITE_TYPOGRAPHY.weight.semibold
                : ELITE_TYPOGRAPHY.weight.medium,
            },
          ]}
        >
          {label}
        </Animated.Text>

        {/* Active Indicator Dot */}
        {isFocused && (
          <Animated.View
            style={[
              styles.activeDot,
              {
                backgroundColor: colors.primary,
                transform: [{ scale: iconScaleAnim }],
              },
            ]}
          />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

// ============================================================================
// ELITE TAB BAR COMPONENT
// ============================================================================
const EliteTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();



  // Calculate bottom padding
  const bottomPadding = Math.max(insets.bottom, 8);

  // Glass effect background
  const glassConfig = isDark ? ELITE_GLASS.dark : ELITE_GLASS.lightSolid;
  const shadowStyle = isDark ? ELITE_SHADOWS.dark : ELITE_SHADOWS.light;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: glassConfig.backgroundColor,
          paddingBottom: bottomPadding,
          borderTopColor: isDark
            ? 'rgba(255,255,255,0.06)'
            : 'rgba(0,0,0,0.06)',
        },
        Platform.OS === 'ios' && shadowStyle.lg,
      ]}
    >
      {/* Subtle top border / glow line */}
      <View
        style={[
          styles.topLine,
          { backgroundColor: isDark ? colors.primary + '20' : 'transparent' },
        ]}
      />

      {/* Tab Items */}
      <View style={styles.tabsRow}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? String(options.tabBarLabel)
              : options.title !== undefined
                ? options.title
                : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            Haptics.heavy();
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TabItem
              key={route.key}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
              label={label}
              routeName={route.name}
              colors={colors}
              index={index}
              totalTabs={state.routes.length}
            />
          );
        })}
      </View>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    // Android elevation
    elevation: 16,
  },
  topLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingTop: ELITE_SPACING[2],
    paddingHorizontal: ELITE_SPACING[2],
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  tabItemContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: ELITE_SPACING[3],
    paddingVertical: ELITE_SPACING[1.5],
  },
  activePill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: ELITE_RADIUS.xl,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
  },
  icon: {
    fontSize: 24,
  },
  label: {
    fontSize: ELITE_TYPOGRAPHY.fluid.caption2,
    marginTop: 2,
    letterSpacing: ELITE_TYPOGRAPHY.tracking.wide,
    textAlign: 'center',
  },
  activeDot: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

export default EliteTabBar;

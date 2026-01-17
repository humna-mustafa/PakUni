/**
 * PremiumTabBar Component - Material Design 3 (2025) Compliant
 * 
 * Material 3 Navigation Bar specifications:
 * - 80dp height (without labels: 64dp)
 * - Active indicator: 64x32dp with 16dp corner radius
 * - Icon size: 24dp
 * - Label: 12sp medium
 * - Proper state layers on interaction
 * 
 * Accessibility Features:
 * - WCAG 2.2 compliant touch targets (48dp minimum)
 * - Screen reader support with proper roles
 * - Reduced motion support
 * - Focus indicators
 * 
 * FAANG Standards:
 * - Google: M3 navigation bar specs
 * - Apple: Native-feeling haptics, spring animations
 * - Meta: Memoized components, optimized re-renders
 */

import React, {useRef, useEffect, useCallback, memo, useMemo} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  AccessibilityInfo,
} from 'react-native';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../contexts/ThemeContext';
import {RADIUS, ANIMATION} from '../constants/design';
import {ANIMATION_SCALES} from '../constants/ui';
import {
  CLEAN_COMPONENTS,
  CLEAN_A11Y,
  CLEAN_MOTION,
  CLEAN_RADIUS,
  STATE_LAYERS,
  getSpringConfig,
  CLEAN_TYPOGRAPHY,
} from '../constants/clean-design-2025';
import {Haptics} from '../utils/haptics';
import {TabIcon} from './icons';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// M3 Navigation Bar specifications
const NAV_BAR_CONFIG = {
  height: CLEAN_COMPONENTS.navigation.bottomBar.height, // 80dp
  indicatorHeight: CLEAN_COMPONENTS.navigation.bottomBar.indicatorHeight, // 32dp
  indicatorWidth: 64,
  indicatorRadius: CLEAN_COMPONENTS.navigation.bottomBar.indicatorRadius, // 16dp
  iconSize: CLEAN_COMPONENTS.navigation.bottomBar.iconSize, // 24dp
  labelSize: CLEAN_COMPONENTS.navigation.bottomBar.labelSize, // 12sp
};

// Responsive breakpoints
const isCompact = SCREEN_WIDTH < 360;
const isSmall = SCREEN_WIDTH < 390;

// Get responsive values based on screen size
const getResponsiveValues = () => ({
  iconSize: isCompact ? 22 : isSmall ? 23 : NAV_BAR_CONFIG.iconSize,
  fontSize: isCompact ? 10 : isSmall ? 11 : NAV_BAR_CONFIG.labelSize,
  paddingTop: isCompact ? 8 : 10,
  indicatorWidth: isCompact ? 56 : isSmall ? 60 : NAV_BAR_CONFIG.indicatorWidth,
});

interface TabItemProps {
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  label: string;
  routeName: string;
  colors: any;
  isDark: boolean;
  index: number;
  totalTabs: number;
  reducedMotion?: boolean;
  badgeCount?: number;
}

const TabItem = memo(({
  isFocused,
  onPress,
  onLongPress,
  label,
  routeName,
  colors,
  isDark,
  index,
  totalTabs,
  reducedMotion = false,
  badgeCount,
}: TabItemProps) => {
  const responsive = getResponsiveValues();
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const iconScaleAnim = useRef(new Animated.Value(isFocused ? 1 : 1)).current;
  const iconTranslateY = useRef(new Animated.Value(isFocused ? -2 : 0)).current;
  const indicatorOpacity = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
  const indicatorScale = useRef(new Animated.Value(isFocused ? 1 : 0.8)).current;
  const stateLayerOpacity = useRef(new Animated.Value(0)).current;
  const labelOpacity = useRef(new Animated.Value(isFocused ? 1 : 0.7)).current;

  // Get spring configs
  const snappySpring = useMemo(() => getSpringConfig('snappy', reducedMotion), [reducedMotion]);
  const defaultSpring = useMemo(() => getSpringConfig('default', reducedMotion), [reducedMotion]);

  // Animate on focus change
  useEffect(() => {
    const duration = reducedMotion ? 0 : CLEAN_MOTION.duration.medium1;
    
    Animated.parallel([
      // Icon lift effect (M3 pattern)
      Animated.spring(iconTranslateY, {
        toValue: isFocused ? -2 : 0,
        ...snappySpring,
        useNativeDriver: true,
      }),
      // Indicator animation
      Animated.spring(indicatorOpacity, {
        toValue: isFocused ? 1 : 0,
        ...snappySpring,
        useNativeDriver: true,
      }),
      Animated.spring(indicatorScale, {
        toValue: isFocused ? 1 : 0.8,
        ...snappySpring,
        useNativeDriver: true,
      }),
      // Label emphasis
      Animated.timing(labelOpacity, {
        toValue: isFocused ? 1 : 0.7,
        duration,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused, iconTranslateY, indicatorOpacity, indicatorScale, labelOpacity, snappySpring, reducedMotion]);

  const handlePressIn = useCallback(() => {
    // State layer feedback
    Animated.timing(stateLayerOpacity, {
      toValue: STATE_LAYERS.pressed.light,
      duration: reducedMotion ? 0 : CLEAN_MOTION.duration.short2,
      useNativeDriver: true,
    }).start();
  }, [stateLayerOpacity, reducedMotion]);

  const handlePressOut = useCallback(() => {
    Animated.timing(stateLayerOpacity, {
      toValue: 0,
      duration: reducedMotion ? 0 : CLEAN_MOTION.duration.short3,
      useNativeDriver: true,
    }).start();
  }, [stateLayerOpacity, reducedMotion]);

  const handlePress = useCallback(() => {
    if (!reducedMotion) {
      Haptics.tabSwitch();
    }
    
    // Quick scale animation on press
    if (!reducedMotion) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: ANIMATION_SCALES.ICON_PRESS,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          ...snappySpring,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    onPress();
  }, [onPress, scaleAnim, snappySpring, reducedMotion]);

  // Badge animation
  const badgeScale = useRef(new Animated.Value(badgeCount ? 1 : 0)).current;
  
  useEffect(() => {
    Animated.spring(badgeScale, {
      toValue: badgeCount && badgeCount > 0 ? 1 : 0,
      ...snappySpring,
      useNativeDriver: true,
    }).start();
  }, [badgeCount, badgeScale, snappySpring]);

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{selected: isFocused}}
      accessibilityLabel={`${label} tab${isFocused ? ', selected' : ''}${badgeCount ? `, ${badgeCount} notifications` : ''}`}
      accessibilityHint={`Navigate to ${label}`}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLongPress={onLongPress}
      hitSlop={{top: 8, bottom: 8, left: 4, right: 4}}
      style={[
        styles.tabItem,
        {minHeight: CLEAN_A11Y.minTouchTarget}, // WCAG minimum
      ]}>
      <Animated.View 
        style={[
          styles.tabItemInner,
          {transform: [{scale: scaleAnim}]},
        ]}>
        {/* Active indicator (M3 pill) */}
        <Animated.View
          style={[
            styles.activeIndicator,
            {
              backgroundColor: isDark 
                ? `${colors.primary}30` 
                : `${colors.primary}15`,
              width: responsive.indicatorWidth,
              opacity: indicatorOpacity,
              transform: [{scale: indicatorScale}],
            },
          ]}
        />
        
        {/* State layer (interaction feedback) */}
        <Animated.View
          style={[
            styles.stateLayer,
            {
              backgroundColor: colors.primary,
              opacity: stateLayerOpacity,
            },
          ]}
          pointerEvents="none"
        />
        
        {/* Icon container with lift effect */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [
                {translateY: iconTranslateY},
                {scale: iconScaleAnim},
              ],
            },
          ]}>
          <TabIcon
            routeName={routeName}
            focused={isFocused}
            size={responsive.iconSize}
            color={colors.textSecondary}
            focusedColor={colors.primary}
          />
          
          {/* Badge (M3 style) */}
          {badgeCount !== undefined && badgeCount > 0 && (
            <Animated.View
              style={[
                styles.badge,
                {
                  backgroundColor: colors.error,
                  transform: [{scale: badgeScale}],
                },
              ]}>
              <Text style={styles.badgeText}>
                {badgeCount > 99 ? '99+' : badgeCount}
              </Text>
            </Animated.View>
          )}
        </Animated.View>
        
        {/* Label */}
        <Animated.Text
          numberOfLines={1}
          style={[
            styles.label,
            {
              color: isFocused ? colors.primary : colors.textSecondary,
              fontSize: responsive.fontSize,
              fontWeight: isFocused ? '600' : '500',
              opacity: labelOpacity,
            },
          ]}
          allowFontScaling
          maxFontSizeMultiplier={1.3}>
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
});

TabItem.displayName = 'TabItem';

// Badge counts by route (can be connected to notification context)
interface BadgeCounts {
  [key: string]: number;
}

interface PremiumTabBarExtendedProps extends BottomTabBarProps {
  badgeCounts?: BadgeCounts;
  reducedMotion?: boolean;
}

const PremiumTabBar = ({
  state, 
  descriptors, 
  navigation,
  badgeCounts = {},
  reducedMotion = false,
}: PremiumTabBarExtendedProps) => {
  const {colors, isDark} = useTheme();
  const insets = useSafeAreaInsets();
  const responsive = getResponsiveValues();
  
  // Safe bottom padding following M3 specs
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 4 : 8);
  
  // Calculate total height for edge-to-edge design
  const totalHeight = NAV_BAR_CONFIG.height + bottomPadding - 20;

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel="Main navigation"
      style={[
        styles.container,
        {
          height: totalHeight,
          paddingBottom: bottomPadding,
        },
      ]}>
      {/* Background with Material 3 surface treatment */}
      <View 
        style={[
          styles.backgroundLayer,
          {
            backgroundColor: isDark 
              ? 'rgba(15, 23, 42, 0.98)' 
              : 'rgba(255, 255, 255, 0.98)',
          }
        ]} 
      />
      
      {/* Subtle top divider (M3 navigation bar spec) */}
      <View 
        style={[
          styles.topDivider,
          {
            backgroundColor: isDark 
              ? 'rgba(255, 255, 255, 0.08)' 
              : 'rgba(0, 0, 0, 0.06)',
          }
        ]} 
      />
      
      {/* Tab items */}
      <View style={[styles.tabsContainer, {paddingTop: responsive.paddingTop}]}>
        {state.routes.map((route, index) => {
          const {options} = descriptors[route.key];
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
              isDark={isDark}
              index={index}
              totalTabs={state.routes.length}
              reducedMotion={reducedMotion}
              badgeCount={badgeCounts[route.name]}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: -3},
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  topDivider: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemInner: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 4,
    paddingHorizontal: 12,
    minWidth: 64,
    minHeight: 48, // WCAG touch target
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    height: NAV_BAR_CONFIG.indicatorHeight,
    borderRadius: NAV_BAR_CONFIG.indicatorRadius,
  },
  stateLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: CLEAN_RADIUS.medium,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    position: 'relative',
  },
  label: {
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default memo(PremiumTabBar);

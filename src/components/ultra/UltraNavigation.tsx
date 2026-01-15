/**
 * Ultra Premium Navigation Components
 * Crystal Clear Headers and Tab Bars
 */

import React, { useRef, memo, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  ViewStyle,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import {
  ULTRA_TYPOGRAPHY,
  ULTRA_SPACING,
  ULTRA_RADIUS,
  ULTRA_SHADOWS,
  ULTRA_MOTION,
  ULTRA_GLASS,
  pixelPerfect,
} from '../../constants/ultra-design';
import { Icon } from '../icons';
import { Haptics } from '../../utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0;

// ============================================================================
// ULTRA NAVIGATION HEADER - Professional App Header
// ============================================================================

interface UltraHeaderProps {
  title?: string;
  subtitle?: string;
  leftAction?: {
    icon: string;
    onPress: () => void;
    accessibilityLabel?: string;
  };
  rightActions?: Array<{
    icon: string;
    onPress: () => void;
    badge?: number;
    accessibilityLabel?: string;
  }>;
  variant?: 'default' | 'large' | 'transparent' | 'gradient';
  centerContent?: React.ReactNode;
  scrollY?: Animated.Value;
  blurOnScroll?: boolean;
  style?: ViewStyle;
}

export const UltraHeader = memo<UltraHeaderProps>(({
  title,
  subtitle,
  leftAction,
  rightActions,
  variant = 'default',
  centerContent,
  scrollY,
  blurOnScroll = true,
  style,
}) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const shadowStyle = isDark ? ULTRA_SHADOWS.dark : ULTRA_SHADOWS.light;

  const headerHeight = variant === 'large' ? pixelPerfect(110) : pixelPerfect(56);
  const totalHeight = headerHeight + insets.top;

  // Scroll-based animations
  const scrollAnimations = useMemo(() => {
    if (!scrollY) return null;

    const collapseRange = [0, pixelPerfect(50)];

    return {
      headerOpacity: scrollY.interpolate({
        inputRange: collapseRange,
        outputRange: [0, 1],
        extrapolate: 'clamp',
      }),
      titleScale: scrollY.interpolate({
        inputRange: collapseRange,
        outputRange: [1, 0.85],
        extrapolate: 'clamp',
      }),
      titleTranslateY: scrollY.interpolate({
        inputRange: collapseRange,
        outputRange: [0, -pixelPerfect(20)],
        extrapolate: 'clamp',
      }),
    };
  }, [scrollY]);

  const handleLeftAction = useCallback(() => {
    Haptics.light();
    leftAction?.onPress();
  }, [leftAction]);

  // Get background style
  const getBackgroundStyle = useMemo((): ViewStyle => {
    const glass = isDark ? ULTRA_GLASS.dark.subtle : ULTRA_GLASS.light.subtle;

    switch (variant) {
      case 'transparent':
        return { backgroundColor: 'transparent' };
      case 'gradient':
        return { backgroundColor: 'transparent' };
      default:
        return {
          backgroundColor: colors.card,
          ...shadowStyle.sm,
        };
    }
  }, [variant, colors, isDark, shadowStyle]);

  return (
    <View
      style={[
        styles.headerContainer,
        getBackgroundStyle,
        { paddingTop: insets.top },
        style,
      ]}
    >
      {/* Blur Background (on scroll) */}
      {scrollAnimations && blurOnScroll && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: colors.card,
              opacity: scrollAnimations.headerOpacity,
            },
            shadowStyle.sm,
          ]}
        />
      )}

      <View
        style={[
          styles.headerInner,
          { height: headerHeight },
        ]}
      >
        {/* Left Action */}
        {leftAction && (
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleLeftAction}
            accessibilityRole="button"
            accessibilityLabel={leftAction.accessibilityLabel || 'Back'}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon
              name={leftAction.icon}
              family="Ionicons"
              size={pixelPerfect(24)}
              color={colors.text}
            />
          </TouchableOpacity>
        )}

        {/* Center Content */}
        <View style={styles.headerCenter}>
          {centerContent || (
            <Animated.View
              style={[
                styles.headerTitles,
                scrollAnimations && {
                  transform: [
                    { scale: scrollAnimations.titleScale },
                    { translateY: scrollAnimations.titleTranslateY },
                  ],
                },
              ]}
            >
              {title && (
                <Text
                  style={[
                    styles.headerTitle,
                    {
                      color: colors.text,
                      fontSize: variant === 'large'
                        ? ULTRA_TYPOGRAPHY.scale.title1
                        : ULTRA_TYPOGRAPHY.scale.headline,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text
                  style={[
                    styles.headerSubtitle,
                    { color: colors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {subtitle}
                </Text>
              )}
            </Animated.View>
          )}
        </View>

        {/* Right Actions */}
        <View style={styles.headerRight}>
          {rightActions?.map((action, index) => (
            <UltraHeaderButton
              key={`action-${index}`}
              icon={action.icon}
              onPress={action.onPress}
              badge={action.badge}
              accessibilityLabel={action.accessibilityLabel}
            />
          ))}
        </View>
      </View>
    </View>
  );
});

// ============================================================================
// ULTRA HEADER BUTTON - Icon Button for Headers
// ============================================================================

interface UltraHeaderButtonProps {
  icon: string;
  onPress: () => void;
  badge?: number;
  disabled?: boolean;
  accessibilityLabel?: string;
}

export const UltraHeaderButton = memo<UltraHeaderButtonProps>(({
  icon,
  onPress,
  badge,
  disabled = false,
  accessibilityLabel,
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      ...ULTRA_MOTION.spring.snappy,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...ULTRA_MOTION.spring.default,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    Haptics.light();
    onPress();
  }, [onPress]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Animated.View
        style={[
          styles.headerButton,
          { transform: [{ scale: scaleAnim }], opacity: disabled ? 0.5 : 1 },
        ]}
      >
        <Icon
          name={icon}
          family="Ionicons"
          size={pixelPerfect(24)}
          color={colors.text}
        />
        {badge !== undefined && badge > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.error }]}>
            <Text style={styles.badgeText}>
              {badge > 99 ? '99+' : badge}
            </Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
});

// ============================================================================
// ULTRA TAB BAR - Professional Bottom Tab Navigation
// ============================================================================

interface UltraTabItem {
  key: string;
  icon: string;
  iconFocused?: string;
  label: string;
  badge?: number;
}

interface UltraTabBarProps {
  items: UltraTabItem[];
  activeKey: string;
  onTabPress: (key: string) => void;
  variant?: 'default' | 'floating' | 'minimal';
  showLabels?: boolean;
  style?: ViewStyle;
}

export const UltraTabBar = memo<UltraTabBarProps>(({
  items,
  activeKey,
  onTabPress,
  variant = 'default',
  showLabels = true,
  style,
}) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const shadowStyle = isDark ? ULTRA_SHADOWS.dark : ULTRA_SHADOWS.light;

  const getContainerStyle = useMemo((): ViewStyle => {
    const glass = isDark ? ULTRA_GLASS.dark.medium : ULTRA_GLASS.light.medium;

    switch (variant) {
      case 'floating':
        return {
          position: 'absolute',
          bottom: insets.bottom + ULTRA_SPACING[4],
          left: ULTRA_SPACING[4],
          right: ULTRA_SPACING[4],
          backgroundColor: colors.card,
          borderRadius: ULTRA_RADIUS.full,
          ...shadowStyle.lg,
        };
      case 'minimal':
        return {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          paddingBottom: insets.bottom,
        };
      default:
        return {
          backgroundColor: colors.card,
          borderTopWidth: pixelPerfect(1),
          borderTopColor: colors.border,
          paddingBottom: insets.bottom,
          ...shadowStyle.sm,
        };
    }
  }, [variant, colors, isDark, shadowStyle, insets]);

  return (
    <View style={[styles.tabBarContainer, getContainerStyle, style]}>
      {items.map((item) => (
        <UltraTabItem
          key={item.key}
          item={item}
          isActive={activeKey === item.key}
          onPress={() => onTabPress(item.key)}
          showLabel={showLabels}
          variant={variant}
        />
      ))}
    </View>
  );
});

// ============================================================================
// ULTRA TAB ITEM - Individual Tab Button
// ============================================================================

interface UltraTabItemProps {
  item: UltraTabItem;
  isActive: boolean;
  onPress: () => void;
  showLabel: boolean;
  variant: 'default' | 'floating' | 'minimal';
}

const UltraTabItem = memo<UltraTabItemProps>(({
  item,
  isActive,
  onPress,
  showLabel,
  variant,
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bgAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(bgAnim, {
        toValue: isActive ? 1 : 0,
        useNativeDriver: false,
        ...ULTRA_MOTION.spring.snappy,
      }),
    ]).start();
  }, [isActive, bgAnim]);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      ...ULTRA_MOTION.spring.snappy,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...ULTRA_MOTION.spring.default,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    Haptics.light();
    onPress();
  }, [onPress]);

  const backgroundColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', `${colors.primary}15`],
  });

  const iconName = isActive ? (item.iconFocused || item.icon) : item.icon;
  const iconColor = isActive ? colors.primary : colors.textMuted;

  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={item.label}
    >
      <Animated.View
        style={[
          styles.tabItemInner,
          variant === 'floating' && styles.tabItemFloating,
          {
            backgroundColor: variant !== 'minimal' ? backgroundColor : 'transparent',
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.tabIconContainer}>
          <Icon
            name={iconName}
            family="Ionicons"
            size={pixelPerfect(24)}
            color={iconColor}
          />
          {item.badge !== undefined && item.badge > 0 && (
            <View style={[styles.tabBadge, { backgroundColor: colors.error }]}>
              <Text style={styles.tabBadgeText}>
                {item.badge > 9 ? '9+' : item.badge}
              </Text>
            </View>
          )}
        </View>
        
        {showLabel && (
          <Text
            style={[
              styles.tabLabel,
              {
                color: iconColor,
                fontWeight: isActive
                  ? ULTRA_TYPOGRAPHY.weight.semibold
                  : ULTRA_TYPOGRAPHY.weight.regular,
              },
            ]}
            numberOfLines={1}
          >
            {item.label}
          </Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
});

// ============================================================================
// ULTRA SEGMENTED CONTROL - iOS-style Segment Picker
// ============================================================================

interface UltraSegmentedControlProps {
  segments: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  variant?: 'default' | 'pill';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const UltraSegmentedControl = memo<UltraSegmentedControlProps>(({
  segments,
  selectedIndex,
  onChange,
  variant = 'default',
  size = 'md',
  style,
}) => {
  const { colors, isDark } = useTheme();
  const shadowStyle = isDark ? ULTRA_SHADOWS.dark : ULTRA_SHADOWS.light;
  const slideAnim = useRef(new Animated.Value(selectedIndex)).current;

  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: selectedIndex,
      useNativeDriver: false,
      ...ULTRA_MOTION.spring.snappy,
    }).start();
  }, [selectedIndex, slideAnim]);

  const segmentWidth = useMemo(
    () => (SCREEN_WIDTH - ULTRA_SPACING[8]) / segments.length,
    [segments.length]
  );

  const sizeConfig = useMemo(() => {
    switch (size) {
      case 'sm':
        return { height: pixelPerfect(32), fontSize: ULTRA_TYPOGRAPHY.scale.caption };
      case 'lg':
        return { height: pixelPerfect(48), fontSize: ULTRA_TYPOGRAPHY.scale.body };
      default:
        return { height: pixelPerfect(40), fontSize: ULTRA_TYPOGRAPHY.scale.subhead };
    }
  }, [size]);

  const handlePress = useCallback((index: number) => {
    Haptics.light();
    onChange(index);
  }, [onChange]);

  const indicatorLeft = slideAnim.interpolate({
    inputRange: segments.map((_, i) => i),
    outputRange: segments.map((_, i) => i * segmentWidth + ULTRA_SPACING[0.5]),
  });

  return (
    <View
      style={[
        styles.segmentedContainer,
        {
          backgroundColor: colors.background,
          height: sizeConfig.height,
          borderRadius: variant === 'pill' ? ULTRA_RADIUS.full : ULTRA_RADIUS.lg,
        },
        style,
      ]}
    >
      {/* Sliding Indicator */}
      <Animated.View
        style={[
          styles.segmentIndicator,
          {
            width: segmentWidth - ULTRA_SPACING[1],
            height: sizeConfig.height - ULTRA_SPACING[1],
            left: indicatorLeft,
            backgroundColor: colors.card,
            borderRadius: variant === 'pill' ? ULTRA_RADIUS.full : ULTRA_RADIUS.md,
          },
          shadowStyle.sm,
        ]}
      />

      {/* Segments */}
      {segments.map((segment, index) => (
        <TouchableOpacity
          key={segment}
          style={[
            styles.segment,
            { width: segmentWidth },
          ]}
          onPress={() => handlePress(index)}
          accessibilityRole="tab"
          accessibilityState={{ selected: index === selectedIndex }}
        >
          <Text
            style={[
              styles.segmentText,
              {
                color: index === selectedIndex ? colors.text : colors.textMuted,
                fontSize: sizeConfig.fontSize,
                fontWeight: index === selectedIndex
                  ? ULTRA_TYPOGRAPHY.weight.semibold
                  : ULTRA_TYPOGRAPHY.weight.regular,
              },
            ]}
            numberOfLines={1}
          >
            {segment}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Header
  headerContainer: {
    width: '100%',
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ULTRA_SPACING[4],
  },
  headerButton: {
    width: pixelPerfect(44),
    height: pixelPerfect(44),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitles: {
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: ULTRA_TYPOGRAPHY.weight.bold,
    letterSpacing: ULTRA_TYPOGRAPHY.tracking.tight,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: ULTRA_TYPOGRAPHY.scale.footnote,
    marginTop: ULTRA_SPACING[0.5],
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: pixelPerfect(4),
    right: pixelPerfect(4),
    minWidth: pixelPerfect(18),
    height: pixelPerfect(18),
    borderRadius: pixelPerfect(9),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: pixelPerfect(4),
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: pixelPerfect(10),
    fontWeight: ULTRA_TYPOGRAPHY.weight.bold,
  },

  // Tab Bar
  tabBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: ULTRA_SPACING[2],
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabItemInner: {
    alignItems: 'center',
    paddingVertical: ULTRA_SPACING[2],
    paddingHorizontal: ULTRA_SPACING[3],
    borderRadius: ULTRA_RADIUS.lg,
  },
  tabItemFloating: {
    paddingVertical: ULTRA_SPACING[3],
  },
  tabIconContainer: {
    position: 'relative',
  },
  tabLabel: {
    fontSize: ULTRA_TYPOGRAPHY.scale.caption2,
    marginTop: ULTRA_SPACING[0.5],
    textAlign: 'center',
  },
  tabBadge: {
    position: 'absolute',
    top: pixelPerfect(-4),
    right: pixelPerfect(-8),
    minWidth: pixelPerfect(16),
    height: pixelPerfect(16),
    borderRadius: pixelPerfect(8),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: pixelPerfect(4),
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: pixelPerfect(9),
    fontWeight: ULTRA_TYPOGRAPHY.weight.bold,
  },

  // Segmented Control
  segmentedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: ULTRA_SPACING[4],
    padding: ULTRA_SPACING[0.5],
  },
  segmentIndicator: {
    position: 'absolute',
  },
  segment: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentText: {
    textAlign: 'center',
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  UltraHeader,
  UltraHeaderButton,
  UltraTabBar,
  UltraSegmentedControl,
};

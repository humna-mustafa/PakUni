import React, {useRef, useEffect, useCallback, memo} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../contexts/ThemeContext';
import {RADIUS, ANIMATION} from '../constants/design';
import {Haptics} from '../utils/haptics';
import {TabIcon} from './icons';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// Responsive breakpoints for different screen sizes
const isCompact = SCREEN_WIDTH < 360;
const isSmall = SCREEN_WIDTH < 390;

// Get responsive values based on screen size
const getResponsiveValues = () => ({
  iconSize: isCompact ? 22 : isSmall ? 23 : 24,
  fontSize: isCompact ? 10 : isSmall ? 10 : 11,
  paddingTop: isCompact ? 8 : 10,
});

interface TabItemProps {
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  label: string;
  routeName: string;
  colors: any;
  isDark: boolean;
}

const TabItem = memo(({
  isFocused,
  onPress,
  onLongPress,
  label,
  routeName,
  colors,
  isDark,
}: TabItemProps) => {
  const responsive = getResponsiveValues();
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const iconScaleAnim = useRef(new Animated.Value(isFocused ? 1.1 : 1)).current;
  const pillOpacityAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(iconScaleAnim, {
        toValue: isFocused ? 1.1 : 1,
        ...ANIMATION.spring.snappy,
        useNativeDriver: true,
      }),
      Animated.spring(pillOpacityAnim, {
        toValue: isFocused ? 1 : 0,
        ...ANIMATION.spring.snappy,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused, iconScaleAnim, pillOpacityAnim]);

  const handlePress = useCallback(() => {
    Haptics.tabSwitch();
    // Quick scale animation on press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        ...ANIMATION.spring.snappy,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  }, [onPress, scaleAnim]);

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={isFocused ? {selected: true} : {}}
      accessibilityLabel={`${label} tab${isFocused ? ', selected' : ''}`}
      onPress={handlePress}
      onLongPress={onLongPress}
      hitSlop={{top: 8, bottom: 8, left: 4, right: 4}}
      style={styles.tabItem}>
      <Animated.View 
        style={[
          styles.tabItemInner,
          {transform: [{scale: scaleAnim}]},
        ]}>
        {/* Active pill indicator */}
        <Animated.View
          style={[
            styles.activePill,
            {
              backgroundColor: isDark 
                ? `${colors.primary}25` 
                : `${colors.primary}12`,
              opacity: pillOpacityAnim,
            },
          ]}
        />
        
        {/* Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {transform: [{scale: iconScaleAnim}]},
          ]}>
          <TabIcon
            routeName={routeName}
            focused={isFocused}
            size={responsive.iconSize}
            color={colors.textSecondary}
            focusedColor={colors.primary}
          />
        </Animated.View>
        
        {/* Label - ALWAYS VISIBLE for both focused and unfocused */}
        <Text
          numberOfLines={1}
          style={[
            styles.label,
            {
              color: isFocused ? colors.primary : colors.textSecondary,
              fontSize: responsive.fontSize,
              fontWeight: isFocused ? '700' : '500',
              opacity: isFocused ? 1 : 0.7,
            },
          ]}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
});

TabItem.displayName = 'TabItem';

const PremiumTabBar = ({state, descriptors, navigation}: BottomTabBarProps) => {
  const {colors, isDark} = useTheme();
  const insets = useSafeAreaInsets();
  const responsive = getResponsiveValues();
  
  // Safe bottom padding
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 4 : 8);

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel="Main navigation"
      style={[
        styles.container,
        {
          paddingBottom: bottomPadding,
        },
      ]}>
      {/* Background with blur effect simulation */}
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
      
      {/* Subtle top border */}
      <View 
        style={[
          styles.topBorder,
          {
            backgroundColor: isDark 
              ? 'rgba(255, 255, 255, 0.08)' 
              : 'rgba(0, 0, 0, 0.06)',
          }
        ]} 
      />
      
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
  topBorder: {
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
    paddingVertical: 6,
    paddingHorizontal: 12,
    minWidth: 64,
  },
  activePill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: RADIUS.lg,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  label: {
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});

export default PremiumTabBar;

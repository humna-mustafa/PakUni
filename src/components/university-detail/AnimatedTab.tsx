/**
 * AnimatedTab - Tab button with press animation and active indicator
 */

import React, {useRef, useEffect} from 'react';
import {TouchableOpacity, Animated, Text, View, StyleSheet} from 'react-native';
import {TYPOGRAPHY, SPACING} from '../../constants/design';
import {ANIMATION_SCALES, SPRING_CONFIGS} from '../../constants/ui';
import {Icon} from '../icons';

interface AnimatedTabProps {
  label: string;
  iconName: string;
  isActive: boolean;
  onPress: () => void;
  index: number;
  colors: any;
}

const AnimatedTab: React.FC<AnimatedTabProps> = ({
  label,
  iconName,
  isActive,
  onPress,
  index,
  colors,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const indicatorWidth = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(indicatorWidth, {
      toValue: isActive ? 1 : 0,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();
  }, [isActive]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: ANIMATION_SCALES.CHIP_PRESS,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        ...SPRING_CONFIGS.snappy,
      }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={handlePress}>
      <Animated.View style={[styles.tab, {transform: [{scale}]}]}>
        <View style={[styles.tabIconWrapper, isActive && {opacity: 1}]}>
          <Icon
            name={iconName}
            family="Ionicons"
            size={20}
            color={isActive ? colors.primary : colors.textSecondary}
          />
        </View>
        <Text
          style={[
            styles.tabLabel,
            {color: isActive ? colors.primary : colors.textSecondary},
          ]}>
          {label}
        </Text>
        <Animated.View
          style={[
            styles.tabIndicator,
            {
              backgroundColor: colors.primary,
              transform: [{scaleX: indicatorWidth}],
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tab: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginRight: SPACING.xs,
  },
  tabIconWrapper: {
    opacity: 0.7,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: SPACING.sm,
    right: SPACING.sm,
    height: 3,
    borderRadius: 1.5,
  },
});

export default React.memo(AnimatedTab);

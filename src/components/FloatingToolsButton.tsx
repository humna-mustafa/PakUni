/**
 * FloatingToolsButton - Quick access to Tools from any screen
 * Premium floating action button with haptic feedback
 */

import React, {useRef, memo} from 'react';
import {
  TouchableOpacity,
  Animated,
  StyleSheet,
  Platform,
  View,
  Text,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../contexts/ThemeContext';
import {Icon} from './icons';
import {Haptics} from '../utils/haptics';
import {ANIMATION_SCALES, SPRING_CONFIGS} from '../constants/ui';
import {TYPOGRAPHY} from '../constants/design';

interface FloatingToolsButtonProps {
  /** Position from bottom */
  bottomOffset?: number;
  /** Show label text */
  showLabel?: boolean;
  /** Button size variant */
  size?: 'small' | 'medium' | 'large';
  /** Custom onPress handler */
  onPress?: () => void;
}

const FloatingToolsButton = memo<FloatingToolsButtonProps>(({
  bottomOffset = 100,
  showLabel = false,
  size = 'medium',
  onPress,
}) => {
  const navigation = useNavigation();
  const {colors, isDark} = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const sizeConfig = {
    small: {buttonSize: 48, iconSize: 20, fontSize: 10},
    medium: {buttonSize: 56, iconSize: 24, fontSize: 11},
    large: {buttonSize: 64, iconSize: 28, fontSize: 12},
  };

  const config = sizeConfig[size];

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: ANIMATION_SCALES.ICON_PRESS,
        useNativeDriver: true,
        ...SPRING_CONFIGS.snappy,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        ...SPRING_CONFIGS.responsive,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = () => {
    Haptics.light();
    if (onPress) {
      onPress();
    } else {
      navigation.navigate('Tools' as never);
    }
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '15deg'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: bottomOffset,
          transform: [{scale: scaleAnim}],
        },
      ]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel="Open calculator and tools">
        <View style={styles.buttonWrapper}>
          <LinearGradient
            colors={['#4573DF', '#3660C9']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={[
              styles.button,
              {
                width: config.buttonSize,
                height: config.buttonSize,
                borderRadius: config.buttonSize / 2,
              },
            ]}>
            <Animated.View style={{transform: [{rotate: rotation}]}}>
              <Icon
                name="calculator"
                family="Ionicons"
                size={config.iconSize}
                color="#FFFFFF"
              />
            </Animated.View>
          </LinearGradient>
          {showLabel && (
            <View style={[styles.label, {backgroundColor: colors.card}]}>
              <Text style={[styles.labelText, {color: colors.text, fontSize: config.fontSize}]}>
                Tools
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    zIndex: 999,
  },
  buttonWrapper: {
    alignItems: 'center',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#4573DF',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  label: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  labelText: {
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
});

FloatingToolsButton.displayName = 'FloatingToolsButton';

export default FloatingToolsButton;

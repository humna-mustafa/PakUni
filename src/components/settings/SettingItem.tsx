/**
 * SettingItem - Animated setting row with icon, title, subtitle, and optional right component
 */

import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {Icon} from '../icons';
import {FONTS} from '../../constants/theme';

export interface SettingItemProps {
  icon: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
  colors: any;
  showArrow?: boolean;
  destructive?: boolean;
  index?: number;
  disabled?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  iconColor,
  title,
  subtitle,
  onPress,
  rightComponent,
  colors,
  showArrow = true,
  destructive = false,
  index = 0,
  disabled = false,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const delay = index * 30;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, disabled ? 0.5 : 1],
        }),
        transform: [{translateX: slideAnim}, {scale: scaleAnim}],
      }}>
      <TouchableOpacity
        style={[styles.settingItem, {backgroundColor: colors.card}]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!onPress}
        activeOpacity={onPress ? 0.7 : 1}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityHint={subtitle}
        accessibilityState={{disabled: disabled || !onPress}}>
        <View style={[styles.settingIcon, {backgroundColor: `${iconColor}15`}]}>
          <Icon name={icon} family="Ionicons" size={20} color={iconColor} />
        </View>
        <View style={styles.settingContent}>
          <Text
            style={[
              styles.settingTitle,
              {color: destructive ? colors.error : colors.text},
            ]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, {color: colors.textSecondary}]}>
              {subtitle}
            </Text>
          )}
        </View>
        {rightComponent}
        {showArrow && onPress && !rightComponent && (
          <Icon
            name="chevron-forward"
            family="Ionicons"
            size={20}
            color={colors.textSecondary}
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: FONTS.weight.medium,
  },
  settingSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default React.memo(SettingItem);

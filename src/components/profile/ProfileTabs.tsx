/**
 * ProfileTabs - Animated tab bar for profile sections
 */

import React, {useRef} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Animated} from 'react-native';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS, ANIMATION} from '../../constants/design';
import {ANIMATION_SCALES} from '../../constants/ui';
import {Icon} from '../icons';
import {TABS} from './constants';

interface Props {
  activeTab: string;
  onTabPress: (tab: 'profile' | 'marks' | 'saved' | 'settings') => void;
  colors: any;
}

const AnimatedTab = ({
  tab,
  isActive,
  onPress,
  colors,
}: {
  tab: {id: string; iconName: string; label: string};
  isActive: boolean;
  onPress: () => void;
  colors: any;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {toValue: ANIMATION_SCALES.ICON_PRESS, duration: 80, useNativeDriver: true}),
      Animated.spring(scaleAnim, {toValue: 1, ...ANIMATION.spring.snappy, useNativeDriver: true}),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{flex: 1, transform: [{scale: scaleAnim}]}}>
      <TouchableOpacity
        style={[styles.tab, isActive && {backgroundColor: colors.primaryLight}]}
        onPress={handlePress}
        activeOpacity={0.8}
        accessibilityRole="tab"
        accessibilityState={{selected: isActive}}
        accessibilityLabel={`${tab.label} section`}>
        <Icon name={tab.iconName} family="Ionicons" size={20} color={isActive ? colors.primary : colors.textSecondary} />
        <Text style={[styles.tabLabel, {color: isActive ? colors.primary : colors.textSecondary}, isActive && styles.tabLabelActive]}>
          {tab.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const ProfileTabs = ({activeTab, onTabPress, colors}: Props) => (
  <View style={[styles.container, {backgroundColor: colors.card}]}>
    {TABS.map(tab => (
      <AnimatedTab
        key={tab.id}
        tab={tab}
        isActive={activeTab === tab.id}
        onPress={() => onTabPress(tab.id as any)}
        colors={colors}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginTop: -SPACING.xl,
    borderRadius: RADIUS.xl,
    padding: SPACING.xs,
    elevation: 12,
    shadowColor: '#4573DF',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  tab: {alignItems: 'center', paddingVertical: SPACING.sm, borderRadius: RADIUS.lg},
  tabLabel: {fontSize: TYPOGRAPHY.sizes.xs},
  tabLabelActive: {fontWeight: TYPOGRAPHY.weight.semibold},
});

export default ProfileTabs;

/**
 * TabButton - Favorites tab selector
 */

import React, {memo} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {TYPOGRAPHY} from '../../constants/design';

interface Props {
  label: string;
  count: number;
  isActive: boolean;
  onPress: () => void;
  colors: any;
}

const TabButton = memo<Props>(({label, count, isActive, onPress, colors}) => (
  <Pressable
    style={({pressed}) => [styles.button, {backgroundColor: isActive ? colors.primaryLight : 'transparent', opacity: pressed ? 0.8 : 1}]}
    onPress={onPress} accessibilityRole="tab" accessibilityState={{selected: isActive}}
    accessibilityLabel={`${label} tab, ${count} items`}>
    <Text style={[styles.label, {color: isActive ? colors.primary : colors.textSecondary}, isActive && styles.labelActive]}>{label}</Text>
    <View style={[styles.count, {backgroundColor: isActive ? colors.primary : colors.border}]}>
      <Text style={[styles.countText, {color: isActive ? '#FFFFFF' : colors.textSecondary}]}>{count}</Text>
    </View>
  </Pressable>
));

const styles = StyleSheet.create({
  button: {flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 12, gap: 6},
  label: {fontSize: 13, fontWeight: TYPOGRAPHY.weight.medium},
  labelActive: {fontWeight: TYPOGRAPHY.weight.bold},
  count: {paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, minWidth: 20, alignItems: 'center'},
  countText: {fontSize: 11, fontWeight: TYPOGRAPHY.weight.bold},
});

export default TabButton;

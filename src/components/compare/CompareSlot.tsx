/**
 * CompareSlot - Animated university slot for comparison
 */

import React, {useRef, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '../icons';
import {UniversityData} from '../../data';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../../constants/design';

const {width} = Dimensions.get('window');
const SLOT_WIDTH = (width - SPACING.md * 2 - SPACING.sm * 2) / 3;

interface CompareSlotProps {
  university: UniversityData | null;
  onPress: () => void;
  onRemove: () => void;
  index: number;
  colors: any;
}

export const CompareSlot: React.FC<CompareSlotProps> = React.memo(({
  university, onPress, onRemove, index, colors,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1, delay: index * 100, tension: 50, friction: 8, useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (!university) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {toValue: 1.05, duration: 1000, useNativeDriver: true}),
          Animated.timing(pulseAnim, {toValue: 1, duration: 1000, useNativeDriver: true}),
        ]),
      ).start();
    }
    return () => pulseAnim.stopAnimation();
  }, [university]);

  if (university) {
    return (
      <Animated.View
        style={[
          styles.slot,
          {
            backgroundColor: colors.card,
            borderColor: university.type === 'public' ? colors.success : colors.primary,
            transform: [{scale: scaleAnim}],
          },
        ]}>
        <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
          <LinearGradient colors={['#FF6B6B', '#EE5A5A']} style={styles.removeBtnGradient}>
            <Icon name="close" family="Ionicons" size={12} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
        <View style={styles.slotContent}>
          <Icon name="business-outline" family="Ionicons" size={28}
            color={university.type === 'public' ? colors.success : colors.primary} />
          <Text style={[styles.slotName, {color: colors.text}]} numberOfLines={2}>
            {university.short_name || university.name.split(' ').slice(0, 2).join(' ')}
          </Text>
          <View style={[styles.typeBadge, {
            backgroundColor: university.type === 'public' ? colors.success + '20' : colors.primary + '20',
          }]}>
            <Text style={[styles.typeText, {
              color: university.type === 'public' ? colors.success : colors.primary,
            }]}>
              {university.type}
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{transform: [{scale: Animated.multiply(scaleAnim, pulseAnim)}]}}>
      <TouchableOpacity style={[styles.emptySlot, {borderColor: colors.border}]} onPress={onPress}>
        <View style={[styles.addIcon, {backgroundColor: colors.primary + '15'}]}>
          <Text style={[styles.addIconText, {color: colors.primary}]}>+</Text>
        </View>
        <Text style={[styles.addText, {color: colors.textSecondary}]}>Add University</Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  slot: {
    width: SLOT_WIDTH, height: 130, borderRadius: RADIUS.lg, borderWidth: 2,
    overflow: 'hidden', elevation: 4,
    shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.15, shadowRadius: 6,
  },
  slotContent: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.sm},
  slotName: {fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weight.semibold, textAlign: 'center', marginBottom: 4},
  typeBadge: {paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10},
  typeText: {fontSize: 9, fontWeight: TYPOGRAPHY.weight.semibold, textTransform: 'capitalize'},
  removeBtn: {position: 'absolute', top: 6, right: 6, zIndex: 10},
  removeBtnGradient: {width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center'},
  emptySlot: {
    width: SLOT_WIDTH, height: 130, borderRadius: RADIUS.lg,
    borderWidth: 2, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center',
  },
  addIcon: {width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 6},
  addIconText: {fontSize: 24, fontWeight: TYPOGRAPHY.weight.light},
  addText: {fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weight.medium},
});

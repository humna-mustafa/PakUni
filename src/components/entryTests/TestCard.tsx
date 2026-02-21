/**
 * TestCard - Compact entry test card for the list view
 */

import React, {useRef, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Animated} from 'react-native';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../../constants/design';
import {ANIMATION_SCALES, SPRING_CONFIGS} from '../../constants/ui';
import {Icon} from '../icons';
import {EntryTestData} from '../../data';
import {getEntryTestBrandColors} from '../../data/entryTests';
import {getFieldTag, getShortDate} from './helpers';

interface Props {
  test: EntryTestData;
  onPress: () => void;
  index: number;
  colors: any;
}

const TestCard = ({test, onPress, index, colors}: Props) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: ANIMATION_SCALES.PRESS,
      useNativeDriver: true,
      ...SPRING_CONFIGS.snappy,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...SPRING_CONFIGS.responsive,
    }).start();
  };

  const brandColors = getEntryTestBrandColors(test.name);
  const fieldTag = getFieldTag(test);
  const shortDate = getShortDate(test.test_date);

  return (
    <Animated.View
      style={{
        transform: [{translateY: slideAnim}, {scale: scaleAnim}],
        opacity: fadeAnim,
      }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}>
        <View style={[styles.card, {backgroundColor: colors.card}]}>
          <View style={[styles.strip, {backgroundColor: brandColors.primary}]} />
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={[styles.icon, {backgroundColor: brandColors.primary + '20'}]}>
                <Text style={{fontSize: 16, fontWeight: '800', color: brandColors.primary}}>
                  {test.name.substring(0, 3).toUpperCase()}
                </Text>
              </View>
              <View style={styles.titleContainer}>
                <Text style={[styles.name, {color: colors.text}]} numberOfLines={1}>
                  {test.name}
                </Text>
                <Text style={{color: colors.textSecondary, fontSize: 12}} numberOfLines={1}>
                  {test.conducting_body}
                </Text>
              </View>
            </View>
            <View style={styles.footer}>
              <View style={styles.meta}>
                <Icon name="calendar-outline" family="Ionicons" size={14} color={colors.textSecondary} />
                <Text style={[styles.metaText, {color: colors.textSecondary}]}>{shortDate}</Text>
              </View>
              <View style={[styles.badge, {backgroundColor: brandColors.primary + '18'}]}>
                <Text style={[styles.badgeText, {color: brandColors.primary}]}>{fieldTag}</Text>
              </View>
              <View style={[styles.viewBtn, {backgroundColor: brandColors.primary}]}>
                <Text style={styles.viewBtnText}>Details</Text>
                <Icon name="arrow-forward" family="Ionicons" size={12} color="#FFFFFF" containerStyle={{marginLeft: 4}} />
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  strip: {
    height: 4,
  },
  content: {
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  icon: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  titleContainer: {
    flex: 1,
  },
  name: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
    gap: 4,
  },
  metaText: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: SPACING.sm,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  viewBtn: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  viewBtnText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
});

export default TestCard;

/**
 * GuideListItem - Animated guide list card with category badge and tags
 */

import React, {useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {Icon} from '../../components/icons';
import {TYPOGRAPHY, RADIUS, SPACING} from '../../constants/design';
import {SPRING_CONFIGS} from '../../constants/ui';
import {GUIDE_CATEGORIES} from '../../data/guidesData';
import {calculateReadTime} from '../../utils/guideUtils';
import type {Guide} from '../../types/guides';

interface GuideListItemProps {
  guide: Guide;
  onPress: () => void;
  colors: any;
  index?: number;
}

const GuideListItemComponent: React.FC<GuideListItemProps> = ({
  guide,
  onPress,
  colors,
  index = 0,
}) => {
  const category = GUIDE_CATEGORIES.find(c => c.id === guide.categoryId);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    const delay = index * 60;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
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
    Animated.spring(scaleAnim, {
      toValue: 0.97,
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

  return (
    <Animated.View
      style={{
        transform: [{scale: scaleAnim}, {translateY: slideAnim}],
        opacity: fadeAnim,
      }}>
      <TouchableOpacity
        style={[styles.container, {backgroundColor: colors.card}]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View
              style={[
                styles.categoryBadge,
                {backgroundColor: (category?.color || '#4573DF') + '15'},
              ]}>
              <Text
                style={[
                  styles.categoryText,
                  {color: category?.color || '#4573DF'},
                ]}>
                {category?.title}
              </Text>
            </View>
            <View style={styles.meta}>
              <Icon
                name="time-outline"
                size={12}
                color={colors.textSecondary}
              />
              <Text style={[styles.metaText, {color: colors.textSecondary}]}>
                {calculateReadTime(guide)}
              </Text>
            </View>
          </View>
          <Text style={[styles.title, {color: colors.text}]}>
            {guide.title}
          </Text>
          <Text
            style={[styles.description, {color: colors.textSecondary}]}
            numberOfLines={2}>
            {guide.description}
          </Text>
          <View style={styles.tagsContainer}>
            {guide.tags.slice(0, 3).map((tag, idx) => (
              <View
                key={idx}
                style={[styles.tag, {backgroundColor: colors.background}]}>
                <Text style={[styles.tagText, {color: colors.textSecondary}]}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        </View>
        <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  categoryBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11,
    marginLeft: 4,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: 4,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginRight: 4,
  },
  tagText: {
    fontSize: 10,
  },
});

export const GuideListItem = React.memo(GuideListItemComponent);

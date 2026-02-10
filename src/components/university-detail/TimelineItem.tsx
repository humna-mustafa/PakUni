/**
 * TimelineItem - Animated timeline row for admission timeline
 */

import React, {useRef, useEffect} from 'react';
import {Animated, View, Text, StyleSheet} from 'react-native';
import {TYPOGRAPHY, SPACING} from '../../constants/design';

// Fallback LinearGradient
let LinearGradient: React.ComponentType<any>;
try {
  LinearGradient = require('react-native-linear-gradient').default;
} catch {
  LinearGradient = ({children, style, colors}: any) => (
    <View style={[style, {backgroundColor: colors?.[0] || '#667eea'}]}>
      {children}
    </View>
  );
}

interface TimelineItemProps {
  title: string;
  date: string;
  isLast: boolean;
  index: number;
  colors: any;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  title,
  date,
  isLast,
  index,
  colors,
}) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animValue, {
      toValue: 1,
      delay: index * 150,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.timelineItem,
        {
          opacity: animValue,
          transform: [
            {
              translateX: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-30, 0],
              }),
            },
          ],
        },
      ]}>
      <View style={styles.timelineLeft}>
        <LinearGradient
          colors={
            isLast
              ? ['#10B981', '#059669']
              : [colors.primary, colors.primaryDark || colors.primary]
          }
          style={styles.timelineDot}
        />
        {!isLast && (
          <View
            style={[styles.timelineLine, {backgroundColor: colors.border}]}
          />
        )}
      </View>
      <View style={styles.timelineContent}>
        <Text style={[styles.timelineTitle, {color: colors.text}]}>
          {title}
        </Text>
        <Text style={[styles.timelineDate, {color: colors.textSecondary}]}>
          {date}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  timelineItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: SPACING.md,
  },
  timelineTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  timelineDate: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 2,
  },
});

export default React.memo(TimelineItem);

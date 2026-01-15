/**
 * SkeletonLoader Component
 * Animated placeholder for loading states
 * Now with theme support for dark mode
 */

import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Animated, ViewStyle, Dimensions, DimensionValue} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import {BORDER_RADIUS, SPACING} from '../constants/theme';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface SkeletonLoaderProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = BORDER_RADIUS.md,
  style,
}) => {
  const {colors} = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startShimmer = () => {
      shimmerAnim.setValue(0);
      Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ).start();
    };
    startShimmer();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.skeletonBase,
        },
        style,
      ]}>
      <Animated.View
        style={[
          styles.shimmer,
          {
            backgroundColor: colors.skeletonHighlight,
            transform: [{translateX}],
          },
        ]}
      />
    </View>
  );
};

// Preset skeleton layouts with theme support
export const SkeletonCard: React.FC<{rows?: number}> = ({rows = 3}) => {
  const {colors} = useTheme();
  
  return (
    <View style={[styles.card, {backgroundColor: colors.card}]}>
      <View style={styles.cardHeader}>
        <SkeletonLoader width={50} height={50} borderRadius={25} />
        <View style={styles.cardHeaderText}>
          <SkeletonLoader width="80%" height={18} style={{marginBottom: 8}} />
          <SkeletonLoader width="50%" height={14} />
        </View>
      </View>
      {Array.from({length: rows}).map((_, i) => (
        <SkeletonLoader
          key={i}
          width={`${100 - i * 15}%`}
          height={14}
          style={{marginTop: SPACING.sm}}
        />
      ))}
    </View>
  );
};

export const SkeletonList: React.FC<{count?: number}> = ({count = 5}) => (
  <View style={styles.list}>
    {Array.from({length: count}).map((_, i) => (
      <SkeletonCard key={i} rows={2} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '100%',
    opacity: 0.5,
  },
  card: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },
  list: {
    padding: SPACING.md,
  },
});

export default SkeletonLoader;

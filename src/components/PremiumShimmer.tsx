/**
 * Premium Shimmer Component
 * Silicon Valley-grade loading shimmer effect
 */

import React, {useRef, useEffect} from 'react';
import {View, StyleSheet, Animated, Dimensions, ViewStyle} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../contexts/ThemeContext';
import {RADIUS} from '../constants/design';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface ShimmerProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Individual shimmer element
 */
export const Shimmer: React.FC<ShimmerProps> = ({
  width = '100%',
  height = 20,
  borderRadius = RADIUS.md,
  style,
}) => {
  const {colors, isDark} = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  const baseColor = isDark ? '#272C34' : '#E2E8F0';
  const highlightColor = isDark ? '#334155' : '#F1F5F9';

  return (
    <View
      style={[
        styles.shimmerBase,
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: baseColor,
        },
        style,
      ]}>
      <Animated.View
        style={[
          styles.shimmerGradient,
          {
            transform: [{translateX}],
          },
        ]}>
        <LinearGradient
          colors={[baseColor, highlightColor, baseColor]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

/**
 * Shimmer card placeholder
 */
export const ShimmerCard: React.FC<{style?: ViewStyle}> = ({style}) => {
  const {colors} = useTheme();

  return (
    <View style={[styles.card, {backgroundColor: colors.card}, style]}>
      <View style={styles.cardHeader}>
        <Shimmer width={60} height={60} borderRadius={RADIUS.lg} />
        <View style={styles.cardHeaderText}>
          <Shimmer width="70%" height={18} style={styles.mb8} />
          <Shimmer width="50%" height={14} />
        </View>
      </View>
      <Shimmer width="100%" height={12} style={styles.mb8} />
      <Shimmer width="80%" height={12} />
    </View>
  );
};

/**
 * Shimmer list item
 */
export const ShimmerListItem: React.FC<{style?: ViewStyle; hasIcon?: boolean}> = ({
  style,
  hasIcon = true,
}) => {
  const {colors} = useTheme();

  return (
    <View style={[styles.listItem, {backgroundColor: colors.card}, style]}>
      {hasIcon && <Shimmer width={48} height={48} borderRadius={RADIUS.md} />}
      <View style={[styles.listItemContent, !hasIcon && {marginLeft: 0}]}>
        <Shimmer width="60%" height={16} style={styles.mb4} />
        <Shimmer width="40%" height={12} />
      </View>
      <Shimmer width={60} height={28} borderRadius={RADIUS.full} />
    </View>
  );
};

/**
 * Shimmer stats row
 */
export const ShimmerStats: React.FC<{count?: number; style?: ViewStyle}> = ({
  count = 3,
  style,
}) => {
  const {colors} = useTheme();

  return (
    <View style={[styles.statsRow, {backgroundColor: colors.card}, style]}>
      {Array.from({length: count}).map((_, i) => (
        <View key={i} style={styles.statItem}>
          <Shimmer width={40} height={28} style={styles.mb4} />
          <Shimmer width={50} height={12} />
        </View>
      ))}
    </View>
  );
};

/**
 * Shimmer profile header
 */
export const ShimmerProfileHeader: React.FC<{style?: ViewStyle}> = ({style}) => {
  const {colors} = useTheme();

  return (
    <View style={[styles.profileHeader, {backgroundColor: colors.primary}, style]}>
      <Shimmer width={80} height={80} borderRadius={40} />
      <Shimmer width={150} height={22} style={{marginBottom: 8, marginTop: 12}} />
      <Shimmer width={100} height={14} />
    </View>
  );
};

/**
 * Shimmer paragraph (multiple lines)
 */
export const ShimmerParagraph: React.FC<{lines?: number; style?: ViewStyle}> = ({
  lines = 3,
  style,
}) => {
  return (
    <View style={style}>
      {Array.from({length: lines}).map((_, i) => (
        <Shimmer
          key={i}
          width={i === lines - 1 ? '60%' : '100%'}
          height={14}
          style={i < lines - 1 ? styles.mb8 : undefined}
        />
      ))}
    </View>
  );
};

/**
 * Shimmer grid item (for card grids)
 */
export const ShimmerGridItem: React.FC<{style?: ViewStyle}> = ({style}) => {
  const {colors} = useTheme();

  return (
    <View style={[styles.gridItem, {backgroundColor: colors.card}, style]}>
      <Shimmer width={48} height={48} borderRadius={RADIUS.lg} style={styles.mb8} />
      <Shimmer width="80%" height={14} style={styles.mb4} />
      <Shimmer width="50%" height={12} />
    </View>
  );
};

/**
 * Full page shimmer skeleton
 */
export const ShimmerFullPage: React.FC = () => {
  return (
    <View style={styles.fullPage}>
      <ShimmerStats style={styles.mb16} />
      <ShimmerCard style={styles.mb12} />
      <ShimmerCard style={styles.mb12} />
      <ShimmerListItem style={styles.mb8} />
      <ShimmerListItem style={styles.mb8} />
      <ShimmerListItem />
    </View>
  );
};

const styles = StyleSheet.create({
  shimmerBase: {
    overflow: 'hidden',
  },
  shimmerGradient: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH * 2,
  },
  card: {
    borderRadius: RADIUS.xl,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    padding: 12,
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  statsRow: {
    flexDirection: 'row',
    borderRadius: RADIUS.xl,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomLeftRadius: RADIUS.xxl,
    borderBottomRightRadius: RADIUS.xxl,
  },
  gridItem: {
    alignItems: 'center',
    borderRadius: RADIUS.xl,
    padding: 16,
    minHeight: 120,
  },
  fullPage: {
    padding: 16,
  },
  mb4: {marginBottom: 4},
  mb8: {marginBottom: 8},
  mb12: {marginBottom: 12},
  mb16: {marginBottom: 16},
  mt12: {marginTop: 12},
});

export default {
  Shimmer,
  ShimmerCard,
  ShimmerListItem,
  ShimmerStats,
  ShimmerProfileHeader,
  ShimmerParagraph,
  ShimmerGridItem,
  ShimmerFullPage,
};


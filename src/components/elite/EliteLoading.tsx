/**
 * Elite Loading Components
 * Premium loading states with smooth animations
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  ViewStyle,
  Dimensions,
  Easing,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import {
  ELITE_SPACING,
  ELITE_RADIUS,
  ELITE_MOTION,
} from '../../constants/elite';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// ELITE SHIMMER - Premium loading skeleton
// ============================================================================
interface EliteShimmerProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const EliteShimmer: React.FC<EliteShimmerProps> = ({
  width = '100%',
  height = 20,
  borderRadius = ELITE_RADIUS.md,
  style,
}) => {
  const { colors, isDark } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  const baseColor = isDark ? '#1E293B' : '#E2E8F0';
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
      ]}
    >
      <Animated.View
        style={[
          styles.shimmerHighlight,
          {
            backgroundColor: highlightColor,
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
};

// ============================================================================
// ELITE SKELETON CARD
// ============================================================================
interface EliteSkeletonCardProps {
  variant?: 'default' | 'horizontal' | 'compact';
  style?: ViewStyle;
}

export const EliteSkeletonCard: React.FC<EliteSkeletonCardProps> = ({
  variant = 'default',
  style,
}) => {
  const { colors, isDark } = useTheme();

  if (variant === 'horizontal') {
    return (
      <View
        style={[
          styles.skeletonCard,
          styles.horizontalCard,
          { backgroundColor: colors.card },
          style,
        ]}
      >
        <EliteShimmer width={60} height={60} borderRadius={ELITE_RADIUS.lg} />
        <View style={styles.horizontalContent}>
          <EliteShimmer width="70%" height={16} style={styles.mb8} />
          <EliteShimmer width="50%" height={12} />
        </View>
      </View>
    );
  }

  if (variant === 'compact') {
    return (
      <View
        style={[
          styles.skeletonCard,
          styles.compactCard,
          { backgroundColor: colors.card },
          style,
        ]}
      >
        <EliteShimmer width={40} height={40} borderRadius={ELITE_RADIUS.md} />
        <EliteShimmer width="60%" height={14} style={{ marginTop: 8 }} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.skeletonCard,
        { backgroundColor: colors.card },
        style,
      ]}
    >
      <View style={styles.cardHeader}>
        <EliteShimmer width={56} height={56} borderRadius={ELITE_RADIUS.lg} />
        <View style={styles.headerText}>
          <EliteShimmer width="70%" height={18} style={styles.mb8} />
          <EliteShimmer width="50%" height={14} />
        </View>
      </View>
      <EliteShimmer width="100%" height={12} style={styles.mb8} />
      <EliteShimmer width="85%" height={12} style={styles.mb8} />
      <EliteShimmer width="40%" height={12} />
    </View>
  );
};

// ============================================================================
// ELITE SKELETON LIST
// ============================================================================
interface EliteSkeletonListProps {
  count?: number;
  style?: ViewStyle;
}

export const EliteSkeletonList: React.FC<EliteSkeletonListProps> = ({
  count = 3,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={style}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.listItem,
            { backgroundColor: colors.card },
            index < count - 1 && styles.mb12,
          ]}
        >
          <EliteShimmer width={48} height={48} borderRadius={ELITE_RADIUS.md} />
          <View style={styles.listContent}>
            <EliteShimmer width="65%" height={16} style={styles.mb6} />
            <EliteShimmer width="45%" height={12} />
          </View>
          <EliteShimmer width={60} height={28} borderRadius={ELITE_RADIUS.full} />
        </View>
      ))}
    </View>
  );
};

// ============================================================================
// ELITE PULSE LOADER
// ============================================================================
interface ElitePulseLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  style?: ViewStyle;
}

export const ElitePulseLoader: React.FC<ElitePulseLoaderProps> = ({
  size = 'md',
  color,
  style,
}) => {
  const { colors } = useTheme();
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const dotColor = color || colors.primary;
  const dotSize = size === 'sm' ? 8 : size === 'lg' ? 14 : 10;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: 400,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.9,
            duration: 400,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <View style={[styles.pulseContainer, style]}>
      {[0, 1, 2].map((index) => (
        <Animated.View
          key={index}
          style={[
            styles.pulseDot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: dotColor,
              opacity: pulseAnim,
              transform: [{ scale: scaleAnim }],
              marginHorizontal: dotSize / 3,
            },
          ]}
        />
      ))}
    </View>
  );
};

// ============================================================================
// ELITE SPINNER
// ============================================================================
interface EliteSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  style?: ViewStyle;
}

export const EliteSpinner: React.FC<EliteSpinnerProps> = ({
  size = 'md',
  color,
  style,
}) => {
  const { colors } = useTheme();
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const spinnerColor = color || colors.primary;
  const spinnerSize = size === 'sm' ? 20 : size === 'lg' ? 40 : 28;
  const strokeWidth = size === 'sm' ? 2 : size === 'lg' ? 4 : 3;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.spinner,
        {
          width: spinnerSize,
          height: spinnerSize,
          borderRadius: spinnerSize / 2,
          borderWidth: strokeWidth,
          borderColor: spinnerColor + '30',
          borderTopColor: spinnerColor,
          transform: [{ rotate }],
        },
        style,
      ]}
    />
  );
};

// ============================================================================
// ELITE FULL PAGE LOADER
// ============================================================================
interface EliteFullPageLoaderProps {
  text?: string;
  style?: ViewStyle;
}

export const EliteFullPageLoader: React.FC<EliteFullPageLoaderProps> = ({
  text,
  style,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.fullPageLoader,
        { backgroundColor: colors.background },
        style,
      ]}
    >
      <EliteSpinner size="lg" />
      {text && (
        <Animated.Text
          style={[
            styles.loaderText,
            { color: colors.textSecondary },
          ]}
        >
          {text}
        </Animated.Text>
      )}
    </View>
  );
};

// ============================================================================
// ELITE CONTENT PLACEHOLDER
// ============================================================================
interface EliteContentPlaceholderProps {
  lines?: number;
  style?: ViewStyle;
}

export const EliteContentPlaceholder: React.FC<EliteContentPlaceholderProps> = ({
  lines = 4,
  style,
}) => {
  return (
    <View style={style}>
      {Array.from({ length: lines }).map((_, index) => (
        <EliteShimmer
          key={index}
          width={index === lines - 1 ? '60%' : '100%'}
          height={14}
          style={index < lines - 1 ? styles.mb12 : undefined}
        />
      ))}
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  shimmerBase: {
    overflow: 'hidden',
  },
  shimmerHighlight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH,
    opacity: 0.3,
  },
  skeletonCard: {
    padding: ELITE_SPACING[4],
    borderRadius: ELITE_RADIUS.xl,
  },
  horizontalCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  horizontalContent: {
    flex: 1,
    marginLeft: ELITE_SPACING[3],
  },
  compactCard: {
    alignItems: 'center',
    padding: ELITE_SPACING[3],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ELITE_SPACING[4],
  },
  headerText: {
    flex: 1,
    marginLeft: ELITE_SPACING[3],
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ELITE_SPACING[3],
    borderRadius: ELITE_RADIUS.lg,
  },
  listContent: {
    flex: 1,
    marginLeft: ELITE_SPACING[3],
  },
  pulseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseDot: {},
  spinner: {},
  fullPageLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: ELITE_SPACING[4],
    fontSize: 14,
    fontWeight: '500',
  },
  mb6: { marginBottom: 6 },
  mb8: { marginBottom: 8 },
  mb12: { marginBottom: 12 },
});

export default {
  EliteShimmer,
  EliteSkeletonCard,
  EliteSkeletonList,
  ElitePulseLoader,
  EliteSpinner,
  EliteFullPageLoader,
  EliteContentPlaceholder,
};

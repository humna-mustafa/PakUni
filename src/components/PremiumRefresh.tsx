/**
 * Premium Pull To Refresh Component
 * Silicon Valley-grade pull-to-refresh with custom animation
 */

import React, {useRef, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  RefreshControl,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../contexts/ThemeContext';
import {RADIUS, SPACING} from '../constants/design';
import {Haptics} from '../utils/haptics';
import {Icon} from './icons';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const REFRESH_THRESHOLD = 80;

interface PremiumRefreshControlProps {
  refreshing: boolean;
  onRefresh: () => void;
  colors?: string[];
  progressBackgroundColor?: string;
}

/**
 * Modern Top Refresh Bar - Shows status text with animated indicator
 */
export const TopRefreshBar: React.FC<{
  refreshing: boolean;
  message?: string;
}> = ({refreshing, message = 'Refreshing...'}) => {
  const {colors, isDark} = useTheme();
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (refreshing) {
      // Slide down and fade in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous spin animation
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ).start();

      // Pulse animation for the dot
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Progress bar animation
      Animated.loop(
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
      ).start();
    } else {
      // Slide up and fade out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -60,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      spinAnim.stopAnimation();
      pulseAnim.stopAnimation();
      progressAnim.stopAnimation();
      spinAnim.setValue(0);
      pulseAnim.setValue(1);
      progressAnim.setValue(0);
    }
  }, [refreshing, slideAnim, opacityAnim, spinAnim, pulseAnim, progressAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0%', '70%', '100%'],
  });

  if (!refreshing) return null;

  return (
    <Animated.View
      style={[
        styles.topRefreshBar,
        {
          backgroundColor: isDark ? colors.card : '#FFFFFF',
          transform: [{translateY: slideAnim}],
          opacity: opacityAnim,
          borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
        },
      ]}>
      {/* Progress bar at top */}
      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              backgroundColor: colors.primary,
              width: progressWidth,
            },
          ]}
        />
      </View>

      <View style={styles.topRefreshContent}>
        {/* Spinning icon */}
        <Animated.View style={{transform: [{rotate: spin}]}}>
          <Icon name="sync" family="Ionicons" size={18} color={colors.primary} />
        </Animated.View>

        {/* Status text */}
        <Text style={[styles.topRefreshText, {color: colors.text}]}>
          {message}
        </Text>

        {/* Animated pulse dot */}
        <Animated.View
          style={[
            styles.pulseDot,
            {
              backgroundColor: colors.success,
              transform: [{scale: pulseAnim}],
            },
          ]}
        />
      </View>
    </Animated.View>
  );
};

/**
 * Custom refresh indicator with brand animation
 */
export const RefreshIndicator: React.FC<{
  progress: number;
  refreshing: boolean;
}> = ({progress, refreshing}) => {
  const {colors, isDark} = useTheme();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (refreshing) {
      // Start continuous rotation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ).start();

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      rotateAnim.stopAnimation();
      pulseAnim.stopAnimation();
      rotateAnim.setValue(0);
      pulseAnim.setValue(1);
    }
  }, [refreshing, rotateAnim, pulseAnim]);

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: Math.min(progress, 1),
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [progress, scaleAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.indicatorContainer,
        {
          opacity: scaleAnim,
          transform: [{scale: Animated.multiply(scaleAnim, pulseAnim)}],
        },
      ]}>
      <LinearGradient
        colors={isDark ? ['#4573DF', '#4573DF'] : ['#4573DF', '#3660C9']}
        style={styles.indicator}>
        <Animated.View
          style={[
            styles.indicatorEmoji,
            {transform: [{rotate}]},
          ]}>
          <Icon name={refreshing ? 'refresh' : 'flag'} family="Ionicons" size={20} color="#FFFFFF" />
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
};

/**
 * Standard refresh control with premium styling
 */
export const PremiumRefreshControl: React.FC<PremiumRefreshControlProps> = ({
  refreshing,
  onRefresh,
  colors: customColors,
  progressBackgroundColor,
}) => {
  const {colors, isDark} = useTheme();

  const handleRefresh = () => {
    Haptics.refreshThreshold();
    onRefresh();
  };

  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      colors={customColors || [colors.primary, colors.secondary]}
      progressBackgroundColor={progressBackgroundColor || colors.card}
      tintColor={colors.primary}
      titleColor={colors.text}
    />
  );
};

/**
 * Branded loading footer for infinite scroll
 */
export const LoadingFooter: React.FC<{
  loading: boolean;
  hasMore: boolean;
}> = ({loading, hasMore}) => {
  const {colors} = useTheme();
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ).start();
    } else {
      rotateAnim.stopAnimation();
      rotateAnim.setValue(0);
    }
  }, [loading]);

  if (!loading && hasMore) return null;

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.footer}>
      {loading ? (
        <View style={styles.footerLoading}>
          <Animated.View style={{transform: [{rotate}]}}>
            <Icon
              name="reload"
              family="Ionicons"
              size={20}
              color={colors.primary}
            />
          </Animated.View>
          <Text style={[styles.footerText, {color: colors.textSecondary}]}>
            Loading more...
          </Text>
        </View>
      ) : !hasMore ? (
        <View style={styles.footerEnd}>
          <Icon
            name="checkmark-circle"
            family="Ionicons"
            size={24}
            color={colors.success}
          />
          <Text style={[styles.footerText, {color: colors.textSecondary}]}>
            You've seen it all!
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  // Top Refresh Bar
  topRefreshBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    borderBottomWidth: StyleSheet.hairlineWidth,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  progressBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  topRefreshContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  topRefreshText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // Original indicator styles
  indicatorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: REFRESH_THRESHOLD,
  },
  indicator: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  indicatorEmoji: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingVertical: SPACING[4],
    alignItems: 'center',
  },
  footerLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  footerEmoji: {
    fontSize: 20,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footerEnd: {
    alignItems: 'center',
    gap: SPACING[1],
  },
  footerEndEmoji: {
    fontSize: 24,
  },
});

export default {
  TopRefreshBar,
  RefreshIndicator,
  PremiumRefreshControl,
  LoadingFooter,
};


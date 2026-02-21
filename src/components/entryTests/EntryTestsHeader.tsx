/**
 * EntryTestsHeader - Gradient header with icon
 */

import React from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SPACING} from '../../constants/design';
import {TYPOGRAPHY, RADIUS} from '../../constants/design';
import {Icon} from '../icons';

interface Props {
  headerAnim: Animated.Value;
  isDark: boolean;
}

const EntryTestsHeader = ({headerAnim, isDark}: Props) => (
  <Animated.View
    style={{
      opacity: headerAnim,
      transform: [
        {
          translateY: headerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-20, 0],
          }),
        },
      ],
    }}>
    <LinearGradient
      colors={isDark ? ['#8e44ad', '#6c3483'] : ['#9b59b6', '#8e44ad']}
      style={styles.header}>
      <View style={styles.decoration1} />
      <View style={styles.decoration2} />
      <View style={styles.iconContainer}>
        <Icon name="clipboard-outline" family="Ionicons" size={50} color="#FFFFFF" />
      </View>
      <Text style={styles.title}>Entry Tests</Text>
      <Text style={styles.subtitle}>Prepare for university admission tests</Text>
    </LinearGradient>
  </Animated.View>
);

const styles = StyleSheet.create({
  header: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    borderBottomLeftRadius: RADIUS.xxl,
    borderBottomRightRadius: RADIUS.xxl,
    overflow: 'hidden',
  },
  decoration1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  decoration2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  iconContainer: {
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
});

export default EntryTestsHeader;

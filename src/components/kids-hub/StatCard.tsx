/**
 * StatCard - Animated progress stat card for Kids Hub
 */

import React, {useRef, useEffect} from 'react';
import {Text, StyleSheet, Animated} from 'react-native';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../../constants/design';
import {Icon} from '../icons';

interface StatCardProps {
  iconName: string;
  value: string;
  label: string;
  index: number;
  colors: any;
}

const StatCard: React.FC<StatCardProps> = ({iconName, value, label, index, colors}) => {
  const slideAnim = useRef(new Animated.Value(30)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: 500 + index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: 500 + index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.statCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          transform: [{translateY: slideAnim}],
          opacity: fadeAnim,
        },
      ]}>
      <Icon name={iconName} family="Ionicons" size={24} color={colors.primary} />
      <Text style={[styles.statValue, {color: colors.text}]}>{value}</Text>
      <Text style={[styles.statLabel, {color: colors.textSecondary}]}>{label}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  statCard: {
    flex: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
  },
});

export default React.memo(StatCard);

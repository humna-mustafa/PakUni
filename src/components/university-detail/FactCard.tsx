/**
 * FactCard - Animated stat card for Quick Facts section
 */

import React, {useRef, useEffect} from 'react';
import {Animated, View, Text, StyleSheet, Dimensions} from 'react-native';
import {TYPOGRAPHY, SPACING, RADIUS} from '../../constants/design';
import {Icon} from '../icons';

const {width} = Dimensions.get('window');

interface FactCardProps {
  iconName: string;
  label: string;
  value: string;
  index: number;
  colors: any;
  isDark: boolean;
}

const FactCard: React.FC<FactCardProps> = ({
  iconName,
  label,
  value,
  index,
  colors,
  isDark,
}) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animValue, {
      toValue: 1,
      delay: index * 100,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.factCard,
        {
          backgroundColor: isDark
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(0,0,0,0.02)',
          opacity: animValue,
          transform: [
            {
              translateY: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
            {
              scale: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            },
          ],
        },
      ]}>
      <View
        style={[
          styles.factIconContainer,
          {backgroundColor: `${colors.primary}15`},
        ]}>
        <Icon name={iconName} family="Ionicons" size={22} color={colors.primary} />
      </View>
      <Text style={[styles.factLabel, {color: colors.textSecondary}]}>
        {label}
      </Text>
      <Text style={[styles.factValue, {color: colors.text}]}>{value}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  factCard: {
    width: (width - SPACING.md * 3) / 2,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  factIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  factLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginBottom: 2,
  },
  factValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
});

export default React.memo(FactCard);

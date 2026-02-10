/**
 * PollOptionItem - Single poll option with animated progress bar
 */

import React, {useRef, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Platform,
} from 'react-native';
import {TYPOGRAPHY, SPACING, RADIUS} from '../../constants/design';
import {Icon} from '../icons';
import type {PollOption} from '../../data/polls';
import type {ThemeColors} from '../../contexts/ThemeContext';

interface Props {
  option: PollOption;
  totalVotes: number;
  isSelected: boolean;
  hasVoted: boolean;
  isWinner: boolean;
  onSelect: () => void;
  colors: ThemeColors;
  isDark: boolean;
  index: number;
}

const PollOptionItem: React.FC<Props> = ({
  option,
  totalVotes,
  isSelected,
  hasVoted,
  isWinner,
  onSelect,
  colors,
  isDark,
  index,
}) => {
  const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (hasVoted) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 500,
          delay: index * 100,
          useNativeDriver: false,
        }),
        Animated.timing(widthAnim, {
          toValue: percentage,
          duration: 800,
          delay: index * 100 + 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [hasVoted, percentage, index, slideAnim, widthAnim]);

  const barWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <TouchableOpacity
      activeOpacity={hasVoted ? 1 : 0.8}
      onPress={hasVoted ? undefined : onSelect}
      style={[
        styles.option,
        {
          backgroundColor: isSelected
            ? `${colors.primary}15`
            : isDark
            ? colors.card
            : '#F8FAFC',
          borderColor: isSelected ? colors.primary : colors.border,
        },
      ]}>
      {/* Progress bar (shown after voting) */}
      {hasVoted && (
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: barWidth,
              backgroundColor: isWinner
                ? `${colors.success}20`
                : isSelected
                ? `${colors.primary}15`
                : `${colors.textSecondary}10`,
            },
          ]}
        />
      )}

      <View style={styles.content}>
        <View style={styles.left}>
          {!hasVoted && (
            <View
              style={[
                styles.radio,
                {
                  borderColor: isSelected ? colors.primary : colors.border,
                  backgroundColor: isSelected ? colors.primary : 'transparent',
                },
              ]}>
              {isSelected && (
                <Icon name="checkmark" family="Ionicons" size={14} color="#FFFFFF" />
              )}
            </View>
          )}
          {hasVoted && isWinner && (
            <Icon name="trophy" family="Ionicons" size={18} color={colors.success} />
          )}
          <Text
            style={[
              styles.name,
              {
                color: isWinner ? colors.success : colors.text,
                fontWeight: isWinner ? '700' : '600',
              },
            ]}
            numberOfLines={1}>
            {option.shortName || option.name}
          </Text>
        </View>

        {hasVoted && (
          <View style={styles.right}>
            <Text style={[styles.votes, {color: colors.textSecondary}]}>
              {option.votes.toLocaleString()}
            </Text>
            <Text
              style={[
                styles.percentage,
                {
                  color: isWinner ? colors.success : colors.text,
                  fontWeight: isWinner ? '700' : '600',
                },
              ]}>
              {percentage.toFixed(1)}%
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  option: {
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: TYPOGRAPHY.sizes.md,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  votes: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  percentage: {
    fontSize: TYPOGRAPHY.sizes.md,
    minWidth: 50,
    textAlign: 'right',
  },
});

export default React.memo(PollOptionItem);

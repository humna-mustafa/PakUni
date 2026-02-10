/**
 * PollCard - Complete poll card with options, voting, and results
 */

import React, {useState, useRef, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import {TYPOGRAPHY, SPACING, RADIUS} from '../../constants/design';
import {Icon} from '../icons';
import {Haptics} from '../../utils/haptics';
import {POLL_CATEGORIES} from '../../services/polls';
import PollOptionItem from './PollOptionItem';
import type {Poll} from '../../data/polls';
import type {ThemeColors} from '../../contexts/ThemeContext';

const CATEGORY_COLORS: Record<string, string> = {
  campus: '#4573DF',
  academics: '#10B981',
  facilities: '#F59E0B',
  career: '#4573DF',
  overall: '#EF4444',
};

interface Props {
  poll: Poll;
  votedPolls: Record<string, string>;
  onVote: (pollId: string, optionId: string) => void;
  onShare: (poll: Poll) => void;
  colors: ThemeColors;
  isDark: boolean;
  index: number;
}

const PollCard: React.FC<Props> = ({
  poll,
  votedPolls,
  onVote,
  onShare,
  colors,
  isDark,
  index,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const hasVoted = poll.id in votedPolls;
  const userVote = votedPolls[poll.id];

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const delay = Math.min(index * 50, 300);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay,
        tension: 65,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, fadeAnim, slideAnim]);

  const sortedOptions = useMemo(() => {
    if (!hasVoted) return poll.options;
    return [...poll.options].sort((a, b) => b.votes - a.votes);
  }, [poll.options, hasVoted]);

  const winner = sortedOptions[0];
  const categoryColor = CATEGORY_COLORS[poll.category] ?? colors.primary;

  const handleVote = () => {
    if (!selectedOption) {
      Alert.alert('Select an Option', 'Please select an option to vote');
      return;
    }
    onVote(poll.id, selectedOption);
    Haptics.success();
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          opacity: fadeAnim,
          transform: [{translateY: slideAnim}],
        },
      ]}>
      {/* Header row */}
      <View style={styles.header}>
        <View style={[styles.categoryBadge, {backgroundColor: `${categoryColor}15`}]}>
          <Text style={[styles.categoryText, {color: categoryColor}]}>
            {POLL_CATEGORIES.find(c => c.id === poll.category)?.name || poll.category}
          </Text>
        </View>
        {hasVoted && (
          <TouchableOpacity
            style={[styles.shareBtn, {backgroundColor: `${colors.primary}10`}]}
            onPress={() => onShare(poll)}
            activeOpacity={0.8}>
            <Icon name="share-social-outline" family="Ionicons" size={16} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Question */}
      <Text style={[styles.question, {color: colors.text}]}>{poll.question}</Text>
      <Text style={[styles.description, {color: colors.textSecondary}]}>
        {poll.description}
      </Text>

      {/* Options list */}
      <View style={styles.options}>
        {sortedOptions.map((option, i) => (
          <PollOptionItem
            key={option.id}
            option={option}
            totalVotes={poll.totalVotes}
            isSelected={hasVoted ? userVote === option.id : selectedOption === option.id}
            hasVoted={hasVoted}
            isWinner={hasVoted && option.id === winner.id}
            onSelect={() => setSelectedOption(option.id)}
            colors={colors}
            isDark={isDark}
            index={i}
          />
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.stats}>
          <Icon name="people-outline" family="Ionicons" size={14} color={colors.textSecondary} />
          <Text style={[styles.votesCount, {color: colors.textSecondary}]}>
            {poll.totalVotes.toLocaleString()} votes
          </Text>
        </View>

        {!hasVoted ? (
          <TouchableOpacity
            style={[
              styles.voteBtn,
              {backgroundColor: selectedOption ? colors.primary : colors.border},
            ]}
            onPress={handleVote}
            disabled={!selectedOption}
            activeOpacity={0.9}>
            <Text
              style={[
                styles.voteBtnText,
                {color: selectedOption ? '#FFFFFF' : colors.textSecondary},
              ]}>
              Vote Now
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.votedBadge, {backgroundColor: `${colors.success}15`}]}>
            <Icon name="checkmark-circle" family="Ionicons" size={14} color={colors.success} />
            <Text style={[styles.votedText, {color: colors.success}]}>Voted</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {elevation: 3},
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryBadge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
  },
  categoryText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  shareBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  question: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: 4,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  options: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  votesCount: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  voteBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  voteBtnText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  votedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.md,
    gap: 4,
  },
  votedText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
});

export default React.memo(PollCard);

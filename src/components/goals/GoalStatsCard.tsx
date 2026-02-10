import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../../constants/design';
import {Icon} from '../icons';
import type {UserGoal} from '../../types/goals';

interface GoalStatsCardProps {
  goals: UserGoal[];
  totalProgress: number;
  colors: any;
}

const GoalStatsCard = React.memo(
  ({goals, totalProgress, colors}: GoalStatsCardProps) => {
    const completedMilestones = goals.reduce(
      (sum, g) =>
        sum + g.milestones.filter((m: any) => m.completed).length,
      0,
    );

    return (
      <View style={[styles.statsCard, {backgroundColor: colors.card}]}>
        <View style={styles.statItem}>
          <Icon
            name="flag-outline"
            family="Ionicons"
            size={24}
            color={colors.primary}
          />
          <Text style={[styles.statValue, {color: colors.text}]}>
            {goals.length}
          </Text>
          <Text style={[styles.statLabel, {color: colors.textSecondary}]}>
            Goals
          </Text>
        </View>
        <View
          style={[styles.statDivider, {backgroundColor: colors.border}]}
        />
        <View style={styles.statItem}>
          <Icon
            name="trending-up-outline"
            family="Ionicons"
            size={24}
            color={colors.success}
          />
          <Text style={[styles.statValue, {color: colors.success}]}>
            {totalProgress}%
          </Text>
          <Text style={[styles.statLabel, {color: colors.textSecondary}]}>
            Progress
          </Text>
        </View>
        <View
          style={[styles.statDivider, {backgroundColor: colors.border}]}
        />
        <View style={styles.statItem}>
          <Icon
            name="checkmark-circle-outline"
            family="Ionicons"
            size={24}
            color={colors.success}
          />
          <Text style={[styles.statValue, {color: colors.text}]}>
            {completedMilestones}
          </Text>
          <Text style={[styles.statLabel, {color: colors.textSecondary}]}>
            Done
          </Text>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  statsCard: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    marginTop: -20,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  statDivider: {
    width: 1,
    height: '80%',
    alignSelf: 'center',
  },
});

export default GoalStatsCard;

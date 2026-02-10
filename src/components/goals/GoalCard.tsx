import React, {useRef, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Animated} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../../constants/design';
import {Icon} from '../icons';
import {parseDDMMYYYY} from '../../hooks/useGoals';
import type {UserGoal} from '../../types/goals';
import ProgressCircle from './ProgressCircle';

interface GoalCardProps {
  goal: UserGoal;
  onPress: () => void;
  onEdit: () => void;
  index: number;
  colors: any;
}

const GoalCard = React.memo(
  ({goal, onPress, onEdit, index, colors}: GoalCardProps) => {
    const slideAnim = useRef(new Animated.Value(50)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          delay: index * 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    const completedMilestones = goal.milestones.filter(
      (m: any) => m.completed,
    ).length;
    const totalMilestones = goal.milestones.length;

    const getDaysRemaining = () => {
      if (!goal.deadline) return null;
      const parsed = parseDDMMYYYY(goal.deadline);
      if (!parsed) {
        const deadline = new Date(goal.deadline);
        if (isNaN(deadline.getTime())) return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return Math.ceil(
          (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return Math.ceil(
        (parsed.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );
    };

    const daysRemaining = getDaysRemaining();
    const isOverdue = daysRemaining !== null && daysRemaining < 0;
    const isDueSoon =
      daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 3;
    const isCompleted = goal.completed || goal.progress === 100;

    const getDeadlineText = () => {
      if (!goal.deadline) return 'No deadline';
      if (isCompleted) return 'Completed!';
      if (daysRemaining === null) return 'No deadline';
      if (daysRemaining < 0)
        return `${Math.abs(daysRemaining)} days overdue`;
      if (daysRemaining === 0) return 'Due today!';
      if (daysRemaining === 1) return '1 day left';
      return `${daysRemaining} days left`;
    };

    const getDeadlineColor = () => {
      if (isCompleted) return colors.success;
      if (isOverdue) return '#E74C3C';
      if (isDueSoon) return '#f39c12';
      return colors.textSecondary;
    };

    return (
      <Animated.View
        style={[
          {
            transform: [{translateY: slideAnim}, {scale: scaleAnim}],
            opacity: fadeAnim,
          },
        ]}>
        <TouchableOpacity activeOpacity={0.9} onPress={onPress} onLongPress={onEdit}>
          <View
            style={[
              styles.goalCard,
              {backgroundColor: colors.card},
              isOverdue &&
                !isCompleted && {borderColor: '#E74C3C', borderWidth: 2},
            ]}>
            <LinearGradient
              colors={[goal.color + '15', 'transparent']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.cardGradient}
            />

            <TouchableOpacity
              style={styles.editIconBtn}
              onPress={onEdit}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Icon
                name="pencil-outline"
                family="Ionicons"
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            <View style={styles.goalHeader}>
              <View
                style={[
                  styles.goalIconContainer,
                  {backgroundColor: goal.color + '20'},
                ]}>
                <Icon
                  name={goal.iconName}
                  family="Ionicons"
                  size={28}
                  color={goal.color}
                />
              </View>
              <View style={styles.goalTitleArea}>
                <Text style={[styles.goalTitle, {color: colors.text}]}>
                  {goal.title}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                  }}>
                  <Icon
                    name={
                      isOverdue && !isCompleted
                        ? 'alert-circle-outline'
                        : 'time-outline'
                    }
                    family="Ionicons"
                    size={12}
                    color={getDeadlineColor()}
                  />
                  <Text
                    style={[
                      styles.goalDeadline,
                      {
                        color: getDeadlineColor(),
                        fontWeight: isOverdue ? '600' : '400',
                      },
                    ]}>
                    {getDeadlineText()}
                  </Text>
                </View>
                {goal.deadline && (
                  <Text
                    style={[
                      styles.goalDeadlineDate,
                      {color: colors.textMuted},
                    ]}>
                    Due: {goal.deadline}
                  </Text>
                )}
              </View>
              <ProgressCircle
                progress={goal.progress}
                color={goal.color}
                colors={colors}
              />
            </View>

            {/* Progress bar */}
            <View style={styles.progressSection}>
              <View
                style={[
                  styles.progressTrack,
                  {backgroundColor: colors.background},
                ]}>
                <LinearGradient
                  colors={[goal.color, goal.color + 'CC']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={[
                    styles.progressFill,
                    {width: `${goal.progress}%`},
                  ]}
                />
              </View>
            </View>

            {/* Milestones preview */}
            <View style={styles.milestonesPreview}>
              {goal.milestones
                .slice(0, 2)
                .map((milestone: any, i: number) => (
                  <View key={i} style={styles.milestoneItem}>
                    <View
                      style={[
                        styles.milestoneCheck,
                        {
                          backgroundColor: milestone.completed
                            ? goal.color
                            : colors.background,
                          borderColor: milestone.completed
                            ? goal.color
                            : colors.border,
                        },
                      ]}>
                      {milestone.completed && (
                        <Icon
                          name="checkmark"
                          family="Ionicons"
                          size={12}
                          color="#FFFFFF"
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.milestoneText,
                        {
                          color: milestone.completed
                            ? colors.textSecondary
                            : colors.text,
                          textDecorationLine: milestone.completed
                            ? 'line-through'
                            : 'none',
                        },
                      ]}>
                      {milestone.text}
                    </Text>
                  </View>
                ))}
            </View>

            <View style={styles.cardFooter}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}>
                <Icon
                  name="checkmark-circle"
                  family="Ionicons"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text
                  style={[
                    styles.milestonesCount,
                    {color: colors.textSecondary},
                  ]}>
                  {completedMilestones}/{totalMilestones} milestones
                </Text>
              </View>
              <View
                style={[
                  styles.viewBtn,
                  {
                    backgroundColor: goal.color,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                  },
                ]}>
                <Text style={styles.viewBtnText}>View</Text>
                <Icon
                  name="arrow-forward"
                  family="Ionicons"
                  size={14}
                  color="#FFFFFF"
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  },
);

const styles = StyleSheet.create({
  goalCard: {
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  editIconBtn: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  goalIconContainer: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  goalTitleArea: {
    flex: 1,
  },
  goalTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: 2,
  },
  goalDeadline: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  goalDeadlineDate: {
    fontSize: 10,
    marginTop: 2,
  },
  progressSection: {
    marginBottom: SPACING.sm,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  milestonesPreview: {
    marginBottom: SPACING.sm,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  milestoneCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  milestoneText: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  milestonesCount: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  viewBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  viewBtnText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
});

export default GoalCard;

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../../constants/design';
import {Icon} from '../icons';
import type {UserGoal} from '../../types/goals';

interface GoalDetailModalProps {
  visible: boolean;
  goal: UserGoal | null;
  onClose: () => void;
  onToggleMilestone: (goalId: string, milestoneIdx: number) => void;
  onEdit: (goal: UserGoal) => void;
  onToggleCompleted: (goalId: string) => void;
  onDelete: (goalId: string) => void;
  onAddMilestone: (goalId: string, text: string) => void;
  onRemoveMilestone: (goalId: string, milestoneIdx: number) => void;
  newMilestoneText: string;
  onNewMilestoneTextChange: (text: string) => void;
  colors: any;
  isDark: boolean;
}

const GoalDetailModal = React.memo(
  ({
    visible,
    goal,
    onClose,
    onToggleMilestone,
    onEdit,
    onToggleCompleted,
    onDelete,
    onAddMilestone,
    onRemoveMilestone,
    newMilestoneText,
    onNewMilestoneTextChange,
    colors,
    isDark,
  }: GoalDetailModalProps) => {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={onClose}
          />
          <View
            style={[
              styles.detailModalContent,
              {backgroundColor: colors.card},
            ]}>
            <View style={styles.modalHandle} />

            {goal && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Goal Header */}
                <LinearGradient
                  colors={[goal.color, goal.color + 'CC']}
                  style={styles.detailHeader}>
                  <Icon
                    name={goal.iconName}
                    family="Ionicons"
                    size={60}
                    color="#FFFFFF"
                  />
                  <Text style={styles.detailTitle}>{goal.title}</Text>
                  <View style={styles.detailProgress}>
                    <Text style={styles.detailProgressText}>
                      {goal.progress}% Complete
                    </Text>
                  </View>
                </LinearGradient>

                {/* Milestones */}
                <View style={styles.milestonesSection}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: SPACING.md,
                    }}>
                    <Icon
                      name="clipboard-outline"
                      family="Ionicons"
                      size={20}
                      color={colors.text}
                    />
                    <Text
                      style={[
                        styles.milestonesTitle,
                        {color: colors.text, marginBottom: 0},
                      ]}>
                      Milestones
                    </Text>
                  </View>
                  {goal.milestones.map((milestone: any, index: number) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.milestoneCard,
                        {
                          backgroundColor: milestone.completed
                            ? goal.color + '15'
                            : colors.background,
                          borderColor: milestone.completed
                            ? goal.color
                            : colors.border,
                        },
                      ]}
                      onPress={() => onToggleMilestone(goal.id, index)}>
                      <View
                        style={[
                          styles.milestoneCheckbox,
                          {
                            backgroundColor: milestone.completed
                              ? goal.color
                              : 'transparent',
                            borderColor: goal.color,
                          },
                        ]}>
                        {milestone.completed && (
                          <Icon
                            name="checkmark"
                            family="Ionicons"
                            size={14}
                            color="#FFFFFF"
                          />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.milestoneCardText,
                          {
                            color: colors.text,
                            textDecorationLine: milestone.completed
                              ? 'line-through'
                              : 'none',
                            flex: 1,
                          },
                        ]}>
                        {milestone.text}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  {/* Add new milestone inline */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: SPACING.xs,
                      gap: 6,
                    }}>
                    <View
                      style={[
                        styles.customInput,
                        {
                          backgroundColor: colors.background,
                          borderColor: colors.border,
                          flex: 1,
                          marginBottom: 0,
                        },
                      ]}>
                      <TextInput
                        style={[
                          styles.input,
                          {color: colors.text, fontSize: 13},
                        ]}
                        placeholder="Add a new task..."
                        placeholderTextColor={colors.textMuted}
                        value={newMilestoneText}
                        onChangeText={onNewMilestoneTextChange}
                        onSubmitEditing={() => {
                          if (newMilestoneText.trim()) {
                            onAddMilestone(goal.id, newMilestoneText);
                            onNewMilestoneTextChange('');
                          }
                        }}
                        returnKeyType="done"
                      />
                    </View>
                    <TouchableOpacity
                      style={{
                        backgroundColor: colors.primary,
                        borderRadius: 20,
                        width: 34,
                        height: 34,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      onPress={() => {
                        if (newMilestoneText.trim()) {
                          onAddMilestone(goal.id, newMilestoneText);
                          onNewMilestoneTextChange('');
                        }
                      }}>
                      <Icon
                        name="add"
                        family="Ionicons"
                        size={20}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Deadline */}
                <View
                  style={[
                    styles.deadlineCard,
                    {backgroundColor: colors.background},
                  ]}>
                  <View style={{marginRight: SPACING.md}}>
                    <Icon
                      name="calendar-outline"
                      family="Ionicons"
                      size={28}
                      color={colors.primary}
                    />
                  </View>
                  <View style={{flex: 1}}>
                    <Text
                      style={[
                        styles.deadlineLabel,
                        {color: colors.textSecondary},
                      ]}>
                      Deadline
                    </Text>
                    <Text
                      style={[
                        styles.deadlineValue,
                        {color: colors.text},
                      ]}>
                      {goal.deadline
                        ? goal.deadline
                        : 'No deadline set'}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons - Compact Row */}
                <View style={styles.actionButtonsRow}>
                  {/* Edit Button */}
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      {backgroundColor: colors.primary + '15'},
                    ]}
                    onPress={() => {
                      onClose();
                      setTimeout(() => onEdit(goal), 200);
                    }}>
                    <Icon
                      name="pencil-outline"
                      family="Ionicons"
                      size={18}
                      color={colors.primary}
                    />
                    <Text style={[styles.actionBtnText, {color: colors.primary}]}>
                      Edit
                    </Text>
                  </TouchableOpacity>

                  {/* Complete Button */}
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      {backgroundColor: goal.completed ? colors.success + '15' : colors.background},
                    ]}
                    onPress={() => onToggleCompleted(goal.id)}>
                    <Icon
                      name={goal.completed ? 'checkmark-circle' : 'checkmark-circle-outline'}
                      family="Ionicons"
                      size={18}
                      color={colors.success}
                    />
                    <Text style={[styles.actionBtnText, {color: colors.success}]}>
                      {goal.completed ? 'Undo' : 'Done'}
                    </Text>
                  </TouchableOpacity>

                  {/* Delete Button */}
                  <TouchableOpacity
                    style={[styles.actionBtn, {backgroundColor: colors.error + '10'}]}
                    onPress={() => onDelete(goal.id)}>
                    <Icon
                      name="trash-outline"
                      family="Ionicons"
                      size={18}
                      color={colors.error}
                    />
                  </TouchableOpacity>
                </View>

                <View style={{height: SPACING.xxl}} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  detailModalContent: {
    maxHeight: '85%',
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    paddingTop: SPACING.sm,
  },
  detailHeader: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  detailTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#fff',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  detailProgress: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  detailProgressText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  milestonesSection: {
    padding: SPACING.md,
  },
  milestonesTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: SPACING.md,
  },
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
  },
  milestoneCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  milestoneCardText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  customInput: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  input: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  deadlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  deadlineLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: SPACING.xs,
  },
  deadlineValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    gap: 6,
  },
  actionBtnText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
});

export default GoalDetailModal;

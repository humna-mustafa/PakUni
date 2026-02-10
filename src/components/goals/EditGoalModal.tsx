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

interface EditGoalModalProps {
  visible: boolean;
  onClose: () => void;
  editGoalTitle: string;
  onTitleChange: (text: string) => void;
  editGoalDeadline: string;
  onDeadlineChange: (text: string) => void;
  editGoalMilestones: string[];
  onMilestonesChange: (milestones: string[]) => void;
  onSave: () => void;
  colors: any;
  isDark: boolean;
}

const EditGoalModal = React.memo(
  ({
    visible,
    onClose,
    editGoalTitle,
    onTitleChange,
    editGoalDeadline,
    onDeadlineChange,
    editGoalMilestones,
    onMilestonesChange,
    onSave,
    colors,
    isDark,
  }: EditGoalModalProps) => {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={onClose}
          />
          <View
            style={[
              styles.editModalContent,
              {backgroundColor: colors.card},
            ]}>
            <View style={styles.modalHandle} />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginBottom: SPACING.md,
              }}>
              <Icon
                name="pencil-outline"
                family="Ionicons"
                size={24}
                color={colors.primary}
              />
              <Text
                style={[
                  styles.modalTitle,
                  {color: colors.text, marginBottom: 0},
                ]}>
                Edit Goal
              </Text>
            </View>

            <Text
              style={[
                styles.inputLabel,
                {color: colors.textSecondary},
              ]}>
              Goal Title
            </Text>
            <View
              style={[
                styles.customInput,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}>
              <TextInput
                style={[styles.input, {color: colors.text}]}
                placeholder="Enter goal title..."
                placeholderTextColor={colors.textMuted}
                value={editGoalTitle}
                onChangeText={onTitleChange}
              />
            </View>

            <Text
              style={[
                styles.inputLabel,
                {color: colors.textSecondary, marginTop: SPACING.sm},
              ]}>
              Deadline (optional)
            </Text>
            <View
              style={[
                styles.customInput,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                },
              ]}>
              <View style={{marginRight: 8, marginLeft: SPACING.sm}}>
                <Icon
                  name="calendar-outline"
                  family="Ionicons"
                  size={20}
                  color={colors.textMuted}
                />
              </View>
              <TextInput
                style={[styles.input, {color: colors.text, flex: 1}]}
                placeholder="DD/MM/YYYY (e.g., 15/03/2025)"
                placeholderTextColor={colors.textMuted}
                value={editGoalDeadline}
                onChangeText={onDeadlineChange}
                keyboardType="default"
              />
            </View>
            <Text style={[styles.deadlineHint, {color: colors.textMuted}]}>
              Leave empty to remove deadline
            </Text>

            {/* Edit Milestones/Tasks */}
            <Text
              style={[
                styles.inputLabel,
                {color: colors.textSecondary, marginTop: SPACING.md},
              ]}>
              Tasks / Sub-Goals
            </Text>
            <ScrollView style={{maxHeight: 200}} nestedScrollEnabled>
              {editGoalMilestones.map((milestone, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: SPACING.xs,
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
                      placeholder={`Task ${index + 1}`}
                      placeholderTextColor={colors.textMuted}
                      value={milestone}
                      onChangeText={text => {
                        const updated = [...editGoalMilestones];
                        updated[index] = text;
                        onMilestonesChange(updated);
                      }}
                    />
                  </View>
                  {editGoalMilestones.length > 1 && (
                    <TouchableOpacity
                      onPress={() =>
                        onMilestonesChange(
                          editGoalMilestones.filter(
                            (_, i) => i !== index,
                          ),
                        )
                      }
                      hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                      <Icon
                        name="close-circle"
                        family="Ionicons"
                        size={22}
                        color={colors.error}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>
            {editGoalMilestones.length < 15 && (
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingVertical: SPACING.xs,
                }}
                onPress={() =>
                  onMilestonesChange([...editGoalMilestones, ''])
                }>
                <Icon
                  name="add-circle-outline"
                  family="Ionicons"
                  size={20}
                  color={colors.primary}
                />
                <Text
                  style={{
                    color: colors.primary,
                    fontSize: 14,
                    fontWeight: '500',
                  }}>
                  Add Task
                </Text>
              </TouchableOpacity>
            )}

            <View
              style={{
                flexDirection: 'row',
                gap: SPACING.sm,
                marginTop: SPACING.md,
              }}>
              <TouchableOpacity
                style={[
                  styles.cancelBtn,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    flex: 1,
                  },
                ]}
                onPress={onClose}>
                <Text
                  style={[styles.cancelBtnText, {color: colors.text}]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtnContainer, {flex: 1}]}
                onPress={onSave}>
                <LinearGradient
                  colors={['#4573DF', '#3461C7']}
                  style={styles.saveBtn}>
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
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
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  editModalContent: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.xl,
    borderRadius: RADIUS.xxl,
    padding: SPACING.md,
    paddingTop: SPACING.sm,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: SPACING.xs,
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
  deadlineHint: {
    fontSize: 11,
    marginTop: -SPACING.sm,
    marginBottom: SPACING.sm,
  },
  cancelBtn: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  saveBtnContainer: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  saveBtn: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
});

export default EditGoalModal;

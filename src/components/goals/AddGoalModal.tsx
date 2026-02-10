import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../../constants/design';
import {Icon} from '../icons';
import type {GoalTemplate} from '../../types/goals';
import TemplateCard from './TemplateCard';

interface AddGoalModalProps {
  visible: boolean;
  onClose: () => void;
  templates: GoalTemplate[];
  onSelectTemplate: (template: GoalTemplate) => void;
  newGoalTitle: string;
  onTitleChange: (text: string) => void;
  newGoalDeadline: string;
  onDeadlineChange: (text: string) => void;
  customMilestones: string[];
  onMilestonesChange: (milestones: string[]) => void;
  onCreateCustomGoal: () => void;
  colors: any;
  isDark: boolean;
  modalAnim: Animated.Value;
}

const AddGoalModal = React.memo(
  ({
    visible,
    onClose,
    templates,
    onSelectTemplate,
    newGoalTitle,
    onTitleChange,
    newGoalDeadline,
    onDeadlineChange,
    customMilestones,
    onMilestonesChange,
    onCreateCustomGoal,
    colors,
    isDark,
    modalAnim,
  }: AddGoalModalProps) => {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={onClose}
          />
          <Animated.View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.card,
                transform: [
                  {
                    translateY: modalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [600, 0],
                    }),
                  },
                ],
              },
            ]}>
            <View style={styles.modalHandle} />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}>
              <Icon
                name="sparkles"
                family="Ionicons"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.modalTitle, {color: colors.text}]}>
                Create New Goal
              </Text>
            </View>

            {/* Quick Templates */}
            <Text style={[styles.templatesTitle, {color: colors.text}]}>
              Quick Templates
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.templatesContainer}>
              {templates.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={() => onSelectTemplate(template)}
                  colors={colors}
                />
              ))}
            </ScrollView>

            {/* Custom Goal */}
            <Text style={[styles.orText, {color: colors.textSecondary}]}>
              — or create custom —
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
                placeholder="Enter your goal..."
                placeholderTextColor={colors.textMuted}
                value={newGoalTitle}
                onChangeText={onTitleChange}
              />
            </View>

            {/* Deadline Input */}
            <View style={{marginTop: SPACING.sm}}>
              <Text
                style={[
                  styles.deadlineLabel,
                  {color: colors.textSecondary},
                ]}>
                Set Deadline (optional)
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
                  value={newGoalDeadline}
                  onChangeText={onDeadlineChange}
                  keyboardType="default"
                />
              </View>
              <Text
                style={[styles.deadlineHint, {color: colors.textMuted}]}>
                Setting a deadline helps you stay on track!
              </Text>
            </View>

            {/* Custom Sub-Goals / Milestones */}
            <View style={{marginTop: SPACING.md}}>
              <Text
                style={[
                  styles.deadlineLabel,
                  {color: colors.textSecondary},
                ]}>
                Sub-Goals / Tasks (optional)
              </Text>
              <Text
                style={[
                  styles.deadlineHint,
                  {color: colors.textMuted, marginBottom: SPACING.xs},
                ]}>
                Add your own tasks to track. Leave empty for defaults.
              </Text>
              {customMilestones.map((milestone, index) => (
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
                      style={[styles.input, {color: colors.text}]}
                      placeholder={`Task ${index + 1} (e.g., Complete IELTS prep)`}
                      placeholderTextColor={colors.textMuted}
                      value={milestone}
                      onChangeText={text => {
                        const updated = [...customMilestones];
                        updated[index] = text;
                        onMilestonesChange(updated);
                      }}
                    />
                  </View>
                  {customMilestones.length > 1 && (
                    <TouchableOpacity
                      onPress={() =>
                        onMilestonesChange(
                          customMilestones.filter((_, i) => i !== index),
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
              {customMilestones.length < 15 && (
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingVertical: SPACING.xs,
                  }}
                  onPress={() =>
                    onMilestonesChange([...customMilestones, ''])
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
            </View>

            <TouchableOpacity
              style={styles.createBtn}
              onPress={onCreateCustomGoal}>
              <LinearGradient
                colors={['#e74c3c', '#c0392b']}
                style={styles.createBtnGradient}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                  <Text style={styles.createBtnText}>Create Goal</Text>
                  <Icon
                    name="flag-outline"
                    family="Ionicons"
                    size={18}
                    color="#FFFFFF"
                  />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
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
  modalContent: {
    maxHeight: '70%',
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    padding: SPACING.md,
    paddingTop: SPACING.sm,
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
  templatesTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: SPACING.sm,
  },
  templatesContainer: {
    gap: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  orText: {
    textAlign: 'center',
    marginVertical: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.sm,
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
  deadlineLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: SPACING.xs,
  },
  deadlineHint: {
    fontSize: 11,
    marginTop: -SPACING.sm,
    marginBottom: SPACING.sm,
  },
  createBtn: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  createBtnGradient: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  createBtnText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
});

export default AddGoalModal;

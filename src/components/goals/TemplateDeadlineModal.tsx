import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../../constants/design';
import {Icon} from '../icons';
import type {GoalTemplate} from '../../types/goals';

interface TemplateDeadlineModalProps {
  visible: boolean;
  onClose: () => void;
  template: GoalTemplate | null;
  templateDeadline: string;
  onDeadlineChange: (text: string) => void;
  onConfirm: () => void;
  colors: any;
  isDark: boolean;
}

const TemplateDeadlineModal = React.memo(
  ({
    visible,
    onClose,
    template,
    templateDeadline,
    onDeadlineChange,
    onConfirm,
    colors,
    isDark,
  }: TemplateDeadlineModalProps) => {
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
                name="calendar-outline"
                family="Ionicons"
                size={24}
                color={colors.primary}
              />
              <Text
                style={[
                  styles.modalTitle,
                  {color: colors.text, marginBottom: 0},
                ]}>
                Set Deadline
              </Text>
            </View>

            {template && (
              <>
                <View
                  style={[
                    styles.templatePreview,
                    {backgroundColor: template.color + '15'},
                  ]}>
                  <Icon
                    name={template.iconName}
                    family="Ionicons"
                    size={32}
                    color={template.color}
                  />
                  <Text
                    style={[
                      styles.templatePreviewTitle,
                      {color: colors.text},
                    ]}>
                    {template.title}
                  </Text>
                  <Text
                    style={[
                      styles.templatePreviewMeta,
                      {color: colors.textSecondary},
                    ]}>
                    Suggested: {template.estimatedDays} days
                  </Text>
                </View>

                <Text
                  style={[
                    styles.inputLabel,
                    {color: colors.textSecondary},
                  ]}>
                  When do you want to complete this?
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
                    value={templateDeadline}
                    onChangeText={onDeadlineChange}
                    keyboardType="default"
                  />
                </View>

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
                      style={[
                        styles.cancelBtnText,
                        {color: colors.text},
                      ]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.saveBtnContainer, {flex: 1}]}
                    onPress={onConfirm}>
                    <LinearGradient
                      colors={[template.color, template.color + 'CC']}
                      style={styles.saveBtn}>
                      <Text style={styles.saveBtnText}>Create Goal</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </>
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
  templatePreview: {
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
  },
  templatePreviewTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  templatePreviewMeta: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 4,
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

export default TemplateDeadlineModal;

/**
 * TestDetailModal - Full detail view for a selected entry test
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS, STATUS_COLORS} from '../../constants/design';
import {Icon} from '../icons';
import {EntryTestData, EntryTestVariant} from '../../data';
import {getEntryTestBrandColors} from '../../data/entryTests';
import TestCountdownWidget from './TestCountdownWidget';

interface Props {
  visible: boolean;
  test: EntryTestData | null;
  modalAnim: Animated.Value;
  colors: any;
  isDark: boolean;
  customDate?: string;
  onClose: () => void;
  onEditDate: (testId: string, currentDate?: string) => void;
  onRegister: (test: EntryTestData) => void;
  onFixData?: (testId: string, testName: string) => void;
}

const TestDetailModal = ({
  visible,
  test,
  modalAnim,
  colors,
  isDark,
  customDate,
  onClose,
  onEditDate,
  onRegister,
  onFixData,
}: Props) => {
  if (!test) return null;

  const brandColors = getEntryTestBrandColors(test.name);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <Animated.View
          style={[
            styles.content,
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
          <View style={styles.handle} />
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <LinearGradient colors={brandColors.gradient} style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={onClose}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Icon name="arrow-back" family="Ionicons" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Icon name="document-text-outline" family="Ionicons" size={60} color="#FFFFFF" />
              <Text style={styles.title}>{test.name}</Text>
              <Text style={styles.subtitle}>{test.full_name || test.name}</Text>
              {test.status_notes && (
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{test.status_notes}</Text>
                </View>
              )}
            </LinearGradient>

            {/* Countdown Widget */}
            <View style={styles.countdownContainer}>
              <TestCountdownWidget
                test={test}
                customDate={customDate}
                onEditDate={() => onEditDate(test.id, customDate)}
                colors={colors}
                isDark={isDark}
              />
            </View>

            {/* Quick Info */}
            <View style={styles.quickInfo}>
              <View style={[styles.infoCard, {backgroundColor: colors.background}]}>
                <Icon name="calendar-outline" family="Ionicons" size={24} color={colors.primary} />
                <Text style={[styles.infoLabel, {color: colors.textSecondary}]}>Date</Text>
                <Text style={[styles.infoValue, {color: colors.text}]}>
                  {test.test_date || 'TBA'}
                </Text>
              </View>
              <View style={[styles.infoCard, {backgroundColor: colors.background}]}>
                <Icon name="cash-outline" family="Ionicons" size={24} color={colors.primary} />
                <Text style={[styles.infoLabel, {color: colors.textSecondary}]}>Fee</Text>
                <Text style={[styles.infoValue, {color: colors.text}]}>
                  {test.fee || 'Varies'}
                </Text>
              </View>
              <View style={[styles.infoCard, {backgroundColor: colors.background}]}>
                <Icon name="time-outline" family="Ionicons" size={24} color={colors.primary} />
                <Text style={[styles.infoLabel, {color: colors.textSecondary}]}>Duration</Text>
                <Text style={[styles.infoValue, {color: colors.text}]}>
                  {test.test_format?.duration_minutes
                    ? `${Math.floor(test.test_format.duration_minutes / 60)}h ${
                        test.test_format.duration_minutes % 60 > 0
                          ? `${test.test_format.duration_minutes % 60}m`
                          : ''
                      }`
                    : 'Varies'}
                </Text>
              </View>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="reader-outline" family="Ionicons" size={18} color={colors.text} />
                <Text style={[styles.sectionTitle, {color: colors.text}]}>About This Test</Text>
              </View>
              <Text style={[styles.sectionText, {color: colors.textSecondary}]}>
                {test.description}
              </Text>
            </View>

            {/* Test Format */}
            {test.test_format && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon name="list-outline" family="Ionicons" size={18} color={colors.text} />
                  <Text style={[styles.sectionTitle, {color: colors.text}]}>Test Format</Text>
                </View>
                <View style={[styles.infoCard, {backgroundColor: colors.background, marginBottom: SPACING.sm}]}>
                  <Text style={[styles.infoLabel, {color: colors.textSecondary}]}>
                    Total Marks: {test.test_format.total_marks}
                  </Text>
                  <Text style={[styles.infoLabel, {color: colors.textSecondary}]}>
                    Questions: {test.test_format.total_questions}
                  </Text>
                  <Text style={[styles.infoLabel, {color: colors.textSecondary}]}>
                    Duration: {test.test_format.duration_minutes} mins
                  </Text>
                  <Text style={[styles.infoLabel, {color: colors.textSecondary}]}>
                    Negative Marking: {test.test_format.negative_marking ? 'Yes' : 'No'}
                  </Text>
                </View>
                {(test.test_format.sections ?? []).map((section: any, i: number) => (
                  <View key={i} style={styles.formatItem}>
                    <View style={[styles.formatDot, {backgroundColor: colors.primary}]} />
                    <Text style={[styles.formatText, {color: colors.textSecondary}]}>
                      {section.name}: {section.questions} Questions ({section.marks} Marks)
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Eligibility */}
            {test.eligibility && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon name="checkmark-circle-outline" family="Ionicons" size={18} color={colors.text} />
                  <Text style={[styles.sectionTitle, {color: colors.text}]}>Eligibility</Text>
                </View>
                <View style={[styles.eligibilityCard, {backgroundColor: colors.background}]}>
                  {Array.isArray(test.eligibility) ? (
                    test.eligibility.map((item: string, i: number) => (
                      <View key={i} style={{flexDirection: 'row', marginBottom: 4}}>
                        <Text style={{color: colors.primary, marginRight: 8}}>•</Text>
                        <Text style={[styles.eligibilityText, {color: colors.textSecondary, flex: 1}]}>
                          {item}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={[styles.eligibilityText, {color: colors.textSecondary}]}>
                      {test.eligibility}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Application Steps */}
            {test.application_steps && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon name="walk-outline" family="Ionicons" size={18} color={colors.text} />
                  <Text style={[styles.sectionTitle, {color: colors.text}]}>How to Apply</Text>
                </View>
                {test.application_steps.map((step: string, i: number) => (
                  <View key={i} style={styles.formatItem}>
                    <View style={[styles.formatDot, {backgroundColor: colors.success}]} />
                    <Text style={[styles.formatText, {color: colors.textSecondary}]}>{step}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Test Variants */}
            {test.variants && test.variants.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon name="git-branch-outline" family="Ionicons" size={18} color={colors.text} />
                  <Text style={[styles.sectionTitle, {color: colors.text}]}>
                    Test Variants ({test.variants.length})
                  </Text>
                </View>
                <Text style={[styles.sectionText, {color: colors.textSecondary, marginBottom: SPACING.sm}]}>
                  This test has multiple variants. Choose based on your field of study:
                </Text>
                {test.variants.map((variant: EntryTestVariant) => {
                  const variantBrandColors = getEntryTestBrandColors(variant.name);
                  return (
                    <View
                      key={variant.id}
                      style={[styles.variantCard, {backgroundColor: colors.background, borderLeftColor: variantBrandColors.primary}]}>
                      <View style={styles.variantHeader}>
                        <View style={[styles.variantBadge, {backgroundColor: variantBrandColors.primary + '20'}]}>
                          <Text style={[styles.variantBadgeText, {color: variantBrandColors.primary}]}>
                            {variant.name}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.variantTitle, {color: colors.text}]}>{variant.full_name}</Text>
                      <Text style={[styles.variantDescription, {color: colors.textSecondary}]}>
                        {variant.description}
                      </Text>
                      <Text style={[styles.variantFieldLabel, {color: colors.textSecondary}]}>
                        For: {(variant.applicable_for ?? []).join(', ')}
                      </Text>
                      {variant.eligibility && variant.eligibility.length > 0 && (
                        <View style={{marginTop: 6}}>
                          {variant.eligibility.map((e: string, ei: number) => (
                            <View key={ei} style={{flexDirection: 'row', marginBottom: 2}}>
                              <Text style={{color: variantBrandColors.primary, marginRight: 6}}>•</Text>
                              <Text style={{fontSize: 12, color: colors.textSecondary, flex: 1}}>{e}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                      <View style={styles.variantSections}>
                        <Text style={[styles.variantSectionsTitle, {color: colors.text}]}>
                          Question Pattern:
                        </Text>
                        {(variant.test_format?.sections ?? []).map((sec, si: number) => (
                          <View key={si} style={styles.variantSectionRow}>
                            <View style={[styles.formatDot, {backgroundColor: variantBrandColors.primary}]} />
                            <Text style={{fontSize: 12, color: colors.textSecondary, flex: 1}}>
                              {sec.name}: {sec.questions}Q ({sec.marks} marks)
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Tips */}
            <View style={[styles.tipsCard, {backgroundColor: STATUS_COLORS.backgrounds.warning}]}>
              <View style={styles.sectionHeader}>
                <Icon name="bulb-outline" family="Ionicons" size={20} color={colors.warning} />
                <Text style={[styles.tipsTitle, {color: colors.warning}]}>Preparation Tips</Text>
              </View>
              <Text style={[styles.tipsText, {color: colors.warning}]}>
                {test.tips ||
                  'Start preparing at least 3-6 months before the test. Practice previous papers and focus on weak areas.'}
              </Text>
            </View>

            {/* Register Button */}
            <TouchableOpacity style={styles.registerButton} onPress={() => onRegister(test)}>
              <LinearGradient
                colors={[STATUS_COLORS.urgency.safe, '#059669']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.registerGradient}>
                <Text style={styles.registerText}>Register Now</Text>
                <Icon name="arrow-forward" family="Ionicons" size={16} color="#FFFFFF" containerStyle={{marginLeft: 6}} />
              </LinearGradient>
            </TouchableOpacity>

            {/* Fix Data button */}
            {onFixData && (
              <TouchableOpacity
                onPress={() => onFixData(test.id, test.name)}
                style={[styles.fixDataBtn, {borderColor: colors.border || '#E5E7EB'}]}>
                <Icon name="create-outline" family="Ionicons" size={15} color={colors.textSecondary} />
                <Text style={[styles.fixDataText, {color: colors.textSecondary}]}>Found incorrect data? Fix it</Text>
                <Icon name="arrow-forward" family="Ionicons" size={13} color={colors.textSecondary} />
              </TouchableOpacity>
            )}

            <View style={{height: SPACING.xxl}} />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    maxHeight: '90%',
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    paddingTop: SPACING.sm,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.sm,
  },
  header: {
    padding: SPACING.xl,
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  statusBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  countdownContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  quickInfo: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  infoCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  sectionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 22,
  },
  formatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  formatDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: SPACING.sm,
  },
  formatText: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  eligibilityCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  eligibilityText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
  },
  tipsCard: {
    marginHorizontal: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
  },
  tipsTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  tipsText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
  },
  registerButton: {
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  fixDataBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  fixDataText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  registerGradient: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  // Variant styles
  variantCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
  },
  variantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  variantBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  variantBadgeText: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  variantTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: 4,
  },
  variantDescription: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
  },
  variantFieldLabel: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  variantSections: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  variantSectionsTitle: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: 4,
  },
  variantSectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
});

export default TestDetailModal;

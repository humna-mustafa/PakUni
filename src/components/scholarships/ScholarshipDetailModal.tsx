/**
 * ScholarshipDetailModal - Full detail modal for selected scholarship
 */

import React from 'react';
import {View, Text, Modal, ScrollView, TouchableOpacity, StyleSheet} from 'react-native';
import {TYPOGRAPHY, SPACING, RADIUS} from '../../constants/design';
import {Icon} from '../icons';
import UniversityLogo from '../UniversityLogo';
import {
  getScholarshipAvailabilityText,
  getScholarshipSpecificUniversities,
  hasBroadAvailability,
  getScholarshipBrandColors,
  APPLICATION_METHOD_LABELS,
  ScholarshipData,
} from '../../data/scholarships';

// Fallback LinearGradient
let LinearGradient: React.ComponentType<any>;
try {
  LinearGradient = require('react-native-linear-gradient').default;
} catch (e) {
  LinearGradient = ({children, colors, style, ...props}: any) => (
    <View style={[style, {backgroundColor: colors?.[0] || '#4573DF'}]} {...props}>
      {children}
    </View>
  );
}

interface ScholarshipDetailModalProps {
  scholarship: ScholarshipData | null;
  visible: boolean;
  onClose: () => void;
  isFav: boolean;
  onToggleFavorite: () => void;
  openLink: (url?: string) => void;
  colors: any;
  onFixData?: (scholarshipId: string, scholarshipName: string) => void;
}

const getModalTypeIconName = (type: string) => {
  switch (type) {
    case 'need_based': return 'wallet-outline';
    case 'merit_based': return 'trophy-outline';
    case 'hafiz_e_quran': return 'book-outline';
    case 'sports': return 'football-outline';
    case 'disabled': return 'accessibility-outline';
    case 'government': return 'business-outline';
    default: return 'school-outline';
  }
};

const ScholarshipDetailModal = ({
  scholarship,
  visible,
  onClose,
  isFav,
  onToggleFavorite,
  openLink,
  colors,
  onFixData,
}: ScholarshipDetailModalProps) => {
  if (!scholarship) return null;

  // Coverage computation
  const coversTuition =
    scholarship.coverageType === 'full' ||
    scholarship.coverageType === 'tuition' ||
    (scholarship.tuitionCoverage != null && scholarship.tuitionCoverage > 0);
  const coversHostel =
    scholarship.coverageType === 'full' ||
    scholarship.otherBenefits?.some(
      b => b.toLowerCase().includes('hostel') || b.toLowerCase().includes('accommodation'),
    );
  const coversBooks = scholarship.otherBenefits?.some(b => b.toLowerCase().includes('book'));

  // Availability
  const availabilityText = getScholarshipAvailabilityText(scholarship);
  const specificUniversities = getScholarshipSpecificUniversities(scholarship);
  const isBroadlyAvailable = hasBroadAvailability(scholarship);
  const brandColors = getScholarshipBrandColors(scholarship.type);
  const accentColor = brandColors?.primary || colors.primary;

  // Application method
  const applicationMethod = scholarship.applicationMethod || 'online';
  const methodLabel = APPLICATION_METHOD_LABELS[applicationMethod] || 'Online Application';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, {backgroundColor: colors.card}]}>
          <View style={[styles.modalHandle, {backgroundColor: colors.border}]} />

          {/* Header */}
          <View style={[styles.modalHeader, {borderBottomColor: colors.border}]}>
            <View style={styles.modalTitleRow}>
              <View style={[styles.modalIconBg, {backgroundColor: colors.primaryLight}]}>
                <Icon name={getModalTypeIconName(scholarship.type)} family="Ionicons" size={28} color={colors.primary} />
              </View>
              <View style={styles.modalTitleInfo}>
                <Text style={[styles.modalTitle, {color: colors.text}]}>{scholarship.name}</Text>
                <Text style={[styles.modalProvider, {color: colors.textSecondary}]}>{scholarship.provider}</Text>
              </View>
            </View>
            <View style={styles.modalHeaderButtons}>
              <TouchableOpacity
                style={[styles.favoriteBtn, {backgroundColor: isFav ? '#FEE2E2' : colors.background}]}
                onPress={onToggleFavorite}
                accessibilityRole="button"
                accessibilityLabel={isFav ? 'Remove from favorites' : 'Add to favorites'}
                hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
                <Icon name={isFav ? 'heart' : 'heart-outline'} family="Ionicons" size={18} color={isFav ? '#EF4444' : colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.closeBtn, {backgroundColor: colors.background}]}
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close scholarship details"
                hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
                <Icon name="close" family="Ionicons" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Coverage Hero */}
            <LinearGradient
              colors={
                (scholarship.tuitionCoverage || 0) >= 100
                  ? ['#10B981', '#059669']
                  : ['#F59E0B', '#D97706']
              }
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.coverageHero}>
              <Text style={styles.coverageHeroLabel}>
                {scholarship.coverageLabel || `${scholarship.tuitionCoverage || 0}% Tuition`}
              </Text>
              <Text style={styles.coverageHeroText}>
                {scholarship.coverageType === 'full' ? 'Full Scholarship Package' : 'Financial Support'}
              </Text>
            </LinearGradient>

            {/* Deadline Note */}
            {scholarship.deadline && (
              <View
                style={[
                  styles.statusNoteCard,
                  {backgroundColor: colors.primary + '10', borderColor: colors.primary + '30'},
                ]}>
                <Icon name="calendar-outline" family="Ionicons" size={20} color={colors.primary} />
                <Text style={[styles.statusNoteText, {color: colors.text}]}>
                  Deadline: {scholarship.deadline}
                </Text>
              </View>
            )}

            {/* Coverage Grid */}
            <View style={styles.coverageGrid}>
              <View
                style={[
                  styles.coverageItem,
                  {backgroundColor: coversTuition ? colors.successLight : colors.background},
                ]}>
                <Icon name="book-outline" family="Ionicons" size={20} color={coversTuition ? colors.success : colors.textSecondary} />
                <Text style={[styles.coverageItemText, {color: coversTuition ? colors.success : colors.textSecondary}]}>
                  Tuition
                </Text>
                {coversTuition && <Icon name="checkmark-circle" family="Ionicons" size={16} color={colors.success} />}
              </View>
              <View
                style={[
                  styles.coverageItem,
                  {backgroundColor: coversHostel ? colors.successLight : colors.background},
                ]}>
                <Icon name="home-outline" family="Ionicons" size={20} color={coversHostel ? colors.success : colors.textSecondary} />
                <Text style={[styles.coverageItemText, {color: coversHostel ? colors.success : colors.textSecondary}]}>
                  Hostel
                </Text>
                {coversHostel && <Icon name="checkmark-circle" family="Ionicons" size={16} color={colors.success} />}
              </View>
              <View
                style={[
                  styles.coverageItem,
                  {backgroundColor: coversBooks ? colors.successLight : colors.background},
                ]}>
                <Icon name="reader-outline" family="Ionicons" size={20} color={coversBooks ? colors.success : colors.textSecondary} />
                <Text style={[styles.coverageItemText, {color: coversBooks ? colors.success : colors.textSecondary}]}>
                  Books
                </Text>
                {coversBooks && <Icon name="checkmark-circle" family="Ionicons" size={16} color={colors.success} />}
              </View>
            </View>

            {/* Amount Cards */}
            <View style={styles.amountRow}>
              {scholarship.monthlyStipend != null && (
                <View style={[styles.amountCard, {backgroundColor: colors.successLight}]}>
                  <Icon name="cash-outline" family="Ionicons" size={22} color={colors.success} />
                  <Text style={[styles.amountLabel, {color: colors.textSecondary}]}>Monthly Stipend</Text>
                  <Text style={[styles.amountValue, {color: colors.success}]}>
                    PKR {scholarship.monthlyStipend.toLocaleString()}
                  </Text>
                </View>
              )}
            </View>

            {/* About */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, {color: colors.text}]}>About</Text>
              <Text style={[styles.sectionText, {color: colors.textSecondary}]}>{scholarship.description}</Text>
            </View>

            {/* University Availability */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, {color: colors.text}]}>
                <Icon name="school-outline" family="Ionicons" size={16} color={accentColor} />
                {'  '}Where Available
              </Text>
              <View style={[styles.availabilitySectionModal, {backgroundColor: colors.background, borderLeftColor: accentColor}]}>
                <Text style={[styles.availabilityTextModal, {color: colors.text}]}>{availabilityText}</Text>
                {!isBroadlyAvailable && specificUniversities.length > 0 && (
                  <View style={styles.universityListModal}>
                    {specificUniversities.slice(0, 8).map((uniName: string) => (
                      <View key={uniName} style={[styles.universityItemModal, {backgroundColor: colors.card}]}>
                        <UniversityLogo universityName={uniName} size={32} style={styles.uniLogoModal} />
                        <Text style={[styles.uniNameModal, {color: colors.text}]} numberOfLines={2}>
                          {uniName}
                        </Text>
                      </View>
                    ))}
                    {specificUniversities.length > 8 && (
                      <Text style={[styles.moreUnisText, {color: colors.textSecondary}]}>
                        +{specificUniversities.length - 8} more universities
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </View>

            {/* Application Method */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, {color: colors.text}]}>
                <Icon name="clipboard-outline" family="Ionicons" size={16} color={accentColor} />
                {'  '}How to Apply
              </Text>
              <View style={[styles.applicationMethodCard, {backgroundColor: accentColor + '15'}]}>
                <View style={styles.methodHeaderRow}>
                  <View style={[styles.methodIconBg, {backgroundColor: accentColor + '30'}]}>
                    <Icon name="document-text-outline" family="Ionicons" size={24} color={accentColor} />
                  </View>
                  <View style={styles.methodInfo}>
                    <Text style={[styles.methodLabel, {color: accentColor}]}>{methodLabel}</Text>
                    <Text style={[styles.methodDescription, {color: colors.textSecondary}]}>
                      Apply via {applicationMethod.replace('-', ' ')}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Application Steps */}
              {scholarship.applicationProcess && scholarship.applicationProcess.length > 0 && (
                <View style={styles.applicationStepsContainer}>
                  <Text style={[styles.stepsTitle, {color: colors.text}]}>Application Steps:</Text>
                  {scholarship.applicationProcess.map((step: string, index: number) => (
                    <View key={index} style={[styles.stepItem, {backgroundColor: colors.background}]}>
                      <View style={[styles.stepNumber, {backgroundColor: accentColor}]}>
                        <Text style={styles.stepNumberText}>{index + 1}</Text>
                      </View>
                      <Text style={[styles.stepText, {color: colors.text}]}>{step}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Eligibility */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, {color: colors.text}]}>Eligibility</Text>
              {(scholarship.eligibility || []).map((criteria: string, index: number) => (
                <View key={index} style={styles.eligibilityRow}>
                  <View style={[styles.eligibilityCheckBg, {backgroundColor: colors.successLight}]}>
                    <Icon name="checkmark" family="Ionicons" size={14} color={colors.success} />
                  </View>
                  <Text style={[styles.eligibilityRowText, {color: colors.text}]}>{criteria}</Text>
                </View>
              ))}
            </View>

            {/* Documents */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, {color: colors.text}]}>Required Documents</Text>
              <View style={styles.docsGrid}>
                {(scholarship.requiredDocuments || []).length > 0 ? (
                  (scholarship.requiredDocuments || []).map((doc: string, index: number) => (
                    <View key={index} style={[styles.docItem, {backgroundColor: colors.background}]}>
                      <Icon name="document-text-outline" family="Ionicons" size={16} color={colors.primary} />
                      <Text style={[styles.docText, {color: colors.text}]}>{doc}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={[styles.sectionText, {color: colors.textSecondary}]}>
                    Check official website for required documents
                  </Text>
                )}
              </View>
            </View>

            {/* Deadline */}
            {scholarship.deadline && (
              <View style={[styles.deadlineCard, {backgroundColor: colors.warningLight}]}>
                <Icon name="calendar-outline" family="Ionicons" size={24} color={colors.warning} />
                <View style={styles.deadlineInfo}>
                  <Text style={[styles.deadlineLabel, {color: colors.textSecondary}]}>Application Deadline</Text>
                  <Text style={[styles.deadlineValue, {color: colors.warning}]}>{scholarship.deadline}</Text>
                </View>
              </View>
            )}

            {/* Apply Button */}
            {scholarship.website && (
              <TouchableOpacity
                style={styles.applyBtnWrapper}
                onPress={() => openLink(scholarship.website)}
                accessibilityRole="link"
                accessibilityLabel="Apply now - opens in browser"
                accessibilityHint={`Opens ${scholarship.name} application website`}>
                <LinearGradient
                  colors={[colors.primary, '#3660C9']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.applyBtn}>
                  <Text style={styles.applyBtnText}>Apply Now</Text>
                  <Icon name="arrow-forward" family="Ionicons" size={18} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Fix Data button */}
            {onFixData && (
              <TouchableOpacity
                onPress={() => onFixData((scholarship as any).id || scholarship.name, scholarship.name)}
                style={[styles.fixDataBtn, {borderColor: colors.border || '#E5E7EB'}]}>
                <Icon name="create-outline" family="Ionicons" size={15} color={colors.textSecondary} />
                <Text style={{fontSize: 13, color: colors.textSecondary, fontWeight: '500' as any, flex: 1}}>
                  Found incorrect data? Fix it
                </Text>
                <Icon name="arrow-forward" family="Ionicons" size={13} color={colors.textSecondary} />
              </TouchableOpacity>
            )}

            <View style={{height: 40}} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    maxHeight: '92%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
  },
  modalTitleRow: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  modalIconBg: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  modalTitleInfo: {
    flex: 1,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  modalProvider: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 2,
  },
  modalHeaderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  favoriteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: SPACING.lg,
  },
  coverageHero: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  coverageHeroLabel: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  coverageHeroText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  statusNoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
  },
  statusNoteText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
    marginLeft: SPACING.sm,
    lineHeight: 20,
  },
  coverageGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  coverageItem: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  coverageItemText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  amountRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  amountCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginBottom: 2,
  },
  amountValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: SPACING.sm,
  },
  sectionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 22,
  },
  availabilitySectionModal: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderLeftWidth: 3,
    marginTop: SPACING.xs,
  },
  availabilityTextModal: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  universityListModal: {
    marginTop: SPACING.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  universityItemModal: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
    gap: SPACING.xs,
    maxWidth: '48%',
  },
  uniLogoModal: {
    borderRadius: 16,
  },
  uniNameModal: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
    flex: 1,
  },
  moreUnisText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontStyle: 'italic',
    marginTop: SPACING.xs,
    width: '100%',
  },
  applicationMethodCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.xs,
  },
  methodHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  methodIconBg: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodInfo: {
    flex: 1,
  },
  methodLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  methodDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 2,
    lineHeight: 18,
  },
  applicationStepsContainer: {
    marginTop: SPACING.md,
  },
  stepsTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: SPACING.sm,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xs,
    gap: SPACING.sm,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFFFFF',
  },
  stepText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
  },
  eligibilityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  eligibilityCheckBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  eligibilityRowText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 22,
  },
  docsGrid: {
    gap: SPACING.xs,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  docText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    flex: 1,
  },
  deadlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  deadlineInfo: {},
  deadlineLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  deadlineValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  applyBtnWrapper: {
    marginTop: SPACING.sm,
  },
  applyBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.md + 2,
    borderRadius: RADIUS.lg,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  fixDataBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
});

export default React.memo(ScholarshipDetailModal);

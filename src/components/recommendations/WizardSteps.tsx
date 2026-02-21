/**
 * WizardSteps - 3-step recommendation wizard (Marks, Preferences, Review)
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../../constants/design';
import {Icon} from '../icons';
import InputField from './InputField';
import ChipSelector from './ChipSelector';

const PROGRAMS = ['Engineering', 'Medical', 'Business', 'Computer Science', 'Law', 'Arts', 'Pharmacy', 'Architecture'];
const CITIES = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Multan', 'Faisalabad', 'Quetta'];
const TYPES = ['Public', 'Private', 'Both'];
const SESSIONS = ['Fall', 'Spring', 'Both'];
const SUBJECT_GROUPS = ['Pre-Medical', 'Pre-Engineering', 'ICS', 'ICOM/Commerce', 'Arts/Humanities'];
const GENDERS = ['Male', 'Female'];
const PROVINCES = ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'FATA/PATA', 'AJK', 'Gilgit-Baltistan', 'ICT'];
const QUOTA_FLAGS = ['Hafiz-e-Quran', 'Sports Player', 'Disabled Person', 'Army Dependent', 'Non-Resident Pakistani (NRP)'];

interface WizardStepsProps {
  currentStep: number;
  colors: any;
  profileDataLoaded: boolean;
  validationError: string | null;
  // Step 1 - Marks
  matricMarks: string;
  matricTotal: string;
  fscMarks: string;
  fscTotal: string;
  entryTestScore: string;
  entryTestTotal: string;
  onMatricMarksChange: (val: string) => void;
  onMatricTotalChange: (val: string) => void;
  onFscMarksChange: (val: string) => void;
  onFscTotalChange: (val: string) => void;
  onEntryTestScoreChange: (val: string) => void;
  onEntryTestTotalChange: (val: string) => void;
  // Step 2 - Preferences
  preferredPrograms: string[];
  preferredCities: string[];
  preferredType: string;
  preferredSession: string;
  onProgramsChange: (val: string[]) => void;
  onCitiesChange: (val: string[]) => void;
  onTypeChange: (val: string) => void;
  onSessionChange: (val: string) => void;
  // Subject Group
  subjectGroup: string;
  onSubjectGroupChange: (val: string) => void;
  // Quota Profile (Step 2 extras)
  gender?: string;
  onGenderChange?: (val: string) => void;
  userProvince?: string;
  onProvinceChange?: (val: string) => void;
  quotaFlags?: string[];
  onQuotaFlagsChange?: (flags: string[]) => void;
}

const WizardSteps = ({
  currentStep, colors, profileDataLoaded, validationError,
  matricMarks, matricTotal, fscMarks, fscTotal, entryTestScore, entryTestTotal,
  onMatricMarksChange, onMatricTotalChange, onFscMarksChange, onFscTotalChange,
  onEntryTestScoreChange, onEntryTestTotalChange,
  preferredPrograms, preferredCities, preferredType, preferredSession,
  onProgramsChange, onCitiesChange, onTypeChange, onSessionChange,
  subjectGroup, onSubjectGroupChange,
  gender, onGenderChange, userProvince, onProvinceChange, quotaFlags, onQuotaFlagsChange,
}: WizardStepsProps) => {
  return (
    <View>
      {/* Validation Error Banner */}
      {validationError && (
        <View style={[styles.validationError, {backgroundColor: colors.error + '20'}]}>
          <Icon name="warning" family="Ionicons" size={18} color={colors.error} />
          <Text style={[styles.validationErrorText, {color: colors.error}]}>{validationError}</Text>
        </View>
      )}

      {/* Step 1: Academic Info */}
      {currentStep === 1 && (
        <View>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            <Icon name="library-outline" family="Ionicons" size={22} color={colors.primary} />
            <Text style={[styles.stepTitle, {color: colors.text}]}>Academic Information</Text>
          </View>
          <Text style={[styles.stepDescription, {color: colors.textSecondary}]}>
            Enter your marks to calculate merit. Totals are pre-filled from your profile — edit if different.
          </Text>

          {profileDataLoaded && (matricMarks || fscMarks) && (
            <View style={[styles.profileDataBanner, {backgroundColor: colors.primary + '15'}]}>
              <Icon name="person-circle-outline" family="Ionicons" size={16} color={colors.primary} />
              <Text style={[styles.profileDataText, {color: colors.primary}]}>
                Pre-filled from your profile. Edit if needed.
              </Text>
            </View>
          )}

          {/* Matric Row */}
          <View style={styles.marksRow}>
            <View style={styles.marksObtained}>
              <InputField label="Matric Obtained" value={matricMarks} onChangeText={onMatricMarksChange}
                placeholder="Obtained" iconName="document-text-outline" colors={colors} keyboardType="numeric" />
            </View>
            <View style={styles.marksTotal}>
              <InputField label="Total" value={matricTotal} onChangeText={onMatricTotalChange}
                placeholder="1100" iconName="calculator-outline" colors={colors} keyboardType="numeric" />
            </View>
          </View>

          {/* FSc Row */}
          <View style={styles.marksRow}>
            <View style={styles.marksObtained}>
              <InputField label="FSc / Inter Obtained" value={fscMarks} onChangeText={onFscMarksChange}
                placeholder="Obtained" iconName="book-outline" colors={colors} keyboardType="numeric" />
            </View>
            <View style={styles.marksTotal}>
              <InputField label="Total" value={fscTotal} onChangeText={onFscTotalChange}
                placeholder="1100" iconName="calculator-outline" colors={colors} keyboardType="numeric" />
            </View>
          </View>

          {/* Board Note */}
          <View style={[styles.boardNote, {backgroundColor: colors.primary + '10', borderColor: colors.primary + '30'}]}>
            <Icon name="information-circle-outline" family="Ionicons" size={14} color={colors.primary} />
            <Text style={[styles.boardNoteText, {color: colors.textSecondary}]}>
              Standard boards (BISE): Matric = 1100, FSc = 1100.{' '}
              Other boards (Aga Khan, Cambridge O/A Levels): edit totals to match.
            </Text>
          </View>

          {/* Subject Group */}
          <View style={styles.preferenceSection}>
            <Text style={[styles.preferenceLabel, {color: colors.text}]}>Your FSc / Inter Group</Text>
            <ChipSelector
              options={SUBJECT_GROUPS}
              selected={subjectGroup ? [subjectGroup] : []}
              onSelect={(val: string | string[]) => onSubjectGroupChange(Array.isArray(val) ? val[0] || '' : val)}
              colors={colors}
            />
            {subjectGroup ? (
              <Text style={[styles.subjectGroupHint, {color: colors.primary}]}>
                Programs auto-matched for {subjectGroup}
              </Text>
            ) : null}
          </View>

          {/* Entry Test Row */}
          <View style={styles.marksRow}>
            <View style={styles.marksObtained}>
              <InputField label="Entry Test (Optional)" value={entryTestScore} onChangeText={onEntryTestScoreChange}
                placeholder="If taken" iconName="create-outline" colors={colors} keyboardType="numeric" />
            </View>
            <View style={styles.marksTotal}>
              <InputField label="Total" value={entryTestTotal} onChangeText={onEntryTestTotalChange}
                placeholder="200" iconName="calculator-outline" colors={colors} keyboardType="numeric" />
            </View>
          </View>
        </View>
      )}

      {/* Step 2: Preferences */}
      {currentStep === 2 && (
        <View>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            <Icon name="color-palette-outline" family="Ionicons" size={22} color={colors.primary} />
            <Text style={[styles.stepTitle, {color: colors.text}]}>Your Preferences</Text>
          </View>
          <Text style={[styles.stepDescription, {color: colors.textSecondary}]}>What are you looking for?</Text>

          {profileDataLoaded && (preferredPrograms.length > 0 || preferredCities.length > 0) && (
            <View style={[styles.profileDataBanner, {backgroundColor: colors.primary + '15'}]}>
              <Icon name="sparkles-outline" family="Ionicons" size={16} color={colors.primary} />
              <Text style={[styles.profileDataText, {color: colors.primary}]}>
                Matched with your career choice & city from profile
              </Text>
            </View>
          )}

          <View style={styles.preferenceSection}>
            <Text style={[styles.preferenceLabel, {color: colors.text}]}>Preferred Programs (select multiple)</Text>
            <ChipSelector options={PROGRAMS} selected={preferredPrograms} onSelect={onProgramsChange} colors={colors} multiSelect />
          </View>

          <View style={styles.preferenceSection}>
            <Text style={[styles.preferenceLabel, {color: colors.text}]}>Preferred Cities (select multiple)</Text>
            <ChipSelector options={CITIES} selected={preferredCities} onSelect={onCitiesChange} colors={colors} multiSelect />
          </View>

          <View style={styles.preferenceSection}>
            <Text style={[styles.preferenceLabel, {color: colors.text}]}>University Type</Text>
            <ChipSelector options={TYPES} selected={preferredType} onSelect={onTypeChange} colors={colors} />
          </View>

          <View style={styles.preferenceSection}>
            <Text style={[styles.preferenceLabel, {color: colors.text}]}>Preferred Session</Text>
            <ChipSelector
              options={SESSIONS}
              selected={preferredSession}
              onSelect={(val: string) => onSessionChange(val)}
              colors={colors}
            />
          </View>

          {/* Quota / Reserved Seat Options */}
          <View style={[styles.quotaSection, {borderColor: colors.border, backgroundColor: colors.card}]}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6}}>
              <Icon name="ribbon-outline" family="Ionicons" size={16} color={colors.primary} />
              <Text style={[styles.preferenceLabel, {color: colors.text, marginBottom: 0}]}>
                Quota / Reserved Seat Options
              </Text>
            </View>
            <Text style={[styles.quotaHint, {color: colors.textSecondary}]}>
              Selected options unlock reserved seat merit data — many students qualify without knowing!
            </Text>

            {onGenderChange && (
              <View style={{marginTop: SPACING.sm}}>
                <Text style={[styles.preferenceLabel, {color: colors.textSecondary, fontSize: 12}]}>Gender</Text>
                <ChipSelector options={GENDERS} selected={gender ?? ''} onSelect={onGenderChange} colors={colors} />
              </View>
            )}

            {onProvinceChange && (
              <View style={{marginTop: SPACING.sm}}>
                <Text style={[styles.preferenceLabel, {color: colors.textSecondary, fontSize: 12}]}>Home Province / Region</Text>
                <ChipSelector options={PROVINCES} selected={userProvince ?? ''} onSelect={onProvinceChange} colors={colors} />
              </View>
            )}

            {onQuotaFlagsChange && (
              <View style={{marginTop: SPACING.sm}}>
                <Text style={[styles.preferenceLabel, {color: colors.textSecondary, fontSize: 12}]}>Special Categories (select all that apply)</Text>
                <ChipSelector options={QUOTA_FLAGS} selected={quotaFlags ?? []} onSelect={onQuotaFlagsChange} colors={colors} multiSelect />
              </View>
            )}
          </View>
        </View>
      )}

      {/* Step 3: Review */}
      {currentStep === 3 && (
        <View>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            <Icon name="checkmark-circle" family="Ionicons" size={22} color={colors.success} />
            <Text style={[styles.stepTitle, {color: colors.text}]}>Review Your Information</Text>
          </View>
          <Text style={[styles.stepDescription, {color: colors.textSecondary}]}>
            Make sure everything looks correct
          </Text>

          <View style={[styles.reviewCard, {backgroundColor: colors.card}]}>
            <ReviewRow icon="document-text-outline" label="Matric Marks" value={`${matricMarks} / ${matricTotal}`} colors={colors} />
            <View style={[styles.reviewDivider, {backgroundColor: colors.border}]} />
            <ReviewRow icon="book-outline" label="FSc Marks" value={`${fscMarks} / ${fscTotal}`} colors={colors} />
            <View style={[styles.reviewDivider, {backgroundColor: colors.border}]} />
            {entryTestScore ? (
              <>
                <ReviewRow icon="create-outline" label="Entry Test" value={`${entryTestScore} / ${entryTestTotal}`} colors={colors} />
                <View style={[styles.reviewDivider, {backgroundColor: colors.border}]} />
              </>
            ) : null}
            {subjectGroup ? (
              <>
                <ReviewRow icon="school-outline" label="Subject Group" value={subjectGroup} colors={colors} />
                <View style={[styles.reviewDivider, {backgroundColor: colors.border}]} />
              </>
            ) : null}
            <ReviewRow icon="flag-outline" label="Programs" value={preferredPrograms.join(', ') || 'Not selected'} colors={colors} />
            <View style={[styles.reviewDivider, {backgroundColor: colors.border}]} />
            <ReviewRow icon="location-outline" label="Cities (Filter Active)" value={preferredCities.join(', ') || 'Not selected'} colors={colors} />
          </View>
        </View>
      )}
    </View>
  );
};

/** Small helper for review rows */
const ReviewRow = ({icon, label, value, colors}: {icon: string; label: string; value: string; colors: any}) => (
  <View style={styles.reviewSection}>
    <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
      <Icon name={icon} family="Ionicons" size={16} color={colors.textSecondary} />
      <Text style={[styles.reviewLabel, {color: colors.textSecondary}]}>{label}</Text>
    </View>
    <Text style={[styles.reviewValue, {color: colors.text}]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  stepTitle: {fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weight.bold, marginBottom: 4},
  stepDescription: {fontSize: TYPOGRAPHY.sizes.sm, marginBottom: SPACING.lg},
  profileDataBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.sm, marginBottom: SPACING.md,
  },
  profileDataText: {fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weight.medium, flex: 1},
  marksRow: {flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.xs},
  marksObtained: {flex: 2},
  marksTotal: {flex: 1},
  boardNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    padding: SPACING.sm, borderRadius: RADIUS.sm, borderWidth: 1, marginBottom: SPACING.md,
  },
  boardNoteText: {fontSize: 11, flex: 1, lineHeight: 16},
  subjectGroupHint: {fontSize: TYPOGRAPHY.sizes.xs, marginTop: 4, fontWeight: TYPOGRAPHY.weight.medium},
  preferenceSection: {marginBottom: SPACING.lg},
  preferenceLabel: {fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.semibold, marginBottom: SPACING.sm},
  reviewCard: {
    borderRadius: RADIUS.lg, padding: SPACING.md, elevation: 2,
    shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.1, shadowRadius: 4,
  },
  reviewSection: {paddingVertical: SPACING.sm},
  reviewLabel: {fontSize: TYPOGRAPHY.sizes.xs, marginBottom: 2},
  reviewValue: {fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.semibold},
  reviewDivider: {height: 1},
  validationError: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: SPACING.sm, borderRadius: RADIUS.md, marginBottom: SPACING.sm,
  },
  validationErrorText: {fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.medium},
  quotaSection: {
    borderWidth: 1, borderRadius: RADIUS.md, padding: SPACING.md, marginTop: SPACING.sm,
  },
  quotaHint: {fontSize: 11, lineHeight: 16, marginBottom: 4},
});

export default React.memo(WizardSteps);

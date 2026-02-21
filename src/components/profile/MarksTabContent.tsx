/**
 * MarksTabContent - Academic marks input (matric, inter, entry test)
 */

import React from 'react';
import {View, Text, TouchableOpacity, TextInput, StyleSheet} from 'react-native';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../../constants/design';
import {Icon} from '../icons';
import type {UserProfile} from './constants';

// Fallback LinearGradient
let LinearGradient: React.ComponentType<any>;
try {
  LinearGradient = require('react-native-linear-gradient').default;
} catch (e) {
  LinearGradient = ({children, colors: c, style, ...props}: any) => (
    <View style={[style, {backgroundColor: c?.[0] || '#4573DF'}]} {...props}>{children}</View>
  );
}

interface Props {
  profile: UserProfile;
  colors: any;
  marksSaved: boolean;
  updateProfile: (key: string, value: any) => void;
  onSaveMarks: () => void;
  onCalculateMerit: () => void;
  onFindUniversities: () => void;
}

const MarksSection = ({title, iconName, obtained, total, totalDefault, color, badgeBg, onObtainedChange, onTotalChange, colors, optional}: {
  title: string; iconName: string; obtained: number | null; total: number;
  totalDefault: number; color: string; badgeBg: string;
  onObtainedChange: (v: number | null) => void; onTotalChange: (v: number) => void;
  colors: any; optional?: boolean;
}) => (
  <View style={styles.section}>
    <View style={styles.sectionHeaderRow}>
      <View style={styles.sectionHeader}>
        <Icon name={iconName} family="Ionicons" size={18} color={colors.primary} />
        <Text style={[styles.sectionTitle, {color: colors.text}]}>{title}</Text>
      </View>
      {optional && <Text style={{fontSize: 12, color: colors.textSecondary, fontStyle: 'italic'}}>(Optional)</Text>}
    </View>
    <View style={[styles.marksCard, {backgroundColor: colors.card}]}>
      <View style={styles.marksInputRow}>
        <View style={styles.marksInputGroup}>
          <Text style={[styles.marksLabel, {color: colors.textSecondary}]}>
            {optional ? 'Score' : 'Obtained'}
          </Text>
          <TextInput
            style={[styles.marksInput, {backgroundColor: colors.background, color: colors.text}]}
            placeholder={String(totalDefault - 150)}
            placeholderTextColor={colors.placeholder}
            keyboardType="numeric"
            value={obtained?.toString() || ''}
            onChangeText={text => onObtainedChange(parseInt(text) || null)}
          />
        </View>
        <Text style={[styles.marksDivider, {color: colors.textSecondary}]}>/</Text>
        <View style={styles.marksInputGroup}>
          <Text style={[styles.marksLabel, {color: colors.textSecondary}]}>
            {optional ? 'Out of' : 'Total'}
          </Text>
          <TextInput
            style={[styles.marksInput, {backgroundColor: colors.background, color: colors.text}]}
            placeholder={String(totalDefault)}
            placeholderTextColor={colors.placeholder}
            keyboardType="numeric"
            value={total?.toString() || String(totalDefault)}
            onChangeText={text => onTotalChange(parseInt(text) || totalDefault)}
          />
        </View>
        <View style={[styles.percentBadge, {backgroundColor: badgeBg}]}>
          <Text style={[styles.percentText, {color}]}>
            {obtained ? ((obtained / (total || totalDefault)) * 100).toFixed(1) : '0'}%
          </Text>
        </View>
      </View>
    </View>
  </View>
);

const MarksTabContent = ({
  profile, colors, marksSaved,
  updateProfile, onSaveMarks, onCalculateMerit, onFindUniversities,
}: Props) => (
  <>
    <MarksSection
      title="Matric / O-Levels" iconName="book-outline"
      obtained={profile.matricMarks} total={profile.matricTotal} totalDefault={1100}
      color={colors.primary} badgeBg={colors.primaryLight}
      onObtainedChange={v => updateProfile('matricMarks', v)}
      onTotalChange={v => updateProfile('matricTotal', v)}
      colors={colors}
    />
    <MarksSection
      title="FSc / A-Levels" iconName="library-outline"
      obtained={profile.interMarks} total={profile.interTotal} totalDefault={1100}
      color={colors.success} badgeBg={colors.successLight}
      onObtainedChange={v => updateProfile('interMarks', v)}
      onTotalChange={v => updateProfile('interTotal', v)}
      colors={colors}
    />
    <MarksSection
      title="Entry Test" iconName="create-outline"
      obtained={profile.entryTestScore} total={profile.entryTestTotal} totalDefault={200}
      color={colors.warning} badgeBg={colors.warningLight}
      onObtainedChange={v => updateProfile('entryTestScore', v)}
      onTotalChange={v => updateProfile('entryTestTotal', v)}
      colors={colors} optional
    />

    {/* Save Button */}
    <TouchableOpacity style={styles.actionBtnWrapper} onPress={onSaveMarks}
      accessibilityRole="button" accessibilityLabel="Save marks to profile">
      <LinearGradient
        colors={marksSaved ? ['#27ae60', '#2ecc71'] : [colors.primary, colors.primaryDark || '#3660C9']}
        start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.actionBtn}>
        <Icon name={marksSaved ? 'checkmark-circle' : 'save-outline'} family="Ionicons" size={22} color="#FFFFFF" />
        <Text style={styles.actionBtnText}>{marksSaved ? 'Marks Saved!' : 'Save Marks'}</Text>
      </LinearGradient>
    </TouchableOpacity>

    {/* Secondary Actions */}
    <View style={styles.optionalActionsRow}>
      <TouchableOpacity style={[styles.optionalActionBtn, {backgroundColor: colors.card, borderColor: colors.border}]}
        onPress={onCalculateMerit} accessibilityRole="button" accessibilityLabel="Calculate merit">
        <Icon name="calculator-outline" family="Ionicons" size={18} color={colors.textSecondary} />
        <Text style={[styles.optionalActionText, {color: colors.textSecondary}]}>Calculate Merit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.optionalActionBtn, {backgroundColor: colors.card, borderColor: colors.border}]}
        onPress={onFindUniversities} accessibilityRole="button" accessibilityLabel="Find universities">
        <Icon name="school-outline" family="Ionicons" size={18} color={colors.textSecondary} />
        <Text style={[styles.optionalActionText, {color: colors.textSecondary}]}>Find Universities</Text>
      </TouchableOpacity>
    </View>
  </>
);

const styles = StyleSheet.create({
  section: {paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg},
  sectionHeader: {flexDirection: 'row', alignItems: 'center', gap: 6},
  sectionHeaderRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm},
  sectionTitle: {fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.bold},
  marksCard: {borderRadius: RADIUS.xl, padding: SPACING.md},
  marksInputRow: {flexDirection: 'row', alignItems: 'center'},
  marksInputGroup: {flex: 1},
  marksLabel: {fontSize: TYPOGRAPHY.sizes.xs, marginBottom: 4},
  marksInput: {borderRadius: RADIUS.md, padding: SPACING.sm, fontSize: TYPOGRAPHY.sizes.md, textAlign: 'center', fontWeight: TYPOGRAPHY.weight.semibold},
  marksDivider: {fontSize: 24, marginHorizontal: SPACING.sm, marginTop: SPACING.md},
  percentBadge: {marginLeft: SPACING.sm, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.lg, marginTop: SPACING.md},
  percentText: {fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.bold},
  actionBtnWrapper: {marginHorizontal: SPACING.lg, marginTop: SPACING.md},
  actionBtn: {flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: SPACING.md + 2, borderRadius: RADIUS.lg},
  actionBtnText: {color: '#FFFFFF', fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.bold, marginLeft: SPACING.sm},
  optionalActionsRow: {flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: SPACING.lg, marginTop: SPACING.md, gap: SPACING.sm},
  optionalActionBtn: {flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, gap: SPACING.xs},
  optionalActionText: {fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.medium},
});

export default MarksTabContent;

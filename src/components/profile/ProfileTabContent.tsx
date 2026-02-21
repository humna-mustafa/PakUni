/**
 * ProfileTabContent - Personal info, education, career goals, interests
 */

import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../../constants/design';
import {Icon} from '../icons';
import type {UserProfile, EditField} from './constants';
import {CITIES, EDUCATION_LEVELS, BOARDS, TARGET_FIELDS, INTERESTS_DATA} from './constants';

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
  getProfileCompletion: () => number;
  openEditModal: (field: EditField) => void;
  toggleInterest: (interest: string) => void;
}

const ProfileTabContent = ({profile, colors, getProfileCompletion, openEditModal, toggleInterest}: Props) => {
  const completion = getProfileCompletion();

  const renderInfoRow = (item: {key: string; label: string; value: string; type: string; options?: string[]}) => (
    <TouchableOpacity
      key={item.key}
      style={[styles.infoRow, {backgroundColor: colors.card}]}
      onPress={() => openEditModal({key: item.key, label: item.label, type: item.type, options: item.options})}>
      <Text style={[styles.infoLabel, {color: colors.textSecondary}]}>{item.label}</Text>
      <View style={styles.infoValueRow}>
        <Text style={[styles.infoValue, {color: item.value ? colors.text : colors.placeholder}]}>
          {item.value || 'Not set'}
        </Text>
        <Text style={[styles.infoArrow, {color: colors.primary}]}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      {/* Completion Card */}
      <View style={[styles.completionCard, {backgroundColor: colors.card}]}>
        <View style={styles.completionHeader}>
          <View>
            <Text style={[styles.completionTitle, {color: colors.text}]}>Profile Completion</Text>
            <Text style={[styles.completionHint, {color: colors.textSecondary}]}>Complete for better recommendations</Text>
          </View>
          <View style={[styles.completionBadge, {backgroundColor: colors.primaryLight}]}>
            <Text style={[styles.completionPercent, {color: colors.primary}]}>{completion}%</Text>
          </View>
        </View>
        <View style={[styles.completionBar, {backgroundColor: colors.border}]}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark || '#3660C9']}
            start={{x: 0, y: 0}} end={{x: 1, y: 0}}
            style={[styles.completionFill, {width: `${completion}%`}]}
          />
        </View>
      </View>

      {/* Personal Info */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="person-outline" family="Ionicons" size={18} color={colors.primary} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Personal Info</Text>
        </View>
        {[
          {key: 'name', label: 'Full Name', value: profile.name, type: 'text'},
          {key: 'email', label: 'Email', value: profile.email, type: 'text'},
          {key: 'phone', label: 'Phone', value: profile.phone, type: 'text'},
          {key: 'city', label: 'City', value: profile.city, type: 'select', options: CITIES},
        ].map(renderInfoRow)}
      </View>

      {/* Education */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="school-outline" family="Ionicons" size={18} color={colors.primary} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Education</Text>
        </View>
        {[
          {key: 'currentClass', label: 'Current Class', value: profile.currentClass, type: 'select', options: EDUCATION_LEVELS},
          {key: 'board', label: 'Board', value: profile.board, type: 'select', options: BOARDS},
          {key: 'school', label: 'School/College', value: profile.school, type: 'text'},
        ].map(renderInfoRow)}
      </View>

      {/* Goals */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="flag-outline" family="Ionicons" size={18} color={colors.primary} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Career Goals</Text>
        </View>
        {[
          {key: 'targetField', label: 'Target Field', value: profile.targetField, type: 'select', options: TARGET_FIELDS},
          {key: 'targetUniversity', label: 'Dream University', value: profile.targetUniversity, type: 'text'},
        ].map(renderInfoRow)}
      </View>

      {/* Interests */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="heart-outline" family="Ionicons" size={18} color={colors.primary} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Interests</Text>
        </View>
        <Text style={[styles.sectionHint, {color: colors.textSecondary}]}>Select for personalized recommendations</Text>
        <View style={styles.interestsGrid}>
          {INTERESTS_DATA.map(interest => (
            <TouchableOpacity
              key={interest.label}
              style={[
                styles.interestTag,
                {backgroundColor: colors.card, borderColor: colors.border},
                profile.interests.includes(interest.label) && {backgroundColor: colors.primaryLight, borderColor: colors.primary},
              ]}
              onPress={() => toggleInterest(interest.label)}>
              <View style={styles.interestInner}>
                <Icon
                  name={interest.iconName}
                  family="Ionicons"
                  size={14}
                  color={profile.interests.includes(interest.label) ? colors.primary : colors.textSecondary}
                />
                <Text style={[
                  styles.interestText,
                  {color: colors.textSecondary},
                  profile.interests.includes(interest.label) && {color: colors.primary, fontWeight: TYPOGRAPHY.weight.semibold},
                ]}>
                  {interest.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  completionCard: {marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, borderRadius: RADIUS.xl, padding: SPACING.md},
  completionHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm},
  completionTitle: {fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.bold},
  completionHint: {fontSize: TYPOGRAPHY.sizes.xs, marginTop: 2},
  completionBadge: {paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full},
  completionPercent: {fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.heavy},
  completionBar: {height: 8, borderRadius: 4, overflow: 'hidden'},
  completionFill: {height: '100%', borderRadius: 4},
  section: {paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg},
  sectionHeader: {flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.sm},
  sectionTitle: {fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.bold},
  sectionHint: {fontSize: TYPOGRAPHY.sizes.xs, marginBottom: SPACING.sm},
  infoRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.xs},
  infoLabel: {fontSize: TYPOGRAPHY.sizes.sm},
  infoValueRow: {flexDirection: 'row', alignItems: 'center'},
  infoValue: {fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.medium, marginRight: SPACING.xs},
  infoArrow: {fontSize: 18},
  interestsGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs},
  interestTag: {borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderWidth: 1},
  interestInner: {flexDirection: 'row', alignItems: 'center', gap: 6},
  interestText: {fontSize: TYPOGRAPHY.sizes.xs},
});

export default ProfileTabContent;

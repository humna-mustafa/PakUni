/**
 * Contact Support - Form Field Components
 * Standalone form sections for feedback modal.
 */

import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, TextInput} from 'react-native';
import {TYPOGRAPHY} from '../../constants/design';
import {Icon} from '../icons';
import type {
  FormData,
  BugSeverity,
  ContentType,
  MaterialType,
} from '../../hooks/useContactSupportScreen';
import {
  BUG_SEVERITY_OPTIONS,
  CONTENT_TYPE_OPTIONS,
  MATERIAL_TYPE_OPTIONS,
} from '../../hooks/useContactSupportScreen';

interface FieldProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  colors: any;
}

// ============================================================================
// STAR RATING
// ============================================================================

export const StarRating: React.FC<FieldProps> = ({formData, setFormData, colors}) => (
  <View style={styles.starContainer}>
    <Text style={[styles.optionLabel, {color: colors.text}]}>How would you rate your experience?</Text>
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map(star => (
        <TouchableOpacity
          key={star}
          onPress={() => setFormData({...formData, rating: star})}
          style={styles.starButton}>
          <Icon
            name={star <= (formData.rating || 0) ? 'star' : 'star-outline'}
            family="Ionicons"
            size={36}
            color={star <= (formData.rating || 0) ? '#F59E0B' : colors.textSecondary}
          />
        </TouchableOpacity>
      ))}
    </View>
    <Text style={[styles.ratingHint, {color: colors.textSecondary}]}>
      {formData.rating === 5 ? '🎉 Excellent!' :
       formData.rating === 4 ? '😊 Great!' :
       formData.rating === 3 ? '🙂 Good' :
       formData.rating === 2 ? '😕 Could be better' :
       formData.rating === 1 ? '😞 Needs improvement' : 'Tap to rate'}
    </Text>
  </View>
);

// ============================================================================
// BUG SEVERITY
// ============================================================================

export const BugSeveritySelector: React.FC<FieldProps> = ({formData, setFormData, colors}) => (
  <View style={styles.optionGroup}>
    <Text style={[styles.optionLabel, {color: colors.text}]}>How serious is this issue?</Text>
    <View style={styles.severityGrid}>
      {BUG_SEVERITY_OPTIONS.map(option => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.severityOption,
            {backgroundColor: colors.card, borderColor: colors.border},
            formData.severity === option.value && {backgroundColor: option.color + '20', borderColor: option.color},
          ]}
          onPress={() => setFormData({...formData, severity: option.value})}>
          <View style={[styles.severityDot, {backgroundColor: option.color}]} />
          <View style={styles.severityContent}>
            <Text style={[styles.severityLabel, {color: formData.severity === option.value ? option.color : colors.text}]}>
              {option.label}
            </Text>
            <Text style={[styles.severityDesc, {color: colors.textSecondary}]} numberOfLines={1}>
              {option.description}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

// ============================================================================
// CONTENT TYPE SELECTOR
// ============================================================================

export const ContentTypeSelector: React.FC<FieldProps> = ({formData, setFormData, colors}) => (
  <View style={styles.optionGroup}>
    <Text style={[styles.optionLabel, {color: colors.text}]}>What type of content needs updating?</Text>
    <View style={styles.contentTypeGrid}>
      {CONTENT_TYPE_OPTIONS.map(option => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.contentTypeOption,
            {backgroundColor: colors.card, borderColor: colors.border},
            formData.contentType === option.value && {backgroundColor: colors.primaryLight, borderColor: colors.primary},
          ]}
          onPress={() => setFormData({...formData, contentType: option.value})}>
          <Icon name={option.icon} family="Ionicons" size={20}
            color={formData.contentType === option.value ? colors.primary : colors.textSecondary} />
          <Text style={[styles.contentTypeLabel, {color: formData.contentType === option.value ? colors.primary : colors.text}]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
    {formData.contentType === 'university' && (
      <TextInput style={[styles.textInput, {backgroundColor: colors.background, color: colors.text}]}
        placeholder="University name (optional)" placeholderTextColor={colors.placeholder}
        value={formData.universityName} onChangeText={text => setFormData({...formData, universityName: text})} />
    )}
    {formData.contentType === 'scholarship' && (
      <TextInput style={[styles.textInput, {backgroundColor: colors.background, color: colors.text}]}
        placeholder="Scholarship name (optional)" placeholderTextColor={colors.placeholder}
        value={formData.scholarshipName} onChangeText={text => setFormData({...formData, scholarshipName: text})} />
    )}
  </View>
);

// ============================================================================
// MATERIAL TYPE SELECTOR
// ============================================================================

export const MaterialTypeSelector: React.FC<FieldProps> = ({formData, setFormData, colors}) => (
  <View style={styles.optionGroup}>
    <Text style={[styles.optionLabel, {color: colors.text}]}>What type of material are you sharing?</Text>
    <View style={styles.materialTypeList}>
      {MATERIAL_TYPE_OPTIONS.map(option => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.materialTypeOption,
            {backgroundColor: colors.card, borderColor: colors.border},
            formData.materialType === option.value && {backgroundColor: colors.primaryLight, borderColor: colors.primary},
          ]}
          onPress={() => setFormData({...formData, materialType: option.value})}>
          <View style={[styles.materialIconBg, {backgroundColor: formData.materialType === option.value ? colors.primary + '20' : colors.background}]}>
            <Icon name={option.icon} family="Ionicons" size={22}
              color={formData.materialType === option.value ? colors.primary : colors.textSecondary} />
          </View>
          <View style={styles.materialContent}>
            <Text style={[styles.materialLabel, {color: formData.materialType === option.value ? colors.primary : colors.text}]}>
              {option.label}
            </Text>
            <Text style={[styles.materialDesc, {color: colors.textSecondary}]}>{option.description}</Text>
          </View>
          {formData.materialType === option.value && (
            <Icon name="checkmark-circle" family="Ionicons" size={22} color={colors.primary} />
          )}
        </TouchableOpacity>
      ))}
    </View>
    <TextInput style={[styles.textInput, {backgroundColor: colors.background, color: colors.text}]}
      placeholder="Link to material (Google Drive, Dropbox, etc.)" placeholderTextColor={colors.placeholder}
      value={formData.materialUrl} onChangeText={text => setFormData({...formData, materialUrl: text})}
      autoCapitalize="none" keyboardType="url" />
    <Text style={[styles.inputHint, {color: colors.textSecondary}]}>
      💡 You can also describe the material in the description box if you don't have a link
    </Text>
  </View>
);

// ============================================================================
// RECOMMEND QUESTION
// ============================================================================

export const RecommendQuestion: React.FC<FieldProps> = ({formData, setFormData, colors}) => (
  <View style={styles.recommendContainer}>
    <Text style={[styles.recommendLabel, {color: colors.text}]}>Would you recommend PakUni to others?</Text>
    <View style={styles.recommendButtons}>
      <TouchableOpacity
        style={[
          styles.recommendBtn,
          {backgroundColor: colors.card, borderColor: colors.border},
          formData.wouldRecommend === true && {backgroundColor: '#10B98120', borderColor: '#10B981'},
        ]}
        onPress={() => setFormData({...formData, wouldRecommend: true})}>
        <Icon name="thumbs-up" family="Ionicons" size={24}
          color={formData.wouldRecommend === true ? '#10B981' : colors.textSecondary} />
        <Text style={[styles.recommendBtnText, {color: formData.wouldRecommend === true ? '#10B981' : colors.text}]}>Yes!</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.recommendBtn,
          {backgroundColor: colors.card, borderColor: colors.border},
          formData.wouldRecommend === false && {backgroundColor: '#EF444420', borderColor: '#EF4444'},
        ]}
        onPress={() => setFormData({...formData, wouldRecommend: false})}>
        <Icon name="thumbs-down" family="Ionicons" size={24}
          color={formData.wouldRecommend === false ? '#EF4444' : colors.textSecondary} />
        <Text style={[styles.recommendBtnText, {color: formData.wouldRecommend === false ? '#EF4444' : colors.text}]}>Not Yet</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  optionGroup: {marginBottom: 20},
  optionLabel: {fontSize: 14, fontWeight: TYPOGRAPHY.weight.semibold as any, marginBottom: 10},
  starContainer: {alignItems: 'center', marginBottom: 20},
  starsRow: {flexDirection: 'row', gap: 8},
  starButton: {padding: 4},
  ratingHint: {fontSize: 13, marginTop: 8},
  severityGrid: {gap: 8},
  severityOption: {flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1, gap: 10},
  severityDot: {width: 10, height: 10, borderRadius: 5},
  severityContent: {flex: 1},
  severityLabel: {fontSize: 14, fontWeight: TYPOGRAPHY.weight.semibold as any},
  severityDesc: {fontSize: 11, marginTop: 2},
  contentTypeGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12},
  contentTypeOption: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: 10, borderWidth: 1, gap: 6,
  },
  contentTypeLabel: {fontSize: 12, fontWeight: TYPOGRAPHY.weight.medium as any},
  materialTypeList: {gap: 8, marginBottom: 12},
  materialTypeOption: {flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1, gap: 12},
  materialIconBg: {width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center'},
  materialContent: {flex: 1},
  materialLabel: {fontSize: 14, fontWeight: TYPOGRAPHY.weight.semibold as any},
  materialDesc: {fontSize: 11, marginTop: 2},
  textInput: {borderRadius: 10, padding: 14, fontSize: 15},
  inputHint: {fontSize: 12, marginTop: 6, lineHeight: 16},
  recommendContainer: {marginVertical: 16},
  recommendLabel: {fontSize: 14, fontWeight: TYPOGRAPHY.weight.semibold as any, marginBottom: 12, textAlign: 'center'},
  recommendButtons: {flexDirection: 'row', gap: 12, justifyContent: 'center'},
  recommendBtn: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 12, borderWidth: 1, gap: 8,
  },
  recommendBtnText: {fontSize: 14, fontWeight: TYPOGRAPHY.weight.semibold as any},
});

/**
 * ReviewSubmitStep - Step 4: Review all data and submit the correction
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { SEMANTIC, BRAND } from '../../constants/brand';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/design';
import { useAuth } from '../../contexts/AuthContext';
import { ContributeFormData } from '../../types/contribute';
import { VerificationBadge } from './VerificationBadge';

interface ReviewSubmitStepProps {
  formData: ContributeFormData;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
  colors: any;
  isDark: boolean;
}

const ReviewSubmitStepComponent: React.FC<ReviewSubmitStepProps> = ({
  formData,
  onBack,
  onSubmit,
  submitting,
  colors,
  isDark,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { user } = useAuth();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const cardBg = isDark ? '#1A1A2E' : '#FFFFFF';
  const fieldLabel = formData.field?.label || formData.customField;

  return (
    <Animated.ScrollView
      style={[styles.stepContent, { opacity: fadeAnim }]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.stepHeader}>
        <Text style={[styles.stepTitle, { color: colors.text }]}>Review & Submit</Text>
        <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
          Please verify your correction before submitting
        </Text>
      </View>

      {/* Review Card */}
      <View style={[styles.reviewCard, { backgroundColor: cardBg }]}>
        {/* Entity & Category */}
        <View style={styles.reviewRow}>
          <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>UPDATING</Text>
          <View style={styles.reviewValueRow}>
            {formData.category && (
              <LinearGradient colors={formData.category.gradient} style={styles.reviewIcon}>
                <Icon name={formData.category.icon} size={12} color="#FFFFFF" />
              </LinearGradient>
            )}
            <Text style={[styles.reviewValue, { color: colors.text }]}>
              {formData.entity?.name}
            </Text>
          </View>
        </View>

        <View style={[styles.reviewDivider, { backgroundColor: colors.border }]} />

        {/* Field */}
        <View style={styles.reviewRow}>
          <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>FIELD</Text>
          <Text style={[styles.reviewValue, { color: colors.text }]}>{fieldLabel}</Text>
        </View>

        <View style={[styles.reviewDivider, { backgroundColor: colors.border }]} />

        {/* Change */}
        <View style={styles.reviewRow}>
          <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>CHANGE</Text>
          <View style={styles.reviewChangeBox}>
            {formData.currentValue ? (
              <>
                <View style={[styles.reviewOldBox, { backgroundColor: SEMANTIC.errorBg }]}>
                  <Icon name="close-circle" size={14} color={SEMANTIC.error} />
                  <Text style={styles.reviewOldText} numberOfLines={1}>
                    {formData.currentValue}
                  </Text>
                </View>
                <Icon name="arrow-forward" size={16} color={colors.textSecondary} />
              </>
            ) : null}
            <View style={[styles.reviewNewBox, { backgroundColor: SEMANTIC.successBg }]}>
              <Icon name="checkmark-circle" size={14} color={SEMANTIC.success} />
              <Text style={styles.reviewNewText} numberOfLines={1}>
                {formData.newValue}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.reviewDivider, { backgroundColor: colors.border }]} />

        {/* Reason */}
        <View style={styles.reviewRow}>
          <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>REASON</Text>
          <Text style={[styles.reviewValue, { color: colors.text }]} numberOfLines={2}>
            {formData.reason}
          </Text>
        </View>

        {formData.sourceUrl && (
          <>
            <View style={[styles.reviewDivider, { backgroundColor: colors.border }]} />
            <View style={styles.reviewRow}>
              <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>SOURCE</Text>
              <Text style={[styles.reviewValue, { color: colors.primary }]} numberOfLines={1}>
                {formData.sourceUrl}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Trust Indicator */}
      <View style={[styles.trustCard, { backgroundColor: isDark ? SEMANTIC.infoBgDark : SEMANTIC.infoBg }]}>
        <View style={styles.trustLeft}>
          {user?.provider === 'google' ? (
            <VerificationBadge type="google" size={20} />
          ) : (
            <VerificationBadge type="new" size={20} />
          )}
          <View>
            <Text style={[styles.trustTitle, { color: isDark ? BRAND.primaryLight : BRAND.primaryDark }]}>
              {user?.provider === 'google' ? 'Google Verified User' : 'New Contributor'}
            </Text>
            <Text style={[styles.trustSubtitle, { color: isDark ? BRAND.primaryLight : BRAND.primary }]}>
              {user?.provider === 'google'
                ? 'Your submission may be auto-approved!'
                : 'Build trust with accurate submissions'}
            </Text>
          </View>
        </View>
        {user?.provider === 'google' && (
          <Icon name="flash" size={24} color={SEMANTIC.warning} />
        )}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          { backgroundColor: submitting ? colors.border : SEMANTIC.success },
        ]}
        onPress={onSubmit}
        disabled={submitting}
        activeOpacity={0.8}>
        {submitting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Icon name="paper-plane" size={20} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>Submit Correction</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Edit Button */}
      <TouchableOpacity
        style={[styles.editButton, { borderColor: colors.border }]}
        onPress={onBack}
        disabled={submitting}>
        <Icon name="pencil" size={18} color={colors.text} />
        <Text style={[styles.editButtonText, { color: colors.text }]}>Edit Details</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </Animated.ScrollView>
  );
};

const styles = StyleSheet.create({
  stepContent: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  stepHeader: {
    marginBottom: SPACING.md,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weight.heavy,
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
  },
  reviewCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  reviewRow: {
    paddingVertical: SPACING.xs,
  },
  reviewLabel: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: 4,
  },
  reviewValue: {
    fontSize: 14,
  },
  reviewValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewDivider: {
    height: 1,
    marginVertical: SPACING.xs,
  },
  reviewChangeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  reviewOldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
    maxWidth: '40%',
  },
  reviewOldText: {
    fontSize: 12,
    color: SEMANTIC.errorText,
    textDecorationLine: 'line-through',
  },
  reviewNewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
    maxWidth: '50%',
  },
  reviewNewText: {
    fontSize: 12,
    color: SEMANTIC.successText,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  trustCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
  },
  trustLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  trustTitle: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  trustSubtitle: {
    fontSize: 11,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: 8,
    marginBottom: SPACING.sm,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
});

export const ReviewSubmitStep = React.memo(ReviewSubmitStepComponent);

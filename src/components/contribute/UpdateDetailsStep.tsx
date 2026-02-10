/**
 * UpdateDetailsStep - Step 3: Enter the correction details
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Platform,
  Vibration,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { DARK_BG, LIGHT_BG, SEMANTIC, BRAND, GRADIENTS } from '../../constants/brand';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/design';
import { CategoryOption, EntityData, ContributeFormData } from '../../types/contribute';
import { QUICK_REASONS } from '../../constants/contribute';

interface UpdateDetailsStepProps {
  category: CategoryOption | null;
  entity: EntityData | null;
  formData: ContributeFormData;
  onUpdate: (updates: Partial<ContributeFormData>) => void;
  onBack: () => void;
  colors: any;
  isDark: boolean;
}

const UpdateDetailsStepComponent: React.FC<UpdateDetailsStepProps> = ({
  category,
  entity,
  formData,
  onUpdate,
  onBack,
  colors,
  isDark,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const inputBg = isDark ? DARK_BG.card : LIGHT_BG.cardHover;
  const cardBg = isDark ? DARK_BG.background : LIGHT_BG.card;

  return (
    <Animated.ScrollView
      style={[styles.stepContent, { opacity: fadeAnim }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      {/* Context Header */}
      <View style={[styles.contextHeader, { backgroundColor: cardBg }]}>
        <View style={styles.contextLeft}>
          {category && (
            <LinearGradient colors={category.gradient} style={styles.contextIcon}>
              <Icon name={category.icon} size={16} color="#FFFFFF" />
            </LinearGradient>
          )}
          <View>
            <Text style={[styles.contextEntity, { color: colors.text }]} numberOfLines={1}>
              {entity?.name}
            </Text>
            <Text style={[styles.contextCategory, { color: colors.textSecondary }]}>
              {category?.title}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={onBack}
          style={[styles.changeBtn, { backgroundColor: colors.primary + '15' }]}>
          <Icon name="pencil" size={14} color={colors.primary} />
          <Text style={[styles.changeBtnText, { color: colors.primary }]}>Change</Text>
        </TouchableOpacity>
      </View>

      {/* Section 1: Field Selection */}
      <View style={[styles.formSection, { backgroundColor: cardBg }]}>
        <View style={styles.formSectionHeader}>
          <View style={[styles.sectionNumber, { backgroundColor: colors.primary }]}>
            <Text style={styles.sectionNumberText}>1</Text>
          </View>
          <Text style={[styles.formSectionTitle, { color: colors.text }]}>
            Which field is incorrect?
          </Text>
        </View>

        <View style={styles.fieldChipsWrap}>
          {category?.fields.map(field => {
            const isSelected = formData.field?.id === field.id;
            return (
              <TouchableOpacity
                key={field.id}
                style={[
                  styles.fieldChipLarge,
                  {
                    backgroundColor: isSelected ? colors.primary : inputBg,
                    borderColor: isSelected ? colors.primary : 'transparent',
                  },
                ]}
                onPress={() => {
                  Vibration.vibrate(10);
                  onUpdate({ field, customField: '' });
                }}>
                <Icon
                  name={field.icon}
                  size={16}
                  color={isSelected ? '#FFFFFF' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.fieldChipLargeText,
                    { color: isSelected ? '#FFFFFF' : colors.text },
                  ]}>
                  {field.label}
                </Text>
                {isSelected && <Icon name="checkmark" size={14} color="#FFFFFF" />}
              </TouchableOpacity>
            );
          })}
        </View>

        <TextInput
          style={[styles.formInput, { backgroundColor: inputBg, color: colors.text }]}
          value={formData.customField}
          onChangeText={text => onUpdate({ customField: text, field: null })}
          placeholder="Or type custom field..."
          placeholderTextColor={colors.textSecondary}
        />
        {errors.field && (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={14} color={SEMANTIC.error} />
            <Text style={styles.errorText}>{errors.field}</Text>
          </View>
        )}
      </View>

      {/* Section 2: Value Comparison */}
      <View style={[styles.formSection, { backgroundColor: cardBg }]}>
        <View style={styles.formSectionHeader}>
          <View style={[styles.sectionNumber, { backgroundColor: SEMANTIC.warning }]}>
            <Text style={styles.sectionNumberText}>2</Text>
          </View>
          <Text style={[styles.formSectionTitle, { color: colors.text }]}>
            What's the correction?
          </Text>
        </View>

        {/* Wrong Value Box */}
        <View style={[styles.valueCard, { backgroundColor: isDark ? SEMANTIC.errorBgDark : SEMANTIC.errorBg }]}>
          <View style={styles.valueCardHeader}>
            <View style={[styles.valueIconBg, { backgroundColor: SEMANTIC.errorBg }]}>
              <Icon name="close-circle" size={18} color={SEMANTIC.error} />
            </View>
            <View>
              <Text style={[styles.valueCardLabel, { color: SEMANTIC.errorText }]}>
                Currently Shows (Wrong)
              </Text>
              <Text style={[styles.valueCardHint, { color: colors.textSecondary }]}>
                Optional - leave blank if adding new
              </Text>
            </View>
          </View>
          <TextInput
            style={[
              styles.valueInput,
              { backgroundColor: isDark ? DARK_BG.cardElevated : LIGHT_BG.card, color: colors.text },
            ]}
            value={formData.currentValue}
            onChangeText={text => onUpdate({ currentValue: text })}
            placeholder={formData.field?.placeholder || 'What app currently shows...'}
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Arrow */}
        <View style={styles.valueArrow}>
          <View style={[styles.valueArrowLine, { backgroundColor: colors.border }]} />
          <View style={[styles.valueArrowCircle, { backgroundColor: SEMANTIC.success }]}>
            <Icon name="arrow-down" size={16} color="#FFFFFF" />
          </View>
          <View style={[styles.valueArrowLine, { backgroundColor: colors.border }]} />
        </View>

        {/* Correct Value Box */}
        <View style={[styles.valueCard, { backgroundColor: isDark ? SEMANTIC.successBgDark : SEMANTIC.successBg }]}>
          <View style={styles.valueCardHeader}>
            <View style={[styles.valueIconBg, { backgroundColor: SEMANTIC.successBg }]}>
              <Icon name="checkmark-circle" size={18} color={SEMANTIC.success} />
            </View>
            <View>
              <Text style={[styles.valueCardLabel, { color: SEMANTIC.successText }]}>
                Should Be (Correct) *
              </Text>
            </View>
          </View>
          <TextInput
            style={[
              styles.valueInput,
              { backgroundColor: isDark ? DARK_BG.cardElevated : LIGHT_BG.card, color: colors.text },
              errors.newValue && { borderColor: SEMANTIC.error, borderWidth: 1 },
            ]}
            value={formData.newValue}
            onChangeText={text => onUpdate({ newValue: text })}
            placeholder={formData.field?.placeholder || 'Enter correct value...'}
            placeholderTextColor={colors.textSecondary}
          />
          {errors.newValue && (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={14} color={SEMANTIC.error} />
              <Text style={styles.errorText}>{errors.newValue}</Text>
            </View>
          )}
        </View>

        {/* Live Preview */}
        {formData.currentValue && formData.newValue && (
          <View style={[styles.livePreview, { backgroundColor: isDark ? SEMANTIC.infoBgDark : SEMANTIC.infoBg }]}>
            <Icon name="git-compare" size={18} color={isDark ? BRAND.primaryLight : BRAND.primaryDark} />
            <View style={styles.livePreviewContent}>
              <Text style={[styles.livePreviewLabel, { color: isDark ? BRAND.primaryLight : BRAND.primaryDark }]}>
                Preview:
              </Text>
              <View style={styles.livePreviewValues}>
                <Text style={styles.previewOld}>{formData.currentValue}</Text>
                <Icon name="arrow-forward" size={12} color={isDark ? BRAND.primaryLight : BRAND.primaryDark} />
                <Text style={styles.previewNew}>{formData.newValue}</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Section 3: Reason */}
      <View style={[styles.formSection, { backgroundColor: cardBg }]}>
        <View style={styles.formSectionHeader}>
          <View style={[styles.sectionNumber, { backgroundColor: SEMANTIC.success }]}>
            <Text style={styles.sectionNumberText}>3</Text>
          </View>
          <Text style={[styles.formSectionTitle, { color: colors.text }]}>
            Why this change? *
          </Text>
        </View>

        <View style={styles.quickReasonsWrap}>
          {QUICK_REASONS.map(reason => {
            const isSelected = formData.reason === reason.text;
            return (
              <TouchableOpacity
                key={reason.id}
                style={[
                  styles.quickReasonChip,
                  { backgroundColor: isSelected ? SEMANTIC.success : inputBg },
                ]}
                onPress={() => {
                  Vibration.vibrate(10);
                  onUpdate({ reason: reason.text });
                }}>
                <Icon
                  name={reason.icon}
                  size={14}
                  color={isSelected ? '#FFFFFF' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.quickReasonText,
                    { color: isSelected ? '#FFFFFF' : colors.text },
                  ]}>
                  {reason.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TextInput
          style={[
            styles.formInput,
            styles.formInputMultiline,
            { backgroundColor: inputBg, color: colors.text },
            errors.reason && { borderColor: SEMANTIC.error, borderWidth: 1 },
          ]}
          value={formData.reason}
          onChangeText={text => onUpdate({ reason: text })}
          placeholder="Or type your reason..."
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={2}
        />
        {errors.reason && (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={14} color={SEMANTIC.error} />
            <Text style={styles.errorText}>{errors.reason}</Text>
          </View>
        )}
      </View>

      {/* Section 4: Source (Optional) */}
      <View style={[styles.formSection, { backgroundColor: cardBg }]}>
        <View style={styles.formSectionHeader}>
          <View style={[styles.sectionNumber, { backgroundColor: GRADIENTS.accent[0] }]}>
            <Icon name="link" size={12} color="#FFFFFF" />
          </View>
          <Text style={[styles.formSectionTitle, { color: colors.text }]}>
            Source URL
          </Text>
          <View style={[styles.optionalBadge, { backgroundColor: isDark ? DARK_BG.cardElevated : LIGHT_BG.cardHover }]}>
            <Text style={[styles.optionalText, { color: colors.textSecondary }]}>Optional</Text>
          </View>
        </View>

        <TextInput
          style={[styles.formInput, { backgroundColor: inputBg, color: colors.text }]}
          value={formData.sourceUrl}
          onChangeText={text => onUpdate({ sourceUrl: text })}
          placeholder="https://university.edu.pk/fees"
          placeholderTextColor={colors.textSecondary}
          keyboardType="url"
          autoCapitalize="none"
        />
        <Text style={[styles.sourceHint, { color: colors.textSecondary }]}>
          💡 Adding source = Faster approval & higher trust!
        </Text>
      </View>

      <View style={{ height: 100 }} />
    </Animated.ScrollView>
  );
};

const styles = StyleSheet.create({
  stepContent: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  contextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.sm,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
  },
  contextLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  contextIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contextEntity: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  contextCategory: {
    fontSize: 12,
  },
  changeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  changeBtnText: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  formSection: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  formSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weight.bold,
    flex: 1,
  },
  optionalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  optionalText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  fieldChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  fieldChipLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    gap: 6,
    borderWidth: 1,
  },
  fieldChipLargeText: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  formInput: {
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    fontSize: 14,
  },
  formInputMultiline: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  errorText: {
    color: SEMANTIC.error,
    fontSize: 12,
  },
  valueCard: {
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
  },
  valueCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  valueIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueCardLabel: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  valueCardHint: {
    fontSize: 10,
  },
  valueInput: {
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    fontSize: 14,
  },
  valueArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  valueArrowLine: {
    flex: 1,
    height: 1,
  },
  valueArrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
  },
  livePreview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
  },
  livePreviewContent: {
    flex: 1,
  },
  livePreviewLabel: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: 4,
  },
  livePreviewValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  previewOld: {
    fontSize: 12,
    color: SEMANTIC.error,
    textDecorationLine: 'line-through',
  },
  previewNew: {
    fontSize: 12,
    color: SEMANTIC.success,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  quickReasonsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  quickReasonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    gap: 6,
  },
  quickReasonText: {
    fontSize: 12,
  },
  sourceHint: {
    fontSize: 11,
    marginTop: 8,
  },
});

export const UpdateDetailsStep = React.memo(UpdateDetailsStepComponent);

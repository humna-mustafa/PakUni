/**
 * DataCorrectionScreen
 *
 * Context-aware, field-level data correction screen.
 * Pre-loads current entity data and lets users edit individual fields.
 * Submissions go to admin for yes/no approval before applied to main DB.
 *
 * Route params:
 *   entityType: CorrectionEntityType
 *   entityId: string
 *   entityName?: string  (pre-filled display name)
 *   prefillField?: string  (jump directly to a pre-filled field key)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { UniversalHeader } from '../components';
import { TYPOGRAPHY, SPACING, RADIUS } from '../constants/design';
import {
  dataCorrectionService,
  CorrectionEntityType,
  FieldDefinition,
  FieldCorrection,
  EntityCurrentData,
  ENTITY_FIELDS_MAP,
} from '../services/dataCorrectionService';
import type { RootStackParamList } from '../navigation/AppNavigator';

type DataCorrectionRouteProp = RouteProp<RootStackParamList, 'DataCorrection'>;

// ─── Entity type metadata ────────────────────────────────────────────────────
const ENTITY_META: Record<CorrectionEntityType, { label: string; icon: string; color: string }> = {
  university: { label: 'University', icon: 'school-outline', color: '#4573DF' },
  scholarship: { label: 'Scholarship', icon: 'wallet-outline', color: '#10B981' },
  entry_test: { label: 'Entry Test', icon: 'document-text-outline', color: '#F59E0B' },
  career: { label: 'Career', icon: 'briefcase-outline', color: '#8B5CF6' },
  deadline: { label: 'Deadline', icon: 'calendar-outline', color: '#EF4444' },
  program: { label: 'Program', icon: 'library-outline', color: '#06B6D4' },
  merit_archive: { label: 'Merit Archive', icon: 'trending-up-outline', color: '#EC4899' },
};

// Priority suggestion based on field key
const URGENT_FIELDS = ['registration_deadline', 'application_deadline', 'applicationDeadline', 'test_date', 'entryTestDate', 'deadline'];
const HIGH_FIELDS = ['fee', 'website', 'phone', 'email', 'merit_percentage', 'closingMerit', 'openingMerit', 'tuition_fee'];

function suggestPriority(changedFields: string[]): 'low' | 'medium' | 'high' | 'urgent' {
  if (changedFields.some(f => URGENT_FIELDS.includes(f))) { return 'urgent'; }
  if (changedFields.some(f => HIGH_FIELDS.includes(f))) { return 'high'; }
  if (changedFields.length > 3) { return 'medium'; }
  return 'low';
}

// ─── Component ────────────────────────────────────────────────────────────────
const DataCorrectionScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const navigation = useNavigation();
  const route = useRoute<DataCorrectionRouteProp>();

  const { entityType, entityId, entityName: initialEntityName, prefillField } = route.params;

  // ─── State ────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [entityData, setEntityData] = useState<EntityCurrentData | null>(null);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [reason, setReason] = useState('');
  const [sourceProof, setSourceProof] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [activeEditField, setActiveEditField] = useState<string | null>(null);
  const [step, setStep] = useState<'edit' | 'reason' | 'preview'>('edit');
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const meta = ENTITY_META[entityType as CorrectionEntityType] || ENTITY_META.university;
  const fieldDefs = ENTITY_FIELDS_MAP[entityType as CorrectionEntityType] || [];

  const successAnim = useRef(new Animated.Value(0)).current;

  // ─── Load entity data ─────────────────────────────────────────────────────
  useEffect(() => {
    loadEntityData();
  }, [entityType, entityId]);

  const loadEntityData = async () => {
    setLoading(true);
    try {
      const data = await dataCorrectionService.fetchEntityData(entityType as CorrectionEntityType, entityId);
      setEntityData(data);
      if (prefillField) {
        setActiveEditField(prefillField);
      }
    } catch (_e) {
      // use empty entity if fetch fails
    } finally {
      setLoading(false);
    }
  };

  // ─── Compute changes ────────────────────────────────────────────────────
  const computedChanges: FieldCorrection[] = dataCorrectionService.computeChanges(
    entityData?.fields || {},
    editedValues,
    fieldDefs,
  );

  const hasChanges = computedChanges.length > 0;

  // ─── Handle field edit ────────────────────────────────────────────────────
  const handleEditField = (fieldKey: string, value: string) => {
    setEditedValues(prev => ({ ...prev, [fieldKey]: value }));
  };

  const getCurrentValue = (fieldKey: string): string => {
    const raw = entityData?.fields?.[fieldKey];
    if (raw === null || raw === undefined) { return ''; }
    if (typeof raw === 'object') { return JSON.stringify(raw); }
    return String(raw);
  };

  const getEditedValue = (fieldKey: string): string => {
    if (editedValues[fieldKey] !== undefined) { return editedValues[fieldKey]; }
    return getCurrentValue(fieldKey);
  };

  const isFieldChanged = (fieldKey: string): boolean => {
    if (editedValues[fieldKey] === undefined) { return false; }
    return String(editedValues[fieldKey]).trim() !== String(getCurrentValue(fieldKey)).trim();
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!isAuthenticated || !user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to submit data corrections. Your corrections help keep PakUni accurate for all students!',
      );
      return;
    }

    if (!hasChanges) {
      Alert.alert('No Changes', 'Please edit at least one field before submitting.');
      return;
    }

    if (!reason.trim()) {
      Alert.alert('Reason Required', 'Please explain why this data needs correction.');
      return;
    }

    setSubmitting(true);
    try {
      const priority = suggestPriority(computedChanges.map(c => c.fieldKey));
      const result = await dataCorrectionService.submitCorrection(
        {
          entityType: entityType as CorrectionEntityType,
          entityId,
          entityDisplayName: entityData?.displayName || initialEntityName || entityId,
          corrections: computedChanges,
          overallReason: reason.trim(),
          sourceProof: sourceProof.trim() || undefined,
        },
        {
          id: user.id,
          name: user.fullName || user.email || 'Anonymous',
          email: user.email || null,
        },
        priority,
      );

      if (result.success) {
        setSubmittedId(result.correctionId || null);
        Animated.spring(successAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 80,
          friction: 8,
        }).start();
        setStep('preview'); // use "preview" as success state reuse
      } else {
        Alert.alert('Submission Failed', result.error || 'Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render helpers ───────────────────────────────────────────────────────

  const renderFieldCard = (field: FieldDefinition) => {
    const current = getCurrentValue(field.key);
    const edited = getEditedValue(field.key);
    const changed = isFieldChanged(field.key);
    const isActive = activeEditField === field.key;

    return (
      <View
        key={field.key}
        style={[
          styles.fieldCard,
          {
            backgroundColor: isDark ? colors.card : '#FAFAFA',
            borderColor: changed ? meta.color : isDark ? '#2C2C2E' : '#E5E7EB',
            borderWidth: changed ? 2 : 1,
          },
        ]}>
        {/* Field header */}
        <View style={styles.fieldHeader}>
          <View style={styles.fieldLabelRow}>
            {changed && (
              <View style={[styles.changedDot, { backgroundColor: meta.color }]} />
            )}
            <Text style={[styles.fieldLabel, { color: colors.text }]}>{field.label}</Text>
            {field.required && (
              <Text style={[styles.requiredBadge, { color: '#EF4444' }]}>*required</Text>
            )}
          </View>
          {!isActive && current !== '' && (
            <TouchableOpacity
              onPress={() => setActiveEditField(field.key)}
              style={[styles.editBtn, { backgroundColor: meta.color + '22' }]}>
              <Icon name="create-outline" size={14} color={meta.color} />
              <Text style={[styles.editBtnText, { color: meta.color }]}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Current value */}
        {!isActive && (
          <TouchableOpacity
            onPress={() => setActiveEditField(field.key)}
            activeOpacity={0.7}
            style={styles.currentValueBox}>
            <Text style={[styles.currentValueText, { color: changed ? colors.textSecondary : colors.text }]}
              numberOfLines={3}>
              {current !== '' ? current : <Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>Not set</Text>}
            </Text>
            {changed && (
              <View style={styles.changedOverlay}>
                <Icon name="arrow-forward-outline" size={12} color={meta.color} />
                <Text style={[styles.proposedText, { color: meta.color }]} numberOfLines={2}>
                  {edited}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Edit input */}
        {isActive && (
          <View style={styles.editContainer}>
            {field.type === 'select' && field.options ? (
              <View style={styles.optionsGrid}>
                {field.options.map(opt => (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => {
                      handleEditField(field.key, opt);
                      setActiveEditField(null);
                    }}
                    style={[
                      styles.optionChip,
                      {
                        backgroundColor: edited === opt ? meta.color : isDark ? '#2C2C2E' : '#F3F4F6',
                        borderColor: edited === opt ? meta.color : 'transparent',
                      },
                    ]}>
                    <Text style={[styles.optionChipText, { color: edited === opt ? '#FFF' : colors.text }]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <TextInput
                style={[
                  styles.textInput,
                  {
                    color: colors.text,
                    backgroundColor: isDark ? '#1C1C1E' : '#F9FAFB',
                    borderColor: meta.color,
                  },
                  field.type === 'textarea' && styles.textArea,
                ]}
                value={edited}
                onChangeText={v => handleEditField(field.key, v)}
                placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                placeholderTextColor={colors.textSecondary}
                multiline={field.type === 'textarea'}
                numberOfLines={field.type === 'textarea' ? 3 : 1}
                keyboardType={
                  field.type === 'number'
                    ? 'numeric'
                    : field.type === 'url' || field.type === 'email'
                      ? 'url'
                      : 'default'
                }
                autoCapitalize={field.type === 'url' || field.type === 'email' ? 'none' : 'sentences'}
                maxLength={field.maxLength}
                autoFocus={!changed}
              />
            )}
            {field.hint && (
              <Text style={[styles.hintText, { color: colors.textSecondary }]}>{field.hint}</Text>
            )}
            <View style={styles.editActions}>
              <TouchableOpacity
                onPress={() => {
                  // reset to current
                  setEditedValues(prev => {
                    const copy = { ...prev };
                    delete copy[field.key];
                    return copy;
                  });
                  setActiveEditField(null);
                }}
                style={[styles.actionBtn, { borderColor: '#6B7280' }]}>
                <Text style={{ color: '#6B7280', fontSize: 13, fontFamily: TYPOGRAPHY.fontFamily.medium }}>
                  Reset
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveEditField(null)}
                style={[styles.actionBtn, { borderColor: meta.color, backgroundColor: meta.color }]}>
                <Text style={{ color: '#FFF', fontSize: 13, fontFamily: TYPOGRAPHY.fontFamily.medium }}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderChangeSummary = () => {
    if (!hasChanges) { return null; }
    return (
      <View style={[styles.summaryBox, { backgroundColor: meta.color + '14', borderColor: meta.color + '44' }]}>
        <View style={styles.summaryHeader}>
          <Icon name="checkmark-circle-outline" size={16} color={meta.color} />
          <Text style={[styles.summaryTitle, { color: meta.color }]}>
            {computedChanges.length} field{computedChanges.length !== 1 ? 's' : ''} changed
          </Text>
        </View>
        {computedChanges.map(c => (
          <View key={c.fieldKey} style={styles.summaryRow}>
            <Text style={[styles.summaryFieldName, { color: colors.textSecondary }]}>{c.fieldLabel}</Text>
            <View style={styles.summaryValues}>
              <Text style={[styles.summaryOld, { color: colors.textSecondary }]} numberOfLines={1}>
                {String(c.currentValue ?? 'empty')}
              </Text>
              <Icon name="arrow-forward" size={12} color={meta.color} />
              <Text style={[styles.summaryNew, { color: meta.color }]} numberOfLines={1}>
                {String(c.proposedValue)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  // ─── Success screen ───────────────────────────────────────────────────────
  if (step === 'preview' && submittedId !== null) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <UniversalHeader title="Correction Submitted" onBack={() => navigation.goBack()} />
        <Animated.View
          style={[
            styles.successContainer,
            {
              opacity: successAnim,
              transform: [{ scale: successAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }],
            },
          ]}>
          <View style={[styles.successIcon, { backgroundColor: '#10B981' + '22' }]}>
            <Icon name="checkmark-circle" size={64} color="#10B981" />
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>Thank You!</Text>
          <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>
            Your correction for{' '}
            <Text style={{ color: colors.text, fontFamily: TYPOGRAPHY.fontFamily.semibold }}>
              {entityData?.displayName || initialEntityName}
            </Text>{' '}
            has been submitted for admin review.
          </Text>
          <View style={[styles.successCard, { backgroundColor: colors.card }]}>
            <View style={styles.successRow}>
              <Icon name="hourglass-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.successRowText, { color: colors.textSecondary }]}>
                Status: <Text style={{ color: '#F59E0B' }}>Pending Review</Text>
              </Text>
            </View>
            <View style={styles.successRow}>
              <Icon name="shield-checkmark-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.successRowText, { color: colors.textSecondary }]}>
                Admin will review and apply changes to the main database
              </Text>
            </View>
            <View style={styles.successRow}>
              <Icon name="notifications-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.successRowText, { color: colors.textSecondary }]}>
                You'll see updates reflected once approved
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: meta.color }]}
            onPress={() => navigation.goBack()}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <UniversalHeader
        title={`Fix ${meta.label} Data`}
        onBack={() => navigation.goBack()}
        rightContent={
          hasChanges ? (
            <TouchableOpacity
              onPress={() => setStep(step === 'edit' ? 'reason' : 'edit')}
              style={[styles.headerBadge, { backgroundColor: meta.color }]}>
              <Text style={styles.headerBadgeText}>{computedChanges.length} changed</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={meta.color} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading current data…
            </Text>
          </View>
        ) : (
          <>
            {/* Step tabs */}
            <View style={[styles.stepBar, { backgroundColor: isDark ? colors.card : '#F9FAFB', borderBottomColor: isDark ? '#2C2C2E' : '#E5E7EB' }]}>
              {(['edit', 'reason'] as const).map((s, i) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => { if (s === 'reason' && !hasChanges) { return; } setStep(s); }}
                  style={[
                    styles.stepTab,
                    { opacity: s === 'reason' && !hasChanges ? 0.4 : 1 },
                  ]}>
                  <View style={[
                    styles.stepDot,
                    { backgroundColor: step === s ? meta.color : isDark ? '#3A3A3C' : '#D1D5DB' },
                  ]}>
                    <Text style={[styles.stepDotText, { color: step === s ? '#FFF' : colors.textSecondary }]}>
                      {i + 1}
                    </Text>
                  </View>
                  <Text style={[
                    styles.stepLabel,
                    { color: step === s ? meta.color : colors.textSecondary },
                  ]}>
                    {s === 'edit' ? 'Edit Fields' : 'Add Reason'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled">

              {/* Entity info banner */}
              <View style={[styles.entityBanner, { backgroundColor: meta.color + '18', borderColor: meta.color + '33' }]}>
                <View style={[styles.entityIconCircle, { backgroundColor: meta.color }]}>
                  <Icon name={meta.icon} size={20} color="#FFF" />
                </View>
                <View style={styles.entityInfo}>
                  <Text style={[styles.entityName, { color: colors.text }]}>
                    {entityData?.displayName || initialEntityName || entityId}
                  </Text>
                  <Text style={[styles.entityType, { color: colors.textSecondary }]}>
                    {meta.label} · Tap any field to correct it
                  </Text>
                </View>
              </View>

              {step === 'edit' && (
                <>
                  {/* Fields list */}
                  {fieldDefs.map((field: FieldDefinition) => renderFieldCard(field))}

                  {/* Change summary */}
                  {renderChangeSummary()}

                  {/* Next step button */}
                  {hasChanges && (
                    <TouchableOpacity
                      style={[styles.nextBtn, { backgroundColor: meta.color }]}
                      onPress={() => setStep('reason')}>
                      <Text style={styles.nextBtnText}>Add Reason & Submit</Text>
                      <Icon name="arrow-forward" size={18} color="#FFF" />
                    </TouchableOpacity>
                  )}

                  {/* No-changes hint */}
                  {!hasChanges && !loading && (
                    <View style={[styles.hintBox, { backgroundColor: isDark ? '#1C1C1E' : '#F3F4F6' }]}>
                      <Icon name="information-circle-outline" size={20} color={colors.textSecondary} />
                      <Text style={[styles.hintBoxText, { color: colors.textSecondary }]}>
                        Tap the Edit button next to any field to correct its value. Only changed fields will be submitted.
                      </Text>
                    </View>
                  )}
                </>
              )}

              {step === 'reason' && (
                <>
                  {/* Re-show summary */}
                  {renderChangeSummary()}

                  {/* Reason input */}
                  <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      Why is this correction needed? *
                    </Text>
                    <TextInput
                      style={[
                        styles.textArea,
                        {
                          color: colors.text,
                          backgroundColor: isDark ? '#1C1C1E' : '#F9FAFB',
                          borderColor: reason.trim() ? meta.color : isDark ? '#3A3A3C' : '#D1D5DB',
                          marginTop: 8,
                        },
                      ]}
                      value={reason}
                      onChangeText={setReason}
                      placeholder="e.g. The official website shows a different deadline, or the fee has changed on the university portal."
                      placeholderTextColor={colors.textSecondary}
                      multiline
                      numberOfLines={4}
                      maxLength={600}
                    />
                    <Text style={[styles.charCount, { color: colors.textSecondary }]}>
                      {reason.length}/600
                    </Text>
                  </View>

                  {/* Source proof */}
                  <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      Source / Reference (optional)
                    </Text>
                    <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                      Link to official announcement, website, or describe where you verified this information.
                    </Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          color: colors.text,
                          backgroundColor: isDark ? '#1C1C1E' : '#F9FAFB',
                          borderColor: isDark ? '#3A3A3C' : '#D1D5DB',
                          marginTop: 8,
                        },
                      ]}
                      value={sourceProof}
                      onChangeText={setSourceProof}
                      placeholder="https://university.edu.pk/admissions or 'I saw this on PEC notice board'"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="url"
                      autoCapitalize="none"
                    />
                  </View>

                  {/* Auth notice for guests */}
                  {!isAuthenticated && (
                    <View style={[styles.authNotice, { backgroundColor: '#F59E0B' + '18', borderColor: '#F59E0B44' }]}>
                      <Icon name="warning-outline" size={18} color="#F59E0B" />
                      <Text style={[styles.authNoticeText, { color: colors.textSecondary }]}>
                        You need to be signed in to submit corrections. This helps admin verify the source.
                      </Text>
                    </View>
                  )}

                  {/* Submit button */}
                  <TouchableOpacity
                    style={[
                      styles.submitBtn,
                      {
                        backgroundColor: (!hasChanges || !reason.trim() || submitting) ? colors.textSecondary : meta.color,
                        opacity: (!hasChanges || !reason.trim() || submitting) ? 0.5 : 1,
                      },
                    ]}
                    onPress={handleSubmit}
                    disabled={!hasChanges || !reason.trim() || submitting}>
                    {submitting ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <>
                        <Icon name="send" size={18} color="#FFF" />
                        <Text style={styles.submitBtnText}>Submit for Admin Review</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <View style={[styles.disclaimerBox, { backgroundColor: isDark ? '#1C1C1E' : '#F3F4F6' }]}>
                    <Icon name="shield-checkmark-outline" size={16} color={colors.textSecondary} />
                    <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
                      Your correction will be reviewed by an admin before being applied to the database. Only verified, accurate data will be approved.
                    </Text>
                  </View>
                </>
              )}

              <View style={{ height: 40 }} />
            </ScrollView>
          </>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { fontSize: 14, fontFamily: TYPOGRAPHY.fontFamily.regular },

  stepBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 20,
  },
  stepTab: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepDot: {
    width: 24, height: 24, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  stepDotText: { fontSize: 12, fontFamily: TYPOGRAPHY.fontFamily.bold },
  stepLabel: { fontSize: 13, fontFamily: TYPOGRAPHY.fontFamily.medium },

  scrollContent: { padding: 16, gap: 12 },

  entityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    gap: 12,
    marginBottom: 4,
  },
  entityIconCircle: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  entityInfo: { flex: 1 },
  entityName: { fontSize: 15, fontFamily: TYPOGRAPHY.fontFamily.semibold },
  entityType: { fontSize: 12, fontFamily: TYPOGRAPHY.fontFamily.regular, marginTop: 2 },

  fieldCard: {
    borderRadius: RADIUS.lg,
    padding: 14,
    borderWidth: 1,
    gap: 6,
  },
  fieldHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fieldLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  changedDot: { width: 8, height: 8, borderRadius: 4 },
  fieldLabel: { fontSize: 13, fontFamily: TYPOGRAPHY.fontFamily.semibold },
  requiredBadge: { fontSize: 10, fontFamily: TYPOGRAPHY.fontFamily.medium },

  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  editBtnText: { fontSize: 12, fontFamily: TYPOGRAPHY.fontFamily.medium },

  currentValueBox: { paddingVertical: 4 },
  currentValueText: { fontSize: 14, fontFamily: TYPOGRAPHY.fontFamily.regular, lineHeight: 20 },
  changedOverlay: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 6,
    paddingTop: 6, borderTopWidth: 1, borderTopColor: '#E5E7EB',
  },
  proposedText: { fontSize: 13, fontFamily: TYPOGRAPHY.fontFamily.medium, flex: 1 },

  editContainer: { gap: 8 },
  textInput: {
    borderWidth: 1.5, borderRadius: RADIUS.md,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  textArea: {
    borderWidth: 1.5, borderRadius: RADIUS.md,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, fontFamily: TYPOGRAPHY.fontFamily.regular,
    minHeight: 80, textAlignVertical: 'top',
  },
  hintText: { fontSize: 11, fontFamily: TYPOGRAPHY.fontFamily.regular },

  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1,
  },
  optionChipText: { fontSize: 13, fontFamily: TYPOGRAPHY.fontFamily.medium },

  editActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  actionBtn: {
    paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: RADIUS.md, borderWidth: 1.5,
  },

  summaryBox: {
    borderRadius: RADIUS.lg, borderWidth: 1,
    padding: 14, gap: 8,
  },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  summaryTitle: { fontSize: 13, fontFamily: TYPOGRAPHY.fontFamily.semibold },
  summaryRow: { gap: 2 },
  summaryFieldName: { fontSize: 11, fontFamily: TYPOGRAPHY.fontFamily.medium },
  summaryValues: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  summaryOld: { fontSize: 12, fontFamily: TYPOGRAPHY.fontFamily.regular, flex: 1 },
  summaryNew: { fontSize: 12, fontFamily: TYPOGRAPHY.fontFamily.semibold, flex: 1 },

  sectionCard: {
    borderRadius: RADIUS.lg, padding: 14, gap: 4,
  },
  sectionTitle: { fontSize: 14, fontFamily: TYPOGRAPHY.fontFamily.semibold },
  sectionSubtitle: { fontSize: 12, fontFamily: TYPOGRAPHY.fontFamily.regular },
  charCount: { fontSize: 11, fontFamily: TYPOGRAPHY.fontFamily.regular, textAlign: 'right' },

  authNotice: {
    flexDirection: 'row', gap: 10, padding: 12,
    borderRadius: RADIUS.lg, borderWidth: 1, alignItems: 'flex-start',
  },
  authNoticeText: { flex: 1, fontSize: 12, fontFamily: TYPOGRAPHY.fontFamily.regular, lineHeight: 18 },

  hintBox: {
    flexDirection: 'row', gap: 10, padding: 14,
    borderRadius: RADIUS.lg, alignItems: 'flex-start',
  },
  hintBoxText: { flex: 1, fontSize: 13, fontFamily: TYPOGRAPHY.fontFamily.regular, lineHeight: 20 },

  nextBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: RADIUS.lg,
    marginTop: 8,
  },
  nextBtnText: { fontSize: 15, fontFamily: TYPOGRAPHY.fontFamily.semibold, color: '#FFF' },

  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: RADIUS.lg,
    marginTop: 8,
  },
  submitBtnText: { fontSize: 15, fontFamily: TYPOGRAPHY.fontFamily.semibold, color: '#FFF' },

  disclaimerBox: {
    flexDirection: 'row', gap: 10, padding: 12,
    borderRadius: RADIUS.lg, alignItems: 'flex-start',
    marginTop: 8,
  },
  disclaimerText: { flex: 1, fontSize: 11, fontFamily: TYPOGRAPHY.fontFamily.regular, lineHeight: 17 },

  headerBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  headerBadgeText: { fontSize: 12, fontFamily: TYPOGRAPHY.fontFamily.bold, color: '#FFF' },

  // Success
  successContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    padding: 24, gap: 20,
  },
  successIcon: {
    width: 100, height: 100, borderRadius: 50,
    justifyContent: 'center', alignItems: 'center',
  },
  successTitle: { fontSize: 26, fontFamily: TYPOGRAPHY.fontFamily.bold },
  successSubtitle: { fontSize: 14, fontFamily: TYPOGRAPHY.fontFamily.regular, textAlign: 'center', lineHeight: 22 },
  successCard: {
    width: '100%', borderRadius: RADIUS.xl, padding: 16, gap: 12,
  },
  successRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  successRowText: { flex: 1, fontSize: 13, fontFamily: TYPOGRAPHY.fontFamily.regular, lineHeight: 20 },
  doneBtn: {
    width: '100%', paddingVertical: 14, borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  doneBtnText: { fontSize: 15, fontFamily: TYPOGRAPHY.fontFamily.semibold, color: '#FFF' },
});

export default DataCorrectionScreen;

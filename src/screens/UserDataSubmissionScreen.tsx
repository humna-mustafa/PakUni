/**
 * User Data Submission Screen
 * Allows users to submit corrections or updates to data they find wrong
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {UniversalHeader} from '../components';
import {AnimatedTypeCard, SUBMISSION_TYPES, PRIORITY_OPTIONS, STATUS_COLORS} from '../components/data-submission';
import {useDataSubmissionScreen} from '../hooks/useDataSubmissionScreen';
import {DataSubmission} from '../services/dataSubmissions';
import {STATUS, SEMANTIC, DARK_BG, LIGHT_BG} from '../constants/brand';
import {PROVIDERS} from '../constants/brand';
import {TYPOGRAPHY} from '../constants/design';

export const UserDataSubmissionScreen: React.FC<{navigation: any; route?: any}> = ({navigation, route}) => {
  const {
    colors, isDark, user,
    activeTab, setActiveTab, loading, refreshing,
    submissionType, setSubmissionType, priority, setPriority,
    entityName, setEntityName, fieldName, setFieldName,
    currentValue, setCurrentValue, proposedValue, setProposedValue,
    changeReason, setChangeReason, sourceProof, setSourceProof,
    submissions, isSubmitting,
    headerSlideAnim, floatTranslateY, infoBoxAnim,
    onRefresh, handleSubmit,
  } = useDataSubmissionScreen(route);

  const renderTabs = () => (
    <View style={[styles.tabsContainer, {backgroundColor: isDark ? colors.card : LIGHT_BG.cardHover}]}>
      <TouchableOpacity
        style={[styles.tab, {backgroundColor: activeTab === 'submit' ? colors.primary : 'transparent'}]}
        onPress={() => setActiveTab('submit')}>
        <Icon name="create" size={18} color={activeTab === 'submit' ? colors.textOnPrimary : colors.textSecondary} />
        <Text style={[styles.tabText, {color: activeTab === 'submit' ? colors.textOnPrimary : colors.textSecondary}]}>
          Submit Correction
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, {backgroundColor: activeTab === 'history' ? colors.primary : 'transparent'}]}
        onPress={() => setActiveTab('history')}>
        <Icon name="time" size={18} color={activeTab === 'history' ? colors.textOnPrimary : colors.textSecondary} />
        <Text style={[styles.tabText, {color: activeTab === 'history' ? colors.textOnPrimary : colors.textSecondary}]}>
          My Submissions
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSubmitForm = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {user && (
        <View style={[styles.trustBadge, {backgroundColor: colors.card}]}>
          <View style={styles.trustBadgeLeft}>
            <Icon
              name={user.provider === 'google' ? 'logo-google' : user.provider === 'email' ? 'mail' : 'person-outline'}
              size={20}
              color={user.provider === 'google' ? PROVIDERS.google : user.provider === 'email' ? PROVIDERS.email : PROVIDERS.guest}
            />
            <View>
              <Text style={[styles.trustBadgeTitle, {color: colors.text}]}>
                Logged in via {user.provider === 'google' ? 'Google' : user.provider === 'email' ? 'Email' : 'Guest'}
              </Text>
              <Text style={[styles.trustBadgeSubtitle, {color: colors.textSecondary}]}>
                {user.provider === 'google'
                  ? '\uD83C\uDF1F Verified account - eligible for auto-approval'
                  : user.provider === 'email'
                    ? 'Verified email may qualify for faster review'
                    : 'Sign in with Google for faster approval'}
              </Text>
            </View>
          </View>
          {user.provider === 'google' && (
            <Icon name="checkmark-shield" size={24} color={SEMANTIC.success} />
          )}
        </View>
      )}

      <Animated.View
        style={[
          styles.infoBox,
          {backgroundColor: isDark ? DARK_BG.cardElevated : colors.primaryLight},
          {opacity: infoBoxAnim, transform: [{translateY: headerSlideAnim}]},
        ]}>
        <Animated.View style={{transform: [{translateY: floatTranslateY}]}}>
          <Icon name="information-circle" size={20} color={colors.primary} />
        </Animated.View>
        <Text style={[styles.infoText, {color: isDark ? colors.primaryLight : colors.primaryDark}]}>
          Found incorrect data? Help us improve by submitting a correction. Accurate information helps all students!
        </Text>
      </Animated.View>

      <Text style={[styles.sectionTitle, {color: colors.text}]}>What type of data?</Text>
      <View style={styles.typeGrid}>
        {SUBMISSION_TYPES.map((type, index) => (
          <AnimatedTypeCard
            key={type.value}
            index={index}
            onPress={() => setSubmissionType(type.value)}
            style={[
              styles.typeCard,
              {
                backgroundColor: submissionType === type.value ? colors.primary + '20' : colors.card,
                borderColor: submissionType === type.value ? colors.primary : 'transparent',
              },
            ]}>
            <View>
              <Icon
                name={type.icon as any}
                size={24}
                color={submissionType === type.value ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.typeLabel, {color: colors.text}]}>{type.label}</Text>
              <Text style={[styles.typeDescription, {color: colors.textSecondary}]}>{type.description}</Text>
            </View>
          </AnimatedTypeCard>
        ))}
      </View>

      {submissionType && (
        <>
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Priority Level</Text>
          <View style={styles.priorityRow}>
            {PRIORITY_OPTIONS.map(p => (
              <TouchableOpacity
                key={p.value}
                style={[
                  styles.priorityOption,
                  {
                    backgroundColor: priority === p.value ? p.color + '20' : isDark ? DARK_BG.cardElevated : LIGHT_BG.cardHover,
                    borderColor: priority === p.value ? p.color : 'transparent',
                  },
                ]}
                onPress={() => setPriority(p.value)}>
                <View style={[styles.priorityDot, {backgroundColor: p.color}]} />
                <Text style={[styles.priorityText, {color: colors.text}]}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionTitle, {color: colors.text}]}>Correction Details</Text>

          <Text style={[styles.inputLabel, {color: colors.text}]}>What are you updating? *</Text>
          <TextInput
            style={[styles.input, {backgroundColor: isDark ? DARK_BG.cardElevated : LIGHT_BG.cardHover, color: colors.text}]}
            value={entityName}
            onChangeText={setEntityName}
            placeholder="e.g., NUST, MDCAT, LUMS Scholarship..."
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={[styles.inputLabel, {color: colors.text}]}>Which field needs correction? *</Text>
          <TextInput
            style={[styles.input, {backgroundColor: isDark ? DARK_BG.cardElevated : LIGHT_BG.cardHover, color: colors.text}]}
            value={fieldName}
            onChangeText={setFieldName}
            placeholder="e.g., Closing Merit, Test Date, Fee Amount..."
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={[styles.inputLabel, {color: colors.text}]}>Current (wrong) value</Text>
          <TextInput
            style={[styles.input, {backgroundColor: isDark ? DARK_BG.cardElevated : LIGHT_BG.cardHover, color: colors.text}]}
            value={currentValue}
            onChangeText={setCurrentValue}
            placeholder="What the app currently shows..."
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={[styles.inputLabel, {color: colors.text}]}>Correct value *</Text>
          <TextInput
            style={[styles.input, {backgroundColor: isDark ? DARK_BG.cardElevated : LIGHT_BG.cardHover, color: colors.text}]}
            value={proposedValue}
            onChangeText={setProposedValue}
            placeholder="The accurate/updated value..."
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={[styles.inputLabel, {color: colors.text}]}>Why is this change needed? *</Text>
          <TextInput
            style={[styles.input, styles.multilineInput, {backgroundColor: isDark ? DARK_BG.cardElevated : LIGHT_BG.cardHover, color: colors.text}]}
            value={changeReason}
            onChangeText={setChangeReason}
            placeholder="Explain why the current data is wrong or outdated..."
            placeholderTextColor={colors.textSecondary}
            multiline
          />

          <Text style={[styles.inputLabel, {color: colors.text}]}>Source/Proof (optional but helps!)</Text>
          <TextInput
            style={[styles.input, {backgroundColor: isDark ? DARK_BG.cardElevated : LIGHT_BG.cardHover, color: colors.text}]}
            value={sourceProof}
            onChangeText={setSourceProof}
            placeholder="URL to official source or description of proof..."
            placeholderTextColor={colors.textSecondary}
          />

          <View style={[styles.tipBox, {backgroundColor: isDark ? DARK_BG.cardElevated : SEMANTIC.warningBg}]}>
            <Icon name="bulb" size={18} color={SEMANTIC.warning} />
            <Text style={[styles.tipText, {color: isDark ? SEMANTIC.warningLight : SEMANTIC.warningText}]}>
              {'\uD83D\uDCA1'} Tip: Submissions with source links are reviewed faster and more likely to be approved!
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, {backgroundColor: colors.primary, opacity: isSubmitting ? 0.7 : 1}]}
            onPress={handleSubmit}
            disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator size="small" color={colors.textOnPrimary} />
            ) : (
              <>
                <Icon name="send" size={20} color={colors.textOnPrimary} />
                <Text style={styles.submitBtnText}>Submit Correction</Text>
              </>
            )}
          </TouchableOpacity>
        </>
      )}
      <View style={{height: 40}} />
    </ScrollView>
  );

  const renderHistoryCard = (submission: DataSubmission) => {
    const statusStyle = STATUS_COLORS[submission.status] || STATUS_COLORS.pending;
    const typeInfo = SUBMISSION_TYPES.find(t => t.value === submission.type);

    return (
      <View key={submission.id} style={[styles.historyCard, {backgroundColor: colors.card}]}>
        <View style={styles.historyHeader}>
          <View style={styles.historyTitleRow}>
            <Icon name={(typeInfo?.icon as any) || 'document'} size={18} color={colors.primary} />
            <Text style={[styles.historyTitle, {color: colors.text}]} numberOfLines={1}>
              {submission.entity_name}
            </Text>
          </View>
          <View style={[styles.statusBadge, {backgroundColor: statusStyle.bg}]}>
            <Text style={[styles.statusText, {color: statusStyle.text}]}>
              {submission.status.replace('_', ' ')}
            </Text>
          </View>
        </View>
        <Text style={[styles.historyField, {color: colors.textSecondary}]}>{submission.field_name}</Text>
        <View style={styles.changeRow}>
          <Text style={[styles.oldValue, {color: SEMANTIC.error}]} numberOfLines={1}>
            {String(submission.current_value)}
          </Text>
          <Icon name="arrow-forward" size={14} color={colors.textSecondary} />
          <Text style={[styles.newValue, {color: SEMANTIC.success}]} numberOfLines={1}>
            {String(submission.proposed_value)}
          </Text>
        </View>
        {submission.status === 'rejected' && submission.rejection_reason && (
          <View style={[styles.rejectionBox, {backgroundColor: SEMANTIC.errorBg}]}>
            <Icon name="close-circle" size={14} color={SEMANTIC.error} />
            <Text style={styles.rejectionText}>{submission.rejection_reason}</Text>
          </View>
        )}
        {submission.auto_approved && (
          <View style={[styles.autoApprovedBox, {backgroundColor: STATUS.auto_approved.bg}]}>
            <Icon name="flash" size={14} color={STATUS.auto_approved.text} />
            <Text style={styles.autoApprovedText}>
              Auto-approved{submission.user_auth_provider === 'google' ? ' (Google user)' : ''}
            </Text>
          </View>
        )}
        <Text style={[styles.historyDate, {color: colors.textSecondary}]}>
          {new Date(submission.created_at).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </Text>
      </View>
    );
  };

  const renderHistory = () => (
    <ScrollView style={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : submissions.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="document-text-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, {color: colors.text}]}>No Submissions Yet</Text>
          <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
            Found wrong data? Submit a correction to help improve the app!
          </Text>
          <TouchableOpacity style={[styles.emptyBtn, {backgroundColor: colors.primary}]} onPress={() => setActiveTab('submit')}>
            <Icon name="create" size={20} color={colors.textOnPrimary} />
            <Text style={styles.emptyBtnText}>Submit First Correction</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={[styles.statsSummary, {backgroundColor: isDark ? colors.card : LIGHT_BG.cardHover}]}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, {color: colors.text}]}>{submissions.length}</Text>
              <Text style={[styles.summaryLabel, {color: colors.textSecondary}]}>Total</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, {color: SEMANTIC.warning}]}>
                {submissions.filter(s => s.status === 'pending').length}
              </Text>
              <Text style={[styles.summaryLabel, {color: colors.textSecondary}]}>Pending</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, {color: SEMANTIC.success}]}>
                {submissions.filter(s => s.status === 'approved' || s.status === 'auto_approved').length}
              </Text>
              <Text style={[styles.summaryLabel, {color: colors.textSecondary}]}>Approved</Text>
            </View>
          </View>
          {submissions.map(renderHistoryCard)}
        </>
      )}
    </ScrollView>
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <UniversalHeader title="Submit Data Correction" showBack onBack={() => navigation.goBack()} />
      {renderTabs()}
      {activeTab === 'submit' ? renderSubmitForm() : renderHistory()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  content: {flex: 1, padding: 16},
  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 64},
  tabsContainer: {flexDirection: 'row', marginHorizontal: 16, marginTop: 12, borderRadius: 12, padding: 4},
  tab: {flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10},
  tabText: {fontSize: 13, fontWeight: TYPOGRAPHY.weight.semibold},
  infoBox: {flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 12, borderRadius: 12, marginBottom: 16},
  infoText: {flex: 1, fontSize: 13, lineHeight: 20},
  trustBadge: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 12, marginBottom: 12},
  trustBadgeLeft: {flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1},
  trustBadgeTitle: {fontSize: 14, fontWeight: TYPOGRAPHY.weight.semibold},
  trustBadgeSubtitle: {fontSize: 11, marginTop: 2},
  sectionTitle: {fontSize: 16, fontWeight: TYPOGRAPHY.weight.bold, marginBottom: 12, marginTop: 8},
  typeGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8},
  typeCard: {width: '48%', padding: 12, borderRadius: 12, borderWidth: 2, alignItems: 'center', gap: 4},
  typeLabel: {fontSize: 13, fontWeight: TYPOGRAPHY.weight.semibold, textAlign: 'center'},
  typeDescription: {fontSize: 10, textAlign: 'center'},
  priorityRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16},
  priorityOption: {flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 2},
  priorityDot: {width: 8, height: 8, borderRadius: 4},
  priorityText: {fontSize: 12, fontWeight: TYPOGRAPHY.weight.medium},
  inputLabel: {fontSize: 14, fontWeight: TYPOGRAPHY.weight.semibold, marginBottom: 6, marginTop: 12},
  input: {borderRadius: 10, padding: 12, fontSize: 14},
  multilineInput: {minHeight: 80, textAlignVertical: 'top'},
  tipBox: {flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: 10, marginTop: 16},
  tipText: {flex: 1, fontSize: 12, lineHeight: 18},
  submitBtn: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 12, marginTop: 20},
  submitBtnText: {color: '#FFFFFF', fontSize: 16, fontWeight: TYPOGRAPHY.weight.bold},
  statsSummary: {flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 16, borderRadius: 12, marginBottom: 16},
  summaryItem: {alignItems: 'center'},
  summaryValue: {fontSize: 24, fontWeight: TYPOGRAPHY.weight.bold},
  summaryLabel: {fontSize: 12, marginTop: 2},
  historyCard: {borderRadius: 12, padding: 14, marginBottom: 10},
  historyHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6},
  historyTitleRow: {flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1},
  historyTitle: {fontSize: 15, fontWeight: TYPOGRAPHY.weight.semibold, flex: 1},
  statusBadge: {paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8},
  statusText: {fontSize: 11, fontWeight: TYPOGRAPHY.weight.semibold, textTransform: 'capitalize'},
  historyField: {fontSize: 12, marginBottom: 8},
  changeRow: {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8},
  oldValue: {fontSize: 13, textDecorationLine: 'line-through', flex: 1},
  newValue: {fontSize: 13, fontWeight: TYPOGRAPHY.weight.semibold, flex: 1},
  rejectionBox: {flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8, borderRadius: 6, marginBottom: 8},
  rejectionText: {flex: 1, fontSize: 11, color: '#991B1B'},
  autoApprovedBox: {flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8, borderRadius: 6, marginBottom: 8, alignSelf: 'flex-start'},
  autoApprovedText: {fontSize: 11, fontWeight: TYPOGRAPHY.weight.semibold, color: '#4573DF'},
  historyDate: {fontSize: 11},
  emptyState: {flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 64},
  emptyTitle: {fontSize: 18, fontWeight: TYPOGRAPHY.weight.bold, marginTop: 16},
  emptyText: {fontSize: 14, textAlign: 'center', marginTop: 8, paddingHorizontal: 32},
  emptyBtn: {flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 20},
  emptyBtnText: {color: '#FFFFFF', fontSize: 14, fontWeight: TYPOGRAPHY.weight.semibold},
});

export default UserDataSubmissionScreen;

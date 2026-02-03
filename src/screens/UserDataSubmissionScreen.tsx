/**
 * User Data Submission Screen
 * 
 * Allows users to submit corrections or updates to data they find wrong
 * Features:
 * - Submit corrections for various data types
 * - View submission history
 * - Track status of submissions
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Easing,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { UniversalHeader } from '../components';
import { 
  dataSubmissionsService, 
  DataSubmission,
  SubmissionType,
  SubmissionPriority,
} from '../services/dataSubmissions';
import { STATUS, PRIORITY, PROVIDERS, SEMANTIC, DARK_BG, LIGHT_BG } from '../constants/brand';

// Animated Type Card Component
const AnimatedTypeCard: React.FC<{
  children: React.ReactNode;
  index: number;
  style?: any;
  onPress?: () => void;
}> = ({children, index, style, onPress}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    const delay = index * 50;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{scale: scaleAnim}],
        },
      ]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

type TabType = 'submit' | 'history';

const SUBMISSION_TYPES: { value: SubmissionType; label: string; icon: string; description: string }[] = [
  { value: 'merit_update', label: 'Merit List', icon: 'trophy', description: 'Closing merit, cutoffs, etc.' },
  { value: 'date_correction', label: 'Deadline', icon: 'calendar', description: 'Application or fee deadlines' },
  { value: 'entry_test_update', label: 'Entry Test', icon: 'school', description: 'Test dates, registration, fees' },
  { value: 'university_info', label: 'University', icon: 'business', description: 'University information' },
  { value: 'scholarship_info', label: 'Scholarship', icon: 'cash', description: 'Scholarship details' },
  { value: 'program_info', label: 'Program', icon: 'book', description: 'Program details, eligibility' },
  { value: 'fee_update', label: 'Fee Structure', icon: 'card', description: 'Tuition, hostel, other fees' },
  { value: 'other', label: 'Other', icon: 'ellipsis-horizontal', description: 'Any other correction' },
];

const PRIORITY_OPTIONS: { value: SubmissionPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: PRIORITY.low.color },
  { value: 'medium', label: 'Medium', color: PRIORITY.medium.color },
  { value: 'high', label: 'High (Time Sensitive)', color: PRIORITY.high.color },
  { value: 'urgent', label: 'Urgent', color: PRIORITY.urgent.color },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: STATUS.pending.bg, text: STATUS.pending.text },
  under_review: { bg: STATUS.under_review.bg, text: STATUS.under_review.text },
  approved: { bg: STATUS.approved.bg, text: STATUS.approved.text },
  rejected: { bg: STATUS.rejected.bg, text: STATUS.rejected.text },
  auto_approved: { bg: STATUS.auto_approved.bg, text: STATUS.auto_approved.text },
};

export const UserDataSubmissionScreen: React.FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>(route?.params?.showHistory ? 'history' : 'submit');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Form state
  const [submissionType, setSubmissionType] = useState<SubmissionType | null>(null);
  const [priority, setPriority] = useState<SubmissionPriority>('medium');
  const [entityName, setEntityName] = useState('');
  const [fieldName, setFieldName] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [proposedValue, setProposedValue] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [sourceProof, setSourceProof] = useState('');
  
  // History
  const [submissions, setSubmissions] = useState<DataSubmission[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animation refs
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlideAnim = useRef(new Animated.Value(-20)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const infoBoxAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Header entrance animation
    Animated.parallel([
      Animated.timing(headerFadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(headerSlideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Info box animation
    Animated.timing(infoBoxAnim, {
      toValue: 1,
      duration: 500,
      delay: 200,
      useNativeDriver: true,
    }).start();

    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const floatTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  // Pre-fill from navigation params
  useEffect(() => {
    if (route?.params) {
      if (route.params.type) setSubmissionType(route.params.type);
      if (route.params.entityName) setEntityName(route.params.entityName);
      if (route.params.fieldName) setFieldName(route.params.fieldName);
      if (route.params.currentValue) setCurrentValue(route.params.currentValue);
    }
  }, [route?.params]);

  const loadHistory = useCallback(async () => {
    if (!user) return;
    try {
      const data = await dataSubmissionsService.getSubmissions({ user_id: user.id });
      setSubmissions(data);
    } catch (error) {
      console.error('Failed to load submissions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'history') {
      setLoading(true);
      loadHistory();
    }
  }, [activeTab, loadHistory]);

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const resetForm = () => {
    setSubmissionType(null);
    setPriority('medium');
    setEntityName('');
    setFieldName('');
    setCurrentValue('');
    setProposedValue('');
    setChangeReason('');
    setSourceProof('');
  };

  const handleSubmit = async () => {
    if (!submissionType) {
      Alert.alert('Error', 'Please select a submission type');
      return;
    }
    if (!entityName.trim()) {
      Alert.alert('Error', 'Please enter what you\'re updating (e.g., university name)');
      return;
    }
    if (!fieldName.trim()) {
      Alert.alert('Error', 'Please enter which field needs correction');
      return;
    }
    if (!proposedValue.trim()) {
      Alert.alert('Error', 'Please enter the correct value');
      return;
    }
    if (!changeReason.trim()) {
      Alert.alert('Error', 'Please explain why this change is needed');
      return;
    }
    
    if (!user) {
      Alert.alert('Error', 'You must be logged in to submit corrections');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const result = await dataSubmissionsService.submitDataCorrection({
        type: submissionType,
        priority,
        user_id: user.id,
        user_name: user.fullName || user.email || null,
        user_email: user.email || null,
        user_trust_level: 0, // Will be fetched from profile in real implementation
        user_auth_provider: user.provider || null, // Include auth provider for auto-approval rules
        entity_type: submissionType.replace('_update', '').replace('_correction', '').replace('_info', ''),
        entity_id: entityName.toLowerCase().replace(/\s+/g, '_'),
        entity_name: entityName,
        field_name: fieldName,
        current_value: currentValue || 'Not specified',
        proposed_value: proposedValue,
        change_reason: changeReason,
        source_proof: sourceProof || null,
      });
      
      if (result.success) {
        Alert.alert(
          result.autoApproved ? '✅ Auto-Approved!' : '✅ Submitted!',
          result.autoApproved 
            ? 'Your correction has been automatically approved and applied. Thank you for your contribution!'
            : 'Your correction has been submitted for review. We\'ll notify you once it\'s reviewed.',
          [{ text: 'OK', onPress: () => {
            resetForm();
            setActiveTab('history');
          }}]
        );
      } else {
        Alert.alert('Error', 'Failed to submit correction. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTabs = () => (
    <View style={[styles.tabsContainer, { backgroundColor: isDark ? colors.card : LIGHT_BG.cardHover }]}>
      <TouchableOpacity
        style={[styles.tab, { backgroundColor: activeTab === 'submit' ? colors.primary : 'transparent' }]}
        onPress={() => setActiveTab('submit')}
      >
        <Icon 
          name="create" 
          size={18} 
          color={activeTab === 'submit' ? colors.textOnPrimary : colors.textSecondary} 
        />
        <Text style={[styles.tabText, { color: activeTab === 'submit' ? colors.textOnPrimary : colors.textSecondary }]}>
          Submit Correction
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, { backgroundColor: activeTab === 'history' ? colors.primary : 'transparent' }]}
        onPress={() => setActiveTab('history')}
      >
        <Icon 
          name="time" 
          size={18} 
          color={activeTab === 'history' ? colors.textOnPrimary : colors.textSecondary} 
        />
        <Text style={[styles.tabText, { color: activeTab === 'history' ? colors.textOnPrimary : colors.textSecondary }]}>
          My Submissions
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSubmitForm = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* User Trust Badge */}
      {user && (
        <View style={[styles.trustBadge, { backgroundColor: colors.card }]}>
          <View style={styles.trustBadgeLeft}>
            <Icon 
              name={user.provider === 'google' ? 'logo-google' : user.provider === 'email' ? 'mail' : 'person-outline'} 
              size={20} 
              color={user.provider === 'google' ? PROVIDERS.google : user.provider === 'email' ? PROVIDERS.email : PROVIDERS.guest} 
            />
            <View>
              <Text style={[styles.trustBadgeTitle, { color: colors.text }]}>
                Logged in via {user.provider === 'google' ? 'Google' : user.provider === 'email' ? 'Email' : 'Guest'}
              </Text>
              <Text style={[styles.trustBadgeSubtitle, { color: colors.textSecondary }]}>
                {user.provider === 'google' 
                  ? '🌟 Verified account - eligible for auto-approval' 
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
          { backgroundColor: isDark ? DARK_BG.cardElevated : colors.primaryLight },
          { opacity: infoBoxAnim, transform: [{translateY: headerSlideAnim}] }
        ]}>
        <Animated.View style={{transform: [{translateY: floatTranslateY}]}}>
          <Icon name="information-circle" size={20} color={colors.primary} />
        </Animated.View>
        <Text style={[styles.infoText, { color: isDark ? colors.primaryLight : colors.primaryDark }]}>
          Found incorrect data? Help us improve by submitting a correction. 
          Accurate information helps all students!
        </Text>
      </Animated.View>
      
      <Text style={[styles.sectionTitle, { color: colors.text }]}>What type of data?</Text>
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
              }
            ]}
          >
            <View>
              <Icon 
                name={type.icon as any} 
                size={24} 
                color={submissionType === type.value ? colors.primary : colors.textSecondary} 
              />
              <Text style={[styles.typeLabel, { color: colors.text }]}>{type.label}</Text>
              <Text style={[styles.typeDescription, { color: colors.textSecondary }]}>{type.description}</Text>
            </View>
          </AnimatedTypeCard>
        ))}
      </View>
      
      {submissionType && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Priority Level</Text>
          <View style={styles.priorityRow}>
            {PRIORITY_OPTIONS.map(p => (
              <TouchableOpacity
                key={p.value}
                style={[
                  styles.priorityOption,
                  {
                    backgroundColor: priority === p.value ? p.color + '20' : isDark ? DARK_BG.cardElevated : LIGHT_BG.cardHover,
                    borderColor: priority === p.value ? p.color : 'transparent',
                  }
                ]}
                onPress={() => setPriority(p.value)}
              >
                <View style={[styles.priorityDot, { backgroundColor: p.color }]} />
                <Text style={[styles.priorityText, { color: colors.text }]}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Correction Details</Text>
          
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            What are you updating? *
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? DARK_BG.cardElevated : LIGHT_BG.cardHover, color: colors.text }]}
            value={entityName}
            onChangeText={setEntityName}
            placeholder="e.g., NUST, MDCAT, LUMS Scholarship..."
            placeholderTextColor={colors.textSecondary}
          />
          
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            Which field needs correction? *
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? DARK_BG.cardElevated : LIGHT_BG.cardHover, color: colors.text }]}
            value={fieldName}
            onChangeText={setFieldName}
            placeholder="e.g., Closing Merit, Test Date, Fee Amount..."
            placeholderTextColor={colors.textSecondary}
          />
          
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            Current (wrong) value
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? DARK_BG.cardElevated : LIGHT_BG.cardHover, color: colors.text }]}
            value={currentValue}
            onChangeText={setCurrentValue}
            placeholder="What the app currently shows..."
            placeholderTextColor={colors.textSecondary}
          />
          
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            Correct value *
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? DARK_BG.cardElevated : LIGHT_BG.cardHover, color: colors.text }]}
            value={proposedValue}
            onChangeText={setProposedValue}
            placeholder="The accurate/updated value..."
            placeholderTextColor={colors.textSecondary}
          />
          
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            Why is this change needed? *
          </Text>
          <TextInput
            style={[styles.input, styles.multilineInput, { backgroundColor: isDark ? DARK_BG.cardElevated : LIGHT_BG.cardHover, color: colors.text }]}
            value={changeReason}
            onChangeText={setChangeReason}
            placeholder="Explain why the current data is wrong or outdated..."
            placeholderTextColor={colors.textSecondary}
            multiline
          />
          
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            Source/Proof (optional but helps!)
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? DARK_BG.cardElevated : LIGHT_BG.cardHover, color: colors.text }]}
            value={sourceProof}
            onChangeText={setSourceProof}
            placeholder="URL to official source or description of proof..."
            placeholderTextColor={colors.textSecondary}
          />
          
          <View style={[styles.tipBox, { backgroundColor: isDark ? DARK_BG.cardElevated : SEMANTIC.warningBg }]}>
            <Icon name="bulb" size={18} color={SEMANTIC.warning} />
            <Text style={[styles.tipText, { color: isDark ? SEMANTIC.warningLight : SEMANTIC.warningText }]}>
              💡 Tip: Submissions with source links are reviewed faster and more likely to be approved!
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: isSubmitting ? 0.7 : 1 }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
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
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );

  const renderHistoryCard = (submission: DataSubmission) => {
    const statusStyle = STATUS_COLORS[submission.status] || STATUS_COLORS.pending;
    const typeInfo = SUBMISSION_TYPES.find(t => t.value === submission.type);
    
    return (
      <View key={submission.id} style={[styles.historyCard, { backgroundColor: colors.card }]}>
        <View style={styles.historyHeader}>
          <View style={styles.historyTitleRow}>
            <Icon name={typeInfo?.icon as any || 'document'} size={18} color={colors.primary} />
            <Text style={[styles.historyTitle, { color: colors.text }]} numberOfLines={1}>
              {submission.entity_name}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {submission.status.replace('_', ' ')}
            </Text>
          </View>
        </View>
        
        <Text style={[styles.historyField, { color: colors.textSecondary }]}>
          {submission.field_name}
        </Text>
        
        <View style={styles.changeRow}>
          <Text style={[styles.oldValue, { color: SEMANTIC.error }]} numberOfLines={1}>
            {String(submission.current_value)}
          </Text>
          <Icon name="arrow-forward" size={14} color={colors.textSecondary} />
          <Text style={[styles.newValue, { color: SEMANTIC.success }]} numberOfLines={1}>
            {String(submission.proposed_value)}
          </Text>
        </View>
        
        {submission.status === 'rejected' && submission.rejection_reason && (
          <View style={[styles.rejectionBox, { backgroundColor: SEMANTIC.errorBg }]}>
            <Icon name="close-circle" size={14} color={SEMANTIC.error} />
            <Text style={styles.rejectionText}>{submission.rejection_reason}</Text>
          </View>
        )}
        
        {submission.auto_approved && (
          <View style={[styles.autoApprovedBox, { backgroundColor: STATUS.auto_approved.bg }]}>
            <Icon name="flash" size={14} color={STATUS.auto_approved.text} />
            <Text style={styles.autoApprovedText}>
              Auto-approved{submission.user_auth_provider === 'google' ? ' (Google user)' : ''}
            </Text>
          </View>
        )}
        
        <Text style={[styles.historyDate, { color: colors.textSecondary }]}>
          {new Date(submission.created_at).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
          })}
        </Text>
      </View>
    );
  };

  const renderHistory = () => (
    <ScrollView
      style={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : submissions.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="document-text-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Submissions Yet</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Found wrong data? Submit a correction to help improve the app!
          </Text>
          <TouchableOpacity
            style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
            onPress={() => setActiveTab('submit')}
          >
            <Icon name="create" size={20} color={colors.textOnPrimary} />
            <Text style={styles.emptyBtnText}>Submit First Correction</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={[styles.statsSummary, { backgroundColor: isDark ? colors.card : LIGHT_BG.cardHover }]}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{submissions.length}</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: SEMANTIC.warning }]}>
                {submissions.filter(s => s.status === 'pending').length}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Pending</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: SEMANTIC.success }]}>
                {submissions.filter(s => s.status === 'approved' || s.status === 'auto_approved').length}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Approved</Text>
            </View>
          </View>
          {submissions.map(renderHistoryCard)}
        </>
      )}
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <UniversalHeader
        title="Submit Data Correction"
        showBack
        onBack={() => navigation.goBack()}
      />
      
      {renderTabs()}
      
      {activeTab === 'submit' ? renderSubmitForm() : renderHistory()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  trustBadgeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  trustBadgeTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  trustBadgeSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 8,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  typeCard: {
    width: '48%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    gap: 4,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  typeDescription: {
    fontSize: 10,
    textAlign: 'center',
  },
  priorityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  priorityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  statsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  historyCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  historyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  historyField: {
    fontSize: 12,
    marginBottom: 8,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  oldValue: {
    fontSize: 13,
    textDecorationLine: 'line-through',
    flex: 1,
  },
  newValue: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  rejectionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  rejectionText: {
    flex: 1,
    fontSize: 11,
    color: '#991B1B',
  },
  autoApprovedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  autoApprovedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4573DF',
  },
  historyDate: {
    fontSize: 11,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default UserDataSubmissionScreen;



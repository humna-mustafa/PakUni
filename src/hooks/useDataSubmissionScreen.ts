/**
 * useDataSubmissionScreen - State, animations, and handlers for UserDataSubmissionScreen
 */

import {useState, useEffect, useCallback, useRef} from 'react';
import {Alert, Animated, Easing} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import {useAuth} from '../contexts/AuthContext';
import {
  dataSubmissionsService,
  DataSubmission,
  SubmissionType,
  SubmissionPriority,
} from '../services/dataSubmissions';
import type {TabType} from '../components/data-submission/data';

export const useDataSubmissionScreen = (route?: any) => {
  const {colors, isDark} = useTheme();
  const {user} = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>(
    route?.params?.showHistory ? 'history' : 'submit',
  );
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
    Animated.parallel([
      Animated.timing(headerFadeAnim, {toValue: 1, duration: 400, useNativeDriver: true}),
      Animated.spring(headerSlideAnim, {toValue: 0, tension: 50, friction: 8, useNativeDriver: true}),
    ]).start();

    Animated.timing(infoBoxAnim, {toValue: 1, duration: 500, delay: 200, useNativeDriver: true}).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {toValue: 1, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true}),
        Animated.timing(floatAnim, {toValue: 0, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true}),
      ]),
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
      const data = await dataSubmissionsService.getSubmissions({user_id: user.id});
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
      Alert.alert('Error', "Please enter what you're updating (e.g., university name)");
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
        user_trust_level: 0,
        user_auth_provider: user.provider || null,
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
          result.autoApproved ? '\u2705 Auto-Approved!' : '\u2705 Submitted!',
          result.autoApproved
            ? 'Your correction has been automatically approved and applied. Thank you for your contribution!'
            : "Your correction has been submitted for review. We'll notify you once it's reviewed.",
          [{text: 'OK', onPress: () => { resetForm(); setActiveTab('history'); }}],
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

  return {
    colors,
    isDark,
    user,
    activeTab,
    setActiveTab,
    loading,
    refreshing,
    // Form state
    submissionType,
    setSubmissionType,
    priority,
    setPriority,
    entityName,
    setEntityName,
    fieldName,
    setFieldName,
    currentValue,
    setCurrentValue,
    proposedValue,
    setProposedValue,
    changeReason,
    setChangeReason,
    sourceProof,
    setSourceProof,
    submissions,
    isSubmitting,
    // Animations
    headerSlideAnim,
    floatTranslateY,
    infoBoxAnim,
    // Handlers
    onRefresh,
    handleSubmit,
  };
};

/**
 * useContactSupportScreen - All state, handlers, and submit logic for Contact Support.
 */

import {useState, useRef, useEffect} from 'react';
import {Alert, Platform, Animated, Linking} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../contexts/ThemeContext';
import {useAuth} from '../contexts/AuthContext';
import {logger} from '../utils/logger';
import {supabase} from '../services/supabase';

// ============================================================================
// TYPES
// ============================================================================

export type FeedbackType =
  | 'bug_report'
  | 'feature_request'
  | 'content_update'
  | 'material_submission'
  | 'general_feedback'
  | 'complaint';

export type BugSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ContentType = 'university' | 'scholarship' | 'program' | 'deadline' | 'merit_list' | 'other';
export type MaterialType = 'merit_list' | 'past_paper' | 'study_guide' | 'admission_guide' | 'scholarship_info' | 'other';

export interface FeedbackOption {
  id: FeedbackType;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  gradient: string[];
}

export interface FormData {
  type: FeedbackType;
  title: string;
  description: string;
  email: string;
  severity?: BugSeverity;
  contentType?: ContentType;
  materialType?: MaterialType;
  universityName?: string;
  scholarshipName?: string;
  materialUrl?: string;
  rating?: number;
  wouldRecommend?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const FEEDBACK_OPTIONS: FeedbackOption[] = [
  {id: 'bug_report', title: 'Report an Issue', subtitle: 'Found a bug or something not working?', icon: 'bug-outline', color: '#EF4444', gradient: ['#EF4444', '#DC2626']},
  {id: 'feature_request', title: 'Suggest a Feature', subtitle: 'Have an idea to improve the app?', icon: 'bulb-outline', color: '#F59E0B', gradient: ['#F59E0B', '#D97706']},
  {id: 'content_update', title: 'Request Content Update', subtitle: 'University, scholarship, or deadline info incorrect?', icon: 'refresh-outline', color: '#4573DF', gradient: ['#4573DF', '#3660C9']},
  {id: 'material_submission', title: 'Submit Material/Resource', subtitle: 'Share merit lists, past papers, guides', icon: 'document-attach-outline', color: '#10B981', gradient: ['#10B981', '#059669']},
  {id: 'general_feedback', title: 'General Feedback', subtitle: 'Tell us what you think about the app', icon: 'chatbubble-outline', color: '#4573DF', gradient: ['#4573DF', '#3660C9']},
  {id: 'complaint', title: 'File a Complaint', subtitle: 'Something seriously wrong? Let us know', icon: 'warning-outline', color: '#6B7280', gradient: ['#6B7280', '#4B5563']},
];

export const BUG_SEVERITY_OPTIONS: {value: BugSeverity; label: string; color: string; description: string}[] = [
  {value: 'low', label: 'Low', color: '#10B981', description: 'Minor issue, app works fine'},
  {value: 'medium', label: 'Medium', color: '#F59E0B', description: 'Noticeable issue but manageable'},
  {value: 'high', label: 'High', color: '#F97316', description: 'Significant problem affecting usage'},
  {value: 'critical', label: 'Critical', color: '#EF4444', description: 'App crashes or data loss'},
];

export const CONTENT_TYPE_OPTIONS: {value: ContentType; label: string; icon: string}[] = [
  {value: 'university', label: 'University Info', icon: 'school-outline'},
  {value: 'scholarship', label: 'Scholarship Details', icon: 'wallet-outline'},
  {value: 'program', label: 'Program/Course', icon: 'library-outline'},
  {value: 'deadline', label: 'Admission Deadline', icon: 'calendar-outline'},
  {value: 'merit_list', label: 'Merit List', icon: 'list-outline'},
  {value: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline'},
];

export const MATERIAL_TYPE_OPTIONS: {value: MaterialType; label: string; icon: string; description: string}[] = [
  {value: 'merit_list', label: 'Merit List', icon: 'list-outline', description: 'Past or current merit lists'},
  {value: 'past_paper', label: 'Past Paper', icon: 'document-text-outline', description: 'Entry test past papers'},
  {value: 'study_guide', label: 'Study Guide', icon: 'book-outline', description: 'Preparation materials'},
  {value: 'admission_guide', label: 'Admission Guide', icon: 'school-outline', description: 'Application tips & guides'},
  {value: 'scholarship_info', label: 'Scholarship Info', icon: 'wallet-outline', description: 'New scholarship details'},
  {value: 'other', label: 'Other Resource', icon: 'folder-outline', description: 'Other helpful material'},
];

export const QUICK_HELP_ITEMS = [
  {id: '1', title: 'How to calculate merit?', icon: 'calculator-outline', screen: 'Calculator'},
  {id: '2', title: 'University rankings explained', icon: 'trophy-outline', screen: 'UniversityRankingsInfo'},
  {id: '3', title: 'Scholarship eligibility', icon: 'checkmark-circle-outline', screen: 'ScholarshipEligibility'},
  {id: '4', title: 'Entry test preparation', icon: 'book-outline', screen: 'EntryTests'},
];

// ============================================================================
// HOOK
// ============================================================================

export const useContactSupportScreen = () => {
  const navigation = useNavigation();
  const {colors, isDark} = useTheme();
  const {user} = useAuth();

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState<FeedbackOption | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    type: 'general_feedback',
    title: '',
    description: '',
    email: user?.email || '',
    rating: 0,
    wouldRecommend: undefined,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {toValue: 1, duration: 500, useNativeDriver: true}),
      Animated.timing(slideAnim, {toValue: 0, duration: 500, useNativeDriver: true}),
    ]).start();
  }, []);

  const handleSelectOption = (option: FeedbackOption) => {
    setSelectedOption(option);
    setFormData({
      type: option.id,
      title: '',
      description: '',
      email: user?.email || '',
      rating: option.id === 'general_feedback' ? 0 : undefined,
      severity: option.id === 'bug_report' ? 'medium' : undefined,
      contentType: option.id === 'content_update' ? 'university' : undefined,
      materialType: option.id === 'material_submission' ? 'merit_list' : undefined,
    });
    setShowFeedbackModal(true);
  };

  const buildMessage = (data: FormData): string => {
    let message = data.description;
    if (data.type === 'bug_report' && data.severity) {
      message = `[Severity: ${data.severity.toUpperCase()}]\n\n${message}`;
    }
    if (data.type === 'content_update') {
      message = `[Content Type: ${data.contentType}]\n`;
      if (data.universityName) message += `University: ${data.universityName}\n`;
      if (data.scholarshipName) message += `Scholarship: ${data.scholarshipName}\n`;
      message += `\n${data.description}`;
    }
    if (data.type === 'material_submission') {
      message = `[Material Type: ${data.materialType}]\n`;
      if (data.materialUrl) message += `URL/Link: ${data.materialUrl}\n`;
      message += `\n${data.description}`;
    }
    if (data.rating !== undefined && data.rating > 0) {
      message += `\n\n[Rating: ${data.rating}/5 stars]`;
    }
    if (data.wouldRecommend !== undefined) {
      message += `\n[Would Recommend: ${data.wouldRecommend ? 'Yes' : 'No'}]`;
    }
    return message;
  };

  const mapFeedbackType = (type: FeedbackType): string => {
    const mapping: Record<FeedbackType, string> = {
      bug_report: 'bug', feature_request: 'feature_request', content_update: 'content_error',
      material_submission: 'general', general_feedback: 'general', complaint: 'complaint',
    };
    return mapping[type] || 'general';
  };

  const mapToCategory = (type: FeedbackType): string => {
    const mapping: Record<FeedbackType, string> = {
      bug_report: 'bug', feature_request: 'feature', content_update: 'content',
      material_submission: 'content', general_feedback: 'other', complaint: 'other',
    };
    return mapping[type] || 'other';
  };

  const getTitleFromType = (type: FeedbackType): string => {
    const titles: Record<FeedbackType, string> = {
      bug_report: 'Bug Report', feature_request: 'Feature Request', content_update: 'Content Update Request',
      material_submission: 'Material Submission', general_feedback: 'General Feedback', complaint: 'Complaint',
    };
    return titles[type];
  };

  const handleSubmit = async () => {
    if (!formData.description.trim()) {
      Alert.alert('Required', 'Please provide a description');
      return;
    }
    if (formData.type === 'bug_report' && !formData.title.trim()) {
      Alert.alert('Required', 'Please provide a title for the issue');
      return;
    }
    if (formData.type === 'material_submission' && !formData.materialUrl?.trim() && !formData.description.trim()) {
      Alert.alert('Required', 'Please provide the material link or detailed description');
      return;
    }
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        Alert.alert('Invalid Email', 'Please enter a valid email address');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const messageDetails = buildMessage(formData);
      const fullMessage = `${messageDetails}\n\n---\nAdditional Details:\n- Feedback Type: ${formData.type}\n- Severity: ${formData.severity || 'N/A'}\n- Content Type: ${formData.contentType || 'N/A'}\n- Material Type: ${formData.materialType || 'N/A'}\n- University: ${formData.universityName || 'N/A'}\n- Scholarship: ${formData.scholarshipName || 'N/A'}\n- Material URL: ${formData.materialUrl || 'N/A'}\n- Would Recommend: ${formData.wouldRecommend !== undefined ? (formData.wouldRecommend ? 'Yes' : 'No') : 'N/A'}\n- Device: ${Platform.OS}\n- Submitted: ${new Date().toISOString()}`;

      const feedbackData = {
        user_id: user?.id || null,
        type: mapFeedbackType(formData.type),
        category: mapToCategory(formData.type),
        title: formData.title || getTitleFromType(formData.type),
        message: fullMessage,
        contact_email: formData.email?.trim() || null,
        rating: formData.rating && formData.rating >= 1 ? formData.rating : null,
        status: 'new',
      };

      const {error} = await supabase.from('user_feedback').insert([feedbackData]);
      if (error) {
        logger.error('Supabase insert error', error, 'ContactSupport');
        throw error;
      }

      setIsSubmitting(false);
      setShowFeedbackModal(false);
      setShowSuccessModal(true);
      setFormData({type: 'general_feedback', title: '', description: '', email: user?.email || '', rating: 0});
    } catch (error) {
      logger.error('Error submitting feedback', error, 'ContactSupport');
      setIsSubmitting(false);
      Alert.alert('Submission Failed', 'We couldn\'t submit your feedback. Please check your internet connection and try again.', [{text: 'OK'}]);
    }
  };

  const handleRateApp = () => {
    const storeUrl = Platform.select({
      ios: 'https://apps.apple.com/app/pakuni',
      android: 'https://play.google.com/store/apps/details?id=com.pakuni',
    });
    if (storeUrl) {
      Linking.openURL(storeUrl).catch(() => Alert.alert('Error', 'Could not open the app store'));
    }
  };

  const handleEmailSupport = () => {
    const generalFeedback = FEEDBACK_OPTIONS.find(opt => opt.id === 'general_feedback');
    if (generalFeedback) {
      setSelectedOption(generalFeedback);
      setFormData({type: 'general_feedback', title: '', description: '', email: user?.email || '', rating: 0, wouldRecommend: undefined});
    }
    setShowFeedbackModal(true);
  };

  const handleQuickHelp = (screen: string) => {
    if (screen === 'UniversityRankingsInfo') {
      Alert.alert(
        '📊 University Rankings Explained',
        'HEC Pakistan categorizes universities into categories:\n\n⭐ W4 (General Category)\nMeets basic HEC standards for degree programs.\n\n⭐ W3 (Professional Category)\nMeets standards for professional programs (Engineering, Medical, etc.)\n\n🏆 National Ranking\nBased on research output, faculty qualifications, and facilities.\n\n🌍 QS World Ranking\nInternational ranking by Quacquarelli Symonds.\n\nTip: Rankings are just one factor. Consider location, programs, campus culture, and fee structure too!',
        [{text: 'Got it!', style: 'default'}],
      );
    } else if (screen === 'ScholarshipEligibility') {
      Alert.alert(
        '📋 Scholarship Eligibility Guide',
        'Common eligibility requirements for Pakistani scholarships:\n\n📚 Academic Requirements:\n• Minimum 60-80% marks (varies by scholarship)\n• HEC-recognized degree/institution\n• Specific GPA requirements for graduate programs\n\n💰 Financial Criteria:\n• Family income below threshold (need-based)\n• Income certificate from relevant authority\n\n📄 Common Documents:\n• CNIC/B-Form\n• Academic transcripts\n• Income certificate\n• Domicile certificate\n\n🎯 Tip: Apply early and check deadlines! Each scholarship has different requirements.',
        [
          {text: 'View Scholarships', onPress: () => navigation.navigate('MainTabs' as never, {screen: 'Scholarships'})},
          {text: 'OK', style: 'cancel'},
        ],
      );
    } else {
      navigation.navigate(screen as never);
    }
  };

  return {
    navigation, colors, isDark,
    showFeedbackModal, setShowFeedbackModal,
    selectedOption,
    isSubmitting,
    showSuccessModal, setShowSuccessModal,
    formData, setFormData,
    fadeAnim, slideAnim,
    handleSelectOption, handleSubmit, handleRateApp, handleEmailSupport, handleQuickHelp,
  };
};

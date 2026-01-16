/**
 * ContactSupportScreen - Comprehensive User Feedback & Support Center
 * 
 * Features:
 * - Report Issues (Bug reports with severity)
 * - Suggestions & Feature Requests
 * - Content Update Requests (university info, scholarships, deadlines)
 * - Resource/Material Submission (merit lists, past papers, guides)
 * - General Feedback with ratings
 * - App rating prompt
 * - FAQ quick links
 */

import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  StatusBar,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Linking,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../contexts/ThemeContext';
import {useAuth} from '../contexts/AuthContext';
import {Icon} from '../components/icons';
import {supabase} from '../services/supabase';

// Fallback LinearGradient
let LinearGradient: React.ComponentType<any>;
try {
  LinearGradient = require('react-native-linear-gradient').default;
} catch (e) {
  LinearGradient = ({children, colors, style, ...props}: any) => (
    <View style={[style, {backgroundColor: colors?.[0] || '#0EA5E9'}]} {...props}>
      {children}
    </View>
  );
}

const {width} = Dimensions.get('window');

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type FeedbackType = 
  | 'bug_report' 
  | 'feature_request' 
  | 'content_update' 
  | 'material_submission' 
  | 'general_feedback'
  | 'complaint';

type BugSeverity = 'low' | 'medium' | 'high' | 'critical';
type ContentType = 'university' | 'scholarship' | 'program' | 'deadline' | 'merit_list' | 'other';
type MaterialType = 'merit_list' | 'past_paper' | 'study_guide' | 'admission_guide' | 'scholarship_info' | 'other';

interface FeedbackOption {
  id: FeedbackType;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  gradient: string[];
}

interface FormData {
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

const FEEDBACK_OPTIONS: FeedbackOption[] = [
  {
    id: 'bug_report',
    title: 'Report an Issue',
    subtitle: 'Found a bug or something not working?',
    icon: 'bug-outline',
    color: '#EF4444',
    gradient: ['#EF4444', '#DC2626'],
  },
  {
    id: 'feature_request',
    title: 'Suggest a Feature',
    subtitle: 'Have an idea to improve the app?',
    icon: 'bulb-outline',
    color: '#F59E0B',
    gradient: ['#F59E0B', '#D97706'],
  },
  {
    id: 'content_update',
    title: 'Request Content Update',
    subtitle: 'University, scholarship, or deadline info incorrect?',
    icon: 'refresh-outline',
    color: '#3B82F6',
    gradient: ['#3B82F6', '#2563EB'],
  },
  {
    id: 'material_submission',
    title: 'Submit Material/Resource',
    subtitle: 'Share merit lists, past papers, guides',
    icon: 'document-attach-outline',
    color: '#10B981',
    gradient: ['#10B981', '#059669'],
  },
  {
    id: 'general_feedback',
    title: 'General Feedback',
    subtitle: 'Tell us what you think about the app',
    icon: 'chatbubble-outline',
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#7C3AED'],
  },
  {
    id: 'complaint',
    title: 'File a Complaint',
    subtitle: 'Something seriously wrong? Let us know',
    icon: 'warning-outline',
    color: '#6B7280',
    gradient: ['#6B7280', '#4B5563'],
  },
];

const BUG_SEVERITY_OPTIONS: {value: BugSeverity; label: string; color: string; description: string}[] = [
  {value: 'low', label: 'Low', color: '#10B981', description: 'Minor issue, app works fine'},
  {value: 'medium', label: 'Medium', color: '#F59E0B', description: 'Noticeable issue but manageable'},
  {value: 'high', label: 'High', color: '#F97316', description: 'Significant problem affecting usage'},
  {value: 'critical', label: 'Critical', color: '#EF4444', description: 'App crashes or data loss'},
];

const CONTENT_TYPE_OPTIONS: {value: ContentType; label: string; icon: string}[] = [
  {value: 'university', label: 'University Info', icon: 'school-outline'},
  {value: 'scholarship', label: 'Scholarship Details', icon: 'wallet-outline'},
  {value: 'program', label: 'Program/Course', icon: 'library-outline'},
  {value: 'deadline', label: 'Admission Deadline', icon: 'calendar-outline'},
  {value: 'merit_list', label: 'Merit List', icon: 'list-outline'},
  {value: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline'},
];

const MATERIAL_TYPE_OPTIONS: {value: MaterialType; label: string; icon: string; description: string}[] = [
  {value: 'merit_list', label: 'Merit List', icon: 'list-outline', description: 'Past or current merit lists'},
  {value: 'past_paper', label: 'Past Paper', icon: 'document-text-outline', description: 'Entry test past papers'},
  {value: 'study_guide', label: 'Study Guide', icon: 'book-outline', description: 'Preparation materials'},
  {value: 'admission_guide', label: 'Admission Guide', icon: 'school-outline', description: 'Application tips & guides'},
  {value: 'scholarship_info', label: 'Scholarship Info', icon: 'wallet-outline', description: 'New scholarship details'},
  {value: 'other', label: 'Other Resource', icon: 'folder-outline', description: 'Other helpful material'},
];

const QUICK_HELP_ITEMS = [
  {id: '1', title: 'How to calculate merit?', icon: 'calculator-outline'},
  {id: '2', title: 'University rankings explained', icon: 'trophy-outline'},
  {id: '3', title: 'Scholarship eligibility', icon: 'checkmark-circle-outline'},
  {id: '4', title: 'Entry test preparation', icon: 'book-outline'},
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ContactSupportScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors, isDark} = useTheme();
  const {user, isGuest} = useAuth();

  // State
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

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // -------------------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------------------

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

  const handleSubmit = async () => {
    // Validation
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

    setIsSubmitting(true);

    try {
      // Prepare the feedback data
      const feedbackData = {
        user_id: user?.id || null,
        type: mapFeedbackType(formData.type),
        category: mapToCategory(formData.type),
        title: formData.title || getTitleFromType(formData.type),
        message: buildMessage(formData),
        contact_email: formData.email || null,
        rating: formData.rating || null,
        status: 'new',
        metadata: {
          feedbackType: formData.type,
          severity: formData.severity,
          contentType: formData.contentType,
          materialType: formData.materialType,
          universityName: formData.universityName,
          scholarshipName: formData.scholarshipName,
          materialUrl: formData.materialUrl,
          wouldRecommend: formData.wouldRecommend,
          deviceInfo: Platform.OS,
          appVersion: '1.0.0',
          submittedAt: new Date().toISOString(),
        },
      };

      // Submit to Supabase
      const {error} = await supabase
        .from('user_feedback')
        .insert([feedbackData]);

      if (error) throw error;

      setIsSubmitting(false);
      setShowFeedbackModal(false);
      setShowSuccessModal(true);

      // Reset form
      setFormData({
        type: 'general_feedback',
        title: '',
        description: '',
        email: user?.email || '',
        rating: 0,
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setIsSubmitting(false);
      Alert.alert(
        'Submission Failed',
        'We couldn\'t submit your feedback. Please check your internet connection and try again.',
        [{text: 'OK'}]
      );
    }
  };

  const mapFeedbackType = (type: FeedbackType): string => {
    const mapping: Record<FeedbackType, string> = {
      bug_report: 'bug',
      feature_request: 'feature_request',
      content_update: 'content_error',
      material_submission: 'general',
      general_feedback: 'general',
      complaint: 'complaint',
    };
    return mapping[type] || 'general';
  };

  const mapToCategory = (type: FeedbackType): string => {
    const mapping: Record<FeedbackType, string> = {
      bug_report: 'bug',
      feature_request: 'feature',
      content_update: 'content',
      material_submission: 'content',
      general_feedback: 'other',
      complaint: 'other',
    };
    return mapping[type] || 'other';
  };

  const getTitleFromType = (type: FeedbackType): string => {
    const titles: Record<FeedbackType, string> = {
      bug_report: 'Bug Report',
      feature_request: 'Feature Request',
      content_update: 'Content Update Request',
      material_submission: 'Material Submission',
      general_feedback: 'General Feedback',
      complaint: 'Complaint',
    };
    return titles[type];
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

  const handleRateApp = () => {
    const storeUrl = Platform.select({
      ios: 'https://apps.apple.com/app/pakuni',
      android: 'https://play.google.com/store/apps/details?id=com.pakuni',
    });
    if (storeUrl) {
      Linking.openURL(storeUrl).catch(() => {
        Alert.alert('Error', 'Could not open the app store');
      });
    }
  };

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@pakuni.app?subject=PakUni Support Request');
  };

  // -------------------------------------------------------------------------
  // RENDER FUNCTIONS
  // -------------------------------------------------------------------------

  const renderStarRating = () => {
    return (
      <View style={styles.starContainer}>
        <Text style={[styles.ratingLabel, {color: colors.text}]}>How would you rate your experience?</Text>
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
  };

  const renderBugSeverity = () => {
    return (
      <View style={styles.optionGroup}>
        <Text style={[styles.optionLabel, {color: colors.text}]}>How serious is this issue?</Text>
        <View style={styles.severityGrid}>
          {BUG_SEVERITY_OPTIONS.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.severityOption,
                {backgroundColor: colors.card, borderColor: colors.border},
                formData.severity === option.value && {
                  backgroundColor: option.color + '20',
                  borderColor: option.color,
                },
              ]}
              onPress={() => setFormData({...formData, severity: option.value})}>
              <View style={[styles.severityDot, {backgroundColor: option.color}]} />
              <View style={styles.severityContent}>
                <Text style={[
                  styles.severityLabel,
                  {color: formData.severity === option.value ? option.color : colors.text},
                ]}>
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
  };

  const renderContentTypeSelector = () => {
    return (
      <View style={styles.optionGroup}>
        <Text style={[styles.optionLabel, {color: colors.text}]}>What type of content needs updating?</Text>
        <View style={styles.contentTypeGrid}>
          {CONTENT_TYPE_OPTIONS.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.contentTypeOption,
                {backgroundColor: colors.card, borderColor: colors.border},
                formData.contentType === option.value && {
                  backgroundColor: colors.primaryLight,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => setFormData({...formData, contentType: option.value})}>
              <Icon
                name={option.icon}
                family="Ionicons"
                size={20}
                color={formData.contentType === option.value ? colors.primary : colors.textSecondary}
              />
              <Text style={[
                styles.contentTypeLabel,
                {color: formData.contentType === option.value ? colors.primary : colors.text},
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Specific name input */}
        {formData.contentType === 'university' && (
          <TextInput
            style={[styles.textInput, {backgroundColor: colors.background, color: colors.text}]}
            placeholder="University name (optional)"
            placeholderTextColor={colors.placeholder}
            value={formData.universityName}
            onChangeText={text => setFormData({...formData, universityName: text})}
          />
        )}
        {formData.contentType === 'scholarship' && (
          <TextInput
            style={[styles.textInput, {backgroundColor: colors.background, color: colors.text}]}
            placeholder="Scholarship name (optional)"
            placeholderTextColor={colors.placeholder}
            value={formData.scholarshipName}
            onChangeText={text => setFormData({...formData, scholarshipName: text})}
          />
        )}
      </View>
    );
  };

  const renderMaterialTypeSelector = () => {
    return (
      <View style={styles.optionGroup}>
        <Text style={[styles.optionLabel, {color: colors.text}]}>What type of material are you sharing?</Text>
        <View style={styles.materialTypeList}>
          {MATERIAL_TYPE_OPTIONS.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.materialTypeOption,
                {backgroundColor: colors.card, borderColor: colors.border},
                formData.materialType === option.value && {
                  backgroundColor: colors.primaryLight,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => setFormData({...formData, materialType: option.value})}>
              <View style={[
                styles.materialIconBg,
                {backgroundColor: formData.materialType === option.value ? colors.primary + '20' : colors.background},
              ]}>
                <Icon
                  name={option.icon}
                  family="Ionicons"
                  size={22}
                  color={formData.materialType === option.value ? colors.primary : colors.textSecondary}
                />
              </View>
              <View style={styles.materialContent}>
                <Text style={[
                  styles.materialLabel,
                  {color: formData.materialType === option.value ? colors.primary : colors.text},
                ]}>
                  {option.label}
                </Text>
                <Text style={[styles.materialDesc, {color: colors.textSecondary}]}>
                  {option.description}
                </Text>
              </View>
              {formData.materialType === option.value && (
                <Icon name="checkmark-circle" family="Ionicons" size={22} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Material URL input */}
        <TextInput
          style={[styles.textInput, {backgroundColor: colors.background, color: colors.text}]}
          placeholder="Link to material (Google Drive, Dropbox, etc.)"
          placeholderTextColor={colors.placeholder}
          value={formData.materialUrl}
          onChangeText={text => setFormData({...formData, materialUrl: text})}
          autoCapitalize="none"
          keyboardType="url"
        />
        <Text style={[styles.inputHint, {color: colors.textSecondary}]}>
          💡 You can also describe the material in the description box if you don't have a link
        </Text>
      </View>
    );
  };

  const renderRecommendQuestion = () => {
    return (
      <View style={styles.recommendContainer}>
        <Text style={[styles.recommendLabel, {color: colors.text}]}>
          Would you recommend PakUni to others?
        </Text>
        <View style={styles.recommendButtons}>
          <TouchableOpacity
            style={[
              styles.recommendBtn,
              {backgroundColor: colors.card, borderColor: colors.border},
              formData.wouldRecommend === true && {
                backgroundColor: '#10B98120',
                borderColor: '#10B981',
              },
            ]}
            onPress={() => setFormData({...formData, wouldRecommend: true})}>
            <Icon
              name="thumbs-up"
              family="Ionicons"
              size={24}
              color={formData.wouldRecommend === true ? '#10B981' : colors.textSecondary}
            />
            <Text style={[
              styles.recommendBtnText,
              {color: formData.wouldRecommend === true ? '#10B981' : colors.text},
            ]}>
              Yes!
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.recommendBtn,
              {backgroundColor: colors.card, borderColor: colors.border},
              formData.wouldRecommend === false && {
                backgroundColor: '#EF444420',
                borderColor: '#EF4444',
              },
            ]}
            onPress={() => setFormData({...formData, wouldRecommend: false})}>
            <Icon
              name="thumbs-down"
              family="Ionicons"
              size={24}
              color={formData.wouldRecommend === false ? '#EF4444' : colors.textSecondary}
            />
            <Text style={[
              styles.recommendBtnText,
              {color: formData.wouldRecommend === false ? '#EF4444' : colors.text},
            ]}>
              Not Yet
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFeedbackForm = () => {
    if (!selectedOption) return null;

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <ScrollView 
          style={styles.formScroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Type-specific fields */}
          {selectedOption.id === 'bug_report' && renderBugSeverity()}
          {selectedOption.id === 'content_update' && renderContentTypeSelector()}
          {selectedOption.id === 'material_submission' && renderMaterialTypeSelector()}
          {selectedOption.id === 'general_feedback' && renderStarRating()}

          {/* Title (for bug reports) */}
          {selectedOption.id === 'bug_report' && (
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, {color: colors.text}]}>Issue Title *</Text>
              <TextInput
                style={[styles.textInput, {backgroundColor: colors.background, color: colors.text}]}
                placeholder="Brief description of the issue"
                placeholderTextColor={colors.placeholder}
                value={formData.title}
                onChangeText={text => setFormData({...formData, title: text})}
                maxLength={100}
              />
            </View>
          )}

          {/* Main description */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, {color: colors.text}]}>
              {selectedOption.id === 'bug_report' ? 'Steps to Reproduce *' :
               selectedOption.id === 'feature_request' ? 'Describe Your Idea *' :
               selectedOption.id === 'content_update' ? 'What needs to be updated? *' :
               selectedOption.id === 'material_submission' ? 'Material Details *' :
               'Your Feedback *'}
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {backgroundColor: colors.background, color: colors.text},
              ]}
              placeholder={
                selectedOption.id === 'bug_report' 
                  ? '1. What were you doing?\n2. What happened?\n3. What did you expect to happen?' 
                  : selectedOption.id === 'feature_request'
                  ? 'Describe your feature idea and how it would help students...'
                  : selectedOption.id === 'material_submission'
                  ? 'Describe the material you\'re sharing (university, year, subject, etc.)...'
                  : 'Share your thoughts...'
              }
              placeholderTextColor={colors.placeholder}
              value={formData.description}
              onChangeText={text => setFormData({...formData, description: text})}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          {/* Contact email */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, {color: colors.text}]}>
              Contact Email {selectedOption.id === 'bug_report' ? '(for follow-up)' : '(optional)'}
            </Text>
            <TextInput
              style={[styles.textInput, {backgroundColor: colors.background, color: colors.text}]}
              placeholder="your@email.com"
              placeholderTextColor={colors.placeholder}
              value={formData.email}
              onChangeText={text => setFormData({...formData, email: text})}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Would recommend question for general feedback */}
          {selectedOption.id === 'general_feedback' && renderRecommendQuestion()}

          {/* Submit button */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && {opacity: 0.7}]}
            onPress={handleSubmit}
            disabled={isSubmitting}>
            <LinearGradient
              colors={selectedOption.gradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.submitGradient}>
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="send" family="Ionicons" size={20} color="#FFFFFF" />
                  <Text style={styles.submitText}>Submit</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={{height: 40}} />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  };

  // -------------------------------------------------------------------------
  // MAIN RENDER
  // -------------------------------------------------------------------------

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <LinearGradient
          colors={isDark ? ['#1E3A5F', '#1E1E2E'] : ['#0EA5E9', '#0284C7']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" family="Ionicons" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Help & Support</Text>
            <Text style={styles.headerSubtitle}>We're here to help you succeed</Text>
          </View>
          <TouchableOpacity style={styles.headerAction} onPress={handleEmailSupport}>
            <Icon name="mail-outline" family="Ionicons" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          
          {/* Quick Stats - Show what we need */}
          <Animated.View 
            style={[
              styles.statsCard,
              {backgroundColor: colors.card, opacity: fadeAnim, transform: [{translateY: slideAnim}]},
            ]}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, {backgroundColor: '#3B82F620'}]}>
                  <Icon name="school" family="Ionicons" size={20} color="#3B82F6" />
                </View>
                <Text style={[styles.statValue, {color: colors.text}]}>200+</Text>
                <Text style={[styles.statLabel, {color: colors.textSecondary}]}>Universities</Text>
              </View>
              <View style={[styles.statDivider, {backgroundColor: colors.border}]} />
              <View style={styles.statItem}>
                <View style={[styles.statIcon, {backgroundColor: '#10B98120'}]}>
                  <Icon name="wallet" family="Ionicons" size={20} color="#10B981" />
                </View>
                <Text style={[styles.statValue, {color: colors.text}]}>500+</Text>
                <Text style={[styles.statLabel, {color: colors.textSecondary}]}>Scholarships</Text>
              </View>
              <View style={[styles.statDivider, {backgroundColor: colors.border}]} />
              <View style={styles.statItem}>
                <View style={[styles.statIcon, {backgroundColor: '#F59E0B20'}]}>
                  <Icon name="people" family="Ionicons" size={20} color="#F59E0B" />
                </View>
                <Text style={[styles.statValue, {color: colors.text}]}>10K+</Text>
                <Text style={[styles.statLabel, {color: colors.textSecondary}]}>Students</Text>
              </View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6}}>
              <Text style={[styles.statsHint, {color: colors.textSecondary}]}>
                Help us grow by sharing info you have!
              </Text>
              <Icon name="rocket-outline" family="Ionicons" size={16} color={colors.textSecondary} />
            </View>
          </Animated.View>

          {/* Feedback Options */}
          <View style={styles.sectionHeader}>
            <Icon name="chatbubbles-outline" family="Ionicons" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, {color: colors.text}]}>How can we help?</Text>
          </View>

          <View style={styles.optionsGrid}>
            {FEEDBACK_OPTIONS.map((option, index) => (
              <Animated.View
                key={option.id}
                style={{
                  opacity: fadeAnim,
                  transform: [{
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 50],
                      outputRange: [0, 50 + index * 10],
                    }),
                  }],
                }}>
                <TouchableOpacity
                  style={[styles.optionCard, {backgroundColor: colors.card}]}
                  onPress={() => handleSelectOption(option)}
                  activeOpacity={0.8}>
                  <LinearGradient
                    colors={option.gradient}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={styles.optionIconBg}>
                    <Icon name={option.icon} family="Ionicons" size={24} color="#FFFFFF" />
                  </LinearGradient>
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionTitle, {color: colors.text}]}>{option.title}</Text>
                    <Text style={[styles.optionSubtitle, {color: colors.textSecondary}]}>
                      {option.subtitle}
                    </Text>
                  </View>
                  <Icon name="chevron-forward" family="Ionicons" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          {/* Rate App Section */}
          <TouchableOpacity
            style={[styles.rateCard, {backgroundColor: colors.card}]}
            onPress={handleRateApp}
            activeOpacity={0.8}>
            <LinearGradient
              colors={['#F59E0B', '#D97706']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.rateCardGradient}>
              <View style={styles.rateContent}>
                <Text style={styles.rateTitle}>Enjoying PakUni? ⭐</Text>
                <Text style={styles.rateSubtitle}>Rate us on the App Store to help other students find us!</Text>
              </View>
              <Icon name="star" family="Ionicons" size={32} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Quick Help Links */}
          <View style={styles.sectionHeader}>
            <Icon name="help-circle-outline" family="Ionicons" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, {color: colors.text}]}>Quick Help</Text>
          </View>

          <View style={[styles.quickHelpCard, {backgroundColor: colors.card}]}>
            {QUICK_HELP_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.quickHelpItem,
                  index < QUICK_HELP_ITEMS.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                ]}
                onPress={() => navigation.navigate('Guides' as never)}>
                <Icon name={item.icon} family="Ionicons" size={20} color={colors.primary} />
                <Text style={[styles.quickHelpText, {color: colors.text}]}>{item.title}</Text>
                <Icon name="chevron-forward" family="Ionicons" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Contact Info */}
          <View style={[styles.contactCard, {backgroundColor: colors.card}]}>
            <Text style={[styles.contactTitle, {color: colors.text}]}>Still need help?</Text>
            <Text style={[styles.contactText, {color: colors.textSecondary}]}>
              Reach out to us directly and we'll get back to you within 24 hours
            </Text>
            <View style={styles.contactMethods}>
              <TouchableOpacity
                style={[styles.contactMethod, {backgroundColor: colors.background}]}
                onPress={handleEmailSupport}>
                <Icon name="mail-outline" family="Ionicons" size={22} color={colors.primary} />
                <Text style={[styles.contactMethodText, {color: colors.text}]}>support@pakuni.app</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.contactMethod, {backgroundColor: colors.background}]}
                onPress={() => Linking.openURL('https://facebook.com/pakuniapp')}>
                <Icon name="logo-facebook" family="Ionicons" size={22} color="#1877F2" />
                <Text style={[styles.contactMethodText, {color: colors.text}]}>Facebook Page</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{height: 100}} />
        </ScrollView>

        {/* Feedback Modal */}
        <Modal
          visible={showFeedbackModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowFeedbackModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, {backgroundColor: colors.card}]}>
              <View style={[styles.modalHandle, {backgroundColor: colors.border}]} />
              
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                {selectedOption && (
                  <View style={[styles.modalIconBg, {backgroundColor: selectedOption.color + '20'}]}>
                    <Icon name={selectedOption.icon} family="Ionicons" size={24} color={selectedOption.color} />
                  </View>
                )}
                <View style={styles.modalHeaderText}>
                  <Text style={[styles.modalTitle, {color: colors.text}]}>
                    {selectedOption?.title}
                  </Text>
                  <Text style={[styles.modalSubtitle, {color: colors.textSecondary}]}>
                    {selectedOption?.subtitle}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.modalClose}
                  onPress={() => setShowFeedbackModal(false)}>
                  <Icon name="close" family="Ionicons" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {renderFeedbackForm()}
            </View>
          </View>
        </Modal>

        {/* Success Modal */}
        <Modal
          visible={showSuccessModal}
          animationType="fade"
          transparent
          onRequestClose={() => setShowSuccessModal(false)}>
          <View style={styles.successModalOverlay}>
            <View style={[styles.successModalContent, {backgroundColor: colors.card}]}>
              <View style={styles.successIconContainer}>
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.successIconBg}>
                  <Icon name="checkmark" family="Ionicons" size={48} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8}}>
                <Text style={[styles.successTitle, {color: colors.text}]}>Thank You!</Text>
                <Icon name="gift-outline" family="Ionicons" size={24} color="#10B981" />
              </View>
              <Text style={[styles.successText, {color: colors.textSecondary}]}>
                Your feedback has been submitted successfully. We appreciate your help in making PakUni better for everyone!
              </Text>
              <TouchableOpacity
                style={styles.successButton}
                onPress={() => setShowSuccessModal(false)}>
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.successButtonGradient}>
                  <Text style={styles.successButtonText}>Continue</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  statsCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 50,
  },
  statsHint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  optionsGrid: {
    gap: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
  },
  optionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContent: {
    flex: 1,
    marginLeft: 14,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  optionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  rateCard: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  rateCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  rateContent: {
    flex: 1,
  },
  rateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rateSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  quickHelpCard: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  quickHelpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  quickHelpText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  contactCard: {
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  contactText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  contactMethods: {
    gap: 10,
  },
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 10,
  },
  contactMethodText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    minHeight: '60%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  modalIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  modalClose: {
    padding: 4,
  },
  formScroll: {
    padding: 16,
  },
  optionGroup: {
    marginBottom: 20,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  severityGrid: {
    gap: 8,
  },
  severityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
  },
  severityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  severityContent: {
    flex: 1,
  },
  severityLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  severityDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  contentTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  contentTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  contentTypeLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  materialTypeList: {
    gap: 8,
    marginBottom: 12,
  },
  materialTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 12,
  },
  materialIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  materialContent: {
    flex: 1,
  },
  materialLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  materialDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
  },
  textArea: {
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  inputHint: {
    fontSize: 12,
    marginTop: 6,
    lineHeight: 16,
  },
  starContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingHint: {
    fontSize: 13,
    marginTop: 8,
  },
  recommendContainer: {
    marginVertical: 16,
  },
  recommendLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  recommendButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  recommendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  recommendBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  // Success modal
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successModalContent: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  successText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  successButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  successButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  successButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ContactSupportScreen;

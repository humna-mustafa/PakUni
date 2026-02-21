/**
 * Contact Support - Modal Components
 * Feedback form modal and success confirmation modal.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {TYPOGRAPHY} from '../../constants/design';
import {Icon} from '../icons';
import {
  StarRating,
  BugSeveritySelector,
  ContentTypeSelector,
  MaterialTypeSelector,
  RecommendQuestion,
} from './FeedbackFormFields';
import type {FeedbackOption, FormData} from '../../hooks/useContactSupportScreen';

// Fallback LinearGradient
let LinearGradient: React.ComponentType<any>;
try {
  LinearGradient = require('react-native-linear-gradient').default;
} catch (e) {
  LinearGradient = ({children, colors: c, style, ...props}: any) => (
    <View style={[style, {backgroundColor: c?.[0] || '#4573DF'}]} {...props}>{children}</View>
  );
}

// ============================================================================
// FEEDBACK FORM MODAL
// ============================================================================

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  selectedOption: FeedbackOption | null;
  formData: FormData;
  setFormData: (data: FormData) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
  colors: any;
  fallbackOptions: FeedbackOption[];
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible, onClose, selectedOption, formData, setFormData,
  isSubmitting, onSubmit, colors, fallbackOptions,
}) => {
  const option = selectedOption || fallbackOptions.find(opt => opt.id === 'general_feedback');
  if (!option) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, {backgroundColor: colors.card}]}>
          <View style={[styles.modalHandle, {backgroundColor: colors.border}]} />

          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={[styles.modalIconBg, {backgroundColor: (option.color || '#4573DF') + '20'}]}>
              <Icon name={option.icon || 'chatbubbles'} family="Ionicons" size={24} color={option.color || '#4573DF'} />
            </View>
            <View style={styles.modalHeaderText}>
              <Text style={[styles.modalTitle, {color: colors.text}]}>{option.title || 'Send Feedback'}</Text>
              <Text style={[styles.modalSubtitle, {color: colors.textSecondary}]}>{option.subtitle || 'Share your thoughts with us'}</Text>
            </View>
            <TouchableOpacity style={styles.modalClose} onPress={onClose}>
              <Icon name="close" family="Ionicons" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
            <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {option.id === 'bug_report' && <BugSeveritySelector formData={formData} setFormData={setFormData} colors={colors} />}
              {option.id === 'content_update' && <ContentTypeSelector formData={formData} setFormData={setFormData} colors={colors} />}
              {option.id === 'material_submission' && <MaterialTypeSelector formData={formData} setFormData={setFormData} colors={colors} />}
              {option.id === 'general_feedback' && <StarRating formData={formData} setFormData={setFormData} colors={colors} />}

              {option.id === 'bug_report' && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, {color: colors.text}]}>Issue Title *</Text>
                  <TextInput
                    style={[styles.textInput, {backgroundColor: colors.background, color: colors.text}]}
                    placeholder="Brief description of the issue" placeholderTextColor={colors.placeholder}
                    value={formData.title} onChangeText={text => setFormData({...formData, title: text})} maxLength={100} />
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, {color: colors.text}]}>
                  {option.id === 'bug_report' ? 'Steps to Reproduce *' :
                   option.id === 'feature_request' ? 'Describe Your Idea *' :
                   option.id === 'content_update' ? 'What needs to be updated? *' :
                   option.id === 'material_submission' ? 'Material Details *' : 'Your Feedback *'}
                </Text>
                <TextInput
                  style={[styles.textArea, {backgroundColor: colors.background, color: colors.text}]}
                  placeholder={
                    option.id === 'bug_report' ? '1. What were you doing?\n2. What happened?\n3. What did you expect to happen?'
                    : option.id === 'feature_request' ? 'Describe your feature idea and how it would help students...'
                    : option.id === 'material_submission' ? "Describe the material you're sharing (university, year, subject, etc.)..."
                    : 'Share your thoughts...'
                  }
                  placeholderTextColor={colors.placeholder} value={formData.description}
                  onChangeText={text => setFormData({...formData, description: text})}
                  multiline numberOfLines={6} textAlignVertical="top" />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, {color: colors.text}]}>
                  Contact Email {option.id === 'bug_report' ? '(for follow-up)' : '(optional)'}
                </Text>
                <TextInput
                  style={[styles.textInput, {backgroundColor: colors.background, color: colors.text}]}
                  placeholder="your@email.com" placeholderTextColor={colors.placeholder}
                  value={formData.email} onChangeText={text => setFormData({...formData, email: text})}
                  keyboardType="email-address" autoCapitalize="none" />
              </View>

              {option.id === 'general_feedback' && <RecommendQuestion formData={formData} setFormData={setFormData} colors={colors} />}

              <TouchableOpacity style={[styles.submitButton, isSubmitting && {opacity: 0.7}]} onPress={onSubmit} disabled={isSubmitting}>
                <LinearGradient colors={option.gradient} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.submitGradient}>
                  {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : (
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
        </View>
      </View>
    </Modal>
  );
};

// ============================================================================
// SUCCESS MODAL
// ============================================================================

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  colors: any;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({visible, onClose, colors}) => (
  <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
    <View style={styles.successModalOverlay}>
      <View style={[styles.successModalContent, {backgroundColor: colors.card}]}>
        <View style={styles.successIconContainer}>
          <LinearGradient colors={['#10B981', '#059669']} style={styles.successIconBg}>
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
        <TouchableOpacity style={styles.successButton} onPress={onClose}>
          <LinearGradient colors={['#10B981', '#059669']} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.successButtonGradient}>
            <Text style={styles.successButtonText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  modalOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end'},
  modalContent: {borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', minHeight: '60%'},
  modalHandle: {width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 12},
  modalHeader: {flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)'},
  modalIconBg: {width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center'},
  modalHeaderText: {flex: 1, marginLeft: 12},
  modalTitle: {fontSize: 18, fontWeight: TYPOGRAPHY.weight.bold as any},
  modalSubtitle: {fontSize: 12, marginTop: 2},
  modalClose: {padding: 4},
  formScroll: {padding: 16},
  inputGroup: {marginBottom: 16},
  inputLabel: {fontSize: 14, fontWeight: TYPOGRAPHY.weight.semibold as any, marginBottom: 8},
  textInput: {borderRadius: 10, padding: 14, fontSize: 15},
  textArea: {borderRadius: 10, padding: 14, fontSize: 15, minHeight: 120, textAlignVertical: 'top'},
  submitButton: {marginTop: 20, borderRadius: 12, overflow: 'hidden'},
  submitGradient: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8},
  submitText: {color: '#FFFFFF', fontSize: 16, fontWeight: TYPOGRAPHY.weight.bold as any},
  successModalOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24},
  successModalContent: {width: '100%', borderRadius: 24, padding: 24, alignItems: 'center'},
  successIconContainer: {marginBottom: 20},
  successIconBg: {width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center'},
  successTitle: {fontSize: 24, fontWeight: TYPOGRAPHY.weight.bold as any, marginBottom: 12},
  successText: {fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24},
  successButton: {width: '100%', borderRadius: 12, overflow: 'hidden'},
  successButtonGradient: {paddingVertical: 14, alignItems: 'center'},
  successButtonText: {color: '#FFFFFF', fontSize: 16, fontWeight: TYPOGRAPHY.weight.bold as any},
});

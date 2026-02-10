/**
 * useContributeWizard - Manages wizard state and form logic for data contributions
 */

import { useState, useEffect, useCallback } from 'react';
import { Keyboard, BackHandler, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { dataSubmissionsService } from '../services/dataSubmissions';
import {
  WizardStep,
  TabType,
  CategoryOption,
  EntityData,
  ContributeFormData,
} from '../types/contribute';

const INITIAL_FORM_DATA: ContributeFormData = {
  category: null,
  entity: null,
  field: null,
  customField: '',
  currentValue: '',
  newValue: '',
  reason: '',
  sourceUrl: '',
  priority: 'medium',
};

export function useContributeWizard(navigation: any) {
  const { user } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState<TabType>('contribute');
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastAutoApproved, setLastAutoApproved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContributeFormData>(INITIAL_FORM_DATA);

  const updateFormData = useCallback((updates: Partial<ContributeFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setCurrentStep(1);
    setShowSuccess(false);
  }, []);

  // Back button protection - prevent accidental data loss in wizard
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (activeTab === 'contribute' && currentStep > 1) {
        Alert.alert(
          'Discard Changes?',
          'You have unsaved contribution data. Are you sure you want to go back?',
          [
            { text: 'Stay', style: 'cancel' },
            {
              text: 'Discard',
              style: 'destructive',
              onPress: () => {
                resetForm();
                navigation.goBack();
              },
            },
          ],
        );
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [activeTab, currentStep, navigation, resetForm]);

  const handleCategorySelect = useCallback((category: CategoryOption) => {
    updateFormData({ category });
    setCurrentStep(2);
  }, [updateFormData]);

  const handleEntitySelect = useCallback((entity: EntityData | null) => {
    updateFormData({ entity });
    if (entity) {
      setCurrentStep(3);
    }
  }, [updateFormData]);

  const handleSubmit = useCallback(async () => {
    if (!user) {
      navigation.navigate('Auth');
      return;
    }

    setSubmitting(true);
    Keyboard.dismiss();

    try {
      const fieldLabel = formData.field?.label || formData.customField;

      const result = await dataSubmissionsService.submitDataCorrection({
        type: formData.category?.id || 'other',
        priority: formData.priority,
        user_id: user.id,
        user_name: user.fullName || user.email || null,
        user_email: user.email || null,
        user_trust_level: 0,
        user_auth_provider: (user.provider || 'email') as any,
        entity_type: formData.entity?.type || 'custom',
        entity_id: formData.entity?.id || '',
        entity_name: formData.entity?.name || '',
        field_name: fieldLabel,
        current_value: formData.currentValue || 'Not specified',
        proposed_value: formData.newValue,
        change_reason: formData.reason,
        source_proof: formData.sourceUrl || null,
      });

      if (result.success) {
        setLastAutoApproved(result.autoApproved || false);
        setShowSuccess(true);
      }
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert(
        'Submission Failed',
        'Could not submit your contribution. Please check your connection and try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }, [user, formData, navigation]);

  const canProceedToNextStep = useCallback(() => {
    switch (currentStep) {
      case 1:
        return !!formData.category;
      case 2:
        return !!formData.entity;
      case 3:
        return (
          (!!formData.field || !!formData.customField.trim()) &&
          !!formData.newValue.trim() &&
          !!formData.reason.trim()
        );
      default:
        return true;
    }
  }, [currentStep, formData]);

  const goToNextStep = useCallback(() => {
    if (canProceedToNextStep() && currentStep < 4) {
      setCurrentStep((currentStep + 1) as WizardStep);
    }
  }, [canProceedToNextStep, currentStep]);

  const goToPrevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as WizardStep);
    }
  }, [currentStep]);

  return {
    // State
    activeTab,
    setActiveTab,
    currentStep,
    showSuccess,
    lastAutoApproved,
    submitting,
    formData,
    // Actions
    updateFormData,
    resetForm,
    handleCategorySelect,
    handleEntitySelect,
    handleSubmit,
    canProceedToNextStep,
    goToNextStep,
    goToPrevStep,
  };
}

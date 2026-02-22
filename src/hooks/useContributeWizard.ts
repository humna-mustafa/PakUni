/**
 * useContributeWizard - Manages wizard state and form logic for data contributions
 *
 * Flow: Step 1 (pick category) → Step 2 (pick entity) → navigates to DataCorrectionScreen
 * DataCorrectionScreen fetches real data from the app and provides field-level edit access.
 */

import { useState, useEffect, useCallback } from 'react';
import { BackHandler, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import {
  TabType,
  CategoryOption,
  EntityData,
} from '../types/contribute';
import { CorrectionEntityType } from '../services/dataCorrectionService';

// Map contribute category IDs → DataCorrection entity types
const CATEGORY_TO_ENTITY_TYPE: Record<string, CorrectionEntityType> = {
  merit_update: 'university',      // Merit data is per-university; user picks uni, edits merit fields
  fee_update: 'university',        // Fee data is per-university
  date_correction: 'deadline',     // Deadlines are their own entity
  entry_test_update: 'entry_test',
  university_info: 'university',
  scholarship_info: 'scholarship',
  program_info: 'program',
};

export function useContributeWizard(navigation: any) {
  const { user } = useAuth();

  // State — only steps 1 & 2 now
  const [activeTab, setActiveTab] = useState<TabType>('contribute');
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption | null>(null);

  // Back button protection
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (activeTab === 'contribute' && currentStep > 1) {
        setCurrentStep(1);
        setSelectedCategory(null);
        return true;
      }
      return false;
    });
    return () => backHandler.remove();
  }, [activeTab, currentStep]);

  const handleCategorySelect = useCallback((category: CategoryOption) => {
    setSelectedCategory(category);
    setCurrentStep(2);
  }, []);

  const handleEntitySelect = useCallback((entity: EntityData | null) => {
    if (!entity || !selectedCategory) return;

    // Determine the entity type for DataCorrectionScreen
    const entityType = CATEGORY_TO_ENTITY_TYPE[selectedCategory.id] || 'university';

    // Navigate to DataCorrectionScreen which fetches real app data
    // and provides field-level edit/fix access
    navigation.navigate('DataCorrection', {
      entityType,
      entityId: entity.id,
      entityName: entity.name,
    });
  }, [selectedCategory, navigation]);

  const goBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(1);
      setSelectedCategory(null);
    }
  }, [currentStep]);

  const resetForm = useCallback(() => {
    setSelectedCategory(null);
    setCurrentStep(1);
  }, []);

  return {
    // State
    activeTab,
    setActiveTab,
    currentStep,
    selectedCategory,
    // Actions
    handleCategorySelect,
    handleEntitySelect,
    goBack,
    resetForm,
  };
}

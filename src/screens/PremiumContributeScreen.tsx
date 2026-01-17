/**
 * PremiumContributeScreen - Modern Data Contribution System
 * 
 * Complete redesign with:
 * - Bottom sheet category selection
 * - Smart entity search with current data display
 * - Step-by-step wizard with progress indicator
 * - Real-time validation
 * - Success/error notifications
 * - Modern animations and haptic feedback
 * - Accessibility compliant
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  Dimensions,
  Keyboard,
  Platform,
  Modal,
  FlatList,
  Vibration,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
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
import { hybridDataService } from '../services/hybridData';
import { SPACING, RADIUS, TYPOGRAPHY } from '../constants/design';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

type WizardStep = 'category' | 'entity' | 'details' | 'review';
type TabType = 'contribute' | 'history';

interface CategoryOption {
  id: SubmissionType;
  title: string;
  description: string;
  icon: string;
  gradient: [string, string];
  examples: string[];
  fields: string[];
}

interface EntityData {
  id: string;
  name: string;
  type: string;
  currentData?: Record<string, any>;
}

interface FormData {
  type: SubmissionType | null;
  priority: SubmissionPriority;
  entityId: string;
  entityName: string;
  entityType: string;
  fieldName: string;
  currentValue: string;
  proposedValue: string;
  reason: string;
  source: string;
}

interface ValidationError {
  field: string;
  message: string;
}

const CATEGORIES: CategoryOption[] = [
  {
    id: 'merit_update',
    title: 'Merit List',
    description: 'Update closing merit, cutoffs, aggregate scores',
    icon: 'trending-up',
    gradient: ['#4573DF', '#4573DF'],
    examples: ['NUST closing merit: 89.5%', 'FAST aggregate cutoff'],
    fields: ['Closing Merit', '1st Merit', '2nd Merit', 'Aggregate', 'Total Seats'],
  },
  {
    id: 'fee_update',
    title: 'Fee Structure',
    description: 'Correct tuition, hostel, or admission fees',
    icon: 'cash',
    gradient: ['#10B981', '#059669'],
    examples: ['LUMS semester fee: PKR 850,000', 'GIKI hostel charges'],
    fields: ['Tuition Fee', 'Hostel Fee', 'Admission Fee', 'Security Deposit', 'Lab Fee'],
  },
  {
    id: 'date_correction',
    title: 'Deadline/Date',
    description: 'Fix application deadlines, test dates',
    icon: 'calendar',
    gradient: ['#EF4444', '#DC2626'],
    examples: ['NUST application deadline', 'MDCAT result date'],
    fields: ['Application Deadline', 'Fee Deadline', 'Result Date', 'Interview Date'],
  },
  {
    id: 'entry_test_update',
    title: 'Entry Test',
    description: 'Update test dates, registration, fees',
    icon: 'document-text',
    gradient: ['#F59E0B', '#D97706'],
    examples: ['MDCAT 2025 test date', 'ECAT registration fee'],
    fields: ['Test Date', 'Registration Deadline', 'Test Fee', 'Result Date', 'Syllabus'],
  },
  {
    id: 'university_info',
    title: 'University Info',
    description: 'Contact, address, website corrections',
    icon: 'business',
    gradient: ['#4573DF', '#3660C9'],
    examples: ['IBA address update', 'UET website URL'],
    fields: ['Address', 'Phone', 'Email', 'Website', 'Ranking'],
  },
  {
    id: 'scholarship_info',
    title: 'Scholarship',
    description: 'Eligibility, amount, deadline updates',
    icon: 'ribbon',
    gradient: ['#4573DF', '#3660C9'],
    examples: ['HEC scholarship criteria', 'Need-based aid amount'],
    fields: ['Eligibility', 'Amount', 'Coverage', 'Deadline', 'Requirements'],
  },
  {
    id: 'program_info',
    title: 'Program Details',
    description: 'Course info, duration, eligibility',
    icon: 'school',
    gradient: ['#4573DF', '#3660C9'],
    examples: ['MBBS duration', 'CS prerequisites'],
    fields: ['Duration', 'Credit Hours', 'Eligibility', 'Specializations'],
  },
  {
    id: 'other',
    title: 'Other',
    description: 'Any other data correction',
    icon: 'create',
    gradient: ['#64748B', '#475569'],
    examples: ['General corrections'],
    fields: [],
  },
];

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: string; label: string }> = {
  pending: { bg: '#FEF3C7', text: '#92400E', icon: 'time-outline', label: 'Pending Review' },
  under_review: { bg: '#E8EFFC', text: '#3660C9', icon: 'eye-outline', label: 'Under Review' },
  approved: { bg: '#D1FAE5', text: '#065F46', icon: 'checkmark-circle', label: 'Approved' },
  rejected: { bg: '#FEE2E2', text: '#991B1B', icon: 'close-circle', label: 'Rejected' },
  auto_approved: { bg: '#EDE9FE', text: '#3660C9', icon: 'flash', label: 'Auto-Approved' },
};

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// Progress Steps Indicator
const ProgressSteps: React.FC<{
  currentStep: WizardStep;
  colors: any;
}> = ({ currentStep, colors }) => {
  const steps: { key: WizardStep; label: string; icon: string }[] = [
    { key: 'category', label: 'Type', icon: 'grid-outline' },
    { key: 'entity', label: 'Select', icon: 'search-outline' },
    { key: 'details', label: 'Update', icon: 'create-outline' },
    { key: 'review', label: 'Review', icon: 'checkmark-outline' },
  ];

  const currentIndex = steps.findIndex(s => s.key === currentStep);

  return (
    <View style={styles.progressContainer}>
      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;
        const bgColor = isActive ? colors.primary : isCompleted ? '#10B981' : colors.border;
        
        return (
          <React.Fragment key={step.key}>
            <View style={styles.progressStep}>
              <View style={[styles.progressDot, { backgroundColor: bgColor }]}>
                <Icon 
                  name={isCompleted ? 'checkmark' : step.icon} 
                  size={14} 
                  color="#FFFFFF" 
                />
              </View>
              <Text style={[
                styles.progressLabel, 
                { color: isActive ? colors.text : colors.textSecondary }
              ]}>
                {step.label}
              </Text>
            </View>
            {index < steps.length - 1 && (
              <View style={[
                styles.progressLine, 
                { backgroundColor: isCompleted ? '#10B981' : colors.border }
              ]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

// Category Selection Bottom Sheet
const CategorySheet: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSelect: (category: CategoryOption) => void;
  selectedId: SubmissionType | null;
  colors: any;
  isDark: boolean;
}> = ({ visible, onClose, onSelect, selectedId, colors, isDark }) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity 
        style={styles.sheetOverlay} 
        activeOpacity={1} 
        onPress={onClose}>
        <Animated.View 
          style={[
            styles.sheetContainer, 
            { 
              backgroundColor: colors.background,
              transform: [{ translateY: slideAnim }],
            }
          ]}>
          <TouchableOpacity activeOpacity={1}>
            <View style={styles.sheetHandle} />
            
            <Text style={[styles.sheetTitle, { color: colors.text }]}>
              What do you want to update?
            </Text>
            <Text style={[styles.sheetSubtitle, { color: colors.textSecondary }]}>
              Select the type of data you want to correct
            </Text>
            
            <ScrollView 
              style={styles.sheetScroll}
              showsVerticalScrollIndicator={false}>
              {CATEGORIES.map((category) => {
                const isSelected = selectedId === category.id;
                
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryCard,
                      { backgroundColor: colors.card },
                      isSelected && { borderColor: category.gradient[0], borderWidth: 2 },
                    ]}
                    onPress={() => {
                      Vibration.vibrate(10);
                      onSelect(category);
                    }}
                    activeOpacity={0.8}>
                    <LinearGradient
                      colors={category.gradient}
                      style={styles.categoryIcon}>
                      <Icon name={category.icon} size={24} color="#FFFFFF" />
                    </LinearGradient>
                    <View style={styles.categoryContent}>
                      <Text style={[styles.categoryTitle, { color: colors.text }]}>
                        {category.title}
                      </Text>
                      <Text style={[styles.categoryDesc, { color: colors.textSecondary }]} numberOfLines={1}>
                        {category.description}
                      </Text>
                      <Text style={[styles.categoryExamples, { color: colors.textSecondary }]} numberOfLines={1}>
                        e.g., {category.examples[0]}
                      </Text>
                    </View>
                    {isSelected && (
                      <Icon name="checkmark-circle" size={24} color={category.gradient[0]} />
                    )}
                  </TouchableOpacity>
                );
              })}
              <View style={{ height: 40 }} />
            </ScrollView>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

// Entity Search with Current Data Display
const EntitySearchStep: React.FC<{
  category: CategoryOption | null;
  formData: FormData;
  onUpdate: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
  colors: any;
  isDark: boolean;
}> = ({ category, formData, onUpdate, onNext, onBack, colors, isDark }) => {
  const [searchQuery, setSearchQuery] = useState(formData.entityName);
  const [suggestions, setSuggestions] = useState<EntityData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<EntityData | null>(null);
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Search entities
  useEffect(() => {
    if (debouncedSearch.length < 2) {
      setSuggestions([]);
      return;
    }

    const searchEntities = async () => {
      setLoading(true);
      try {
        const universities = await hybridDataService.getUniversities();
        const matched = universities
          .filter(u => u.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
          .slice(0, 8)
          .map(u => ({
            id: (u as any).id || u.name.toLowerCase().replace(/\s+/g, '_'),
            name: u.name,
            type: 'university',
            currentData: {
              type: u.type,
              city: (u as any).city || (u as any).location,
              website: (u as any).website,
            },
          }));
        setSuggestions(matched);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    searchEntities();
  }, [debouncedSearch]);

  const handleSelectEntity = (entity: EntityData) => {
    setSelectedEntity(entity);
    setSearchQuery(entity.name);
    onUpdate({
      entityId: entity.id,
      entityName: entity.name,
      entityType: entity.type,
    });
    setSuggestions([]);
    Vibration.vibrate(10);
  };

  const handleManualEntry = () => {
    if (searchQuery.trim()) {
      onUpdate({
        entityId: searchQuery.toLowerCase().replace(/\s+/g, '_'),
        entityName: searchQuery.trim(),
        entityType: 'custom',
      });
      setSelectedEntity({
        id: searchQuery.toLowerCase().replace(/\s+/g, '_'),
        name: searchQuery.trim(),
        type: 'custom',
      });
    }
  };

  const canProceed = formData.entityName.trim().length > 0;

  return (
    <View style={styles.stepContainer}>
      {/* Category Badge */}
      {category && (
        <View style={[styles.categoryBadge, { backgroundColor: category.gradient[0] + '15' }]}>
          <Icon name={category.icon} size={18} color={category.gradient[0]} />
          <Text style={[styles.categoryBadgeText, { color: category.gradient[0] }]}>
            {category.title}
          </Text>
        </View>
      )}

      <Text style={[styles.stepTitle, { color: colors.text }]}>
        What are you updating?
      </Text>
      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        Search for a university, test, or enter the name
      </Text>

      {/* Search Input */}
      <View style={[styles.searchBox, { backgroundColor: isDark ? '#272C34' : '#F3F4F6' }]}>
        <Icon name="search-outline" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search or type name..."
          placeholderTextColor={colors.textSecondary}
          autoFocus
        />
        {loading && <ActivityIndicator size="small" color={colors.primary} />}
        {searchQuery.length > 0 && !loading && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <View style={[styles.suggestionsBox, { backgroundColor: colors.card }]}>
          {suggestions.map((entity, index) => (
            <TouchableOpacity
              key={entity.id}
              style={[
                styles.suggestionItem,
                index < suggestions.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
              onPress={() => handleSelectEntity(entity)}>
              <View style={[styles.suggestionIcon, { backgroundColor: colors.primary + '15' }]}>
                <Icon name="school-outline" size={18} color={colors.primary} />
              </View>
              <View style={styles.suggestionContent}>
                <Text style={[styles.suggestionName, { color: colors.text }]}>{entity.name}</Text>
                {entity.currentData?.city && (
                  <Text style={[styles.suggestionMeta, { color: colors.textSecondary }]}>
                    {entity.currentData.city} • {entity.currentData.type}
                  </Text>
                )}
              </View>
              <Icon name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Manual Entry Option */}
      {searchQuery.length > 0 && suggestions.length === 0 && !loading && (
        <TouchableOpacity
          style={[styles.manualEntryCard, { backgroundColor: colors.card }]}
          onPress={handleManualEntry}>
          <Icon name="add-circle-outline" size={22} color={colors.primary} />
          <View style={styles.manualEntryContent}>
            <Text style={[styles.manualEntryTitle, { color: colors.text }]}>
              Use "{searchQuery}"
            </Text>
            <Text style={[styles.manualEntryDesc, { color: colors.textSecondary }]}>
              Continue with this name
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Selected Entity Display */}
      {selectedEntity && (
        <View style={[styles.selectedEntityCard, { backgroundColor: colors.card }]}>
          <View style={styles.selectedEntityHeader}>
            <Icon name="checkmark-circle" size={20} color="#10B981" />
            <Text style={[styles.selectedEntityTitle, { color: colors.text }]}>
              Selected: {selectedEntity.name}
            </Text>
          </View>
          {selectedEntity.currentData && Object.keys(selectedEntity.currentData).length > 0 && (
            <View style={styles.currentDataContainer}>
              <Text style={[styles.currentDataLabel, { color: colors.textSecondary }]}>
                Current Data:
              </Text>
              {Object.entries(selectedEntity.currentData).map(([key, value]) => (
                value && (
                  <View key={key} style={styles.currentDataRow}>
                    <Text style={[styles.currentDataKey, { color: colors.textSecondary }]}>
                      {key}:
                    </Text>
                    <Text style={[styles.currentDataValue, { color: colors.text }]}>
                      {String(value)}
                    </Text>
                  </View>
                )
              ))}
            </View>
          )}
        </View>
      )}

      {/* Navigation Buttons */}
      <View style={styles.navButtons}>
        <TouchableOpacity
          style={[styles.navBtnSecondary, { borderColor: colors.border }]}
          onPress={onBack}>
          <Icon name="arrow-back" size={20} color={colors.text} />
          <Text style={[styles.navBtnSecondaryText, { color: colors.text }]}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.navBtnPrimary,
            { backgroundColor: canProceed ? colors.primary : colors.border },
          ]}
          onPress={onNext}
          disabled={!canProceed}>
          <Text style={styles.navBtnPrimaryText}>Continue</Text>
          <Icon name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Details Entry Step - Modern Comparison UI
const DetailsEntryStep: React.FC<{
  category: CategoryOption | null;
  formData: FormData;
  onUpdate: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
  colors: any;
  isDark: boolean;
}> = ({ category, formData, onUpdate, onNext, onBack, colors, isDark }) => {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const fieldSuggestions = category?.fields || [];

  const validate = (): boolean => {
    const newErrors: ValidationError[] = [];
    
    if (!formData.fieldName.trim()) {
      newErrors.push({ field: 'fieldName', message: 'Select which field to update' });
    }
    if (!formData.proposedValue.trim()) {
      newErrors.push({ field: 'proposedValue', message: 'Enter the correct value' });
    }
    if (!formData.reason.trim()) {
      newErrors.push({ field: 'reason', message: 'Brief reason helps faster approval' });
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    } else {
      Vibration.vibrate([0, 50, 30, 50]);
    }
  };

  const getFieldError = (field: string) => errors.find(e => e.field === field)?.message;

  // Show comparison when both values entered
  useEffect(() => {
    setShowComparison(formData.currentValue.trim().length > 0 && formData.proposedValue.trim().length > 0);
  }, [formData.currentValue, formData.proposedValue]);

  const inputBg = isDark ? '#272C34' : '#F3F4F6';
  const cardBg = isDark ? '#1D2127' : '#FFFFFF';

  return (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      {/* Entity & Category Header */}
      <View style={styles.updateHeader}>
        <View style={[styles.updateEntityBadge, { backgroundColor: colors.primary + '15' }]}>
          <Icon name="school-outline" size={16} color={colors.primary} />
          <Text style={[styles.updateEntityText, { color: colors.primary }]} numberOfLines={1}>
            {formData.entityName}
          </Text>
        </View>
        {category && (
          <View style={[styles.updateCategoryBadge, { backgroundColor: category.gradient[0] + '20' }]}>
            <Icon name={category.icon} size={14} color={category.gradient[0]} />
            <Text style={[styles.updateCategoryText, { color: category.gradient[0] }]}>
              {category.title}
            </Text>
          </View>
        )}
      </View>

      {/* Step 1: Select Field */}
      <View style={[styles.updateSection, { backgroundColor: cardBg }]}>
        <View style={styles.updateSectionHeader}>
          <View style={[styles.updateStepBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.updateStepNumber}>1</Text>
          </View>
          <Text style={[styles.updateSectionTitle, { color: colors.text }]}>
            What field is wrong?
          </Text>
        </View>
        
        {fieldSuggestions.length > 0 && (
          <View style={styles.fieldChipsContainer}>
            {fieldSuggestions.map((field) => (
              <TouchableOpacity
                key={field}
                style={[
                  styles.fieldChipModern,
                  { 
                    backgroundColor: formData.fieldName === field 
                      ? colors.primary 
                      : (isDark ? '#272C34' : '#F3F4F6'),
                    borderColor: formData.fieldName === field ? colors.primary : 'transparent',
                  },
                ]}
                onPress={() => {
                  onUpdate({ fieldName: field });
                  Vibration.vibrate(10);
                }}>
                {formData.fieldName === field && (
                  <Icon name="checkmark-circle" size={16} color="#FFFFFF" />
                )}
                <Text style={[
                  styles.fieldChipTextModern,
                  { color: formData.fieldName === field ? '#FFFFFF' : colors.text },
                ]}>
                  {field}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <TextInput
          style={[
            styles.inputModern, 
            { backgroundColor: inputBg, color: colors.text },
            getFieldError('fieldName') && styles.inputError,
          ]}
          value={formData.fieldName}
          onChangeText={(text) => onUpdate({ fieldName: text })}
          placeholder="Or type field name (e.g., Semester Fee)"
          placeholderTextColor={colors.textSecondary}
        />
        {getFieldError('fieldName') && (
          <View style={styles.errorRow}>
            <Icon name="alert-circle" size={14} color="#EF4444" />
            <Text style={styles.errorText}>{getFieldError('fieldName')}</Text>
          </View>
        )}
      </View>

      {/* Step 2: Value Comparison Card */}
      <View style={[styles.updateSection, { backgroundColor: cardBg }]}>
        <View style={styles.updateSectionHeader}>
          <View style={[styles.updateStepBadge, { backgroundColor: '#F59E0B' }]}>
            <Text style={styles.updateStepNumber}>2</Text>
          </View>
          <Text style={[styles.updateSectionTitle, { color: colors.text }]}>
            What's the correction?
          </Text>
        </View>

        {/* Current Value Box */}
        <View style={[styles.valueBox, { backgroundColor: isDark ? '#272C34' : '#FEF2F2' }]}>
          <View style={styles.valueBoxHeader}>
            <View style={[styles.valueBoxIcon, { backgroundColor: '#FEE2E2' }]}>
              <Icon name="close-circle" size={18} color="#EF4444" />
            </View>
            <Text style={[styles.valueBoxLabel, { color: '#991B1B' }]}>Currently Shows (Wrong)</Text>
          </View>
          <TextInput
            style={[styles.valueInput, { color: colors.text, backgroundColor: isDark ? '#272C34' : '#FFFFFF' }]}
            value={formData.currentValue}
            onChangeText={(text) => onUpdate({ currentValue: text })}
            placeholder="What does the app show now? (e.g., PKR 500,000)"
            placeholderTextColor={colors.textSecondary}
          />
          <Text style={[styles.valueHint, { color: colors.textSecondary }]}>
            Leave empty if adding new data
          </Text>
        </View>

        {/* Arrow Indicator */}
        <View style={styles.arrowIndicator}>
          <View style={[styles.arrowLine, { backgroundColor: colors.border }]} />
          <View style={[styles.arrowCircle, { backgroundColor: '#10B981' }]}>
            <Icon name="arrow-down" size={16} color="#FFFFFF" />
          </View>
          <View style={[styles.arrowLine, { backgroundColor: colors.border }]} />
        </View>

        {/* New Value Box */}
        <View style={[styles.valueBox, { backgroundColor: isDark ? '#272C34' : '#F0FDF4' }]}>
          <View style={styles.valueBoxHeader}>
            <View style={[styles.valueBoxIcon, { backgroundColor: '#D1FAE5' }]}>
              <Icon name="checkmark-circle" size={18} color="#10B981" />
            </View>
            <Text style={[styles.valueBoxLabel, { color: '#065F46' }]}>Should Be (Correct)</Text>
            <Text style={styles.requiredStar}>*</Text>
          </View>
          <TextInput
            style={[
              styles.valueInput, 
              { color: colors.text, backgroundColor: isDark ? '#272C34' : '#FFFFFF' },
              getFieldError('proposedValue') && { borderColor: '#EF4444', borderWidth: 1 },
            ]}
            value={formData.proposedValue}
            onChangeText={(text) => onUpdate({ proposedValue: text })}
            placeholder="Enter correct value (e.g., PKR 650,000)"
            placeholderTextColor={colors.textSecondary}
          />
          {getFieldError('proposedValue') && (
            <View style={styles.errorRow}>
              <Icon name="alert-circle" size={14} color="#EF4444" />
              <Text style={styles.errorText}>{getFieldError('proposedValue')}</Text>
            </View>
          )}
        </View>

        {/* Live Comparison Preview */}
        {showComparison && (
          <View style={[styles.comparisonPreview, { backgroundColor: isDark ? '#1E3A5F' : '#E8EFFC' }]}>
            <Icon name="git-compare-outline" size={18} color={isDark ? '#4573DF' : '#4573DF'} />
            <View style={styles.comparisonContent}>
              <Text style={[styles.comparisonLabel, { color: isDark ? '#4573DF' : '#4573DF' }]}>Change Preview:</Text>
              <View style={styles.comparisonValues}>
                <Text style={styles.comparisonOld} numberOfLines={1}>{formData.currentValue}</Text>
                <Icon name="arrow-forward" size={12} color={isDark ? '#4573DF' : '#4573DF'} />
                <Text style={styles.comparisonNew} numberOfLines={1}>{formData.proposedValue}</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Step 3: Reason & Proof */}
      <View style={[styles.updateSection, { backgroundColor: cardBg }]}>
        <View style={styles.updateSectionHeader}>
          <View style={[styles.updateStepBadge, { backgroundColor: '#10B981' }]}>
            <Text style={styles.updateStepNumber}>3</Text>
          </View>
          <Text style={[styles.updateSectionTitle, { color: colors.text }]}>
            Why this change?
          </Text>
        </View>

        {/* Quick Reason Chips */}
        <View style={styles.quickReasonChips}>
          {['Official website updated', 'Fee revised for 2025', 'Merit list released', 'Deadline extended'].map((reason) => (
            <TouchableOpacity
              key={reason}
              style={[
                styles.quickReasonChip,
                { 
                  backgroundColor: formData.reason === reason ? '#10B981' : (isDark ? '#272C34' : '#F3F4F6'),
                },
              ]}
              onPress={() => {
                onUpdate({ reason });
                Vibration.vibrate(10);
              }}>
              <Text style={[
                styles.quickReasonText,
                { color: formData.reason === reason ? '#FFFFFF' : colors.textSecondary },
              ]}>
                {reason}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={[
            styles.inputModern, 
            styles.multilineInput,
            { backgroundColor: inputBg, color: colors.text },
            getFieldError('reason') && styles.inputError,
          ]}
          value={formData.reason}
          onChangeText={(text) => onUpdate({ reason: text })}
          placeholder="Or type your reason..."
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={2}
        />
        {getFieldError('reason') && (
          <View style={styles.errorRow}>
            <Icon name="alert-circle" size={14} color="#EF4444" />
            <Text style={styles.errorText}>{getFieldError('reason')}</Text>
          </View>
        )}

        {/* Source (Optional) */}
        <View style={styles.sourceContainer}>
          <View style={styles.sourceHeader}>
            <Icon name="link-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.sourceLabel, { color: colors.textSecondary }]}>Source URL</Text>
            <View style={[styles.optionalBadge, { backgroundColor: isDark ? '#272C34' : '#E5E7EB' }]}>
              <Text style={[styles.optionalText, { color: colors.textSecondary }]}>Optional</Text>
            </View>
          </View>
          <TextInput
            style={[styles.inputModern, { backgroundColor: inputBg, color: colors.text }]}
            value={formData.source}
            onChangeText={(text) => onUpdate({ source: text })}
            placeholder="https://university-website.edu.pk/fees"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
            keyboardType="url"
          />
          <Text style={[styles.sourceHint, { color: colors.textSecondary }]}>
            💡 Adding source = faster approval!
          </Text>
        </View>
      </View>

      {/* Navigation Buttons */}
      <View style={styles.navButtons}>
        <TouchableOpacity
          style={[styles.navBtnSecondary, { borderColor: colors.border }]}
          onPress={onBack}>
          <Icon name="arrow-back" size={20} color={colors.text} />
          <Text style={[styles.navBtnSecondaryText, { color: colors.text }]}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.navBtnPrimary, { backgroundColor: colors.primary }]}
          onPress={handleNext}>
          <Text style={styles.navBtnPrimaryText}>Review & Submit</Text>
          <Icon name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

// Review & Submit Step
const ReviewStep: React.FC<{
  category: CategoryOption | null;
  formData: FormData;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
  colors: any;
  isDark: boolean;
}> = ({ category, formData, onBack, onSubmit, submitting, colors, isDark }) => {
  return (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        Review Your Submission
      </Text>
      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        Please verify all details before submitting
      </Text>

      {/* Review Card */}
      <View style={[styles.reviewCard, { backgroundColor: colors.card }]}>
        {/* Category */}
        <View style={styles.reviewRow}>
          <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Type</Text>
          <View style={styles.reviewValueRow}>
            {category && (
              <LinearGradient colors={category.gradient} style={styles.reviewCategoryBadge}>
                <Icon name={category.icon} size={14} color="#FFFFFF" />
              </LinearGradient>
            )}
            <Text style={[styles.reviewValue, { color: colors.text }]}>{category?.title}</Text>
          </View>
        </View>

        <View style={[styles.reviewDivider, { backgroundColor: colors.border }]} />

        {/* Entity */}
        <View style={styles.reviewRow}>
          <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Updating</Text>
          <Text style={[styles.reviewValue, { color: colors.text }]}>{formData.entityName}</Text>
        </View>

        <View style={[styles.reviewDivider, { backgroundColor: colors.border }]} />

        {/* Field */}
        <View style={styles.reviewRow}>
          <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Field</Text>
          <Text style={[styles.reviewValue, { color: colors.text }]}>{formData.fieldName}</Text>
        </View>

        <View style={[styles.reviewDivider, { backgroundColor: colors.border }]} />

        {/* Change Preview */}
        <View style={styles.reviewRow}>
          <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Change</Text>
          <View style={styles.changePreview}>
            {formData.currentValue ? (
              <>
                <Text style={[styles.oldValue, { color: '#EF4444' }]} numberOfLines={1}>
                  ✗ {formData.currentValue}
                </Text>
                <Icon name="arrow-forward" size={14} color={colors.textSecondary} />
                <Text style={[styles.newValue, { color: '#10B981' }]} numberOfLines={1}>
                  ✓ {formData.proposedValue}
                </Text>
              </>
            ) : (
              <Text style={[styles.newValue, { color: '#10B981' }]}>
                ✓ {formData.proposedValue}
              </Text>
            )}
          </View>
        </View>

        <View style={[styles.reviewDivider, { backgroundColor: colors.border }]} />

        {/* Reason */}
        <View style={styles.reviewRow}>
          <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Reason</Text>
          <Text style={[styles.reviewValue, { color: colors.text }]} numberOfLines={2}>
            {formData.reason}
          </Text>
        </View>

        {formData.source && (
          <>
            <View style={[styles.reviewDivider, { backgroundColor: colors.border }]} />
            <View style={styles.reviewRow}>
              <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Source</Text>
              <Text style={[styles.reviewValue, { color: colors.primary }]} numberOfLines={1}>
                {formData.source}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Info Box */}
      <View style={[styles.infoBox, { backgroundColor: isDark ? '#1E3A5F' : '#E8EFFC' }]}>
        <Icon name="information-circle" size={20} color={isDark ? '#4573DF' : '#4573DF'} />
        <Text style={[styles.infoText, { color: isDark ? '#4573DF' : '#4573DF' }]}>
          Your submission will be reviewed by our team. Google-verified users may receive instant auto-approval!
        </Text>
      </View>

      {/* Navigation Buttons */}
      <View style={styles.navButtons}>
        <TouchableOpacity
          style={[styles.navBtnSecondary, { borderColor: colors.border }]}
          onPress={onBack}
          disabled={submitting}>
          <Icon name="arrow-back" size={20} color={colors.text} />
          <Text style={[styles.navBtnSecondaryText, { color: colors.text }]}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.submitBtn,
            { backgroundColor: submitting ? colors.border : '#10B981' },
          ]}
          onPress={onSubmit}
          disabled={submitting}>
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Icon name="send" size={20} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Submit</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

// Success Modal
const SuccessModal: React.FC<{
  visible: boolean;
  autoApproved: boolean;
  onDone: () => void;
  onViewHistory: () => void;
  colors: any;
}> = ({ visible, autoApproved, onDone, onViewHistory, colors }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }).start();
      Vibration.vibrate([0, 100, 50, 100]);
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.successOverlay}>
        <Animated.View 
          style={[
            styles.successModal,
            { 
              backgroundColor: colors.background,
              transform: [{ scale: scaleAnim }],
            },
          ]}>
          <View style={[
            styles.successCircle,
            { backgroundColor: autoApproved ? '#4573DF' : '#10B981' },
          ]}>
            <Icon name={autoApproved ? 'flash' : 'checkmark'} size={48} color="#FFFFFF" />
          </View>
          
          <Text style={[styles.successTitle, { color: colors.text }]}>
            {autoApproved ? '⚡ Auto-Approved!' : '✅ Submitted!'}
          </Text>
          
          <Text style={[styles.successDesc, { color: colors.textSecondary }]}>
            {autoApproved 
              ? 'Your correction has been instantly applied!\nThank you for improving PakUni!'
              : 'Your submission is being reviewed.\nWe\'ll notify you once it\'s approved.'}
          </Text>
          
          <View style={styles.successStats}>
            <View style={[styles.successStat, { backgroundColor: colors.card }]}>
              <Icon name="trophy" size={22} color="#F59E0B" />
              <Text style={[styles.successStatValue, { color: colors.text }]}>+10</Text>
              <Text style={[styles.successStatLabel, { color: colors.textSecondary }]}>Points</Text>
            </View>
          </View>
          
          <View style={styles.successButtons}>
            <TouchableOpacity
              style={[styles.successBtnSecondary, { borderColor: colors.border }]}
              onPress={onViewHistory}>
              <Text style={[styles.successBtnSecondaryText, { color: colors.text }]}>View History</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.successBtnPrimary, { backgroundColor: colors.primary }]}
              onPress={onDone}>
              <Text style={styles.successBtnPrimaryText}>Done</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// History Card
const HistoryCard: React.FC<{
  submission: DataSubmission;
  colors: any;
}> = ({ submission, colors }) => {
  const status = STATUS_CONFIG[submission.status] || STATUS_CONFIG.pending;
  const category = CATEGORIES.find(c => c.id === submission.type);

  return (
    <View style={[styles.historyCard, { backgroundColor: colors.card }]}>
      <View style={styles.historyTop}>
        {category && (
          <LinearGradient colors={category.gradient} style={styles.historyIcon}>
            <Icon name={category.icon} size={16} color="#FFFFFF" />
          </LinearGradient>
        )}
        <View style={styles.historyInfo}>
          <Text style={[styles.historyEntity, { color: colors.text }]} numberOfLines={1}>
            {submission.entity_name}
          </Text>
          <Text style={[styles.historyField, { color: colors.textSecondary }]}>
            {submission.field_name}
          </Text>
        </View>
        <View style={[styles.historyStatus, { backgroundColor: status.bg }]}>
          <Icon name={status.icon} size={12} color={status.text} />
          <Text style={[styles.historyStatusText, { color: status.text }]}>{status.label}</Text>
        </View>
      </View>
      
      <View style={styles.historyChange}>
        {submission.current_value && submission.current_value !== 'Not specified' && (
          <>
            <Text style={[styles.historyOld, { color: '#EF4444' }]} numberOfLines={1}>
              {String(submission.current_value)}
            </Text>
            <Icon name="arrow-forward" size={12} color={colors.textSecondary} />
          </>
        )}
        <Text style={[styles.historyNew, { color: '#10B981' }]} numberOfLines={1}>
          {String(submission.proposed_value)}
        </Text>
      </View>
      
      <Text style={[styles.historyDate, { color: colors.textSecondary }]}>
        {new Date(submission.created_at).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        })}
      </Text>
    </View>
  );
};

// ============================================================================
// MAIN SCREEN
// ============================================================================

export const PremiumContributeScreen: React.FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  
  // State
  const [activeTab, setActiveTab] = useState<TabType>(route?.params?.showHistory ? 'history' : 'contribute');
  const [step, setStep] = useState<WizardStep>('category');
  const [showCategorySheet, setShowCategorySheet] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState<DataSubmission[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastAutoApproved, setLastAutoApproved] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    type: null,
    priority: 'medium',
    entityId: '',
    entityName: '',
    entityType: '',
    fieldName: '',
    currentValue: '',
    proposedValue: '',
    reason: '',
    source: '',
  });

  // Pre-fill from navigation params
  useEffect(() => {
    if (route?.params?.type) {
      const category = CATEGORIES.find(c => c.id === route.params.type);
      if (category) {
        handleCategorySelect(category);
      }
    }
  }, [route?.params]);

  // Load history
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

  // Handlers
  const handleCategorySelect = (category: CategoryOption) => {
    setSelectedCategory(category);
    setFormData(prev => ({ ...prev, type: category.id }));
    setShowCategorySheet(false);
    setStep('entity');
  };

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setFormData({
      type: null,
      priority: 'medium',
      entityId: '',
      entityName: '',
      entityType: '',
      fieldName: '',
      currentValue: '',
      proposedValue: '',
      reason: '',
      source: '',
    });
    setSelectedCategory(null);
    setStep('category');
    setShowCategorySheet(true);
    setShowSuccess(false);
  };

  const handleSubmit = async () => {
    if (!user) {
      navigation.navigate('Auth');
      return;
    }

    setSubmitting(true);
    Keyboard.dismiss();

    try {
      const result = await dataSubmissionsService.submitDataCorrection({
        type: formData.type!,
        priority: formData.priority,
        user_id: user.id,
        user_name: user.fullName || user.email || null,
        user_email: user.email || null,
        user_trust_level: 0,
        user_auth_provider: (user.provider || 'email') as any,
        entity_type: formData.entityType,
        entity_id: formData.entityId,
        entity_name: formData.entityName,
        field_name: formData.fieldName,
        current_value: formData.currentValue || 'Not specified',
        proposed_value: formData.proposedValue,
        change_reason: formData.reason,
        source_proof: formData.source || null,
      });

      if (result.success) {
        setLastAutoApproved(result.autoApproved || false);
        setShowSuccess(true);
      } else {
        Vibration.vibrate([0, 100, 50, 100]);
      }
    } catch (error) {
      console.error('Submit error:', error);
      Vibration.vibrate([0, 100, 50, 100]);
    } finally {
      setSubmitting(false);
    }
  };

  // Render tabs
  const renderTabs = () => (
    <View style={[styles.tabsContainer, { backgroundColor: isDark ? '#272C34' : '#F3F4F6' }]}>
      {(['contribute', 'history'] as TabType[]).map(tab => (
        <TouchableOpacity
          key={tab}
          style={[
            styles.tab,
            { backgroundColor: activeTab === tab ? colors.primary : 'transparent' },
          ]}
          onPress={() => setActiveTab(tab)}>
          <Icon
            name={tab === 'contribute' ? 'create-outline' : 'time-outline'}
            size={18}
            color={activeTab === tab ? '#FFFFFF' : colors.textSecondary}
          />
          <Text style={[styles.tabText, { color: activeTab === tab ? '#FFFFFF' : colors.textSecondary }]}>
            {tab === 'contribute' ? 'Contribute' : 'History'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Render contribute tab
  const renderContribute = () => {
    if (step === 'category' || showCategorySheet) {
      return (
        <View style={styles.content}>
          <CategorySheet
            visible={showCategorySheet}
            onClose={() => {
              if (!selectedCategory) {
                navigation.goBack();
              } else {
                setShowCategorySheet(false);
              }
            }}
            onSelect={handleCategorySelect}
            selectedId={formData.type}
            colors={colors}
            isDark={isDark}
          />
        </View>
      );
    }

    return (
      <View style={styles.content}>
        <ProgressSteps currentStep={step} colors={colors} />
        
        {step === 'entity' && (
          <EntitySearchStep
            category={selectedCategory}
            formData={formData}
            onUpdate={updateFormData}
            onNext={() => setStep('details')}
            onBack={() => {
              setShowCategorySheet(true);
              setStep('category');
            }}
            colors={colors}
            isDark={isDark}
          />
        )}
        
        {step === 'details' && (
          <DetailsEntryStep
            category={selectedCategory}
            formData={formData}
            onUpdate={updateFormData}
            onNext={() => setStep('review')}
            onBack={() => setStep('entity')}
            colors={colors}
            isDark={isDark}
          />
        )}
        
        {step === 'review' && (
          <ReviewStep
            category={selectedCategory}
            formData={formData}
            onBack={() => setStep('details')}
            onSubmit={handleSubmit}
            submitting={submitting}
            colors={colors}
            isDark={isDark}
          />
        )}
      </View>
    );
  };

  // Render history tab
  const renderHistory = () => (
    <ScrollView
      style={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadHistory(); }} />}
      showsVerticalScrollIndicator={false}>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : submissions.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="document-text-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Submissions Yet</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Your contributions will appear here
          </Text>
          <TouchableOpacity
            style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
            onPress={() => setActiveTab('contribute')}>
            <Icon name="add-circle-outline" size={20} color="#FFFFFF" />
            <Text style={styles.emptyBtnText}>Make First Contribution</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Stats */}
          <View style={[styles.statsRow, { backgroundColor: colors.card }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{submissions.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#10B981' }]}>
                {submissions.filter(s => s.status === 'approved' || s.status === 'auto_approved').length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Approved</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#F59E0B' }]}>
                {submissions.filter(s => s.status === 'pending').length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending</Text>
            </View>
          </View>
          
          {submissions.map((submission) => (
            <HistoryCard key={submission.id} submission={submission} colors={colors} />
          ))}
        </>
      )}
      
      <View style={{ height: 100 }} />
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <UniversalHeader
        title="Contribute"
        subtitle="Help improve PakUni"
        showBack
        onBack={() => navigation.goBack()}
      />
      
      {renderTabs()}
      
      {activeTab === 'contribute' ? renderContribute() : renderHistory()}
      
      <SuccessModal
        visible={showSuccess}
        autoApproved={lastAutoApproved}
        onDone={resetForm}
        onViewHistory={() => {
          setShowSuccess(false);
          resetForm();
          setActiveTab('history');
        }}
        colors={colors}
      />
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
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  
  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    borderRadius: RADIUS.lg,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  
  // Progress Steps
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
  progressStep: {
    alignItems: 'center',
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  progressLine: {
    width: 40,
    height: 2,
    marginHorizontal: 4,
  },
  
  // Category Sheet
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
    paddingTop: SPACING.sm,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  sheetScroll: {
    paddingHorizontal: SPACING.md,
  },
  
  // Category Card
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  categoryDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  categoryExamples: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 4,
  },
  
  // Step Container
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    marginBottom: SPACING.md,
  },
  
  // Category Badge
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    gap: 6,
    marginBottom: SPACING.md,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Entity Badge
  entityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    gap: 6,
    marginBottom: SPACING.md,
    maxWidth: '80%',
  },
  entityBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Search
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.sm,
    fontSize: 15,
  },
  
  // Suggestions
  suggestionsBox: {
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
  },
  suggestionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '600',
  },
  suggestionMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  
  // Manual Entry
  manualEntryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  manualEntryContent: {
    flex: 1,
  },
  manualEntryTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  manualEntryDesc: {
    fontSize: 12,
  },
  
  // Selected Entity
  selectedEntityCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
  },
  selectedEntityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  selectedEntityTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  currentDataContainer: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  currentDataLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  currentDataRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  currentDataKey: {
    fontSize: 12,
    width: 60,
  },
  currentDataValue: {
    fontSize: 12,
    flex: 1,
  },
  
  // Input
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: SPACING.sm,
  },
  input: {
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    fontSize: 14,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  
  // Field Chips
  chipScroll: {
    marginBottom: SPACING.xs,
  },
  fieldChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    marginRight: SPACING.xs,
  },
  fieldChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  // Navigation Buttons
  navButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  navBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
  },
  navBtnSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  navBtnPrimary: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
  },
  navBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  
  // Review Card
  reviewCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  reviewRow: {
    paddingVertical: SPACING.xs,
  },
  reviewLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  reviewValue: {
    fontSize: 14,
  },
  reviewValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  reviewCategoryBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewDivider: {
    height: 1,
    marginVertical: SPACING.xs,
  },
  changePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flexWrap: 'wrap',
  },
  oldValue: {
    fontSize: 13,
    textDecorationLine: 'line-through',
  },
  newValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  
  // Info Box
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  
  // Submit Button
  submitBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  
  // Success Modal
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  successModal: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: SPACING.xs,
  },
  successDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  successStats: {
    flexDirection: 'row',
    marginTop: SPACING.md,
  },
  successStat: {
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    minWidth: 90,
  },
  successStatValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  successStatLabel: {
    fontSize: 11,
  },
  successButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    width: '100%',
  },
  successBtnSecondary: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
  },
  successBtnSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  successBtnPrimary: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
  },
  successBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  
  // History
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
  },
  historyCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  historyTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  historyEntity: {
    fontSize: 14,
    fontWeight: '600',
  },
  historyField: {
    fontSize: 12,
  },
  historyStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  historyStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  historyChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.xs,
  },
  historyOld: {
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  historyNew: {
    fontSize: 12,
    fontWeight: '600',
  },
  historyDate: {
    fontSize: 10,
  },
  
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: SPACING.md,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.lg,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // ============================================================================
  // MODERN UPDATE SECTION STYLES
  // ============================================================================
  
  // Update Header
  updateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    flexWrap: 'wrap',
  },
  updateEntityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    gap: 6,
    maxWidth: '60%',
  },
  updateEntityText: {
    fontSize: 13,
    fontWeight: '600',
  },
  updateCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  updateCategoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Update Section Cards
  updateSection: {
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
  updateSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  updateStepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateStepNumber: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  updateSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  
  // Field Chips Modern
  fieldChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  fieldChipModern: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    gap: 4,
    borderWidth: 1,
  },
  fieldChipTextModern: {
    fontSize: 13,
    fontWeight: '500',
  },
  
  // Input Modern
  inputModern: {
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    fontSize: 14,
  },
  
  // Error Row
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  
  // Value Boxes
  valueBox: {
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
  },
  valueBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  valueBoxIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueBoxLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  requiredStar: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
  valueInput: {
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    fontSize: 14,
  },
  valueHint: {
    fontSize: 11,
    marginTop: 4,
  },
  
  // Arrow Indicator
  arrowIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
  },
  arrowLine: {
    flex: 1,
    height: 1,
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
  },
  
  // Comparison Preview
  comparisonPreview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
  },
  comparisonContent: {
    flex: 1,
  },
  comparisonLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  comparisonValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  comparisonOld: {
    fontSize: 12,
    color: '#EF4444',
    textDecorationLine: 'line-through',
  },
  comparisonNew: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  
  // Quick Reason Chips
  quickReasonChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  quickReasonChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  quickReasonText: {
    fontSize: 12,
  },
  
  // Source Container
  sourceContainer: {
    marginTop: SPACING.md,
  },
  sourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.xs,
  },
  sourceLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  optionalBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  optionalText: {
    fontSize: 10,
    fontWeight: '500',
  },
  sourceHint: {
    fontSize: 11,
    marginTop: 6,
  },
});

export default PremiumContributeScreen;




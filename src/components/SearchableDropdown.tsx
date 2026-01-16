/**
 * SearchableDropdown Component
 * Premium searchable dropdown with local static data search
 * 
 * Features:
 * - Searches local static data (no DB calls)
 * - Supports pre-populated lists with search
 * - Allows custom entry if not found in list
 * - Keyboard-friendly with proper accessibility
 * - Smooth animations and haptic feedback
 * 
 * @author PakUni Team
 * @version 1.0.0
 */

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  memo,
  useEffect,
} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Animated,
  Keyboard,
  Platform,
  ViewStyle,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Icon } from './icons';
import { Haptics } from '../utils/haptics';
import {
  ULTRA_TYPOGRAPHY,
  ULTRA_SPACING,
  ULTRA_RADIUS,
  ULTRA_SHADOWS,
  ULTRA_MOTION,
  pixelPerfect,
} from '../constants/ultra-design';
import UniversityLogo from './UniversityLogo';

// ============================================================================
// TYPES
// ============================================================================

export interface DropdownOption<T = string> {
  /** Unique identifier for the option */
  id: string;
  /** Display label */
  label: string;
  /** Value to return on selection */
  value: T;
  /** Secondary text/description */
  subtitle?: string;
  /** Icon name (Ionicons) */
  icon?: string;
  /** Custom icon element */
  iconElement?: React.ReactNode;
  /** University short name for logo display */
  universityShortName?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

export interface SearchableDropdownProps<T = string> {
  /** Label text above the dropdown */
  label?: string;
  /** Placeholder text when no selection */
  placeholder?: string;
  /** Currently selected value */
  value?: T;
  /** Array of options to display */
  options: DropdownOption<T>[];
  /** Callback when an option is selected */
  onSelect: (value: T, option: DropdownOption<T>) => void;
  /** Allow custom entry if not found */
  allowCustom?: boolean;
  /** Custom entry placeholder */
  customPlaceholder?: string;
  /** Callback for custom entry */
  onCustomEntry?: (text: string) => void;
  /** Error message */
  error?: string;
  /** Hint text */
  hint?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Required field */
  required?: boolean;
  /** Maximum visible items before scrolling */
  maxVisibleItems?: number;
  /** Show university logos (if options have universityShortName) */
  showLogos?: boolean;
  /** Search fields for filtering (defaults to ['label']) */
  searchFields?: string[];
  /** Container style override */
  style?: ViewStyle;
  /** Enable full-screen modal on mobile */
  fullScreenOnMobile?: boolean;
  /** Group options by a field */
  groupBy?: string;
  /** No results text */
  emptyText?: string;
}

// ============================================================================
// SEARCHABLE DROPDOWN COMPONENT
// ============================================================================

function SearchableDropdownInner<T = string>({
  label,
  placeholder = 'Search and select...',
  value,
  options,
  onSelect,
  allowCustom = false,
  customPlaceholder = 'Enter custom value...',
  onCustomEntry,
  error,
  hint,
  disabled = false,
  required = false,
  maxVisibleItems = 5,
  showLogos = false,
  searchFields = ['label'],
  style,
  fullScreenOnMobile = true,
  groupBy,
  emptyText = 'No results found',
}: SearchableDropdownProps<T>) {
  const { colors, isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const inputRef = useRef<TextInput>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  const shadowStyle = isDark ? ULTRA_SHADOWS.dark : ULTRA_SHADOWS.light;
  const hasError = !!error;

  // Get selected option
  const selectedOption = useMemo(() => {
    return options.find(opt => opt.value === value);
  }, [options, value]);

  // Filter options based on search text
  const filteredOptions = useMemo(() => {
    if (!searchText.trim()) {
      return options;
    }

    const searchLower = searchText.toLowerCase().trim();
    return options.filter(option => {
      // Search in specified fields
      return searchFields.some(field => {
        const fieldValue = field === 'label' 
          ? option.label 
          : option.metadata?.[field];
        return fieldValue?.toLowerCase().includes(searchLower);
      });
    });
  }, [options, searchText, searchFields]);

  // Group options if groupBy is specified
  const groupedOptions = useMemo(() => {
    if (!groupBy) return null;

    const groups: Record<string, DropdownOption<T>[]> = {};
    filteredOptions.forEach(option => {
      const groupKey = option.metadata?.[groupBy] || 'Other';
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(option);
    });
    return groups;
  }, [filteredOptions, groupBy]);

  // Open dropdown
  const handleOpen = useCallback(() => {
    if (disabled) return;
    Haptics.light();
    setIsOpen(true);
    setSearchText('');
    setShowCustomInput(false);

    Animated.timing(dropdownAnim, {
      toValue: 1,
      duration: ULTRA_MOTION.duration.fast,
      useNativeDriver: true,
    }).start();
  }, [disabled, dropdownAnim]);

  // Close dropdown
  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    Animated.timing(dropdownAnim, {
      toValue: 0,
      duration: ULTRA_MOTION.duration.fast,
      useNativeDriver: true,
    }).start(() => {
      setIsOpen(false);
      setSearchText('');
      setShowCustomInput(false);
    });
  }, [dropdownAnim]);

  // Select option
  const handleSelect = useCallback((option: DropdownOption<T>) => {
    Haptics.medium();
    onSelect(option.value, option);
    handleClose();
  }, [onSelect, handleClose]);

  // Handle custom entry
  const handleCustomSubmit = useCallback(() => {
    if (!customValue.trim() || !onCustomEntry) return;
    Haptics.medium();
    onCustomEntry(customValue.trim());
    setCustomValue('');
    handleClose();
  }, [customValue, onCustomEntry, handleClose]);

  // Render single option
  const renderOption = useCallback((option: DropdownOption<T>, index: number) => {
    const isSelected = option.value === value;

    return (
      <TouchableOpacity
        key={option.id}
        style={[
          styles.optionItem,
          {
            backgroundColor: isSelected 
              ? `${colors.primary}15` 
              : 'transparent',
          },
        ]}
        onPress={() => handleSelect(option)}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
        activeOpacity={0.7}
      >
        {/* Logo or Icon */}
        {showLogos && option.universityShortName ? (
          <UniversityLogo
            shortName={option.universityShortName}
            size={40}
            borderRadius={8}
            style={styles.optionLogo}
          />
        ) : option.iconElement ? (
          <View style={styles.optionIcon}>{option.iconElement}</View>
        ) : option.icon ? (
          <View style={[styles.optionIconCircle, { backgroundColor: `${colors.primary}15` }]}>
            <Icon
              name={option.icon}
              family="Ionicons"
              size={pixelPerfect(18)}
              color={colors.primary}
            />
          </View>
        ) : null}

        {/* Text Content */}
        <View style={styles.optionTextContainer}>
          <Text
            style={[
              styles.optionLabel,
              {
                color: isSelected ? colors.primary : colors.text,
                fontWeight: isSelected
                  ? ULTRA_TYPOGRAPHY.weight.semibold
                  : ULTRA_TYPOGRAPHY.weight.regular,
              },
            ]}
            numberOfLines={1}
          >
            {option.label}
          </Text>
          {option.subtitle && (
            <Text
              style={[styles.optionSubtitle, { color: colors.textMuted }]}
              numberOfLines={1}
            >
              {option.subtitle}
            </Text>
          )}
        </View>

        {/* Selected Check */}
        {isSelected && (
          <Icon
            name="checkmark-circle"
            family="Ionicons"
            size={pixelPerfect(20)}
            color={colors.primary}
          />
        )}
      </TouchableOpacity>
    );
  }, [colors, value, showLogos, handleSelect]);

  // Render grouped options
  const renderGroupedOptions = useCallback(() => {
    if (!groupedOptions) return null;

    return Object.entries(groupedOptions).map(([group, groupOptions]) => (
      <View key={group}>
        <Text style={[styles.groupHeader, { color: colors.textSecondary }]}>
          {group}
        </Text>
        {groupOptions.map((option, index) => renderOption(option, index))}
      </View>
    ));
  }, [groupedOptions, renderOption, colors]);

  // Render dropdown content
  const renderDropdownContent = () => (
    <View style={[styles.dropdownContent, { backgroundColor: colors.card }]}>
      {/* Search Input */}
      <View
        style={[
          styles.searchContainer,
          { 
            backgroundColor: colors.background,
            borderColor: colors.border,
          },
        ]}
      >
        <Icon
          name="search"
          family="Ionicons"
          size={pixelPerfect(18)}
          color={colors.textMuted}
        />
        <TextInput
          ref={inputRef}
          style={[styles.searchInput, { color: colors.text }]}
          value={searchText}
          onChangeText={setSearchText}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {searchText.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchText('')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon
              name="close-circle"
              family="Ionicons"
              size={pixelPerfect(18)}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Options List */}
      <ScrollView
        style={styles.optionsList}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
      >
        {filteredOptions.length > 0 ? (
          groupBy ? (
            renderGroupedOptions()
          ) : (
            filteredOptions.map((option, index) => renderOption(option, index))
          )
        ) : (
          <View style={styles.emptyContainer}>
            <Icon
              name="search-outline"
              family="Ionicons"
              size={pixelPerfect(40)}
              color={colors.textMuted}
            />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {emptyText}
            </Text>
            {allowCustom && searchText.length > 0 && (
              <TouchableOpacity
                style={[
                  styles.customButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={() => {
                  setShowCustomInput(true);
                  setCustomValue(searchText);
                }}
              >
                <Icon
                  name="add"
                  family="Ionicons"
                  size={pixelPerfect(18)}
                  color="#FFFFFF"
                />
                <Text style={styles.customButtonText}>
                  Add "{searchText}"
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Custom Entry Option */}
        {allowCustom && !showCustomInput && filteredOptions.length > 0 && (
          <TouchableOpacity
            style={[
              styles.customEntryTrigger,
              { borderTopColor: colors.border },
            ]}
            onPress={() => setShowCustomInput(true)}
          >
            <Icon
              name="add-circle-outline"
              family="Ionicons"
              size={pixelPerfect(20)}
              color={colors.primary}
            />
            <Text style={[styles.customEntryText, { color: colors.primary }]}>
              Not in list? Add custom entry
            </Text>
          </TouchableOpacity>
        )}

        {/* Custom Input */}
        {showCustomInput && (
          <View
            style={[
              styles.customInputContainer,
              { borderTopColor: colors.border },
            ]}
          >
            <Text style={[styles.customInputLabel, { color: colors.textSecondary }]}>
              {customPlaceholder}
            </Text>
            <View style={styles.customInputRow}>
              <TextInput
                style={[
                  styles.customInput,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={customValue}
                onChangeText={setCustomValue}
                placeholder="Enter custom value"
                placeholderTextColor={colors.placeholder}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleCustomSubmit}
              />
              <TouchableOpacity
                style={[
                  styles.customSubmitButton,
                  {
                    backgroundColor: customValue.trim()
                      ? colors.primary
                      : colors.border,
                  },
                ]}
                onPress={handleCustomSubmit}
                disabled={!customValue.trim()}
              >
                <Icon
                  name="checkmark"
                  family="Ionicons"
                  size={pixelPerfect(20)}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {/* Label */}
      {label && (
        <View style={styles.labelRow}>
          <Text
            style={[
              styles.label,
              {
                color: hasError ? colors.error : colors.textSecondary,
              },
            ]}
          >
            {label}
            {required && <Text style={{ color: colors.error }}> *</Text>}
          </Text>
        </View>
      )}

      {/* Trigger Button */}
      <TouchableOpacity
        style={[
          styles.trigger,
          {
            backgroundColor: colors.card,
            borderColor: hasError ? colors.error : colors.border,
            opacity: disabled ? 0.5 : 1,
          },
          shadowStyle.xs,
        ]}
        onPress={handleOpen}
        disabled={disabled}
        activeOpacity={0.8}
        accessibilityRole="combobox"
        accessibilityLabel={label || 'Select option'}
        accessibilityState={{ expanded: isOpen }}
      >
        {/* Selected Option Display */}
        {selectedOption ? (
          <View style={styles.selectedContent}>
            {showLogos && selectedOption.universityShortName ? (
              <UniversityLogo
                shortName={selectedOption.universityShortName}
                size={32}
                borderRadius={6}
                style={styles.selectedLogo}
              />
            ) : selectedOption.icon ? (
              <View style={styles.selectedIcon}>
                <Icon
                  name={selectedOption.icon}
                  family="Ionicons"
                  size={pixelPerfect(18)}
                  color={colors.primary}
                />
              </View>
            ) : null}
            <View style={styles.selectedTextContainer}>
              <Text
                style={[styles.selectedLabel, { color: colors.text }]}
                numberOfLines={1}
              >
                {selectedOption.label}
              </Text>
              {selectedOption.subtitle && (
                <Text
                  style={[styles.selectedSubtitle, { color: colors.textMuted }]}
                  numberOfLines={1}
                >
                  {selectedOption.subtitle}
                </Text>
              )}
            </View>
          </View>
        ) : (
          <Text style={[styles.placeholder, { color: colors.placeholder }]}>
            {placeholder}
          </Text>
        )}

        {/* Chevron */}
        <Icon
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          family="Ionicons"
          size={pixelPerfect(20)}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {/* Error/Hint Text */}
      {(error || hint) && (
        <Text
          style={[
            styles.helperText,
            {
              color: hasError ? colors.error : colors.textMuted,
            },
          ]}
        >
          {error || hint}
        </Text>
      )}

      {/* Full Screen Modal */}
      <Modal
        visible={isOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          {/* Modal Header */}
          <View
            style={[
              styles.modalHeader,
              {
                backgroundColor: colors.card,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon
                name="close"
                family="Ionicons"
                size={pixelPerfect(24)}
                color={colors.text}
              />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {label || 'Select Option'}
            </Text>
            <View style={styles.modalCloseButton} />
          </View>

          {/* Modal Content */}
          {renderDropdownContent()}
        </View>
      </Modal>
    </View>
  );
}

// Memoized export with generic support
export const SearchableDropdown = memo(SearchableDropdownInner) as typeof SearchableDropdownInner;

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    marginBottom: ULTRA_SPACING[4],
    zIndex: 10,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ULTRA_SPACING[1.5],
  },
  label: {
    fontSize: ULTRA_TYPOGRAPHY.scale.footnote,
    fontWeight: ULTRA_TYPOGRAPHY.weight.medium,
    letterSpacing: ULTRA_TYPOGRAPHY.tracking.wide,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: pixelPerfect(52),
    paddingHorizontal: ULTRA_SPACING[4],
    borderRadius: ULTRA_RADIUS.input,
    borderWidth: pixelPerfect(1),
  },
  selectedContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: ULTRA_SPACING[2],
  },
  selectedLogo: {
    marginRight: ULTRA_SPACING[3],
  },
  selectedIcon: {
    marginRight: ULTRA_SPACING[2],
  },
  selectedTextContainer: {
    flex: 1,
  },
  selectedLabel: {
    fontSize: ULTRA_TYPOGRAPHY.scale.subhead,
    fontWeight: ULTRA_TYPOGRAPHY.weight.medium,
  },
  selectedSubtitle: {
    fontSize: ULTRA_TYPOGRAPHY.scale.caption,
    marginTop: 2,
  },
  placeholder: {
    flex: 1,
    fontSize: ULTRA_TYPOGRAPHY.scale.subhead,
  },
  helperText: {
    marginTop: ULTRA_SPACING[1],
    paddingLeft: ULTRA_SPACING[1],
    fontSize: ULTRA_TYPOGRAPHY.scale.caption,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ULTRA_SPACING[4],
    paddingVertical: ULTRA_SPACING[3],
    borderBottomWidth: pixelPerfect(1),
  },
  modalCloseButton: {
    width: pixelPerfect(40),
    height: pixelPerfect(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: ULTRA_TYPOGRAPHY.scale.headline,
    fontWeight: ULTRA_TYPOGRAPHY.weight.semibold,
    flex: 1,
    textAlign: 'center',
  },
  // Dropdown Content
  dropdownContent: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: ULTRA_SPACING[4],
    paddingHorizontal: ULTRA_SPACING[3],
    paddingVertical: ULTRA_SPACING[2],
    borderRadius: ULTRA_RADIUS.lg,
    borderWidth: pixelPerfect(1),
    gap: ULTRA_SPACING[2],
  },
  searchInput: {
    flex: 1,
    fontSize: ULTRA_TYPOGRAPHY.scale.body,
    paddingVertical: Platform.OS === 'ios' ? ULTRA_SPACING[1] : 0,
  },
  optionsList: {
    flex: 1,
    paddingHorizontal: ULTRA_SPACING[2],
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ULTRA_SPACING[3],
    paddingHorizontal: ULTRA_SPACING[3],
    borderRadius: ULTRA_RADIUS.md,
    marginBottom: ULTRA_SPACING[1],
  },
  optionLogo: {
    marginRight: ULTRA_SPACING[3],
  },
  optionIcon: {
    marginRight: ULTRA_SPACING[3],
  },
  optionIconCircle: {
    width: pixelPerfect(36),
    height: pixelPerfect(36),
    borderRadius: pixelPerfect(18),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ULTRA_SPACING[3],
  },
  optionTextContainer: {
    flex: 1,
    marginRight: ULTRA_SPACING[2],
  },
  optionLabel: {
    fontSize: ULTRA_TYPOGRAPHY.scale.subhead,
  },
  optionSubtitle: {
    fontSize: ULTRA_TYPOGRAPHY.scale.caption,
    marginTop: 2,
  },
  groupHeader: {
    fontSize: ULTRA_TYPOGRAPHY.scale.caption,
    fontWeight: ULTRA_TYPOGRAPHY.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: ULTRA_TYPOGRAPHY.tracking.wider,
    paddingHorizontal: ULTRA_SPACING[3],
    paddingVertical: ULTRA_SPACING[2],
    marginTop: ULTRA_SPACING[2],
  },
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ULTRA_SPACING[8],
    gap: ULTRA_SPACING[3],
  },
  emptyText: {
    fontSize: ULTRA_TYPOGRAPHY.scale.subhead,
    textAlign: 'center',
  },
  customButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ULTRA_SPACING[4],
    paddingVertical: ULTRA_SPACING[2],
    borderRadius: ULTRA_RADIUS.full,
    gap: ULTRA_SPACING[2],
    marginTop: ULTRA_SPACING[2],
  },
  customButtonText: {
    color: '#FFFFFF',
    fontSize: ULTRA_TYPOGRAPHY.scale.subhead,
    fontWeight: ULTRA_TYPOGRAPHY.weight.semibold,
  },
  // Custom Entry
  customEntryTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ULTRA_SPACING[4],
    marginTop: ULTRA_SPACING[2],
    borderTopWidth: pixelPerfect(1),
    gap: ULTRA_SPACING[2],
  },
  customEntryText: {
    fontSize: ULTRA_TYPOGRAPHY.scale.subhead,
    fontWeight: ULTRA_TYPOGRAPHY.weight.medium,
  },
  customInputContainer: {
    paddingTop: ULTRA_SPACING[4],
    paddingHorizontal: ULTRA_SPACING[3],
    marginTop: ULTRA_SPACING[2],
    borderTopWidth: pixelPerfect(1),
  },
  customInputLabel: {
    fontSize: ULTRA_TYPOGRAPHY.scale.footnote,
    fontWeight: ULTRA_TYPOGRAPHY.weight.medium,
    marginBottom: ULTRA_SPACING[2],
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ULTRA_SPACING[2],
  },
  customInput: {
    flex: 1,
    paddingHorizontal: ULTRA_SPACING[3],
    paddingVertical: ULTRA_SPACING[3],
    borderRadius: ULTRA_RADIUS.md,
    borderWidth: pixelPerfect(1),
    fontSize: ULTRA_TYPOGRAPHY.scale.subhead,
  },
  customSubmitButton: {
    width: pixelPerfect(44),
    height: pixelPerfect(44),
    borderRadius: ULTRA_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// ============================================================================
// HELPER: Create university options from static data
// ============================================================================

import { UNIVERSITIES, UniversityData } from '../data/universities';

export function createUniversityOptions(): DropdownOption<string>[] {
  return UNIVERSITIES.map(uni => ({
    id: uni.short_name,
    label: uni.short_name,
    value: uni.short_name,
    subtitle: uni.name,
    universityShortName: uni.short_name,
    metadata: {
      province: uni.province,
      type: uni.type,
      city: uni.city,
      name: uni.name,
      fullName: uni.name,
    },
  }));
}

export function createUniversityOptionsWithFullNames(): DropdownOption<string>[] {
  return UNIVERSITIES.map(uni => ({
    id: uni.short_name,
    label: uni.name,
    value: uni.short_name,
    subtitle: `${uni.short_name} • ${uni.city}, ${uni.province.charAt(0).toUpperCase() + uni.province.slice(1)}`,
    universityShortName: uni.short_name,
    metadata: {
      province: uni.province,
      type: uni.type,
      city: uni.city,
      shortName: uni.short_name,
    },
  }));
}

// ============================================================================
// HELPER: Create scholarship options from static data
// ============================================================================

import { SCHOLARSHIPS, ScholarshipData } from '../data/scholarships';

export function createScholarshipOptions(): DropdownOption<string>[] {
  return SCHOLARSHIPS.map(scholarship => ({
    id: scholarship.id,
    label: scholarship.name,
    value: scholarship.id,
    subtitle: scholarship.provider,
    icon: 'school-outline',
    metadata: {
      type: scholarship.type,
      provider: scholarship.provider,
      coverage: scholarship.coverage_percentage,
      isActive: scholarship.is_active,
    },
  }));
}

// ============================================================================
// HELPER: Create province options
// ============================================================================

export const PROVINCE_OPTIONS: DropdownOption<string>[] = [
  { id: 'all', label: 'All Provinces', value: 'all', icon: 'globe-outline' },
  { id: 'punjab', label: 'Punjab', value: 'punjab', icon: 'location-outline' },
  { id: 'sindh', label: 'Sindh', value: 'sindh', icon: 'location-outline' },
  { id: 'kpk', label: 'KPK', value: 'kpk', icon: 'location-outline' },
  { id: 'balochistan', label: 'Balochistan', value: 'balochistan', icon: 'location-outline' },
  { id: 'islamabad', label: 'Islamabad', value: 'islamabad', icon: 'location-outline' },
  { id: 'ajk', label: 'AJK', value: 'ajk', icon: 'location-outline' },
  { id: 'gilgit-baltistan', label: 'Gilgit-Baltistan', value: 'gilgit-baltistan', icon: 'location-outline' },
];

// ============================================================================
// EXPORT
// ============================================================================

export default SearchableDropdown;

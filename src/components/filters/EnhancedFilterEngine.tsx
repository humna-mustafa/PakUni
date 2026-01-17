/**
 * Enhanced Filter Engine
 * Advanced filtering with City, Fee Range, Programs, Sector, Ranking, Hostel
 */

import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '../icons';
import {TYPOGRAPHY, RADIUS, SPACING} from '../../constants/design';

// ============================================================================
// TYPES
// ============================================================================

export interface FilterState {
  cities: string[];
  feeRange: {min: number; max: number};
  programs: string[];
  sectors: ('public' | 'private' | 'semi-government')[];
  rankingRange: {min: number; max: number};
  hasHostel: boolean | null;
  hasScholarship: boolean | null;
  entranceTestRequired: boolean | null;
}

export interface FilterConfig {
  cities: string[];
  programs: string[];
  maxFee: number;
  maxRanking: number;
}

export interface EnhancedFilterEngineProps {
  config: FilterConfig;
  initialFilters?: Partial<FilterState>;
  onFiltersChange: (filters: FilterState) => void;
  activeFilterCount?: number;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULT_FILTER_CONFIG: FilterConfig = {
  cities: [
    'Islamabad',
    'Lahore',
    'Karachi',
    'Peshawar',
    'Multan',
    'Faisalabad',
    'Rawalpindi',
    'Quetta',
    'Hyderabad',
    'Gujranwala',
    'Topi',
    'Taxila',
  ],
  programs: [
    'Computer Science',
    'Software Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'BBA',
    'MBA',
    'MBBS',
    'BDS',
    'Pharm.D',
    'Law (LLB)',
    'CA',
    'ACCA',
    'Architecture',
    'Mass Communication',
    'Psychology',
    'Economics',
    'Data Science',
    'Artificial Intelligence',
    'Cyber Security',
  ],
  maxFee: 500000,
  maxRanking: 200,
};

export const createDefaultFilters = (config: FilterConfig): FilterState => ({
  cities: [],
  feeRange: {min: 0, max: config.maxFee},
  programs: [],
  sectors: [],
  rankingRange: {min: 1, max: config.maxRanking},
  hasHostel: null,
  hasScholarship: null,
  entranceTestRequired: null,
});

// ============================================================================
// FILTER CHIP COMPONENT
// ============================================================================

interface FilterChipProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
  color?: string;
}

const FilterChip: React.FC<FilterChipProps> = ({
  label,
  selected,
  onToggle,
  color = '#4573DF',
}) => (
  <TouchableOpacity onPress={onToggle} activeOpacity={0.7}>
    <View
      style={[
        chipStyles.container,
        selected && {backgroundColor: color + '15', borderColor: color},
      ]}>
      <Text style={[chipStyles.label, selected && {color}]}>{label}</Text>
      {selected && (
        <Icon
          name="checkmark-circle"
          size={16}
          color={color}
          containerStyle={{marginLeft: 4}}
        />
      )}
    </View>
  </TouchableOpacity>
);

const chipStyles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#64748B',
    fontWeight: '500',
  },
});

// ============================================================================
// RANGE SLIDER COMPONENT
// ============================================================================

interface RangeSliderProps {
  min: number;
  max: number;
  currentMin: number;
  currentMax: number;
  onChange: (min: number, max: number) => void;
  formatValue: (value: number) => string;
  label: string;
  color?: string;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  currentMin,
  currentMax,
  onChange,
  formatValue,
  label,
  color = '#4573DF',
}) => {
  const [inputMin, setInputMin] = useState(currentMin.toString());
  const [inputMax, setInputMax] = useState(currentMax.toString());

  const percentage = ((currentMax - currentMin) / (max - min)) * 100;
  const leftOffset = ((currentMin - min) / (max - min)) * 100;

  const handleMinChange = (value: string) => {
    setInputMin(value);
    const num = parseInt(value) || min;
    if (num >= min && num <= currentMax) {
      onChange(num, currentMax);
    }
  };

  const handleMaxChange = (value: string) => {
    setInputMax(value);
    const num = parseInt(value) || max;
    if (num >= currentMin && num <= max) {
      onChange(currentMin, num);
    }
  };

  return (
    <View style={sliderStyles.container}>
      <Text style={sliderStyles.label}>{label}</Text>
      
      {/* Visual Track */}
      <View style={sliderStyles.track}>
        <View
          style={[
            sliderStyles.fill,
            {
              left: `${leftOffset}%`,
              width: `${percentage}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>

      {/* Input Fields */}
      <View style={sliderStyles.inputRow}>
        <View style={sliderStyles.inputContainer}>
          <Text style={sliderStyles.inputLabel}>Min</Text>
          <TextInput
            style={sliderStyles.input}
            value={inputMin}
            onChangeText={handleMinChange}
            keyboardType="numeric"
            placeholder={formatValue(min)}
            placeholderTextColor="#94A3B8"
          />
        </View>
        <Text style={sliderStyles.dash}>—</Text>
        <View style={sliderStyles.inputContainer}>
          <Text style={sliderStyles.inputLabel}>Max</Text>
          <TextInput
            style={sliderStyles.input}
            value={inputMax}
            onChangeText={handleMaxChange}
            keyboardType="numeric"
            placeholder={formatValue(max)}
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      {/* Quick Presets */}
      <View style={sliderStyles.presetsRow}>
        <TouchableOpacity
          style={sliderStyles.presetButton}
          onPress={() => {
            onChange(min, Math.round(max * 0.25));
            setInputMin(min.toString());
            setInputMax(Math.round(max * 0.25).toString());
          }}>
          <Text style={sliderStyles.presetText}>Low</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={sliderStyles.presetButton}
          onPress={() => {
            onChange(Math.round(max * 0.25), Math.round(max * 0.75));
            setInputMin(Math.round(max * 0.25).toString());
            setInputMax(Math.round(max * 0.75).toString());
          }}>
          <Text style={sliderStyles.presetText}>Mid</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={sliderStyles.presetButton}
          onPress={() => {
            onChange(Math.round(max * 0.75), max);
            setInputMin(Math.round(max * 0.75).toString());
            setInputMax(max.toString());
          }}>
          <Text style={sliderStyles.presetText}>High</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[sliderStyles.presetButton, {backgroundColor: color + '15'}]}
          onPress={() => {
            onChange(min, max);
            setInputMin(min.toString());
            setInputMax(max.toString());
          }}>
          <Text style={[sliderStyles.presetText, {color}]}>All</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const sliderStyles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING.sm,
  },
  track: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    height: '100%',
    borderRadius: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#94A3B8',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#1E293B',
    fontWeight: '600',
  },
  dash: {
    marginHorizontal: SPACING.md,
    color: '#94A3B8',
    fontWeight: '600',
  },
  presetsRow: {
    flexDirection: 'row',
  },
  presetButton: {
    flex: 1,
    paddingVertical: SPACING.xs,
    backgroundColor: '#F1F5F9',
    borderRadius: RADIUS.sm,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  presetText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#64748B',
    fontWeight: '600',
  },
});

// ============================================================================
// TOGGLE FILTER COMPONENT
// ============================================================================

interface ToggleFilterProps {
  label: string;
  value: boolean | null;
  onChange: (value: boolean | null) => void;
  icon: string;
  color?: string;
}

const ToggleFilter: React.FC<ToggleFilterProps> = ({
  label,
  value,
  onChange,
  icon,
  color = '#4573DF',
}) => {
  const options: {label: string; value: boolean | null}[] = [
    {label: 'Any', value: null},
    {label: 'Yes', value: true},
    {label: 'No', value: false},
  ];

  return (
    <View style={toggleStyles.container}>
      <View style={toggleStyles.labelRow}>
        <Icon name={icon} size={18} color={color} />
        <Text style={toggleStyles.label}>{label}</Text>
      </View>
      <View style={toggleStyles.optionsRow}>
        {options.map(option => (
          <TouchableOpacity
            key={String(option.value)}
            style={[
              toggleStyles.option,
              value === option.value && {
                backgroundColor: color + '15',
                borderColor: color,
              },
            ]}
            onPress={() => onChange(option.value)}
            activeOpacity={0.7}>
            <Text
              style={[
                toggleStyles.optionText,
                value === option.value && {color},
              ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const toggleStyles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: SPACING.xs,
  },
  optionsRow: {
    flexDirection: 'row',
  },
  option: {
    flex: 1,
    paddingVertical: SPACING.sm,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.md,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  optionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#64748B',
    fontWeight: '600',
  },
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const EnhancedFilterEngine: React.FC<EnhancedFilterEngineProps> = ({
  config,
  initialFilters,
  onFiltersChange,
  activeFilterCount = 0,
}) => {
  const defaultFilters = useMemo(
    () => createDefaultFilters(config),
    [config]
  );

  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters,
    ...initialFilters,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('cities');

  // Calculate active filter count
  const calculateActiveFilters = useCallback((): number => {
    let count = 0;
    if (filters.cities.length > 0) count++;
    if (filters.programs.length > 0) count++;
    if (filters.sectors.length > 0) count++;
    if (
      filters.feeRange.min > 0 ||
      filters.feeRange.max < config.maxFee
    )
      count++;
    if (
      filters.rankingRange.min > 1 ||
      filters.rankingRange.max < config.maxRanking
    )
      count++;
    if (filters.hasHostel !== null) count++;
    if (filters.hasScholarship !== null) count++;
    if (filters.entranceTestRequired !== null) count++;
    return count;
  }, [filters, config]);

  const currentActiveCount = calculateActiveFilters();

  // Update filters
  const updateFilters = useCallback(
    (updates: Partial<FilterState>) => {
      const newFilters = {...filters, ...updates};
      setFilters(newFilters);
      onFiltersChange(newFilters);
    },
    [filters, onFiltersChange]
  );

  // Toggle array item
  const toggleArrayItem = useCallback(
    <T,>(arr: T[], item: T): T[] => {
      const index = arr.indexOf(item);
      if (index >= 0) {
        return arr.filter((_, i) => i !== index);
      }
      return [...arr, item];
    },
    []
  );

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  }, [defaultFilters, onFiltersChange]);

  // Format fee value
  const formatFee = (value: number): string => {
    if (value >= 100000) {
      return `${(value / 100000).toFixed(1)}L`;
    }
    return `${(value / 1000).toFixed(0)}K`;
  };

  // Render section content
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'cities':
        return (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>📍 Select Cities</Text>
            <View style={styles.chipContainer}>
              {config.cities.map(city => (
                <FilterChip
                  key={city}
                  label={city}
                  selected={filters.cities.includes(city)}
                  onToggle={() =>
                    updateFilters({
                      cities: toggleArrayItem(filters.cities, city),
                    })
                  }
                  color="#4573DF"
                />
              ))}
            </View>
          </View>
        );

      case 'programs':
        return (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>📚 Select Programs</Text>
            <View style={styles.chipContainer}>
              {config.programs.map(program => (
                <FilterChip
                  key={program}
                  label={program}
                  selected={filters.programs.includes(program)}
                  onToggle={() =>
                    updateFilters({
                      programs: toggleArrayItem(filters.programs, program),
                    })
                  }
                  color="#10B981"
                />
              ))}
            </View>
          </View>
        );

      case 'fees':
        return (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>💰 Fee Range (Annual)</Text>
            <RangeSlider
              min={0}
              max={config.maxFee}
              currentMin={filters.feeRange.min}
              currentMax={filters.feeRange.max}
              onChange={(min, max) => updateFilters({feeRange: {min, max}})}
              formatValue={formatFee}
              label="Annual Fee (PKR)"
              color="#F59E0B"
            />
          </View>
        );

      case 'sector':
        return (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>🏛️ University Sector</Text>
            <View style={styles.chipContainer}>
              {[
                {id: 'public' as const, label: 'Public', icon: '🏛️'},
                {id: 'private' as const, label: 'Private', icon: '🏢'},
                {id: 'semi-government' as const, label: 'Semi-Govt', icon: '🏫'},
              ].map(sector => (
                <FilterChip
                  key={sector.id}
                  label={`${sector.icon} ${sector.label}`}
                  selected={filters.sectors.includes(sector.id)}
                  onToggle={() =>
                    updateFilters({
                      sectors: toggleArrayItem(filters.sectors, sector.id),
                    })
                  }
                  color="#4573DF"
                />
              ))}
            </View>
          </View>
        );

      case 'ranking':
        return (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>🏆 HEC Ranking Range</Text>
            <RangeSlider
              min={1}
              max={config.maxRanking}
              currentMin={filters.rankingRange.min}
              currentMax={filters.rankingRange.max}
              onChange={(min, max) => updateFilters({rankingRange: {min, max}})}
              formatValue={v => `#${v}`}
              label="Ranking Position"
              color="#4573DF"
            />
          </View>
        );

      case 'facilities':
        return (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>🎯 Facilities & Requirements</Text>
            <ToggleFilter
              label="Hostel Available"
              value={filters.hasHostel}
              onChange={v => updateFilters({hasHostel: v})}
              icon="bed-outline"
              color="#0891B2"
            />
            <ToggleFilter
              label="Scholarships Available"
              value={filters.hasScholarship}
              onChange={v => updateFilters({hasScholarship: v})}
              icon="ribbon-outline"
              color="#10B981"
            />
            <ToggleFilter
              label="Entrance Test Required"
              value={filters.entranceTestRequired}
              onChange={v => updateFilters({entranceTestRequired: v})}
              icon="document-text-outline"
              color="#F59E0B"
            />
          </View>
        );

      default:
        return null;
    }
  };

  // Filter sections
  const filterSections = [
    {id: 'cities', icon: 'location-outline', label: 'Cities', color: '#4573DF'},
    {id: 'programs', icon: 'school-outline', label: 'Programs', color: '#10B981'},
    {id: 'fees', icon: 'cash-outline', label: 'Fees', color: '#F59E0B'},
    {id: 'sector', icon: 'business-outline', label: 'Sector', color: '#4573DF'},
    {id: 'ranking', icon: 'trophy-outline', label: 'Ranking', color: '#3660C9'},
    {id: 'facilities', icon: 'options-outline', label: 'More', color: '#0891B2'},
  ];

  return (
    <View>
      {/* Filter Button */}
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}>
        <LinearGradient
          colors={['#4573DF', '#3660C9']}
          style={styles.filterButtonGradient}>
          <Icon name="options-outline" size={20} color="#FFF" />
          <Text style={styles.filterButtonText}>Filters</Text>
          {currentActiveCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{currentActiveCount}</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Active Filter Tags */}
      {currentActiveCount > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.activeFiltersScroll}>
          {filters.cities.length > 0 && (
            <View style={styles.activeTag}>
              <Icon name="location" size={14} color="#4573DF" />
              <Text style={styles.activeTagText}>
                {filters.cities.length} {filters.cities.length === 1 ? 'City' : 'Cities'}
              </Text>
            </View>
          )}
          {filters.programs.length > 0 && (
            <View style={styles.activeTag}>
              <Icon name="school" size={14} color="#10B981" />
              <Text style={styles.activeTagText}>
                {filters.programs.length} {filters.programs.length === 1 ? 'Program' : 'Programs'}
              </Text>
            </View>
          )}
          {filters.sectors.length > 0 && (
            <View style={styles.activeTag}>
              <Icon name="business" size={14} color="#4573DF" />
              <Text style={styles.activeTagText}>
                {filters.sectors.join(', ')}
              </Text>
            </View>
          )}
          {(filters.feeRange.min > 0 || filters.feeRange.max < config.maxFee) && (
            <View style={styles.activeTag}>
              <Icon name="cash" size={14} color="#F59E0B" />
              <Text style={styles.activeTagText}>
                {formatFee(filters.feeRange.min)} - {formatFee(filters.feeRange.max)}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.clearTag}
            onPress={resetFilters}
            activeOpacity={0.7}>
            <Icon name="close-circle" size={16} color="#EF4444" />
            <Text style={styles.clearTagText}>Clear</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Filter Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Universities</Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}>
              <Icon name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Section Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsScroll}
            contentContainerStyle={styles.tabsContent}>
            {filterSections.map(section => (
              <TouchableOpacity
                key={section.id}
                style={[
                  styles.tab,
                  activeSection === section.id && {
                    backgroundColor: section.color + '15',
                    borderColor: section.color,
                  },
                ]}
                onPress={() => setActiveSection(section.id)}
                activeOpacity={0.7}>
                <Icon
                  name={section.icon}
                  size={18}
                  color={activeSection === section.id ? section.color : '#64748B'}
                />
                <Text
                  style={[
                    styles.tabText,
                    activeSection === section.id && {color: section.color},
                  ]}>
                  {section.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Content */}
          <ScrollView style={styles.contentScroll}>
            {renderSectionContent()}
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetFilters}
              activeOpacity={0.7}>
              <Icon name="refresh-outline" size={20} color="#64748B" />
              <Text style={styles.resetButtonText}>Reset All</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              activeOpacity={0.9}>
              <LinearGradient
                colors={['#4573DF', '#3660C9']}
                style={styles.applyButton}>
                <Text style={styles.applyButtonText}>
                  Apply Filters {currentActiveCount > 0 && `(${currentActiveCount})`}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ============================================================================
// COMPACT FILTER BAR
// ============================================================================

interface CompactFilterBarProps {
  filters: FilterState;
  onFilterPress: (section: string) => void;
  onClearFilters: () => void;
}

export const CompactFilterBar: React.FC<CompactFilterBarProps> = ({
  filters,
  onFilterPress,
  onClearFilters,
}) => {
  const hasActiveFilters =
    filters.cities.length > 0 ||
    filters.programs.length > 0 ||
    filters.sectors.length > 0 ||
    filters.hasHostel !== null ||
    filters.hasScholarship !== null;

  return (
    <View style={compactStyles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={compactStyles.scrollContent}>
        <TouchableOpacity
          style={compactStyles.filterItem}
          onPress={() => onFilterPress('cities')}>
          <Icon name="location-outline" size={16} color="#4573DF" />
          <Text style={compactStyles.filterLabel}>City</Text>
          {filters.cities.length > 0 && (
            <View style={compactStyles.dot} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={compactStyles.filterItem}
          onPress={() => onFilterPress('programs')}>
          <Icon name="school-outline" size={16} color="#10B981" />
          <Text style={compactStyles.filterLabel}>Program</Text>
          {filters.programs.length > 0 && (
            <View style={[compactStyles.dot, {backgroundColor: '#10B981'}]} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={compactStyles.filterItem}
          onPress={() => onFilterPress('fees')}>
          <Icon name="cash-outline" size={16} color="#F59E0B" />
          <Text style={compactStyles.filterLabel}>Fee</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={compactStyles.filterItem}
          onPress={() => onFilterPress('sector')}>
          <Icon name="business-outline" size={16} color="#4573DF" />
          <Text style={compactStyles.filterLabel}>Sector</Text>
          {filters.sectors.length > 0 && (
            <View style={[compactStyles.dot, {backgroundColor: '#4573DF'}]} />
          )}
        </TouchableOpacity>

        {hasActiveFilters && (
          <TouchableOpacity
            style={compactStyles.clearButton}
            onPress={onClearFilters}>
            <Icon name="close-circle" size={16} color="#EF4444" />
            <Text style={compactStyles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const compactStyles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.full,
    marginRight: SPACING.sm,
  },
  filterLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#475569',
    fontWeight: '500',
    marginLeft: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4573DF',
    marginLeft: 6,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#FEF2F2',
    borderRadius: RADIUS.full,
  },
  clearText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#EF4444',
    fontWeight: '600',
    marginLeft: 4,
  },
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  filterButton: {
    marginVertical: SPACING.sm,
  },
  filterButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
  },
  filterButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    color: '#FFF',
    marginLeft: SPACING.sm,
  },
  badge: {
    backgroundColor: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    marginLeft: SPACING.sm,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
    color: '#4573DF',
  },
  activeFiltersScroll: {
    marginVertical: SPACING.sm,
  },
  activeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    marginRight: SPACING.sm,
  },
  activeTagText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#475569',
    marginLeft: 4,
    fontWeight: '500',
  },
  clearTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  clearTagText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#EF4444',
    marginLeft: 4,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '800',
    color: '#1E293B',
  },
  closeButton: {
    padding: SPACING.sm,
  },
  tabsScroll: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabsContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: SPACING.sm,
    backgroundColor: '#F8FAFC',
  },
  tabText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#64748B',
    fontWeight: '600',
    marginLeft: 6,
  },
  contentScroll: {
    flex: 1,
  },
  sectionContent: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: SPACING.md,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFF',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginRight: SPACING.md,
  },
  resetButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: '#64748B',
    fontWeight: '600',
    marginLeft: 6,
  },
  applyButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    color: '#FFF',
  },
});

export default EnhancedFilterEngine;


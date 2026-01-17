/**
 * Grade Converter Card Component
 * CGPA ↔ Percentage, O/A Level Equivalence
 */

import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '../icons';
import {
  cgpaToPercentage,
  percentageToCGPA,
  convertOLevelToMatric,
  convertALevelToInter,
  CGPAScale,
  CGPA_REFERENCE_TABLE,
  O_LEVEL_REFERENCE,
  A_LEVEL_REFERENCE,
} from '../../utils/gradeConversion';
import {TYPOGRAPHY, RADIUS, SPACING} from '../../constants/design';

// ============================================================================
// TYPES
// ============================================================================

type ConversionMode = 'cgpa-to-percent' | 'percent-to-cgpa' | 'o-level' | 'a-level';

interface GradeConverterProps {
  onConvert?: (result: any) => void;
}

// ============================================================================
// GRADE BUTTON COMPONENT
// ============================================================================

interface GradeButtonProps {
  grade: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
}

const GradeButton: React.FC<GradeButtonProps> = ({
  grade,
  selected,
  onPress,
  color = '#4573DF',
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.gradeButton,
      selected && {backgroundColor: color, borderColor: color},
    ]}
    activeOpacity={0.7}>
    <Text style={[styles.gradeButtonText, selected && styles.gradeButtonTextSelected]}>
      {grade}
    </Text>
  </TouchableOpacity>
);

// ============================================================================
// RESULT DISPLAY COMPONENT
// ============================================================================

interface ResultDisplayProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  colors: string[];
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({
  title,
  value,
  subtitle,
  icon,
  colors,
}) => (
  <LinearGradient
    colors={colors}
    start={{x: 0, y: 0}}
    end={{x: 1, y: 1}}
    style={styles.resultCard}>
    <View style={styles.resultIconContainer}>
      <Icon name={icon} size={24} color="#FFF" />
    </View>
    <View style={styles.resultContent}>
      <Text style={styles.resultTitle}>{title}</Text>
      <Text style={styles.resultValue}>{value}</Text>
      {subtitle && <Text style={styles.resultSubtitle}>{subtitle}</Text>}
    </View>
  </LinearGradient>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const GradeConverterCard: React.FC<GradeConverterProps> = ({onConvert}) => {
  // State
  const [mode, setMode] = useState<ConversionMode>('cgpa-to-percent');
  const [cgpaInput, setCgpaInput] = useState('');
  const [percentInput, setPercentInput] = useState('');
  const [cgpaScale, setCgpaScale] = useState<CGPAScale>('4.0');
  const [selectedOGrades, setSelectedOGrades] = useState<string[]>([]);
  const [selectedAGrades, setSelectedAGrades] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const [showReference, setShowReference] = useState(false);

  // Animation
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Mode configuration
  const modeConfig = {
    'cgpa-to-percent': {
      title: 'CGPA → Percentage',
      icon: 'calculator-outline',
      colors: ['#4573DF', '#3660C9'],
    },
    'percent-to-cgpa': {
      title: 'Percentage → CGPA',
      icon: 'trending-up-outline',
      colors: ['#10B981', '#059669'],
    },
    'o-level': {
      title: 'O-Level → Matric',
      icon: 'school-outline',
      colors: ['#F59E0B', '#D97706'],
    },
    'a-level': {
      title: 'A-Level → Inter',
      icon: 'ribbon-outline',
      colors: ['#4573DF', '#3660C9'],
    },
  };

  // Handle CGPA to Percentage conversion
  const handleCGPAConvert = useCallback(() => {
    const cgpa = parseFloat(cgpaInput);
    if (isNaN(cgpa) || cgpa < 0 || cgpa > 4) {
      setResult({error: 'Please enter a valid CGPA (0-4)'});
      return;
    }

    try {
      const conversion = cgpaToPercentage(cgpa, cgpaScale);
      setResult({
        type: 'cgpa-to-percent',
        input: cgpa,
        ...conversion,
      });

      Animated.spring(fadeAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();

      onConvert?.(conversion);
    } catch (error: any) {
      setResult({error: error.message});
    }
  }, [cgpaInput, cgpaScale, fadeAnim, onConvert]);

  // Handle Percentage to CGPA conversion
  const handlePercentConvert = useCallback(() => {
    const percent = parseFloat(percentInput);
    if (isNaN(percent) || percent < 0 || percent > 100) {
      setResult({error: 'Please enter a valid percentage (0-100)'});
      return;
    }

    try {
      const conversion = percentageToCGPA(percent, cgpaScale);
      setResult({
        type: 'percent-to-cgpa',
        input: percent,
        ...conversion,
      });

      Animated.spring(fadeAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();

      onConvert?.(conversion);
    } catch (error: any) {
      setResult({error: error.message});
    }
  }, [percentInput, cgpaScale, fadeAnim, onConvert]);

  // Handle O-Level conversion
  const handleOLevelConvert = useCallback(() => {
    if (selectedOGrades.length === 0) {
      setResult({error: 'Please select at least one grade'});
      return;
    }

    const conversion = convertOLevelToMatric(selectedOGrades);
    setResult({
      type: 'o-level',
      grades: selectedOGrades,
      ...conversion,
    });

    Animated.spring(fadeAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();

    onConvert?.(conversion);
  }, [selectedOGrades, fadeAnim, onConvert]);

  // Handle A-Level conversion
  const handleALevelConvert = useCallback(() => {
    if (selectedAGrades.length === 0) {
      setResult({error: 'Please select at least one grade'});
      return;
    }

    const conversion = convertALevelToInter(selectedAGrades);
    setResult({
      type: 'a-level',
      grades: selectedAGrades,
      ...conversion,
    });

    Animated.spring(fadeAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();

    onConvert?.(conversion);
  }, [selectedAGrades, fadeAnim, onConvert]);

  // Toggle grade selection
  const toggleGrade = (grade: string, isOLevel: boolean) => {
    if (isOLevel) {
      setSelectedOGrades(prev =>
        prev.includes(grade)
          ? prev.filter(g => g !== grade)
          : [...prev, grade]
      );
    } else {
      setSelectedAGrades(prev =>
        prev.includes(grade)
          ? prev.filter(g => g !== grade)
          : [...prev, grade]
      );
    }
  };

  // Clear all
  const handleClear = () => {
    setCgpaInput('');
    setPercentInput('');
    setSelectedOGrades([]);
    setSelectedAGrades([]);
    setResult(null);
    fadeAnim.setValue(0);
  };

  // Render mode tabs
  const renderModeTabs = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.tabContainer}>
      {(Object.keys(modeConfig) as ConversionMode[]).map(m => (
        <TouchableOpacity
          key={m}
          onPress={() => {
            setMode(m);
            setResult(null);
            fadeAnim.setValue(0);
          }}
          style={[styles.tab, mode === m && styles.tabActive]}
          activeOpacity={0.7}>
          <Icon
            name={modeConfig[m].icon}
            size={18}
            color={mode === m ? '#4573DF' : '#94A3B8'}
          />
          <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>
            {modeConfig[m].title}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // Render CGPA input
  const renderCGPAInput = () => (
    <View style={styles.inputSection}>
      <Text style={styles.inputLabel}>Enter CGPA</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.textInput}
          value={cgpaInput}
          onChangeText={setCgpaInput}
          placeholder="e.g., 3.50"
          placeholderTextColor="#94A3B8"
          keyboardType="decimal-pad"
          maxLength={4}
        />
        <Text style={styles.inputSuffix}>/ 4.00</Text>
      </View>

      {/* Scale Selector */}
      <View style={styles.scaleContainer}>
        <Text style={styles.scaleLabel}>Conversion Formula:</Text>
        <View style={styles.scaleButtons}>
          {(['4.0', 'hec'] as CGPAScale[]).map(scale => (
            <TouchableOpacity
              key={scale}
              onPress={() => setCgpaScale(scale)}
              style={[
                styles.scaleButton,
                cgpaScale === scale && styles.scaleButtonActive,
              ]}>
              <Text
                style={[
                  styles.scaleButtonText,
                  cgpaScale === scale && styles.scaleButtonTextActive,
                ]}>
                {scale === '4.0' ? 'Standard' : 'HEC Pakistan'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.convertButton}
        onPress={handleCGPAConvert}
        activeOpacity={0.8}>
        <LinearGradient
          colors={modeConfig['cgpa-to-percent'].colors}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.convertButtonGradient}>
          <Icon name="calculator-outline" size={20} color="#FFF" />
          <Text style={styles.convertButtonText}>Convert</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  // Render Percentage input
  const renderPercentInput = () => (
    <View style={styles.inputSection}>
      <Text style={styles.inputLabel}>Enter Percentage</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.textInput}
          value={percentInput}
          onChangeText={setPercentInput}
          placeholder="e.g., 85"
          placeholderTextColor="#94A3B8"
          keyboardType="decimal-pad"
          maxLength={5}
        />
        <Text style={styles.inputSuffix}>%</Text>
      </View>

      {/* Scale Selector */}
      <View style={styles.scaleContainer}>
        <Text style={styles.scaleLabel}>Target Scale:</Text>
        <View style={styles.scaleButtons}>
          {(['4.0', 'hec'] as CGPAScale[]).map(scale => (
            <TouchableOpacity
              key={scale}
              onPress={() => setCgpaScale(scale)}
              style={[
                styles.scaleButton,
                cgpaScale === scale && styles.scaleButtonActive,
              ]}>
              <Text
                style={[
                  styles.scaleButtonText,
                  cgpaScale === scale && styles.scaleButtonTextActive,
                ]}>
                {scale === '4.0' ? 'Standard 4.0' : 'HEC Scale'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.convertButton}
        onPress={handlePercentConvert}
        activeOpacity={0.8}>
        <LinearGradient
          colors={modeConfig['percent-to-cgpa'].colors}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.convertButtonGradient}>
          <Icon name="trending-up-outline" size={20} color="#FFF" />
          <Text style={styles.convertButtonText}>Convert</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  // Render O-Level input
  const renderOLevelInput = () => (
    <View style={styles.inputSection}>
      <Text style={styles.inputLabel}>Select Your O-Level Grades</Text>
      <Text style={styles.inputHint}>
        Tap grades for each subject (best 8 counted)
      </Text>

      <View style={styles.gradeGrid}>
        {O_LEVEL_REFERENCE.map(({grade}) => (
          <GradeButton
            key={grade}
            grade={grade}
            selected={selectedOGrades.includes(grade)}
            onPress={() => toggleGrade(grade, true)}
            color="#F59E0B"
          />
        ))}
      </View>

      <View style={styles.selectedGradesContainer}>
        <Text style={styles.selectedGradesLabel}>
          Selected: {selectedOGrades.length} subjects
        </Text>
        <Text style={styles.selectedGradesText}>
          {selectedOGrades.join(', ') || 'None'}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.convertButton}
        onPress={handleOLevelConvert}
        activeOpacity={0.8}>
        <LinearGradient
          colors={modeConfig['o-level'].colors}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.convertButtonGradient}>
          <Icon name="school-outline" size={20} color="#FFF" />
          <Text style={styles.convertButtonText}>Calculate Equivalence</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  // Render A-Level input
  const renderALevelInput = () => (
    <View style={styles.inputSection}>
      <Text style={styles.inputLabel}>Select Your A-Level Grades</Text>
      <Text style={styles.inputHint}>
        Tap grades for each subject (3 principal subjects)
      </Text>

      <View style={styles.gradeGrid}>
        {A_LEVEL_REFERENCE.map(({grade}) => (
          <GradeButton
            key={grade}
            grade={grade}
            selected={selectedAGrades.includes(grade)}
            onPress={() => toggleGrade(grade, false)}
            color="#4573DF"
          />
        ))}
      </View>

      <View style={styles.selectedGradesContainer}>
        <Text style={styles.selectedGradesLabel}>
          Selected: {selectedAGrades.length} subjects
        </Text>
        <Text style={styles.selectedGradesText}>
          {selectedAGrades.join(', ') || 'None'}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.convertButton}
        onPress={handleALevelConvert}
        activeOpacity={0.8}>
        <LinearGradient
          colors={modeConfig['a-level'].colors}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.convertButtonGradient}>
          <Icon name="ribbon-outline" size={20} color="#FFF" />
          <Text style={styles.convertButtonText}>Calculate Equivalence</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  // Render result
  const renderResult = () => {
    if (!result) return null;

    if (result.error) {
      return (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={24} color="#EF4444" />
          <Text style={styles.errorText}>{result.error}</Text>
        </View>
      );
    }

    return (
      <Animated.View style={[styles.resultSection, {opacity: fadeAnim}]}>
        {result.type === 'cgpa-to-percent' && (
          <>
            <ResultDisplay
              title="Equivalent Percentage"
              value={`${result.value}%`}
              subtitle={`Grade: ${result.grade} • ${result.remarks}`}
              icon="trending-up-outline"
              colors={modeConfig['cgpa-to-percent'].colors}
            />
            <View style={styles.formulaNote}>
              <Icon name="information-circle-outline" size={16} color="#64748B" />
              <Text style={styles.formulaNoteText}>
                {cgpaScale === 'hec'
                  ? 'HEC Formula: (CGPA × 20) + 10'
                  : 'Standard: (CGPA / 4.0) × 100'}
              </Text>
            </View>
          </>
        )}

        {result.type === 'percent-to-cgpa' && (
          <>
            <ResultDisplay
              title="Equivalent CGPA"
              value={result.value.toFixed(2)}
              subtitle={`Grade: ${result.grade} • ${result.remarks}`}
              icon="calculator-outline"
              colors={modeConfig['percent-to-cgpa'].colors}
            />
            <View style={styles.formulaNote}>
              <Icon name="information-circle-outline" size={16} color="#64748B" />
              <Text style={styles.formulaNoteText}>
                {cgpaScale === 'hec'
                  ? 'HEC Formula: (Percentage - 10) / 20'
                  : 'Standard: (Percentage / 100) × 4.0'}
              </Text>
            </View>
          </>
        )}

        {result.type === 'o-level' && (
          <>
            <ResultDisplay
              title="Matric Equivalent"
              value={`${result.equivalentMarks} / ${result.totalMarks}`}
              subtitle={`${result.percentage}% • Grade: ${result.grade}`}
              icon="school-outline"
              colors={modeConfig['o-level'].colors}
            />
            <View style={styles.breakdownCard}>
              <Text style={styles.breakdownTitle}>IBCC Calculation</Text>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Total Points:</Text>
                <Text style={styles.breakdownValue}>
                  {result.totalPoints} / {result.maxPoints}
                </Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Subjects:</Text>
                <Text style={styles.breakdownValue}>{result.grades.length}</Text>
              </View>
            </View>
          </>
        )}

        {result.type === 'a-level' && (
          <>
            <ResultDisplay
              title="Intermediate Equivalent"
              value={`${result.equivalentMarks} / ${result.totalMarks}`}
              subtitle={`${result.percentage}% • Grade: ${result.grade}`}
              icon="ribbon-outline"
              colors={modeConfig['a-level'].colors}
            />
            <View style={styles.breakdownCard}>
              <Text style={styles.breakdownTitle}>IBCC Calculation</Text>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Total Points:</Text>
                <Text style={styles.breakdownValue}>
                  {result.totalPoints} / {result.maxPoints}
                </Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Subjects:</Text>
                <Text style={styles.breakdownValue}>{result.grades.length}</Text>
              </View>
            </View>
          </>
        )}

        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClear}
          activeOpacity={0.7}>
          <Icon name="refresh-outline" size={18} color="#64748B" />
          <Text style={styles.clearButtonText}>Clear & Start Over</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Render reference table
  const renderReferenceTable = () => (
    <View style={styles.referenceSection}>
      <TouchableOpacity
        style={styles.referenceToggle}
        onPress={() => setShowReference(!showReference)}
        activeOpacity={0.7}>
        <Icon
          name={showReference ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#4573DF"
        />
        <Text style={styles.referenceToggleText}>
          {showReference ? 'Hide' : 'Show'} Reference Table
        </Text>
      </TouchableOpacity>

      {showReference && (
        <View style={styles.referenceTable}>
          <View style={styles.referenceHeader}>
            <Text style={[styles.referenceCell, styles.referenceHeaderText]}>
              CGPA
            </Text>
            <Text style={[styles.referenceCell, styles.referenceHeaderText]}>
              Standard %
            </Text>
            <Text style={[styles.referenceCell, styles.referenceHeaderText]}>
              HEC %
            </Text>
            <Text style={[styles.referenceCell, styles.referenceHeaderText]}>
              Grade
            </Text>
          </View>
          {CGPA_REFERENCE_TABLE.map((row, index) => (
            <View
              key={index}
              style={[
                styles.referenceRow,
                index % 2 === 0 && styles.referenceRowEven,
              ]}>
              <Text style={styles.referenceCell}>{row.cgpa}</Text>
              <Text style={styles.referenceCell}>{row.percentage4}</Text>
              <Text style={styles.referenceCell}>{row.percentageHEC}</Text>
              <Text style={[styles.referenceCell, styles.referenceCellGrade]}>
                {row.grade}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="swap-horizontal-outline" size={24} color="#4573DF" />
        <Text style={styles.headerTitle}>Grade Converter</Text>
      </View>

      {/* Mode Tabs */}
      {renderModeTabs()}

      {/* Input Section */}
      {mode === 'cgpa-to-percent' && renderCGPAInput()}
      {mode === 'percent-to-cgpa' && renderPercentInput()}
      {mode === 'o-level' && renderOLevelInput()}
      {mode === 'a-level' && renderALevelInput()}

      {/* Result Section */}
      {renderResult()}

      {/* Reference Table */}
      {(mode === 'cgpa-to-percent' || mode === 'percent-to-cgpa') &&
        renderReferenceTable()}
    </View>
  );
};

// ============================================================================
// COMPACT CONVERTER (For embedding in other screens)
// ============================================================================

interface CompactConverterProps {
  mode?: 'cgpa' | 'percent';
}

export const CompactGradeConverter: React.FC<CompactConverterProps> = ({
  mode = 'cgpa',
}) => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<string>('');

  const handleConvert = () => {
    const value = parseFloat(input);
    if (isNaN(value)) {
      setResult('Invalid input');
      return;
    }

    try {
      if (mode === 'cgpa') {
        const conv = cgpaToPercentage(value, 'hec');
        setResult(`${conv.value}% (${conv.grade})`);
      } else {
        const conv = percentageToCGPA(value, 'hec');
        setResult(`${conv.value} CGPA (${conv.grade})`);
      }
    } catch {
      setResult('Error');
    }
  };

  return (
    <View style={styles.compactContainer}>
      <View style={styles.compactInputRow}>
        <TextInput
          style={styles.compactInput}
          value={input}
          onChangeText={setInput}
          placeholder={mode === 'cgpa' ? 'CGPA' : '%'}
          placeholderTextColor="#94A3B8"
          keyboardType="decimal-pad"
        />
        <TouchableOpacity
          style={styles.compactButton}
          onPress={handleConvert}>
          <Icon name="arrow-forward" size={16} color="#FFF" />
        </TouchableOpacity>
      </View>
      {result ? (
        <Text style={styles.compactResult}>{result}</Text>
      ) : null}
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginVertical: SPACING.md,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: SPACING.sm,
  },
  tabContainer: {
    marginBottom: SPACING.lg,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: '#F1F5F9',
    marginRight: SPACING.sm,
  },
  tabActive: {
    backgroundColor: '#EEF2FF',
  },
  tabText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#64748B',
    marginLeft: 6,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#4573DF',
    fontWeight: '600',
  },
  inputSection: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING.sm,
  },
  inputHint: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#64748B',
    marginBottom: SPACING.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: '#1E293B',
  },
  inputSuffix: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: '#64748B',
    marginLeft: SPACING.sm,
    fontWeight: '500',
  },
  scaleContainer: {
    marginTop: SPACING.md,
  },
  scaleLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#64748B',
    marginBottom: SPACING.xs,
  },
  scaleButtons: {
    flexDirection: 'row',
  },
  scaleButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    backgroundColor: '#F1F5F9',
    marginRight: SPACING.sm,
  },
  scaleButtonActive: {
    backgroundColor: '#4573DF',
  },
  scaleButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#64748B',
    fontWeight: '500',
  },
  scaleButtonTextActive: {
    color: '#FFF',
  },
  gradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  gradeButton: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  gradeButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    color: '#64748B',
  },
  gradeButtonTextSelected: {
    color: '#FFF',
  },
  selectedGradesContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  selectedGradesLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#64748B',
    marginBottom: 4,
  },
  selectedGradesText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: '#1E293B',
  },
  convertButton: {
    marginTop: SPACING.md,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  convertButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
  },
  convertButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    color: '#FFF',
    marginLeft: SPACING.sm,
  },
  resultSection: {
    marginTop: SPACING.md,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  resultIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  resultTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  resultValue: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: '800',
    color: '#FFF',
  },
  resultSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  formulaNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  formulaNoteText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#64748B',
    marginLeft: 6,
    fontStyle: 'italic',
  },
  breakdownCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  breakdownTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: '#475569',
    marginBottom: SPACING.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  breakdownLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#64748B',
  },
  breakdownValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: '#1E293B',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
  },
  clearButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#64748B',
    marginLeft: 6,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#EF4444',
    marginLeft: SPACING.sm,
  },
  referenceSection: {
    marginTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: SPACING.md,
  },
  referenceToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
  },
  referenceToggleText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#4573DF',
    fontWeight: '600',
    marginLeft: 4,
  },
  referenceTable: {
    marginTop: SPACING.md,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  referenceHeader: {
    flexDirection: 'row',
    backgroundColor: '#4573DF',
    paddingVertical: SPACING.sm,
  },
  referenceHeaderText: {
    color: '#FFF',
    fontWeight: '700',
  },
  referenceRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  referenceRowEven: {
    backgroundColor: '#F8FAFC',
  },
  referenceCell: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#475569',
    textAlign: 'center',
  },
  referenceCellGrade: {
    fontWeight: '600',
    color: '#4573DF',
  },
  // Compact styles
  compactContainer: {
    padding: SPACING.sm,
  },
  compactInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#1E293B',
  },
  compactButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4573DF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  compactResult: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
});

export default GradeConverterCard;



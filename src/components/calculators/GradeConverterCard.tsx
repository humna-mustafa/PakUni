/**
 * Grade Converter Card Component
 * Multi-Subject Aggregate, O/A Level Equivalence
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
  convertOLevelToMatric,
  convertALevelToInter,
  O_LEVEL_REFERENCE,
  A_LEVEL_REFERENCE,
} from '../../utils/gradeConversion';
import {TYPOGRAPHY, RADIUS, SPACING} from '../../constants/design';

// ============================================================================
// TYPES
// ============================================================================

type ConversionMode = 'o-level' | 'a-level';

interface SubjectGrade {
  id: number;
  subjectName: string;
  grade: string;
}

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
  // Default O-Level subjects (8 subjects standard)
  const defaultOLevelSubjects: SubjectGrade[] = [
    {id: 1, subjectName: 'English Language', grade: ''},
    {id: 2, subjectName: 'Urdu', grade: ''},
    {id: 3, subjectName: 'Mathematics', grade: ''},
    {id: 4, subjectName: 'Physics', grade: ''},
    {id: 5, subjectName: 'Chemistry', grade: ''},
    {id: 6, subjectName: 'Biology', grade: ''},
    {id: 7, subjectName: 'Islamiat', grade: ''},
    {id: 8, subjectName: 'Pakistan Studies', grade: ''},
  ];

  // Default A-Level subjects (3 principal subjects)
  const defaultALevelSubjects: SubjectGrade[] = [
    {id: 1, subjectName: 'Subject 1', grade: ''},
    {id: 2, subjectName: 'Subject 2', grade: ''},
    {id: 3, subjectName: 'Subject 3', grade: ''},
  ];

  // State
  const [mode, setMode] = useState<ConversionMode>('o-level');
  const [oLevelSubjects, setOLevelSubjects] = useState<SubjectGrade[]>(defaultOLevelSubjects);
  const [aLevelSubjects, setALevelSubjects] = useState<SubjectGrade[]>(defaultALevelSubjects);
  const [result, setResult] = useState<any>(null);
  const [showReference, setShowReference] = useState(false);

  // Animation
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Mode configuration - removed multi-subject, kept only O-Level and A-Level
  const modeConfig = {
    'o-level': {
      title: 'O-Level → Matric',
      icon: 'school-outline',
      colors: ['#F59E0B', '#D97706'],
    },
    'a-level': {
      title: 'A-Level → Inter',
      icon: 'ribbon-outline',
      colors: ['#10B981', '#059669'],
    },
  };

  // Handle O-Level conversion with per-subject grades
  const handleOLevelConvert = useCallback(() => {
    const subjectsWithGrades = oLevelSubjects.filter(s => s.grade !== '');
    if (subjectsWithGrades.length === 0) {
      setResult({error: 'Please select grades for at least one subject'});
      return;
    }

    const grades = subjectsWithGrades.map(s => s.grade);
    const conversion = convertOLevelToMatric(grades);
    setResult({
      type: 'o-level',
      grades: grades,
      subjects: subjectsWithGrades,
      ...conversion,
    });

    Animated.spring(fadeAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();

    onConvert?.(conversion);
  }, [oLevelSubjects, fadeAnim, onConvert]);

  // Handle A-Level conversion with per-subject grades
  const handleALevelConvert = useCallback(() => {
    const subjectsWithGrades = aLevelSubjects.filter(s => s.grade !== '');
    if (subjectsWithGrades.length === 0) {
      setResult({error: 'Please select grades for at least one subject'});
      return;
    }

    const grades = subjectsWithGrades.map(s => s.grade);
    const conversion = convertALevelToInter(grades);
    setResult({
      type: 'a-level',
      grades: grades,
      subjects: subjectsWithGrades,
      ...conversion,
    });

    Animated.spring(fadeAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();

    onConvert?.(conversion);
  }, [aLevelSubjects, fadeAnim, onConvert]);

  // Update subject grade
  const updateSubjectGrade = (id: number, grade: string, isOLevel: boolean) => {
    if (isOLevel) {
      setOLevelSubjects(prev => prev.map(s => s.id === id ? {...s, grade} : s));
    } else {
      setALevelSubjects(prev => prev.map(s => s.id === id ? {...s, grade} : s));
    }
  };

  // Add new subject
  const addSubject = (isOLevel: boolean) => {
    if (isOLevel) {
      const newId = Math.max(...oLevelSubjects.map(s => s.id)) + 1;
      setOLevelSubjects(prev => [...prev, {id: newId, subjectName: `Subject ${newId}`, grade: ''}]);
    } else {
      const newId = Math.max(...aLevelSubjects.map(s => s.id)) + 1;
      setALevelSubjects(prev => [...prev, {id: newId, subjectName: `Subject ${newId}`, grade: ''}]);
    }
  };

  // Remove subject
  const removeSubject = (id: number, isOLevel: boolean) => {
    if (isOLevel) {
      if (oLevelSubjects.length > 1) {
        setOLevelSubjects(prev => prev.filter(s => s.id !== id));
      }
    } else {
      if (aLevelSubjects.length > 1) {
        setALevelSubjects(prev => prev.filter(s => s.id !== id));
      }
    }
  };

  // Clear all
  const handleClear = () => {
    setOLevelSubjects(defaultOLevelSubjects);
    setALevelSubjects(defaultALevelSubjects);
    setResult(null);
    fadeAnim.setValue(0);
  };

  // Render mode tabs - only O-Level and A-Level
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

  // Render O-Level input with per-subject grade selection
  const renderOLevelInput = () => (
    <View style={styles.inputSection}>
      <Text style={styles.inputLabel}>Enter Your O-Level Grades</Text>
      <Text style={styles.inputHint}>
        Select a grade for each subject (best 8 counted by IBCC)
      </Text>

      <View style={styles.subjectsList}>
        {oLevelSubjects.map((subject, index) => (
          <View key={subject.id} style={styles.subjectGradeRow}>
            <Text style={styles.subjectNumber}>{index + 1}.</Text>
            <TextInput
              style={styles.subjectNameInput}
              value={subject.subjectName}
              onChangeText={(text) => setOLevelSubjects(prev => 
                prev.map(s => s.id === subject.id ? {...s, subjectName: text} : s)
              )}
              placeholder="Subject name"
              placeholderTextColor="#94A3B8"
            />
            <View style={styles.gradePickerContainer}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.gradePickerScroll}>
                {O_LEVEL_REFERENCE.map(({grade}) => (
                  <TouchableOpacity
                    key={grade}
                    onPress={() => updateSubjectGrade(subject.id, grade, true)}
                    style={[
                      styles.gradeChip,
                      subject.grade === grade && styles.gradeChipSelected,
                    ]}>
                    <Text style={[
                      styles.gradeChipText,
                      subject.grade === grade && styles.gradeChipTextSelected,
                    ]}>
                      {grade}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            {oLevelSubjects.length > 1 && (
              <TouchableOpacity
                style={styles.removeSubjectBtn}
                onPress={() => removeSubject(subject.id, true)}>
                <Icon name="close-circle" size={20} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.addSubjectButton}
        onPress={() => addSubject(true)}>
        <Icon name="add-circle-outline" size={20} color="#4573DF" />
        <Text style={styles.addSubjectText}>Add Another Subject</Text>
      </TouchableOpacity>

      <View style={styles.selectedSummary}>
        <Text style={styles.selectedSummaryLabel}>
          Subjects with grades: {oLevelSubjects.filter(s => s.grade !== '').length} / {oLevelSubjects.length}
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
          <Text style={styles.convertButtonText}>Calculate Matric Equivalent</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  // Render A-Level input with per-subject grade selection
  const renderALevelInput = () => (
    <View style={styles.inputSection}>
      <Text style={styles.inputLabel}>Enter Your A-Level Grades</Text>
      <Text style={styles.inputHint}>
        Select a grade for each principal subject (typically 3 subjects)
      </Text>

      <View style={styles.subjectsList}>
        {aLevelSubjects.map((subject, index) => (
          <View key={subject.id} style={styles.subjectGradeRow}>
            <Text style={styles.subjectNumber}>{index + 1}.</Text>
            <TextInput
              style={styles.subjectNameInput}
              value={subject.subjectName}
              onChangeText={(text) => setALevelSubjects(prev => 
                prev.map(s => s.id === subject.id ? {...s, subjectName: text} : s)
              )}
              placeholder="Subject name"
              placeholderTextColor="#94A3B8"
            />
            <View style={styles.gradePickerContainer}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.gradePickerScroll}>
                {A_LEVEL_REFERENCE.map(({grade}) => (
                  <TouchableOpacity
                    key={grade}
                    onPress={() => updateSubjectGrade(subject.id, grade, false)}
                    style={[
                      styles.gradeChip,
                      subject.grade === grade && styles.gradeChipSelectedALevel,
                    ]}>
                    <Text style={[
                      styles.gradeChipText,
                      subject.grade === grade && styles.gradeChipTextSelected,
                    ]}>
                      {grade}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            {aLevelSubjects.length > 1 && (
              <TouchableOpacity
                style={styles.removeSubjectBtn}
                onPress={() => removeSubject(subject.id, false)}>
                <Icon name="close-circle" size={20} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.addSubjectButton}
        onPress={() => addSubject(false)}>
        <Icon name="add-circle-outline" size={20} color="#10B981" />
        <Text style={[styles.addSubjectText, {color: '#10B981'}]}>Add Another Subject</Text>
      </TouchableOpacity>

      <View style={styles.selectedSummary}>
        <Text style={styles.selectedSummaryLabel}>
          Subjects with grades: {aLevelSubjects.filter(s => s.grade !== '').length} / {aLevelSubjects.length}
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
          <Text style={styles.convertButtonText}>Calculate Inter Equivalent</Text>
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
              {result.subjects && (
                <View style={styles.subjectsBreakdown}>
                  <Text style={styles.breakdownSubtitle}>Subject Grades:</Text>
                  {result.subjects.map((s: SubjectGrade, i: number) => (
                    <View key={i} style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>{s.subjectName}:</Text>
                      <Text style={styles.breakdownValue}>{s.grade}</Text>
                    </View>
                  ))}
                </View>
              )}
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
              {result.subjects && (
                <View style={styles.subjectsBreakdown}>
                  <Text style={styles.breakdownSubtitle}>Subject Grades:</Text>
                  {result.subjects.map((s: SubjectGrade, i: number) => (
                    <View key={i} style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>{s.subjectName}:</Text>
                      <Text style={styles.breakdownValue}>{s.grade}</Text>
                    </View>
                  ))}
                </View>
              )}
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="swap-horizontal-outline" size={24} color="#4573DF" />
        <Text style={styles.headerTitle}>Grade Converter</Text>
      </View>

      {/* Mode Tabs */}
      {renderModeTabs()}

      {/* Input Section - Only O-Level and A-Level */}
      {mode === 'o-level' && renderOLevelInput()}
      {mode === 'a-level' && renderALevelInput()}

      {/* Result Section */}
      {renderResult()}
    </View>
  );
};

// ============================================================================
// COMPACT CONVERTER (For embedding in other screens)
// ============================================================================

interface CompactConverterProps {
  placeholder?: string;
}

export const CompactGradeConverter: React.FC<CompactConverterProps> = ({
  placeholder = 'Enter marks',
}) => {
  const [obtained, setObtained] = useState('');
  const [total, setTotal] = useState('100');
  const [result, setResult] = useState<string>('');

  const handleConvert = () => {
    const obtainedNum = parseFloat(obtained);
    const totalNum = parseFloat(total);
    
    if (isNaN(obtainedNum) || isNaN(totalNum) || totalNum <= 0) {
      setResult('Invalid input');
      return;
    }

    const percentage = Math.round((obtainedNum / totalNum) * 100 * 10) / 10;
    const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : percentage >= 50 ? 'D' : 'F';
    setResult(`${percentage}% (${grade})`);
  };

  return (
    <View style={styles.compactContainer}>
      <View style={styles.compactInputRow}>
        <TextInput
          style={styles.compactInput}
          value={obtained}
          onChangeText={setObtained}
          placeholder="Marks"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
        />
        <Text style={styles.compactDivider}>/</Text>
        <TextInput
          style={styles.compactInput}
          value={total}
          onChangeText={setTotal}
          placeholder="Total"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
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
  // Multi-subject styles
  subjectsList: {
    marginBottom: SPACING.md,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  subjectName: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
    color: '#475569',
  },
  subjectMarksRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectInput: {
    width: 55,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
  subjectDivider: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: '#94A3B8',
    marginHorizontal: 4,
    fontWeight: '600',
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
  compactDivider: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: '#94A3B8',
    marginHorizontal: 6,
    fontWeight: '600',
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
  // Per-subject grade selection styles
  subjectGradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  subjectNumber: {
    width: 24,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: '#64748B',
  },
  subjectNameInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#1E293B',
    marginRight: SPACING.sm,
  },
  gradePickerContainer: {
    width: 180,
  },
  gradePickerScroll: {
    flexGrow: 0,
  },
  gradeChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 4,
  },
  gradeChipSelected: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  gradeChipSelectedALevel: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  gradeChipText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    color: '#64748B',
  },
  gradeChipTextSelected: {
    color: '#FFF',
  },
  removeSubjectBtn: {
    marginLeft: SPACING.sm,
    padding: 4,
  },
  addSubjectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
  },
  addSubjectText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: '#4573DF',
    marginLeft: SPACING.xs,
  },
  selectedSummary: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  selectedSummaryLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#64748B',
    fontWeight: '500',
  },
  subjectsBreakdown: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  breakdownSubtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
});

export default GradeConverterCard;



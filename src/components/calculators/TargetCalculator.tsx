/**
 * Target Calculator
 * "To get into NUST, you need 87% in entry test"
 * Calculates required scores to achieve target aggregate
 * Enhanced with actual merit data from meritArchive
 */

import React, {useState, useEffect, useCallback, useMemo} from 'react';
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
import {TYPOGRAPHY, RADIUS, SPACING} from '../../constants/design';
import {useTheme} from '../../contexts';
import {MERIT_RECORDS} from '../../data/meritArchive';

// ============================================================================
// MERIT DATA HELPERS
// ============================================================================

// Get recent merit data for a university
const getUniversityMeritData = (universityShortName: string) => {
  const uniRecords = MERIT_RECORDS.filter(
    r => r.universityShortName.toUpperCase() === universityShortName.toUpperCase()
  );
  if (uniRecords.length === 0) return null;

  // Get most recent year's records
  const years = [...new Set(uniRecords.map(r => r.year))].sort((a, b) => b - a);
  const latestYear = years[0];
  const latestRecords = uniRecords.filter(r => r.year === latestYear);

  // Calculate average closing merit
  const avgMerit = latestRecords.reduce((sum, r) => sum + r.closingMerit, 0) / latestRecords.length;

  // Get range
  const minMerit = Math.min(...latestRecords.map(r => r.closingMerit));
  const maxMerit = Math.max(...latestRecords.map(r => r.closingMerit));

  return {
    year: latestYear,
    avgMerit: Math.round(avgMerit * 10) / 10,
    minMerit: Math.round(minMerit * 10) / 10,
    maxMerit: Math.round(maxMerit * 10) / 10,
    totalPrograms: latestRecords.length,
    session: latestRecords[0]?.session || 'Fall',
  };
};

// ============================================================================
// TYPES
// ============================================================================

interface UniversityFormula {
  id: string;
  name: string;
  shortName: string;
  matricWeight: number;
  interWeight: number;
  testWeight: number;
  testName: string;
  minAggregate?: number;
  icon?: string;
  color: string;
}

interface TargetResult {
  requiredTestScore: number;
  currentAggregate: number;
  targetAggregate: number;
  achievable: boolean;
  message: string;
  breakdown: {
    matricContribution: number;
    interContribution: number;
    testContribution: number;
  };
}

interface TargetCalculatorProps {
  onCalculate?: (result: TargetResult) => void;
}

// ============================================================================
// UNIVERSITY FORMULAS DATA
// ============================================================================

const UNIVERSITY_FORMULAS: UniversityFormula[] = [
  {
    id: 'nust',
    name: 'NUST (NET)',
    shortName: 'NUST',
    matricWeight: 10,
    interWeight: 15,
    testWeight: 75,
    testName: 'NET',
    minAggregate: 75,
    icon: 'school-outline',
    color: '#4573DF',
  },
  {
    id: 'fast',
    name: 'FAST-NUCES',
    shortName: 'FAST',
    matricWeight: 10,
    interWeight: 40,
    testWeight: 50,
    testName: 'FAST Test',
    minAggregate: 65,
    icon: 'flash-outline',
    color: '#DC2626',
  },
  {
    id: 'giki',
    name: 'GIKI',
    shortName: 'GIKI',
    matricWeight: 15,
    interWeight: 25,
    testWeight: 60,
    testName: 'GIKI Test',
    minAggregate: 65,
    icon: 'construct-outline',
    color: '#059669',
  },
  {
    id: 'lums',
    name: 'LUMS (SBASSE)',
    shortName: 'LUMS',
    matricWeight: 0,
    interWeight: 30,
    testWeight: 70,
    testName: 'SAT/LCAT',
    minAggregate: 70,
    icon: 'star-outline',
    color: '#3660C9',
  },
  {
    id: 'comsats',
    name: 'COMSATS',
    shortName: 'COMSATS',
    matricWeight: 20,
    interWeight: 40,
    testWeight: 40,
    testName: 'NTS',
    minAggregate: 45,
    icon: 'globe-outline',
    color: '#0891B2',
  },
  {
    id: 'uet-lahore',
    name: 'UET Lahore (ECAT)',
    shortName: 'UET',
    matricWeight: 10,
    interWeight: 40,
    testWeight: 50,
    testName: 'ECAT',
    minAggregate: 60,
    icon: 'hardware-chip-outline',
    color: '#CA8A04',
  },
  {
    id: 'pieas',
    name: 'PIEAS',
    shortName: 'PIEAS',
    matricWeight: 10,
    interWeight: 15,
    testWeight: 75,
    testName: 'PIEAS Test',
    minAggregate: 70,
    icon: 'nuclear-outline',
    color: '#BE185D',
  },
  {
    id: 'iba',
    name: 'IBA Karachi',
    shortName: 'IBA',
    matricWeight: 0,
    interWeight: 50,
    testWeight: 50,
    testName: 'IBA Test',
    minAggregate: 60,
    icon: 'business-outline',
    color: '#4338CA',
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const TargetCalculator: React.FC<TargetCalculatorProps> = ({onCalculate}) => {
  const {colors, isDark} = useTheme();

  // State
  const [selectedUniversity, setSelectedUniversity] = useState<UniversityFormula | null>(null);
  const [matricPercent, setMatricPercent] = useState('');
  const [interPercent, setInterPercent] = useState('');
  const [targetAggregate, setTargetAggregate] = useState('');
  const [result, setResult] = useState<TargetResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Animation
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  // Dark mode styles
  const themeStyles = useMemo(() => ({
    container: {
      backgroundColor: colors.card,
    },
    headerTitle: {
      color: colors.text,
    },
    headerSubtitle: {
      color: colors.textSecondary,
    },
    sectionTitle: {
      color: colors.textSecondary,
    },
    uniCardUnselected: {
      colors: isDark ? [colors.surfaceContainer, colors.surfaceContainerHigh] : ['#F1F5F9', '#E2E8F0'],
    },
    uniName: {
      color: colors.textSecondary,
    },
    uniTest: {
      color: colors.textMuted,
    },
    inputLabel: {
      color: colors.textSecondary,
    },
    textInput: {
      backgroundColor: colors.inputBackground,
      borderColor: colors.inputBorder,
      color: colors.inputText,
    },
    weightLabel: {
      color: colors.textMuted,
    },
    targetSuffix: {
      color: colors.textSecondary,
    },
    hintText: {
      color: colors.success,
    },
    messageCard: {
      backgroundColor: isDark ? colors.surfaceContainer : '#F8FAFC',
    },
    messageText: {
      color: colors.textSecondary,
    },
    breakdownSection: {
      backgroundColor: isDark ? colors.surfaceContainer : '#F8FAFC',
    },
    breakdownTitle: {
      color: colors.text,
    },
    breakdownLabel: {
      color: colors.textMuted,
    },
    breakdownValue: {
      color: colors.textSecondary,
    },
    breakdownValueBold: {
      color: colors.text,
    },
    totalRow: {
      borderTopColor: colors.divider,
    },
    totalLabel: {
      color: colors.text,
    },
    formulaBox: {
      backgroundColor: isDark ? colors.primaryLight : '#EEF2FF',
    },
    formulaTitle: {
      color: colors.primary,
    },
    formulaText: {
      color: isDark ? '#93C5FD' : '#4338CA',
    },
  }), [colors, isDark]);

  // Pulse animation for achievable result
  useEffect(() => {
    if (result?.achievable) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [result, pulseAnim]);

  // Calculate required test score - only called on button press
  const calculateTarget = useCallback(() => {
    if (!selectedUniversity) {
      return;
    }

    const matric = parseFloat(matricPercent);
    const inter = parseFloat(interPercent);

    // Validate inputs properly
    if (isNaN(matric) || isNaN(inter) || matric < 0 || matric > 100 || inter < 0 || inter > 100) {
      setResult(null);
      return;
    }

    const target = parseFloat(targetAggregate) || selectedUniversity.minAggregate || 60;

    // Clamp target to valid range
    const clampedTarget = Math.min(100, Math.max(0, target));

    // Calculate current contribution from matric and inter
    const matricContribution = (matric * selectedUniversity.matricWeight) / 100;
    const interContribution = (inter * selectedUniversity.interWeight) / 100;
    const currentWithoutTest = matricContribution + interContribution;

    // Calculate required test contribution
    const requiredTestContribution = clampedTarget - currentWithoutTest;
    const requiredTestScore = selectedUniversity.testWeight > 0
      ? (requiredTestContribution * 100) / selectedUniversity.testWeight
      : 0;

    // Determine if achievable (need between 0 and 100 in test)
    const achievable = requiredTestScore >= 0 && requiredTestScore <= 100;

    // Generate accurate message based on the math
    let message = '';
    const maxPossibleAggregate = currentWithoutTest + selectedUniversity.testWeight;
    
    if (requiredTestScore > 100) {
      message = `Even with 100% in ${selectedUniversity.testName}, your max aggregate is ${maxPossibleAggregate.toFixed(1)}%. Target ${clampedTarget}% is not reachable with current academic scores. Consider improving intermediate marks.`;
    } else if (requiredTestScore < 0) {
      message = `Great news! Your academic scores alone give you ${currentWithoutTest.toFixed(1)}% aggregate — already above your ${clampedTarget}% target! Any score in ${selectedUniversity.testName} adds more.`;
    } else if (requiredTestScore <= 40) {
      message = `Very achievable! You only need ${Math.ceil(requiredTestScore)}% in ${selectedUniversity.testName}. Your strong academics carry most of the weight.`;
    } else if (requiredTestScore <= 60) {
      message = `Achievable with focused preparation. You need ${Math.ceil(requiredTestScore)}% in ${selectedUniversity.testName} — a solid, realistic target.`;
    } else if (requiredTestScore <= 80) {
      message = `Challenging but possible. ${Math.ceil(requiredTestScore)}% in ${selectedUniversity.testName} requires dedicated preparation. Start early!`;
    } else {
      message = `Tough target. You need ${Math.ceil(requiredTestScore)}% in ${selectedUniversity.testName}. Consider intensive prep and also apply to backup universities.`;
    }

    const targetResult: TargetResult = {
      requiredTestScore: Math.max(0, Math.min(100, requiredTestScore)),
      currentAggregate: currentWithoutTest,
      targetAggregate: clampedTarget,
      achievable,
      message,
      breakdown: {
        matricContribution,
        interContribution,
        testContribution: Math.max(0, requiredTestContribution),
      },
    };

    setResult(targetResult);
    onCalculate?.(targetResult);

    // Animate result
    slideAnim.setValue(0);
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, [selectedUniversity, matricPercent, interPercent, targetAggregate, slideAnim, onCalculate]);

  // Clear result when university changes
  useEffect(() => {
    setResult(null);
  }, [selectedUniversity]);

  // Check if calculate button should be enabled
  const canCalculate = selectedUniversity && matricPercent.trim() !== '' && interPercent.trim() !== '';

  // Render university selector
  const renderUniversitySelector = () => (
    <View style={styles.selectorSection}>
      <Text style={[styles.sectionTitle, {color: themeStyles.sectionTitle.color}]}>Select University</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.universityScroll}>
        {UNIVERSITY_FORMULAS.map(uni => (
          <TouchableOpacity
            key={uni.id}
            onPress={() => setSelectedUniversity(uni)}
            activeOpacity={0.8}>
            <LinearGradient
              colors={
                selectedUniversity?.id === uni.id
                  ? [uni.color, uni.color + 'DD']
                  : themeStyles.uniCardUnselected.colors
              }
              style={[
                styles.universityCard,
                selectedUniversity?.id === uni.id && styles.universityCardSelected,
              ]}>
              <Icon
                name={uni.icon || 'school-outline'}
                size={24}
                color={selectedUniversity?.id === uni.id ? '#FFF' : uni.color}
              />
              <Text
                style={[
                  styles.universityName,
                  {color: themeStyles.uniName.color},
                  selectedUniversity?.id === uni.id && styles.universityNameSelected,
                ]}>
                {uni.shortName}
              </Text>
              <Text
                style={[
                  styles.universityTest,
                  {color: themeStyles.uniTest.color},
                  selectedUniversity?.id === uni.id && styles.universityTestSelected,
                ]}>
                {uni.testName}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Render input section
  const renderInputSection = () => (
    <View style={styles.inputSection}>
      <Text style={[styles.sectionTitle, {color: themeStyles.sectionTitle.color}]}>Your Academic Scores</Text>
      
      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, {color: themeStyles.inputLabel.color}]}>Matric %</Text>
          <TextInput
            style={[styles.textInput, themeStyles.textInput]}
            value={matricPercent}
            onChangeText={setMatricPercent}
            placeholder="e.g., 92"
            placeholderTextColor={colors.placeholder}
            keyboardType="decimal-pad"
            maxLength={5}
          />
          {selectedUniversity && (
            <Text style={[styles.weightLabel, {color: themeStyles.weightLabel.color}]}>
              Weight: {selectedUniversity.matricWeight}%
            </Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, {color: themeStyles.inputLabel.color}]}>Inter %</Text>
          <TextInput
            style={[styles.textInput, themeStyles.textInput]}
            value={interPercent}
            onChangeText={setInterPercent}
            placeholder="e.g., 85"
            placeholderTextColor={colors.placeholder}
            keyboardType="decimal-pad"
            maxLength={5}
          />
          {selectedUniversity && (
            <Text style={[styles.weightLabel, {color: themeStyles.weightLabel.color}]}>
              Weight: {selectedUniversity.interWeight}%
            </Text>
          )}
        </View>
      </View>

      <View style={styles.targetRow}>
        <Text style={[styles.inputLabel, {color: themeStyles.inputLabel.color}]}>Target Aggregate</Text>
        <View style={styles.targetInputRow}>
          <TextInput
            style={[styles.textInput, styles.targetInput, themeStyles.textInput]}
            value={targetAggregate}
            onChangeText={setTargetAggregate}
            placeholder={selectedUniversity?.minAggregate?.toString() || '60'}
            placeholderTextColor={colors.placeholder}
            keyboardType="decimal-pad"
            maxLength={5}
          />
          <Text style={[styles.targetSuffix, {color: themeStyles.targetSuffix.color}]}>%</Text>
        </View>
        {selectedUniversity?.minAggregate && (
          <Text style={[styles.hintText, {color: themeStyles.hintText.color}]}>
            Min. for {selectedUniversity.shortName}: {selectedUniversity.minAggregate}%
          </Text>
        )}
        {/* Merit-based target suggestions */}
        {selectedUniversity && (() => {
          const meritData = getUniversityMeritData(selectedUniversity.shortName);
          if (!meritData) return null;
          return (
            <View style={styles.meritSuggestionsContainer}>
              <Text style={[styles.meritSuggestionLabel, {color: colors.textSecondary}]}>
                Based on {meritData.year} {meritData.session} merit data:
              </Text>
              <View style={styles.meritChipsRow}>
                <TouchableOpacity 
                  style={[styles.meritChip, {backgroundColor: colors.success + '15', borderColor: colors.success}]}
                  onPress={() => setTargetAggregate(meritData.minMerit.toString())}>
                  <Text style={[styles.meritChipText, {color: colors.success}]}>Safe: {meritData.minMerit}%</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.meritChip, {backgroundColor: colors.warning + '15', borderColor: colors.warning}]}
                  onPress={() => setTargetAggregate(meritData.avgMerit.toString())}>
                  <Text style={[styles.meritChipText, {color: colors.warning}]}>Avg: {meritData.avgMerit}%</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.meritChip, {backgroundColor: colors.error + '15', borderColor: colors.error}]}
                  onPress={() => setTargetAggregate(meritData.maxMerit.toString())}>
                  <Text style={[styles.meritChipText, {color: colors.error}]}>Top: {meritData.maxMerit}%</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })()}
      </View>

      {/* Calculate Button */}
      <TouchableOpacity
        onPress={calculateTarget}
        disabled={!canCalculate}
        activeOpacity={0.8}
        style={styles.calculateButton}>
        <LinearGradient
          colors={canCalculate ? [colors.primary, colors.primaryDark] : [colors.textMuted, colors.textMuted]}
          style={styles.calculateButtonGradient}>
          <Icon name="calculator-outline" size={20} color="#FFF" />
          <Text style={styles.calculateButtonText}>Calculate Required Score</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  // Render result section
  const renderResultSection = () => {
    if (!result) return null;

    return (
      <Animated.View
        style={[
          styles.resultSection,
          {
            opacity: slideAnim,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}>
        {/* Main Result Card */}
        <Animated.View style={{transform: [{scale: result.achievable ? pulseAnim : 1}]}}>
          <LinearGradient
            colors={
              result.achievable
                ? result.requiredTestScore <= 70
                  ? ['#10B981', '#059669']
                  : ['#F59E0B', '#D97706']
                : ['#EF4444', '#DC2626']
            }
            style={styles.mainResultCard}>
            <View style={styles.resultHeader}>
              <Icon
                name={
                  result.achievable
                    ? result.requiredTestScore <= 70
                      ? 'checkmark-circle'
                      : 'alert-circle'
                    : 'close-circle'
                }
                size={32}
                color="#FFF"
              />
              <View style={styles.resultHeaderText}>
                <Text style={styles.resultSubtitle}>
                  To get into {selectedUniversity?.shortName}, you need
                </Text>
                <Text style={styles.resultScore}>
                  {result.achievable
                    ? `${Math.ceil(result.requiredTestScore)}%`
                    : 'Not achievable'}
                </Text>
                <Text style={styles.resultTestName}>
                  in {selectedUniversity?.testName}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Message Card */}
        <View style={[styles.messageCard, themeStyles.messageCard]}>
          <Icon
            name="bulb-outline"
            size={20}
            color={result.achievable ? colors.success : colors.error}
          />
          <Text style={[styles.messageText, {color: themeStyles.messageText.color}]}>{result.message}</Text>
        </View>

        {/* Breakdown Toggle */}
        <TouchableOpacity
          style={styles.detailsToggle}
          onPress={() => setShowDetails(!showDetails)}
          activeOpacity={0.7}>
          <Icon
            name={showDetails ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.primary}
          />
          <Text style={[styles.detailsToggleText, {color: colors.primary}]}>
            {showDetails ? 'Hide' : 'Show'} Calculation Breakdown
          </Text>
        </TouchableOpacity>

        {/* Detailed Breakdown */}
        {showDetails && (
          <View style={[styles.breakdownSection, themeStyles.breakdownSection]}>
            <Text style={[styles.breakdownTitle, {color: themeStyles.breakdownTitle.color}]}>Aggregate Breakdown</Text>
            
            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLabelRow}>
                <Icon name="school-outline" size={16} color={colors.textMuted} />
                <Text style={[styles.breakdownLabel, {color: themeStyles.breakdownLabel.color}]}>Matric Contribution</Text>
              </View>
              <Text style={[styles.breakdownValue, {color: themeStyles.breakdownValue.color}]}>
                {matricPercent}% × {selectedUniversity?.matricWeight}% ={' '}
                <Text style={[styles.breakdownValueBold, {color: themeStyles.breakdownValueBold.color}]}>
                  {result.breakdown.matricContribution.toFixed(2)}
                </Text>
              </Text>
            </View>

            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLabelRow}>
                <Icon name="book-outline" size={16} color={colors.textMuted} />
                <Text style={[styles.breakdownLabel, {color: themeStyles.breakdownLabel.color}]}>Inter Contribution</Text>
              </View>
              <Text style={[styles.breakdownValue, {color: themeStyles.breakdownValue.color}]}>
                {interPercent}% × {selectedUniversity?.interWeight}% ={' '}
                <Text style={[styles.breakdownValueBold, {color: themeStyles.breakdownValueBold.color}]}>
                  {result.breakdown.interContribution.toFixed(2)}
                </Text>
              </Text>
            </View>

            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLabelRow}>
                <Icon name="create-outline" size={16} color={colors.primary} />
                <Text style={[styles.breakdownLabel, {color: colors.primary}]}>
                  Required Test Contribution
                </Text>
              </View>
              <Text style={[styles.breakdownValue, {color: themeStyles.breakdownValue.color}]}>
                {Math.ceil(result.requiredTestScore)}% × {selectedUniversity?.testWeight}% ={' '}
                <Text style={[styles.breakdownValueBold, {color: colors.primary}]}>
                  {result.breakdown.testContribution.toFixed(2)}
                </Text>
              </Text>
            </View>

            <View style={[styles.totalRow, {borderTopColor: themeStyles.totalRow.borderTopColor}]}>
              <Text style={[styles.totalLabel, {color: themeStyles.totalLabel.color}]}>Target Aggregate</Text>
              <Text style={[styles.totalValue, {color: colors.primary}]}>
                {result.targetAggregate.toFixed(1)}%
              </Text>
            </View>

            <View style={[styles.formulaBox, themeStyles.formulaBox]}>
              <Text style={[styles.formulaTitle, {color: themeStyles.formulaTitle.color}]}>Formula Used:</Text>
              <Text style={[styles.formulaText, {color: themeStyles.formulaText.color}]}>
                Aggregate = (Matric × {selectedUniversity?.matricWeight}%) + 
                (Inter × {selectedUniversity?.interWeight}%) + 
                ({selectedUniversity?.testName} × {selectedUniversity?.testWeight}%)
              </Text>
            </View>
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, themeStyles.container]}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.headerIcon}>
          <Icon name="trophy-outline" size={24} color="#FFF" />
        </LinearGradient>
        <View style={styles.headerText}>
          <Text style={[styles.headerTitle, {color: themeStyles.headerTitle.color}]}>Target Calculator</Text>
          <Text style={[styles.headerSubtitle, {color: themeStyles.headerSubtitle.color}]}>
            Find out what you need to score
          </Text>
        </View>
      </View>

      {/* University Selector */}
      {renderUniversitySelector()}

      {/* Input Section */}
      {selectedUniversity && renderInputSection()}

      {/* Result Section */}
      {renderResultSection()}
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginVertical: SPACING.md,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: SPACING.md,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#64748B',
    marginTop: 2,
  },
  selectorSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#475569',
    marginBottom: SPACING.sm,
  },
  universityScroll: {
    marginHorizontal: -SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  universityCard: {
    width: 100,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  universityCardSelected: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  universityName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#475569',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  universityNameSelected: {
    color: '#FFF',
  },
  universityTest: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#94A3B8',
    marginTop: 2,
  },
  universityTestSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  inputSection: {
    marginBottom: SPACING.lg,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputGroup: {
    flex: 1,
    marginRight: SPACING.md,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#475569',
    marginBottom: SPACING.xs,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#1E293B',
  },
  weightLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#94A3B8',
    marginTop: 4,
  },
  targetRow: {
    marginTop: SPACING.md,
  },
  targetInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetInput: {
    flex: 1,
    maxWidth: 120,
  },
  targetSuffix: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#64748B',
    marginLeft: SPACING.sm,
  },
  hintText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#10B981',
    marginTop: 4,
  },
  meritSuggestionsContainer: {
    marginTop: SPACING.sm,
  },
  meritSuggestionLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginBottom: 6,
  },
  meritChipsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  meritChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  meritChipText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  calculateButton: {
    marginTop: SPACING.lg,
  },
  calculateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
  },
  calculateButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFF',
  },
  resultSection: {
    marginTop: SPACING.md,
  },
  mainResultCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultHeaderText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  resultSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
  },
  resultScore: {
    fontSize: 40,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#FFF',
    marginVertical: 4,
  },
  resultTestName: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  messageCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  messageText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#475569',
    marginLeft: SPACING.sm,
    lineHeight: 20,
  },
  detailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
  },
  detailsToggleText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#4573DF',
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginLeft: 4,
  },
  breakdownSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  breakdownTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#1E293B',
    marginBottom: SPACING.md,
  },
  breakdownItem: {
    marginBottom: SPACING.md,
  },
  breakdownLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  breakdownLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#64748B',
    marginLeft: 6,
  },
  breakdownValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#475569',
    marginLeft: 22,
  },
  breakdownValueBold: {
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#1E293B',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: SPACING.md,
    marginTop: SPACING.sm,
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#1E293B',
  },
  totalValue: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#4573DF',
  },
  formulaBox: {
    backgroundColor: '#EEF2FF',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  formulaTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#4573DF',
    marginBottom: 4,
  },
  formulaText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#4338CA',
    lineHeight: 18,
  },
});

export default TargetCalculator;



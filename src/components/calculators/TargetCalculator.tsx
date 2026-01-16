/**
 * Target Calculator
 * "To get into NUST, you need 87% in entry test"
 * Calculates required scores to achieve target aggregate
 */

import React, {useState, useEffect, useCallback} from 'react';
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
    minAggregate: 60,
    icon: 'school-outline',
    color: '#1E40AF',
  },
  {
    id: 'fast',
    name: 'FAST-NUCES',
    shortName: 'FAST',
    matricWeight: 10,
    interWeight: 40,
    testWeight: 50,
    testName: 'FAST Test',
    minAggregate: 50,
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
    color: '#7C3AED',
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

  // Calculate required test score
  const calculateTarget = useCallback(() => {
    if (!selectedUniversity) {
      return;
    }

    const matric = parseFloat(matricPercent);
    const inter = parseFloat(interPercent);
    const target = parseFloat(targetAggregate) || selectedUniversity.minAggregate || 60;

    if (isNaN(matric) || isNaN(inter)) {
      setResult(null);
      return;
    }

    // Calculate current contribution from matric and inter
    const matricContribution = (matric * selectedUniversity.matricWeight) / 100;
    const interContribution = (inter * selectedUniversity.interWeight) / 100;
    const currentWithoutTest = matricContribution + interContribution;

    // Calculate required test contribution
    const requiredTestContribution = target - currentWithoutTest;
    const requiredTestScore = (requiredTestContribution * 100) / selectedUniversity.testWeight;

    // Determine if achievable
    const achievable = requiredTestScore >= 0 && requiredTestScore <= 100;

    // Generate message
    let message = '';
    if (requiredTestScore > 100) {
      message = `Even with 100% in ${selectedUniversity.testName}, you can only reach ${(currentWithoutTest + selectedUniversity.testWeight).toFixed(1)}% aggregate. Consider improving your intermediate score or targeting a different program.`;
    } else if (requiredTestScore < 0) {
      message = `Great news! You've already exceeded your target with your academic scores. Any score in ${selectedUniversity.testName} will give you ${target}%+ aggregate!`;
    } else if (requiredTestScore <= 50) {
      message = `Very achievable! A moderate score of ${Math.ceil(requiredTestScore)}% in ${selectedUniversity.testName} will get you to ${selectedUniversity.shortName}! 🎯`;
    } else if (requiredTestScore <= 70) {
      message = `Challenging but doable! Focus on ${selectedUniversity.testName} preparation. You need a strong ${Math.ceil(requiredTestScore)}%. 💪`;
    } else if (requiredTestScore <= 85) {
      message = `Tough target! You'll need an excellent ${Math.ceil(requiredTestScore)}% in ${selectedUniversity.testName}. Intensive prep recommended! 📚`;
    } else {
      message = `Very challenging! ${Math.ceil(requiredTestScore)}% in ${selectedUniversity.testName} is required. Consider backup options too. 🎯`;
    }

    const targetResult: TargetResult = {
      requiredTestScore: Math.max(0, Math.min(100, requiredTestScore)),
      currentAggregate: currentWithoutTest,
      targetAggregate: target,
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

  // Auto-calculate when inputs change
  useEffect(() => {
    if (selectedUniversity && matricPercent && interPercent) {
      calculateTarget();
    }
  }, [selectedUniversity, matricPercent, interPercent, targetAggregate, calculateTarget]);

  // Render university selector
  const renderUniversitySelector = () => (
    <View style={styles.selectorSection}>
      <Text style={styles.sectionTitle}>Select University</Text>
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
                  : ['#F1F5F9', '#E2E8F0']
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
                  selectedUniversity?.id === uni.id && styles.universityNameSelected,
                ]}>
                {uni.shortName}
              </Text>
              <Text
                style={[
                  styles.universityTest,
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
      <Text style={styles.sectionTitle}>Your Academic Scores</Text>
      
      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Matric %</Text>
          <TextInput
            style={styles.textInput}
            value={matricPercent}
            onChangeText={setMatricPercent}
            placeholder="e.g., 92"
            placeholderTextColor="#94A3B8"
            keyboardType="decimal-pad"
            maxLength={5}
          />
          {selectedUniversity && (
            <Text style={styles.weightLabel}>
              Weight: {selectedUniversity.matricWeight}%
            </Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Inter %</Text>
          <TextInput
            style={styles.textInput}
            value={interPercent}
            onChangeText={setInterPercent}
            placeholder="e.g., 85"
            placeholderTextColor="#94A3B8"
            keyboardType="decimal-pad"
            maxLength={5}
          />
          {selectedUniversity && (
            <Text style={styles.weightLabel}>
              Weight: {selectedUniversity.interWeight}%
            </Text>
          )}
        </View>
      </View>

      <View style={styles.targetRow}>
        <Text style={styles.inputLabel}>Target Aggregate</Text>
        <View style={styles.targetInputRow}>
          <TextInput
            style={[styles.textInput, styles.targetInput]}
            value={targetAggregate}
            onChangeText={setTargetAggregate}
            placeholder={selectedUniversity?.minAggregate?.toString() || '60'}
            placeholderTextColor="#94A3B8"
            keyboardType="decimal-pad"
            maxLength={5}
          />
          <Text style={styles.targetSuffix}>%</Text>
        </View>
        {selectedUniversity?.minAggregate && (
          <Text style={styles.hintText}>
            Min. for {selectedUniversity.shortName}: {selectedUniversity.minAggregate}%
          </Text>
        )}
      </View>
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
        <View style={styles.messageCard}>
          <Icon
            name="bulb-outline"
            size={20}
            color={result.achievable ? '#10B981' : '#EF4444'}
          />
          <Text style={styles.messageText}>{result.message}</Text>
        </View>

        {/* Breakdown Toggle */}
        <TouchableOpacity
          style={styles.detailsToggle}
          onPress={() => setShowDetails(!showDetails)}
          activeOpacity={0.7}>
          <Icon
            name={showDetails ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#6366F1"
          />
          <Text style={styles.detailsToggleText}>
            {showDetails ? 'Hide' : 'Show'} Calculation Breakdown
          </Text>
        </TouchableOpacity>

        {/* Detailed Breakdown */}
        {showDetails && (
          <View style={styles.breakdownSection}>
            <Text style={styles.breakdownTitle}>Aggregate Breakdown</Text>
            
            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLabelRow}>
                <Icon name="school-outline" size={16} color="#64748B" />
                <Text style={styles.breakdownLabel}>Matric Contribution</Text>
              </View>
              <Text style={styles.breakdownValue}>
                {matricPercent}% × {selectedUniversity?.matricWeight}% ={' '}
                <Text style={styles.breakdownValueBold}>
                  {result.breakdown.matricContribution.toFixed(2)}
                </Text>
              </Text>
            </View>

            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLabelRow}>
                <Icon name="book-outline" size={16} color="#64748B" />
                <Text style={styles.breakdownLabel}>Inter Contribution</Text>
              </View>
              <Text style={styles.breakdownValue}>
                {interPercent}% × {selectedUniversity?.interWeight}% ={' '}
                <Text style={styles.breakdownValueBold}>
                  {result.breakdown.interContribution.toFixed(2)}
                </Text>
              </Text>
            </View>

            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLabelRow}>
                <Icon name="create-outline" size={16} color="#6366F1" />
                <Text style={[styles.breakdownLabel, {color: '#6366F1'}]}>
                  Required Test Contribution
                </Text>
              </View>
              <Text style={styles.breakdownValue}>
                {Math.ceil(result.requiredTestScore)}% × {selectedUniversity?.testWeight}% ={' '}
                <Text style={[styles.breakdownValueBold, {color: '#6366F1'}]}>
                  {result.breakdown.testContribution.toFixed(2)}
                </Text>
              </Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Target Aggregate</Text>
              <Text style={styles.totalValue}>
                {result.targetAggregate.toFixed(1)}%
              </Text>
            </View>

            <View style={styles.formulaBox}>
              <Text style={styles.formulaTitle}>Formula Used:</Text>
              <Text style={styles.formulaText}>
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          style={styles.headerIcon}>
          <Icon name="trophy-outline" size={24} color="#FFF" />
        </LinearGradient>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Target Calculator</Text>
          <Text style={styles.headerSubtitle}>
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
    fontWeight: '700',
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
    fontWeight: '600',
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
    fontWeight: '700',
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
    fontWeight: '600',
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
    fontWeight: '600',
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
    fontWeight: '600',
    color: '#64748B',
    marginLeft: SPACING.sm,
  },
  hintText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#10B981',
    marginTop: 4,
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
    fontWeight: '800',
    color: '#FFF',
    marginVertical: 4,
  },
  resultTestName: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
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
    color: '#6366F1',
    fontWeight: '600',
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
    fontWeight: '700',
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
    fontWeight: '700',
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
    fontWeight: '700',
    color: '#1E293B',
  },
  totalValue: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '800',
    color: '#6366F1',
  },
  formulaBox: {
    backgroundColor: '#EEF2FF',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  formulaTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    color: '#6366F1',
    marginBottom: 4,
  },
  formulaText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#4338CA',
    lineHeight: 18,
  },
});

export default TargetCalculator;

/**
 * SimpleMeritCalculator - Built-in merit calculator with custom formula support.
 */
import React, {useState, useEffect} from 'react';
import {View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Platform, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Icon} from '../icons';
import {TYPOGRAPHY, RADIUS, SPACING} from '../../constants/design';

interface CustomFormula {
  id: string;
  name: string;
  shortName: string;
  matricWeight: number;
  interWeight: number;
  testWeight: number;
  testName: string;
  color: string;
}

const DEFAULT_FORMULA: CustomFormula = {
  id: 'default', name: 'Standard Formula', shortName: 'STD',
  matricWeight: 10, interWeight: 50, testWeight: 40, testName: 'Entry Test', color: '#4573DF',
};

const FORMULAS_STORAGE_KEY = '@pakuni_custom_formulas';

interface Props {
  onClose: () => void;
  colors: any;
}

const SimpleMeritCalculator: React.FC<Props> = ({onClose, colors}) => {
  const [matricMarks, setMatricMarks] = useState('');
  const [matricTotal, setMatricTotal] = useState('1100');
  const [interMarks, setInterMarks] = useState('');
  const [interTotal, setInterTotal] = useState('1100');
  const [testMarks, setTestMarks] = useState('');
  const [testTotal, setTestTotal] = useState('200');
  const [result, setResult] = useState<number | null>(null);
  const [customFormulas, setCustomFormulas] = useState<CustomFormula[]>([]);
  const [selectedFormula, setSelectedFormula] = useState<CustomFormula>(DEFAULT_FORMULA);
  const [showFormulaSelector, setShowFormulaSelector] = useState(false);

  useEffect(() => {
    const loadFormulas = async () => {
      try {
        const data = await AsyncStorage.getItem(FORMULAS_STORAGE_KEY);
        if (data) setCustomFormulas(JSON.parse(data));
      } catch (error) {
        console.error('Error loading custom formulas:', error);
      }
    };
    loadFormulas();
  }, []);

  const validateNumericInput = (value: string, fieldName: string): number | null => {
    if (!value || value.trim() === '') return null;
    const num = parseFloat(value);
    if (isNaN(num)) { Alert.alert('Invalid Input', `${fieldName} must be a valid number.`); return null; }
    if (num < 0) { Alert.alert('Invalid Input', `${fieldName} cannot be negative.`); return null; }
    return num;
  };

  const handleNumericInput = (setter: (val: string) => void) => (text: string) => {
    setter(text.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'));
  };

  const calculateMerit = () => {
    const matric = validateNumericInput(matricMarks, 'Matric Obtained Marks');
    const mTotal = validateNumericInput(matricTotal, 'Matric Total Marks');
    const inter = validateNumericInput(interMarks, 'Inter Obtained Marks');
    const iTotal = validateNumericInput(interTotal, 'Inter Total Marks');
    const test = validateNumericInput(testMarks, 'Test Obtained Marks');
    const tTotal = validateNumericInput(testTotal, 'Test Total Marks');

    const matricVal = matric ?? (matricMarks === '' ? 0 : -1);
    const mTotalVal = mTotal ?? (matricTotal === '' ? 1100 : -1);
    const interVal = inter ?? (interMarks === '' ? 0 : -1);
    const iTotalVal = iTotal ?? (interTotal === '' ? 1100 : -1);
    const testVal = test ?? (testMarks === '' ? 0 : -1);
    const tTotalVal = tTotal ?? (testTotal === '' ? 200 : -1);

    if (matricVal < 0 || mTotalVal < 0 || interVal < 0 || iTotalVal < 0 || testVal < 0 || tTotalVal < 0) return;
    if (mTotalVal === 0) { Alert.alert('Invalid Input', 'Matric Total cannot be zero.'); return; }
    if (iTotalVal === 0) { Alert.alert('Invalid Input', 'Inter Total cannot be zero.'); return; }
    if (tTotalVal === 0 && testVal > 0) { Alert.alert('Invalid Input', 'Test Total cannot be zero when test marks are entered.'); return; }
    if (matricVal > mTotalVal) { Alert.alert('Invalid Input', `Matric Obtained (${matricVal}) exceeds Total (${mTotalVal}).`); return; }
    if (interVal > iTotalVal) { Alert.alert('Invalid Input', `Inter Obtained (${interVal}) exceeds Total (${iTotalVal}).`); return; }
    if (testVal > tTotalVal) { Alert.alert('Invalid Input', `Test Obtained (${testVal}) exceeds Total (${tTotalVal}).`); return; }

    const matricPercent = (matricVal / mTotalVal) * 100;
    const interPercent = (interVal / iTotalVal) * 100;
    const testPercent = tTotalVal > 0 ? (testVal / tTotalVal) * 100 : 0;
    const merit = (matricPercent * selectedFormula.matricWeight / 100) + (interPercent * selectedFormula.interWeight / 100) + (testPercent * selectedFormula.testWeight / 100);
    setResult(Math.min(100, Math.max(0, merit)));
  };

  const allFormulas = [DEFAULT_FORMULA, ...customFormulas];

  const renderMarksInput = (
    label: string, gradientColors: string[], iconName: string,
    obtained: string, setObtained: (v: string) => void,
    total: string, setTotal: (v: string) => void,
  ) => (
    <View style={[styles.inputCard, {backgroundColor: colors.card}]}>
      <View style={styles.inputRow}>
        <LinearGradient colors={gradientColors} style={styles.inputIcon}>
          <Icon name={iconName} family="Ionicons" size={20} color="#FFF" />
        </LinearGradient>
        <View style={styles.inputContent}>
          <Text style={[styles.inputLabel, {color: colors.textSecondary}]}>{label}</Text>
          <View style={styles.marksRow}>
            <View style={[styles.marksInput, {backgroundColor: colors.background}]}>
              <TextInput style={{color: colors.text, fontSize: 16, flex: 1, padding: 0}} placeholder="Obtained"
                placeholderTextColor={colors.textSecondary} keyboardType="numeric" value={obtained} onChangeText={handleNumericInput(setObtained)} />
            </View>
            <Text style={[styles.marksDivider, {color: colors.textSecondary}]}>/</Text>
            <View style={[styles.totalInput, {backgroundColor: colors.background}]}>
              <TextInput style={{color: colors.text, fontSize: 16, flex: 1, padding: 0}} placeholder="Total"
                placeholderTextColor={colors.textSecondary} keyboardType="numeric" value={total} onChangeText={handleNumericInput(setTotal)} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={[styles.closeBtn, {backgroundColor: colors.card}]} onPress={onClose}>
          <Icon name="arrow-back" family="Ionicons" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, {color: colors.text}]}>Merit Calculator</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Formula Selector */}
        <TouchableOpacity style={[styles.formulaBtn, {backgroundColor: colors.card, borderColor: selectedFormula.color}]}
          onPress={() => setShowFormulaSelector(!showFormulaSelector)}>
          <View style={[styles.formulaIcon, {backgroundColor: selectedFormula.color}]}>
            <Icon name="flask-outline" family="Ionicons" size={18} color="#FFF" />
          </View>
          <View style={{flex: 1, marginLeft: SPACING.md}}>
            <Text style={[{fontSize: 11, fontWeight: TYPOGRAPHY.weight.medium}, {color: colors.textSecondary}]}>Using Formula</Text>
            <Text style={[{fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.bold}, {color: colors.text}]}>{selectedFormula.name}</Text>
          </View>
          <Icon name={showFormulaSelector ? 'chevron-up' : 'chevron-down'} family="Ionicons" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {showFormulaSelector && (
          <View style={[styles.dropdown, {backgroundColor: colors.card}]}>
            {allFormulas.map((formula) => (
              <TouchableOpacity key={formula.id}
                style={[styles.formulaOption, selectedFormula.id === formula.id && {backgroundColor: formula.color + '20'}]}
                onPress={() => { setSelectedFormula(formula); setShowFormulaSelector(false); setResult(null); }}>
                <View style={[styles.formulaDot, {backgroundColor: formula.color}]} />
                <View style={{flex: 1}}>
                  <Text style={[{fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.semibold}, {color: colors.text}]}>{formula.name}</Text>
                  <Text style={[{fontSize: 11}, {color: colors.textSecondary}]}>{formula.matricWeight}% Matric + {formula.interWeight}% Inter + {formula.testWeight}% {formula.testName}</Text>
                </View>
                {selectedFormula.id === formula.id && <Icon name="checkmark-circle" family="Ionicons" size={20} color={formula.color} />}
              </TouchableOpacity>
            ))}
            {customFormulas.length === 0 && (
              <View style={styles.noCustom}>
                <Icon name="information-circle-outline" family="Ionicons" size={16} color={colors.textMuted} />
                <Text style={[{fontSize: 11, flex: 1}, {color: colors.textMuted}]}>Create custom formulas in the Custom Formula Builder tool</Text>
              </View>
            )}
          </View>
        )}

        {renderMarksInput('Matric Marks', ['#4573DF', '#3660C9'], 'school-outline', matricMarks, setMatricMarks, matricTotal, setMatricTotal)}
        {renderMarksInput('Inter Marks', ['#10B981', '#34D399'], 'book-outline', interMarks, setInterMarks, interTotal, setInterTotal)}
        {renderMarksInput('Entry Test Marks', ['#F59E0B', '#FBBF24'], 'document-text-outline', testMarks, setTestMarks, testTotal, setTestTotal)}

        <View style={[styles.formulaInfo, {backgroundColor: selectedFormula.color + '15'}]}>
          <Icon name="information-circle-outline" family="Ionicons" size={20} color={selectedFormula.color} />
          <Text style={[{fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.semibold, flex: 1}, {color: selectedFormula.color}]}>
            Formula: {selectedFormula.matricWeight}% Matric + {selectedFormula.interWeight}% Inter + {selectedFormula.testWeight}% {selectedFormula.testName}
          </Text>
        </View>

        <TouchableOpacity onPress={calculateMerit} accessibilityRole="button" accessibilityLabel="Calculate merit score">
          <LinearGradient colors={['#4573DF', '#3660C9']} style={styles.calculateBtn}>
            <Icon name="calculator-outline" family="Ionicons" size={24} color="#FFF" />
            <Text style={styles.calculateText}>Calculate Merit</Text>
          </LinearGradient>
        </TouchableOpacity>

        {result !== null && (
          <View style={[styles.resultCard, {backgroundColor: colors.card}]}>
            <Text style={[styles.resultLabel, {color: colors.textSecondary}]}>Your Merit Score</Text>
            <LinearGradient colors={result >= 75 ? ['#10B981', '#34D399'] : result >= 60 ? ['#F59E0B', '#FBBF24'] : ['#EF4444', '#F87171']} style={styles.resultBadge}>
              <Text style={styles.resultValue}>{result.toFixed(2)}%</Text>
            </LinearGradient>
            <Text style={[styles.resultHint, {color: colors.textSecondary}]}>
              {result >= 75 ? 'Excellent! Top university material!' : result >= 60 ? 'Good score! Keep improving!' : 'Keep working hard!'}
            </Text>
          </View>
        )}

        <View style={[styles.tipsCard, {backgroundColor: colors.card}]}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
            <Icon name="bulb-outline" family="Ionicons" size={20} color="#F59E0B" />
            <Text style={[styles.tipsTitle, {color: colors.text}]}>Quick Tips</Text>
          </View>
          {['Different universities have different formulas', 'Entry test weight varies (30-50% typically)', 'Use Custom Formula Builder for exact calculation'].map((tip, i) => (
            <View key={i} style={styles.tipItem}>
              <Icon name="checkmark-circle" family="Ionicons" size={16} color="#10B981" />
              <Text style={[styles.tipText, {color: colors.textSecondary}]}>{tip}</Text>
            </View>
          ))}
        </View>
        <View style={{height: 100}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingTop: Platform.OS === 'android' ? SPACING.lg : SPACING.md, paddingBottom: SPACING.sm, minHeight: 56},
  closeBtn: {width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md},
  title: {fontSize: 20, fontWeight: TYPOGRAPHY.weight.bold},
  content: {flex: 1, paddingHorizontal: SPACING.lg},
  formulaBtn: {flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 2},
  formulaIcon: {width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center'},
  dropdown: {borderRadius: RADIUS.lg, marginBottom: SPACING.md, overflow: 'hidden'},
  formulaOption: {flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)'},
  formulaDot: {width: 12, height: 12, borderRadius: 6, marginRight: SPACING.md},
  noCustom: {flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.sm},
  inputCard: {borderRadius: RADIUS.xl, padding: SPACING.md, marginBottom: SPACING.sm},
  inputRow: {flexDirection: 'row', alignItems: 'center'},
  inputIcon: {width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center'},
  inputContent: {flex: 1, marginLeft: SPACING.md},
  inputLabel: {fontSize: TYPOGRAPHY.sizes.sm, marginBottom: 4},
  marksRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  marksInput: {flex: 1, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm},
  totalInput: {width: 80, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm},
  marksDivider: {fontSize: 20, fontWeight: TYPOGRAPHY.weight.semibold},
  formulaInfo: {flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.lg, padding: SPACING.md, marginVertical: SPACING.md, gap: SPACING.sm},
  calculateBtn: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.xl, paddingVertical: SPACING.md, gap: SPACING.sm},
  calculateText: {fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.bold, color: '#FFF'},
  resultCard: {borderRadius: RADIUS.xl, padding: SPACING.xl, marginTop: SPACING.lg, alignItems: 'center'},
  resultLabel: {fontSize: TYPOGRAPHY.sizes.sm, marginBottom: SPACING.sm},
  resultBadge: {paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: RADIUS.xl},
  resultValue: {fontSize: 32, fontWeight: TYPOGRAPHY.weight.heavy, color: '#FFF'},
  resultHint: {fontSize: TYPOGRAPHY.sizes.sm, marginTop: SPACING.md, textAlign: 'center'},
  tipsCard: {borderRadius: RADIUS.xl, padding: SPACING.lg, marginTop: SPACING.lg},
  tipsTitle: {fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.bold, marginLeft: 8},
  tipItem: {flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm, gap: SPACING.sm},
  tipText: {fontSize: TYPOGRAPHY.sizes.sm, flex: 1, lineHeight: 18},
});

export default SimpleMeritCalculator;

import {useState, useMemo, useRef, useEffect, useCallback} from 'react';
import {Alert, Animated} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {MERIT_FORMULAS, EDUCATION_SYSTEMS} from '../data';
import type {MeritFormulaData} from '../data';
import {validateCalculatorForm} from '../utils/validation';
import {Haptics} from '../utils/haptics';
import {ANIMATION, ANIMATION as ANIM_CONSTANTS} from '../constants/design';
import {ANIMATION_SCALES} from '../constants/ui';
import {logger} from '../utils/logger';
import type {CalculationResult} from '../types/calculator';

const CALCULATOR_STORAGE_KEY = '@pakuni_calculator_inputs';
const CUSTOM_FORMULAS_STORAGE_KEY = '@pakuni_custom_formulas';

export const useCalculator = () => {
  // Input states
  const [matricMarks, setMatricMarks] = useState('');
  const [matricTotal, setMatricTotal] = useState('1100');
  const [interMarks, setInterMarks] = useState('');
  const [interTotal, setInterTotal] = useState('1100');
  const [entryTestMarks, setEntryTestMarks] = useState('');
  const [entryTestTotal, setEntryTestTotal] = useState('200');
  const [isHafiz, setIsHafiz] = useState(false);

  // Selection states
  const [selectedEducation, setSelectedEducation] = useState('fsc_pre_engineering');
  const [selectedFormula, setSelectedFormula] = useState<MeritFormulaData | null>(null);
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [customFormulas, setCustomFormulas] = useState<MeritFormulaData[]>([]);

  // Result
  const [results, setResults] = useState<CalculationResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Animations
  const resultsFadeAnim = useRef(new Animated.Value(0)).current;
  const hafizScaleAnim = useRef(new Animated.Value(1)).current;

  // Load saved inputs on mount
  useEffect(() => {
    const loadSavedInputs = async () => {
      try {
        const saved = await AsyncStorage.getItem(CALCULATOR_STORAGE_KEY);
        if (saved) {
          const data = JSON.parse(saved);
          if (data.matricMarks) setMatricMarks(data.matricMarks);
          if (data.matricTotal) setMatricTotal(data.matricTotal);
          if (data.interMarks) setInterMarks(data.interMarks);
          if (data.interTotal) setInterTotal(data.interTotal);
          if (data.entryTestMarks) setEntryTestMarks(data.entryTestMarks);
          if (data.entryTestTotal) setEntryTestTotal(data.entryTestTotal);
          if (data.isHafiz !== undefined) setIsHafiz(data.isHafiz);
          if (data.selectedEducation) setSelectedEducation(data.selectedEducation);
        }
      } catch (error) {
        logger.debug('Failed to load calculator inputs', error, 'Calculator');
      }
    };
    loadSavedInputs();
  }, []);

  // Save inputs whenever they change
  useEffect(() => {
    const saveInputs = async () => {
      try {
        const data = {
          matricMarks,
          matricTotal,
          interMarks,
          interTotal,
          entryTestMarks,
          entryTestTotal,
          isHafiz,
          selectedEducation,
        };
        await AsyncStorage.setItem(CALCULATOR_STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        logger.debug('Failed to save calculator inputs', error, 'Calculator');
      }
    };
    saveInputs();
  }, [matricMarks, matricTotal, interMarks, interTotal, entryTestMarks, entryTestTotal, isHafiz, selectedEducation]);

  // Load custom formulas from AsyncStorage
  const loadCustomFormulas = useCallback(async () => {
    try {
      const data = await AsyncStorage.getItem(CUSTOM_FORMULAS_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        const converted: MeritFormulaData[] = parsed.map((cf: any) => ({
          id: `custom_${cf.id}`,
          name: cf.name,
          university: `Custom: ${cf.name}`,
          description: 'Custom formula created by you',
          matric_weightage: cf.matricWeight,
          inter_weightage: cf.interWeight,
          entry_test_weightage: cf.testWeight,
          hafiz_bonus: 0,
          applicable_fields: ['All Programs'],
          entry_test_name: cf.testName,
          formula_expression: `Aggregate = (Matric × ${cf.matricWeight}%) + (Inter × ${cf.interWeight}%) + (${cf.testName} × ${cf.testWeight}%)`,
          official_link: '',
        }));
        setCustomFormulas(converted);
      } else {
        setCustomFormulas([]);
      }
    } catch (error) {
      logger.debug('Failed to load custom formulas', error, 'Calculator');
    }
  }, []);

  // Load custom formulas on mount
  useEffect(() => {
    loadCustomFormulas();
  }, [loadCustomFormulas]);

  // Reload custom formulas when formula modal opens
  useEffect(() => {
    if (showFormulaModal) {
      loadCustomFormulas();
    }
  }, [showFormulaModal, loadCustomFormulas]);

  // Filter formulas based on education system
  const applicableFormulas = useMemo(() => {
    const getKeywords = (edu: string): string[] => {
      if (edu.includes('medical')) return ['medical', 'mbbs', 'bds', 'nursing'];
      if (edu.includes('engineering')) return ['engineering', 'be', 'bsc engineering', 'bs engineering'];
      if (edu === 'ics') return ['computer', 'software', 'data science', 'ai', 'cyber', 'it'];
      if (edu === 'icom') return ['business', 'bba', 'commerce', 'bcom', 'accounting', 'finance', 'economics', 'bs programs'];
      if (edu === 'fa') return ['arts', 'humanities', 'social sciences', 'bs programs', 'ba', 'bsc', 'law', 'llb'];
      if (edu === 'dae') return ['engineering', 'dae'];
      if (edu === 'o_levels' || edu === 'a_levels') return ['all programs', 'business', 'computer', 'engineering', 'medical', 'arts', 'bs programs'];
      return ['business', 'bs programs', 'arts', 'commerce'];
    };

    const keywords = getKeywords(selectedEducation);

    return MERIT_FORMULAS.filter(
      f =>
        f.applicable_fields.some(field =>
          keywords.some(kw => field.toLowerCase().includes(kw)),
        ) || f.applicable_fields.includes('All Programs'),
    );
  }, [selectedEducation]);

  const calculateSingleFormula = useCallback((formula: MeritFormulaData): CalculationResult => {
    const matricPercent = (parseFloat(matricMarks) / parseFloat(matricTotal)) * 100;
    const interPercent = (parseFloat(interMarks) / parseFloat(interTotal)) * 100;
    const testPercent =
      formula.entry_test_weightage > 0
        ? (parseFloat(entryTestMarks || '0') / parseFloat(entryTestTotal)) * 100
        : 0;

    const matricContribution = (matricPercent * formula.matric_weightage) / 100;
    const interContribution = (interPercent * formula.inter_weightage) / 100;
    const testContribution = (testPercent * formula.entry_test_weightage) / 100;
    const hafizBonus = isHafiz ? formula.hafiz_bonus : 0;

    const aggregate = Math.min(
      matricContribution + interContribution + testContribution + hafizBonus,
      100,
    );

    return {
      aggregate,
      formula,
      breakdown: {
        matricContribution,
        interContribution,
        testContribution,
        hafizBonus,
      },
    };
  }, [matricMarks, matricTotal, interMarks, interTotal, entryTestMarks, entryTestTotal, isHafiz]);

  const calculateMerit = useCallback(() => {
    const validation = validateCalculatorForm({
      matricMarks,
      matricTotal,
      interMarks,
      interTotal,
      entryTestMarks: entryTestMarks || undefined,
      entryTestTotal: entryTestTotal || undefined,
    });

    if (!validation.isValid) {
      const errorMessages = Object.values(validation.errors).filter(Boolean);
      Alert.alert(
        'Invalid Input',
        errorMessages[0] || 'Please check your marks',
      );
      Haptics.error();
      return;
    }

    if (!matricMarks || !interMarks) {
      Alert.alert('Missing Information', 'Please enter your marks to calculate merit');
      Haptics.warning();
      return;
    }

    const matricNum = parseFloat(matricMarks);
    const interNum = parseFloat(interMarks);
    const matricTotalNum = parseFloat(matricTotal);
    const interTotalNum = parseFloat(interTotal);

    if (isNaN(matricNum) || isNaN(interNum) || isNaN(matricTotalNum) || isNaN(interTotalNum)) {
      Alert.alert('Invalid Input', 'Please enter valid numbers');
      Haptics.error();
      return;
    }

    if (matricNum < 0 || interNum < 0) {
      Alert.alert('Invalid Input', 'Marks cannot be negative');
      Haptics.error();
      return;
    }

    if (matricNum > matricTotalNum || interNum > interTotalNum) {
      Alert.alert('Invalid Marks', 'Marks cannot exceed total marks');
      Haptics.error();
      return;
    }

    Haptics.success();

    if (selectedFormula) {
      const result = calculateSingleFormula(selectedFormula);
      setResults([result]);
    } else {
      const allFormulas = [...applicableFormulas, ...customFormulas];
      const allResults = allFormulas.map(f => calculateSingleFormula(f));
      allResults.sort((a, b) => b.aggregate - a.aggregate);
      setResults(allResults);
    }

    setShowResults(true);

    Animated.timing(resultsFadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [matricMarks, matricTotal, interMarks, interTotal, entryTestMarks, entryTestTotal, selectedFormula, applicableFormulas, customFormulas, calculateSingleFormula, resultsFadeAnim]);

  const resetCalculator = useCallback(() => {
    Animated.timing(resultsFadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setMatricMarks('');
      setInterMarks('');
      setEntryTestMarks('');
      setIsHafiz(false);
      setResults([]);
      setShowResults(false);
      setSelectedFormula(null);
    });
  }, [resultsFadeAnim]);

  const toggleHafiz = useCallback(() => {
    Animated.sequence([
      Animated.spring(hafizScaleAnim, {
        toValue: ANIMATION_SCALES.CHIP_PRESS,
        ...ANIMATION.spring.snappy,
        useNativeDriver: true,
      }),
      Animated.spring(hafizScaleAnim, {
        toValue: 1,
        ...ANIMATION.spring.bouncy,
        useNativeDriver: true,
      }),
    ]).start();
    setIsHafiz(prev => !prev);
  }, [hafizScaleAnim]);

  const handleSelectEducation = useCallback((value: string) => {
    setSelectedEducation(value);
    setSelectedFormula(null);
  }, []);

  return {
    // Input state
    matricMarks,
    matricTotal,
    interMarks,
    interTotal,
    entryTestMarks,
    entryTestTotal,
    isHafiz,
    selectedEducation,
    // Input setters
    setMatricMarks,
    setMatricTotal,
    setInterMarks,
    setInterTotal,
    setEntryTestMarks,
    setEntryTestTotal,
    handleSelectEducation,
    // Formula state
    selectedFormula,
    setSelectedFormula,
    showFormulaModal,
    setShowFormulaModal,
    customFormulas,
    applicableFormulas,
    // Results
    results,
    showResults,
    // Animations
    resultsFadeAnim,
    hafizScaleAnim,
    // Actions
    calculateMerit,
    resetCalculator,
    toggleHafiz,
    // Education systems data
    educationSystems: EDUCATION_SYSTEMS,
  };
};

import React, {useState, useMemo, useRef, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Icon} from '../components/icons';
import {logger} from '../utils/logger';
import {MeritSuccessCard} from '../components/ShareableCard';
import {TYPOGRAPHY, SPACING, RADIUS, ANIMATION} from '../constants/design';
import {ANIMATION_SCALES} from '../constants/ui';
import {useTheme} from '../contexts/ThemeContext';
import {MERIT_FORMULAS, EDUCATION_SYSTEMS} from '../data';
import type {MeritFormulaData} from '../data';
import {validateCalculatorForm, createNumericInputHandler} from '../utils/validation';
import {Haptics} from '../utils/haptics';
import {shareMeritSuccessCard, getChanceLevel} from '../services/share';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 375;
const isMediumScreen = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;

// Storage key for persisting calculator inputs
const CALCULATOR_STORAGE_KEY = '@pakuni_calculator_inputs';

interface CalculationResult {
  aggregate: number;
  formula: MeritFormulaData;
  breakdown: {
    matricContribution: number;
    interContribution: number;
    testContribution: number;
    hafizBonus: number;
  };
}

// Animated Input Card Component
const InputCard = ({
  iconName,
  label,
  obtainedValue,
  totalValue,
  onObtainedChange,
  onTotalChange,
  placeholder,
  colors,
  isDark,
}: {
  iconName: string;
  label: string;
  obtainedValue: string;
  totalValue: string;
  onObtainedChange: (text: string) => void;
  onTotalChange: (text: string) => void;
  placeholder: string;
  colors: any;
  isDark: boolean;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(focusAnim, {
      toValue: isFocused ? 1 : 0,
      ...ANIMATION.spring.gentle,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  const percentage = obtainedValue && totalValue
    ? ((parseFloat(obtainedValue) / parseFloat(totalValue)) * 100).toFixed(1)
    : '0';

  const getPercentageColor = () => {
    const pct = parseFloat(percentage);
    if (pct >= 80) return colors.success;
    if (pct >= 60) return colors.warning;
    return colors.error;
  };

  return (
    <Animated.View
      style={[
        styles.inputCard,
        {
          backgroundColor: colors.card,
          borderColor,
        },
      ]}>
      <View style={styles.inputCardHeader}>
        <Icon name={iconName} family="Ionicons" size={20} color={colors.primary} />
        <Text style={[styles.inputCardLabel, {color: colors.text}]}>{label}</Text>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={[styles.inputGroupLabel, {color: colors.textSecondary}]}>
            Obtained
          </Text>
          <TextInput
            style={[
              styles.marksInput,
              {
                backgroundColor: isDark ? colors.background : '#F8FAFC',
                color: colors.text,
              },
            ]}
            value={obtainedValue}
            onChangeText={onObtainedChange}
            keyboardType="numeric"
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </View>

        <Text style={[styles.dividerText, {color: colors.textSecondary}]}>/</Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputGroupLabel, {color: colors.textSecondary}]}>
            Total
          </Text>
          <TextInput
            style={[
              styles.marksInput,
              {
                backgroundColor: isDark ? colors.background : '#F8FAFC',
                color: colors.text,
              },
            ]}
            value={totalValue}
            onChangeText={onTotalChange}
            keyboardType="numeric"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </View>

        <View
          style={[
            styles.percentBadge,
            {backgroundColor: `${getPercentageColor()}15`},
          ]}>
          <Text style={[styles.percentText, {color: getPercentageColor()}]}>
            {percentage}%
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

// Result Card with Animation
const ResultCard = ({
  result,
  index,
  isTop,
  colors,
  isDark,
  onShare,
}: {
  result: CalculationResult;
  index: number;
  isTop: boolean;
  colors: any;
  isDark: boolean;
  onShare: (result: CalculationResult) => void;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 150,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay: index * 150,
        ...ANIMATION.spring.gentle,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: index * 150,
        ...ANIMATION.spring.bouncy,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getAggregateGradient = (aggregate: number) => {
    if (aggregate >= 90) return ['#10B981', '#059669'];
    if (aggregate >= 80) return ['#4573DF', '#3660C9'];
    if (aggregate >= 70) return ['#4573DF', '#3660C9'];
    if (aggregate >= 60) return ['#F59E0B', '#D97706'];
    return ['#EF4444', '#DC2626'];
  };

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{translateY: slideAnim}, {scale: scaleAnim}],
        },
      ]}>
      <View
        style={[
          styles.resultCard,
          {
            backgroundColor: colors.card,
            borderColor: isTop ? colors.primary : 'transparent',
            borderWidth: isTop ? 2 : 0,
          },
        ]}>
        {/* Best Match Badge */}
        {isTop && (
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.bestBadge}>
            <View style={styles.bestBadgeContent}>
              <Icon name="trophy-outline" family="Ionicons" size={12} color="#000" />
              <Text style={styles.bestBadgeText}> BEST MATCH</Text>
            </View>
          </LinearGradient>
        )}

        {/* Formula Info */}
        <View style={styles.resultHeader}>
          <View style={styles.resultInfo}>
            <Text style={[styles.resultFormulaName, {color: colors.text}]}>
              {result.formula.name}
            </Text>
            <Text style={[styles.resultUniversity, {color: colors.textSecondary}]}>
              {result.formula.university}
            </Text>
          </View>
        </View>

        {/* Aggregate Display */}
        <LinearGradient
          colors={getAggregateGradient(result.aggregate)}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.aggregateBox}>
          <Text style={styles.aggregateLabel}>Your Aggregate</Text>
          <View style={styles.aggregateValueRow}>
            <Text style={styles.aggregateValue}>
              {result.aggregate.toFixed(2)}
            </Text>
            <Text style={styles.aggregatePercent}>%</Text>
          </View>
        </LinearGradient>

        {/* Breakdown */}
        <View style={[styles.breakdownSection, {backgroundColor: isDark ? colors.background : '#F8FAFC'}]}>
          <Text style={[styles.breakdownTitle, {color: colors.textSecondary}]}>
            Score Breakdown
          </Text>
          
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownItem}>
              <Text style={[styles.breakdownLabel, {color: colors.textSecondary}]}>
                Matric ({result.formula.matric_weightage}%)
              </Text>
              <Text style={[styles.breakdownValue, {color: colors.text}]}>
                {result.breakdown.matricContribution.toFixed(2)}
              </Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={[styles.breakdownLabel, {color: colors.textSecondary}]}>
                Inter ({result.formula.inter_weightage}%)
              </Text>
              <Text style={[styles.breakdownValue, {color: colors.text}]}>
                {result.breakdown.interContribution.toFixed(2)}
              </Text>
            </View>
          </View>
          
          <View style={styles.breakdownRow}>
            {result.formula.entry_test_weightage > 0 && (
              <View style={styles.breakdownItem}>
                <Text style={[styles.breakdownLabel, {color: colors.textSecondary}]}>
                  Test ({result.formula.entry_test_weightage}%)
                </Text>
                <Text style={[styles.breakdownValue, {color: colors.text}]}>
                  {result.breakdown.testContribution.toFixed(2)}
                </Text>
              </View>
            )}
            {result.breakdown.hafizBonus > 0 && (
              <View style={styles.breakdownItem}>
                <Text style={[styles.breakdownLabel, {color: colors.textSecondary}]}>
                  Hafiz Bonus
                </Text>
                <Text style={[styles.breakdownValue, {color: colors.success}]}>
                  +{result.breakdown.hafizBonus}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Share Button */}
        <TouchableOpacity
          style={[styles.shareResultBtn, {backgroundColor: `${colors.primary}10`, borderColor: colors.primary}]}
          onPress={() => onShare(result)}
          activeOpacity={0.8}>
          <Icon name="share-social-outline" family="Ionicons" size={18} color={colors.primary} />
          <Text style={[styles.shareResultBtnText, {color: colors.primary}]}>
            Share My Score
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const PremiumCalculatorScreen = () => {
  const {colors, isDark} = useTheme();
  const navigation = useNavigation();

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

  // Result
  const [results, setResults] = useState<CalculationResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  // Share Modal
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareResult, setShareResult] = useState<CalculationResult | null>(null);

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

  // Filter formulas based on education system
  const applicableFormulas = useMemo(() => {
    return MERIT_FORMULAS.filter(
      f =>
        f.applicable_fields.some(field =>
          field.toLowerCase().includes(
            selectedEducation.includes('medical')
              ? 'medical'
              : selectedEducation.includes('engineering')
              ? 'engineering'
              : selectedEducation.includes('ics')
              ? 'computer'
              : 'business',
          ),
        ) || f.applicable_fields.includes('All Programs'),
    );
  }, [selectedEducation]);

  const calculateSingleFormula = (formula: MeritFormulaData): CalculationResult => {
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
  };

  const calculateMerit = () => {
    // Validate all inputs using the validation utility
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

    // Additional check for empty required fields
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

    // Haptic feedback for successful validation
    Haptics.success();

    // Calculate for selected formula or all applicable formulas
    if (selectedFormula) {
      const result = calculateSingleFormula(selectedFormula);
      setResults([result]);
    } else {
      const allResults = applicableFormulas.map(f => calculateSingleFormula(f));
      allResults.sort((a, b) => b.aggregate - a.aggregate);
      setResults(allResults);
    }

    setShowResults(true);
    
    // Animate results in
    Animated.timing(resultsFadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const resetCalculator = () => {
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
  };

  const toggleHafiz = () => {
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
    setIsHafiz(!isHafiz);
  };

  // Handle sharing a result
  const handleShareResult = async (result: CalculationResult) => {
    Haptics.light();
    setShareResult(result);
    setShowShareModal(true);
  };

  // Perform the actual share
  const performShare = async () => {
    if (!shareResult) return;
    
    const rawChance = getChanceLevel(shareResult.aggregate);
    // Map 'unlikely' to 'low' for share function which only accepts high/medium/low
    const chance: 'high' | 'medium' | 'low' = rawChance === 'unlikely' ? 'low' : rawChance;
    
    const success = await shareMeritSuccessCard({
      aggregate: shareResult.aggregate,
      universityName: shareResult.formula.university,
      universityShortName: shareResult.formula.name.replace(' Formula', ''),
      chance,
      breakdown: {
        matricContribution: shareResult.breakdown.matricContribution,
        interContribution: shareResult.breakdown.interContribution,
        testContribution: shareResult.breakdown.testContribution,
      },
    });
    
    if (success) {
      Haptics.success();
      setShowShareModal(false);
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            
            {/* Header */}
            <LinearGradient
              colors={isDark ? ['#1D2127', '#1A2540', '#4573DF'] : ['#4573DF', '#3660C9', '#2A4FA8']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.headerGradient}>
              <View style={styles.headerDecoCircle1} />
              <View style={styles.headerDecoCircle2} />
              {/* Back Button */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                accessibilityLabel="Go back"
                accessibilityRole="button">
                <Icon name="chevron-back" family="Ionicons" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.headerContent}>
                <View style={styles.headerTextContainer}>
                  <Text style={styles.title}>
                    Merit Calculator
                  </Text>
                  <Text style={styles.subtitle}>
                    Calculate your aggregate for university admissions
                  </Text>
                </View>
                <View style={styles.headerIcon}>
                  <Icon name="bar-chart-outline" family="Ionicons" size={32} color="#FFFFFF" />
                </View>
              </View>
            </LinearGradient>

            {/* Education System Selector */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, {color: colors.text}]}>
                Your Education System
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipScrollContent}>
                {EDUCATION_SYSTEMS.map(system => (
                  <TouchableOpacity
                    key={system.value}
                    style={[
                      styles.educationChip,
                      {
                        backgroundColor:
                          selectedEducation === system.value
                            ? colors.primary
                            : colors.card,
                        borderColor:
                          selectedEducation === system.value
                            ? colors.primary
                            : colors.border,
                      },
                    ]}
                    onPress={() => {
                      setSelectedEducation(system.value);
                      setSelectedFormula(null);
                    }}>
                    <Text
                      style={[
                        styles.educationChipText,
                        {
                          color:
                            selectedEducation === system.value
                              ? '#FFFFFF'
                              : colors.text,
                          fontWeight:
                            selectedEducation === system.value ? '700' : '500',
                        },
                      ]}>
                      {system.shortLabel}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Formula Selector */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, {color: colors.text}]}>
                  Merit Formula
                </Text>
                <TouchableOpacity onPress={() => setShowFormulaModal(true)}>
                  <Text style={[styles.changeLink, {color: colors.primary}]}>
                    Change
                  </Text>
                </TouchableOpacity>
              </View>

              {selectedFormula ? (
                <View
                  style={[
                    styles.selectedFormula,
                    {
                      backgroundColor: `${colors.primary}10`,
                      borderColor: colors.primary,
                    },
                  ]}>
                  <Text style={[styles.selectedFormulaName, {color: colors.primary}]}>
                    {selectedFormula.name}
                  </Text>
                  <Text style={[styles.selectedFormulaDetail, {color: colors.text}]}>
                    {selectedFormula.matric_weightage}% Matric +{' '}
                    {selectedFormula.inter_weightage}% Inter +{' '}
                    {selectedFormula.entry_test_weightage}%{' '}
                    {selectedFormula.entry_test_name}
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.selectFormulaBtn,
                    {backgroundColor: colors.card, borderColor: colors.border},
                  ]}
                  onPress={() => setShowFormulaModal(true)}>
                  <Icon name="school-outline" family="Ionicons" size={24} color={colors.primary} />
                  <Text
                    style={[styles.selectFormulaBtnText, {color: colors.textSecondary}]}>
                    Select MDCAT, ECAT, NET or other university formula
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Marks Input Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, {color: colors.text}]}>
                Enter Your Marks
              </Text>

              <InputCard
                iconName="book-outline"
                label="Matric / SSC / O-Level"
                obtainedValue={matricMarks}
                totalValue={matricTotal}
                onObtainedChange={setMatricMarks}
                onTotalChange={setMatricTotal}
                placeholder="950"
                colors={colors}
                isDark={isDark}
              />

              <InputCard
                iconName="library-outline"
                label="Intermediate / HSSC / A-Level"
                obtainedValue={interMarks}
                totalValue={interTotal}
                onObtainedChange={setInterMarks}
                onTotalChange={setInterTotal}
                placeholder="1000"
                colors={colors}
                isDark={isDark}
              />

              <InputCard
                iconName="document-text-outline"
                label="Entry Test (if applicable)"
                obtainedValue={entryTestMarks}
                totalValue={entryTestTotal}
                onObtainedChange={setEntryTestMarks}
                onTotalChange={setEntryTestTotal}
                placeholder="150"
                colors={colors}
                isDark={isDark}
              />

              {/* Hafiz Toggle */}
              <Animated.View style={{transform: [{scale: hafizScaleAnim}]}}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={toggleHafiz}
                  style={[
                    styles.hafizToggle,
                    {
                      backgroundColor: isHafiz ? `${colors.success}15` : colors.card,
                      borderColor: isHafiz ? colors.success : colors.border,
                    },
                  ]}>
                  <Icon name="moon-outline" family="Ionicons" size={32} color={isHafiz ? colors.success : colors.textSecondary} />
                  <View style={styles.hafizInfo}>
                    <Text
                      style={[
                        styles.hafizText,
                        {color: isHafiz ? colors.success : colors.text},
                      ]}>
                      Hafiz-e-Quran
                    </Text>
                    <Text
                      style={[
                        styles.hafizSubtext,
                        {color: isHafiz ? colors.success : colors.textSecondary},
                      ]}>
                      {isHafiz
                        ? 'Bonus marks will be added'
                        : 'Tap to add Hafiz bonus'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.hafizCheck,
                      {
                        backgroundColor: isHafiz ? colors.success : 'transparent',
                        borderColor: isHafiz ? colors.success : colors.border,
                      },
                    ]}>
                    {isHafiz && <Icon name="checkmark" family="Ionicons" size={16} color="#FFFFFF" />}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.calculateBtn}
                onPress={calculateMerit}
                activeOpacity={0.9}>
                <LinearGradient
                  colors={[colors.primary, '#3660C9']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.calculateGradient}>
                  <Text style={styles.calculateBtnText}>Calculate Merit</Text>
                  <Icon name="flag-outline" family="Ionicons" size={20} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.resetBtn, {backgroundColor: colors.card, borderColor: colors.border}]}
                onPress={resetCalculator}>
                <Text style={[styles.resetBtnText, {color: colors.text}]}>Reset</Text>
              </TouchableOpacity>
            </View>

            {/* Results Section */}
            {showResults && results.length > 0 && (
              <Animated.View style={[styles.resultsSection, {opacity: resultsFadeAnim}]}>
                <View style={styles.resultsSectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Icon name={results.length === 1 ? 'ribbon-outline' : 'bar-chart-outline'} family="Ionicons" size={18} color={colors.text} />
                    <Text style={[styles.sectionTitle, {color: colors.text}]}>
                      {results.length === 1 ? ' Your Result' : ` Results for ${results.length} Formulas`}
                    </Text>
                  </View>
                </View>

                {results.map((result, index) => (
                  <ResultCard
                    key={result.formula.id}
                    result={result}
                    index={index}
                    isTop={index === 0 && results.length > 1}
                    colors={colors}
                    isDark={isDark}
                    onShare={handleShareResult}
                  />
                ))}
              </Animated.View>
            )}

            <View style={{height: 100}} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Formula Selection Modal - Organized by Categories */}
      <Modal
        visible={showFormulaModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFormulaModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {backgroundColor: colors.card}]}>
            <View style={[styles.modalHeader, {borderBottomColor: colors.border}]}>
              <Text style={[styles.modalTitle, {color: colors.text}]}>
                Select University Formula
              </Text>
              <TouchableOpacity
                onPress={() => setShowFormulaModal(false)}
                style={[styles.modalCloseBtn, {backgroundColor: colors.background}]}>
                <Icon name="close" family="Ionicons" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {/* Calculate All Option */}
              <TouchableOpacity
                style={[
                  styles.formulaOption,
                  {
                    backgroundColor: !selectedFormula ? `${colors.primary}10` : colors.background,
                    borderColor: !selectedFormula ? colors.primary : 'transparent',
                  },
                ]}
                onPress={() => {
                  setSelectedFormula(null);
                  setShowFormulaModal(false);
                }}>
                <Icon name="bar-chart-outline" family="Ionicons" size={28} color={colors.primary} />
                <View style={styles.formulaOptionInfo}>
                  <Text style={[styles.formulaName, {color: colors.text}]}>
                    Calculate All Formulas
                  </Text>
                  <Text style={[styles.formulaDesc, {color: colors.textSecondary}]}>
                    Compare across MDCAT, ECAT, NET & all university formulas
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Medical Formulas Section */}
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, marginBottom: 8}}>
                <Icon name="medkit-outline" family="Ionicons" size={18} color="#EF4444" />
                <Text style={[styles.formulaCategoryTitle, {color: colors.text, marginTop: 0, marginBottom: 0}]}>Medical Colleges</Text>
              </View>
              {MERIT_FORMULAS.filter(f => f.applicable_fields.some(field => 
                field.toLowerCase().includes('medical') || field.toLowerCase().includes('mbbs') || field.toLowerCase().includes('bds')
              )).map(formula => (
                <TouchableOpacity
                  key={formula.id}
                  style={[
                    styles.formulaOption,
                    {
                      backgroundColor:
                        selectedFormula?.id === formula.id
                          ? `${colors.primary}10`
                          : colors.background,
                      borderColor:
                        selectedFormula?.id === formula.id ? colors.primary : 'transparent',
                    },
                  ]}
                  onPress={() => {
                    setSelectedFormula(formula);
                    setShowFormulaModal(false);
                  }}>
                  <Icon name="medkit-outline" family="Ionicons" size={28} color="#EF4444" />
                  <View style={styles.formulaOptionInfo}>
                    <Text style={[styles.formulaName, {color: colors.text}]}>
                      {formula.name}
                    </Text>
                    <Text style={[styles.formulaUniversity, {color: colors.textSecondary}]}>
                      {formula.university}
                    </Text>
                    <View style={styles.formulaWeights}>
                      <View style={[styles.weightBadge, {backgroundColor: `${colors.primary}15`}]}>
                        <Text style={[styles.weightText, {color: colors.primary}]}>
                          {formula.matric_weightage}% Matric
                        </Text>
                      </View>
                      <View style={[styles.weightBadge, {backgroundColor: `${colors.success}15`}]}>
                        <Text style={[styles.weightText, {color: colors.success}]}>
                          {formula.inter_weightage}% Inter
                        </Text>
                      </View>
                      {formula.entry_test_weightage > 0 && (
                        <View style={[styles.weightBadge, {backgroundColor: `${colors.warning}15`}]}>
                          <Text style={[styles.weightText, {color: colors.warning}]}>
                            {formula.entry_test_weightage}% {formula.entry_test_name}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}

              {/* Engineering Formulas Section */}
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: SPACING.md}}>
                <Icon name="construct-outline" family="Ionicons" size={18} color="#F59E0B" />
                <Text style={[styles.formulaCategoryTitle, {color: colors.text}]}>Engineering Universities</Text>
              </View>
              {MERIT_FORMULAS.filter(f => f.applicable_fields.some(field => 
                field.toLowerCase().includes('engineering') || field.toLowerCase().includes('bsc engineering') || field.toLowerCase().includes('be')
              ) && !f.applicable_fields.some(field => field.toLowerCase().includes('medical'))).map(formula => (
                <TouchableOpacity
                  key={formula.id}
                  style={[
                    styles.formulaOption,
                    {
                      backgroundColor:
                        selectedFormula?.id === formula.id
                          ? `${colors.primary}10`
                          : colors.background,
                      borderColor:
                        selectedFormula?.id === formula.id ? colors.primary : 'transparent',
                    },
                  ]}
                  onPress={() => {
                    setSelectedFormula(formula);
                    setShowFormulaModal(false);
                  }}>
                  <Icon name="construct-outline" family="Ionicons" size={28} color="#F59E0B" />
                  <View style={styles.formulaOptionInfo}>
                    <Text style={[styles.formulaName, {color: colors.text}]}>
                      {formula.name}
                    </Text>
                    <Text style={[styles.formulaUniversity, {color: colors.textSecondary}]}>
                      {formula.university}
                    </Text>
                    <View style={styles.formulaWeights}>
                      <View style={[styles.weightBadge, {backgroundColor: `${colors.primary}15`}]}>
                        <Text style={[styles.weightText, {color: colors.primary}]}>
                          {formula.matric_weightage}% Matric
                        </Text>
                      </View>
                      <View style={[styles.weightBadge, {backgroundColor: `${colors.success}15`}]}>
                        <Text style={[styles.weightText, {color: colors.success}]}>
                          {formula.inter_weightage}% Inter
                        </Text>
                      </View>
                      {formula.entry_test_weightage > 0 && (
                        <View style={[styles.weightBadge, {backgroundColor: `${colors.warning}15`}]}>
                          <Text style={[styles.weightText, {color: colors.warning}]}>
                            {formula.entry_test_weightage}% {formula.entry_test_name}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}

              {/* Computer Science / IT Section */}
              <Text style={[styles.formulaCategoryTitle, {color: colors.text}]}>💻 Computer Science & IT</Text>
              {MERIT_FORMULAS.filter(f => f.applicable_fields.some(field => 
                field.toLowerCase().includes('computer') || field.toLowerCase().includes('software') || field.toLowerCase().includes('data')
              )).map(formula => (
                <TouchableOpacity
                  key={formula.id}
                  style={[
                    styles.formulaOption,
                    {
                      backgroundColor:
                        selectedFormula?.id === formula.id
                          ? `${colors.primary}10`
                          : colors.background,
                      borderColor:
                        selectedFormula?.id === formula.id ? colors.primary : 'transparent',
                    },
                  ]}
                  onPress={() => {
                    setSelectedFormula(formula);
                    setShowFormulaModal(false);
                  }}>
                  <Icon name="code-slash-outline" family="Ionicons" size={28} color="#4573DF" />
                  <View style={styles.formulaOptionInfo}>
                    <Text style={[styles.formulaName, {color: colors.text}]}>
                      {formula.name}
                    </Text>
                    <Text style={[styles.formulaUniversity, {color: colors.textSecondary}]}>
                      {formula.university}
                    </Text>
                    <View style={styles.formulaWeights}>
                      <View style={[styles.weightBadge, {backgroundColor: `${colors.primary}15`}]}>
                        <Text style={[styles.weightText, {color: colors.primary}]}>
                          {formula.matric_weightage}% Matric
                        </Text>
                      </View>
                      <View style={[styles.weightBadge, {backgroundColor: `${colors.success}15`}]}>
                        <Text style={[styles.weightText, {color: colors.success}]}>
                          {formula.inter_weightage}% Inter
                        </Text>
                      </View>
                      {formula.entry_test_weightage > 0 && (
                        <View style={[styles.weightBadge, {backgroundColor: `${colors.warning}15`}]}>
                          <Text style={[styles.weightText, {color: colors.warning}]}>
                            {formula.entry_test_weightage}% {formula.entry_test_name}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}

              {/* Business Schools Section */}
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, marginBottom: 8}}>
                <Icon name="briefcase-outline" family="Ionicons" size={18} color="#F59E0B" />
                <Text style={[styles.formulaCategoryTitle, {color: colors.text, marginTop: 0, marginBottom: 0}]}>Business Schools</Text>
              </View>
              {MERIT_FORMULAS.filter(f => f.applicable_fields.some(field => 
                field.toLowerCase().includes('business') || field.toLowerCase().includes('bba') || field.toLowerCase().includes('accounting') || field.toLowerCase().includes('economics')
              )).map(formula => (
                <TouchableOpacity
                  key={formula.id}
                  style={[
                    styles.formulaOption,
                    {
                      backgroundColor:
                        selectedFormula?.id === formula.id
                          ? `${colors.primary}10`
                          : colors.background,
                      borderColor:
                        selectedFormula?.id === formula.id ? colors.primary : 'transparent',
                    },
                  ]}
                  onPress={() => {
                    setSelectedFormula(formula);
                    setShowFormulaModal(false);
                  }}>
                  <Icon name="briefcase-outline" family="Ionicons" size={28} color="#10B981" />
                  <View style={styles.formulaOptionInfo}>
                    <Text style={[styles.formulaName, {color: colors.text}]}>
                      {formula.name}
                    </Text>
                    <Text style={[styles.formulaUniversity, {color: colors.textSecondary}]}>
                      {formula.university}
                    </Text>
                    <View style={styles.formulaWeights}>
                      <View style={[styles.weightBadge, {backgroundColor: `${colors.primary}15`}]}>
                        <Text style={[styles.weightText, {color: colors.primary}]}>
                          {formula.matric_weightage}% Matric
                        </Text>
                      </View>
                      <View style={[styles.weightBadge, {backgroundColor: `${colors.success}15`}]}>
                        <Text style={[styles.weightText, {color: colors.success}]}>
                          {formula.inter_weightage}% Inter
                        </Text>
                      </View>
                      {formula.entry_test_weightage > 0 && (
                        <View style={[styles.weightBadge, {backgroundColor: `${colors.warning}15`}]}>
                          <Text style={[styles.weightText, {color: colors.warning}]}>
                            {formula.entry_test_weightage}% {formula.entry_test_name}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}

              {/* General Universities Section */}
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, marginBottom: 8}}>
                <Icon name="school-outline" family="Ionicons" size={18} color="#4573DF" />
                <Text style={[styles.formulaCategoryTitle, {color: colors.text, marginTop: 0, marginBottom: 0}]}>General Universities</Text>
              </View>
              {MERIT_FORMULAS.filter(f => f.applicable_fields.some(field => 
                field.toLowerCase().includes('general') || field.toLowerCase().includes('arts') || field.toLowerCase().includes('all programs') || field.toLowerCase().includes('bs programs')
              )).map(formula => (
                <TouchableOpacity
                  key={formula.id}
                  style={[
                    styles.formulaOption,
                    {
                      backgroundColor:
                        selectedFormula?.id === formula.id
                          ? `${colors.primary}10`
                          : colors.background,
                      borderColor:
                        selectedFormula?.id === formula.id ? colors.primary : 'transparent',
                    },
                  ]}
                  onPress={() => {
                    setSelectedFormula(formula);
                    setShowFormulaModal(false);
                  }}>
                  <Icon name="school-outline" family="Ionicons" size={28} color="#4573DF" />
                  <View style={styles.formulaOptionInfo}>
                    <Text style={[styles.formulaName, {color: colors.text}]}>
                      {formula.name}
                    </Text>
                    <Text style={[styles.formulaUniversity, {color: colors.textSecondary}]}>
                      {formula.university}
                    </Text>
                    <View style={styles.formulaWeights}>
                      <View style={[styles.weightBadge, {backgroundColor: `${colors.primary}15`}]}>
                        <Text style={[styles.weightText, {color: colors.primary}]}>
                          {formula.matric_weightage}% Matric
                        </Text>
                      </View>
                      <View style={[styles.weightBadge, {backgroundColor: `${colors.success}15`}]}>
                        <Text style={[styles.weightText, {color: colors.success}]}>
                          {formula.inter_weightage}% Inter
                        </Text>
                      </View>
                      {formula.entry_test_weightage > 0 && (
                        <View style={[styles.weightBadge, {backgroundColor: `${colors.warning}15`}]}>
                          <Text style={[styles.weightText, {color: colors.warning}]}>
                            {formula.entry_test_weightage}% {formula.entry_test_name}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
              
              <View style={{height: 50}} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Share Result Modal */}
      <Modal
        visible={showShareModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowShareModal(false)}>
        <View style={styles.shareModalOverlay}>
          <View style={[styles.shareModalContent, {backgroundColor: colors.card}]}>
            {/* Header */}
            <View style={styles.shareModalHeader}>
              <Text style={[styles.shareModalTitle, {color: colors.text}]}>
                Share Your Result
              </Text>
              <TouchableOpacity
                onPress={() => setShowShareModal(false)}
                style={[styles.shareModalCloseBtn, {backgroundColor: colors.background}]}>
                <Icon name="close" family="Ionicons" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Preview Card */}
            {shareResult && (
              <View style={styles.sharePreviewContainer}>
                <MeritSuccessCard
                  aggregate={shareResult.aggregate}
                  universityName={shareResult.formula.university}
                  universityShortName={shareResult.formula.name.replace(' Formula', '')}
                  chance={getChanceLevel(shareResult.aggregate)}
                  breakdown={{
                    matricContribution: shareResult.breakdown.matricContribution,
                    interContribution: shareResult.breakdown.interContribution,
                    testContribution: shareResult.breakdown.testContribution,
                  }}
                />
              </View>
            )}

            {/* Share Options */}
            <View style={styles.shareOptionsContainer}>
              <Text style={[styles.shareOptionsTitle, {color: colors.textSecondary}]}>
                Share via
              </Text>
              <View style={styles.shareOptionsRow}>
                <TouchableOpacity
                  style={[styles.shareOptionBtn, {backgroundColor: '#25D366'}]}
                  onPress={performShare}
                  activeOpacity={0.8}>
                  <Icon name="logo-whatsapp" family="Ionicons" size={24} color="#FFFFFF" />
                  <Text style={styles.shareOptionText}>WhatsApp</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.shareOptionBtn, {backgroundColor: '#E1306C'}]}
                  onPress={performShare}
                  activeOpacity={0.8}>
                  <Icon name="logo-instagram" family="Ionicons" size={24} color="#FFFFFF" />
                  <Text style={styles.shareOptionText}>Instagram</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.shareOptionBtn, {backgroundColor: colors.primary}]}
                  onPress={performShare}
                  activeOpacity={0.8}>
                  <Icon name="share-outline" family="Ionicons" size={24} color="#FFFFFF" />
                  <Text style={styles.shareOptionText}>More</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Tips */}
            <View style={[styles.shareTipBox, {backgroundColor: `${colors.primary}10`}]}>
              <Icon name="bulb-outline" family="Ionicons" size={18} color={colors.primary} />
              <Text style={[styles.shareTipText, {color: colors.textSecondary}]}>
                Share your merit score to inspire friends and help them calculate their chances!
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.lg,
  },
  headerGradient: {
    margin: SPACING.lg,
    marginBottom: SPACING.xl,
    padding: SPACING.lg,
    borderRadius: RADIUS.xxl,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#4573DF',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  headerDecoCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  headerDecoCircle2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weight.heavy,
    letterSpacing: -0.5,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 6,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.2,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  section: {
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: SPACING.sm,
    letterSpacing: -0.3,
  },
  changeLink: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  chipScrollContent: {
    gap: SPACING.sm,
  },
  educationChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    marginRight: SPACING.sm,
  },
  educationChipText: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  selectedFormula: {
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
  },
  selectedFormulaName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  selectedFormulaDetail: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 4,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  selectFormulaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    gap: SPACING.sm,
  },
  selectFormulaBtnText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
    flex: 1,
  },
  inputCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1.5,
  },
  inputCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  inputCardLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },
  inputGroup: {
    flex: 1,
  },
  inputGroupLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
    marginBottom: 4,
  },
  marksInput: {
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    textAlign: 'center',
  },
  dividerText: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weight.regular,
    marginHorizontal: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  percentBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    marginLeft: SPACING.sm,
  },
  percentText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  hafizToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    gap: SPACING.md,
  },
  hafizInfo: {
    flex: 1,
  },
  hafizText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  hafizSubtext: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
    marginTop: 2,
  },
  hafizCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    color: '#FFFFFF',
    fontWeight: TYPOGRAPHY.weight.heavy,
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    flexWrap: 'wrap',
  },
  calculateBtn: {
    flex: 2,
    minWidth: 160,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#4573DF',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  calculateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md + 2,
    gap: SPACING.sm,
  },
  calculateBtnText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: SPACING.md + 2,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  resetBtnText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  resultsSection: {
    marginTop: SPACING.md,
  },
  resultsSectionHeader: {
    marginBottom: SPACING.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultCard: {
    borderRadius: RADIUS.xxl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  bestBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderBottomLeftRadius: RADIUS.lg,
  },
  bestBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bestBadgeText: {
    color: '#000',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.heavy,
  },
  resultHeader: {
    marginBottom: SPACING.md,
  },
  resultInfo: {},
  resultFormulaName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  resultUniversity: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
    marginTop: 2,
  },
  aggregateBox: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  aggregateLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: 4,
  },
  aggregateValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  aggregateValue: {
    color: '#FFFFFF',
    fontSize: 52,
    fontWeight: TYPOGRAPHY.weight.heavy,
    letterSpacing: -1,
  },
  aggregatePercent: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: 8,
    marginLeft: 2,
  },
  breakdownSection: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  breakdownTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  breakdownItem: {
    flex: 1,
    marginBottom: SPACING.xs,
  },
  breakdownLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  breakdownValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  modalScroll: {
    padding: SPACING.lg,
  },
  formulaOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    gap: SPACING.md,
  },
  formulaOptionInfo: {
    flex: 1,
  },
  formulaName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  formulaDesc: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
    marginTop: 2,
  },
  formulaUniversity: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
    marginTop: 2,
  },
  formulaWeights: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  weightBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
  },
  weightText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  formulaCategoryTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  // Share Result Button Styles
  shareResultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  shareResultBtnText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  // Share Modal Styles
  shareModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  shareModalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: RADIUS.xxl,
    overflow: 'hidden',
  },
  shareModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  shareModalTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  shareModalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sharePreviewContainer: {
    alignItems: 'center',
    padding: SPACING.lg,
    transform: [{scale: 0.85}],
  },
  shareOptionsContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  shareOptionsTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  shareOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: SPACING.md,
  },
  shareOptionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: SPACING.xs,
  },
  shareOptionText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#FFFFFF',
  },
  shareTipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    margin: SPACING.lg,
    marginTop: 0,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
  },
  shareTipText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.xs,
    lineHeight: 18,
  },
});

export default PremiumCalculatorScreen;



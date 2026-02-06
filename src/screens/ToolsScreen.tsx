/**
 * ToolsScreen - Comprehensive Tools & Calculators Hub
 * All tools for merit calculation, grade conversion, projections, and simulations
 * Offline-first - no Supabase dependency
 * Enhanced with premium animations and polished UI
 */

import React, {useState, useRef, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Alert,
  TextInput,
  Platform,
  Easing,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Icon} from '../components/icons';
import {useTheme} from '../contexts/ThemeContext';
import {TYPOGRAPHY, RADIUS, SPACING} from '../constants/design';
import {ANIMATION_SCALES, SPRING_CONFIGS} from '../constants/ui';

// Import Calculator Components
import {
  GradeConverterCard,
  TargetCalculator,
  WhatIfSimulator,
  CustomFormulaBuilder,
} from '../components/calculators';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// ============================================================================
// TYPES
// ============================================================================

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  component: 'meritCalculator' | 'gradeConverter' | 'targetCalculator' | 'whatIf' | 'customFormula';
}

// ============================================================================
// TOOLS DATA
// ============================================================================

const TOOLS: Tool[] = [
  {
    id: 'merit-calc',
    title: 'Merit Calculator',
    description: 'Calculate your merit percentage for any university',
    icon: 'calculator-outline',
    color: '#4573DF',
    component: 'meritCalculator',
  },
  {
    id: 'grade-converter',
    title: 'Grade Converter',
    description: 'Convert grades between Pakistani, American, and international systems',
    icon: 'swap-horizontal-outline',
    color: '#10B981',
    component: 'gradeConverter',
  },
  {
    id: 'target-calc',
    title: 'Target Calculator',
    description: 'Find out what marks you need to achieve your target merit',
    icon: 'flag-outline',
    color: '#F59E0B',
    component: 'targetCalculator',
  },
  {
    id: 'what-if',
    title: 'What-If Simulator',
    description: 'Explore different scenarios and see how changes affect your merit',
    icon: 'git-branch-outline',
    color: '#8B5CF6',
    component: 'whatIf',
  },
  {
    id: 'custom-formula',
    title: 'Custom Formula Builder',
    description: 'Create custom merit formulas for specific universities',
    icon: 'code-slash-outline',
    color: '#EC4899',
    component: 'customFormula',
  },
];

// ============================================================================
// ENHANCED TOOL CARD COMPONENT
// ============================================================================

interface ToolCardProps {
  tool: Tool;
  index: number;
  onPress: () => void;
  colors: any;
}

const ToolCard: React.FC<ToolCardProps> = ({tool, index, onPress, colors}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const delay = 100 + index * 80;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay,
        tension: 65,
        friction: 9,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      ...SPRING_CONFIGS.snappy,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...SPRING_CONFIGS.responsive,
    }).start();
  };

  return (
    <Animated.View style={{
      transform: [{scale: scaleAnim}, {translateY: slideAnim}],
      opacity: fadeAnim,
    }}>
      <TouchableOpacity
        style={[styles.toolCard, {backgroundColor: colors.card}]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}>
        <LinearGradient
          colors={[tool.color, `${tool.color}CC`]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.toolIconContainer}>
          <Icon name={tool.icon} family="Ionicons" size={28} color="#FFF" />
        </LinearGradient>
        <View style={styles.toolContent}>
          <Text style={[styles.toolTitle, {color: colors.text}]}>{tool.title}</Text>
          <Text style={[styles.toolDescription, {color: colors.textSecondary}]} numberOfLines={2}>
            {tool.description}
          </Text>
        </View>
        <View style={[styles.toolArrow, {backgroundColor: `${tool.color}15`}]}>
          <Icon name="chevron-forward" family="Ionicons" size={22} color={tool.color} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ============================================================================
// SIMPLE MERIT CALCULATOR
// ============================================================================

// Custom formula interface (matches CustomFormulaBuilder)
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

// Default formula
const DEFAULT_FORMULA: CustomFormula = {
  id: 'default',
  name: 'Standard Formula',
  shortName: 'STD',
  matricWeight: 10,
  interWeight: 50,
  testWeight: 40,
  testName: 'Entry Test',
  color: '#4573DF',
};

// Storage key (same as CustomFormulaBuilder)
const FORMULAS_STORAGE_KEY = '@pakuni_custom_formulas';

interface MeritCalculatorProps {
  onClose: () => void;
  colors: any;
}

const SimpleMeritCalculator: React.FC<MeritCalculatorProps> = ({onClose, colors}) => {
  const [matricMarks, setMatricMarks] = useState('');
  const [matricTotal, setMatricTotal] = useState('1200');
  const [interMarks, setInterMarks] = useState('');
  const [interTotal, setInterTotal] = useState('1200');
  const [testMarks, setTestMarks] = useState('');
  const [testTotal, setTestTotal] = useState('200');
  const [result, setResult] = useState<number | null>(null);
  
  // Custom formula state
  const [customFormulas, setCustomFormulas] = useState<CustomFormula[]>([]);
  const [selectedFormula, setSelectedFormula] = useState<CustomFormula>(DEFAULT_FORMULA);
  const [showFormulaSelector, setShowFormulaSelector] = useState(false);

  // Load custom formulas on mount
  useEffect(() => {
    const loadFormulas = async () => {
      try {
        const data = await AsyncStorage.getItem(FORMULAS_STORAGE_KEY);
        if (data) {
          setCustomFormulas(JSON.parse(data));
        }
      } catch (error) {
        console.error('Error loading custom formulas:', error);
      }
    };
    loadFormulas();
  }, []);

  const calculateMerit = () => {
    const matric = parseFloat(matricMarks) || 0;
    const mTotal = parseFloat(matricTotal) || 1200;
    const inter = parseFloat(interMarks) || 0;
    const iTotal = parseFloat(interTotal) || 1200;
    const test = parseFloat(testMarks) || 0;
    const tTotal = parseFloat(testTotal) || 200;

    // Convert to percentages using actual total marks
    const matricPercent = (matric / mTotal) * 100;
    const interPercent = (inter / iTotal) * 100;
    const testPercent = (test / tTotal) * 100;

    // Use selected formula weights
    const matricWeight = selectedFormula.matricWeight / 100;
    const interWeight = selectedFormula.interWeight / 100;
    const testWeight = selectedFormula.testWeight / 100;

    const merit = (matricPercent * matricWeight) + (interPercent * interWeight) + (testPercent * testWeight);
    setResult(Math.min(100, Math.max(0, merit)));
  };

  // All available formulas (default + custom)
  const allFormulas = [DEFAULT_FORMULA, ...customFormulas];

  return (
    <SafeAreaView style={[styles.calculatorContainer, {backgroundColor: colors.background}]} edges={['top']}>
      <View style={styles.calculatorHeader}>
        <TouchableOpacity
          style={[styles.closeButton, {backgroundColor: colors.card}]}
          onPress={onClose}>
          <Icon name="arrow-back" family="Ionicons" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.calculatorTitle, {color: colors.text}]}>Merit Calculator</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.calculatorContent}>
        {/* Formula Selector */}
        <TouchableOpacity
          style={[styles.formulaSelectorBtn, {backgroundColor: colors.card, borderColor: selectedFormula.color}]}
          onPress={() => setShowFormulaSelector(!showFormulaSelector)}>
          <View style={[styles.formulaSelectorIcon, {backgroundColor: selectedFormula.color}]}>
            <Icon name="flask-outline" family="Ionicons" size={18} color="#FFF" />
          </View>
          <View style={styles.formulaSelectorContent}>
            <Text style={[styles.formulaSelectorLabel, {color: colors.textSecondary}]}>Using Formula</Text>
            <Text style={[styles.formulaSelectorName, {color: colors.text}]}>{selectedFormula.name}</Text>
          </View>
          <Icon 
            name={showFormulaSelector ? "chevron-up" : "chevron-down"} 
            family="Ionicons" 
            size={20} 
            color={colors.textSecondary} 
          />
        </TouchableOpacity>

        {/* Formula Dropdown */}
        {showFormulaSelector && (
          <View style={[styles.formulaDropdown, {backgroundColor: colors.card}]}>
            {allFormulas.map((formula) => (
              <TouchableOpacity
                key={formula.id}
                style={[
                  styles.formulaOption,
                  selectedFormula.id === formula.id && {backgroundColor: formula.color + '20'},
                ]}
                onPress={() => {
                  setSelectedFormula(formula);
                  setShowFormulaSelector(false);
                  setResult(null); // Reset result when formula changes
                }}>
                <View style={[styles.formulaOptionDot, {backgroundColor: formula.color}]} />
                <View style={styles.formulaOptionInfo}>
                  <Text style={[styles.formulaOptionName, {color: colors.text}]}>{formula.name}</Text>
                  <Text style={[styles.formulaOptionWeights, {color: colors.textSecondary}]}>
                    {formula.matricWeight}% Matric + {formula.interWeight}% Inter + {formula.testWeight}% {formula.testName}
                  </Text>
                </View>
                {selectedFormula.id === formula.id && (
                  <Icon name="checkmark-circle" family="Ionicons" size={20} color={formula.color} />
                )}
              </TouchableOpacity>
            ))}
            {customFormulas.length === 0 && (
              <View style={styles.noCustomFormulas}>
                <Icon name="information-circle-outline" family="Ionicons" size={16} color={colors.textMuted} />
                <Text style={[styles.noCustomFormulasText, {color: colors.textMuted}]}>
                  Create custom formulas in the Custom Formula Builder tool
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Input Cards */}
        <View style={[styles.inputCard, {backgroundColor: colors.card}]}>
          <View style={styles.inputRow}>
            <View style={styles.inputIconWrapper}>
              <LinearGradient colors={['#4573DF', '#3660C9']} style={styles.inputIcon}>
                <Icon name="school-outline" family="Ionicons" size={20} color="#FFF" />
              </LinearGradient>
            </View>
            <View style={styles.inputContent}>
              <Text style={[styles.inputLabel, {color: colors.textSecondary}]}>Matric Marks</Text>
              <View style={styles.marksRow}>
                <View style={[styles.inputField, styles.marksInput, {backgroundColor: colors.background}]}>
                  <TextInput
                    style={{color: colors.text, fontSize: 16, flex: 1, padding: 0}}
                    placeholder="Obtained"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    value={matricMarks}
                    onChangeText={setMatricMarks}
                  />
                </View>
                <Text style={[styles.marksDivider, {color: colors.textSecondary}]}>/</Text>
                <View style={[styles.inputField, styles.totalInput, {backgroundColor: colors.background}]}>
                  <TextInput
                    style={{color: colors.text, fontSize: 16, flex: 1, padding: 0}}
                    placeholder="Total"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    value={matricTotal}
                    onChangeText={setMatricTotal}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.inputCard, {backgroundColor: colors.card}]}>
          <View style={styles.inputRow}>
            <View style={styles.inputIconWrapper}>
              <LinearGradient colors={['#10B981', '#34D399']} style={styles.inputIcon}>
                <Icon name="book-outline" family="Ionicons" size={20} color="#FFF" />
              </LinearGradient>
            </View>
            <View style={styles.inputContent}>
              <Text style={[styles.inputLabel, {color: colors.textSecondary}]}>Inter Marks</Text>
              <View style={styles.marksRow}>
                <View style={[styles.inputField, styles.marksInput, {backgroundColor: colors.background}]}>
                  <TextInput
                    style={{color: colors.text, fontSize: 16, flex: 1, padding: 0}}
                    placeholder="Obtained"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    value={interMarks}
                    onChangeText={setInterMarks}
                  />
                </View>
                <Text style={[styles.marksDivider, {color: colors.textSecondary}]}>/</Text>
                <View style={[styles.inputField, styles.totalInput, {backgroundColor: colors.background}]}>
                  <TextInput
                    style={{color: colors.text, fontSize: 16, flex: 1, padding: 0}}
                    placeholder="Total"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    value={interTotal}
                    onChangeText={setInterTotal}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.inputCard, {backgroundColor: colors.card}]}>
          <View style={styles.inputRow}>
            <View style={styles.inputIconWrapper}>
              <LinearGradient colors={['#F59E0B', '#FBBF24']} style={styles.inputIcon}>
                <Icon name="document-text-outline" family="Ionicons" size={20} color="#FFF" />
              </LinearGradient>
            </View>
            <View style={styles.inputContent}>
              <Text style={[styles.inputLabel, {color: colors.textSecondary}]}>Entry Test Marks</Text>
              <View style={styles.marksRow}>
                <View style={[styles.inputField, styles.marksInput, {backgroundColor: colors.background}]}>
                  <TextInput
                    style={{color: colors.text, fontSize: 16, flex: 1, padding: 0}}
                    placeholder="Obtained"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    value={testMarks}
                    onChangeText={setTestMarks}
                  />
                </View>
                <Text style={[styles.marksDivider, {color: colors.textSecondary}]}>/</Text>
                <View style={[styles.inputField, styles.totalInput, {backgroundColor: colors.background}]}>
                  <TextInput
                    style={{color: colors.text, fontSize: 16, flex: 1, padding: 0}}
                    placeholder="Total"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    value={testTotal}
                    onChangeText={setTestTotal}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Formula Info */}
        <View style={[styles.formulaCard, {backgroundColor: selectedFormula.color + '15'}]}>
          <Icon name="information-circle-outline" family="Ionicons" size={20} color={selectedFormula.color} />
          <Text style={[styles.formulaText, {color: selectedFormula.color}]}>
            Formula: {selectedFormula.matricWeight}% Matric + {selectedFormula.interWeight}% Inter + {selectedFormula.testWeight}% {selectedFormula.testName}
          </Text>
        </View>

        {/* Calculate Button */}
        <TouchableOpacity 
          onPress={calculateMerit}
          accessibilityRole="button"
          accessibilityLabel="Calculate merit score"
          accessibilityHint="Calculates your merit percentage based on matric, inter, and entry test marks">
          <LinearGradient
            colors={['#4573DF', '#3660C9']}
            style={styles.calculateButton}>
            <Icon name="calculator-outline" family="Ionicons" size={24} color="#FFF" />
            <Text style={styles.calculateButtonText}>Calculate Merit</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Result */}
        {result !== null && (
          <View style={[styles.resultCard, {backgroundColor: colors.card}]}>
            <Text style={[styles.resultLabel, {color: colors.textSecondary}]}>Your Merit Score</Text>
            <LinearGradient
              colors={result >= 75 ? ['#10B981', '#34D399'] : result >= 60 ? ['#F59E0B', '#FBBF24'] : ['#EF4444', '#F87171']}
              style={styles.resultBadge}>
              <Text style={styles.resultValue}>{result.toFixed(2)}%</Text>
            </LinearGradient>
            <Text style={[styles.resultHint, {color: colors.textSecondary}]}>
              {result >= 75 ? 'Excellent! Top university material!' : 
               result >= 60 ? 'Good score! Keep improving!' : 
               'Keep working hard!'}
            </Text>
          </View>
        )}

        {/* Quick Tips */}
        <View style={[styles.tipsCard, {backgroundColor: colors.card}]}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
            <Icon name="bulb-outline" family="Ionicons" size={20} color="#F59E0B" />
            <Text style={[styles.tipsTitle, {color: colors.text, marginLeft: 8}]}>Quick Tips</Text>
          </View>
          <View style={styles.tipItem}>
            <Icon name="checkmark-circle" family="Ionicons" size={16} color="#10B981" />
            <Text style={[styles.tipText, {color: colors.textSecondary}]}>
              Different universities have different formulas
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Icon name="checkmark-circle" family="Ionicons" size={16} color="#10B981" />
            <Text style={[styles.tipText, {color: colors.textSecondary}]}>
              Entry test weight varies (30-50% typically)
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Icon name="checkmark-circle" family="Ionicons" size={16} color="#10B981" />
            <Text style={[styles.tipText, {color: colors.textSecondary}]}>
              Use Custom Formula Builder for exact calculation
            </Text>
          </View>
        </View>

        <View style={{height: 100}} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ============================================================================
// MAIN SCREEN COMPONENT
// ============================================================================

const ToolsScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors, isDark} = useTheme();
  const [activeTool, setActiveTool] = useState<string | null>(null);

  // Render active tool component
  const renderActiveTool = () => {
    switch (activeTool) {
      case 'meritCalculator':
        return (
          <SimpleMeritCalculator
            onClose={() => setActiveTool(null)}
            colors={colors}
          />
        );
      case 'gradeConverter':
        return (
          <SafeAreaView style={[styles.toolScreen, {backgroundColor: colors.background}]} edges={['top']}>
            <View style={styles.toolScreenHeader}>
              <TouchableOpacity
                style={[styles.closeButton, {backgroundColor: colors.card}]}
                onPress={() => setActiveTool(null)}>
                <Icon name="arrow-back" family="Ionicons" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.calculatorTitle, {color: colors.text}]}>Grade Converter</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{flex: 1, paddingHorizontal: SPACING.lg}}>
              <GradeConverterCard />
              <View style={{height: 100}} />
            </ScrollView>
          </SafeAreaView>
        );
      case 'targetCalculator':
        return (
          <SafeAreaView style={[styles.toolScreen, {backgroundColor: colors.background}]} edges={['top']}>
            <View style={styles.toolScreenHeader}>
              <TouchableOpacity
                style={[styles.closeButton, {backgroundColor: colors.card}]}
                onPress={() => setActiveTool(null)}>
                <Icon name="arrow-back" family="Ionicons" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.calculatorTitle, {color: colors.text}]}>Target Calculator</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{flex: 1, paddingHorizontal: SPACING.lg}}>
              <TargetCalculator />
              <View style={{height: 100}} />
            </ScrollView>
          </SafeAreaView>
        );
      case 'whatIf':
        return (
          <SafeAreaView style={[styles.toolScreen, {backgroundColor: colors.background}]} edges={['top']}>
            <View style={styles.toolScreenHeader}>
              <TouchableOpacity
                style={[styles.closeButton, {backgroundColor: colors.card}]}
                onPress={() => setActiveTool(null)}>
                <Icon name="arrow-back" family="Ionicons" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.calculatorTitle, {color: colors.text}]}>What-If Simulator</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{flex: 1, paddingHorizontal: SPACING.lg}}>
              <WhatIfSimulator />
              <View style={{height: 100}} />
            </ScrollView>
          </SafeAreaView>
        );
      case 'customFormula':
        return (
          <SafeAreaView style={[styles.toolScreen, {backgroundColor: colors.background}]} edges={['top']}>
            <View style={styles.toolScreenHeader}>
              <TouchableOpacity
                style={[styles.closeButton, {backgroundColor: colors.card}]}
                onPress={() => setActiveTool(null)}>
                <Icon name="arrow-back" family="Ionicons" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.calculatorTitle, {color: colors.text}]}>Custom Formula</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{flex: 1, paddingHorizontal: SPACING.lg}}>
              <CustomFormulaBuilder />
              <View style={{height: 100}} />
            </ScrollView>
          </SafeAreaView>
        );
      default:
        return null;
    }
  };

  // If a tool is active, render it
  if (activeTool) {
    return renderActiveTool();
  }

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, {backgroundColor: colors.card}]}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" family="Ionicons" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, {color: colors.text}]}>Tools</Text>
            <Text style={[styles.headerSubtitle, {color: colors.textSecondary}]}>
              Calculators & Simulators
            </Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <LinearGradient
              colors={['#4573DF', '#3660C9']}
              style={styles.heroCard}>
              <View style={styles.heroContent}>
                <Icon name="calculator" family="Ionicons" size={40} color="rgba(255,255,255,0.9)" />
                <Text style={styles.heroTitle}>Merit Calculation Tools</Text>
                <Text style={styles.heroSubtitle}>
                  Calculate, convert, simulate & plan your academic journey
                </Text>
              </View>
              <View style={styles.heroStats}>
                <View style={styles.heroStatItem}>
                  <Text style={styles.heroStatValue}>5</Text>
                  <Text style={styles.heroStatLabel}>Tools</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStatItem}>
                  <Text style={styles.heroStatValue}>∞</Text>
                  <Text style={styles.heroStatLabel}>Calculations</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Tools List */}
          <View style={styles.section}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4}}>
              <Icon name="construct-outline" family="Ionicons" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, {color: colors.text}]}>Available Tools</Text>
            </View>
            {TOOLS.map((tool, index) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                index={index}
                onPress={() => setActiveTool(tool.component)}
                colors={colors}
              />
            ))}
          </View>

          {/* Quick Access */}
          <View style={styles.section}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
              <Icon name="flash-outline" family="Ionicons" size={20} color="#F59E0B" />
              <Text style={[styles.sectionTitle, {color: colors.text}]}>Quick Actions</Text>
            </View>
            <View style={styles.quickGrid}>
              <TouchableOpacity
                style={[styles.quickButton, {backgroundColor: '#4573DF' + '15'}]}
                onPress={() => setActiveTool('meritCalculator')}>
                <Icon name="calculator-outline" family="Ionicons" size={24} color="#4573DF" />
                <Text style={[styles.quickText, {color: '#4573DF'}]}>Calculate Merit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickButton, {backgroundColor: '#10B981' + '15'}]}
                onPress={() => setActiveTool('gradeConverter')}>
                <Icon name="swap-horizontal-outline" family="Ionicons" size={24} color="#10B981" />
                <Text style={[styles.quickText, {color: '#10B981'}]}>Convert Grade</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Info Card */}
          <View style={[styles.infoCard, {backgroundColor: colors.card}]}>
            <View style={styles.infoHeader}>
              <Icon name="information-circle-outline" family="Ionicons" size={24} color="#4573DF" />
              <Text style={[styles.infoTitle, {color: colors.text}]}>About Merit Formulas</Text>
            </View>
            <Text style={[styles.infoText, {color: colors.textSecondary}]}>
              Each university has its own merit calculation formula. Common components include:
            </Text>
            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <View style={[styles.infoBullet, {backgroundColor: '#4573DF'}]} />
                <Text style={[styles.infoItemText, {color: colors.textSecondary}]}>
                  Matric/O-Level marks (10-20%)
                </Text>
              </View>
              <View style={styles.infoItem}>
                <View style={[styles.infoBullet, {backgroundColor: '#10B981'}]} />
                <Text style={[styles.infoItemText, {color: colors.textSecondary}]}>
                  Inter/A-Level marks (40-60%)
                </Text>
              </View>
              <View style={styles.infoItem}>
                <View style={[styles.infoBullet, {backgroundColor: '#F59E0B'}]} />
                <Text style={[styles.infoItemText, {color: colors.textSecondary}]}>
                  Entry Test marks (30-50%)
                </Text>
              </View>
              <View style={styles.infoItem}>
                <View style={[styles.infoBullet, {backgroundColor: '#4573DF'}]} />
                <Text style={[styles.infoItemText, {color: colors.textSecondary}]}>
                  Hafiz-e-Quran bonus (2-5%)
                </Text>
              </View>
            </View>
          </View>

          <View style={{height: 100}} />
        </ScrollView>
      </SafeAreaView>
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
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weight.heavy,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 2,
  },
  heroSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  heroCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
  },
  heroContent: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#FFF',
    marginTop: SPACING.md,
  },
  heroSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  heroStatItem: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  heroStatValue: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#FFF',
  },
  heroStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: SPACING.md,
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  toolIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  toolTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  toolDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 2,
    lineHeight: 18,
  },
  toolArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  quickButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
  },
  quickText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  infoCard: {
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  infoText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  infoList: {},
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  infoBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.sm,
  },
  infoItemText: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  // Calculator styles
  calculatorContainer: {
    flex: 1,
  },
  calculatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === 'android' ? SPACING.lg : SPACING.md,
    paddingBottom: SPACING.sm,
    minHeight: 56,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  calculatorTitle: {
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  calculatorContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  inputCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIconWrapper: {},
  inputIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: 4,
  },
  inputField: {
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  marksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  marksInput: {
    flex: 1,
  },
  totalInput: {
    width: 80,
  },
  marksDivider: {
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  formulaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginVertical: SPACING.md,
    gap: SPACING.sm,
  },
  formulaText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    flex: 1,
  },
  // Formula Selector Styles
  formulaSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 2,
  },
  formulaSelectorIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formulaSelectorContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  formulaSelectorLabel: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  formulaSelectorName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  formulaDropdown: {
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  formulaOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  formulaOptionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.md,
  },
  formulaOptionInfo: {
    flex: 1,
  },
  formulaOptionName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: 2,
  },
  formulaOptionWeights: {
    fontSize: 11,
  },
  noCustomFormulas: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  noCustomFormulasText: {
    fontSize: 11,
    flex: 1,
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  calculateButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFF',
  },
  resultCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: SPACING.sm,
  },
  resultBadge: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.xl,
  },
  resultValue: {
    fontSize: 32,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#FFF',
  },
  resultHint: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  tipsCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
  },
  tipsTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: SPACING.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  tipText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    flex: 1,
    lineHeight: 18,
  },
  // Tool screen styles
  toolScreen: {
    flex: 1,
  },
  toolScreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === 'android' ? SPACING.lg : SPACING.md,
    paddingBottom: SPACING.sm,
    minHeight: 56,
  },
});

export default ToolsScreen;



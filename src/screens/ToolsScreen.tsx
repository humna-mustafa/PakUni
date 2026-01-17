/**
 * ToolsScreen - Comprehensive Tools & Calculators Hub
 * All tools for merit calculation, grade conversion, projections, and simulations
 * Offline-first - no Supabase dependency
 */

import React, {useState, useRef, useCallback} from 'react';
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
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
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
    color: '#4573DF',
    component: 'whatIf',
  },
  {
    id: 'custom-formula',
    title: 'Custom Formula Builder',
    description: 'Create custom merit formulas for specific universities',
    icon: 'code-slash-outline',
    color: '#4573DF',
    component: 'customFormula',
  },
];

// ============================================================================
// TOOL CARD COMPONENT
// ============================================================================

interface ToolCardProps {
  tool: Tool;
  onPress: () => void;
  colors: any;
}

const ToolCard: React.FC<ToolCardProps> = ({tool, onPress, colors}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: ANIMATION_SCALES.CARD_PRESS,
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
    <Animated.View style={{transform: [{scale: scaleAnim}]}}>
      <TouchableOpacity
        style={[styles.toolCard, {backgroundColor: colors.card}]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}>
        <LinearGradient
          colors={[tool.color, tool.color + 'CC']}
          style={styles.toolIconContainer}>
          <Icon name={tool.icon} family="Ionicons" size={28} color="#FFF" />
        </LinearGradient>
        <View style={styles.toolContent}>
          <Text style={[styles.toolTitle, {color: colors.text}]}>{tool.title}</Text>
          <Text style={[styles.toolDescription, {color: colors.textSecondary}]} numberOfLines={2}>
            {tool.description}
          </Text>
        </View>
        <View style={[styles.toolArrow, {backgroundColor: tool.color + '15'}]}>
          <Icon name="chevron-forward" family="Ionicons" size={20} color={tool.color} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ============================================================================
// SIMPLE MERIT CALCULATOR
// ============================================================================

interface MeritCalculatorProps {
  onClose: () => void;
  colors: any;
}

const SimpleMeritCalculator: React.FC<MeritCalculatorProps> = ({onClose, colors}) => {
  const [matricMarks, setMatricMarks] = useState('');
  const [interMarks, setInterMarks] = useState('');
  const [testMarks, setTestMarks] = useState('');
  const [result, setResult] = useState<number | null>(null);

  const calculateMerit = () => {
    const matric = parseFloat(matricMarks) || 0;
    const inter = parseFloat(interMarks) || 0;
    const test = parseFloat(testMarks) || 0;

    // Common merit formula: 40% matric + 50% inter + 10% test
    // Convert to percentages if needed
    const matricPercent = matric > 100 ? (matric / 1100) * 100 : matric;
    const interPercent = inter > 100 ? (inter / 1100) * 100 : inter;
    const testPercent = test > 100 ? (test / 1100) * 100 : test;

    const merit = (matricPercent * 0.1) + (interPercent * 0.5) + (testPercent * 0.4);
    setResult(Math.min(100, Math.max(0, merit)));
  };

  return (
    <View style={[styles.calculatorContainer, {backgroundColor: colors.background}]}>
      <View style={styles.calculatorHeader}>
        <TouchableOpacity
          style={[styles.closeButton, {backgroundColor: colors.card}]}
          onPress={onClose}>
          <Icon name="arrow-back" family="Ionicons" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.calculatorTitle, {color: colors.text}]}>Merit Calculator</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.calculatorContent}>
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
              <View style={[styles.inputField, {backgroundColor: colors.background}]}>
                <TextInput
                  style={{color: colors.text, fontSize: 16, flex: 1, padding: 0}}
                  placeholder="Enter marks..."
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  value={matricMarks}
                  onChangeText={setMatricMarks}
                />
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
              <View style={[styles.inputField, {backgroundColor: colors.background}]}>
                <TextInput
                  style={{color: colors.text, fontSize: 16, flex: 1, padding: 0}}
                  placeholder="Enter marks..."
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  value={interMarks}
                  onChangeText={setInterMarks}
                />
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
              <View style={[styles.inputField, {backgroundColor: colors.background}]}>
                <TextInput
                  style={{color: colors.text, fontSize: 16, flex: 1, padding: 0}}
                  placeholder="Enter marks..."
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  value={testMarks}
                  onChangeText={setTestMarks}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Formula Info */}
        <View style={[styles.formulaCard, {backgroundColor: '#4573DF' + '15'}]}>
          <Icon name="information-circle-outline" family="Ionicons" size={20} color="#4573DF" />
          <Text style={[styles.formulaText, {color: '#4573DF'}]}>
            Formula: 10% Matric + 50% Inter + 40% Entry Test
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
    </View>
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
          <View style={[styles.toolScreen, {backgroundColor: colors.background}]}>
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
          </View>
        );
      case 'targetCalculator':
        return (
          <View style={[styles.toolScreen, {backgroundColor: colors.background}]}>
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
          </View>
        );
      case 'whatIf':
        return (
          <View style={[styles.toolScreen, {backgroundColor: colors.background}]}>
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
          </View>
        );
      case 'customFormula':
        return (
          <View style={[styles.toolScreen, {backgroundColor: colors.background}]}>
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
          </View>
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
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
              <Icon name="construct-outline" family="Ionicons" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, {color: colors.text}]}>Available Tools</Text>
            </View>
            {TOOLS.map(tool => (
              <ToolCard
                key={tool.id}
                tool={tool}
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
    fontWeight: '800',
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
    fontWeight: '800',
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
    fontWeight: '800',
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
    fontWeight: '700',
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
    fontWeight: '700',
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
    fontWeight: '600',
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
    fontWeight: '700',
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
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
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
    fontWeight: '700',
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
    fontWeight: '600',
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
    fontWeight: '700',
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
    fontWeight: '800',
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
    fontWeight: '700',
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
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
});

export default ToolsScreen;



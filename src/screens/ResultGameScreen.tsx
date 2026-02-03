/**
 * ResultGameScreen - Admission Chance Calculator
 * TRANSFORMED: From random prediction game to useful admission probability tool
 * Features: Real university cutoffs, weighted scoring, actionable recommendations
 */

import React, {useState, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  ScrollView,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '../components/icons';
import {useTheme} from '../contexts/ThemeContext';
import {TYPOGRAPHY, RADIUS, SPACING} from '../constants/design';
import {ANIMATION_SCALES} from '../constants/ui';
import {shareResultPrediction} from '../services/share';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// ============================================================================
// UNIVERSITY ADMISSION DATA
// ============================================================================

interface UniversityAdmission {
  id: string;
  name: string;
  shortName: string;
  programs: ProgramAdmission[];
  color: string;
}

interface ProgramAdmission {
  id: string;
  name: string;
  shortName: string;
  minMarks: number; // Minimum FSc/Matric percentage
  entryTestWeight: number; // Weight given to entry test (0-100)
  marksWeight: number; // Weight given to academic marks (0-100)
  minEntryTest: number; // Minimum entry test score required
  seats: number; // Approximate seats
  lastYearCutoff: number; // Last year's aggregate cutoff
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Very Hard';
}

const UNIVERSITY_DATA: UniversityAdmission[] = [
  {
    id: 'nust',
    name: 'NUST (National University of Sciences & Technology)',
    shortName: 'NUST',
    color: '#1E40AF',
    programs: [
      {id: 'nust-cs', name: 'Computer Science', shortName: 'CS', minMarks: 80, entryTestWeight: 75, marksWeight: 25, minEntryTest: 140, seats: 150, lastYearCutoff: 168, difficulty: 'Very Hard'},
      {id: 'nust-ee', name: 'Electrical Engineering', shortName: 'EE', minMarks: 75, entryTestWeight: 75, marksWeight: 25, minEntryTest: 130, seats: 120, lastYearCutoff: 155, difficulty: 'Very Hard'},
      {id: 'nust-se', name: 'Software Engineering', shortName: 'SE', minMarks: 78, entryTestWeight: 75, marksWeight: 25, minEntryTest: 135, seats: 100, lastYearCutoff: 162, difficulty: 'Very Hard'},
      {id: 'nust-me', name: 'Mechanical Engineering', shortName: 'ME', minMarks: 70, entryTestWeight: 75, marksWeight: 25, minEntryTest: 120, seats: 100, lastYearCutoff: 145, difficulty: 'Hard'},
      {id: 'nust-bba', name: 'Business Administration', shortName: 'BBA', minMarks: 70, entryTestWeight: 70, marksWeight: 30, minEntryTest: 110, seats: 80, lastYearCutoff: 140, difficulty: 'Hard'},
    ],
  },
  {
    id: 'lums',
    name: 'LUMS (Lahore University of Management Sciences)',
    shortName: 'LUMS',
    color: '#DC2626',
    programs: [
      {id: 'lums-cs', name: 'Computer Science', shortName: 'CS', minMarks: 85, entryTestWeight: 50, marksWeight: 50, minEntryTest: 60, seats: 100, lastYearCutoff: 75, difficulty: 'Very Hard'},
      {id: 'lums-bba', name: 'Business Administration', shortName: 'BSc (Hons)', minMarks: 80, entryTestWeight: 50, marksWeight: 50, minEntryTest: 55, seats: 200, lastYearCutoff: 70, difficulty: 'Hard'},
      {id: 'lums-eco', name: 'Economics', shortName: 'Eco', minMarks: 75, entryTestWeight: 50, marksWeight: 50, minEntryTest: 50, seats: 80, lastYearCutoff: 65, difficulty: 'Hard'},
      {id: 'lums-law', name: 'Law (LLB)', shortName: 'LLB', minMarks: 75, entryTestWeight: 50, marksWeight: 50, minEntryTest: 50, seats: 60, lastYearCutoff: 68, difficulty: 'Hard'},
    ],
  },
  {
    id: 'fast',
    name: 'FAST-NUCES',
    shortName: 'FAST',
    color: '#059669',
    programs: [
      {id: 'fast-cs', name: 'Computer Science', shortName: 'CS', minMarks: 70, entryTestWeight: 70, marksWeight: 30, minEntryTest: 55, seats: 300, lastYearCutoff: 72, difficulty: 'Hard'},
      {id: 'fast-se', name: 'Software Engineering', shortName: 'SE', minMarks: 70, entryTestWeight: 70, marksWeight: 30, minEntryTest: 55, seats: 200, lastYearCutoff: 70, difficulty: 'Hard'},
      {id: 'fast-ds', name: 'Data Science', shortName: 'DS', minMarks: 65, entryTestWeight: 70, marksWeight: 30, minEntryTest: 50, seats: 100, lastYearCutoff: 65, difficulty: 'Medium'},
      {id: 'fast-ai', name: 'Artificial Intelligence', shortName: 'AI', minMarks: 68, entryTestWeight: 70, marksWeight: 30, minEntryTest: 52, seats: 80, lastYearCutoff: 68, difficulty: 'Hard'},
      {id: 'fast-ee', name: 'Electrical Engineering', shortName: 'EE', minMarks: 65, entryTestWeight: 70, marksWeight: 30, minEntryTest: 48, seats: 150, lastYearCutoff: 60, difficulty: 'Medium'},
    ],
  },
  {
    id: 'giki',
    name: 'GIKI (Ghulam Ishaq Khan Institute)',
    shortName: 'GIKI',
    color: '#7C3AED',
    programs: [
      {id: 'giki-cs', name: 'Computer Science', shortName: 'CS', minMarks: 75, entryTestWeight: 70, marksWeight: 30, minEntryTest: 65, seats: 80, lastYearCutoff: 78, difficulty: 'Very Hard'},
      {id: 'giki-ee', name: 'Electrical Engineering', shortName: 'EE', minMarks: 72, entryTestWeight: 70, marksWeight: 30, minEntryTest: 60, seats: 100, lastYearCutoff: 72, difficulty: 'Hard'},
      {id: 'giki-me', name: 'Mechanical Engineering', shortName: 'ME', minMarks: 70, entryTestWeight: 70, marksWeight: 30, minEntryTest: 55, seats: 100, lastYearCutoff: 68, difficulty: 'Hard'},
    ],
  },
  {
    id: 'comsats',
    name: 'COMSATS University',
    shortName: 'COMSATS',
    color: '#0891B2',
    programs: [
      {id: 'comsats-cs', name: 'Computer Science', shortName: 'CS', minMarks: 60, entryTestWeight: 50, marksWeight: 50, minEntryTest: 50, seats: 400, lastYearCutoff: 70, difficulty: 'Medium'},
      {id: 'comsats-se', name: 'Software Engineering', shortName: 'SE', minMarks: 60, entryTestWeight: 50, marksWeight: 50, minEntryTest: 50, seats: 300, lastYearCutoff: 68, difficulty: 'Medium'},
      {id: 'comsats-ee', name: 'Electrical Engineering', shortName: 'EE', minMarks: 55, entryTestWeight: 50, marksWeight: 50, minEntryTest: 45, seats: 250, lastYearCutoff: 62, difficulty: 'Easy'},
      {id: 'comsats-bba', name: 'Business Administration', shortName: 'BBA', minMarks: 50, entryTestWeight: 40, marksWeight: 60, minEntryTest: 40, seats: 200, lastYearCutoff: 58, difficulty: 'Easy'},
    ],
  },
  {
    id: 'uet',
    name: 'UET Lahore',
    shortName: 'UET',
    color: '#B45309',
    programs: [
      {id: 'uet-cs', name: 'Computer Science', shortName: 'CS', minMarks: 70, entryTestWeight: 80, marksWeight: 20, minEntryTest: 65, seats: 120, lastYearCutoff: 850, difficulty: 'Hard'},
      {id: 'uet-ee', name: 'Electrical Engineering', shortName: 'EE', minMarks: 65, entryTestWeight: 80, marksWeight: 20, minEntryTest: 60, seats: 200, lastYearCutoff: 800, difficulty: 'Hard'},
      {id: 'uet-me', name: 'Mechanical Engineering', shortName: 'ME', minMarks: 60, entryTestWeight: 80, marksWeight: 20, minEntryTest: 55, seats: 200, lastYearCutoff: 750, difficulty: 'Medium'},
      {id: 'uet-civil', name: 'Civil Engineering', shortName: 'Civil', minMarks: 60, entryTestWeight: 80, marksWeight: 20, minEntryTest: 50, seats: 180, lastYearCutoff: 700, difficulty: 'Medium'},
    ],
  },
  {
    id: 'pu',
    name: 'Punjab University',
    shortName: 'PU',
    color: '#4F46E5',
    programs: [
      {id: 'pu-cs', name: 'Computer Science', shortName: 'CS', minMarks: 55, entryTestWeight: 60, marksWeight: 40, minEntryTest: 50, seats: 300, lastYearCutoff: 65, difficulty: 'Medium'},
      {id: 'pu-it', name: 'Information Technology', shortName: 'IT', minMarks: 50, entryTestWeight: 60, marksWeight: 40, minEntryTest: 45, seats: 250, lastYearCutoff: 60, difficulty: 'Easy'},
      {id: 'pu-bba', name: 'Business Administration', shortName: 'BBA', minMarks: 50, entryTestWeight: 50, marksWeight: 50, minEntryTest: 45, seats: 200, lastYearCutoff: 58, difficulty: 'Easy'},
      {id: 'pu-law', name: 'Law (LLB)', shortName: 'LLB', minMarks: 50, entryTestWeight: 50, marksWeight: 50, minEntryTest: 45, seats: 150, lastYearCutoff: 55, difficulty: 'Easy'},
    ],
  },
  {
    id: 'iba',
    name: 'IBA Karachi',
    shortName: 'IBA',
    color: '#BE185D',
    programs: [
      {id: 'iba-bba', name: 'Business Administration', shortName: 'BBA', minMarks: 75, entryTestWeight: 60, marksWeight: 40, minEntryTest: 70, seats: 200, lastYearCutoff: 75, difficulty: 'Very Hard'},
      {id: 'iba-cs', name: 'Computer Science', shortName: 'CS', minMarks: 75, entryTestWeight: 60, marksWeight: 40, minEntryTest: 68, seats: 100, lastYearCutoff: 73, difficulty: 'Very Hard'},
      {id: 'iba-eco', name: 'Economics & Mathematics', shortName: 'Eco', minMarks: 70, entryTestWeight: 60, marksWeight: 40, minEntryTest: 65, seats: 80, lastYearCutoff: 70, difficulty: 'Hard'},
    ],
  },
];

// Calculate admission chance percentage
const calculateAdmissionChance = (
  marks: number,
  entryTestScore: number,
  entryTestMax: number,
  program: ProgramAdmission
): {percentage: number; status: string; color: string; recommendations: string[]} => {
  const recommendations: string[] = [];
  
  // Normalize entry test score to percentage
  const entryTestPercentage = (entryTestScore / entryTestMax) * 100;
  
  // Calculate weighted aggregate
  const aggregate = (marks * program.marksWeight / 100) + (entryTestPercentage * program.entryTestWeight / 100);
  
  // Check minimum requirements first
  const meetsMinMarks = marks >= program.minMarks;
  const meetsMinEntryTest = entryTestScore >= program.minEntryTest;
  
  if (!meetsMinMarks) {
    recommendations.push(`Minimum ${program.minMarks}% marks required. You have ${marks}%.`);
  }
  
  if (!meetsMinEntryTest) {
    recommendations.push(`Entry test score needs improvement. Target: ${program.minEntryTest}+`);
  }
  
  // Calculate chance based on how aggregate compares to cutoff
  let percentage: number;
  let status: string;
  let color: string;
  
  // For NUST/GIKI style (out of 200), normalize differently
  const normalizedCutoff = program.lastYearCutoff > 100 ? program.lastYearCutoff / 2 : program.lastYearCutoff;
  const normalizedAggregate = aggregate;
  
  const ratio = normalizedAggregate / normalizedCutoff;
  
  // If minimum requirements not met, cap the chance very low
  if (!meetsMinMarks || !meetsMinEntryTest) {
    percentage = 5;
    status = 'Not Eligible';
    color = '#EF4444';
    recommendations.push('You do not meet minimum requirements for this program.');
  } else if (ratio >= 1.15) {
    percentage = 90;
    status = 'Excellent Chance';
    color = '#10B981';
    recommendations.push('Your profile is very strong! Focus on interview prep.');
  } else if (ratio >= 1.05) {
    percentage = 75;
    status = 'Good Chance';
    color = '#22C55E';
    recommendations.push('Strong candidate. Keep documents ready!');
  } else if (ratio >= 0.98) {
    percentage = 55;
    status = 'Fair Chance';
    color = '#84CC16';
    recommendations.push('Competitive profile. Consider backup options too.');
  } else if (ratio >= 0.92) {
    percentage = 35;
    status = 'Low Chance';
    color = '#F59E0B';
    recommendations.push('Borderline case. Apply to similar-tier universities as backup.');
  } else if (ratio >= 0.85) {
    percentage = 20;
    status = 'Very Low Chance';
    color = '#EF4444';
    recommendations.push('Consider easier programs or other universities.');
  } else {
    percentage = 10;
    status = 'Unlikely';
    color = '#EF4444';
    recommendations.push('Focus on backup options. Consider improving your marks.');
  }
  
  // Difficulty adjustment
  if (program.difficulty === 'Very Hard') {
    percentage = Math.max(5, percentage - 15);
    if (percentage < 40) {
      recommendations.push(`${program.shortName} at this university is highly competitive.`);
    }
  } else if (program.difficulty === 'Hard') {
    percentage = Math.max(5, percentage - 5);
  } else if (program.difficulty === 'Easy') {
    percentage = Math.min(95, percentage + 10);
  }
  
  // Cap the percentage
  percentage = Math.max(5, Math.min(95, percentage));
  const finalColor = color || '#3B82F6';
  
  return {percentage, status, color: finalColor, recommendations};
};


// ============================================================================
// ADMISSION CHANCE CALCULATOR COMPONENT
// ============================================================================

interface CalculationResult {
  program: ProgramAdmission;
  university: UniversityAdmission;
  percentage: number;
  status: string;
  color: string;
  recommendations: string[];
}

const ResultGameScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors, isDark} = useTheme();
  
  // Form state
  const [marks, setMarks] = useState<string>('');
  const [entryTestScore, setEntryTestScore] = useState<string>('');
  const [entryTestMax, setEntryTestMax] = useState<string>('200');
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<CalculationResult[]>([]);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Animations
  const resultScale = useRef(new Animated.Value(0)).current;
  const resultOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const selectedUniData = UNIVERSITY_DATA.find(u => u.id === selectedUniversity);

  const handleCalculate = useCallback(() => {
    const marksNum = parseFloat(marks);
    const testScore = parseFloat(entryTestScore);
    const testMax = parseFloat(entryTestMax);

    if (isNaN(marksNum) || isNaN(testScore) || isNaN(testMax)) {
      return;
    }

    let programsToCalculate: {program: ProgramAdmission; university: UniversityAdmission}[] = [];

    if (selectedUniversity && selectedProgram) {
      // Calculate for specific program
      const uni = UNIVERSITY_DATA.find(u => u.id === selectedUniversity);
      const prog = uni?.programs.find(p => p.id === selectedProgram);
      if (uni && prog) {
        programsToCalculate = [{program: prog, university: uni}];
      }
    } else if (selectedUniversity) {
      // Calculate for all programs in selected university
      const uni = UNIVERSITY_DATA.find(u => u.id === selectedUniversity);
      if (uni) {
        programsToCalculate = uni.programs.map(p => ({program: p, university: uni}));
      }
    } else {
      // Calculate for all universities and programs
      UNIVERSITY_DATA.forEach(uni => {
        uni.programs.forEach(prog => {
          programsToCalculate.push({program: prog, university: uni});
        });
      });
    }

    const calculatedResults: CalculationResult[] = programsToCalculate.map(({program, university}) => {
      const result = calculateAdmissionChance(marksNum, testScore, testMax, program);
      return {
        program,
        university,
        ...result,
      };
    });

    // Sort by percentage (highest first)
    calculatedResults.sort((a, b) => b.percentage - a.percentage);

    setResults(calculatedResults);
    setShowResults(true);

    // Animate results appearance
    Animated.parallel([
      Animated.spring(resultScale, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(resultOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [marks, entryTestScore, entryTestMax, selectedUniversity, selectedProgram]);

  const handleReset = () => {
    setShowResults(false);
    setResults([]);
    setStep(1);
    setSelectedUniversity(null);
    setSelectedProgram(null);
    resultScale.setValue(0);
    resultOpacity.setValue(0);
  };

  const getChanceColor = (percentage: number) => {
    if (percentage >= 80) return '#10B981';
    if (percentage >= 60) return '#22C55E';
    if (percentage >= 40) return '#F59E0B';
    if (percentage >= 20) return '#EF4444';
    return '#DC2626';
  };

  const handleButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: ANIMATION_SCALES.ICON_PRESS,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

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
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, {color: colors.text}]}>Admission Calculator</Text>
            <Text style={[styles.headerSubtitle, {color: colors.textSecondary}]}>
              Check your admission chances 📊
            </Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <LinearGradient
              colors={['#4573DF', '#6366F1']}
              style={styles.heroCard}>
              <View style={styles.heroEmoji}>
                <Text style={styles.heroEmojiText}>🎓</Text>
              </View>
              <Text style={styles.heroTitle}>Admission Chance Calculator</Text>
              <Text style={styles.heroSubtitle}>
                Enter your marks and entry test score to see your chances at top Pakistani universities!
              </Text>
            </LinearGradient>
          </View>

          {/* Info Card */}
          <View style={[styles.disclaimerCard, {backgroundColor: '#4573DF' + '15'}]}>
            <Icon name="information-circle-outline" size={20} color="#4573DF" />
            <Text style={[styles.disclaimerText, {color: '#4573DF'}]}>
              Based on 2024 cutoffs & merit lists. Actual results may vary.
            </Text>
          </View>

          {showResults ? (
            /* Results Display */
            <Animated.View
              style={[
                styles.resultContainer,
                {
                  transform: [{scale: resultScale}],
                  opacity: resultOpacity,
                },
              ]}>
              {/* Summary Card */}
              <View style={[styles.summaryCard, {backgroundColor: colors.card}]}>
                <Text style={[styles.summaryTitle, {color: colors.text}]}>Your Input</Text>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, {color: colors.textSecondary}]}>FSc/Matric Marks:</Text>
                  <Text style={[styles.summaryValue, {color: colors.text}]}>{marks}%</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, {color: colors.textSecondary}]}>Entry Test Score:</Text>
                  <Text style={[styles.summaryValue, {color: colors.text}]}>{entryTestScore}/{entryTestMax}</Text>
                </View>
              </View>

              {/* Results Title */}
              <View style={styles.section}>
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
                  <Icon name="stats-chart" size={24} color="#4573DF" />
                  <Text style={[styles.sectionTitle, {color: colors.text, marginLeft: 8}]}>
                    Your Admission Chances
                  </Text>
                </View>

                {/* Results List */}
                {results.slice(0, 10).map((result, index) => (
                  <View 
                    key={result.program.id} 
                    style={[styles.resultItem, {backgroundColor: colors.card}]}>
                    <View style={styles.resultHeader}>
                      <View style={[styles.rankBadge, {backgroundColor: getChanceColor(result.percentage) + '20'}]}>
                        <Text style={[styles.rankText, {color: getChanceColor(result.percentage)}]}>
                          #{index + 1}
                        </Text>
                      </View>
                      <View style={styles.resultInfo}>
                        <Text style={[styles.universityName, {color: result.university.color}]}>
                          {result.university.shortName}
                        </Text>
                        <Text style={[styles.programName, {color: colors.text}]}>
                          {result.program.name}
                        </Text>
                      </View>
                      <View style={styles.chanceContainer}>
                        <Text style={[styles.chancePercent, {color: getChanceColor(result.percentage)}]}>
                          {result.percentage}%
                        </Text>
                        <Text style={[styles.chanceStatus, {color: colors.textSecondary}]}>
                          {result.status}
                        </Text>
                      </View>
                    </View>
                    
                    {/* Chance Bar */}
                    <View style={styles.chanceBarContainer}>
                      <View style={[styles.chanceBarBg, {backgroundColor: colors.border}]}>
                        <View 
                          style={[
                            styles.chanceBarFill, 
                            {
                              width: `${result.percentage}%`,
                              backgroundColor: getChanceColor(result.percentage),
                            }
                          ]} 
                        />
                      </View>
                    </View>

                    {/* Program Details */}
                    <View style={styles.programDetails}>
                      <View style={styles.detailItem}>
                        <Icon name="school-outline" size={14} color={colors.textSecondary} />
                        <Text style={[styles.detailText, {color: colors.textSecondary}]}>
                          ~{result.program.seats} seats
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Icon name="trending-up-outline" size={14} color={colors.textSecondary} />
                        <Text style={[styles.detailText, {color: colors.textSecondary}]}>
                          Cutoff: {result.program.lastYearCutoff}
                        </Text>
                      </View>
                      <View style={[styles.difficultyBadge, {backgroundColor: 
                        result.program.difficulty === 'Very Hard' ? '#EF444420' :
                        result.program.difficulty === 'Hard' ? '#F59E0B20' :
                        result.program.difficulty === 'Medium' ? '#4573DF20' : '#10B98120'
                      }]}>
                        <Text style={[styles.difficultyText, {color: 
                          result.program.difficulty === 'Very Hard' ? '#EF4444' :
                          result.program.difficulty === 'Hard' ? '#F59E0B' :
                          result.program.difficulty === 'Medium' ? '#4573DF' : '#10B981'
                        }]}>
                          {result.program.difficulty}
                        </Text>
                      </View>
                    </View>

                    {/* Recommendations */}
                    {result.recommendations.length > 0 && (
                      <View style={styles.recommendationsContainer}>
                        {result.recommendations.slice(0, 2).map((rec, idx) => (
                          <View key={idx} style={styles.recommendationItem}>
                            <Icon name="bulb-outline" size={12} color="#F59E0B" />
                            <Text style={[styles.recommendationText, {color: colors.textSecondary}]}>
                              {rec}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.shareBtn, {backgroundColor: '#4573DF'}]}
                  onPress={() => {
                    const topResult = results[0];
                    if (topResult) {
                      shareResultPrediction(
                        `${topResult.university.name} - ${topResult.program.name}`,
                        topResult.university.shortName,
                        topResult.percentage
                      );
                    }
                  }}>
                  <Icon name="share-social-outline" size={20} color="#FFF" />
                  <Text style={styles.shareBtnText}>Share Results</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.resetBtn, {backgroundColor: colors.card, borderColor: colors.border}]}
                  onPress={handleReset}>
                  <Icon name="refresh-outline" size={20} color={colors.text} />
                  <Text style={[styles.resetBtnText, {color: colors.text}]}>Calculate Again</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          ) : (
            /* Input Form */
            <>
              {/* Step 1: Enter Marks */}
              <View style={styles.section}>
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
                  <View style={[styles.stepBadge, {backgroundColor: '#4573DF'}]}>
                    <Text style={styles.stepNumber}>1</Text>
                  </View>
                  <Text style={[styles.sectionTitle, {color: colors.text, marginLeft: 8}]}>
                    Enter Your Marks
                  </Text>
                </View>
                
                <View style={[styles.inputCard, {backgroundColor: colors.card}]}>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, {color: colors.text}]}>FSc/Matric Percentage</Text>
                    <View style={[styles.inputWrapper, {backgroundColor: colors.background, borderColor: colors.border}]}>
                      <Icon name="school-outline" size={20} color={colors.textSecondary} />
                      <TextInput
                        style={[styles.input, {color: colors.text}]}
                        placeholder="e.g., 85"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                        value={marks}
                        onChangeText={setMarks}
                        maxLength={5}
                      />
                      <Text style={[styles.inputSuffix, {color: colors.textSecondary}]}>%</Text>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, {color: colors.text}]}>Entry Test Score</Text>
                    <View style={styles.inputRow}>
                      <View style={[styles.inputWrapper, styles.inputWrapperFlex, {backgroundColor: colors.background, borderColor: colors.border}]}>
                        <Icon name="document-text-outline" size={20} color={colors.textSecondary} />
                        <TextInput
                          style={[styles.input, {color: colors.text}]}
                          placeholder="Your score"
                          placeholderTextColor={colors.textSecondary}
                          keyboardType="numeric"
                          value={entryTestScore}
                          onChangeText={setEntryTestScore}
                          maxLength={4}
                        />
                      </View>
                      <Text style={[styles.outOfText, {color: colors.textSecondary}]}>out of</Text>
                      <View style={[styles.inputWrapper, styles.inputWrapperSmall, {backgroundColor: colors.background, borderColor: colors.border}]}>
                        <TextInput
                          style={[styles.input, styles.inputCenter, {color: colors.text}]}
                          placeholder="200"
                          placeholderTextColor={colors.textSecondary}
                          keyboardType="numeric"
                          value={entryTestMax}
                          onChangeText={setEntryTestMax}
                          maxLength={4}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Step 2: Select University (Optional) */}
              <View style={styles.section}>
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
                  <View style={[styles.stepBadge, {backgroundColor: '#22C55E'}]}>
                    <Text style={styles.stepNumber}>2</Text>
                  </View>
                  <Text style={[styles.sectionTitle, {color: colors.text, marginLeft: 8}]}>
                    Select University (Optional)
                  </Text>
                </View>
                <Text style={[styles.sectionSubtitle, {color: colors.textSecondary}]}>
                  Leave empty to check all universities
                </Text>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.uniScroll}>
                  <TouchableOpacity
                    style={[
                      styles.uniChip,
                      {
                        backgroundColor: selectedUniversity === null ? '#4573DF' : colors.card,
                        borderColor: selectedUniversity === null ? '#4573DF' : colors.border,
                      }
                    ]}
                    onPress={() => {
                      setSelectedUniversity(null);
                      setSelectedProgram(null);
                    }}>
                    <Text style={[styles.uniChipText, {color: selectedUniversity === null ? '#FFF' : colors.text}]}>
                      All Universities
                    </Text>
                  </TouchableOpacity>
                  {UNIVERSITY_DATA.map(uni => (
                    <TouchableOpacity
                      key={uni.id}
                      style={[
                        styles.uniChip,
                        {
                          backgroundColor: selectedUniversity === uni.id ? uni.color : colors.card,
                          borderColor: selectedUniversity === uni.id ? uni.color : colors.border,
                        }
                      ]}
                      onPress={() => {
                        setSelectedUniversity(uni.id);
                        setSelectedProgram(null);
                      }}>
                      <Text style={[styles.uniChipText, {color: selectedUniversity === uni.id ? '#FFF' : colors.text}]}>
                        {uni.shortName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Program Selection */}
                {selectedUniData && (
                  <View style={styles.programsContainer}>
                    <Text style={[styles.programsLabel, {color: colors.textSecondary}]}>
                      Select Program:
                    </Text>
                    <View style={styles.programsGrid}>
                      <TouchableOpacity
                        style={[
                          styles.programChip,
                          {
                            backgroundColor: selectedProgram === null ? '#4573DF20' : colors.card,
                            borderColor: selectedProgram === null ? '#4573DF' : colors.border,
                          }
                        ]}
                        onPress={() => setSelectedProgram(null)}>
                        <Text style={[styles.programChipText, {color: selectedProgram === null ? '#4573DF' : colors.text}]}>
                          All Programs
                        </Text>
                      </TouchableOpacity>
                      {selectedUniData.programs.map(prog => (
                        <TouchableOpacity
                          key={prog.id}
                          style={[
                            styles.programChip,
                            {
                              backgroundColor: selectedProgram === prog.id ? '#4573DF20' : colors.card,
                              borderColor: selectedProgram === prog.id ? '#4573DF' : colors.border,
                            }
                          ]}
                          onPress={() => setSelectedProgram(prog.id)}>
                          <Text style={[styles.programChipText, {color: selectedProgram === prog.id ? '#4573DF' : colors.text}]}>
                            {prog.shortName}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </View>

              {/* Calculate Button */}
              {marks && entryTestScore && (
                <Animated.View style={{transform: [{scale: buttonScale}]}}>
                  <TouchableOpacity onPress={() => { handleButtonPress(); handleCalculate(); }}>
                    <LinearGradient
                      colors={['#4573DF', '#6366F1']}
                      style={styles.calculateButton}>
                      <Icon name="calculator" size={24} color="#FFF" />
                      <Text style={styles.calculateButtonText}>Calculate My Chances</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              )}

              {/* Tips Section */}
              <View style={[styles.factsCard, {backgroundColor: colors.card}]}>
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
                  <Icon name="bulb-outline" size={20} color="#F59E0B" />
                  <Text style={[styles.factsTitle, {color: colors.text, marginLeft: 8}]}>Tips for Better Chances</Text>
                </View>
                <View style={styles.factItem}>
                  <Icon name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={[styles.factText, {color: colors.textSecondary}]}>
                    Focus on entry test prep - it carries 70-80% weight at most universities!
                  </Text>
                </View>
                <View style={styles.factItem}>
                  <Icon name="book-outline" size={16} color="#4573DF" />
                  <Text style={[styles.factText, {color: colors.textSecondary}]}>
                    NUST NET, GIKI, FAST - each has different patterns. Practice past papers!
                  </Text>
                </View>
                <View style={styles.factItem}>
                  <Icon name="shield-checkmark" size={16} color="#F59E0B" />
                  <Text style={[styles.factText, {color: colors.textSecondary}]}>
                    Always have 2-3 backup options. Apply to universities at different difficulty levels.
                  </Text>
                </View>
                <View style={styles.factItem}>
                  <Icon name="time-outline" size={16} color="#EF4444" />
                  <Text style={[styles.factText, {color: colors.textSecondary}]}>
                    Don't miss application deadlines! NUST opens in June, FAST in July.
                  </Text>
                </View>
              </View>
            </>
          )}

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
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },
  heroSection: {
    marginBottom: SPACING.lg,
  },
  heroCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  heroEmoji: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  heroEmojiText: {
    fontSize: 40,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 20,
  },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  disclaimerText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: SPACING.md,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  inputCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginTop: SPACING.sm,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  inputWrapperFlex: {
    flex: 1,
  },
  inputWrapperSmall: {
    width: 80,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    paddingVertical: 4,
  },
  inputCenter: {
    textAlign: 'center',
  },
  inputSuffix: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  outOfText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
  },
  uniScroll: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  uniChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    marginRight: SPACING.sm,
  },
  uniChipText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
  programsContainer: {
    marginTop: SPACING.sm,
  },
  programsLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: SPACING.sm,
  },
  programsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  programChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  programChipText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  calculateButtonText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: '#FFF',
  },
  resultContainer: {
    marginBottom: SPACING.lg,
  },
  summaryCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  summaryTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
  },
  resultItem: {
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '800',
  },
  resultInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  universityName: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
  },
  programName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
  },
  chanceContainer: {
    alignItems: 'flex-end',
  },
  chancePercent: {
    fontSize: 20,
    fontWeight: '800',
  },
  chanceStatus: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  chanceBarContainer: {
    marginTop: SPACING.sm,
  },
  chanceBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  chanceBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  programDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    gap: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  difficultyBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  difficultyText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
  },
  recommendationsContainer: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 4,
  },
  recommendationText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.xs,
    lineHeight: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  shareBtnText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    color: '#FFF',
  },
  resetBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 1,
  },
  resetBtnText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
  },
  factsCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginTop: SPACING.md,
  },
  factsTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
  },
  factItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  factText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 18,
  },
});

export default ResultGameScreen;



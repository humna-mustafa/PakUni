/**
 * What-If Simulator
 * "If I score 80 in NET, my aggregate becomes..."
 * Real-time aggregate simulation with slider
 * Enhanced with actual merit data from meritArchive
 */

import React, {useState, useEffect, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '../icons';
import {TYPOGRAPHY, RADIUS, SPACING} from '../../constants/design';
import {useTheme} from '../../contexts';
import {MERIT_RECORDS} from '../../data/meritArchive';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// ============================================================================
// MERIT DATA HELPERS
// ============================================================================

// Get program-wise merit data for a university from actual records
const getProgramMeritFromArchive = (universityShortName: string): {name: string; lastMerit: number}[] => {
  const uniRecords = MERIT_RECORDS.filter(
    r => r.universityShortName.toUpperCase() === universityShortName.toUpperCase()
  );
  if (uniRecords.length === 0) return [];

  // Get most recent year's records
  const years = [...new Set(uniRecords.map(r => r.year))].sort((a, b) => b - a);
  const latestYear = years[0];
  const latestRecords = uniRecords.filter(r => r.year === latestYear);

  // Group by program and get average merit
  const programMap = new Map<string, number[]>();
  latestRecords.forEach(record => {
    const programName = record.programName.length > 20 
      ? record.programName.substring(0, 17) + '...'
      : record.programName;
    if (!programMap.has(programName)) {
      programMap.set(programName, []);
    }
    programMap.get(programName)!.push(record.closingMerit);
  });

  // Convert to array with average merit, sorted by merit (highest first)
  const programs = Array.from(programMap.entries())
    .map(([name, merits]) => ({
      name,
      lastMerit: Math.round(merits.reduce((a, b) => a + b, 0) / merits.length * 10) / 10,
    }))
    .sort((a, b) => b.lastMerit - a.lastMerit)
    .slice(0, 6); // Show top 6 programs

  return programs;
};

// ============================================================================
// TYPES
// ============================================================================

interface UniversityConfig {
  id: string;
  name: string;
  shortName: string;
  matricWeight: number;
  interWeight: number;
  testWeight: number;
  testName: string;
  minAggregate?: number;
  color: string;
  programs?: {
    name: string;
    lastMerit: number;
  }[];
}

interface WhatIfResult {
  aggregate: number;
  meritChance: 'high' | 'medium' | 'low' | 'unlikely';
  matchingPrograms: string[];
  improvement: number;
}

interface WhatIfSimulatorProps {
  onSimulate?: (result: WhatIfResult) => void;
}

// ============================================================================
// PRESET UNIVERSITIES (programs loaded dynamically from merit archive)
// ============================================================================

const PRESET_UNIVERSITIES: UniversityConfig[] = [
  {
    id: 'nust',
    name: 'NUST',
    shortName: 'NUST',
    matricWeight: 10,
    interWeight: 15,
    testWeight: 75,
    testName: 'NET',
    minAggregate: 60,
    color: '#4573DF',
    // Programs loaded from merit archive
    programs: getProgramMeritFromArchive('NUST').length > 0 
      ? getProgramMeritFromArchive('NUST')
      : [{name: 'CS', lastMerit: 87}, {name: 'EE', lastMerit: 82}, {name: 'ME', lastMerit: 78}],
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
    color: '#DC2626',
    programs: getProgramMeritFromArchive('FAST').length > 0
      ? getProgramMeritFromArchive('FAST')
      : [{name: 'CS', lastMerit: 80}, {name: 'SE', lastMerit: 76}, {name: 'AI', lastMerit: 78}],
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
    color: '#059669',
    programs: getProgramMeritFromArchive('GIKI').length > 0
      ? getProgramMeritFromArchive('GIKI')
      : [{name: 'CS', lastMerit: 83}, {name: 'EE', lastMerit: 78}, {name: 'ME', lastMerit: 75}],
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
    color: '#0891B2',
    programs: getProgramMeritFromArchive('COMSATS').length > 0
      ? getProgramMeritFromArchive('COMSATS')
      : [{name: 'CS', lastMerit: 73}, {name: 'SE', lastMerit: 70}, {name: 'EE', lastMerit: 66}],
  },
];

// ============================================================================
// CUSTOM SLIDER COMPONENT
// ============================================================================

interface CustomSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue: number;
  maximumValue: number;
  color: string;
  trackBgColor?: string;
  scaleColor?: string;
}

const CustomSlider: React.FC<CustomSliderProps> = ({
  value,
  onValueChange,
  minimumValue,
  maximumValue,
  color,
  trackBgColor = '#E2E8F0',
  scaleColor = '#94A3B8',
}) => {
  const sliderWidth = SCREEN_WIDTH - 80;
  const position = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const normalizedValue = (value - minimumValue) / (maximumValue - minimumValue);
    position.setValue(normalizedValue * sliderWidth);
  }, [value, minimumValue, maximumValue, sliderWidth, position]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {},
        onPanResponderMove: (_, gestureState) => {
          const newX = Math.max(0, Math.min(sliderWidth, gestureState.moveX - 40));
          position.setValue(newX);
          const newValue =
            minimumValue + (newX / sliderWidth) * (maximumValue - minimumValue);
          onValueChange(Math.round(newValue));
        },
        onPanResponderRelease: () => {},
      }),
    [minimumValue, maximumValue, onValueChange, position, sliderWidth]
  );

  const trackWidth = position.interpolate({
    inputRange: [0, sliderWidth],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={sliderStyles.container} {...panResponder.panHandlers}>
      {/* Track Background */}
      <View style={[sliderStyles.trackBackground, {backgroundColor: trackBgColor}]}>
        {/* Filled Track */}
        <Animated.View
          style={[
            sliderStyles.trackFilled,
            {width: trackWidth, backgroundColor: color},
          ]}
        />
      </View>
      
      {/* Thumb */}
      <Animated.View
        style={[
          sliderStyles.thumb,
          {
            backgroundColor: color,
            transform: [{translateX: position}],
          },
        ]}>
        <Text style={sliderStyles.thumbText}>{value}</Text>
      </Animated.View>

      {/* Scale Markers */}
      <View style={sliderStyles.scaleContainer}>
        {[0, 25, 50, 75, 100].map(mark => (
          <Text key={mark} style={[sliderStyles.scaleMark, {color: scaleColor}]}>
            {mark}
          </Text>
        ))}
      </View>
    </View>
  );
};

const sliderStyles = StyleSheet.create({
  container: {
    height: 70,
    justifyContent: 'flex-start',
    paddingTop: 10,
  },
  trackBackground: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  trackFilled: {
    height: '100%',
    borderRadius: 4,
  },
  thumb: {
    position: 'absolute',
    top: 2,
    width: 40,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  thumbText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  scaleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 2,
  },
  scaleMark: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: TYPOGRAPHY.weight.medium,
  },
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({onSimulate}) => {
  const {colors, isDark} = useTheme();

  // State
  const [selectedUniversity, setSelectedUniversity] = useState<UniversityConfig>(
    PRESET_UNIVERSITIES[0]
  );
  const [matricPercent, setMatricPercent] = useState('90');
  const [interPercent, setInterPercent] = useState('85');
  const [testScore, setTestScore] = useState(70);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonScore, setComparisonScore] = useState(80);

  // Animations
  const aggregateAnim = React.useRef(new Animated.Value(0)).current;
  const barAnim = React.useRef(new Animated.Value(0)).current;

  // Dark mode theme styles
  const themeStyles = useMemo(() => ({
    container: { backgroundColor: colors.card },
    headerTitle: { color: colors.text },
    headerSubtitle: { color: colors.textSecondary },
    tabInactive: { backgroundColor: isDark ? colors.surfaceContainer : '#F1F5F9' },
    tabText: { color: colors.textMuted },
    inputLabel: { color: colors.textMuted },
    textInput: {
      backgroundColor: colors.inputBackground,
      borderColor: colors.inputBorder,
      color: colors.inputText,
    },
    sliderLabel: { color: colors.text },
    programsSection: { backgroundColor: isDark ? colors.surfaceContainer : '#F8FAFC' },
    programsTitle: { color: colors.textSecondary },
    programChipInactive: {
      backgroundColor: isDark ? colors.surfaceContainerHigh : '#F1F5F9',
      borderColor: colors.border,
    },
    programNameInactive: { color: colors.textMuted },
    programMeritInactive: { color: colors.textMuted },
    comparisonToggle: { borderTopColor: colors.divider },
    comparisonSection: { backgroundColor: isDark ? colors.surfaceContainer : '#F8FAFC' },
    comparisonLabel: { color: colors.textSecondary },
    comparisonCardLabel: { color: colors.textMuted },
    comparisonCardScore: { color: colors.textMuted },
    formulaBox: { backgroundColor: isDark ? colors.surfaceContainer : '#F8FAFC' },
    formulaText: { color: colors.textMuted },
    trackBg: isDark ? colors.surfaceContainerHigh : '#E2E8F0',
    scaleColor: colors.textMuted,
  }), [colors, isDark]);

  // Calculate aggregate
  const calculateAggregate = useCallback(
    (score: number): number => {
      const matric = parseFloat(matricPercent) || 0;
      const inter = parseFloat(interPercent) || 0;

      const aggregate =
        (matric * selectedUniversity.matricWeight) / 100 +
        (inter * selectedUniversity.interWeight) / 100 +
        (score * selectedUniversity.testWeight) / 100;

      return Math.round(aggregate * 100) / 100;
    },
    [matricPercent, interPercent, selectedUniversity]
  );

  // Current aggregate
  const currentAggregate = useMemo(
    () => calculateAggregate(testScore),
    [calculateAggregate, testScore]
  );

  // Comparison aggregate
  const comparisonAggregate = useMemo(
    () => calculateAggregate(comparisonScore),
    [calculateAggregate, comparisonScore]
  );

  // Matching programs
  const matchingPrograms = useMemo(() => {
    if (!selectedUniversity.programs) return [];
    return selectedUniversity.programs.filter(
      p => currentAggregate >= p.lastMerit
    );
  }, [currentAggregate, selectedUniversity.programs]);

  // Improved merit chance - based on actual cutoff comparison, not just program count
  const meritChance = useMemo((): 'high' | 'medium' | 'low' | 'unlikely' => {
    if (!selectedUniversity.programs || selectedUniversity.programs.length === 0) {
      if (currentAggregate >= (selectedUniversity.minAggregate || 50) + 15) return 'high';
      if (currentAggregate >= (selectedUniversity.minAggregate || 50) + 5) return 'medium';
      if (currentAggregate >= (selectedUniversity.minAggregate || 50)) return 'low';
      return 'unlikely';
    }

    // Sort programs by merit (hardest first)
    const sorted = [...selectedUniversity.programs].sort((a, b) => b.lastMerit - a.lastMerit);
    const highestMerit = sorted[0].lastMerit;
    const lowestMerit = sorted[sorted.length - 1].lastMerit;
    const medianMerit = sorted[Math.floor(sorted.length / 2)].lastMerit;

    // High: aggregate >= median merit (can get into majority of programs)
    if (currentAggregate >= medianMerit) return 'high';
    // Medium: aggregate >= lowest merit (can get into at least some programs)
    if (currentAggregate >= lowestMerit) return 'medium';
    // Low: aggregate within 5% of lowest merit (close but not there)
    if (currentAggregate >= lowestMerit - 5) return 'low';
    // Unlikely: well below all cutoffs
    return 'unlikely';
  }, [matchingPrograms, currentAggregate, selectedUniversity]);

  // Animate aggregate bar
  useEffect(() => {
    Animated.spring(barAnim, {
      toValue: currentAggregate,
      useNativeDriver: false,
      tension: 50,
      friction: 10,
    }).start();

    const result: WhatIfResult = {
      aggregate: currentAggregate,
      meritChance,
      matchingPrograms: matchingPrograms.map(p => p.name),
      improvement: showComparison ? comparisonAggregate - currentAggregate : 0,
    };
    onSimulate?.(result);
  }, [
    currentAggregate,
    meritChance,
    matchingPrograms,
    showComparison,
    comparisonAggregate,
    barAnim,
    onSimulate,
  ]);

  // Get chance color
  const getChanceColor = () => {
    switch (meritChance) {
      case 'high':
        return '#10B981';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#EF4444';
      default:
        return '#94A3B8';
    }
  };

  // Get chance text - more accurate descriptions
  const getChanceText = () => {
    const total = selectedUniversity.programs?.length || 0;
    const matched = matchingPrograms.length;
    switch (meritChance) {
      case 'high':
        return `Strong (${matched}/${total})`;
      case 'medium':
        return `Possible (${matched}/${total})`;
      case 'low':
        return 'Below Cutoff';
      default:
        return 'Unlikely';
    }
  };

  return (
    <View style={[styles.container, themeStyles.container]}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#F59E0B', '#D97706']}
          style={styles.headerIcon}>
          <Icon name="analytics-outline" size={24} color="#FFF" />
        </LinearGradient>
        <View style={styles.headerText}>
          <Text style={[styles.headerTitle, themeStyles.headerTitle]}>What-If Simulator</Text>
          <Text style={[styles.headerSubtitle, themeStyles.headerSubtitle]}>
            Slide to see your aggregate change
          </Text>
        </View>
      </View>

      {/* University Tabs */}
      <View style={styles.tabsContainer}>
        {PRESET_UNIVERSITIES.map(uni => (
          <TouchableOpacity
            key={uni.id}
            onPress={() => setSelectedUniversity(uni)}
            style={[
              styles.tab,
              themeStyles.tabInactive,
              selectedUniversity.id === uni.id && {
                backgroundColor: uni.color,
              },
            ]}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.tabText,
                themeStyles.tabText,
                selectedUniversity.id === uni.id && styles.tabTextActive,
              ]}>
              {uni.shortName}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Academic Inputs */}
      <View style={styles.inputsRow}>
        <View style={styles.inputBox}>
          <Text style={[styles.inputLabel, themeStyles.inputLabel]}>Matric %</Text>
          <TextInput
            style={[styles.textInput, themeStyles.textInput]}
            value={matricPercent}
            onChangeText={setMatricPercent}
            keyboardType="decimal-pad"
            placeholderTextColor={colors.placeholder}
            maxLength={5}
          />
        </View>
        <View style={styles.inputBox}>
          <Text style={[styles.inputLabel, themeStyles.inputLabel]}>Inter %</Text>
          <TextInput
            style={[styles.textInput, themeStyles.textInput]}
            value={interPercent}
            onChangeText={setInterPercent}
            keyboardType="decimal-pad"
            placeholderTextColor={colors.placeholder}
            maxLength={5}
          />
        </View>
      </View>

      {/* Test Score Slider */}
      <View style={styles.sliderSection}>
        <Text style={[styles.sliderLabel, themeStyles.sliderLabel]}>
          {selectedUniversity.testName} Score
        </Text>
        <CustomSlider
          value={testScore}
          onValueChange={setTestScore}
          minimumValue={0}
          maximumValue={100}
          color={selectedUniversity.color}
          trackBgColor={themeStyles.trackBg}
          scaleColor={themeStyles.scaleColor}
        />
      </View>

      {/* Result Display */}
      <View style={styles.resultDisplay}>
        <LinearGradient
          colors={[selectedUniversity.color, selectedUniversity.color + 'CC']}
          style={styles.aggregateCard}>
          <View style={styles.aggregateRow}>
            <View>
              <Text style={styles.aggregateLabel}>Your Aggregate</Text>
              <Text style={styles.aggregateValue}>{currentAggregate.toFixed(2)}%</Text>
            </View>
            <View style={styles.chanceBox}>
              <Text style={styles.chanceLabel}>Merit Chance</Text>
              <View
                style={[
                  styles.chanceBadge,
                  {backgroundColor: getChanceColor()},
                ]}>
                <Text style={styles.chanceBadgeText}>{getChanceText()}</Text>
              </View>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: barAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
            <View style={styles.progressMarkers}>
              {[50, 60, 70, 80, 90].map(mark => (
                <View key={mark} style={styles.marker}>
                  <View style={styles.markerLine} />
                  <Text style={styles.markerText}>{mark}</Text>
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>

        {/* Matching Programs */}
        {selectedUniversity.programs && selectedUniversity.programs.length > 0 && (
          <View style={[styles.programsSection, themeStyles.programsSection]}>
            <Text style={[styles.programsTitle, themeStyles.programsTitle]}>
              Programs You Can Get ({matchingPrograms.length}/
              {selectedUniversity.programs.length})
            </Text>
            <View style={styles.programsGrid}>
              {selectedUniversity.programs.map(program => {
                const isMatch = currentAggregate >= program.lastMerit;
                const diff = currentAggregate - program.lastMerit;
                return (
                  <View
                    key={program.name}
                    style={[
                      styles.programChip,
                      themeStyles.programChipInactive,
                      isMatch && {
                        backgroundColor: selectedUniversity.color + '15',
                        borderColor: selectedUniversity.color,
                      },
                    ]}>
                    <Icon
                      name={isMatch ? 'checkmark-circle' : 'close-circle'}
                      size={16}
                      color={isMatch ? selectedUniversity.color : colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.programName,
                        themeStyles.programNameInactive,
                        isMatch && {color: selectedUniversity.color},
                      ]}>
                      {program.name}
                    </Text>
                    <Text
                      style={[
                        styles.programMerit,
                        themeStyles.programMeritInactive,
                        isMatch && {color: selectedUniversity.color},
                      ]}>
                      {program.lastMerit}%
                    </Text>
                    <Text
                      style={[
                        styles.programDiff,
                        {color: isMatch ? colors.success : colors.error},
                      ]}>
                      {isMatch ? `+${diff.toFixed(1)}` : `${diff.toFixed(1)}`}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Comparison Mode */}
        <TouchableOpacity
          style={[styles.comparisonToggle, {borderTopColor: themeStyles.comparisonToggle.borderTopColor}]}
          onPress={() => setShowComparison(!showComparison)}
          activeOpacity={0.7}>
          <Icon
            name={showComparison ? 'chevron-up' : 'git-compare-outline'}
            size={20}
            color={colors.primary}
          />
          <Text style={[styles.comparisonToggleText, {color: colors.primary}]}>
            {showComparison ? 'Hide Comparison' : 'Compare Scenarios'}
          </Text>
        </TouchableOpacity>

        {showComparison && (
          <View style={[styles.comparisonSection, themeStyles.comparisonSection]}>
            <Text style={[styles.comparisonLabel, themeStyles.comparisonLabel]}>
              What if you scored {comparisonScore}% instead?
            </Text>
            <CustomSlider
              value={comparisonScore}
              onValueChange={setComparisonScore}
              minimumValue={0}
              maximumValue={100}
              color={colors.primary}
              trackBgColor={themeStyles.trackBg}
              scaleColor={themeStyles.scaleColor}
            />
            <View style={styles.comparisonResult}>
              <View style={styles.comparisonCard}>
                <Text style={[styles.comparisonCardLabel, themeStyles.comparisonCardLabel]}>Current</Text>
                <Text
                  style={[
                    styles.comparisonCardValue,
                    {color: selectedUniversity.color},
                  ]}>
                  {currentAggregate.toFixed(2)}%
                </Text>
                <Text style={[styles.comparisonCardScore, themeStyles.comparisonCardScore]}>
                  @ {testScore}% test
                </Text>
              </View>
              <Icon name="arrow-forward" size={24} color={colors.textMuted} />
              <View style={styles.comparisonCard}>
                <Text style={[styles.comparisonCardLabel, themeStyles.comparisonCardLabel]}>If Scored</Text>
                <Text style={[styles.comparisonCardValue, {color: colors.primary}]}>
                  {comparisonAggregate.toFixed(2)}%
                </Text>
                <Text style={[styles.comparisonCardScore, themeStyles.comparisonCardScore]}>
                  @ {comparisonScore}% test
                </Text>
              </View>
              <View
                style={[
                  styles.improvementBadge,
                  comparisonAggregate > currentAggregate
                    ? {backgroundColor: isDark ? '#1A2F2A' : '#DCFCE7'}
                    : {backgroundColor: isDark ? '#2D1A1F' : '#FEE2E2'},
                ]}>
                <Icon
                  name={
                    comparisonAggregate > currentAggregate
                      ? 'arrow-up'
                      : 'arrow-down'
                  }
                  size={16}
                  color={
                    comparisonAggregate > currentAggregate
                      ? colors.success
                      : colors.error
                  }
                />
                <Text
                  style={[
                    styles.improvementText,
                    {
                      color:
                        comparisonAggregate > currentAggregate
                          ? colors.success
                          : colors.error,
                    },
                  ]}>
                  {Math.abs(comparisonAggregate - currentAggregate).toFixed(2)}%
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Formula Reference */}
      <View style={[styles.formulaBox, themeStyles.formulaBox]}>
        <Icon name="information-circle-outline" size={16} color={colors.textMuted} />
        <Text style={[styles.formulaText, themeStyles.formulaText]}>
          {selectedUniversity.name}: Matric ({selectedUniversity.matricWeight}%) +
          Inter ({selectedUniversity.interWeight}%) + {selectedUniversity.testName} (
          {selectedUniversity.testWeight}%)
        </Text>
      </View>
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
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    backgroundColor: '#F1F5F9',
    borderRadius: RADIUS.md,
    marginRight: SPACING.xs,
    alignItems: 'center',
  },
  tabText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFF',
  },
  inputsRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  inputBox: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#64748B',
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sliderSection: {
    marginBottom: SPACING.md,
  },
  sliderLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#1E293B',
    marginBottom: SPACING.xs,
  },
  resultDisplay: {
    marginTop: SPACING.sm,
  },
  aggregateCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  aggregateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  aggregateLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  aggregateValue: {
    fontSize: 36,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#FFF',
    marginTop: 4,
  },
  chanceBox: {
    alignItems: 'flex-end',
  },
  chanceLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  chanceBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  chanceBadgeText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFF',
  },
  progressContainer: {
    marginTop: SPACING.lg,
  },
  progressBackground: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 4,
  },
  progressMarkers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingHorizontal: '10%',
  },
  marker: {
    alignItems: 'center',
  },
  markerLine: {
    width: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginBottom: 2,
  },
  markerText: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.7)',
  },
  programsSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  programsTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#475569',
    marginBottom: SPACING.sm,
  },
  programsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  programChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: RADIUS.md,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  programName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#94A3B8',
    marginLeft: 4,
  },
  programMerit: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#CBD5E1',
    marginLeft: 4,
  },
  programDiff: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginLeft: 4,
  },
  comparisonToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  comparisonToggleText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#4573DF',
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginLeft: 6,
  },
  comparisonSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  comparisonLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#475569',
    marginBottom: SPACING.sm,
  },
  comparisonResult: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  comparisonCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.sm,
  },
  comparisonCardLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#94A3B8',
  },
  comparisonCardValue: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weight.heavy,
  },
  comparisonCardScore: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#94A3B8',
    marginTop: 2,
  },
  improvementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    marginLeft: SPACING.sm,
  },
  improvementText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginLeft: 4,
  },
  formulaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginTop: SPACING.sm,
  },
  formulaText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#64748B',
    marginLeft: 6,
    flex: 1,
  },
});

export default WhatIfSimulator;

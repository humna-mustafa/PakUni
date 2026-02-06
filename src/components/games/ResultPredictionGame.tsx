/**
 * Result Prediction Game
 * Suspense reveal: "Will I get in?" with confetti animation
 */

import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Easing,
  Dimensions,
  Modal,
  Share,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '../icons';
import {TYPOGRAPHY, RADIUS, SPACING} from '../../constants/design';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// ============================================================================
// TYPES
// ============================================================================

interface University {
  id: string;
  name: string;
  shortName: string;
  color: string;
  programs: {
    name: string;
    lastYearMerit: number;
  }[];
}

interface PredictionResult {
  university: string;
  program: string;
  yourAggregate: number;
  requiredMerit: number;
  result: 'admitted' | 'waitlist' | 'not-admitted';
  chancePercent: number;
  message: string;
}

interface ResultPredictionGameProps {
  onResult?: (result: PredictionResult) => void;
}

// ============================================================================
// SAMPLE UNIVERSITIES
// ============================================================================

const UNIVERSITIES: University[] = [
  {
    id: 'nust',
    name: 'NUST',
    shortName: 'NUST',
    color: '#4573DF',
    programs: [
      {name: 'Computer Science', lastYearMerit: 87.1},
      {name: 'Electrical Engineering', lastYearMerit: 82.0},
      {name: 'Mechanical Engineering', lastYearMerit: 78.0},
      {name: 'Civil Engineering', lastYearMerit: 72.0},
      {name: 'BBA', lastYearMerit: 68.0},
    ],
  },
  {
    id: 'fast',
    name: 'FAST-NUCES',
    shortName: 'FAST',
    color: '#DC2626',
    programs: [
      {name: 'Computer Science', lastYearMerit: 78.0},
      {name: 'Software Engineering', lastYearMerit: 75.0},
      {name: 'Data Science', lastYearMerit: 73.5},
      {name: 'Artificial Intelligence', lastYearMerit: 76.0},
      {name: 'Cyber Security', lastYearMerit: 70.0},
    ],
  },
  {
    id: 'giki',
    name: 'GIKI',
    shortName: 'GIKI',
    color: '#059669',
    programs: [
      {name: 'Computer Science', lastYearMerit: 82.0},
      {name: 'Electrical Engineering', lastYearMerit: 78.0},
      {name: 'Mechanical Engineering', lastYearMerit: 75.0},
      {name: 'Materials Engineering', lastYearMerit: 68.0},
    ],
  },
  {
    id: 'comsats',
    name: 'COMSATS',
    shortName: 'COMSATS',
    color: '#0891B2',
    programs: [
      {name: 'Computer Science', lastYearMerit: 72.0},
      {name: 'Software Engineering', lastYearMerit: 68.0},
      {name: 'Electrical Engineering', lastYearMerit: 65.0},
      {name: 'BBA', lastYearMerit: 60.0},
    ],
  },
];

// ============================================================================
// CONFETTI COMPONENT
// ============================================================================

interface ConfettiPiece {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  rotation: Animated.Value;
  scale: Animated.Value;
  color: string;
}

const Confetti: React.FC<{show: boolean}> = ({show}) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (show) {
      const colors = ['#F59E0B', '#10B981', '#4573DF', '#4573DF', '#EF4444', '#4573DF'];
      const newPieces: ConfettiPiece[] = [];

      for (let i = 0; i < 50; i++) {
        newPieces.push({
          id: i,
          x: new Animated.Value(Math.random() * SCREEN_WIDTH),
          y: new Animated.Value(-20),
          rotation: new Animated.Value(0),
          scale: new Animated.Value(Math.random() * 0.5 + 0.5),
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }

      setPieces(newPieces);

      newPieces.forEach((piece, index) => {
        const duration = 2000 + Math.random() * 1000;
        const delay = Math.random() * 500;

        Animated.parallel([
          Animated.timing(piece.y, {
            toValue: SCREEN_HEIGHT + 50,
            duration,
            delay,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(piece.x, {
            toValue: (Math.random() * SCREEN_WIDTH) + (Math.random() - 0.5) * 200,
            duration,
            delay,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(piece.rotation, {
            toValue: Math.random() * 10 - 5,
            duration,
            delay,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      setPieces([]);
    }
  }, [show]);

  if (!show) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map(piece => (
        <Animated.View
          key={piece.id}
          style={[
            confettiStyles.piece,
            {
              backgroundColor: piece.color,
              transform: [
                {translateX: piece.x},
                {translateY: piece.y},
                {
                  rotate: piece.rotation.interpolate({
                    inputRange: [-5, 5],
                    outputRange: ['-180deg', '180deg'],
                  }),
                },
                {scale: piece.scale},
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

const confettiStyles = StyleSheet.create({
  piece: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 2,
  },
});

// ============================================================================
// SPINNING WHEEL COMPONENT
// ============================================================================

interface SpinningWheelProps {
  spinning: boolean;
  result: 'admitted' | 'waitlist' | 'not-admitted' | null;
  color: string;
}

const SpinningWheel: React.FC<SpinningWheelProps> = ({spinning, result, color}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (spinning) {
      spinValue.setValue(0);
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else if (result) {
      spinValue.stopAnimation();
      
      // Pulse animation for result
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [spinning, result, spinValue, pulseValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getResultIcon = () => {
    switch (result) {
      case 'admitted':
        return 'checkmark-circle';
      case 'waitlist':
        return 'time';
      case 'not-admitted':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const getResultColor = () => {
    switch (result) {
      case 'admitted':
        return ['#10B981', '#059669'];
      case 'waitlist':
        return ['#F59E0B', '#D97706'];
      case 'not-admitted':
        return ['#EF4444', '#DC2626'];
      default:
        return [color, color + 'CC'];
    }
  };

  return (
    <Animated.View
      style={[
        wheelStyles.container,
        {
          transform: [
            {rotate: spinning ? spin : '0deg'},
            {scale: result ? pulseValue : 1},
          ],
        },
      ]}>
      <LinearGradient
        colors={result ? getResultColor() : [color, color + 'CC']}
        style={wheelStyles.wheel}>
        {spinning ? (
          <Icon name="sync-outline" size={60} color="#FFF" />
        ) : result ? (
          <Icon name={getResultIcon()} size={60} color="#FFF" />
        ) : (
          <Icon name="help-circle-outline" size={60} color="#FFF" />
        )}
      </LinearGradient>
    </Animated.View>
  );
};

const wheelStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.xl,
  },
  wheel: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ResultPredictionGame: React.FC<ResultPredictionGameProps> = ({
  onResult,
}) => {
  // State
  const [step, setStep] = useState<'input' | 'spinning' | 'result'>('input');
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [aggregate, setAggregate] = useState('');
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Calculate prediction
  const calculatePrediction = useCallback(() => {
    if (!selectedUniversity || !selectedProgram || !aggregate) return;

    const yourAggregate = parseFloat(aggregate);
    const program = selectedUniversity.programs.find(p => p.name === selectedProgram);
    if (!program || isNaN(yourAggregate)) return;

    const diff = yourAggregate - program.lastYearMerit;
    let resultType: 'admitted' | 'waitlist' | 'not-admitted';
    let chancePercent: number;
    let message: string;

    if (diff >= 2) {
      resultType = 'admitted';
      chancePercent = Math.min(95, 80 + diff * 3);
      message = `🎉 Strong chances at ${selectedUniversity.shortName} ${selectedProgram}! Your hard work is paying off!`;
    } else if (diff >= 0) {
      resultType = 'admitted';
      chancePercent = 65 + diff * 7;
      message = `📊 Good progress! Solid foundation for ${selectedUniversity.shortName} ${selectedProgram}. Keep pushing!`;
    } else if (diff >= -3) {
      resultType = 'waitlist';
      chancePercent = 30 + (diff + 3) * 10;
      message = `📈 Room to grow for ${selectedUniversity.shortName}. Focus on improving scores - you can do this!`;
    } else if (diff >= -8) {
      resultType = 'not-admitted';
      chancePercent = Math.max(10, 20 + diff * 2);
      message = `🎯 Needs improvement for ${selectedUniversity.shortName}. Consider backup options while working harder!`;
    } else {
      resultType = 'not-admitted';
      chancePercent = Math.max(5, 15 + diff * 2);
      message = `📚 Significant work needed. Focus on fundamentals and explore alternative paths. Every expert started somewhere!`;
    }

    const predictionResult: PredictionResult = {
      university: selectedUniversity.name,
      program: selectedProgram,
      yourAggregate,
      requiredMerit: program.lastYearMerit,
      result: resultType,
      chancePercent,
      message,
    };

    // Start spinning animation
    setStep('spinning');
    setShowModal(true);

    // After suspense delay, show result
    setTimeout(() => {
      setResult(predictionResult);
      setStep('result');
      
      if (resultType === 'admitted') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }

      // Animate result appearance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();

      onResult?.(predictionResult);
    }, 3000); // 3 second suspense
  }, [selectedUniversity, selectedProgram, aggregate, fadeAnim, slideAnim, onResult]);

  // Reset game
  const resetGame = () => {
    setStep('input');
    setResult(null);
    setShowModal(false);
    setShowConfetti(false);
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
  };

  // Render input step
  const renderInputStep = () => (
    <View style={styles.inputContainer}>
      {/* University Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏛️ Select University</Text>
        <View style={styles.universityGrid}>
          {UNIVERSITIES.map(uni => (
            <TouchableOpacity
              key={uni.id}
              onPress={() => {
                setSelectedUniversity(uni);
                setSelectedProgram('');
              }}
              activeOpacity={0.8}>
              <LinearGradient
                colors={
                  selectedUniversity?.id === uni.id
                    ? [uni.color, uni.color + 'CC']
                    : ['#F1F5F9', '#E2E8F0']
                }
                style={[
                  styles.universityCard,
                  selectedUniversity?.id === uni.id && styles.universityCardSelected,
                ]}>
                <Text
                  style={[
                    styles.universityName,
                    selectedUniversity?.id === uni.id && {color: '#FFF'},
                  ]}>
                  {uni.shortName}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Program Selection */}
      {selectedUniversity && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Select Program</Text>
          <View style={styles.programList}>
            {selectedUniversity.programs.map(program => (
              <TouchableOpacity
                key={program.name}
                onPress={() => setSelectedProgram(program.name)}
                style={[
                  styles.programButton,
                  selectedProgram === program.name && {
                    backgroundColor: selectedUniversity.color + '15',
                    borderColor: selectedUniversity.color,
                  },
                ]}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.programName,
                    selectedProgram === program.name && {
                      color: selectedUniversity.color,
                    },
                  ]}>
                  {program.name}
                </Text>
                <Text
                  style={[
                    styles.programMerit,
                    selectedProgram === program.name && {
                      color: selectedUniversity.color,
                    },
                  ]}>
                  {program.lastYearMerit}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Aggregate Input */}
      {selectedProgram && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Your Aggregate</Text>
          <View style={styles.aggregateInputContainer}>
            <TextInput
              style={styles.aggregateInput}
              value={aggregate}
              onChangeText={setAggregate}
              placeholder="Enter your aggregate (e.g., 85.5)"
              placeholderTextColor="#94A3B8"
              keyboardType="decimal-pad"
              maxLength={5}
            />
            <Text style={styles.percentSign}>%</Text>
          </View>
        </View>
      )}

      {/* Predict Button */}
      {aggregate && (
        <TouchableOpacity
          onPress={calculatePrediction}
          activeOpacity={0.9}
          style={styles.predictButtonContainer}>
          <LinearGradient
            colors={selectedUniversity ? [selectedUniversity.color, selectedUniversity.color + 'CC'] : ['#4573DF', '#4573DF']}
            style={styles.predictButton}>
            <Icon name="sparkles-outline" size={24} color="#FFF" />
            <Text style={styles.predictButtonText}>Will I Get In? 🎲</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );

  // Render result modal
  const renderResultModal = () => (
    <Modal
      visible={showModal}
      animationType="fade"
      transparent
      onRequestClose={resetGame}>
      <View style={styles.modalOverlay}>
        <Confetti show={showConfetti} />
        
        <View style={styles.modalContent}>
          {/* Spinning Wheel */}
          <SpinningWheel
            spinning={step === 'spinning'}
            result={result?.result || null}
            color={selectedUniversity?.color || '#4573DF'}
          />

          {/* Suspense Text */}
          {step === 'spinning' && (
            <View style={styles.suspenseContainer}>
              <Text style={styles.suspenseText}>🎰 Calculating your chances...</Text>
              <Text style={styles.suspenseSubtext}>
                {selectedUniversity?.shortName} • {selectedProgram}
              </Text>
            </View>
          )}

          {/* Result */}
          {step === 'result' && result && (
            <Animated.View
              style={[
                styles.resultContainer,
                {
                  opacity: fadeAnim,
                  transform: [{translateY: slideAnim}],
                },
              ]}>
              {/* Result Title */}
              <Text style={[
                styles.resultTitle,
                {
                  color:
                    result.result === 'admitted'
                      ? '#10B981'
                      : result.result === 'waitlist'
                      ? '#F59E0B'
                      : '#EF4444',
                },
              ]}>
                {result.result === 'admitted'
                  ? '🎉 ADMITTED!'
                  : result.result === 'waitlist'
                  ? '⏳ WAITLIST'
                  : '😔 NOT THIS TIME'}
              </Text>

              {/* Message */}
              <Text style={styles.resultMessage}>{result.message}</Text>

              {/* Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Your Aggregate</Text>
                  <Text style={[styles.statValue, {color: selectedUniversity?.color}]}>
                    {result.yourAggregate}%
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Required Merit</Text>
                  <Text style={styles.statValue}>{result.requiredMerit}%</Text>
                </View>
              </View>

              {/* Chance Meter */}
              <View style={styles.chanceMeter}>
                <Text style={styles.chanceLabel}>Admission Chance</Text>
                <View style={styles.meterContainer}>
                  <View
                    style={[
                      styles.meterFill,
                      {
                        width: `${result.chancePercent}%`,
                        backgroundColor:
                          result.chancePercent >= 70
                            ? '#10B981'
                            : result.chancePercent >= 40
                            ? '#F59E0B'
                            : '#EF4444',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.chancePercent}>{result.chancePercent.toFixed(0)}%</Text>
              </View>

              {/* Actions */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={styles.tryAgainButton}
                  onPress={resetGame}
                  activeOpacity={0.8}>
                  <Icon name="refresh-outline" size={20} color="#4573DF" />
                  <Text style={styles.tryAgainText}>Try Another</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.shareButton,
                    {backgroundColor: selectedUniversity?.color},
                  ]}
                  onPress={async () => {
                    if (result) {
                      // Honest share message based on actual chances
                      let honestMessage: string;
                      let hashtag: string;
                      
                      if (result.chancePercent >= 70) {
                        honestMessage = `🎉 Strong ${result.chancePercent}% chances at ${result.university} ${result.program}! Hard work paying off!`;
                        hashtag = '#StrongChances';
                      } else if (result.chancePercent >= 50) {
                        honestMessage = `📊 ${result.chancePercent}% at ${result.university} ${result.program}. Building momentum, staying focused!`;
                        hashtag = '#KeepWorking';
                      } else if (result.chancePercent >= 30) {
                        honestMessage = `📈 ${result.chancePercent}% for ${result.university} ${result.program}. Room to grow - working harder!`;
                        hashtag = '#GrowthMindset';
                      } else {
                        honestMessage = `🎯 ${result.chancePercent}% at ${result.university}. Challenge accepted - improvement journey started!`;
                        hashtag = '#NeverGiveUp';
                      }
                      
                      const shareMessage = `${honestMessage}\n\n🎮 Just used PakUni's Admission Predictor!\n\n${hashtag} #PakUni\n\n📱 Made with PakUni App`;
                      
                      try {
                        await Share.share({
                          message: shareMessage,
                          title: 'My Admission Prediction - PakUni',
                        });
                      } catch (error) {
                        // User cancelled
                      }
                    }
                  }}
                  activeOpacity={0.8}>
                  <Icon name="share-social-outline" size={20} color="#FFF" />
                  <Text style={styles.shareText}>Share Result</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#4573DF', '#F472B6']}
          style={styles.headerIcon}>
          <Icon name="game-controller-outline" size={24} color="#FFF" />
        </LinearGradient>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Will I Get In?</Text>
          <Text style={styles.headerSubtitle}>
            Predict your admission chances
          </Text>
        </View>
      </View>

      {/* Input Form */}
      {renderInputStep()}

      {/* Result Modal */}
      {renderResultModal()}
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
  inputContainer: {},
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#1E293B',
    marginBottom: SPACING.sm,
  },
  universityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  universityCard: {
    width: (SCREEN_WIDTH - 80) / 2 - 6,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  universityCardSelected: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  universityName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#475569',
  },
  programList: {},
  programButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: SPACING.sm,
  },
  programName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#475569',
  },
  programMerit: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#94A3B8',
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  aggregateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aggregateInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#1E293B',
  },
  percentSign: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#64748B',
    marginLeft: SPACING.sm,
  },
  predictButtonContainer: {
    marginTop: SPACING.sm,
  },
  predictButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
  },
  predictButtonText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#FFF',
    marginLeft: SPACING.sm,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  suspenseContainer: {
    alignItems: 'center',
  },
  suspenseText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#1E293B',
    textAlign: 'center',
  },
  suspenseSubtext: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: '#64748B',
    marginTop: SPACING.sm,
  },
  resultContainer: {
    width: '100%',
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: TYPOGRAPHY.weight.heavy,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  resultMessage: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#94A3B8',
    marginBottom: 4,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#1E293B',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: SPACING.md,
  },
  chanceMeter: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  chanceLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#64748B',
    marginBottom: SPACING.xs,
  },
  meterContainer: {
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 6,
  },
  chancePercent: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#1E293B',
    marginTop: SPACING.xs,
    textAlign: 'right',
  },
  actionsContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  tryAgainButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: '#F1F5F9',
    borderRadius: RADIUS.md,
    marginRight: SPACING.sm,
  },
  tryAgainText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#4573DF',
    marginLeft: 6,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  shareText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#FFF',
    marginLeft: 6,
  },
});

export default ResultPredictionGame;



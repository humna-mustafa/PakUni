import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {SPACING} from '../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../constants/design';
import {useTheme} from '../contexts/ThemeContext';
import {Icon} from '../components/icons';

const {width, height} = Dimensions.get('window');

// Quiz questions
const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'What do you enjoy doing in your free time?',
    iconName: 'color-palette-outline',
    options: [
      {text: 'Building or fixing things', iconName: 'construct-outline', careers: ['Engineering', 'Architecture']},
      {text: 'Reading or writing', iconName: 'book-outline', careers: ['Law', 'Journalism', 'Teaching']},
      {text: 'Playing with computers', iconName: 'laptop-outline', careers: ['IT', 'Software Development']},
      {text: 'Helping people', iconName: 'heart-outline', careers: ['Medicine', 'Psychology', 'Social Work']},
    ],
  },
  {
    id: 2,
    question: 'Which subject do you enjoy most?',
    iconName: 'book-outline',
    options: [
      {text: 'Mathematics', iconName: 'calculator-outline', careers: ['Engineering', 'Finance', 'Data Science']},
      {text: 'Biology', iconName: 'flask-outline', careers: ['Medicine', 'Biotechnology']},
      {text: 'English / Languages', iconName: 'document-text-outline', careers: ['Law', 'Media', 'Translation']},
      {text: 'Computer Science', iconName: 'desktop-outline', careers: ['IT', 'Cybersecurity']},
    ],
  },
  {
    id: 3,
    question: 'How do you prefer to work?',
    iconName: 'briefcase-outline',
    options: [
      {text: 'Alone, focused', iconName: 'flag-outline', careers: ['Research', 'Writing', 'Programming']},
      {text: 'In a team', iconName: 'people-outline', careers: ['Management', 'Marketing', 'HR']},
      {text: 'Outdoors / Active', iconName: 'leaf-outline', careers: ['Civil Engineering', 'Agriculture']},
      {text: 'With patients/clients', iconName: 'medkit-outline', careers: ['Medicine', 'Counseling']},
    ],
  },
  {
    id: 4,
    question: 'What motivates you the most?',
    iconName: 'star-outline',
    options: [
      {text: 'Making money', iconName: 'wallet-outline', careers: ['Business', 'Finance', 'Entrepreneurship']},
      {text: 'Helping society', iconName: 'globe-outline', careers: ['Medicine', 'Social Work', 'NGO']},
      {text: 'Creating new things', iconName: 'bulb-outline', careers: ['Design', 'Engineering', 'Art']},
      {text: 'Gaining knowledge', iconName: 'school-outline', careers: ['Research', 'Academia', 'Science']},
    ],
  },
  {
    id: 5,
    question: 'How do you handle stress?',
    iconName: 'pulse-outline',
    options: [
      {text: 'Stay calm and plan', iconName: 'clipboard-outline', careers: ['Management', 'Medicine', 'Law']},
      {text: 'Get creative', iconName: 'color-palette-outline', careers: ['Design', 'Marketing', 'Arts']},
      {text: 'Solve problems quickly', iconName: 'flash-outline', careers: ['IT', 'Emergency Services']},
      {text: 'Talk to others', iconName: 'chatbubble-outline', careers: ['HR', 'Counseling', 'Sales']},
    ],
  },
];

// Animated option button
const OptionButton = ({
  option,
  isSelected,
  onPress,
  index,
  colors,
}: any) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 100,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (isSelected) {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(pulseAnim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isSelected]);

  return (
    <Animated.View
      style={[
        {
          transform: [{scale: Animated.multiply(scaleAnim, pulseAnim)}],
        },
      ]}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}>
        {isSelected ? (
          <LinearGradient
            colors={['#3498db', '#2980b9']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.optionSelected}>
            <Icon name={option.iconName} family="Ionicons" size={22} color="#FFFFFF" />
            <Text style={styles.optionTextSelected}>{option.text}</Text>
            <Icon name="checkmark-circle" family="Ionicons" size={22} color="#FFFFFF" />
          </LinearGradient>
        ) : (
          <View style={[styles.option, {backgroundColor: colors.card, borderColor: colors.border}]}>
            <Icon name={option.iconName} family="Ionicons" size={22} color={colors.primary} />
            <Text style={[styles.optionText, {color: colors.text}]}>{option.text}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Progress bar component
const ProgressBar = ({current, total, colors}: any) => {
  const animWidth = useRef(new Animated.Value(0)).current;
  const percentage = (current / total) * 100;

  useEffect(() => {
    Animated.spring(animWidth, {
      toValue: percentage,
      tension: 50,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  return (
    <View style={[styles.progressContainer, {backgroundColor: colors.card}]}>
      <View style={styles.progressHeader}>
        <Text style={[styles.progressText, {color: colors.text}]}>
          Question {current} of {total}
        </Text>
        <Text style={[styles.progressPercent, {color: colors.primary}]}>
          {Math.round(percentage)}%
        </Text>
      </View>
      <View style={[styles.progressTrack, {backgroundColor: colors.background}]}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: animWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}>
          <LinearGradient
            colors={['#3498db', '#2980b9']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.progressGradient}
          />
        </Animated.View>
      </View>
    </View>
  );
};

// Result career card
const CareerResultCard = ({
  career,
  percentage,
  index,
  colors,
}: any) => {
  const slideAnim = useRef(new Animated.Value(100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getColor = (idx: number) => {
    switch (idx) {
      case 0:
        return '#27ae60';
      case 1:
        return '#3498db';
      case 2:
        return '#9b59b6';
      default:
        return '#e67e22';
    }
  };

  const color = getColor(index);

  return (
    <Animated.View
      style={[
        styles.resultCard,
        {
          backgroundColor: colors.card,
          transform: [{translateY: slideAnim}],
          opacity: fadeAnim,
        },
      ]}>
      <LinearGradient
        colors={[color + '15', 'transparent']}
        style={styles.resultGradient}
      />
      
      {index === 0 && (
        <View style={[styles.topBadge, {backgroundColor: color}]}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
            <Icon name="trophy" family="Ionicons" size={14} color="#FFFFFF" />
            <Text style={styles.topBadgeText}>Best Match</Text>
          </View>
        </View>
      )}
      
      <View style={styles.resultContent}>
        <View style={[styles.resultRank, {backgroundColor: color}]}>
          <Text style={styles.resultRankText}>#{index + 1}</Text>
        </View>
        <View style={styles.resultInfo}>
          <Text style={[styles.resultName, {color: colors.text}]}>{career}</Text>
          <View style={styles.resultBarContainer}>
            <View style={[styles.resultBar, {backgroundColor: colors.background}]}>
              <View style={[styles.resultBarFill, {backgroundColor: color, width: `${percentage}%`}]} />
            </View>
            <Text style={[styles.resultPercent, {color}]}>{percentage}%</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const PremiumInterestQuizScreen = () => {
  const {colors, isDark} = useTheme();
  const navigation = useNavigation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: number}>({});
  const [showResults, setShowResults] = useState(false);

  const questionAnim = useRef(new Animated.Value(0)).current;
  const resultAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(questionAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [currentQuestion]);

  const selectAnswer = (optionIndex: number) => {
    setAnswers({...answers, [currentQuestion]: optionIndex});
    
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      // Animate out and in
      Animated.timing(questionAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentQuestion(currentQuestion + 1);
        Animated.timing(questionAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      });
    } else {
      // Show results
      setShowResults(true);
      Animated.timing(resultAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  };

  const calculateResults = () => {
    const careerScores: {[key: string]: number} = {};
    
    Object.entries(answers).forEach(([questionIdx, optionIdx]) => {
      const question = QUIZ_QUESTIONS[parseInt(questionIdx)];
      const selectedOption = question.options[optionIdx];
      selectedOption.careers.forEach(career => {
        careerScores[career] = (careerScores[career] || 0) + 1;
      });
    });

    const sortedCareers = Object.entries(careerScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([career, score]) => ({
        career,
        percentage: Math.round((score / QUIZ_QUESTIONS.length) * 100),
      }));

    return sortedCareers;
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    Animated.timing(questionAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  if (showResults) {
    const results = calculateResults();

    return (
      <SafeAreaView
        style={[styles.container, {backgroundColor: colors.background}]}
        edges={['top']}>
        <Animated.View
          style={[
            styles.resultsContainer,
            {
              opacity: resultAnim,
              transform: [
                {
                  translateY: resultAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}>
          {/* Results Header */}
          <LinearGradient
            colors={isDark ? ['#27ae60', '#219a52'] : ['#2ecc71', '#27ae60']}
            style={styles.resultsHeader}>
            <View style={styles.headerDecoration1} />
            <View style={styles.headerDecoration2} />
            <Icon name="ribbon" family="Ionicons" size={48} color="#FFFFFF" />
            <Text style={styles.resultsTitle}>Your Results!</Text>
            <Text style={styles.resultsSubtitle}>
              Based on your answers, here are your top career matches
            </Text>
          </LinearGradient>

          {/* Career Results */}
          <View style={styles.resultsCards}>
            {results.map((result, index) => (
              <CareerResultCard
                key={result.career}
                career={result.career}
                percentage={result.percentage}
                index={index}
                colors={colors}
              />
            ))}
          </View>

          {/* Advice Card */}
          <View style={[styles.adviceCard, {backgroundColor: isDark ? '#F39C1220' : '#FFF8E1'}]}>
            <Icon name="bulb" family="Ionicons" size={32} color={isDark ? '#FFD54F' : '#F57F17'} />
            <Text style={[styles.adviceTitle, {color: isDark ? '#FFD54F' : '#F57F17'}]}>
              What's Next?
            </Text>
            <Text style={[styles.adviceText, {color: isDark ? '#FFCC80' : '#BF360C'}]}>
              Explore these career paths in detail. Research the required education, skills, and job opportunities in Pakistan!
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.retakeBtn, {borderColor: colors.primary}]}
              onPress={restartQuiz}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                <Icon name="refresh" family="Ionicons" size={18} color={colors.primary} />
                <Text style={[styles.retakeBtnText, {color: colors.primary}]}>Retake Quiz</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  const question = QUIZ_QUESTIONS[currentQuestion];

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}
      edges={['top']}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" family="Ionicons" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      {/* Header */}
      <LinearGradient
        colors={isDark ? ['#9b59b6', '#8e44ad'] : ['#a569bd', '#9b59b6']}
        style={styles.header}>
        <View style={styles.headerDecoration1} />
        <View style={styles.headerDecoration2} />
        <Icon name="analytics" family="Ionicons" size={48} color="#FFFFFF" />
        <Text style={styles.headerTitle}>Career Quiz</Text>
        <Text style={styles.headerSubtitle}>
          Discover your perfect career match!
        </Text>
      </LinearGradient>

      {/* Progress */}
      <ProgressBar
        current={currentQuestion + 1}
        total={QUIZ_QUESTIONS.length}
        colors={colors}
      />

      {/* Question Card */}
      <Animated.View
        style={[
          styles.questionContainer,
          {
            opacity: questionAnim,
            transform: [
              {
                translateX: questionAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}>
        <View style={[styles.questionCard, {backgroundColor: colors.card}]}>
          <Icon name={question.iconName} family="Ionicons" size={40} color={colors.primary} />
          <Text style={[styles.questionText, {color: colors.text}]}>
            {question.question}
          </Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => (
            <OptionButton
              key={index}
              option={option}
              isSelected={answers[currentQuestion] === index}
              onPress={() => selectAnswer(index)}
              index={index}
              colors={colors}
            />
          ))}
        </View>
      </Animated.View>

      {/* Skip hint */}
      <View style={[styles.hintContainer, {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6}]}>
        <Icon name="bulb-outline" family="Ionicons" size={16} color={colors.textMuted} />
        <Text style={[styles.hintText, {color: colors.textMuted}]}>
          Select the option that best describes you
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backBtn: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  header: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    borderBottomLeftRadius: RADIUS.xxl,
    borderBottomRightRadius: RADIUS.xxl,
    overflow: 'hidden',
  },
  headerDecoration1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerDecoration2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerEmoji: {
    fontSize: 50,
    marginBottom: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
  },
  progressContainer: {
    marginHorizontal: SPACING.md,
    marginTop: -15,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  progressText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressGradient: {
    flex: 1,
  },
  questionContainer: {
    flex: 1,
    padding: SPACING.md,
  },
  questionCard: {
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.lg,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  questionEmoji: {
    fontSize: 50,
    marginBottom: SPACING.sm,
  },
  questionText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 28,
  },
  optionsContainer: {
    gap: SPACING.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
  },
  optionSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  optionIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  optionText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '500',
  },
  optionTextSelected: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: '#fff',
  },
  checkmark: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  hintContainer: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  hintText: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  // Results styles
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    borderBottomLeftRadius: RADIUS.xxl,
    borderBottomRightRadius: RADIUS.xxl,
    overflow: 'hidden',
  },
  resultsEmoji: {
    fontSize: 70,
    marginBottom: SPACING.sm,
  },
  resultsTitle: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  resultsSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  resultsCards: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  resultCard: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  resultGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  topBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderBottomLeftRadius: RADIUS.md,
  },
  topBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  resultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  resultRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  resultRankText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    marginBottom: 6,
  },
  resultBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: SPACING.sm,
  },
  resultBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  resultPercent: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
    minWidth: 45,
    textAlign: 'right',
  },
  adviceCard: {
    marginHorizontal: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  adviceEmoji: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  adviceTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    marginBottom: 4,
  },
  adviceText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionButtons: {
    padding: SPACING.md,
  },
  retakeBtn: {
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    alignItems: 'center',
  },
  retakeBtnText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
});

export default PremiumInterestQuizScreen;

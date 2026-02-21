import React, {useRef, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Animated} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {SPACING} from '../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../constants/design';
import {Icon} from '../components/icons';
import {OptionButton, CareerResultCard} from '../components/interest-quiz';
import {useInterestQuizScreen} from '../hooks/useInterestQuizScreen';

// Inline ProgressBar (small, view-only)
const ProgressBar = ({current, total, colors}: any) => {
  const animWidth = useRef(new Animated.Value(0)).current;
  const percentage = (current / total) * 100;
  useEffect(() => {
    Animated.spring(animWidth, {toValue: percentage, tension: 50, friction: 8, useNativeDriver: false}).start();
  }, [percentage]);

  return (
    <View style={[styles.progressContainer, {backgroundColor: colors.card}]}>
      <View style={styles.progressHeader}>
        <Text style={[styles.progressText, {color: colors.text}]}>Question {current} of {total}</Text>
        <Text style={[styles.progressPercent, {color: colors.primary}]}>{Math.round(percentage)}%</Text>
      </View>
      <View style={[styles.progressTrack, {backgroundColor: colors.background}]}>
        <Animated.View style={[styles.progressFill, {
          width: animWidth.interpolate({inputRange: [0, 100], outputRange: ['0%', '100%']}),
        }]}>
          <LinearGradient colors={['#4573DF', '#3660C9']} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.progressGradient} />
        </Animated.View>
      </View>
    </View>
  );
};

const PremiumInterestQuizScreen = () => {
  const {
    colors, isDark, navigation,
    currentQuestion, answers, showResults, question,
    questionAnim, resultAnim, totalQuestions,
    savedResults,
    selectAnswer, calculateResults, navigateToCareer, restartQuiz,
  } = useInterestQuizScreen();

  if (showResults) {
    // results are memoized via the hook's useCallback; safe to call here
    const results = calculateResults();
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]} edges={['top']}>
        <Animated.View style={[styles.resultsContainer, {
          opacity: resultAnim,
          transform: [{translateY: resultAnim.interpolate({inputRange: [0, 1], outputRange: [30, 0]})}],
        }]}>
          <LinearGradient colors={isDark ? ['#27ae60', '#219a52'] : ['#2ecc71', '#27ae60']} style={styles.resultsHeader}>
            <View style={styles.headerDecoration1} />
            <View style={styles.headerDecoration2} />
            <Icon name="ribbon" family="Ionicons" size={48} color="#FFFFFF" />
            <Text style={styles.headerTitle}>Your Results!</Text>
            <Text style={styles.headerSubtitle}>Based on your answers, here are your top career matches</Text>
          </LinearGradient>
          <View style={styles.resultsCards}>
            {results.map((result, index) => (
              <TouchableOpacity key={result.careerId} onPress={() => navigateToCareer(result.careerId)} activeOpacity={0.8}>
                <CareerResultCard career={result.displayName} careerId={result.careerId} percentage={result.percentage} index={index} colors={colors} />
              </TouchableOpacity>
            ))}
          </View>
          <View style={[styles.adviceCard, {backgroundColor: isDark ? '#F39C1220' : '#FFF8E1'}]}>
            <Icon name="bulb" family="Ionicons" size={32} color={isDark ? '#FFD54F' : '#F57F17'} />
            <Text style={[styles.adviceTitle, {color: isDark ? '#FFD54F' : '#F57F17'}]}>What's Next?</Text>
            <Text style={[styles.adviceText, {color: isDark ? '#FFCC80' : '#BF360C'}]}>
              Tap any career card to explore details including education requirements, salaries, and top employers in Pakistan. Entry test and demand data shown for each career!
            </Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.retakeBtn, {borderColor: colors.primary}]} onPress={restartQuiz}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                <Icon name="refresh" family="Ionicons" size={18} color={colors.primary} />
                <Text style={[styles.retakeBtnText, {color: colors.primary}]}>Retake Quiz</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.recommendBtn, {backgroundColor: colors.primary}]}
              onPress={() => navigation.navigate('Recommendations' as any)}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                <Icon name="flag-outline" family="Ionicons" size={18} color="#FFFFFF" />
                <Text style={styles.recommendBtnText}>Get University Matches</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]} edges={['top']}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" family="Ionicons" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <LinearGradient colors={isDark ? ['#9b59b6', '#8e44ad'] : ['#a569bd', '#9b59b6']} style={styles.header}>
        <View style={styles.headerDecoration1} />
        <View style={styles.headerDecoration2} />
        <Icon name="analytics" family="Ionicons" size={48} color="#FFFFFF" />
        <Text style={styles.headerTitle}>Career Quiz</Text>
        <Text style={styles.headerSubtitle}>Discover your perfect career match!</Text>
      </LinearGradient>
      <ProgressBar current={currentQuestion + 1} total={totalQuestions} colors={colors} />
      {/* Previous results banner (only on first question, unanswered) */}
      {currentQuestion === 0 && !answers[0] && savedResults && savedResults.length > 0 && (
        <View style={[styles.prevResultsBanner, {backgroundColor: isDark ? '#1A2744' : '#EEF2FF', borderColor: colors.primary + '30'}]}>
          <Icon name="time-outline" family="Ionicons" size={16} color={colors.primary} />
          <Text style={[styles.prevResultsText, {color: colors.text}]}>
            Last result: <Text style={{fontWeight: '700', color: colors.primary}}>{savedResults[0]?.displayName}</Text>
          </Text>
          <TouchableOpacity onPress={() => navigateToCareer(savedResults[0]?.careerId)} activeOpacity={0.8}>
            <Text style={[styles.prevResultsLink, {color: colors.primary}]}>View →</Text>
          </TouchableOpacity>
        </View>
      )}
      <Animated.View style={[styles.questionContainer, {
        opacity: questionAnim,
        transform: [{translateX: questionAnim.interpolate({inputRange: [0, 1], outputRange: [50, 0]})}],
      }]}>
        <View style={[styles.questionCard, {backgroundColor: colors.card}]}>
          <Icon name={question.iconName} family="Ionicons" size={40} color={colors.primary} />
          <Text style={[styles.questionText, {color: colors.text}]}>{question.question}</Text>
        </View>
        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => (
            <OptionButton key={index} option={option} isSelected={answers[currentQuestion] === index}
              onPress={() => selectAnswer(index)} index={index} colors={colors} />
          ))}
        </View>
      </Animated.View>
      <View style={[styles.hintContainer, {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6}]}>
        <Icon name="bulb-outline" family="Ionicons" size={16} color={colors.textMuted} />
        <Text style={[styles.hintText, {color: colors.textMuted}]}>Select the option that best describes you</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  backBtn: {
    position: 'absolute', top: SPACING.md, left: SPACING.md, width: 40, height: 40,
    borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', zIndex: 10,
  },
  header: {
    paddingTop: SPACING.lg, paddingBottom: SPACING.xl, paddingHorizontal: SPACING.md,
    alignItems: 'center', borderBottomLeftRadius: RADIUS.xxl, borderBottomRightRadius: RADIUS.xxl, overflow: 'hidden',
  },
  headerDecoration1: {position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.1)'},
  headerDecoration2: {position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.08)'},
  headerTitle: {fontSize: TYPOGRAPHY.sizes.xxl, fontWeight: TYPOGRAPHY.weight.bold, color: '#fff', marginBottom: 4},
  headerSubtitle: {fontSize: TYPOGRAPHY.sizes.sm, color: 'rgba(255,255,255,0.9)', textAlign: 'center'},
  progressContainer: {
    marginHorizontal: SPACING.md, marginTop: -15, borderRadius: RADIUS.lg, padding: SPACING.md,
    elevation: 4, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 6,
  },
  progressHeader: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm},
  progressText: {fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.semibold},
  progressPercent: {fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.bold},
  progressTrack: {height: 8, borderRadius: 4, overflow: 'hidden'},
  progressFill: {height: '100%', borderRadius: 4, overflow: 'hidden'},
  progressGradient: {flex: 1},
  questionContainer: {flex: 1, padding: SPACING.md},
  questionCard: {
    alignItems: 'center', padding: SPACING.lg, borderRadius: RADIUS.xl, marginBottom: SPACING.lg,
    elevation: 3, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 6,
  },
  questionText: {fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weight.semibold, textAlign: 'center', lineHeight: 28},
  optionsContainer: {gap: SPACING.sm},
  hintContainer: {padding: SPACING.md, alignItems: 'center'},
  hintText: {fontSize: TYPOGRAPHY.sizes.sm},
  prevResultsBanner: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: SPACING.md, marginTop: SPACING.sm,
    padding: SPACING.sm + 2, borderRadius: RADIUS.md, borderWidth: 1, gap: SPACING.sm,
  },
  prevResultsText: {flex: 1, fontSize: TYPOGRAPHY.sizes.xs},
  prevResultsLink: {fontSize: TYPOGRAPHY.sizes.xs, fontWeight: '700'},
  resultsContainer: {flex: 1},
  resultsHeader: {
    paddingTop: SPACING.lg, paddingBottom: SPACING.xl, paddingHorizontal: SPACING.md,
    alignItems: 'center', borderBottomLeftRadius: RADIUS.xxl, borderBottomRightRadius: RADIUS.xxl, overflow: 'hidden',
  },
  resultsCards: {padding: SPACING.md, gap: SPACING.sm},
  adviceCard: {marginHorizontal: SPACING.md, padding: SPACING.md, borderRadius: RADIUS.lg, alignItems: 'center'},
  adviceTitle: {fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.bold, marginBottom: 4},
  adviceText: {fontSize: TYPOGRAPHY.sizes.sm, textAlign: 'center', lineHeight: 20},
  actionButtons: {padding: SPACING.md, gap: SPACING.sm},
  retakeBtn: {paddingVertical: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 2, alignItems: 'center'},
  retakeBtnText: {fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.semibold},
  recommendBtn: {paddingVertical: SPACING.md, borderRadius: RADIUS.lg, alignItems: 'center'},
  recommendBtnText: {fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.semibold, color: '#FFFFFF'},
});

export default PremiumInterestQuizScreen;

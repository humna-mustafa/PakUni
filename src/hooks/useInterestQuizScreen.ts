/**
 * useInterestQuizScreen - State, animations, and quiz logic
 */

import {useState, useRef, useEffect, useCallback} from 'react';
import {Animated} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../contexts/ThemeContext';
import {QUIZ_QUESTIONS, CAREER_DISPLAY_NAMES} from '../components/interest-quiz/data';
import type {RootStackParamList} from '../navigation/AppNavigator';
import {Haptics} from '../utils/haptics';

const QUIZ_RESULTS_KEY = '@pakuni_quiz_results';

export const useInterestQuizScreen = () => {
  const {colors, isDark} = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: number}>({});
  const [showResults, setShowResults] = useState(false);
  const [savedResults, setSavedResults] = useState<{careerId: string; displayName: string; percentage: number}[] | null>(null);

  const questionAnim = useRef(new Animated.Value(0)).current;
  const resultAnim = useRef(new Animated.Value(0)).current;

  // Load previous results on mount
  useEffect(() => {
    AsyncStorage.getItem(QUIZ_RESULTS_KEY).then(data => {
      if (data) setSavedResults(JSON.parse(data));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    Animated.timing(questionAnim, {toValue: 1, duration: 400, useNativeDriver: true}).start();
  }, [currentQuestion]);

  const selectAnswer = (optionIndex: number) => {
    Haptics.light();
    const newAnswers = {...answers, [currentQuestion]: optionIndex};
    setAnswers(newAnswers);
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      Animated.timing(questionAnim, {toValue: 0, duration: 200, useNativeDriver: true}).start(() => {
        setCurrentQuestion(currentQuestion + 1);
        Animated.timing(questionAnim, {toValue: 1, duration: 400, useNativeDriver: true}).start();
      });
    } else {
      setShowResults(true);
      Animated.timing(resultAnim, {toValue: 1, duration: 600, useNativeDriver: true}).start();
      // Save results after computing
      setTimeout(() => {
        const results = calculateResultsFromAnswers(newAnswers);
        AsyncStorage.setItem(QUIZ_RESULTS_KEY, JSON.stringify(results)).catch(() => {});
        setSavedResults(results);
      }, 100);
    }
  };

  const calculateResultsFromAnswers = useCallback((answersMap: {[key: number]: number}) => {
    const careerScores: {[key: string]: number} = {};
    Object.entries(answersMap).forEach(([questionIdx, optionIdx]) => {
      const question = QUIZ_QUESTIONS[parseInt(questionIdx)];
      const selectedOption = question?.options[optionIdx];
      selectedOption?.careers.forEach(careerId => {
        careerScores[careerId] = (careerScores[careerId] || 0) + 1;
      });
    });
    const sorted = Object.entries(careerScores).sort(([, a], [, b]) => b - a);
    const maxScore = sorted[0]?.[1] || 1;
    return sorted
      .slice(0, 5)
      .map(([careerId, score]) => ({
        careerId,
        displayName: CAREER_DISPLAY_NAMES[careerId] || careerId,
        percentage: Math.round((score / maxScore) * 100),
      }));
  }, []);

  const calculateResults = useCallback(
    () => calculateResultsFromAnswers(answers),
    [answers, calculateResultsFromAnswers],
  );

  const navigateToCareer = (careerId: string) => {
    navigation.navigate('CareerDetail', {careerId});
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    Animated.timing(questionAnim, {toValue: 1, duration: 400, useNativeDriver: true}).start();
  };

  const question = QUIZ_QUESTIONS[currentQuestion];

  return {
    colors,
    isDark,
    navigation,
    currentQuestion,
    answers,
    showResults,
    question,
    questionAnim,
    resultAnim,
    totalQuestions: QUIZ_QUESTIONS.length,
    savedResults,
    selectAnswer,
    calculateResults,
    navigateToCareer,
    restartQuiz,
  };
};

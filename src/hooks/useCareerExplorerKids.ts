import {useState, useRef, useEffect, useMemo, useCallback} from 'react';
import {Animated, Easing} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import {Haptics} from '../utils/haptics';
import {KIDS_CAREERS, CAREER_QUIZ_QUESTIONS, CAREER_CATEGORIES} from '../components/career-kids/data';
import type {Career} from '../components/career-kids/data';

export function useCareerExplorerKids() {
  const {colors, isDark} = useTheme();
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Header animations
  const headerScaleAnim = useRef(new Animated.Value(0.9)).current;
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const sparkleRotateAnim = useRef(new Animated.Value(0)).current;

  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);

  // Header entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.spring(headerScaleAnim, {toValue: 1, tension: 50, friction: 8, useNativeDriver: true}),
      Animated.timing(headerFadeAnim, {toValue: 1, duration: 600, useNativeDriver: true}),
    ]).start();

    Animated.loop(
      Animated.timing(sparkleRotateAnim, {toValue: 1, duration: 4000, easing: Easing.linear, useNativeDriver: true}),
    ).start();
  }, [headerScaleAnim, headerFadeAnim, sparkleRotateAnim]);

  // Filter careers by category
  const filteredCareers = useMemo(() => {
    if (selectedCategory === 'all') return KIDS_CAREERS;
    return KIDS_CAREERS.filter(career => career.category === selectedCategory);
  }, [selectedCategory]);

  const sparkleRotation = sparkleRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getDifficultyColor = useCallback((difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return colors.success;
      case 'Medium': return colors.warning;
      case 'Hard': return '#FF7043';
      default: return colors.error;
    }
  }, [colors]);

  const handleStartQuiz = useCallback(() => {
    if (!selectedCareer) return;
    setCurrentQuestion(0);
    setScore(0);
    setQuizCompleted(false);
    setSelectedAnswerIndex(null);
    setShowAnswerFeedback(false);
    setShowQuiz(true);
    Haptics.light();
  }, [selectedCareer]);

  const handleAnswer = useCallback((answerIndex: number) => {
    if (!selectedCareer || showAnswerFeedback) return;
    const questions = CAREER_QUIZ_QUESTIONS[selectedCareer.id] || [];
    const currentQ = questions[currentQuestion];

    setSelectedAnswerIndex(answerIndex);
    setShowAnswerFeedback(true);

    if (answerIndex === currentQ.correctIndex) {
      setScore(prev => prev + 1);
      Haptics.success();
    } else {
      Haptics.light();
    }

    // 1500ms so students can read the explanation text
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswerIndex(null);
        setShowAnswerFeedback(false);
      } else {
        setQuizCompleted(true);
        setShowAnswerFeedback(false);
      }
    }, 1500);
  }, [selectedCareer, showAnswerFeedback, currentQuestion]);

  const handleRetryQuiz = useCallback(() => {
    setCurrentQuestion(0);
    setScore(0);
    setQuizCompleted(false);
  }, []);

  const handleCareerPress = useCallback((career: Career) => {
    setSelectedCareer(career);
    setShowDetail(true);
  }, []);

  const handleSelectCategory = useCallback((id: string) => {
    setSelectedCategory(id);
    Haptics.light();
  }, []);

  const quizQuestions = selectedCareer ? (CAREER_QUIZ_QUESTIONS[selectedCareer.id] || []) : [];

  return {
    colors,
    isDark,
    selectedCareer,
    showDetail,
    setShowDetail,
    selectedCategory,
    filteredCareers,
    headerScaleAnim,
    headerFadeAnim,
    sparkleRotation,
    getDifficultyColor,
    // Quiz
    showQuiz,
    setShowQuiz,
    currentQuestion,
    score,
    quizCompleted,
    selectedAnswerIndex,
    showAnswerFeedback,
    quizQuestions,
    // Handlers
    handleStartQuiz,
    handleAnswer,
    handleRetryQuiz,
    handleCareerPress,
    handleSelectCategory,
    // Data
    categories: CAREER_CATEGORIES,
    totalCareers: KIDS_CAREERS.length,
  };
}

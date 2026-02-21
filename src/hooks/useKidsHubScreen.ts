/**
 * useKidsHubScreen - State, animations, and handlers for PremiumKidsHubScreen
 */

import {useState, useEffect, useRef} from 'react';
import {Animated} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../contexts/ThemeContext';
import type {RootStackParamList} from '../navigation/AppNavigator';
import {FUN_FACTS, KIDS_QUOTES} from '../components/kids-hub/data';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const useKidsHubScreen = () => {
  const {colors, isDark} = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  // Animation refs
  const headerAnim = useRef(new Animated.Value(0)).current;
  const welcomeAnim = useRef(new Animated.Value(50)).current;
  const factAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const quoteAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Header animation
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Welcome card animation
    Animated.spring(welcomeAnim, {
      toValue: 0,
      tension: 50,
      friction: 8,
      delay: 300,
      useNativeDriver: true,
    }).start();

    // Fact card animation
    Animated.timing(factAnim, {
      toValue: 1,
      duration: 500,
      delay: 400,
      useNativeDriver: true,
    }).start();

    // Star rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      }),
    ).start();

    // Cycle through facts
    const factInterval = setInterval(() => {
      setCurrentFactIndex(prev => (prev + 1) % FUN_FACTS.length);
    }, 5000);

    // Cycle through quotes
    const quoteInterval = setInterval(() => {
      Animated.sequence([
        Animated.timing(quoteAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(quoteAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      setCurrentQuoteIndex(prev => (prev + 1) % KIDS_QUOTES.length);
    }, 6000);

    // Initial quote animation
    Animated.timing(quoteAnim, {
      toValue: 1,
      duration: 500,
      delay: 800,
      useNativeDriver: true,
    }).start();

    return () => {
      clearInterval(factInterval);
      clearInterval(quoteInterval);
    };
  }, []);

  const starRotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleFeaturePress = (screen: string) => {
    if (screen === 'CareerExplorerKids') {
      navigation.navigate('CareerExplorerKids');
    } else if (screen === 'InterestQuiz') {
      navigation.navigate('InterestQuiz');
    } else if (screen === 'GoalSetting') {
      navigation.navigate('GoalSetting');
    } else if (screen === 'SubjectGuide') {
      navigation.navigate('SubjectGuide');
    } else if (screen === 'CareerRoadmaps') {
      navigation.navigate('CareerRoadmaps');
    } else if (screen === 'StudyTips') {
      navigation.navigate('StudyTips');
    }
  };

  const currentFact = FUN_FACTS[currentFactIndex];
  const currentQuote = KIDS_QUOTES[currentQuoteIndex];

  return {
    navigation,
    colors,
    isDark,
    selectedAge,
    setSelectedAge,
    currentFactIndex,
    currentQuoteIndex,
    currentFact,
    currentQuote,
    // Animations
    headerAnim,
    welcomeAnim,
    factAnim,
    quoteAnim,
    starRotate,
    // Handlers
    handleFeaturePress,
  };
};

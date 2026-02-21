/**
 * useStudyTipsScreen - Hook for PremiumStudyTipsScreen
 * Manages category selection, tip expansion, and animations
 */

import {useState, useRef, useEffect} from 'react';
import {Animated, LayoutAnimation, Platform, UIManager} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../contexts/ThemeContext';
import type {StudyCategory} from '../components/study-tips/data';
import {ENCOURAGEMENTS} from '../components/study-tips/data';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const useStudyTipsScreen = () => {
  const navigation = useNavigation();
  const {colors, isDark} = useTheme();

  const [selectedCategory, setSelectedCategory] = useState<StudyCategory | null>(null);
  const [expandedTip, setExpandedTip] = useState<string | null>(null);
  const [encouragementIndex] = useState(Math.floor(Math.random() * ENCOURAGEMENTS.length));

  const headerAnim = useRef(new Animated.Value(0)).current;
  const motivationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnim, {toValue: 1, duration: 600, useNativeDriver: true}),
      Animated.timing(motivationAnim, {toValue: 1, duration: 500, delay: 300, useNativeDriver: true}),
    ]).start();
  }, []);

  const selectCategory = (category: StudyCategory) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedCategory(category);
    setExpandedTip(null);
  };

  const goBackToTopics = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedCategory(null);
    setExpandedTip(null);
  };

  const toggleTip = (tipId: string) => {
    setExpandedTip(expandedTip === tipId ? null : tipId);
  };

  const randomEncouragement = ENCOURAGEMENTS[encouragementIndex];

  return {
    colors, isDark, navigation,
    selectedCategory, expandedTip,
    headerAnim, motivationAnim,
    randomEncouragement,
    selectCategory, goBackToTopics, toggleTip,
  };
};

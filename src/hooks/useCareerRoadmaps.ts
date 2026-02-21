import {useState, useRef, useEffect} from 'react';
import {Animated} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import {useNavigation} from '@react-navigation/native';
import type {CareerRoadmap} from '../components/career-roadmaps/data';
import {CAREER_ROADMAPS} from '../components/career-roadmaps/data';

export const useCareerRoadmaps = () => {
  const {colors, isDark} = useTheme();
  const navigation = useNavigation();
  const [selectedRoadmap, setSelectedRoadmap] = useState<CareerRoadmap | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const openDetail = (roadmap: CareerRoadmap) => {
    setSelectedRoadmap(roadmap);
    setShowDetailModal(true);
  };

  const closeDetail = () => {
    setShowDetailModal(false);
  };

  const goBack = () => {
    navigation.goBack();
  };

  return {
    colors,
    isDark,
    selectedRoadmap,
    showDetailModal,
    headerAnim,
    roadmaps: CAREER_ROADMAPS,
    totalRoadmaps: CAREER_ROADMAPS.length,
    openDetail,
    closeDetail,
    goBack,
  };
};

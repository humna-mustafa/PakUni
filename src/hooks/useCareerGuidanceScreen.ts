/**
 * useCareerGuidanceScreen - State, animations, and handlers
 */

import {useState, useRef, useEffect} from 'react';
import {Animated} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../contexts/ThemeContext';
import {CAREER_FIELDS, CareerField} from '../data';
import {getCareerCategory} from '../components/career-guidance/data';

export const useCareerGuidanceScreen = () => {
  const {colors, isDark} = useTheme();
  const navigation = useNavigation();
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedCareer, setSelectedCareer] = useState<CareerField | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const filteredCareers = CAREER_FIELDS.filter(
    (career: CareerField) =>
      activeFilter === 'All' || getCareerCategory(career) === activeFilter,
  );

  const openModal = (career: CareerField) => {
    setSelectedCareer(career);
    setModalVisible(true);
    Animated.spring(modalAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedCareer(null);
    });
  };

  return {
    navigation,
    colors,
    isDark,
    activeFilter,
    setActiveFilter,
    selectedCareer,
    modalVisible,
    headerAnim,
    modalAnim,
    filteredCareers,
    openModal,
    closeModal,
  };
};

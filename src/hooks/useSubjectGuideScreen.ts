/**
 * useSubjectGuideScreen - State management and animations for SubjectGuideScreen.
 */
import {useState, useRef, useEffect} from 'react';
import {Animated, Easing} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import type {Subject, SubjectGroup} from '../components/subject-guide/data';

export const useSubjectGuideScreen = () => {
  const {colors, isDark} = useTheme();
  const [selectedGroup, setSelectedGroup] = useState<SubjectGroup | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'groups' | 'subjects'>('groups');

  // Animation refs
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlideAnim = useRef(new Animated.Value(-30)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const bookScaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Header entrance animation
    Animated.parallel([
      Animated.timing(headerFadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(headerSlideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Book icon pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(bookScaleAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bookScaleAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const floatTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const bookScale = bookScaleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.1, 1],
  });

  const getDifficultyColor = (difficulty: Subject['difficulty']) => {
    switch (difficulty) {
      case 'easy': return colors.success;
      case 'medium': return colors.warning;
      case 'hard': return colors.error;
    }
  };

  const openGroupModal = (group: SubjectGroup) => {
    setSelectedGroup(group);
    setShowGroupModal(true);
  };

  const openSubjectModal = (subject: Subject) => {
    setSelectedSubject(subject);
    setShowSubjectModal(true);
  };

  const openGroupById = (groupId: string, groups: SubjectGroup[]) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      openGroupModal(group);
    }
  };

  return {
    // Theme
    colors,
    isDark,
    // State
    selectedGroup,
    selectedSubject,
    showGroupModal,
    showSubjectModal,
    activeTab,
    setActiveTab,
    // Modals
    openGroupModal,
    openSubjectModal,
    openGroupById,
    setShowGroupModal,
    setShowSubjectModal,
    // Animations
    headerFadeAnim,
    headerSlideAnim,
    floatTranslateY,
    bookScale,
    // Helpers
    getDifficultyColor,
  };
};

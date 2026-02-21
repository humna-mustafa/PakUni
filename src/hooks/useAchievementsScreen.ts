/**
 * useAchievementsScreen - State management, animations, and CRUD for achievements.
 */
import {useState, useEffect, useRef} from 'react';
import {Animated, Easing, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../contexts/ThemeContext';
import {logger} from '../utils/logger';
import {
  ACHIEVEMENT_TEMPLATES,
  AchievementTemplate,
  MyAchievement,
  loadMyAchievements,
  addAchievement,
  deleteAchievement,
  updateAchievement,
  shareAchievement,
  getAchievementStats,
} from '../services/achievements';

export type AchievementStats = {total: number; byType: Record<string, number>};

export const TYPE_COLORS: Record<string, {primary: string; secondary: string}> = {
  entry_test: {primary: '#4573DF', secondary: '#3660C9'},
  merit_list: {primary: '#FFD700', secondary: '#FFA500'},
  admission: {primary: '#10B981', secondary: '#047857'},
  scholarship: {primary: '#F59E0B', secondary: '#D97706'},
  result: {primary: '#4573DF', secondary: '#3660C9'},
  custom: {primary: '#4573DF', secondary: '#3660C9'},
};

export const useAchievementsScreen = () => {
  const {colors, isDark} = useTheme();
  const navigation = useNavigation();
  const [achievements, setAchievements] = useState<MyAchievement[]>([]);
  const [stats, setStats] = useState<AchievementStats>({total: 0, byType: {}});
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AchievementTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingAchievement, setEditingAchievement] = useState<MyAchievement | null>(null);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const trophyRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();

    Animated.timing(headerAnim, {
      toValue: 1, duration: 600, useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {toValue: 1, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true}),
        Animated.timing(floatAnim, {toValue: 0, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true}),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(trophyRotate, {toValue: 1, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true}),
        Animated.timing(trophyRotate, {toValue: 0, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true}),
      ]),
    ).start();
  }, []);

  const floatTranslateY = floatAnim.interpolate({inputRange: [0, 1], outputRange: [0, -8]});
  const trophyRotateZ = trophyRotate.interpolate({inputRange: [0, 1], outputRange: ['-5deg', '5deg']});

  const loadData = async () => {
    try {
      const [loadedAchievements, loadedStats] = await Promise.all([
        loadMyAchievements(),
        getAchievementStats(),
      ]);
      setAchievements(loadedAchievements);
      setStats(loadedStats);
    } catch (error) {
      logger.error('Error loading achievements', error, 'Achievements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTemplate = (template: AchievementTemplate) => {
    setSelectedTemplate(template);
    setShowAddModal(true);
  };

  const handleAddAchievement = async (data: Record<string, string>) => {
    if (!selectedTemplate) return;
    try {
      await addAchievement(selectedTemplate, data);
      await loadData();
      setShowAddModal(false);
      setSelectedTemplate(null);
      Alert.alert('🎉 Achievement Added!', 'You can now share it with friends!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add achievement');
    }
  };

  const handleDeleteAchievement = (id: string) => {
    Alert.alert('Delete Achievement', 'Are you sure you want to remove this achievement?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Delete', style: 'destructive', onPress: async () => { await deleteAchievement(id); await loadData(); }},
    ]);
  };

  const handleEditAchievement = (achievement: MyAchievement) => {
    const template = ACHIEVEMENT_TEMPLATES.find(t => t.type === achievement.type) || ACHIEVEMENT_TEMPLATES[ACHIEVEMENT_TEMPLATES.length - 1];
    setEditingAchievement(achievement);
    setSelectedTemplate(template);
    setShowAddModal(true);
  };

  const handleSaveEdit = async (data: Record<string, string>) => {
    if (!editingAchievement) return;
    try {
      await updateAchievement(editingAchievement.id, {
        title: data.title || editingAchievement.title,
        description: data.description || '',
        universityName: data.universityName,
        programName: data.programName,
        testName: data.testName,
        scholarshipName: data.scholarshipName,
        score: data.score,
        percentage: data.percentage,
        date: data.date || editingAchievement.date,
      });
      await loadData();
      setShowAddModal(false);
      setSelectedTemplate(null);
      setEditingAchievement(null);
      Alert.alert('Updated!', 'Your achievement has been updated.');
    } catch (error) {
      Alert.alert('Error', 'Failed to update achievement');
    }
  };

  const handleShareAchievement = async (achievement: MyAchievement) => {
    await shareAchievement(achievement);
  };

  const getEditInitialData = (): Record<string, string> | undefined => {
    if (!editingAchievement) return undefined;
    const d: Record<string, string> = {};
    if (editingAchievement.title) d.title = editingAchievement.title;
    if (editingAchievement.description) d.description = editingAchievement.description;
    if (editingAchievement.universityName) d.universityName = editingAchievement.universityName;
    if (editingAchievement.programName) d.programName = editingAchievement.programName;
    if (editingAchievement.testName) d.testName = editingAchievement.testName;
    if (editingAchievement.scholarshipName) d.scholarshipName = editingAchievement.scholarshipName;
    if (editingAchievement.score) d.score = editingAchievement.score;
    if (editingAchievement.percentage) d.percentage = editingAchievement.percentage;
    if (editingAchievement.date) d.date = editingAchievement.date;
    return d;
  };

  const closeModal = () => {
    setShowAddModal(false);
    setSelectedTemplate(null);
    setEditingAchievement(null);
  };

  return {
    colors, isDark, navigation,
    achievements, stats, isLoading,
    showAddModal, selectedTemplate, editingAchievement,
    // Animations
    headerAnim, floatTranslateY, trophyRotateZ,
    // Handlers
    handleSelectTemplate,
    handleAddAchievement,
    handleDeleteAchievement,
    handleEditAchievement,
    handleSaveEdit,
    handleShareAchievement,
    getEditInitialData,
    closeModal,
    // Templates
    ACHIEVEMENT_TEMPLATES,
    TYPE_COLORS,
  };
};

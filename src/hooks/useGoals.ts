import {useState, useRef, useEffect, useCallback} from 'react';
import {Animated, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {GoalMilestone, UserGoal, GoalTemplate} from '../types/goals';
import {GOALS_STORAGE_KEY, DEFAULT_GOALS} from '../constants/goalTemplates';
import {logger} from '../utils/logger';
import {
  formatDateToDDMMYYYY,
  parseDDMMYYYY,
  isValidDateFormat,
  getDefaultDeadline,
} from '../utils/dateHelpers';

// Re-export date helpers for backward compatibility
export {formatDateToDDMMYYYY, parseDDMMYYYY, isValidDateFormat, getDefaultDeadline};

export const useGoals = () => {
  const [goals, setGoals] = useState<UserGoal[]>(DEFAULT_GOALS);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<UserGoal | null>(null);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDeadline, setNewGoalDeadline] = useState(() => getDefaultDeadline(30));
  const [customMilestones, setCustomMilestones] = useState<string[]>(['']);

  // Template deadline selection state
  const [showTemplateDeadlineModal, setShowTemplateDeadlineModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<GoalTemplate | null>(null);
  const [templateDeadline, setTemplateDeadline] = useState('');

  // Edit goal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editGoalTitle, setEditGoalTitle] = useState('');
  const [editGoalDeadline, setEditGoalDeadline] = useState('');
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [newMilestoneText, setNewMilestoneText] = useState('');
  const [editGoalMilestones, setEditGoalMilestones] = useState<string[]>([]);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;
  const hasLoadedRef = useRef(false);

  // Load goals from AsyncStorage on mount
  useEffect(() => {
    loadGoals();
  }, []);

  // Save goals whenever they change (skip the first save triggered by load)
  useEffect(() => {
    if (!isLoading && hasLoadedRef.current) {
      saveGoals(goals);
    }
    if (!isLoading) {
      hasLoadedRef.current = true;
    }
  }, [goals, isLoading]);

  const loadGoals = useCallback(async () => {
    try {
      const storedGoals = await AsyncStorage.getItem(GOALS_STORAGE_KEY);
      if (storedGoals) {
        const parsedGoals = JSON.parse(storedGoals);
        // Normalize goals for backward compatibility
        const normalizedGoals = parsedGoals.map((goal: any) => ({
          ...goal,
          completed: goal.completed ?? (goal.progress === 100),
          deadline:
            goal.deadline &&
            goal.deadline.includes('-') &&
            !goal.deadline.includes('/')
              ? formatDateToDDMMYYYY(new Date(goal.deadline))
              : goal.deadline,
        }));
        setGoals(normalizedGoals);
      }
    } catch (error) {
      logger.error('Failed to load goals', error, 'GoalSetting');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveGoals = useCallback(async (goalsToSave: UserGoal[]) => {
    try {
      await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goalsToSave));
    } catch (error) {
      logger.error('Failed to save goals', error, 'GoalSetting');
    }
  }, []);

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const openAddModal = useCallback(() => {
    setShowAddModal(true);
    Animated.spring(modalAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [modalAnim]);

  const closeAddModal = useCallback(() => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowAddModal(false));
  }, [modalAnim]);

  const openDetailModal = useCallback((goal: UserGoal) => {
    setSelectedGoal(goal);
    setShowDetailModal(true);
  }, []);

  const closeDetailModal = useCallback(() => {
    setShowDetailModal(false);
    setSelectedGoal(null);
  }, []);

  const toggleMilestone = useCallback((goalId: string, milestoneIndex: number) => {
    const updateMilestones = (milestones: GoalMilestone[]) => {
      return milestones.map((m, idx) =>
        idx === milestoneIndex
          ? {
              ...m,
              completed: !m.completed,
              completedDate: !m.completed
                ? new Date().toISOString()
                : undefined,
            }
          : m,
      );
    };

    setGoals(prev =>
      prev.map(g => {
        if (g.id === goalId) {
          const newMilestones = updateMilestones(g.milestones);
          const completedCount = newMilestones.filter(m => m.completed).length;
          const newProgress = Math.round(
            (completedCount / newMilestones.length) * 100,
          );
          return {...g, milestones: newMilestones, progress: newProgress};
        }
        return g;
      }),
    );

    if (selectedGoal && selectedGoal.id === goalId) {
      const newMilestones = updateMilestones(selectedGoal.milestones);
      const completedCount = newMilestones.filter(m => m.completed).length;
      const newProgress = Math.round(
        (completedCount / newMilestones.length) * 100,
      );
      setSelectedGoal({
        ...selectedGoal,
        milestones: newMilestones,
        progress: newProgress,
      });
    }
  }, [selectedGoal]);

  const handleSelectTemplate = useCallback((template: GoalTemplate) => {
    setSelectedTemplate(template);
    setTemplateDeadline(getDefaultDeadline(template.estimatedDays || 30));
    setShowTemplateDeadlineModal(true);
  }, []);

  const handleCreateFromTemplate = useCallback(() => {
    if (!selectedTemplate) return;

    const template = selectedTemplate;
    const newGoal: UserGoal = {
      id: `${template.id}-${Date.now()}`,
      title: template.title,
      iconName: template.iconName,
      color: template.color,
      progress: 0,
      completed: false,
      createdAt: new Date().toISOString(),
      category: template.category,
      difficulty: template.difficulty,
      streak: 0,
      deadline:
        templateDeadline ||
        getDefaultDeadline(template.estimatedDays || 30),
      milestones: template.milestones.map(m => ({
        text: m,
        completed: false,
      })),
    };
    setGoals(prev => [...prev, newGoal]);
    setShowTemplateDeadlineModal(false);
    setSelectedTemplate(null);
    setTemplateDeadline('');
    closeAddModal();
  }, [selectedTemplate, templateDeadline, closeAddModal]);

  const handleCreateCustomGoal = useCallback(() => {
    if (!newGoalTitle.trim()) {
      return;
    }

    if (newGoalDeadline && !isValidDateFormat(newGoalDeadline)) {
      Alert.alert(
        'Invalid Date',
        'Please use DD/MM/YYYY format (e.g., 15/03/2025)',
      );
      return;
    }

    const userMilestones = customMilestones.filter(
      m => m.trim().length > 0,
    );
    const finalMilestones =
      userMilestones.length > 0
        ? userMilestones.map(text => ({text: text.trim(), completed: false}))
        : [
            {text: 'Define what success looks like', completed: false},
            {text: 'Break down into smaller tasks', completed: false},
            {text: 'Start working on first task', completed: false},
            {text: 'Track progress weekly', completed: false},
            {text: 'Complete the goal', completed: false},
          ];

    const newGoal: UserGoal = {
      id: `custom-${Date.now()}`,
      title: newGoalTitle.trim(),
      iconName: 'flag-outline',
      color: '#e74c3c',
      progress: 0,
      completed: false,
      createdAt: new Date().toISOString(),
      category: 'custom',
      difficulty: 'Medium',
      streak: 0,
      deadline: newGoalDeadline || undefined,
      milestones: finalMilestones,
    };
    setGoals(prev => [...prev, newGoal]);
    setNewGoalTitle('');
    setNewGoalDeadline(getDefaultDeadline(30));
    setCustomMilestones(['']);
    closeAddModal();
  }, [newGoalTitle, newGoalDeadline, customMilestones, closeAddModal]);

  const openEditModal = useCallback((goal: UserGoal) => {
    setEditingGoalId(goal.id);
    setEditGoalTitle(goal.title);
    setEditGoalDeadline(goal.deadline || '');
    setEditGoalMilestones(goal.milestones.map(m => m.text));
    setShowEditModal(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setShowEditModal(false);
    setEditingGoalId(null);
    setEditGoalTitle('');
    setEditGoalDeadline('');
    setEditGoalMilestones([]);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingGoalId || !editGoalTitle.trim()) {
      return;
    }

    if (editGoalDeadline && !isValidDateFormat(editGoalDeadline)) {
      Alert.alert(
        'Invalid Date',
        'Please use DD/MM/YYYY format (e.g., 15/03/2025)',
      );
      return;
    }

    const validMilestones = editGoalMilestones.filter(
      m => m.trim().length > 0,
    );

    setGoals(prev =>
      prev.map(g => {
        if (g.id === editingGoalId) {
          const newMilestones =
            validMilestones.length > 0
              ? validMilestones.map(text => {
                  const existing = g.milestones.find(m => m.text === text);
                  return existing || {text: text.trim(), completed: false};
                })
              : g.milestones;

          const completedCount = newMilestones.filter(
            m => m.completed,
          ).length;
          const newProgress = Math.round(
            (completedCount / newMilestones.length) * 100,
          );

          const updatedGoal = {
            ...g,
            title: editGoalTitle.trim(),
            deadline: editGoalDeadline || undefined,
            milestones: newMilestones,
            progress: newProgress,
          };
          if (selectedGoal && selectedGoal.id === editingGoalId) {
            setSelectedGoal(updatedGoal);
          }
          return updatedGoal;
        }
        return g;
      }),
    );
    closeEditModal();
  }, [editingGoalId, editGoalTitle, editGoalDeadline, editGoalMilestones, selectedGoal, closeEditModal]);

  const toggleGoalCompleted = useCallback((goalId: string) => {
    setGoals(prev =>
      prev.map(g => {
        if (g.id === goalId) {
          const newCompleted = !g.completed;
          const updatedGoal = {
            ...g,
            completed: newCompleted,
            progress: newCompleted
              ? 100
              : Math.round(
                  (g.milestones.filter(m => m.completed).length /
                    g.milestones.length) *
                    100,
                ),
          };
          if (selectedGoal && selectedGoal.id === goalId) {
            setSelectedGoal(updatedGoal);
          }
          return updatedGoal;
        }
        return g;
      }),
    );
  }, [selectedGoal]);

  const handleDeleteGoal = useCallback((goalId: string) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal? This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setGoals(prev => prev.filter(g => g.id !== goalId));
            closeDetailModal();
          },
        },
      ],
    );
  }, [closeDetailModal]);

  const addMilestoneToGoal = useCallback((goalId: string, milestoneText: string) => {
    if (!milestoneText.trim()) return;
    const newMilestone: GoalMilestone = {
      text: milestoneText.trim(),
      completed: false,
    };
    setGoals(prev =>
      prev.map(g => {
        if (g.id === goalId) {
          const updatedMilestones = [...g.milestones, newMilestone];
          const completedCount = updatedMilestones.filter(
            m => m.completed,
          ).length;
          const newProgress = Math.round(
            (completedCount / updatedMilestones.length) * 100,
          );
          const updatedGoal = {
            ...g,
            milestones: updatedMilestones,
            progress: newProgress,
          };
          if (selectedGoal && selectedGoal.id === goalId) {
            setSelectedGoal(updatedGoal);
          }
          return updatedGoal;
        }
        return g;
      }),
    );
  }, [selectedGoal]);

  const removeMilestoneFromGoal = useCallback((
    goalId: string,
    milestoneIndex: number,
  ) => {
    setGoals(prev =>
      prev.map(g => {
        if (g.id === goalId) {
          if (g.milestones.length <= 1) {
            Alert.alert(
              'Cannot Remove',
              'A goal must have at least one milestone.',
            );
            return g;
          }
          const updatedMilestones = g.milestones.filter(
            (_, i) => i !== milestoneIndex,
          );
          const completedCount = updatedMilestones.filter(
            m => m.completed,
          ).length;
          const newProgress = Math.round(
            (completedCount / updatedMilestones.length) * 100,
          );
          const updatedGoal = {
            ...g,
            milestones: updatedMilestones,
            progress: newProgress,
          };
          if (selectedGoal && selectedGoal.id === goalId) {
            setSelectedGoal(updatedGoal);
          }
          return updatedGoal;
        }
        return g;
      }),
    );
  }, [selectedGoal]);

  const totalProgress =
    goals.length > 0
      ? Math.round(
          goals.reduce((sum, g) => sum + g.progress, 0) / goals.length,
        )
      : 0;

  return {
    // State
    goals,
    isLoading,
    showAddModal,
    showDetailModal,
    selectedGoal,
    newGoalTitle,
    newGoalDeadline,
    customMilestones,
    showTemplateDeadlineModal,
    selectedTemplate,
    templateDeadline,
    showEditModal,
    editGoalTitle,
    editGoalDeadline,
    editingGoalId,
    newMilestoneText,
    editGoalMilestones,
    totalProgress,

    // Animated values
    headerAnim,
    modalAnim,

    // State setters
    setNewGoalTitle,
    setNewGoalDeadline,
    setCustomMilestones,
    setTemplateDeadline,
    setEditGoalTitle,
    setEditGoalDeadline,
    setEditGoalMilestones,
    setNewMilestoneText,
    setShowTemplateDeadlineModal,
    setSelectedTemplate,

    // Handlers
    openAddModal,
    closeAddModal,
    openDetailModal,
    closeDetailModal,
    toggleMilestone,
    handleSelectTemplate,
    handleCreateFromTemplate,
    handleCreateCustomGoal,
    openEditModal,
    closeEditModal,
    handleSaveEdit,
    toggleGoalCompleted,
    handleDeleteGoal,
    addMilestoneToGoal,
    removeMilestoneFromGoal,
  };
};

import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SPACING} from '../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../constants/design';
import {useTheme} from '../contexts/ThemeContext';
import {Icon} from '../components/icons';
import {logger} from '../utils/logger';

// Date helper functions
const formatDateToDDMMYYYY = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const parseDDMMYYYY = (dateStr: string): Date | null => {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  const date = new Date(year, month, day);
  if (isNaN(date.getTime())) return null;
  return date;
};

const isValidDateFormat = (dateStr: string): boolean => {
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!regex.test(dateStr)) return false;
  const parsed = parseDDMMYYYY(dateStr);
  return parsed !== null;
};

const getDefaultDeadline = (daysFromNow: number = 30): string => {
  const date = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
  return formatDateToDDMMYYYY(date);
};

const {width} = Dimensions.get('window');

// Storage key for goals
const GOALS_STORAGE_KEY = '@pakuni_user_goals';
const STREAKS_STORAGE_KEY = '@pakuni_goal_streaks';

// Goal templates - Comprehensive for Pakistani students
const GOAL_TEMPLATES = [
  {
    id: 'university',
    title: 'Get into Dream University',
    iconName: 'school-outline',
    color: '#4573DF',
    category: 'education',
    difficulty: 'Hard',
    estimatedDays: 180,
    milestones: [
      'Research university requirements & deadlines',
      'Check eligibility criteria (marks, domicile)',
      'Achieve required FSc percentage (80%+)',
      'Register for entry test (NUST NET/FAST/GIKI)',
      'Complete 3 months entry test preparation',
      'Take mock tests weekly',
      'Apply before deadline',
      'Prepare for interview (if required)',
    ],
  },
  {
    id: 'marks',
    title: 'Improve My Marks',
    iconName: 'trending-up-outline',
    color: '#27ae60',
    category: 'academics',
    difficulty: 'Medium',
    estimatedDays: 90,
    milestones: [
      'Identify weak subjects',
      'Create daily study schedule',
      'Complete homework same day',
      'Take practice tests every weekend',
      'Review and correct mistakes',
      'Ask teachers for help on difficult topics',
      'Join study group for peer learning',
      'Achieve target marks in monthly test',
    ],
  },
  {
    id: 'scholarship',
    title: 'Get Scholarship',
    iconName: 'trophy-outline',
    color: '#f39c12',
    category: 'financial',
    difficulty: 'Hard',
    estimatedDays: 120,
    milestones: [
      'Research available scholarships (HEC, Need-based, Merit)',
      'Check eligibility for each scholarship',
      'Gather required documents (income certificate, etc.)',
      'Write compelling personal statement',
      'Get recommendation letters from teachers',
      'Submit application before deadline',
      'Prepare for scholarship interview',
      'Follow up on application status',
    ],
  },
  {
    id: 'career',
    title: 'Explore Career Options',
    iconName: 'briefcase-outline',
    color: '#9b59b6',
    category: 'career',
    difficulty: 'Easy',
    estimatedDays: 30,
    milestones: [
      'Take career aptitude quiz in app',
      'Research top 5 career paths',
      'Talk to professionals in each field',
      'Understand required qualifications',
      'Create career action plan',
    ],
  },
  {
    id: 'entry-test',
    title: 'Ace Entry Test',
    iconName: 'flask-outline',
    color: '#E74C3C',
    category: 'education',
    difficulty: 'Hard',
    estimatedDays: 90,
    milestones: [
      'Register for entry test',
      'Get past papers (5+ years)',
      'Complete Physics syllabus revision',
      'Complete Chemistry syllabus revision',
      'Complete Math/Biology syllabus revision',
      'Complete English/IQ section prep',
      'Solve 50+ past papers',
      'Take 10+ full mock tests',
      'Review weak areas',
      'Final revision before exam',
    ],
  },
  {
    id: 'english',
    title: 'Improve English Skills',
    iconName: 'language-outline',
    color: '#3498DB',
    category: 'skills',
    difficulty: 'Medium',
    estimatedDays: 60,
    milestones: [
      'Read English newspaper daily (15 mins)',
      'Learn 10 new words daily',
      'Watch English content with subtitles',
      'Practice speaking with someone',
      'Write one paragraph daily',
      'Take grammar quiz weekly',
      'Complete one English book',
    ],
  },
  {
    id: 'matric-fsc',
    title: 'Score 90%+ in Board Exams',
    iconName: 'ribbon-outline',
    color: '#1ABC9C',
    category: 'academics',
    difficulty: 'Hard',
    estimatedDays: 180,
    milestones: [
      'Complete syllabus 2 months early',
      'Solve past papers (10 years)',
      'Master important questions',
      'Create formula/key points sheets',
      'Daily 6+ hours focused study',
      'Weekly revision of all subjects',
      'Mock exam practice',
      'Final week intensive revision',
    ],
  },
  {
    id: 'time-management',
    title: 'Master Time Management',
    iconName: 'time-outline',
    color: '#E67E22',
    category: 'skills',
    difficulty: 'Easy',
    estimatedDays: 21,
    milestones: [
      'Track current time usage for 3 days',
      'Identify time-wasting activities',
      'Create weekly schedule template',
      'Use Pomodoro technique (25/5 mins)',
      'Limit social media to 30 mins/day',
      'Wake up at consistent time',
      'Maintain schedule for 2 weeks',
    ],
  },
];

// Goal type definition
interface GoalMilestone {
  text: string;
  completed: boolean;
  completedDate?: string;
}

interface UserGoal {
  id: string;
  title: string;
  iconName: string;
  color: string;
  progress: number;
  deadline?: string; // DD/MM/YYYY format
  completed: boolean;
  createdAt: string;
  category?: string;
  difficulty?: string;
  streak?: number;
  lastCheckIn?: string;
  milestones: GoalMilestone[];
}

// Helper to calculate streak
const calculateStreak = (lastCheckIn: string | undefined): number => {
  if (!lastCheckIn) return 0;
  const last = new Date(lastCheckIn);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= 1 ? 1 : 0; // Streak continues if checked in within 24hrs
};

// Get difficulty color
const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'Easy': return '#27ae60';
    case 'Medium': return '#f39c12';
    case 'Hard': return '#E74C3C';
    default: return '#4573DF';
  }
};

// Default empty goals - user needs to create their own
const DEFAULT_GOALS: UserGoal[] = [];

// Animated progress circle
const ProgressCircle = ({
  progress,
  size = 60,
  color,
  colors,
}: {
  progress: number;
  size?: number;
  color: string;
  colors: any;
}) => {
  const animProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animProgress, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View style={[styles.progressCircle, {width: size, height: size}]}>
      <View
        style={[
          styles.progressCircleInner,
          {
            width: size - 8,
            height: size - 8,
            backgroundColor: colors.card,
          },
        ]}>
        <Text style={[styles.progressCircleText, {color}]}>{progress}%</Text>
      </View>
      {/* Simple circle indicator using border */}
      <View
        style={[
          styles.progressCircleBg,
          {
            borderColor: color + '30',
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      />
    </View>
  );
};

// Goal card component
const GoalCard = ({
  goal,
  onPress,
  onEdit,
  index,
  colors,
}: {
  goal: any;
  onPress: () => void;
  onEdit: () => void;
  index: number;
  colors: any;
}) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const completedMilestones = goal.milestones.filter((m: any) => m.completed).length;
  const totalMilestones = goal.milestones.length;

  const getDaysRemaining = () => {
    if (!goal.deadline) return null;
    // Parse DD/MM/YYYY format
    const parsed = parseDDMMYYYY(goal.deadline);
    if (!parsed) {
      // Fallback for old ISO format
      const deadline = new Date(goal.deadline);
      if (isNaN(deadline.getTime())) return null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((parsed.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = getDaysRemaining();
  const isOverdue = daysRemaining !== null && daysRemaining < 0;
  const isDueSoon = daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 3;
  const isCompleted = goal.completed || goal.progress === 100;

  const getDeadlineText = () => {
    if (!goal.deadline) return 'No deadline';
    if (isCompleted) return 'Completed!';
    if (daysRemaining === null) return 'No deadline';
    if (daysRemaining < 0) return `${Math.abs(daysRemaining)} days overdue`;
    if (daysRemaining === 0) return 'Due today!';
    if (daysRemaining === 1) return '1 day left';
    return `${daysRemaining} days left`;
  };

  const getDeadlineColor = () => {
    if (isCompleted) return colors.success;
    if (isOverdue) return '#E74C3C';
    if (isDueSoon) return '#f39c12';
    return colors.textSecondary;
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{translateY: slideAnim}, {scale: scaleAnim}],
          opacity: fadeAnim,
        },
      ]}>
      <TouchableOpacity activeOpacity={0.9} onPress={onPress} onLongPress={onEdit}>
        <View style={[
          styles.goalCard, 
          {backgroundColor: colors.card},
          isOverdue && !isCompleted && {borderColor: '#E74C3C', borderWidth: 2},
        ]}>
          <LinearGradient
            colors={[goal.color + '15', 'transparent']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.cardGradient}
          />
          
          {/* Edit button */}
          <TouchableOpacity 
            style={styles.editIconBtn}
            onPress={onEdit}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Icon name="pencil-outline" family="Ionicons" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <View style={styles.goalHeader}>
            <View style={[styles.goalIconContainer, {backgroundColor: goal.color + '20'}]}>
              <Icon name={goal.iconName} family="Ionicons" size={28} color={goal.color} />
            </View>
            <View style={styles.goalTitleArea}>
              <Text style={[styles.goalTitle, {color: colors.text}]}>{goal.title}</Text>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                <Icon 
                  name={isOverdue && !isCompleted ? "alert-circle-outline" : "time-outline"} 
                  family="Ionicons" 
                  size={12} 
                  color={getDeadlineColor()} 
                />
                <Text style={[styles.goalDeadline, {color: getDeadlineColor(), fontWeight: isOverdue ? '600' : '400'}]}>
                  {getDeadlineText()}
                </Text>
              </View>
              {goal.deadline && (
                <Text style={[styles.goalDeadlineDate, {color: colors.textMuted}]}>
                  Due: {goal.deadline}
                </Text>
              )}
            </View>
            <ProgressCircle
              progress={goal.progress}
              color={goal.color}
              colors={colors}
            />
          </View>

          {/* Progress bar */}
          <View style={styles.progressSection}>
            <View style={[styles.progressTrack, {backgroundColor: colors.background}]}>
              <LinearGradient
                colors={[goal.color, goal.color + 'CC']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={[styles.progressFill, {width: `${goal.progress}%`}]}
              />
            </View>
          </View>

          {/* Milestones preview */}
          <View style={styles.milestonesPreview}>
            {goal.milestones.slice(0, 2).map((milestone: any, i: number) => (
              <View key={i} style={styles.milestoneItem}>
                <View
                  style={[
                    styles.milestoneCheck,
                    {
                      backgroundColor: milestone.completed
                        ? goal.color
                        : colors.background,
                      borderColor: milestone.completed ? goal.color : colors.border,
                    },
                  ]}>
                  {milestone.completed && <Icon name="checkmark" family="Ionicons" size={12} color="#FFFFFF" />}
                </View>
                <Text
                  style={[
                    styles.milestoneText,
                    {
                      color: milestone.completed
                        ? colors.textSecondary
                        : colors.text,
                      textDecorationLine: milestone.completed
                        ? 'line-through'
                        : 'none',
                    },
                  ]}>
                  {milestone.text}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.cardFooter}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
              <Icon name="checkmark-circle" family="Ionicons" size={14} color={colors.textSecondary} />
              <Text style={[styles.milestonesCount, {color: colors.textSecondary}]}>
                {completedMilestones}/{totalMilestones} milestones
              </Text>
            </View>
            <View style={[styles.viewBtn, {backgroundColor: goal.color, flexDirection: 'row', alignItems: 'center', gap: 4}]}>
              <Text style={styles.viewBtnText}>View</Text>
              <Icon name="arrow-forward" family="Ionicons" size={14} color="#FFFFFF" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Template card component
const TemplateCard = ({
  template,
  onSelect,
  colors,
}: {
  template: typeof GOAL_TEMPLATES[0];
  onSelect: () => void;
  colors: any;
}) => {
  return (
    <TouchableOpacity
      style={[styles.templateCard, {backgroundColor: template.color}]}
      onPress={onSelect}>
      <View style={styles.templateBadgeRow}>
        <View style={[styles.difficultyBadge, {backgroundColor: 'rgba(255,255,255,0.2)'}]}>
          <Text style={styles.difficultyText}>{template.difficulty}</Text>
        </View>
      </View>
      <Icon name={template.iconName} family="Ionicons" size={32} color="#FFFFFF" />
      <Text style={styles.templateTitle}>{template.title}</Text>
      <View style={styles.templateMeta}>
        <View style={styles.templateMetaItem}>
          <Icon name="list-outline" family="Ionicons" size={12} color="rgba(255,255,255,0.8)" />
          <Text style={styles.templateMilestones}>{template.milestones.length} steps</Text>
        </View>
        <View style={styles.templateMetaItem}>
          <Icon name="time-outline" family="Ionicons" size={12} color="rgba(255,255,255,0.8)" />
          <Text style={styles.templateMilestones}>{template.estimatedDays}d</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const PremiumGoalSettingScreen = () => {
  const {colors, isDark} = useTheme();
  const navigation = useNavigation();
  const [goals, setGoals] = useState<UserGoal[]>(DEFAULT_GOALS);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDeadline, setNewGoalDeadline] = useState(() => getDefaultDeadline(30));
  
  // Template deadline selection state
  const [showTemplateDeadlineModal, setShowTemplateDeadlineModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof GOAL_TEMPLATES[0] | null>(null);
  const [templateDeadline, setTemplateDeadline] = useState('');
  
  // Edit goal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editGoalTitle, setEditGoalTitle] = useState('');
  const [editGoalDeadline, setEditGoalDeadline] = useState('');
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;

  // Load goals from AsyncStorage on mount
  useEffect(() => {
    loadGoals();
  }, []);

  // Save goals whenever they change (after initial load)
  useEffect(() => {
    if (!isLoading) {
      saveGoals(goals);
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
          // Ensure completed field exists (for old goals)
          completed: goal.completed ?? (goal.progress === 100),
          // Convert old ISO date format to DD/MM/YYYY if needed
          deadline: goal.deadline && goal.deadline.includes('-') && !goal.deadline.includes('/')
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

  const openAddModal = () => {
    setShowAddModal(true);
    Animated.spring(modalAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const closeAddModal = () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowAddModal(false));
  };

  const openDetailModal = (goal: any) => {
    setSelectedGoal(goal);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedGoal(null);
  };

  const toggleMilestone = (goalId: string, milestoneIndex: number) => {
    // Create properly immutable update for milestones
    const updateMilestones = (milestones: GoalMilestone[]) => {
      return milestones.map((m, idx) => 
        idx === milestoneIndex 
          ? { ...m, completed: !m.completed, completedDate: !m.completed ? new Date().toISOString() : undefined }
          : m
      );
    };
    
    setGoals(prev =>
      prev.map(g => {
        if (g.id === goalId) {
          const newMilestones = updateMilestones(g.milestones);
          const completedCount = newMilestones.filter(m => m.completed).length;
          const newProgress = Math.round((completedCount / newMilestones.length) * 100);
          return {...g, milestones: newMilestones, progress: newProgress};
        }
        return g;
      }),
    );
    
    if (selectedGoal && selectedGoal.id === goalId) {
      const newMilestones = updateMilestones(selectedGoal.milestones);
      const completedCount = newMilestones.filter(m => m.completed).length;
      const newProgress = Math.round((completedCount / newMilestones.length) * 100);
      setSelectedGoal({...selectedGoal, milestones: newMilestones, progress: newProgress});
    }
  };

  // Create goal from template - now shows deadline modal first
  const handleSelectTemplate = (template: typeof GOAL_TEMPLATES[0]) => {
    setSelectedTemplate(template);
    setTemplateDeadline(getDefaultDeadline(template.estimatedDays || 30));
    setShowTemplateDeadlineModal(true);
  };

  const handleCreateFromTemplate = () => {
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
      deadline: templateDeadline || getDefaultDeadline(template.estimatedDays || 30),
      milestones: template.milestones.map(m => ({text: m, completed: false})),
    };
    setGoals(prev => [...prev, newGoal]);
    setShowTemplateDeadlineModal(false);
    setSelectedTemplate(null);
    setTemplateDeadline('');
    closeAddModal();
  };

  // Create custom goal
  const handleCreateCustomGoal = () => {
    if (!newGoalTitle.trim()) {
      return; // Don't create empty goals
    }
    
    // Validate deadline format if provided
    if (newGoalDeadline && !isValidDateFormat(newGoalDeadline)) {
      Alert.alert('Invalid Date', 'Please use DD/MM/YYYY format (e.g., 15/03/2025)');
      return;
    }
    
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
      milestones: [
        {text: 'Define what success looks like', completed: false},
        {text: 'Break down into smaller tasks', completed: false},
        {text: 'Start working on first task', completed: false},
        {text: 'Track progress weekly', completed: false},
        {text: 'Complete the goal', completed: false},
      ],
    };
    setGoals(prev => [...prev, newGoal]);
    setNewGoalTitle('');
    setNewGoalDeadline(getDefaultDeadline(30));
    closeAddModal();
  };

  // Edit goal functions
  const openEditModal = (goal: UserGoal) => {
    setEditingGoalId(goal.id);
    setEditGoalTitle(goal.title);
    setEditGoalDeadline(goal.deadline || '');
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingGoalId(null);
    setEditGoalTitle('');
    setEditGoalDeadline('');
  };

  const handleSaveEdit = () => {
    if (!editingGoalId || !editGoalTitle.trim()) {
      return;
    }
    
    // Validate deadline format if provided
    if (editGoalDeadline && !isValidDateFormat(editGoalDeadline)) {
      Alert.alert('Invalid Date', 'Please use DD/MM/YYYY format (e.g., 15/03/2025)');
      return;
    }
    
    setGoals(prev =>
      prev.map(g => {
        if (g.id === editingGoalId) {
          const updatedGoal = {
            ...g,
            title: editGoalTitle.trim(),
            deadline: editGoalDeadline || undefined,
          };
          // Also update selected goal if viewing it
          if (selectedGoal && selectedGoal.id === editingGoalId) {
            setSelectedGoal(updatedGoal);
          }
          return updatedGoal;
        }
        return g;
      }),
    );
    closeEditModal();
  };

  const toggleGoalCompleted = (goalId: string) => {
    setGoals(prev =>
      prev.map(g => {
        if (g.id === goalId) {
          const newCompleted = !g.completed;
          const updatedGoal = {
            ...g,
            completed: newCompleted,
            progress: newCompleted ? 100 : Math.round((g.milestones.filter(m => m.completed).length / g.milestones.length) * 100),
          };
          if (selectedGoal && selectedGoal.id === goalId) {
            setSelectedGoal(updatedGoal);
          }
          return updatedGoal;
        }
        return g;
      }),
    );
  };

  // Delete a goal
  const handleDeleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
    closeDetailModal();
  };

  const totalProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
    : 0;

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}
      edges={['top']}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" family="Ionicons" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      {/* Header */}
      <Animated.View
        style={[
          styles.headerContainer,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          },
        ]}>
        <LinearGradient
          colors={isDark ? ['#e74c3c', '#c0392b'] : ['#e74c3c', '#c0392b']}
          style={styles.header}>
          <View style={styles.headerDecoration1} />
          <View style={styles.headerDecoration2} />
          <View style={styles.headerIconContainer}>
            <Icon name="flag-outline" family="Ionicons" size={50} color="#FFFFFF" />
          </View>
          <Text style={styles.headerTitle}>My Goals</Text>
          <Text style={styles.headerSubtitle}>
            Track your progress & achieve your dreams!
          </Text>
        </LinearGradient>
      </Animated.View>

      {/* Stats Card */}
      <View style={[styles.statsCard, {backgroundColor: colors.card}]}>
        <View style={styles.statItem}>
          <Icon name="flag-outline" family="Ionicons" size={24} color={colors.primary} />
          <Text style={[styles.statValue, {color: colors.text}]}>{goals.length}</Text>
          <Text style={[styles.statLabel, {color: colors.textSecondary}]}>Goals</Text>
        </View>
        <View style={[styles.statDivider, {backgroundColor: colors.border}]} />
        <View style={styles.statItem}>
          <Icon name="trending-up-outline" family="Ionicons" size={24} color={colors.success} />
          <Text style={[styles.statValue, {color: colors.success}]}>{totalProgress}%</Text>
          <Text style={[styles.statLabel, {color: colors.textSecondary}]}>Progress</Text>
        </View>
        <View style={[styles.statDivider, {backgroundColor: colors.border}]} />
        <View style={styles.statItem}>
          <Icon name="checkmark-circle-outline" family="Ionicons" size={24} color={colors.success} />
          <Text style={[styles.statValue, {color: colors.text}]}>
            {goals.reduce((sum, g) => sum + g.milestones.filter((m: any) => m.completed).length, 0)}
          </Text>
          <Text style={[styles.statLabel, {color: colors.textSecondary}]}>Done</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* My Goals Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
              <Icon name="clipboard-outline" family="Ionicons" size={20} color={colors.text} />
              <Text style={[styles.sectionTitle, {color: colors.text}]}>My Goals</Text>
            </View>
            <TouchableOpacity
              style={[styles.addBtn, {backgroundColor: colors.primary}]}
              onPress={openAddModal}>
              <Text style={styles.addBtnText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {goals.map((goal, index) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onPress={() => openDetailModal(goal)}
              onEdit={() => openEditModal(goal)}
              index={index}
              colors={colors}
            />
          ))}

          {goals.length === 0 && (
            <View style={[styles.emptyState, {backgroundColor: colors.card}]}>
              <Icon name="flag-outline" family="Ionicons" size={50} color={colors.primary} />
              <Text style={[styles.emptyTitle, {color: colors.text}]}>No Goals Yet</Text>
              <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
                Set your first goal and start your journey!
              </Text>
            </View>
          )}
        </View>

        {/* Motivation Card */}
        <View style={[styles.motivationCard, {backgroundColor: isDark ? '#27ae6020' : '#E8F8F5'}]}>
          <Icon name="fitness-outline" family="Ionicons" size={40} color={isDark ? '#2ecc71' : '#27ae60'} />
          <Text style={[styles.motivationText, {color: isDark ? '#2ecc71' : '#27ae60'}]}>
            "A goal without a plan is just a wish. Keep pushing forward!"
          </Text>
        </View>

        <View style={{height: SPACING.xxl * 2}} />
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="none"
        onRequestClose={closeAddModal}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closeAddModal}
          />
          <Animated.View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.card,
                transform: [
                  {
                    translateY: modalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [600, 0],
                    }),
                  },
                ],
              },
            ]}>
            <View style={styles.modalHandle} />
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8}}>
              <Icon name="sparkles" family="Ionicons" size={24} color={colors.primary} />
              <Text style={[styles.modalTitle, {color: colors.text}]}>Create New Goal</Text>
            </View>

            {/* Quick Templates */}
            <Text style={[styles.templatesTitle, {color: colors.text}]}>
              Quick Templates
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.templatesContainer}>
              {GOAL_TEMPLATES.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={() => handleSelectTemplate(template)}
                  colors={colors}
                />
              ))}
            </ScrollView>

            {/* Custom Goal */}
            <Text style={[styles.orText, {color: colors.textSecondary}]}>
              — or create custom —
            </Text>
            <View
              style={[
                styles.customInput,
                {backgroundColor: colors.background, borderColor: colors.border},
              ]}>
              <TextInput
                style={[styles.input, {color: colors.text}]}
                placeholder="Enter your goal..."
                placeholderTextColor={colors.textMuted}
                value={newGoalTitle}
                onChangeText={setNewGoalTitle}
              />
            </View>
            
            {/* Deadline Input */}
            <View style={{marginTop: SPACING.sm}}>
              <Text style={[styles.deadlineLabel, {color: colors.textSecondary}]}>
                Set Deadline (optional)
              </Text>
              <View
                style={[
                  styles.customInput,
                  {backgroundColor: colors.background, borderColor: colors.border, flexDirection: 'row', alignItems: 'center'},
                ]}>
                <View style={{marginRight: 8, marginLeft: SPACING.sm}}>
                  <Icon name="calendar-outline" family="Ionicons" size={20} color={colors.textMuted} />
                </View>
                <TextInput
                  style={[styles.input, {color: colors.text, flex: 1}]}
                  placeholder="DD/MM/YYYY (e.g., 15/03/2025)"
                  placeholderTextColor={colors.textMuted}
                  value={newGoalDeadline}
                  onChangeText={setNewGoalDeadline}
                  keyboardType="default"
                />
              </View>
              <Text style={[styles.deadlineHint, {color: colors.textMuted}]}>
                Setting a deadline helps you stay on track!
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.createBtn}
              onPress={handleCreateCustomGoal}>
              <LinearGradient
                colors={['#e74c3c', '#c0392b']}
                style={styles.createBtnGradient}>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                  <Text style={styles.createBtnText}>Create Goal</Text>
                  <Icon name="flag-outline" family="Ionicons" size={18} color="#FFFFFF" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Goal Detail Modal */}
      <Modal
        visible={showDetailModal}
        transparent
        animationType="slide"
        onRequestClose={closeDetailModal}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closeDetailModal}
          />
          <View style={[styles.detailModalContent, {backgroundColor: colors.card}]}>
            <View style={styles.modalHandle} />
            
            {selectedGoal && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Goal Header */}
                <LinearGradient
                  colors={[selectedGoal.color, selectedGoal.color + 'CC']}
                  style={styles.detailHeader}>
                  <Icon name={selectedGoal.iconName} family="Ionicons" size={60} color="#FFFFFF" />
                  <Text style={styles.detailTitle}>{selectedGoal.title}</Text>
                  <View style={styles.detailProgress}>
                    <Text style={styles.detailProgressText}>
                      {selectedGoal.progress}% Complete
                    </Text>
                  </View>
                </LinearGradient>

                {/* Milestones */}
                <View style={styles.milestonesSection}>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.md}}>
                    <Icon name="clipboard-outline" family="Ionicons" size={20} color={colors.text} />
                    <Text style={[styles.milestonesTitle, {color: colors.text, marginBottom: 0}]}>Milestones</Text>
                  </View>
                  {selectedGoal.milestones.map((milestone: any, index: number) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.milestoneCard,
                        {
                          backgroundColor: milestone.completed
                            ? selectedGoal.color + '15'
                            : colors.background,
                          borderColor: milestone.completed
                            ? selectedGoal.color
                            : colors.border,
                        },
                      ]}
                      onPress={() => toggleMilestone(selectedGoal.id, index)}>
                      <View
                        style={[
                          styles.milestoneCheckbox,
                          {
                            backgroundColor: milestone.completed
                              ? selectedGoal.color
                              : 'transparent',
                            borderColor: selectedGoal.color,
                          },
                        ]}>
                        {milestone.completed && (
                          <Icon name="checkmark" family="Ionicons" size={14} color="#FFFFFF" />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.milestoneCardText,
                          {
                            color: colors.text,
                            textDecorationLine: milestone.completed
                              ? 'line-through'
                              : 'none',
                          },
                        ]}>
                        {milestone.text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Deadline */}
                <View style={[styles.deadlineCard, {backgroundColor: colors.background}]}>
                  <View style={{marginRight: SPACING.md}}>
                    <Icon name="calendar-outline" family="Ionicons" size={28} color={colors.primary} />
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={[styles.deadlineLabel, {color: colors.textSecondary}]}>
                      Deadline
                    </Text>
                    <Text style={[styles.deadlineValue, {color: colors.text}]}>
                      {selectedGoal.deadline ? selectedGoal.deadline : 'No deadline set'}
                    </Text>
                  </View>
                </View>

                {/* Edit Goal Button */}
                <TouchableOpacity
                  style={[styles.editGoalBtn, {backgroundColor: colors.primary + '15', borderColor: colors.primary}]}
                  onPress={() => {
                    closeDetailModal();
                    setTimeout(() => openEditModal(selectedGoal), 200);
                  }}>
                  <Icon name="pencil-outline" family="Ionicons" size={20} color={colors.primary} />
                  <Text style={[styles.editGoalText, {color: colors.primary}]}>Edit Goal</Text>
                </TouchableOpacity>

                {/* Mark Complete Button */}
                <TouchableOpacity
                  style={[
                    styles.completeGoalBtn, 
                    {
                      backgroundColor: selectedGoal.completed ? colors.success + '15' : colors.background,
                      borderColor: colors.success,
                    }
                  ]}
                  onPress={() => toggleGoalCompleted(selectedGoal.id)}>
                  <Icon 
                    name={selectedGoal.completed ? "checkmark-circle" : "checkmark-circle-outline"} 
                    family="Ionicons" 
                    size={20} 
                    color={colors.success} 
                  />
                  <Text style={[styles.completeGoalText, {color: colors.success}]}>
                    {selectedGoal.completed ? 'Mark Incomplete' : 'Mark as Complete'}
                  </Text>
                </TouchableOpacity>

                {/* Delete Goal Button */}
                <TouchableOpacity
                  style={[styles.deleteGoalBtn, {backgroundColor: colors.error + '15', borderColor: colors.error}]}
                  onPress={() => handleDeleteGoal(selectedGoal.id)}>
                  <Icon name="trash-outline" family="Ionicons" size={20} color={colors.error} />
                  <Text style={[styles.deleteGoalText, {color: colors.error}]}>Delete Goal</Text>
                </TouchableOpacity>

                <View style={{height: SPACING.xxl}} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Template Deadline Modal */}
      <Modal
        visible={showTemplateDeadlineModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTemplateDeadlineModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowTemplateDeadlineModal(false)}
          />
          <View style={[styles.editModalContent, {backgroundColor: colors.card}]}>
            <View style={styles.modalHandle} />
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: SPACING.md}}>
              <Icon name="calendar-outline" family="Ionicons" size={24} color={colors.primary} />
              <Text style={[styles.modalTitle, {color: colors.text, marginBottom: 0}]}>Set Deadline</Text>
            </View>
            
            {selectedTemplate && (
              <>
                <View style={[styles.templatePreview, {backgroundColor: selectedTemplate.color + '15'}]}>
                  <Icon name={selectedTemplate.iconName} family="Ionicons" size={32} color={selectedTemplate.color} />
                  <Text style={[styles.templatePreviewTitle, {color: colors.text}]}>{selectedTemplate.title}</Text>
                  <Text style={[styles.templatePreviewMeta, {color: colors.textSecondary}]}>
                    Suggested: {selectedTemplate.estimatedDays} days
                  </Text>
                </View>
                
                <Text style={[styles.inputLabel, {color: colors.textSecondary}]}>
                  When do you want to complete this?
                </Text>
                <View
                  style={[
                    styles.customInput,
                    {backgroundColor: colors.background, borderColor: colors.border, flexDirection: 'row', alignItems: 'center'},
                  ]}>
                  <View style={{marginRight: 8, marginLeft: SPACING.sm}}>
                    <Icon name="calendar-outline" family="Ionicons" size={20} color={colors.textMuted} />
                  </View>
                  <TextInput
                    style={[styles.input, {color: colors.text, flex: 1}]}
                    placeholder="DD/MM/YYYY (e.g., 15/03/2025)"
                    placeholderTextColor={colors.textMuted}
                    value={templateDeadline}
                    onChangeText={setTemplateDeadline}
                    keyboardType="default"
                  />
                </View>
                
                <View style={{flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md}}>
                  <TouchableOpacity 
                    style={[styles.cancelBtn, {backgroundColor: colors.background, borderColor: colors.border, flex: 1}]}
                    onPress={() => {
                      setShowTemplateDeadlineModal(false);
                      setSelectedTemplate(null);
                    }}>
                    <Text style={[styles.cancelBtnText, {color: colors.text}]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.saveBtnContainer, {flex: 1}]}
                    onPress={handleCreateFromTemplate}>
                    <LinearGradient
                      colors={[selectedTemplate.color, selectedTemplate.color + 'CC']}
                      style={styles.saveBtn}>
                      <Text style={styles.saveBtnText}>Create Goal</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Edit Goal Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={closeEditModal}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closeEditModal}
          />
          <View style={[styles.editModalContent, {backgroundColor: colors.card}]}>
            <View style={styles.modalHandle} />
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: SPACING.md}}>
              <Icon name="pencil-outline" family="Ionicons" size={24} color={colors.primary} />
              <Text style={[styles.modalTitle, {color: colors.text, marginBottom: 0}]}>Edit Goal</Text>
            </View>
            
            <Text style={[styles.inputLabel, {color: colors.textSecondary}]}>Goal Title</Text>
            <View
              style={[
                styles.customInput,
                {backgroundColor: colors.background, borderColor: colors.border},
              ]}>
              <TextInput
                style={[styles.input, {color: colors.text}]}
                placeholder="Enter goal title..."
                placeholderTextColor={colors.textMuted}
                value={editGoalTitle}
                onChangeText={setEditGoalTitle}
              />
            </View>
            
            <Text style={[styles.inputLabel, {color: colors.textSecondary, marginTop: SPACING.sm}]}>
              Deadline (optional)
            </Text>
            <View
              style={[
                styles.customInput,
                {backgroundColor: colors.background, borderColor: colors.border, flexDirection: 'row', alignItems: 'center'},
              ]}>
              <View style={{marginRight: 8, marginLeft: SPACING.sm}}>
                <Icon name="calendar-outline" family="Ionicons" size={20} color={colors.textMuted} />
              </View>
              <TextInput
                style={[styles.input, {color: colors.text, flex: 1}]}
                placeholder="DD/MM/YYYY (e.g., 15/03/2025)"
                placeholderTextColor={colors.textMuted}
                value={editGoalDeadline}
                onChangeText={setEditGoalDeadline}
                keyboardType="default"
              />
            </View>
            <Text style={[styles.deadlineHint, {color: colors.textMuted}]}>
              Leave empty to remove deadline
            </Text>
            
            <View style={{flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md}}>
              <TouchableOpacity 
                style={[styles.cancelBtn, {backgroundColor: colors.background, borderColor: colors.border, flex: 1}]}
                onPress={closeEditModal}>
                <Text style={[styles.cancelBtnText, {color: colors.text}]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveBtnContainer, {flex: 1}]}
                onPress={handleSaveEdit}>
                <LinearGradient
                  colors={['#4573DF', '#3461C7']}
                  style={styles.saveBtn}>
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backBtn: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  headerContainer: {},
  header: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    borderBottomLeftRadius: RADIUS.xxl,
    borderBottomRightRadius: RADIUS.xxl,
    overflow: 'hidden',
  },
  headerDecoration1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerDecoration2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerIconContainer: {
    marginBottom: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
  },
  statsCard: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    marginTop: -20,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  statDivider: {
    width: 1,
    height: '80%',
    alignSelf: 'center',
  },
  section: {
    padding: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  addBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  addBtnText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  goalCard: {
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  goalIconContainer: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  goalTitleArea: {
    flex: 1,
  },
  goalTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: 2,
  },
  goalDeadline: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  progressCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircleInner: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    zIndex: 1,
  },
  progressCircleBg: {
    position: 'absolute',
    borderWidth: 4,
  },
  progressCircleText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  progressSection: {
    marginBottom: SPACING.sm,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  milestonesPreview: {
    marginBottom: SPACING.sm,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  milestoneCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  checkIcon: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  milestoneText: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  milestonesCount: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  viewBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  viewBtnText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
  },
  motivationCard: {
    marginHorizontal: SPACING.md,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  motivationText: {
    fontSize: TYPOGRAPHY.sizes.md,
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.weight.medium,
    fontStyle: 'italic',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    maxHeight: '70%',
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    padding: SPACING.md,
    paddingTop: SPACING.sm,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  templatesTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: SPACING.sm,
  },
  templatesContainer: {
    gap: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  templateCard: {
    width: 140,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  templateBadgeRow: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  templateTitle: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: 4,
  },
  templateMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  templateMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  templateMilestones: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
  },
  orText: {
    textAlign: 'center',
    marginVertical: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  customInput: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  input: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  deadlineLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: SPACING.xs,
  },
  deadlineHint: {
    fontSize: 11,
    marginTop: -SPACING.sm,
    marginBottom: SPACING.sm,
  },
  createBtn: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  createBtnGradient: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  createBtnText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  // Detail modal
  detailModalContent: {
    maxHeight: '85%',
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    paddingTop: SPACING.sm,
  },
  detailHeader: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  detailTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#fff',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  detailProgress: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  detailProgressText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  milestonesSection: {
    padding: SPACING.md,
  },
  milestonesTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: SPACING.md,
  },
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
  },
  milestoneCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  milestoneCheckIcon: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  milestoneCardText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  deadlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  deadlineValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  deleteGoalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  deleteGoalText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  // New styles for edit and deadline features
  editIconBtn: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  goalDeadlineDate: {
    fontSize: 10,
    marginTop: 2,
  },
  editGoalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  editGoalText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  completeGoalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  completeGoalText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  editModalContent: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.xl,
    borderRadius: RADIUS.xxl,
    padding: SPACING.md,
    paddingTop: SPACING.sm,
  },
  templatePreview: {
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
  },
  templatePreviewTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  templatePreviewMeta: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 4,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: SPACING.xs,
  },
  cancelBtn: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  saveBtnContainer: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  saveBtn: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
});

export default PremiumGoalSettingScreen;

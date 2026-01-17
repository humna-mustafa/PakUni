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

const {width} = Dimensions.get('window');

// Storage key for goals
const GOALS_STORAGE_KEY = '@pakuni_user_goals';

// Goal templates
const GOAL_TEMPLATES = [
  {
    id: 'university',
    title: 'Get into Dream University',
    iconName: 'school-outline',
    color: '#4573DF',
    milestones: [
      'Research university requirements',
      'Achieve required marks in FSc',
      'Prepare for entry test',
      'Submit application',
    ],
  },
  {
    id: 'marks',
    title: 'Improve My Marks',
    iconName: 'book-outline',
    color: '#27ae60',
    milestones: [
      'Create study schedule',
      'Complete daily homework',
      'Take weekly practice tests',
      'Review weak subjects',
    ],
  },
  {
    id: 'scholarship',
    title: 'Get Scholarship',
    iconName: 'trophy-outline',
    color: '#f39c12',
    milestones: [
      'Research scholarship options',
      'Meet eligibility criteria',
      'Prepare application essays',
      'Submit before deadline',
    ],
  },
  {
    id: 'career',
    title: 'Explore Career Options',
    iconName: 'briefcase-outline',
    color: '#9b59b6',
    milestones: [
      'Take career quiz',
      'Research 3 career paths',
      'Talk to professionals',
      'Create action plan',
    ],
  },
];

// Goal type definition
interface GoalMilestone {
  text: string;
  completed: boolean;
}

interface UserGoal {
  id: string;
  title: string;
  iconName: string;
  color: string;
  progress: number;
  deadline: string;
  milestones: GoalMilestone[];
}

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
  index,
  colors,
}: {
  goal: any;
  onPress: () => void;
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
    const deadline = new Date(goal.deadline);
    const today = new Date();
    const diff = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{translateY: slideAnim}, {scale: scaleAnim}],
          opacity: fadeAnim,
        },
      ]}>
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        <View style={[styles.goalCard, {backgroundColor: colors.card}]}>
          <LinearGradient
            colors={[goal.color + '15', 'transparent']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.cardGradient}
          />
          
          <View style={styles.goalHeader}>
            <View style={[styles.goalIconContainer, {backgroundColor: goal.color + '20'}]}>
              <Icon name={goal.iconName} family="Ionicons" size={28} color={goal.color} />
            </View>
            <View style={styles.goalTitleArea}>
              <Text style={[styles.goalTitle, {color: colors.text}]}>{goal.title}</Text>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                <Icon name="time-outline" family="Ionicons" size={12} color={colors.textSecondary} />
                <Text style={[styles.goalDeadline, {color: colors.textSecondary}]}>
                  {getDaysRemaining()} days remaining
                </Text>
              </View>
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
  template: any;
  onSelect: () => void;
  colors: any;
}) => {
  return (
    <TouchableOpacity
      style={[styles.templateCard, {backgroundColor: template.color}]}
      onPress={onSelect}>
      <Icon name={template.iconName} family="Ionicons" size={32} color="#FFFFFF" />
      <Text style={styles.templateTitle}>{template.title}</Text>
      <Text style={styles.templateMilestones}>
        {template.milestones.length} steps
      </Text>
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
        setGoals(JSON.parse(storedGoals));
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
    setGoals(prev =>
      prev.map(g => {
        if (g.id === goalId) {
          const newMilestones = [...g.milestones];
          newMilestones[milestoneIndex].completed = !newMilestones[milestoneIndex].completed;
          const completedCount = newMilestones.filter(m => m.completed).length;
          const newProgress = Math.round((completedCount / newMilestones.length) * 100);
          return {...g, milestones: newMilestones, progress: newProgress};
        }
        return g;
      }),
    );
    if (selectedGoal && selectedGoal.id === goalId) {
      const newMilestones = [...selectedGoal.milestones];
      newMilestones[milestoneIndex].completed = !newMilestones[milestoneIndex].completed;
      const completedCount = newMilestones.filter((m: any) => m.completed).length;
      const newProgress = Math.round((completedCount / newMilestones.length) * 100);
      setSelectedGoal({...selectedGoal, milestones: newMilestones, progress: newProgress});
    }
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
                  onSelect={closeAddModal}
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
            <TouchableOpacity style={styles.createBtn}>
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
                  <View>
                    <Text style={[styles.deadlineLabel, {color: colors.textSecondary}]}>
                      Deadline
                    </Text>
                    <Text style={[styles.deadlineValue, {color: colors.text}]}>
                      {new Date(selectedGoal.deadline).toLocaleDateString('en-PK', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>

                <View style={{height: SPACING.xxl}} />
              </ScrollView>
            )}
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
    fontWeight: '700',
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
    fontWeight: '700',
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
    fontWeight: '700',
  },
  addBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  addBtnText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
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
    fontWeight: '700',
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
    fontWeight: '700',
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
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
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
    fontWeight: '500',
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
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  templatesTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
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
  templateTitle: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
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
    fontWeight: '700',
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
    fontWeight: '700',
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
    fontWeight: '600',
  },
  milestonesSection: {
    padding: SPACING.md,
  },
  milestonesTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
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
  deadlineLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  deadlineValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
});

export default PremiumGoalSettingScreen;

/**
 * My Achievements Screen - Simple User-Reported Achievement Cards
 * 
 * DESIGN: User adds their own achievements (no tracking overhead)
 * - 100% Local Storage (no DB read/write)
 * - User reports what they achieved
 * - Generate shareable cards for social media
 * - No unlock detection complexity
 */

import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../contexts/ThemeContext';
import {SPACING} from '../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../constants/design';
import {Icon} from '../components/icons';
import {
  ACHIEVEMENT_TEMPLATES,
  AchievementTemplate,
  MyAchievement,
  loadMyAchievements,
  addAchievement,
  deleteAchievement,
  shareAchievement,
  getAchievementStats,
} from '../services/achievements';

const {width} = Dimensions.get('window');

// Type colors for visual distinction
const TYPE_COLORS: Record<string, {primary: string; secondary: string}> = {
  entry_test: {primary: '#3B82F6', secondary: '#1D4ED8'},
  merit_list: {primary: '#FFD700', secondary: '#FFA500'},
  admission: {primary: '#10B981', secondary: '#047857'},
  scholarship: {primary: '#F59E0B', secondary: '#D97706'},
  result: {primary: '#8B5CF6', secondary: '#7C3AED'},
  custom: {primary: '#EC4899', secondary: '#DB2777'},
};

// ============================================================================
// COMPONENTS
// ============================================================================

// Achievement Card Component
const AchievementCard = ({
  achievement,
  onPress,
  onDelete,
  onShare,
  colors,
  index,
}: {
  achievement: MyAchievement;
  onPress: () => void;
  onDelete: () => void;
  onShare: () => void;
  colors: any;
  index: number;
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 80,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [index]);

  const typeColor = TYPE_COLORS[achievement.type] || TYPE_COLORS.custom;

  return (
    <Animated.View style={{transform: [{scale: scaleAnim}]}}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={[styles.achievementCard, {backgroundColor: colors.card}]}>
        <LinearGradient
          colors={[typeColor.primary + '15', typeColor.secondary + '05']}
          style={StyleSheet.absoluteFillObject}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
        />

        {/* Left icon */}
        <View style={[styles.cardIconContainer, {backgroundColor: typeColor.primary + '20'}]}>
          <Text style={styles.cardEmoji}>{achievement.icon}</Text>
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, {color: colors.text}]} numberOfLines={1}>
            {achievement.title}
          </Text>
          
          {achievement.universityName && (
            <Text style={[styles.cardSubtitle, {color: colors.textSecondary}]} numberOfLines={1}>
              🏛️ {achievement.universityName}
              {achievement.programName ? ` • ${achievement.programName}` : ''}
            </Text>
          )}
          
          {achievement.testName && !achievement.universityName && (
            <Text style={[styles.cardSubtitle, {color: colors.textSecondary}]} numberOfLines={1}>
              📝 {achievement.testName}
              {achievement.score ? ` • Score: ${achievement.score}` : ''}
            </Text>
          )}

          {achievement.scholarshipName && (
            <Text style={[styles.cardSubtitle, {color: colors.textSecondary}]} numberOfLines={1}>
              🏆 {achievement.scholarshipName}
              {achievement.percentage ? ` • ${achievement.percentage}` : ''}
            </Text>
          )}

          <Text style={[styles.cardDate, {color: colors.textSecondary}]}>
            📅 {achievement.date}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionBtn, {backgroundColor: typeColor.primary}]}
            onPress={onShare}>
            <Icon name="share-social" family="Ionicons" size={16} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, {backgroundColor: colors.error || '#EF4444'}]}
            onPress={onDelete}>
            <Icon name="trash-outline" family="Ionicons" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Template Card for adding new achievement
const TemplateCard = ({
  template,
  onPress,
  colors,
}: {
  template: AchievementTemplate;
  onPress: () => void;
  colors: any;
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.templateCard, {backgroundColor: colors.card}]}>
      <LinearGradient
        colors={template.gradientColors}
        style={styles.templateGradient}>
        <Text style={styles.templateEmoji}>{template.icon}</Text>
      </LinearGradient>
      <Text style={[styles.templateTitle, {color: colors.text}]} numberOfLines={2}>
        {template.title}
      </Text>
    </TouchableOpacity>
  );
};

// Add Achievement Modal
const AddAchievementModal = ({
  visible,
  template,
  onClose,
  onAdd,
  colors,
}: {
  visible: boolean;
  template: AchievementTemplate | null;
  onClose: () => void;
  onAdd: (data: Record<string, string>) => void;
  colors: any;
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const modalAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setFormData({});
      Animated.spring(modalAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(modalAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, modalAnim]);

  if (!template) return null;

  const handleAdd = () => {
    const required = template.fields.filter(f => f.required);
    const missing = required.find(f => !formData[f.key]?.trim());
    
    if (missing) {
      Alert.alert('Required Field', `Please fill in "${missing.label}"`);
      return;
    }
    
    onAdd(formData);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
        
        <Animated.View
          style={[
            styles.addModalContent,
            {
              backgroundColor: colors.card,
              transform: [{scale: modalAnim.interpolate({inputRange: [0, 1], outputRange: [0.9, 1]})}],
              opacity: modalAnim,
            },
          ]}>
          {/* Header */}
          <LinearGradient colors={template.gradientColors} style={styles.addModalHeader}>
            <Text style={styles.addModalEmoji}>{template.icon}</Text>
            <Text style={styles.addModalTitle}>{template.title}</Text>
          </LinearGradient>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" family="Ionicons" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Form */}
          <ScrollView style={styles.addModalForm} showsVerticalScrollIndicator={false}>
            {template.fields.map(field => (
              <View key={field.key} style={styles.formField}>
                <Text style={[styles.fieldLabel, {color: colors.text}]}>
                  {field.label}
                  {field.required && <Text style={{color: '#EF4444'}}> *</Text>}
                </Text>
                <TextInput
                  style={[
                    styles.fieldInput,
                    {
                      backgroundColor: colors.background,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder={field.placeholder}
                  placeholderTextColor={colors.textSecondary}
                  value={formData[field.key] || ''}
                  onChangeText={(text) => setFormData(prev => ({...prev, [field.key]: text}))}
                />
              </View>
            ))}
          </ScrollView>

          {/* Add Button */}
          <TouchableOpacity
            style={[styles.addButton, {backgroundColor: template.gradientColors[0]}]}
            onPress={handleAdd}>
            <Icon name="add-circle" family="Ionicons" size={20} color="#FFF" />
            <Text style={styles.addButtonText}>Add Achievement</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ============================================================================
// MAIN SCREEN
// ============================================================================

const AchievementsScreen = () => {
  const {colors, isDark} = useTheme();
  const navigation = useNavigation();
  const [achievements, setAchievements] = useState<MyAchievement[]>([]);
  const [stats, setStats] = useState({total: 0, byType: {} as Record<string, number>});
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AchievementTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const headerAnim = useRef(new Animated.Value(0)).current;

  // Load achievements
  useEffect(() => {
    loadData();
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [headerAnim]);

  const loadData = async () => {
    try {
      const [loadedAchievements, loadedStats] = await Promise.all([
        loadMyAchievements(),
        getAchievementStats(),
      ]);
      setAchievements(loadedAchievements);
      setStats(loadedStats);
    } catch (error) {
      console.error('Error loading achievements:', error);
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
    Alert.alert(
      'Delete Achievement',
      'Are you sure you want to remove this achievement?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteAchievement(id);
            await loadData();
          },
        },
      ]
    );
  };

  const handleShareAchievement = async (achievement: MyAchievement) => {
    await shareAchievement(achievement);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, {color: colors.text}]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]} edges={['top']}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" family="Ionicons" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      {/* Header */}
      <Animated.View
        style={{
          opacity: headerAnim,
          transform: [{translateY: headerAnim.interpolate({inputRange: [0, 1], outputRange: [-20, 0]})}],
        }}>
        <LinearGradient
          colors={isDark ? ['#6366f1', '#4f46e5'] : ['#818cf8', '#6366f1']}
          style={styles.header}>
          <View style={styles.headerDecoration1} />
          <View style={styles.headerDecoration2} />
          <Icon name="ribbon" family="Ionicons" size={50} color="#FFFFFF" />
          <Text style={styles.headerTitle}>My Achievements</Text>
          <Text style={styles.headerSubtitle}>
            Add your milestones & share with friends
          </Text>
        </LinearGradient>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats Summary */}
        {stats.total > 0 && (
          <View style={[styles.statsCard, {backgroundColor: colors.card}]}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, {color: colors.primary}]}>{stats.total}</Text>
              <Text style={[styles.statLabel, {color: colors.textSecondary}]}>Total</Text>
            </View>
            {Object.entries(stats.byType)
              .filter(([, count]) => count > 0)
              .slice(0, 4)
              .map(([type, count]) => (
                <View key={type} style={styles.statItem}>
                  <Text style={[styles.statNumber, {color: TYPE_COLORS[type]?.primary || colors.text}]}>
                    {count}
                  </Text>
                  <Text style={[styles.statLabel, {color: colors.textSecondary}]}>
                    {type.replace('_', ' ')}
                  </Text>
                </View>
              ))}
          </View>
        )}

        {/* Add New Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: colors.text}]}>
            ➕ Add Achievement
          </Text>
          <Text style={[styles.sectionSubtitle, {color: colors.textSecondary}]}>
            Select what you achieved, fill the details, and share!
          </Text>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.templatesContainer}>
            {ACHIEVEMENT_TEMPLATES.map(template => (
              <TemplateCard
                key={template.type}
                template={template}
                onPress={() => handleSelectTemplate(template)}
                colors={colors}
              />
            ))}
          </ScrollView>
        </View>

        {/* My Achievements List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: colors.text}]}>
            🏆 My Achievements ({achievements.length})
          </Text>
          
          {achievements.length === 0 ? (
            <View style={[styles.emptyState, {backgroundColor: colors.card}]}>
              <Text style={styles.emptyEmoji}>🎯</Text>
              <Text style={[styles.emptyTitle, {color: colors.text}]}>
                No achievements yet
              </Text>
              <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
                Add your first achievement above!{'\n'}
                Share your success with friends 🌟
              </Text>
            </View>
          ) : (
            <View style={styles.achievementsList}>
              {achievements.map((achievement, index) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  onPress={() => handleShareAchievement(achievement)}
                  onDelete={() => handleDeleteAchievement(achievement.id)}
                  onShare={() => handleShareAchievement(achievement)}
                  colors={colors}
                  index={index}
                />
              ))}
            </View>
          )}
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
          <Icon name="information-circle" family="Ionicons" size={24} color={colors.primary} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, {color: colors.text}]}>How it works</Text>
            <Text style={[styles.infoText, {color: colors.textSecondary}]}>
              1. Add your achievement when you accomplish something{'\n'}
              2. Fill in the details (university, score, etc.){'\n'}
              3. Share the card on WhatsApp, Instagram, etc.{'\n'}
              4. All data is stored locally on your device
            </Text>
          </View>
        </View>

        <View style={{height: SPACING.xxl * 2}} />
      </ScrollView>

      {/* Add Achievement Modal */}
      <AddAchievementModal
        visible={showAddModal}
        template={selectedTemplate}
        onClose={() => {
          setShowAddModal(false);
          setSelectedTemplate(null);
        }}
        onAdd={handleAddAchievement}
        colors={colors}
      />
    </SafeAreaView>
  );
};

// ============================================================================
// STYLES
// ============================================================================

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.sizes.md,
  },
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
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: '700',
    color: '#fff',
    marginTop: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 4,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  section: {
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: SPACING.md,
  },
  templatesContainer: {
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  templateCard: {
    width: 100,
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: RADIUS.lg,
  },
  templateGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  templateEmoji: {
    fontSize: 24,
  },
  templateTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    textAlign: 'center',
  },
  achievementsList: {
    gap: SPACING.sm,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  cardIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 2,
  },
  cardDate: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 4,
  },
  cardActions: {
    flexDirection: 'column',
    gap: SPACING.xs,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  addModalContent: {
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    maxHeight: '85%',
  },
  addModalHeader: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    alignItems: 'center',
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
  },
  addModalEmoji: {
    fontSize: 48,
    marginBottom: SPACING.xs,
  },
  addModalTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    color: '#fff',
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    padding: SPACING.xs,
    zIndex: 10,
  },
  addModalForm: {
    padding: SPACING.md,
    maxHeight: 300,
  },
  formField: {
    marginBottom: SPACING.md,
  },
  fieldLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    marginBottom: 6,
  },
  fieldInput: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  addButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: '#fff',
  },
});

export default AchievementsScreen;

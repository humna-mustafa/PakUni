/**
 * UltraAchievementsScreen - Enhanced Achievements with Celebration Animations
 * 
 * Premium achievements experience with:
 * - Celebration particles on achievement display
 * - Sparkle decorations on header
 * - Ambient glow effects
 * - Smooth entrance animations
 * 
 * @author PakUni Team
 * @version 2.0.0
 */

import React from 'react';
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
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../contexts/ThemeContext';
import {SPACING} from '../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../constants/design';
import {Icon} from '../components/icons';
import {PremiumAchievementCard} from '../components/PremiumAchievementCard';
import SearchableDropdown, {
  createUniversityOptionsWithFullNames,
  createScholarshipOptions,
  createEntryTestOptions,
  createProgramOptions,
} from '../components/SearchableDropdown';
import {
  MeritSuccessCard as UltraMeritCard,
  AdmissionCelebrationCard as UltraAdmissionCard,
  TestCompletionCard as UltraTestCard,
  ScholarshipWinCard as UltraScholarshipCard,
} from '../components/UltraPremiumCards';
import {
  SubtleFloatingShapes,
  AmbientGlow,
  SparkleDecoration,
  CelebrationParticles,
  PulseRing,
} from '../components/animations';
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
  entry_test: {primary: '#4573DF', secondary: '#3660C9'},
  merit_list: {primary: '#FFD700', secondary: '#FFA500'},
  admission: {primary: '#10B981', secondary: '#047857'},
  scholarship: {primary: '#F59E0B', secondary: '#D97706'},
  result: {primary: '#4573DF', secondary: '#3660C9'},
  custom: {primary: '#4573DF', secondary: '#3660C9'},
};

// ============================================================================
// ANIMATED TEMPLATE CARD
// ============================================================================

interface TemplateCardProps {
  template: AchievementTemplate;
  onPress: () => void;
  colors: any;
  index: number;
}

class AnimatedTemplateCard extends React.Component<TemplateCardProps> {
  private scale = new Animated.Value(1);
  private opacity = new Animated.Value(0);
  private translateY = new Animated.Value(30);

  componentDidMount() {
    const delay = this.props.index * 100;
    Animated.parallel([
      Animated.timing(this.opacity, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(this.translateY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }

  handlePressIn = () => {
    Animated.spring(this.scale, {
      toValue: 0.95,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  handlePressOut = () => {
    Animated.spring(this.scale, {
      toValue: 1,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  render() {
    const {template, onPress, colors} = this.props;

    return (
      <Animated.View
        style={{
          opacity: this.opacity,
          transform: [{translateY: this.translateY}, {scale: this.scale}],
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={onPress}
          onPressIn={this.handlePressIn}
          onPressOut={this.handlePressOut}
          style={[styles.templateCard, {backgroundColor: colors.card}]}
        >
          <LinearGradient colors={template.gradientColors} style={styles.templateGradient}>
            <Text style={styles.templateEmoji}>{template.icon}</Text>
          </LinearGradient>
          <Text style={[styles.templateTitle, {color: colors.text}]} numberOfLines={2}>
            {template.title}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }
}

// ============================================================================
// ANIMATED STATS CARD
// ============================================================================

interface StatsCardProps {
  stats: {total: number; byType: Record<string, number>};
  colors: any;
}

class AnimatedStatsCard extends React.Component<StatsCardProps> {
  private scale = new Animated.Value(0.9);
  private opacity = new Animated.Value(0);

  componentDidMount() {
    Animated.parallel([
      Animated.spring(this.scale, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(this.opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }

  render() {
    const {stats, colors} = this.props;

    if (stats.total === 0) return null;

    return (
      <Animated.View
        style={[
          styles.statsCard,
          {backgroundColor: colors.card},
          {
            opacity: this.opacity,
            transform: [{scale: this.scale}],
          },
        ]}
      >
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
      </Animated.View>
    );
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface UltraAchievementsScreenProps {
  navigation: any;
}

interface UltraAchievementsScreenState {
  achievements: MyAchievement[];
  stats: {total: number; byType: Record<string, number>};
  isLoading: boolean;
  selectedTemplate: AchievementTemplate | null;
  showAddModal: boolean;
  formData: Record<string, string>;
  showCelebration: boolean;
}

export class UltraAchievementsScreen extends React.Component<
  UltraAchievementsScreenProps,
  UltraAchievementsScreenState
> {
  private headerAnim = new Animated.Value(0);

  constructor(props: UltraAchievementsScreenProps) {
    super(props);
    this.state = {
      achievements: [],
      stats: {total: 0, byType: {}},
      isLoading: true,
      selectedTemplate: null,
      showAddModal: false,
      formData: {},
      showCelebration: false,
    };
  }

  componentDidMount() {
    this.loadData();
    
    // Header entrance animation
    Animated.spring(this.headerAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }

  loadData = async () => {
    try {
      const [loadedAchievements, loadedStats] = await Promise.all([
        loadMyAchievements(),
        getAchievementStats(),
      ]);
      this.setState({
        achievements: loadedAchievements,
        stats: loadedStats,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error loading achievements:', error);
      this.setState({isLoading: false});
    }
  };

  handleSelectTemplate = (template: AchievementTemplate) => {
    this.setState({
      selectedTemplate: template,
      showAddModal: true,
      formData: {},
    });
  };

  handleAddAchievement = async () => {
    const {selectedTemplate, formData} = this.state;
    if (!selectedTemplate) return;

    const required = selectedTemplate.fields.filter(f => f.required);
    const missing = required.find(f => !formData[f.key]?.trim());

    if (missing) {
      Alert.alert('Required Field', `Please fill in "${missing.label}"`);
      return;
    }

    try {
      await addAchievement(selectedTemplate, formData);
      this.setState({showAddModal: false, showCelebration: true});
      await this.loadData();
      
      // Auto-hide celebration after animation
      setTimeout(() => {
        this.setState({showCelebration: false});
      }, 3000);
    } catch (error) {
      Alert.alert('Error', 'Failed to add achievement');
    }
  };

  handleDeleteAchievement = (id: string) => {
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
            await this.loadData();
          },
        },
      ]
    );
  };

  renderAchievementCard = (achievement: MyAchievement) => {
    switch (achievement.type) {
      case 'merit_list':
        return (
          <UltraMeritCard
            achievement={achievement}
            showActions={true}
            showCustomizer={true}
            onShareComplete={() => {}}
          />
        );
      case 'admission':
        return (
          <UltraAdmissionCard
            achievement={achievement}
            showActions={true}
            showCustomizer={true}
            onShareComplete={() => {}}
          />
        );
      case 'entry_test':
        return (
          <UltraTestCard
            achievement={achievement}
            showActions={true}
            showCustomizer={true}
            onShareComplete={() => {}}
          />
        );
      case 'scholarship':
        return (
          <UltraScholarshipCard
            achievement={achievement}
            showActions={true}
            showCustomizer={true}
            onShareComplete={() => {}}
          />
        );
      default:
        return (
          <PremiumAchievementCard
            achievement={achievement}
            showSaveButton={true}
            onShareComplete={() => {}}
          />
        );
    }
  };

  render() {
    const {navigation} = this.props;
    const {achievements, stats, isLoading, showCelebration} = this.state;

    return (
      <ThemeConsumer>
        {({colors, isDark}) => (
          <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]} edges={['top']}>
            {/* Background Decorations */}
            <AmbientGlow
              primaryColor={colors.primary}
              position="top"
              intensity={0.08}
            />
            
            <SubtleFloatingShapes
              colors={['#FFD70020', '#F59E0B15', colors.primary + '15']}
              opacity={0.05}
              count={4}
            />

            {/* Celebration Particles on Achievement Add */}
            <CelebrationParticles
              colors={['#FFD700', '#F59E0B', '#10B981', colors.primary]}
              active={showCelebration}
              intensity="high"
            />

            {/* Back Button */}
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" family="Ionicons" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Animated Header */}
            <Animated.View
              style={{
                opacity: this.headerAnim,
                transform: [
                  {
                    translateY: this.headerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  },
                ],
              }}
            >
              <LinearGradient
                colors={isDark ? [colors.primary, colors.primaryDark || '#3660C9'] : [colors.primaryLight || '#6B93F0', colors.primary]}
                style={styles.header}
              >
                {/* Header Decorations */}
                <View style={styles.headerDecoration1} />
                <View style={styles.headerDecoration2} />
                
                {/* Sparkles on Header */}
                <SparkleDecoration
                  color="#FFFFFF"
                  count={5}
                  size={3}
                  area={{top: 0, height: 120}}
                />
                
                {/* Pulse Ring behind icon */}
                <View style={styles.headerIconWrapper}>
                  <PulseRing color="rgba(255,255,255,0.3)" size={80} delay={0} />
                  <Icon name="ribbon" family="Ionicons" size={50} color="#FFFFFF" />
                </View>
                
                <Text style={styles.headerTitle}>My Achievements</Text>
                <Text style={styles.headerSubtitle}>
                  Add your milestones & share with friends
                </Text>
              </LinearGradient>
            </Animated.View>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={[styles.loadingText, {color: colors.text}]}>Loading...</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Stats Summary */}
                <AnimatedStatsCard stats={stats} colors={colors} />

                {/* Add New Section */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, {color: colors.text}]}>➕ Add Achievement</Text>
                  <Text style={[styles.sectionSubtitle, {color: colors.textSecondary}]}>
                    Select what you achieved, fill the details, and share!
                  </Text>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.templatesContainer}
                  >
                    {ACHIEVEMENT_TEMPLATES.map((template, index) => (
                      <AnimatedTemplateCard
                        key={template.type}
                        template={template}
                        onPress={() => this.handleSelectTemplate(template)}
                        colors={colors}
                        index={index}
                      />
                    ))}
                  </ScrollView>
                </View>

                {/* Achievements List */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Icon name="trophy" family="Ionicons" size={20} color="#F59E0B" />
                    <Text style={[styles.sectionTitle, {color: colors.text}]}>
                      My Achievements ({achievements.length})
                    </Text>
                  </View>

                  {achievements.length === 0 ? (
                    <View style={[styles.emptyState, {backgroundColor: colors.card}]}>
                      <Icon name="ribbon-outline" family="Ionicons" size={48} color="#F59E0B" />
                      <Text style={[styles.emptyTitle, {color: colors.text}]}>No achievements yet</Text>
                      <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
                        Add your first achievement above! Share your success with friends ⭐
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.achievementsList}>
                      {achievements.map((achievement) => (
                        <View key={achievement.id}>
                          {this.renderAchievementCard(achievement)}
                          <TouchableOpacity
                            style={[styles.deleteBtn, {backgroundColor: colors.error || '#EF4444'}]}
                            onPress={() => this.handleDeleteAchievement(achievement.id)}
                          >
                            <Icon name="trash-outline" family="Ionicons" size={18} color="#FFF" />
                            <Text style={styles.deleteBtnText}>Delete</Text>
                          </TouchableOpacity>
                        </View>
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
                      3. Share the card as an image on WhatsApp, Instagram, etc.{'\n'}
                      4. Save cards to your device for later sharing{'\n'}
                      5. All data is stored locally on your device
                    </Text>
                  </View>
                </View>

                <View style={{height: 100}} />
              </ScrollView>
            )}

            {/* Add Achievement Modal - Using existing AddAchievementModal logic */}
            {this.renderAddModal(colors)}
          </SafeAreaView>
        )}
      </ThemeConsumer>
    );
  }

  renderAddModal = (colors: any) => {
    const {showAddModal, selectedTemplate, formData} = this.state;
    if (!selectedTemplate) return null;

    return (
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => this.setState({showAddModal: false})}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => this.setState({showAddModal: false})}
          />
          <View style={[styles.addModalContent, {backgroundColor: colors.background}]}>
            <LinearGradient colors={selectedTemplate.gradientColors} style={styles.addModalHeader}>
              <View style={styles.headerDecor1} />
              <View style={styles.headerDecor2} />
              <Text style={styles.addModalEmoji}>{selectedTemplate.icon}</Text>
              <Text style={styles.addModalTitle}>{selectedTemplate.title}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => this.setState({showAddModal: false})}
              >
                <Icon name="close" family="Ionicons" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={styles.addModalForm}>
              {selectedTemplate.fields.map((field) => (
                <View key={field.key} style={styles.formField}>
                  <Text style={[styles.fieldLabel, {color: colors.text}]}>
                    {field.label} {field.required && '*'}
                  </Text>
                  <TextInput
                    style={[
                      styles.fieldInput,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.placeholder}
                    value={formData[field.key] || ''}
                    onChangeText={(text) =>
                      this.setState({formData: {...formData, [field.key]: text}})
                    }
                  />
                </View>
              ))}

              <TouchableOpacity
                style={styles.addButton}
                onPress={this.handleAddAchievement}
              >
                <LinearGradient
                  colors={selectedTemplate.gradientColors}
                  style={styles.addButtonGradient}
                >
                  <Icon name="add-circle" family="Ionicons" size={20} color="#FFFFFF" />
                  <Text style={styles.addButtonText}>Add Achievement</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };
}

// Theme Consumer wrapper for class component
class ThemeConsumer extends React.Component<{
  children: (theme: {colors: any; isDark: boolean}) => React.ReactNode;
}> {
  render() {
    return (
      <ThemeContextConsumer>
        {(value) => this.props.children(value || {colors: {}, isDark: false})}
      </ThemeContextConsumer>
    );
  }
}

// Import the consumer from ThemeContext
import {ThemeContext} from '../contexts/ThemeContext';
const ThemeContextConsumer = ThemeContext.Consumer;

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 100,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  headerIconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: SPACING.sm,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  headerDecoration1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerDecoration2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  section: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 4,
  },
  templatesContainer: {
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  templateCard: {
    width: 100,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  templateGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  templateEmoji: {
    fontSize: 28,
  },
  templateTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '500',
    textAlign: 'center',
  },
  achievementsList: {
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.xs,
    gap: SPACING.xs,
    alignSelf: 'flex-end',
  },
  deleteBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.md,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    marginTop: SPACING.sm,
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
    marginTop: SPACING.lg,
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
    overflow: 'hidden',
    position: 'relative',
  },
  headerDecor1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  headerDecor2: {
    position: 'absolute',
    bottom: -10,
    left: -10,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
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
    maxHeight: 400,
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
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.xs,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: TYPOGRAPHY.sizes.md,
  },
});

export default UltraAchievementsScreen;

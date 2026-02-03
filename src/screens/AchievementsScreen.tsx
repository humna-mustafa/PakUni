/**
 * My Achievements Screen - Simple User-Reported Achievement Cards
 * 
 * DESIGN: User adds their own achievements (no tracking overhead)
 * - 100% Local Storage (no DB read/write)
 * - User reports what they achieved
 * - Generate shareable cards for social media
 * - No unlock detection complexity
 * 
 * ENHANCED: Premium animations, floating effects, polished UI
 */

import React, {useState, useEffect, useRef, useMemo} from 'react';
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
  Easing,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../contexts/ThemeContext';
import {SPACING} from '../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../constants/design';
import {ANIMATION_SCALES, SPRING_CONFIGS} from '../constants/ui';
import {Icon} from '../components/icons';
import {logger} from '../utils/logger';
import {PremiumAchievementCard} from '../components/PremiumAchievementCard';
import SearchableDropdown, {
  createUniversityOptions,
  createUniversityOptionsWithFullNames,
  createScholarshipOptions,
  createEntryTestOptions,
  createProgramOptions,
  DropdownOption,
} from '../components/SearchableDropdown';
import {
  MeritSuccessCard as UltraMeritCard,
  AdmissionCelebrationCard as UltraAdmissionCard,
  TestCompletionCard as UltraTestCard,
  ScholarshipWinCard as UltraScholarshipCard,
} from '../components/UltraPremiumCards';
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
// COMPONENTS (ENHANCED)
// ============================================================================

// Template Card for adding new achievement - ENHANCED with animations
const TemplateCard = ({
  template,
  onPress,
  colors,
  index = 0,
}: {
  template: AchievementTemplate;
  onPress: () => void;
  colors: any;
  index?: number;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance animation
    const delay = index * 100;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle shimmer effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          delay: index * 200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [index]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: ANIMATION_SCALES.CHIP_PRESS,
      useNativeDriver: true,
      ...SPRING_CONFIGS.snappy,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...SPRING_CONFIGS.responsive,
    }).start();
  };

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  return (
    <Animated.View
      style={{
        transform: [{scale: scaleAnim}, {translateX: slideAnim}],
        opacity: fadeAnim,
      }}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.templateCard, {backgroundColor: colors.card}]}>
        <LinearGradient
          colors={template.gradientColors}
          style={styles.templateGradient}>
          {/* Shimmer overlay */}
          <Animated.View 
            style={[
              styles.templateShimmer, 
              {opacity: shimmerOpacity, backgroundColor: '#FFFFFF'}
            ]} 
          />
          <Text style={styles.templateEmoji}>{template.icon}</Text>
        </LinearGradient>
        <Text style={[styles.templateTitle, {color: colors.text}]} numberOfLines={2}>
          {template.title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
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

  // Memoize options to avoid recalculation
  const universityOptions = useMemo(() => createUniversityOptionsWithFullNames(), []);
  const scholarshipOptions = useMemo(() => createScholarshipOptions(), []);
  const entryTestOptions = useMemo(() => createEntryTestOptions(), []);
  const programOptions = useMemo(() => createProgramOptions(), []);

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

  // Determine which dropdown to show based on field key and template type
  const getFieldComponent = (field: typeof template.fields[0]) => {
    const fieldKey = field.key.toLowerCase();
    
    // University field - show university dropdown
    if (fieldKey === 'universityname') {
      // Find current option by label/name to display correct selection
      const currentOption = universityOptions.find(opt => 
        opt.label === formData[field.key] || 
        opt.metadata?.name === formData[field.key]
      );
      return (
        <SearchableDropdown
          label={field.label + (field.required ? ' *' : '')}
          placeholder={field.placeholder}
          options={universityOptions}
          value={currentOption?.value}
          onSelect={(option, value) => {
            // Use the full university name from metadata
            const displayName = option.metadata?.name || option.label;
            setFormData(prev => ({...prev, [field.key]: displayName}));
          }}
          allowCustom
          customPlaceholder="Type custom university name..."
          onCustomEntry={(text) => setFormData(prev => ({...prev, [field.key]: text}))}
          showLogos
        />
      );
    }
    
    // Test name field - show entry test dropdown
    if (fieldKey === 'testname' && (template.type === 'entry_test' || template.type === 'result')) {
      // Find current option by label to display correct selection
      const currentOption = entryTestOptions.find(opt => opt.label === formData[field.key]);
      return (
        <SearchableDropdown
          label={field.label + (field.required ? ' *' : '')}
          placeholder={field.placeholder}
          options={entryTestOptions}
          value={currentOption?.value}
          onSelect={(option, value) => {
            setFormData(prev => ({...prev, [field.key]: option.label}));
          }}
          allowCustom
          customPlaceholder="Type custom test/exam name..."
          onCustomEntry={(text) => setFormData(prev => ({...prev, [field.key]: text}))}
        />
      );
    }
    
    // Program name field - show program dropdown
    if (fieldKey === 'programname') {
      // Program options use value as the display text, so just pass through
      return (
        <SearchableDropdown
          label={field.label + (field.required ? ' *' : '')}
          placeholder={field.placeholder}
          options={programOptions}
          value={formData[field.key]}
          onSelect={(option, value) => {
            setFormData(prev => ({...prev, [field.key]: option.value}));
          }}
          allowCustom
          customPlaceholder="Type custom program name..."
          onCustomEntry={(text) => setFormData(prev => ({...prev, [field.key]: text}))}
        />
      );
    }
    
    // Scholarship name field - show scholarship dropdown
    if (fieldKey === 'scholarshipname') {
      // Find current option by label to display correct selection
      const currentOption = scholarshipOptions.find(opt => opt.label === formData[field.key]);
      return (
        <SearchableDropdown
          label={field.label + (field.required ? ' *' : '')}
          placeholder={field.placeholder}
          options={scholarshipOptions}
          value={currentOption?.value}
          onSelect={(option, value) => {
            setFormData(prev => ({...prev, [field.key]: option.label}));
          }}
          allowCustom
          customPlaceholder="Type custom scholarship name..."
          onCustomEntry={(text) => setFormData(prev => ({...prev, [field.key]: text}))}
        />
      );
    }
    
    // Default: Regular text input for other fields
    return (
      <View>
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
    );
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
          {/* Header with 3D decoration */}
          <LinearGradient colors={template.gradientColors} style={styles.addModalHeader}>
            {/* Decorative elements */}
            <View style={styles.headerDecor1} />
            <View style={styles.headerDecor2} />
            <View style={styles.headerDecor3} />
            <Text style={styles.addModalEmoji}>{template.icon}</Text>
            <Text style={styles.addModalTitle}>{template.title}</Text>
            {/* Sparkle decorations */}
            <View style={styles.sparkleContainer}>
              <Text style={styles.sparkle}>✨</Text>
              <Text style={[styles.sparkle, styles.sparkle2]}>⭐</Text>
              <Text style={[styles.sparkle, styles.sparkle3]}>💫</Text>
            </View>
          </LinearGradient>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" family="Ionicons" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Form with searchable dropdowns */}
          <ScrollView style={styles.addModalForm} showsVerticalScrollIndicator={false}>
            {/* Helpful tip */}
            <View style={[styles.tipCard, {backgroundColor: colors.primaryLight + '20'}]}>
              <Icon name="bulb-outline" family="Ionicons" size={16} color={colors.primary} />
              <Text style={[styles.tipText, {color: colors.primary}]}>
                Search from list or type custom name
              </Text>
            </View>
            
            {template.fields.map(field => (
              <View key={field.key} style={styles.formField}>
                {getFieldComponent(field)}
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
// MAIN SCREEN (ENHANCED)
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
  const floatAnim = useRef(new Animated.Value(0)).current;
  const trophyRotate = useRef(new Animated.Value(0)).current;

  // Load achievements
  useEffect(() => {
    loadData();
    
    // Header entrance animation
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Floating animation for decorative elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Trophy subtle rotation
    Animated.loop(
      Animated.sequence([
        Animated.timing(trophyRotate, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(trophyRotate, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const floatTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const trophyRotateZ = trophyRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-5deg', '5deg'],
  });

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
      {/* Enhanced Header with floating trophy */}
      <Animated.View
        style={{
          opacity: headerAnim,
          transform: [{translateY: headerAnim.interpolate({inputRange: [0, 1], outputRange: [-20, 0]})}],
        }}>
        <LinearGradient
          colors={isDark ? [colors.primary, colors.primaryDark] : [colors.primaryLight, colors.primary]}
          style={styles.header}>
          <View style={styles.headerDecoration1} />
          <View style={styles.headerDecoration2} />
          {/* Floating, rotating trophy */}
          <Animated.View 
            style={{
              transform: [
                {translateY: floatTranslateY},
                {rotate: trophyRotateZ}
              ]
            }}>
            <Icon name="ribbon" family="Ionicons" size={50} color="#FFFFFF" />
          </Animated.View>
          <Text style={styles.headerTitle}>My Achievements</Text>
          <Text style={styles.headerSubtitle}>
            Add your milestones & share with friends
          </Text>
          {/* Floating sparkles */}
          <Animated.View style={[styles.floatingSparkle1, {transform: [{translateY: floatTranslateY}]}]}>
            <Text style={{fontSize: 16}}>✨</Text>
          </Animated.View>
          <Animated.View style={[styles.floatingSparkle2, {transform: [{translateY: Animated.multiply(floatTranslateY, -1)}]}]}>
            <Text style={{fontSize: 14}}>⭐</Text>
          </Animated.View>
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
            {ACHIEVEMENT_TEMPLATES.map((template, index) => (
              <TemplateCard
                key={template.type}
                template={template}
                onPress={() => handleSelectTemplate(template)}
                colors={colors}
                index={index}
              />
            ))}
          </ScrollView>
        </View>

        {/* My Achievements List */}
        <View style={styles.section}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            <Icon name="trophy" family="Ionicons" size={20} color="#F59E0B" />
            <Text style={[styles.sectionTitle, {color: colors.text}]}>
              My Achievements ({achievements.length})
            </Text>
          </View>
          
          {achievements.length === 0 ? (
            <View style={[styles.emptyState, {backgroundColor: colors.card}]}>
              <Icon name="ribbon-outline" family="Ionicons" size={48} color="#F59E0B" />
              <Text style={[styles.emptyTitle, {color: colors.text}]}>
                No achievements yet
              </Text>
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, flexWrap: 'wrap'}}>
                <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
                  Add your first achievement above!{' '}
                  Share your success with friends
                </Text>
                <Icon name="star" family="Ionicons" size={14} color="#F59E0B" />
              </View>
            </View>
          ) : (
            <View style={styles.achievementsList}>
              {achievements.map((achievement, index) => (
                <View key={achievement.id}>
                  {/* Ultra Premium Cards - Designer Grade with Customizer */}
                  {achievement.type === 'merit_list' && (
                    <UltraMeritCard
                      achievement={achievement}
                      showActions={true}
                      showCustomizer={true}
                      onShareComplete={() => {}}
                    />
                  )}
                  {achievement.type === 'admission' && (
                    <UltraAdmissionCard
                      achievement={achievement}
                      showActions={true}
                      showCustomizer={true}
                      onShareComplete={() => {}}
                    />
                  )}
                  {achievement.type === 'entry_test' && (
                    <UltraTestCard
                      achievement={achievement}
                      showActions={true}
                      showCustomizer={true}
                      onShareComplete={() => {}}
                    />
                  )}
                  {achievement.type === 'scholarship' && (
                    <UltraScholarshipCard
                      achievement={achievement}
                      showActions={true}
                      showCustomizer={true}
                      onShareComplete={() => {}}
                    />
                  )}
                  {/* Fallback for other types */}
                  {!['merit_list', 'admission', 'entry_test', 'scholarship'].includes(achievement.type) && (
                    <PremiumAchievementCard
                      achievement={achievement}
                      showSaveButton={true}
                      onShareComplete={() => {}}
                    />
                  )}
                  
                  {/* Delete button */}
                  <TouchableOpacity
                    style={[styles.deleteBtn, {backgroundColor: colors.error || '#EF4444'}]}
                    onPress={() => handleDeleteAchievement(achievement.id)}>
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
  floatingSparkle1: {
    position: 'absolute',
    top: 20,
    right: 30,
  },
  floatingSparkle2: {
    position: 'absolute',
    bottom: 30,
    left: 40,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weight.bold,
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
    fontWeight: TYPOGRAPHY.weight.bold,
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
    fontWeight: TYPOGRAPHY.weight.bold,
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
    overflow: 'hidden',
  },
  templateShimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  templateEmoji: {
    fontSize: 24,
  },
  templateTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
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
    fontWeight: TYPOGRAPHY.weight.semibold,
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
    fontWeight: TYPOGRAPHY.weight.semibold,
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
    fontWeight: TYPOGRAPHY.weight.semibold,
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
  // 3D decorative elements for modal header
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
  headerDecor3: {
    position: 'absolute',
    top: 20,
    left: 30,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  sparkleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  sparkle: {
    position: 'absolute',
    fontSize: 14,
    top: 15,
    right: 25,
  },
  sparkle2: {
    top: 35,
    right: 50,
    fontSize: 10,
  },
  sparkle3: {
    top: 20,
    left: 30,
    fontSize: 12,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  tipText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  addModalEmoji: {
    fontSize: 48,
    marginBottom: SPACING.xs,
  },
  addModalTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
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
    fontWeight: TYPOGRAPHY.weight.semibold,
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
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#fff',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  deleteBtnText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
});

export default AchievementsScreen;



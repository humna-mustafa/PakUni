import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {SPACING, FONTS} from '../constants/theme';
import {Icon} from '../components/icons';
import {TYPOGRAPHY, RADIUS} from '../constants/design';
import {useTheme} from '../contexts/ThemeContext';
import {CAREER_FIELDS, CareerField} from '../data';

const {width} = Dimensions.get('window');

// Career categories
const CATEGORIES = ['All', 'Technology', 'Healthcare', 'Business', 'Engineering', 'Creative'];

// Helper to derive category from career field
const getCareerCategory = (career: CareerField): string => {
  const id = career.id.toLowerCase();
  const name = career.name.toLowerCase();
  
  if (id.includes('software') || id.includes('data') || id.includes('cyber') || id.includes('ai') || id.includes('web') || name.includes('tech')) {
    return 'Technology';
  }
  if (id.includes('medicine') || id.includes('dentistry') || id.includes('pharmacy') || id.includes('nursing') || id.includes('health') || name.includes('doctor')) {
    return 'Healthcare';
  }
  if (id.includes('business') || id.includes('finance') || id.includes('banking') || id.includes('accounting') || id.includes('marketing') || id.includes('hr')) {
    return 'Business';
  }
  if (id.includes('engineering') || id.includes('civil') || id.includes('mechanical') || id.includes('electrical') || id.includes('chemical')) {
    return 'Engineering';
  }
  if (id.includes('design') || id.includes('art') || id.includes('media') || id.includes('fashion') || id.includes('architecture')) {
    return 'Creative';
  }
  return 'Other';
};

// Salary bar component
const SalaryBar = ({
  min,
  max,
  label,
  colors,
}: {
  min: number;
  max: number;
  label: string;
  colors: any;
}) => {
  const animWidth = useRef(new Animated.Value(0)).current;
  const maxSalary = 500000; // Max salary for scale

  useEffect(() => {
    Animated.timing(animWidth, {
      toValue: (max / maxSalary) * 100,
      duration: 800,
      delay: 200,
      useNativeDriver: false,
    }).start();
  }, [max]);

  return (
    <View style={styles.salaryBar}>
      <Text style={[styles.salaryLabel, {color: colors.textSecondary}]}>{label}</Text>
      <View style={styles.salaryTrack}>
        <Animated.View
          style={[
            styles.salaryFill,
            {
              width: animWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}>
          <LinearGradient
            colors={['#27ae60', '#2ecc71']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.salaryGradient}
          />
        </Animated.View>
      </View>
      <Text style={[styles.salaryValue, {color: colors.success}]}>
        {min / 1000}K - {max / 1000}K
      </Text>
    </View>
  );
};

// Career card component
const CareerCard = ({
  career,
  onPress,
  index,
  colors,
}: {
  career: any;
  onPress: () => void;
  index: number;
  colors: any;
}) => {
  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 450,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Technology':
        return '#3498db';
      case 'Healthcare':
        return '#e74c3c';
      case 'Business':
        return '#9b59b6';
      case 'Engineering':
        return '#e67e22';
      case 'Creative':
        return '#1abc9c';
      default:
        return '#27ae60';
    }
  };

  const category = getCareerCategory(career);
  const categoryColor = getCategoryColor(category);

  return (
    <Animated.View
      style={[
        {
          transform: [{translateY: slideAnim}, {scale: scaleAnim}],
          opacity: fadeAnim,
        },
      ]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}>
        <View style={[styles.careerCard, {backgroundColor: colors.card}]}>
          <LinearGradient
            colors={[categoryColor + '10', 'transparent']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.cardGradient}
          />
          
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, {backgroundColor: (career.iconColor || categoryColor) + '20'}]}>
              <Icon name={career.iconName || 'briefcase'} family="Ionicons" size={28} color={career.iconColor || categoryColor} />
            </View>
            <View style={styles.cardTitleArea}>
              <Text style={[styles.careerName, {color: colors.text}]}>
                {career.name}
              </Text>
              <View style={[styles.categoryBadge, {backgroundColor: categoryColor + '20'}]}>
                <Text style={[styles.categoryText, {color: categoryColor}]}>
                  {category}
                </Text>
              </View>
            </View>
            <View style={styles.demandIndicator}>
              <Icon name="flame-outline" family="Ionicons" size={16} color={colors.success} />
              <Text style={[styles.demandText, {color: colors.success}]}>
                {career.demand_trend || 'High'}
              </Text>
            </View>
          </View>

          <Text
            style={[styles.careerDescription, {color: colors.textSecondary}]}
            numberOfLines={2}>
            {career.description}
          </Text>

          {/* Skills */}
          <View style={styles.skillsContainer}>
            {(career.skills || ['Problem Solving', 'Communication', 'Technical']).slice(0, 3).map((skill: string, i: number) => (
              <View key={i} style={[styles.skillChip, {backgroundColor: colors.background}]}>
                <Text style={[styles.skillText, {color: colors.textSecondary}]}>
                  {skill}
                </Text>
              </View>
            ))}
          </View>

          {/* Salary Range */}
          <View style={styles.salarySection}>
            <View style={styles.salaryTitleRow}>
              <Icon name="wallet-outline" family="Ionicons" size={14} color={colors.text} />
              <Text style={[styles.salaryTitle, {color: colors.text}]}> Salary Range</Text>
            </View>
            <View style={styles.salaryBarContainer}>
              <View style={[styles.salaryTrackBg, {backgroundColor: colors.background}]}>
                <LinearGradient
                  colors={['#27ae60', '#2ecc71']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={[styles.salaryProgress, {width: `${(career.maxSalary || 200000) / 5000}%`}]}
                />
              </View>
              <Text style={[styles.salaryAmount, {color: colors.success}]}>
                {((career.minSalary || 50000) / 1000).toFixed(0)}K - {((career.maxSalary || 200000) / 1000).toFixed(0)}K PKR/month
              </Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.metaItem}>
              <Icon name="school-outline" family="Ionicons" size={14} color={colors.textSecondary} />
              <Text style={[styles.metaText, {color: colors.textSecondary}]}>
                {career.education || 'Bachelor\'s'}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="time-outline" family="Ionicons" size={14} color={colors.textSecondary} />
              <Text style={[styles.metaText, {color: colors.textSecondary}]}>
                {career.duration || '4 years'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.exploreBtn, {backgroundColor: categoryColor, flexDirection: 'row', alignItems: 'center'}]}
              onPress={onPress}>
              <Text style={[styles.exploreBtnText, {marginRight: 4}]}>Explore</Text>
              <Icon name="arrow-forward" family="Ionicons" size={12} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const PremiumCareerGuidanceScreen = () => {
  const {colors, isDark} = useTheme();
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedCareer, setSelectedCareer] = useState<any>(null);
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
    (career: CareerField) => activeFilter === 'All' || getCareerCategory(career) === activeFilter,
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

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}
      edges={['top']}>
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
          colors={isDark ? ['#0F172A', '#134E4A', '#10B981'] : ['#10B981', '#059669', '#047857']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.header}>
          <View style={styles.headerDecoration1} />
          <View style={styles.headerDecoration2} />
          <View style={styles.headerDecoration3} />
          <View style={styles.headerEmojiContainer}>
            <Icon name="compass-outline" family="Ionicons" size={48} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Career Guidance</Text>
          <Text style={styles.headerSubtitle}>
            Find your perfect career path
          </Text>
        </LinearGradient>
      </Animated.View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}>
          {CATEGORIES.map(category => {
            const isActive = activeFilter === category;
            return (
              <TouchableOpacity
                key={category}
                onPress={() => setActiveFilter(category)}>
                {isActive ? (
                  <LinearGradient
                    colors={['#1abc9c', '#16a085']}
                    style={styles.filterChip}>
                    <Text style={styles.filterChipTextActive}>{category}</Text>
                  </LinearGradient>
                ) : (
                  <View
                    style={[
                      styles.filterChip,
                      {backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1},
                    ]}>
                    <Text style={[styles.filterChipText, {color: colors.textSecondary}]}>
                      {category}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Results count */}
      <View style={styles.resultsBar}>
        <Text style={[styles.resultsText, {color: colors.text}]}>
          <Text style={{fontWeight: '700'}}>{filteredCareers.length}</Text> careers found
        </Text>
      </View>

      {/* Careers List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.careersContainer}>
        {filteredCareers.map((career: CareerField, index: number) => (
          <CareerCard
            key={career.id}
            career={career}
            onPress={() => openModal(career)}
            index={index}
            colors={colors}
          />
        ))}
        <View style={{height: SPACING.xxl * 2}} />
      </ScrollView>

      {/* Career Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closeModal}
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
            
            {selectedCareer && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Modal Header */}
                <LinearGradient
                  colors={
                    getCareerCategory(selectedCareer) === 'Technology'
                      ? ['#3498db', '#2980b9']
                      : getCareerCategory(selectedCareer) === 'Healthcare'
                      ? ['#e74c3c', '#c0392b']
                      : getCareerCategory(selectedCareer) === 'Business'
                      ? ['#9b59b6', '#8e44ad']
                      : ['#1abc9c', '#16a085']
                  }
                  style={styles.modalHeader}>
                  <View style={styles.modalEmojiContainer}>
                    <Icon name="briefcase-outline" family="Ionicons" size={60} color="#fff" />
                  </View>
                  <Text style={styles.modalTitle}>{selectedCareer.name}</Text>
                  <View style={styles.modalBadges}>
                    <View style={styles.modalBadge}>
                      <View style={styles.badgeContent}>
                        <Icon name="flame-outline" family="Ionicons" size={11} color="#fff" />
                        <Text style={styles.modalBadgeText}> {selectedCareer.demand_trend || 'High'} Demand</Text>
                      </View>
                    </View>
                    <View style={styles.modalBadge}>
                      <View style={styles.badgeContent}>
                        <Icon name="star-outline" family="Ionicons" size={11} color="#fff" />
                        <Text style={styles.modalBadgeText}> Popular</Text>
                      </View>
                    </View>
                  </View>
                </LinearGradient>

                {/* Quick Stats */}
                <View style={styles.statsRow}>
                  <View style={[styles.statCard, {backgroundColor: colors.background}]}>
                    <Icon name="school-outline" family="Ionicons" size={24} color={colors.primary} />
                    <Text style={[styles.statLabel, {color: colors.textSecondary}]}>Education</Text>
                    <Text style={[styles.statValue, {color: colors.text}]}>
                      {selectedCareer.required_education?.[0] || "Bachelor's"}
                    </Text>
                  </View>
                  <View style={[styles.statCard, {backgroundColor: colors.background}]}>
                    <Icon name="time-outline" family="Ionicons" size={24} color={colors.primary} />
                    <Text style={[styles.statLabel, {color: colors.textSecondary}]}>Duration</Text>
                    <Text style={[styles.statValue, {color: colors.text}]}>
                      {selectedCareer.duration || '4 years'}
                    </Text>
                  </View>
                  <View style={[styles.statCard, {backgroundColor: colors.background}]}>
                    <Icon name="wallet-outline" family="Ionicons" size={24} color={colors.success} />
                    <Text style={[styles.statLabel, {color: colors.textSecondary}]}>Avg Salary</Text>
                    <Text style={[styles.statValue, {color: colors.success}]}>
                      {((selectedCareer.maxSalary || 150000) / 1000).toFixed(0)}K
                    </Text>
                  </View>
                </View>

                {/* Description */}
                <View style={styles.section}>
                  <View style={styles.sectionTitleRow}>
                    <Icon name="reader-outline" family="Ionicons" size={18} color={colors.text} />
                    <Text style={[styles.sectionTitle, {color: colors.text}]}> About This Career</Text>
                  </View>
                  <Text style={[styles.sectionText, {color: colors.textSecondary}]}>
                    {selectedCareer.description}
                  </Text>
                </View>

                {/* Career Roadmap */}
                <View style={styles.section}>
                  <View style={styles.sectionTitleRow}>
                    <Icon name="map-outline" family="Ionicons" size={18} color={colors.text} />
                    <Text style={[styles.sectionTitle, {color: colors.text}]}> Career Roadmap</Text>
                  </View>
                  {(selectedCareer.roadmap || [
                    {step: 1, title: 'Complete Matric', duration: '2 years'},
                    {step: 2, title: 'FSc / Intermediate', duration: '2 years'},
                    {step: 3, title: "Bachelor's Degree", duration: '4 years'},
                    {step: 4, title: 'Entry Level Job', duration: 'Ongoing'},
                  ]).map((step: any, i: number) => (
                    <View key={i} style={styles.roadmapStep}>
                      <View style={styles.stepTimeline}>
                        <LinearGradient
                          colors={['#1abc9c', '#16a085']}
                          style={styles.stepDot}>
                          <Text style={styles.stepNumber}>{step.step || i + 1}</Text>
                        </LinearGradient>
                        {i < 3 && <View style={[styles.stepLine, {backgroundColor: '#1abc9c'}]} />}
                      </View>
                      <View style={[styles.stepContent, {backgroundColor: colors.background}]}>
                        <Text style={[styles.stepTitle, {color: colors.text}]}>{step.title}</Text>
                        <View style={styles.stepDurationRow}>
                          <Icon name="time-outline" family="Ionicons" size={12} color={colors.textSecondary} />
                          <Text style={[styles.stepDuration, {color: colors.textSecondary}]}> {step.duration}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Skills Required */}
                <View style={styles.section}>
                  <View style={styles.sectionTitleRow}>
                    <Icon name="hammer-outline" family="Ionicons" size={18} color={colors.text} />
                    <Text style={[styles.sectionTitle, {color: colors.text}]}> Skills Required</Text>
                  </View>
                  <View style={styles.skillsGrid}>
                    {(selectedCareer.skills || ['Problem Solving', 'Communication', 'Technical Skills', 'Teamwork', 'Creativity']).map((skill: string, i: number) => (
                      <View key={i} style={[styles.skillItem, {backgroundColor: colors.background}]}>
                        <View style={styles.skillItemContent}>
                          <Icon name="checkmark-outline" family="Ionicons" size={14} color={colors.success} />
                          <Text style={[styles.skillItemText, {color: colors.text}]}> {skill}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Motivation */}
                <View style={[styles.motivationCard, {backgroundColor: isDark ? '#F39C1220' : '#FFF8E1'}]}>
                  <Icon name="bulb-outline" family="Ionicons" size={32} color={isDark ? '#FFD54F' : '#F57F17'} />
                  <Text style={[styles.motivationText, {color: isDark ? '#FFD54F' : '#F57F17'}]}>
                    Success in {selectedCareer.name} requires dedication and continuous learning. Start today!
                  </Text>
                </View>

                <View style={{height: SPACING.xxl}} />
              </ScrollView>
            )}
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {},
  header: {
    margin: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl + SPACING.sm,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    borderRadius: RADIUS.xxl,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#10B981',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  headerDecoration1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.12)',
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
  headerDecoration3: {
    position: 'absolute',
    top: 30,
    left: 40,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  headerEmojiContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  filtersContainer: {
    marginTop: SPACING.sm,
    zIndex: 10,
  },
  filtersContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  filterChipText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
  },
  filterChipTextActive: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: '#fff',
  },
  resultsBar: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  resultsText: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  careersContainer: {
    padding: SPACING.md,
    paddingTop: 0,
  },
  careerCard: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  cardTitleArea: {
    flex: 1,
  },
  careerName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    marginBottom: 4,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  demandIndicator: {
    alignItems: 'center',
  },
  demandText: {
    fontSize: 10,
    fontWeight: '600',
  },
  careerDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  skillChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillText: {
    fontSize: 11,
  },
  salarySection: {
    marginBottom: SPACING.sm,
  },
  salaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  salaryTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
  },
  salaryBarContainer: {},
  salaryTrackBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  salaryProgress: {
    height: '100%',
    borderRadius: 4,
  },
  salaryAmount: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
    gap: 4,
  },
  metaText: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  exploreBtn: {
    marginLeft: 'auto',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  exploreBtnText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
  },
  // Salary bar styles
  salaryBar: {
    marginBottom: SPACING.sm,
  },
  salaryLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginBottom: 4,
  },
  salaryTrack: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  salaryFill: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  salaryGradient: {
    flex: 1,
  },
  salaryValue: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
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
    maxHeight: '90%',
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    paddingTop: SPACING.sm,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.sm,
  },
  modalHeader: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  modalEmojiContainer: {
    marginBottom: SPACING.sm,
  },
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    color: '#fff',
    marginBottom: SPACING.sm,
  },
  modalBadges: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  modalBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  modalBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    gap: 4,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
  },
  sectionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 22,
  },
  roadmapStep: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  stepTimeline: {
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  stepLine: {
    width: 3,
    flex: 1,
    marginVertical: 4,
    borderRadius: 2,
  },
  stepContent: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  stepTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    marginBottom: 2,
  },
  stepDurationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDuration: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  skillItem: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
  },
  skillItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillItemText: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  motivationCard: {
    marginHorizontal: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  motivationText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default PremiumCareerGuidanceScreen;

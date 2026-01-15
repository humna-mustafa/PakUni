/**
 * AchievementsScreen - Displays user badges and achievements
 * Features: Badge grid, progress tracking, share functionality, unlockable badges
 */

import React, {useState, useEffect, useRef, useCallback} from 'react';
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
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../contexts/ThemeContext';
import {SPACING} from '../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../constants/design';
import {Icon} from '../components/icons';
import {
  BADGES,
  Badge,
  BadgeCategory,
  BadgeRarity,
  loadAchievements,
  getUserBadges,
  getProgress,
  shareBadge,
  UserAchievements,
} from '../services/achievements';

const {width} = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.md * 3) / 2;

// Filter tabs
const FILTER_TABS = [
  {id: 'all', label: 'All', icon: 'grid-outline'},
  {id: 'unlocked', label: 'Unlocked', icon: 'trophy-outline'},
  {id: 'locked', label: 'Locked', icon: 'lock-closed-outline'},
];

// Category filters
const CATEGORY_FILTERS: {id: BadgeCategory | 'all'; label: string}[] = [
  {id: 'all', label: 'All Categories'},
  {id: 'preparation', label: 'Preparation'},
  {id: 'admission', label: 'Admission'},
  {id: 'achievement', label: 'Achievement'},
  {id: 'contribution', label: 'Contribution'},
  {id: 'milestone', label: 'Milestone'},
];

// Rarity colors
const RARITY_COLORS: Record<BadgeRarity, {primary: string; secondary: string}> = {
  common: {primary: '#94a3b8', secondary: '#64748b'},
  rare: {primary: '#3b82f6', secondary: '#2563eb'},
  epic: {primary: '#a855f7', secondary: '#9333ea'},
  legendary: {primary: '#fbbf24', secondary: '#f59e0b'},
};

// Badge Card Component
const BadgeCard = ({
  badge,
  isUnlocked,
  onPress,
  index,
  colors,
  isDark,
}: {
  badge: Badge;
  isUnlocked: boolean;
  onPress: () => void;
  index: number;
  colors: any;
  isDark: boolean;
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 50,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    if (isUnlocked) {
      // Subtle glow animation for unlocked badges
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, []);

  const rarityColor = RARITY_COLORS[badge.rarity];

  return (
    <Animated.View style={[{transform: [{scale: scaleAnim}]}]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={[
          styles.badgeCard,
          {
            backgroundColor: colors.card,
            opacity: isUnlocked ? 1 : 0.7,
          },
        ]}>
        {isUnlocked && (
          <Animated.View
            style={[
              styles.glowBorder,
              {
                borderColor: rarityColor.primary,
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0.8],
                }),
              },
            ]}
          />
        )}

        {/* Rarity indicator */}
        <View style={[styles.rarityDot, {backgroundColor: rarityColor.primary}]} />

        {/* Badge Icon */}
        <View
          style={[
            styles.badgeIconContainer,
            {
              backgroundColor: isUnlocked
                ? rarityColor.primary + '20'
                : colors.background,
            },
          ]}>
          {isUnlocked ? (
            <Text style={styles.badgeEmoji}>{badge.icon}</Text>
          ) : (
            <Icon
              name="lock-closed"
              family="Ionicons"
              size={32}
              color={colors.textSecondary}
            />
          )}
        </View>

        {/* Badge Info */}
        <Text
          style={[
            styles.badgeName,
            {color: isUnlocked ? colors.text : colors.textSecondary},
          ]}
          numberOfLines={1}>
          {badge.name}
        </Text>

        <Text
          style={[styles.badgeDescription, {color: colors.textSecondary}]}
          numberOfLines={2}>
          {isUnlocked ? badge.description : badge.condition}
        </Text>

        {/* Rarity label */}
        <View
          style={[
            styles.rarityBadge,
            {backgroundColor: rarityColor.primary + '20'},
          ]}>
          <Text style={[styles.rarityText, {color: rarityColor.primary}]}>
            {badge.rarity.toUpperCase()}
          </Text>
        </View>

        {/* Share button for unlocked */}
        {isUnlocked && (
          <View style={[styles.shareIcon, {backgroundColor: rarityColor.primary}]}>
            <Icon name="share-social" family="Ionicons" size={12} color="#FFF" />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Progress Card Component
const ProgressCard = ({
  progress,
  colors,
  isDark,
}: {
  progress: {total: number; unlocked: number; percentage: number};
  colors: any;
  isDark: boolean;
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress.percentage,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [progress.percentage]);

  return (
    <View style={[styles.progressCard, {backgroundColor: colors.card}]}>
      <LinearGradient
        colors={isDark ? ['#6366f120', '#8b5cf620'] : ['#6366f110', '#8b5cf610']}
        style={StyleSheet.absoluteFillObject}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
      />

      <View style={styles.progressHeader}>
        <View>
          <Text style={[styles.progressTitle, {color: colors.text}]}>
            Your Progress
          </Text>
          <Text style={[styles.progressSubtitle, {color: colors.textSecondary}]}>
            {progress.unlocked} of {progress.total} badges unlocked
          </Text>
        </View>
        <View style={styles.progressPercentage}>
          <Text style={styles.progressNumber}>{progress.percentage}%</Text>
        </View>
      </View>

      <View style={[styles.progressBarBg, {backgroundColor: colors.border}]}>
        <Animated.View
          style={[
            styles.progressBarFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}>
          <LinearGradient
            colors={['#6366f1', '#8b5cf6']}
            style={StyleSheet.absoluteFillObject}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
          />
        </Animated.View>
      </View>

      {/* Rarity breakdown */}
      <View style={styles.rarityBreakdown}>
        {(['common', 'rare', 'epic', 'legendary'] as BadgeRarity[]).map(rarity => {
          const count = BADGES.filter(b => b.rarity === rarity).length;
          return (
            <View key={rarity} style={styles.rarityItem}>
              <View
                style={[
                  styles.rarityIndicator,
                  {backgroundColor: RARITY_COLORS[rarity].primary},
                ]}
              />
              <Text style={[styles.rarityCount, {color: colors.textSecondary}]}>
                {count} {rarity}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const AchievementsScreen = () => {
  const {colors, isDark} = useTheme();
  const [activeTab, setActiveTab] = useState('all');
  const [activeCategory, setActiveCategory] = useState<BadgeCategory | 'all'>('all');
  const [unlockedBadgeIds, setUnlockedBadgeIds] = useState<string[]>([]);
  const [progress, setProgress] = useState({total: 0, unlocked: 0, percentage: 0});
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;

  // Load achievements
  useEffect(() => {
    const loadData = async () => {
      try {
        const achievements = await loadAchievements();
        setUnlockedBadgeIds(achievements.badges);
        const prog = await getProgress();
        setProgress(prog);
      } catch (error) {
        console.error('Error loading achievements:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Filter badges
  const filteredBadges = BADGES.filter(badge => {
    // Tab filter
    if (activeTab === 'unlocked' && !unlockedBadgeIds.includes(badge.id)) {
      return false;
    }
    if (activeTab === 'locked' && unlockedBadgeIds.includes(badge.id)) {
      return false;
    }

    // Category filter
    if (activeCategory !== 'all' && badge.category !== activeCategory) {
      return false;
    }

    return true;
  });

  // Open badge detail modal
  const openBadgeModal = (badge: Badge) => {
    setSelectedBadge(badge);
    setModalVisible(true);
    Animated.spring(modalAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  // Close modal
  const closeModal = () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedBadge(null);
    });
  };

  // Share badge
  const handleShareBadge = async () => {
    if (!selectedBadge) return;

    if (!unlockedBadgeIds.includes(selectedBadge.id)) {
      Alert.alert(
        'Badge Locked 🔒',
        'You need to unlock this badge before you can share it!'
      );
      return;
    }

    const shared = await shareBadge(selectedBadge);
    if (shared) {
      Alert.alert('Shared! 🎉', 'Your badge has been shared successfully!');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, {color: colors.text}]}>
            Loading achievements...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}
      edges={['top']}>
      {/* Header */}
      <Animated.View
        style={{
          opacity: headerAnim,
          transform: [
            {
              translateY: headerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              }),
            },
          ],
        }}>
        <LinearGradient
          colors={isDark ? ['#6366f1', '#4f46e5'] : ['#818cf8', '#6366f1']}
          style={styles.header}>
          <View style={styles.headerDecoration1} />
          <View style={styles.headerDecoration2} />
          <Icon name="trophy" family="Ionicons" size={50} color="#FFFFFF" />
          <Text style={styles.headerTitle}>Achievements</Text>
          <Text style={styles.headerSubtitle}>
            Collect badges and share your journey
          </Text>
        </LinearGradient>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Progress Card */}
        <View style={styles.section}>
          <ProgressCard progress={progress} colors={colors} isDark={isDark} />
        </View>

        {/* Filter Tabs */}
        <View style={styles.tabsContainer}>
          {FILTER_TABS.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                {
                  backgroundColor:
                    activeTab === tab.id ? colors.primary : colors.card,
                },
              ]}
              onPress={() => setActiveTab(tab.id)}>
              <Icon
                name={tab.icon}
                family="Ionicons"
                size={16}
                color={activeTab === tab.id ? '#FFF' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.tabText,
                  {color: activeTab === tab.id ? '#FFF' : colors.textSecondary},
                ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}>
          {CATEGORY_FILTERS.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                {
                  backgroundColor:
                    activeCategory === cat.id
                      ? colors.primary + '20'
                      : colors.card,
                  borderColor:
                    activeCategory === cat.id ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setActiveCategory(cat.id)}>
              <Text
                style={[
                  styles.categoryText,
                  {
                    color:
                      activeCategory === cat.id
                        ? colors.primary
                        : colors.textSecondary,
                  },
                ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Badges Grid */}
        <View style={styles.badgesGrid}>
          {filteredBadges.map((badge, index) => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              isUnlocked={unlockedBadgeIds.includes(badge.id)}
              onPress={() => openBadgeModal(badge)}
              index={index}
              colors={colors}
              isDark={isDark}
            />
          ))}
        </View>

        {filteredBadges.length === 0 && (
          <View style={styles.emptyState}>
            <Icon
              name="ribbon-outline"
              family="Ionicons"
              size={48}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
              No badges found
            </Text>
            <Text style={[styles.emptySubtext, {color: colors.textSecondary}]}>
              Try a different filter
            </Text>
          </View>
        )}

        <View style={{height: SPACING.xxl * 2}} />
      </ScrollView>

      {/* Badge Detail Modal */}
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
                    scale: modalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
                opacity: modalAnim,
              },
            ]}>
            {selectedBadge && (
              <>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeModal}>
                  <Icon
                    name="close"
                    family="Ionicons"
                    size={24}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>

                <LinearGradient
                  colors={
                    unlockedBadgeIds.includes(selectedBadge.id)
                      ? selectedBadge.gradientColors
                      : ['#6b7280', '#4b5563']
                  }
                  style={styles.modalBadgeContainer}>
                  {unlockedBadgeIds.includes(selectedBadge.id) ? (
                    <Text style={styles.modalEmoji}>{selectedBadge.icon}</Text>
                  ) : (
                    <Icon
                      name="lock-closed"
                      family="Ionicons"
                      size={60}
                      color="#FFF"
                    />
                  )}
                </LinearGradient>

                <View
                  style={[
                    styles.modalRarityBadge,
                    {
                      backgroundColor:
                        RARITY_COLORS[selectedBadge.rarity].primary + '20',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.modalRarityText,
                      {color: RARITY_COLORS[selectedBadge.rarity].primary},
                    ]}>
                    {selectedBadge.rarity.toUpperCase()}
                  </Text>
                </View>

                <Text style={[styles.modalBadgeName, {color: colors.text}]}>
                  {selectedBadge.name}
                </Text>

                <Text
                  style={[
                    styles.modalBadgeDescription,
                    {color: colors.textSecondary},
                  ]}>
                  {selectedBadge.description}
                </Text>

                <View style={[styles.conditionBox, {backgroundColor: colors.background}]}>
                  <Icon
                    name={
                      unlockedBadgeIds.includes(selectedBadge.id)
                        ? 'checkmark-circle'
                        : 'information-circle-outline'
                    }
                    family="Ionicons"
                    size={20}
                    color={
                      unlockedBadgeIds.includes(selectedBadge.id)
                        ? '#10b981'
                        : colors.primary
                    }
                  />
                  <Text style={[styles.conditionText, {color: colors.text}]}>
                    {unlockedBadgeIds.includes(selectedBadge.id)
                      ? 'Badge Unlocked!'
                      : `How to unlock: ${selectedBadge.condition}`}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.shareButton,
                    {
                      backgroundColor: unlockedBadgeIds.includes(selectedBadge.id)
                        ? RARITY_COLORS[selectedBadge.rarity].primary
                        : colors.border,
                    },
                  ]}
                  onPress={handleShareBadge}>
                  <Icon name="share-social" family="Ionicons" size={20} color="#FFF" />
                  <Text style={styles.shareButtonText}>
                    {unlockedBadgeIds.includes(selectedBadge.id)
                      ? 'Share Badge'
                      : 'Unlock to Share'}
                  </Text>
                </TouchableOpacity>
              </>
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
  section: {
    padding: SPACING.md,
  },
  progressCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    overflow: 'hidden',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
  },
  progressSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 2,
  },
  progressPercentage: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  progressNumber: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: '#6366f1',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  rarityBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rarityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rarityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  rarityCount: {
    fontSize: TYPOGRAPHY.sizes.xs,
    textTransform: 'capitalize',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
  },
  tabText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
  categoryContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '500',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  badgeCard: {
    width: CARD_WIDTH,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  glowBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderRadius: RADIUS.lg,
  },
  rarityDot: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  badgeEmoji: {
    fontSize: 36,
  },
  badgeName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: TYPOGRAPHY.sizes.xs,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: SPACING.sm,
  },
  rarityBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  rarityText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  shareIcon: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    marginTop: SPACING.sm,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 4,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    padding: SPACING.xs,
    zIndex: 10,
  },
  modalBadgeContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  modalEmoji: {
    fontSize: 56,
  },
  modalRarityBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.sm,
  },
  modalRarityText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalBadgeName: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalBadgeDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  conditionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    width: '100%',
  },
  conditionText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    width: '100%',
  },
  shareButtonText: {
    color: '#FFF',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
});

export default AchievementsScreen;

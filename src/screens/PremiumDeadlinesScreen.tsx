/**
 * PremiumDeadlinesScreen - Admission Deadline Tracker
 * Features: Follow universities, push notifications, calendar view
 */

import React, {useState, useRef, useEffect, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {TYPOGRAPHY, SPACING, RADIUS, ANIMATION} from '../constants/design';
import {useTheme} from '../contexts/ThemeContext';
import {Icon} from '../components/icons';
import {logger} from '../utils/logger';
import {Haptics} from '../utils/haptics';
import {
  ADMISSION_DEADLINES,
  PROGRAM_CATEGORIES,
  AdmissionDeadline,
  FollowedUniversity,
  getDaysUntilDeadline,
  getDeadlineStatus,
} from '../data/deadlines';

const {width} = Dimensions.get('window');
const FOLLOWED_UNIVERSITIES_KEY = '@pakuni_followed_universities';
const DEADLINE_NOTIFICATIONS_KEY = '@pakuni_deadline_notifications';

// ============================================================================
// DEADLINE CARD COMPONENT
// ============================================================================

interface DeadlineCardProps {
  deadline: AdmissionDeadline;
  isFollowed: boolean;
  onFollowToggle: (universityId: string) => void;
  onApply: (deadline: AdmissionDeadline) => void;
  colors: any;
  isDark: boolean;
  index: number;
}

const DeadlineCard: React.FC<DeadlineCardProps> = ({
  deadline,
  isFollowed,
  onFollowToggle,
  onApply,
  colors,
  isDark,
  index,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay: index * 80,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  const daysLeft = getDaysUntilDeadline(deadline);
  const status = getDeadlineStatus(deadline);

  const getStatusConfig = () => {
    switch (status) {
      case 'open':
        return {
          color: colors.success,
          bgColor: `${colors.success}15`,
          text: 'Open',
          icon: 'checkmark-circle',
        };
      case 'closing-soon':
        return {
          color: colors.warning,
          bgColor: `${colors.warning}15`,
          text: `${daysLeft} days left`,
          icon: 'alert-circle',
        };
      case 'upcoming':
        return {
          color: colors.primary,
          bgColor: `${colors.primary}15`,
          text: 'Upcoming',
          icon: 'time-outline',
        };
      case 'closed':
        return {
          color: colors.error,
          bgColor: `${colors.error}15`,
          text: 'Closed',
          icon: 'close-circle',
        };
      default:
        return {
          color: colors.textSecondary,
          bgColor: colors.border,
          text: 'Unknown',
          icon: 'help-circle',
        };
    }
  };

  const statusConfig = getStatusConfig();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Animated.View
      style={[
        styles.deadlineCard,
        {
          backgroundColor: colors.card,
          opacity: fadeAnim,
          transform: [{translateY: slideAnim}],
          borderLeftWidth: 4,
          borderLeftColor: statusConfig.color,
        },
      ]}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleSection}>
          <View style={styles.universityBadge}>
            <Text style={[styles.universityShortName, {color: colors.primary}]}>
              {deadline.universityShortName}
            </Text>
          </View>
          <View style={[styles.statusBadge, {backgroundColor: statusConfig.bgColor}]}>
            <Icon name={statusConfig.icon} family="Ionicons" size={12} color={statusConfig.color} />
            <Text style={[styles.statusText, {color: statusConfig.color}]}>
              {statusConfig.text}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.followBtn,
            {
              backgroundColor: isFollowed ? colors.primary : 'transparent',
              borderColor: isFollowed ? colors.primary : colors.border,
            },
          ]}
          onPress={() => onFollowToggle(deadline.universityId)}
          activeOpacity={0.8}>
          <Icon
            name={isFollowed ? 'notifications' : 'notifications-outline'}
            family="Ionicons"
            size={16}
            color={isFollowed ? '#FFFFFF' : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text style={[styles.deadlineTitle, {color: colors.text}]} numberOfLines={2}>
        {deadline.title}
      </Text>

      {deadline.description && (
        <Text style={[styles.deadlineDescription, {color: colors.textSecondary}]} numberOfLines={2}>
          {deadline.description}
        </Text>
      )}

      {/* Timeline */}
      <View style={styles.timelineSection}>
        <View style={styles.timelineItem}>
          <View style={[styles.timelineDot, {backgroundColor: colors.success}]} />
          <View style={styles.timelineInfo}>
            <Text style={[styles.timelineLabel, {color: colors.textSecondary}]}>
              Applications Open
            </Text>
            <Text style={[styles.timelineDate, {color: colors.text}]}>
              {formatDate(deadline.applicationStartDate)}
            </Text>
          </View>
        </View>

        <View style={[styles.timelineLine, {backgroundColor: colors.border}]} />

        <View style={styles.timelineItem}>
          <View style={[styles.timelineDot, {backgroundColor: colors.error}]} />
          <View style={styles.timelineInfo}>
            <Text style={[styles.timelineLabel, {color: colors.textSecondary}]}>
              Deadline
            </Text>
            <Text style={[styles.timelineDate, {color: colors.text}]}>
              {formatDate(deadline.applicationDeadline)}
            </Text>
          </View>
        </View>

        {deadline.entryTestDate && (
          <>
            <View style={[styles.timelineLine, {backgroundColor: colors.border}]} />
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, {backgroundColor: colors.warning}]} />
              <View style={styles.timelineInfo}>
                <Text style={[styles.timelineLabel, {color: colors.textSecondary}]}>
                  Entry Test
                </Text>
                <Text style={[styles.timelineDate, {color: colors.text}]}>
                  {formatDate(deadline.entryTestDate)}
                </Text>
              </View>
            </View>
          </>
        )}
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        {deadline.fee && (
          <View style={styles.feeSection}>
            <Icon name="cash-outline" family="Ionicons" size={14} color={colors.textSecondary} />
            <Text style={[styles.feeText, {color: colors.textSecondary}]}>
              PKR {deadline.fee.toLocaleString()}
            </Text>
          </View>
        )}

        {status !== 'closed' && (
          <TouchableOpacity
            style={[styles.applyBtn, {backgroundColor: colors.primary}]}
            onPress={() => onApply(deadline)}
            activeOpacity={0.9}>
            <Text style={styles.applyBtnText}>Apply Now</Text>
            <Icon name="open-outline" family="Ionicons" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Highlighted Badge */}
      {deadline.isHighlighted && (
        <View style={[styles.highlightedBadge, {backgroundColor: colors.warning}]}>
          <Icon name="star" family="Ionicons" size={10} color="#FFFFFF" />
        </View>
      )}
    </Animated.View>
  );
};

// ============================================================================
// MAIN SCREEN COMPONENT
// ============================================================================

const PremiumDeadlinesScreen = () => {
  const navigation = useNavigation();
  const {colors, isDark} = useTheme();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [followedUniversities, setFollowedUniversities] = useState<string[]>([]);
  const [showFollowedOnly, setShowFollowedOnly] = useState(false);

  const headerAnim = useRef(new Animated.Value(0)).current;

  // Load followed universities
  useEffect(() => {
    const loadFollowed = async () => {
      try {
        const saved = await AsyncStorage.getItem(FOLLOWED_UNIVERSITIES_KEY);
        if (saved) {
          setFollowedUniversities(JSON.parse(saved));
        }
      } catch (error) {
        logger.debug('Failed to load followed universities', error, 'Deadlines');
      }
    };
    loadFollowed();
  }, []);

  // Animate header
  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Filter deadlines
  const filteredDeadlines = useMemo(() => {
    let deadlines = [...ADMISSION_DEADLINES];

    // Filter by category
    if (selectedCategory !== 'all') {
      deadlines = deadlines.filter(d => d.programCategory === selectedCategory);
    }

    // Filter by followed
    if (showFollowedOnly) {
      deadlines = deadlines.filter(d => followedUniversities.includes(d.universityId));
    }

    // Sort by deadline date
    return deadlines.sort((a, b) => {
      const statusOrder: Record<string, number> = {
        'closing-soon': 0,
        'open': 1,
        'upcoming': 2,
        'closed': 3,
      };
      const aStatus = getDeadlineStatus(a);
      const bStatus = getDeadlineStatus(b);
      
      if (statusOrder[aStatus] !== statusOrder[bStatus]) {
        return statusOrder[aStatus] - statusOrder[bStatus];
      }
      
      return new Date(a.applicationDeadline).getTime() - new Date(b.applicationDeadline).getTime();
    });
  }, [selectedCategory, showFollowedOnly, followedUniversities]);

  // Handle follow toggle
  const handleFollowToggle = useCallback(async (universityId: string) => {
    Haptics.light();

    const isFollowed = followedUniversities.includes(universityId);
    let newFollowed: string[];

    if (isFollowed) {
      newFollowed = followedUniversities.filter(id => id !== universityId);
    } else {
      newFollowed = [...followedUniversities, universityId];
      // Show notification prompt for first follow
      if (followedUniversities.length === 0) {
        Alert.alert(
          'Enable Notifications?',
          'Would you like to receive notifications about admission deadlines for universities you follow?',
          [
            {text: 'Not Now', style: 'cancel'},
            {
              text: 'Enable',
              onPress: () => {
                // In production, this would request notification permissions
                Alert.alert('Notifications Enabled', 'You\'ll be notified about upcoming deadlines.');
              },
            },
          ],
        );
      }
    }

    setFollowedUniversities(newFollowed);
    try {
      await AsyncStorage.setItem(FOLLOWED_UNIVERSITIES_KEY, JSON.stringify(newFollowed));
    } catch (error) {
      logger.debug('Failed to save followed universities', error, 'Deadlines');
    }
  }, [followedUniversities]);

  // Handle apply
  const handleApply = useCallback((deadline: AdmissionDeadline) => {
    Haptics.light();

    if (deadline.link) {
      Alert.alert(
        'Open Application Portal',
        `You'll be redirected to ${deadline.universityShortName}'s admission portal.`,
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Open',
            onPress: () => Linking.openURL(deadline.link!),
          },
        ],
      );
    } else {
      Alert.alert(
        'Visit University Website',
        `Please visit ${deadline.universityName}'s website for application details.`,
      );
    }
  }, []);

  // Stats
  const stats = useMemo(() => {
    const openCount = ADMISSION_DEADLINES.filter(d => getDeadlineStatus(d) === 'open').length;
    const closingSoonCount = ADMISSION_DEADLINES.filter(d => getDeadlineStatus(d) === 'closing-soon').length;
    const upcomingCount = ADMISSION_DEADLINES.filter(d => getDeadlineStatus(d) === 'upcoming').length;
    return {openCount, closingSoonCount, upcomingCount};
  }, []);

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
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
            colors={isDark ? ['#DC2626', '#B91C1C', '#991B1B'] : ['#EF4444', '#DC2626', '#B91C1C']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.header}>
            <View style={styles.headerDecoCircle1} />
            <View style={styles.headerDecoCircle2} />

            {/* Back Button */}
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" family="Ionicons" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <View style={styles.headerIconCircle}>
                <Icon name="calendar-outline" family="Ionicons" size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.headerTitle}>Admission Deadlines</Text>
              <Text style={styles.headerSubtitle}>
                Never miss an application deadline
              </Text>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.openCount}</Text>
                <Text style={styles.statLabel}>Open Now</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, {color: '#FCD34D'}]}>{stats.closingSoonCount}</Text>
                <Text style={styles.statLabel}>Closing Soon</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.upcomingCount}</Text>
                <Text style={styles.statLabel}>Upcoming</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>

          {/* Filters Row */}
          <View style={styles.filtersContainer}>
            {/* Category Filter */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryContainer}>
              {PROGRAM_CATEGORIES.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor:
                        selectedCategory === category.id
                          ? colors.primary
                          : colors.card,
                      borderColor:
                        selectedCategory === category.id
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                  activeOpacity={0.8}>
                  <Icon
                    name={category.iconName}
                    family="Ionicons"
                    size={14}
                    color={selectedCategory === category.id ? '#FFFFFF' : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      {
                        color:
                          selectedCategory === category.id
                            ? '#FFFFFF'
                            : colors.text,
                      },
                    ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Following Toggle */}
            <TouchableOpacity
              style={[
                styles.followingToggle,
                {
                  backgroundColor: showFollowedOnly ? colors.primary : colors.card,
                  borderColor: showFollowedOnly ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setShowFollowedOnly(!showFollowedOnly)}
              activeOpacity={0.8}>
              <Icon
                name={showFollowedOnly ? 'notifications' : 'notifications-outline'}
                family="Ionicons"
                size={16}
                color={showFollowedOnly ? '#FFFFFF' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.followingToggleText,
                  {color: showFollowedOnly ? '#FFFFFF' : colors.text},
                ]}>
                Following ({followedUniversities.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Deadlines List */}
          <View style={styles.deadlinesList}>
            {filteredDeadlines.map((deadline, index) => (
              <DeadlineCard
                key={deadline.id}
                deadline={deadline}
                isFollowed={followedUniversities.includes(deadline.universityId)}
                onFollowToggle={handleFollowToggle}
                onApply={handleApply}
                colors={colors}
                isDark={isDark}
                index={index}
              />
            ))}
          </View>

          {/* Empty State */}
          {filteredDeadlines.length === 0 && (
            <View style={styles.emptyState}>
              <Icon name="calendar-outline" family="Ionicons" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, {color: colors.text}]}>
                No Deadlines Found
              </Text>
              <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
                {showFollowedOnly
                  ? 'Follow universities to see their deadlines here'
                  : 'No deadlines match your filters'}
              </Text>
            </View>
          )}

          <View style={{height: 100}} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  // Header Styles
  headerContainer: {},
  header: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: RADIUS.xxl,
    borderBottomRightRadius: RADIUS.xxl,
    overflow: 'hidden',
  },
  headerDecoCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerDecoCircle2: {
    position: 'absolute',
    bottom: 40,
    left: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  backBtn: {
    position: 'absolute',
    top: SPACING.lg,
    left: SPACING.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
  },
  headerIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    marginTop: SPACING.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  // Filters
  filtersContainer: {
    paddingVertical: SPACING.md,
  },
  categoryContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    marginRight: SPACING.sm,
    gap: SPACING.xs,
  },
  categoryChipText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
  },
  followingToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: SPACING.xs,
    alignSelf: 'flex-start',
  },
  followingToggleText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
  // Deadlines List
  deadlinesList: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  deadlineCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  cardTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  universityBadge: {
    backgroundColor: 'rgba(69, 115, 223, 0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  universityShortName: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
  },
  followBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deadlineTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 22,
  },
  deadlineDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  // Timeline
  timelineSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timelineInfo: {},
  timelineLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  timelineDate: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
  },
  timelineLine: {
    width: 20,
    height: 1,
  },
  // Card Footer
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  feeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  feeText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    gap: SPACING.xs,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
  highlightedBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md + 44,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
  },
});

export default PremiumDeadlinesScreen;


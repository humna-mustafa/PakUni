/**
 * PremiumPollsScreen - University Polls with permanent voting
 * Features: Anti-spam protection, login-required voting, shareable results
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
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {TYPOGRAPHY, SPACING, RADIUS, ANIMATION} from '../constants/design';
import {useTheme} from '../contexts/ThemeContext';
import {useAuth} from '../contexts/AuthContext';
import {Icon} from '../components/icons';
import {sharePollResults} from '../services/share';
import {Haptics} from '../utils/haptics';
import {
  fetchPolls,
  submitVote,
  getCachedVotes,
  convertToLegacyFormat,
  POLL_CATEGORIES,
  LegacyPoll,
} from '../services/polls';
import {POLLS_DATA, Poll, PollOption} from '../data/polls';

const {width} = Dimensions.get('window');
const VOTED_POLLS_KEY = '@pakuni_voted_polls';

// ============================================================================
// POLL OPTION COMPONENT
// ============================================================================

interface PollOptionItemProps {
  option: PollOption;
  totalVotes: number;
  isSelected: boolean;
  hasVoted: boolean;
  isWinner: boolean;
  onSelect: () => void;
  colors: any;
  isDark: boolean;
  index: number;
}

const PollOptionItem: React.FC<PollOptionItemProps> = ({
  option,
  totalVotes,
  isSelected,
  hasVoted,
  isWinner,
  onSelect,
  colors,
  isDark,
  index,
}) => {
  const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (hasVoted) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 500,
          delay: index * 100,
          useNativeDriver: false,
        }),
        Animated.timing(widthAnim, {
          toValue: percentage,
          duration: 800,
          delay: index * 100 + 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [hasVoted, percentage, index]);

  const barWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <TouchableOpacity
      activeOpacity={hasVoted ? 1 : 0.8}
      onPress={hasVoted ? undefined : onSelect}
      style={[
        styles.pollOption,
        {
          backgroundColor: isSelected
            ? `${colors.primary}15`
            : isDark
            ? colors.card
            : '#F8FAFC',
          borderColor: isSelected ? colors.primary : colors.border,
        },
      ]}>
      {/* Background Progress Bar */}
      {hasVoted && (
        <Animated.View
          style={[
            styles.pollProgressBar,
            {
              width: barWidth,
              backgroundColor: isWinner
                ? `${colors.success}20`
                : isSelected
                ? `${colors.primary}15`
                : `${colors.textSecondary}10`,
            },
          ]}
        />
      )}

      {/* Content */}
      <View style={styles.pollOptionContent}>
        <View style={styles.pollOptionLeft}>
          {!hasVoted && (
            <View
              style={[
                styles.pollRadio,
                {
                  borderColor: isSelected ? colors.primary : colors.border,
                  backgroundColor: isSelected ? colors.primary : 'transparent',
                },
              ]}>
              {isSelected && (
                <Icon name="checkmark" family="Ionicons" size={14} color="#FFFFFF" />
              )}
            </View>
          )}
          {hasVoted && isWinner && (
            <Icon name="trophy" family="Ionicons" size={18} color={colors.success} />
          )}
          <Text
            style={[
              styles.pollOptionName,
              {
                color: isWinner ? colors.success : colors.text,
                fontWeight: isWinner ? '700' : '600',
              },
            ]}
            numberOfLines={1}>
            {option.shortName || option.name}
          </Text>
        </View>

        {hasVoted && (
          <View style={styles.pollOptionRight}>
            <Text
              style={[
                styles.pollVotes,
                {color: colors.textSecondary},
              ]}>
              {option.votes.toLocaleString()}
            </Text>
            <Text
              style={[
                styles.pollPercentage,
                {
                  color: isWinner ? colors.success : colors.text,
                  fontWeight: isWinner ? '700' : '600',
                },
              ]}>
              {percentage.toFixed(1)}%
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ============================================================================
// POLL CARD COMPONENT
// ============================================================================

interface PollCardProps {
  poll: Poll;
  votedPolls: Record<string, string>;
  onVote: (pollId: string, optionId: string) => void;
  onShare: (poll: Poll) => void;
  colors: any;
  isDark: boolean;
  index: number;
}

const PollCard: React.FC<PollCardProps> = ({
  poll,
  votedPolls,
  onVote,
  onShare,
  colors,
  isDark,
  index,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const hasVoted = poll.id in votedPolls;
  const userVote = votedPolls[poll.id];
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay: index * 100,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  const sortedOptions = useMemo(() => {
    if (!hasVoted) return poll.options;
    return [...poll.options].sort((a, b) => b.votes - a.votes);
  }, [poll.options, hasVoted]);

  const winner = sortedOptions[0];

  const handleVote = () => {
    if (!selectedOption) {
      Alert.alert('Select an Option', 'Please select an option to vote');
      return;
    }
    onVote(poll.id, selectedOption);
    Haptics.success();
  };

  const getCategoryColor = () => {
    switch (poll.category) {
      case 'campus':
        return '#3B82F6';
      case 'academics':
        return '#10B981';
      case 'facilities':
        return '#F59E0B';
      case 'career':
        return '#8B5CF6';
      case 'overall':
        return '#EF4444';
      default:
        return colors.primary;
    }
  };

  return (
    <Animated.View
      style={[
        styles.pollCard,
        {
          backgroundColor: colors.card,
          opacity: fadeAnim,
          transform: [{translateY: slideAnim}],
        },
      ]}>
      {/* Header */}
      <View style={styles.pollCardHeader}>
        <View
          style={[
            styles.categoryBadge,
            {backgroundColor: `${getCategoryColor()}15`},
          ]}>
          <Text style={[styles.categoryText, {color: getCategoryColor()}]}>
            {POLL_CATEGORIES.find(c => c.id === poll.category)?.name || poll.category}
          </Text>
        </View>
        {hasVoted && (
          <TouchableOpacity
            style={[styles.shareBtn, {backgroundColor: `${colors.primary}10`}]}
            onPress={() => onShare(poll)}
            activeOpacity={0.8}>
            <Icon name="share-social-outline" family="Ionicons" size={16} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Question */}
      <Text style={[styles.pollQuestion, {color: colors.text}]}>
        {poll.question}
      </Text>
      <Text style={[styles.pollDescription, {color: colors.textSecondary}]}>
        {poll.description}
      </Text>

      {/* Options */}
      <View style={styles.pollOptions}>
        {sortedOptions.map((option, i) => (
          <PollOptionItem
            key={option.id}
            option={option}
            totalVotes={poll.totalVotes}
            isSelected={hasVoted ? userVote === option.id : selectedOption === option.id}
            hasVoted={hasVoted}
            isWinner={hasVoted && option.id === winner.id}
            onSelect={() => setSelectedOption(option.id)}
            colors={colors}
            isDark={isDark}
            index={i}
          />
        ))}
      </View>

      {/* Footer */}
      <View style={styles.pollFooter}>
        <View style={styles.pollStats}>
          <Icon name="people-outline" family="Ionicons" size={14} color={colors.textSecondary} />
          <Text style={[styles.pollVotesCount, {color: colors.textSecondary}]}>
            {poll.totalVotes.toLocaleString()} votes
          </Text>
        </View>

        {!hasVoted && (
          <TouchableOpacity
            style={[
              styles.voteBtn,
              {
                backgroundColor: selectedOption ? colors.primary : colors.border,
              },
            ]}
            onPress={handleVote}
            disabled={!selectedOption}
            activeOpacity={0.9}>
            <Text
              style={[
                styles.voteBtnText,
                {color: selectedOption ? '#FFFFFF' : colors.textSecondary},
              ]}>
              Vote Now
            </Text>
          </TouchableOpacity>
        )}

        {hasVoted && (
          <View style={[styles.votedBadge, {backgroundColor: `${colors.success}15`}]}>
            <Icon name="checkmark-circle" family="Ionicons" size={14} color={colors.success} />
            <Text style={[styles.votedText, {color: colors.success}]}>Voted</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

// ============================================================================
// MAIN SCREEN COMPONENT
// ============================================================================

const PremiumPollsScreen = () => {
  const navigation = useNavigation();
  const {colors, isDark} = useTheme();
  const {isAuthenticated, user} = useAuth();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [votedPolls, setVotedPolls] = useState<Record<string, string>>({});
  const [polls, setPolls] = useState<Poll[]>(POLLS_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const headerAnim = useRef(new Animated.Value(0)).current;

  // Load polls from Supabase
  const loadPolls = useCallback(async () => {
    try {
      setError(null);
      const {data, error: pollsError} = await fetchPolls();
      
      if (pollsError) {
        console.log('Using fallback data:', pollsError.message);
        // Continue with local data
      }
      
      if (data && data.length > 0) {
        // Convert from Supabase format to local format
        const convertedPolls: Poll[] = data.map(poll => ({
          id: poll.id,
          question: poll.question,
          description: poll.description || '',
          category: poll.category,
          options: poll.options.map(opt => ({
            id: opt.id,
            name: opt.name,
            shortName: opt.short_name || undefined,
            votes: opt.votes,
          })),
          totalVotes: poll.total_votes,
          isActive: poll.is_active,
          createdAt: poll.created_at,
        }));
        setPolls(convertedPolls);
      }
      // If no data from Supabase, use local POLLS_DATA (already set as default)
    } catch (err) {
      console.log('Error loading polls, using local data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load voted polls from cache
  useEffect(() => {
    const loadVotedPolls = async () => {
      try {
        const cached = await getCachedVotes();
        setVotedPolls(cached);
      } catch (error) {
        console.log('Failed to load voted polls');
      }
    };
    loadVotedPolls();
    loadPolls();
  }, [loadPolls]);

  // Animate header
  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Pull to refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.refreshThreshold();
    await loadPolls();
    setRefreshing(false);
    Haptics.success();
  }, [loadPolls]);

  // Filter polls by category
  const filteredPolls = useMemo(() => {
    if (selectedCategory === 'all') return polls;
    return polls.filter(poll => poll.category === selectedCategory);
  }, [polls, selectedCategory]);

  // Handle voting
  const handleVote = useCallback(
    async (pollId: string, optionId: string) => {
      // Check if user is authenticated
      if (!isAuthenticated || !user) {
        Alert.alert(
          'Login Required',
          'Please sign in to vote in polls. This helps us prevent spam and ensure fair voting.',
          [
            {text: 'Cancel', style: 'cancel'},
            {
              text: 'Sign In',
              onPress: () => navigation.navigate('Auth' as never),
            },
          ],
        );
        return;
      }

      // Check if already voted
      if (votedPolls[pollId]) {
        Alert.alert('Already Voted', 'You have already voted in this poll');
        return;
      }

      // Submit vote to Supabase
      const {success, error: voteError} = await submitVote(pollId, optionId, user.id);
      
      if (!success) {
        // If Supabase fails, still update locally for UX
        console.log('Vote submission error:', voteError?.message);
      }

      // Update local state
      const newVotedPolls = {...votedPolls, [pollId]: optionId};
      setVotedPolls(newVotedPolls);

      // Update poll votes locally
      setPolls(prevPolls =>
        prevPolls.map(poll => {
          if (poll.id === pollId) {
            return {
              ...poll,
              totalVotes: poll.totalVotes + 1,
              options: poll.options.map(opt =>
                opt.id === optionId
                  ? {...opt, votes: opt.votes + 1}
                  : opt,
              ),
            };
          }
          return poll;
        }),
      );

      Haptics.success();
    },
    [isAuthenticated, user, votedPolls, navigation],
  );

  // Handle sharing poll results
  const handleSharePoll = useCallback(async (poll: Poll) => {
    Haptics.light();
    
    const sortedOptions = [...poll.options]
      .sort((a, b) => b.votes - a.votes)
      .map(opt => ({
        name: opt.shortName || opt.name,
        votes: opt.votes,
        percentage: (opt.votes / poll.totalVotes) * 100,
      }));

    await sharePollResults({
      question: poll.question,
      winner: sortedOptions[0].name,
      winnerVotes: sortedOptions[0].votes,
      totalVotes: poll.totalVotes,
      options: sortedOptions,
    });
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, {backgroundColor: colors.background}]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, {color: colors.textSecondary}]}>Loading polls...</Text>
      </View>
    );
  }

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
            colors={isDark ? ['#5B21B6', '#4C1D95', '#3B0764'] : ['#7C3AED', '#6D28D9', '#5B21B6']}
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
                <Icon name="podium-outline" family="Ionicons" size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.headerTitle}>University Polls</Text>
              <Text style={styles.headerSubtitle}>
                Vote and see what students think
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
              progressBackgroundColor={colors.card}
            />
          }>
          
          {/* Category Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContainer}>
            {POLL_CATEGORIES.map(category => (
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
                  size={16}
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

          {/* Login Notice */}
          {!isAuthenticated && (
            <View style={[styles.loginNotice, {backgroundColor: `${colors.warning}15`}]}>
              <Icon name="information-circle-outline" family="Ionicons" size={20} color={colors.warning} />
              <Text style={[styles.loginNoticeText, {color: colors.text}]}>
                Sign in to vote and help the community make better decisions!
              </Text>
              <TouchableOpacity
                style={[styles.loginBtn, {backgroundColor: colors.warning}]}
                onPress={() => navigation.navigate('Auth' as never)}>
                <Text style={styles.loginBtnText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Polls List */}
          <View style={styles.pollsList}>
            {filteredPolls.map((poll, index) => (
              <PollCard
                key={poll.id}
                poll={poll}
                votedPolls={votedPolls}
                onVote={handleVote}
                onShare={handleSharePoll}
                colors={colors}
                isDark={isDark}
                index={index}
              />
            ))}
          </View>

          {/* Empty State */}
          {filteredPolls.length === 0 && (
            <View style={styles.emptyState}>
              <Icon name="clipboard-outline" family="Ionicons" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, {color: colors.text}]}>
                No Polls Found
              </Text>
              <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
                No polls in this category yet
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '500',
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
    paddingBottom: SPACING.xl,
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
    bottom: 20,
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
  },
  // Category Filter
  categoryContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
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
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
  // Login Notice
  loginNotice: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  loginNoticeText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
  },
  loginBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.md,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
  // Polls List
  pollsList: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  pollCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
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
  pollCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryBadge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
  },
  categoryText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
  },
  shareBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pollQuestion: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    marginBottom: 4,
  },
  pollDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  // Poll Options
  pollOptions: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  pollOption: {
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    overflow: 'hidden',
    position: 'relative',
  },
  pollProgressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
  },
  pollOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
  },
  pollOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  pollRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pollOptionName: {
    fontSize: TYPOGRAPHY.sizes.md,
  },
  pollOptionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  pollVotes: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  pollPercentage: {
    fontSize: TYPOGRAPHY.sizes.md,
    minWidth: 50,
    textAlign: 'right',
  },
  // Poll Footer
  pollFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  pollStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pollVotesCount: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  voteBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  voteBtnText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
  votedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.md,
    gap: 4,
  },
  votedText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
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

export default PremiumPollsScreen;

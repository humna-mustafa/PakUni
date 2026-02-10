/**
 * usePolls - Custom hook for polls state management
 * Handles fetching, caching, voting, and filtering
 */

import {useState, useEffect, useCallback, useMemo} from 'react';
import {Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuth} from '../contexts/AuthContext';
import {logger} from '../utils/logger';
import {Haptics} from '../utils/haptics';
import {
  fetchPolls,
  submitVote,
  getCachedVotes,
} from '../services/polls';
import {POLLS_DATA, Poll} from '../data/polls';

const POLLS_CACHE_KEY = '@pakuni_polls_cache';
const POLLS_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export function usePolls() {
  const navigation = useNavigation();
  const {isAuthenticated, user} = useAuth();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [votedPolls, setVotedPolls] = useState<Record<string, string>>({});
  const [polls, setPolls] = useState<Poll[]>(POLLS_DATA);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------- Data fetching ----------

  const fetchFromSupabase = useCallback(async () => {
    try {
      const {data, error: pollsError} = await fetchPolls();

      if (pollsError) {
        logger.debug('Using fallback data', {error: pollsError.message}, 'Polls');
        return;
      }

      if (data && data.length > 0) {
        const converted: Poll[] = data.map(poll => ({
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
        setPolls(converted);

        // Persist cache
        try {
          await AsyncStorage.setItem(
            POLLS_CACHE_KEY,
            JSON.stringify({polls: converted, timestamp: Date.now()}),
          );
        } catch (_) {}
      }
    } catch (err) {
      logger.debug('Supabase polls fetch failed', err, 'Polls');
    }
  }, []);

  const loadPolls = useCallback(
    async (forceRefresh = false) => {
      try {
        setError(null);

        if (!forceRefresh) {
          try {
            const cachedData = await AsyncStorage.getItem(POLLS_CACHE_KEY);
            if (cachedData) {
              const {polls: cached, timestamp} = JSON.parse(cachedData);
              if (Date.now() - timestamp < POLLS_CACHE_TTL && cached?.length > 0) {
                setPolls(cached);
                fetchFromSupabase(); // background refresh
                return;
              }
            }
          } catch (_) {}
        }

        await fetchFromSupabase();
      } catch (err) {
        logger.debug('Error loading polls, using local data', err, 'Polls');
      }
    },
    [fetchFromSupabase],
  );

  // ---------- Initialization ----------

  useEffect(() => {
    const init = async () => {
      try {
        const cached = await getCachedVotes();
        setVotedPolls(cached);
      } catch (err) {
        logger.debug('Failed to load voted polls', err, 'Polls');
      }
      loadPolls();
    };
    init();
  }, [loadPolls]);

  // ---------- Filtering ----------

  const filteredPolls = useMemo(() => {
    if (selectedCategory === 'all') return polls;
    return polls.filter(p => p.category === selectedCategory);
  }, [polls, selectedCategory]);

  // ---------- Voting ----------

  const handleVote = useCallback(
    async (pollId: string, optionId: string) => {
      if (!isAuthenticated || !user) {
        Alert.alert(
          'Login Required',
          'Please sign in to vote in polls. This helps us prevent spam and ensure fair voting.',
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Sign In', onPress: () => navigation.navigate('Auth' as never)},
          ],
        );
        return;
      }

      if (votedPolls[pollId]) {
        Alert.alert('Already Voted', 'You have already voted in this poll');
        return;
      }

      const {success, error: voteError} = await submitVote(pollId, optionId, user.id);
      if (!success) {
        logger.debug('Vote submission error', {error: voteError?.message}, 'Polls');
      }

      setVotedPolls(prev => ({...prev, [pollId]: optionId}));
      setPolls(prev =>
        prev.map(poll =>
          poll.id === pollId
            ? {
                ...poll,
                totalVotes: poll.totalVotes + 1,
                options: poll.options.map(opt =>
                  opt.id === optionId ? {...opt, votes: opt.votes + 1} : opt,
                ),
              }
            : poll,
        ),
      );

      Haptics.success();
    },
    [isAuthenticated, user, votedPolls, navigation],
  );

  // ---------- Refresh ----------

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.refreshThreshold();
    await loadPolls(true);
    setRefreshing(false);
    Haptics.success();
  }, [loadPolls]);

  return {
    polls: filteredPolls,
    votedPolls,
    selectedCategory,
    setSelectedCategory,
    refreshing,
    error,
    isAuthenticated,
    handleVote,
    handleRefresh,
  };
}

/**
 * usePolls - Custom hook for polls state management
 * IMPROVED: Local-first voting (no auth required), persists votes in AsyncStorage
 * All users (guest and authenticated) can vote - tracked per device
 */

import {useState, useEffect, useCallback, useMemo} from 'react';
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
const POLLS_VOTES_KEY = '@pakuni_polls_votes'; // Device-local vote tracking
const VOTED_POLLS_KEY = '@pakuni_voted_polls'; // Which option user selected per poll
const POLLS_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Load votes made on this device
 */
const loadDeviceVotes = async (): Promise<Record<string, string>> => {
  try {
    const raw = await AsyncStorage.getItem(VOTED_POLLS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

/**
 * Save updated vote counts to AsyncStorage so they persist
 */
const saveLocalPollCounts = async (polls: Poll[]) => {
  try {
    const existing = await AsyncStorage.getItem(POLLS_CACHE_KEY);
    const base = existing ? JSON.parse(existing) : {};
    await AsyncStorage.setItem(POLLS_CACHE_KEY, JSON.stringify({
      ...base,
      polls,
      timestamp: base.timestamp ?? Date.now(), // Keep original cache timestamp
    }));
  } catch {}
};

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
        // Load device-local voted polls (works for all users including guests)
        const deviceVotes = await loadDeviceVotes();
        setVotedPolls(deviceVotes);
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

  // ---------- Voting — works for ALL users (guest + authenticated) ----------

  const handleVote = useCallback(
    async (pollId: string, optionId: string) => {
      // Already voted check
      if (votedPolls[pollId]) {
        Haptics.warning?.();
        return; // Silently ignore re-vote (results already shown)
      }

      // Optimistically update local state
      const newVotedPolls = {...votedPolls, [pollId]: optionId};
      setVotedPolls(newVotedPolls);

      const updatedPolls = polls.map(poll =>
        poll.id === pollId
          ? {
              ...poll,
              totalVotes: poll.totalVotes + 1,
              options: poll.options.map(opt =>
                opt.id === optionId ? {...opt, votes: opt.votes + 1} : opt,
              ),
            }
          : poll,
      );
      setPolls(updatedPolls);

      Haptics.success();

      // Persist vote selection to AsyncStorage (device-local)
      try {
        await AsyncStorage.setItem(VOTED_POLLS_KEY, JSON.stringify(newVotedPolls));
      } catch {}

      // Also persist updated poll counts locally
      await saveLocalPollCounts(updatedPolls);

      // Try to submit to Supabase for authenticated users (non-blocking)
      if (isAuthenticated && user) {
        submitVote(pollId, optionId, user.id).catch(() => {
          logger.debug('Supabase vote sync failed (vote saved locally)', {}, 'Polls');
        });
      }
    },
    [isAuthenticated, user, votedPolls, polls],
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

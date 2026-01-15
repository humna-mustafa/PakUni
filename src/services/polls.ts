/**
 * Polls Service - Supabase Backend Integration
 * Real-time polls with voting functionality
 */

import {supabase} from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VOTED_POLLS_CACHE_KEY = '@pakuni_voted_polls_cache';

export interface PollOption {
  id: string;
  name: string;
  short_name: string | null;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  description: string | null;
  category: 'campus' | 'academics' | 'facilities' | 'career' | 'overall';
  total_votes: number;
  is_active: boolean;
  created_at: string;
  options: PollOption[];
}

export interface UserVote {
  poll_id: string;
  option_id: string;
}

// Convert to legacy format for compatibility
export interface LegacyPoll {
  id: string;
  question: string;
  category: 'campus' | 'academics' | 'facilities' | 'career' | 'overall';
  description: string;
  options: {
    id: string;
    name: string;
    shortName?: string;
    votes: number;
  }[];
  totalVotes: number;
  isActive: boolean;
  createdAt: string;
}

/**
 * Fetch all active polls with their options
 */
export async function fetchPolls(): Promise<{data: Poll[] | null; error: Error | null}> {
  try {
    const {data: polls, error: pollsError} = await supabase
      .from('polls')
      .select('*')
      .eq('is_active', true)
      .order('created_at', {ascending: false});

    if (pollsError) {
      throw pollsError;
    }

    if (!polls || polls.length === 0) {
      return {data: [], error: null};
    }

    // Fetch options for all polls
    const {data: options, error: optionsError} = await supabase
      .from('poll_options')
      .select('*')
      .in('poll_id', polls.map(p => p.id))
      .order('votes', {ascending: false});

    if (optionsError) {
      throw optionsError;
    }

    // Combine polls with their options
    const pollsWithOptions: Poll[] = polls.map(poll => ({
      ...poll,
      options: (options || []).filter(opt => opt.poll_id === poll.id),
    }));

    return {data: pollsWithOptions, error: null};
  } catch (error) {
    console.error('Error fetching polls:', error);
    return {data: null, error: error as Error};
  }
}

/**
 * Get user's voted polls
 */
export async function getUserVotes(userId: string): Promise<{data: UserVote[] | null; error: Error | null}> {
  try {
    const {data, error} = await supabase
      .from('poll_votes')
      .select('poll_id, option_id')
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return {data: data || [], error: null};
  } catch (error) {
    console.error('Error fetching user votes:', error);
    return {data: null, error: error as Error};
  }
}

/**
 * Submit a vote for a poll
 */
export async function submitVote(
  pollId: string,
  optionId: string,
  userId: string
): Promise<{success: boolean; error: Error | null}> {
  try {
    // Check if user already voted
    const {data: existingVote} = await supabase
      .from('poll_votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('user_id', userId)
      .single();

    if (existingVote) {
      return {success: false, error: new Error('You have already voted in this poll')};
    }

    // Insert the vote
    const {error} = await supabase
      .from('poll_votes')
      .insert({
        poll_id: pollId,
        option_id: optionId,
        user_id: userId,
      });

    if (error) {
      throw error;
    }

    // Cache the vote locally for offline access
    await cacheVote(pollId, optionId);

    return {success: true, error: null};
  } catch (error) {
    console.error('Error submitting vote:', error);
    return {success: false, error: error as Error};
  }
}

/**
 * Cache vote locally
 */
async function cacheVote(pollId: string, optionId: string): Promise<void> {
  try {
    const cached = await AsyncStorage.getItem(VOTED_POLLS_CACHE_KEY);
    const votes = cached ? JSON.parse(cached) : {};
    votes[pollId] = optionId;
    await AsyncStorage.setItem(VOTED_POLLS_CACHE_KEY, JSON.stringify(votes));
  } catch (error) {
    console.warn('Failed to cache vote:', error);
  }
}

/**
 * Get cached votes
 */
export async function getCachedVotes(): Promise<Record<string, string>> {
  try {
    const cached = await AsyncStorage.getItem(VOTED_POLLS_CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch (error) {
    console.warn('Failed to get cached votes:', error);
    return {};
  }
}

/**
 * Convert Poll to legacy format for backward compatibility
 */
export function convertToLegacyFormat(polls: Poll[]): LegacyPoll[] {
  return polls.map(poll => ({
    id: poll.id,
    question: poll.question,
    category: poll.category,
    description: poll.description || '',
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
}

/**
 * Subscribe to real-time poll updates
 */
export function subscribeToPollUpdates(
  onUpdate: (poll: Poll) => void
): () => void {
  const channel = supabase
    .channel('poll-updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'poll_options',
      },
      async (payload) => {
        // Refetch the poll when options change
        if (payload.new && 'poll_id' in payload.new) {
          const pollId = payload.new.poll_id as string;
          const {data: poll} = await supabase
            .from('polls')
            .select('*')
            .eq('id', pollId)
            .single();

          if (poll) {
            const {data: options} = await supabase
              .from('poll_options')
              .select('*')
              .eq('poll_id', pollId);

            onUpdate({
              ...poll,
              options: options || [],
            });
          }
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export const POLL_CATEGORIES = [
  {id: 'all', name: 'All Polls', iconName: 'grid-outline'},
  {id: 'campus', name: 'Campus Life', iconName: 'people-outline'},
  {id: 'academics', name: 'Academics', iconName: 'school-outline'},
  {id: 'facilities', name: 'Facilities', iconName: 'business-outline'},
  {id: 'career', name: 'Career', iconName: 'briefcase-outline'},
  {id: 'overall', name: 'Overall', iconName: 'trophy-outline'},
];

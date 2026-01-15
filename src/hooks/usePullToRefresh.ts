/**
 * usePullToRefresh Hook
 * Manages pull-to-refresh state with proper timing
 */

import {useState, useCallback, useRef} from 'react';
import {Haptics} from '../utils/haptics';

interface UsePullToRefreshOptions {
  /** Minimum refresh duration in ms */
  minDuration?: number;
  /** Enable haptic feedback */
  hapticFeedback?: boolean;
  /** Callback on refresh */
  onRefresh: () => Promise<void>;
  /** Error callback */
  onError?: (error: Error) => void;
}

interface UsePullToRefreshReturn {
  /** Is currently refreshing */
  refreshing: boolean;
  /** Handler for RefreshControl */
  onRefresh: () => void;
  /** Last refresh timestamp */
  lastRefreshed: Date | null;
  /** Force refresh */
  forceRefresh: () => void;
}

/**
 * Hook for pull-to-refresh functionality
 * 
 * @example
 * const {refreshing, onRefresh} = usePullToRefresh({
 *   onRefresh: async () => {
 *     await fetchData();
 *   }
 * });
 * 
 * <FlatList
 *   refreshControl={
 *     <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
 *   }
 * />
 */
export function usePullToRefresh({
  minDuration = 500,
  hapticFeedback = true,
  onRefresh,
  onError,
}: UsePullToRefreshOptions): UsePullToRefreshReturn {
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const isRefreshingRef = useRef(false);

  const handleRefresh = useCallback(async () => {
    // Prevent multiple simultaneous refreshes
    if (isRefreshingRef.current) return;
    
    isRefreshingRef.current = true;
    setRefreshing(true);

    // Trigger haptic feedback
    if (hapticFeedback) {
      Haptics.refreshThreshold();
    }

    const startTime = Date.now();

    try {
      await onRefresh();
      setLastRefreshed(new Date());

      // Success haptic
      if (hapticFeedback) {
        Haptics.success();
      }
    } catch (error) {
      onError?.(error as Error);

      // Error haptic
      if (hapticFeedback) {
        Haptics.error();
      }
    } finally {
      // Ensure minimum refresh duration for better UX
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDuration - elapsed);

      setTimeout(() => {
        setRefreshing(false);
        isRefreshingRef.current = false;
      }, remaining);
    }
  }, [onRefresh, onError, minDuration, hapticFeedback]);

  const forceRefresh = useCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  return {
    refreshing,
    onRefresh: handleRefresh,
    lastRefreshed,
    forceRefresh,
  };
}

export default usePullToRefresh;

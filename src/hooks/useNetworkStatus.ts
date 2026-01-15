/**
 * Network Status Hook
 * Provides real-time network connectivity status
 * Uses the installed @react-native-community/netinfo package
 */

import {useState, useEffect, useCallback} from 'react';
import NetInfo, {NetInfoState} from '@react-native-community/netinfo';
import {Haptics} from '../utils/haptics';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
  isWifi: boolean;
  isCellular: boolean;
}

/**
 * Hook to monitor network connectivity status
 * Provides real-time updates when connection state changes
 */
export const useNetworkStatus = (): NetworkStatus => {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: null,
    type: 'unknown',
    isWifi: false,
    isCellular: false,
  });

  useEffect(() => {
    // Get initial state
    NetInfo.fetch().then((state: NetInfoState) => {
      setStatus({
        isConnected: state.isConnected ?? true,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        isWifi: state.type === 'wifi',
        isCellular: state.type === 'cellular',
      });
    });

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const newStatus: NetworkStatus = {
        isConnected: state.isConnected ?? true,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        isWifi: state.type === 'wifi',
        isCellular: state.type === 'cellular',
      };

      setStatus(prevStatus => {
        // Provide haptic feedback on connection state change
        if (prevStatus.isConnected !== newStatus.isConnected) {
          if (newStatus.isConnected) {
            Haptics.success();
          } else {
            Haptics.warning();
          }
        }
        return newStatus;
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return status;
};

/**
 * Hook that returns just the connection status
 * Simplified version for basic connectivity checks
 */
export const useIsOnline = (): boolean => {
  const {isConnected} = useNetworkStatus();
  return isConnected;
};

/**
 * Hook for handling offline scenarios with retry capability
 */
export const useOfflineRetry = (
  onRetry: () => void,
  maxRetries: number = 3,
) => {
  const {isConnected} = useNetworkStatus();
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Auto-retry when connection is restored
  useEffect(() => {
    if (isConnected && retryCount > 0 && retryCount <= maxRetries) {
      setIsRetrying(true);
      onRetry();
      setIsRetrying(false);
    }
  }, [isConnected, onRetry, retryCount, maxRetries]);

  const retry = useCallback(() => {
    if (isConnected && retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      onRetry();
    }
  }, [isConnected, retryCount, maxRetries, onRetry]);

  const resetRetry = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return {
    retry,
    resetRetry,
    retryCount,
    isRetrying,
    canRetry: retryCount < maxRetries && isConnected,
  };
};

export default useNetworkStatus;

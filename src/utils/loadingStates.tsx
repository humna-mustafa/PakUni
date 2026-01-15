/**
 * Loading States Manager - Enterprise-grade loading and state management
 * Centralized loading states, skeleton loaders, and progressive loading
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  ReactNode,
} from 'react';
import {
  View,
  Animated,
  StyleSheet,
  ViewStyle,
  Dimensions,
  DimensionValue,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {PREMIUM_DESIGN} from '../constants/design';

// ============================================================================
// TYPES
// ============================================================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error' | 'refreshing';

export interface LoadingItem {
  id: string;
  state: LoadingState;
  message?: string;
  progress?: number; // 0-100
  startTime: number;
  error?: Error;
}

interface LoadingContextType {
  /** Get loading state for a key */
  getState: (key: string) => LoadingState;
  /** Check if any loading is active */
  isLoading: boolean;
  /** Check if specific key is loading */
  isLoadingKey: (key: string) => boolean;
  /** Start loading for a key */
  startLoading: (key: string, message?: string) => void;
  /** Set loading success */
  setSuccess: (key: string) => void;
  /** Set loading error */
  setError: (key: string, error: Error) => void;
  /** Stop loading for a key */
  stopLoading: (key: string) => void;
  /** Update progress (0-100) */
  setProgress: (key: string, progress: number) => void;
  /** Get all loading items */
  getLoadingItems: () => Map<string, LoadingItem>;
  /** Get loading duration for a key */
  getLoadingDuration: (key: string) => number;
  /** Clear all loading states */
  clearAll: () => void;
}

// ============================================================================
// LOADING CONTEXT
// ============================================================================

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

// ============================================================================
// LOADING PROVIDER
// ============================================================================

interface LoadingProviderProps {
  children: ReactNode;
  /** Auto-clear successful states after delay (ms) */
  autoClearDelay?: number;
  /** Minimum loading time to prevent flashing (ms) */
  minimumLoadingTime?: number;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({
  children,
  autoClearDelay = 3000,
  minimumLoadingTime = 300,
}) => {
  const [loadingItems, setLoadingItems] = useState<Map<string, LoadingItem>>(
    new Map(),
  );
  const pendingMinTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      pendingMinTimeouts.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  const getState = useCallback(
    (key: string): LoadingState => {
      return loadingItems.get(key)?.state || 'idle';
    },
    [loadingItems],
  );

  const isLoading = useMemo(() => {
    return Array.from(loadingItems.values()).some(
      item => item.state === 'loading' || item.state === 'refreshing',
    );
  }, [loadingItems]);

  const isLoadingKey = useCallback(
    (key: string): boolean => {
      const state = loadingItems.get(key)?.state;
      return state === 'loading' || state === 'refreshing';
    },
    [loadingItems],
  );

  const startLoading = useCallback((key: string, message?: string) => {
    setLoadingItems(prev => {
      const next = new Map(prev);
      next.set(key, {
        id: key,
        state: 'loading',
        message,
        startTime: Date.now(),
      });
      return next;
    });
  }, []);

  const setSuccess = useCallback(
    (key: string) => {
      const item = loadingItems.get(key);
      if (!item) return;

      const elapsed = Date.now() - item.startTime;
      const remainingTime = Math.max(0, minimumLoadingTime - elapsed);

      // Ensure minimum loading time
      const updateState = () => {
        setLoadingItems(prev => {
          const next = new Map(prev);
          const currentItem = next.get(key);
          if (currentItem) {
            next.set(key, {...currentItem, state: 'success'});
          }
          return next;
        });

        // Auto-clear after delay
        if (autoClearDelay > 0) {
          setTimeout(() => {
            setLoadingItems(prev => {
              const next = new Map(prev);
              next.delete(key);
              return next;
            });
          }, autoClearDelay);
        }
      };

      if (remainingTime > 0) {
        const timeout = setTimeout(updateState, remainingTime);
        pendingMinTimeouts.current.set(key, timeout);
      } else {
        updateState();
      }
    },
    [loadingItems, minimumLoadingTime, autoClearDelay],
  );

  const setError = useCallback(
    (key: string, error: Error) => {
      const item = loadingItems.get(key);
      if (!item) return;

      const elapsed = Date.now() - item.startTime;
      const remainingTime = Math.max(0, minimumLoadingTime - elapsed);

      const updateState = () => {
        setLoadingItems(prev => {
          const next = new Map(prev);
          const currentItem = next.get(key);
          if (currentItem) {
            next.set(key, {...currentItem, state: 'error', error});
          }
          return next;
        });
      };

      if (remainingTime > 0) {
        const timeout = setTimeout(updateState, remainingTime);
        pendingMinTimeouts.current.set(key, timeout);
      } else {
        updateState();
      }
    },
    [loadingItems, minimumLoadingTime],
  );

  const stopLoading = useCallback((key: string) => {
    // Clear pending timeouts
    const timeout = pendingMinTimeouts.current.get(key);
    if (timeout) {
      clearTimeout(timeout);
      pendingMinTimeouts.current.delete(key);
    }

    setLoadingItems(prev => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const setProgress = useCallback((key: string, progress: number) => {
    setLoadingItems(prev => {
      const next = new Map(prev);
      const item = next.get(key);
      if (item) {
        next.set(key, {...item, progress: Math.min(100, Math.max(0, progress))});
      }
      return next;
    });
  }, []);

  const getLoadingItems = useCallback(() => loadingItems, [loadingItems]);

  const getLoadingDuration = useCallback(
    (key: string): number => {
      const item = loadingItems.get(key);
      if (!item) return 0;
      return Date.now() - item.startTime;
    },
    [loadingItems],
  );

  const clearAll = useCallback(() => {
    pendingMinTimeouts.current.forEach(timeout => clearTimeout(timeout));
    pendingMinTimeouts.current.clear();
    setLoadingItems(new Map());
  }, []);

  const value: LoadingContextType = useMemo(
    () => ({
      getState,
      isLoading,
      isLoadingKey,
      startLoading,
      setSuccess,
      setError,
      stopLoading,
      setProgress,
      getLoadingItems,
      getLoadingDuration,
      clearAll,
    }),
    [
      getState,
      isLoading,
      isLoadingKey,
      startLoading,
      setSuccess,
      setError,
      stopLoading,
      setProgress,
      getLoadingItems,
      getLoadingDuration,
      clearAll,
    ],
  );

  return (
    <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
  );
};

// ============================================================================
// ASYNC LOADING HOOK
// ============================================================================

interface UseAsyncLoadingOptions {
  key: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useAsyncLoading = <T,>(options: UseAsyncLoadingOptions) => {
  const loading = useLoading();
  const {key, onSuccess, onError} = options;

  const execute = useCallback(
    async (asyncFn: () => Promise<T>): Promise<T | undefined> => {
      loading.startLoading(key);
      try {
        const result = await asyncFn();
        loading.setSuccess(key);
        onSuccess?.();
        return result;
      } catch (error) {
        loading.setError(key, error as Error);
        onError?.(error as Error);
        return undefined;
      }
    },
    [key, loading, onSuccess, onError],
  );

  const state = loading.getState(key);
  const isLoading = loading.isLoadingKey(key);

  return {
    execute,
    state,
    isLoading,
    reset: () => loading.stopLoading(key),
  };
};

// ============================================================================
// SKELETON COMPONENTS
// ============================================================================

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius,
  style,
  variant = 'rounded',
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const getRadius = (): number => {
    if (borderRadius !== undefined) return borderRadius;
    switch (variant) {
      case 'text':
        return 4;
      case 'rectangular':
        return 0;
      case 'circular':
        return 1000;
      case 'rounded':
      default:
        return PREMIUM_DESIGN.borderRadius.md;
    }
  };

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View
      style={[
        skeletonStyles.container,
        {
          width,
          height,
          borderRadius: getRadius(),
        },
        style,
      ]}>
      <Animated.View
        style={[
          skeletonStyles.shimmer,
          {
            transform: [{translateX}],
          },
        ]}>
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0)',
            'rgba(255, 255, 255, 0.1)',
            'rgba(255, 255, 255, 0)',
          ]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={skeletonStyles.gradient}
        />
      </Animated.View>
    </View>
  );
};

// ============================================================================
// SKELETON PRESETS
// ============================================================================

interface SkeletonCardProps {
  lines?: number;
  hasImage?: boolean;
  style?: ViewStyle;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  lines = 3,
  hasImage = true,
  style,
}) => (
  <View style={[skeletonStyles.card, style]}>
    {hasImage && (
      <Skeleton
        width={60}
        height={60}
        variant="rounded"
        style={skeletonStyles.cardImage}
      />
    )}
    <View style={skeletonStyles.cardContent}>
      <Skeleton width="70%" height={18} style={skeletonStyles.cardLine} />
      {Array.from({length: lines - 1}).map((_, i) => (
        <Skeleton
          key={i}
          width={`${80 - i * 15}%`}
          height={14}
          style={skeletonStyles.cardLine}
        />
      ))}
    </View>
  </View>
);

export const SkeletonList: React.FC<{count?: number; hasImage?: boolean}> = ({
  count = 5,
  hasImage = true,
}) => (
  <View>
    {Array.from({length: count}).map((_, i) => (
      <SkeletonCard key={i} hasImage={hasImage} style={{marginBottom: 12}} />
    ))}
  </View>
);

export const SkeletonProfile: React.FC = () => (
  <View style={skeletonStyles.profile}>
    <Skeleton width={100} height={100} variant="circular" />
    <Skeleton width={150} height={24} style={{marginTop: 16}} />
    <Skeleton width={200} height={16} style={{marginTop: 8}} />
    <View style={skeletonStyles.profileStats}>
      {[1, 2, 3].map(i => (
        <View key={i} style={skeletonStyles.profileStat}>
          <Skeleton width={40} height={24} />
          <Skeleton width={60} height={14} style={{marginTop: 4}} />
        </View>
      ))}
    </View>
  </View>
);

export const SkeletonHeader: React.FC = () => (
  <View style={skeletonStyles.header}>
    <Skeleton width={200} height={32} />
    <Skeleton width={280} height={18} style={{marginTop: 8}} />
  </View>
);

// ============================================================================
// PROGRESSIVE LOADING COMPONENT
// ============================================================================

interface ProgressiveLoadProps {
  isLoading: boolean;
  skeleton?: ReactNode;
  children: ReactNode;
  fadeIn?: boolean;
  minHeight?: number;
}

export const ProgressiveLoad: React.FC<ProgressiveLoadProps> = ({
  isLoading,
  skeleton,
  children,
  fadeIn = true,
  minHeight,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isLoading && fadeIn) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading, fadeIn, fadeAnim]);

  if (isLoading) {
    return (
      <View style={{minHeight}}>
        {skeleton || <Skeleton height={minHeight || 100} />}
      </View>
    );
  }

  if (fadeIn) {
    return (
      <Animated.View style={{opacity: fadeAnim, minHeight}}>
        {children}
      </Animated.View>
    );
  }

  return <>{children}</>;
};

// ============================================================================
// LOADING OVERLAY
// ============================================================================

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  progress?: number;
  cancelable?: boolean;
  onCancel?: () => void;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message,
  progress,
  cancelable = false,
  onCancel,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Start spinning
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim, scaleAnim, spinAnim]);

  if (!visible) return null;

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[overlayStyles.container, {opacity: fadeAnim}]}>
      <Animated.View
        style={[overlayStyles.content, {transform: [{scale: scaleAnim}]}]}>
        <Animated.View style={{transform: [{rotate: spin}]}}>
          <View style={overlayStyles.spinner} />
        </Animated.View>

        {message && (
          <Animated.Text style={overlayStyles.message}>{message}</Animated.Text>
        )}

        {progress !== undefined && (
          <View style={overlayStyles.progressContainer}>
            <View
              style={[overlayStyles.progressBar, {width: `${progress}%`}]}
            />
          </View>
        )}

        {cancelable && onCancel && (
          <Animated.Text style={overlayStyles.cancelText} onPress={onCancel}>
            Cancel
          </Animated.Text>
        )}
      </Animated.View>
    </Animated.View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const {width} = Dimensions.get('window');

const skeletonStyles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 200,
  },
  gradient: {
    flex: 1,
    width: 200,
  },
  card: {
    flexDirection: 'row',
    padding: PREMIUM_DESIGN.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: PREMIUM_DESIGN.borderRadius.lg,
  },
  cardImage: {
    marginRight: PREMIUM_DESIGN.spacing.md,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardLine: {
    marginBottom: PREMIUM_DESIGN.spacing.xs,
  },
  profile: {
    alignItems: 'center',
    padding: PREMIUM_DESIGN.spacing.xl,
  },
  profileStats: {
    flexDirection: 'row',
    marginTop: PREMIUM_DESIGN.spacing.lg,
    gap: PREMIUM_DESIGN.spacing.xl,
  },
  profileStat: {
    alignItems: 'center',
  },
  header: {
    padding: PREMIUM_DESIGN.spacing.lg,
  },
});

const overlayStyles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    backgroundColor: 'rgba(30, 30, 46, 0.95)',
    borderRadius: PREMIUM_DESIGN.borderRadius.xl,
    padding: PREMIUM_DESIGN.spacing.xl,
    alignItems: 'center',
    minWidth: 150,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  spinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: PREMIUM_DESIGN.colors.primary.main,
    borderTopColor: 'transparent',
  },
  message: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: PREMIUM_DESIGN.typography.sizes.md,
    marginTop: PREMIUM_DESIGN.spacing.md,
    textAlign: 'center',
  },
  progressContainer: {
    width: width * 0.5,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginTop: PREMIUM_DESIGN.spacing.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: PREMIUM_DESIGN.colors.primary.main,
    borderRadius: 2,
  },
  cancelText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: PREMIUM_DESIGN.typography.sizes.sm,
    marginTop: PREMIUM_DESIGN.spacing.md,
    textDecorationLine: 'underline',
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  LoadingProvider,
  useLoading,
  useAsyncLoading,
  Skeleton,
  SkeletonCard,
  SkeletonList,
  SkeletonProfile,
  SkeletonHeader,
  ProgressiveLoad,
  LoadingOverlay,
};

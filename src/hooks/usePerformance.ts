/**
 * Performance Hooks - Enterprise-grade optimization utilities
 * Following React best practices for production apps
 */

import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  DependencyList,
} from 'react';
import {InteractionManager, Dimensions, AppState, AppStateStatus} from 'react-native';

// ============================================================================
// DEFERRED LOADING - Load heavy content after interactions complete
// ============================================================================

/**
 * Hook to defer heavy rendering until after interactions complete
 * Improves perceived performance on navigation
 */
export const useDeferredValue = <T>(value: T, delay = 0): T => {
  const [deferredValue, setDeferredValue] = useState(value);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      if (delay > 0) {
        const timer = setTimeout(() => setDeferredValue(value), delay);
        return () => clearTimeout(timer);
      }
      setDeferredValue(value);
    });

    return () => task.cancel();
  }, [value, delay]);

  return deferredValue;
};

/**
 * Hook to load content after screen mount
 * Helps improve initial render performance
 */
export const useDeferredRender = (delay = 0): boolean => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      if (delay > 0) {
        const timer = setTimeout(() => setIsReady(true), delay);
        return () => clearTimeout(timer);
      }
      setIsReady(true);
    });

    return () => task.cancel();
  }, [delay]);

  return isReady;
};

// ============================================================================
// DEBOUNCE & THROTTLE - Control function execution frequency
// ============================================================================

/**
 * Hook to debounce a value (delay updates until inactivity)
 * Perfect for search inputs
 */
export const useDebounce = <T>(value: T, delay = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook to create a debounced callback function
 */
export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay = 300,
  deps: DependencyList = [],
): ((...args: Parameters<T>) => void) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay, ...deps],
  );
};

/**
 * Hook to create a throttled callback function
 * Executes at most once per interval
 */
export const useThrottledCallback = <T extends (...args: any[]) => any>(
  callback: T,
  interval = 300,
  deps: DependencyList = [],
): ((...args: Parameters<T>) => void) => {
  const lastRunRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRunRef.current;

      if (timeSinceLastRun >= interval) {
        lastRunRef.current = now;
        callback(...args);
      } else {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
          lastRunRef.current = Date.now();
          callback(...args);
        }, interval - timeSinceLastRun);
      }
    },
    [callback, interval, ...deps],
  );
};

// ============================================================================
// MEMOIZATION - Prevent unnecessary re-renders
// ============================================================================

/**
 * Hook to memoize expensive computations with deep comparison
 */
export const useDeepMemo = <T>(factory: () => T, deps: DependencyList): T => {
  const depsRef = useRef<DependencyList>(deps);
  const valueRef = useRef<T | undefined>(undefined);

  const hasChanged = !depsEqual(depsRef.current, deps);

  if (hasChanged || valueRef.current === undefined) {
    depsRef.current = deps;
    valueRef.current = factory();
  }

  return valueRef.current;
};

// Deep equality check for dependencies
const depsEqual = (a: DependencyList, b: DependencyList): boolean => {
  if (a.length !== b.length) return false;
  return a.every((dep, index) => deepEqual(dep, b[index]));
};

// Deep equality check for objects
const deepEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object' || a === null || b === null) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  return keysA.every(key => deepEqual(a[key], b[key]));
};

/**
 * Hook to get previous value (useful for comparisons)
 */
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};

// ============================================================================
// APP STATE - Track foreground/background state
// ============================================================================

/**
 * Hook to track app state (active/background/inactive)
 */
export const useAppState = (): AppStateStatus => {
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', setAppState);
    return () => subscription.remove();
  }, []);

  return appState;
};

/**
 * Hook to run effect when app becomes active
 */
export const useOnAppForeground = (callback: () => void, deps: DependencyList = []): void => {
  const previousState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (previousState.current.match(/inactive|background/) && nextState === 'active') {
        callback();
      }
      previousState.current = nextState;
    });

    return () => subscription.remove();
  }, [callback, ...deps]);
};

/**
 * Hook to run effect when app goes to background
 */
export const useOnAppBackground = (callback: () => void, deps: DependencyList = []): void => {
  const previousState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (previousState.current === 'active' && nextState.match(/inactive|background/)) {
        callback();
      }
      previousState.current = nextState;
    });

    return () => subscription.remove();
  }, [callback, ...deps]);
};

// ============================================================================
// SCREEN DIMENSIONS - Responsive design support
// ============================================================================

export interface ScreenDimensions {
  width: number;
  height: number;
  isPortrait: boolean;
  isLandscape: boolean;
  isSmallScreen: boolean;
  isMediumScreen: boolean;
  isLargeScreen: boolean;
}

/**
 * Hook to track screen dimensions reactively
 */
export const useScreenDimensions = (): ScreenDimensions => {
  const [dimensions, setDimensions] = useState(() => {
    const {width, height} = Dimensions.get('window');
    return {
      width,
      height,
      isPortrait: height >= width,
      isLandscape: width > height,
      isSmallScreen: width < 375,
      isMediumScreen: width >= 375 && width < 414,
      isLargeScreen: width >= 414,
    };
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({window}) => {
      setDimensions({
        width: window.width,
        height: window.height,
        isPortrait: window.height >= window.width,
        isLandscape: window.width > window.height,
        isSmallScreen: window.width < 375,
        isMediumScreen: window.width >= 375 && window.width < 414,
        isLargeScreen: window.width >= 414,
      });
    });

    return () => subscription?.remove();
  }, []);

  return dimensions;
};

// ============================================================================
// INTERVAL & TIMEOUT - Safe timing hooks
// ============================================================================

/**
 * Hook for interval that cleans up properly
 */
export const useInterval = (callback: () => void, delay: number | null): void => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
};

/**
 * Hook for timeout that cleans up properly
 */
export const useTimeout = (callback: () => void, delay: number | null): void => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setTimeout(() => savedCallback.current(), delay);
    return () => clearTimeout(id);
  }, [delay]);
};

// ============================================================================
// MOUNT STATE - Track if component is mounted
// ============================================================================

/**
 * Hook to track if component is mounted (for safe async updates)
 */
export const useIsMounted = (): (() => boolean) => {
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return useCallback(() => isMountedRef.current, []);
};

/**
 * Hook that provides a safe setState that only updates if mounted
 */
export const useSafeState = <T>(initialValue: T): [T, (value: T | ((prev: T) => T)) => void] => {
  const [state, setState] = useState(initialValue);
  const isMounted = useIsMounted();

  const safeSetState = useCallback(
    (value: T | ((prev: T) => T)) => {
      if (isMounted()) {
        setState(value);
      }
    },
    [isMounted],
  );

  return [state, safeSetState];
};

// ============================================================================
// LAZY INITIALIZATION - Defer expensive initial values
// ============================================================================

/**
 * Hook for lazy initialization of expensive values
 */
export const useLazy = <T>(factory: () => T): T => {
  const valueRef = useRef<T | null>(null);

  if (valueRef.current === null) {
    valueRef.current = factory();
  }

  return valueRef.current;
};

// ============================================================================
// STABLE CALLBACK - Stable reference for callbacks
// ============================================================================

/**
 * Hook to get a stable callback reference (always same reference)
 * Useful for event handlers that shouldn't cause re-renders
 */
export const useStableCallback = <T extends (...args: any[]) => any>(
  callback: T,
): T => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args) => callbackRef.current(...args)) as T,
    [],
  );
};

// ============================================================================
// ACTION LOCK - Prevent duplicate submissions/actions
// ============================================================================

/**
 * Hook to prevent duplicate action submissions (rate limiting)
 * Perfect for favorite buttons, vote submissions, form submissions
 * 
 * @param lockDurationMs - Minimum time between actions (default: 1000ms)
 * @returns { isLocked, lockAction, unlockAction }
 */
export const useActionLock = (lockDurationMs = 1000) => {
  const [isLocked, setIsLocked] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActionRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const lockAction = useCallback(() => {
    const now = Date.now();
    const timeSinceLastAction = now - lastActionRef.current;
    
    if (timeSinceLastAction < lockDurationMs) {
      return false; // Action is locked
    }

    setIsLocked(true);
    lastActionRef.current = now;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setIsLocked(false);
    }, lockDurationMs);

    return true; // Action is allowed
  }, [lockDurationMs]);

  const unlockAction = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsLocked(false);
  }, []);

  return { isLocked, lockAction, unlockAction };
};

/**
 * Hook to wrap an async action with rate limiting
 * Automatically prevents rapid repeated calls
 * 
 * @param action - The async action to wrap
 * @param lockDurationMs - Minimum time between actions (default: 1000ms)
 */
export const useRateLimitedAction = <T extends (...args: any[]) => Promise<any>>(
  action: T,
  lockDurationMs = 1000,
) => {
  const { isLocked, lockAction } = useActionLock(lockDurationMs);
  const [isExecuting, setIsExecuting] = useState(false);

  const execute = useCallback(async (...args: Parameters<T>): Promise<ReturnType<T> | null> => {
    if (!lockAction()) {
      return null; // Rate limited
    }

    setIsExecuting(true);
    try {
      return await action(...args);
    } finally {
      setIsExecuting(false);
    }
  }, [action, lockAction]);

  return { execute, isLocked, isExecuting };
};

export default {
  useDeferredValue,
  useDeferredRender,
  useDebounce,
  useDebouncedCallback,
  useThrottledCallback,
  useDeepMemo,
  usePrevious,
  useAppState,
  useOnAppForeground,
  useOnAppBackground,
  useScreenDimensions,
  useInterval,
  useTimeout,
  useIsMounted,
  useSafeState,
  useLazy,
  useStableCallback,
  useActionLock,
  useRateLimitedAction,
};

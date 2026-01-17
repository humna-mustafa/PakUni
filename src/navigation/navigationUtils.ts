/**
 * Type-Safe Navigation Utilities
 * Enterprise-grade navigation helpers with full TypeScript support
 */

import {
  useNavigation as useNavigationNative,
  useRoute as useRouteNative,
  NavigationProp,
  RouteProp,
  CommonActions,
  StackActions,
  ParamListBase,
} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useCallback} from 'react';
import {Haptics} from '../utils/haptics';
import {analytics, ANALYTICS_EVENTS} from '../services/analytics';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Root stack parameter list - all screens and their params
 */
export type RootStackParamList = {
  // Main tabs container
  MainTabs: undefined;
  
  // University screens
  UniversityDetail: {universityId: string; universityName?: string};
  
  // Calculator screens
  Calculator: {
    prefilledMarks?: {
      matricMarks?: number;
      matricTotal?: number;
      fscMarks?: number;
      fscTotal?: number;
    };
  } | undefined;
  
  // Comparison screens
  Compare: {
    universityIds?: string[];
    compareType?: 'universities' | 'programs';
  } | undefined;
  
  // Entry tests
  EntryTests: {
    testId?: string;
    category?: string;
  } | undefined;
  
  // Career guidance
  CareerGuidance: {
    careerPath?: string;
    fromQuiz?: boolean;
  } | undefined;
  
  // Recommendations
  Recommendations: {
    filters?: Record<string, any>;
    source?: 'quiz' | 'profile' | 'manual';
  } | undefined;
  
  // Kids zone screens
  CareerExplorerKids: undefined;
  InterestQuiz: {
    quizType?: 'career' | 'subject' | 'personality';
    retake?: boolean;
  } | undefined;
  GoalSetting: undefined;
  SubjectGuide: {subject?: string} | undefined;
  KidsHub: undefined;
  CareerRoadmaps: {careerId?: string} | undefined;
  StudyTips: {category?: string} | undefined;
};

/**
 * Tab navigator parameter list
 */
export type TabParamList = {
  Home: undefined;
  Universities: {
    filter?: string;
    sortBy?: string;
  } | undefined;
  Scholarships: {
    filter?: string;
    eligibility?: string;
  } | undefined;
  Profile: {
    tab?: 'info' | 'favorites' | 'settings';
  } | undefined;
};

/**
 * Combined param list for full type checking
 */
export type AllParamList = RootStackParamList & TabParamList;

/**
 * Screen names union type
 */
export type ScreenName = keyof AllParamList;

/**
 * Navigation prop type for any screen
 */
export type AppNavigationProp<T extends keyof AllParamList = keyof AllParamList> = 
  NativeStackNavigationProp<AllParamList, T>;

/**
 * Route prop type for any screen
 */
export type AppRouteProp<T extends keyof AllParamList> = RouteProp<AllParamList, T>;

// ============================================================================
// NAVIGATION HOOKS
// ============================================================================

/**
 * Type-safe navigation hook
 */
export const useNavigation = <T extends keyof AllParamList = keyof AllParamList>() => {
  return useNavigationNative<AppNavigationProp<T>>();
};

/**
 * Type-safe route hook
 */
export const useRoute = <T extends keyof AllParamList>() => {
  return useRouteNative<AppRouteProp<T>>();
};

/**
 * Enhanced navigation hook with analytics and haptics
 */
export const useEnhancedNavigation = <T extends keyof AllParamList = keyof AllParamList>() => {
  const navigation = useNavigationNative<AppNavigationProp<T>>();

  /**
   * Navigate to screen with analytics tracking
   */
  const navigateTo = useCallback(
    <S extends keyof AllParamList>(
      screen: S,
      params?: AllParamList[S],
      options?: {
        haptic?: boolean;
        track?: boolean;
        replace?: boolean;
      },
    ) => {
      const {haptic = true, track = true, replace = false} = options || {};

      // Haptic feedback
      if (haptic) {
        Haptics.light();
      }

      // Analytics tracking
      if (track) {
        analytics.trackScreen(screen as string, params ? {
          params_json: JSON.stringify(params),
        } : undefined);
      }

      // Navigate
      if (replace) {
        (navigation as any).replace(screen as string, params);
      } else {
        (navigation as any).navigate(screen as string, params);
      }
    },
    [navigation],
  );

  /**
   * Go back with optional haptic feedback
   */
  const goBack = useCallback(
    (options?: {haptic?: boolean}) => {
      const {haptic = true} = options || {};

      if (haptic) {
        Haptics.light();
      }

      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    },
    [navigation],
  );

  /**
   * Pop to top of stack
   */
  const popToTop = useCallback(
    (options?: {haptic?: boolean}) => {
      const {haptic = true} = options || {};

      if (haptic) {
        Haptics.medium();
      }

      navigation.dispatch(StackActions.popToTop());
    },
    [navigation],
  );

  /**
   * Reset navigation state
   */
  const reset = useCallback(
    (routes: {name: keyof AllParamList; params?: any}[], index = 0) => {
      navigation.dispatch(
        CommonActions.reset({
          index,
          routes: routes.map(r => ({
            name: r.name as string,
            params: r.params,
          })),
        }),
      );
    },
    [navigation],
  );

  /**
   * Push screen onto stack
   */
  const push = useCallback(
    <S extends keyof AllParamList>(
      screen: S,
      params?: AllParamList[S],
    ) => {
      Haptics.light();
      navigation.dispatch(StackActions.push(screen as string, params));
    },
    [navigation],
  );

  /**
   * Replace current screen
   */
  const replace = useCallback(
    <S extends keyof AllParamList>(
      screen: S,
      params?: AllParamList[S],
    ) => {
      Haptics.light();
      navigation.dispatch(StackActions.replace(screen as string, params));
    },
    [navigation],
  );

  /**
   * Navigate to tab
   */
  const navigateToTab = useCallback(
    <T extends keyof TabParamList>(tab: T, params?: TabParamList[T]) => {
      Haptics.light();
      (navigation as any).navigate('MainTabs', {
        screen: tab,
        params,
      });
    },
    [navigation],
  );

  return {
    navigation,
    navigateTo,
    goBack,
    popToTop,
    reset,
    push,
    replace,
    navigateToTab,
    canGoBack: navigation.canGoBack,
    isFocused: navigation.isFocused,
    getState: navigation.getState,
  };
};

// ============================================================================
// ROUTE PARAMS HOOKS
// ============================================================================

/**
 * Get typed route params
 */
export const useRouteParams = <T extends keyof AllParamList>(): AllParamList[T] | undefined => {
  const route = useRouteNative<RouteProp<AllParamList, T>>();
  return route.params as AllParamList[T] | undefined;
};

/**
 * Get route param with default value
 */
export const useRouteParam = <
  T extends keyof AllParamList,
  K extends keyof NonNullable<AllParamList[T]>,
>(
  key: K,
  defaultValue?: NonNullable<AllParamList[T]>[K],
): NonNullable<AllParamList[T]>[K] | undefined => {
  const route = useRouteNative<RouteProp<AllParamList, T>>();
  const params = route.params as AllParamList[T] | undefined;
  
  if (!params) return defaultValue;
  return (params as any)[key] ?? defaultValue;
};

// ============================================================================
// DEEP LINKING UTILITIES
// ============================================================================

/**
 * Deep link configuration for the app
 */
export const deepLinkConfig = {
  prefixes: ['pakuni://'],
  config: {
    screens: {
      MainTabs: {
        screens: {
          Home: 'home',
          Universities: 'universities',
          Scholarships: 'scholarships',
          Profile: 'profile',
        },
      },
      UniversityDetail: 'university/:universityId',
      Calculator: 'calculator',
      Compare: 'compare',
      EntryTests: 'entry-tests/:testId?',
      CareerGuidance: 'careers',
      Recommendations: 'recommendations',
      InterestQuiz: 'quiz/:quizType?',
      KidsHub: 'kids',
      CareerRoadmaps: 'roadmaps/:careerId?',
      StudyTips: 'study-tips/:category?',
    },
  },
};

/**
 * Generate deep link URL for a screen
 */
export const generateDeepLink = <T extends keyof AllParamList>(
  screen: T,
  params?: AllParamList[T],
  options?: {
    scheme?: 'app' | 'web';
  },
): string => {
  const {scheme = 'app'} = options || {};
  const base = 'pakuni://'; // App scheme only

  // Map screen to path
  const screenPaths: Record<string, string> = {
    Home: 'home',
    Universities: 'universities',
    Scholarships: 'scholarships',
    Profile: 'profile',
    UniversityDetail: 'university',
    Calculator: 'calculator',
    Compare: 'compare',
    EntryTests: 'entry-tests',
    CareerGuidance: 'careers',
    Recommendations: 'recommendations',
    InterestQuiz: 'quiz',
    KidsHub: 'kids',
    CareerRoadmaps: 'roadmaps',
    StudyTips: 'study-tips',
    MainTabs: '',
    CareerExplorerKids: 'kids/explore',
    GoalSetting: 'kids/goals',
    SubjectGuide: 'kids/subjects',
  };

  const path = screenPaths[screen as string] || screen.toLowerCase();
  
  // Add params to URL
  if (params && typeof params === 'object') {
    const queryParams = Object.entries(params)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
      .join('&');
    
    if (queryParams) {
      return `${base}${path}?${queryParams}`;
    }
  }

  return `${base}${path}`;
};

/**
 * Parse deep link URL to screen and params
 */
export const parseDeepLink = (url: string): {
  screen: keyof AllParamList | null;
  params: Record<string, any>;
} => {
  try {
    const cleaned = url
      .replace('pakuni://', ''); // App scheme only

    const [path, queryString] = cleaned.split('?');
    const segments = path.split('/').filter(Boolean);

    // Parse query params
    const params: Record<string, any> = {};
    if (queryString) {
      queryString.split('&').forEach(pair => {
        const [key, value] = pair.split('=');
        if (key) {
          params[key] = decodeURIComponent(value || '');
        }
      });
    }

    // Map path to screen
    const pathToScreen: Record<string, keyof AllParamList> = {
      home: 'MainTabs',
      universities: 'Universities',
      scholarships: 'Scholarships',
      profile: 'Profile',
      university: 'UniversityDetail',
      calculator: 'Calculator',
      compare: 'Compare',
      'entry-tests': 'EntryTests',
      careers: 'CareerGuidance',
      recommendations: 'Recommendations',
      quiz: 'InterestQuiz',
      kids: 'KidsHub',
      roadmaps: 'CareerRoadmaps',
      'study-tips': 'StudyTips',
    };

    const screen = pathToScreen[segments[0]] || null;

    // Handle path params (e.g., /university/123)
    if (segments.length > 1) {
      if (screen === 'UniversityDetail') {
        params.universityId = segments[1];
      } else if (screen === 'EntryTests') {
        params.testId = segments[1];
      }
    }

    return {screen, params};
  } catch {
    return {screen: null, params: {}};
  }
};

// ============================================================================
// NAVIGATION STATE UTILITIES
// ============================================================================

/**
 * Get current route name
 */
export const getCurrentRouteName = (state: any): string | undefined => {
  if (!state) return undefined;

  const route = state.routes[state.index];
  if (route.state) {
    return getCurrentRouteName(route.state);
  }
  return route.name;
};

/**
 * Check if route is focused
 */
export const isRouteFocused = (state: any, routeName: string): boolean => {
  const currentRoute = getCurrentRouteName(state);
  return currentRoute === routeName;
};

// ============================================================================
// SCREEN TRANSITION PRESETS
// ============================================================================

export const screenTransitions = {
  default: {
    animation: 'slide_from_right' as const,
  },
  modal: {
    animation: 'slide_from_bottom' as const,
    presentation: 'modal' as const,
  },
  fade: {
    animation: 'fade' as const,
  },
  none: {
    animation: 'none' as const,
  },
  fullScreenModal: {
    presentation: 'fullScreenModal' as const,
    animation: 'slide_from_bottom' as const,
  },
};

export default {
  useNavigation,
  useRoute,
  useEnhancedNavigation,
  useRouteParams,
  useRouteParam,
  deepLinkConfig,
  generateDeepLink,
  parseDeepLink,
  getCurrentRouteName,
  isRouteFocused,
  screenTransitions,
};

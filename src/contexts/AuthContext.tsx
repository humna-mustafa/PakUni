/**
 * AuthContext - Complete Authentication System
 * Supports: Google Sign-in, Email/Password, Guest Mode
 * Uses Supabase for backend authentication
 * 
 * FREE TIER OPTIMIZATIONS:
 * - No session timeout (users stay logged in until explicit logout)
 * - Profile fetch throttling (5 min window)
 * - Debounced profile updates (2 sec batch)
 * - Local-first with background sync
 * - Cached profile for fast startup
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert} from 'react-native';
import {logger} from '../utils/logger';
import {supabase} from '../services/supabase';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

// ============================================================================
// TYPES
// ============================================================================

export type AuthProvider = 'google' | 'email' | 'guest';

export type UserRole = 'user' | 'moderator' | 'content_editor' | 'admin' | 'super_admin';

export interface UserProfile {
  id: string;
  email: string | null;
  fullName: string;
  avatarUrl: string | null;
  phone: string | null;
  city: string | null;
  currentClass: string | null;
  board: string | null;
  school: string | null;
  matricMarks: number | null;
  interMarks: number | null;
  entryTestScore: number | null;
  targetField: string | null;
  targetUniversity: string | null;
  interests: string[];
  provider: AuthProvider;
  isGuest: boolean;
  createdAt: string;
  lastLoginAt: string;
  onboardingCompleted: boolean;
  notificationsEnabled: boolean;
  favoriteUniversities: string[];
  favoriteScholarships: string[];
  favoritePrograms: string[];
  recentlyViewed: {id: string; type: string; viewedAt: string}[];
  // Role-based access
  role: UserRole;
  isVerified: boolean;
  isBanned: boolean;
}

export interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  hasCompletedOnboarding: boolean;
  authError: string | null;
}

export interface AuthContextType extends AuthState {
  // Auth Actions
  signInWithGoogle: () => Promise<boolean>;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<boolean>;
  continueAsGuest: () => Promise<boolean>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  
  // Profile Actions
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  completeOnboarding: () => Promise<void>;
  
  // Favorites Actions
  addFavorite: (id: string, type: 'university' | 'scholarship' | 'program') => Promise<void>;
  removeFavorite: (id: string, type: 'university' | 'scholarship' | 'program') => Promise<void>;
  isFavorite: (id: string, type: 'university' | 'scholarship' | 'program') => boolean;
  
  // Recent Activity
  addToRecentlyViewed: (id: string, type: string) => Promise<void>;
  clearRecentlyViewed: () => Promise<void>;
  
  // Utils
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
  USER_PROFILE: '@pakuni_user_profile',
  AUTH_STATE: '@pakuni_auth_state',
  ONBOARDING: '@pakuni_onboarding_completed',
  GUEST_ID: '@pakuni_guest_id',
  FAVORITES: '@pakuni_favorites',
  RECENT: '@pakuni_recent',
  PROFILE_LAST_FETCH: '@pakuni_profile_last_fetch',
};

// ============================================================================
// FREE TIER OPTIMIZATION: No session timeout - keep users logged in
// Users should only logout when they explicitly choose to sign out
// This saves Supabase API calls and improves mobile UX
// ============================================================================

// Profile fetch throttle - don't re-fetch profile within this window
const PROFILE_FETCH_THROTTLE_MS = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const DEFAULT_USER: UserProfile = {
  id: '',
  email: null,
  fullName: 'Student',
  avatarUrl: null,
  phone: null,
  city: null,
  currentClass: '2nd Year (FSc/FA)',
  board: 'Punjab Board',
  school: null,
  matricMarks: null,
  interMarks: null,
  entryTestScore: null,
  targetField: null,
  targetUniversity: null,
  interests: [],
  provider: 'guest',
  isGuest: true,
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
  onboardingCompleted: false,
  notificationsEnabled: true,
  favoriteUniversities: [],
  favoriteScholarships: [],
  favoritePrograms: [],
  recentlyViewed: [],
  // Role defaults
  role: 'user',
  isVerified: false,
  isBanned: false,
};

const DEFAULT_STATE: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isGuest: false,
  hasCompletedOnboarding: false,
  authError: null,
};

// ============================================================================
// CONTEXT
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [state, setState] = useState<AuthState>(DEFAULT_STATE);

  // =========================================================================
  // FREE TIER OPTIMIZATION: No session timeout
  // Users stay logged in until they explicitly sign out
  // This is standard mobile app behavior and saves API calls
  // =========================================================================

  // Track last profile fetch to avoid redundant API calls
  const lastProfileFetchRef = useRef<number>(0);

  // Check if we should fetch profile (throttled)
  const shouldFetchProfile = useCallback(async (): Promise<boolean> => {
    const now = Date.now();
    const lastFetch = lastProfileFetchRef.current;
    
    // Don't fetch if we fetched recently
    if (lastFetch && (now - lastFetch) < PROFILE_FETCH_THROTTLE_MS) {
      return false;
    }
    
    return true;
  }, []);

  // =========================================================================
  // INITIALIZATION
  // =========================================================================

  useEffect(() => {
    // Configure Google Sign-In with Web Client ID
    // Scopes required for Supabase authentication
    GoogleSignin.configure({
      webClientId: '69201457652-q8n88n7sf55dl0sp70488agcrjctttc9.apps.googleusercontent.com',
      offlineAccess: false, // Set to false for better native compatibility
      scopes: ['email', 'profile'],
    });

    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check for local onboarding flag first
      const localOnboarding = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING);
      const isActuallyOnboarded = localOnboarding === 'true';

      // FREE TIER OPTIMIZATION: First try to use cached profile to avoid API call
      const storedProfile = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      
      if (storedProfile) {
        const profile = JSON.parse(storedProfile) as UserProfile;
        
        // Immediately set state with cached profile (fast startup)
        setState(prev => ({
          ...prev,
          user: profile,
          isLoading: false,
          isAuthenticated: true,
          isGuest: profile.isGuest,
          hasCompletedOnboarding: profile.onboardingCompleted || isActuallyOnboarded,
        }));
        
        // For non-guest users, verify session is still valid (but don't block UI)
        if (!profile.isGuest) {
          // Background validation - don't await
          supabase.auth.getSession().then(({data: {session}}) => {
            if (!session) {
              // Session expired - but don't auto-logout, keep cached data
              // User will be prompted on next API call if needed
              logger.debug('Session may have expired, keeping cached profile', null, 'Auth');
            }
          }).catch(() => {
            // Network error - keep cached profile, user stays logged in
            logger.debug('Could not validate session, keeping cached profile', null, 'Auth');
          });
        }
        return;
      }
      
      // No cached profile - check Supabase session
      const {data: {session}} = await supabase.auth.getSession();
      
      if (session?.user) {
        // User is logged in with Supabase - fetch profile
        await loadUserProfile(session.user.id, 'email', false);
      } else {
        setState(prev => ({...prev, isLoading: false}));
      }
    } catch (error) {
      logger.error('Auth initialization error', error, 'AuthContext');
      setState(prev => ({...prev, isLoading: false}));
    }

    // Listen for auth state changes (login/logout events only)
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user.id, 'email', false);
      } else if (event === 'SIGNED_OUT') {
        await clearLocalData();
        setState({...DEFAULT_STATE, isLoading: false});
      }
    });
  };

  /**
   * Load user profile with FREE TIER optimizations:
   * - Skip fetch if recently fetched (throttled)
   * - Cache profile locally for offline/fast access
   * - Only update login count on fresh logins, not app reopens
   */
  const loadUserProfile = async (userId: string, provider: AuthProvider, isNewLogin: boolean = true) => {
    try {
      // FREE TIER OPTIMIZATION: Check if we recently fetched (throttle)
      const now = Date.now();
      if (!isNewLogin && lastProfileFetchRef.current && (now - lastProfileFetchRef.current) < PROFILE_FETCH_THROTTLE_MS) {
        logger.debug('Profile fetch throttled, using cached data', null, 'Auth');
        return;
      }
      
      // Try to fetch from Supabase 'profiles' table (matches database schema)
      const {data, error} = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      // Update fetch timestamp
      lastProfileFetchRef.current = now;

      let profile: UserProfile;

      if (data && !error) {
        // Get avatar from Google if not in profile
        let avatarUrl = data.avatar_url;
        if (!avatarUrl && provider === 'google') {
          const {data: authUser} = await supabase.auth.getUser();
          avatarUrl = authUser?.user?.user_metadata?.picture 
            || authUser?.user?.user_metadata?.avatar_url 
            || null;
          
          // Update profile with avatar if found
          if (avatarUrl) {
            await supabase
              .from('profiles')
              .update({ avatar_url: avatarUrl })
              .eq('id', userId);
          }
        }
        
        // Map database field names (snake_case) to app field names (camelCase)
        profile = {
          ...DEFAULT_USER,
          id: data.id,
          email: data.email,
          fullName: data.full_name || 'Student',
          avatarUrl: avatarUrl,
          phone: data.phone,
          city: data.city,
          currentClass: data.current_class,
          board: data.board,
          school: data.school,
          matricMarks: data.matric_marks,
          interMarks: data.inter_marks,
          entryTestScore: data.entry_test_score,
          targetField: data.target_field,
          targetUniversity: data.target_university,
          interests: data.interests || [],
          provider,
          isGuest: false,
          createdAt: data.created_at,
          lastLoginAt: new Date().toISOString(),
          onboardingCompleted: data.onboarding_completed || false,
          notificationsEnabled: data.notifications_enabled ?? true,
          favoriteUniversities: data.favorite_universities || [],
          favoriteScholarships: data.favorite_scholarships || [],
          favoritePrograms: data.favorite_programs || [],
          recentlyViewed: data.recently_viewed || [],
          // Role-based fields from profiles table
          role: data.role || 'user',
          isVerified: data.is_verified || false,
          isBanned: data.is_banned || false,
        };

        // FREE TIER OPTIMIZATION: Only update login count on actual new logins
        // Not on app reopens or session restorations
        if (isNewLogin) {
          await supabase
            .from('profiles')
            .update({
              last_login_at: new Date().toISOString(),
              login_count: (data.login_count || 0) + 1,
            })
            .eq('id', userId);
        }
      } else {
        // Profile doesn't exist - create one now
        const {data: authUser} = await supabase.auth.getUser();
        const now = new Date().toISOString();
        
        logger.debug('Creating missing profile for user', {userId}, 'Auth');
        logger.debug('User metadata', authUser?.user?.user_metadata, 'Auth');
        
        // Google stores avatar in 'picture' or 'avatar_url' field
        const avatarUrl = authUser?.user?.user_metadata?.avatar_url 
          || authUser?.user?.user_metadata?.picture 
          || null;
        
        profile = {
          ...DEFAULT_USER,
          id: userId,
          email: authUser?.user?.email || null,
          fullName: authUser?.user?.user_metadata?.full_name || authUser?.user?.user_metadata?.name || 'Student',
          avatarUrl: avatarUrl,
          provider,
          isGuest: false,
          isVerified: !!authUser?.user?.confirmed_at,  // ✅ Add verification check
          isBanned: false,
          createdAt: now,
          lastLoginAt: now,
          role: authUser?.user?.user_metadata?.role || 'user',
        };
        
        // Save to Supabase profiles table (using snake_case for database)
        const {error: createError} = await supabase.from('profiles').upsert({
          id: profile.id,
          email: profile.email,
          full_name: profile.fullName,
          avatar_url: profile.avatarUrl,
          role: profile.role,
          is_verified: profile.isVerified,  // ✅ Add verification status
          is_banned: profile.isBanned,      // ✅ Add ban status
          created_at: now,
          updated_at: now,
          last_login_at: now,
          login_count: 1,
        });

        if (createError) {
          logger.error('Failed to create profile', createError, 'Auth');
          throw createError;
        }

        logger.info('Profile created successfully', {email: profile.email}, 'Auth');
      }

      const localOnboarding = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING);
      const isActuallyOnboarded = localOnboarding === 'true';

      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
      
      setState(prev => ({
        ...prev,
        user: profile,
        isLoading: false,
        isAuthenticated: true,
        isGuest: false,
        hasCompletedOnboarding: profile.onboardingCompleted || isActuallyOnboarded,
      }));

      logger.info('Profile loaded', {email: profile.email, role: profile.role}, 'Auth');
    } catch (error) {
      logger.error('Load profile error', error, 'Auth');
      setState(prev => ({...prev, isLoading: false}));
    }
  };

  // =========================================================================
  // AUTH ACTIONS
  // =========================================================================

  const signInWithGoogle = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({...prev, isLoading: true, authError: null}));

      // Check if Google Play Services are available
      try {
        await GoogleSignin.hasPlayServices();
      } catch (playServicesError: any) {
        logger.error('Google Play Services not available', playServicesError, 'Auth');
        let playServicesMsg = 'Google Play Services is not installed or needs updating';
        if (playServicesError?.message?.includes('SERVICE_MISSING')) {
          playServicesMsg = 'Google Play Services not installed. Please install or update from Play Store.';
        } else if (playServicesError?.message?.includes('SERVICE_DISABLED')) {
          playServicesMsg = 'Google Play Services is disabled. Enable it in Settings > Apps > Google Play Services';
        }
        throw new Error(playServicesMsg);
      }
      
      // Sign in with Google natively
      const userInfo = await GoogleSignin.signIn();
      
      logger.debug('Google sign-in successful, getting ID token...', null, 'Auth');
      
      // Get the ID token and access token
      const tokens = await GoogleSignin.getTokens();
      const idToken = tokens.idToken;
      const accessToken = tokens.accessToken;
      
      if (!idToken) {
        throw new Error('No ID token received from Google');
      }

      logger.debug('Signing in to Supabase with Google credentials...', null, 'Auth');
      
      // For Supabase, directly create user session from Google tokens
      // This bypasses the OAuth callback flow and uses native mobile auth
      const {data, error} = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: '', // Google doesn't provide refresh via native SDK
      });

      if (error) {
        logger.debug('Direct session method failed, trying signInWithIdToken...', error, 'Auth');
        
        // Fallback: Try signInWithIdToken as backup
        const {data: fallbackData, error: fallbackError} = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });
        
        if (fallbackError) {
          throw fallbackError;
        }
        
        if (!fallbackData.user) {
          throw new Error('Unable to create session with provided token');
        }
      }

      if (data.user) {
        logger.info('Supabase sign-in successful', {email: data.user.email}, 'Auth');
        await loadUserProfile(data.user.id, 'google', true); // true = new login
        return true;
      }

      return false;
    } catch (error: any) {
      logger.error('Google sign-in error', error, 'Auth');
      
      let errorMessage = 'Failed to sign in with Google';
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED || error.code === '12501') {
        errorMessage = 'Sign in was cancelled';
      } else if (error.code === statusCodes.IN_PROGRESS || error.code === '12502') {
        errorMessage = 'Sign in is already in progress';
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMessage = 'Google Play Services not available';
      } else if (error.code === '10' || error.code === 10 || 
                 (error.message && error.message.toLowerCase().includes('developer_error'))) {
        // DEVELOPER_ERROR - SHA-1 fingerprint mismatch between APK signing cert and Google Cloud Console
        // SOLUTION: Add this SHA-1 to Google Cloud Console OAuth credentials
        const sha1Fingerprint = '2D:63:FE:E0:E1:E8:25:D3:3B:4B:FE:8A:48:99:C3:7A:C6:D5:D1:66';
        errorMessage = `⚠️ Google Sign-In Setup Required\n\nTo fix this:\n1. Go to Google Cloud Console\n2. Add SHA-1: ${sha1Fingerprint}\n3. Reinstall the app\n\nAlternatively:\n• Use Email/Password\n• Continue as Guest`;
        logger.error('DEVELOPER_ERROR: SHA-1 Fingerprint Mismatch', {
          sha1: sha1Fingerprint,
          instruction: 'Add to Google Cloud Console > OAuth 2.0 > Android Credential',
          docLink: 'https://developers.google.com/identity/sign-in/android/start-integrating'
        }, 'Auth');
      } else if (error.code === '7') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.code === '12' || error.code === 12) {
        errorMessage = 'Unable to connect to Google servers. Try:\n1. Check WiFi/Mobile data\n2. Restart your device\n3. Update Google Play Services';
      } else if (error.message && (
        error.message.toLowerCase().includes('no internet') ||
        error.message.toLowerCase().includes('cannot resolve host') ||
        error.message.toLowerCase().includes('network') ||
        error.message.toLowerCase().includes('connection refused') ||
        error.message.toLowerCase().includes('unable to connect')
      )) {
        errorMessage = '🌐 Connection Issue\n\nCould not reach Google servers. Check:\n• WiFi/Mobile data is active\n• Not using restrictive VPN\n• Device date/time is correct\n• Google Play Services is updated';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        authError: errorMessage,
      }));
      return false;
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setState(prev => ({...prev, isLoading: true, authError: null}));

      const {data, error} = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Check if user email is confirmed
        if (!data.user.confirmed_at) {
          throw new Error(
            'Email not verified. Please check your inbox for the verification link.'
          );
        }

        await loadUserProfile(data.user.id, 'email', true); // true = new login
        return true;
      }

      return false;
    } catch (error: any) {
      logger.error('Email sign-in error', error, 'Auth');
      setState(prev => ({
        ...prev,
        isLoading: false,
        authError: error.message || 'Invalid email or password',
      }));
      return false;
    }
  }, []);

  const signUpWithEmail = useCallback(async (
    email: string,
    password: string,
    name: string
  ): Promise<boolean> => {
    try {
      setState(prev => ({...prev, isLoading: true, authError: null}));

      const {data, error} = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        const now = new Date().toISOString();
        
        // Create profile with all required fields
        const {error: profileError} = await supabase.from('profiles').upsert({
          id: data.user.id,
          email: data.user.email || null,
          full_name: name,
          role: 'user',
          is_verified: !!data.user.confirmed_at,  // ✅ Add verification status
          is_banned: false,                         // ✅ Add ban status
          avatar_url: null,                         // ✅ Add avatar field
          created_at: now,
          updated_at: now,
          last_login_at: now,
          login_count: 1,
        });

        if (profileError) {
          logger.error('Profile creation error', profileError, 'Auth');
          throw new Error(`Failed to create profile: ${profileError.message}`);
        }

        // Create initial profile object
        const profile: UserProfile = {
          ...DEFAULT_USER,
          id: data.user.id,
          email: data.user.email || null,
          fullName: name,
          provider: 'email',
          isGuest: false,
          isVerified: !!data.user.confirmed_at,
          isBanned: false,
          createdAt: now,
          lastLoginAt: now,
        };
        
        const localOnboarding = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING);
        const isActuallyOnboarded = localOnboarding === 'true';

        await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));

        setState(prev => ({
          ...prev,
          user: profile,
          isLoading: false,
          isAuthenticated: true,
          isGuest: false,
          hasCompletedOnboarding: isActuallyOnboarded,
        }));

        return true;
      }

      throw new Error('User creation failed: No user returned');
    } catch (error: any) {
      logger.error('Email sign-up error', error, 'Auth');
      setState(prev => ({
        ...prev,
        isLoading: false,
        authError: error.message || 'Failed to create account',
      }));
      return false;
    }
  }, []);

  const continueAsGuest = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({...prev, isLoading: true, authError: null}));

      // Generate unique guest ID
      let guestId = await AsyncStorage.getItem(STORAGE_KEYS.GUEST_ID);
      if (!guestId) {
        guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        await AsyncStorage.setItem(STORAGE_KEYS.GUEST_ID, guestId);
      }

      const profile: UserProfile = {
        ...DEFAULT_USER,
        id: guestId,
        provider: 'guest',
        isGuest: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      const localOnboarding = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING);
      const isActuallyOnboarded = localOnboarding === 'true';

      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));

      setState(prev => ({
        ...prev,
        user: profile,
        isLoading: false,
        isAuthenticated: true,
        isGuest: true,
        hasCompletedOnboarding: isActuallyOnboarded,
      }));

      return true;
    } catch (error: any) {
      logger.error('Guest mode error', error, 'Auth');
      setState(prev => ({
        ...prev,
        isLoading: false,
        authError: 'Failed to continue as guest',
      }));
      return false;
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({...prev, isLoading: true}));

      // Sign out from Supabase if not guest
      if (!state.isGuest) {
        await supabase.auth.signOut();
      }

      await clearLocalData();
    } catch (error) {
      logger.error('Sign out error', error, 'Auth');
    } finally {
      setState({
        ...DEFAULT_STATE,
        isLoading: false,
      });
    }
  }, [state.isGuest]);

  const resetPassword = useCallback(async (email: string): Promise<boolean> => {
    try {
      const {error} = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'pakuni://auth/reset-password',
      });

      if (error) {
        throw error;
      }

      Alert.alert(
        'Password Reset',
        'Check your email for the password reset link.',
        [{text: 'OK'}]
      );

      return true;
    } catch (error: any) {
      logger.error('Password reset error', error, 'Auth');
      Alert.alert('Error', error.message || 'Failed to send reset email');
      return false;
    }
  }, []);

  // =========================================================================
  // PROFILE ACTIONS
  // FREE TIER OPTIMIZATION: Debounce profile updates to batch API calls
  // =========================================================================

  // Debounce timer for profile updates
  const profileUpdateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdatesRef = useRef<Partial<UserProfile>>({});

  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<boolean> => {
    try {
      if (!state.user) return false;

      // Merge with pending updates
      pendingUpdatesRef.current = {...pendingUpdatesRef.current, ...updates};

      const updatedProfile = {
        ...state.user,
        ...pendingUpdatesRef.current,
      };

      // Update local storage immediately (optimistic update)
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updatedProfile));
      
      // Update state immediately
      setState(prev => ({
        ...prev,
        user: updatedProfile,
      }));

      // FREE TIER OPTIMIZATION: Debounce Supabase updates
      // Wait 2 seconds for more updates before sending to server
      if (!state.isGuest) {
        if (profileUpdateTimerRef.current) {
          clearTimeout(profileUpdateTimerRef.current);
        }
        
        profileUpdateTimerRef.current = setTimeout(async () => {
          const pendingUpdates = {...pendingUpdatesRef.current};
          pendingUpdatesRef.current = {}; // Clear pending
          
          const dbUpdates: Record<string, any> = {
            updated_at: new Date().toISOString(),
          };
          
          // Map camelCase to snake_case for database
          if (pendingUpdates.fullName !== undefined) dbUpdates.full_name = pendingUpdates.fullName;
          if (pendingUpdates.avatarUrl !== undefined) dbUpdates.avatar_url = pendingUpdates.avatarUrl;
          if (pendingUpdates.phone !== undefined) dbUpdates.phone = pendingUpdates.phone;
          if (pendingUpdates.city !== undefined) dbUpdates.city = pendingUpdates.city;
          if (pendingUpdates.currentClass !== undefined) dbUpdates.current_class = pendingUpdates.currentClass;
          if (pendingUpdates.board !== undefined) dbUpdates.board = pendingUpdates.board;
          if (pendingUpdates.school !== undefined) dbUpdates.school = pendingUpdates.school;
          if (pendingUpdates.matricMarks !== undefined) dbUpdates.matric_marks = pendingUpdates.matricMarks;
          if (pendingUpdates.interMarks !== undefined) dbUpdates.inter_marks = pendingUpdates.interMarks;
          if (pendingUpdates.entryTestScore !== undefined) dbUpdates.entry_test_score = pendingUpdates.entryTestScore;
          if (pendingUpdates.targetField !== undefined) dbUpdates.target_field = pendingUpdates.targetField;
          if (pendingUpdates.targetUniversity !== undefined) dbUpdates.target_university = pendingUpdates.targetUniversity;
          if (pendingUpdates.interests !== undefined) dbUpdates.interests = pendingUpdates.interests;
          if (pendingUpdates.onboardingCompleted !== undefined) dbUpdates.onboarding_completed = pendingUpdates.onboardingCompleted;
          if (pendingUpdates.notificationsEnabled !== undefined) dbUpdates.notifications_enabled = pendingUpdates.notificationsEnabled;
          if (pendingUpdates.favoriteUniversities !== undefined) dbUpdates.favorite_universities = pendingUpdates.favoriteUniversities;
          if (pendingUpdates.favoriteScholarships !== undefined) dbUpdates.favorite_scholarships = pendingUpdates.favoriteScholarships;
          if (pendingUpdates.favoritePrograms !== undefined) dbUpdates.favorite_programs = pendingUpdates.favoritePrograms;
          if (pendingUpdates.recentlyViewed !== undefined) dbUpdates.recently_viewed = pendingUpdates.recentlyViewed;

          // Only make API call if there are actual updates
          if (Object.keys(dbUpdates).length > 1) { // More than just updated_at
            try {
              await supabase
                .from('profiles')
                .update(dbUpdates)
                .eq('id', state.user?.id);
              logger.debug('Profile synced to Supabase', {fields: Object.keys(dbUpdates)}, 'Auth');
            } catch (error) {
              logger.error('Background profile sync error', error, 'Auth');
              // Data is still saved locally, will sync on next update
            }
          }
        }, 2000); // 2 second debounce
      }

      return true;
    } catch (error) {
      logger.error('Update profile error', error, 'Auth');
      return false;
    }
  }, [state.user, state.isGuest]);

  const completeOnboarding = useCallback(async (): Promise<void> => {
    try {
      // 1. Update local state and flag
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING, 'true');
      
      if (state.user) {
        const updatedProfile = {...state.user, onboardingCompleted: true};
        await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updatedProfile));
        
        setState(prev => ({
          ...prev,
          user: updatedProfile,
          hasCompletedOnboarding: true,
        }));

        // 2. Sync to Supabase IMMEDIATELY (no debounce for this critical flag)
        if (!state.isGuest) {
          await supabase
            .from('profiles')
            .update({
              onboarding_completed: true,
              updated_at: new Date().toISOString(),
            })
            .eq('id', state.user.id);
          logger.info('Onboarding status synced to Supabase', null, 'Auth');
        }
      } else {
        setState(prev => ({...prev, hasCompletedOnboarding: true}));
      }
    } catch (error) {
      logger.error('Error completing onboarding', error, 'Auth');
      // Still set local state to true so user isn't stuck
      setState(prev => ({...prev, hasCompletedOnboarding: true}));
    }
  }, [state.user, state.isGuest]);

  // =========================================================================
  // FAVORITES
  // =========================================================================

  const addFavorite = useCallback(async (
    id: string,
    type: 'university' | 'scholarship' | 'program'
  ): Promise<void> => {
    if (!state.user) return;

    const key = type === 'university' 
      ? 'favoriteUniversities' 
      : type === 'scholarship' 
        ? 'favoriteScholarships' 
        : 'favoritePrograms';

    const currentFavorites = state.user[key] || [];
    if (!currentFavorites.includes(id)) {
      await updateProfile({
        [key]: [...currentFavorites, id],
      });
    }
  }, [state.user, updateProfile]);

  const removeFavorite = useCallback(async (
    id: string,
    type: 'university' | 'scholarship' | 'program'
  ): Promise<void> => {
    if (!state.user) return;

    const key = type === 'university' 
      ? 'favoriteUniversities' 
      : type === 'scholarship' 
        ? 'favoriteScholarships' 
        : 'favoritePrograms';

    const currentFavorites = state.user[key] || [];
    await updateProfile({
      [key]: currentFavorites.filter(fav => fav !== id),
    });
  }, [state.user, updateProfile]);

  const isFavorite = useCallback((
    id: string,
    type: 'university' | 'scholarship' | 'program'
  ): boolean => {
    if (!state.user) return false;

    const key = type === 'university' 
      ? 'favoriteUniversities' 
      : type === 'scholarship' 
        ? 'favoriteScholarships' 
        : 'favoritePrograms';

    return (state.user[key] || []).includes(id);
  }, [state.user]);

  // =========================================================================
  // RECENT ACTIVITY
  // =========================================================================

  const addToRecentlyViewed = useCallback(async (id: string, type: string): Promise<void> => {
    if (!state.user) return;

    const recent = state.user.recentlyViewed || [];
    const filtered = recent.filter(item => !(item.id === id && item.type === type));
    const updated = [
      {id, type, viewedAt: new Date().toISOString()},
      ...filtered,
    ].slice(0, 20); // Keep only last 20 items

    await updateProfile({recentlyViewed: updated});
  }, [state.user, updateProfile]);

  const clearRecentlyViewed = useCallback(async (): Promise<void> => {
    await updateProfile({recentlyViewed: []});
  }, [updateProfile]);

  // =========================================================================
  // UTILS
  // =========================================================================

  /**
   * Refresh user profile from server
   * FREE TIER OPTIMIZATION: Use this only when user explicitly requests refresh
   * (e.g., pull-to-refresh), not automatically
   */
  const refreshUser = useCallback(async (): Promise<void> => {
    if (!state.user) return;

    if (!state.isGuest) {
      // Force refresh by resetting the throttle timestamp
      lastProfileFetchRef.current = 0;
      await loadUserProfile(state.user.id, state.user.provider, false);
    }
  }, [state.user, state.isGuest]);

  const clearError = useCallback((): void => {
    setState(prev => ({...prev, authError: null}));
  }, []);

  const clearLocalData = async () => {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_PROFILE,
      STORAGE_KEYS.AUTH_STATE,
      STORAGE_KEYS.FAVORITES,
      STORAGE_KEYS.RECENT,
    ]);
  };

  // =========================================================================
  // CONTEXT VALUE
  // =========================================================================

  const value = useMemo<AuthContextType>(() => ({
    ...state,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    continueAsGuest,
    signOut,
    resetPassword,
    updateProfile,
    completeOnboarding,
    addFavorite,
    removeFavorite,
    isFavorite,
    addToRecentlyViewed,
    clearRecentlyViewed,
    refreshUser,
    clearError,
  }), [
    state,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    continueAsGuest,
    signOut,
    resetPassword,
    updateProfile,
    completeOnboarding,
    addFavorite,
    removeFavorite,
    isFavorite,
    addToRecentlyViewed,
    clearRecentlyViewed,
    refreshUser,
    clearError,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

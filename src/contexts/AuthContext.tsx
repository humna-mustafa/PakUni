/**
 * AuthContext - Complete Authentication System
 * Supports: Google Sign-in, Email/Password, Guest Mode
 * Uses Supabase for backend authentication
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert, Platform} from 'react-native';
import {supabase} from '../services/supabase';

// ============================================================================
// TYPES
// ============================================================================

export type AuthProvider = 'google' | 'email' | 'guest';

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
};

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
  // INITIALIZATION
  // =========================================================================

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check for existing session
      const {data: {session}} = await supabase.auth.getSession();
      
      if (session?.user) {
        // User is logged in with Supabase
        await loadUserProfile(session.user.id, 'email');
      } else {
        // Check for guest session
        const storedProfile = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
        if (storedProfile) {
          const profile = JSON.parse(storedProfile) as UserProfile;
          setState(prev => ({
            ...prev,
            user: profile,
            isLoading: false,
            isAuthenticated: true,
            isGuest: profile.isGuest,
            hasCompletedOnboarding: profile.onboardingCompleted,
          }));
        } else {
          setState(prev => ({...prev, isLoading: false}));
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setState(prev => ({...prev, isLoading: false}));
    }

    // Listen for auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user.id, 'email');
      } else if (event === 'SIGNED_OUT') {
        await clearLocalData();
      }
    });
  };

  const loadUserProfile = async (userId: string, provider: AuthProvider) => {
    try {
      // Try to fetch from Supabase
      const {data, error} = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      let profile: UserProfile;

      if (data && !error) {
        profile = {
          ...DEFAULT_USER,
          ...data,
          provider,
          isGuest: false,
          lastLoginAt: new Date().toISOString(),
        };
      } else {
        // Create new profile
        const {data: authUser} = await supabase.auth.getUser();
        profile = {
          ...DEFAULT_USER,
          id: userId,
          email: authUser?.user?.email || null,
          fullName: authUser?.user?.user_metadata?.full_name || 'Student',
          avatarUrl: authUser?.user?.user_metadata?.avatar_url || null,
          provider,
          isGuest: false,
        };
        
        // Save to Supabase
        await supabase.from('user_profiles').upsert(profile);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
      
      setState(prev => ({
        ...prev,
        user: profile,
        isLoading: false,
        isAuthenticated: true,
        isGuest: false,
        hasCompletedOnboarding: profile.onboardingCompleted,
      }));
    } catch (error) {
      console.error('Load profile error:', error);
      setState(prev => ({...prev, isLoading: false}));
    }
  };

  // =========================================================================
  // AUTH ACTIONS
  // =========================================================================

  const signInWithGoogle = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({...prev, isLoading: true, authError: null}));

      const {data, error} = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'pakuni://auth/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        throw error;
      }

      // OAuth will redirect, so we wait for the callback
      return true;
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        authError: error.message || 'Failed to sign in with Google',
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
        await loadUserProfile(data.user.id, 'email');
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Email sign-in error:', error);
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
        // Create initial profile
        const profile: UserProfile = {
          ...DEFAULT_USER,
          id: data.user.id,
          email: data.user.email || null,
          fullName: name,
          provider: 'email',
          isGuest: false,
        };

        await supabase.from('user_profiles').insert(profile);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));

        setState(prev => ({
          ...prev,
          user: profile,
          isLoading: false,
          isAuthenticated: true,
          isGuest: false,
        }));

        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Email sign-up error:', error);
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

      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));

      setState(prev => ({
        ...prev,
        user: profile,
        isLoading: false,
        isAuthenticated: true,
        isGuest: true,
        hasCompletedOnboarding: false,
      }));

      return true;
    } catch (error: any) {
      console.error('Guest mode error:', error);
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
      console.error('Sign out error:', error);
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
      console.error('Password reset error:', error);
      Alert.alert('Error', error.message || 'Failed to send reset email');
      return false;
    }
  }, []);

  // =========================================================================
  // PROFILE ACTIONS
  // =========================================================================

  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<boolean> => {
    try {
      if (!state.user) return false;

      const updatedProfile = {
        ...state.user,
        ...updates,
      };

      // Update local storage
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updatedProfile));

      // Update Supabase if not guest
      if (!state.isGuest) {
        await supabase.from('user_profiles').upsert(updatedProfile);
      }

      setState(prev => ({
        ...prev,
        user: updatedProfile,
      }));

      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  }, [state.user, state.isGuest]);

  const completeOnboarding = useCallback(async (): Promise<void> => {
    await updateProfile({onboardingCompleted: true});
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING, 'true');
    setState(prev => ({...prev, hasCompletedOnboarding: true}));
  }, [updateProfile]);

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

  const refreshUser = useCallback(async (): Promise<void> => {
    if (!state.user) return;

    if (!state.isGuest) {
      await loadUserProfile(state.user.id, state.user.provider);
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

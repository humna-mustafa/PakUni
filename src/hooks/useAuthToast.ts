/**
 * useAuthToast - Authentication with Beautiful Toast Notifications
 * Wraps auth functions to show premium toast feedback instead of Alert.alert
 * 
 * Provides user-friendly error messages with helpful hints and retry options
 */

import {useCallback} from 'react';
import {useAuth} from '../contexts/AuthContext';
import {useToast} from '../components/PremiumToast';
import {logger} from '../utils/logger';
import {Haptics} from '../utils/haptics';

// ============================================================================
// TYPES
// ============================================================================

interface AuthToastHook {
  // Auth actions with toast feedback
  signInWithGoogle: () => Promise<boolean>;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<boolean>;
  continueAsGuest: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  
  // Validation helpers
  validateEmail: (email: string) => boolean;
  validatePassword: (password: string) => string | null;
  validateName: (name: string) => string | null;
  
  // State from auth context
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  hasCompletedOnboarding: boolean;
  user: ReturnType<typeof useAuth>['user'];
}

// ============================================================================
// ERROR MESSAGES MAPPING
// ============================================================================

const GOOGLE_ERROR_MESSAGES: Record<string, {
  title: string;
  message: string;
  hint?: string;
}> = {
  // Standard Google Sign-In errors
  SIGN_IN_CANCELLED: {
    title: 'Sign In Cancelled',
    message: 'You cancelled the sign in process.',
    hint: 'Tap "Continue with Google" to try again',
  },
  IN_PROGRESS: {
    title: 'Please Wait',
    message: 'Sign in is already in progress.',
    hint: 'Wait a moment and try again',
  },
  PLAY_SERVICES_NOT_AVAILABLE: {
    title: 'Google Play Services Required',
    message: 'This device needs Google Play Services to sign in.',
    hint: 'Install or update Google Play Services from Play Store',
  },
  
  // Developer errors (common during setup)
  DEVELOPER_ERROR: {
    title: 'Configuration Issue',
    message: 'Google Sign-In is being set up for this device.',
    hint: 'Please try email login or guest mode for now',
  },
  '10': { // DEVELOPER_ERROR code
    title: 'Configuration Issue', 
    message: 'Google Sign-In is being set up for this device.',
    hint: 'Please try email login or guest mode for now',
  },
  '12501': { // SIGN_IN_CANCELLED code
    title: 'Sign In Cancelled',
    message: 'You cancelled the sign in process.',
    hint: 'Tap "Continue with Google" to try again',
  },
  '12502': { // IN_PROGRESS code
    title: 'Please Wait',
    message: 'Sign in is already in progress.',
  },
  '7': { // NETWORK_ERROR code
    title: 'Network Error',
    message: 'Could not connect to Google servers.',
    hint: 'Check your internet connection and try again',
  },
  
  // Supabase token errors
  'No ID token received': {
    title: 'Token Error',
    message: 'Could not get authentication token from Google.',
    hint: 'Try signing in again',
  },
  'Invalid token': {
    title: 'Authentication Failed',
    message: 'The login token was not accepted.',
    hint: 'Try signing out of Google and sign in again',
  },
};

const EMAIL_ERROR_MESSAGES: Record<string, {
  title: string;
  message: string;
  hint?: string;
}> = {
  'Invalid login credentials': {
    title: 'Invalid Credentials',
    message: 'Email or password is incorrect.',
    hint: 'Check your email and password, or reset your password',
  },
  'Email not confirmed': {
    title: 'Email Not Verified',
    message: 'Please verify your email to continue.',
    hint: 'Check your inbox for the verification link',
  },
  'User already registered': {
    title: 'Account Exists',
    message: 'An account with this email already exists.',
    hint: 'Try signing in instead, or use "Forgot Password"',
  },
  'Password should be at least 6 characters': {
    title: 'Weak Password',
    message: 'Password must be at least 6 characters long.',
    hint: 'Choose a stronger password',
  },
  'Invalid email': {
    title: 'Invalid Email',
    message: 'Please enter a valid email address.',
    hint: 'Check the email format (e.g., name@example.com)',
  },
  'Signup disabled': {
    title: 'Sign Up Unavailable',
    message: 'New account registration is temporarily disabled.',
    hint: 'Try again later or contact support',
  },
  'Rate limit exceeded': {
    title: 'Too Many Attempts',
    message: 'Please wait before trying again.',
    hint: 'Wait a few minutes and try again',
  },
};

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export const useAuthToast = (): AuthToastHook => {
  const auth = useAuth();
  const toast = useToast();

  // -------------------------------------------------------------------------
  // VALIDATION HELPERS
  // -------------------------------------------------------------------------

  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const validatePassword = useCallback((password: string): string | null => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
  }, []);

  const validateName = useCallback((name: string): string | null => {
    if (!name.trim()) return 'Name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    return null;
  }, []);

  // -------------------------------------------------------------------------
  // ERROR HANDLING HELPERS  
  // -------------------------------------------------------------------------

  const getGoogleErrorInfo = (error: any) => {
    // Check by error code first
    const codeStr = String(error.code);
    if (GOOGLE_ERROR_MESSAGES[codeStr]) {
      return GOOGLE_ERROR_MESSAGES[codeStr];
    }
    
    // Check by error message keywords
    const message = error.message?.toLowerCase() || '';
    if (message.includes('developer_error') || message.includes('developer error')) {
      return GOOGLE_ERROR_MESSAGES.DEVELOPER_ERROR;
    }
    if (message.includes('cancel')) {
      return GOOGLE_ERROR_MESSAGES.SIGN_IN_CANCELLED;
    }
    if (message.includes('network') || message.includes('connection')) {
      return GOOGLE_ERROR_MESSAGES['7'];
    }
    if (message.includes('token')) {
      return GOOGLE_ERROR_MESSAGES['No ID token received'];
    }
    
    // Default error
    return {
      title: 'Sign In Failed',
      message: error.message || 'Could not sign in with Google.',
      hint: 'Please try again or use another sign in method',
    };
  };

  const getEmailErrorInfo = (error: any) => {
    const message = error.message || '';
    
    // Check for exact matches first
    for (const [key, info] of Object.entries(EMAIL_ERROR_MESSAGES)) {
      if (message.toLowerCase().includes(key.toLowerCase())) {
        return info;
      }
    }
    
    // Default error
    return {
      title: 'Authentication Error',
      message: message || 'An error occurred. Please try again.',
      hint: 'Check your credentials and try again',
    };
  };

  // -------------------------------------------------------------------------
  // AUTH ACTIONS WITH TOAST
  // -------------------------------------------------------------------------

  const signInWithGoogle = useCallback(async (): Promise<boolean> => {
    try {
      const success = await auth.signInWithGoogle();
      
      if (success) {
        Haptics.success();
        toast.success('Welcome back! 🎉', 'Signed In');
        return true;
      }
      
      // If auth returned false with an error, show it
      if (auth.authError) {
        const errorInfo = getGoogleErrorInfo({message: auth.authError});
        Haptics.error();
        toast.show({
          type: 'error',
          title: errorInfo.title,
          message: errorInfo.hint 
            ? `${errorInfo.message}\n💡 ${errorInfo.hint}`
            : errorInfo.message,
          duration: 5000,
        });
        auth.clearError();
      }
      
      return false;
    } catch (error: any) {
      logger.error('Google sign-in toast error', error, 'AuthToast');
      const errorInfo = getGoogleErrorInfo(error);
      
      Haptics.error();
      toast.show({
        type: 'error',
        title: errorInfo.title,
        message: errorInfo.hint 
          ? `${errorInfo.message}\n💡 ${errorInfo.hint}`
          : errorInfo.message,
        duration: 5000,
      });
      
      return false;
    }
  }, [auth, toast]);

  const signInWithEmail = useCallback(async (
    email: string, 
    password: string
  ): Promise<boolean> => {
    // Validate inputs first
    if (!email.trim()) {
      Haptics.warning();
      toast.warning('Please enter your email address', 'Email Required');
      return false;
    }
    
    if (!validateEmail(email)) {
      Haptics.warning();
      toast.warning('Please enter a valid email address', 'Invalid Email');
      return false;
    }
    
    if (!password.trim()) {
      Haptics.warning();
      toast.warning('Please enter your password', 'Password Required');
      return false;
    }

    try {
      const success = await auth.signInWithEmail(email, password);
      
      if (success) {
        Haptics.success();
        toast.success('Welcome back! 🎉', 'Signed In');
        return true;
      }
      
      // Handle auth error
      if (auth.authError) {
        const errorInfo = getEmailErrorInfo({message: auth.authError});
        Haptics.error();
        toast.show({
          type: 'error',
          title: errorInfo.title,
          message: errorInfo.hint 
            ? `${errorInfo.message}\n💡 ${errorInfo.hint}`
            : errorInfo.message,
          duration: 5000,
        });
        auth.clearError();
      }
      
      return false;
    } catch (error: any) {
      logger.error('Email sign-in toast error', error, 'AuthToast');
      const errorInfo = getEmailErrorInfo(error);
      
      Haptics.error();
      toast.show({
        type: 'error',
        title: errorInfo.title,
        message: errorInfo.hint 
          ? `${errorInfo.message}\n💡 ${errorInfo.hint}`
          : errorInfo.message,
        duration: 5000,
      });
      
      return false;
    }
  }, [auth, toast, validateEmail]);

  const signUpWithEmail = useCallback(async (
    email: string,
    password: string,
    name: string
  ): Promise<boolean> => {
    // Validate inputs
    const nameError = validateName(name);
    if (nameError) {
      Haptics.warning();
      toast.warning(nameError, 'Name Required');
      return false;
    }
    
    if (!validateEmail(email)) {
      Haptics.warning();
      toast.warning('Please enter a valid email address', 'Invalid Email');
      return false;
    }
    
    const passwordError = validatePassword(password);
    if (passwordError) {
      Haptics.warning();
      toast.warning(passwordError, 'Invalid Password');
      return false;
    }

    try {
      const success = await auth.signUpWithEmail(email, password, name);
      
      if (success) {
        Haptics.success();
        toast.show({
          type: 'success',
          title: 'Account Created! 🎉',
          message: 'Check your email to verify your account.\n📧 Look in your inbox (and spam folder)',
          duration: 6000,
        });
        return true;
      }
      
      // Handle auth error
      if (auth.authError) {
        const errorInfo = getEmailErrorInfo({message: auth.authError});
        Haptics.error();
        toast.show({
          type: 'error',
          title: errorInfo.title,
          message: errorInfo.hint 
            ? `${errorInfo.message}\n💡 ${errorInfo.hint}`
            : errorInfo.message,
          duration: 5000,
        });
        auth.clearError();
      }
      
      return false;
    } catch (error: any) {
      logger.error('Email sign-up toast error', error, 'AuthToast');
      const errorInfo = getEmailErrorInfo(error);
      
      Haptics.error();
      toast.show({
        type: 'error',
        title: errorInfo.title,
        message: errorInfo.hint 
          ? `${errorInfo.message}\n💡 ${errorInfo.hint}`
          : errorInfo.message,
        duration: 5000,
      });
      
      return false;
    }
  }, [auth, toast, validateEmail, validatePassword, validateName]);

  const continueAsGuest = useCallback(async (): Promise<boolean> => {
    try {
      const success = await auth.continueAsGuest();
      
      if (success) {
        Haptics.success();
        toast.info('You can sign in anytime for full features', 'Welcome, Guest! 👋');
        return true;
      }
      
      if (auth.authError) {
        Haptics.error();
        toast.error(auth.authError, 'Guest Mode Failed');
        auth.clearError();
      }
      
      return false;
    } catch (error: any) {
      logger.error('Guest mode toast error', error, 'AuthToast');
      Haptics.error();
      toast.error('Could not continue as guest. Please try again.', 'Error');
      return false;
    }
  }, [auth, toast]);

  const resetPassword = useCallback(async (email: string): Promise<boolean> => {
    if (!email.trim()) {
      Haptics.warning();
      toast.warning('Please enter your email address', 'Email Required');
      return false;
    }
    
    if (!validateEmail(email)) {
      Haptics.warning();
      toast.warning('Please enter a valid email address', 'Invalid Email');
      return false;
    }

    try {
      const success = await auth.resetPassword(email);
      
      if (success) {
        Haptics.success();
        toast.show({
          type: 'success',
          title: 'Reset Link Sent! 📧',
          message: 'Check your email for the password reset link.\n💡 Also check your spam folder',
          duration: 6000,
        });
        return true;
      }
      
      // Even if Supabase fails silently, show success for security
      toast.show({
        type: 'info',
        title: 'Check Your Email',
        message: 'If an account exists with this email, you\'ll receive a reset link.',
        duration: 5000,
      });
      
      return true; // Don't reveal if account exists
    } catch (error: any) {
      logger.error('Reset password toast error', error, 'AuthToast');
      
      // Generic message for security
      toast.show({
        type: 'info',
        title: 'Check Your Email',
        message: 'If an account exists with this email, you\'ll receive a reset link.',
        duration: 5000,
      });
      
      return true; // Don't reveal errors for security
    }
  }, [auth, toast, validateEmail]);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      await auth.signOut();
      Haptics.light();
      toast.info('You have been signed out', 'Goodbye! 👋');
    } catch (error: any) {
      logger.error('Sign out toast error', error, 'AuthToast');
      toast.error('Could not sign out. Please try again.', 'Error');
    }
  }, [auth, toast]);

  return {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    continueAsGuest,
    resetPassword,
    signOut,
    validateEmail,
    validatePassword,
    validateName,
    isLoading: auth.isLoading,
    isAuthenticated: auth.isAuthenticated,
    isGuest: auth.isGuest,
    hasCompletedOnboarding: auth.hasCompletedOnboarding,
    user: auth.user,
  };
};

export default useAuthToast;

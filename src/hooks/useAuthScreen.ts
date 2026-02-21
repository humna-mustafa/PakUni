/**
 * useAuthScreen - State, animations, and auth handlers for AuthScreen
 */

import {useState, useRef, useCallback, useEffect} from 'react';
import {Animated, TextInput} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../contexts/ThemeContext';
import {useAuthToast} from '../hooks/useAuthToast';
import {useToast} from '../components/PremiumToast';
import type {RootStackParamList} from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type AuthMode = 'welcome' | 'login' | 'signup' | 'forgot';

export const useAuthScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const {colors, isDark} = useTheme();
  const toast = useToast();

  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    continueAsGuest,
    resetPassword,
    isLoading,
    hasCompletedOnboarding,
    isAuthenticated,
  } = useAuthToast();

  // Form state
  const [mode, setMode] = useState<AuthMode>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState<string | null>(null);

  // Input refs
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const nameInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const animateTransition = useCallback((newMode: AuthMode) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {toValue: 0, duration: 150, useNativeDriver: true}),
      Animated.timing(slideAnim, {toValue: 50, duration: 150, useNativeDriver: true}),
    ]).start(() => {
      setMode(newMode);
      Animated.parallel([
        Animated.timing(fadeAnim, {toValue: 1, duration: 200, useNativeDriver: true}),
        Animated.spring(slideAnim, {toValue: 0, tension: 50, friction: 8, useNativeDriver: true}),
      ]).start();
    });
  }, [fadeAnim, slideAnim]);

  // Watch for successful authentication and navigate
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigation.reset({
        index: 0,
        routes: [{name: hasCompletedOnboarding ? 'MainTabs' : 'Onboarding'}],
      });
    }
  }, [isAuthenticated, isLoading, hasCompletedOnboarding, navigation]);

  // Auth handlers
  const handleGoogleSignIn = async () => {
    setLocalLoading('google');
    try {
      await signInWithGoogle();
    } catch (_) {}
    setLocalLoading(null);
  };

  const handleGuestMode = async () => {
    setLocalLoading('guest');
    try {
      await continueAsGuest();
    } catch (_) {}
    setLocalLoading(null);
  };

  const handleEmailLogin = async () => {
    setLocalLoading('email');
    try {
      await signInWithEmail(email.trim(), password);
    } catch (_) {}
    setLocalLoading(null);
  };

  const handleEmailSignUp = async () => {
    if (password !== confirmPassword) {
      toast.warning('Please make sure your passwords match', "Passwords Don't Match");
      return;
    }
    setLocalLoading('signup');
    let success = false;
    try {
      success = await signUpWithEmail(email.trim(), password, name.trim());
    } catch (_) {}
    setLocalLoading(null);
    if (success) {
      setTimeout(() => animateTransition('login'), 2000);
    }
  };

  const handleForgotPassword = async () => {
    setLocalLoading('forgot');
    try {
      await resetPassword(email.trim());
    } catch (_) {}
    setLocalLoading(null);
  };

  return {
    colors,
    isDark,
    mode,
    // Form state
    email, setEmail,
    password, setPassword,
    name, setName,
    confirmPassword, setConfirmPassword,
    showPassword, setShowPassword,
    localLoading,
    isLoading,
    // Refs
    emailInputRef,
    passwordInputRef,
    nameInputRef,
    confirmPasswordInputRef,
    // Animations
    fadeAnim,
    slideAnim,
    logoScale,
    // Handlers
    animateTransition,
    handleGoogleSignIn,
    handleGuestMode,
    handleEmailLogin,
    handleEmailSignUp,
    handleForgotPassword,
  };
};

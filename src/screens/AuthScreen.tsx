/**
 * AuthScreen - Beautiful Authentication Screen
 * Supports: Google Sign-in, Email/Password, Guest Mode
 * Uses Premium Toast notifications for beautiful UX feedback
 */

import React, {useState, useRef, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Icon} from '../components/icons';
import {AppLogo, GraduationCapIcon, BRAND_COLORS} from '../components/AppLogo';
import {useTheme} from '../contexts/ThemeContext';
import {useAuthToast} from '../hooks/useAuthToast';
import {useToast} from '../components/PremiumToast';
import type {RootStackParamList} from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// ============================================================================
// AUTH MODES
// ============================================================================

type AuthMode = 'welcome' | 'login' | 'signup' | 'forgot';

// ============================================================================
// SOCIAL BUTTON COMPONENT
// ============================================================================

interface SocialButtonProps {
  iconName: string;
  label: string;
  onPress: () => void;
  colors: any;
  bgColor?: string;
  textColor?: string;
  loading?: boolean;
}

const SocialButton: React.FC<SocialButtonProps> = ({
  iconName,
  label,
  onPress,
  colors,
  bgColor,
  textColor,
  loading,
}) => (
  <TouchableOpacity
    style={[
      styles.socialButton,
      {backgroundColor: bgColor || colors.card},
    ]}
    onPress={onPress}
    activeOpacity={0.8}
    disabled={loading}>
    {loading ? (
      <ActivityIndicator size="small" color={textColor || colors.text} />
    ) : (
      <>
        <Icon 
          name={iconName} 
          family="Ionicons" 
          size={22} 
          color={textColor || colors.text} 
        />
        <Text style={[styles.socialButtonText, {color: textColor || colors.text}]}>
          {label}
        </Text>
      </>
    )}
  </TouchableOpacity>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AuthScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {colors, isDark} = useTheme();
  const toast = useToast();
  
  // Use the Toast-based auth hook for beautiful feedback
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

  const [mode, setMode] = useState<AuthMode>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState<string | null>(null);

  // Input refs for form navigation
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const nameInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
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
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setMode(newMode);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [fadeAnim, slideAnim]);

  // =========================================================================
  // AUTH HANDLERS
  // =========================================================================

  const handleGoogleSignIn = async () => {
    setLocalLoading('google');
    await signInWithGoogle();
    setLocalLoading(null);
    // Navigation will be handled by useEffect watching auth state
  };

  // Watch for successful authentication and navigate accordingly
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // User just logged in - navigate based on onboarding status
      navigation.reset({
        index: 0,
        routes: [{name: hasCompletedOnboarding ? 'MainTabs' : 'Onboarding'}],
      });
    }
  }, [isAuthenticated, isLoading, hasCompletedOnboarding, navigation]);

  const handleGuestMode = async () => {
    setLocalLoading('guest');
    await continueAsGuest();
    setLocalLoading(null);
    // Navigation is handled by useEffect watching isAuthenticated
    // Guests always go to Onboarding (hasCompletedOnboarding is false for new guests)
  };

  const handleEmailLogin = async () => {
    // Validation is handled by useAuthToast with beautiful toasts
    setLocalLoading('email');
    await signInWithEmail(email.trim(), password);
    setLocalLoading(null);
    // Navigation is handled by useEffect watching isAuthenticated
  };

  const handleEmailSignUp = async () => {
    // Basic validation with toast feedback
    if (password !== confirmPassword) {
      toast.warning('Please make sure your passwords match', 'Passwords Don\'t Match');
      return;
    }
    
    setLocalLoading('signup');
    const success = await signUpWithEmail(email.trim(), password, name.trim());
    setLocalLoading(null);
    
    if (success) {
      // Success toast is shown by useAuthToast, transition to login
      setTimeout(() => animateTransition('login'), 2000);
    }
  };

  const handleForgotPassword = async () => {
    setLocalLoading('forgot');
    await resetPassword(email.trim());
    setLocalLoading(null);
  };

  // =========================================================================
  // RENDER METHODS
  // =========================================================================

  const renderWelcome = () => (
    <Animated.View
      style={[
        styles.contentContainer,
        {
          opacity: fadeAnim,
          transform: [{translateY: slideAnim}],
        },
      ]}>
      {/* Welcome Text */}
      <View style={styles.welcomeTextContainer}>
        <Text style={[styles.welcomeTitle, {color: colors.text}]}>
          Welcome to PakUni
        </Text>
        <Text style={[styles.welcomeSubtitle, {color: colors.textSecondary}]}>
          Your gateway to Pakistan's top universities, scholarships, and career guidance
        </Text>
      </View>

      {/* Auth Options */}
      <View style={styles.authOptions}>
        {/* Google Sign In */}
        <SocialButton
          iconName="logo-google"
          label="Continue with Google"
          onPress={handleGoogleSignIn}
          colors={colors}
          bgColor="#FFFFFF"
          textColor="#1D2127"
          loading={localLoading === 'google'}
        />

        {/* Email Sign In */}
        <SocialButton
          iconName="mail"
          label="Sign In with Email"
          onPress={() => animateTransition('login')}
          colors={colors}
          bgColor={colors.card}
          loading={false}
        />

        {/* Sign Up Button */}
        <TouchableOpacity
          style={[styles.signUpButton, {backgroundColor: colors.primary}]}
          onPress={() => animateTransition('signup')}
          activeOpacity={0.85}>
          <Icon name="person-add" family="Ionicons" size={20} color="#FFFFFF" />
          <Text style={styles.signUpButtonText}>Create New Account</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={[styles.divider, {backgroundColor: colors.border}]} />
          <Text style={[styles.dividerText, {color: colors.textSecondary}]}>or</Text>
          <View style={[styles.divider, {backgroundColor: colors.border}]} />
        </View>

        {/* Guest Mode */}
        <TouchableOpacity
          style={[styles.guestButton, {borderColor: colors.border}]}
          onPress={handleGuestMode}
          activeOpacity={0.8}
          disabled={localLoading === 'guest'}>
          {localLoading === 'guest' ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <Icon name="person-outline" family="Ionicons" size={20} color={colors.primary} />
              <Text style={[styles.guestButtonText, {color: colors.primary}]}>
                Explore as Guest
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Terms */}
      <Text style={[styles.termsText, {color: colors.textSecondary}]}>
        By continuing, you agree to our{' '}
        <Text style={[styles.termsLink, {color: colors.primary}]}>Terms of Service</Text>
        {' '}and{' '}
        <Text style={[styles.termsLink, {color: colors.primary}]}>Privacy Policy</Text>
      </Text>
    </Animated.View>
  );

  const renderLogin = () => (
    <Animated.View
      style={[
        styles.formContainer,
        {
          opacity: fadeAnim,
          transform: [{translateY: slideAnim}],
        },
      ]}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => animateTransition('welcome')}>
        <Icon name="arrow-back" family="Ionicons" size={24} color={colors.text} />
      </TouchableOpacity>

      <Text style={[styles.formTitle, {color: colors.text}]}>Welcome Back</Text>
      <Text style={[styles.formSubtitle, {color: colors.textSecondary}]}>
        Sign in to continue your journey
      </Text>

      {/* Email Input */}
      <View style={[styles.inputContainer, {backgroundColor: colors.card, borderColor: colors.border}]}>
        <Icon name="mail-outline" family="Ionicons" size={20} color={colors.textSecondary} />
        <TextInput
          ref={emailInputRef}
          style={[styles.input, {color: colors.text}]}
          placeholder="Email address"
          placeholderTextColor={colors.placeholder}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          maxLength={100}
          returnKeyType="next"
          onSubmitEditing={() => passwordInputRef.current?.focus()}
          accessibilityLabel="Email address input"
        />
      </View>

      {/* Password Input */}
      <View style={[styles.inputContainer, {backgroundColor: colors.card, borderColor: colors.border}]}>
        <Icon name="lock-closed-outline" family="Ionicons" size={20} color={colors.textSecondary} />
        <TextInput
          ref={passwordInputRef}
          style={[styles.input, {color: colors.text}]}
          placeholder="Password"
          placeholderTextColor={colors.placeholder}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          maxLength={50}
          returnKeyType="done"
          onSubmitEditing={handleEmailLogin}
          accessibilityLabel="Password input"
        />
        <TouchableOpacity 
          onPress={() => setShowPassword(!showPassword)}
          accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          accessibilityRole="button">
          <Icon 
            name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
            family="Ionicons" 
            size={20} 
            color={colors.textSecondary} 
          />
        </TouchableOpacity>
      </View>

      {/* Forgot Password */}
      <TouchableOpacity
        style={styles.forgotButton}
        onPress={() => animateTransition('forgot')}>
        <Text style={[styles.forgotText, {color: colors.primary}]}>
          Forgot Password?
        </Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity
        style={[styles.primaryButton, styles.primaryGradient, {backgroundColor: colors.primary}]}
        onPress={handleEmailLogin}
        activeOpacity={0.85}
        disabled={isLoading || localLoading === 'email'}>
        {localLoading === 'email' ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      {/* Sign Up Link */}
      <View style={styles.switchContainer}>
        <Text style={[styles.switchText, {color: colors.textSecondary}]}>
          Don't have an account?{' '}
        </Text>
        <TouchableOpacity onPress={() => animateTransition('signup')}>
          <Text style={[styles.switchLink, {color: colors.primary}]}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderSignUp = () => (
    <Animated.View
      style={[
        styles.formContainer,
        {
          opacity: fadeAnim,
          transform: [{translateY: slideAnim}],
        },
      ]}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => animateTransition('welcome')}>
        <Icon name="arrow-back" family="Ionicons" size={24} color={colors.text} />
      </TouchableOpacity>

      <Text style={[styles.formTitle, {color: colors.text}]}>Create Account</Text>
      <Text style={[styles.formSubtitle, {color: colors.textSecondary}]}>
        Join thousands of students finding their dream university
      </Text>

      {/* Name Input */}
      <View style={[styles.inputContainer, {backgroundColor: colors.card, borderColor: colors.border}]}>
        <Icon name="person-outline" family="Ionicons" size={20} color={colors.textSecondary} />
        <TextInput
          ref={nameInputRef}
          style={[styles.input, {color: colors.text}]}
          placeholder="Full Name"
          placeholderTextColor={colors.placeholder}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          maxLength={100}
          returnKeyType="next"
          onSubmitEditing={() => emailInputRef.current?.focus()}
          accessibilityLabel="Full name input"
        />
      </View>

      {/* Email Input */}
      <View style={[styles.inputContainer, {backgroundColor: colors.card, borderColor: colors.border}]}>
        <Icon name="mail-outline" family="Ionicons" size={20} color={colors.textSecondary} />
        <TextInput
          ref={emailInputRef}
          style={[styles.input, {color: colors.text}]}
          placeholder="Email address"
          placeholderTextColor={colors.placeholder}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          maxLength={100}
          returnKeyType="next"
          onSubmitEditing={() => passwordInputRef.current?.focus()}
          accessibilityLabel="Email address input"
        />
      </View>

      {/* Password Input */}
      <View style={[styles.inputContainer, {backgroundColor: colors.card, borderColor: colors.border}]}>
        <Icon name="lock-closed-outline" family="Ionicons" size={20} color={colors.textSecondary} />
        <TextInput
          ref={passwordInputRef}
          style={[styles.input, {color: colors.text}]}
          placeholder="Password"
          placeholderTextColor={colors.placeholder}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          maxLength={50}
          returnKeyType="next"
          onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
          accessibilityLabel="Password input"
        />
        <TouchableOpacity 
          onPress={() => setShowPassword(!showPassword)}
          accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          accessibilityRole="button">
          <Icon 
            name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
            family="Ionicons" 
            size={20} 
            color={colors.textSecondary} 
          />
        </TouchableOpacity>
      </View>

      {/* Confirm Password Input */}
      <View style={[styles.inputContainer, {backgroundColor: colors.card, borderColor: colors.border}]}>
        <Icon name="lock-closed-outline" family="Ionicons" size={20} color={colors.textSecondary} />
        <TextInput
          ref={confirmPasswordInputRef}
          style={[styles.input, {color: colors.text}]}
          placeholder="Confirm Password"
          placeholderTextColor={colors.placeholder}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
          maxLength={50}
          returnKeyType="done"
          onSubmitEditing={handleEmailSignUp}
          accessibilityLabel="Confirm password input"
        />
      </View>

      {/* Sign Up Button */}
      <TouchableOpacity
        style={[styles.primaryButton, styles.primaryGradient, {backgroundColor: colors.primary}]}
        onPress={handleEmailSignUp}
        activeOpacity={0.85}
        disabled={isLoading || localLoading === 'signup'}>
        {localLoading === 'signup' ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>Create Account</Text>
        )}
      </TouchableOpacity>

      {/* Login Link */}
      <View style={styles.switchContainer}>
        <Text style={[styles.switchText, {color: colors.textSecondary}]}>
          Already have an account?{' '}
        </Text>
        <TouchableOpacity onPress={() => animateTransition('login')}>
          <Text style={[styles.switchLink, {color: colors.primary}]}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderForgotPassword = () => (
    <Animated.View
      style={[
        styles.formContainer,
        {
          opacity: fadeAnim,
          transform: [{translateY: slideAnim}],
        },
      ]}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => animateTransition('login')}>
        <Icon name="arrow-back" family="Ionicons" size={24} color={colors.text} />
      </TouchableOpacity>

      <Text style={[styles.formTitle, {color: colors.text}]}>Reset Password</Text>
      <Text style={[styles.formSubtitle, {color: colors.textSecondary}]}>
        Enter your email and we'll send you a reset link
      </Text>

      {/* Email Input */}
      <View style={[styles.inputContainer, {backgroundColor: colors.card, borderColor: colors.border}]}>
        <Icon name="mail-outline" family="Ionicons" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.input, {color: colors.text}]}
          placeholder="Email address"
          placeholderTextColor={colors.placeholder}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
      </View>

      {/* Reset Button */}
      <TouchableOpacity
        style={[styles.primaryButton, styles.primaryGradient, {backgroundColor: colors.primary}]}
        onPress={handleForgotPassword}
        activeOpacity={0.85}
        disabled={localLoading === 'forgot'}>
        {localLoading === 'forgot' ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>Send Reset Link</Text>
        )}
      </TouchableOpacity>

      {/* Back to Login */}
      <TouchableOpacity
        style={styles.backToLoginButton}
        onPress={() => animateTransition('login')}>
        <Text style={[styles.backToLoginText, {color: colors.primary}]}>
          Back to Sign In
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <SafeAreaView style={styles.safeArea}>
            {/* Logo Section - Premium PakUni Branding */}
            <Animated.View
              style={[
                styles.logoSection,
                {transform: [{scale: logoScale}]},
              ]}>
              <View style={styles.logoWrapper}>
                <GraduationCapIcon
                  size={mode === 'welcome' ? 100 : 72}
                  primaryColor={BRAND_COLORS.primary}
                  secondaryColor={BRAND_COLORS.accent}
                  animated={mode === 'welcome'}
                />
              </View>
              <Text style={[styles.logoText, {color: colors.text}]}>
                Pak<Text style={{color: BRAND_COLORS.primary}}>Uni</Text>
              </Text>
              <Text style={[styles.logoSubtext, {color: colors.textSecondary}]}>
                Your Gateway to Pakistani Universities 🇵🇰
              </Text>
            </Animated.View>

            {/* Content Based on Mode */}
            {mode === 'welcome' && renderWelcome()}
            {mode === 'login' && renderLogin()}
            {mode === 'signup' && renderSignUp()}
            {mode === 'forgot' && renderForgotPassword()}
          </SafeAreaView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 40 : 20,
    paddingBottom: 28,
  },
  logoWrapper: {
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#4573DF',
        shadowOffset: {width: 0, height: 8},
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  logoSubtext: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: '400',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  welcomeTextContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  welcomeSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 280,
  },
  authOptions: {
    gap: 10,
    marginBottom: 24,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.06,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 13,
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  guestButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  signUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
    marginTop: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#4573DF',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  signUpButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  termsText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 17,
  },
  termsLink: {
    fontWeight: '500',
  },
  formContainer: {
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  formSubtitle: {
    fontSize: 14,
    marginBottom: 28,
    lineHeight: 21,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
    gap: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '500',
  },
  primaryButton: {
    marginBottom: 18,
  },
  primaryGradient: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchText: {
    fontSize: 13,
  },
  switchLink: {
    fontSize: 13,
    fontWeight: '600',
  },
  backToLoginButton: {
    alignItems: 'center',
    marginTop: 14,
  },
  backToLoginText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default AuthScreen;


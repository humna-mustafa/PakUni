/**
 * AuthScreen - Beautiful Authentication Screen
 * Supports: Google Sign-in, Email/Password, Guest Mode
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
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Icon} from '../components/icons';
import {useTheme} from '../contexts/ThemeContext';
import {useAuth} from '../contexts/AuthContext';
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
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    continueAsGuest,
    resetPassword,
    isLoading,
    authError,
    clearError,
  } = useAuth();

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

  useEffect(() => {
    if (authError) {
      Alert.alert('Error', authError, [{text: 'OK', onPress: clearError}]);
    }
  }, [authError, clearError]);

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
  };

  const handleGuestMode = async () => {
    setLocalLoading('guest');
    const success = await continueAsGuest();
    setLocalLoading(null);
    if (success) {
      navigation.reset({
        index: 0,
        routes: [{name: 'Onboarding'}],
      });
    }
  };

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setLocalLoading('email');
    const success = await signInWithEmail(email.trim(), password);
    setLocalLoading(null);
    if (success) {
      navigation.reset({
        index: 0,
        routes: [{name: 'MainTabs'}],
      });
    }
  };

  const handleEmailSignUp = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    setLocalLoading('signup');
    const success = await signUpWithEmail(email.trim(), password, name.trim());
    setLocalLoading(null);
    if (success) {
      Alert.alert(
        'Account Created',
        'Please check your email to verify your account.',
        [{text: 'OK', onPress: () => animateTransition('login')}]
      );
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
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
          textColor="#1F2937"
          loading={localLoading === 'google'}
        />

        {/* Email Sign In */}
        <SocialButton
          iconName="mail"
          label="Continue with Email"
          onPress={() => animateTransition('login')}
          colors={colors}
          bgColor={colors.card}
          loading={false}
        />

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
                Continue as Guest
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
        style={styles.primaryButton}
        onPress={handleEmailLogin}
        activeOpacity={0.9}
        disabled={isLoading || localLoading === 'email'}>
        <LinearGradient
          colors={[colors.primary, '#4F46E5']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.primaryGradient}>
          {localLoading === 'email' ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Sign In</Text>
          )}
        </LinearGradient>
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
        style={styles.primaryButton}
        onPress={handleEmailSignUp}
        activeOpacity={0.9}
        disabled={isLoading || localLoading === 'signup'}>
        <LinearGradient
          colors={[colors.primary, '#4F46E5']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.primaryGradient}>
          {localLoading === 'signup' ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Create Account</Text>
          )}
        </LinearGradient>
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
        style={styles.primaryButton}
        onPress={handleForgotPassword}
        activeOpacity={0.9}
        disabled={localLoading === 'forgot'}>
        <LinearGradient
          colors={[colors.primary, '#4F46E5']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.primaryGradient}>
          {localLoading === 'forgot' ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Send Reset Link</Text>
          )}
        </LinearGradient>
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
            {/* Logo Section */}
            <Animated.View
              style={[
                styles.logoSection,
                {transform: [{scale: logoScale}]},
              ]}>
              <LinearGradient
                colors={[colors.primary, '#4F46E5']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.logoContainer}>
                <Icon name="school" family="Ionicons" size={40} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[styles.logoText, {color: colors.text}]}>PakUni</Text>
              <Text style={[styles.logoSubtext, {color: colors.textSecondary}]}>
                Your University Guide
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
    paddingBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: {width: 0, height: 8},
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  logoSubtext: {
    fontSize: 14,
    marginTop: 4,
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
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  authOptions: {
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
  },
  guestButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    fontWeight: '600',
  },
  formContainer: {
    flex: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  formSubtitle: {
    fontSize: 15,
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    marginBottom: 20,
  },
  primaryGradient: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: {width: 0, height: 6},
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
  },
  switchLink: {
    fontSize: 14,
    fontWeight: '700',
  },
  backToLoginButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  backToLoginText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default AuthScreen;

/**
 * UltraAuthScreen - Enhanced Authentication Screen with Animations
 * 
 * Premium auth experience with:
 * - Ambient glows and floating shapes
 * - Sparkle decorations
 * - Smooth transition animations
 * - PakUni branding
 * 
 * @author PakUni Team
 * @version 2.0.0
 */

import React from 'react';
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
import {Icon} from '../components/icons';
import {GraduationCapIcon, BRAND_COLORS} from '../components/AppLogo';
import {TYPOGRAPHY} from '../constants/design';
import {
  SubtleFloatingShapes,
  AmbientGlow,
  SparkleDecoration,
  PulseRing,
  FloatingIcon,
} from '../components/animations';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// ============================================================================
// TYPES
// ============================================================================

type AuthMode = 'welcome' | 'login' | 'signup' | 'forgot';

interface UltraAuthScreenProps {
  navigation: any;
  colors: any;
  isDark: boolean;
  toast: any;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<boolean>;
  continueAsGuest: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  isAuthenticated: boolean;
}

interface UltraAuthScreenState {
  mode: AuthMode;
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
  showPassword: boolean;
  localLoading: string | null;
}

// ============================================================================
// ANIMATED SOCIAL BUTTON
// ============================================================================

interface SocialButtonProps {
  iconName: string;
  label: string;
  onPress: () => void;
  colors: any;
  bgColor?: string;
  textColor?: string;
  loading?: boolean;
  index?: number;
}

class AnimatedSocialButton extends React.Component<SocialButtonProps> {
  private scale = new Animated.Value(1);
  private opacity = new Animated.Value(0);
  private translateY = new Animated.Value(20);

  componentDidMount() {
    const delay = (this.props.index || 0) * 100;
    Animated.parallel([
      Animated.timing(this.opacity, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(this.translateY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }

  handlePressIn = () => {
    Animated.spring(this.scale, {
      toValue: 0.96,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  handlePressOut = () => {
    Animated.spring(this.scale, {
      toValue: 1,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  render() {
    const {iconName, label, onPress, colors, bgColor, textColor, loading} = this.props;

    return (
      <Animated.View
        style={{
          opacity: this.opacity,
          transform: [{translateY: this.translateY}, {scale: this.scale}],
        }}
      >
        <TouchableOpacity
          style={[styles.socialButton, {backgroundColor: bgColor || colors.card}]}
          onPress={onPress}
          onPressIn={this.handlePressIn}
          onPressOut={this.handlePressOut}
          activeOpacity={1}
          disabled={loading}
        >
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
      </Animated.View>
    );
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export class UltraAuthScreen extends React.Component<UltraAuthScreenProps, UltraAuthScreenState> {
  private fadeAnim = new Animated.Value(1);
  private slideAnim = new Animated.Value(0);
  private logoScale = new Animated.Value(0.8);
  private logoRotate = new Animated.Value(0);

  constructor(props: UltraAuthScreenProps) {
    super(props);
    this.state = {
      mode: 'welcome',
      email: '',
      password: '',
      name: '',
      confirmPassword: '',
      showPassword: false,
      localLoading: null,
    };
  }

  componentDidMount() {
    // Entrance animation for logo
    Animated.parallel([
      Animated.spring(this.logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(this.logoRotate, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }

  componentDidUpdate(prevProps: UltraAuthScreenProps) {
    if (!prevProps.isAuthenticated && this.props.isAuthenticated && !this.props.isLoading) {
      this.props.navigation.reset({
        index: 0,
        routes: [{name: this.props.hasCompletedOnboarding ? 'MainTabs' : 'Onboarding'}],
      });
    }
  }

  animateTransition = (newMode: AuthMode) => {
    Animated.parallel([
      Animated.timing(this.fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(this.slideAnim, {
        toValue: 50,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      this.setState({mode: newMode}, () => {
        Animated.parallel([
          Animated.timing(this.fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(this.slideAnim, {
            toValue: 0,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      });
    });
  };

  handleGoogleSignIn = async () => {
    this.setState({localLoading: 'google'});
    try {
      await this.props.signInWithGoogle();
    } catch (_) {
      // Error handled by caller/toast
    }
    this.setState({localLoading: null});
  };

  handleGuestMode = async () => {
    this.setState({localLoading: 'guest'});
    await this.props.continueAsGuest();
    this.setState({localLoading: null});
  };

  handleEmailLogin = async () => {
    this.setState({localLoading: 'email'});
    await this.props.signInWithEmail(this.state.email.trim(), this.state.password);
    this.setState({localLoading: null});
  };

  handleEmailSignUp = async () => {
    const {email, password, confirmPassword, name} = this.state;
    
    if (password !== confirmPassword) {
      this.props.toast.warning('Please make sure your passwords match', 'Passwords Don\'t Match');
      return;
    }

    this.setState({localLoading: 'signup'});
    const success = await this.props.signUpWithEmail(email.trim(), password, name.trim());
    this.setState({localLoading: null});

    if (success) {
      setTimeout(() => this.animateTransition('login'), 2000);
    }
  };

  handleForgotPassword = async () => {
    this.setState({localLoading: 'forgot'});
    await this.props.resetPassword(this.state.email.trim());
    this.setState({localLoading: null});
  };

  // =========================================================================
  // RENDER WELCOME
  // =========================================================================

  renderWelcome = () => {
    const {colors} = this.props;
    const {localLoading} = this.state;

    return (
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: this.fadeAnim,
            transform: [{translateY: this.slideAnim}],
          },
        ]}
      >
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
          <AnimatedSocialButton
            iconName="logo-google"
            label="Continue with Google"
            onPress={this.handleGoogleSignIn}
            colors={colors}
            bgColor="#FFFFFF"
            textColor="#1D2127"
            loading={localLoading === 'google'}
            index={0}
          />

          {/* Email Sign In */}
          <AnimatedSocialButton
            iconName="mail"
            label="Sign In with Email"
            onPress={() => this.animateTransition('login')}
            colors={colors}
            bgColor={colors.card}
            loading={false}
            index={1}
          />

          {/* Sign Up Button */}
          <Animated.View style={{opacity: this.fadeAnim}}>
            <TouchableOpacity
              style={[styles.signUpButton, {backgroundColor: colors.primary}]}
              onPress={() => this.animateTransition('signup')}
              activeOpacity={0.85}
            >
              <Icon name="person-add" family="Ionicons" size={20} color="#FFFFFF" />
              <Text style={styles.signUpButtonText}>Create New Account</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            <Text style={[styles.dividerText, {color: colors.textSecondary}]}>or</Text>
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
          </View>

          {/* Guest Mode */}
          <TouchableOpacity
            style={[styles.guestButton, {borderColor: colors.border}]}
            onPress={this.handleGuestMode}
            activeOpacity={0.8}
            disabled={localLoading === 'guest'}
          >
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
  };

  // =========================================================================
  // RENDER LOGIN
  // =========================================================================

  renderLogin = () => {
    const {colors} = this.props;
    const {email, password, showPassword, localLoading} = this.state;

    return (
      <Animated.View
        style={[
          styles.formContainer,
          {
            opacity: this.fadeAnim,
            transform: [{translateY: this.slideAnim}],
          },
        ]}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => this.animateTransition('welcome')}
        >
          <Icon name="arrow-back" family="Ionicons" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.formTitle, {color: colors.text}]}>Welcome Back</Text>
        <Text style={[styles.formSubtitle, {color: colors.textSecondary}]}>
          Sign in to continue your education journey
        </Text>

        {/* Email Input */}
        <View style={[styles.inputContainer, {backgroundColor: colors.card, borderColor: colors.border}]}>
          <Icon name="mail-outline" family="Ionicons" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.input, {color: colors.text}]}
            placeholder="Email address"
            placeholderTextColor={colors.placeholder}
            value={email}
            onChangeText={(text) => this.setState({email: text})}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        {/* Password Input */}
        <View style={[styles.inputContainer, {backgroundColor: colors.card, borderColor: colors.border}]}>
          <Icon name="lock-closed-outline" family="Ionicons" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.input, {color: colors.text}]}
            placeholder="Password"
            placeholderTextColor={colors.placeholder}
            value={password}
            onChangeText={(text) => this.setState({password: text})}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => this.setState({showPassword: !showPassword})}>
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
          onPress={() => this.animateTransition('forgot')}
        >
          <Text style={[styles.forgotText, {color: colors.primary}]}>
            Forgot Password?
          </Text>
        </TouchableOpacity>

        {/* Sign In Button */}
        <TouchableOpacity
          style={[styles.primaryButton]}
          onPress={this.handleEmailLogin}
          activeOpacity={0.85}
          disabled={localLoading === 'email'}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark || colors.primary]}
            style={styles.primaryGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
          >
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
          <TouchableOpacity onPress={() => this.animateTransition('signup')}>
            <Text style={[styles.switchLink, {color: colors.primary}]}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  // =========================================================================
  // RENDER SIGNUP
  // =========================================================================

  renderSignUp = () => {
    const {colors} = this.props;
    const {email, password, confirmPassword, name, showPassword, localLoading} = this.state;

    return (
      <Animated.View
        style={[
          styles.formContainer,
          {
            opacity: this.fadeAnim,
            transform: [{translateY: this.slideAnim}],
          },
        ]}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => this.animateTransition('welcome')}
        >
          <Icon name="arrow-back" family="Ionicons" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.formTitle, {color: colors.text}]}>Create Account</Text>
        <Text style={[styles.formSubtitle, {color: colors.textSecondary}]}>
          Start your journey to the best universities
        </Text>

        {/* Name Input */}
        <View style={[styles.inputContainer, {backgroundColor: colors.card, borderColor: colors.border}]}>
          <Icon name="person-outline" family="Ionicons" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.input, {color: colors.text}]}
            placeholder="Full name"
            placeholderTextColor={colors.placeholder}
            value={name}
            onChangeText={(text) => this.setState({name: text})}
            autoComplete="name"
          />
        </View>

        {/* Email Input */}
        <View style={[styles.inputContainer, {backgroundColor: colors.card, borderColor: colors.border}]}>
          <Icon name="mail-outline" family="Ionicons" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.input, {color: colors.text}]}
            placeholder="Email address"
            placeholderTextColor={colors.placeholder}
            value={email}
            onChangeText={(text) => this.setState({email: text})}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        {/* Password Input */}
        <View style={[styles.inputContainer, {backgroundColor: colors.card, borderColor: colors.border}]}>
          <Icon name="lock-closed-outline" family="Ionicons" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.input, {color: colors.text}]}
            placeholder="Password"
            placeholderTextColor={colors.placeholder}
            value={password}
            onChangeText={(text) => this.setState({password: text})}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => this.setState({showPassword: !showPassword})}>
            <Icon
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              family="Ionicons"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Confirm Password */}
        <View style={[styles.inputContainer, {backgroundColor: colors.card, borderColor: colors.border}]}>
          <Icon name="shield-checkmark-outline" family="Ionicons" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.input, {color: colors.text}]}
            placeholder="Confirm password"
            placeholderTextColor={colors.placeholder}
            value={confirmPassword}
            onChangeText={(text) => this.setState({confirmPassword: text})}
            secureTextEntry={!showPassword}
          />
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity
          style={[styles.primaryButton]}
          onPress={this.handleEmailSignUp}
          activeOpacity={0.85}
          disabled={localLoading === 'signup'}
        >
          <LinearGradient
            colors={[BRAND_COLORS.secondary, '#059669']}
            style={styles.primaryGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
          >
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
          <TouchableOpacity onPress={() => this.animateTransition('login')}>
            <Text style={[styles.switchLink, {color: colors.primary}]}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  // =========================================================================
  // RENDER FORGOT PASSWORD
  // =========================================================================

  renderForgotPassword = () => {
    const {colors} = this.props;
    const {email, localLoading} = this.state;

    return (
      <Animated.View
        style={[
          styles.formContainer,
          {
            opacity: this.fadeAnim,
            transform: [{translateY: this.slideAnim}],
          },
        ]}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => this.animateTransition('login')}
        >
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
            onChangeText={(text) => this.setState({email: text})}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        {/* Reset Button */}
        <TouchableOpacity
          style={[styles.primaryButton]}
          onPress={this.handleForgotPassword}
          activeOpacity={0.85}
          disabled={localLoading === 'forgot'}
        >
          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            style={styles.primaryGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
          >
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
          onPress={() => this.animateTransition('login')}
        >
          <Text style={[styles.backToLoginText, {color: colors.primary}]}>
            Back to Sign In
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // =========================================================================
  // MAIN RENDER
  // =========================================================================

  render() {
    const {colors, isDark} = this.props;
    const {mode} = this.state;

    const logoRotateInterpolate = this.logoRotate.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <View style={[styles.container, {backgroundColor: colors.background}]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />

        {/* Background Animations */}
        <AmbientGlow
          primaryColor={colors.primary}
          secondaryColor={colors.primaryLight || colors.primary}
          position="top"
          intensity={0.12}
        />
        
        <SubtleFloatingShapes
          colors={[
            colors.primary + '20',
            BRAND_COLORS.secondary + '15',
            BRAND_COLORS.accent + '15',
          ]}
          opacity={0.06}
          count={5}
        />

        <SparkleDecoration
          color={colors.primary}
          count={6}
          area={{top: 50, height: 200}}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <SafeAreaView style={styles.safeArea}>
              {/* Logo Section with Pulse Rings */}
              <Animated.View
                style={[
                  styles.logoSection,
                  {transform: [{scale: this.logoScale}]},
                ]}
              >
                <View style={styles.logoWrapper}>
                  {/* Pulse rings behind logo */}
                  <View style={styles.pulseContainer}>
                    <PulseRing color={colors.primary + '30'} size={120} delay={0} />
                    <PulseRing color={colors.primary + '20'} size={140} delay={500} />
                  </View>
                  
                  <FloatingIcon amplitude={4} duration={2500}>
                    <GraduationCapIcon
                      size={mode === 'welcome' ? 100 : 72}
                      primaryColor={BRAND_COLORS.primary}
                      secondaryColor={BRAND_COLORS.accent}
                    />
                  </FloatingIcon>
                </View>

                <Text style={[styles.logoText, {color: colors.text}]}>
                  Pak<Text style={{color: BRAND_COLORS.primary}}>Uni</Text>
                </Text>
                <Text style={[styles.logoSubtext, {color: colors.textSecondary}]}>
                  Your Education Partner
                </Text>
              </Animated.View>

              {/* Content based on mode */}
              {mode === 'welcome' && this.renderWelcome()}
              {mode === 'login' && this.renderLogin()}
              {mode === 'signup' && this.renderSignUp()}
              {mode === 'forgot' && this.renderForgotPassword()}
            </SafeAreaView>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }
}

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
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  safeArea: {
    flex: 1,
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 24,
  },
  logoWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  pulseContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 28,
    fontWeight: TYPOGRAPHY.weight.heavy,
    letterSpacing: -0.5,
  },
  logoSubtext: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: TYPOGRAPHY.weight.regular,
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
    fontWeight: TYPOGRAPHY.weight.bold,
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
    fontWeight: TYPOGRAPHY.weight.medium,
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
    fontWeight: TYPOGRAPHY.weight.medium,
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
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#FFFFFF',
  },
  termsText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 17,
  },
  termsLink: {
    fontWeight: TYPOGRAPHY.weight.medium,
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
    fontWeight: TYPOGRAPHY.weight.bold,
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
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  primaryButton: {
    marginBottom: 18,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#4573DF',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  primaryGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#FFFFFF',
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
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  backToLoginButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backToLoginText: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
});

export default UltraAuthScreen;

/**
 * AuthScreen - Beautiful Authentication Screen
 * Supports: Google Sign-in, Email/Password, Guest Mode
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
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Icon} from '../components/icons';
import {GraduationCapIcon, BRAND_COLORS} from '../components/AppLogo';
import {SocialButton} from '../components/auth';
import {useAuthScreen} from '../hooks/useAuthScreen';
import {SPACING, FONTS} from '../constants/theme';
import {TYPOGRAPHY} from '../constants/design';

const AuthScreen: React.FC = () => {
  const {
    colors, isDark, mode,
    email, setEmail, password, setPassword,
    name, setName, confirmPassword, setConfirmPassword,
    showPassword, setShowPassword, localLoading, isLoading,
    emailInputRef, passwordInputRef, nameInputRef, confirmPasswordInputRef,
    fadeAnim, slideAnim, logoScale,
    animateTransition, handleGoogleSignIn, handleGuestMode,
    handleEmailLogin, handleEmailSignUp, handleForgotPassword,
  } = useAuthScreen();

  const renderWelcome = () => (
    <Animated.View style={[styles.contentContainer, {opacity: fadeAnim, transform: [{translateY: slideAnim}]}]}>
      <View style={styles.authOptions}>
        <SocialButton iconName="logo-google" label="Continue with Google" onPress={handleGoogleSignIn}
          colors={colors} bgColor="#FFFFFF" textColor="#1D2127" loading={localLoading === 'google'} />
        <SocialButton iconName="mail" label="Sign In with Email" onPress={() => animateTransition('login')}
          colors={colors} bgColor={colors.card} loading={false} />
        <TouchableOpacity style={[styles.signUpButton, {backgroundColor: colors.primary}]}
          onPress={() => animateTransition('signup')} activeOpacity={0.85}>
          <Icon name="person-add" family="Ionicons" size={20} color="#FFFFFF" />
          <Text style={styles.signUpButtonText}>Create New Account</Text>
        </TouchableOpacity>
        <View style={styles.dividerContainer}>
          <View style={[styles.divider, {backgroundColor: colors.border}]} />
          <Text style={[styles.dividerText, {color: colors.textSecondary}]}>or</Text>
          <View style={[styles.divider, {backgroundColor: colors.border}]} />
        </View>
        <TouchableOpacity style={[styles.guestButton, {borderColor: colors.border}]}
          onPress={handleGuestMode} activeOpacity={0.8} disabled={localLoading === 'guest'}>
          {localLoading === 'guest' ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <Icon name="person-outline" family="Ionicons" size={20} color={colors.primary} />
              <Text style={[styles.guestButtonText, {color: colors.primary}]}>Explore as Guest</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      <Text style={[styles.termsText, {color: colors.textSecondary}]}>
        By continuing, you agree to our{' '}
        <Text style={[styles.termsLink, {color: colors.primary}]}>Terms of Service</Text>
        {' '}and{' '}
        <Text style={[styles.termsLink, {color: colors.primary}]}>Privacy Policy</Text>
      </Text>
    </Animated.View>
  );

  const renderLogin = () => (
    <Animated.View style={[styles.formContainer, {opacity: fadeAnim, transform: [{translateY: slideAnim}]}]}>
      <TouchableOpacity style={styles.backButton} onPress={() => animateTransition('welcome')}
        accessibilityRole="button" accessibilityLabel="Go back to welcome screen">
        <Icon name="arrow-back" family="Ionicons" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={[styles.formTitle, {color: colors.text}]}>Welcome Back</Text>
      <Text style={[styles.formSubtitle, {color: colors.textSecondary}]}>Sign in to continue your journey</Text>
      <View style={[styles.inputContainer, {backgroundColor: colors.card, borderColor: colors.border}]}>
        <Icon name="mail-outline" family="Ionicons" size={20} color={colors.textSecondary} />
        <TextInput ref={emailInputRef} style={[styles.input, {color: colors.text}]} placeholder="Email address"
          placeholderTextColor={colors.placeholder} value={email} onChangeText={setEmail}
          keyboardType="email-address" autoCapitalize="none" autoComplete="email" maxLength={100}
          returnKeyType="next" onSubmitEditing={() => passwordInputRef.current?.focus()}
          accessibilityLabel="Email address input" />
      </View>
      <View style={[styles.inputContainer, {backgroundColor: colors.card, borderColor: colors.border}]}>
        <Icon name="lock-closed-outline" family="Ionicons" size={20} color={colors.textSecondary} />
        <TextInput ref={passwordInputRef} style={[styles.input, {color: colors.text}]} placeholder="Password"
          placeholderTextColor={colors.placeholder} value={password} onChangeText={setPassword}
          secureTextEntry={!showPassword} autoCapitalize="none" maxLength={50} returnKeyType="done"
          onSubmitEditing={handleEmailLogin} accessibilityLabel="Password input" />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}
          accessibilityLabel={showPassword ? 'Hide password' : 'Show password'} accessibilityRole="button">
          <Icon name={showPassword ? 'eye-off-outline' : 'eye-outline'} family="Ionicons" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.forgotButton} onPress={() => animateTransition('forgot')}>
        <Text style={[styles.forgotText, {color: colors.primary}]}>Forgot Password?</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.primaryButton, styles.primaryGradient, {backgroundColor: colors.primary}]}
        onPress={handleEmailLogin} activeOpacity={0.85} disabled={isLoading || localLoading === 'email'}>
        {localLoading === 'email' ? <ActivityIndicator size="small" color="#FFFFFF" /> : (
          <Text style={styles.primaryButtonText}>Sign In</Text>
        )}
      </TouchableOpacity>
      <View style={styles.switchContainer}>
        <Text style={[styles.switchText, {color: colors.textSecondary}]}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => animateTransition('signup')}>
          <Text style={[styles.switchLink, {color: colors.primary}]}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderSignUp = () => (
    <Animated.View style={[styles.formContainer, {opacity: fadeAnim, transform: [{translateY: slideAnim}]}]}>
      <TouchableOpacity style={styles.backButton} onPress={() => animateTransition('welcome')}
        accessibilityRole="button" accessibilityLabel="Go back to welcome screen">
        <Icon name="arrow-back" family="Ionicons" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={[styles.formTitle, {color: colors.text}]}>Create Account</Text>
      <Text style={[styles.formSubtitle, {color: colors.textSecondary}]}>
        Join thousands of students finding their dream university
      </Text>
      <View style={[styles.inputContainer, {backgroundColor: colors.card, borderColor: colors.border}]}>
        <Icon name="person-outline" family="Ionicons" size={20} color={colors.textSecondary} />
        <TextInput ref={nameInputRef} style={[styles.input, {color: colors.text}]} placeholder="Full Name"
          placeholderTextColor={colors.placeholder} value={name} onChangeText={setName} autoCapitalize="words"
          maxLength={100} returnKeyType="next" onSubmitEditing={() => emailInputRef.current?.focus()}
          accessibilityLabel="Full name input" />
      </View>
      <View style={[styles.inputContainer, {backgroundColor: colors.card, borderColor: colors.border}]}>
        <Icon name="mail-outline" family="Ionicons" size={20} color={colors.textSecondary} />
        <TextInput ref={emailInputRef} style={[styles.input, {color: colors.text}]} placeholder="Email address"
          placeholderTextColor={colors.placeholder} value={email} onChangeText={setEmail}
          keyboardType="email-address" autoCapitalize="none" autoComplete="email" maxLength={100}
          returnKeyType="next" onSubmitEditing={() => passwordInputRef.current?.focus()}
          accessibilityLabel="Email address input" />
      </View>
      <View style={[styles.inputContainer, {backgroundColor: colors.card, borderColor: colors.border}]}>
        <Icon name="lock-closed-outline" family="Ionicons" size={20} color={colors.textSecondary} />
        <TextInput ref={passwordInputRef} style={[styles.input, {color: colors.text}]} placeholder="Password"
          placeholderTextColor={colors.placeholder} value={password} onChangeText={setPassword}
          secureTextEntry={!showPassword} autoCapitalize="none" maxLength={50} returnKeyType="next"
          onSubmitEditing={() => confirmPasswordInputRef.current?.focus()} accessibilityLabel="Password input" />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}
          accessibilityLabel={showPassword ? 'Hide password' : 'Show password'} accessibilityRole="button">
          <Icon name={showPassword ? 'eye-off-outline' : 'eye-outline'} family="Ionicons" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      <View style={[styles.inputContainer, {backgroundColor: colors.card, borderColor: colors.border}]}>
        <Icon name="lock-closed-outline" family="Ionicons" size={20} color={colors.textSecondary} />
        <TextInput ref={confirmPasswordInputRef} style={[styles.input, {color: colors.text}]}
          placeholder="Confirm Password" placeholderTextColor={colors.placeholder} value={confirmPassword}
          onChangeText={setConfirmPassword} secureTextEntry autoCapitalize="none" maxLength={50}
          returnKeyType="done" onSubmitEditing={handleEmailSignUp} accessibilityLabel="Confirm password input" />
      </View>
      <TouchableOpacity style={[styles.primaryButton, styles.primaryGradient, {backgroundColor: colors.primary}]}
        onPress={handleEmailSignUp} activeOpacity={0.85} disabled={isLoading || localLoading === 'signup'}>
        {localLoading === 'signup' ? <ActivityIndicator size="small" color="#FFFFFF" /> : (
          <Text style={styles.primaryButtonText}>Create Account</Text>
        )}
      </TouchableOpacity>
      <View style={styles.switchContainer}>
        <Text style={[styles.switchText, {color: colors.textSecondary}]}>Already have an account? </Text>
        <TouchableOpacity onPress={() => animateTransition('login')}>
          <Text style={[styles.switchLink, {color: colors.primary}]}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderForgotPassword = () => (
    <Animated.View style={[styles.formContainer, {opacity: fadeAnim, transform: [{translateY: slideAnim}]}]}>
      <TouchableOpacity style={styles.backButton} onPress={() => animateTransition('login')}
        accessibilityRole="button" accessibilityLabel="Go back to login screen">
        <Icon name="arrow-back" family="Ionicons" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={[styles.formTitle, {color: colors.text}]}>Reset Password</Text>
      <Text style={[styles.formSubtitle, {color: colors.textSecondary}]}>
        Enter your email and we'll send you a reset link
      </Text>
      <View style={[styles.inputContainer, {backgroundColor: colors.card, borderColor: colors.border}]}>
        <Icon name="mail-outline" family="Ionicons" size={20} color={colors.textSecondary} />
        <TextInput style={[styles.input, {color: colors.text}]} placeholder="Email address"
          placeholderTextColor={colors.placeholder} value={email} onChangeText={setEmail}
          keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
      </View>
      <TouchableOpacity style={[styles.primaryButton, styles.primaryGradient, {backgroundColor: colors.primary}]}
        onPress={handleForgotPassword} activeOpacity={0.85} disabled={localLoading === 'forgot'}>
        {localLoading === 'forgot' ? <ActivityIndicator size="small" color="#FFFFFF" /> : (
          <Text style={styles.primaryButtonText}>Send Reset Link</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.backToLoginButton} onPress={() => animateTransition('login')}>
        <Text style={[styles.backToLoginText, {color: colors.primary}]}>Back to Sign In</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoid}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <SafeAreaView style={styles.safeArea}>
            <Animated.View style={[styles.logoSection, {transform: [{scale: logoScale}]}]}>
              <View style={styles.logoWrapper}>
                <GraduationCapIcon size={mode === 'welcome' ? 100 : 72} primaryColor={BRAND_COLORS.primary}
                  secondaryColor={BRAND_COLORS.accent} animated={mode === 'welcome'} />
              </View>
              <Text style={[styles.logoText, {color: colors.text}]}>
                Pak<Text style={{color: BRAND_COLORS.primary}}>Uni</Text>
              </Text>
              <Text style={[styles.logoSubtext, {color: colors.textSecondary}]}>
                Universities · Scholarships · Careers · Guides & More {'\uD83C\uDDF5\uD83C\uDDF0'}
              </Text>
            </Animated.View>
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

const styles = StyleSheet.create({
  container: {flex: 1},
  keyboardAvoid: {flex: 1},
  scrollContent: {flexGrow: 1},
  safeArea: {flex: 1, paddingHorizontal: 24},
  logoSection: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 40 : 20,
    paddingBottom: 28,
  },
  logoWrapper: {
    marginBottom: 14,
    ...Platform.select({
      ios: {shadowColor: '#4573DF', shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.25, shadowRadius: 12},
      android: {elevation: 8},
    }),
  },
  logoText: {fontSize: 28, fontWeight: FONTS.weight.bold, letterSpacing: -0.5},
  logoSubtext: {fontSize: 13, marginTop: 4, fontWeight: TYPOGRAPHY.weight.regular},
  contentContainer: {flex: 1, justifyContent: 'center'},
  welcomeTextContainer: {alignItems: 'center', marginBottom: 32},
  welcomeTitle: {fontSize: 24, fontWeight: FONTS.weight.bold, textAlign: 'center', marginBottom: SPACING.sm, letterSpacing: -0.3},
  welcomeSubtitle: {fontSize: 14, textAlign: 'center', lineHeight: 21, maxWidth: 280},
  authOptions: {gap: 10, marginBottom: 24},
  dividerContainer: {flexDirection: 'row', alignItems: 'center', marginVertical: 8},
  divider: {flex: 1, height: 1},
  dividerText: {paddingHorizontal: 16, fontSize: 13},
  guestButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 12, borderWidth: 1, gap: 8,
  },
  guestButtonText: {fontSize: 14, fontWeight: FONTS.weight.medium},
  signUpButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 12, gap: 10, marginTop: 4,
    ...Platform.select({
      ios: {shadowColor: '#4573DF', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8},
      android: {elevation: 4},
    }),
  },
  signUpButtonText: {fontSize: 15, fontWeight: FONTS.weight.semiBold, color: '#FFFFFF'},
  termsText: {fontSize: 11, textAlign: 'center', lineHeight: 17},
  termsLink: {fontWeight: FONTS.weight.medium},
  formContainer: {flex: 1},
  backButton: {width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 14},
  formTitle: {fontSize: 24, fontWeight: FONTS.weight.bold, marginBottom: SPACING.xs, letterSpacing: -0.3},
  formSubtitle: {fontSize: 14, marginBottom: SPACING.xl, lineHeight: 21},
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 2,
    borderRadius: 12, borderWidth: 1, marginBottom: 14, gap: 10,
  },
  input: {flex: 1, paddingVertical: 12, fontSize: 15},
  forgotButton: {alignSelf: 'flex-end', marginBottom: 20},
  forgotText: {fontSize: 13, fontWeight: FONTS.weight.medium},
  primaryButton: {marginBottom: 18},
  primaryGradient: {
    paddingVertical: 14, borderRadius: 12, alignItems: 'center',
    ...Platform.select({
      ios: {shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 6},
      android: {elevation: 3},
    }),
  },
  primaryButtonText: {color: '#FFFFFF', fontSize: 15, fontWeight: FONTS.weight.semiBold},
  switchContainer: {flexDirection: 'row', justifyContent: 'center', alignItems: 'center'},
  switchText: {fontSize: 13},
  switchLink: {fontSize: 13, fontWeight: FONTS.weight.semiBold},
  backToLoginButton: {alignItems: 'center', marginTop: 14},
  backToLoginText: {fontSize: 14, fontWeight: FONTS.weight.medium},
});

export default AuthScreen;

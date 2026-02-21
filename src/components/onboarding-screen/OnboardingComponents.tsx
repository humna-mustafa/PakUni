/**
 * OnboardingComponents - Small reusable components for onboarding screen.
 * ProgressBar, DotPagination, WelcomeHeader, ActionButtons
 */
import React, {useRef, useEffect, memo} from 'react';
import {View, Text, StyleSheet, Animated, TouchableOpacity, Pressable, Platform, StatusBar, Dimensions} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '../icons';
import {GraduationCapIcon, BRAND_COLORS} from '../AppLogo';
import {TYPOGRAPHY} from '../../constants/design';
import {OnboardingSlide, getTimeBasedGreeting} from './data';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// ============================================================================
// PROGRESS BAR
// ============================================================================

interface ProgressBarProps {
  current: number;
  total: number;
  colors: any;
  activeGradient: string[];
}

export const ProgressBar = memo<ProgressBarProps>(({current, total, colors, activeGradient}) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: (current + 1) / total,
      tension: 50, friction: 8, useNativeDriver: false,
    }).start();
  }, [current, total]);

  const width = progress.interpolate({inputRange: [0, 1], outputRange: ['0%', '100%']});

  return (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBarBg, {backgroundColor: colors.border}]}>
        <Animated.View style={[styles.progressBarFill, {width}]}>
          <LinearGradient colors={activeGradient} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.progressBarGradient} />
        </Animated.View>
      </View>
      <Text style={[styles.progressText, {color: colors.textSecondary}]}>{current + 1} of {total}</Text>
    </View>
  );
});

// ============================================================================
// DOT PAGINATION
// ============================================================================

interface DotPaginationProps {
  data: OnboardingSlide[];
  scrollX: Animated.Value;
  colors: any;
  onDotPress: (index: number) => void;
}

export const DotPagination = memo<DotPaginationProps>(({data, scrollX, colors, onDotPress}) => (
  <View style={styles.dotsContainer}>
    {data.map((item, index) => {
      const inputRange = [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH];
      const scale = scrollX.interpolate({inputRange, outputRange: [1, 1.4, 1], extrapolate: 'clamp'});
      const opacity = scrollX.interpolate({inputRange, outputRange: [0.4, 1, 0.4], extrapolate: 'clamp'});
      const width = scrollX.interpolate({inputRange, outputRange: [8, 24, 8], extrapolate: 'clamp'});
      return (
        <Pressable key={index} onPress={() => onDotPress(index)}>
          <Animated.View style={[styles.dot, {width, opacity, transform: [{scale}], backgroundColor: item.gradient[0]}]} />
        </Pressable>
      );
    })}
  </View>
));

// ============================================================================
// WELCOME HEADER
// ============================================================================

interface WelcomeHeaderProps {
  colors: any;
  onSkip: () => void;
}

export const WelcomeHeader = memo<WelcomeHeaderProps>(({colors, onSkip}) => {
  const greeting = getTimeBasedGreeting();
  return (
    <View style={styles.header}>
      <View style={{gap: 2}}>
        <Text style={[styles.greetingText, {color: colors.textSecondary}]}>{greeting} 👋</Text>
        <View style={styles.brandContainer}>
          <GraduationCapIcon size={24} primaryColor={BRAND_COLORS.primary} animated={false} />
          <Text style={[styles.brandText, {color: colors.text}]}>Pak<Text style={{color: BRAND_COLORS.primary}}>Uni</Text></Text>
        </View>
      </View>
      <TouchableOpacity style={[styles.skipButton, {backgroundColor: `${colors.text}10`}]} onPress={onSkip} activeOpacity={0.7}>
        <Text style={[styles.skipText, {color: colors.textSecondary}]}>Skip</Text>
        <Icon name="chevron-forward" family="Ionicons" size={16} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
});

// ============================================================================
// ACTION BUTTONS
// ============================================================================

interface ActionButtonsProps {
  currentIndex: number;
  totalSlides: number;
  activeGradient: string[];
  onNext: () => void;
  onBack: () => void;
  onGetStarted: () => void;
  colors: any;
}

export const ActionButtons = memo<ActionButtonsProps>(({currentIndex, totalSlides, activeGradient, onNext, onBack, onGetStarted, colors}) => {
  const isFirstSlide = currentIndex === 0;
  const isLastSlide = currentIndex === totalSlides - 1;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => { Animated.spring(buttonScale, {toValue: 0.95, tension: 100, friction: 5, useNativeDriver: true}).start(); };
  const handlePressOut = () => { Animated.spring(buttonScale, {toValue: 1, tension: 100, friction: 5, useNativeDriver: true}).start(); };

  return (
    <View style={styles.actionsContainer}>
      <TouchableOpacity style={[styles.backButton, {backgroundColor: `${colors.text}10`, opacity: isFirstSlide ? 0 : 1}]}
        onPress={onBack} disabled={isFirstSlide} activeOpacity={0.7}>
        <Icon name="chevron-back" family="Ionicons" size={24} color={colors.text} />
      </TouchableOpacity>

      <Animated.View style={[styles.mainButtonWrapper, {transform: [{scale: buttonScale}]}]}>
        <Pressable onPress={isLastSlide ? onGetStarted : onNext} onPressIn={handlePressIn} onPressOut={handlePressOut}>
          <LinearGradient colors={activeGradient} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.mainButton}>
            <Text style={styles.mainButtonText}>{isLastSlide ? 'Get Started' : 'Next'}</Text>
            <Icon name={isLastSlide ? 'rocket' : 'arrow-forward'} family="Ionicons" size={22} color="rgba(255,255,255,0.9)" />
          </LinearGradient>
        </Pressable>
      </Animated.View>

      <View style={styles.backButton} />
    </View>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Progress bar
  progressBarContainer: {paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12},
  progressBarBg: {flex: 1, height: 4, borderRadius: 2, overflow: 'hidden'},
  progressBarFill: {height: '100%', borderRadius: 2},
  progressBarGradient: {flex: 1, borderRadius: 2},
  progressText: {fontSize: 12, fontWeight: TYPOGRAPHY.weight.semibold, minWidth: 50, textAlign: 'right'},
  // Dots
  dotsContainer: {flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 15, gap: 8},
  dot: {height: 8, borderRadius: 4},
  // Header
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8},
  greetingText: {fontSize: 13, fontWeight: TYPOGRAPHY.weight.medium},
  brandContainer: {flexDirection: 'row', alignItems: 'center', gap: 6},
  brandText: {fontSize: 20, fontWeight: TYPOGRAPHY.weight.heavy, letterSpacing: -0.5},
  skipButton: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 4},
  skipText: {fontSize: 14, fontWeight: TYPOGRAPHY.weight.semibold},
  // Actions
  actionsContainer: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20},
  backButton: {width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center'},
  mainButtonWrapper: {flex: 1, marginHorizontal: 16},
  mainButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 16, gap: 10,
    ...Platform.select({ios: {shadowColor: '#4573DF', shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.4, shadowRadius: 16}, android: {elevation: 8}}),
  },
  mainButtonText: {fontSize: 17, fontWeight: TYPOGRAPHY.weight.bold, color: '#FFF', letterSpacing: 0.3},
});

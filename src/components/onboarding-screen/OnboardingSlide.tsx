/**
 * OnboardingSlide - Individual slide with parallax, illustrations, and premium animations.
 * Features: particle effects, sparkles, gradient animations, staggered text animations.
 */
import React, {memo, useEffect, useRef} from 'react';
import {View, Animated, StyleSheet, Dimensions, Easing} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../../contexts/ThemeContext';
import {TYPOGRAPHY} from '../../constants/design';
import {
  ParticleSystem, SparkleSystem,
  UniversityIllustration, CalculatorIllustration, ScholarshipIllustration,
  GuidesIllustration, ToolsIllustration, DeadlineIllustration,
  AchievementIllustration, AIIllustration,
} from '../onboarding';
import type {OnboardingSlide as SlideType} from './data';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const ILLUSTRATIONS: Record<string, React.ComponentType<any>> = {
  university: UniversityIllustration,
  calculator: CalculatorIllustration,
  scholarship: ScholarshipIllustration,
  guides: GuidesIllustration,
  tools: ToolsIllustration,
  deadlines: DeadlineIllustration,
  achievements: AchievementIllustration,
  ai: AIIllustration,
};

interface Props {
  item: SlideType;
  index: number;
  scrollX: Animated.Value;
  currentIndex: number;
}

const OnboardingSlide = memo<Props>(({item, index, scrollX, currentIndex}) => {
  const {colors} = useTheme();
  const isActive = index === currentIndex;
  const inputRange = [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH];

  // Parallax animations
  const titleTranslateX = scrollX.interpolate({inputRange, outputRange: [SCREEN_WIDTH * 0.3, 0, -SCREEN_WIDTH * 0.3], extrapolate: 'clamp'});
  const descTranslateX = scrollX.interpolate({inputRange, outputRange: [SCREEN_WIDTH * 0.5, 0, -SCREEN_WIDTH * 0.5], extrapolate: 'clamp'});
  const illustrationScale = scrollX.interpolate({inputRange, outputRange: [0.6, 1, 0.6], extrapolate: 'clamp'});
  const opacity = scrollX.interpolate({inputRange, outputRange: [0, 1, 0], extrapolate: 'clamp'});

  // Enhanced text animation on slide entry
  const textScale = useRef(new Animated.Value(0.9)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const descScale = useRef(new Animated.Value(0.95)).current;
  const descOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      // Staggered text animations
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(textScale, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();

      Animated.parallel([
        Animated.timing(descOpacity, {
          toValue: 1,
          duration: 700,
          delay: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(descScale, {
          toValue: 1,
          duration: 700,
          delay: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      textOpacity.setValue(0);
      textScale.setValue(0.9);
      descOpacity.setValue(0);
      descScale.setValue(0.95);
    }
  }, [isActive, textOpacity, textScale, descOpacity, descScale]);

  const IllustrationComponent = ILLUSTRATIONS[item.illustration];

  return (
    <View style={styles.slide}>
      {isActive && (
        <>
          <ParticleSystem colors={item.particleColors} count={20} minSize={3} maxSize={12} />
          <View style={[styles.gradientOverlay, {position: 'absolute'}]}>
            <LinearGradient colors={[`${item.gradient[0]}15`, `${item.gradient[1]}08`, 'transparent']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={{flex: 1}} />
          </View>
        </>
      )}

      <Animated.View style={[styles.illustrationWrapper, {transform: [{scale: illustrationScale}], opacity}]}>
        {IllustrationComponent && (
          <IllustrationComponent size={Math.min(SCREEN_WIDTH * 0.5, SCREEN_HEIGHT * 0.25)} isActive={isActive} primaryColor={item.gradient[0]} secondaryColor={item.gradient[1]} />
        )}
        {isActive && (
          <SparkleSystem color={item.gradient[0]} count={8} area={{width: SCREEN_WIDTH * 0.6, height: SCREEN_WIDTH * 0.5}} />
        )}
      </Animated.View>

      <View style={styles.contentContainer}>

        <Animated.Text style={[
          styles.slideTitle,
          {
            color: colors.text,
            opacity: textOpacity,
            transform: [{translateX: titleTranslateX}, {scale: textScale}],
          }
        ]}>
          {item.title}
        </Animated.Text>

        <Animated.Text style={[
          styles.slideDescription,
          {
            color: colors.textSecondary,
            opacity: descOpacity,
            transform: [{translateX: descTranslateX}, {scale: descScale}],
          }
        ]}>
          {item.description}
        </Animated.Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  slide: {width: SCREEN_WIDTH, flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, position: 'relative'},
  gradientOverlay: {width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.5, opacity: 0.4},
  illustrationWrapper: {marginTop: 8, marginBottom: 12, alignItems: 'center', justifyContent: 'center'},
  contentContainer: {alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16},
  statBadge: {marginBottom: 10},
  statBadgeGradient: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 8},
  statValue: {fontSize: 18, fontWeight: TYPOGRAPHY.weight.heavy},
  statLabel: {fontSize: 13, fontWeight: TYPOGRAPHY.weight.semibold, opacity: 0.9},
  slideTitle: {fontSize: 26, fontWeight: TYPOGRAPHY.weight.heavy, textAlign: 'center', marginBottom: 8, letterSpacing: -0.5},
  slideDescription: {fontSize: 15, textAlign: 'center', lineHeight: 22, maxWidth: 320, marginBottom: 10},
});

export default OnboardingSlide;

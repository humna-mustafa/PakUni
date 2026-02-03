/**
 * UltraOnboardingScreen - Premium First-Time User Experience
 * 
 * Maximum enhancements with:
 * - Custom Lottie-style animations (no third-party dependencies)
 * - Beautiful animated illustrations for each slide
 * - Particle effects and floating shapes
 * - Haptic feedback (if available)
 * - Smooth gesture-based navigation
 * - Progress indicators with animations
 * - Parallax scrolling effects
 * - Skip confirmation with value proposition
 * - Personalized welcome based on time of day
 * - Pakistani education context throughout
 * 
 * @author PakUni Team
 * @version 2.0.0
 */

import React, {useState, useRef, useCallback, useEffect, memo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
  FlatList,
  Platform,
  ViewToken,
  Pressable,
  Modal,
  Vibration,
  BackHandler,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Icon} from '../components/icons';
import {GraduationCapIcon, BRAND_COLORS} from '../components/AppLogo';
import {useTheme} from '../contexts/ThemeContext';
import {useAuth} from '../contexts/AuthContext';
import type {RootStackParamList} from '../navigation/AppNavigator';
import {TYPOGRAPHY} from '../constants/design';

// Import our custom animations
import {
  ParticleSystem,
  FloatingShapes,
  AnimatedIconContainer,
  SparkleSystem,
} from '../components/onboarding';

import {
  UniversityIllustration,
  CalculatorIllustration,
  ScholarshipIllustration,
  GuidesIllustration,
  ToolsIllustration,
  DeadlineIllustration,
  AchievementIllustration,
  AIIllustration,
} from '../components/onboarding';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

interface OnboardingSlide {
  id: string;
  iconName: string;
  iconFamily: string;
  title: string;
  subtitle: string;
  description: string;
  gradient: string[];
  particleColors: string[];
  illustration: 'university' | 'calculator' | 'scholarship' | 'guides' | 'tools' | 'deadlines' | 'achievements' | 'ai';
  stat?: string;
  statLabel?: string;
}

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    iconName: 'graduation-cap',
    iconFamily: 'Custom',
    title: 'Discover Your Future',
    subtitle: '200+ Universities',
    description: 'Explore all HEC-recognized universities across Pakistan. Find the perfect match for your dreams with smart filters and detailed insights.',
    gradient: ['#4573DF', '#3660C9'],
    particleColors: ['#4573DF', '#60A5FA', '#93C5FD', '#3B82F6'],
    illustration: 'university',
    stat: '200+',
    statLabel: 'Universities',
  },
  {
    id: '2',
    iconName: 'calculator',
    iconFamily: 'Ionicons',
    title: 'Know Your Chances',
    subtitle: 'Smart Merit Calculator',
    description: 'Use intelligent calculators with real university formulas. See your admission chances instantly and plan strategically.',
    gradient: ['#10B981', '#059669'],
    particleColors: ['#10B981', '#34D399', '#6EE7B7', '#047857'],
    illustration: 'calculator',
    stat: '15+',
    statLabel: 'Calculators',
  },
  {
    id: '3',
    iconName: 'ribbon',
    iconFamily: 'Ionicons',
    title: 'Fund Your Education',
    subtitle: 'Scholarships & Grants',
    description: 'Discover merit-based, need-based, and special scholarships. Get personalized alerts for opportunities matching your profile.',
    gradient: ['#F59E0B', '#D97706'],
    particleColors: ['#F59E0B', '#FBBF24', '#FCD34D', '#B45309'],
    illustration: 'scholarship',
    stat: '50+',
    statLabel: 'Scholarships',
  },
  {
    id: '4',
    iconName: 'book',
    iconFamily: 'Ionicons',
    title: 'Expert Guidance',
    subtitle: 'Comprehensive Guides',
    description: 'From admission processes to career planning, study tips to mental wellness - everything you need for academic success.',
    gradient: ['#0891B2', '#0E7490'],
    particleColors: ['#0891B2', '#22D3EE', '#67E8F9', '#06B6D4'],
    illustration: 'guides',
    stat: '30+',
    statLabel: 'Guides',
  },
  {
    id: '5',
    iconName: 'construct',
    iconFamily: 'Ionicons',
    title: 'Powerful Tools',
    subtitle: 'Plan & Simulate',
    description: 'Grade converters, target calculators, what-if simulators, and comparison tools - plan your academic journey with precision.',
    gradient: ['#8B5CF6', '#7C3AED'],
    particleColors: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#6D28D9'],
    illustration: 'tools',
    stat: '20+',
    statLabel: 'Tools',
  },
  {
    id: '6',
    iconName: 'time',
    iconFamily: 'Ionicons',
    title: 'Never Miss Out',
    subtitle: 'Deadline Tracker',
    description: 'Set custom countdowns for entry tests, admission deadlines, and scholarship dates. Get smart reminders so you\'re always prepared.',
    gradient: ['#EF4444', '#DC2626'],
    particleColors: ['#EF4444', '#F87171', '#FCA5A5', '#B91C1C'],
    illustration: 'deadlines',
    stat: '100%',
    statLabel: 'On Track',
  },
  {
    id: '7',
    iconName: 'trophy',
    iconFamily: 'Ionicons',
    title: 'Celebrate Success',
    subtitle: 'Achievements & Sharing',
    description: 'Earn badges for milestones, create shareable merit cards, and celebrate your journey with friends and family.',
    gradient: ['#F97316', '#EA580C'],
    particleColors: ['#F97316', '#FB923C', '#FDBA74', '#C2410C'],
    illustration: 'achievements',
    stat: '🏆',
    statLabel: 'Earn Badges',
  },
  {
    id: '8',
    iconName: 'sparkles',
    iconFamily: 'Ionicons',
    title: 'AI-Powered Matches',
    subtitle: 'Smart Recommendations',
    description: 'Get personalized university recommendations based on your marks, interests, location, and career goals. Your perfect match awaits!',
    gradient: ['#4573DF', '#6366F1'],
    particleColors: ['#4573DF', '#818CF8', '#A5B4FC', '#4F46E5'],
    illustration: 'ai',
    stat: '✨',
    statLabel: 'Personalized',
  },
];

// ============================================================================
// GREETING BASED ON TIME
// ============================================================================

const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  if (hour < 21) return 'Good Evening';
  return 'Welcome';
};

// ============================================================================
// HAPTIC FEEDBACK HELPER
// ============================================================================

const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if (Platform.OS === 'android') {
    const durations = {light: 10, medium: 20, heavy: 30};
    Vibration.vibrate(durations[type]);
  }
  // iOS haptics would require react-native-haptic-feedback
};

// ============================================================================
// ANIMATED PROGRESS BAR
// ============================================================================

interface ProgressBarProps {
  current: number;
  total: number;
  colors: any;
  activeGradient: string[];
}

const ProgressBar = memo<ProgressBarProps>(({current, total, colors, activeGradient}) => {
  const progress = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.spring(progress, {
      toValue: (current + 1) / total,
      tension: 50,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, [current, total]);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBarBg, {backgroundColor: colors.border}]}>
        <Animated.View style={[styles.progressBarFill, {width}]}>
          <LinearGradient
            colors={activeGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.progressBarGradient}
          />
        </Animated.View>
      </View>
      <Text style={[styles.progressText, {color: colors.textSecondary}]}>
        {current + 1} of {total}
      </Text>
    </View>
  );
});

// ============================================================================
// ANIMATED DOT PAGINATION
// ============================================================================

interface DotPaginationProps {
  data: OnboardingSlide[];
  scrollX: Animated.Value;
  colors: any;
  onDotPress: (index: number) => void;
}

const DotPagination = memo<DotPaginationProps>(({data, scrollX, colors, onDotPress}) => {
  return (
    <View style={styles.dotsContainer}>
      {data.map((item, index) => {
        const inputRange = [
          (index - 1) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 1) * SCREEN_WIDTH,
        ];

        const scale = scrollX.interpolate({
          inputRange,
          outputRange: [1, 1.4, 1],
          extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.4, 1, 0.4],
          extrapolate: 'clamp',
        });

        const width = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });

        return (
          <Pressable key={index} onPress={() => onDotPress(index)}>
            <Animated.View
              style={[
                styles.dot,
                {
                  width,
                  opacity,
                  transform: [{scale}],
                  backgroundColor: item.gradient[0],
                },
              ]}
            />
          </Pressable>
        );
      })}
    </View>
  );
});

// ============================================================================
// SLIDE COMPONENT
// ============================================================================

interface SlideProps {
  item: OnboardingSlide;
  index: number;
  scrollX: Animated.Value;
  currentIndex: number;
}

const Slide = memo<SlideProps>(({item, index, scrollX, currentIndex}) => {
  const {colors} = useTheme();
  const isActive = index === currentIndex;
  
  const inputRange = [
    (index - 1) * SCREEN_WIDTH,
    index * SCREEN_WIDTH,
    (index + 1) * SCREEN_WIDTH,
  ];

  // Parallax effects
  const titleTranslateX = scrollX.interpolate({
    inputRange,
    outputRange: [SCREEN_WIDTH * 0.3, 0, -SCREEN_WIDTH * 0.3],
    extrapolate: 'clamp',
  });

  const descTranslateX = scrollX.interpolate({
    inputRange,
    outputRange: [SCREEN_WIDTH * 0.5, 0, -SCREEN_WIDTH * 0.5],
    extrapolate: 'clamp',
  });

  const illustrationScale = scrollX.interpolate({
    inputRange,
    outputRange: [0.6, 1, 0.6],
    extrapolate: 'clamp',
  });

  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0, 1, 0],
    extrapolate: 'clamp',
  });

  // Render appropriate illustration
  const renderIllustration = () => {
    const illustrationProps = {
      size: SCREEN_WIDTH * 0.65,
      isActive,
      primaryColor: item.gradient[0],
      secondaryColor: item.gradient[1],
    };

    switch (item.illustration) {
      case 'university':
        return <UniversityIllustration {...illustrationProps} />;
      case 'calculator':
        return <CalculatorIllustration {...illustrationProps} />;
      case 'scholarship':
        return <ScholarshipIllustration {...illustrationProps} />;
      case 'guides':
        return <GuidesIllustration {...illustrationProps} />;
      case 'tools':
        return <ToolsIllustration {...illustrationProps} />;
      case 'deadlines':
        return <DeadlineIllustration {...illustrationProps} />;
      case 'achievements':
        return <AchievementIllustration {...illustrationProps} />;
      case 'ai':
        return <AIIllustration {...illustrationProps} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.slide}>
      {/* Background particles - only for active slide */}
      {isActive && (
        <ParticleSystem
          colors={item.particleColors}
          count={15}
          minSize={4}
          maxSize={10}
        />
      )}

      {/* Illustration */}
      <Animated.View
        style={[
          styles.illustrationWrapper,
          {
            transform: [{scale: illustrationScale}],
            opacity,
          },
        ]}
      >
        {renderIllustration()}
        
        {/* Sparkles overlay */}
        {isActive && (
          <SparkleSystem
            color={item.gradient[0]}
            count={6}
            area={{width: SCREEN_WIDTH * 0.6, height: SCREEN_WIDTH * 0.6}}
          />
        )}
      </Animated.View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {/* Badge with stat */}
        <Animated.View style={[styles.statBadge, {opacity}]}>
          <LinearGradient
            colors={[`${item.gradient[0]}25`, `${item.gradient[1]}15`]}
            style={styles.statBadgeGradient}
          >
            <Text style={[styles.statValue, {color: item.gradient[0]}]}>
              {item.stat}
            </Text>
            <Text style={[styles.statLabel, {color: item.gradient[0]}]}>
              {item.statLabel}
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Title with parallax */}
        <Animated.Text
          style={[
            styles.slideTitle,
            {
              color: colors.text,
              transform: [{translateX: titleTranslateX}],
            },
          ]}
        >
          {item.title}
        </Animated.Text>

        {/* Description with parallax */}
        <Animated.Text
          style={[
            styles.slideDescription,
            {
              color: colors.textSecondary,
              transform: [{translateX: descTranslateX}],
            },
          ]}
        >
          {item.description}
        </Animated.Text>
      </View>
    </View>
  );
});

// ============================================================================
// SKIP CONFIRMATION MODAL
// ============================================================================

interface SkipModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  colors: any;
}

const SkipModal = memo<SkipModalProps>(({visible, onConfirm, onCancel, colors}) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {toValue: 1, tension: 65, friction: 7, useNativeDriver: true}),
        Animated.timing(opacityAnim, {toValue: 1, duration: 200, useNativeDriver: true}),
      ]).start();
    } else {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const features = [
    {icon: 'school', text: '200+ Universities Database'},
    {icon: 'calculator', text: 'Smart Merit Calculators'},
    {icon: 'ribbon', text: '50+ Scholarships'},
    {icon: 'sparkles', text: 'AI Recommendations'},
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.card,
              transform: [{scale: scaleAnim}],
              opacity: opacityAnim,
            },
          ]}
        >
          <View style={styles.modalIcon}>
            <LinearGradient
              colors={[BRAND_COLORS.primary, BRAND_COLORS.primaryDark]}
              style={styles.modalIconGradient}
            >
              <Icon name="information-circle" family="Ionicons" size={32} color="#FFF" />
            </LinearGradient>
          </View>

          <Text style={[styles.modalTitle, {color: colors.text}]}>
            Skip the Tour?
          </Text>

          <Text style={[styles.modalMessage, {color: colors.textSecondary}]}>
            You'll miss learning about these powerful features:
          </Text>

          <View style={styles.featuresList}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Icon name={feature.icon} family="Ionicons" size={18} color={BRAND_COLORS.primary} />
                <Text style={[styles.featureText, {color: colors.text}]}>
                  {feature.text}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSecondary, {borderColor: colors.border}]}
              onPress={onConfirm}
            >
              <Text style={[styles.modalButtonText, {color: colors.textSecondary}]}>
                Skip Anyway
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonPrimary]}
              onPress={onCancel}
            >
              <LinearGradient
                colors={[BRAND_COLORS.primary, BRAND_COLORS.primaryDark]}
                style={styles.modalButtonGradient}
              >
                <Text style={styles.modalButtonTextWhite}>Continue Tour</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
});

// ============================================================================
// WELCOME HEADER
// ============================================================================

interface WelcomeHeaderProps {
  colors: any;
  onSkip: () => void;
}

const WelcomeHeader = memo<WelcomeHeaderProps>(({colors, onSkip}) => {
  const greeting = getTimeBasedGreeting();
  
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={[styles.greetingText, {color: colors.textSecondary}]}>
          {greeting} 👋
        </Text>
        <View style={styles.brandContainer}>
          <GraduationCapIcon 
            size={24} 
            primaryColor={BRAND_COLORS.primary}
            animated={false}
          />
          <Text style={[styles.brandText, {color: colors.text}]}>
            Pak<Text style={{color: BRAND_COLORS.primary}}>Uni</Text>
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.skipButton, {backgroundColor: `${colors.text}10`}]}
        onPress={onSkip}
        activeOpacity={0.7}
      >
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

const ActionButtons = memo<ActionButtonsProps>(({
  currentIndex,
  totalSlides,
  activeGradient,
  onNext,
  onBack,
  onGetStarted,
  colors,
}) => {
  const isFirstSlide = currentIndex === 0;
  const isLastSlide = currentIndex === totalSlides - 1;
  
  const buttonScale = useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      tension: 100,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      tension: 100,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.actionsContainer}>
      {/* Back button - hidden on first slide */}
      <TouchableOpacity
        style={[
          styles.backButton,
          {
            backgroundColor: `${colors.text}10`,
            opacity: isFirstSlide ? 0 : 1,
          },
        ]}
        onPress={onBack}
        disabled={isFirstSlide}
        activeOpacity={0.7}
      >
        <Icon name="chevron-back" family="Ionicons" size={24} color={colors.text} />
      </TouchableOpacity>

      {/* Main action button */}
      <Animated.View style={[styles.mainButtonWrapper, {transform: [{scale: buttonScale}]}]}>
        <Pressable
          onPress={isLastSlide ? onGetStarted : onNext}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <LinearGradient
            colors={activeGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.mainButton}
          >
            <Text style={styles.mainButtonText}>
              {isLastSlide ? 'Get Started' : 'Next'}
            </Text>
            <View style={styles.mainButtonIcon}>
              <Icon 
                name={isLastSlide ? 'rocket' : 'arrow-forward'} 
                family="Ionicons" 
                size={20} 
                color={activeGradient[0]} 
              />
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>

      {/* Spacer for layout balance */}
      <View style={styles.backButton} />
    </View>
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UltraOnboardingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {colors, isDark} = useTheme();
  const {completeOnboarding} = useAuth();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSkipModal, setShowSkipModal] = useState(false);
  
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Entry animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Hardware back button - show skip modal to confirm exit
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (currentIndex > 0) {
        // If not on first slide, go back one slide
        flatListRef.current?.scrollToIndex({
          index: currentIndex - 1,
          animated: true,
        });
      } else {
        // On first slide, show skip confirmation
        setShowSkipModal(true);
      }
      return true; // Prevent default back behavior
    });

    return () => backHandler.remove();
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    triggerHaptic('light');
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  }, [currentIndex]);

  const handleBack = useCallback(() => {
    triggerHaptic('light');
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex - 1,
        animated: true,
      });
    }
  }, [currentIndex]);

  const handleSkipPress = useCallback(() => {
    triggerHaptic('medium');
    setShowSkipModal(true);
  }, []);

  const handleSkipConfirm = useCallback(async () => {
    triggerHaptic('heavy');
    setShowSkipModal(false);
    await completeOnboarding();
    navigation.reset({
      index: 0,
      routes: [{name: 'MainTabs'}],
    });
  }, [completeOnboarding, navigation]);

  const handleGetStarted = useCallback(async () => {
    triggerHaptic('heavy');
    await completeOnboarding();
    navigation.reset({
      index: 0,
      routes: [{name: 'MainTabs'}],
    });
  }, [completeOnboarding, navigation]);

  const handleDotPress = useCallback((index: number) => {
    triggerHaptic('light');
    flatListRef.current?.scrollToIndex({index, animated: true});
  }, []);

  const onViewableItemsChanged = useRef(({viewableItems}: {viewableItems: ViewToken[]}) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const renderItem = useCallback(({item, index}: {item: OnboardingSlide; index: number}) => (
    <Slide 
      item={item} 
      index={index} 
      scrollX={scrollX} 
      currentIndex={currentIndex}
    />
  ), [scrollX, currentIndex]);

  const keyExtractor = useCallback((item: OnboardingSlide) => item.id, []);

  const currentSlide = ONBOARDING_SLIDES[currentIndex];

  return (
    <Animated.View style={[styles.container, {backgroundColor: colors.background, opacity: fadeAnim}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Background floating shapes */}
      <FloatingShapes
        primaryColor={currentSlide.gradient[0]}
        secondaryColor={currentSlide.gradient[1]}
        accentColor={BRAND_COLORS.gold}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <WelcomeHeader colors={colors} onSkip={handleSkipPress} />

        {/* Progress bar */}
        <ProgressBar
          current={currentIndex}
          total={ONBOARDING_SLIDES.length}
          colors={colors}
          activeGradient={currentSlide.gradient}
        />

        {/* Slides */}
        <FlatList
          ref={flatListRef}
          data={ONBOARDING_SLIDES}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          horizontal
          pagingEnabled
          style={{flex: 1}}
          contentContainerStyle={{flexGrow: 1}}
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onScroll={Animated.event(
            [{nativeEvent: {contentOffset: {x: scrollX}}}],
            {useNativeDriver: false}
          )}
          scrollEventThrottle={16}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          decelerationRate="fast"
          snapToInterval={SCREEN_WIDTH}
          snapToAlignment="center"
        />

        {/* Bottom section */}
        <View style={styles.bottomSection}>
          {/* Dot pagination */}
          <DotPagination
            data={ONBOARDING_SLIDES}
            scrollX={scrollX}
            colors={colors}
            onDotPress={handleDotPress}
          />

          {/* Action buttons */}
          <ActionButtons
            currentIndex={currentIndex}
            totalSlides={ONBOARDING_SLIDES.length}
            activeGradient={currentSlide.gradient}
            onNext={handleNext}
            onBack={handleBack}
            onGetStarted={handleGetStarted}
            colors={colors}
          />
        </View>
      </SafeAreaView>

      {/* Skip confirmation modal */}
      <SkipModal
        visible={showSkipModal}
        onConfirm={handleSkipConfirm}
        onCancel={() => setShowSkipModal(false)}
        colors={colors}
      />
    </Animated.View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 20) + 8 : 8,
    paddingBottom: 8,
  },
  headerLeft: {
    gap: 2,
  },
  greetingText: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandText: {
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weight.heavy,
    letterSpacing: -0.5,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  skipText: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },

  // Progress bar
  progressBarContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressBarGradient: {
    flex: 1,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.semibold,
    minWidth: 50,
    textAlign: 'right',
  },

  // Slide
  slide: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  illustrationWrapper: {
    marginTop: 10,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  statBadge: {
    marginBottom: 10,
  },
  statBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weight.heavy,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weight.semibold,
    opacity: 0.9,
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: TYPOGRAPHY.weight.heavy,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitleBadge: {
    marginBottom: 16,
  },
  subtitleGradient: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
  },
  subtitleText: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFF',
    letterSpacing: 0.3,
  },
  slideDescription: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
    marginBottom: 10,
    paddingBottom: 0,
  },

  // Dots pagination
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },

  // Actions
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainButtonWrapper: {
    flex: 1,
    marginHorizontal: 16,
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#4573DF',
        shadowOffset: {width: 0, height: 8},
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  mainButtonText: {
    fontSize: 17,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFF',
    letterSpacing: 0.3,
  },
  mainButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 12,
  },
  footerText: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.medium,
  },

  // Bottom section
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 12},
        shadowOpacity: 0.25,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalIconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weight.heavy,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  featuresList: {
    width: '100%',
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  featureText: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalButtonSecondary: {
    borderWidth: 1.5,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    // Styles applied via gradient
  },
  modalButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  modalButtonTextWhite: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFF',
  },
});

export default UltraOnboardingScreen;

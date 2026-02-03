/**
 * OnboardingScreen - Beautiful First-Time User Experience
 * Premium onboarding with enhanced animations, smoother transitions,
 * and polished UI for a world-class first impression
 */

import React, {useState, useRef, useCallback, memo, useEffect} from 'react';
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
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Icon} from '../components/icons';
import {AppLogo, GraduationCapIcon, BRAND_COLORS} from '../components/AppLogo';
import {useTheme} from '../contexts/ThemeContext';
import {useAuth} from '../contexts/AuthContext';
import {TYPOGRAPHY} from '../constants/design';
import type {RootStackParamList} from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// ============================================================================
// ONBOARDING DATA
// ============================================================================

interface OnboardingSlide {
  id: string;
  iconName: string;
  iconFamily: string;
  title: string;
  subtitle: string;
  description: string;
  gradient: string[];
  bgPattern: string;
}

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    iconName: 'graduation-cap', // Custom - will use GraduationCapIcon
    iconFamily: 'Custom',
    title: 'Discover Universities',
    subtitle: '200+ Universities',
    description: 'Explore all HEC-recognized universities across Pakistan. Filter by location, ranking, and programs to find your perfect match.',
    gradient: ['#4573DF', '#3660C9'],
    bgPattern: 'academic',
  },
  {
    id: '2',
    iconName: 'calculator',
    iconFamily: 'Ionicons',
    title: 'Calculate Your Merit',
    subtitle: 'Smart Calculator',
    description: 'Use our intelligent merit calculator with real university formulas. Know your chances of admission instantly.',
    gradient: ['#10B981', '#047857'],
    bgPattern: 'numbers',
  },
  {
    id: '3',
    iconName: 'ribbon',
    iconFamily: 'Ionicons',
    title: 'Find Scholarships',
    subtitle: '50+ Scholarships',
    description: 'Discover merit-based, need-based, and special scholarships. Get alerts for new opportunities matching your profile.',
    gradient: ['#F59E0B', '#D97706'],
    bgPattern: 'stars',
  },
  {
    id: '4',
    iconName: 'book',
    iconFamily: 'Ionicons',
    title: 'Comprehensive Guides',
    subtitle: 'Step-by-Step Help',
    description: 'Admission guides, study tips, career paths, financial planning, mental health support - everything you need!',
    gradient: ['#06B6D4', '#0891B2'],
    bgPattern: 'guides',
  },
  {
    id: '5',
    iconName: 'construct',
    iconFamily: 'Ionicons',
    title: 'Powerful Tools',
    subtitle: 'Calculators & Simulators',
    description: 'Grade converters, target calculators, what-if simulators - all the tools you need to plan your academic journey.',
    gradient: ['#8B5CF6', '#7C3AED'],
    bgPattern: 'tools',
  },
  {
    id: '6',
    iconName: 'time',
    iconFamily: 'Ionicons',
    title: 'Track Deadlines',
    subtitle: 'Never Miss Dates',
    description: 'Set custom entry test countdowns, follow universities, and get reminders for important admission deadlines.',
    gradient: ['#EF4444', '#DC2626'],
    bgPattern: 'deadlines',
  },
  {
    id: '7',
    iconName: 'trophy',
    iconFamily: 'Ionicons',
    title: 'Earn Achievements',
    subtitle: 'Share Your Success',
    description: 'Earn badges for completing entry tests, securing admissions, and more. Share merit success cards with friends!',
    gradient: ['#F59E0B', '#B45309'],
    bgPattern: 'achievements',
  },
  {
    id: '8',
    iconName: 'sparkles',
    iconFamily: 'Ionicons',
    title: 'AI Recommendations',
    subtitle: 'Personalized Matches',
    description: 'Get smart university recommendations based on your marks, interests, and career goals. Your future starts here!',
    gradient: ['#EC4899', '#DB2777'],
    bgPattern: 'ai',
  },
];

// ============================================================================
// SLIDE COMPONENT - Enhanced with smoother animations
// ============================================================================

interface SlideProps {
  item: OnboardingSlide;
  index: number;
  scrollX: Animated.Value;
}

const Slide = memo<SlideProps>(({item, index, scrollX}) => {
  const {colors} = useTheme();
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Floating animation for icon
  useEffect(() => {
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    floatAnimation.start();
    
    // Subtle pulse effect
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
    
    return () => {
      floatAnimation.stop();
      pulseAnimation.stop();
    };
  }, [floatAnim, pulseAnim]);
  
  const inputRange = [
    (index - 1) * SCREEN_WIDTH,
    index * SCREEN_WIDTH,
    (index + 1) * SCREEN_WIDTH,
  ];

  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.75, 1, 0.75],
    extrapolate: 'clamp',
  });

  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.2, 1, 0.2],
    extrapolate: 'clamp',
  });

  const translateY = scrollX.interpolate({
    inputRange,
    outputRange: [60, 0, 60],
    extrapolate: 'clamp',
  });
  
  const rotateZ = scrollX.interpolate({
    inputRange,
    outputRange: ['-5deg', '0deg', '5deg'],
    extrapolate: 'clamp',
  });

  // Check if this is the first slide with the custom graduation cap icon
  const isCustomIcon = item.iconFamily === 'Custom';

  return (
    <View style={styles.slide}>
      {/* Background decorative elements */}
      <View style={styles.bgDecoration}>
        <Animated.View 
          style={[
            styles.bgCircle1,
            {backgroundColor: `${item.gradient[0]}08`}
          ]}
        />
        <Animated.View 
          style={[
            styles.bgCircle2,
            {backgroundColor: `${item.gradient[1]}06`}
          ]}
        />
      </View>
      
      {/* Animated Icon Container */}
      <Animated.View
        style={[
          styles.iconWrapper,
          {
            transform: [
              {scale: Animated.multiply(scale, pulseAnim)}, 
              {translateY: Animated.add(translateY, floatAnim)},
              {rotate: rotateZ},
            ],
            opacity,
          },
        ]}>
        <LinearGradient
          colors={item.gradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.iconGradient}>
          {/* Decorative circles with improved styling */}
          <Animated.View style={[styles.decoCircle1, {transform: [{translateY: Animated.multiply(floatAnim, -0.5)}]}]} />
          <Animated.View style={[styles.decoCircle2, {transform: [{translateY: Animated.multiply(floatAnim, 0.5)}]}]} />
          <Animated.View style={[styles.decoCircle3, {transform: [{translateY: floatAnim}]}]} />
          
          <View style={styles.iconCircle}>
            {isCustomIcon ? (
              <GraduationCapIcon 
                size={64} 
                primaryColor="#FFFFFF"
                secondaryColor="rgba(255,255,255,0.8)"
                animated
              />
            ) : (
              <Icon 
                name={item.iconName} 
                family="Ionicons" 
                size={52} 
                color="#FFFFFF" 
              />
            )}
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Content */}
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity,
            transform: [{translateY}],
          },
        ]}>
        <View style={styles.badgeContainer}>
          <LinearGradient
            colors={[`${item.gradient[0]}30`, `${item.gradient[1]}20`]}
            style={styles.badge}>
            <Text style={[styles.badgeText, {color: item.gradient[0]}]}>
              {item.subtitle}
            </Text>
          </LinearGradient>
        </View>

        <Text style={[styles.title, {color: colors.text}]}>{item.title}</Text>
        <Text style={[styles.description, {color: colors.textSecondary}]}>{item.description}</Text>
      </Animated.View>
    </View>
  );
});

// ============================================================================
// PAGINATION
// ============================================================================

interface PaginationProps {
  data: OnboardingSlide[];
  scrollX: Animated.Value;
  colors: any;
}

const Pagination = memo<PaginationProps>(({data, scrollX, colors}) => {
  return (
    <View style={styles.pagination}>
      {data.map((_, index) => {
        const inputRange = [
          (index - 1) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 1) * SCREEN_WIDTH,
        ];

        const width = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        const backgroundColor = scrollX.interpolate({
          inputRange,
          outputRange: [colors.border, colors.primary, colors.border],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width,
                opacity,
                backgroundColor,
              },
            ]}
          />
        );
      })}
    </View>
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {colors, isDark} = useTheme();
  const {completeOnboarding} = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const handleNext = useCallback(() => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleGetStarted();
    }
  }, [currentIndex]);

  const handleSkip = useCallback(() => {
    handleGetStarted();
  }, []);

  const handleGetStarted = useCallback(async () => {
    await completeOnboarding();
    navigation.reset({
      index: 0,
      routes: [{name: 'MainTabs'}],
    });
  }, [completeOnboarding, navigation]);

  const onViewableItemsChanged = useRef(({viewableItems}: {viewableItems: ViewToken[]}) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const isLastSlide = currentIndex === ONBOARDING_SLIDES.length - 1;

  const renderItem = useCallback(({item, index}: {item: OnboardingSlide; index: number}) => (
    <Slide item={item} index={index} scrollX={scrollX} />
  ), [scrollX]);

  const keyExtractor = useCallback((item: OnboardingSlide) => item.id, []);

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Skip Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.skipButton, {backgroundColor: colors.card}]}
            onPress={handleSkip}
            activeOpacity={0.8}>
            <Text style={[styles.skipText, {color: colors.textSecondary}]}>
              Skip
            </Text>
          </TouchableOpacity>
        </View>

        {/* Slides */}
        <FlatList
          ref={flatListRef}
          data={ONBOARDING_SLIDES}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          horizontal
          pagingEnabled
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
        />

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Pagination */}
          <Pagination data={ONBOARDING_SLIDES} scrollX={scrollX} colors={colors} />

          {/* Actions */}
          <View style={styles.actionsContainer}>
            {isLastSlide ? (
              <TouchableOpacity
                style={styles.getStartedButton}
                onPress={handleGetStarted}
                activeOpacity={0.9}>
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.getStartedGradient}>
                  <Text style={styles.getStartedText}>Get Started</Text>
                  <View style={styles.arrowCircle}>
                    <Icon name="arrow-forward" family="Ionicons" size={18} color={colors.primary} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.nextButton, {backgroundColor: colors.primary}]}
                onPress={handleNext}
                activeOpacity={0.9}>
                <Text style={styles.nextText}>Next</Text>
                <Icon name="arrow-forward" family="Ionicons" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

// ============================================================================
// STYLES - Enhanced for premium look
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 20 : 10,
  },
  skipButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  skipText: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.semibold,
    letterSpacing: 0.3,
  },
  slide: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 30,
    position: 'relative',
    overflow: 'hidden',
  },
  bgDecoration: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgCircle1: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    borderRadius: SCREEN_WIDTH * 0.4,
    top: -50,
    right: -100,
  },
  bgCircle2: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6,
    borderRadius: SCREEN_WIDTH * 0.3,
    bottom: 100,
    left: -80,
  },
  iconWrapper: {
    marginBottom: 36,
  },
  iconGradient: {
    width: 190,
    height: 190,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 16},
        shadowOpacity: 0.35,
        shadowRadius: 24,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  decoCircle1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  decoCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  decoCircle3: {
    position: 'absolute',
    top: 25,
    left: 15,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  badgeContainer: {
    marginBottom: 20,
  },
  badge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weight.bold,
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 30,
    fontWeight: TYPOGRAPHY.weight.heavy,
    textAlign: 'center',
    marginBottom: 18,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 340,
    letterSpacing: 0.2,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 36,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 36,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
  },
  actionsContainer: {
    alignItems: 'center',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 56,
    borderRadius: 20,
    gap: 10,
    minWidth: 200,
    ...Platform.select({
      ios: {
        shadowColor: '#4573DF',
        shadowOffset: {width: 0, height: 6},
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  nextText: {
    fontSize: 17,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  getStartedButton: {
    width: '100%',
  },
  getStartedGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 36,
    borderRadius: 20,
    gap: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#4573DF',
        shadowOffset: {width: 0, height: 10},
        shadowOpacity: 0.45,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  getStartedText: {
    fontSize: 19,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  arrowCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OnboardingScreen;



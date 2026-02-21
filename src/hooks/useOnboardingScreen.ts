/**
 * useOnboardingScreen - State and handlers for UltraOnboardingScreen.
 */
import {useState, useRef, useCallback, useEffect} from 'react';
import {Animated, BackHandler, FlatList, Dimensions, ViewToken} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../contexts/ThemeContext';
import {useAuth} from '../contexts/AuthContext';
import type {RootStackParamList} from '../navigation/AppNavigator';
import {ONBOARDING_SLIDES, triggerHaptic} from '../components/onboarding-screen/data';
import type {OnboardingSlide} from '../components/onboarding-screen/data';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
const {width: SCREEN_WIDTH} = Dimensions.get('window');

export const useOnboardingScreen = () => {
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
    Animated.timing(fadeAnim, {toValue: 1, duration: 600, useNativeDriver: true}).start();
  }, []);

  // Hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (currentIndex > 0) {
        flatListRef.current?.scrollToIndex({index: currentIndex - 1, animated: true});
      } else {
        setShowSkipModal(true);
      }
      return true;
    });
    return () => backHandler.remove();
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    triggerHaptic('light');
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({index: currentIndex + 1, animated: true});
    }
  }, [currentIndex]);

  const handleBack = useCallback(() => {
    triggerHaptic('light');
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({index: currentIndex - 1, animated: true});
    }
  }, [currentIndex]);

  const handleSkipPress = useCallback(() => {
    triggerHaptic('medium');
    setShowSkipModal(true);
  }, []);

  const finishOnboarding = useCallback(async () => {
    await completeOnboarding();
    navigation.reset({index: 0, routes: [{name: 'MainTabs'}]});
  }, [completeOnboarding, navigation]);

  const handleSkipConfirm = useCallback(async () => {
    triggerHaptic('heavy');
    setShowSkipModal(false);
    await finishOnboarding();
  }, [finishOnboarding]);

  const handleGetStarted = useCallback(async () => {
    triggerHaptic('heavy');
    await finishOnboarding();
  }, [finishOnboarding]);

  const handleDotPress = useCallback((index: number) => {
    triggerHaptic('light');
    flatListRef.current?.scrollToIndex({index, animated: true});
  }, []);

  const onViewableItemsChanged = useRef(({viewableItems}: {viewableItems: ViewToken[]}) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({viewAreaCoveragePercentThreshold: 50}).current;

  const renderItem = useCallback(({item, index}: {item: OnboardingSlide; index: number}) => {
    // Return null here - actual rendering done in screen
    return null;
  }, []);

  const keyExtractor = useCallback((item: OnboardingSlide) => item.id, []);

  const currentSlide = ONBOARDING_SLIDES[currentIndex];

  return {
    colors, isDark, currentIndex, showSkipModal, setShowSkipModal,
    scrollX, flatListRef, fadeAnim,
    handleNext, handleBack, handleSkipPress, handleSkipConfirm, handleGetStarted, handleDotPress,
    onViewableItemsChanged, viewabilityConfig, keyExtractor,
    currentSlide, slides: ONBOARDING_SLIDES, SCREEN_WIDTH,
  };
};

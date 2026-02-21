/**
 * UltraOnboardingScreen - Premium First-Time User Experience (thin composition)
 */
import React, {useCallback} from 'react';
import {View, StyleSheet, Animated, StatusBar, FlatList, Dimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {FloatingShapes} from '../components/onboarding';
import {BRAND_COLORS} from '../components/AppLogo';
import {
  ProgressBar, DotPagination, WelcomeHeader, ActionButtons,
  OnboardingSlide_Component as Slide, SkipModal,
  ONBOARDING_SLIDES,
} from '../components/onboarding-screen';
import type {OnboardingSlide} from '../components/onboarding-screen';
import {useOnboardingScreen} from '../hooks/useOnboardingScreen';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const UltraOnboardingScreen: React.FC = () => {
  const {
    colors, isDark, currentIndex, showSkipModal, setShowSkipModal,
    scrollX, flatListRef, fadeAnim,
    handleNext, handleBack, handleSkipPress, handleSkipConfirm, handleGetStarted, handleDotPress,
    onViewableItemsChanged, viewabilityConfig, keyExtractor,
    currentSlide,
  } = useOnboardingScreen();

  const renderItem = useCallback(({item, index}: {item: OnboardingSlide; index: number}) => (
    <Slide item={item} index={index} scrollX={scrollX} currentIndex={currentIndex} />
  ), [scrollX, currentIndex]);

  return (
    <Animated.View style={[styles.container, {backgroundColor: colors.background, opacity: fadeAnim}]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      <SafeAreaView style={{flex: 1}}>
        <WelcomeHeader colors={colors} onSkip={handleSkipPress} />
        <ProgressBar current={currentIndex} total={ONBOARDING_SLIDES.length} colors={colors} activeGradient={currentSlide.gradient} />

        <FlatList
          ref={flatListRef}
          data={ONBOARDING_SLIDES}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          horizontal pagingEnabled
          style={{flex: 1}} contentContainerStyle={{flexGrow: 1}}
          showsHorizontalScrollIndicator={false} bounces={false}
          onScroll={Animated.event([{nativeEvent: {contentOffset: {x: scrollX}}}], {useNativeDriver: false})}
          scrollEventThrottle={16}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={(_, index) => ({length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index})}
          decelerationRate="fast" snapToInterval={SCREEN_WIDTH} snapToAlignment="center"
        />

        <View style={{paddingHorizontal: 20, paddingBottom: 16}}>
          <DotPagination data={ONBOARDING_SLIDES} scrollX={scrollX} colors={colors} onDotPress={handleDotPress} />
          <ActionButtons currentIndex={currentIndex} totalSlides={ONBOARDING_SLIDES.length}
            activeGradient={currentSlide.gradient} onNext={handleNext} onBack={handleBack} onGetStarted={handleGetStarted} colors={colors} />
        </View>
      </SafeAreaView>

      <SkipModal visible={showSkipModal} onConfirm={handleSkipConfirm} onCancel={() => setShowSkipModal(false)} colors={colors} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
});

export default UltraOnboardingScreen;

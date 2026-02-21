import React from 'react';
import {View, Text, StyleSheet, ScrollView, Animated, Dimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SPACING, FONTS, BORDER_RADIUS} from '../constants/theme';
import {Icon} from '../components/icons';
import {
  AnimatedCareerCard,
  CategoryFilter,
  CareerDetailView,
  CareerQuizModal,
  FloatingDecoration,
} from '../components/career-kids';
import {useCareerExplorerKids} from '../hooks/useCareerExplorerKids';

const {width} = Dimensions.get('window');

const CareerExplorerKidsScreen = () => {
  const {
    colors,
    isDark,
    selectedCareer,
    showDetail,
    setShowDetail,
    selectedCategory,
    filteredCareers,
    headerScaleAnim,
    headerFadeAnim,
    sparkleRotation,
    getDifficultyColor,
    showQuiz,
    setShowQuiz,
    currentQuestion,
    score,
    quizCompleted,
    selectedAnswerIndex,
    showAnswerFeedback,
    quizQuestions,
    handleStartQuiz,
    handleAnswer,
    handleRetryQuiz,
    handleCareerPress,
    handleSelectCategory,
    categories,
    totalCareers,
  } = useCareerExplorerKids();

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]} edges={['bottom']}>
      {!showDetail ? (
        <>
          {/* Fun Header with Floating Decorations */}
          <Animated.View
            style={[
              styles.header,
              {
                backgroundColor: colors.primary,
                opacity: headerFadeAnim,
                transform: [{scale: headerScaleAnim}],
              },
            ]}>
            <FloatingDecoration emoji={'\u{1F468}\u200D\u2695\uFE0F'} delay={0} startX={20} startY={5} />
            <FloatingDecoration emoji={'\u{1F469}\u200D\u{1F4BB}'} delay={200} startX={width - 60} startY={10} />
            <FloatingDecoration emoji={'\u{1F3A8}'} delay={400} startX={50} startY={60} />
            <FloatingDecoration emoji={'\u{1F680}'} delay={600} startX={width - 90} startY={55} />
            <FloatingDecoration emoji={'\u2B50'} delay={800} startX={width / 2 - 80} startY={8} />
            <FloatingDecoration emoji={'\u{1F31F}'} delay={1000} startX={width / 2 + 40} startY={65} />

            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
              <Animated.View style={{marginRight: 8, transform: [{rotate: sparkleRotation}]}}>
                <Icon name="sparkles-outline" family="Ionicons" size={24} color={colors.white} />
              </Animated.View>
              <Text style={[styles.headerTitle, {color: colors.white}]}>Career Explorer for Kids</Text>
            </View>
            <Text style={[styles.headerSubtitle, {color: colors.white}]}>
              Discover {totalCareers} amazing careers! {'\u{1F3AF}'}
            </Text>
          </Animated.View>

          {/* Category Filter */}
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            filteredCount={filteredCareers.length}
            colors={colors}
          />

          {/* Career Cards */}
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {filteredCareers.map((career, index) => (
              <AnimatedCareerCard
                key={career.id}
                career={career}
                index={index}
                colors={colors}
                isDark={isDark}
                getDifficultyColor={getDifficultyColor}
                onPress={handleCareerPress}
              />
            ))}
          </ScrollView>
        </>
      ) : selectedCareer ? (
        <CareerDetailView
          career={selectedCareer}
          colors={colors}
          isDark={isDark}
          getDifficultyColor={getDifficultyColor}
          onBack={() => setShowDetail(false)}
          onStartQuiz={handleStartQuiz}
        />
      ) : null}

      {/* Quiz Modal */}
      <CareerQuizModal
        visible={showQuiz}
        career={selectedCareer}
        questions={quizQuestions}
        currentQuestion={currentQuestion}
        score={score}
        quizCompleted={quizCompleted}
        selectedAnswerIndex={selectedAnswerIndex}
        showAnswerFeedback={showAnswerFeedback}
        colors={colors}
        onAnswer={handleAnswer}
        onRetry={handleRetryQuiz}
        onClose={() => setShowQuiz(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    minHeight: 100,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.sm,
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
});

export default CareerExplorerKidsScreen;

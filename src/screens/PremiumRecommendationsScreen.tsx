/**
 * PremiumRecommendationsScreen - Thin composition layer
 * All logic in useRecommendationsScreen hook, UI in recommendations/ sub-components.
 */

import React from 'react';
import {View, Text, TouchableOpacity, ScrollView, Animated, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {SPACING} from '../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../constants/design';
import {Icon} from '../components/icons';
import {useRecommendationsScreen} from '../hooks/useRecommendationsScreen';
import {StepIndicator, WizardSteps, ResultsView} from '../components/recommendations';

const PremiumRecommendationsScreen = () => {
  const {
    colors, isDark, navigation,
    currentStep, showResults,
    profileDataLoaded, validationError,
    matricMarks, matricTotal, fscMarks, fscTotal, entryTestScore, entryTestTotal,
    onMatricMarksChange, onMatricTotalChange, onFscMarksChange, onFscTotalChange,
    onEntryTestScoreChange, onEntryTestTotalChange,
    preferredPrograms, preferredCities, preferredType, preferredSession,
    setPreferredPrograms, setPreferredCities, setPreferredType, setPreferredSession,
    subjectGroup, onSubjectGroupChange,
    gender, setGender, userProvince, setUserProvince, quotaFlags, setQuotaFlags,
    canProceed, handleNext, handleBack,
    recommendations, recommendationStats, handleViewDetails,
    headerAnim, contentAnim,
  } = useRecommendationsScreen();

  if (showResults) {
    return (
      <ResultsView
        colors={colors}
        isDark={isDark}
        recommendations={recommendations}
        recommendationStats={recommendationStats}
        fscMarks={fscMarks}
        fscTotal={fscTotal}
        onBack={handleBack}
        onViewDetails={handleViewDetails}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]} edges={['top']}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" family="Ionicons" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Header */}
      <Animated.View
        style={[styles.headerContainer, {
          opacity: headerAnim,
          transform: [{translateY: headerAnim.interpolate({inputRange: [0, 1], outputRange: [-20, 0]})}],
        }]}>
        <LinearGradient
          colors={isDark ? ['#e67e22', '#d35400'] : ['#f39c12', '#e67e22']}
          style={styles.header}>
          <View style={styles.headerDecoration1} />
          <View style={styles.headerDecoration2} />
          <Icon name="flag" family="Ionicons" size={48} color="#FFFFFF" />
          <Text style={styles.headerTitle}>Get Recommendations</Text>
          <Text style={styles.headerSubtitle}>Tell us about yourself to find your perfect match</Text>
        </LinearGradient>
      </Animated.View>

      {/* Step Indicator */}
      <View style={[styles.stepContainer, {backgroundColor: colors.card}]}>
        <StepIndicator
          currentStep={currentStep}
          totalSteps={3}
          colors={colors}
          labels={['Marks', 'Preferences', 'Review']}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContainer}>
        <Animated.View
          style={{
            opacity: contentAnim,
            transform: [{translateY: contentAnim.interpolate({inputRange: [0, 1], outputRange: [30, 0]})}],
          }}>
          <WizardSteps
            currentStep={currentStep}
            colors={colors}
            profileDataLoaded={profileDataLoaded}
            validationError={validationError}
            matricMarks={matricMarks} matricTotal={matricTotal}
            fscMarks={fscMarks} fscTotal={fscTotal}
            entryTestScore={entryTestScore} entryTestTotal={entryTestTotal}
            onMatricMarksChange={onMatricMarksChange} onMatricTotalChange={onMatricTotalChange}
            onFscMarksChange={onFscMarksChange} onFscTotalChange={onFscTotalChange}
            onEntryTestScoreChange={onEntryTestScoreChange} onEntryTestTotalChange={onEntryTestTotalChange}
            preferredPrograms={preferredPrograms} preferredCities={preferredCities}
            preferredType={preferredType} preferredSession={preferredSession}
            onProgramsChange={setPreferredPrograms} onCitiesChange={setPreferredCities}
            onTypeChange={setPreferredType} onSessionChange={setPreferredSession}
            subjectGroup={subjectGroup} onSubjectGroupChange={onSubjectGroupChange}
            gender={gender} onGenderChange={(val) => setGender(val.toLowerCase() as any)}
            userProvince={userProvince} onProvinceChange={setUserProvince}
            quotaFlags={quotaFlags} onQuotaFlagsChange={setQuotaFlags}
          />
        </Animated.View>
        <View style={{height: 100}} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, {backgroundColor: colors.card}]}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={[styles.navButton, styles.backNavBtn, {borderColor: colors.border}]}
            onPress={handleBack}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
              <Icon name="chevron-back" family="Ionicons" size={18} color={colors.text} />
              <Text style={[styles.navButtonText, {color: colors.text}]}>Back</Text>
            </View>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.navButton, styles.nextNavBtn, {opacity: canProceed() ? 1 : 0.5}]}
          onPress={handleNext}
          disabled={!canProceed()}>
          <LinearGradient
            colors={['#f39c12', '#e67e22']}
            start={{x: 0, y: 0}} end={{x: 1, y: 0}}
            style={styles.nextGradient}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
              <Text style={styles.nextButtonText}>{currentStep === 3 ? 'Get Results' : 'Next'}</Text>
              <Icon name={currentStep === 3 ? 'trophy' : 'arrow-forward'} family="Ionicons" size={18} color="#FFFFFF" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  backBtn: {
    position: 'absolute', top: SPACING.md, left: SPACING.md, width: 40, height: 40,
    borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', zIndex: 10,
  },
  headerContainer: {},
  header: {
    paddingTop: SPACING.lg, paddingBottom: SPACING.xl, paddingHorizontal: SPACING.md,
    alignItems: 'center', borderBottomLeftRadius: RADIUS.xxl, borderBottomRightRadius: RADIUS.xxl, overflow: 'hidden',
  },
  headerDecoration1: {
    position: 'absolute', top: -30, right: -30, width: 120, height: 120,
    borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerDecoration2: {
    position: 'absolute', bottom: -20, left: -20, width: 80, height: 80,
    borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerTitle: {fontSize: TYPOGRAPHY.sizes.xxl, fontWeight: TYPOGRAPHY.weight.bold, color: '#fff', marginBottom: 4},
  headerSubtitle: {fontSize: TYPOGRAPHY.sizes.sm, color: 'rgba(255,255,255,0.9)', textAlign: 'center'},
  stepContainer: {
    marginHorizontal: SPACING.md, marginTop: -20, borderRadius: RADIUS.lg, padding: SPACING.md,
    elevation: 4, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 6,
  },
  formContainer: {padding: SPACING.md},
  bottomNav: {
    flexDirection: 'row', padding: SPACING.md, paddingBottom: SPACING.lg, gap: SPACING.sm,
    elevation: 8, shadowColor: '#000', shadowOffset: {width: 0, height: -2}, shadowOpacity: 0.1, shadowRadius: 4,
  },
  navButton: {borderRadius: RADIUS.md, overflow: 'hidden'},
  backNavBtn: {paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderWidth: 1, justifyContent: 'center'},
  nextNavBtn: {flex: 1},
  navButtonText: {fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.semibold},
  nextGradient: {paddingVertical: SPACING.md, alignItems: 'center'},
  nextButtonText: {color: '#fff', fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.bold},
});

export default PremiumRecommendationsScreen;

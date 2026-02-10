/**
 * UltraContributeScreen - Refactored Main Screen
 *
 * Orchestrates the contribution wizard using modular sub-components.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { DARK_BG, LIGHT_BG } from '../constants/brand';
import { SPACING, RADIUS, TYPOGRAPHY } from '../constants/design';
import { UniversalHeader } from '../components';
import { useContributeWizard } from '../hooks/useContributeWizard';
import {
  AnimatedProgressBar,
  StepIndicator,
  CategorySelectionStep,
  EntitySelectionStep,
  UpdateDetailsStep,
  ReviewSubmitStep,
  SuccessModal,
  ContributionHistoryTab,
} from '../components/contribute';
import type { TabType } from '../types/contribute';

export const UltraContributeScreen: React.FC<{ navigation: any; route?: any }> = ({
  navigation,
  route,
}) => {
  const { colors, isDark } = useTheme();
  const wizard = useContributeWizard(navigation);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <UniversalHeader
        title="Data Correction"
        subtitle="Help improve PakUni"
        showBack
        onBack={() => navigation.goBack()}
      />

      {/* Tab Switcher */}
      <View style={[styles.tabContainer, { backgroundColor: isDark ? DARK_BG.card : LIGHT_BG.cardHover }]}>
        {(['contribute', 'history'] as TabType[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              { backgroundColor: wizard.activeTab === tab ? colors.primary : 'transparent' },
            ]}
            onPress={() => wizard.setActiveTab(tab)}>
            <Icon
              name={tab === 'contribute' ? 'create' : 'time'}
              size={18}
              color={wizard.activeTab === tab ? '#FFFFFF' : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                { color: wizard.activeTab === tab ? '#FFFFFF' : colors.textSecondary },
              ]}>
              {tab === 'contribute' ? 'New' : 'History'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {wizard.activeTab === 'contribute' ? (
        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <AnimatedProgressBar step={wizard.currentStep} totalSteps={4} colors={colors} />
          <StepIndicator currentStep={wizard.currentStep} colors={colors} isDark={isDark} />

          {wizard.currentStep === 1 && (
            <CategorySelectionStep
              onSelect={wizard.handleCategorySelect}
              selected={wizard.formData.category}
              colors={colors}
              isDark={isDark}
            />
          )}

          {wizard.currentStep === 2 && (
            <EntitySelectionStep
              category={wizard.formData.category}
              onSelect={wizard.handleEntitySelect}
              selected={wizard.formData.entity}
              onBack={wizard.goToPrevStep}
              colors={colors}
              isDark={isDark}
            />
          )}

          {wizard.currentStep === 3 && (
            <UpdateDetailsStep
              category={wizard.formData.category}
              entity={wizard.formData.entity}
              formData={wizard.formData}
              onUpdate={wizard.updateFormData}
              onBack={wizard.goToPrevStep}
              colors={colors}
              isDark={isDark}
            />
          )}

          {wizard.currentStep === 4 && (
            <ReviewSubmitStep
              formData={wizard.formData}
              onBack={wizard.goToPrevStep}
              onSubmit={wizard.handleSubmit}
              submitting={wizard.submitting}
              colors={colors}
              isDark={isDark}
            />
          )}

          {wizard.currentStep > 1 && wizard.currentStep < 4 && (
            <View style={[styles.bottomNav, { backgroundColor: colors.background }]}>
              <TouchableOpacity
                style={[styles.backBtn, { borderColor: colors.border }]}
                onPress={wizard.goToPrevStep}>
                <Icon name="arrow-back" size={20} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.nextBtn,
                  { backgroundColor: wizard.canProceedToNextStep() ? colors.primary : colors.border },
                ]}
                onPress={wizard.goToNextStep}
                disabled={!wizard.canProceedToNextStep()}>
                <Text style={styles.nextBtnText}>
                  {wizard.currentStep === 3 ? 'Review' : 'Continue'}
                </Text>
                <Icon name="arrow-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>
      ) : (
        <ContributionHistoryTab colors={colors} isDark={isDark} />
      )}

      <SuccessModal
        visible={wizard.showSuccess}
        autoApproved={wizard.lastAutoApproved}
        onDone={wizard.resetForm}
        onViewHistory={() => {
          wizard.resetForm();
          wizard.setActiveTab('history');
        }}
        colors={colors}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    borderRadius: RADIUS.lg,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
  },
  tabText: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  bottomNav: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextBtn: {
    flex: 1,
    height: 48,
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
});

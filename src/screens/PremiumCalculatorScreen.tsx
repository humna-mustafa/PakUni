import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '../components/icons';
import {TYPOGRAPHY, SPACING, RADIUS} from '../constants/design';
import {useTheme} from '../contexts/ThemeContext';
import {useCalculator} from '../hooks/useCalculator';
import {useCalculatorShare} from '../hooks/useCalculatorShare';
import {
  InputCard,
  ResultCard,
  CalculatorHeader,
  FormulaSelectionModal,
  ShareResultModal,
} from '../components/calculator';

const PremiumCalculatorScreen = () => {
  const {colors, isDark} = useTheme();
  const navigation = useNavigation();

  const calc = useCalculator();
  const share = useCalculatorShare();

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">

            {/* Header */}
            <CalculatorHeader
              isDark={isDark}
              onBack={() => navigation.goBack()}
            />

            {/* Education System Selector */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, {color: colors.text}]}>
                Your Education System
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipScrollContent}>
                {calc.educationSystems.map(system => (
                  <TouchableOpacity
                    key={system.value}
                    style={[
                      styles.educationChip,
                      {
                        backgroundColor:
                          calc.selectedEducation === system.value
                            ? colors.primary
                            : colors.card,
                        borderColor:
                          calc.selectedEducation === system.value
                            ? colors.primary
                            : colors.border,
                      },
                    ]}
                    onPress={() => calc.handleSelectEducation(system.value)}>
                    <Text
                      style={[
                        styles.educationChipText,
                        {
                          color:
                            calc.selectedEducation === system.value
                              ? '#FFFFFF'
                              : colors.text,
                          fontWeight:
                            calc.selectedEducation === system.value ? '700' : '500',
                        },
                      ]}>
                      {system.shortLabel}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Formula Selector */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, {color: colors.text}]}>
                  Merit Formula
                </Text>
                <TouchableOpacity onPress={() => calc.setShowFormulaModal(true)}>
                  <Text style={[styles.changeLink, {color: colors.primary}]}>
                    Change
                  </Text>
                </TouchableOpacity>
              </View>

              {calc.selectedFormula ? (
                <View
                  style={[
                    styles.selectedFormula,
                    {
                      backgroundColor: `${colors.primary}10`,
                      borderColor: colors.primary,
                    },
                  ]}>
                  <Text style={[styles.selectedFormulaName, {color: colors.primary}]}>
                    {calc.selectedFormula.name}
                  </Text>
                  <Text style={[styles.selectedFormulaDetail, {color: colors.text}]}>
                    {calc.selectedFormula.matric_weightage}% Matric +{' '}
                    {calc.selectedFormula.inter_weightage}% Inter +{' '}
                    {calc.selectedFormula.entry_test_weightage}%{' '}
                    {calc.selectedFormula.entry_test_name}
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.selectFormulaBtn,
                    {backgroundColor: colors.card, borderColor: colors.border},
                  ]}
                  onPress={() => calc.setShowFormulaModal(true)}>
                  <Icon name="school-outline" family="Ionicons" size={24} color={colors.primary} />
                  <Text
                    style={[styles.selectFormulaBtnText, {color: colors.textSecondary}]}>
                    Select MDCAT, ECAT, NET or other university formula
                  </Text>
                </TouchableOpacity>
              )}

              {/* Create Custom Formula CTA */}
              <TouchableOpacity
                style={[
                  styles.customFormulaCta,
                  {backgroundColor: isDark ? '#10B98115' : '#ECFDF5', borderColor: '#10B981'},
                ]}
                onPress={() => (navigation as any).navigate('Tools')}
                activeOpacity={0.8}>
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.customFormulaCtaIcon}>
                  <Icon name="flask-outline" family="Ionicons" size={20} color="#FFFFFF" />
                </LinearGradient>
                <View style={styles.customFormulaCtaContent}>
                  <Text style={[styles.customFormulaCtaTitle, {color: colors.text}]}>
                    Create Custom Formula
                  </Text>
                  <Text style={[styles.customFormulaCtaSubtitle, {color: colors.textSecondary}]}>
                    Build your own weightage formula
                  </Text>
                </View>
                <Icon name="arrow-forward-circle" family="Ionicons" size={24} color="#10B981" />
              </TouchableOpacity>
            </View>

            {/* Marks Input Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, {color: colors.text}]}>
                Enter Your Marks
              </Text>

              <InputCard
                iconName="book-outline"
                label="Matric / SSC / O-Level"
                obtainedValue={calc.matricMarks}
                totalValue={calc.matricTotal}
                onObtainedChange={calc.setMatricMarks}
                onTotalChange={calc.setMatricTotal}
                placeholder="950"
                colors={colors}
                isDark={isDark}
              />

              <InputCard
                iconName="library-outline"
                label="Intermediate / HSSC / A-Level"
                obtainedValue={calc.interMarks}
                totalValue={calc.interTotal}
                onObtainedChange={calc.setInterMarks}
                onTotalChange={calc.setInterTotal}
                placeholder="1000"
                colors={colors}
                isDark={isDark}
              />

              <InputCard
                iconName="document-text-outline"
                label="Entry Test (if applicable)"
                obtainedValue={calc.entryTestMarks}
                totalValue={calc.entryTestTotal}
                onObtainedChange={calc.setEntryTestMarks}
                onTotalChange={calc.setEntryTestTotal}
                placeholder="150"
                colors={colors}
                isDark={isDark}
              />

              {/* Hafiz Toggle */}
              <Animated.View style={{transform: [{scale: calc.hafizScaleAnim}]}}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={calc.toggleHafiz}
                  style={[
                    styles.hafizToggle,
                    {
                      backgroundColor: calc.isHafiz ? `${colors.success}15` : colors.card,
                      borderColor: calc.isHafiz ? colors.success : colors.border,
                    },
                  ]}>
                  <Icon name="moon-outline" family="Ionicons" size={32} color={calc.isHafiz ? colors.success : colors.textSecondary} />
                  <View style={styles.hafizInfo}>
                    <Text
                      style={[
                        styles.hafizText,
                        {color: calc.isHafiz ? colors.success : colors.text},
                      ]}>
                      Hafiz-e-Quran
                    </Text>
                    <Text
                      style={[
                        styles.hafizSubtext,
                        {color: calc.isHafiz
                          ? (calc.selectedFormula && calc.selectedFormula.hafiz_bonus === 0 ? '#EF4444' : colors.success)
                          : colors.textSecondary},
                      ]}>
                      {calc.isHafiz
                        ? calc.selectedFormula
                          ? calc.selectedFormula.hafiz_bonus > 0
                            ? `+${calc.selectedFormula.hafiz_bonus} marks (${calc.selectedFormula.university})`
                            : `Not applicable for ${calc.selectedFormula.university}`
                          : 'Bonus varies by university (0-20 marks)'
                        : 'Tap to add Hafiz bonus'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.hafizCheck,
                      {
                        backgroundColor: calc.isHafiz ? colors.success : 'transparent',
                        borderColor: calc.isHafiz ? colors.success : colors.border,
                      },
                    ]}>
                    {calc.isHafiz && <Icon name="checkmark" family="Ionicons" size={16} color="#FFFFFF" />}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.calculateBtn}
                onPress={calc.calculateMerit}
                activeOpacity={0.9}>
                <LinearGradient
                  colors={[colors.primary, '#3660C9']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.calculateGradient}>
                  <Text style={styles.calculateBtnText}>Calculate Merit</Text>
                  <Icon name="flag-outline" family="Ionicons" size={20} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.resetBtn, {backgroundColor: colors.card, borderColor: colors.border}]}
                onPress={calc.resetCalculator}>
                <Text style={[styles.resetBtnText, {color: colors.text}]}>Reset</Text>
              </TouchableOpacity>
            </View>

            {/* Results Section */}
            {calc.showResults && calc.results.length > 0 && (
              <Animated.View style={[styles.resultsSection, {opacity: calc.resultsFadeAnim}]}>
                <View style={styles.resultsSectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Icon name={calc.results.length === 1 ? 'ribbon-outline' : 'bar-chart-outline'} family="Ionicons" size={18} color={colors.text} />
                    <Text style={[styles.sectionTitle, {color: colors.text}]}>
                      {calc.results.length === 1 ? ' Your Result' : ` Results for ${calc.results.length} Formulas`}
                    </Text>
                  </View>
                </View>

                {calc.results.map((result, index) => (
                  <ResultCard
                    key={result.formula.id}
                    result={result}
                    index={index}
                    isTop={index === 0 && calc.results.length > 1}
                    colors={colors}
                    isDark={isDark}
                    onShare={share.handleShareResult}
                  />
                ))}

                {/* Share All Results Button */}
                {calc.results.length > 1 && (
                  <TouchableOpacity
                    style={[styles.shareAllButton, {backgroundColor: colors.primary}]}
                    onPress={() => share.handleShareAllResults(calc.results)}
                    activeOpacity={0.8}>
                    <Icon name="share-social-outline" family="Ionicons" size={18} color="#FFFFFF" />
                    <Text style={styles.shareAllButtonText}>
                      Share All {calc.results.length} Results
                    </Text>
                  </TouchableOpacity>
                )}
              </Animated.View>
            )}

            <View style={{height: 100}} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Formula Selection Modal */}
      <FormulaSelectionModal
        visible={calc.showFormulaModal}
        onClose={() => calc.setShowFormulaModal(false)}
        customFormulas={calc.customFormulas}
        selectedFormula={calc.selectedFormula}
        onSelectFormula={calc.setSelectedFormula}
        colors={colors}
        isDark={isDark}
      />

      {/* Share Result Modal */}
      <ShareResultModal
        visible={share.showShareModal}
        onClose={() => share.setShowShareModal(false)}
        shareResult={share.shareResult}
        performShare={share.performShare}
        colors={colors}
        isDark={isDark}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: SPACING.sm,
    letterSpacing: -0.3,
  },
  changeLink: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  chipScrollContent: {
    gap: SPACING.sm,
  },
  educationChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    marginRight: SPACING.sm,
  },
  educationChipText: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  selectedFormula: {
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
  },
  selectedFormulaName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  selectedFormulaDetail: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 4,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  selectFormulaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    gap: SPACING.sm,
  },
  selectFormulaBtnText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
    flex: 1,
  },
  customFormulaCta: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  customFormulaCtaIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customFormulaCtaContent: {
    flex: 1,
  },
  customFormulaCtaTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  customFormulaCtaSubtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
    marginTop: 2,
  },
  hafizToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    gap: SPACING.md,
  },
  hafizInfo: {
    flex: 1,
  },
  hafizText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  hafizSubtext: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
    marginTop: 2,
  },
  hafizCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    flexWrap: 'wrap',
  },
  calculateBtn: {
    flex: 2,
    minWidth: 160,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#4573DF',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  calculateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md + 2,
    gap: SPACING.sm,
  },
  calculateBtnText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: SPACING.md + 2,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  resetBtnText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  resultsSection: {
    marginTop: SPACING.md,
  },
  resultsSectionHeader: {
    marginBottom: SPACING.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: RADIUS.xl,
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  shareAllButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default PremiumCalculatorScreen;

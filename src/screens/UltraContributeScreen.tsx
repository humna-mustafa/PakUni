/**
 * UltraContributeScreen - Report Wrong Data entry screen
 *
 * Step 1: Pick category (university info, merit, fees, entry tests, etc.)
 * Step 2: Search and select entity
 * → Then navigates to DataCorrectionScreen which fetches real app data
 *   and provides field-level fix/edit access.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { DARK_BG, LIGHT_BG } from '../constants/brand';
import { SPACING, RADIUS, TYPOGRAPHY } from '../constants/design';
import { UniversalHeader } from '../components';
import { useContributeWizard } from '../hooks/useContributeWizard';
import {
  CategorySelectionStep,
  EntitySelectionStep,
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
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

      <UniversalHeader
        title="Report Wrong Data"
        subtitle="Fix incorrect data in the app"
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
              {tab === 'contribute' ? 'Fix Data' : 'History'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {wizard.activeTab === 'contribute' ? (
        <View style={styles.content}>
          {/* Step indicator */}
          <View style={[styles.stepIndicator, { backgroundColor: isDark ? DARK_BG.card : LIGHT_BG.cardHover }]}>
            <View style={[styles.stepDot, { backgroundColor: colors.primary }]}>
              <Text style={styles.stepDotText}>1</Text>
            </View>
            <View style={[styles.stepLine, { backgroundColor: wizard.currentStep >= 2 ? colors.primary : colors.border }]} />
            <View style={[styles.stepDot, { backgroundColor: wizard.currentStep >= 2 ? colors.primary : colors.border }]}>
              <Text style={styles.stepDotText}>2</Text>
            </View>
            <View style={[styles.stepLine, { backgroundColor: colors.border }]} />
            <View style={[styles.stepDot, { backgroundColor: colors.border }]}>
              <Icon name="create-outline" size={12} color="#FFF" />
            </View>
          </View>

          {/* Info banner */}
          <View style={[styles.infoBanner, { backgroundColor: isDark ? colors.card : '#F0FDF4' }]}>
            <Icon name="information-circle" size={18} color="#10B981" />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Select a category & entity — the app will load the actual current data so you can edit and fix it directly.
            </Text>
          </View>

          {wizard.currentStep === 1 && (
            <CategorySelectionStep
              onSelect={wizard.handleCategorySelect}
              selected={wizard.selectedCategory}
              colors={colors}
              isDark={isDark}
            />
          )}

          {wizard.currentStep === 2 && (
            <EntitySelectionStep
              category={wizard.selectedCategory}
              onSelect={wizard.handleEntitySelect}
              selected={null}
              onBack={wizard.goBack}
              colors={colors}
              isDark={isDark}
            />
          )}
        </View>
      ) : (
        <ContributionHistoryTab colors={colors} isDark={isDark} />
      )}
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
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    paddingVertical: 10,
    borderRadius: RADIUS.lg,
    gap: 0,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  stepLine: {
    width: 40,
    height: 2,
    marginHorizontal: 4,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: 4,
    padding: 12,
    borderRadius: RADIUS.lg,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
});

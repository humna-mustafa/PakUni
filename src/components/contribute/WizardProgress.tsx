/**
 * WizardProgress - AnimatedProgressBar and StepIndicator for the contribution wizard
 */

import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { SEMANTIC } from '../../constants/brand';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/design';
import { WizardStep } from '../../types/contribute';

// ─── Animated Progress Bar ──────────────────────────────────────────────────

interface AnimatedProgressBarProps {
  step: WizardStep;
  totalSteps: number;
  colors: any;
}

const AnimatedProgressBarComponent: React.FC<AnimatedProgressBarProps> = ({
  step,
  totalSteps,
  colors,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: step / totalSteps,
      useNativeDriver: false,
      tension: 50,
      friction: 10,
    }).start();
  }, [step, totalSteps, progressAnim]);

  const width = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}>
      <Animated.View style={[styles.progressBarFill, { width, backgroundColor: colors.primary }]}>
        <LinearGradient
          colors={['rgba(255,255,255,0.3)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

export const AnimatedProgressBar = React.memo(AnimatedProgressBarComponent);

// ─── Step Indicator ─────────────────────────────────────────────────────────

const STEPS = [
  { num: 1, label: 'Category', icon: 'grid' },
  { num: 2, label: 'Select', icon: 'search' },
  { num: 3, label: 'Update', icon: 'create' },
  { num: 4, label: 'Submit', icon: 'checkmark' },
];

interface StepIndicatorProps {
  currentStep: WizardStep;
  colors: any;
  isDark: boolean;
}

const StepIndicatorComponent: React.FC<StepIndicatorProps> = ({
  currentStep,
  colors,
  isDark,
}) => {
  return (
    <View style={styles.stepIndicatorContainer}>
      {STEPS.map((step, index) => {
        const isActive = currentStep === step.num;
        const isCompleted = currentStep > step.num;
        const dotColor = isActive
          ? colors.primary
          : isCompleted
            ? SEMANTIC.success
            : colors.border;

        return (
          <React.Fragment key={step.num}>
            <View style={styles.stepIndicatorItem}>
              <Animated.View
                style={[
                  styles.stepDot,
                  { backgroundColor: dotColor },
                  isActive && styles.stepDotActive,
                ]}>
                <Icon
                  name={isCompleted ? 'checkmark' : step.icon}
                  size={isActive ? 16 : 14}
                  color="#FFFFFF"
                />
              </Animated.View>
              <Text
                style={[
                  styles.stepLabel,
                  { color: isActive ? colors.text : colors.textSecondary },
                  isActive && styles.stepLabelActive,
                ]}>
                {step.label}
              </Text>
            </View>
            {index < STEPS.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  { backgroundColor: isCompleted ? SEMANTIC.success : colors.border },
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

export const StepIndicator = React.memo(StepIndicatorComponent);

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  progressBarContainer: {
    height: 4,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  stepIndicatorItem: {
    alignItems: 'center',
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  stepLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  stepLabelActive: {
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  stepLine: {
    width: 32,
    height: 2,
    marginHorizontal: 4,
  },
});

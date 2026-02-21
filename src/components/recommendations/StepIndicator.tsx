/**
 * StepIndicator - Progress dots for multi-step wizard
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {SPACING, FONTS} from '../../constants/theme';
import {TYPOGRAPHY} from '../../constants/design';
import {Icon} from '../icons';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  colors: any;
  labels?: string[];
}

const StepIndicator = ({currentStep, totalSteps, colors, labels}: StepIndicatorProps) => (
  <View>
    <View style={styles.stepIndicator}>
      {Array.from({length: totalSteps}).map((_, index) => {
        const isActive = index + 1 <= currentStep;
        const isCurrent = index + 1 === currentStep;
        return (
          <React.Fragment key={index}>
            <View
              style={[
                styles.stepDot,
                {
                  backgroundColor: isActive ? colors.primary : colors.border,
                  transform: [{scale: isCurrent ? 1.2 : 1}],
                },
              ]}>
              {isActive && <Icon name="checkmark" family="Ionicons" size={12} color="#FFFFFF" />}
            </View>
            {index < totalSteps - 1 && (
              <View
                style={[styles.stepLine, {backgroundColor: isActive ? colors.primary : colors.border}]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
    {labels && (
      <View style={styles.stepLabels}>
        {labels.map((label, i) => (
          <Text
            key={label}
            style={[styles.stepLabel, {color: i + 1 <= currentStep ? colors.primary : colors.textMuted}]}>
            {label}
          </Text>
        ))}
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLine: {
    width: 60,
    height: 3,
    borderRadius: 2,
  },
  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
    flex: 1,
    textAlign: 'center',
  },
});

export default React.memo(StepIndicator);

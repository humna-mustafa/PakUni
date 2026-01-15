/**
 * Premium Micro-Interactions Components
 * Human-crafted details that make UI feel alive
 * These subtle touches distinguish from AI-generated UIs
 */

import React, {useRef, useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  Pressable,
  Platform,
} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import {TYPOGRAPHY, SPACING, RADIUS, ANIMATION} from '../constants/design';
import {Haptics} from '../utils/haptics';

// ============================================================================
// FLOATING LABEL INPUT - Premium text input with animated label
// ============================================================================

interface FloatingLabelInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  leftIcon,
  rightIcon,
}) => {
  const {colors, isDark} = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(labelAnim, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    
    Animated.timing(borderAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shakeAnim, {toValue: 10, duration: 50, useNativeDriver: true}),
        Animated.timing(shakeAnim, {toValue: -10, duration: 50, useNativeDriver: true}),
        Animated.timing(shakeAnim, {toValue: 8, duration: 50, useNativeDriver: true}),
        Animated.timing(shakeAnim, {toValue: -8, duration: 50, useNativeDriver: true}),
        Animated.timing(shakeAnim, {toValue: 0, duration: 50, useNativeDriver: true}),
      ]).start();
      Haptics.error();
    }
  }, [error]);

  const labelStyle = {
    top: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [18, 0],
    }),
    fontSize: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.textSecondary, error ? colors.error : colors.primary],
    }),
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, error ? colors.error : colors.primary],
  });

  return (
    <Animated.View style={[styles.floatingInputContainer, {transform: [{translateX: shakeAnim}]}]}>
      <Animated.View 
        style={[
          styles.floatingInputWrapper, 
          {
            borderColor,
            backgroundColor: isDark ? colors.card : colors.background,
          }
        ]}>
        {leftIcon && <View style={styles.floatingLeftIcon}>{leftIcon}</View>}
        <View style={styles.floatingInputInner}>
          <Animated.Text style={[styles.floatingLabel, labelStyle]}>
            {label}
          </Animated.Text>
          <TextInput
            style={[styles.floatingInput, {color: colors.text}]}
            value={value}
            onChangeText={onChangeText}
            onFocus={() => {
              setIsFocused(true);
              Haptics.light();
            }}
            onBlur={() => setIsFocused(false)}
            placeholder={isFocused ? placeholder : ''}
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        {rightIcon && <View style={styles.floatingRightIcon}>{rightIcon}</View>}
      </Animated.View>
      {error && (
        <Text style={[styles.errorText, {color: colors.error}]}>{error}</Text>
      )}
    </Animated.View>
  );
};

// ============================================================================
// BOUNCY CHECKBOX - Satisfying toggle animation
// ============================================================================

interface BouncyCheckboxProps {
  checked: boolean;
  onPress: () => void;
  label?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BouncyCheckbox: React.FC<BouncyCheckboxProps> = ({
  checked,
  onPress,
  label,
  color,
  size = 'md',
}) => {
  const {colors} = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkAnim = useRef(new Animated.Value(checked ? 1 : 0)).current;
  const bgAnim = useRef(new Animated.Value(checked ? 1 : 0)).current;
  
  const checkColor = color || colors.primary;
  const boxSize = size === 'sm' ? 20 : size === 'lg' ? 28 : 24;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(checkAnim, {
        toValue: checked ? 1 : 0,
        friction: 4,
        tension: 300,
        useNativeDriver: true,
      }),
      Animated.timing(bgAnim, {
        toValue: checked ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [checked]);

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.85,
        friction: 4,
        tension: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 400,
        useNativeDriver: true,
      }),
    ]).start();
    
    Haptics.medium();
    onPress();
  };

  const backgroundColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', checkColor],
  });

  const borderColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, checkColor],
  });

  return (
    <Pressable onPress={handlePress} style={styles.checkboxContainer}>
      <Animated.View
        style={[
          styles.checkboxBox,
          {
            width: boxSize,
            height: boxSize,
            borderRadius: boxSize * 0.25,
            backgroundColor,
            borderColor,
            transform: [{scale: scaleAnim}],
          },
        ]}>
        <Animated.Text
          style={[
            styles.checkmark,
            {
              fontSize: boxSize * 0.6,
              opacity: checkAnim,
              transform: [
                {
                  scale: checkAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 1.2, 1],
                  }),
                },
              ],
            },
          ]}>
          ✓
        </Animated.Text>
      </Animated.View>
      {label && (
        <Text style={[styles.checkboxLabel, {color: colors.text}]}>{label}</Text>
      )}
    </Pressable>
  );
};

// ============================================================================
// MORPHING COUNTER - Smooth number transitions
// ============================================================================

interface MorphingCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  style?: any;
}

export const MorphingCounter: React.FC<MorphingCounterProps> = ({
  value,
  duration = 1000,
  prefix = '',
  suffix = '',
  style,
}) => {
  const {colors} = useTheme();
  const [displayValue, setDisplayValue] = useState(0);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animatedValue.setValue(displayValue);
    
    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start();

    animatedValue.addListener(({value}) => {
      setDisplayValue(Math.round(value));
    });

    return () => animatedValue.removeAllListeners();
  }, [value]);

  return (
    <Text style={[styles.counterText, {color: colors.text}, style]}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </Text>
  );
};

// ============================================================================
// RIPPLE BUTTON - Material-style ripple with physics
// ============================================================================

interface RippleButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  color?: string;
  style?: any;
  disabled?: boolean;
}

export const RippleButton: React.FC<RippleButtonProps> = ({
  onPress,
  children,
  color,
  style,
  disabled,
}) => {
  const {colors} = useTheme();
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [rippleLayout, setRippleLayout] = useState({width: 0, height: 0});

  const handlePress = () => {
    if (disabled) return;
    
    rippleAnim.setValue(0);
    opacityAnim.setValue(0.3);
    
    Animated.parallel([
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      rippleAnim.setValue(0);
    });
    
    Haptics.buttonPress();
    onPress();
  };

  const rippleSize = Math.max(rippleLayout.width, rippleLayout.height) * 2;
  const rippleColor = color || colors.primary;

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={[styles.rippleButton, style, {opacity: disabled ? 0.5 : 1}]}
      onLayout={(e) => {
        setRippleLayout({
          width: e.nativeEvent.layout.width,
          height: e.nativeEvent.layout.height,
        });
      }}>
      <View style={styles.rippleContainer}>
        <Animated.View
          style={[
            styles.ripple,
            {
              width: rippleSize,
              height: rippleSize,
              borderRadius: rippleSize / 2,
              backgroundColor: rippleColor,
              opacity: opacityAnim,
              transform: [{scale: rippleAnim}],
            },
          ]}
        />
      </View>
      {children}
    </Pressable>
  );
};

// ============================================================================
// SWIPE ACTION - Reveal actions on swipe
// ============================================================================

interface ProgressStepsProps {
  steps: string[];
  currentStep: number;
  color?: string;
}

export const ProgressSteps: React.FC<ProgressStepsProps> = ({
  steps,
  currentStep,
  color,
}) => {
  const {colors} = useTheme();
  const stepColor = color || colors.primary;

  const ProgressStepItem: React.FC<{
    step: string;
    index: number;
    isCompleted: boolean;
    isCurrent: boolean;
  }> = ({step, index, isCompleted, isCurrent}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      if (isCurrent) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
        ).start();
      } else {
        scaleAnim.setValue(1);
      }
    }, [isCurrent, scaleAnim]);

    return (
      <View style={styles.stepItem}>
        <Animated.View
          style={[
            styles.stepCircle,
            {
              backgroundColor: isCompleted || isCurrent ? stepColor : colors.border,
              transform: [{scale: scaleAnim}],
            },
          ]}>
          <Text style={styles.stepNumber}>{isCompleted ? '✓' : index + 1}</Text>
        </Animated.View>
        <Text
          style={[
            styles.stepLabel,
            {
              color: isCurrent ? stepColor : colors.textSecondary,
              fontWeight: isCurrent ? '600' : '400',
            },
          ]}>
          {step}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.stepsContainer}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const key = `${step}-${index}`;
        return (
          <React.Fragment key={key}>
            <ProgressStepItem
              step={step}
              index={index}
              isCompleted={isCompleted}
              isCurrent={isCurrent}
            />
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.stepConnector,
                  {
                    backgroundColor: isCompleted ? stepColor : colors.border,
                  },
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

// ============================================================================
// SKELETON PULSE - Premium loading state
// ============================================================================

interface SkeletonPulseProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}

export const SkeletonPulse: React.FC<SkeletonPulseProps> = ({
  width,
  height,
  borderRadius = 8,
  style,
}) => {
  const {colors, isDark} = useTheme();
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: isDark ? colors.border : colors.background,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Floating Input
  floatingInputContainer: {
    marginBottom: SPACING.md,
  },
  floatingInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    minHeight: 56,
  },
  floatingInputInner: {
    flex: 1,
    justifyContent: 'center',
  },
  floatingLabel: {
    position: 'absolute',
    left: 0,
    fontWeight: '500',
  },
  floatingInput: {
    fontSize: TYPOGRAPHY.sizes.md,
    paddingTop: SPACING.sm,
  },
  floatingLeftIcon: {
    marginRight: SPACING.sm,
  },
  floatingRightIcon: {
    marginLeft: SPACING.sm,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: SPACING.xs,
    marginLeft: SPACING.md,
  },
  
  // Checkbox
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  checkboxLabel: {
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  
  // Counter
  counterText: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  
  // Ripple Button
  rippleButton: {
    overflow: 'hidden',
    position: 'relative',
  },
  rippleContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
  },
  
  // Progress Steps
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
  },
  stepLabel: {
    marginTop: SPACING.xs,
    fontSize: TYPOGRAPHY.sizes.xs,
    textAlign: 'center',
    maxWidth: 80,
  },
  stepConnector: {
    height: 2,
    width: 40,
    marginHorizontal: SPACING.xs,
    marginBottom: 24,
  },
});

export default {
  FloatingLabelInput,
  BouncyCheckbox,
  MorphingCounter,
  RippleButton,
  ProgressSteps,
  SkeletonPulse,
};

/**
 * InputField - Animated text input with label and icon
 */

import React, {useState, useRef} from 'react';
import {View, Text, TextInput, Animated, StyleSheet, KeyboardTypeOptions} from 'react-native';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../../constants/design';
import {Icon} from '../icons';

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  iconName: string;
  colors: any;
  keyboardType?: KeyboardTypeOptions;
  suffix?: string;
}

const InputField = ({
  label, value, onChangeText, placeholder,
  iconName, colors, keyboardType = 'default', suffix,
}: InputFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const animValue = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.spring(animValue, {toValue: 1, useNativeDriver: false}).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.spring(animValue, {toValue: 0, useNativeDriver: false}).start();
  };

  return (
    <View style={styles.inputContainer}>
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
        <Icon name={iconName} family="Ionicons" size={16} color={colors.primary} />
        <Text style={[styles.inputLabel, {color: colors.text}]}>{label}</Text>
      </View>
      <Animated.View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.card,
            borderColor: animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [colors.border, colors.primary],
            }),
            borderWidth: 2,
          },
        ]}>
        <TextInput
          style={[styles.input, {color: colors.text}]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType={keyboardType}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {suffix && (
          <Text style={[styles.inputSuffix, {color: colors.textSecondary}]}>{suffix}</Text>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {marginBottom: SPACING.md},
  inputLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: SPACING.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  inputSuffix: {fontSize: TYPOGRAPHY.sizes.sm},
});

export default React.memo(InputField);

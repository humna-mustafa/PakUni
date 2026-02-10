import React, {useState, useRef, useEffect} from 'react';
import {View, Text, TextInput, Animated, StyleSheet} from 'react-native';
import {Icon} from '../icons';
import {TYPOGRAPHY, SPACING, RADIUS, ANIMATION} from '../../constants/design';

interface InputCardProps {
  iconName: string;
  label: string;
  obtainedValue: string;
  totalValue: string;
  onObtainedChange: (text: string) => void;
  onTotalChange: (text: string) => void;
  placeholder: string;
  colors: any;
  isDark: boolean;
}

const InputCard = React.memo(({
  iconName,
  label,
  obtainedValue,
  totalValue,
  onObtainedChange,
  onTotalChange,
  placeholder,
  colors,
  isDark,
}: InputCardProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(focusAnim, {
      toValue: isFocused ? 1 : 0,
      ...ANIMATION.spring.gentle,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  const percentage = obtainedValue && totalValue && parseFloat(totalValue) > 0
    ? ((parseFloat(obtainedValue) / parseFloat(totalValue)) * 100).toFixed(1)
    : '0';

  const getPercentageColor = () => {
    const pct = parseFloat(percentage);
    if (pct >= 80) return colors.success;
    if (pct >= 60) return colors.warning;
    return colors.error;
  };

  return (
    <Animated.View
      style={[
        styles.inputCard,
        {
          backgroundColor: colors.card,
          borderColor,
        },
      ]}>
      <View style={styles.inputCardHeader}>
        <Icon name={iconName} family="Ionicons" size={20} color={colors.primary} />
        <Text style={[styles.inputCardLabel, {color: colors.text}]}>{label}</Text>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={[styles.inputGroupLabel, {color: colors.textSecondary}]}>
            Obtained
          </Text>
          <TextInput
            style={[
              styles.marksInput,
              {
                backgroundColor: isDark ? colors.background : '#F8FAFC',
                color: colors.text,
              },
            ]}
            value={obtainedValue}
            onChangeText={onObtainedChange}
            keyboardType="numeric"
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </View>

        <Text style={[styles.dividerText, {color: colors.textSecondary}]}>/</Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputGroupLabel, {color: colors.textSecondary}]}>
            Total
          </Text>
          <TextInput
            style={[
              styles.marksInput,
              {
                backgroundColor: isDark ? colors.background : '#F8FAFC',
                color: colors.text,
              },
            ]}
            value={totalValue}
            onChangeText={onTotalChange}
            keyboardType="numeric"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </View>

        <View
          style={[
            styles.percentBadge,
            {backgroundColor: `${getPercentageColor()}15`},
          ]}>
          <Text style={[styles.percentText, {color: getPercentageColor()}]}>
            {percentage}%
          </Text>
        </View>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  inputCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1.5,
  },
  inputCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  inputCardLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },
  inputGroup: {
    flex: 1,
  },
  inputGroupLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
    marginBottom: 4,
  },
  marksInput: {
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    textAlign: 'center',
  },
  dividerText: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weight.regular,
    marginHorizontal: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  percentBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    marginLeft: SPACING.sm,
  },
  percentText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
});

export default InputCard;

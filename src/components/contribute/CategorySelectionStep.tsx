/**
 * CategorySelectionStep - Step 1: Select what type of data needs correction
 */

import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions, Platform, Vibration } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { DARK_BG, LIGHT_BG } from '../../constants/brand';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/design';
import { CategoryOption } from '../../types/contribute';
import { CATEGORIES } from '../../constants/contribute';
import { AnimatedPressable } from './AnimatedPressable';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CategorySelectionStepProps {
  onSelect: (category: CategoryOption) => void;
  selected: CategoryOption | null;
  colors: any;
  isDark: boolean;
}

const CategorySelectionStepComponent: React.FC<CategorySelectionStepProps> = ({
  onSelect,
  selected,
  colors,
  isDark,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.stepContent, { opacity: fadeAnim }]}>
      <View style={styles.stepHeader}>
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          What needs correction?
        </Text>
        <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
          Select the type of data you want to fix
        </Text>
      </View>

      <View style={styles.categoryGrid}>
        {CATEGORIES.map((category) => {
          const isSelected = selected?.id === category.id;

          return (
            <AnimatedPressable
              key={category.id}
              onPress={() => {
                Vibration.vibrate(10);
                onSelect(category);
              }}
              style={[
                styles.categoryCard,
                { backgroundColor: isDark ? DARK_BG.card : LIGHT_BG.card },
                isSelected && { borderColor: category.gradient[0], borderWidth: 2 },
              ]}>
              <LinearGradient
                colors={category.gradient}
                style={styles.categoryIconContainer}>
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              </LinearGradient>
              <Text style={[styles.categoryTitle, { color: colors.text }]} numberOfLines={1}>
                {category.title}
              </Text>
              <Text style={[styles.categorySubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                {category.subtitle}
              </Text>
              {isSelected && (
                <View style={[styles.selectedCheck, { backgroundColor: category.gradient[0] }]}>
                  <Icon name="checkmark" size={12} color="#FFFFFF" />
                </View>
              )}
            </AnimatedPressable>
          );
        })}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  stepContent: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  stepHeader: {
    marginBottom: SPACING.md,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weight.heavy,
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  categoryCard: {
    width: (SCREEN_WIDTH - SPACING.md * 2 - SPACING.sm) / 2,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.bold,
    textAlign: 'center',
    marginBottom: 2,
  },
  categorySubtitle: {
    fontSize: 11,
    textAlign: 'center',
  },
  selectedCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const CategorySelectionStep = React.memo(CategorySelectionStepComponent);

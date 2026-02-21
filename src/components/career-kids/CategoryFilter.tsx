import React, {useRef, useEffect} from 'react';
import {Text, StyleSheet, TouchableOpacity, Animated, View, ScrollView} from 'react-native';
import {SPACING, FONTS, BORDER_RADIUS} from '../../constants/theme';
import {TYPOGRAPHY} from '../../constants/design';
import type {CareerCategory} from './data';

interface AnimatedCategoryChipProps {
  category: CareerCategory;
  isSelected: boolean;
  index: number;
  onPress: () => void;
  colors: any;
}

const AnimatedCategoryChip: React.FC<AnimatedCategoryChipProps> = ({
  category,
  isSelected,
  index,
  onPress,
  colors,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 50,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [index, scaleAnim]);

  const handlePressIn = () => {
    Animated.spring(bounceAnim, {toValue: 0.9, tension: 150, friction: 10, useNativeDriver: true}).start();
  };

  const handlePressOut = () => {
    Animated.spring(bounceAnim, {toValue: 1, tension: 150, friction: 10, useNativeDriver: true}).start();
    onPress();
  };

  return (
    <Animated.View style={{transform: [{scale: Animated.multiply(scaleAnim, bounceAnim)}]}}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[
          styles.categoryChip,
          {
            backgroundColor: isSelected ? colors.primary : colors.card,
            borderColor: isSelected ? colors.primary : colors.border,
          },
        ]}>
        <Text style={{fontSize: 14, marginRight: 4}}>{category.emoji}</Text>
        <Text
          style={[
            styles.categoryChipText,
            {color: isSelected ? colors.white : colors.text},
          ]}>
          {category.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

interface CategoryFilterProps {
  categories: CareerCategory[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  filteredCount: number;
  colors: any;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  filteredCount,
  colors,
}) => {
  return (
    <View style={styles.categoryContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}>
        {categories.map((category, index) => (
          <AnimatedCategoryChip
            key={category.id}
            category={category}
            isSelected={selectedCategory === category.id}
            index={index}
            onPress={() => onSelectCategory(category.id)}
            colors={colors}
          />
        ))}
      </ScrollView>
      <Text style={[styles.careerCount, {color: colors.textSecondary}]}>
        Showing {filteredCount} career{filteredCount !== 1 ? 's' : ''}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  categoryContainer: {
    paddingVertical: SPACING.sm,
  },
  categoryScroll: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    flexDirection: 'row',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    marginRight: SPACING.xs,
  },
  categoryChipText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  careerCount: {
    fontSize: FONTS.sizes.xs,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});

export default AnimatedCategoryChip;

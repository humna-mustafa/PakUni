/**
 * CategoryBackHeader - Header shown when a category is selected with back button
 */

import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Icon} from '../../components/icons';
import {TYPOGRAPHY, RADIUS, SPACING} from '../../constants/design';

interface CategoryBackHeaderProps {
  colors: any;
  categoryTitle: string;
  onBack: () => void;
}

const CategoryBackHeaderComponent: React.FC<CategoryBackHeaderProps> = ({
  colors,
  categoryTitle,
  onBack,
}) => {
  return (
    <View style={styles.categoryHeader}>
      <TouchableOpacity
        style={[styles.backCategoryButton, {backgroundColor: colors.card}]}
        onPress={onBack}>
        <Icon name="arrow-back" size={18} color={colors.text} />
        <Text style={[styles.backCategoryText, {color: colors.text}]}>
          All Categories
        </Text>
      </TouchableOpacity>
      <Text style={[styles.categoryTitle, {color: colors.text}]}>
        {categoryTitle} Guides
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  categoryHeader: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  backCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  backCategoryText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginLeft: 6,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weight.heavy,
  },
});

export const CategoryBackHeader = React.memo(CategoryBackHeaderComponent);

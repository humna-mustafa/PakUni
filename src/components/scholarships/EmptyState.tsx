/**
 * EmptyState - Shown when no scholarships match filters
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {TYPOGRAPHY, SPACING} from '../../constants/design';
import {Icon} from '../icons';

interface EmptyStateProps {
  colors: any;
}

const EmptyState = ({colors}: EmptyStateProps) => {
  return (
    <View style={styles.emptyState}>
      <Icon name="school-outline" family="Ionicons" size={48} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, {color: colors.text}]}>No Scholarships Found</Text>
      <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
        Try adjusting your filters or search query
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.md,
    textAlign: 'center',
  },
});

export default React.memo(EmptyState);

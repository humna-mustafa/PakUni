/**
 * EmptyState - Empty search/filter results message
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Icon} from '../../components/icons';
import {TYPOGRAPHY, SPACING} from '../../constants/design';

interface EmptyStateProps {
  colors: any;
}

const EmptyStateComponent: React.FC<EmptyStateProps> = ({colors}) => {
  return (
    <View style={styles.emptyState}>
      <Icon name="search-outline" size={48} color={colors.textSecondary} />
      <Text style={[styles.emptyStateText, {color: colors.textSecondary}]}>
        No guides found
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyStateText: {
    fontSize: TYPOGRAPHY.sizes.md,
    marginTop: SPACING.md,
  },
});

export const EmptyState = React.memo(EmptyStateComponent);

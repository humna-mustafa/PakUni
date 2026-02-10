import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../../constants/design';
import {Icon} from '../icons';

interface EmptyGoalsStateProps {
  colors: any;
}

const EmptyGoalsState = React.memo(({colors}: EmptyGoalsStateProps) => {
  return (
    <>
      <View style={[styles.emptyState, {backgroundColor: colors.card}]}>
        <Icon
          name="flag-outline"
          family="Ionicons"
          size={50}
          color={colors.primary}
        />
        <Text style={[styles.emptyTitle, {color: colors.text}]}>
          No Goals Yet
        </Text>
        <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
          Set your first goal and start your journey!
        </Text>
      </View>
    </>
  );
});

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
  },
});

export default EmptyGoalsState;

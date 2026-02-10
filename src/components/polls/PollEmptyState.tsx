/**
 * PollEmptyState - Shown when no polls match the current filter
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {TYPOGRAPHY, SPACING} from '../../constants/design';
import {Icon} from '../icons';
import type {ThemeColors} from '../../contexts/ThemeContext';

interface Props {
  colors: ThemeColors;
}

const PollEmptyState: React.FC<Props> = ({colors}) => (
  <View style={styles.container}>
    <Icon name="clipboard-outline" family="Ionicons" size={48} color={colors.textSecondary} />
    <Text style={[styles.title, {color: colors.text}]}>No Polls Found</Text>
    <Text style={[styles.text, {color: colors.textSecondary}]}>
      No polls in this category yet
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
    paddingHorizontal: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  text: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
  },
});

export default React.memo(PollEmptyState);

/**
 * TestCountdownWidget - Shows countdown to test date with edit option
 */

import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS, STATUS_COLORS, getUrgencyColor} from '../../constants/design';
import {Icon} from '../icons';
import {EntryTestData} from '../../data';
import {getDaysUntil} from './helpers';

interface Props {
  test: EntryTestData;
  customDate?: string;
  onEditDate: () => void;
  colors: any;
  isDark: boolean;
}

const TestCountdownWidget = ({test, customDate, onEditDate, colors}: Props) => {
  const displayDate = customDate || test.test_date;
  const daysUntil = getDaysUntil(displayDate || '');

  if (daysUntil === null || daysUntil < 0) {
    return (
      <TouchableOpacity onPress={onEditDate}>
        <View style={[styles.widget, {backgroundColor: STATUS_COLORS.backgrounds.info}]}>
          <Icon name="calendar-outline" family="Ionicons" size={24} color={colors.primary} />
          <View style={styles.content}>
            <Text style={[styles.label, {color: colors.textSecondary}]}>Test Date</Text>
            <Text style={[styles.date, {color: colors.text}]}>
              {customDate ? customDate : 'Tap to set date'}
            </Text>
          </View>
          <Icon name="pencil-outline" family="Ionicons" size={18} color={colors.primary} />
        </View>
      </TouchableOpacity>
    );
  }

  const urgencyColor = getUrgencyColor(daysUntil);

  return (
    <TouchableOpacity onPress={onEditDate}>
      <View style={[styles.widget, {backgroundColor: urgencyColor + '15'}]}>
        <View style={[styles.badge, {backgroundColor: urgencyColor}]}>
          <Text style={styles.days}>{daysUntil}</Text>
          <Text style={styles.daysLabel}>days</Text>
        </View>
        <View style={styles.content}>
          <Text style={[styles.label, {color: colors.textSecondary}]}>
            {daysUntil <= 7 ? 'Time is running out!' : daysUntil <= 30 ? 'Coming up soon!' : 'On track'}
          </Text>
          <Text style={[styles.date, {color: colors.text}]}>{displayDate}</Text>
          {customDate && (
            <Text style={[styles.customLabel, {color: urgencyColor}]}>Custom date</Text>
          )}
        </View>
        <Icon name="pencil-outline" family="Ionicons" size={18} color={urgencyColor} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  widget: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: SPACING.md,
  },
  badge: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  days: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#FFFFFF',
  },
  daysLabel: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginBottom: 2,
  },
  date: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  customLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
    marginTop: 2,
  },
});

export default TestCountdownWidget;

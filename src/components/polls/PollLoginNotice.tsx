/**
 * PollLoginNotice - Optional sign-in banner (voting works for everyone)
 * Guest users can vote - sign in to sync votes across devices
 */

import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {TYPOGRAPHY, SPACING, RADIUS} from '../../constants/design';
import {Icon} from '../icons';
import type {ThemeColors} from '../../contexts/ThemeContext';

interface Props {
  colors: ThemeColors;
}

const PollLoginNotice: React.FC<Props> = ({colors}) => {
  const navigation = useNavigation();

  return (
    <View style={[styles.container, {backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}25`, borderWidth: 1}]}>
      <Icon name="sync-outline" family="Ionicons" size={18} color={colors.primary} />
      <Text style={[styles.text, {color: colors.textSecondary}]}>
        Sign in to sync your votes across all your devices
      </Text>
      <TouchableOpacity
        style={[styles.btn, {backgroundColor: colors.primary + '20', borderColor: colors.primary + '40', borderWidth: 1}]}
        onPress={() => navigation.navigate('Auth' as never)}>
        <Text style={[styles.btnText, {color: colors.primary}]}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  text: {
    flex: 1,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  btn: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
  },
  btnText: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
});

export default React.memo(PollLoginNotice);

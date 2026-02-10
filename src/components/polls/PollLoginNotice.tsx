/**
 * PollLoginNotice - Banner prompting unauthenticated users to sign in
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
    <View style={[styles.container, {backgroundColor: `${colors.warning}15`}]}>
      <Icon
        name="information-circle-outline"
        family="Ionicons"
        size={20}
        color={colors.warning}
      />
      <Text style={[styles.text, {color: colors.text}]}>
        Sign in to vote and help the community make better decisions!
      </Text>
      <TouchableOpacity
        style={[styles.btn, {backgroundColor: colors.warning}]}
        onPress={() => navigation.navigate('Auth' as never)}>
        <Text style={styles.btnText}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  text: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  btn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.md,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
});

export default React.memo(PollLoginNotice);

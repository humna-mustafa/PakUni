/**
 * SocialButton - Reusable social auth button
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {Icon} from '../icons';
import {FONTS} from '../../constants/theme';

interface SocialButtonProps {
  iconName: string;
  label: string;
  onPress: () => void;
  colors: any;
  bgColor?: string;
  textColor?: string;
  loading?: boolean;
}

export const SocialButton: React.FC<SocialButtonProps> = React.memo(({
  iconName,
  label,
  onPress,
  colors,
  bgColor,
  textColor,
  loading,
}) => (
  <TouchableOpacity
    style={[styles.socialButton, {backgroundColor: bgColor || colors.card}]}
    onPress={onPress}
    activeOpacity={0.8}
    disabled={loading}>
    {loading ? (
      <ActivityIndicator size="small" color={textColor || colors.text} />
    ) : (
      <>
        <Icon
          name={iconName}
          family="Ionicons"
          size={22}
          color={textColor || colors.text}
        />
        <Text style={[styles.socialButtonText, {color: textColor || colors.text}]}>
          {label}
        </Text>
      </>
    )}
  </TouchableOpacity>
));

const styles = StyleSheet.create({
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.06,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: FONTS.weight.medium,
  },
});

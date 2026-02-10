/**
 * VerificationBadge - Trust indicator badges
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SEMANTIC } from '../../constants/brand';

interface VerificationBadgeProps {
  type: 'google' | 'trusted' | 'new';
  size?: number;
}

const BADGE_CONFIG = {
  google: { icon: 'logo-google', bg: '#4285F4', label: 'Google Verified' },
  trusted: { icon: 'shield-checkmark', bg: SEMANTIC.success, label: 'Trusted' },
  new: { icon: 'star', bg: SEMANTIC.warning, label: 'New User' },
};

const VerificationBadgeComponent: React.FC<VerificationBadgeProps> = ({ type, size = 16 }) => {
  const { icon, bg } = BADGE_CONFIG[type];

  return (
    <View style={[styles.verificationBadge, { backgroundColor: bg }]}>
      <Icon name={icon} size={size - 4} color="#FFFFFF" />
    </View>
  );
};

const styles = StyleSheet.create({
  verificationBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const VerificationBadge = React.memo(VerificationBadgeComponent);

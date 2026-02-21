import React, {memo} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {MODERN_TYPOGRAPHY} from '../../constants/modern-design';
import {Icon} from '../icons';

interface JourneyCTACardProps {
  onPress: () => void;
  colors: any;
  isDark: boolean;
}

const JourneyCTACard = memo<JourneyCTACardProps>(({onPress, colors}) => {
  return (
    <View style={styles.ctaWrapper}>
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark || '#3660C9']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.ctaCard}>
          <View style={styles.ctaLayout}>
            <View style={styles.ctaIcon}>
              <Icon name="calculator" family="Ionicons" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.ctaText}>
              <Text style={styles.ctaTitle}>Calculate Your Merit</Text>
              <Text style={styles.ctaSubtitle}>Find matching universities</Text>
            </View>
            <Icon name="chevron-forward" family="Ionicons" size={20} color="rgba(255,255,255,0.8)" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  ctaWrapper: {
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 24,
  },
  ctaCard: {
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  ctaLayout: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ctaText: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 15,
    fontWeight: MODERN_TYPOGRAPHY.weight.semibold,
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  ctaSubtitle: {
    fontSize: 12,
    fontWeight: MODERN_TYPOGRAPHY.weight.regular,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
});

export default JourneyCTACard;

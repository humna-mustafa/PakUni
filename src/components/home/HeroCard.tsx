import React, {memo} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Platform} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {MODERN_TYPOGRAPHY} from '../../constants/modern-design';
import {Icon} from '../icons';

interface HeroCardProps {
  onExplorePress: () => void;
  onAIMatchPress: () => void;
  colors: any;
  isDark: boolean;
}

const HeroCard = memo<HeroCardProps>(({onExplorePress, onAIMatchPress, colors, isDark}) => {
  const cardBg = isDark ? '#1E2228' : '#FFFFFF';
  const subtleBg = isDark ? 'rgba(69, 115, 223, 0.08)' : 'rgba(69, 115, 223, 0.04)';

  return (
    <View style={styles.heroWrapper}>
      <View style={[styles.heroCard, {backgroundColor: cardBg}]}>
        <LinearGradient
          colors={[subtleBg, 'transparent']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.heroGradient}
        />
        <View style={styles.heroContent}>
          <Text style={[styles.heroLabel, {color: colors.textTertiary}]}>
            200+ Universities
          </Text>
          <View style={styles.heroTitleGroup}>
            <Text style={[styles.heroTitle, {color: colors.text}]}>
              Find Your Perfect
            </Text>
            <Text style={[styles.heroTitleAccent, {color: colors.primary}]}>
              University
            </Text>
          </View>
          <Text style={[styles.heroDesc, {color: colors.textSecondary}]}>
            Personalized recommendations based on your marks and interests
          </Text>
          <View style={styles.heroActions}>
            <TouchableOpacity
              style={[styles.heroPrimary, {backgroundColor: colors.primary}]}
              onPress={onExplorePress}
              activeOpacity={0.85}>
              <Text style={styles.heroPrimaryText}>Explore All</Text>
              <Icon name="arrow-forward" family="Ionicons" size={16} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.heroSecondary, {borderColor: colors.border}]}
              onPress={onAIMatchPress}
              activeOpacity={0.7}>
              <Icon name="sparkles" family="Ionicons" size={18} color={colors.primary} />
              <Text style={[styles.heroSecondaryText, {color: colors.primary}]}>AI Match</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  heroWrapper: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  heroCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroContent: {
    padding: 20,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: MODERN_TYPOGRAPHY.weight.semibold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heroTitleGroup: {
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: MODERN_TYPOGRAPHY.weight.medium,
    letterSpacing: 0,
    lineHeight: 20,
  },
  heroTitleAccent: {
    fontSize: 24,
    fontWeight: MODERN_TYPOGRAPHY.weight.bold,
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  heroDesc: {
    fontSize: 14,
    fontWeight: MODERN_TYPOGRAPHY.weight.regular,
    lineHeight: 20,
    marginBottom: 16,
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    gap: 8,
  },
  heroPrimaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: MODERN_TYPOGRAPHY.weight.semibold,
    letterSpacing: 0.1,
  },
  heroSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  heroSecondaryText: {
    fontSize: 14,
    fontWeight: MODERN_TYPOGRAPHY.weight.semibold,
  },
});

export default HeroCard;

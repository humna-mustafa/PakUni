/**
 * Merit Archive - Info Components
 * DisclaimerBanner and InsightCard for merit archive screen.
 */

import React from 'react';
import {View, Text, StyleSheet, Platform} from 'react-native';
import {TYPOGRAPHY, SPACING, RADIUS} from '../../constants/design';
import {Icon} from '../icons';

// ============================================================================
// DISCLAIMER BANNER
// ============================================================================

export const DisclaimerBanner: React.FC<{colors: any; isDark: boolean}> = ({
  colors,
  isDark,
}) => (
  <View
    style={[
      styles.disclaimerBanner,
      {
        backgroundColor: isDark
          ? 'rgba(251, 191, 36, 0.1)'
          : 'rgba(251, 191, 36, 0.08)',
      },
    ]}>
    <Icon
      name="information-circle"
      family="Ionicons"
      size={18}
      color="#F59E0B"
    />
    <View style={styles.disclaimerBannerText}>
      <Text style={[styles.disclaimerTitle, {color: colors.text}]}>
        Data Accuracy Notice
      </Text>
      <Text style={[styles.disclaimerBody, {color: colors.textSecondary}]}>
        Merit data is collected from public sources and may not be 100%
        accurate. Always verify with the university's official website or
        admission office. Visit university social media pages for the latest
        updates.
      </Text>
    </View>
  </View>
);

// ============================================================================
// INSIGHT CARD
// ============================================================================

export const InsightCard: React.FC<{
  title: string;
  value: string;
  subtitle: string;
  iconName: string;
  color: string;
  colors: any;
}> = ({title, value, subtitle, iconName, color, colors}) => (
  <View style={[styles.insightCard, {backgroundColor: colors.card}]}>
    <View style={[styles.insightIcon, {backgroundColor: `${color}15`}]}>
      <Icon name={iconName} family="Ionicons" size={20} color={color} />
    </View>
    <Text style={[styles.insightTitle, {color: colors.textSecondary}]}>
      {title}
    </Text>
    <Text style={[styles.insightValue, {color: colors.text}]}>{value}</Text>
    <Text style={[styles.insightSubtitle, {color: colors.textSecondary}]}>
      {subtitle}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  // Disclaimer
  disclaimerBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
  },
  disclaimerBannerText: {flex: 1},
  disclaimerTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.bold as any,
    marginBottom: 2,
  },
  disclaimerBody: {fontSize: 11, lineHeight: 16},

  // Insight Card
  insightCard: {
    width: 130,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginRight: SPACING.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {elevation: 2},
    }),
  },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  insightTitle: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weight.medium as any,
    marginBottom: 2,
  },
  insightValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold as any,
  },
  insightSubtitle: {fontSize: 10, marginTop: 2},
});

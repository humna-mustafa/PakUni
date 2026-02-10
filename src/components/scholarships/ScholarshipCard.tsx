/**
 * ScholarshipCard - Premium card with animations, badges, and scholarship info
 */

import React, {useRef, useEffect} from 'react';
import {View, Text, TouchableOpacity, Animated, StyleSheet} from 'react-native';
import {TYPOGRAPHY, SPACING, RADIUS} from '../../constants/design';
import {Icon} from '../icons';
import {
  getScholarshipAvailabilityText,
  getScholarshipBrandColors,
  ScholarshipData,
} from '../../data/scholarships';

interface ScholarshipCardProps {
  item: ScholarshipData;
  colors: any;
  isDark: boolean;
  onPress: () => void;
  onToggleFavorite: (id: string) => void;
  isFavorited: boolean;
  index: number;
}

const ScholarshipCard = ({
  item,
  colors,
  isDark,
  onPress,
  onToggleFavorite,
  isFavorited,
  index,
}: ScholarshipCardProps) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    const delay = index * 60;
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay,
        tension: 65,
        friction: 9,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.97,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      tension: 80,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const getCoverageColor = (percentage: number) => {
    if (percentage >= 100) return '#10B981';
    if (percentage >= 50) return '#F59E0B';
    return '#4573DF';
  };

  const getTypeIconName = (type: string) => {
    switch (type) {
      case 'need_based': return 'wallet-outline';
      case 'merit_based': return 'trophy-outline';
      case 'hafiz_e_quran': return 'book-outline';
      case 'sports': return 'football-outline';
      case 'disabled': return 'accessibility-outline';
      case 'government': return 'business-outline';
      default: return 'school-outline';
    }
  };

  const brandColors = getScholarshipBrandColors(item.type);
  const accentColor = brandColors?.primary || colors.primary;
  const availabilityText = getScholarshipAvailabilityText(item);
  const isActive = item.status !== 'closed';
  const coveragePercentage = item.tuitionCoverage || 0;

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: scaleAnim,
          transform: [{scale: pressAnim}, {translateY: slideAnim}],
        },
      ]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={`${item.name} by ${item.provider}, ${coveragePercentage}% coverage${!isActive ? ', currently inactive' : ''}`}
        accessibilityHint="Double tap to view scholarship details">
        <View style={[styles.card, {backgroundColor: colors.card, borderLeftColor: accentColor, borderLeftWidth: 4}]}>
          {/* Top Badges Row */}
          <View style={styles.badgesRow}>
            <View
              style={[
                styles.statusBadge,
                {backgroundColor: isActive ? '#10B98120' : '#EF444420'},
              ]}>
              <View style={[styles.statusDot, {backgroundColor: isActive ? '#10B981' : '#EF4444'}]} />
              <Text style={[styles.statusText, {color: isActive ? '#10B981' : '#EF4444'}]}>
                {isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>

            <View
              style={[
                styles.coverageBadge,
                {backgroundColor: getCoverageColor(coveragePercentage) + '20'},
              ]}>
              <Text style={[styles.coverageText, {color: getCoverageColor(coveragePercentage)}]}>
                {item.coverageLabel || `${coveragePercentage}% Tuition`}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.cardFavoriteBtn, {backgroundColor: isFavorited ? '#FEE2E2' : colors.background}]}
              onPress={(e) => {
                e.stopPropagation();
                onToggleFavorite(item.id);
              }}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
              accessibilityRole="button"
              accessibilityLabel={isFavorited ? 'Remove from favorites' : 'Add to favorites'}>
              <Icon
                name={isFavorited ? 'heart' : 'heart-outline'}
                family="Ionicons"
                size={16}
                color={isFavorited ? '#EF4444' : colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, {backgroundColor: accentColor + '20'}]}>
              <Icon name={getTypeIconName(item.type)} family="Ionicons" size={24} color={accentColor} />
            </View>
            <View style={styles.titleContainer}>
              <Text style={[styles.cardTitle, {color: colors.text}]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={[styles.cardProvider, {color: colors.textSecondary}]} numberOfLines={1}>
                {item.provider}
              </Text>
            </View>
          </View>

          {/* Deadline */}
          {item.deadline && (
            <View style={[styles.deadlineRowCompact, {backgroundColor: colors.warningLight}]}>
              <Icon name="calendar-outline" family="Ionicons" size={14} color={colors.warning} />
              <Text style={[styles.deadlineTextCompact, {color: colors.warning}]}>Deadline: {item.deadline}</Text>
            </View>
          )}

          {/* University Availability */}
          <View style={[styles.availabilitySectionSimple, {backgroundColor: colors.background}]}>
            <Icon name="school-outline" family="Ionicons" size={14} color={colors.primary} />
            <Text style={[styles.availabilityTextSimple, {color: colors.textSecondary}]} numberOfLines={1}>
              {availabilityText}
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.cardFooter}>
            <View style={styles.eligibilityPreview}>
              <Icon name="checkmark-circle" family="Ionicons" size={14} color={colors.success} />
              <Text style={[styles.eligibilityText, {color: colors.textSecondary}]} numberOfLines={1}>
                {item.eligibility?.[0] || 'See details'}
              </Text>
            </View>
            <View style={[styles.viewBtn, {backgroundColor: accentColor + '15'}]}>
              <Text style={[styles.viewBtnText, {color: accentColor}]}>Details</Text>
              <Icon name="chevron-forward" family="Ionicons" size={14} color={accentColor} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: SPACING.sm,
  },
  card: {
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    gap: SPACING.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  coverageBadge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
  },
  coverageText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  cardFavoriteBtn: {
    marginLeft: 'auto',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.xs + 2,
    paddingRight: 80,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weight.bold,
    lineHeight: 20,
  },
  cardProvider: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
  },
  deadlineRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    gap: 4,
    marginBottom: SPACING.xs,
  },
  deadlineTextCompact: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  availabilitySectionSimple: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    gap: 4,
    marginBottom: SPACING.xs,
  },
  availabilityTextSimple: {
    fontSize: TYPOGRAPHY.sizes.xs,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  eligibilityPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.sm,
  },
  eligibilityText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    flex: 1,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
    gap: 4,
  },
  viewBtnText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
});

export default React.memo(ScholarshipCard);

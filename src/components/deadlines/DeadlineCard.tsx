/**
 * DeadlineCard - Animated admission deadline card with timeline
 */

import React, {useRef, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Animated, Platform} from 'react-native';
import {TYPOGRAPHY, SPACING, RADIUS} from '../../constants/design';
import {Icon} from '../icons';
import {
  AdmissionDeadline,
  getDaysUntilDeadline,
  getDeadlineStatus,
} from '../../data/deadlines';

export interface RelatedEntryTest {
  id: string;
  name: string;
  programCategory: string;
}

interface DeadlineCardProps {
  deadline: AdmissionDeadline;
  isFollowed: boolean;
  onFollowToggle: (universityId: string) => void;
  onApply: (deadline: AdmissionDeadline) => void;
  onEntryTestPress?: (testId: string) => void;
  relatedEntryTests?: RelatedEntryTest[];
  colors: any;
  isDark: boolean;
  index: number;
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-PK', {day: 'numeric', month: 'short', year: 'numeric'});
};

const getStatusConfig = (status: string, daysLeft: number, colors: any) => {
  switch (status) {
    case 'open':
      return {color: colors.success, bgColor: `${colors.success}15`, text: 'Open', icon: 'checkmark-circle'};
    case 'closing-soon':
      return {color: colors.warning, bgColor: `${colors.warning}15`, text: `${daysLeft} days left`, icon: 'alert-circle'};
    case 'upcoming':
      return {color: colors.primary, bgColor: `${colors.primary}15`, text: 'Upcoming', icon: 'time-outline'};
    case 'closed':
      return {color: colors.error, bgColor: `${colors.error}15`, text: 'Closed', icon: 'close-circle'};
    default:
      return {color: colors.textSecondary, bgColor: colors.border, text: 'Unknown', icon: 'help-circle'};
  }
};

const DeadlineCard: React.FC<DeadlineCardProps> = React.memo(({
  deadline, isFollowed, onFollowToggle, onApply, onEntryTestPress, relatedEntryTests, colors, isDark, index,
}) => {
  // Cap entrance animation to first 6 visible items for FlatList cell recycling
  const shouldAnimate = index < 6;
  const fadeAnim = useRef(new Animated.Value(shouldAnimate ? 0 : 1)).current;
  const slideAnim = useRef(new Animated.Value(shouldAnimate ? 20 : 0)).current;

  useEffect(() => {
    if (!shouldAnimate) return;
    const delay = Math.min(index * 60, 300);
    Animated.parallel([
      Animated.timing(fadeAnim, {toValue: 1, duration: 300, delay, useNativeDriver: true}),
      Animated.spring(slideAnim, {toValue: 0, delay, tension: 50, friction: 8, useNativeDriver: true}),
    ]).start();
  }, [index]);

  const daysLeft = getDaysUntilDeadline(deadline);
  const status = getDeadlineStatus(deadline);
  const statusConfig = getStatusConfig(status, daysLeft, colors);

  return (
    <Animated.View style={[styles.card, {backgroundColor: colors.card, opacity: fadeAnim, transform: [{translateY: slideAnim}], borderLeftWidth: 4, borderLeftColor: statusConfig.color}]}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleSection}>
          <View style={styles.universityBadge}>
            <Text style={[styles.universityShortName, {color: colors.primary}]}>{deadline.universityShortName}</Text>
          </View>
          <View style={[styles.statusBadge, {backgroundColor: statusConfig.bgColor}]}>
            <Icon name={statusConfig.icon} family="Ionicons" size={12} color={statusConfig.color} />
            <Text style={[styles.statusText, {color: statusConfig.color}]}>{statusConfig.text}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.followBtn, {backgroundColor: isFollowed ? colors.primary : 'transparent', borderColor: isFollowed ? colors.primary : colors.border}]}
          onPress={() => onFollowToggle(deadline.universityId)}
          activeOpacity={0.8}>
          <Icon name={isFollowed ? 'notifications' : 'notifications-outline'} family="Ionicons" size={16} color={isFollowed ? '#FFFFFF' : colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text style={[styles.deadlineTitle, {color: colors.text}]} numberOfLines={2}>{deadline.title}</Text>
      {deadline.description && (
        <Text style={[styles.deadlineDescription, {color: colors.textSecondary}]} numberOfLines={2}>{deadline.description}</Text>
      )}

      {/* Timeline */}
      <View style={styles.timelineSection}>
        <View style={styles.timelineItem}>
          <View style={[styles.timelineDot, {backgroundColor: colors.success}]} />
          <View>
            <Text style={[styles.timelineLabel, {color: colors.textSecondary}]}>Applications Open</Text>
            <Text style={[styles.timelineDate, {color: colors.text}]}>{formatDate(deadline.applicationStartDate)}</Text>
          </View>
        </View>
        <View style={[styles.timelineLine, {backgroundColor: colors.border}]} />
        <View style={styles.timelineItem}>
          <View style={[styles.timelineDot, {backgroundColor: colors.error}]} />
          <View>
            <Text style={[styles.timelineLabel, {color: colors.textSecondary}]}>Deadline</Text>
            <Text style={[styles.timelineDate, {color: colors.text}]}>{formatDate(deadline.applicationDeadline)}</Text>
          </View>
        </View>
        {deadline.entryTestDate && (
          <>
            <View style={[styles.timelineLine, {backgroundColor: colors.border}]} />
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, {backgroundColor: colors.warning}]} />
              <View>
                <Text style={[styles.timelineLabel, {color: colors.textSecondary}]}>Entry Test</Text>
                <Text style={[styles.timelineDate, {color: colors.text}]}>{formatDate(deadline.entryTestDate)}</Text>
              </View>
            </View>
          </>
        )}
        {deadline.resultDate && (
          <>
            <View style={[styles.timelineLine, {backgroundColor: colors.border}]} />
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, {backgroundColor: colors.primary}]} />
              <View>
                <Text style={[styles.timelineLabel, {color: colors.textSecondary}]}>Results</Text>
                <Text style={[styles.timelineDate, {color: colors.text}]}>{formatDate(deadline.resultDate)}</Text>
              </View>
            </View>
          </>
        )}
      </View>

      {/* Related Entry Tests */}
      {relatedEntryTests && relatedEntryTests.length > 0 && (
        <View style={styles.entryTestsSection}>
          <Text style={[styles.entryTestsLabel, {color: colors.textSecondary}]}>Prepare for:</Text>
          <View style={styles.entryTestsPills}>
            {relatedEntryTests.map(test => (
              <TouchableOpacity
                key={test.id}
                style={[styles.entryTestPill, {backgroundColor: colors.primary + '15', borderColor: colors.primary + '30'}]}
                onPress={() => onEntryTestPress?.(test.id)}
                activeOpacity={0.8}>
                <Icon name="create-outline" family="Ionicons" size={11} color={colors.primary} />
                <Text style={[styles.entryTestPillText, {color: colors.primary}]}>{test.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Footer */}
      <View style={styles.cardFooter}>
        {deadline.fee && (
          <View style={styles.feeSection}>
            <Icon name="cash-outline" family="Ionicons" size={14} color={colors.textSecondary} />
            <Text style={[styles.feeText, {color: colors.textSecondary}]}>PKR {deadline.fee.toLocaleString()}</Text>
          </View>
        )}
        {status !== 'closed' && (
          <TouchableOpacity style={[styles.applyBtn, {backgroundColor: colors.primary}]} onPress={() => onApply(deadline)} activeOpacity={0.9}>
            <Text style={styles.applyBtnText}>Apply Now</Text>
            <Icon name="open-outline" family="Ionicons" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Highlighted Badge */}
      {deadline.isHighlighted && (
        <View style={[styles.highlightedBadge, {backgroundColor: colors.warning}]}>
          <Icon name="star" family="Ionicons" size={10} color="#FFFFFF" />
        </View>
      )}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.md, position: 'relative',
    ...Platform.select({
      ios: {shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.08, shadowRadius: 12},
      android: {elevation: 3},
    }),
  },
  cardHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm},
  cardTitleSection: {flexDirection: 'row', alignItems: 'center', gap: SPACING.sm},
  universityBadge: {backgroundColor: 'rgba(69,115,223,0.1)', paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.sm},
  universityShortName: {fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weight.bold},
  statusBadge: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.sm, gap: 4},
  statusText: {fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weight.semibold},
  followBtn: {width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center'},
  deadlineTitle: {fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.bold, marginBottom: 4, lineHeight: 22},
  deadlineDescription: {fontSize: TYPOGRAPHY.sizes.sm, lineHeight: 20, marginBottom: SPACING.md},
  timelineSection: {flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md, flexWrap: 'wrap', gap: SPACING.sm},
  timelineItem: {flexDirection: 'row', alignItems: 'center', gap: SPACING.xs},
  timelineDot: {width: 8, height: 8, borderRadius: 4},
  timelineLabel: {fontSize: 10, fontWeight: TYPOGRAPHY.weight.medium},
  timelineDate: {fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weight.semibold},
  timelineLine: {width: 20, height: 1},
  cardFooter: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: SPACING.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(0,0,0,0.08)'},
  feeSection: {flexDirection: 'row', alignItems: 'center', gap: 4},
  feeText: {fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.semibold},
  applyBtn: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, gap: SPACING.xs, marginLeft: 'auto'},
  applyBtnText: {color: '#FFFFFF', fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.semibold},
  highlightedBadge: {position: 'absolute', top: SPACING.md, right: SPACING.md + 44, width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center'},
  entryTestsSection: {marginBottom: SPACING.sm},
  entryTestsLabel: {fontSize: 10, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5},
  entryTestsPills: {flexDirection: 'row', flexWrap: 'wrap', gap: 6},
  entryTestPill: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.full, borderWidth: 1, gap: 4},
  entryTestPillText: {fontSize: 11, fontWeight: '600'},
});

export default DeadlineCard;

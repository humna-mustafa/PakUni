/**
 * ContributionHistoryTab - Shows user's submission history with stats
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { SEMANTIC } from '../../constants/brand';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/design';
import { useAuth } from '../../contexts/AuthContext';
import { dataSubmissionsService, DataSubmission } from '../../services/dataSubmissions';
import { CATEGORIES, STATUS_CONFIG } from '../../constants/contribute';
import { SkeletonBox } from './SkeletonBox';

interface ContributionHistoryTabProps {
  colors: any;
  isDark: boolean;
}

const ContributionHistoryTabComponent: React.FC<ContributionHistoryTabProps> = ({
  colors,
  isDark,
}) => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<DataSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (!user) return;
    try {
      setError(null);
      const data = await dataSubmissionsService.getSubmissions({ user_id: user.id });
      setSubmissions(data);
    } catch (err) {
      console.error('Failed to load history:', err);
      setError('Could not load your contributions. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  if (loading) {
    return (
      <View style={styles.historyLoading}>
        {[1, 2, 3].map(i => (
          <View key={i} style={[styles.skeletonCard, { backgroundColor: colors.card }]}>
            <SkeletonBox width={40} height={40} style={{ borderRadius: 10 }} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <SkeletonBox width="70%" height={16} />
              <SkeletonBox width="50%" height={12} style={{ marginTop: 8 }} />
            </View>
            <SkeletonBox width={70} height={24} style={{ borderRadius: 12 }} />
          </View>
        ))}
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.emptyState}>
        <View style={[styles.emptyIcon, { backgroundColor: colors.card }]}>
          <Icon name="cloud-offline-outline" size={48} color={colors.textSecondary} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Failed to Load</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          {error}
        </Text>
      </View>
    );
  }

  if (submissions.length === 0) {
    return (
      <View style={styles.emptyState}>
        <View style={[styles.emptyIcon, { backgroundColor: colors.card }]}>
          <Icon name="document-text-outline" size={48} color={colors.textSecondary} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>No Submissions Yet</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          Your corrections will appear here
        </Text>
      </View>
    );
  }

  const stats = {
    total: submissions.length,
    approved: submissions.filter(s => s.status === 'approved' || s.status === 'auto_approved').length,
    pending: submissions.filter(s => s.status === 'pending').length,
  };

  return (
    <ScrollView
      style={styles.historyContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
      }
      showsVerticalScrollIndicator={false}>
      {/* Stats Row */}
      <View style={[styles.statsRow, { backgroundColor: colors.card }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.total}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: SEMANTIC.success }]}>{stats.approved}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Approved</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: SEMANTIC.warning }]}>{stats.pending}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending</Text>
        </View>
      </View>

      {/* History Cards */}
      {submissions.map(submission => {
        const status = STATUS_CONFIG[submission.status] || STATUS_CONFIG.pending;
        const category = CATEGORIES.find(c => c.id === submission.type);

        return (
          <View key={submission.id} style={[styles.historyCard, { backgroundColor: colors.card }]}>
            <View style={styles.historyCardTop}>
              {category && (
                <LinearGradient colors={category.gradient} style={styles.historyCardIcon}>
                  <Icon name={category.icon} size={16} color="#FFFFFF" />
                </LinearGradient>
              )}
              <View style={styles.historyCardInfo}>
                <Text style={[styles.historyCardEntity, { color: colors.text }]} numberOfLines={1}>
                  {submission.entity_name}
                </Text>
                <Text style={[styles.historyCardField, { color: colors.textSecondary }]}>
                  {submission.field_name}
                </Text>
              </View>
              <View style={[styles.historyStatusBadge, { backgroundColor: status.bg }]}>
                <Icon name={status.icon} size={12} color={status.text} />
                <Text style={[styles.historyStatusText, { color: status.text }]}>
                  {status.label}
                </Text>
              </View>
            </View>

            <View style={styles.historyCardChange}>
              {submission.current_value && submission.current_value !== 'Not specified' && (
                <>
                  <Text style={styles.historyOldValue} numberOfLines={1}>
                    {String(submission.current_value)}
                  </Text>
                  <Icon name="arrow-forward" size={12} color={colors.textSecondary} />
                </>
              )}
              <Text style={styles.historyNewValue} numberOfLines={1}>
                {String(submission.proposed_value)}
              </Text>
            </View>

            <Text style={[styles.historyDate, { color: colors.textSecondary }]}>
              {new Date(submission.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        );
      })}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  historyContainer: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  historyLoading: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weight.heavy,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  historyCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  historyCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  historyCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyCardInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  historyCardEntity: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  historyCardField: {
    fontSize: 12,
  },
  historyStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  historyStatusText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  historyCardChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  historyOldValue: {
    fontSize: 12,
    color: SEMANTIC.error,
    textDecorationLine: 'line-through',
  },
  historyNewValue: {
    fontSize: 12,
    color: SEMANTIC.success,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  historyDate: {
    fontSize: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
  },
});

export const ContributionHistoryTab = React.memo(ContributionHistoryTabComponent);

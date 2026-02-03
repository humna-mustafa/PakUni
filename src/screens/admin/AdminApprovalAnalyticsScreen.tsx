/**
 * Admin Approval Analytics Screen
 * 
 * Tracks and displays approval metrics and insights
 * Features:
 * - Approval rate trends
 * - Auto-approval statistics
 * - Common rejection reasons
 * - User trust level distribution
 * - Processing time analytics
 * - Batch update history
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/ThemeContext';
import { TYPOGRAPHY } from '../../constants/design';
import { UniversalHeader } from '../../components';
import { dataSubmissionsService, batchUpdateService } from '../../services';

interface ApprovalMetrics {
  totalSubmissions: number;
  approvalRate: number;
  autoApprovalRate: number;
  avgProcessingTime: number;
  pendingCount: number;
  rejectionReasons: Record<string, number>;
  trustLevelDistribution: Record<number, number>;
  batchStats: {
    processed: number;
    pending: number;
    failed: number;
  };
}

export const AdminApprovalAnalyticsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  
  const [metrics, setMetrics] = useState<ApprovalMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'all'>('week');

  const loadMetrics = useCallback(async () => {
    try {
      const [submissions, batchStats, queueStats] = await Promise.all([
        dataSubmissionsService.getSubmissions(),
        batchUpdateService.getHistory(100),
        batchUpdateService.getQueueStats(),
      ]);

      const stats = await dataSubmissionsService.getStatistics();
      const approved = submissions.filter(s => s.status === 'approved' || s.status === 'auto_approved');
      const rejected = submissions.filter(s => s.status === 'rejected');

      // Calculate metrics
      const approvalRate = submissions.length > 0 
        ? Math.round((approved.length / submissions.length) * 100)
        : 0;

      const autoApprovedCount = submissions.filter(s => s.status === 'auto_approved').length;
      const autoApprovalRate = approved.length > 0
        ? Math.round((autoApprovedCount / approved.length) * 100)
        : 0;

      // Rejection reasons
      const rejectionReasons: Record<string, number> = {};
      rejected.forEach(r => {
        if (r.rejection_reason) {
          rejectionReasons[r.rejection_reason] = (rejectionReasons[r.rejection_reason] || 0) + 1;
        }
      });

      // Trust level distribution
      const trustDistribution: Record<number, number> = {};
      submissions.forEach(s => {
        const level = Math.min(5, Math.max(0, s.user_trust_level));
        trustDistribution[level] = (trustDistribution[level] || 0) + 1;
      });

      const processedJobs = batchStats.filter(j => j.status === 'completed');
      const avgProcessingTime = processedJobs.length > 0
        ? processedJobs.reduce((sum, j) => {
          const start = new Date(j.createdAt).getTime();
          const end = j.processedAt ? new Date(j.processedAt).getTime() : Date.now();
          return sum + (end - start);
        }, 0) / processedJobs.length / 1000 / 60 // in minutes
        : 0;

      setMetrics({
        totalSubmissions: submissions.length,
        approvalRate,
        autoApprovalRate,
        avgProcessingTime: Math.round(avgProcessingTime),
        pendingCount: stats.submissions.pending,
        rejectionReasons,
        trustLevelDistribution: trustDistribution,
        batchStats: {
          processed: queueStats.completed,
          pending: queueStats.pending,
          failed: queueStats.failed,
        },
      });
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  const onRefresh = () => {
    setRefreshing(true);
    loadMetrics();
  };

  const renderMetricCard = (title: string, value: string | number, subtitle?: string, icon?: string, color?: string) => (
    <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: color || colors.primary }]}>
      {icon && (
        <View style={[styles.metricIcon, { backgroundColor: (color || colors.primary) + '20' }]}>
          <Icon name={icon} size={24} color={color || colors.primary} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{title}</Text>
        <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
        {subtitle && (
          <Text style={[styles.metricSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <UniversalHeader title="Approval Analytics" showBack onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!metrics) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <UniversalHeader title="Approval Analytics" showBack onBack={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color={colors.primary} />
          <Text style={[styles.errorText, { color: colors.text }]}>Failed to load analytics</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <UniversalHeader title="Approval Analytics" showBack onBack={() => navigation.goBack()} />
      
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Overall Performance</Text>
          
          {renderMetricCard(
            'Total Submissions',
            metrics.totalSubmissions,
            `${metrics.pendingCount} pending`,
            'documents',
            '#4573DF'
          )}
          
          {renderMetricCard(
            'Approval Rate',
            `${metrics.approvalRate}%`,
            'Both approved & auto-approved',
            'checkmark-circle',
            '#10B981'
          )}
          
          {renderMetricCard(
            'Auto-Approval Rate',
            `${metrics.autoApprovalRate}%`,
            'Of approved submissions',
            'flash',
            '#F59E0B'
          )}
          
          {renderMetricCard(
            'Avg Processing Time',
            `${metrics.avgProcessingTime} min`,
            'Per submission',
            'timer',
            '#4573DF'
          )}
        </View>

        {/* Batch Update Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Batch Update Status</Text>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { backgroundColor: colors.card }]}>
              <Icon name="checkmark-done" size={24} color="#10B981" />
              <Text style={[styles.statValue, { color: colors.text }]}>{metrics.batchStats.processed}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Processed</Text>
            </View>
            
            <View style={[styles.statBox, { backgroundColor: colors.card }]}>
              <Icon name="hourglass" size={24} color="#F59E0B" />
              <Text style={[styles.statValue, { color: colors.text }]}>{metrics.batchStats.pending}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending</Text>
            </View>
            
            <View style={[styles.statBox, { backgroundColor: colors.card }]}>
              <Icon name="close-circle" size={24} color="#EF4444" />
              <Text style={[styles.statValue, { color: colors.text }]}>{metrics.batchStats.failed}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Failed</Text>
            </View>
          </View>
        </View>

        {/* Trust Level Distribution */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>User Trust Distribution</Text>
          
          {Array.from({ length: 6 }).map((_, level) => {
            const count = metrics.trustLevelDistribution[level] || 0;
            const total = metrics.totalSubmissions || 1;
            const percentage = Math.round((count / total) * 100);
            
            return (
              <View key={level} style={styles.trustItem}>
                <View style={styles.trustLevel}>
                  {Array.from({ length: level }).map((_, i) => (
                    <Icon key={i} name="star" size={12} color="#F59E0B" />
                  ))}
                  {Array.from({ length: 5 - level }).map((_, i) => (
                    <Icon key={`empty_${i}`} name="star-outline" size={12} color={colors.textSecondary} />
                  ))}
                </View>
                <View style={styles.trustBar}>
                  <View
                    style={[
                      styles.trustBarFill,
                      {
                        width: `${Math.max(5, percentage)}%`,
                        backgroundColor: colors.primary,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.trustPercent, { color: colors.text }]}>{percentage}%</Text>
              </View>
            );
          })}
        </View>

        {/* Rejection Reasons */}
        {Object.keys(metrics.rejectionReasons).length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Common Rejection Reasons</Text>
            
            {Object.entries(metrics.rejectionReasons)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([reason, count]) => (
                <View key={reason} style={styles.rejectionItem}>
                  <Text style={[styles.rejectionReason, { color: colors.text }]} numberOfLines={2}>
                    {reason}
                  </Text>
                  <View style={[styles.rejectionBadge, { backgroundColor: '#EF4444' }]}>
                    <Text style={styles.rejectionCount}>{count}</Text>
                  </View>
                </View>
              ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('AdminDataSubmissions')}
          >
            <Icon name="document-text" size={20} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>Review Submissions</Text>
            <Icon name="chevron-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#4573DF' }]}
            onPress={() => navigation.navigate('AdminAutoApprovalRules')}
          >
            <Icon name="flash" size={20} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>Manage Auto-Approval Rules</Text>
            <Icon name="chevron-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    marginTop: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: 12,
  },
  metricCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    alignItems: 'center',
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  metricLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  metricSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  trustLevel: {
    flexDirection: 'row',
    gap: 2,
    width: 70,
  },
  trustBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(128,128,128,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  trustBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  trustPercent: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.semibold,
    width: 40,
    textAlign: 'right',
  },
  rejectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  rejectionReason: {
    fontSize: 13,
    flex: 1,
  },
  rejectionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  rejectionCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.semibold,
    flex: 1,
    marginLeft: 12,
  },
});

export default AdminApprovalAnalyticsScreen;



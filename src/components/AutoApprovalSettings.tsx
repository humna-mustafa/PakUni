/**
 * Auto-Approval Settings Panel
 * 
 * Quick settings for:
 * - Global auto-approval toggle (On/Off)
 * - Rules management shortcut
 * - Approval workflow settings
 * 
 * Can be embedded in AdminSettingsScreen or AdminDashboard
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { contributionAutomationService } from '../services/contributionAutomation';
import { dataSubmissionsService } from '../services/dataSubmissions';

export interface AutoApprovalSettingsProps {
  onNavigateToRules?: () => void;
  onNavigateToAnalytics?: () => void;
  compact?: boolean; // true for embedded widget, false for full screen
}

export const AutoApprovalSettings: React.FC<AutoApprovalSettingsProps> = ({
  onNavigateToRules,
  onNavigateToAnalytics,
  compact = false,
}) => {
  const { colors, isDark } = useTheme();

  const [autoApprovalEnabled, setAutoApprovalEnabled] = useState(true);
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRules: 0,
    enabledRules: 0,
    autoApprovedToday: 0,
    manualApprovalsNeeded: 0,
  });

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);

      // Get global toggle status
      const enabled = await contributionAutomationService.isGlobalAutoApprovalEnabled();
      setAutoApprovalEnabled(enabled);

      // Get rules
      const rulesData = await dataSubmissionsService.getAutoApprovalRules();
      setRules(rulesData);

      // Calculate stats
      const enabledCount = rulesData.filter((r) => r.enabled).length;
      setStats({
        totalRules: rulesData.length,
        enabledRules: enabledCount,
        autoApprovedToday: rulesData.reduce((sum, r) => sum + (r.total_auto_approved || 0), 0),
        manualApprovalsNeeded: 0, // Would need to fetch from submissions
      });
    } catch (error) {
      console.error('Failed to load auto-approval settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGlobalToggle = async (enabled: boolean) => {
    try {
      await contributionAutomationService.setGlobalAutoApprovalEnabled(enabled);
      setAutoApprovalEnabled(enabled);

      const message = enabled
        ? '✅ Auto-approval enabled. Submissions will be automatically approved based on rules.'
        : '⚠️ Auto-approval disabled. All submissions require manual review.';

      Alert.alert('Success', message);
    } catch (error) {
      Alert.alert('Error', 'Failed to update auto-approval setting');
      setAutoApprovalEnabled(!enabled); // Revert on error
    }
  };

  if (compact && loading) {
    return (
      <View style={[styles.widget, { backgroundColor: colors.card }]}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  const RuleList = () => (
    <View style={styles.rulesSection}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Rules ({stats.enabledRules})</Text>
        <TouchableOpacity
          onPress={onNavigateToRules}
          style={styles.viewAllLink}
        >
          <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
          <Icon name="chevron-forward" size={14} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {rules.filter((r) => r.enabled).slice(0, 3).map((rule) => (
        <View
          key={rule.id}
          style={[styles.ruleItem, { borderLeftColor: colors.primary }]}
        >
          <View style={styles.ruleHeader}>
            <Icon name="flash" size={14} color={colors.primary} />
            <Text style={[styles.ruleName, { color: colors.text }]} numberOfLines={1}>
              {rule.name}
            </Text>
          </View>
          <Text style={[styles.ruleDetail, { color: colors.textSecondary }]} numberOfLines={1}>
            Trust Level ≥ {rule.min_trust_level} • {rule.total_auto_approved || 0} approved
          </Text>
        </View>
      ))}

      {rules.filter((r) => r.enabled).length === 0 && (
        <View style={styles.emptyState}>
          <Icon name="flask-outline" size={24} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No rules configured. Create one to enable auto-approval.
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, !compact && { backgroundColor: colors.background }]}>
      {/* Global Toggle */}
      <View style={[styles.mainCard, { backgroundColor: colors.card }]}>
        <View style={styles.toggleContainer}>
          <View style={styles.toggleInfo}>
            <Icon name="flash-outline" size={24} color={colors.primary} />
            <View>
              <Text style={[styles.toggleTitle, { color: colors.text }]}>
                Auto-Approval System
              </Text>
              <Text style={[styles.toggleDescription, { color: colors.textSecondary }]}>
                {autoApprovalEnabled ? '✓ Enabled' : '✗ Disabled'}
              </Text>
            </View>
          </View>
          <Switch
            value={autoApprovalEnabled}
            onValueChange={handleGlobalToggle}
            trackColor={{ false: '#767577', true: colors.primary + '80' }}
            thumbColor={autoApprovalEnabled ? colors.primary : '#f4f3f4'}
          />
        </View>

        {autoApprovalEnabled ? (
          <Text style={[styles.statusText, { color: '#10B981' }]}>
            💚 Contributions will auto-approve when they match active rules.
          </Text>
        ) : (
          <Text style={[styles.statusText, { color: '#EF4444' }]}>
            🔴 All contributions require manual admin review.
          </Text>
        )}
      </View>

      {/* Stats */}
      {!compact && (
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Icon name="checkmark-circle" size={20} color="#10B981" />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {stats.autoApprovedToday}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Auto-Approved
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Icon name="rules" size={20} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {stats.enabledRules}/{stats.totalRules}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Rules Active
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Icon name="hourglass" size={20} color="#F59E0B" />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {stats.manualApprovalsNeeded}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Pending Review
            </Text>
          </View>
        </View>
      )}

      {/* Rules Section */}
      {!compact && (
        <>
          <RuleList />

          {/* Quick Actions */}
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}
              onPress={onNavigateToRules}
            >
              <Icon name="settings" size={18} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.primary }]}>Manage Rules</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}
              onPress={onNavigateToAnalytics}
            >
              <Icon name="stats-chart" size={18} color="white" />
              <Text style={[styles.actionTextAlt, { color: 'white' }]}>View Analytics</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  widget: {
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
  },
  mainCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  toggleDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  statusText: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
    paddingHorizontal: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  rulesSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  viewAllLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ruleItem: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ruleName: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  ruleDetail: {
    fontSize: 11,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionTextAlt: {
    fontSize: 13,
    fontWeight: '600',
  },
});

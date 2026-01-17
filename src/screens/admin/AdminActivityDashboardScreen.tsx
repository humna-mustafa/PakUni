/**
 * Admin Activity Dashboard Screen
 * 
 * Comprehensive activity monitoring and audit trail:
 * - Real-time activity stream
 * - Filterable audit logs
 * - Export capabilities
 * - Activity statistics
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/ThemeContext';
import { UniversalHeader } from '../../components';
import { enhancedAdminService, ActivityLogEntry } from '../../services/adminEnhanced';

type FilterType = 'all' | 'create' | 'update' | 'delete' | 'login' | 'config_change' | 'bulk_action';
type SeverityType = 'all' | 'info' | 'warning' | 'critical';

interface ActivityStats {
  total: number;
  today: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
}

const AdminActivityDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterSeverity, setFilterSeverity] = useState<SeverityType>('all');
  const [selectedActivity, setSelectedActivity] = useState<ActivityLogEntry | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const actionTypes: { value: FilterType; label: string; icon: string }[] = [
    { value: 'all', label: 'All Actions', icon: 'apps-outline' },
    { value: 'create', label: 'Create', icon: 'add-circle-outline' },
    { value: 'update', label: 'Update', icon: 'create-outline' },
    { value: 'delete', label: 'Delete', icon: 'trash-outline' },
    { value: 'login', label: 'Login/Logout', icon: 'log-in-outline' },
    { value: 'config_change', label: 'Config Changes', icon: 'settings-outline' },
    { value: 'bulk_action', label: 'Bulk Actions', icon: 'layers-outline' },
  ];

  const severities: { value: SeverityType; label: string; color: string }[] = [
    { value: 'all', label: 'All', color: colors.textSecondary },
    { value: 'info', label: 'Info', color: '#3B82F6' },
    { value: 'warning', label: 'Warning', color: '#F59E0B' },
    { value: 'critical', label: 'Critical', color: '#EF4444' },
  ];

  // Fetch activities
  const fetchActivities = useCallback(async () => {
    try {
      const filters: any = {};
      if (filterType !== 'all') filters.action_type = filterType;
      if (filterSeverity !== 'all') filters.severity = filterSeverity;

      const data = await enhancedAdminService.getActivityLogs(200, filters);
      setActivities(data);

      // Calculate stats
      const allActivities = await enhancedAdminService.getActivityLogs(1000);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayCount = allActivities.filter(a => new Date(a.timestamp) >= today).length;
      const byType: Record<string, number> = {};
      const bySeverity: Record<string, number> = {};

      allActivities.forEach(a => {
        byType[a.action_type] = (byType[a.action_type] || 0) + 1;
        bySeverity[a.severity] = (bySeverity[a.severity] || 0) + 1;
      });

      setStats({
        total: allActivities.length,
        today: todayCount,
        byType,
        bySeverity,
      });
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterType, filterSeverity]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchActivities();
  };

  // Clear old logs
  const handleClearOldLogs = async () => {
    const removed = await enhancedAdminService.clearOldActivityLogs(30);
    if (removed > 0) {
      fetchActivities();
    }
  };

  // Export logs
  const handleExportLogs = async () => {
    try {
      const data = activities.map(a => ({
        timestamp: a.timestamp,
        action: a.action_type,
        entity: a.entity_type,
        description: a.description,
        severity: a.severity,
      }));
      
      const csvContent = [
        'Timestamp,Action,Entity,Description,Severity',
        ...data.map(d => `"${d.timestamp}","${d.action}","${d.entity}","${d.description}","${d.severity}"`)
      ].join('\n');

      await Share.share({
        message: csvContent,
        title: 'Activity Logs Export',
      });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Get action icon
  const getActionIcon = (actionType: string): string => {
    switch (actionType) {
      case 'create': return 'add-circle';
      case 'update': return 'create';
      case 'delete': return 'trash';
      case 'login': return 'log-in';
      case 'logout': return 'log-out';
      case 'export': return 'download';
      case 'import': return 'cloud-upload';
      case 'config_change': return 'settings';
      case 'bulk_action': return 'layers';
      default: return 'ellipse';
    }
  };

  // Get severity color
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return '#EF4444';
      case 'warning': return '#F59E0B';
      default: return '#3B82F6';
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return date.toLocaleDateString();
  };

  const styles = createStyles(colors, isDark);

  // Render activity item
  const renderActivityItem = ({ item }: { item: ActivityLogEntry }) => (
    <TouchableOpacity
      style={styles.activityItem}
      onPress={() => {
        setSelectedActivity(item);
        setDetailModalVisible(true);
      }}
    >
      <View style={styles.activityLeft}>
        <View style={[styles.actionIcon, { backgroundColor: getSeverityColor(item.severity) + '20' }]}>
          <Icon
            name={getActionIcon(item.action_type) as any}
            size={18}
            color={getSeverityColor(item.severity)}
          />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.activityMeta}>
            <Text style={styles.entityBadge}>{item.entity_type}</Text>
            <Text style={styles.activityTime}>{formatTime(item.timestamp)}</Text>
          </View>
        </View>
      </View>
      <View style={[styles.severityDot, { backgroundColor: getSeverityColor(item.severity) }]} />
    </TouchableOpacity>
  );

  // Render stat card
  const renderStatCard = (
    icon: string,
    label: string,
    value: number,
    color: string
  ) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Icon name={icon as any} size={24} color={color} />
      <View style={styles.statInfo}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <UniversalHeader
          title="Activity Dashboard"
          showBack
          onBack={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading activity logs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <UniversalHeader
        title="Activity Dashboard"
        showBack
        onBack={() => navigation.goBack()}
        rightContent={
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton} onPress={handleExportLogs}>
              <Icon name="download-outline" size={22} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={() => setFilterModalVisible(true)}>
              <Icon name="filter-outline" size={22} color={colors.text} />
              {(filterType !== 'all' || filterSeverity !== 'all') && (
                <View style={styles.filterBadge} />
              )}
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Stats Section */}
        {stats && (
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Activity Summary</Text>
            <View style={styles.statsGrid}>
              {renderStatCard('time-outline', 'Total Logs', stats.total, colors.primary)}
              {renderStatCard('today-outline', 'Today', stats.today, '#10B981')}
              {renderStatCard('warning-outline', 'Warnings', stats.bySeverity.warning || 0, '#F59E0B')}
              {renderStatCard('alert-circle-outline', 'Critical', stats.bySeverity.critical || 0, '#EF4444')}
            </View>
          </View>
        )}

        {/* Quick Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickFilters}
          contentContainerStyle={styles.quickFiltersContent}
        >
          {severities.map((sev) => (
            <TouchableOpacity
              key={sev.value}
              style={[
                styles.quickFilterChip,
                filterSeverity === sev.value && { backgroundColor: sev.color + '20', borderColor: sev.color },
              ]}
              onPress={() => setFilterSeverity(sev.value)}
            >
              <View style={[styles.chipDot, { backgroundColor: sev.color }]} />
              <Text style={[
                styles.quickFilterText,
                filterSeverity === sev.value && { color: sev.color },
              ]}>
                {sev.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Activity List */}
        <View style={styles.activitySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={handleClearOldLogs}>
              <Text style={styles.clearButton}>Clear Old</Text>
            </TouchableOpacity>
          </View>

          {activities.length > 0 ? (
            <FlatList
              data={activities}
              keyExtractor={(item) => item.id}
              renderItem={renderActivityItem}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          ) : (
            <View style={styles.emptyState}>
              <Icon name="document-text-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No activities found</Text>
              <Text style={styles.emptySubtext}>
                {filterType !== 'all' || filterSeverity !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Activity logs will appear here'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Activity Details</Text>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedActivity && (
              <ScrollView style={styles.detailContent}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Action Type</Text>
                  <View style={styles.detailValueRow}>
                    <Icon
                      name={getActionIcon(selectedActivity.action_type) as any}
                      size={16}
                      color={colors.primary}
                    />
                    <Text style={styles.detailValue}>
                      {selectedActivity.action_type.replace(/_/g, ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Entity Type</Text>
                  <Text style={styles.detailValue}>{selectedActivity.entity_type}</Text>
                </View>

                {selectedActivity.entity_id && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Entity ID</Text>
                    <Text style={styles.detailValueMono}>{selectedActivity.entity_id}</Text>
                  </View>
                )}

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Description</Text>
                  <Text style={styles.detailValue}>{selectedActivity.description}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Timestamp</Text>
                  <Text style={styles.detailValue}>
                    {new Date(selectedActivity.timestamp).toLocaleString()}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Severity</Text>
                  <View style={[
                    styles.severityBadge,
                    { backgroundColor: getSeverityColor(selectedActivity.severity) + '20' }
                  ]}>
                    <View style={[
                      styles.severityBadgeDot,
                      { backgroundColor: getSeverityColor(selectedActivity.severity) }
                    ]} />
                    <Text style={[
                      styles.severityBadgeText,
                      { color: getSeverityColor(selectedActivity.severity) }
                    ]}>
                      {selectedActivity.severity.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {Object.keys(selectedActivity.metadata).length > 0 && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Metadata</Text>
                    <View style={styles.metadataContainer}>
                      <Text style={styles.metadataText}>
                        {JSON.stringify(selectedActivity.metadata, null, 2)}
                      </Text>
                    </View>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Activities</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterContent}>
              <Text style={styles.filterSectionTitle}>Action Type</Text>
              {actionTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.filterOption,
                    filterType === type.value && styles.filterOptionActive,
                  ]}
                  onPress={() => setFilterType(type.value)}
                >
                  <Icon
                    name={type.icon as any}
                    size={20}
                    color={filterType === type.value ? colors.primary : colors.textSecondary}
                  />
                  <Text style={[
                    styles.filterOptionText,
                    filterType === type.value && styles.filterOptionTextActive,
                  ]}>
                    {type.label}
                  </Text>
                  {filterType === type.value && (
                    <Icon name="checkmark-circle" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}

              <Text style={[styles.filterSectionTitle, { marginTop: 20 }]}>Severity</Text>
              {severities.map((sev) => (
                <TouchableOpacity
                  key={sev.value}
                  style={[
                    styles.filterOption,
                    filterSeverity === sev.value && styles.filterOptionActive,
                  ]}
                  onPress={() => setFilterSeverity(sev.value)}
                >
                  <View style={[styles.filterSeverityDot, { backgroundColor: sev.color }]} />
                  <Text style={[
                    styles.filterOptionText,
                    filterSeverity === sev.value && styles.filterOptionTextActive,
                  ]}>
                    {sev.label}
                  </Text>
                  {filterSeverity === sev.value && (
                    <Icon name="checkmark-circle" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.filterActions}>
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => {
                  setFilterType('all');
                  setFilterSeverity('all');
                }}
              >
                <Text style={styles.clearFiltersText}>Clear Filters</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyFiltersButton}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={styles.applyFiltersText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  quickFilters: {
    marginBottom: 16,
  },
  quickFiltersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  quickFilterText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  activitySection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  clearButton: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
  },
  activityLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    lineHeight: 20,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  entityBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    backgroundColor: colors.primary + '15',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  activityTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  severityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
  separator: {
    height: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  detailContent: {
    padding: 20,
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  detailValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailValueMono: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: colors.primary,
    backgroundColor: colors.primary + '15',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  severityBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  severityBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  metadataContainer: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
  },
  metadataText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: colors.textSecondary,
    lineHeight: 18,
  },
  filterContent: {
    padding: 20,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: colors.surface,
    marginBottom: 8,
  },
  filterOptionActive: {
    backgroundColor: colors.primary + '15',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  filterOptionText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  filterOptionTextActive: {
    fontWeight: '600',
    color: colors.primary,
  },
  filterSeverityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  filterActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  clearFiltersButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  clearFiltersText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  applyFiltersButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  applyFiltersText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default AdminActivityDashboardScreen;

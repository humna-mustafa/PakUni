/**
 * Admin System Health Screen
 * Real-time monitoring of Turso database, cache status, and system health
 * Enterprise-level diagnostic tools
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
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { logger } from '../../utils/logger';
import {
  tursoAdminService,
  DatabaseHealth,
  TursoStats,
  TableStatus,
} from '../../services/tursoAdmin';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// Component
// ============================================================================

const AdminSystemHealthScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<any>();

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [health, setHealth] = useState<DatabaseHealth | null>(null);
  const [stats, setStats] = useState<TursoStats | null>(null);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [clearCacheInProgress, setClearCacheInProgress] = useState(false);
  const [healthCheckInterval, setHealthCheckInterval] = useState<NodeJS.Timeout | null>(null);

  // ============================================================================
  // Data Fetching
  // ============================================================================

  const fetchHealthData = useCallback(async () => {
    try {
      const [healthResult, statsResult] = await Promise.all([
        tursoAdminService.getDatabaseHealth(),
        tursoAdminService.getTursoStats(),
      ]);
      setHealth(healthResult);
      setStats(statsResult);
    } catch (error) {
      logger.error('Error fetching health data', error, 'SystemHealth');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHealthData();
    
    // Auto-refresh every 10 seconds for real-time monitoring
    const interval = setInterval(fetchHealthData, 10000);
    setHealthCheckInterval(interval);
    
    return () => {
      if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
      }
      clearInterval(interval);
    };
  }, [fetchHealthData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHealthData();
  }, [fetchHealthData]);

  // ============================================================================
  // Actions
  // ============================================================================

  const handleSyncAll = useCallback(async () => {
    setSyncInProgress(true);
    try {
      const result = await tursoAdminService.refreshAllData();
      if (result.success) {
        Alert.alert(
          'Sync Complete',
          `Successfully synced ${result.tablesRefreshed.length} tables in ${result.duration}ms`,
          [{ text: 'OK' }]
        );
        fetchHealthData();
      } else {
        Alert.alert('Sync Warning', `Completed with errors:\n${result.errors.join('\n')}`);
      }
    } catch (error) {
      Alert.alert('Sync Failed', 'Failed to sync data. Please try again.');
    } finally {
      setSyncInProgress(false);
    }
  }, [fetchHealthData]);

  const handleClearCache = useCallback(async () => {
    Alert.alert(
      'Clear All Cache',
      'This will clear all cached Turso data. Users will need to fetch data again. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Cache',
          style: 'destructive',
          onPress: async () => {
            setClearCacheInProgress(true);
            try {
              const result = await tursoAdminService.clearAllCache();
              if (result.success) {
                Alert.alert('Cache Cleared', `Cleared ${result.keysCleared} cache entries`);
                fetchHealthData();
              } else {
                Alert.alert('Error', 'Failed to clear cache');
              }
            } catch (error) {
              Alert.alert('Error', 'An unexpected error occurred');
            } finally {
              setClearCacheInProgress(false);
            }
          },
        },
      ]
    );
  }, [fetchHealthData]);

  const handleRunDiagnostics = useCallback(async () => {
    Alert.alert(
      'Running Diagnostics',
      'Checking all system components...',
      [{ text: 'OK' }]
    );
    await fetchHealthData();
    
    if (health) {
      const issues: string[] = [];
      
      if (!health.isConnected) {
        issues.push('❌ Database connection failed');
      }
      if (health.latencyMs > 500) {
        issues.push(`⚠️ High latency detected: ${health.latencyMs}ms`);
      }
      if (health.cacheHealth.hitRate < 50) {
        issues.push(`⚠️ Low cache hit rate: ${health.cacheHealth.hitRate.toFixed(1)}%`);
      }
      
      const errorTables = health.tablesStatus.filter(t => t.status === 'error');
      if (errorTables.length > 0) {
        issues.push(`❌ ${errorTables.length} table(s) have errors`);
      }
      
      const warningTables = health.tablesStatus.filter(t => t.status === 'warning');
      if (warningTables.length > 0) {
        issues.push(`⚠️ ${warningTables.length} table(s) are empty`);
      }

      if (issues.length === 0) {
        Alert.alert('Diagnostics Complete', '✅ All systems operational\n\nNo issues detected.');
      } else {
        Alert.alert('Diagnostics Complete', `Issues Found:\n\n${issues.join('\n')}`);
      }
    }
  }, [health, fetchHealthData]);

  // ============================================================================
  // Render Functions
  // ============================================================================

  const renderHeader = () => (
    <LinearGradient
      colors={isDark ? ['#1a1a2e', '#16213e'] : ['#00D4AA', '#00A388']}
      style={styles.header}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>System Health</Text>
        <Text style={styles.headerSubtitle}>Real-time Monitoring</Text>
      </View>
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={onRefresh}
      >
        <Icon name="refresh" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </LinearGradient>
  );

  const renderOverallStatus = () => {
    const isHealthy = health?.isConnected && 
                      health.latencyMs < 500 && 
                      stats?.databaseStatus === 'connected';

    return (
      <View style={[styles.overallStatusCard, { backgroundColor: colors.card }]}>
        <View style={[
          styles.statusIndicatorLarge,
          { backgroundColor: isHealthy ? '#00D4AA' : '#E74C3C' }
        ]}>
          <Icon
            name={isHealthy ? 'checkmark' : 'close'}
            size={40}
            color="#FFFFFF"
          />
        </View>
        <Text style={[styles.overallStatusText, { color: colors.text }]}>
          {isHealthy ? 'All Systems Operational' : 'Issues Detected'}
        </Text>
        <Text style={[styles.overallStatusSubtext, { color: colors.textSecondary }]}>
          Last checked: {health?.lastChecked 
            ? new Date(health.lastChecked).toLocaleTimeString() 
            : 'Never'}
        </Text>
      </View>
    );
  };

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <TouchableOpacity
        style={[styles.quickAction, { backgroundColor: colors.card }]}
        onPress={handleSyncAll}
        disabled={syncInProgress}
      >
        {syncInProgress ? (
          <ActivityIndicator size="small" color="#00D4AA" />
        ) : (
          <MaterialIcon name="database-sync" size={24} color="#00D4AA" />
        )}
        <Text style={[styles.quickActionText, { color: colors.text }]}>
          {syncInProgress ? 'Syncing...' : 'Sync All'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.quickAction, { backgroundColor: colors.card }]}
        onPress={handleClearCache}
        disabled={clearCacheInProgress}
      >
        {clearCacheInProgress ? (
          <ActivityIndicator size="small" color="#FF6B6B" />
        ) : (
          <MaterialIcon name="broom" size={24} color="#FF6B6B" />
        )}
        <Text style={[styles.quickActionText, { color: colors.text }]}>
          {clearCacheInProgress ? 'Clearing...' : 'Clear Cache'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.quickAction, { backgroundColor: colors.card }]}
        onPress={handleRunDiagnostics}
      >
        <MaterialIcon name="stethoscope" size={24} color="#9B59B6" />
        <Text style={[styles.quickActionText, { color: colors.text }]}>Diagnose</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMetrics = () => {
    if (!health) return null;

    const metrics = [
      {
        label: 'Latency',
        value: `${health.latencyMs}ms`,
        icon: 'speedometer',
        color: health.latencyMs < 100 ? '#00D4AA' : health.latencyMs < 500 ? '#FFD93D' : '#E74C3C',
        status: health.latencyMs < 100 ? 'Excellent' : health.latencyMs < 500 ? 'Good' : 'Slow',
      },
      {
        label: 'Cache Size',
        value: `${(health.storageUsed / 1024).toFixed(1)}KB`,
        icon: 'save',
        color: '#4D96FF',
        status: health.storageUsed > 0 ? 'Active' : 'Empty',
      },
      {
        label: 'Hit Rate',
        value: `${health.cacheHealth.hitRate.toFixed(1)}%`,
        icon: 'trending-up',
        color: health.cacheHealth.hitRate > 70 ? '#00D4AA' : health.cacheHealth.hitRate > 40 ? '#FFD93D' : '#E74C3C',
        status: health.cacheHealth.hitRate > 70 ? 'Optimal' : health.cacheHealth.hitRate > 40 ? 'Fair' : 'Poor',
      },
      {
        label: 'Cache Keys',
        value: `${health.cacheHealth.cacheKeys.length}`,
        icon: 'key',
        color: '#9B59B6',
        status: 'Entries',
      },
    ];

    return (
      <View style={styles.metricsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Performance Metrics</Text>
        <View style={styles.metricsGrid}>
          {metrics.map((metric, index) => (
            <View key={index} style={[styles.metricCard, { backgroundColor: colors.card }]}>
              <View style={[styles.metricIcon, { backgroundColor: metric.color + '20' }]}>
                <Icon name={metric.icon} size={22} color={metric.color} />
              </View>
              <Text style={[styles.metricValue, { color: colors.text }]}>{metric.value}</Text>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{metric.label}</Text>
              <View style={[styles.metricStatusBadge, { backgroundColor: metric.color + '20' }]}>
                <Text style={[styles.metricStatusText, { color: metric.color }]}>{metric.status}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderDatabaseStats = () => {
    if (!stats) return null;

    const dbStats = [
      { label: 'Universities', value: stats.totalUniversities, icon: 'school', color: '#00D4AA' },
      { label: 'Scholarships', value: stats.totalScholarships, icon: 'ribbon', color: '#FFD93D' },
      { label: 'Entry Tests', value: stats.totalEntryTests, icon: 'document-text', color: '#6BCB77' },
      { label: 'Programs', value: stats.totalPrograms, icon: 'library', color: '#4D96FF' },
      { label: 'Careers', value: stats.totalCareers, icon: 'briefcase', color: '#9B59B6' },
      { label: 'Deadlines', value: stats.totalDeadlines, icon: 'calendar', color: '#FF6B6B' },
      { label: 'Merit Formulas', value: stats.totalMeritFormulas, icon: 'calculator', color: '#1ABC9C' },
      { label: 'Merit Archive', value: stats.totalMeritArchive, icon: 'archive', color: '#E67E22' },
    ];

    const totalRecords = Object.values(stats)
      .filter(v => typeof v === 'number' && v > 0)
      .reduce((a, b) => a + (b as number), 0);

    return (
      <View style={styles.statsSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Database Statistics</Text>
          <View style={[styles.totalBadge, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.totalBadgeText, { color: colors.primary }]}>
              {totalRecords.toLocaleString()} total
            </Text>
          </View>
        </View>
        <View style={styles.statsGrid}>
          {dbStats.map((stat, index) => (
            <View key={index} style={[styles.statItem, { backgroundColor: colors.card }]}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                <Icon name={stat.icon} size={18} color={stat.color} />
              </View>
              <View style={styles.statContent}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {stat.value.toLocaleString()}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  {stat.label}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderTableStatus = () => {
    if (!health?.tablesStatus?.length) return null;

    const getStatusIcon = (status: TableStatus['status']) => {
      switch (status) {
        case 'healthy':
          return { name: 'checkmark-circle', color: '#00D4AA' };
        case 'warning':
          return { name: 'warning', color: '#FFD93D' };
        case 'error':
          return { name: 'close-circle', color: '#E74C3C' };
        default:
          return { name: 'help-circle', color: colors.textSecondary };
      }
    };

    const healthyCount = health.tablesStatus.filter(t => t.status === 'healthy').length;
    const warningCount = health.tablesStatus.filter(t => t.status === 'warning').length;
    const errorCount = health.tablesStatus.filter(t => t.status === 'error').length;

    return (
      <View style={[styles.tableStatusSection, { backgroundColor: colors.card }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Table Status</Text>
          <View style={styles.statusSummary}>
            <View style={[styles.summaryBadge, { backgroundColor: '#00D4AA20' }]}>
              <Text style={[styles.summaryText, { color: '#00D4AA' }]}>{healthyCount}</Text>
            </View>
            {warningCount > 0 && (
              <View style={[styles.summaryBadge, { backgroundColor: '#FFD93D20' }]}>
                <Text style={[styles.summaryText, { color: '#FFD93D' }]}>{warningCount}</Text>
              </View>
            )}
            {errorCount > 0 && (
              <View style={[styles.summaryBadge, { backgroundColor: '#E74C3C20' }]}>
                <Text style={[styles.summaryText, { color: '#E74C3C' }]}>{errorCount}</Text>
              </View>
            )}
          </View>
        </View>

        {health.tablesStatus.map((table, index) => {
          const statusIcon = getStatusIcon(table.status);
          return (
            <View key={index} style={styles.tableRow}>
              <Icon name={statusIcon.name} size={18} color={statusIcon.color} />
              <View style={styles.tableInfo}>
                <Text style={[styles.tableName, { color: colors.text }]}>
                  {table.name.replace(/_/g, ' ')}
                </Text>
                {table.message && (
                  <Text style={[styles.tableMessage, { color: colors.textSecondary }]}>
                    {table.message}
                  </Text>
                )}
              </View>
              <Text style={[styles.tableCount, { color: colors.textSecondary }]}>
                {table.rowCount.toLocaleString()} rows
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderCacheStatus = () => {
    if (!stats) return null;

    const getCacheStatusConfig = () => {
      switch (stats.cacheStatus) {
        case 'fresh':
          return { icon: 'checkmark-circle', color: '#00D4AA', label: 'Fresh', desc: 'Cache is up to date' };
        case 'stale':
          return { icon: 'time', color: '#FFD93D', label: 'Stale', desc: 'Consider refreshing' };
        case 'expired':
          return { icon: 'alert-circle', color: '#E74C3C', label: 'Expired', desc: 'Refresh recommended' };
        default:
          return { icon: 'help-circle', color: colors.textSecondary, label: 'Unknown', desc: 'Status unknown' };
      }
    };

    const config = getCacheStatusConfig();

    return (
      <View style={[styles.cacheStatusSection, { backgroundColor: colors.card }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Cache Status</Text>
        </View>

        <View style={styles.cacheStatusContent}>
          <View style={[styles.cacheStatusIcon, { backgroundColor: config.color + '20' }]}>
            <Icon name={config.icon} size={36} color={config.color} />
          </View>
          <View style={styles.cacheStatusInfo}>
            <Text style={[styles.cacheStatusLabel, { color: config.color }]}>{config.label}</Text>
            <Text style={[styles.cacheStatusDesc, { color: colors.textSecondary }]}>{config.desc}</Text>
          </View>
        </View>

        <View style={styles.cacheDetails}>
          <View style={styles.cacheDetailRow}>
            <Text style={[styles.cacheDetailLabel, { color: colors.textSecondary }]}>Last Sync</Text>
            <Text style={[styles.cacheDetailValue, { color: colors.text }]}>
              {stats.lastSync ? new Date(stats.lastSync).toLocaleString() : 'Never'}
            </Text>
          </View>
          <View style={styles.cacheDetailRow}>
            <Text style={[styles.cacheDetailLabel, { color: colors.textSecondary }]}>Database Status</Text>
            <View style={styles.dbStatusContainer}>
              <View style={[
                styles.dbStatusDot,
                { backgroundColor: stats.databaseStatus === 'connected' ? '#00D4AA' : '#E74C3C' }
              ]} />
              <Text style={[styles.cacheDetailValue, { color: colors.text }]}>
                {stats.databaseStatus === 'connected' ? 'Connected' : 'Disconnected'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // ============================================================================
  // Loading State
  // ============================================================================

  if (loading && !health) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Checking system health...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderOverallStatus()}
        {renderQuickActions()}
        {renderMetrics()}
        {renderCacheStatus()}
        {renderDatabaseStats()}
        {renderTableStatus()}
        
        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },

  // Overall Status
  overallStatusCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusIndicatorLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  overallStatusText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  overallStatusSubtext: {
    fontSize: 13,
  },

  // Quick Actions
  quickActionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Sections
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },

  // Metrics
  metricsSection: {
    marginBottom: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: (SCREEN_WIDTH - 44) / 2,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  metricLabel: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 10,
  },
  metricStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  metricStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Database Stats
  statsSection: {
    marginBottom: 20,
  },
  totalBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  totalBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statItem: {
    width: (SCREEN_WIDTH - 42) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    gap: 12,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // Table Status
  tableStatusSection: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  statusSummary: {
    flexDirection: 'row',
    gap: 6,
  },
  summaryBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    gap: 12,
  },
  tableInfo: {
    flex: 1,
  },
  tableName: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  tableMessage: {
    fontSize: 11,
    marginTop: 2,
  },
  tableCount: {
    fontSize: 12,
  },

  // Cache Status
  cacheStatusSection: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  cacheStatusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cacheStatusIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cacheStatusInfo: {},
  cacheStatusLabel: {
    fontSize: 20,
    fontWeight: '700',
  },
  cacheStatusDesc: {
    fontSize: 13,
    marginTop: 4,
  },
  cacheDetails: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    paddingTop: 14,
  },
  cacheDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  cacheDetailLabel: {
    fontSize: 13,
  },
  cacheDetailValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  dbStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dbStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  footer: {
    height: 40,
  },
});

export default AdminSystemHealthScreen;

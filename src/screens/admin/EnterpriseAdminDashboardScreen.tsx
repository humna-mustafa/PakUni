/**
 * Enterprise Admin Dashboard Screen
 * Production-grade admin panel with comprehensive Turso integration
 * Real-time statistics, health monitoring, and quick actions
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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { logger } from '../../utils/logger';
import { TYPOGRAPHY } from '../../constants/design';
import { tursoAdminService, TursoStats, DatabaseHealth } from '../../services/tursoAdmin';
import { adminService } from '../../services/admin';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Extract admin screen names from RootStackParamList for type safety
type AdminScreenName = Extract<keyof RootStackParamList, `Admin${string}`>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

// ============================================================================
// Types
// ============================================================================

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  iconSet: 'ion' | 'material';
  screen: AdminScreenName;
  color: string;
  badge?: number;
  description: string;
}

interface SystemStatus {
  turso: 'online' | 'offline' | 'degraded' | 'checking';
  supabase: 'online' | 'offline' | 'degraded' | 'checking';
  cache: 'fresh' | 'stale' | 'expired' | 'unknown';
  lastSync: string | null;
}

// ============================================================================
// Component
// ============================================================================

// Helper functions for status display
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'online':
    case 'fresh':
      return '#10B981'; // Green
    case 'offline':
    case 'expired':
      return '#EF4444'; // Red
    case 'degraded':
    case 'stale':
      return '#F59E0B'; // Amber
    case 'checking':
      return '#6B7280'; // Gray
    default:
      return '#6B7280'; // Gray
  }
};

const getStatusIcon = (status: string): string => {
  switch (status) {
    case 'online':
    case 'fresh':
      return 'checkmark-circle';
    case 'offline':
    case 'expired':
      return 'close-circle';
    case 'degraded':
    case 'stale':
      return 'warning';
    case 'checking':
      return 'ellipsis-horizontal-circle';
    default:
      return 'help-circle';
  }
};

const EnterpriseAdminDashboardScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tursoStats, setTursoStats] = useState<TursoStats | null>(null);
  const [dbHealth, setDbHealth] = useState<DatabaseHealth | null>(null);
  const [supabaseStats, setSupabaseStats] = useState<any>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    turso: 'checking', // New: show 'checking' while loading
    supabase: 'checking',
    cache: 'unknown',
    lastSync: null,
  });
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [tursoError, setTursoError] = useState<string | null>(null);

  // ============================================================================
  // Data Fetching
  // ============================================================================

  const fetchAllData = useCallback(async () => {
    setTursoError(null);
    try {
      // Fetch Turso stats and health in parallel
      const [tursoStatsResult, healthResult, supabaseStatsResult] = await Promise.all([
        tursoAdminService.getTursoStats(),
        tursoAdminService.getDatabaseHealth(),
        adminService.getDashboardStats(),
      ]);

      setTursoStats(tursoStatsResult);
      setDbHealth(healthResult);
      setSupabaseStats(supabaseStatsResult);

      // Update system status
      setSystemStatus({
        turso: tursoStatsResult.databaseStatus === 'connected' ? 'online' : 'offline',
        supabase: supabaseStatsResult ? 'online' : 'offline',
        cache: tursoStatsResult.cacheStatus,
        lastSync: tursoStatsResult.lastSync,
      });
      
      // Clear any previous errors - bundled data is always available
      setTursoError(null);
    } catch (error) {
      logger.error('Error fetching data', error, 'EnterpriseAdmin');
      // Even on error, bundled data should work - don't show scary errors
      setSystemStatus((prev) => ({ ...prev, turso: 'degraded' }));
      setTursoError(null); // Don't show error - bundled data works
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch on mount - no auto-refresh to save Turso free tier limits
    // Use pull-to-refresh or refresh button for manual updates
    fetchAllData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAllData();
  }, [fetchAllData]);

  // ============================================================================
  // Actions
  // ============================================================================

  const handleSyncData = useCallback(async () => {
    setSyncInProgress(true);
    try {
      const result = await tursoAdminService.refreshAllData();
      if (result.success) {
        Alert.alert(
          'Sync Complete',
          `Successfully synced ${result.tablesRefreshed.length} tables in ${result.duration}ms`,
          [{ text: 'OK' }]
        );
        fetchAllData();
      } else {
        Alert.alert(
          'Sync Errors',
          result.errors.join('\n'),
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Sync Failed', 'Failed to sync data. Please try again.');
    } finally {
      setSyncInProgress(false);
    }
  }, [fetchAllData]);

  const handleClearCache = useCallback(async () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Users will need to fetch data again. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            const result = await tursoAdminService.clearAllCache();
            if (result.success) {
              Alert.alert('Cache Cleared', `Cleared ${result.keysCleared} cache entries`);
              fetchAllData();
            }
          },
        },
      ]
    );
  }, [fetchAllData]);

  // ============================================================================
  // Quick Actions
  // ============================================================================

  // Primary Quick Actions - Most used admin features
  const quickActions: QuickAction[] = [
    // === DATABASE MANAGEMENT ===
    {
      id: 'turso-data',
      title: 'Turso Data',
      icon: 'database',
      iconSet: 'material',
      screen: 'AdminTursoDataManagement',
      color: '#00D4AA',
      description: 'Universities, Scholarships, Careers',
    },
    {
      id: 'supabase-data',
      title: 'Data Export',
      icon: 'download-outline',
      iconSet: 'ion',
      screen: 'AdminDataManagement',
      color: '#4573DF',
      description: 'Export, Merit Lists, Entry Tests',
    },
    // === USER MANAGEMENT ===
    {
      id: 'users',
      title: 'Users',
      icon: 'people',
      iconSet: 'ion',
      screen: 'AdminUsers',
      color: '#4ECDC4',
      badge: supabaseStats?.totalUsers,
      description: 'User management',
    },
    // === NOTIFICATIONS ===
    {
      id: 'turso-notifications',
      title: 'Notifications',
      icon: 'notifications',
      iconSet: 'ion',
      screen: 'AdminTursoNotifications',
      color: '#FF6B6B',
      description: 'Turso notifications',
    },
    {
      id: 'push-notifications',
      title: 'Push Notify',
      icon: 'send',
      iconSet: 'ion',
      screen: 'AdminNotifications',
      color: '#4573DF',
      description: 'Push notifications',
    },
    // === CONTENT & REPORTS ===
    {
      id: 'content',
      title: 'Content',
      icon: 'document-text',
      iconSet: 'ion',
      screen: 'AdminContent',
      color: '#4573DF',
      description: 'Manage app content',
    },
    {
      id: 'reports',
      title: 'Reports',
      icon: 'flag',
      iconSet: 'ion',
      screen: 'AdminReports',
      color: '#E74C3C',
      badge: supabaseStats?.pendingReports,
      description: 'Content reports',
    },
    {
      id: 'error-reports',
      title: 'Errors',
      icon: 'bug',
      iconSet: 'ion',
      screen: 'AdminErrorReports',
      color: '#DC2626',
      description: 'Error tracking',
    },
    // === MONITORING ===
    {
      id: 'health',
      title: 'System Health',
      icon: 'heart-pulse',
      iconSet: 'material',
      screen: 'AdminSystemHealth',
      color: '#10B981',
      description: 'Database monitoring',
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: 'analytics',
      iconSet: 'ion',
      screen: 'AdminAnalytics',
      color: '#9B59B6',
      description: 'App analytics',
    },
    // === COMMUNICATION ===
    {
      id: 'feedback',
      title: 'Feedback',
      icon: 'chatbubbles',
      iconSet: 'ion',
      screen: 'AdminFeedback',
      color: '#4573DF',
      description: 'User feedback',
    },
    {
      id: 'announcements',
      title: 'Announcements',
      icon: 'megaphone',
      iconSet: 'ion',
      screen: 'AdminAnnouncements',
      color: '#F39C12',
      description: 'App announcements',
    },
    // === SYSTEM ===
    {
      id: 'settings',
      title: 'Settings',
      icon: 'settings',
      iconSet: 'ion',
      screen: 'AdminSettings',
      color: '#95A5A6',
      description: 'App configuration',
    },
    {
      id: 'audit',
      title: 'Audit Logs',
      icon: 'file-document',
      iconSet: 'material',
      screen: 'AdminAuditLogs',
      color: '#1ABC9C',
      description: 'Activity history',
    },
    // === ADVANCED FEATURES ===
    {
      id: 'bulk-operations',
      title: 'Bulk Actions',
      icon: 'layers',
      iconSet: 'ion',
      screen: 'AdminBulkOperations',
      color: '#4573DF',
      description: 'Bulk user & content ops',
    },
    {
      id: 'app-config',
      title: 'App Config',
      icon: 'options',
      iconSet: 'ion',
      screen: 'AdminAppConfig',
      color: '#059669',
      description: 'Feature flags & settings',
    },
    {
      id: 'activity',
      title: 'Activity',
      icon: 'pulse',
      iconSet: 'ion',
      screen: 'AdminActivityDashboard',
      color: '#4573DF',
      description: 'Real-time activity logs',
    },
    {
      id: 'moderation',
      title: 'Moderation',
      icon: 'shield-checkmark',
      iconSet: 'ion',
      screen: 'AdminContentModeration',
      color: '#D97706',
      description: 'Content review queue',
    },
    // === DATA MANAGEMENT & APPROVAL WORKFLOW ===
    {
      id: 'data-submissions',
      title: 'Submissions',
      icon: 'document-attach',
      iconSet: 'ion',
      screen: 'AdminDataSubmissions',
      color: '#4573DF',
      description: 'User data corrections',
    },
    {
      id: 'merit-deadlines',
      title: 'Merit & Dates',
      icon: 'trophy',
      iconSet: 'ion',
      screen: 'AdminMeritDeadlines',
      color: '#F59E0B',
      description: 'Merit lists & deadlines',
    },
    {
      id: 'notification-triggers',
      title: 'Triggers',
      icon: 'notifications-circle',
      iconSet: 'ion',
      screen: 'AdminNotificationTriggers',
      color: '#EF4444',
      description: 'Auto notifications',
    },
  ];

  // ============================================================================
  // Render Functions
  // ============================================================================

  const renderSystemStatus = () => {
    return (
      <View style={[styles.statsSection, { backgroundColor: colors.card, padding: 16, borderRadius: 16, marginBottom: 20 }]}> 
        <Text style={[styles.sectionTitle, { color: colors.text }]}>System Status</Text>

        {/* Error message if Turso unreachable */}
        {tursoError && (
          <View style={{ backgroundColor: '#FFEAEA', padding: 10, borderRadius: 8, marginBottom: 10 }}>
            <Text style={{ color: '#E74C3C', fontWeight: 'bold' }}>{tursoError}</Text>
          </View>
        )}

        <View style={styles.statusGrid}>
          {/* Turso Status */}
          <View style={styles.statusItem}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(systemStatus.turso) }]} />
            <Icon name={getStatusIcon(systemStatus.turso)} size={20} color={getStatusColor(systemStatus.turso)} />
            <Text style={[styles.statusLabel, { color: colors.text }]}>Turso</Text>
            <Text style={[styles.statusValue, { color: getStatusColor(systemStatus.turso) }]}>
              {systemStatus.turso === 'checking' ? 'CHECKING...' : systemStatus.turso.toUpperCase()}
            </Text>
          </View>

          {/* Supabase Status */}
          <View style={styles.statusItem}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(systemStatus.supabase) }]} />
            <Icon name={getStatusIcon(systemStatus.supabase)} size={20} color={getStatusColor(systemStatus.supabase)} />
            <Text style={[styles.statusLabel, { color: colors.text }]}>Supabase</Text>
            <Text style={[styles.statusValue, { color: getStatusColor(systemStatus.supabase) }]}>
              {systemStatus.supabase === 'checking' ? 'CHECKING...' : systemStatus.supabase.toUpperCase()}
            </Text>
          </View>

          {/* Cache Status */}
          <View style={styles.statusItem}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(systemStatus.cache) }]} />
            <MaterialIcon name="database-cog" size={20} color={getStatusColor(systemStatus.cache)} />
            <Text style={[styles.statusLabel, { color: colors.text }]}>Cache</Text>
            <Text style={[styles.statusValue, { color: getStatusColor(systemStatus.cache) }]}>
              {systemStatus.cache.toUpperCase()}
            </Text>
          </View>

          {/* Last Sync */}
          <View style={styles.statusItem}>
            <View style={[styles.statusIndicator, { backgroundColor: colors.primary }]} />
            <Icon name="time" size={20} color={colors.primary} />
            <Text style={[styles.statusLabel, { color: colors.text }]}>Last Sync</Text>
            <Text style={[styles.statusValue, { color: colors.textSecondary }]} numberOfLines={1}>
              {systemStatus.lastSync 
                ? new Date(systemStatus.lastSync).toLocaleTimeString()
                : 'Never'}
            </Text>
          </View>
        </View>

        {/* DB Health Details */}
        {dbHealth && (
          <View style={styles.healthDetails}>
            <View style={styles.healthItem}>
              <Text style={[styles.healthLabel, { color: colors.textSecondary }]}>Latency</Text>
              <Text style={[styles.healthValue, { color: colors.text }]}>{dbHealth.latencyMs}ms</Text>
            </View>
            <View style={styles.healthItem}>
              <Text style={[styles.healthLabel, { color: colors.textSecondary }]}>Cache Size</Text>
              <Text style={[styles.healthValue, { color: colors.text }]}>
                {(dbHealth.storageUsed / 1024).toFixed(1)}KB
              </Text>
            </View>
            <View style={styles.healthItem}>
              <Text style={[styles.healthLabel, { color: colors.textSecondary }]}>Hit Rate</Text>
              <Text style={[styles.healthValue, { color: colors.text }]}>
                {dbHealth.cacheHealth.hitRate.toFixed(1)}%
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderTursoStats = () => {
    if (!tursoStats) {
      // Still loading or error - will show loading indicator
      return null;
    }

    const statCards = [
      { label: 'Universities', value: tursoStats.totalUniversities, icon: 'school', color: '#00D4AA' },
      { label: 'Scholarships', value: tursoStats.totalScholarships, icon: 'ribbon', color: '#FFD93D' },
      { label: 'Entry Tests', value: tursoStats.totalEntryTests, icon: 'document-text', color: '#6BCB77' },
      { label: 'Programs', value: tursoStats.totalPrograms, icon: 'library', color: '#4D96FF' },
      { label: 'Deadlines', value: tursoStats.totalDeadlines, icon: 'calendar', color: '#FF6B6B' },
      { label: 'Careers', value: tursoStats.totalCareers, icon: 'briefcase', color: '#9B59B6' },
      { label: 'Merit Formulas', value: tursoStats.totalMeritFormulas, icon: 'calculator', color: '#1ABC9C' },
      { label: 'Merit Archive', value: tursoStats.totalMeritArchive, icon: 'archive', color: '#E67E22' },
    ];

    return (
      <View style={styles.statsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Data Statistics</Text>
        <View style={styles.statsGrid}>
          {statCards.map((stat, index) => (
            <LinearGradient
              key={index}
              colors={[stat.color + '20', stat.color + '10']}
              style={[styles.statCard, { borderColor: stat.color + '40' }]}
            >
              <View style={[styles.statIconContainer, { backgroundColor: stat.color + '30' }]}>
                <Icon name={stat.icon} size={22} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stat.value.toLocaleString()}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                {stat.label}
              </Text>
            </LinearGradient>
          ))}
        </View>
      </View>
    );
  };

  const renderSupabaseStats = () => {
    if (!supabaseStats) return null;

    const userStats = [
      { label: 'Total Users', value: supabaseStats.totalUsers || 0, icon: 'people', color: '#4ECDC4' },
      { label: 'New Today', value: supabaseStats.newUsersToday || 0, icon: 'person-add', color: '#00D4AA' },
      { label: 'Verified', value: supabaseStats.verifiedUsers || 0, icon: 'checkmark-shield', color: '#4573DF' },
      { label: 'Active', value: supabaseStats.activeUsers || 0, icon: 'pulse', color: '#9B59B6' },
    ];

    return (
      <View style={styles.statsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>User Statistics</Text>
        <View style={styles.statsRow}>
          {userStats.map((stat, index) => (
            <View key={index} style={[styles.userStatCard, { backgroundColor: colors.card }]}>
              <View style={[styles.userStatIcon, { backgroundColor: stat.color + '20' }]}>
                <Icon name={stat.icon} size={20} color={stat.color} />
              </View>
              <Text style={[styles.userStatValue, { color: colors.text }]}>
                {stat.value.toLocaleString()}
              </Text>
              <Text style={[styles.userStatLabel, { color: colors.textSecondary }]}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderQuickActions = () => (
    <View style={styles.quickActionsSection}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        <TouchableOpacity
          onPress={handleClearCache}
          accessibilityRole="button"
          accessibilityLabel="Clear cache"
          accessibilityHint="Clears all cached data"
        >
          <Text style={[styles.clearCacheText, { color: colors.error }]}>Clear Cache</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.quickActionsGrid}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.quickActionCard, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate(action.screen)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${action.title}, ${action.description}${action.badge ? `, ${action.badge} pending items` : ''}`}
          >
            <View style={[styles.quickActionIconContainer, { backgroundColor: action.color + '20' }]}>
              {action.iconSet === 'ion' ? (
                <Icon name={action.icon} size={24} color={action.color} />
              ) : (
                <MaterialIcon name={action.icon} size={24} color={action.color} />
              )}
              {action.badge !== undefined && action.badge > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.error }]}>
                  <Text style={styles.badgeText}>
                    {action.badge > 99 ? '99+' : action.badge}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.quickActionTitle, { color: colors.text }]}>{action.title}</Text>
            <Text style={[styles.quickActionDesc, { color: colors.textSecondary }]} numberOfLines={1}>
              {action.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderTableHealth = () => {
    if (!dbHealth?.tablesStatus?.length) return null;

    return (
      <View style={[styles.tableHealthSection, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Table Status</Text>
        <View style={styles.tablesList}>
          {dbHealth.tablesStatus.map((table, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.tableInfo}>
                <View
                  style={[
                    styles.tableStatusDot,
                    {
                      backgroundColor:
                        table.status === 'healthy'
                          ? '#00D4AA'
                          : table.status === 'warning'
                          ? '#F39C12'
                          : '#E74C3C',
                    },
                  ]}
                />
                <Text style={[styles.tableName, { color: colors.text }]}>{table.name}</Text>
              </View>
              <Text style={[styles.tableCount, { color: colors.textSecondary }]}>
                {table.rowCount.toLocaleString()} rows
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // ============================================================================
  // Loading State
  // ============================================================================

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading admin dashboard...
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
      {/* Header */}
      <LinearGradient
        colors={isDark ? ['#1D2127', '#272C34'] : ['#00D4AA', '#00A388']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Enterprise Admin</Text>
            <Text style={styles.headerSubtitle}>
              Welcome back, {user?.fullName || 'Admin'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('AdminSettings')}
          >
            <Icon name="settings-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
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
        {renderSystemStatus()}
        {renderTursoStats()}
        {renderSupabaseStats()}
        {renderQuickActions()}
        {renderTableHealth()}

        {/* Footer Space */}
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
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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

  // System Status
  systemStatusContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  systemStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00D4AA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  syncButtonDisabled: {
    opacity: 0.7,
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontWeight: TYPOGRAPHY.weight.semibold,
    fontSize: 12,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusItem: {
    flex: 1,
    minWidth: (SCREEN_WIDTH - 80) / 4,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  statusIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 11,
    marginTop: 6,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  statusValue: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  healthDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  healthItem: {
    alignItems: 'center',
  },
  healthLabel: {
    fontSize: 11,
  },
  healthValue: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginTop: 2,
  },

  // Stats Section
  statsSection: {
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  statCard: {
    width: CARD_WIDTH,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weight.heavy,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },

  // User Stats
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  userStatCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  userStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  userStatValue: {
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  userStatLabel: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },

  // Quick Actions
  quickActionsSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearCacheText: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: (SCREEN_WIDTH - 56) / 3,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  quickActionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  quickActionTitle: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.semibold,
    textAlign: 'center',
  },
  quickActionDesc: {
    fontSize: 9,
    textAlign: 'center',
    marginTop: 2,
  },

  // Table Health
  tableHealthSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  tablesList: {
    marginTop: 12,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  tableInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tableStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tableName: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  tableCount: {
    fontSize: 12,
  },

  footer: {
    height: 40,
  },
});

export default EnterpriseAdminDashboardScreen;



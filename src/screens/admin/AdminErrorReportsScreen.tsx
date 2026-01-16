/**
 * Admin Error Reports Screen
 * View and manage error reports from users
 * 
 * Features:
 * - View all error reports with filtering
 * - Error severity and category indicators
 * - Status management (acknowledge, investigate, resolve)
 * - Device info and stack trace viewing
 * - Resolution notes and admin actions
 */

import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  RefreshControl,
  StatusBar,
  ScrollView,
  TextInput,
  Clipboard,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../../contexts/ThemeContext';
import {errorReportingService, ErrorReport, ErrorStatus, ErrorCategory, ErrorSeverity} from '../../services/errorReporting';
import {Icon} from '../../components/icons';
import {PremiumLoading} from '../../components/PremiumLoading';
import {useToast} from '../../components/PremiumToast';

// Fallback LinearGradient
let LinearGradient: React.ComponentType<any>;
try {
  LinearGradient = require('react-native-linear-gradient').default;
} catch (e) {
  LinearGradient = ({children, colors, style, ...props}: any) => (
    <View style={[style, {backgroundColor: colors?.[0] || '#1A7AEB'}]} {...props}>
      {children}
    </View>
  );
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const STATUS_CONFIG: Record<ErrorStatus, {label: string; color: string; icon: string}> = {
  new: {label: 'New', color: '#EF4444', icon: 'alert-circle'},
  acknowledged: {label: 'Acknowledged', color: '#F59E0B', icon: 'eye'},
  investigating: {label: 'Investigating', color: '#3B82F6', icon: 'search'},
  resolved: {label: 'Resolved', color: '#10B981', icon: 'checkmark-circle'},
  wont_fix: {label: "Won't Fix", color: '#6B7280', icon: 'close-circle'},
};

const SEVERITY_CONFIG: Record<ErrorSeverity, {label: string; color: string; bgColor: string}> = {
  low: {label: 'Low', color: '#10B981', bgColor: '#10B98120'},
  medium: {label: 'Medium', color: '#F59E0B', bgColor: '#F59E0B20'},
  high: {label: 'High', color: '#EF4444', bgColor: '#EF444420'},
  critical: {label: 'Critical', color: '#DC2626', bgColor: '#DC262620'},
};

const CATEGORY_CONFIG: Record<ErrorCategory, {label: string; icon: string}> = {
  network: {label: 'Network', icon: 'wifi-outline'},
  authentication: {label: 'Auth', icon: 'lock-closed-outline'},
  permission: {label: 'Permission', icon: 'shield-outline'},
  validation: {label: 'Validation', icon: 'alert-circle-outline'},
  server: {label: 'Server', icon: 'server-outline'},
  database: {label: 'Database', icon: 'folder-outline'},
  ui_crash: {label: 'UI Crash', icon: 'bug-outline'},
  navigation: {label: 'Navigation', icon: 'navigate-outline'},
  data_sync: {label: 'Sync', icon: 'sync-outline'},
  payment: {label: 'Payment', icon: 'card-outline'},
  unknown: {label: 'Unknown', icon: 'help-circle-outline'},
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AdminErrorReportsScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors, isDark} = useTheme();
  const toast = useToast();
  
  // State
  const [reports, setReports] = useState<ErrorReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<ErrorStatus | 'all'>('new');
  const [selectedSeverity, setSelectedSeverity] = useState<ErrorSeverity | 'all'>('all');
  
  // Stats
  const [stats, setStats] = useState<{
    total: number;
    newCount: number;
    criticalCount: number;
  }>({total: 0, newCount: 0, criticalCount: 0});
  
  // Detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ErrorReport | null>(null);
  
  // Action modal
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<ErrorStatus>('resolved');
  const [resolutionNotes, setResolutionNotes] = useState('');

  // -------------------------------------------------------------------------
  // DATA LOADING
  // -------------------------------------------------------------------------

  useEffect(() => {
    loadReports();
    loadStats();
  }, [selectedFilter, selectedSeverity]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const {reports: data} = await errorReportingService.getErrorReports({
        status: selectedFilter === 'all' ? undefined : selectedFilter,
        severity: selectedSeverity === 'all' ? undefined : selectedSeverity,
      });
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Failed to load error reports');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadStats = async () => {
    const data = await errorReportingService.getErrorStats();
    setStats(data);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadReports();
    loadStats();
  }, [selectedFilter, selectedSeverity]);

  // -------------------------------------------------------------------------
  // ACTIONS
  // -------------------------------------------------------------------------

  const handleViewReport = (report: ErrorReport) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const handleChangeStatus = (report: ErrorReport, status: ErrorStatus) => {
    setSelectedReport(report);
    setActionType(status);
    setResolutionNotes('');
    setShowActionModal(true);
  };

  const submitStatusChange = async () => {
    if (!selectedReport?.id) return;

    try {
      const success = await errorReportingService.updateErrorStatus(
        selectedReport.id,
        actionType,
        actionType === 'resolved' || actionType === 'wont_fix' ? resolutionNotes : undefined
      );

      if (success) {
        toast.success(`Error marked as ${STATUS_CONFIG[actionType].label}`);
        setShowActionModal(false);
        setShowDetailModal(false);
        loadReports();
        loadStats();
      } else {
        toast.error('Failed to update error status');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleDeleteReport = async (report: ErrorReport) => {
    Alert.alert(
      'Delete Error Report',
      'Are you sure you want to delete this error report? This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!report.id) return;
            const success = await errorReportingService.deleteErrorReport(report.id);
            if (success) {
              toast.success('Error report deleted');
              setShowDetailModal(false);
              loadReports();
              loadStats();
            } else {
              toast.error('Failed to delete error report');
            }
          },
        },
      ]
    );
  };

  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    toast.info(`${label} copied to clipboard`);
  };

  // -------------------------------------------------------------------------
  // RENDER HELPERS
  // -------------------------------------------------------------------------

  const renderStatsCard = () => (
    <View style={[styles.statsContainer, {backgroundColor: colors.card}]}>
      <View style={styles.statItem}>
        <Text style={[styles.statValue, {color: colors.text}]}>{stats.total}</Text>
        <Text style={[styles.statLabel, {color: colors.textSecondary}]}>Total</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={[styles.statValue, {color: '#EF4444'}]}>{stats.newCount}</Text>
        <Text style={[styles.statLabel, {color: colors.textSecondary}]}>New</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={[styles.statValue, {color: '#DC2626'}]}>{stats.criticalCount}</Text>
        <Text style={[styles.statLabel, {color: colors.textSecondary}]}>Critical</Text>
      </View>
    </View>
  );

  const renderReport = ({item}: {item: ErrorReport}) => {
    const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.new;
    const severityConfig = SEVERITY_CONFIG[item.severity] || SEVERITY_CONFIG.medium;
    const categoryConfig = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.unknown;

    return (
      <TouchableOpacity
        style={[styles.reportCard, {backgroundColor: colors.card}]}
        onPress={() => handleViewReport(item)}
        activeOpacity={0.7}>
        {/* Severity indicator */}
        <View style={[styles.severityIndicator, {backgroundColor: severityConfig.color}]} />
        
        <View style={styles.reportContent}>
          {/* Header row */}
          <View style={styles.reportHeader}>
            <View style={[styles.categoryBadge, {backgroundColor: colors.background}]}>
              <Icon name={categoryConfig.icon} family="Ionicons" size={12} color={colors.textSecondary} />
              <Text style={[styles.categoryText, {color: colors.textSecondary}]}>
                {categoryConfig.label}
              </Text>
            </View>
            <View style={[styles.statusBadge, {backgroundColor: statusConfig.color + '20'}]}>
              <Icon name={statusConfig.icon} family="Ionicons" size={10} color={statusConfig.color} />
              <Text style={[styles.statusText, {color: statusConfig.color}]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>

          {/* Error name */}
          <Text style={[styles.errorName, {color: colors.text}]} numberOfLines={1}>
            {item.error_name}
          </Text>

          {/* Error message */}
          <Text style={[styles.errorMessage, {color: colors.textSecondary}]} numberOfLines={2}>
            {item.error_message}
          </Text>

          {/* Footer row */}
          <View style={styles.reportFooter}>
            <View style={styles.footerInfo}>
              <Icon name="phone-portrait-outline" family="Ionicons" size={12} color={colors.textSecondary} />
              <Text style={[styles.footerText, {color: colors.textSecondary}]}>
                {item.device_info?.platform} {item.device_info?.os_version}
              </Text>
            </View>
            <View style={styles.footerInfo}>
              <Icon name="time-outline" family="Ionicons" size={12} color={colors.textSecondary} />
              <Text style={[styles.footerText, {color: colors.textSecondary}]}>
                {new Date(item.last_occurred_at).toLocaleDateString()}
              </Text>
            </View>
            {item.occurrence_count > 1 && (
              <View style={[styles.countBadge, {backgroundColor: severityConfig.bgColor}]}>
                <Text style={[styles.countText, {color: severityConfig.color}]}>
                  ×{item.occurrence_count}
                </Text>
              </View>
            )}
          </View>

          {/* Quick actions for new errors */}
          {item.status === 'new' && (
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={[styles.quickBtn, {backgroundColor: '#F59E0B20'}]}
                onPress={() => handleChangeStatus(item, 'acknowledged')}>
                <Icon name="eye-outline" family="Ionicons" size={14} color="#F59E0B" />
                <Text style={[styles.quickBtnText, {color: '#F59E0B'}]}>Acknowledge</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickBtn, {backgroundColor: '#10B98120'}]}
                onPress={() => handleChangeStatus(item, 'resolved')}>
                <Icon name="checkmark-outline" family="Ionicons" size={14} color="#10B981" />
                <Text style={[styles.quickBtnText, {color: '#10B981'}]}>Resolve</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // -------------------------------------------------------------------------
  // MAIN RENDER
  // -------------------------------------------------------------------------

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <LinearGradient
          colors={isDark ? ['#4C1D1D', '#1E1E2E'] : ['#EF4444', '#DC2626']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" family="Ionicons" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Error Reports</Text>
            <Text style={styles.headerSubtitle}>
              Monitor and resolve app errors
            </Text>
          </View>
          <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
            <Icon name="refresh-outline" family="Ionicons" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats Cards */}
        {renderStatsCard()}

        {/* Filters */}
        <View style={styles.filtersContainer}>
          {/* Status Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContent}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                {backgroundColor: selectedFilter === 'all' ? colors.primary + '20' : colors.card},
              ]}
              onPress={() => setSelectedFilter('all')}>
              <Text style={[
                styles.filterText,
                {color: selectedFilter === 'all' ? colors.primary : colors.textSecondary},
              ]}>
                All
              </Text>
            </TouchableOpacity>
            {(Object.keys(STATUS_CONFIG) as ErrorStatus[]).map(status => {
              const config = STATUS_CONFIG[status];
              const isSelected = selectedFilter === status;
              return (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterChip,
                    {backgroundColor: isSelected ? config.color + '20' : colors.card},
                  ]}
                  onPress={() => setSelectedFilter(status)}>
                  <Icon name={config.icon} family="Ionicons" size={12} color={isSelected ? config.color : colors.textSecondary} />
                  <Text style={[styles.filterText, {color: isSelected ? config.color : colors.textSecondary}]}>
                    {config.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Severity Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContent}>
            <Text style={[styles.filterLabel, {color: colors.textSecondary}]}>Severity:</Text>
            <TouchableOpacity
              style={[
                styles.severityChip,
                {backgroundColor: selectedSeverity === 'all' ? colors.primary + '20' : colors.card},
              ]}
              onPress={() => setSelectedSeverity('all')}>
              <Text style={[
                styles.filterText,
                {color: selectedSeverity === 'all' ? colors.primary : colors.textSecondary},
              ]}>
                All
              </Text>
            </TouchableOpacity>
            {(Object.keys(SEVERITY_CONFIG) as ErrorSeverity[]).map(severity => {
              const config = SEVERITY_CONFIG[severity];
              const isSelected = selectedSeverity === severity;
              return (
                <TouchableOpacity
                  key={severity}
                  style={[
                    styles.severityChip,
                    {backgroundColor: isSelected ? config.bgColor : colors.card},
                  ]}
                  onPress={() => setSelectedSeverity(severity)}>
                  <View style={[styles.severityDot, {backgroundColor: config.color}]} />
                  <Text style={[styles.filterText, {color: isSelected ? config.color : colors.textSecondary}]}>
                    {config.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Reports List */}
        <FlatList
          data={reports}
          renderItem={renderReport}
          keyExtractor={item => item.id || Math.random().toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListFooterComponent={
            loading && !refreshing ? (
              <PremiumLoading variant="minimal" size="small" />
            ) : null
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyState}>
                <Icon name="checkmark-circle-outline" family="Ionicons" size={64} color="#10B981" />
                <Text style={[styles.emptyTitle, {color: colors.text}]}>
                  All Clear! 🎉
                </Text>
                <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
                  No error reports to show
                </Text>
              </View>
            ) : null
          }
        />

        {/* Detail Modal */}
        <Modal visible={showDetailModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, {backgroundColor: colors.card}]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, {color: colors.text}]}>Error Details</Text>
                <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                  <Icon name="close" family="Ionicons" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {selectedReport && (
                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  {/* Status & Severity */}
                  <View style={styles.detailRow}>
                    <View style={[styles.statusBadge, {backgroundColor: STATUS_CONFIG[selectedReport.status].color + '20'}]}>
                      <Icon
                        name={STATUS_CONFIG[selectedReport.status].icon}
                        family="Ionicons"
                        size={14}
                        color={STATUS_CONFIG[selectedReport.status].color}
                      />
                      <Text style={[styles.statusText, {color: STATUS_CONFIG[selectedReport.status].color}]}>
                        {STATUS_CONFIG[selectedReport.status].label}
                      </Text>
                    </View>
                    <View style={[styles.severityBadge, {backgroundColor: SEVERITY_CONFIG[selectedReport.severity].bgColor}]}>
                      <Text style={[styles.severityText, {color: SEVERITY_CONFIG[selectedReport.severity].color}]}>
                        {SEVERITY_CONFIG[selectedReport.severity].label} Severity
                      </Text>
                    </View>
                  </View>

                  {/* Error Name */}
                  <View style={styles.detailSection}>
                    <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Error Name</Text>
                    <TouchableOpacity onPress={() => copyToClipboard(selectedReport.error_name, 'Error name')}>
                      <Text style={[styles.detailValue, {color: colors.text}]}>
                        {selectedReport.error_name}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Error Message */}
                  <View style={styles.detailSection}>
                    <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Error Message</Text>
                    <TouchableOpacity onPress={() => copyToClipboard(selectedReport.error_message, 'Error message')}>
                      <Text style={[styles.detailValueLong, {color: colors.text}]}>
                        {selectedReport.error_message}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Screen Name */}
                  {selectedReport.screen_name && (
                    <View style={styles.detailSection}>
                      <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Screen</Text>
                      <Text style={[styles.detailValue, {color: colors.text}]}>
                        {selectedReport.screen_name}
                      </Text>
                    </View>
                  )}

                  {/* User Feedback */}
                  {selectedReport.user_feedback && (
                    <View style={[styles.feedbackBox, {backgroundColor: colors.primary + '10'}]}>
                      <View style={styles.feedbackHeader}>
                        <Icon name="chatbubble-outline" family="Ionicons" size={16} color={colors.primary} />
                        <Text style={[styles.feedbackTitle, {color: colors.primary}]}>User Feedback</Text>
                      </View>
                      <Text style={[styles.feedbackText, {color: colors.text}]}>
                        {selectedReport.user_feedback}
                      </Text>
                    </View>
                  )}

                  {/* Device Info */}
                  <View style={styles.detailSection}>
                    <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Device Info</Text>
                    <View style={[styles.deviceInfoBox, {backgroundColor: colors.background}]}>
                      <View style={styles.deviceInfoRow}>
                        <Text style={[styles.deviceInfoLabel, {color: colors.textSecondary}]}>Platform</Text>
                        <Text style={[styles.deviceInfoValue, {color: colors.text}]}>
                          {selectedReport.device_info?.platform} {selectedReport.device_info?.os_version}
                        </Text>
                      </View>
                      <View style={styles.deviceInfoRow}>
                        <Text style={[styles.deviceInfoLabel, {color: colors.textSecondary}]}>Device</Text>
                        <Text style={[styles.deviceInfoValue, {color: colors.text}]}>
                          {selectedReport.device_info?.device_brand} {selectedReport.device_info?.device_model}
                        </Text>
                      </View>
                      <View style={styles.deviceInfoRow}>
                        <Text style={[styles.deviceInfoLabel, {color: colors.textSecondary}]}>App Version</Text>
                        <Text style={[styles.deviceInfoValue, {color: colors.text}]}>
                          {selectedReport.app_version} ({selectedReport.device_info?.build_number})
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Occurrence Count */}
                  <View style={styles.detailSection}>
                    <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Occurrences</Text>
                    <View style={styles.occurrenceInfo}>
                      <Text style={[styles.occurrenceCount, {color: SEVERITY_CONFIG[selectedReport.severity].color}]}>
                        {selectedReport.occurrence_count}× reported
                      </Text>
                      <Text style={[styles.occurrenceDate, {color: colors.textSecondary}]}>
                        First: {new Date(selectedReport.first_occurred_at).toLocaleDateString()}
                      </Text>
                      <Text style={[styles.occurrenceDate, {color: colors.textSecondary}]}>
                        Last: {new Date(selectedReport.last_occurred_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>

                  {/* Stack Trace */}
                  {selectedReport.error_stack && (
                    <View style={styles.detailSection}>
                      <View style={styles.stackHeader}>
                        <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Stack Trace</Text>
                        <TouchableOpacity
                          style={styles.copyBtn}
                          onPress={() => copyToClipboard(selectedReport.error_stack || '', 'Stack trace')}>
                          <Icon name="copy-outline" family="Ionicons" size={16} color={colors.primary} />
                          <Text style={[styles.copyBtnText, {color: colors.primary}]}>Copy</Text>
                        </TouchableOpacity>
                      </View>
                      <ScrollView
                        horizontal
                        style={[styles.stackBox, {backgroundColor: colors.background}]}
                        showsHorizontalScrollIndicator>
                        <Text style={[styles.stackText, {color: colors.textSecondary}]} selectable>
                          {selectedReport.error_stack}
                        </Text>
                      </ScrollView>
                    </View>
                  )}

                  {/* Resolution Notes (if resolved) */}
                  {selectedReport.resolution_notes && (
                    <View style={[styles.resolutionBox, {backgroundColor: '#10B98120'}]}>
                      <Text style={[styles.resolutionLabel, {color: '#10B981'}]}>Resolution Notes</Text>
                      <Text style={[styles.resolutionText, {color: colors.text}]}>
                        {selectedReport.resolution_notes}
                      </Text>
                    </View>
                  )}

                  {/* Actions */}
                  {selectedReport.status !== 'resolved' && selectedReport.status !== 'wont_fix' && (
                    <View style={styles.modalActions}>
                      {selectedReport.status === 'new' && (
                        <TouchableOpacity
                          style={[styles.actionBtn, {backgroundColor: '#F59E0B'}]}
                          onPress={() => handleChangeStatus(selectedReport, 'acknowledged')}>
                          <Icon name="eye-outline" family="Ionicons" size={18} color="#FFFFFF" />
                          <Text style={styles.actionBtnText}>Acknowledge</Text>
                        </TouchableOpacity>
                      )}
                      {(selectedReport.status === 'new' || selectedReport.status === 'acknowledged') && (
                        <TouchableOpacity
                          style={[styles.actionBtn, {backgroundColor: '#3B82F6'}]}
                          onPress={() => handleChangeStatus(selectedReport, 'investigating')}>
                          <Icon name="search-outline" family="Ionicons" size={18} color="#FFFFFF" />
                          <Text style={styles.actionBtnText}>Investigate</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={[styles.actionBtn, {backgroundColor: '#10B981'}]}
                        onPress={() => handleChangeStatus(selectedReport, 'resolved')}>
                        <Icon name="checkmark-outline" family="Ionicons" size={18} color="#FFFFFF" />
                        <Text style={styles.actionBtnText}>Resolve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, {backgroundColor: '#6B7280'}]}
                        onPress={() => handleChangeStatus(selectedReport, 'wont_fix')}>
                        <Icon name="close-outline" family="Ionicons" size={18} color="#FFFFFF" />
                        <Text style={styles.actionBtnText}>Won't Fix</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Delete Button */}
                  <TouchableOpacity
                    style={[styles.deleteBtn, {borderColor: '#EF4444'}]}
                    onPress={() => handleDeleteReport(selectedReport)}>
                    <Icon name="trash-outline" family="Ionicons" size={18} color="#EF4444" />
                    <Text style={styles.deleteBtnText}>Delete Report</Text>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        {/* Action Modal */}
        <Modal visible={showActionModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.actionModalContent, {backgroundColor: colors.card}]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, {color: colors.text}]}>
                  {actionType === 'resolved' ? 'Resolve Error' : 
                   actionType === 'wont_fix' ? "Mark as Won't Fix" :
                   `Mark as ${STATUS_CONFIG[actionType].label}`}
                </Text>
                <TouchableOpacity onPress={() => setShowActionModal(false)}>
                  <Icon name="close" family="Ionicons" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.actionModalBody}>
                {(actionType === 'resolved' || actionType === 'wont_fix') && (
                  <>
                    <Text style={[styles.formLabel, {color: colors.text}]}>
                      Resolution Notes {actionType === 'wont_fix' ? '(Required)' : '(Optional)'}
                    </Text>
                    <TextInput
                      style={[
                        styles.notesInput,
                        {backgroundColor: colors.background, color: colors.text},
                      ]}
                      placeholder={
                        actionType === 'resolved'
                          ? "Describe how this was fixed..."
                          : "Explain why this won't be fixed..."
                      }
                      placeholderTextColor={colors.placeholder}
                      value={resolutionNotes}
                      onChangeText={setResolutionNotes}
                      multiline
                      numberOfLines={4}
                    />
                  </>
                )}

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.cancelBtn, {borderColor: colors.border}]}
                    onPress={() => setShowActionModal(false)}>
                    <Text style={[styles.cancelBtnText, {color: colors.text}]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.confirmBtn,
                      {backgroundColor: STATUS_CONFIG[actionType].color},
                    ]}
                    onPress={submitStatusChange}>
                    <Text style={styles.confirmBtnText}>
                      {STATUS_CONFIG[actionType].label}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(128,128,128,0.2)',
    marginVertical: 4,
  },
  filtersContainer: {
    marginTop: 8,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 4,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  severityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  reportCard: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  severityIndicator: {
    width: 4,
  },
  reportContent: {
    flex: 1,
    padding: 12,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  errorName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 12,
    lineHeight: 18,
  },
  reportFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 12,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 10,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
  },
  quickActions: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
  quickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  quickBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  actionModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalBody: {
    padding: 16,
  },
  actionModalBody: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  detailValueLong: {
    fontSize: 14,
    lineHeight: 20,
  },
  feedbackBox: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  feedbackTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  feedbackText: {
    fontSize: 14,
    lineHeight: 20,
  },
  deviceInfoBox: {
    padding: 12,
    borderRadius: 10,
  },
  deviceInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  deviceInfoLabel: {
    fontSize: 12,
  },
  deviceInfoValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  occurrenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  occurrenceCount: {
    fontSize: 14,
    fontWeight: '700',
  },
  occurrenceDate: {
    fontSize: 11,
  },
  stackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '500',
  },
  stackBox: {
    padding: 12,
    borderRadius: 10,
    maxHeight: 150,
  },
  stackText: {
    fontSize: 10,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  resolutionBox: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  resolutionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  resolutionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
    marginBottom: 30,
  },
  deleteBtnText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  notesInput: {
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AdminErrorReportsScreen;

/**
 * Admin Reports Screen
 * Manage content reports and user moderation
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
  ActivityIndicator,
  ScrollView,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../../contexts/ThemeContext';
import {adminService, ContentReport, ReportStatus} from '../../services/admin';
import {Icon} from '../../components/icons';

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

const STATUS_CONFIG: Record<ReportStatus, {label: string; color: string; icon: string}> = {
  pending: {label: 'Pending', color: '#F59E0B', icon: 'time-outline'},
  reviewing: {label: 'Reviewing', color: '#3B82F6', icon: 'eye-outline'},
  resolved: {label: 'Resolved', color: '#10B981', icon: 'checkmark-circle'},
  dismissed: {label: 'Dismissed', color: '#6B7280', icon: 'close-circle'},
};

const REPORT_REASONS = [
  'Inappropriate content',
  'Spam or misleading',
  'Incorrect information',
  'Offensive language',
  'Copyright violation',
  'Other',
];

const AdminReportsScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors, isDark} = useTheme();
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | 'all'>('pending');
  
  // Detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ContentReport | null>(null);
  
  // Action modal
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'resolve' | 'dismiss'>('resolve');
  const [moderatorNotes, setModeratorNotes] = useState('');

  useEffect(() => {
    loadReports();
  }, [selectedStatus]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const {reports: data} = await adminService.getContentReports({
        status: selectedStatus === 'all' ? undefined : selectedStatus,
      });
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadReports();
  }, [selectedStatus]);

  const handleViewReport = (report: ContentReport) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const handleAction = (report: ContentReport, type: 'resolve' | 'dismiss') => {
    setSelectedReport(report);
    setActionType(type);
    setModeratorNotes('');
    setShowActionModal(true);
  };

  const submitAction = async () => {
    if (!selectedReport) return;

    try {
      const newStatus: ReportStatus = actionType === 'resolve' ? 'resolved' : 'dismissed';
      const success = await adminService.updateContentReport(selectedReport.id, {
        status: newStatus,
        moderator_notes: moderatorNotes,
        resolved_at: new Date().toISOString(),
      });

      if (success) {
        Alert.alert('Success', `Report ${actionType === 'resolve' ? 'resolved' : 'dismissed'} successfully`);
        setShowActionModal(false);
        setShowDetailModal(false);
        loadReports();
      } else {
        Alert.alert('Error', 'Failed to update report');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred');
    }
  };

  const handleStartReview = async (report: ContentReport) => {
    const success = await adminService.updateContentReport(report.id, {
      status: 'reviewing',
    });
    if (success) {
      loadReports();
    }
  };

  const getStatusConfig = (status: ReportStatus) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  };

  const getPendingCount = () => {
    return reports.filter(r => r.status === 'pending').length;
  };

  const renderReport = ({item}: {item: ContentReport}) => {
    const statusConfig = getStatusConfig(item.status);

    return (
      <TouchableOpacity
        style={[styles.reportCard, {backgroundColor: colors.card}]}
        onPress={() => handleViewReport(item)}>
        <View style={styles.reportHeader}>
          <View style={[styles.priorityIndicator, {
            backgroundColor: item.status === 'pending' ? '#EF4444' : '#6B7280',
          }]} />
          <View style={styles.reportInfo}>
            <Text style={[styles.reportType, {color: colors.text}]}>
              {item.content_type.charAt(0).toUpperCase() + item.content_type.slice(1)} Report
            </Text>
            <Text style={[styles.reportDate, {color: colors.textSecondary}]}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
          <View style={[styles.statusBadge, {backgroundColor: statusConfig.color + '20'}]}>
            <Icon name={statusConfig.icon} family="Ionicons" size={12} color={statusConfig.color} />
            <Text style={[styles.statusText, {color: statusConfig.color}]}>{statusConfig.label}</Text>
          </View>
        </View>

        <Text style={[styles.reportReason, {color: colors.text}]}>
          {item.reason}
        </Text>
        {item.description && (
          <Text style={[styles.reportDescription, {color: colors.textSecondary}]} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        {item.status === 'pending' && (
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickBtn, {backgroundColor: '#3B82F620'}]}
              onPress={() => handleStartReview(item)}>
              <Icon name="eye-outline" family="Ionicons" size={14} color="#3B82F6" />
              <Text style={[styles.quickBtnText, {color: '#3B82F6'}]}>Review</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickBtn, {backgroundColor: '#10B98120'}]}
              onPress={() => handleAction(item, 'resolve')}>
              <Icon name="checkmark-outline" family="Ionicons" size={14} color="#10B981" />
              <Text style={[styles.quickBtnText, {color: '#10B981'}]}>Resolve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickBtn, {backgroundColor: '#6B728020'}]}
              onPress={() => handleAction(item, 'dismiss')}>
              <Icon name="close-outline" family="Ionicons" size={14} color="#6B7280" />
              <Text style={[styles.quickBtnText, {color: '#6B7280'}]}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <LinearGradient
          colors={isDark ? ['#1E3A5F', '#1E1E2E'] : ['#EF4444', '#DC2626']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" family="Ionicons" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Content Reports</Text>
            <Text style={styles.headerSubtitle}>
              {getPendingCount()} pending reports
            </Text>
          </View>
        </LinearGradient>

        {/* Status Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              {backgroundColor: selectedStatus === 'all' ? colors.primary + '20' : colors.card},
            ]}
            onPress={() => setSelectedStatus('all')}>
            <Text style={[
              styles.filterText,
              {color: selectedStatus === 'all' ? colors.primary : colors.textSecondary},
            ]}>
              All
            </Text>
          </TouchableOpacity>
          {(Object.keys(STATUS_CONFIG) as ReportStatus[]).map(status => {
            const config = STATUS_CONFIG[status];
            const isSelected = selectedStatus === status;
            return (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterChip,
                  {backgroundColor: isSelected ? config.color + '20' : colors.card},
                ]}
                onPress={() => setSelectedStatus(status)}>
                <Icon name={config.icon} family="Ionicons" size={14} color={isSelected ? config.color : colors.textSecondary} />
                <Text style={[styles.filterText, {color: isSelected ? config.color : colors.textSecondary}]}>
                  {config.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Reports List */}
        <FlatList
          data={reports}
          renderItem={renderReport}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListFooterComponent={
            loading && !refreshing ? (
              <ActivityIndicator style={styles.loader} color={colors.primary} />
            ) : null
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyState}>
                <Icon name="shield-checkmark-outline" family="Ionicons" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
                  No reports to show
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
                <Text style={[styles.modalTitle, {color: colors.text}]}>Report Details</Text>
                <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                  <Icon name="close" family="Ionicons" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {selectedReport && (
                <ScrollView style={styles.modalBody}>
                  {/* Status */}
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Status</Text>
                    <View style={[styles.statusBadge, {backgroundColor: getStatusConfig(selectedReport.status).color + '20'}]}>
                      <Icon
                        name={getStatusConfig(selectedReport.status).icon}
                        family="Ionicons"
                        size={12}
                        color={getStatusConfig(selectedReport.status).color}
                      />
                      <Text style={[styles.statusText, {color: getStatusConfig(selectedReport.status).color}]}>
                        {getStatusConfig(selectedReport.status).label}
                      </Text>
                    </View>
                  </View>

                  {/* Content Type */}
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Content Type</Text>
                    <Text style={[styles.detailValue, {color: colors.text}]}>
                      {selectedReport.content_type.charAt(0).toUpperCase() + selectedReport.content_type.slice(1)}
                    </Text>
                  </View>

                  {/* Reason */}
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Reason</Text>
                    <Text style={[styles.detailValue, {color: colors.text}]}>{selectedReport.reason}</Text>
                  </View>

                  {/* Description */}
                  {selectedReport.description && (
                    <View style={styles.detailBlock}>
                      <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Description</Text>
                      <Text style={[styles.detailText, {color: colors.text}]}>{selectedReport.description}</Text>
                    </View>
                  )}

                  {/* Reporter */}
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Reported</Text>
                    <Text style={[styles.detailValue, {color: colors.text}]}>
                      {new Date(selectedReport.created_at).toLocaleString()}
                    </Text>
                  </View>

                  {/* Moderator Notes */}
                  {selectedReport.moderator_notes && (
                    <View style={styles.detailBlock}>
                      <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Moderator Notes</Text>
                      <Text style={[styles.detailText, {color: colors.text}]}>{selectedReport.moderator_notes}</Text>
                    </View>
                  )}

                  {/* Actions */}
                  {(selectedReport.status === 'pending' || selectedReport.status === 'reviewing') && (
                    <View style={styles.modalActions}>
                      <TouchableOpacity
                        style={[styles.modalActionBtn, {backgroundColor: '#10B981'}]}
                        onPress={() => {
                          setShowDetailModal(false);
                          handleAction(selectedReport, 'resolve');
                        }}>
                        <Icon name="checkmark-outline" family="Ionicons" size={18} color="#FFFFFF" />
                        <Text style={styles.modalActionBtnText}>Resolve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.modalActionBtn, {backgroundColor: '#6B7280'}]}
                        onPress={() => {
                          setShowDetailModal(false);
                          handleAction(selectedReport, 'dismiss');
                        }}>
                        <Icon name="close-outline" family="Ionicons" size={18} color="#FFFFFF" />
                        <Text style={styles.modalActionBtnText}>Dismiss</Text>
                      </TouchableOpacity>
                    </View>
                  )}
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
                  {actionType === 'resolve' ? 'Resolve Report' : 'Dismiss Report'}
                </Text>
                <TouchableOpacity onPress={() => setShowActionModal(false)}>
                  <Icon name="close" family="Ionicons" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.actionModalBody}>
                <Text style={[styles.formLabel, {color: colors.text}]}>
                  Moderator Notes (Optional)
                </Text>
                <TextInput
                  style={[
                    styles.notesInput,
                    {backgroundColor: colors.background, color: colors.text},
                  ]}
                  placeholder="Add notes about this action..."
                  placeholderTextColor={colors.placeholder}
                  value={moderatorNotes}
                  onChangeText={setModeratorNotes}
                  multiline
                  numberOfLines={4}
                />

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.cancelBtn, {borderColor: colors.border}]}
                    onPress={() => setShowActionModal(false)}>
                    <Text style={[styles.cancelBtnText, {color: colors.text}]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.confirmBtn,
                      {backgroundColor: actionType === 'resolve' ? '#10B981' : '#6B7280'},
                    ]}
                    onPress={submitAction}>
                    <Text style={styles.confirmBtnText}>
                      {actionType === 'resolve' ? 'Resolve' : 'Dismiss'}
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
  filterScroll: {
    flexGrow: 0,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexDirection: 'row',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  reportCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  reportInfo: {
    flex: 1,
    marginLeft: 10,
  },
  reportType: {
    fontSize: 14,
    fontWeight: '600',
  },
  reportDate: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  reportReason: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  reportDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  quickActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  quickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  quickBtnText: {
    fontSize: 12,
    fontWeight: '500',
  },
  loader: {
    paddingVertical: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  detailBlock: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  modalActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  modalActionBtnText: {
    color: '#FFFFFF',
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
    borderRadius: 8,
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
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AdminReportsScreen;

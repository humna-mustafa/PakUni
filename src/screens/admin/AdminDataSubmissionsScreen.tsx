/**
 * Admin Data Submissions Screen
 * 
 * Manages user-submitted data corrections and updates
 * Features:
 * - View all submissions with filters
 * - Approve/reject submissions
 * - Review submission details
 * - Quick actions for common operations
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { UniversalHeader } from '../../components';
import { 
  dataSubmissionsService, 
  DataSubmission, 
  SubmissionStatus,
  SubmissionType,
  SubmissionPriority,
} from '../../services/dataSubmissions';

const STATUS_COLORS: Record<SubmissionStatus, string> = {
  pending: '#F59E0B',
  under_review: '#3B82F6',
  approved: '#10B981',
  rejected: '#EF4444',
  auto_approved: '#8B5CF6',
};

const PRIORITY_COLORS: Record<SubmissionPriority, string> = {
  low: '#6B7280',
  medium: '#F59E0B',
  high: '#F97316',
  urgent: '#EF4444',
};

const TYPE_LABELS: Record<SubmissionType, string> = {
  merit_update: '📊 Merit Update',
  date_correction: '📅 Date Correction',
  entry_test_update: '📝 Entry Test',
  university_info: '🏛️ University Info',
  scholarship_info: '💰 Scholarship',
  program_info: '📚 Program Info',
  fee_update: '💵 Fee Update',
  other: '📋 Other',
};

export const AdminDataSubmissionsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  
  const [submissions, setSubmissions] = useState<DataSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | 'all'>('pending');
  const [typeFilter, setTypeFilter] = useState<SubmissionType | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<SubmissionPriority | 'all'>('all');
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    autoApproved: 0,
  });
  
  // Review modal
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<DataSubmission | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const filters: any = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (typeFilter !== 'all') filters.type = typeFilter;
      if (priorityFilter !== 'all') filters.priority = priorityFilter;
      
      const [data, statsData] = await Promise.all([
        dataSubmissionsService.getSubmissions(filters),
        dataSubmissionsService.getStatistics(),
      ]);
      
      setSubmissions(data);
      setStats(statsData.submissions);
    } catch (error) {
      console.error('Failed to load submissions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, typeFilter, priorityFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleReview = (submission: DataSubmission) => {
    setSelectedSubmission(submission);
    setReviewNotes('');
    setRejectionReason('');
    setReviewModalVisible(true);
  };

  const processReview = async (action: 'approve' | 'reject') => {
    if (!selectedSubmission || !user) return;
    
    if (action === 'reject' && !rejectionReason.trim()) {
      Alert.alert('Error', 'Please provide a rejection reason');
      return;
    }
    
    setIsProcessing(true);
    try {
      const success = await dataSubmissionsService.reviewSubmission(
        selectedSubmission.id,
        action,
        user.id,
        reviewNotes.trim() || undefined,
        rejectionReason.trim() || undefined
      );
      
      if (success) {
        Alert.alert(
          'Success',
          `Submission ${action === 'approve' ? 'approved' : 'rejected'} successfully`
        );
        setReviewModalVisible(false);
        loadData();
      } else {
        Alert.alert('Error', 'Failed to process review');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStatsBar = () => (
    <View style={[styles.statsBar, { backgroundColor: isDark ? colors.card : '#F3F4F6' }]}>
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: colors.text }]}>{stats.total}</Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: STATUS_COLORS.pending }]}>{stats.pending}</Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: STATUS_COLORS.approved }]}>{stats.approved}</Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Approved</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: STATUS_COLORS.rejected }]}>{stats.rejected}</Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rejected</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: STATUS_COLORS.auto_approved }]}>{stats.autoApproved}</Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Auto</Text>
      </View>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {/* Status Filter */}
        <View style={styles.filterGroup}>
          <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Status:</Text>
          {(['all', 'pending', 'approved', 'rejected', 'auto_approved'] as const).map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterChip,
                { 
                  backgroundColor: statusFilter === status 
                    ? (status === 'all' ? colors.primary : STATUS_COLORS[status as SubmissionStatus])
                    : isDark ? colors.card : '#E5E7EB',
                },
              ]}
              onPress={() => setStatusFilter(status)}
            >
              <Text style={[
                styles.filterChipText,
                { color: statusFilter === status ? '#FFFFFF' : colors.text }
              ]}>
                {status === 'all' ? 'All' : status.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
        {/* Type Filter */}
        <View style={styles.filterGroup}>
          <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Type:</Text>
          {(['all', 'merit_update', 'date_correction', 'entry_test_update', 'fee_update'] as const).map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterChip,
                { 
                  backgroundColor: typeFilter === type 
                    ? colors.primary
                    : isDark ? colors.card : '#E5E7EB',
                },
              ]}
              onPress={() => setTypeFilter(type)}
            >
              <Text style={[
                styles.filterChipText,
                { color: typeFilter === type ? '#FFFFFF' : colors.text }
              ]}>
                {type === 'all' ? 'All' : TYPE_LABELS[type as SubmissionType]?.split(' ')[1] || type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderSubmissionCard = (submission: DataSubmission) => (
    <TouchableOpacity
      key={submission.id}
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => handleReview(submission)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Text style={[styles.cardType, { color: colors.text }]}>
            {TYPE_LABELS[submission.type]}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[submission.status] }]}>
            <Text style={styles.statusText}>{submission.status.replace('_', ' ')}</Text>
          </View>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: PRIORITY_COLORS[submission.priority] + '20' }]}>
          <Text style={[styles.priorityText, { color: PRIORITY_COLORS[submission.priority] }]}>
            {submission.priority.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.entityName, { color: colors.text }]} numberOfLines={1}>
        {submission.entity_name}
      </Text>
      
      <View style={styles.changeRow}>
        <Text style={[styles.fieldName, { color: colors.textSecondary }]}>
          {submission.field_name}:
        </Text>
        <View style={styles.changeValues}>
          <Text style={[styles.oldValue, { color: '#EF4444' }]} numberOfLines={1}>
            {String(submission.current_value)}
          </Text>
          <Icon name="arrow-forward" size={14} color={colors.textSecondary} />
          <Text style={[styles.newValue, { color: '#10B981' }]} numberOfLines={1}>
            {String(submission.proposed_value)}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <View style={styles.userInfo}>
          <Icon name="person-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.userName, { color: colors.textSecondary }]}>
            {submission.user_name || 'Anonymous'}
          </Text>
          {submission.user_trust_level >= 3 && (
            <View style={[styles.trustedBadge, { backgroundColor: '#10B981' }]}>
              <Icon name="shield-checkmark" size={10} color="#FFFFFF" />
            </View>
          )}
        </View>
        <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
          {new Date(submission.created_at).toLocaleDateString()}
        </Text>
      </View>
      
      {submission.status === 'pending' && (
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#10B981' }]}
            onPress={(e) => {
              e.stopPropagation();
              setSelectedSubmission(submission);
              processReview('approve');
            }}
          >
            <Icon name="checkmark" size={16} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#EF4444' }]}
            onPress={(e) => {
              e.stopPropagation();
              handleReview(submission);
            }}
          >
            <Icon name="close" size={16} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderReviewModal = () => (
    <Modal
      visible={reviewModalVisible}
      animationType="slide"
      transparent
      onRequestClose={() => setReviewModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Review Submission</Text>
            <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          {selectedSubmission && (
            <ScrollView style={styles.modalBody}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Type:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {TYPE_LABELS[selectedSubmission.type]}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Entity:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {selectedSubmission.entity_name}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Field:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {selectedSubmission.field_name}
                </Text>
              </View>
              
              <View style={styles.changeBox}>
                <View style={styles.changeBoxItem}>
                  <Text style={[styles.changeBoxLabel, { color: '#EF4444' }]}>Current</Text>
                  <Text style={[styles.changeBoxValue, { color: colors.text }]}>
                    {String(selectedSubmission.current_value)}
                  </Text>
                </View>
                <Icon name="arrow-forward" size={20} color={colors.textSecondary} />
                <View style={styles.changeBoxItem}>
                  <Text style={[styles.changeBoxLabel, { color: '#10B981' }]}>Proposed</Text>
                  <Text style={[styles.changeBoxValue, { color: colors.text }]}>
                    {String(selectedSubmission.proposed_value)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Reason:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {selectedSubmission.change_reason}
                </Text>
              </View>
              
              {selectedSubmission.source_proof && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Source:</Text>
                  <Text style={[styles.detailValue, { color: colors.primary }]}>
                    {selectedSubmission.source_proof}
                  </Text>
                </View>
              )}
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Submitted by:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {selectedSubmission.user_name || 'Anonymous'} (Trust: {selectedSubmission.user_trust_level}/5)
                </Text>
              </View>
              
              <Text style={[styles.inputLabel, { color: colors.text }]}>Review Notes (optional)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6', color: colors.text }]}
                value={reviewNotes}
                onChangeText={setReviewNotes}
                placeholder="Add notes about this review..."
                placeholderTextColor={colors.textSecondary}
                multiline
              />
              
              <Text style={[styles.inputLabel, { color: colors.text }]}>Rejection Reason (required for reject)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6', color: colors.text }]}
                value={rejectionReason}
                onChangeText={setRejectionReason}
                placeholder="Why is this being rejected?"
                placeholderTextColor={colors.textSecondary}
                multiline
              />
            </ScrollView>
          )}
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: '#10B981' }]}
              onPress={() => processReview('approve')}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.modalBtnText}>Approve</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: '#EF4444' }]}
              onPress={() => processReview('reject')}
              disabled={isProcessing}
            >
              <Icon name="close-circle" size={20} color="#FFFFFF" />
              <Text style={styles.modalBtnText}>Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <UniversalHeader
          title="Data Submissions"
          showBack
          onBack={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <UniversalHeader
        title="Data Submissions"
        showBack
        onBack={() => navigation.goBack()}
        rightContent={
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('AdminAutoApprovalRules')}
          >
            <Icon name="flash" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />
      
      {renderStatsBar()}
      {renderFilters()}
      
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {submissions.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="document-text-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No submissions found
            </Text>
          </View>
        ) : (
          submissions.map(renderSubmissionCard)
        )}
      </ScrollView>
      
      {renderReviewModal()}
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
  content: {
    flex: 1,
    padding: 16,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardType: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  entityName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  changeRow: {
    marginBottom: 12,
  },
  fieldName: {
    fontSize: 12,
    marginBottom: 4,
  },
  changeValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  oldValue: {
    fontSize: 14,
    textDecorationLine: 'line-through',
    flex: 1,
  },
  newValue: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.2)',
    paddingTop: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    fontSize: 12,
  },
  trustedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 11,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalBody: {
    padding: 16,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
  },
  changeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(128,128,128,0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  changeBoxItem: {
    flex: 1,
    alignItems: 'center',
  },
  changeBoxLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  changeBoxValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.2)',
  },
  modalBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdminDataSubmissionsScreen;

/**
 * Admin Content Moderation Screen
 * 
 * Content moderation queue with approval workflow:
 * - Review pending content
 * - Approve/reject with notes
 * - Priority-based queue
 * - Content preview
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
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/ThemeContext';
import { UniversalHeader } from '../../components';
import { TYPOGRAPHY } from '../../constants/design';
import { enhancedAdminService, ContentModerationItem } from '../../services/adminEnhanced';

type StatusFilter = 'all' | 'pending' | 'needs_review' | 'approved' | 'rejected';
type ContentTypeFilter = 'all' | 'feedback' | 'university' | 'scholarship' | 'announcement';

const AdminContentModerationScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<ContentModerationItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [typeFilter, setTypeFilter] = useState<ContentTypeFilter>('all');
  const [selectedItem, setSelectedItem] = useState<ContentModerationItem | null>(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  // Stats
  const [stats, setStats] = useState({
    pending: 0,
    needs_review: 0,
    approved: 0,
    rejected: 0,
  });

  // Fetch items
  const fetchItems = useCallback(async () => {
    try {
      const filters: any = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (typeFilter !== 'all') filters.content_type = typeFilter;

      const data = await enhancedAdminService.getModerationQueue(filters);
      setItems(data);

      // Calculate stats
      const allItems = await enhancedAdminService.getModerationQueue();
      setStats({
        pending: allItems.filter(i => i.status === 'pending').length,
        needs_review: allItems.filter(i => i.status === 'needs_review').length,
        approved: allItems.filter(i => i.status === 'approved').length,
        rejected: allItems.filter(i => i.status === 'rejected').length,
      });
    } catch (error) {
      console.error('Failed to fetch moderation items:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  // Handle review action
  const handleReviewAction = async (action: 'approved' | 'rejected') => {
    if (!selectedItem) return;

    setLoading(true);
    const success = await enhancedAdminService.updateModerationStatus(
      selectedItem.id,
      action,
      reviewNotes.trim() || undefined
    );

    if (success) {
      Alert.alert(
        'Success',
        `Item ${action === 'approved' ? 'approved' : 'rejected'} successfully.`
      );
      setReviewModalVisible(false);
      setSelectedItem(null);
      setReviewNotes('');
      fetchItems();
    } else {
      Alert.alert('Error', 'Failed to update item status.');
    }
    setLoading(false);
  };

  // Get priority color
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'urgent': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#4573DF';
      default: return colors.textSecondary;
    }
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'approved': return '#10B981';
      case 'rejected': return '#EF4444';
      case 'needs_review': return '#F59E0B';
      default: return '#4573DF';
    }
  };

  // Get content type icon
  const getContentTypeIcon = (type: string): string => {
    switch (type) {
      case 'feedback': return 'chatbox-ellipses';
      case 'university': return 'school';
      case 'scholarship': return 'ribbon';
      case 'announcement': return 'megaphone';
      default: return 'document';
    }
  };

  const styles = createStyles(colors, isDark);

  // Render stat badge
  const renderStatBadge = (label: string, count: number, color: string, selected: boolean) => (
    <TouchableOpacity
      style={[
        styles.statBadge,
        { borderColor: color },
        selected && { backgroundColor: color + '20' },
      ]}
      onPress={() => setStatusFilter(label.toLowerCase().replace(' ', '_') as StatusFilter)}
      accessibilityRole="button"
      accessibilityLabel={`Filter by ${label}, ${count} items`}
      accessibilityState={{ selected }}
    >
      <Text style={[styles.statBadgeCount, { color }]}>{count}</Text>
      <Text style={[styles.statBadgeLabel, selected && { color }]}>{label}</Text>
    </TouchableOpacity>
  );

  // Render moderation item
  const renderItem = ({ item }: { item: ContentModerationItem }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => {
        setSelectedItem(item);
        setReviewModalVisible(true);
      }}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${item.content_type}, status ${item.status.replace('_', ' ')}, priority ${item.priority}${item.auto_flags.length > 0 ? `, ${item.auto_flags.length} flags` : ''}`}
      accessibilityHint="Double tap to review this content"
    >
      <View style={styles.itemHeader}>
        <View style={[styles.itemIcon, { backgroundColor: colors.primary + '15' }]}>
          <Icon
            name={getContentTypeIcon(item.content_type) as any}
            size={20}
            color={colors.primary}
          />
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.itemMeta}>
            <Text style={styles.itemType}>{item.content_type.toUpperCase()}</Text>
            <Text style={styles.itemDate}>
              {new Date(item.submitted_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
          <Text style={styles.priorityText}>{item.priority}</Text>
        </View>
      </View>

      <View style={styles.itemFooter}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.replace('_', ' ')}
          </Text>
        </View>

        {item.auto_flags.length > 0 && (
          <View style={styles.flagsBadge}>
            <Icon name="flag" size={12} color="#EF4444" />
            <Text style={styles.flagsText}>{item.auto_flags.length} flags</Text>
          </View>
        )}

        <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing && items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <UniversalHeader
          title="Content Moderation"
          showBack
          onBack={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading moderation queue...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <UniversalHeader
        title="Content Moderation"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsContent}
          >
            {renderStatBadge('Pending', stats.pending, '#4573DF', statusFilter === 'pending')}
            {renderStatBadge('Needs Review', stats.needs_review, '#F59E0B', statusFilter === 'needs_review')}
            {renderStatBadge('Approved', stats.approved, '#10B981', statusFilter === 'approved')}
            {renderStatBadge('Rejected', stats.rejected, '#EF4444', statusFilter === 'rejected')}
          </ScrollView>
        </View>

        {/* Type Filter */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Content Type:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChips}
          >
            {(['all', 'feedback', 'university', 'scholarship', 'announcement'] as ContentTypeFilter[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterChip,
                  typeFilter === type && styles.filterChipActive,
                ]}
                onPress={() => setTypeFilter(type)}
              >
                <Text style={[
                  styles.filterChipText,
                  typeFilter === type && styles.filterChipTextActive,
                ]}>
                  {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Queue Header */}
        <View style={styles.queueHeader}>
          <Text style={styles.queueTitle}>Moderation Queue</Text>
          <Text style={styles.queueCount}>{items.length} items</Text>
        </View>

        {/* Items List */}
        {items.length > 0 ? (
          <View style={styles.itemsList}>
            {items.map((item) => (
              <View key={item.id}>
                {renderItem({ item })}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="checkmark-done-circle-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>Queue is Clear!</Text>
            <Text style={styles.emptyText}>
              {statusFilter !== 'all' || typeFilter !== 'all'
                ? 'No items match your current filters'
                : 'No content pending moderation'}
            </Text>
            {(statusFilter !== 'all' || typeFilter !== 'all') && (
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => {
                  setStatusFilter('pending');
                  setTypeFilter('all');
                }}
              >
                <Text style={styles.clearFiltersText}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Review Modal */}
      <Modal
        visible={reviewModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Review Content</Text>
              <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedItem && (
              <ScrollView style={styles.modalBody}>
                {/* Content Details */}
                <View style={styles.contentPreview}>
                  <View style={styles.previewHeader}>
                    <View style={[styles.previewIcon, { backgroundColor: colors.primary + '15' }]}>
                      <Icon
                        name={getContentTypeIcon(selectedItem.content_type) as any}
                        size={24}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.previewInfo}>
                      <Text style={styles.previewType}>
                        {selectedItem.content_type.toUpperCase()}
                      </Text>
                      <Text style={styles.previewId}>ID: {selectedItem.content_id}</Text>
                    </View>
                    <View style={[styles.priorityBadgeLarge, { backgroundColor: getPriorityColor(selectedItem.priority) }]}>
                      <Icon name="flag" size={14} color="#fff" />
                      <Text style={styles.priorityTextLarge}>{selectedItem.priority}</Text>
                    </View>
                  </View>

                  <Text style={styles.previewTitle}>{selectedItem.title}</Text>

                  <View style={styles.detailRow}>
                    <Icon name="time-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.detailText}>
                      Submitted: {new Date(selectedItem.submitted_at).toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Icon name="person-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.detailText}>
                      By: {selectedItem.submitted_by || 'Unknown'}
                    </Text>
                  </View>

                  <View style={[
                    styles.currentStatus,
                    { backgroundColor: getStatusColor(selectedItem.status) + '15' }
                  ]}>
                    <Text style={styles.currentStatusLabel}>Current Status:</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedItem.status) + '20' }]}>
                      <View style={[styles.statusDot, { backgroundColor: getStatusColor(selectedItem.status) }]} />
                      <Text style={[styles.statusText, { color: getStatusColor(selectedItem.status) }]}>
                        {selectedItem.status.replace('_', ' ')}
                      </Text>
                    </View>
                  </View>

                  {selectedItem.auto_flags.length > 0 && (
                    <View style={styles.flagsSection}>
                      <Text style={styles.flagsTitle}>
                        <Icon name="warning-outline" size={14} color="#EF4444" /> Auto-Detected Flags:
                      </Text>
                      {selectedItem.auto_flags.map((flag, index) => (
                        <Text key={index} style={styles.flagItem}>• {flag}</Text>
                      ))}
                    </View>
                  )}

                  {selectedItem.notes && (
                    <View style={styles.notesSection}>
                      <Text style={styles.notesTitle}>Previous Notes:</Text>
                      <Text style={styles.notesText}>{selectedItem.notes}</Text>
                    </View>
                  )}
                </View>

                {/* Review Notes */}
                <View style={styles.reviewSection}>
                  <Text style={styles.reviewLabel}>Add Review Notes (Optional)</Text>
                  <TextInput
                    style={styles.reviewInput}
                    value={reviewNotes}
                    onChangeText={setReviewNotes}
                    placeholder="Enter notes about your decision..."
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleReviewAction('rejected')}
                    disabled={loading}
                    accessibilityRole="button"
                    accessibilityLabel="Reject content"
                    accessibilityState={{ disabled: loading }}
                  >
                    <Icon name="close-circle" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Reject</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => handleReviewAction('approved')}
                    disabled={loading}
                    accessibilityRole="button"
                    accessibilityLabel="Approve content"
                    accessibilityState={{ disabled: loading }}
                  >
                    <Icon name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Approve</Text>
                  </TouchableOpacity>
                </View>

                {/* Skip Button */}
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={() => {
                    setReviewModalVisible(false);
                    setSelectedItem(null);
                    setReviewNotes('');
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Skip this item for now"
                >
                  <Text style={styles.skipButtonText}>Skip for Now</Text>
                </TouchableOpacity>
              </ScrollView>
            )}

            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}
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
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    paddingVertical: 16,
  },
  statsContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  statBadge: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 2,
    marginRight: 10,
    minWidth: 90,
  },
  statBadgeCount: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  statBadgeLabel: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  queueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  queueTitle: {
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: colors.text,
  },
  queueCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  itemsList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: colors.text,
    lineHeight: 20,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  itemType: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  itemDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  priorityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#fff',
    textTransform: 'uppercase',
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.semibold,
    textTransform: 'capitalize',
  },
  flagsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  flagsText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: colors.text,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  clearFiltersButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#fff',
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
    maxHeight: '90%',
    position: 'relative',
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
    fontWeight: TYPOGRAPHY.weight.bold,
    color: colors.text,
  },
  modalBody: {
    padding: 20,
  },
  contentPreview: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  previewIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewInfo: {
    flex: 1,
  },
  previewType: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  previewId: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  priorityBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  priorityTextLarge: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#fff',
    textTransform: 'uppercase',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: colors.text,
    marginBottom: 16,
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  currentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  currentStatusLabel: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: colors.text,
  },
  flagsSection: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
  },
  flagsTitle: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#EF4444',
    marginBottom: 8,
  },
  flagItem: {
    fontSize: 13,
    color: '#DC2626',
    marginTop: 4,
  },
  notesSection: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 10,
  },
  notesTitle: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  reviewSection: {
    marginBottom: 20,
  },
  reviewLabel: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: colors.text,
    marginBottom: 8,
  },
  reviewInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#fff',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 20,
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: colors.textSecondary,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
});

export default AdminContentModerationScreen;

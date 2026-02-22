/**
 * Admin Data Correction Review Screen
 *
 * Allows admins to review structured, field-level data corrections submitted
 * by users. Each correction shows a before/after comparison for every changed
 * field. Admin can approve, reject, or mark as applied after Turso update.
 *
 * Workflow:
 * 1. User submits correction from DataCorrectionScreen
 * 2. Admin reviews field-level diff here
 * 3. Admin approves → generates SQL → applies via turso:shell
 * 4. Admin marks as "Applied" to close the loop
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Dimensions,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { UniversalHeader } from '../../components';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/design';
import {
  dataCorrectionService,
  DataCorrectionRecord,
  CorrectionEntityType,
  FieldCorrection,
  ENTITY_FIELDS_MAP,
} from '../../services/dataCorrectionService';

const { width } = Dimensions.get('window');

// ─── Entity type metadata ────────────────────────────────────────────────────
const ENTITY_META: Record<string, { label: string; icon: string; color: string }> = {
  university: { label: 'University', icon: 'school-outline', color: '#4573DF' },
  scholarship: { label: 'Scholarship', icon: 'wallet-outline', color: '#10B981' },
  entry_test: { label: 'Entry Test', icon: 'document-text-outline', color: '#F59E0B' },
  career: { label: 'Career', icon: 'briefcase-outline', color: '#8B5CF6' },
  deadline: { label: 'Deadline', icon: 'calendar-outline', color: '#EF4444' },
  program: { label: 'Program', icon: 'library-outline', color: '#06B6D4' },
  merit_archive: { label: 'Merit', icon: 'trending-up-outline', color: '#EC4899' },
};

const STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B',
  under_review: '#4573DF',
  approved: '#10B981',
  rejected: '#EF4444',
  applied: '#6B7280',
};

const STATUS_ICONS: Record<string, string> = {
  pending: 'time-outline',
  under_review: 'eye-outline',
  approved: 'checkmark-circle-outline',
  rejected: 'close-circle-outline',
  applied: 'checkmark-done-outline',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: '#6B7280', medium: '#F59E0B', high: '#F97316', urgent: '#EF4444',
};

// ─── Component ────────────────────────────────────────────────────────────────
const AdminDataCorrectionReviewScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();

  // ─── State ────────────────────────────────────────────────────────────────
  const [corrections, setCorrections] = useState<DataCorrectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    pending: 0, under_review: 0, approved: 0, rejected: 0, applied: 0, total: 0,
    byEntityType: {} as Record<string, number>,
  });

  // Modal state
  const [selectedCorrection, setSelectedCorrection] = useState<DataCorrectionRecord | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showSQL, setShowSQL] = useState(false);
  const [generatedSQL, setGeneratedSQL] = useState('');

  // ─── Load data ────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      const [data, statsData] = await Promise.all([
        dataCorrectionService.fetchPendingCorrections(
          entityFilter !== 'all' ? entityFilter as CorrectionEntityType : undefined,
          statusFilter,
        ),
        dataCorrectionService.fetchCorrectionStats(),
      ]);
      setCorrections(data);
      setStats(statsData);
    } catch (_e) {
      setCorrections([]);
    }
  }, [statusFilter, entityFilter]);

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // ─── Actions ──────────────────────────────────────────────────────────────

  const openCorrection = (correction: DataCorrectionRecord) => {
    setSelectedCorrection(correction);
    setAdminNotes('');
    setShowSQL(false);
    setGeneratedSQL('');
    setModalVisible(true);
  };

  const handleApprove = async () => {
    if (!selectedCorrection || !user) { return; }
    setActionLoading(true);
    try {
      const result = await dataCorrectionService.approveCorrection(
        selectedCorrection.id,
        user.id,
        adminNotes || undefined,
      );
      if (result.success) {
        // Show SQL for manual application
        const sql = dataCorrectionService.generateApplySQL(selectedCorrection);
        setGeneratedSQL(sql);
        setShowSQL(true);
        // Refresh list
        setCorrections(prev => prev.map(c =>
          c.id === selectedCorrection.id ? { ...c, status: 'approved' as const, admin_notes: adminNotes || null } : c,
        ));
        setStats(prev => ({ ...prev, pending: Math.max(0, prev.pending - 1), approved: prev.approved + 1 }));
      } else {
        Alert.alert('Error', result.error || 'Failed to approve');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = () => {
    if (!adminNotes.trim()) {
      Alert.alert('Rejection Reason Required', 'Please provide a reason for rejection before rejecting.');
      return;
    }
    Alert.alert(
      'Reject Correction',
      `Reject this correction with reason: "${adminNotes}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            if (!selectedCorrection || !user) { return; }
            setActionLoading(true);
            try {
              const result = await dataCorrectionService.rejectCorrection(
                selectedCorrection.id,
                user.id,
                adminNotes,
              );
              if (result.success) {
                setCorrections(prev => prev.filter(c => c.id !== selectedCorrection.id));
                setStats(prev => ({ ...prev, pending: Math.max(0, prev.pending - 1), rejected: prev.rejected + 1 }));
                setModalVisible(false);
              } else {
                Alert.alert('Error', result.error || 'Failed to reject');
              }
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleMarkApplied = async () => {
    if (!selectedCorrection || !user) { return; }
    setActionLoading(true);
    try {
      const result = await dataCorrectionService.markAsApplied(selectedCorrection.id, user.id);
      if (result.success) {
        setCorrections(prev => prev.filter(c => c.id !== selectedCorrection.id));
        setModalVisible(false);
      } else {
        Alert.alert('Error', result.error || 'Failed to mark as applied');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const copySQL = () => {
    Clipboard.setString(generatedSQL);
    Alert.alert('Copied!', 'SQL has been copied to clipboard. Paste it in turso:shell to apply.');
  };

  // ─── Parse corrections JSON ───────────────────────────────────────────────
  const parseChanges = (record: DataCorrectionRecord): FieldCorrection[] => {
    try {
      return JSON.parse(record.corrections_json);
    } catch (_e) {
      return [];
    }
  };

  // ─── Render helpers ───────────────────────────────────────────────────────

  const renderStatsBar = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.statsBar}>
      {[
        { key: 'total', label: 'Total', color: '#6B7280' },
        { key: 'pending', label: 'Pending', color: '#F59E0B' },
        { key: 'approved', label: 'Approved', color: '#10B981' },
        { key: 'rejected', label: 'Rejected', color: '#EF4444' },
        { key: 'applied', label: 'Applied', color: '#6B7280' },
      ].map(s => (
        <TouchableOpacity
          key={s.key}
          onPress={() => { if (s.key !== 'total') { setStatusFilter(s.key); } }}
          style={[
            styles.statChip,
            {
              backgroundColor: statusFilter === s.key ? s.color : isDark ? colors.card : '#F3F4F6',
              borderColor: s.color,
              borderWidth: statusFilter === s.key ? 0 : 1,
            },
          ]}>
          <Text style={[
            styles.statNumber,
            { color: statusFilter === s.key ? '#FFF' : s.color },
          ]}>
            {(stats as any)[s.key] ?? 0}
          </Text>
          <Text style={[
            styles.statLabel,
            { color: statusFilter === s.key ? '#FFF' : colors.textSecondary },
          ]}>
            {s.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderEntityFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterBar}>
      {['all', 'university', 'scholarship', 'entry_test', 'career', 'deadline', 'merit_archive'].map(type => {
        const meta = ENTITY_META[type];
        const count = type === 'all' ? stats.total : (stats.byEntityType[type] || 0);
        return (
          <TouchableOpacity
            key={type}
            onPress={() => setEntityFilter(type)}
            style={[
              styles.filterChip,
              {
                backgroundColor: entityFilter === type ? (meta?.color || '#4573DF') : isDark ? colors.card : '#F9FAFB',
                borderColor: meta?.color || '#4573DF',
                borderWidth: entityFilter === type ? 0 : 1,
              },
            ]}>
            {meta?.icon && (
              <Icon name={meta.icon} size={14} color={entityFilter === type ? '#FFF' : colors.textSecondary} />
            )}
            <Text style={[
              styles.filterChipText,
              { color: entityFilter === type ? '#FFF' : colors.text },
            ]}>
              {type === 'all' ? 'All' : meta?.label || type}
              {count > 0 && ` (${count})`}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderCorrectionCard = (item: DataCorrectionRecord) => {
    const meta = ENTITY_META[item.entity_type] || { label: item.entity_type, icon: 'document-outline', color: '#6B7280' };
    const changes = parseChanges(item);
    const statusColor = STATUS_COLORS[item.status] || '#6B7280';
    const priorityColor = PRIORITY_COLORS[item.priority] || '#6B7280';

    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => openCorrection(item)}
        style={[styles.correctionCard, { backgroundColor: colors.card, borderColor: isDark ? '#2C2C2E' : '#E5E7EB' }]}
        activeOpacity={0.8}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={[styles.entityBadge, { backgroundColor: meta.color + '22' }]}>
            <Icon name={meta.icon} size={14} color={meta.color} />
            <Text style={[styles.entityBadgeText, { color: meta.color }]}>{meta.label}</Text>
          </View>
          <View style={styles.badgeRow}>
            <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '22' }]}>
              <Text style={[styles.priorityBadgeText, { color: priorityColor }]}>{item.priority}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '22' }]}>
              <Icon name={STATUS_ICONS[item.status] || 'time-outline'} size={12} color={statusColor} />
              <Text style={[styles.statusBadgeText, { color: statusColor }]}>{item.status.replace('_', ' ')}</Text>
            </View>
          </View>
        </View>

        {/* Entity name + submitter */}
        <Text style={[styles.entityName, { color: colors.text }]} numberOfLines={1}>
          {item.entity_display_name}
        </Text>
        <Text style={[styles.submitterText, { color: colors.textSecondary }]}>
          by {item.user_name || item.user_email || 'Anonymous'} · {new Date(item.created_at).toLocaleDateString()}
        </Text>

        {/* Changes preview */}
        <View style={styles.changesPreview}>
          {changes.slice(0, 3).map(c => (
            <View key={c.fieldKey} style={[styles.changeRow, { backgroundColor: isDark ? '#1C1C1E' : '#F9FAFB' }]}>
              <Text style={[styles.changeFieldName, { color: colors.textSecondary }]}>{c.fieldLabel}:</Text>
              <Text style={[styles.changeOldVal, { color: colors.textSecondary }]} numberOfLines={1}>
                {String(c.currentValue ?? 'empty')}
              </Text>
              <Icon name="arrow-forward" size={10} color={meta.color} />
              <Text style={[styles.changeNewVal, { color: meta.color }]} numberOfLines={1}>
                {String(c.proposedValue)}
              </Text>
            </View>
          ))}
          {changes.length > 3 && (
            <Text style={[styles.moreChanges, { color: colors.textSecondary }]}>
              +{changes.length - 3} more field{changes.length - 3 !== 1 ? 's' : ''}
            </Text>
          )}
        </View>

        {/* Reason preview */}
        <Text style={[styles.reasonPreview, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.overall_reason}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={[styles.tapToReview, { color: meta.color }]}>Tap to review →</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDetailModal = () => {
    if (!selectedCorrection) { return null; }
    const meta = ENTITY_META[selectedCorrection.entity_type] || { label: selectedCorrection.entity_type, icon: 'document-outline', color: '#4573DF' };
    const changes = parseChanges(selectedCorrection);
    const isApproved = selectedCorrection.status === 'approved';
    const isPending = selectedCorrection.status === 'pending' || selectedCorrection.status === 'under_review';

    return (
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          {/* Modal header */}
          <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: isDark ? '#2C2C2E' : '#E5E7EB' }]}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalBack}>
              <Icon name="close" size={22} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Review Correction</Text>
            <View style={[styles.entityBadge, { backgroundColor: meta.color + '22' }]}>
              <Icon name={meta.icon} size={13} color={meta.color} />
              <Text style={[styles.entityBadgeText, { color: meta.color }]}>{meta.label}</Text>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
            {/* Entity info */}
            <View style={[styles.infoCard, { backgroundColor: meta.color + '14', borderColor: meta.color + '33' }]}>
              <Text style={[styles.infoEntityName, { color: colors.text }]}>{selectedCorrection.entity_display_name}</Text>
              <Text style={[styles.infoEntityId, { color: colors.textSecondary }]}>ID: {selectedCorrection.entity_id}</Text>
              <View style={styles.infoRow}>
                <Icon name="person-outline" size={13} color={colors.textSecondary} />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  {selectedCorrection.user_name || selectedCorrection.user_email || 'Anonymous'}
                </Text>
                <View style={[styles.priorityBadge, { backgroundColor: PRIORITY_COLORS[selectedCorrection.priority] + '22' }]}>
                  <Text style={[styles.priorityBadgeText, { color: PRIORITY_COLORS[selectedCorrection.priority] }]}>
                    {selectedCorrection.priority}
                  </Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Icon name="calendar-outline" size={13} color={colors.textSecondary} />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  {new Date(selectedCorrection.created_at).toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Field-level before/after */}
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
              <Icon name="clipboard-outline" size={20} color={meta.color} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Field Changes ({changes.length})</Text>
            </View>
            {changes.map(change => (
              <View key={change.fieldKey} style={[styles.diffCard, { backgroundColor: colors.card, borderColor: meta.color + '44' }]}>
                <Text style={[styles.diffFieldName, { color: meta.color }]}>{change.fieldLabel}</Text>
                <View style={styles.diffRow}>
                  <View style={[styles.diffSide, { backgroundColor: '#EF444418', borderColor: '#EF444433' }]}>
                    <Text style={styles.diffSideLabel}>BEFORE</Text>
                    <Text style={[styles.diffValue, { color: '#EF4444' }]} numberOfLines={5}>
                      {String(change.currentValue ?? 'Not set')}
                    </Text>
                  </View>
                  <View style={[styles.diffArrow, { backgroundColor: meta.color + '22' }]}>
                    <Icon name="arrow-forward" size={16} color={meta.color} />
                  </View>
                  <View style={[styles.diffSide, { backgroundColor: '#10B98118', borderColor: '#10B98133' }]}>
                    <Text style={styles.diffSideLabel}>AFTER</Text>
                    <Text style={[styles.diffValue, { color: '#10B981' }]} numberOfLines={5}>
                      {String(change.proposedValue)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}

            {/* Reason */}
            <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                <Icon name="chatbubble-outline" size={20} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Reason for Correction</Text>
              </View>
              <Text style={[styles.reasonText, { color: colors.textSecondary }]}>
                {selectedCorrection.overall_reason}
              </Text>
              {selectedCorrection.source_proof && (
                <>
                  <Text style={[styles.sectionSubtitle, { color: colors.text, marginTop: 8 }]}>Source:</Text>
                  <Text style={[styles.reasonText, { color: '#4573DF' }]}>{selectedCorrection.source_proof}</Text>
                </>
              )}
            </View>

            {/* Admin notes */}
            {isPending && (
              <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                  <Icon name="create-outline" size={20} color={colors.primary} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Admin Notes</Text>
                </View>
                <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                  Required if rejecting. Optional for approval.
                </Text>
                <TextInput
                  style={[
                    styles.notesInput,
                    {
                      color: colors.text,
                      backgroundColor: isDark ? '#1C1C1E' : '#F9FAFB',
                      borderColor: adminNotes.trim() ? meta.color : isDark ? '#3A3A3C' : '#D1D5DB',
                    },
                  ]}
                  value={adminNotes}
                  onChangeText={setAdminNotes}
                  placeholder="Optional notes for approving, or required reason for rejection..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                  maxLength={400}
                />
              </View>
            )}

            {/* SQL section (shown after approval) */}
            {(showSQL || isApproved) && (
              <View style={[styles.sectionCard, { backgroundColor: '#0F172A', borderColor: '#1E3A5F' }]}>
                <View style={styles.sqlHeader}>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                    <Icon name="terminal-outline" size={16} color="#60A5FA" />
                    <Text style={[styles.sqlTitle, { color: '#94A3B8' }]}>Apply to Turso Database</Text>
                  </View>
                  <TouchableOpacity
                    onPress={copySQL}
                    style={[styles.copyBtn, { backgroundColor: '#1E3A5F' }]}>
                    <Icon name="copy-outline" size={14} color="#60A5FA" />
                    <Text style={{ color: '#60A5FA', fontSize: 12, fontFamily: TYPOGRAPHY.fontFamily.medium }}>Copy SQL</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.sqlText}>
                  {generatedSQL || dataCorrectionService.generateApplySQL(selectedCorrection)}
                </Text>
                <View style={[styles.sqlNote, { backgroundColor: '#1E3A5F' }]}>
                  <Icon name="terminal-outline" size={14} color="#60A5FA" />
                  <Text style={{ color: '#94A3B8', fontSize: 11, fontFamily: TYPOGRAPHY.fontFamily.regular, flex: 1, lineHeight: 16 }}>
                    Run this SQL in <Text style={{ color: '#60A5FA' }}>npm run turso:shell</Text> or the Turso Console to apply the change to the main database.
                  </Text>
                </View>
                {isApproved && selectedCorrection.status !== 'applied' && (
                  <TouchableOpacity
                    onPress={handleMarkApplied}
                    disabled={actionLoading}
                    style={[styles.appliedBtn, { backgroundColor: '#10B981' }]}>
                    {actionLoading ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <>
                        <Icon name="checkmark-done" size={16} color="#FFF" />
                        <Text style={{ color: '#FFF', fontFamily: TYPOGRAPHY.fontFamily.semibold, fontSize: 14 }}>
                          Mark as Applied
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Action buttons */}
            {isPending && (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  onPress={handleReject}
                  disabled={actionLoading}
                  style={[styles.actionBtn, { backgroundColor: isDark ? '#2C0A0A' : '#FEF2F2', borderColor: '#EF4444' }]}>
                  {actionLoading ? (
                    <ActivityIndicator color="#EF4444" size="small" />
                  ) : (
                    <>
                      <Icon name="close-circle-outline" size={18} color="#EF4444" />
                      <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Reject</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleApprove}
                  disabled={actionLoading}
                  style={[styles.actionBtn, { backgroundColor: meta.color, borderColor: meta.color }]}>
                  {actionLoading ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <>
                      <Icon name="checkmark-circle-outline" size={18} color="#FFF" />
                      <Text style={[styles.actionBtnText, { color: '#FFF' }]}>Approve</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {isApproved && selectedCorrection.status !== 'applied' && !showSQL && (
              <TouchableOpacity
                onPress={() => {
                  const sql = dataCorrectionService.generateApplySQL(selectedCorrection);
                  setGeneratedSQL(sql);
                  setShowSQL(true);
                }}
                style={[styles.viewSQLBtn, { borderColor: meta.color }]}>
                <Icon name="terminal-outline" size={16} color={meta.color} />
                <Text style={[styles.viewSQLBtnText, { color: meta.color }]}>View Apply SQL</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </Modal>
    );
  };

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <UniversalHeader
        title="Data Correction Review"
        onBack={() => navigation.goBack()}
        rightContent={
          <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
            <Icon name="refresh-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        }
      />

      {renderStatsBar()}
      {renderEntityFilter()}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4573DF" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading corrections…</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          {corrections.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="checkmark-circle-outline" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>All Clear!</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                No {statusFilter.replace('_', ' ')} corrections found{entityFilter !== 'all' ? ` for ${ENTITY_META[entityFilter]?.label}` : ''}.
              </Text>
            </View>
          ) : (
            corrections.map(item => renderCorrectionCard(item))
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {renderDetailModal()}
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, fontFamily: TYPOGRAPHY.fontFamily.regular },

  refreshBtn: { padding: 4 },

  statsBar: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  statChip: {
    alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1,
  },
  statNumber: { fontSize: 18, fontFamily: TYPOGRAPHY.fontFamily.bold },
  statLabel: { fontSize: 10, fontFamily: TYPOGRAPHY.fontFamily.medium },

  filterBar: { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
  },
  filterChipText: { fontSize: 12, fontFamily: TYPOGRAPHY.fontFamily.medium },

  listContent: { padding: 16, gap: 12 },

  correctionCard: {
    borderRadius: RADIUS.xl, borderWidth: 1, padding: 16, gap: 8,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  entityBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  entityBadgeText: { fontSize: 11, fontFamily: TYPOGRAPHY.fontFamily.medium },
  badgeRow: { flexDirection: 'row', gap: 6 },
  priorityBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  priorityBadgeText: { fontSize: 10, fontFamily: TYPOGRAPHY.fontFamily.bold },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  statusBadgeText: { fontSize: 10, fontFamily: TYPOGRAPHY.fontFamily.medium },

  entityName: { fontSize: 15, fontFamily: TYPOGRAPHY.fontFamily.semibold },
  submitterText: { fontSize: 12, fontFamily: TYPOGRAPHY.fontFamily.regular },

  changesPreview: { gap: 4 },
  changeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: RADIUS.sm,
  },
  changeFieldName: { fontSize: 11, fontFamily: TYPOGRAPHY.fontFamily.medium, minWidth: 60 },
  changeOldVal: { flex: 1, fontSize: 11, fontFamily: TYPOGRAPHY.fontFamily.regular },
  changeNewVal: { flex: 1, fontSize: 11, fontFamily: TYPOGRAPHY.fontFamily.semibold },
  moreChanges: { fontSize: 11, fontFamily: TYPOGRAPHY.fontFamily.regular, paddingHorizontal: 10 },

  reasonPreview: { fontSize: 12, fontFamily: TYPOGRAPHY.fontFamily.regular, lineHeight: 18, fontStyle: 'italic' },

  cardFooter: { alignItems: 'flex-end' },
  tapToReview: { fontSize: 12, fontFamily: TYPOGRAPHY.fontFamily.semibold },

  emptyContainer: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 20, fontFamily: TYPOGRAPHY.fontFamily.bold },
  emptySubtitle: { fontSize: 14, fontFamily: TYPOGRAPHY.fontFamily.regular, textAlign: 'center', paddingHorizontal: 32 },

  // Modal
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 14, borderBottomWidth: 1, gap: 12,
  },
  modalBack: { padding: 4 },
  modalTitle: { flex: 1, fontSize: 17, fontFamily: TYPOGRAPHY.fontFamily.semibold },

  modalContent: { padding: 16, gap: 14 },

  infoCard: {
    borderRadius: RADIUS.lg, borderWidth: 1, padding: 14, gap: 6,
  },
  infoEntityName: { fontSize: 16, fontFamily: TYPOGRAPHY.fontFamily.bold },
  infoEntityId: { fontSize: 11, fontFamily: TYPOGRAPHY.fontFamily.regular },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 12, fontFamily: TYPOGRAPHY.fontFamily.regular, flex: 1 },

  sectionTitle: { fontSize: 14, fontFamily: TYPOGRAPHY.fontFamily.semibold, marginBottom: 2 },
  sectionSubtitle: { fontSize: 12, fontFamily: TYPOGRAPHY.fontFamily.regular },

  diffCard: {
    borderRadius: RADIUS.lg, borderWidth: 1, padding: 12, gap: 8,
  },
  diffFieldName: { fontSize: 13, fontFamily: TYPOGRAPHY.fontFamily.bold },
  diffRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  diffSide: {
    flex: 1, borderRadius: RADIUS.md, borderWidth: 1, padding: 10, gap: 4,
  },
  diffSideLabel: {
    fontSize: 9, fontFamily: TYPOGRAPHY.fontFamily.bold, color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  diffValue: { fontSize: 13, fontFamily: TYPOGRAPHY.fontFamily.regular, lineHeight: 18 },
  diffArrow: {
    width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginTop: 20,
  },

  sectionCard: { borderRadius: RADIUS.lg, padding: 14, gap: 6 },
  reasonText: { fontSize: 13, fontFamily: TYPOGRAPHY.fontFamily.regular, lineHeight: 20 },

  notesInput: {
    borderWidth: 1.5, borderRadius: RADIUS.md,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, fontFamily: TYPOGRAPHY.fontFamily.regular,
    minHeight: 80, textAlignVertical: 'top',
    marginTop: 8,
  },

  // SQL
  sqlHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sqlTitle: { fontSize: 13, fontFamily: TYPOGRAPHY.fontFamily.semibold },
  copyBtn: { flexDirection: 'row', gap: 5, alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  sqlText: {
    fontFamily: 'Courier New', fontSize: 11, color: '#E2E8F0', lineHeight: 18,
    backgroundColor: '#0F172A', padding: 2,
  },
  sqlNote: { flexDirection: 'row', gap: 8, padding: 10, borderRadius: 8, marginTop: 8, alignItems: 'flex-start' },

  appliedBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 12, borderRadius: RADIUS.lg, marginTop: 12,
  },

  actionRow: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 13, borderRadius: RADIUS.lg, borderWidth: 1.5,
  },
  actionBtnText: { fontSize: 15, fontFamily: TYPOGRAPHY.fontFamily.semibold },

  viewSQLBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 12, borderRadius: RADIUS.lg, borderWidth: 1.5,
  },
  viewSQLBtnText: { fontSize: 14, fontFamily: TYPOGRAPHY.fontFamily.semibold },
});

export default AdminDataCorrectionReviewScreen;

/**
 * Admin Notification Triggers Screen
 * 
 * Manage automated notification triggers for:
 * - Deadline reminders
 * - Entry test alerts
 * - Merit list publications
 * - Custom announcements
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
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/ThemeContext';
import { TYPOGRAPHY } from '../../constants/design';
import { UniversalHeader } from '../../components';
import { dataSubmissionsService, NotificationTrigger } from '../../services/dataSubmissions';

const TRIGGER_TYPES = [
  { value: 'deadline_reminder', label: 'Deadline Reminder', icon: 'calendar', color: '#4573DF' },
  { value: 'merit_published', label: 'Merit Published', icon: 'trophy', color: '#F59E0B' },
  { value: 'entry_test_reminder', label: 'Entry Test', icon: 'school', color: '#4573DF' },
  { value: 'scholarship_deadline', label: 'Scholarship', icon: 'cash', color: '#10B981' },
  { value: 'new_announcement', label: 'Announcement', icon: 'megaphone', color: '#EF4444' },
  { value: 'custom', label: 'Custom', icon: 'settings', color: '#6B7280' },
];

const TARGET_TYPES = [
  { value: 'all_users', label: 'All Users', icon: 'people' },
  { value: 'specific_users', label: 'Specific Users', icon: 'person' },
  { value: 'by_interest', label: 'By Interest', icon: 'heart' },
  { value: 'by_university', label: 'By University', icon: 'business' },
  { value: 'by_program', label: 'By Program', icon: 'book' },
];

const SCHEDULE_TYPES = [
  { value: 'immediate', label: 'Send Now', icon: 'flash' },
  { value: 'scheduled', label: 'Scheduled', icon: 'time' },
  { value: 'recurring', label: 'Recurring', icon: 'repeat' },
];

export const AdminNotificationTriggersScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  
  const [triggers, setTriggers] = useState<NotificationTrigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({ total: 0, enabled: 0, totalSent: 0 });
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<Partial<NotificationTrigger>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [data, statsData] = await Promise.all([
        dataSubmissionsService.getNotificationTriggers(),
        dataSubmissionsService.getStatistics(),
      ]);
      
      setTriggers(data);
      setStats(statsData.triggers);
    } catch (error) {
      console.error('Failed to load triggers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const openAddModal = () => {
    setEditingTrigger({
      name: '',
      description: '',
      enabled: true,
      trigger_type: 'custom',
      target_type: 'all_users',
      target_criteria: {},
      schedule_type: 'immediate',
      schedule_time: null,
      recurring_pattern: null,
      days_before: null,
      title_template: '',
      message_template: '',
    });
    setModalVisible(true);
  };

  const openEditModal = (trigger: NotificationTrigger) => {
    setEditingTrigger({ ...trigger });
    setModalVisible(true);
  };

  const toggleTriggerEnabled = async (trigger: NotificationTrigger) => {
    const updatedTriggers = triggers.map(t => 
      t.id === trigger.id ? { ...t, enabled: !t.enabled } : t
    );
    setTriggers(updatedTriggers);
    await dataSubmissionsService.saveNotificationTriggers(updatedTriggers);
  };

  const saveTrigger = async () => {
    if (!editingTrigger.name?.trim()) {
      Alert.alert('Error', 'Please enter a trigger name');
      return;
    }
    if (!editingTrigger.title_template?.trim()) {
      Alert.alert('Error', 'Please enter a notification title');
      return;
    }
    
    setIsProcessing(true);
    try {
      await dataSubmissionsService.upsertNotificationTrigger(editingTrigger);
      Alert.alert('Success', 'Trigger saved successfully');
      setModalVisible(false);
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to save trigger');
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteTrigger = async (triggerId: string) => {
    Alert.alert(
      'Delete Trigger',
      'Are you sure you want to delete this trigger?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await dataSubmissionsService.deleteNotificationTrigger(triggerId);
            loadData();
          },
        },
      ]
    );
  };

  const executeTrigger = async (trigger: NotificationTrigger) => {
    Alert.alert(
      'Execute Trigger',
      `Send notification "${trigger.title_template}" now?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            const result = await dataSubmissionsService.executeTrigger(trigger.id);
            if (result.success) {
              Alert.alert('Success', `Notification sent successfully`);
              loadData();
            } else {
              Alert.alert('Error', 'Failed to send notification');
            }
          },
        },
      ]
    );
  };

  const renderStatsBar = () => (
    <View style={[styles.statsBar, { backgroundColor: isDark ? colors.card : '#F3F4F6' }]}>
      <View style={styles.statItem}>
        <Icon name="notifications" size={20} color={colors.primary} />
        <Text style={[styles.statValue, { color: colors.text }]}>{stats.total}</Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
      </View>
      <View style={styles.statItem}>
        <Icon name="checkmark-circle" size={20} color="#10B981" />
        <Text style={[styles.statValue, { color: '#10B981' }]}>{stats.enabled}</Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Enabled</Text>
      </View>
      <View style={styles.statItem}>
        <Icon name="paper-plane" size={20} color="#4573DF" />
        <Text style={[styles.statValue, { color: '#4573DF' }]}>{stats.totalSent}</Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Sent</Text>
      </View>
    </View>
  );

  const renderTriggerCard = (trigger: NotificationTrigger) => {
    const typeInfo = TRIGGER_TYPES.find(t => t.value === trigger.trigger_type);
    const targetInfo = TARGET_TYPES.find(t => t.value === trigger.target_type);
    const scheduleInfo = SCHEDULE_TYPES.find(s => s.value === trigger.schedule_type);
    
    return (
      <TouchableOpacity
        key={trigger.id}
        style={[styles.card, { backgroundColor: colors.card }]}
        onPress={() => openEditModal(trigger)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <View style={[styles.typeIcon, { backgroundColor: typeInfo?.color + '20' }]}>
              <Icon name={typeInfo?.icon as any || 'notifications'} size={18} color={typeInfo?.color} />
            </View>
            <View style={styles.titleContainer}>
              <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                {trigger.name}
              </Text>
              <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                {typeInfo?.label}
              </Text>
            </View>
          </View>
          <Switch
            value={trigger.enabled}
            onValueChange={() => toggleTriggerEnabled(trigger)}
            trackColor={{ false: '#767577', true: '#10B981' }}
            thumbColor="#FFFFFF"
          />
        </View>
        
        {trigger.description && (
          <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
            {trigger.description}
          </Text>
        )}
        
        <View style={[styles.previewBox, { backgroundColor: isDark ? '#272C34' : '#F3F4F6' }]}>
          <Text style={[styles.previewTitle, { color: colors.text }]}>
            {trigger.title_template}
          </Text>
          <Text style={[styles.previewMessage, { color: colors.textSecondary }]} numberOfLines={2}>
            {trigger.message_template}
          </Text>
        </View>
        
        <View style={styles.tagsRow}>
          <View style={[styles.tag, { backgroundColor: '#E8EFFC' }]}>
            <Icon name={targetInfo?.icon as any} size={12} color="#4573DF" />
            <Text style={styles.tagText}>{targetInfo?.label}</Text>
          </View>
          <View style={[styles.tag, { backgroundColor: '#FEF3C7' }]}>
            <Icon name={scheduleInfo?.icon as any} size={12} color="#92400E" />
            <Text style={[styles.tagText, { color: '#92400E' }]}>{scheduleInfo?.label}</Text>
          </View>
          {trigger.days_before && (
            <View style={[styles.tag, { backgroundColor: '#FEE2E2' }]}>
              <Icon name="time" size={12} color="#991B1B" />
              <Text style={[styles.tagText, { color: '#991B1B' }]}>{trigger.days_before}d before</Text>
            </View>
          )}
        </View>
        
        <View style={styles.cardFooter}>
          <View style={styles.statsRow}>
            {trigger.last_triggered && (
              <Text style={[styles.lastTriggered, { color: colors.textSecondary }]}>
                Last: {new Date(trigger.last_triggered).toLocaleDateString()}
              </Text>
            )}
            <Text style={[styles.sentCount, { color: colors.textSecondary }]}>
              {trigger.total_sent} sent
            </Text>
          </View>
          
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#E8EFFC' }]}
              onPress={(e) => { e.stopPropagation(); executeTrigger(trigger); }}
            >
              <Icon name="paper-plane" size={14} color="#4573DF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#FEE2E2' }]}
              onPress={(e) => { e.stopPropagation(); deleteTrigger(trigger.id); }}
            >
              <Icon name="trash" size={14} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEditModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingTrigger.id ? 'Edit Trigger' : 'New Notification Trigger'}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Trigger Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#272C34' : '#F3F4F6', color: colors.text }]}
              value={editingTrigger.name}
              onChangeText={(text) => setEditingTrigger({ ...editingTrigger, name: text })}
              placeholder="e.g., NUST Deadline Reminder"
              placeholderTextColor={colors.textSecondary}
            />
            
            <Text style={[styles.inputLabel, { color: colors.text }]}>Description</Text>
            <TextInput
              style={[styles.input, styles.multilineInput, { backgroundColor: isDark ? '#272C34' : '#F3F4F6', color: colors.text }]}
              value={editingTrigger.description}
              onChangeText={(text) => setEditingTrigger({ ...editingTrigger, description: text })}
              placeholder="What this trigger does..."
              placeholderTextColor={colors.textSecondary}
              multiline
            />
            
            <Text style={[styles.inputLabel, { color: colors.text }]}>Trigger Type</Text>
            <View style={styles.typeGrid}>
              {TRIGGER_TYPES.map(type => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeOption,
                    {
                      backgroundColor: editingTrigger.trigger_type === type.value
                        ? type.color + '20'
                        : isDark ? '#272C34' : '#F3F4F6',
                      borderColor: editingTrigger.trigger_type === type.value ? type.color : 'transparent',
                    }
                  ]}
                  onPress={() => setEditingTrigger({ ...editingTrigger, trigger_type: type.value as any })}
                >
                  <Icon name={type.icon as any} size={20} color={type.color} />
                  <Text style={[styles.typeOptionText, { color: colors.text }]}>{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={[styles.inputLabel, { color: colors.text }]}>Target Audience</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.targetRow}>
                {TARGET_TYPES.map(target => (
                  <TouchableOpacity
                    key={target.value}
                    style={[
                      styles.targetOption,
                      {
                        backgroundColor: editingTrigger.target_type === target.value
                          ? colors.primary
                          : isDark ? '#272C34' : '#F3F4F6',
                      }
                    ]}
                    onPress={() => setEditingTrigger({ ...editingTrigger, target_type: target.value as any })}
                  >
                    <Icon 
                      name={target.icon as any} 
                      size={16} 
                      color={editingTrigger.target_type === target.value ? '#FFFFFF' : colors.textSecondary} 
                    />
                    <Text style={[
                      styles.targetOptionText,
                      { color: editingTrigger.target_type === target.value ? '#FFFFFF' : colors.text }
                    ]}>
                      {target.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            
            <Text style={[styles.inputLabel, { color: colors.text }]}>Schedule</Text>
            <View style={styles.scheduleRow}>
              {SCHEDULE_TYPES.map(schedule => (
                <TouchableOpacity
                  key={schedule.value}
                  style={[
                    styles.scheduleOption,
                    {
                      backgroundColor: editingTrigger.schedule_type === schedule.value
                        ? colors.primary
                        : isDark ? '#272C34' : '#F3F4F6',
                    }
                  ]}
                  onPress={() => setEditingTrigger({ ...editingTrigger, schedule_type: schedule.value as any })}
                >
                  <Icon 
                    name={schedule.icon as any} 
                    size={18} 
                    color={editingTrigger.schedule_type === schedule.value ? '#FFFFFF' : colors.textSecondary} 
                  />
                  <Text style={[
                    styles.scheduleOptionText,
                    { color: editingTrigger.schedule_type === schedule.value ? '#FFFFFF' : colors.text }
                  ]}>
                    {schedule.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {editingTrigger.trigger_type?.includes('reminder') && (
              <>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Days Before</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? '#272C34' : '#F3F4F6', color: colors.text }]}
                  value={editingTrigger.days_before?.toString() || ''}
                  onChangeText={(text) => setEditingTrigger({ ...editingTrigger, days_before: parseInt(text) || null })}
                  keyboardType="numeric"
                  placeholder="e.g., 7"
                  placeholderTextColor={colors.textSecondary}
                />
              </>
            )}
            
            <View style={styles.divider} />
            
            <Text style={[styles.sectionTitle, { color: colors.text }]}>📱 Notification Content</Text>
            
            <Text style={[styles.inputLabel, { color: colors.text }]}>Title Template *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#272C34' : '#F3F4F6', color: colors.text }]}
              value={editingTrigger.title_template}
              onChangeText={(text) => setEditingTrigger({ ...editingTrigger, title_template: text })}
              placeholder="e.g., ⏰ Deadline Approaching!"
              placeholderTextColor={colors.textSecondary}
            />
            
            <Text style={[styles.inputLabel, { color: colors.text }]}>Message Template *</Text>
            <TextInput
              style={[styles.input, styles.multilineInput, { backgroundColor: isDark ? '#272C34' : '#F3F4F6', color: colors.text }]}
              value={editingTrigger.message_template}
              onChangeText={(text) => setEditingTrigger({ ...editingTrigger, message_template: text })}
              placeholder="Use {university}, {program}, {date} as placeholders..."
              placeholderTextColor={colors.textSecondary}
              multiline
            />
            
            <View style={[styles.helpBox, { backgroundColor: isDark ? '#272C34' : '#F3F4F6' }]}>
              <Icon name="information-circle" size={16} color={colors.primary} />
              <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                Available placeholders: {'{university}'}, {'{program}'}, {'{date}'}, {'{test_name}'}, {'{deadline}'}
              </Text>
            </View>
            
            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: colors.text }]}>Trigger Enabled</Text>
              <Switch
                value={editingTrigger.enabled ?? true}
                onValueChange={(value) => setEditingTrigger({ ...editingTrigger, enabled: value })}
                trackColor={{ false: '#767577', true: '#10B981' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </ScrollView>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: isDark ? '#272C34' : '#E5E7EB' }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: colors.primary }]}
              onPress={saveTrigger}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.modalBtnText}>Save Trigger</Text>
              )}
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
          title="Notification Triggers"
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
        title="Notification Triggers"
        showBack
        onBack={() => navigation.goBack()}
        rightContent={
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: colors.primary }]}
            onPress={openAddModal}
          >
            <Icon name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />
      
      {renderStatsBar()}
      
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {triggers.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="notifications-off-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No notification triggers configured
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
              onPress={openAddModal}
            >
              <Icon name="add" size={20} color="#FFFFFF" />
              <Text style={styles.emptyBtnText}>Create First Trigger</Text>
            </TouchableOpacity>
          </View>
        ) : (
          triggers.map(renderTriggerCard)
        )}
      </ScrollView>
      
      {renderEditModal()}
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
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  statLabel: {
    fontSize: 11,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  previewBox: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: 4,
  },
  previewMessage: {
    fontSize: 12,
    lineHeight: 18,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: '#4573DF',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.2)',
    paddingTop: 10,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lastTriggered: {
    fontSize: 11,
  },
  sentCount: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 20,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.semibold,
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
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  modalBody: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
  },
  typeOptionText: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  targetRow: {
    flexDirection: 'row',
    gap: 8,
  },
  targetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  targetOptionText: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  scheduleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  scheduleOption: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
    borderRadius: 10,
  },
  scheduleOptionText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(128,128,128,0.2)',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: 4,
  },
  helpBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  helpText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 14,
    flex: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
});

export default AdminNotificationTriggersScreen;



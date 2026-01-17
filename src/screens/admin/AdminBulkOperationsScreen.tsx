/**
 * Admin Bulk Operations Screen
 * 
 * Provides bulk operation capabilities for efficient admin management:
 * - Bulk user operations (role changes, ban/unban)
 * - Bulk notifications
 * - Bulk content operations
 * - Operation history and results
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/ThemeContext';
import { UniversalHeader } from '../../components';
import { enhancedAdminService, BulkOperationResult } from '../../services/adminEnhanced';
import { adminService } from '../../services/admin';
import { supabase } from '../../services/supabase';

interface UserSelection {
  id: string;
  name: string;
  email: string;
  role: string;
  selected: boolean;
}

type OperationType = 'role_update' | 'ban' | 'unban' | 'notification' | 'delete_content';

interface OperationHistoryItem {
  id: string;
  type: OperationType;
  description: string;
  result: BulkOperationResult;
  timestamp: string;
}

const AdminBulkOperationsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  
  // State
  const [activeTab, setActiveTab] = useState<'users' | 'content' | 'notifications'>('users');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserSelection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCount, setSelectedCount] = useState(0);
  const [operationHistory, setOperationHistory] = useState<OperationHistoryItem[]>([]);
  
  // Modal states
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [banModalVisible, setBanModalVisible] = useState(false);
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('user');
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState<'1d' | '7d' | '30d' | 'permanent'>('7d');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'info' | 'warning' | 'success'>('info');
  const [sendToAll, setSendToAll] = useState(false);

  const roles = [
    { value: 'user', label: 'User', icon: 'person-outline' },
    { value: 'moderator', label: 'Moderator', icon: 'shield-outline' },
    { value: 'content_editor', label: 'Content Editor', icon: 'create-outline' },
    { value: 'admin', label: 'Admin', icon: 'settings-outline' },
  ];

  const banDurations = [
    { value: '1d', label: '1 Day' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: 'permanent', label: 'Permanent' },
  ];

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, is_banned')
        .order('created_at', { ascending: false })
        .limit(100);

      if (data) {
        setUsers(data.map(u => ({
          id: u.id,
          name: u.full_name || 'Unknown',
          email: u.email || '',
          role: u.role || 'user',
          selected: false,
        })));
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setSelectedCount(users.filter(u => u.selected).length);
  }, [users]);

  // Toggle user selection
  const toggleUserSelection = (userId: string) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, selected: !u.selected } : u
    ));
  };

  // Select all users
  const selectAllUsers = () => {
    const allSelected = users.every(u => u.selected);
    setUsers(prev => prev.map(u => ({ ...u, selected: !allSelected })));
  };

  // Clear selection
  const clearSelection = () => {
    setUsers(prev => prev.map(u => ({ ...u, selected: false })));
  };

  // Get selected user IDs
  const getSelectedUserIds = () => users.filter(u => u.selected).map(u => u.id);

  // Bulk role update
  const handleBulkRoleUpdate = async () => {
    const selectedIds = getSelectedUserIds();
    if (selectedIds.length === 0) {
      Alert.alert('No Selection', 'Please select at least one user.');
      return;
    }

    Alert.alert(
      'Confirm Role Change',
      `Change role of ${selectedIds.length} users to "${selectedRole}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'default',
          onPress: async () => {
            setLoading(true);
            setRoleModalVisible(false);
            
            const result = await enhancedAdminService.bulkUpdateUserRoles(
              selectedIds,
              selectedRole,
              'admin' // TODO: Get current admin ID
            );

            addToHistory('role_update', `Role update to ${selectedRole}`, result);
            
            if (result.success) {
              Alert.alert('Success', `Updated ${result.processed} users successfully.`);
              fetchUsers();
              clearSelection();
            } else {
              Alert.alert('Partial Success', `Updated ${result.processed} users. ${result.failed} failed.\n\nErrors:\n${result.errors.slice(0, 3).join('\n')}`);
            }
            
            setLoading(false);
          },
        },
      ]
    );
  };

  // Bulk ban
  const handleBulkBan = async () => {
    const selectedIds = getSelectedUserIds();
    if (selectedIds.length === 0) {
      Alert.alert('No Selection', 'Please select at least one user.');
      return;
    }

    if (!banReason.trim()) {
      Alert.alert('Missing Reason', 'Please provide a ban reason.');
      return;
    }

    let expiresAt: string | undefined;
    if (banDuration !== 'permanent') {
      const days = banDuration === '1d' ? 1 : banDuration === '7d' ? 7 : 30;
      const date = new Date();
      date.setDate(date.getDate() + days);
      expiresAt = date.toISOString();
    }

    Alert.alert(
      'Confirm Ban',
      `Ban ${selectedIds.length} users for ${banDuration === 'permanent' ? 'permanently' : banDuration}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Ban Users',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            setBanModalVisible(false);
            
            const result = await enhancedAdminService.bulkBanUsers(
              selectedIds,
              true,
              banReason,
              expiresAt
            );

            addToHistory('ban', `Banned users (${banDuration})`, result);
            
            if (result.success) {
              Alert.alert('Success', `Banned ${result.processed} users.`);
              fetchUsers();
              clearSelection();
              setBanReason('');
            } else {
              Alert.alert('Partial Success', `Banned ${result.processed} users. ${result.failed} failed.`);
            }
            
            setLoading(false);
          },
        },
      ]
    );
  };

  // Bulk unban
  const handleBulkUnban = async () => {
    const selectedIds = getSelectedUserIds();
    if (selectedIds.length === 0) {
      Alert.alert('No Selection', 'Please select at least one user.');
      return;
    }

    Alert.alert(
      'Confirm Unban',
      `Unban ${selectedIds.length} users?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unban',
          style: 'default',
          onPress: async () => {
            setLoading(true);
            
            const result = await enhancedAdminService.bulkBanUsers(selectedIds, false);
            addToHistory('unban', 'Unbanned users', result);
            
            if (result.success) {
              Alert.alert('Success', `Unbanned ${result.processed} users.`);
              fetchUsers();
              clearSelection();
            } else {
              Alert.alert('Partial Success', `Unbanned ${result.processed} users. ${result.failed} failed.`);
            }
            
            setLoading(false);
          },
        },
      ]
    );
  };

  // Bulk notification
  const handleBulkNotification = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      Alert.alert('Missing Fields', 'Please fill in title and message.');
      return;
    }

    const selectedIds = sendToAll ? 'all' : getSelectedUserIds();
    if (!sendToAll && (selectedIds as string[]).length === 0) {
      Alert.alert('No Selection', 'Please select users or enable "Send to All".');
      return;
    }

    Alert.alert(
      'Confirm Notification',
      `Send notification to ${sendToAll ? 'all users' : `${(selectedIds as string[]).length} users`}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            setLoading(true);
            setNotificationModalVisible(false);
            
            const result = await enhancedAdminService.bulkSendNotifications(
              selectedIds,
              {
                title: notificationTitle,
                message: notificationMessage,
                type: notificationType,
              }
            );

            addToHistory('notification', `Notification: ${notificationTitle}`, result);
            
            if (result.success) {
              Alert.alert('Success', 'Notification sent successfully.');
              setNotificationTitle('');
              setNotificationMessage('');
              clearSelection();
            } else {
              Alert.alert('Failed', result.errors.join('\n'));
            }
            
            setLoading(false);
          },
        },
      ]
    );
  };

  // Add to operation history
  const addToHistory = (type: OperationType, description: string, result: BulkOperationResult) => {
    setOperationHistory(prev => [
      {
        id: Date.now().toString(),
        type,
        description,
        result,
        timestamp: new Date().toISOString(),
      },
      ...prev.slice(0, 19), // Keep last 20
    ]);
  };

  // Filter users by search
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const styles = createStyles(colors, isDark);

  // Render user item
  const renderUserItem = ({ item }: { item: UserSelection }) => (
    <TouchableOpacity
      style={[styles.userItem, item.selected && styles.userItemSelected]}
      onPress={() => toggleUserSelection(item.id)}
    >
      <View style={[styles.checkbox, item.selected && styles.checkboxChecked]}>
        {item.selected && <Icon name="checkmark" size={16} color="#fff" />}
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
      </View>
      <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) }]}>
        <Text style={styles.roleText}>{item.role}</Text>
      </View>
    </TouchableOpacity>
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#8B5CF6';
      case 'moderator': return '#3B82F6';
      case 'content_editor': return '#10B981';
      default: return colors.border;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <UniversalHeader
        title="Bulk Operations"
        showBack
        onBack={() => navigation.goBack()}
        rightContent={
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => setHistoryModalVisible(true)}
          >
            <Icon name="time-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        }
      />

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {(['users', 'content', 'notifications'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Icon
              name={
                tab === 'users' ? 'people-outline' :
                tab === 'content' ? 'document-text-outline' : 'notifications-outline'
              }
              size={20}
              color={activeTab === tab ? '#fff' : colors.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'users' && (
        <>
          {/* Search and Selection Controls */}
          <View style={styles.controlsContainer}>
            <View style={styles.searchContainer}>
              <Icon name="search-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search users..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <View style={styles.selectionControls}>
              <TouchableOpacity style={styles.selectButton} onPress={selectAllUsers}>
                <Text style={styles.selectButtonText}>
                  {users.every(u => u.selected) ? 'Deselect All' : 'Select All'}
                </Text>
              </TouchableOpacity>
              {selectedCount > 0 && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>{selectedCount} selected</Text>
                </View>
              )}
            </View>
          </View>

          {/* User List */}
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
          ) : (
            <FlatList
              data={filteredUsers}
              keyExtractor={(item) => item.id}
              renderItem={renderUserItem}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Icon name="people-outline" size={48} color={colors.textSecondary} />
                  <Text style={styles.emptyText}>No users found</Text>
                </View>
              }
            />
          )}

          {/* Action Buttons */}
          {selectedCount > 0 && (
            <View style={styles.actionBar}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#8B5CF6' }]}
                onPress={() => setRoleModalVisible(true)}
              >
                <Icon name="shield-outline" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Change Role</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
                onPress={() => setBanModalVisible(true)}
              >
                <Icon name="ban-outline" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Ban</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#10B981' }]}
                onPress={handleBulkUnban}
              >
                <Icon name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Unban</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {activeTab === 'notifications' && (
        <ScrollView style={styles.notificationContainer}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Notification Title</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Enter notification title..."
              placeholderTextColor={colors.textSecondary}
              value={notificationTitle}
              onChangeText={setNotificationTitle}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Message</Text>
            <TextInput
              style={[styles.formInput, styles.formTextArea]}
              placeholder="Enter notification message..."
              placeholderTextColor={colors.textSecondary}
              value={notificationMessage}
              onChangeText={setNotificationMessage}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Type</Text>
            <View style={styles.typeButtons}>
              {(['info', 'warning', 'success'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    notificationType === type && styles.typeButtonActive,
                  ]}
                  onPress={() => setNotificationType(type)}
                >
                  <Icon
                    name={
                      type === 'info' ? 'information-circle-outline' :
                      type === 'warning' ? 'warning-outline' : 'checkmark-circle-outline'
                    }
                    size={20}
                    color={notificationType === type ? '#fff' : colors.textSecondary}
                  />
                  <Text style={[
                    styles.typeButtonText,
                    notificationType === type && styles.typeButtonTextActive,
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <View style={styles.switchRow}>
              <Text style={styles.formLabel}>Send to All Users</Text>
              <Switch
                value={sendToAll}
                onValueChange={setSendToAll}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            </View>
            {!sendToAll && (
              <Text style={styles.helperText}>
                Go to Users tab to select specific recipients ({selectedCount} selected)
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.sendButton, (!notificationTitle || !notificationMessage) && styles.sendButtonDisabled]}
            onPress={handleBulkNotification}
            disabled={!notificationTitle || !notificationMessage}
          >
            <Icon name="send-outline" size={20} color="#fff" />
            <Text style={styles.sendButtonText}>Send Notification</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {activeTab === 'content' && (
        <View style={styles.contentTab}>
          <Icon name="construct-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.comingSoonText}>Content bulk operations coming soon</Text>
          <Text style={styles.comingSoonSubtext}>
            Bulk delete, archive, and manage content items
          </Text>
        </View>
      )}

      {/* Role Change Modal */}
      <Modal
        visible={roleModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setRoleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Role</Text>
            <Text style={styles.modalSubtitle}>
              Select new role for {selectedCount} users
            </Text>
            
            {roles.map((role) => (
              <TouchableOpacity
                key={role.value}
                style={[
                  styles.roleOption,
                  selectedRole === role.value && styles.roleOptionSelected,
                ]}
                onPress={() => setSelectedRole(role.value)}
              >
                <Icon name={role.icon as any} size={24} color={selectedRole === role.value ? colors.primary : colors.textSecondary} />
                <Text style={[
                  styles.roleOptionText,
                  selectedRole === role.value && styles.roleOptionTextSelected,
                ]}>
                  {role.label}
                </Text>
                {selectedRole === role.value && (
                  <Icon name="checkmark-circle" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setRoleModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleBulkRoleUpdate}
              >
                <Text style={styles.modalConfirmText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Ban Modal */}
      <Modal
        visible={banModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setBanModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ban Users</Text>
            <Text style={styles.modalSubtitle}>
              Ban {selectedCount} selected users
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Reason</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                placeholder="Enter ban reason..."
                placeholderTextColor={colors.textSecondary}
                value={banReason}
                onChangeText={setBanReason}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Duration</Text>
              <View style={styles.durationButtons}>
                {banDurations.map((dur) => (
                  <TouchableOpacity
                    key={dur.value}
                    style={[
                      styles.durationButton,
                      banDuration === dur.value && styles.durationButtonActive,
                    ]}
                    onPress={() => setBanDuration(dur.value as any)}
                  >
                    <Text style={[
                      styles.durationButtonText,
                      banDuration === dur.value && styles.durationButtonTextActive,
                    ]}>
                      {dur.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setBanModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmButton, { backgroundColor: '#EF4444' }]}
                onPress={handleBulkBan}
              >
                <Text style={styles.modalConfirmText}>Ban Users</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* History Modal */}
      <Modal
        visible={historyModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setHistoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Operation History</Text>
              <TouchableOpacity onPress={() => setHistoryModalVisible(false)}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={operationHistory}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.historyItem}>
                  <View style={styles.historyHeader}>
                    <Icon
                      name={
                        item.type === 'role_update' ? 'shield-outline' :
                        item.type === 'ban' ? 'ban-outline' :
                        item.type === 'unban' ? 'checkmark-circle-outline' : 'notifications-outline'
                      }
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.historyDescription}>{item.description}</Text>
                  </View>
                  <View style={styles.historyDetails}>
                    <Text style={styles.historyResult}>
                      ✓ {item.result.processed} succeeded
                      {item.result.failed > 0 && ` • ✗ ${item.result.failed} failed`}
                    </Text>
                    <Text style={styles.historyTime}>
                      {new Date(item.timestamp).toLocaleString()}
                    </Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Icon name="time-outline" size={48} color={colors.textSecondary} />
                  <Text style={styles.emptyText}>No operations yet</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  historyButton: {
    padding: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#fff',
  },
  controlsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: colors.text,
  },
  selectionControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  selectedBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: colors.primary + '20',
  },
  selectedBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: colors.surface,
    borderRadius: 12,
    gap: 12,
  },
  userItemSelected: {
    backgroundColor: colors.primary + '15',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  userEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  notificationContainer: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formTextArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  helperText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 8,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    marginTop: 20,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  contentTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  comingSoonSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
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
    padding: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  roleOptionSelected: {
    backgroundColor: colors.primary + '15',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  roleOptionText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  roleOptionTextSelected: {
    fontWeight: '600',
    color: colors.primary,
  },
  durationButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  durationButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  durationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  durationButtonTextActive: {
    color: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  historyItem: {
    padding: 14,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  historyDescription: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  historyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  historyResult: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  historyTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default AdminBulkOperationsScreen;

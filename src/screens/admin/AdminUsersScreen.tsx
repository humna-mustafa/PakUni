/**
 * Admin User Management Screen
 * Manage users, roles, bans, and verifications
 */

import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../../contexts/ThemeContext';
import {adminService, UserProfile, UserRole} from '../../services/admin';
import {Icon} from '../../components/icons';
import {PremiumLoading} from '../../components/PremiumLoading';
import {PremiumSearchBar} from '../../components/PremiumSearchBar';

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

const ROLES: {value: UserRole; label: string; color: string}[] = [
  {value: 'user', label: 'User', color: '#6B7280'},
  {value: 'moderator', label: 'Moderator', color: '#059669'},
  {value: 'content_editor', label: 'Content Editor', color: '#2563EB'},
  {value: 'admin', label: 'Admin', color: '#DC2626'},
  {value: 'super_admin', label: 'Super Admin', color: '#9333EA'},
];

interface UserCardProps {
  user: UserProfile;
  onPress: () => void;
  colors: any;
}

const UserCard: React.FC<UserCardProps> = ({user, onPress, colors}) => {
  const getRoleColor = (role: UserRole) => {
    return ROLES.find(r => r.value === role)?.color || '#6B7280';
  };

  return (
    <TouchableOpacity
      style={[styles.userCard, {backgroundColor: colors.card}]}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={[styles.avatar, {backgroundColor: colors.primaryLight}]}>
        {user.avatar_url ? (
          <Text style={[styles.avatarText, {color: colors.primary}]}>
            {user.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
          </Text>
        ) : (
          <Icon name="person" family="Ionicons" size={24} color={colors.primary} />
        )}
      </View>

      <View style={styles.userInfo}>
        <Text style={[styles.userName, {color: colors.text}]} numberOfLines={1}>
          {user.full_name || 'No Name'}
        </Text>
        <Text style={[styles.userEmail, {color: colors.textSecondary}]} numberOfLines={1}>
          {user.email || 'No Email'}
        </Text>
        <View style={styles.userMeta}>
          <View style={[styles.roleBadge, {backgroundColor: getRoleColor(user.role) + '20'}]}>
            <Text style={[styles.roleText, {color: getRoleColor(user.role)}]}>
              {user.role.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          {user.is_banned && (
            <View style={[styles.statusBadge, {backgroundColor: '#EF444420'}]}>
              <Icon name="ban" family="Ionicons" size={10} color="#EF4444" />
              <Text style={styles.bannedText}>Banned</Text>
            </View>
          )}
          {user.is_verified && (
            <Icon name="checkmark-circle" family="Ionicons" size={16} color="#10B981" />
          )}
        </View>
      </View>

      <Icon name="chevron-forward" family="Ionicons" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
};

const AdminUsersScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors, isDark} = useTheme();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showBannedOnly, setShowBannedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  // User detail modal
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState('');

  useEffect(() => {
    loadUsers(true);
  }, [searchQuery, selectedRole, showBannedOnly]);

  const loadUsers = async (reset = false) => {
    try {
      if (reset) {
        setPage(1);
        setLoading(true);
      }

      const currentPage = reset ? 1 : page;
      const {users: fetchedUsers, total} = await adminService.getUsers({
        page: currentPage,
        pageSize: 20,
        search: searchQuery || undefined,
        role: selectedRole || undefined,
        isBanned: showBannedOnly ? true : undefined,
      });

      if (reset) {
        setUsers(fetchedUsers);
      } else {
        setUsers(prev => [...prev, ...fetchedUsers]);
      }

      setTotalUsers(total);
      setHasMore(fetchedUsers.length === 20);
      setPage(currentPage + 1);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadUsers(true);
  }, [searchQuery, selectedRole, showBannedOnly]);

  const loadMore = () => {
    if (!loading && hasMore) {
      loadUsers(false);
    }
  };

  const handleUserPress = (user: UserProfile) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleChangeRole = async (newRole: UserRole) => {
    if (!selectedUser) return;

    Alert.alert(
      'Change Role',
      `Are you sure you want to change ${selectedUser.full_name || selectedUser.email}'s role to ${newRole.replace('_', ' ')}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Change',
          onPress: async () => {
            const success = await adminService.updateUserRole(selectedUser.id, newRole);
            if (success) {
              setSelectedUser({...selectedUser, role: newRole});
              loadUsers(true);
              Alert.alert('Success', 'User role updated successfully');
            } else {
              Alert.alert('Error', 'Failed to update user role');
            }
            setShowRoleModal(false);
          },
        },
      ]
    );
  };

  const handleBanUser = async () => {
    if (!selectedUser || !banReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for the ban');
      return;
    }

    const success = await adminService.banUser(selectedUser.id, banReason);
    if (success) {
      setSelectedUser({...selectedUser, is_banned: true, ban_reason: banReason});
      loadUsers(true);
      Alert.alert('Success', 'User has been banned');
    } else {
      Alert.alert('Error', 'Failed to ban user');
    }
    setShowBanModal(false);
    setBanReason('');
  };

  const handleUnbanUser = async () => {
    if (!selectedUser) return;

    Alert.alert(
      'Unban User',
      `Are you sure you want to unban ${selectedUser.full_name || selectedUser.email}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Unban',
          onPress: async () => {
            const success = await adminService.unbanUser(selectedUser.id);
            if (success) {
              setSelectedUser({...selectedUser, is_banned: false, ban_reason: null});
              loadUsers(true);
              Alert.alert('Success', 'User has been unbanned');
            } else {
              Alert.alert('Error', 'Failed to unban user');
            }
          },
        },
      ]
    );
  };

  const handleVerifyUser = async () => {
    if (!selectedUser) return;

    const success = await adminService.verifyUser(selectedUser.id);
    if (success) {
      setSelectedUser({...selectedUser, is_verified: true});
      loadUsers(true);
      Alert.alert('Success', 'User has been verified');
    } else {
      Alert.alert('Error', 'Failed to verify user');
    }
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      {/* Search Bar - Consistent Design */}
      <View style={styles.searchWrapper}>
        <PremiumSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Search users..."
          variant="default"
          size="md"
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersRow}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            {backgroundColor: colors.card},
            showBannedOnly && {backgroundColor: colors.error + '20', borderColor: colors.error},
          ]}
          onPress={() => setShowBannedOnly(!showBannedOnly)}>
          <Icon
            name={showBannedOnly ? 'ban' : 'ban-outline'}
            family="Ionicons"
            size={14}
            color={showBannedOnly ? colors.error : colors.textSecondary}
          />
          <Text style={[styles.filterText, {color: showBannedOnly ? colors.error : colors.textSecondary}]}>
            Banned
          </Text>
        </TouchableOpacity>

        {ROLES.map(role => (
          <TouchableOpacity
            key={role.value}
            style={[
              styles.filterChip,
              {backgroundColor: colors.card},
              selectedRole === role.value && {backgroundColor: role.color + '20', borderColor: role.color},
            ]}
            onPress={() => setSelectedRole(selectedRole === role.value ? null : role.value)}>
            <Text
              style={[
                styles.filterText,
                {color: selectedRole === role.value ? role.color : colors.textSecondary},
              ]}>
              {role.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.resultCount, {color: colors.textSecondary}]}>
        {totalUsers} users found
      </Text>
    </View>
  );

  const renderUser = ({item}: {item: UserProfile}) => (
    <UserCard user={item} onPress={() => handleUserPress(item)} colors={colors} />
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <LinearGradient
          colors={isDark ? ['#1E3A5F', '#1E1E2E'] : ['#1A7AEB', '#0D5BC4']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" family="Ionicons" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>User Management</Text>
            <Text style={styles.headerSubtitle}>Manage users, roles & permissions</Text>
          </View>
        </LinearGradient>

        {/* User List */}
        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={item => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && !refreshing ? (
              <PremiumLoading variant="minimal" size="small" />
            ) : null
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyState}>
                <Icon name="people-outline" family="Ionicons" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, {color: colors.textSecondary}]}>No users found</Text>
              </View>
            ) : null
          }
        />

        {/* User Detail Modal */}
        <Modal visible={showUserModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, {backgroundColor: colors.card}]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, {color: colors.text}]}>User Details</Text>
                <TouchableOpacity onPress={() => setShowUserModal(false)}>
                  <Icon name="close" family="Ionicons" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {selectedUser && (
                <>
                  <View style={[styles.userDetailHeader, {backgroundColor: colors.background}]}>
                    <View style={[styles.largeAvatar, {backgroundColor: colors.primaryLight}]}>
                      <Text style={[styles.largeAvatarText, {color: colors.primary}]}>
                        {selectedUser.full_name?.charAt(0) || selectedUser.email?.charAt(0) || '?'}
                      </Text>
                    </View>
                    <Text style={[styles.detailName, {color: colors.text}]}>
                      {selectedUser.full_name || 'No Name'}
                    </Text>
                    <Text style={[styles.detailEmail, {color: colors.textSecondary}]}>
                      {selectedUser.email || 'No Email'}
                    </Text>
                  </View>

                  <View style={styles.detailSection}>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Role</Text>
                      <Text style={[styles.detailValue, {color: colors.text}]}>
                        {selectedUser.role.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Status</Text>
                      <Text style={[styles.detailValue, {color: selectedUser.is_banned ? colors.error : '#10B981'}]}>
                        {selectedUser.is_banned ? 'Banned' : 'Active'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Verified</Text>
                      <Text style={[styles.detailValue, {color: selectedUser.is_verified ? '#10B981' : colors.textSecondary}]}>
                        {selectedUser.is_verified ? 'Yes' : 'No'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Login Count</Text>
                      <Text style={[styles.detailValue, {color: colors.text}]}>{selectedUser.login_count}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Last Login</Text>
                      <Text style={[styles.detailValue, {color: colors.text}]}>
                        {selectedUser.last_login_at
                          ? new Date(selectedUser.last_login_at).toLocaleDateString()
                          : 'Never'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Joined</Text>
                      <Text style={[styles.detailValue, {color: colors.text}]}>
                        {new Date(selectedUser.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionBtn, {backgroundColor: '#3B82F6'}]}
                      onPress={() => setShowRoleModal(true)}>
                      <Icon name="shield-outline" family="Ionicons" size={18} color="#FFFFFF" />
                      <Text style={styles.actionBtnText}>Change Role</Text>
                    </TouchableOpacity>

                    {!selectedUser.is_verified && (
                      <TouchableOpacity
                        style={[styles.actionBtn, {backgroundColor: '#10B981'}]}
                        onPress={handleVerifyUser}>
                        <Icon name="checkmark-circle-outline" family="Ionicons" size={18} color="#FFFFFF" />
                        <Text style={styles.actionBtnText}>Verify</Text>
                      </TouchableOpacity>
                    )}

                    {selectedUser.is_banned ? (
                      <TouchableOpacity
                        style={[styles.actionBtn, {backgroundColor: '#F59E0B'}]}
                        onPress={handleUnbanUser}>
                        <Icon name="checkmark" family="Ionicons" size={18} color="#FFFFFF" />
                        <Text style={styles.actionBtnText}>Unban</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.actionBtn, {backgroundColor: '#EF4444'}]}
                        onPress={() => setShowBanModal(true)}>
                        <Icon name="ban" family="Ionicons" size={18} color="#FFFFFF" />
                        <Text style={styles.actionBtnText}>Ban</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>

        {/* Role Selection Modal */}
        <Modal visible={showRoleModal} animationType="fade" transparent>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowRoleModal(false)}>
            <View style={[styles.roleModalContent, {backgroundColor: colors.card}]}>
              <Text style={[styles.modalTitle, {color: colors.text, marginBottom: 16}]}>Select Role</Text>
              {ROLES.map(role => (
                <TouchableOpacity
                  key={role.value}
                  style={[
                    styles.roleOption,
                    {backgroundColor: colors.background},
                    selectedUser?.role === role.value && {borderColor: role.color, borderWidth: 2},
                  ]}
                  onPress={() => handleChangeRole(role.value)}>
                  <View style={[styles.roleOptionDot, {backgroundColor: role.color}]} />
                  <Text style={[styles.roleOptionText, {color: colors.text}]}>{role.label}</Text>
                  {selectedUser?.role === role.value && (
                    <Icon name="checkmark" family="Ionicons" size={18} color={role.color} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Ban Modal */}
        <Modal visible={showBanModal} animationType="fade" transparent>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowBanModal(false)}>
            <View style={[styles.banModalContent, {backgroundColor: colors.card}]}>
              <Text style={[styles.modalTitle, {color: colors.text}]}>Ban User</Text>
              <Text style={[styles.banWarning, {color: colors.textSecondary}]}>
                This will prevent the user from accessing the app.
              </Text>
              <TextInput
                style={[styles.banReasonInput, {backgroundColor: colors.background, color: colors.text}]}
                placeholder="Reason for ban..."
                placeholderTextColor={colors.placeholder}
                value={banReason}
                onChangeText={setBanReason}
                multiline
                numberOfLines={3}
              />
              <View style={styles.banModalButtons}>
                <TouchableOpacity
                  style={[styles.cancelBtn, {borderColor: colors.border}]}
                  onPress={() => setShowBanModal(false)}>
                  <Text style={[styles.cancelBtnText, {color: colors.text}]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmBanBtn} onPress={handleBanUser}>
                  <Text style={styles.confirmBanText}>Ban User</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
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
  listContent: {
    padding: 16,
  },
  listHeader: {
    marginBottom: 16,
  },
  // Unified search wrapper
  searchWrapper: {
    marginBottom: 12,
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
  },
  resultCount: {
    fontSize: 13,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  bannedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#EF4444',
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
    paddingBottom: 32,
    maxHeight: '80%',
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
  userDetailHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  largeAvatarText: {
    fontSize: 32,
    fontWeight: '700',
  },
  detailName: {
    fontSize: 20,
    fontWeight: '700',
  },
  detailEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  detailSection: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  roleModalContent: {
    margin: 20,
    borderRadius: 16,
    padding: 16,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  roleOptionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  roleOptionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  banModalContent: {
    margin: 20,
    borderRadius: 16,
    padding: 16,
  },
  banWarning: {
    fontSize: 13,
    marginTop: 8,
    marginBottom: 16,
  },
  banReasonInput: {
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  banModalButtons: {
    flexDirection: 'row',
    gap: 12,
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
  confirmBanBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  confirmBanText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AdminUsersScreen;

/**
 * Admin Audit Logs Screen
 * View system activity and admin action history
 */

import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../../contexts/ThemeContext';
import {adminService, AuditLog} from '../../services/admin';
import {logger} from '../../utils/logger';
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

const ACTION_CONFIG: Record<string, {icon: string; color: string}> = {
  create: {icon: 'add-circle-outline', color: '#10B981'},
  update: {icon: 'create-outline', color: '#3B82F6'},
  delete: {icon: 'trash-outline', color: '#EF4444'},
  login: {icon: 'log-in-outline', color: '#8B5CF6'},
  logout: {icon: 'log-out-outline', color: '#6B7280'},
  ban: {icon: 'ban-outline', color: '#EF4444'},
  unban: {icon: 'checkmark-circle-outline', color: '#10B981'},
  role_change: {icon: 'shield-outline', color: '#F59E0B'},
  settings_change: {icon: 'settings-outline', color: '#3B82F6'},
  default: {icon: 'ellipse-outline', color: '#6B7280'},
};

const ACTION_TYPES = ['all', 'create', 'update', 'delete', 'login', 'logout', 'ban', 'role_change', 'settings_change'];

const AdminAuditLogsScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors, isDark} = useTheme();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedAction, setSelectedAction] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    loadLogs(1, true);
  }, [selectedAction]);

  const loadLogs = async (pageNum: number, reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      }
      
      const {logs: data, hasMore: more} = await adminService.getAuditLogs({
        action: selectedAction === 'all' ? undefined : selectedAction,
        page: pageNum,
        limit: 20,
      });
      
      if (reset) {
        setLogs(data);
      } else {
        setLogs(prev => [...prev, ...data]);
      }
      setHasMore(more);
      setPage(pageNum);
    } catch (error) {
      logger.error('Error loading audit logs', error, 'AdminAuditLogs');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadLogs(1, true);
  }, [selectedAction]);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      loadLogs(page + 1);
    }
  };

  const handleViewLog = (log: AuditLog) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const getActionConfig = (action: string) => {
    return ACTION_CONFIG[action] || ACTION_CONFIG.default;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(query) ||
      (log.entity_type && log.entity_type.toLowerCase().includes(query)) ||
      (log.target_type && log.target_type.toLowerCase().includes(query)) ||
      (log.description && log.description.toLowerCase().includes(query))
    );
  });

  const renderLog = ({item}: {item: AuditLog}) => {
    const config = getActionConfig(item.action);

    return (
      <TouchableOpacity
        style={[styles.logCard, {backgroundColor: colors.card}]}
        onPress={() => handleViewLog(item)}>
        <View style={[styles.actionIcon, {backgroundColor: config.color + '20'}]}>
          <Icon name={config.icon} family="Ionicons" size={18} color={config.color} />
        </View>
        
        <View style={styles.logContent}>
          <View style={styles.logHeader}>
            <Text style={[styles.logAction, {color: colors.text}]}>
              {item.action.charAt(0).toUpperCase() + item.action.slice(1).replace('_', ' ')}
            </Text>
            <Text style={[styles.logTime, {color: colors.textSecondary}]}>
              {formatTimestamp(item.created_at)}
            </Text>
          </View>
          
          <Text style={[styles.logDescription, {color: colors.textSecondary}]} numberOfLines={2}>
            {item.description || `${item.action} on ${item.entity_type}`}
          </Text>
          
          <View style={styles.logMeta}>
            <View style={[styles.metaBadge, {backgroundColor: colors.background}]}>
              <Icon name="cube-outline" family="Ionicons" size={12} color={colors.textSecondary} />
              <Text style={[styles.metaText, {color: colors.textSecondary}]}>
                {item.entity_type}
              </Text>
            </View>
            {item.ip_address && (
              <View style={[styles.metaBadge, {backgroundColor: colors.background}]}>
                <Icon name="globe-outline" family="Ionicons" size={12} color={colors.textSecondary} />
                <Text style={[styles.metaText, {color: colors.textSecondary}]}>
                  {item.ip_address}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        <Icon name="chevron-forward" family="Ionicons" size={18} color={colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <LinearGradient
          colors={isDark ? ['#1E3A5F', '#1E1E2E'] : ['#374151', '#1F2937']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" family="Ionicons" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Audit Logs</Text>
            <Text style={styles.headerSubtitle}>System activity history</Text>
          </View>
        </LinearGradient>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBox, {backgroundColor: colors.card}]}>
            <Icon name="search-outline" family="Ionicons" size={18} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, {color: colors.text}]}
              placeholder="Search logs..."
              placeholderTextColor={colors.placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close-circle" family="Ionicons" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Action Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}>
          {ACTION_TYPES.map(action => {
            const config = action === 'all' 
              ? {icon: 'list-outline', color: colors.primary}
              : getActionConfig(action);
            const isSelected = selectedAction === action;
            
            return (
              <TouchableOpacity
                key={action}
                style={[
                  styles.filterChip,
                  {backgroundColor: isSelected ? config.color + '20' : colors.card},
                ]}
                onPress={() => setSelectedAction(action)}>
                <Icon
                  name={config.icon}
                  family="Ionicons"
                  size={14}
                  color={isSelected ? config.color : colors.textSecondary}
                />
                <Text style={[
                  styles.filterText,
                  {color: isSelected ? config.color : colors.textSecondary},
                ]}>
                  {action.charAt(0).toUpperCase() + action.slice(1).replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Logs List */}
        <FlatList
          data={filteredLogs}
          renderItem={renderLog}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator style={styles.loader} color={colors.primary} />
            ) : loading && !refreshing ? (
              <ActivityIndicator style={styles.loader} color={colors.primary} />
            ) : null
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyState}>
                <Icon name="document-text-outline" family="Ionicons" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, {color: colors.textSecondary}]}>No audit logs found</Text>
              </View>
            ) : null
          }
        />

        {/* Detail Modal */}
        <Modal visible={showDetailModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, {backgroundColor: colors.card}]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, {color: colors.text}]}>Log Details</Text>
                <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                  <Icon name="close" family="Ionicons" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {selectedLog && (
                <ScrollView style={styles.modalBody}>
                  {/* Action */}
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Action</Text>
                    <View style={[styles.actionBadge, {backgroundColor: getActionConfig(selectedLog.action).color + '20'}]}>
                      <Icon
                        name={getActionConfig(selectedLog.action).icon}
                        family="Ionicons"
                        size={14}
                        color={getActionConfig(selectedLog.action).color}
                      />
                      <Text style={[styles.actionBadgeText, {color: getActionConfig(selectedLog.action).color}]}>
                        {selectedLog.action.charAt(0).toUpperCase() + selectedLog.action.slice(1).replace('_', ' ')}
                      </Text>
                    </View>
                  </View>

                  {/* Entity Type */}
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Entity Type</Text>
                    <Text style={[styles.detailValue, {color: colors.text}]}>
                      {selectedLog.entity_type}
                    </Text>
                  </View>

                  {/* Entity ID */}
                  {selectedLog.entity_id && (
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Entity ID</Text>
                      <Text style={[styles.detailValueMono, {color: colors.text}]}>
                        {selectedLog.entity_id}
                      </Text>
                    </View>
                  )}

                  {/* Description */}
                  {selectedLog.description && (
                    <View style={styles.detailBlock}>
                      <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Description</Text>
                      <Text style={[styles.detailText, {color: colors.text}]}>
                        {selectedLog.description}
                      </Text>
                    </View>
                  )}

                  {/* Performed By */}
                  {selectedLog.performed_by && (
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Performed By</Text>
                      <Text style={[styles.detailValueMono, {color: colors.text}]}>
                        {selectedLog.performed_by}
                      </Text>
                    </View>
                  )}

                  {/* IP Address */}
                  {selectedLog.ip_address && (
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>IP Address</Text>
                      <Text style={[styles.detailValueMono, {color: colors.text}]}>
                        {selectedLog.ip_address}
                      </Text>
                    </View>
                  )}

                  {/* User Agent */}
                  {selectedLog.user_agent && (
                    <View style={styles.detailBlock}>
                      <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>User Agent</Text>
                      <Text style={[styles.detailText, {color: colors.text}]} numberOfLines={3}>
                        {selectedLog.user_agent}
                      </Text>
                    </View>
                  )}

                  {/* Timestamp */}
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Timestamp</Text>
                    <Text style={[styles.detailValue, {color: colors.text}]}>
                      {new Date(selectedLog.created_at).toLocaleString()}
                    </Text>
                  </View>

                  {/* Old Value */}
                  {selectedLog.old_value && (
                    <View style={styles.detailBlock}>
                      <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Previous Value</Text>
                      <View style={[styles.jsonBlock, {backgroundColor: colors.background}]}>
                        <Text style={[styles.jsonText, {color: colors.text}]}>
                          {typeof selectedLog.old_value === 'object'
                            ? JSON.stringify(selectedLog.old_value, null, 2)
                            : String(selectedLog.old_value)}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* New Value */}
                  {selectedLog.new_value && (
                    <View style={styles.detailBlock}>
                      <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>New Value</Text>
                      <View style={[styles.jsonBlock, {backgroundColor: colors.background}]}>
                        <Text style={[styles.jsonText, {color: colors.text}]}>
                          {typeof selectedLog.new_value === 'object'
                            ? JSON.stringify(selectedLog.new_value, null, 2)
                            : String(selectedLog.new_value)}
                        </Text>
                      </View>
                    </View>
                  )}
                </ScrollView>
              )}
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  filterScroll: {
    flexGrow: 0,
    marginTop: 12,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingTop: 12,
  },
  logCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logAction: {
    fontSize: 14,
    fontWeight: '600',
  },
  logTime: {
    fontSize: 11,
  },
  logDescription: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  logMeta: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  metaText: {
    fontSize: 10,
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
    maxHeight: '85%',
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
  detailValueMono: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  detailText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  actionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  actionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  jsonBlock: {
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  jsonText: {
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
});

export default AdminAuditLogsScreen;

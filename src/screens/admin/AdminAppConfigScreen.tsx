/**
 * Admin App Configuration Screen
 * 
 * Comprehensive configuration management:
 * - Feature flags with rollout controls
 * - App settings by category
 * - Maintenance mode toggle
 * - Remote configuration
 * - Backup and restore
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/ThemeContext';
import { UniversalHeader } from '../../components';
import {
  enhancedAdminService,
  AppConfig,
  FeatureFlag,
  BackupInfo,
} from '../../services/adminEnhanced';

type TabType = 'settings' | 'features' | 'backup';

const AdminAppConfigScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  
  // State
  const [activeTab, setActiveTab] = useState<TabType>('settings');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [configs, setConfigs] = useState<AppConfig[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Modal states
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [flagModalVisible, setFlagModalVisible] = useState(false);
  const [backupModalVisible, setBackupModalVisible] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<AppConfig | null>(null);
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);
  const [editValue, setEditValue] = useState<any>(null);

  const categories = [
    { key: 'all', label: 'All', icon: 'grid-outline' },
    { key: 'general', label: 'General', icon: 'settings-outline' },
    { key: 'features', label: 'Features', icon: 'bulb-outline' },
    { key: 'notifications', label: 'Notifications', icon: 'notifications-outline' },
    { key: 'content', label: 'Content', icon: 'document-text-outline' },
    { key: 'security', label: 'Security', icon: 'shield-outline' },
    { key: 'maintenance', label: 'Maintenance', icon: 'construct-outline' },
  ];

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      const [configsData, flagsData, backupsData] = await Promise.all([
        enhancedAdminService.getAppConfigs(),
        enhancedAdminService.getFeatureFlags(),
        enhancedAdminService.getBackupList(),
      ]);
      setConfigs(configsData);
      setFeatureFlags(flagsData);
      setBackups(backupsData);
    } catch (error) {
      console.error('Failed to fetch config data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Filter configs
  const filteredConfigs = configs.filter(config => {
    const matchesSearch = config.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          config.key.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || config.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Update config
  const handleUpdateConfig = async () => {
    if (!selectedConfig) return;
    
    setLoading(true);
    const success = await enhancedAdminService.updateAppConfig(selectedConfig.key, editValue);
    
    if (success) {
      Alert.alert('Success', 'Configuration updated successfully.');
      fetchData();
    } else {
      Alert.alert('Error', 'Failed to update configuration.');
    }
    
    setEditModalVisible(false);
    setSelectedConfig(null);
    setLoading(false);
  };

  // Toggle feature flag
  const handleToggleFlag = async (flag: FeatureFlag) => {
    setLoading(true);
    const success = await enhancedAdminService.updateFeatureFlag(flag.key, { enabled: !flag.enabled });
    
    if (success) {
      fetchData();
    } else {
      Alert.alert('Error', 'Failed to update feature flag.');
    }
    setLoading(false);
  };

  // Update feature flag
  const handleUpdateFlag = async () => {
    if (!selectedFlag) return;
    
    setLoading(true);
    const success = await enhancedAdminService.updateFeatureFlag(selectedFlag.key, {
      rollout_percentage: editValue.rollout_percentage,
      target_roles: editValue.target_roles,
    });
    
    if (success) {
      Alert.alert('Success', 'Feature flag updated successfully.');
      fetchData();
    } else {
      Alert.alert('Error', 'Failed to update feature flag.');
    }
    
    setFlagModalVisible(false);
    setSelectedFlag(null);
    setLoading(false);
  };

  // Create backup
  const handleCreateBackup = async (type: 'full' | 'partial' | 'config_only') => {
    setLoading(true);
    const backup = await enhancedAdminService.createBackup({
      type,
      notes: `Manual backup - ${type}`,
    });
    
    if (backup) {
      Alert.alert('Success', `Backup created successfully.\nSize: ${(backup.size_bytes / 1024).toFixed(2)} KB`);
      fetchData();
    } else {
      Alert.alert('Error', 'Failed to create backup.');
    }
    
    setBackupModalVisible(false);
    setLoading(false);
  };

  // Restore backup
  const handleRestoreBackup = (backup: BackupInfo) => {
    Alert.alert(
      'Restore Backup',
      `Are you sure you want to restore from "${backup.name}"?\n\nThis will overwrite current configurations.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const result = await enhancedAdminService.restoreBackup(backup.id);
            
            if (result.success) {
              Alert.alert('Success', `Restored: ${result.restored.join(', ')}`);
              fetchData();
            } else {
              Alert.alert('Error', 'Failed to restore backup.');
            }
            setLoading(false);
          },
        },
      ]
    );
  };

  // Delete backup
  const handleDeleteBackup = (backup: BackupInfo) => {
    Alert.alert(
      'Delete Backup',
      `Delete "${backup.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await enhancedAdminService.deleteBackup(backup.id);
            if (success) {
              fetchData();
            }
          },
        },
      ]
    );
  };

  // Open edit modal
  const openEditModal = (config: AppConfig) => {
    setSelectedConfig(config);
    setEditValue(config.value);
    setEditModalVisible(true);
  };

  // Open flag modal
  const openFlagModal = (flag: FeatureFlag) => {
    setSelectedFlag(flag);
    setEditValue({
      rollout_percentage: flag.rollout_percentage,
      target_roles: flag.target_roles,
    });
    setFlagModalVisible(true);
  };

  const styles = createStyles(colors, isDark);

  // Render config item
  const renderConfigItem = (config: AppConfig) => {
    const getCategoryIcon = (category: string) => {
      return categories.find(c => c.key === category)?.icon || 'settings-outline';
    };

    return (
      <TouchableOpacity
        key={config.key}
        style={styles.configItem}
        onPress={() => openEditModal(config)}
        disabled={config.is_sensitive}
      >
        <View style={styles.configHeader}>
          <View style={[styles.configIcon, { backgroundColor: colors.primary + '20' }]}>
            <Icon name={getCategoryIcon(config.category) as any} size={18} color={colors.primary} />
          </View>
          <View style={styles.configInfo}>
            <Text style={styles.configLabel}>{config.label}</Text>
            <Text style={styles.configDescription} numberOfLines={2}>
              {config.description}
            </Text>
          </View>
        </View>
        <View style={styles.configValue}>
          {config.type === 'boolean' ? (
            <Switch
              value={config.value}
              onValueChange={async (val) => {
                await enhancedAdminService.updateAppConfig(config.key, val);
                fetchData();
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          ) : (
            <View style={styles.configValueContainer}>
              <Text style={styles.configValueText} numberOfLines={1}>
                {config.is_sensitive ? '••••••••' : String(config.value)}
              </Text>
              <Icon name="chevron-forward" size={16} color={colors.textSecondary} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Render feature flag
  const renderFeatureFlag = (flag: FeatureFlag) => (
    <View key={flag.key} style={styles.flagItem}>
      <View style={styles.flagHeader}>
        <View style={styles.flagInfo}>
          <Text style={styles.flagKey}>{flag.key.replace(/_/g, ' ').toUpperCase()}</Text>
          <Text style={styles.flagDescription}>{flag.description}</Text>
        </View>
        <Switch
          value={flag.enabled}
          onValueChange={() => handleToggleFlag(flag)}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#fff"
        />
      </View>
      
      <View style={styles.flagDetails}>
        <View style={styles.flagDetail}>
          <Icon name="pie-chart-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.flagDetailText}>Rollout: {flag.rollout_percentage}%</Text>
        </View>
        
        {flag.target_roles.length > 0 && (
          <View style={styles.flagDetail}>
            <Icon name="people-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.flagDetailText}>Roles: {flag.target_roles.join(', ')}</Text>
          </View>
        )}
        
        <TouchableOpacity
          style={styles.flagEditButton}
          onPress={() => openFlagModal(flag)}
        >
          <Icon name="create-outline" size={14} color={colors.primary} />
          <Text style={styles.flagEditText}>Configure</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render backup item
  const renderBackupItem = (backup: BackupInfo) => (
    <View key={backup.id} style={styles.backupItem}>
      <View style={styles.backupHeader}>
        <View style={[styles.backupIcon, { backgroundColor: colors.primary + '20' }]}>
          <Icon name="archive-outline" size={20} color={colors.primary} />
        </View>
        <View style={styles.backupInfo}>
          <Text style={styles.backupName}>{backup.name}</Text>
          <Text style={styles.backupDate}>
            {new Date(backup.created_at).toLocaleString()}
          </Text>
        </View>
        <View style={[styles.backupBadge, { backgroundColor: getBackupTypeColor(backup.type) }]}>
          <Text style={styles.backupBadgeText}>{backup.type.replace('_', ' ')}</Text>
        </View>
      </View>
      
      <View style={styles.backupDetails}>
        <Text style={styles.backupSize}>
          Size: {(backup.size_bytes / 1024).toFixed(2)} KB
        </Text>
        <Text style={styles.backupTables}>
          Tables: {backup.tables.join(', ')}
        </Text>
      </View>
      
      <View style={styles.backupActions}>
        <TouchableOpacity
          style={[styles.backupAction, { backgroundColor: colors.primary }]}
          onPress={() => handleRestoreBackup(backup)}
        >
          <Icon name="refresh-outline" size={16} color="#fff" />
          <Text style={styles.backupActionText}>Restore</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.backupAction, { backgroundColor: '#EF4444' }]}
          onPress={() => handleDeleteBackup(backup)}
        >
          <Icon name="trash-outline" size={16} color="#fff" />
          <Text style={styles.backupActionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getBackupTypeColor = (type: string) => {
    switch (type) {
      case 'full': return '#10B981';
      case 'partial': return '#3B82F6';
      case 'config_only': return '#8B5CF6';
      default: return colors.border;
    }
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <UniversalHeader
          title="App Configuration"
          showBack
          onBack={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading configurations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <UniversalHeader
        title="App Configuration"
        showBack
        onBack={() => navigation.goBack()}
      />

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {(['settings', 'features', 'backup'] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Icon
              name={
                tab === 'settings' ? 'settings-outline' :
                tab === 'features' ? 'toggle-outline' : 'archive-outline'
              }
              size={20}
              color={activeTab === tab ? '#fff' : colors.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'features' ? 'Feature Flags' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {activeTab === 'settings' && (
          <>
            {/* Search and Filter */}
            <View style={styles.searchContainer}>
              <Icon name="search-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search settings..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Category Filter */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesContainer}
              contentContainerStyle={styles.categoriesContent}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.categoryChip,
                    selectedCategory === cat.key && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory(cat.key)}
                >
                  <Icon
                    name={cat.icon as any}
                    size={16}
                    color={selectedCategory === cat.key ? '#fff' : colors.textSecondary}
                  />
                  <Text style={[
                    styles.categoryChipText,
                    selectedCategory === cat.key && styles.categoryChipTextActive,
                  ]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Maintenance Mode Banner */}
            {configs.find(c => c.key === 'maintenance_mode')?.value && (
              <View style={styles.maintenanceBanner}>
                <Icon name="warning-outline" size={24} color="#fff" />
                <View style={styles.maintenanceInfo}>
                  <Text style={styles.maintenanceTitle}>Maintenance Mode Active</Text>
                  <Text style={styles.maintenanceText}>
                    App is currently in maintenance mode. Users cannot access the app.
                  </Text>
                </View>
              </View>
            )}

            {/* Config List */}
            <View style={styles.configList}>
              {filteredConfigs.map(renderConfigItem)}
              
              {filteredConfigs.length === 0 && (
                <View style={styles.emptyState}>
                  <Icon name="settings-outline" size={48} color={colors.textSecondary} />
                  <Text style={styles.emptyText}>No settings found</Text>
                </View>
              )}
            </View>
          </>
        )}

        {activeTab === 'features' && (
          <View style={styles.flagsList}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Feature Flags</Text>
              <Text style={styles.sectionDescription}>
                Control feature availability and rollout percentages
              </Text>
            </View>
            
            {featureFlags.map(renderFeatureFlag)}
          </View>
        )}

        {activeTab === 'backup' && (
          <View style={styles.backupContainer}>
            {/* Create Backup Button */}
            <TouchableOpacity
              style={styles.createBackupButton}
              onPress={() => setBackupModalVisible(true)}
            >
              <Icon name="add-circle-outline" size={24} color="#fff" />
              <Text style={styles.createBackupText}>Create New Backup</Text>
            </TouchableOpacity>

            {/* Backup List */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Backup History</Text>
              <Text style={styles.sectionDescription}>
                {backups.length} backups available
              </Text>
            </View>

            {backups.length > 0 ? (
              backups.map(renderBackupItem)
            ) : (
              <View style={styles.emptyState}>
                <Icon name="archive-outline" size={48} color={colors.textSecondary} />
                <Text style={styles.emptyText}>No backups yet</Text>
                <Text style={styles.emptySubtext}>Create your first backup to protect your data</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Edit Config Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Configuration</Text>
            {selectedConfig && (
              <>
                <Text style={styles.modalConfigKey}>{selectedConfig.key}</Text>
                <Text style={styles.modalConfigDesc}>{selectedConfig.description}</Text>
                
                <View style={styles.modalInputContainer}>
                  {selectedConfig.type === 'number' ? (
                    <TextInput
                      style={styles.modalInput}
                      value={String(editValue)}
                      onChangeText={(text) => setEditValue(parseInt(text) || 0)}
                      keyboardType="numeric"
                      placeholder="Enter value"
                      placeholderTextColor={colors.textSecondary}
                    />
                  ) : selectedConfig.type === 'string' ? (
                    <TextInput
                      style={[styles.modalInput, styles.modalInputMultiline]}
                      value={editValue}
                      onChangeText={setEditValue}
                      multiline
                      numberOfLines={4}
                      placeholder="Enter value"
                      placeholderTextColor={colors.textSecondary}
                    />
                  ) : (
                    <TextInput
                      style={[styles.modalInput, styles.modalInputMultiline]}
                      value={JSON.stringify(editValue, null, 2)}
                      onChangeText={(text) => {
                        try {
                          setEditValue(JSON.parse(text));
                        } catch {}
                      }}
                      multiline
                      numberOfLines={6}
                      placeholder="Enter JSON value"
                      placeholderTextColor={colors.textSecondary}
                    />
                  )}
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => setEditModalVisible(false)}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalConfirmButton}
                    onPress={handleUpdateConfig}
                  >
                    <Text style={styles.modalConfirmText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Feature Flag Modal */}
      <Modal
        visible={flagModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFlagModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Configure Feature Flag</Text>
            {selectedFlag && (
              <>
                <Text style={styles.modalConfigKey}>
                  {selectedFlag.key.replace(/_/g, ' ').toUpperCase()}
                </Text>
                <Text style={styles.modalConfigDesc}>{selectedFlag.description}</Text>
                
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Rollout Percentage</Text>
                  <View style={styles.percentageContainer}>
                    <TextInput
                      style={styles.percentageInput}
                      value={String(editValue?.rollout_percentage || 0)}
                      onChangeText={(text) => setEditValue((prev: any) => ({
                        ...prev,
                        rollout_percentage: Math.min(100, Math.max(0, parseInt(text) || 0)),
                      }))}
                      keyboardType="numeric"
                    />
                    <Text style={styles.percentageLabel}>%</Text>
                  </View>
                  <View style={styles.percentageBar}>
                    <View
                      style={[
                        styles.percentageFill,
                        { width: `${editValue?.rollout_percentage || 0}%` },
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Target Roles (comma separated)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={(editValue?.target_roles || []).join(', ')}
                    onChangeText={(text) => setEditValue((prev: any) => ({
                      ...prev,
                      target_roles: text.split(',').map((r: string) => r.trim()).filter(Boolean),
                    }))}
                    placeholder="admin, moderator"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => setFlagModalVisible(false)}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalConfirmButton}
                    onPress={handleUpdateFlag}
                  >
                    <Text style={styles.modalConfirmText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Backup Type Modal */}
      <Modal
        visible={backupModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setBackupModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Backup</Text>
            <Text style={styles.modalConfigDesc}>Select backup type:</Text>
            
            <TouchableOpacity
              style={styles.backupTypeOption}
              onPress={() => handleCreateBackup('full')}
            >
              <View style={[styles.backupTypeIcon, { backgroundColor: '#10B981' + '20' }]}>
                <Icon name="layers-outline" size={24} color="#10B981" />
              </View>
              <View style={styles.backupTypeInfo}>
                <Text style={styles.backupTypeName}>Full Backup</Text>
                <Text style={styles.backupTypeDesc}>All configs, flags, filters, and activity logs</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backupTypeOption}
              onPress={() => handleCreateBackup('partial')}
            >
              <View style={[styles.backupTypeIcon, { backgroundColor: '#3B82F6' + '20' }]}>
                <Icon name="copy-outline" size={24} color="#3B82F6" />
              </View>
              <View style={styles.backupTypeInfo}>
                <Text style={styles.backupTypeName}>Partial Backup</Text>
                <Text style={styles.backupTypeDesc}>Configs, flags, and filters only</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backupTypeOption}
              onPress={() => handleCreateBackup('config_only')}
            >
              <View style={[styles.backupTypeIcon, { backgroundColor: '#8B5CF6' + '20' }]}>
                <Icon name="settings-outline" size={24} color="#8B5CF6" />
              </View>
              <View style={styles.backupTypeInfo}>
                <Text style={styles.backupTypeName}>Config Only</Text>
                <Text style={styles.backupTypeDesc}>App settings and feature flags only</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButtonFull}
              onPress={() => setBackupModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
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
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: colors.text,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesContent: {
    paddingRight: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  maintenanceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  maintenanceInfo: {
    flex: 1,
  },
  maintenanceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  maintenanceText: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.9,
    marginTop: 2,
  },
  configList: {
    paddingBottom: 24,
  },
  configItem: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  configHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  configIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  configInfo: {
    flex: 1,
  },
  configLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  configDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  configValue: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  configValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.background,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    maxWidth: '70%',
  },
  configValueText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  flagsList: {
    paddingBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  flagItem: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  flagHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flagInfo: {
    flex: 1,
    marginRight: 12,
  },
  flagKey: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.5,
  },
  flagDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  flagDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  flagDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  flagDetailText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  flagEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  flagEditText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  backupContainer: {
    paddingBottom: 24,
  },
  createBackupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 24,
  },
  createBackupText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  backupItem: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  backupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backupIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backupInfo: {
    flex: 1,
  },
  backupName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  backupDate: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  backupBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  backupBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
  backupDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  backupSize: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  backupTables: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  backupActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  backupAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backupActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  modalConfigKey: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  modalConfigDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  modalInputContainer: {
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalInputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  percentageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  percentageInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center',
  },
  percentageLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  percentageBar: {
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: 4,
    marginTop: 12,
    overflow: 'hidden',
  },
  percentageFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  modalCancelButtonFull: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    marginTop: 16,
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
  backupTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 10,
  },
  backupTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backupTypeInfo: {
    flex: 1,
  },
  backupTypeName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  backupTypeDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default AdminAppConfigScreen;

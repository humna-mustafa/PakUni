/**
 * Admin Settings Screen
 * Manage application configuration and settings
 */

import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
  StatusBar,
  Switch,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {TYPOGRAPHY} from '../../constants/design';
import {useTheme} from '../../contexts/ThemeContext';
import {adminService, AppSetting} from '../../services/admin';
import {Icon} from '../../components/icons';
import {logger} from '../../utils/logger';
import {PremiumLoading} from '../../components/PremiumLoading';
import {PremiumSearchBar} from '../../components/PremiumSearchBar';

// Fallback LinearGradient
let LinearGradient: React.ComponentType<any>;
try {
  LinearGradient = require('react-native-linear-gradient').default;
} catch (e) {
  LinearGradient = ({children, colors, style, ...props}: any) => (
    <View style={[style, {backgroundColor: colors?.[0] || '#4573DF'}]} {...props}>
      {children}
    </View>
  );
}

// Setting categories
const SETTING_CATEGORIES = [
  {key: 'app', label: 'App Settings', icon: 'phone-portrait-outline'},
  {key: 'features', label: 'Features', icon: 'toggle-outline'},
  {key: 'content', label: 'Content', icon: 'document-text-outline'},
  {key: 'notifications', label: 'Notifications', icon: 'notifications-outline'},
  {key: 'security', label: 'Security', icon: 'shield-outline'},
  {key: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline'},
];

const AdminSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors, isDark} = useTheme();
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<AppSetting | null>(null);
  const [editValue, setEditValue] = useState('');
  
  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSetting, setNewSetting] = useState({
    key: '',
    value: '',
    description: '',
    category: 'app',
    value_type: 'string' as AppSetting['value_type'],
    is_public: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const {settings: data} = await adminService.getAllSettings();
      setSettings(data);
    } catch (error) {
      logger.error('Error loading settings', error, 'AdminSettings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadSettings();
  }, []);

  const filteredSettings = settings.filter(setting => {
    const matchesCategory = selectedCategory === 'all' || setting.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      setting.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      setting.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const groupedSettings = SETTING_CATEGORIES.reduce((acc, cat) => {
    const catSettings = filteredSettings.filter(s => s.category === cat.key);
    if (catSettings.length > 0) {
      acc[cat.key] = catSettings;
    }
    return acc;
  }, {} as Record<string, AppSetting[]>);

  const handleEdit = (setting: AppSetting) => {
    setSelectedSetting(setting);
    setEditValue(String(setting.value));
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (!selectedSetting) return;

    try {
      let parsedValue: any = editValue;
      
      // Parse value based on type
      if (selectedSetting.value_type === 'number') {
        parsedValue = parseFloat(editValue);
        if (isNaN(parsedValue)) {
          Alert.alert('Error', 'Invalid number value');
          return;
        }
      } else if (selectedSetting.value_type === 'boolean') {
        parsedValue = editValue.toLowerCase() === 'true';
      } else if (selectedSetting.value_type === 'json') {
        try {
          parsedValue = JSON.parse(editValue);
        } catch {
          Alert.alert('Error', 'Invalid JSON value');
          return;
        }
      }

      const success = await adminService.updateSetting(selectedSetting.key, parsedValue);
      if (success) {
        Alert.alert('Success', 'Setting updated successfully');
        setShowEditModal(false);
        loadSettings();
      } else {
        Alert.alert('Error', 'Failed to update setting');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred');
    }
  };

  const handleToggle = async (setting: AppSetting) => {
    if (setting.value_type !== 'boolean') return;

    const newValue = !setting.value;
    const success = await adminService.updateSetting(setting.key, newValue);
    if (success) {
      loadSettings();
    } else {
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const handleCreate = async () => {
    if (!newSetting.key.trim()) {
      Alert.alert('Error', 'Setting key is required');
      return;
    }

    try {
      let parsedValue: any = newSetting.value;
      
      if (newSetting.value_type === 'number') {
        parsedValue = parseFloat(newSetting.value);
      } else if (newSetting.value_type === 'boolean') {
        parsedValue = newSetting.value.toLowerCase() === 'true';
      } else if (newSetting.value_type === 'json') {
        try {
          parsedValue = JSON.parse(newSetting.value);
        } catch {
          Alert.alert('Error', 'Invalid JSON value');
          return;
        }
      }

      const result = await adminService.createSetting({
        ...newSetting,
        value: parsedValue,
      });

      if (result.success) {
        Alert.alert('Success', 'Setting created successfully');
        setShowCreateModal(false);
        setNewSetting({
          key: '',
          value: '',
          description: '',
          category: 'app',
          value_type: 'string',
          is_public: false,
        });
        loadSettings();
      } else {
        Alert.alert('Error', result.error || 'Failed to create setting');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred');
    }
  };

  const handleDelete = (setting: AppSetting) => {
    Alert.alert(
      'Delete Setting',
      `Are you sure you want to delete "${setting.key}"?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await adminService.deleteSetting(setting.key);
            if (success) {
              Alert.alert('Success', 'Setting deleted');
              loadSettings();
            } else {
              Alert.alert('Error', 'Failed to delete setting');
            }
          },
        },
      ]
    );
  };

  const renderSetting = (setting: AppSetting) => {
    const isBoolean = setting.value_type === 'boolean';

    return (
      <View key={setting.key} style={[styles.settingCard, {backgroundColor: colors.card}]}>
        <View style={styles.settingHeader}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingKey, {color: colors.text}]}>{setting.key}</Text>
            {setting.description && (
              <Text style={[styles.settingDescription, {color: colors.textSecondary}]}>
                {setting.description}
              </Text>
            )}
          </View>
          
          {isBoolean ? (
            <Switch
              value={Boolean(setting.value)}
              onValueChange={() => handleToggle(setting)}
              trackColor={{false: '#767577', true: colors.primary + '80'}}
              thumbColor={setting.value ? colors.primary : '#f4f3f4'}
            />
          ) : (
            <TouchableOpacity
              style={[styles.editBtn, {backgroundColor: colors.background}]}
              onPress={() => handleEdit(setting)}
              accessibilityRole="button"
              accessibilityLabel={`Edit ${setting.key} setting`}>
              <Icon name="create-outline" family="Ionicons" size={18} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {!isBoolean && (
          <View style={[styles.valueContainer, {backgroundColor: colors.background}]}>
            <Text style={[styles.valueLabel, {color: colors.textSecondary}]}>
              {setting.value_type.toUpperCase()}
            </Text>
            <Text style={[styles.settingValue, {color: colors.text}]} numberOfLines={2}>
              {typeof setting.value === 'object' 
                ? JSON.stringify(setting.value) 
                : String(setting.value)}
            </Text>
          </View>
        )}

        <View style={styles.settingFooter}>
          <View style={styles.badges}>
            {setting.is_public && (
              <View style={[styles.badge, {backgroundColor: '#10B98120'}]}>
                <Text style={[styles.badgeText, {color: '#10B981'}]}>Public</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            onPress={() => handleDelete(setting)}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${setting.key} setting`}>
            <Icon name="trash-outline" family="Ionicons" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <LinearGradient
          colors={isDark ? ['#1E3A5F', '#1E1E2E'] : ['#10B981', '#059669']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <Icon name="arrow-back" family="Ionicons" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>App Settings</Text>
            <Text style={styles.headerSubtitle}>{settings.length} settings configured</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowCreateModal(true)}
            accessibilityRole="button"
            accessibilityLabel="Add new setting">
            <Icon name="add" family="Ionicons" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Search - Consistent Design */}
        <View style={styles.searchWrapper}>
          <PremiumSearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder="Search settings..."
            variant="default"
            size="md"
          />
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}>
          <TouchableOpacity
            style={[
              styles.categoryChip,
              {backgroundColor: selectedCategory === 'all' ? colors.primary + '20' : colors.card},
            ]}
            onPress={() => setSelectedCategory('all')}>
            <Icon
              name="apps-outline"
              family="Ionicons"
              size={16}
              color={selectedCategory === 'all' ? colors.primary : colors.textSecondary}
            />
            <Text style={[
              styles.categoryText,
              {color: selectedCategory === 'all' ? colors.primary : colors.textSecondary},
            ]}>
              All
            </Text>
          </TouchableOpacity>
          {SETTING_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.categoryChip,
                {backgroundColor: selectedCategory === cat.key ? colors.primary + '20' : colors.card},
              ]}
              onPress={() => setSelectedCategory(cat.key)}>
              <Icon
                name={cat.icon}
                family="Ionicons"
                size={16}
                color={selectedCategory === cat.key ? colors.primary : colors.textSecondary}
              />
              <Text style={[
                styles.categoryText,
                {color: selectedCategory === cat.key ? colors.primary : colors.textSecondary},
              ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Settings List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }>
          {loading ? (
            <PremiumLoading variant="minimal" size="small" />
          ) : (
            Object.entries(groupedSettings).map(([category, categorySettings]) => {
              const catConfig = SETTING_CATEGORIES.find(c => c.key === category);
              return (
                <View key={category} style={styles.categorySection}>
                  <View style={styles.sectionHeader}>
                    <Icon
                      name={catConfig?.icon || 'settings-outline'}
                      family="Ionicons"
                      size={18}
                      color={colors.primary}
                    />
                    <Text style={[styles.sectionTitle, {color: colors.text}]}>
                      {catConfig?.label || category}
                    </Text>
                    <Text style={[styles.sectionCount, {color: colors.textSecondary}]}>
                      ({categorySettings.length})
                    </Text>
                  </View>
                  {categorySettings.map(renderSetting)}
                </View>
              );
            })
          )}

          {!loading && filteredSettings.length === 0 && (
            <View style={styles.emptyState}>
              <Icon name="settings-outline" family="Ionicons" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, {color: colors.textSecondary}]}>No settings found</Text>
            </View>
          )}
        </ScrollView>

        {/* Edit Modal */}
        <Modal visible={showEditModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, {backgroundColor: colors.card}]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, {color: colors.text}]}>Edit Setting</Text>
                <TouchableOpacity onPress={() => setShowEditModal(false)}>
                  <Icon name="close" family="Ionicons" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {selectedSetting && (
                <View style={styles.modalBody}>
                  <Text style={[styles.formLabel, {color: colors.text}]}>Key</Text>
                  <Text style={[styles.keyText, {color: colors.primary}]}>{selectedSetting.key}</Text>

                  {selectedSetting.description && (
                    <>
                      <Text style={[styles.formLabel, {color: colors.text}]}>Description</Text>
                      <Text style={[styles.descText, {color: colors.textSecondary}]}>
                        {selectedSetting.description}
                      </Text>
                    </>
                  )}

                  <Text style={[styles.formLabel, {color: colors.text}]}>
                    Value ({selectedSetting.value_type})
                  </Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      selectedSetting.value_type === 'json' && styles.jsonInput,
                      {backgroundColor: colors.background, color: colors.text},
                    ]}
                    value={editValue}
                    onChangeText={setEditValue}
                    multiline={selectedSetting.value_type === 'json'}
                    numberOfLines={selectedSetting.value_type === 'json' ? 6 : 1}
                    keyboardType={selectedSetting.value_type === 'number' ? 'numeric' : 'default'}
                  />

                  <View style={styles.formButtons}>
                    <TouchableOpacity
                      style={[styles.cancelBtn, {borderColor: colors.border}]}
                      onPress={() => setShowEditModal(false)}>
                      <Text style={[styles.cancelBtnText, {color: colors.text}]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                      <Text style={styles.saveBtnText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Modal>

        {/* Create Modal */}
        <Modal visible={showCreateModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, {backgroundColor: colors.card}]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, {color: colors.text}]}>Create Setting</Text>
                <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                  <Icon name="close" family="Ionicons" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <Text style={[styles.formLabel, {color: colors.text}]}>Key *</Text>
                <TextInput
                  style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                  placeholder="setting_key"
                  placeholderTextColor={colors.placeholder}
                  value={newSetting.key}
                  onChangeText={text => setNewSetting({...newSetting, key: text})}
                />

                <Text style={[styles.formLabel, {color: colors.text}]}>Description</Text>
                <TextInput
                  style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                  placeholder="What this setting does"
                  placeholderTextColor={colors.placeholder}
                  value={newSetting.description}
                  onChangeText={text => setNewSetting({...newSetting, description: text})}
                />

                <Text style={[styles.formLabel, {color: colors.text}]}>Value Type</Text>
                <View style={styles.typeSelector}>
                  {['string', 'number', 'boolean', 'json'].map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeOption,
                        {backgroundColor: colors.background},
                        newSetting.value_type === type && {
                          backgroundColor: colors.primary + '20',
                          borderColor: colors.primary,
                          borderWidth: 1,
                        },
                      ]}
                      onPress={() => setNewSetting({...newSetting, value_type: type as AppSetting['value_type']})}>
                      <Text style={[
                        styles.typeText,
                        {color: newSetting.value_type === type ? colors.primary : colors.textSecondary},
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.formLabel, {color: colors.text}]}>Value</Text>
                <TextInput
                  style={[
                    styles.formInput,
                    newSetting.value_type === 'json' && styles.jsonInput,
                    {backgroundColor: colors.background, color: colors.text},
                  ]}
                  placeholder={newSetting.value_type === 'boolean' ? 'true or false' : 'Enter value'}
                  placeholderTextColor={colors.placeholder}
                  value={newSetting.value}
                  onChangeText={text => setNewSetting({...newSetting, value: text})}
                  multiline={newSetting.value_type === 'json'}
                  keyboardType={newSetting.value_type === 'number' ? 'numeric' : 'default'}
                />

                <Text style={[styles.formLabel, {color: colors.text}]}>Category</Text>
                <View style={styles.categorySelector}>
                  {SETTING_CATEGORIES.map(cat => (
                    <TouchableOpacity
                      key={cat.key}
                      style={[
                        styles.categoryOption,
                        {backgroundColor: colors.background},
                        newSetting.category === cat.key && {
                          backgroundColor: colors.primary + '20',
                          borderColor: colors.primary,
                          borderWidth: 1,
                        },
                      ]}
                      onPress={() => setNewSetting({...newSetting, category: cat.key})}>
                      <Icon
                        name={cat.icon}
                        family="Ionicons"
                        size={14}
                        color={newSetting.category === cat.key ? colors.primary : colors.textSecondary}
                      />
                      <Text style={[
                        styles.categoryOptionText,
                        {color: newSetting.category === cat.key ? colors.primary : colors.textSecondary},
                      ]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.toggleRow}>
                  <Text style={[styles.toggleLabel, {color: colors.text}]}>Public Setting</Text>
                  <Switch
                    value={newSetting.is_public}
                    onValueChange={value => setNewSetting({...newSetting, is_public: value})}
                    trackColor={{false: '#767577', true: colors.primary + '80'}}
                    thumbColor={newSetting.is_public ? colors.primary : '#f4f3f4'}
                  />
                </View>

                <View style={styles.formButtons}>
                  <TouchableOpacity
                    style={[styles.cancelBtn, {borderColor: colors.border}]}
                    onPress={() => setShowCreateModal(false)}>
                    <Text style={[styles.cancelBtnText, {color: colors.text}]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleCreate}>
                    <Text style={styles.saveBtnText}>Create</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
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
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Unified search wrapper
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  categoryScroll: {
    flexGrow: 0,
    marginTop: 12,
  },
  categoryContent: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  scrollView: {
    flex: 1,
    marginTop: 12,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
  },
  categorySection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  sectionCount: {
    fontSize: 13,
  },
  settingCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingKey: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.semibold,
    fontFamily: 'monospace',
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueContainer: {
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  valueLabel: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: 4,
  },
  settingValue: {
    fontSize: 13,
    fontFamily: 'monospace',
  },
  settingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  loader: {
    paddingVertical: 40,
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
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  modalBody: {
    padding: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: 8,
    marginTop: 16,
  },
  formInput: {
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
  },
  jsonInput: {
    minHeight: 120,
    textAlignVertical: 'top',
    fontFamily: 'monospace',
  },
  keyText: {
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weight.semibold,
    fontFamily: 'monospace',
  },
  descText: {
    fontSize: 13,
    lineHeight: 18,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  categoryOptionText: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 12,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
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
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#10B981',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
});

export default AdminSettingsScreen;

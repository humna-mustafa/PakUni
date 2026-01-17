/**
 * Admin Announcements Screen
 * Create and manage in-app announcements and notifications
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
  ActivityIndicator,
  ScrollView,
  Switch,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../../contexts/ThemeContext';
import {adminService, Announcement, AnnouncementType} from '../../services/admin';
import {logger} from '../../utils/logger';
import {Icon} from '../../components/icons';

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

const ANNOUNCEMENT_TYPES: {value: AnnouncementType; label: string; color: string; icon: string}[] = [
  {value: 'info', label: 'Info', color: '#4573DF', icon: 'information-circle'},
  {value: 'warning', label: 'Warning', color: '#F59E0B', icon: 'warning'},
  {value: 'alert', label: 'Alert', color: '#EF4444', icon: 'alert-circle'},
  {value: 'update', label: 'Update', color: '#10B981', icon: 'refresh-circle'},
  {value: 'promotion', label: 'Promo', color: '#4573DF', icon: 'gift'},
];

const AdminAnnouncementsScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors, isDark} = useTheme();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  
  // Create/Edit modal
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as AnnouncementType,
    is_active: true,
    is_dismissible: true,
    priority: 0,
    action_url: '',
    action_label: '',
  });

  useEffect(() => {
    loadAnnouncements();
  }, [showActiveOnly]);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const {announcements: data} = await adminService.getAnnouncements({
        isActive: showActiveOnly ? true : undefined,
      });
      setAnnouncements(data);
    } catch (error) {
      logger.error('Error loading announcements', error, 'AdminAnnouncements');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAnnouncements();
  }, [showActiveOnly]);

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'info',
      is_active: true,
      is_dismissible: true,
      priority: 0,
      action_url: '',
      action_label: '',
    });
    setEditMode(false);
    setSelectedAnnouncement(null);
  };

  const handleCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
      is_active: announcement.is_active,
      is_dismissible: announcement.is_dismissible,
      priority: announcement.priority,
      action_url: announcement.action_url || '',
      action_label: announcement.action_label || '',
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      Alert.alert('Error', 'Title and message are required');
      return;
    }

    try {
      if (editMode && selectedAnnouncement) {
        const success = await adminService.updateAnnouncement(selectedAnnouncement.id, formData);
        if (success) {
          Alert.alert('Success', 'Announcement updated successfully');
        } else {
          Alert.alert('Error', 'Failed to update announcement');
          return;
        }
      } else {
        const result = await adminService.createAnnouncement({
          ...formData,
          target: 'all',
          target_criteria: null,
          image_url: null,
          start_date: new Date().toISOString(),
          end_date: null,
          created_by: null,
          updated_at: new Date().toISOString(),
        });
        if (result.success) {
          Alert.alert('Success', 'Announcement created successfully');
        } else {
          Alert.alert('Error', result.error || 'Failed to create announcement');
          return;
        }
      }
      
      setShowModal(false);
      resetForm();
      loadAnnouncements();
    } catch (error) {
      Alert.alert('Error', 'An error occurred');
    }
  };

  const handleDelete = (announcement: Announcement) => {
    Alert.alert(
      'Delete Announcement',
      `Are you sure you want to delete "${announcement.title}"?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await adminService.deleteAnnouncement(announcement.id);
            if (success) {
              Alert.alert('Success', 'Announcement deleted');
              loadAnnouncements();
            } else {
              Alert.alert('Error', 'Failed to delete announcement');
            }
          },
        },
      ]
    );
  };

  const handleToggleActive = async (announcement: Announcement) => {
    const success = await adminService.updateAnnouncement(announcement.id, {
      is_active: !announcement.is_active,
    });
    if (success) {
      loadAnnouncements();
    }
  };

  const getTypeConfig = (type: AnnouncementType) => {
    return ANNOUNCEMENT_TYPES.find(t => t.value === type) || ANNOUNCEMENT_TYPES[0];
  };

  const renderAnnouncement = ({item}: {item: Announcement}) => {
    const typeConfig = getTypeConfig(item.type);

    return (
      <View style={[styles.announcementCard, {backgroundColor: colors.card}]}>
        <View style={styles.announcementHeader}>
          <View style={[styles.typeIndicator, {backgroundColor: typeConfig.color}]}>
            <Icon name={typeConfig.icon} family="Ionicons" size={16} color="#FFFFFF" />
          </View>
          <View style={styles.announcementInfo}>
            <Text style={[styles.announcementTitle, {color: colors.text}]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.announcementDate, {color: colors.textSecondary}]}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.announcementBadges}>
            {item.is_active ? (
              <View style={[styles.statusBadge, {backgroundColor: '#10B98120'}]}>
                <Text style={[styles.statusText, {color: '#10B981'}]}>Active</Text>
              </View>
            ) : (
              <View style={[styles.statusBadge, {backgroundColor: '#6B728020'}]}>
                <Text style={[styles.statusText, {color: '#6B7280'}]}>Inactive</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={[styles.announcementMessage, {color: colors.textSecondary}]} numberOfLines={2}>
          {item.message}
        </Text>

        <View style={styles.announcementActions}>
          <TouchableOpacity
            style={[styles.actionBtn, {backgroundColor: colors.background}]}
            onPress={() => handleToggleActive(item)}>
            <Icon
              name={item.is_active ? 'eye-off-outline' : 'eye-outline'}
              family="Ionicons"
              size={16}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, {backgroundColor: colors.background}]}
            onPress={() => handleEdit(item)}>
            <Icon name="create-outline" family="Ionicons" size={16} color="#4573DF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, {backgroundColor: colors.background}]}
            onPress={() => handleDelete(item)}>
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
          colors={isDark ? ['#1E3A5F', '#1E1E2E'] : ['#4573DF', '#4573DF']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" family="Ionicons" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Announcements</Text>
            <Text style={styles.headerSubtitle}>Create and manage in-app notifications</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={handleCreate}>
            <Icon name="add" family="Ionicons" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Filter */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              {backgroundColor: showActiveOnly ? colors.primary + '20' : colors.card},
            ]}
            onPress={() => setShowActiveOnly(!showActiveOnly)}>
            <Icon
              name={showActiveOnly ? 'checkmark-circle' : 'ellipse-outline'}
              family="Ionicons"
              size={16}
              color={showActiveOnly ? colors.primary : colors.textSecondary}
            />
            <Text style={[styles.filterText, {color: showActiveOnly ? colors.primary : colors.textSecondary}]}>
              Active Only
            </Text>
          </TouchableOpacity>
          <Text style={[styles.countText, {color: colors.textSecondary}]}>
            {announcements.length} announcements
          </Text>
        </View>

        {/* List */}
        <FlatList
          data={announcements}
          renderItem={renderAnnouncement}
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
                <Icon name="megaphone-outline" family="Ionicons" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, {color: colors.textSecondary}]}>No announcements</Text>
                <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
                  <Text style={styles.createBtnText}>Create First Announcement</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />

        {/* Create/Edit Modal */}
        <Modal visible={showModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, {backgroundColor: colors.card}]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, {color: colors.text}]}>
                  {editMode ? 'Edit Announcement' : 'Create Announcement'}
                </Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Icon name="close" family="Ionicons" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                {/* Type Selection */}
                <Text style={[styles.formLabel, {color: colors.text}]}>Type</Text>
                <View style={styles.typeGrid}>
                  {ANNOUNCEMENT_TYPES.map(type => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.typeOption,
                        {backgroundColor: colors.background},
                        formData.type === type.value && {
                          backgroundColor: type.color + '20',
                          borderColor: type.color,
                          borderWidth: 2,
                        },
                      ]}
                      onPress={() => setFormData({...formData, type: type.value})}>
                      <Icon name={type.icon} family="Ionicons" size={20} color={type.color} />
                      <Text style={[styles.typeLabel, {color: type.color}]}>{type.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Title */}
                <Text style={[styles.formLabel, {color: colors.text}]}>Title *</Text>
                <TextInput
                  style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                  placeholder="Announcement title"
                  placeholderTextColor={colors.placeholder}
                  value={formData.title}
                  onChangeText={text => setFormData({...formData, title: text})}
                />

                {/* Message */}
                <Text style={[styles.formLabel, {color: colors.text}]}>Message *</Text>
                <TextInput
                  style={[
                    styles.formInput,
                    styles.formTextarea,
                    {backgroundColor: colors.background, color: colors.text},
                  ]}
                  placeholder="Announcement message"
                  placeholderTextColor={colors.placeholder}
                  value={formData.message}
                  onChangeText={text => setFormData({...formData, message: text})}
                  multiline
                  numberOfLines={4}
                />

                {/* Action URL */}
                <Text style={[styles.formLabel, {color: colors.text}]}>Action URL (Optional)</Text>
                <TextInput
                  style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                  placeholder="https://example.com"
                  placeholderTextColor={colors.placeholder}
                  value={formData.action_url}
                  onChangeText={text => setFormData({...formData, action_url: text})}
                  keyboardType="url"
                />

                {/* Action Label */}
                <Text style={[styles.formLabel, {color: colors.text}]}>Action Label (Optional)</Text>
                <TextInput
                  style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                  placeholder="Learn More"
                  placeholderTextColor={colors.placeholder}
                  value={formData.action_label}
                  onChangeText={text => setFormData({...formData, action_label: text})}
                />

                {/* Priority */}
                <Text style={[styles.formLabel, {color: colors.text}]}>Priority (0-10)</Text>
                <TextInput
                  style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                  placeholder="0"
                  placeholderTextColor={colors.placeholder}
                  value={String(formData.priority)}
                  onChangeText={text => setFormData({...formData, priority: parseInt(text) || 0})}
                  keyboardType="numeric"
                />

                {/* Toggles */}
                <View style={styles.toggleRow}>
                  <Text style={[styles.toggleLabel, {color: colors.text}]}>Active</Text>
                  <Switch
                    value={formData.is_active}
                    onValueChange={value => setFormData({...formData, is_active: value})}
                    trackColor={{false: '#767577', true: colors.primary + '80'}}
                    thumbColor={formData.is_active ? colors.primary : '#f4f3f4'}
                  />
                </View>

                <View style={styles.toggleRow}>
                  <Text style={[styles.toggleLabel, {color: colors.text}]}>Dismissible</Text>
                  <Switch
                    value={formData.is_dismissible}
                    onValueChange={value => setFormData({...formData, is_dismissible: value})}
                    trackColor={{false: '#767577', true: colors.primary + '80'}}
                    thumbColor={formData.is_dismissible ? colors.primary : '#f4f3f4'}
                  />
                </View>

                {/* Buttons */}
                <View style={styles.formButtons}>
                  <TouchableOpacity
                    style={[styles.cancelBtn, {borderColor: colors.border}]}
                    onPress={() => setShowModal(false)}>
                    <Text style={[styles.cancelBtnText, {color: colors.text}]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                    <Text style={styles.saveBtnText}>{editMode ? 'Update' : 'Create'}</Text>
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
    fontWeight: '700',
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
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    fontSize: 13,
    fontWeight: '500',
  },
  countText: {
    fontSize: 13,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  announcementCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  announcementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeIndicator: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  announcementInfo: {
    flex: 1,
    marginLeft: 12,
  },
  announcementTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  announcementDate: {
    fontSize: 12,
    marginTop: 2,
  },
  announcementBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  announcementMessage: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  announcementActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 16,
  },
  createBtn: {
    backgroundColor: '#4573DF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
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
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  formInput: {
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
  },
  formTextarea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 4,
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '500',
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
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#4573DF',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AdminAnnouncementsScreen;



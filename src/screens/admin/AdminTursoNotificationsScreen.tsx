/**
 * Admin Turso Notifications Screen
 * Enterprise-level notification management with Turso database
 * Full targeting, scheduling, templates, and delivery tracking
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { logger } from '../../utils/logger';
import { TYPOGRAPHY } from '../../constants/design';
import { tursoAdminService, TursoNotification } from '../../services/tursoAdmin';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// Types
// ============================================================================

interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  type: TursoNotification['type'];
  icon: string;
}

type NotificationFilterStatus = 'all' | 'draft' | 'scheduled' | 'sent' | 'failed';
type NotificationFilterType = 'all' | 'general' | 'announcement' | 'update' | 'alert' | 'scholarship' | 'admission' | 'deadline';

// ============================================================================
// Templates
// ============================================================================

const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'deadline_reminder',
    name: 'Deadline Reminder',
    title: '⏰ Deadline Approaching!',
    body: 'Don\'t miss the deadline for {university}. Apply before {date}!',
    type: 'deadline',
    icon: 'calendar',
  },
  {
    id: 'scholarship_alert',
    name: 'New Scholarship',
    title: '🎓 New Scholarship Available!',
    body: 'A new scholarship has been posted: {scholarship_name}. Check eligibility now!',
    type: 'scholarship',
    icon: 'ribbon',
  },
  {
    id: 'admission_open',
    name: 'Admissions Open',
    title: '🏛️ Admissions Now Open!',
    body: '{university} has opened admissions for {year}. Apply now!',
    type: 'admission',
    icon: 'school',
  },
  {
    id: 'app_update',
    name: 'App Update',
    title: '🚀 New Features Available!',
    body: 'We\'ve added exciting new features to PakUni. Update now to explore!',
    type: 'update',
    icon: 'rocket',
  },
  {
    id: 'merit_list',
    name: 'Merit List Released',
    title: '📋 Merit List Released!',
    body: '{university} has released the merit list. Check your status now!',
    type: 'announcement',
    icon: 'list',
  },
  {
    id: 'general_announcement',
    name: 'General Announcement',
    title: '📢 Important Announcement',
    body: 'We have an important update for you. Tap to read more.',
    type: 'general',
    icon: 'megaphone',
  },
];

// ============================================================================
// Component
// ============================================================================

const AdminTursoNotificationsScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<TursoNotification[]>([]);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    scheduled: 0,
    draft: 0,
    totalDeliveries: 0,
    totalOpens: 0,
    avgOpenRate: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<NotificationFilterStatus>('all');
  const [filterType, setFilterType] = useState<NotificationFilterType>('all');
  const [page, setPage] = useState(0);
  
  // Modal states
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<TursoNotification | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    type: 'general' as TursoNotification['type'],
    priority: 'normal' as TursoNotification['priority'],
    target_audience: 'all' as TursoNotification['target_audience'],
    scheduled_at: '',
    status: 'draft' as TursoNotification['status'],
  });
  const [isEditing, setIsEditing] = useState(false);

  const ITEMS_PER_PAGE = 20;

  // ============================================================================
  // Data Fetching
  // ============================================================================

  const fetchData = useCallback(async (resetPage = false) => {
    if (resetPage) {
      setPage(0);
    }

    setLoading(true);
    try {
      const currentPage = resetPage ? 0 : page;
      
      const [notificationsResult, statsResult] = await Promise.all([
        tursoAdminService.getNotifications({
          limit: ITEMS_PER_PAGE,
          offset: currentPage * ITEMS_PER_PAGE,
          search: searchQuery || undefined,
          status: filterStatus === 'all' ? undefined : filterStatus,
          type: filterType === 'all' ? undefined : filterType,
        }),
        tursoAdminService.getNotificationStats(),
      ]);

      setNotifications(notificationsResult.data);
      setTotalNotifications(notificationsResult.total);
      setStats(statsResult);
    } catch (error) {
      logger.error('Error fetching data', error, 'TursoNotifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, filterStatus, filterType, page]);

  useEffect(() => {
    fetchData(true);
  }, [filterStatus, filterType]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchData(true);
    }, 500);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(true);
  }, [fetchData]);

  // ============================================================================
  // Actions
  // ============================================================================

  const handleCreate = useCallback(() => {
    setFormData({
      title: '',
      body: '',
      type: 'general',
      priority: 'normal',
      target_audience: 'all',
      scheduled_at: '',
      status: 'draft',
    });
    setIsEditing(false);
    setCreateModalVisible(true);
  }, []);

  const handleEdit = useCallback((notification: TursoNotification) => {
    setFormData({
      title: notification.title,
      body: notification.body,
      type: notification.type,
      priority: notification.priority,
      target_audience: notification.target_audience,
      scheduled_at: notification.scheduled_at || '',
      status: notification.status,
    });
    setSelectedNotification(notification);
    setIsEditing(true);
    setDetailModalVisible(false);
    setCreateModalVisible(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!formData.title.trim() || !formData.body.trim()) {
      Alert.alert('Validation Error', 'Title and body are required');
      return;
    }

    setLoading(true);
    try {
      let result;
      
      if (isEditing && selectedNotification) {
        result = await tursoAdminService.updateNotification(selectedNotification.id, formData);
      } else {
        result = await tursoAdminService.createNotification({
          ...formData,
          target_user_ids: null,
          sent_at: null,
          data: null,
          created_by: user?.id || 'admin',
        });
      }

      if (result.success) {
        Alert.alert('Success', isEditing ? 'Notification updated' : 'Notification created');
        setCreateModalVisible(false);
        fetchData(true);
      } else {
        Alert.alert('Error', result.error || 'Failed to save notification');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [formData, isEditing, selectedNotification, user, fetchData]);

  const handleSend = useCallback(async (notification: TursoNotification) => {
    Alert.alert(
      'Send Notification',
      `Send "${notification.title}" to ${notification.target_audience} users?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Now',
          onPress: async () => {
            setLoading(true);
            const result = await tursoAdminService.sendNotification(notification.id);
            setLoading(false);
            
            if (result.success) {
              Alert.alert(
                'Notification Sent',
                `Successfully sent to ${result.deliveryCount?.toLocaleString() || 0} users`
              );
              setDetailModalVisible(false);
              fetchData();
            } else {
              Alert.alert('Error', result.error || 'Failed to send notification');
            }
          },
        },
      ]
    );
  }, [fetchData]);

  const handleDelete = useCallback(async (id: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await tursoAdminService.deleteNotification(id);
            if (result.success) {
              Alert.alert('Success', 'Notification deleted');
              setDetailModalVisible(false);
              fetchData();
            } else {
              Alert.alert('Error', result.error || 'Failed to delete');
            }
          },
        },
      ]
    );
  }, [fetchData]);

  const applyTemplate = useCallback((template: NotificationTemplate) => {
    setFormData(prev => ({
      ...prev,
      title: template.title,
      body: template.body,
      type: template.type,
    }));
    setTemplateModalVisible(false);
  }, []);

  // ============================================================================
  // Render Functions
  // ============================================================================

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.card }]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      <View style={styles.headerCenter}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Turso Notification System
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: '#FF6B6B' }]}
        onPress={handleCreate}
      >
        <Icon name="add" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
        <LinearGradient
          colors={['#4D96FF20', '#4D96FF10']}
          style={[styles.statCard, { borderColor: '#4D96FF40' }]}
        >
          <Icon name="paper-plane" size={24} color="#4D96FF" />
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.total}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
        </LinearGradient>

        <LinearGradient
          colors={['#00D4AA20', '#00D4AA10']}
          style={[styles.statCard, { borderColor: '#00D4AA40' }]}
        >
          <Icon name="checkmark-circle" size={24} color="#00D4AA" />
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.sent}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Sent</Text>
        </LinearGradient>

        <LinearGradient
          colors={['#FFD93D20', '#FFD93D10']}
          style={[styles.statCard, { borderColor: '#FFD93D40' }]}
        >
          <Icon name="time" size={24} color="#FFD93D" />
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.scheduled}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Scheduled</Text>
        </LinearGradient>

        <LinearGradient
          colors={['#9B59B620', '#9B59B610']}
          style={[styles.statCard, { borderColor: '#9B59B640' }]}
        >
          <Icon name="eye" size={24} color="#9B59B6" />
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.avgOpenRate.toFixed(1)}%</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Open Rate</Text>
        </LinearGradient>

        <LinearGradient
          colors={['#FF6B6B20', '#FF6B6B10']}
          style={[styles.statCard, { borderColor: '#FF6B6B40' }]}
        >
          <Icon name="people" size={24} color="#FF6B6B" />
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalDeliveries.toLocaleString()}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Deliveries</Text>
        </LinearGradient>
      </ScrollView>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <Icon name="search" size={18} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search notifications..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Status Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {(['all', 'draft', 'scheduled', 'sent', 'failed'] as NotificationFilterStatus[]).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterChip,
              { backgroundColor: filterStatus === status ? '#FF6B6B' : colors.card },
            ]}
            onPress={() => setFilterStatus(status)}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: filterStatus === status ? '#FFFFFF' : colors.text },
              ]}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return '#00D4AA';
      case 'scheduled':
        return '#FFD93D';
      case 'draft':
        return '#9B59B6';
      case 'failed':
        return '#E74C3C';
      default:
        return colors.textSecondary;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'scholarship':
        return 'ribbon';
      case 'admission':
        return 'school';
      case 'deadline':
        return 'calendar';
      case 'update':
        return 'rocket';
      case 'alert':
        return 'alert-circle';
      case 'announcement':
        return 'megaphone';
      default:
        return 'notifications';
    }
  };

  const renderNotificationItem = ({ item }: { item: TursoNotification }) => (
    <TouchableOpacity
      style={[styles.notificationCard, { backgroundColor: colors.card }]}
      onPress={() => {
        setSelectedNotification(item);
        setDetailModalVisible(true);
      }}
      activeOpacity={0.7}
    >
      <View style={[styles.notificationIcon, { backgroundColor: getStatusColor(item.status) + '20' }]}>
        <Icon name={getTypeIcon(item.type)} size={22} color={getStatusColor(item.status)} />
      </View>
      
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={[styles.notificationTitle, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusBadgeText, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
        </View>
        
        <Text style={[styles.notificationBody, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.body}
        </Text>
        
        <View style={styles.notificationMeta}>
          <View style={styles.metaItem}>
            <Icon name="people" size={12} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {item.target_audience}
            </Text>
          </View>
          {item.delivery_count > 0 && (
            <View style={styles.metaItem}>
              <Icon name="paper-plane" size={12} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {item.delivery_count.toLocaleString()}
              </Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <Icon name="time" size={12} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.notificationAction}
        onPress={() => {
          if (item.status === 'draft' || item.status === 'scheduled') {
            handleSend(item);
          } else {
            setSelectedNotification(item);
            setDetailModalVisible(true);
          }
        }}
      >
        <Icon
          name={item.status === 'draft' || item.status === 'scheduled' ? 'send' : 'chevron-forward'}
          size={20}
          color={item.status === 'draft' ? '#FF6B6B' : colors.textSecondary}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderCreateModal = () => (
    <Modal
      visible={createModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setCreateModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.createModal, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {isEditing ? 'Edit Notification' : 'Create Notification'}
            </Text>
            <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
              <Icon name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.createContent}>
            {/* Template Button */}
            {!isEditing && (
              <TouchableOpacity
                style={[styles.templateButton, { backgroundColor: colors.primary + '20' }]}
                onPress={() => setTemplateModalVisible(true)}
              >
                <MaterialIcon name="file-document-edit" size={20} color={colors.primary} />
                <Text style={[styles.templateButtonText, { color: colors.primary }]}>
                  Use Template
                </Text>
              </TouchableOpacity>
            )}

            {/* Title */}
            <View style={styles.formField}>
              <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Title *</Text>
              <TextInput
                style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                value={formData.title}
                onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                placeholder="Notification title"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Body */}
            <View style={styles.formField}>
              <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Body *</Text>
              <TextInput
                style={[styles.formTextArea, { color: colors.text, borderColor: colors.border }]}
                value={formData.body}
                onChangeText={(text) => setFormData(prev => ({ ...prev, body: text }))}
                placeholder="Notification message"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Type */}
            <View style={styles.formField}>
              <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {(['general', 'announcement', 'update', 'alert', 'scholarship', 'admission', 'deadline'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeChip,
                      { 
                        backgroundColor: formData.type === type ? '#FF6B6B' : colors.background,
                        borderColor: formData.type === type ? '#FF6B6B' : colors.border,
                      },
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, type }))}
                  >
                    <Text
                      style={[
                        styles.typeChipText,
                        { color: formData.type === type ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Priority */}
            <View style={styles.formField}>
              <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Priority</Text>
              <View style={styles.priorityRow}>
                {(['low', 'normal', 'high', 'urgent'] as const).map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityButton,
                      { 
                        backgroundColor: formData.priority === priority 
                          ? priority === 'urgent' ? '#E74C3C' 
                          : priority === 'high' ? '#F39C12' 
                          : priority === 'low' ? '#95A5A6' 
                          : '#00D4AA'
                          : colors.background,
                        borderColor: formData.priority === priority ? 'transparent' : colors.border,
                      },
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, priority }))}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        { color: formData.priority === priority ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Target Audience */}
            <View style={styles.formField}>
              <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Target Audience</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {(['all', 'verified', 'active', 'inactive', 'new_users', 'premium'] as const).map((audience) => (
                  <TouchableOpacity
                    key={audience}
                    style={[
                      styles.audienceChip,
                      { 
                        backgroundColor: formData.target_audience === audience ? '#4D96FF' : colors.background,
                        borderColor: formData.target_audience === audience ? '#4D96FF' : colors.border,
                      },
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, target_audience: audience }))}
                  >
                    <Text
                      style={[
                        styles.audienceChipText,
                        { color: formData.target_audience === audience ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {audience.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </ScrollView>

          <View style={styles.createActions}>
            <TouchableOpacity
              style={[styles.createAction, styles.saveDraftButton, { borderColor: colors.border }]}
              onPress={() => {
                setFormData(prev => ({ ...prev, status: 'draft' }));
                handleSave();
              }}
            >
              <Text style={[styles.createActionText, { color: colors.text }]}>Save Draft</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.createAction, styles.sendButton, { backgroundColor: '#FF6B6B' }]}
              onPress={() => {
                setFormData(prev => ({ ...prev, status: 'sent' }));
                handleSave();
              }}
            >
              <Icon name="send" size={18} color="#FFFFFF" />
              <Text style={[styles.createActionText, { color: '#FFFFFF' }]}>
                {isEditing ? 'Update' : 'Create & Send'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderTemplateModal = () => (
    <Modal
      visible={templateModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setTemplateModalVisible(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setTemplateModalVisible(false)}
      >
        <View style={[styles.templateModal, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text, padding: 20 }]}>
            Choose Template
          </Text>
          <ScrollView style={styles.templateList}>
            {NOTIFICATION_TEMPLATES.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={[styles.templateItem, { borderColor: colors.border }]}
                onPress={() => applyTemplate(template)}
              >
                <View style={[styles.templateIcon, { backgroundColor: '#FF6B6B20' }]}>
                  <Icon name={template.icon} size={22} color="#FF6B6B" />
                </View>
                <View style={styles.templateContent}>
                  <Text style={[styles.templateName, { color: colors.text }]}>
                    {template.name}
                  </Text>
                  <Text style={[styles.templatePreview, { color: colors.textSecondary }]} numberOfLines={1}>
                    {template.title}
                  </Text>
                </View>
                <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderDetailModal = () => {
    if (!selectedNotification) return null;

    return (
      <Modal
        visible={detailModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDetailModalVisible(false)}
        >
          <View style={[styles.detailModal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Notification Details</Text>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                <Icon name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.detailContent}>
              <View style={[styles.detailStatus, { backgroundColor: getStatusColor(selectedNotification.status) + '20' }]}>
                <Icon name={getTypeIcon(selectedNotification.type)} size={32} color={getStatusColor(selectedNotification.status)} />
                <Text style={[styles.detailStatusText, { color: getStatusColor(selectedNotification.status) }]}>
                  {selectedNotification.status.toUpperCase()}
                </Text>
              </View>

              <Text style={[styles.detailTitle, { color: colors.text }]}>
                {selectedNotification.title}
              </Text>
              <Text style={[styles.detailBody, { color: colors.textSecondary }]}>
                {selectedNotification.body}
              </Text>

              <View style={styles.detailMetrics}>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricValue, { color: colors.text }]}>
                    {selectedNotification.delivery_count.toLocaleString()}
                  </Text>
                  <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                    Delivered
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricValue, { color: colors.text }]}>
                    {selectedNotification.open_count.toLocaleString()}
                  </Text>
                  <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                    Opened
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricValue, { color: colors.text }]}>
                    {selectedNotification.click_count.toLocaleString()}
                  </Text>
                  <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                    Clicked
                  </Text>
                </View>
              </View>

              <View style={styles.detailInfo}>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Type</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{selectedNotification.type}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Priority</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{selectedNotification.priority}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Target</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{selectedNotification.target_audience}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Created</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {new Date(selectedNotification.created_at).toLocaleString()}
                  </Text>
                </View>
                {selectedNotification.sent_at && (
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Sent</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {new Date(selectedNotification.sent_at).toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>

            <View style={styles.detailActions}>
              {(selectedNotification.status === 'draft' || selectedNotification.status === 'scheduled') && (
                <>
                  <TouchableOpacity
                    style={[styles.detailAction, { backgroundColor: colors.primary + '20' }]}
                    onPress={() => handleEdit(selectedNotification)}
                  >
                    <Icon name="pencil" size={18} color={colors.primary} />
                    <Text style={[styles.detailActionText, { color: colors.primary }]}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.detailAction, { backgroundColor: '#00D4AA20' }]}
                    onPress={() => handleSend(selectedNotification)}
                  >
                    <Icon name="send" size={18} color="#00D4AA" />
                    <Text style={[styles.detailActionText, { color: '#00D4AA' }]}>Send</Text>
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity
                style={[styles.detailAction, { backgroundColor: colors.error + '20' }]}
                onPress={() => handleDelete(selectedNotification.id)}
              >
                <Icon name="trash-outline" size={18} color={colors.error} />
                <Text style={[styles.detailActionText, { color: colors.error }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {renderHeader()}
      {renderStats()}
      {renderFilters()}

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading notifications...
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#FF6B6B']}
              tintColor="#FF6B6B"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="notifications-off" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No notifications found
              </Text>
              <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: '#FF6B6B' }]}
                onPress={handleCreate}
              >
                <Icon name="add" size={20} color="#FFFFFF" />
                <Text style={styles.emptyButtonText}>Create First Notification</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {renderCreateModal()}
      {renderTemplateModal()}
      {renderDetailModal()}
    </SafeAreaView>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    paddingVertical: 12,
  },
  statsScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    width: 100,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderRadius: 12,
    height: 44,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    marginLeft: 10,
  },
  filterScroll: {
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weight.semibold,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weight.semibold,
    textTransform: 'uppercase',
  },
  notificationBody: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  notificationMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
  },
  notificationAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: TYPOGRAPHY.weight.semibold,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  createModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  createContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    maxHeight: SCREEN_HEIGHT * 0.55,
  },
  templateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  templateButtonText: {
    fontWeight: TYPOGRAPHY.weight.semibold,
    fontSize: 14,
  },
  formField: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  formTextArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    minHeight: 100,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  audienceChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  audienceChipText: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.medium,
    textTransform: 'capitalize',
  },
  createActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  createAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  saveDraftButton: {
    borderWidth: 1,
  },
  sendButton: {},
  createActionText: {
    fontWeight: TYPOGRAPHY.weight.semibold,
    fontSize: 14,
  },
  templateModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.6,
    paddingBottom: 30,
  },
  templateList: {
    paddingHorizontal: 16,
  },
  templateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  templateIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  templateContent: {
    flex: 1,
  },
  templateName: {
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  templatePreview: {
    fontSize: 12,
    marginTop: 2,
  },
  detailModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
    paddingBottom: 30,
  },
  detailContent: {
    paddingHorizontal: 20,
  },
  detailStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    gap: 12,
  },
  detailStatusText: {
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: 8,
  },
  detailBody: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  detailMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    marginBottom: 20,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  metricLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  detailInfo: {},
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  detailActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  detailAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  detailActionText: {
    fontWeight: TYPOGRAPHY.weight.semibold,
    fontSize: 14,
  },
});

export default AdminTursoNotificationsScreen;

/**
 * Admin Notifications Screen
 * Complete notification management system for admins
 * - Send push notifications to all users or specific groups
 * - View notification history
 * - Manage scheduled notifications
 * - View delivery statistics
 */

import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
  FlatList,
  StatusBar,
  Alert,
  ActivityIndicator,
  Switch,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../../contexts/ThemeContext';
import {TYPOGRAPHY} from '../../constants/design';
import {adminService} from '../../services/admin';
import {adminNotificationService, AdminNotification, NotificationStats, CreateNotificationInput} from '../../services/adminNotifications';
import {Icon} from '../../components/icons';
import {logger} from '../../utils/logger';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/AppNavigator';

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

const {width} = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Notification types
const NOTIFICATION_TYPES = [
  {id: 'general', label: 'General', icon: 'notifications-outline', color: '#4573DF'},
  {id: 'announcement', label: 'Announcement', icon: 'megaphone-outline', color: '#4573DF'},
  {id: 'update', label: 'App Update', icon: 'refresh-outline', color: '#10B981'},
  {id: 'alert', label: 'Alert', icon: 'alert-circle-outline', color: '#EF4444'},
  {id: 'scholarship', label: 'Scholarship', icon: 'wallet-outline', color: '#F59E0B'},
  {id: 'admission', label: 'Admission', icon: 'school-outline', color: '#06B6D4'},
  {id: 'deadline', label: 'Deadline', icon: 'time-outline', color: '#4573DF'},
];

// Target audience options
const TARGET_AUDIENCES = [
  {id: 'all', label: 'All Users', icon: 'people-outline'},
  {id: 'verified', label: 'Verified Users', icon: 'checkmark-circle-outline'},
  {id: 'active', label: 'Active Users (7 days)', icon: 'pulse-outline'},
  {id: 'inactive', label: 'Inactive Users (30+ days)', icon: 'moon-outline'},
  {id: 'premium', label: 'Premium Users', icon: 'star-outline'},
  {id: 'new_users', label: 'New Users (7 days)', icon: 'sparkles-outline'},
];

// Priority levels
const PRIORITY_LEVELS = [
  {id: 'low', label: 'Low', color: '#6B7280'},
  {id: 'normal', label: 'Normal', color: '#4573DF'},
  {id: 'high', label: 'High', color: '#F59E0B'},
  {id: 'urgent', label: 'Urgent', color: '#EF4444'},
];

// ============================================================================
// NOTIFICATION ITEM COMPONENT
// ============================================================================

interface NotificationItemProps {
  notification: AdminNotification;
  onPress: () => void;
  onDelete: () => void;
  colors: any;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onDelete,
  colors,
}) => {
  const typeConfig = NOTIFICATION_TYPES.find(t => t.id === notification.type) || NOTIFICATION_TYPES[0];
  const priorityConfig = PRIORITY_LEVELS.find(p => p.id === notification.priority) || PRIORITY_LEVELS[1];
  
  const getStatusBadge = () => {
    switch (notification.status) {
      case 'sent':
        return {label: 'Sent', color: '#10B981'};
      case 'scheduled':
        return {label: 'Scheduled', color: '#F59E0B'};
      case 'draft':
        return {label: 'Draft', color: '#6B7280'};
      case 'failed':
        return {label: 'Failed', color: '#EF4444'};
      default:
        return {label: 'Unknown', color: '#6B7280'};
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <TouchableOpacity
      style={[styles.notificationItem, {backgroundColor: colors.card}]}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={[styles.notifIconBg, {backgroundColor: typeConfig.color + '20'}]}>
        <Icon name={typeConfig.icon} family="Ionicons" size={24} color={typeConfig.color} />
      </View>
      
      <View style={styles.notifContent}>
        <View style={styles.notifHeader}>
          <Text style={[styles.notifTitle, {color: colors.text}]} numberOfLines={1}>
            {notification.title}
          </Text>
          <View style={[styles.statusBadge, {backgroundColor: statusBadge.color + '20'}]}>
            <Text style={[styles.statusText, {color: statusBadge.color}]}>
              {statusBadge.label}
            </Text>
          </View>
        </View>
        
        <Text style={[styles.notifBody, {color: colors.textSecondary}]} numberOfLines={2}>
          {notification.body}
        </Text>
        
        <View style={styles.notifMeta}>
          <View style={styles.metaItem}>
            <Icon name="people-outline" family="Ionicons" size={12} color={colors.textSecondary} />
            <Text style={[styles.metaText, {color: colors.textSecondary}]}>
              {notification.targetAudience || 'All'}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <View style={[styles.priorityDot, {backgroundColor: priorityConfig.color}]} />
            <Text style={[styles.metaText, {color: colors.textSecondary}]}>
              {priorityConfig.label}
            </Text>
          </View>
          <Text style={[styles.metaText, {color: colors.textSecondary}]}>
            {formatDate(notification.createdAt)}
          </Text>
        </View>
        
        {notification.stats && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, {color: colors.text}]}>
                {notification.stats.sent || 0}
              </Text>
              <Text style={[styles.statLabel, {color: colors.textSecondary}]}>Sent</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, {color: '#10B981'}]}>
                {notification.stats.delivered || 0}
              </Text>
              <Text style={[styles.statLabel, {color: colors.textSecondary}]}>Delivered</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, {color: '#4573DF'}]}>
                {notification.stats.opened || 0}
              </Text>
              <Text style={[styles.statLabel, {color: colors.textSecondary}]}>Opened</Text>
            </View>
          </View>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.deleteBtn}
        onPress={(e) => {
          e.stopPropagation();
          onDelete();
        }}>
        <Icon name="trash-outline" family="Ionicons" size={18} color="#EF4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

// ============================================================================
// CREATE NOTIFICATION MODAL
// ============================================================================

interface CreateNotificationModalProps {
  visible: boolean;
  onClose: () => void;
  onSend: (notification: CreateNotificationInput) => Promise<void>;
  colors: any;
  isDark: boolean;
}

const CreateNotificationModal: React.FC<CreateNotificationModalProps> = ({
  visible,
  onClose,
  onSend,
  colors,
  isDark,
}) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState('general');
  const [targetAudience, setTargetAudience] = useState('all');
  const [priority, setPriority] = useState('normal');
  const [actionUrl, setActionUrl] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [sending, setSending] = useState(false);

  const resetForm = () => {
    setTitle('');
    setBody('');
    setType('general');
    setTargetAudience('all');
    setPriority('normal');
    setActionUrl('');
    setScheduledAt('');
    setIsScheduled(false);
  };

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Error', 'Please enter title and message');
      return;
    }

    setSending(true);
    try {
      await onSend({
        title: title.trim(),
        body: body.trim(),
        type: type as AdminNotification['type'],
        targetAudience,
        priority: priority as AdminNotification['priority'],
        actionUrl: actionUrl.trim() || undefined,
        scheduledAt: isScheduled && scheduledAt ? scheduledAt : undefined,
        status: isScheduled ? 'scheduled' : 'sent',
      });
      resetForm();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter at least a title');
      return;
    }

    setSending(true);
    try {
      await onSend({
        title: title.trim(),
        body: body.trim(),
        type: type as AdminNotification['type'],
        targetAudience,
        priority: priority as AdminNotification['priority'],
        actionUrl: actionUrl.trim() || undefined,
        status: 'draft',
      });
      resetForm();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save draft');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}>
        <View style={[styles.modalContent, {backgroundColor: colors.card}]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, {color: colors.text}]}>
              Send Notification
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" family="Ionicons" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Title Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, {color: colors.text}]}>Title *</Text>
              <TextInput
                style={[styles.input, {
                  backgroundColor: isDark ? colors.background : '#F8FAFC',
                  color: colors.text,
                  borderColor: colors.border,
                }]}
                placeholder="Notification title..."
                placeholderTextColor={colors.textSecondary}
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />
            </View>

            {/* Body Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, {color: colors.text}]}>Message *</Text>
              <TextInput
                style={[styles.input, styles.textArea, {
                  backgroundColor: isDark ? colors.background : '#F8FAFC',
                  color: colors.text,
                  borderColor: colors.border,
                }]}
                placeholder="Notification message..."
                placeholderTextColor={colors.textSecondary}
                value={body}
                onChangeText={setBody}
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
              />
              <Text style={[styles.charCount, {color: colors.textSecondary}]}>
                {body.length}/500
              </Text>
            </View>

            {/* Type Selection */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, {color: colors.text}]}>Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipRow}>
                  {NOTIFICATION_TYPES.map((t) => (
                    <TouchableOpacity
                      key={t.id}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: type === t.id ? t.color + '20' : colors.background,
                          borderColor: type === t.id ? t.color : colors.border,
                        },
                      ]}
                      onPress={() => setType(t.id)}>
                      <Icon name={t.icon} family="Ionicons" size={16} color={t.color} />
                      <Text style={[styles.chipText, {color: type === t.id ? t.color : colors.text}]}>
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Target Audience */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, {color: colors.text}]}>Target Audience</Text>
              <View style={styles.audienceGrid}>
                {TARGET_AUDIENCES.map((audience) => (
                  <TouchableOpacity
                    key={audience.id}
                    style={[
                      styles.audienceItem,
                      {
                        backgroundColor: targetAudience === audience.id 
                          ? colors.primary + '20' 
                          : colors.background,
                        borderColor: targetAudience === audience.id 
                          ? colors.primary 
                          : colors.border,
                      },
                    ]}
                    onPress={() => setTargetAudience(audience.id)}>
                    <Icon 
                      name={audience.icon} 
                      family="Ionicons" 
                      size={20} 
                      color={targetAudience === audience.id ? colors.primary : colors.textSecondary} 
                    />
                    <Text style={[
                      styles.audienceText, 
                      {color: targetAudience === audience.id ? colors.primary : colors.text}
                    ]}>
                      {audience.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Priority */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, {color: colors.text}]}>Priority</Text>
              <View style={styles.priorityRow}>
                {PRIORITY_LEVELS.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      styles.priorityItem,
                      {
                        backgroundColor: priority === p.id ? p.color + '20' : colors.background,
                        borderColor: priority === p.id ? p.color : colors.border,
                      },
                    ]}
                    onPress={() => setPriority(p.id)}>
                    <View style={[styles.priorityDotLarge, {backgroundColor: p.color}]} />
                    <Text style={[styles.priorityText, {color: priority === p.id ? p.color : colors.text}]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Action URL */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, {color: colors.text}]}>Action URL (Optional)</Text>
              <TextInput
                style={[styles.input, {
                  backgroundColor: isDark ? colors.background : '#F8FAFC',
                  color: colors.text,
                  borderColor: colors.border,
                }]}
                placeholder="Deep link or URL..."
                placeholderTextColor={colors.textSecondary}
                value={actionUrl}
                onChangeText={setActionUrl}
                autoCapitalize="none"
              />
            </View>

            {/* Schedule Toggle */}
            <View style={styles.inputGroup}>
              <View style={styles.switchRow}>
                <Text style={[styles.inputLabel, {color: colors.text, marginBottom: 0}]}>
                  Schedule for later
                </Text>
                <Switch
                  value={isScheduled}
                  onValueChange={setIsScheduled}
                  trackColor={{false: colors.border, true: colors.primary + '50'}}
                  thumbColor={isScheduled ? colors.primary : '#f4f3f4'}
                />
              </View>
              {isScheduled && (
                <TextInput
                  style={[styles.input, {
                    backgroundColor: isDark ? colors.background : '#F8FAFC',
                    color: colors.text,
                    borderColor: colors.border,
                    marginTop: 8,
                  }]}
                  placeholder="YYYY-MM-DD HH:MM"
                  placeholderTextColor={colors.textSecondary}
                  value={scheduledAt}
                  onChangeText={setScheduledAt}
                />
              )}
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalBtn, styles.draftBtn, {backgroundColor: colors.background}]}
              onPress={handleSaveDraft}
              disabled={sending}>
              <Icon name="document-text-outline" family="Ionicons" size={18} color={colors.text} />
              <Text style={[styles.modalBtnText, {color: colors.text}]}>Save Draft</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalBtn, styles.sendBtn]}
              onPress={handleSend}
              disabled={sending}>
              {sending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="send" family="Ionicons" size={18} color="#FFFFFF" />
                  <Text style={[styles.modalBtnText, {color: '#FFFFFF'}]}>
                    {isScheduled ? 'Schedule' : 'Send Now'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ============================================================================
// STATS CARD COMPONENT
// ============================================================================

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: string;
  subtitle?: string;
  colors: any;
}

const StatsCard: React.FC<StatsCardProps> = ({title, value, icon, color, subtitle, colors}) => (
  <View style={[styles.statsCard, {backgroundColor: colors.card}]}>
    <View style={[styles.statsIconBg, {backgroundColor: color + '20'}]}>
      <Icon name={icon} family="Ionicons" size={24} color={color} />
    </View>
    <Text style={[styles.statsValue, {color: colors.text}]}>{value}</Text>
    <Text style={[styles.statsTitle, {color: colors.textSecondary}]}>{title}</Text>
    {subtitle && (
      <Text style={[styles.statsSubtitle, {color: color}]}>{subtitle}</Text>
    )}
  </View>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AdminNotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {colors, isDark} = useTheme();
  
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'sent' | 'scheduled' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [notificationsData, statsData] = await Promise.all([
        adminNotificationService.getNotifications(),
        adminNotificationService.getNotificationStats(),
      ]);
      setNotifications(notificationsData);
      setStats(statsData);
    } catch (error) {
      logger.error('Error loading notifications', error, 'AdminNotifications');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleSendNotification = async (notification: CreateNotificationInput) => {
    const success = await adminNotificationService.sendNotification(notification);
    if (success) {
      await loadData();
      Alert.alert('Success', notification.status === 'draft' 
        ? 'Draft saved successfully' 
        : notification.status === 'scheduled'
          ? 'Notification scheduled successfully'
          : 'Notification sent successfully'
      );
    } else {
      throw new Error('Failed to send notification');
    }
  };

  const handleDeleteNotification = async (id: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await adminNotificationService.deleteNotification(id);
            if (success) {
              setNotifications(prev => prev.filter(n => n.id !== id));
            }
          },
        },
      ]
    );
  };

  const filteredNotifications = notifications
    .filter(n => {
      if (selectedFilter !== 'all' && n.status !== selectedFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return n.title.toLowerCase().includes(query) || n.body.toLowerCase().includes(query);
      }
      return true;
    });

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="notifications-off-outline" family="Ionicons" size={64} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, {color: colors.text}]}>No Notifications Yet</Text>
      <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
        Start sending notifications to your users
      </Text>
      <TouchableOpacity
        style={[styles.emptyBtn, {backgroundColor: colors.primary}]}
        onPress={() => setShowCreateModal(true)}>
        <Icon name="add" family="Ionicons" size={20} color="#FFFFFF" />
        <Text style={styles.emptyBtnText}>Create Notification</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <LinearGradient
          colors={isDark ? ['#1E1E2E', '#2D1F3D'] : ['#4573DF', '#4573DF']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" family="Ionicons" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.headerTitleSection}>
              <Text style={styles.headerTitle}>Notifications</Text>
              <Text style={styles.headerSubtitle}>Send & Manage Push Notifications</Text>
            </View>

            <TouchableOpacity 
              style={styles.createBtn}
              onPress={() => setShowCreateModal(true)}>
              <Icon name="add" family="Ionicons" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }>
          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <StatsCard
              title="Total Sent"
              value={stats?.totalSent || 0}
              icon="paper-plane-outline"
              color="#4573DF"
              colors={colors}
            />
            <StatsCard
              title="Delivered"
              value={stats?.totalDelivered || 0}
              icon="checkmark-done-outline"
              color="#10B981"
              subtitle={stats?.deliveryRate ? `${stats.deliveryRate}%` : undefined}
              colors={colors}
            />
            <StatsCard
              title="Opened"
              value={stats?.totalOpened || 0}
              icon="eye-outline"
              color="#4573DF"
              subtitle={stats?.openRate ? `${stats.openRate}%` : undefined}
              colors={colors}
            />
            <StatsCard
              title="Scheduled"
              value={stats?.scheduled || 0}
              icon="time-outline"
              color="#F59E0B"
              colors={colors}
            />
          </View>

          {/* Search & Filters */}
          <View style={styles.filtersSection}>
            <View style={[styles.searchBar, {backgroundColor: colors.card}]}>
              <Icon name="search-outline" family="Ionicons" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, {color: colors.text}]}
                placeholder="Search notifications..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Icon name="close-circle" family="Ionicons" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <View style={styles.filterRow}>
                {(['all', 'sent', 'scheduled', 'draft'] as const).map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: selectedFilter === filter ? colors.primary : colors.card,
                      },
                    ]}
                    onPress={() => setSelectedFilter(filter)}>
                    <Text style={[
                      styles.filterText,
                      {color: selectedFilter === filter ? '#FFFFFF' : colors.text},
                    ]}>
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Notifications List */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: colors.text}]}>
              Recent Notifications ({filteredNotifications.length})
            </Text>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : filteredNotifications.length === 0 ? (
              renderEmptyState()
            ) : (
              filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onPress={() => {
                    // View notification details
                    Alert.alert(notification.title, notification.body);
                  }}
                  onDelete={() => handleDeleteNotification(notification.id)}
                  colors={colors}
                />
              ))
            )}
          </View>

          {/* Quick Templates */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: colors.text}]}>Quick Templates</Text>
            
            <View style={styles.templatesGrid}>
              {[
                {icon: 'megaphone', label: 'Announcement', color: '#4573DF'},
                {icon: 'school', label: 'Admission Open', color: '#4573DF'},
                {icon: 'wallet', label: 'Scholarship', color: '#F59E0B'},
                {icon: 'time', label: 'Deadline', color: '#EF4444'},
                {icon: 'refresh', label: 'App Update', color: '#10B981'},
                {icon: 'sparkles', label: 'New Feature', color: '#4573DF'},
              ].map((template, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.templateItem, {backgroundColor: colors.card}]}
                  onPress={() => {
                    setShowCreateModal(true);
                    // Pre-fill template data
                  }}>
                  <View style={[styles.templateIcon, {backgroundColor: template.color + '20'}]}>
                    <Icon name={template.icon} family="Ionicons" size={24} color={template.color} />
                  </View>
                  <Text style={[styles.templateLabel, {color: colors.text}]}>{template.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{height: 100}} />
        </ScrollView>

        {/* Create Notification Modal */}
        <CreateNotificationModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSend={handleSendNotification}
          colors={colors}
          isDark={isDark}
        />

        {/* Floating Action Button */}
        <TouchableOpacity
          style={[styles.fab, {backgroundColor: colors.primary}]}
          onPress={() => setShowCreateModal(true)}>
          <Icon name="add" family="Ionicons" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleSection: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  createBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statsCard: {
    width: (width - 48) / 2,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statsIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weight.heavy,
  },
  statsTitle: {
    fontSize: 13,
    marginTop: 4,
  },
  statsSubtitle: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginTop: 2,
  },
  filtersSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
  },
  filterScroll: {
    marginTop: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  notifIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifContent: {
    flex: 1,
    marginLeft: 12,
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weight.semibold,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  notifBody: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  notifMeta: {
    flexDirection: 'row',
    alignItems: 'center',
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
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  statLabel: {
    fontSize: 10,
  },
  deleteBtn: {
    padding: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
    gap: 8,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  templateItem: {
    width: (width - 48 - 12) / 3,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  templateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateLabel: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.medium,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 15,
    borderWidth: 1,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    textAlign: 'right',
    marginTop: 4,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  audienceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  audienceItem: {
    width: (width - 60) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  audienceText: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weight.medium,
    flex: 1,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  priorityDotLarge: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  priorityText: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  modalBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  draftBtn: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  sendBtn: {
    backgroundColor: '#4573DF',
  },
  modalBtnText: {
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
});

export default AdminNotificationsScreen;



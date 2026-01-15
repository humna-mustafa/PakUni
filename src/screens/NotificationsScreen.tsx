/**
 * NotificationsScreen - View and manage notifications
 */

import React, {useCallback, memo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '../components/icons';
import {useTheme} from '../contexts/ThemeContext';
import {useNotifications, LocalNotification} from '../services/notifications';

// ============================================================================
// NOTIFICATION ITEM COMPONENT
// ============================================================================

interface NotificationItemProps {
  notification: LocalNotification;
  onPress: (notification: LocalNotification) => void;
  onDelete: (id: string) => void;
  colors: any;
}

const NotificationItem = memo<NotificationItemProps>(({
  notification,
  onPress,
  onDelete,
  colors,
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'scholarship': return {name: 'ribbon-outline', color: '#F59E0B'};
      case 'admission': return {name: 'school-outline', color: '#10B981'};
      case 'test': return {name: 'document-text-outline', color: '#3B82F6'};
      case 'tip': return {name: 'bulb-outline', color: '#8B5CF6'};
      case 'update': return {name: 'sparkles-outline', color: '#EC4899'};
      default: return {name: 'notifications-outline', color: colors.primary};
    }
  };

  const typeIcon = getTypeIcon(notification.type);
  const timeAgo = getTimeAgo(notification.createdAt);

  return (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        {backgroundColor: colors.card},
        !notification.read && styles.unreadItem,
      ]}
      onPress={() => onPress(notification)}
      activeOpacity={0.8}>
      {/* Unread indicator */}
      {!notification.read && (
        <View style={[styles.unreadDot, {backgroundColor: colors.primary}]} />
      )}

      {/* Icon */}
      <View style={[styles.iconContainer, {backgroundColor: `${typeIcon.color}15`}]}>
        <Icon name={typeIcon.name} family="Ionicons" size={24} color={typeIcon.color} />
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <Text
          style={[
            styles.notificationTitle,
            {color: colors.text},
            !notification.read && styles.unreadTitle,
          ]}
          numberOfLines={1}>
          {notification.title}
        </Text>
        <Text
          style={[styles.notificationBody, {color: colors.textSecondary}]}
          numberOfLines={2}>
          {notification.body}
        </Text>
        <Text style={[styles.timeText, {color: colors.textSecondary}]}>
          {timeAgo}
        </Text>
      </View>

      {/* Delete button */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(notification.id)}
        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
        <Icon name="close" family="Ionicons" size={18} color={colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors, isDark} = useTheme();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  const handleNotificationPress = useCallback((notification: LocalNotification) => {
    markAsRead(notification.id);
    // Navigate based on notification type
    // You can add navigation logic here based on notification.data
  }, [markAsRead]);

  const handleDelete = useCallback((id: string) => {
    deleteNotification(id);
  }, [deleteNotification]);

  const handleClearAll = useCallback(() => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to delete all notifications?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Clear All', style: 'destructive', onPress: clearAll},
      ]
    );
  }, [clearAll]);

  const renderItem = useCallback(({item}: {item: LocalNotification}) => (
    <NotificationItem
      notification={item}
      onPress={handleNotificationPress}
      onDelete={handleDelete}
      colors={colors}
    />
  ), [colors, handleNotificationPress, handleDelete]);

  const keyExtractor = useCallback((item: LocalNotification) => item.id, []);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconContainer, {backgroundColor: colors.card}]}>
        <Icon name="notifications-off-outline" family="Ionicons" size={48} color={colors.textSecondary} />
      </View>
      <Text style={[styles.emptyTitle, {color: colors.text}]}>No Notifications</Text>
      <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
        You're all caught up! New notifications will appear here.
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={[styles.header, {borderBottomColor: colors.border}]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" family="Ionicons" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, {color: colors.text}]}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={[styles.badge, {backgroundColor: colors.primary}]}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>

          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={markAllAsRead}>
                <Icon name="checkmark-done" family="Ionicons" size={22} color={colors.primary} />
              </TouchableOpacity>
            )}
            {notifications.length > 0 && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleClearAll}>
                <Icon name="trash-outline" family="Ionicons" size={22} color={colors.error} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Notifications List */}
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={[
            styles.listContent,
            notifications.length === 0 && styles.emptyList,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
        />
      </SafeAreaView>
    </View>
  );
};

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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  badge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: 16,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  unreadItem: {
    borderLeftWidth: 3,
  },
  unreadDot: {
    position: 'absolute',
    top: 16,
    left: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  notificationBody: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  timeText: {
    fontSize: 11,
  },
  deleteButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default NotificationsScreen;

/**
 * NotificationsScreen - View and manage notifications
 * Enhanced with swipe-to-dismiss, mark-as-read, and premium animations
 */

import React, {useCallback, memo, useRef, useEffect, useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
  Animated,
  Easing,
  PanResponder,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '../components/icons';
import {useTheme} from '../contexts/ThemeContext';
import {TYPOGRAPHY} from '../constants/design';
import {useNotifications, LocalNotification} from '../services/notifications';

// ============================================================================
// NOTIFICATION ITEM COMPONENT - With Swipe-to-Dismiss and Animations
// ============================================================================

interface NotificationItemProps {
  notification: LocalNotification;
  onPress: (notification: LocalNotification) => void;
  onDelete: (id: string) => void;
  onMarkRead: (id: string) => void;
  colors: any;
  index: number;
}

const SWIPE_THRESHOLD = 80;

const NotificationItem = memo<NotificationItemProps>(({
  notification,
  onPress,
  onDelete,
  onMarkRead,
  colors,
  index,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const swipeX = useRef(new Animated.Value(0)).current;
  const rowHeight = useRef(new Animated.Value(1)).current;

  // Refs to avoid stale closures in PanResponder
  const isReadRef = useRef(notification.read);
  isReadRef.current = notification.read;
  const deleteRef = useRef<() => void>();

  useEffect(() => {
    const delay = Math.min(index * 50, 300);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  const deleteWithAnimation = useCallback(() => {
    Animated.parallel([
      Animated.timing(swipeX, {toValue: -400, duration: 250, useNativeDriver: true}),
      Animated.timing(rowHeight, {toValue: 0, duration: 300, delay: 150, useNativeDriver: false}),
      Animated.timing(fadeAnim, {toValue: 0, duration: 250, useNativeDriver: true}),
    ]).start(() => onDelete(notification.id));
  }, [notification.id, onDelete, swipeX, rowHeight, fadeAnim]);

  // Keep delete ref up-to-date for PanResponder
  deleteRef.current = deleteWithAnimation;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 30,
      onPanResponderMove: (_, gestureState) => {
        // Only allow left swipe (negative dx) for delete
        if (gestureState.dx < 0) {
          swipeX.setValue(gestureState.dx);
        }
        // Right swipe (mark as read) - only if unread
        if (gestureState.dx > 0 && !isReadRef.current) {
          swipeX.setValue(Math.min(gestureState.dx, 80));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -SWIPE_THRESHOLD) {
          // Swipe left past threshold → delete
          deleteRef.current?.();
        } else if (gestureState.dx > 60 && !isReadRef.current) {
          // Swipe right → mark as read
          onMarkRead(notification.id);
          Animated.spring(swipeX, {toValue: 0, tension: 60, friction: 8, useNativeDriver: true}).start();
        } else {
          // Snap back
          Animated.spring(swipeX, {toValue: 0, tension: 100, friction: 8, useNativeDriver: true}).start();
        }
      },
    })
  ).current;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'scholarship': return {name: 'ribbon', color: '#F59E0B'};
      case 'admission': return {name: 'school', color: '#10B981'};
      case 'test': return {name: 'document-text', color: '#4573DF'};
      case 'tip': return {name: 'bulb', color: '#8B5CF6'};
      case 'update': return {name: 'sparkles', color: '#4573DF'};
      case 'contribution_approved': return {name: 'checkmark-circle', color: '#10B981'};
      default: return {name: 'notifications', color: colors.primary};
    }
  };

  const typeIcon = getTypeIcon(notification.type);
  const timeAgo = getTimeAgo(notification.createdAt);

  // Background action hints
  const deleteOpacity = swipeX.interpolate({
    inputRange: [-SWIPE_THRESHOLD, -20, 0],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });
  const markReadOpacity = swipeX.interpolate({
    inputRange: [0, 20, 60],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });
  const cardShadowOpacity = swipeX.interpolate({
    inputRange: [-80, -20, 0],
    outputRange: [0.8, 0.3, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={{
      opacity: fadeAnim,
      transform: [{translateY: slideAnim}],
      marginHorizontal: 16,
      marginVertical: 4,
    }}>
      {/* Swipe background - Delete (red) */}
      <Animated.View style={[styles.swipeBackground, styles.swipeDeleteBg, {opacity: deleteOpacity}]}>
        <Icon name="trash-outline" family="Ionicons" size={22} color="#FFF" />
        <Text style={styles.swipeActionText}>Delete</Text>
      </Animated.View>
      {/* Swipe background - Mark Read (green) */}
      {!notification.read && (
        <Animated.View style={[styles.swipeBackground, styles.swipeReadBg, {opacity: markReadOpacity}]}>
          <Icon name="checkmark-done" family="Ionicons" size={22} color="#FFF" />
          <Text style={styles.swipeActionText}>Read</Text>
        </Animated.View>
      )}

      <Animated.View
        {...panResponder.panHandlers}
        style={[
          {transform: [{translateX: swipeX}]},
        ]}>
        <TouchableOpacity
          style={[
            styles.notificationItem,
            {backgroundColor: colors.card},
            !notification.read && {borderLeftWidth: 3, borderLeftColor: colors.primary},
          ]}
          onPress={() => {
            if (!notification.read) onMarkRead(notification.id);
            onPress(notification);
          }}
          activeOpacity={0.85}>

          {/* Unread glow background */}
          {!notification.read && (
            <View style={[styles.unreadGlow, {backgroundColor: colors.primary + '08'}]} />
          )}

          {/* Unread dot */}
          {!notification.read && (
            <View style={[styles.unreadDot, {backgroundColor: colors.primary}]} />
          )}

          {/* Icon */}
          <View style={[styles.iconContainer, {backgroundColor: typeIcon.color + '18'}]}>
            <Icon name={typeIcon.name} family="Ionicons" size={22} color={typeIcon.color} />
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            <View style={styles.titleRow}>
              <Text
                style={[
                  styles.notificationTitle,
                  {color: colors.text},
                  !notification.read && {fontWeight: '700'},
                ]}
                numberOfLines={1}>
                {notification.title}
              </Text>
              {!notification.read && (
                <View style={[styles.newBadge, {backgroundColor: colors.primary}]}>
                  <Text style={styles.newBadgeText}>NEW</Text>
                </View>
              )}
            </View>
            <Text
              style={[styles.notificationBody, {color: colors.textSecondary}]}
              numberOfLines={2}>
              {notification.body}
            </Text>
            <View style={styles.metaRow}>
              <Text style={[styles.timeText, {color: colors.textSecondary}]}>
                {timeAgo}
              </Text>
              {!notification.read && (
                <TouchableOpacity
                  onPress={() => onMarkRead(notification.id)}
                  hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                  <Text style={[styles.markReadText, {color: colors.primary}]}>Mark read</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Delete button */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={deleteWithAnimation}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Icon name="close" family="Ionicons" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
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
  const navigation = useNavigation<any>();
  const {colors, isDark} = useTheme();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  // Filter state
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'read'>('all');

  // Animation refs
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlideAnim = useRef(new Animated.Value(-30)).current;
  const bellShakeAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    switch (activeFilter) {
      case 'unread': return notifications.filter(n => !n.read);
      case 'read': return notifications.filter(n => n.read);
      default: return notifications;
    }
  }, [notifications, activeFilter]);

  useEffect(() => {
    // Header entrance animation
    Animated.parallel([
      Animated.timing(headerFadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(headerSlideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Bell shake animation when there are unread notifications
    if (unreadCount > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bellShakeAnim, {
            toValue: 1,
            duration: 100,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(bellShakeAnim, {
            toValue: -1,
            duration: 100,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(bellShakeAnim, {
            toValue: 0,
            duration: 100,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.delay(3000),
        ])
      ).start();
    }

    // Floating animation for empty state
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [unreadCount]);

  const bellRotateZ = bellShakeAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  const floatTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const handleNotificationPress = useCallback((notification: LocalNotification) => {
    markAsRead(notification.id);
    // Navigate based on notification type
    const typeRoutes: Record<string, string> = {
      scholarship: 'Scholarships',
      admission: 'Universities',
      test: 'EntryTests',
      tip: 'Guides',
      update: 'Home',
      contribution_approved: 'Home',
    };
    const route = notification.data?.route || typeRoutes[notification.type];
    if (route) {
      try {
        navigation.navigate(route as any);
      } catch (_) {}
    }
  }, [markAsRead, navigation]);

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

  const renderItem = useCallback(({item, index}: {item: LocalNotification; index: number}) => (
    <NotificationItem
      notification={item}
      onPress={handleNotificationPress}
      onDelete={handleDelete}
      onMarkRead={markAsRead}
      colors={colors}
      index={index}
    />
  ), [colors, handleNotificationPress, handleDelete, markAsRead]);

  const keyExtractor = useCallback((item: LocalNotification) => item.id, []);

  const renderEmpty = () => (
    <Animated.View 
      style={[
        styles.emptyContainer,
        {transform: [{translateY: floatTranslateY}]},
      ]}>
      <View style={[styles.emptyIconContainer, {backgroundColor: colors.card}]}>
        <Icon name="notifications-off-outline" family="Ionicons" size={48} color={colors.textSecondary} />
      </View>
      <Text style={[styles.emptyTitle, {color: colors.text}]}>No Notifications</Text>
      <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
        You're all caught up! New notifications will appear here.
      </Text>
    </Animated.View>
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Floating Decorations */}
        <Animated.View
          style={[
            styles.floatingBell1,
            {
              opacity: 0.06,
              transform: [{translateY: floatTranslateY}],
            },
          ]}>
          <Icon name="notifications" family="Ionicons" size={60} color={colors.primary} />
        </Animated.View>
        <Animated.View
          style={[
            styles.floatingBell2,
            {
              opacity: 0.04,
            },
          ]}>
          <Icon name="notifications-outline" family="Ionicons" size={40} color={colors.primary} />
        </Animated.View>

        {/* Header with Animation */}
        <Animated.View 
          style={[
            styles.header, 
            {borderBottomColor: colors.border},
            {
              opacity: headerFadeAnim,
              transform: [{translateY: headerSlideAnim}],
            },
          ]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" family="Ionicons" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Animated.View style={{transform: [{rotate: bellRotateZ}]}}>
              <LinearGradient
                colors={[colors.primary, colors.secondary || '#6366F1']}
                style={styles.headerIconGradient}>
                <Icon name="notifications-outline" family="Ionicons" size={16} color="#FFFFFF" />
              </LinearGradient>
            </Animated.View>
            <Text style={[styles.headerTitle, {color: colors.text}]}>Notifications</Text>
            {unreadCount > 0 && (
              <Animated.View 
                style={[
                  styles.badge, 
                  {backgroundColor: colors.primary},
                  {transform: [{scale: bellShakeAnim.interpolate({
                    inputRange: [-1, 0, 1],
                    outputRange: [1.1, 1, 1.1],
                  })}]},
                ]}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </Animated.View>
            )}
          </View>

          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity
                style={[styles.markAllButton, {backgroundColor: colors.primary + '15', borderColor: colors.primary + '30'}]}
                onPress={markAllAsRead}>
                <Icon name="checkmark-done" family="Ionicons" size={14} color={colors.primary} />
                <Text style={[styles.markAllText, {color: colors.primary}]}>Mark all read</Text>
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
        </Animated.View>

        {/* Filter Tabs */}
        <View style={[styles.filterTabs, {borderBottomColor: colors.border}]}>
          {(['all', 'unread', 'read'] as const).map(filter => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterTab,
                activeFilter === filter && {borderBottomWidth: 2, borderBottomColor: colors.primary},
              ]}
              onPress={() => setActiveFilter(filter)}>
              <Text style={[
                styles.filterTabText,
                {color: activeFilter === filter ? colors.primary : colors.textSecondary},
                activeFilter === filter && {fontWeight: '700'},
              ]}>
                {filter === 'all' ? `All (${notifications.length})` :
                 filter === 'unread' ? `Unread (${unreadCount})` :
                 `Read (${notifications.length - unreadCount})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notifications List */}
        <FlatList
          data={filteredNotifications}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={[
            styles.listContent,
            filteredNotifications.length === 0 && styles.emptyList,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
          ListHeaderComponent={notifications.length > 0 ? () => (
            <View style={styles.swipeHint}>
              <View style={styles.swipeHintItem}>
                <Icon name="arrow-back" family="Ionicons" size={12} color="#10B981" />
                <Text style={[styles.swipeHintText, {color: '#10B981'}]}>Swipe right to mark read</Text>
              </View>
              <View style={styles.swipeHintItem}>
                <Text style={[styles.swipeHintText, {color: '#EF4444'}]}>Swipe left to delete</Text>
                <Icon name="arrow-forward" family="Ionicons" size={12} color="#EF4444" />
              </View>
            </View>
          ) : undefined}
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
  // Floating decorations
  floatingBell1: {
    position: 'absolute',
    top: 100,
    right: -15,
    zIndex: 0,
  },
  floatingBell2: {
    position: 'absolute',
    top: 250,
    left: -10,
    zIndex: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    zIndex: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    gap: 8,
  },
  headerIconGradient: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  markAllText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 16,
    opacity: 0.7,
  },
  swipeHintItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  swipeHintText: {
    fontSize: 11,
  },
  filterTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginHorizontal: 16,
    marginBottom: 4,
  },
  filterTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  filterTabText: {
    fontSize: 13,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  swipeBackground: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 0,
    right: 0,
    borderRadius: 16,
    justifyContent: 'center',
  },
  swipeDeleteBg: {
    backgroundColor: '#EF4444',
    alignItems: 'flex-end',
    paddingRight: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6,
  },
  swipeReadBg: {
    backgroundColor: '#10B981',
    alignItems: 'flex-start',
    paddingLeft: 20,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 6,
  },
  swipeActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  unreadGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  unreadDot: {
    position: 'absolute',
    top: 14,
    right: 44,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.medium,
    flex: 1,
  },
  newBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  notificationBody: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 11,
  },
  markReadText: {
    fontSize: 11,
    fontWeight: '600',
  },
  deleteButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 40,
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
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default NotificationsScreen;



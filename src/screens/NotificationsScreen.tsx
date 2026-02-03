/**
 * NotificationsScreen - View and manage notifications
 * Enhanced with premium animations
 */

import React, {useCallback, memo, useRef, useEffect} from 'react';
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
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '../components/icons';
import {useTheme} from '../contexts/ThemeContext';
import {TYPOGRAPHY} from '../constants/design';
import {useNotifications, LocalNotification} from '../services/notifications';

// ============================================================================
// NOTIFICATION ITEM COMPONENT - With Animations
// ============================================================================

interface NotificationItemProps {
  notification: LocalNotification;
  onPress: (notification: LocalNotification) => void;
  onDelete: (id: string) => void;
  colors: any;
  index: number;
}

const NotificationItem = memo<NotificationItemProps>(({
  notification,
  onPress,
  onDelete,
  colors,
  index,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const deleteScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const delay = index * 60;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
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

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handleDeletePressIn = () => {
    Animated.spring(deleteScaleAnim, {
      toValue: 1.2,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handleDeletePressOut = () => {
    Animated.spring(deleteScaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'scholarship': return {name: 'ribbon-outline', color: '#F59E0B'};
      case 'admission': return {name: 'school-outline', color: '#10B981'};
      case 'test': return {name: 'document-text-outline', color: '#4573DF'};
      case 'tip': return {name: 'bulb-outline', color: '#4573DF'};
      case 'update': return {name: 'sparkles-outline', color: '#4573DF'};
      default: return {name: 'notifications-outline', color: colors.primary};
    }
  };

  const typeIcon = getTypeIcon(notification.type);
  const timeAgo = getTimeAgo(notification.createdAt);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{translateX: slideAnim}, {scale: scaleAnim}],
      }}>
      <TouchableOpacity
        style={[
          styles.notificationItem,
          {backgroundColor: colors.card},
          !notification.read && [styles.unreadItem, {borderLeftColor: colors.primary}],
        ]}
        onPress={() => onPress(notification)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
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
        <Animated.View style={{transform: [{scale: deleteScaleAnim}]}}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(notification.id)}
            onPressIn={handleDeletePressIn}
            onPressOut={handleDeletePressOut}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Icon name="close" family="Ionicons" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
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

  // Animation refs
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlideAnim = useRef(new Animated.Value(-30)).current;
  const bellShakeAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

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

  const renderItem = useCallback(({item, index}: {item: LocalNotification; index: number}) => (
    <NotificationItem
      notification={item}
      onPress={handleNotificationPress}
      onDelete={handleDelete}
      colors={colors}
      index={index}
    />
  ), [colors, handleNotificationPress, handleDelete]);

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
        </Animated.View>

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
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
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
    fontWeight: TYPOGRAPHY.weight.medium,
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: TYPOGRAPHY.weight.bold,
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



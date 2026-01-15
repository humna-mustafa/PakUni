/**
 * NotificationBell Component
 * Modern bell icon with badge + dropdown notification panel
 * Replaces full-screen notification page with lightweight widget
 */

import React, {useState, useRef, useEffect, memo, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  FlatList,
  Platform,
  Pressable,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../contexts/ThemeContext';
import {Icon} from './icons';
import {Haptics} from '../utils/haptics';
import {
  MODERN_SPACING,
  MODERN_RADIUS,
  MODERN_TYPOGRAPHY,
  MODERN_SHADOWS,
} from '../constants/modern-design';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// ============================================================================
// TYPES
// ============================================================================

export type NotificationType = 'deadline' | 'scholarship' | 'news' | 'update' | 'alert';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionLabel?: string;
  actionRoute?: string;
}

interface NotificationBellProps {
  notifications?: Notification[];
  onNotificationPress?: (notification: Notification) => void;
  onSeeAllPress?: () => void;
  onClearAll?: () => void;
  size?: number;
}

// ============================================================================
// NOTIFICATION TYPE CONFIG
// ============================================================================

const NOTIFICATION_CONFIG: Record<NotificationType, {
  icon: string;
  color: string;
  bgColor: string;
}> = {
  deadline: {
    icon: 'time-outline',
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.12)',
  },
  scholarship: {
    icon: 'ribbon-outline',
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.12)',
  },
  news: {
    icon: 'newspaper-outline',
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.12)',
  },
  update: {
    icon: 'refresh-outline',
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.12)',
  },
  alert: {
    icon: 'warning-outline',
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.12)',
  },
};

// ============================================================================
// SAMPLE NOTIFICATIONS (Replace with real data)
// ============================================================================

const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'deadline',
    title: 'NUST Application Deadline',
    message: 'Only 3 days left to submit your application',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    read: false,
    actionLabel: 'Apply Now',
    actionRoute: 'UniversityDetail',
  },
  {
    id: '2',
    type: 'scholarship',
    title: 'New HEC Scholarship',
    message: 'HEC Merit Scholarship 2026 is now open',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    actionLabel: 'View Details',
    actionRoute: 'Scholarships',
  },
  {
    id: '3',
    type: 'news',
    title: 'MDCAT Results Announced',
    message: 'Check your MDCAT 2025 results now',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    read: true,
  },
  {
    id: '4',
    type: 'update',
    title: 'Merit Calculator Updated',
    message: 'New universities added to merit calculator',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
  },
];

// ============================================================================
// TIME AGO HELPER
// ============================================================================

const getTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

// ============================================================================
// NOTIFICATION ITEM COMPONENT
// ============================================================================

interface NotificationItemProps {
  notification: Notification;
  onPress: () => void;
  colors: any;
  isDark: boolean;
}

const NotificationItem = memo<NotificationItemProps>(({
  notification,
  onPress,
  colors,
  isDark,
}) => {
  const config = NOTIFICATION_CONFIG[notification.type];
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.99,
      useNativeDriver: true,
      tension: 400,
      friction: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 15,
    }).start();
  };

  return (
    <Animated.View style={{transform: [{scale: scaleAnim}]}}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[
          styles.notificationItem,
          {
            backgroundColor: notification.read 
              ? 'transparent' 
              : isDark ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.04)',
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${notification.title}: ${notification.message}`}
      >
        {/* Icon */}
        <View style={[styles.notificationIcon, {backgroundColor: config.bgColor}]}>
          <Icon name={config.icon} family="Ionicons" size={18} color={config.color} />
        </View>

        {/* Content */}
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text 
              style={[
                styles.notificationTitle, 
                {
                  color: colors.text,
                  fontWeight: notification.read ? '500' : '600',
                }
              ]} 
              numberOfLines={1}
            >
              {notification.title}
            </Text>
            {!notification.read && (
              <View style={[styles.unreadDot, {backgroundColor: colors.primary}]} />
            )}
          </View>
          <Text 
            style={[styles.notificationMessage, {color: colors.textSecondary}]} 
            numberOfLines={2}
          >
            {notification.message}
          </Text>
          <Text style={[styles.notificationTime, {color: colors.textSecondary, opacity: 0.7}]}>
            {getTimeAgo(notification.timestamp)}
          </Text>
        </View>

        {/* Arrow */}
        <Icon 
          name="chevron-forward" 
          family="Ionicons" 
          size={16} 
          color={colors.textSecondary} 
        />
      </TouchableOpacity>
    </Animated.View>
  );
});

// ============================================================================
// NOTIFICATION DROPDOWN PANEL
// ============================================================================

interface NotificationPanelProps {
  visible: boolean;
  onClose: () => void;
  notifications: Notification[];
  onNotificationPress: (notification: Notification) => void;
  onSeeAllPress?: () => void;
  onClearAll?: () => void;
  anchorPosition: {top: number; right: number};
}

const NotificationPanel = memo<NotificationPanelProps>(({
  visible,
  onClose,
  notifications,
  onNotificationPress,
  onSeeAllPress,
  onClearAll,
  anchorPosition,
}) => {
  const {colors, isDark} = useTheme();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 1,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 0],
  });

  const renderItem = useCallback(({item}: {item: Notification}) => (
    <NotificationItem
      notification={item}
      onPress={() => onNotificationPress(item)}
      colors={colors}
      isDark={isDark}
    />
  ), [colors, isDark, onNotificationPress]);

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Icon name="notifications-off-outline" family="Ionicons" size={40} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, {color: colors.text}]}>All Caught Up!</Text>
      <Text style={[styles.emptyMessage, {color: colors.textSecondary}]}>
        No new notifications
      </Text>
    </View>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View 
          style={[
            styles.backdropInner, 
            {opacity: opacityAnim}
          ]} 
        />
      </Pressable>

      {/* Panel */}
      <Animated.View
        style={[
          styles.panelContainer,
          {
            top: anchorPosition.top,
            right: anchorPosition.right,
            backgroundColor: colors.card,
            opacity: opacityAnim,
            transform: [{translateY}, {scale: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.95, 1],
            })}],
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 8},
                shadowOpacity: 0.15,
                shadowRadius: 24,
              },
              android: {
                elevation: 12,
              },
            }),
          },
        ]}
      >
        {/* Header */}
        <View style={[styles.panelHeader, {borderBottomColor: colors.border}]}>
          <View style={styles.panelTitleRow}>
            <Text style={[styles.panelTitle, {color: colors.text}]}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={[styles.unreadBadge, {backgroundColor: colors.primary}]}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          {notifications.length > 0 && onClearAll && (
            <TouchableOpacity onPress={onClearAll}>
              <Text style={[styles.clearAllText, {color: colors.primary}]}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notification List */}
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
          style={styles.notificationList}
          contentContainerStyle={notifications.length === 0 ? styles.emptyContainer : undefined}
        />

        {/* Footer */}
        {notifications.length > 0 && onSeeAllPress && (
          <TouchableOpacity 
            style={[styles.panelFooter, {borderTopColor: colors.border}]}
            onPress={onSeeAllPress}
          >
            <Text style={[styles.seeAllText, {color: colors.primary}]}>
              See All Notifications
            </Text>
            <Icon name="arrow-forward" family="Ionicons" size={16} color={colors.primary} />
          </TouchableOpacity>
        )}
      </Animated.View>
    </Modal>
  );
});

// ============================================================================
// MAIN NOTIFICATION BELL COMPONENT
// ============================================================================

const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications = SAMPLE_NOTIFICATIONS,
  onNotificationPress,
  onSeeAllPress,
  onClearAll,
  size = 40,
}) => {
  const {colors, isDark} = useTheme();
  const insets = useSafeAreaInsets();
  const [showPanel, setShowPanel] = useState(false);
  const bellScaleAnim = useRef(new Animated.Value(1)).current;
  const bellRotateAnim = useRef(new Animated.Value(0)).current;

  const unreadCount = notifications.filter(n => !n.read).length;

  // Bell ring animation when there are unread notifications
  useEffect(() => {
    if (unreadCount > 0) {
      const ringAnimation = Animated.sequence([
        Animated.timing(bellRotateAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(bellRotateAnim, {
          toValue: -1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(bellRotateAnim, {
          toValue: 0.5,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(bellRotateAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]);

      // Ring every 30 seconds if panel is closed
      const interval = setInterval(() => {
        if (!showPanel) {
          ringAnimation.start();
        }
      }, 30000);

      // Initial ring
      ringAnimation.start();

      return () => clearInterval(interval);
    }
  }, [unreadCount, showPanel]);

  const handlePress = () => {
    Haptics.light();
    
    // Scale animation
    Animated.sequence([
      Animated.timing(bellScaleAnim, {
        toValue: 0.9,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.spring(bellScaleAnim, {
        toValue: 1,
        tension: 200,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    setShowPanel(true);
  };

  const handleNotificationPress = (notification: Notification) => {
    setShowPanel(false);
    onNotificationPress?.(notification);
  };

  const bellRotate = bellRotateAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  return (
    <>
      {/* Bell Button */}
      <Animated.View style={{transform: [{scale: bellScaleAnim}]}}>
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.8}
          style={[
            styles.bellButton,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        >
          <Animated.View style={{transform: [{rotate: bellRotate}]}}>
            <Icon 
              name={unreadCount > 0 ? 'notifications' : 'notifications-outline'} 
              family="Ionicons" 
              size={size * 0.5} 
              color={colors.text} 
            />
          </Animated.View>

          {/* Badge */}
          {unreadCount > 0 && (
            <View style={[styles.badge, {backgroundColor: colors.error}]}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Dropdown Panel */}
      <NotificationPanel
        visible={showPanel}
        onClose={() => setShowPanel(false)}
        notifications={notifications}
        onNotificationPress={handleNotificationPress}
        onSeeAllPress={onSeeAllPress}
        onClearAll={onClearAll}
        anchorPosition={{
          top: insets.top + 56,
          right: MODERN_SPACING.md,
        }}
      />
    </>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  bellButton: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -1,
    right: -1,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '600',
  },

  // Dropdown Panel
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropInner: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  panelContainer: {
    position: 'absolute',
    width: SCREEN_WIDTH - MODERN_SPACING.lg * 2,
    maxWidth: 360,
    maxHeight: SCREEN_HEIGHT * 0.55,
    borderRadius: 14,
    overflow: 'hidden',
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: MODERN_SPACING.lg,
    paddingVertical: MODERN_SPACING.md - 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  panelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MODERN_SPACING.sm,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  unreadBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  clearAllText: {
    fontSize: 13,
    fontWeight: '500',
  },
  notificationList: {
    maxHeight: SCREEN_HEIGHT * 0.38,
  },
  panelFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: MODERN_SPACING.md - 2,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: MODERN_SPACING.xs,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Notification Item
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: MODERN_SPACING.lg,
    paddingVertical: MODERN_SPACING.md - 2,
    gap: MODERN_SPACING.sm,
  },
  notificationIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  notificationTitle: {
    fontSize: 14,
    flex: 1,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  notificationMessage: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  notificationTime: {
    fontSize: 10,
    marginTop: 3,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: MODERN_SPACING.xl * 1.5,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: MODERN_SPACING.md,
  },
  emptyMessage: {
    fontSize: 13,
    marginTop: 4,
  },
});

export default NotificationBell;

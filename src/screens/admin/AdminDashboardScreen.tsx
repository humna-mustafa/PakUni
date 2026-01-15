/**
 * Admin Dashboard Screen
 * Main admin panel entry point with overview stats and quick actions
 */

import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Animated,
  StatusBar,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../../contexts/ThemeContext';
import {adminService, DashboardStats} from '../../services/admin';
import {Icon} from '../../components/icons';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/AppNavigator';

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

const {width} = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface StatCardProps {
  title: string;
  value: number | string;
  iconName: string;
  color: string;
  gradient: string[];
  onPress?: () => void;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  iconName,
  color,
  gradient,
  onPress,
  subtitle,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={!onPress}
      style={styles.statCardWrapper}>
      <Animated.View style={{transform: [{scale: scaleAnim}]}}>
        <LinearGradient
          colors={gradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.statCard}>
          <View style={styles.statIconBg}>
            <Icon name={iconName} family="Ionicons" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

interface QuickActionProps {
  title: string;
  iconName: string;
  color: string;
  onPress: () => void;
  badge?: number;
}

const QuickAction: React.FC<QuickActionProps> = ({
  title,
  iconName,
  color,
  onPress,
  badge,
}) => {
  const {colors} = useTheme();
  
  return (
    <TouchableOpacity
      style={[styles.quickAction, {backgroundColor: colors.card}]}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={[styles.quickActionIcon, {backgroundColor: color + '20'}]}>
        <Icon name={iconName} family="Ionicons" size={24} color={color} />
        {badge !== undefined && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.quickActionTitle, {color: colors.text}]}>{title}</Text>
      <Icon name="chevron-forward" family="Ionicons" size={18} color={colors.textSecondary} />
    </TouchableOpacity>
  );
};

const AdminDashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {colors, isDark} = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    
    loadData();
    checkAccess();
  }, []);

  const checkAccess = async () => {
    const role = await adminService.getCurrentUserRole();
    setUserRole(role);
    
    if (!role || !['moderator', 'content_editor', 'admin', 'super_admin'].includes(role)) {
      Alert.alert(
        'Access Denied',
        'You do not have permission to access the admin panel.',
        [{text: 'OK', onPress: () => navigation.goBack()}]
      );
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const dashboardStats = await adminService.getDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const getRoleDisplay = (role: string | null) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Administrator';
      case 'content_editor': return 'Content Editor';
      case 'moderator': return 'Moderator';
      default: return 'User';
    }
  };

  const getRoleBadgeColor = (role: string | null) => {
    switch (role) {
      case 'super_admin': return '#9333EA';
      case 'admin': return '#DC2626';
      case 'content_editor': return '#2563EB';
      case 'moderator': return '#059669';
      default: return '#6B7280';
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }>
          {/* Header */}
          <Animated.View
            style={{
              opacity: headerAnim,
              transform: [{translateY: headerAnim.interpolate({inputRange: [0, 1], outputRange: [-30, 0]})}],
            }}>
            <LinearGradient
              colors={isDark ? ['#1E1E2E', '#2D1F3D', '#1E3A5F'] : ['#1A7AEB', '#0D5BC4', '#7C3AED']}
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
                  <Text style={styles.headerTitle}>Admin Panel</Text>
                  <View style={[styles.roleBadge, {backgroundColor: getRoleBadgeColor(userRole)}]}>
                    <Icon name="shield-checkmark" family="Ionicons" size={12} color="#FFFFFF" />
                    <Text style={styles.roleText}>{getRoleDisplay(userRole)}</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.settingsBtn}>
                  <Icon name="settings-outline" family="Ionicons" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Stats Grid */}
              <View style={styles.statsGrid}>
                <StatCard
                  title="Total Users"
                  value={stats?.totalUsers || 0}
                  iconName="people"
                  color="#3B82F6"
                  gradient={['#3B82F6', '#1D4ED8']}
                  onPress={() => navigation.navigate('AdminUsers' as never)}
                  subtitle={`+${stats?.newUsersToday || 0} today`}
                />
                <StatCard
                  title="Universities"
                  value={stats?.totalUniversities || 0}
                  iconName="school"
                  color="#10B981"
                  gradient={['#10B981', '#059669']}
                  onPress={() => navigation.navigate('AdminContent' as never)}
                />
                <StatCard
                  title="Scholarships"
                  value={stats?.totalScholarships || 0}
                  iconName="wallet"
                  color="#F59E0B"
                  gradient={['#F59E0B', '#D97706']}
                  onPress={() => navigation.navigate('AdminContent' as never)}
                />
                <StatCard
                  title="Reports"
                  value={stats?.pendingReports || 0}
                  iconName="flag"
                  color="#EF4444"
                  gradient={['#EF4444', '#DC2626']}
                  onPress={() => navigation.navigate('AdminReports' as never)}
                  subtitle="pending"
                />
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: colors.text}]}>Quick Actions</Text>
            
            <QuickAction
              title="User Management"
              iconName="people-outline"
              color="#3B82F6"
              onPress={() => navigation.navigate('AdminUsers' as never)}
            />
            
            <QuickAction
              title="Content Management"
              iconName="library-outline"
              color="#10B981"
              onPress={() => navigation.navigate('AdminContent' as never)}
            />
            
            <QuickAction
              title="Reports & Moderation"
              iconName="flag-outline"
              color="#EF4444"
              badge={stats?.pendingReports}
              onPress={() => navigation.navigate('AdminReports' as never)}
            />
            
            <QuickAction
              title="Announcements"
              iconName="megaphone-outline"
              color="#8B5CF6"
              badge={stats?.activeAnnouncements}
              onPress={() => navigation.navigate('AdminAnnouncements' as never)}
            />
            
            <QuickAction
              title="User Feedback"
              iconName="chatbubbles-outline"
              color="#F59E0B"
              badge={stats?.pendingFeedback}
              onPress={() => navigation.navigate('AdminFeedback' as never)}
            />
            
            <QuickAction
              title="Analytics"
              iconName="analytics-outline"
              color="#06B6D4"
              onPress={() => navigation.navigate('AdminAnalytics' as never)}
            />
            
            <QuickAction
              title="App Settings"
              iconName="cog-outline"
              color="#6366F1"
              onPress={() => navigation.navigate('AdminSettings' as never)}
            />
            
            <QuickAction
              title="Audit Logs"
              iconName="document-text-outline"
              color="#78716C"
              onPress={() => navigation.navigate('AdminAuditLogs' as never)}
            />
          </View>

          {/* Recent Activity */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: colors.text}]}>Recent Activity</Text>
            
            <View style={[styles.activityCard, {backgroundColor: colors.card}]}>
              <View style={styles.activityItem}>
                <View style={[styles.activityDot, {backgroundColor: '#10B981'}]} />
                <View style={styles.activityContent}>
                  <Text style={[styles.activityText, {color: colors.text}]}>
                    {stats?.newUsersToday || 0} new users joined today
                  </Text>
                  <Text style={[styles.activityTime, {color: colors.textSecondary}]}>
                    Last 24 hours
                  </Text>
                </View>
              </View>
              
              <View style={styles.activityItem}>
                <View style={[styles.activityDot, {backgroundColor: '#F59E0B'}]} />
                <View style={styles.activityContent}>
                  <Text style={[styles.activityText, {color: colors.text}]}>
                    {stats?.pendingReports || 0} reports awaiting review
                  </Text>
                  <Text style={[styles.activityTime, {color: colors.textSecondary}]}>
                    Requires attention
                  </Text>
                </View>
              </View>
              
              <View style={styles.activityItem}>
                <View style={[styles.activityDot, {backgroundColor: '#3B82F6'}]} />
                <View style={styles.activityContent}>
                  <Text style={[styles.activityText, {color: colors.text}]}>
                    {stats?.pendingFeedback || 0} feedback messages pending
                  </Text>
                  <Text style={[styles.activityTime, {color: colors.textSecondary}]}>
                    User feedback
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* System Status */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: colors.text}]}>System Status</Text>
            
            <View style={[styles.statusCard, {backgroundColor: colors.card}]}>
              <View style={styles.statusRow}>
                <View style={styles.statusInfo}>
                  <View style={[styles.statusIndicator, {backgroundColor: '#10B981'}]} />
                  <Text style={[styles.statusLabel, {color: colors.text}]}>Database</Text>
                </View>
                <Text style={[styles.statusValue, {color: '#10B981'}]}>Online</Text>
              </View>
              
              <View style={styles.statusRow}>
                <View style={styles.statusInfo}>
                  <View style={[styles.statusIndicator, {backgroundColor: '#10B981'}]} />
                  <Text style={[styles.statusLabel, {color: colors.text}]}>Authentication</Text>
                </View>
                <Text style={[styles.statusValue, {color: '#10B981'}]}>Active</Text>
              </View>
              
              <View style={styles.statusRow}>
                <View style={styles.statusInfo}>
                  <View style={[styles.statusIndicator, {backgroundColor: '#10B981'}]} />
                  <Text style={[styles.statusLabel, {color: colors.text}]}>Storage</Text>
                </View>
                <Text style={[styles.statusValue, {color: '#10B981'}]}>Available</Text>
              </View>
              
              <View style={styles.statusRow}>
                <View style={styles.statusInfo}>
                  <View style={[styles.statusIndicator, {backgroundColor: '#3B82F6'}]} />
                  <Text style={[styles.statusLabel, {color: colors.text}]}>App Version</Text>
                </View>
                <Text style={[styles.statusValue, {color: colors.textSecondary}]}>1.0.0</Text>
              </View>
            </View>
          </View>

          <View style={{height: 100}} />
        </ScrollView>
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
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    alignSelf: 'flex-start',
    gap: 4,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  statCardWrapper: {
    width: '50%',
    padding: 6,
  },
  statCard: {
    padding: 16,
    borderRadius: 16,
    minHeight: 110,
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statTitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  statSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  quickActionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  activityCard: {
    borderRadius: 12,
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
    marginTop: 2,
  },
  statusCard: {
    borderRadius: 12,
    padding: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default AdminDashboardScreen;

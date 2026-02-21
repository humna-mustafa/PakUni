/**
 * Admin Analytics Screen
 * View app analytics, usage statistics, and trends
 * 
 * USES REAL DATA from Supabase analytics_events table
 * OPTIMIZED for free tier - no real-time, count-only queries
 */

import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  Alert,
  Share,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../../contexts/ThemeContext';
import {TYPOGRAPHY} from '../../constants/design';
import {adminService} from '../../services/admin';
import {Icon} from '../../components/icons';
import {logger} from '../../utils/logger';
import RNFS from 'react-native-fs';

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

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const TIME_RANGES = [
  {key: '7d', label: '7 Days', days: 7},
  {key: '30d', label: '30 Days', days: 30},
  {key: '90d', label: '90 Days', days: 90},
  {key: 'all', label: 'All Time', days: 365},
];

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    totalSessions: number;
    avgSessionDuration: number;
  };
  contentStats: {
    totalViews: number;
    universityViews: number;
    scholarshipViews: number;
    programViews: number;
    searches: number;
    bookmarks: number;
  };
  topContent: {
    universities: Array<{name: string; views: number}>;
    scholarships: Array<{name: string; views: number}>;
    searches: Array<{term: string; count: number}>;
  };
  dailyActiveUsers: Array<{date: string; count: number}>;
}

const AdminAnalyticsScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors, isDark} = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedRange, setSelectedRange] = useState('30d');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [selectedRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get the number of days from selected range
      const selectedRangeConfig = TIME_RANGES.find(r => r.key === selectedRange);
      const days = selectedRangeConfig?.days || 30;
      
      // Fetch REAL analytics data from Supabase
      const realData = await adminService.getRealAnalytics(days);
      
      // Transform to our analytics structure
      const data: AnalyticsData = {
        overview: realData.overview,
        contentStats: realData.contentStats,
        topContent: realData.topContent,
        dailyActiveUsers: realData.dailyActiveUsers,
      };
      
      setAnalytics(data);
    } catch (error) {
      logger.error('Error loading analytics', error, 'AdminAnalytics');
      Alert.alert('Error', 'Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAnalytics();
  }, [selectedRange]);

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      
      const endDate = new Date().toISOString();
      const startDate = new Date();
      const days = TIME_RANGES.find(r => r.key === selectedRange)?.days || 30;
      startDate.setDate(startDate.getDate() - days);
      
      const csv = await adminService.exportAnalyticsCSV(startDate.toISOString(), endDate);
      
      // Save to file
      const fileName = `pakuni_analytics_${new Date().toISOString().split('T')[0]}.csv`;
      const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      
      await RNFS.writeFile(filePath, csv, 'utf8');
      
      // Share the file
      await Share.share({
        title: 'PakUni Analytics Export',
        url: Platform.OS === 'ios' ? filePath : `file://${filePath}`,
        message: `Analytics data exported on ${new Date().toLocaleDateString()}`,
      });
      
      Alert.alert('Success', 'Analytics exported successfully');
    } catch (error) {
      logger.error('Export error', error, 'AdminAnalytics');
      Alert.alert('Error', 'Failed to export analytics');
    } finally {
      setExporting(false);
    }
  };

  const handleEmailReport = async () => {
    try {
      if (!analytics) return;
      
      const report = `
PakUni Analytics Report
Generated: ${new Date().toLocaleDateString()}
Period: ${TIME_RANGES.find(r => r.key === selectedRange)?.label}

OVERVIEW
- Total Users: ${analytics.overview.totalUsers}
- Active Users: ${analytics.overview.activeUsers}
- New Users: ${analytics.overview.newUsers}
- Total Sessions: ${analytics.overview.totalSessions}

CONTENT ENGAGEMENT
- Total Views: ${analytics.contentStats.totalViews}
- University Views: ${analytics.contentStats.universityViews}
- Scholarship Views: ${analytics.contentStats.scholarshipViews}
- Searches: ${analytics.contentStats.searches}

TOP UNIVERSITIES
${analytics.topContent.universities.map((u, i) => `${i + 1}. ${u.name}: ${u.views} views`).join('\n')}

TOP SCHOLARSHIPS
${analytics.topContent.scholarships.map((s, i) => `${i + 1}. ${s.name}: ${s.views} views`).join('\n')}

TOP SEARCHES
${analytics.topContent.searches.map((s, i) => `${i + 1}. "${s.term}": ${s.count} searches`).join('\n')}
      `;
      
      await Share.share({
        title: 'PakUni Analytics Report',
        message: report,
      });
    } catch (error) {
      logger.error('Email report error', error, 'AdminAnalytics');
      Alert.alert('Error', 'Failed to share report');
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const renderStatCard = (
    title: string,
    value: string | number,
    icon: string,
    color: string,
    change?: number
  ) => (
    <View style={[styles.statCard, {backgroundColor: colors.card}]}>
      <View style={[styles.statIcon, {backgroundColor: color + '20'}]}>
        <Icon name={icon} family="Ionicons" size={20} color={color} />
      </View>
      <Text style={[styles.statValue, {color: colors.text}]}>{value}</Text>
      <Text style={[styles.statLabel, {color: colors.textSecondary}]}>{title}</Text>
      {change !== undefined && (
        <View style={styles.changeContainer}>
          <Icon
            name={change >= 0 ? 'trending-up' : 'trending-down'}
            family="Ionicons"
            size={14}
            color={change >= 0 ? '#10B981' : '#EF4444'}
          />
          <Text style={[styles.changeText, {color: change >= 0 ? '#10B981' : '#EF4444'}]}>
            {Math.abs(change)}%
          </Text>
        </View>
      )}
    </View>
  );

  const renderBarChart = (data: Array<{name?: string; term?: string; views?: number; count?: number}>, color: string) => {
    const maxValue = Math.max(...data.map(d => d.views || d.count || 0));
    
    return (
      <View style={styles.barChart}>
        {data.map((item, index) => {
          const value = item.views || item.count || 0;
          const width = maxValue > 0 ? (value / maxValue) * 100 : 0;
          const label = item.name || item.term || '';
          
          return (
            <View key={index} style={styles.barItem}>
              <View style={styles.barLabelRow}>
                <Text style={[styles.barLabel, {color: colors.text}]} numberOfLines={1}>
                  {label}
                </Text>
                <Text style={[styles.barValue, {color: colors.textSecondary}]}>
                  {formatNumber(value)}
                </Text>
              </View>
              <View style={[styles.barTrack, {backgroundColor: colors.background}]}>
                <View style={[styles.barFill, {width: `${width}%`, backgroundColor: color}]} />
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderMiniChart = (data: Array<{date: string; count: number}>, color: string) => {
    const maxValue = Math.max(...data.map(d => d.count));
    const chartHeight = 60;
    
    return (
      <View style={styles.miniChart}>
        {data.map((item, index) => {
          const height = maxValue > 0 ? (item.count / maxValue) * chartHeight : 0;
          return (
            <View key={index} style={styles.miniBarContainer}>
              <View
                style={[
                  styles.miniBar,
                  {height, backgroundColor: color},
                ]}
              />
              <Text style={[styles.miniLabel, {color: colors.textSecondary}]}>
                {item.date}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <LinearGradient
          colors={isDark ? ['#1E3A5F', '#1E1E2E'] : ['#4573DF', '#3660C9']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" family="Ionicons" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Analytics</Text>
            <Text style={styles.headerSubtitle}>App usage and engagement insights</Text>
          </View>
        </LinearGradient>

        {/* Time Range Filter */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {TIME_RANGES.map(range => (
                <TouchableOpacity
                  key={range.key}
                  style={[
                    styles.filterChip,
                    {backgroundColor: selectedRange === range.key ? colors.primary + '20' : colors.card},
                  ]}
                  onPress={() => setSelectedRange(range.key)}>
                  <Text style={[
                    styles.filterText,
                    {color: selectedRange === range.key ? colors.primary : colors.textSecondary},
                  ]}>
                    {range.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }>
          {loading ? (
            <ActivityIndicator style={styles.loader} color={colors.primary} />
          ) : analytics ? (
            <>
              {/* Overview Stats */}
              <View style={styles.sectionHeader}>
                <Icon name="stats-chart-outline" family="Ionicons" size={18} color={colors.primary} />
                <Text style={[styles.sectionTitle, {color: colors.text}]}>Overview</Text>
              </View>
              <View style={styles.statsGrid}>
                {renderStatCard('Total Users', formatNumber(analytics.overview.totalUsers), 'people-outline', '#4573DF', 12)}
                {renderStatCard('Active Users', formatNumber(analytics.overview.activeUsers), 'person-outline', '#10B981', 8)}
                {renderStatCard('New Users', formatNumber(analytics.overview.newUsers), 'person-add-outline', '#4573DF', 15)}
                {renderStatCard('Sessions', formatNumber(analytics.overview.totalSessions), 'cellular-outline', '#F59E0B', 5)}
              </View>

              {/* Content Stats */}
              <View style={styles.sectionHeader}>
                <Icon name="document-text-outline" family="Ionicons" size={18} color={colors.primary} />
                <Text style={[styles.sectionTitle, {color: colors.text}]}>Content Engagement</Text>
              </View>
              <View style={styles.statsGrid}>
                {renderStatCard('Total Views', formatNumber(analytics.contentStats.totalViews), 'eye-outline', '#4573DF')}
                {renderStatCard('University Views', formatNumber(analytics.contentStats.universityViews), 'school-outline', '#10B981')}
                {renderStatCard('Scholarship Views', formatNumber(analytics.contentStats.scholarshipViews), 'cash-outline', '#F59E0B')}
                {renderStatCard('Searches', formatNumber(analytics.contentStats.searches), 'search-outline', '#4573DF')}
              </View>

              {/* Daily Active Users Chart */}
              <View style={[styles.chartCard, {backgroundColor: colors.card}]}>
                <View style={styles.chartHeader}>
                  <Text style={[styles.chartTitle, {color: colors.text}]}>Daily Active Users</Text>
                  <View style={[styles.chartBadge, {backgroundColor: '#4573DF20'}]}>
                    <Text style={[styles.chartBadgeText, {color: '#4573DF'}]}>Last 7 days</Text>
                  </View>
                </View>
                {analytics.dailyActiveUsers.length > 0 ? (
                  renderMiniChart(analytics.dailyActiveUsers, '#4573DF')
                ) : (
                  <View style={styles.noDataContainer}>
                    <Icon name="analytics-outline" family="Ionicons" size={24} color={colors.textSecondary} />
                    <Text style={[styles.noDataText, {color: colors.textSecondary}]}>No activity data yet</Text>
                  </View>
                )}
              </View>

              {/* Top Universities */}
              <View style={[styles.chartCard, {backgroundColor: colors.card}]}>
                <View style={styles.chartHeader}>
                  <Text style={[styles.chartTitle, {color: colors.text}]}>Top Universities</Text>
                  <Icon name="trophy-outline" family="Ionicons" size={18} color="#F59E0B" />
                </View>
                {renderBarChart(analytics.topContent.universities, '#10B981')}
              </View>

              {/* Top Scholarships */}
              <View style={[styles.chartCard, {backgroundColor: colors.card}]}>
                <View style={styles.chartHeader}>
                  <Text style={[styles.chartTitle, {color: colors.text}]}>Top Scholarships</Text>
                  <Icon name="ribbon-outline" family="Ionicons" size={18} color="#4573DF" />
                </View>
                {renderBarChart(analytics.topContent.scholarships, '#4573DF')}
              </View>

              {/* Popular Searches */}
              <View style={[styles.chartCard, {backgroundColor: colors.card}]}>
                <View style={styles.chartHeader}>
                  <Text style={[styles.chartTitle, {color: colors.text}]}>Popular Searches</Text>
                  <Icon name="search-outline" family="Ionicons" size={18} color={colors.primary} />
                </View>
                {renderBarChart(analytics.topContent.searches, '#4573DF')}
              </View>

              {/* Quick Actions */}
              <View style={[styles.actionsCard, {backgroundColor: colors.card}]}>
                <Text style={[styles.actionsTitle, {color: colors.text}]}>Export Reports</Text>
                <View style={styles.actionsRow}>
                  <TouchableOpacity 
                    style={[styles.actionBtn, {backgroundColor: colors.background}]}
                    onPress={handleExportCSV}
                    disabled={exporting}
                    accessibilityRole="button"
                    accessibilityLabel="Export analytics as CSV"
                    accessibilityState={{disabled: exporting}}>
                    {exporting ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <Icon name="download-outline" family="Ionicons" size={20} color={colors.primary} />
                    )}
                    <Text style={[styles.actionBtnText, {color: colors.text}]}>CSV</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionBtn, {backgroundColor: colors.background}]}
                    onPress={handleEmailReport}
                    accessibilityRole="button"
                    accessibilityLabel="Generate text report">
                    <Icon name="document-text-outline" family="Ionicons" size={20} color={colors.primary} />
                    <Text style={[styles.actionBtnText, {color: colors.text}]}>Report</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionBtn, {backgroundColor: colors.background}]}
                    onPress={handleEmailReport}
                    accessibilityRole="button"
                    accessibilityLabel="Share analytics report">
                    <Icon name="share-outline" family="Ionicons" size={20} color={colors.primary} />
                    <Text style={[styles.actionBtnText, {color: colors.text}]}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="analytics-outline" family="Ionicons" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, {color: colors.textSecondary}]}>No analytics data available</Text>
            </View>
          )}
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
  filterContainer: {
    paddingVertical: 12,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 16,
  },
  statCard: {
    width: (SCREEN_WIDTH - 44) / 2,
    margin: 6,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 2,
  },
  changeText: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  chartCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  chartBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chartBadgeText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  miniChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
  },
  miniBarContainer: {
    flex: 1,
    alignItems: 'center',
  },
  miniBar: {
    width: 24,
    borderRadius: 4,
    minHeight: 4,
  },
  miniLabel: {
    fontSize: 10,
    marginTop: 6,
  },
  barChart: {
    gap: 12,
  },
  barItem: {
    marginBottom: 4,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  barLabel: {
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  barValue: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  actionsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  actionsTitle: {
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weight.medium,
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
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  noDataText: {
    fontSize: 12,
  },
});

export default AdminAnalyticsScreen;



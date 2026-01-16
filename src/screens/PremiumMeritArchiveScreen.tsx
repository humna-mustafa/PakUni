/**
 * PremiumMeritArchiveScreen - Past Merit Lists Archive
 * Features: Searchable table, trend analysis, year-by-year comparison
 */

import React, {useState, useRef, useEffect, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {TYPOGRAPHY, SPACING, RADIUS} from '../constants/design';
import {useTheme} from '../contexts/ThemeContext';
import {Icon} from '../components/icons';
import {logger} from '../utils/logger';
import {PremiumSearchBar} from '../components/PremiumSearchBar';
import {Haptics} from '../utils/haptics';
import {
  fetchMeritLists,
  getMeritInsights,
  getYearlyTrendData,
  AVAILABLE_YEARS,
  MERIT_CATEGORIES,
} from '../services/meritLists';
import {
  MERIT_RECORDS,
  MeritRecord,
  getYearlyChange,
} from '../data/meritArchive';

const {width} = Dimensions.get('window');

// ============================================================================
// MERIT ROW COMPONENT
// ============================================================================

interface MeritRowProps {
  record: MeritRecord;
  yearlyChange: number | null;
  colors: any;
  isDark: boolean;
  index: number;
  onPress: () => void;
}

const MeritRow: React.FC<MeritRowProps> = ({
  record,
  yearlyChange,
  colors,
  isDark,
  index,
  onPress,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 30,
      useNativeDriver: true,
    }).start();
  }, [index]);

  const getMeritColor = (merit: number) => {
    if (merit >= 90) return colors.error;
    if (merit >= 85) return colors.warning;
    if (merit >= 80) return colors.primary;
    return colors.success;
  };

  return (
    <Animated.View style={{opacity: fadeAnim}}>
      <TouchableOpacity
        style={[
          styles.meritRow,
          {
            backgroundColor: index % 2 === 0 
              ? (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)')
              : 'transparent',
          },
        ]}
        onPress={onPress}
        activeOpacity={0.7}>
        {/* University Info */}
        <View style={styles.rowUniversity}>
          <Text style={[styles.universityShort, {color: colors.primary}]} numberOfLines={1}>
            {record.universityShortName}
          </Text>
          <Text style={[styles.programName, {color: colors.text}]} numberOfLines={1}>
            {record.programName.replace(/\([^)]*\)/g, '').trim()}
          </Text>
        </View>

        {/* City */}
        <View style={styles.rowCity}>
          <Text style={[styles.cityText, {color: colors.textSecondary}]} numberOfLines={1}>
            {record.city}
          </Text>
        </View>

        {/* Closing Merit */}
        <View style={styles.rowMerit}>
          <Text style={[styles.meritValue, {color: getMeritColor(record.closingMerit)}]}>
            {record.closingMerit.toFixed(1)}%
          </Text>
        </View>

        {/* Trend */}
        <View style={styles.rowTrend}>
          {yearlyChange !== null ? (
            <View style={styles.trendContainer}>
              <Icon
                name={yearlyChange >= 0 ? 'trending-up' : 'trending-down'}
                family="Ionicons"
                size={14}
                color={yearlyChange >= 0 ? colors.error : colors.success}
              />
              <Text
                style={[
                  styles.trendText,
                  {color: yearlyChange >= 0 ? colors.error : colors.success},
                ]}>
                {yearlyChange >= 0 ? '+' : ''}{yearlyChange.toFixed(1)}
              </Text>
            </View>
          ) : (
            <Text style={[styles.trendText, {color: colors.textSecondary}]}>-</Text>
          )}
        </View>

        {/* Seats */}
        <View style={styles.rowSeats}>
          <Text style={[styles.seatsText, {color: colors.textSecondary}]}>
            {record.totalSeats}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ============================================================================
// INSIGHT CARD COMPONENT
// ============================================================================

interface InsightCardProps {
  title: string;
  value: string;
  subtitle: string;
  iconName: string;
  color: string;
  colors: any;
}

const InsightCard: React.FC<InsightCardProps> = ({
  title,
  value,
  subtitle,
  iconName,
  color,
  colors,
}) => {
  return (
    <View style={[styles.insightCard, {backgroundColor: colors.card}]}>
      <View style={[styles.insightIcon, {backgroundColor: `${color}15`}]}>
        <Icon name={iconName} family="Ionicons" size={20} color={color} />
      </View>
      <Text style={[styles.insightTitle, {color: colors.textSecondary}]}>{title}</Text>
      <Text style={[styles.insightValue, {color: colors.text}]}>{value}</Text>
      <Text style={[styles.insightSubtitle, {color: colors.textSecondary}]}>{subtitle}</Text>
    </View>
  );
};

// ============================================================================
// MERIT TREND CHART COMPONENT (Simple Bar Chart)
// ============================================================================

interface TrendChartProps {
  data: {year: number; merit: number}[];
  colors: any;
  isDark: boolean;
}

const TrendChart: React.FC<TrendChartProps> = ({data, colors, isDark}) => {
  if (data.length === 0) return null;

  const maxMerit = Math.max(...data.map(d => d.merit), 100);
  const minMerit = Math.min(...data.map(d => d.merit), 0);
  const range = maxMerit - minMerit || 1;
  
  // Normalize to 60-100 range for better visualization
  const normalizedMin = Math.floor(Math.min(...data.map(d => d.merit)) - 5);
  const normalizedMax = Math.ceil(Math.max(...data.map(d => d.merit)) + 5);
  const chartRange = normalizedMax - normalizedMin;
  
  return (
    <View style={[styles.trendChartContainer, {backgroundColor: colors.card}]}>
      <View style={styles.trendChartHeader}>
        <Icon name="trending-up" family="Ionicons" size={18} color={colors.primary} />
        <Text style={[styles.trendChartTitle, {color: colors.text}]}>Merit Trend</Text>
        <Text style={[styles.trendChartSubtitle, {color: colors.textSecondary}]}>
          Average closing merit by year
        </Text>
      </View>
      
      <View style={styles.chartArea}>
        {/* Y-axis labels */}
        <View style={styles.yAxisLabels}>
          <Text style={[styles.axisLabel, {color: colors.textSecondary}]}>{normalizedMax}%</Text>
          <Text style={[styles.axisLabel, {color: colors.textSecondary}]}>{Math.round((normalizedMax + normalizedMin) / 2)}%</Text>
          <Text style={[styles.axisLabel, {color: colors.textSecondary}]}>{normalizedMin}%</Text>
        </View>
        
        {/* Bars */}
        <View style={styles.barsContainer}>
          {data.map((item, index) => {
            const height = ((item.merit - normalizedMin) / chartRange) * 120;
            const isLatest = index === data.length - 1;
            const prevItem = index > 0 ? data[index - 1] : null;
            const change = prevItem ? item.merit - prevItem.merit : null;
            
            return (
              <View key={item.year} style={styles.barColumn}>
                <View style={styles.barWrapper}>
                  <Text style={[styles.barValue, {color: colors.text}]}>
                    {item.merit.toFixed(1)}%
                  </Text>
                  <Animated.View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(height, 20),
                        backgroundColor: isLatest
                          ? colors.primary
                          : isDark
                          ? 'rgba(99, 102, 241, 0.5)'
                          : 'rgba(99, 102, 241, 0.3)',
                      },
                    ]}>
                    {isLatest && (
                      <View style={[styles.barGlow, {backgroundColor: colors.primary}]} />
                    )}
                  </Animated.View>
                  {change !== null && (
                    <View style={styles.changeIndicator}>
                      <Icon
                        name={change >= 0 ? 'caret-up' : 'caret-down'}
                        family="Ionicons"
                        size={10}
                        color={change >= 0 ? colors.error : colors.success}
                      />
                      <Text
                        style={[
                          styles.changeText,
                          {color: change >= 0 ? colors.error : colors.success},
                        ]}>
                        {change >= 0 ? '+' : ''}{change.toFixed(1)}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.barLabel, {color: colors.textSecondary}]}>
                  {item.year}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
      
      {/* Trend summary */}
      {data.length >= 2 && (
        <View style={[styles.trendSummary, {backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}]}>
          {(() => {
            const totalChange = data[data.length - 1].merit - data[0].merit;
            const isIncreasing = totalChange > 0;
            return (
              <>
                <Icon
                  name={isIncreasing ? 'trending-up' : 'trending-down'}
                  family="Ionicons"
                  size={16}
                  color={isIncreasing ? colors.error : colors.success}
                />
                <Text style={[styles.trendSummaryText, {color: colors.textSecondary}]}>
                  Merit has {isIncreasing ? 'increased' : 'decreased'} by{' '}
                  <Text style={{color: isIncreasing ? colors.error : colors.success, fontWeight: '700'}}>
                    {Math.abs(totalChange).toFixed(1)}%
                  </Text>{' '}
                  over {data.length} years
                </Text>
              </>
            );
          })()}
        </View>
      )}
    </View>
  );
};

// ============================================================================
// MAIN SCREEN COMPONENT
// ============================================================================

const PremiumMeritArchiveScreen = () => {
  const navigation = useNavigation();
  const {colors, isDark} = useTheme();

  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'merit' | 'name' | 'city'>('merit');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [meritRecords, setMeritRecords] = useState<MeritRecord[]>(MERIT_RECORDS);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dataSource, setDataSource] = useState<'supabase' | 'local'>('local');

  const headerAnim = useRef(new Animated.Value(0)).current;

  // Load merit data
  const loadMeritData = useCallback(async () => {
    try {
      const {data, error, source} = await fetchMeritLists();
      if (data && data.length > 0) {
        setMeritRecords(data);
        setDataSource(source);
      }
      // If no data from Supabase, use local MERIT_RECORDS (already set as default)
    } catch (err) {
      logger.debug('Error loading merit data, using local data', err, 'MeritArchive');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadMeritData();
  }, [loadMeritData]);

  // Animate header
  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Pull to refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.refreshThreshold();
    await loadMeritData();
    setRefreshing(false);
    Haptics.success();
  }, [loadMeritData]);

  // Filter and sort records
  const filteredRecords = useMemo(() => {
    let records = meritRecords.filter(r => r.year === selectedYear);

    // Category filter
    if (selectedCategory !== 'all') {
      records = records.filter(r => r.category === selectedCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      records = records.filter(r =>
        r.universityName.toLowerCase().includes(query) ||
        r.universityShortName.toLowerCase().includes(query) ||
        r.programName.toLowerCase().includes(query) ||
        r.city.toLowerCase().includes(query)
      );
    }

    // Sort
    records.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'merit':
          comparison = a.closingMerit - b.closingMerit;
          break;
        case 'name':
          comparison = a.universityShortName.localeCompare(b.universityShortName);
          break;
        case 'city':
          comparison = a.city.localeCompare(b.city);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return records;
  }, [meritRecords, selectedYear, selectedCategory, searchQuery, sortBy, sortOrder]);

  // Insights
  const insights = useMemo(() => {
    return getMeritInsights(meritRecords, selectedYear);
  }, [meritRecords, selectedYear]);

  // Historical Trend Data (all years average)
  const trendData = useMemo(() => {
    return getYearlyTrendData(meritRecords);
  }, [meritRecords]);

  // Handle sort toggle
  const handleSort = useCallback((column: 'merit' | 'name' | 'city') => {
    Haptics.light();
    if (sortBy === column) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder(column === 'merit' ? 'desc' : 'asc');
    }
  }, [sortBy]);

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <Animated.View
          style={[
            styles.headerContainer,
            {
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}>
          <LinearGradient
            colors={isDark ? ['#059669', '#047857', '#065F46'] : ['#10B981', '#059669', '#047857']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.header}>
            <View style={styles.headerDecoCircle1} />
            <View style={styles.headerDecoCircle2} />

            {/* Back Button */}
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" family="Ionicons" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <View style={styles.headerIconCircle}>
                <Icon name="archive-outline" family="Ionicons" size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.headerTitle}>Merit Archive</Text>
              <Text style={styles.headerSubtitle}>
                Historical closing merits (2020-2024)
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Search Bar - Consistent Design */}
        <View style={styles.searchWrapper}>
          <PremiumSearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder="Search university, program, city..."
            variant="default"
            size="md"
          />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          stickyHeaderIndices={[1]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#059669']}
              tintColor="#059669"
            />
          }>

          <View>
            {/* Year Selector */}
            <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.yearContainer}>
            {AVAILABLE_YEARS.map(year => (
              <TouchableOpacity
                key={year}
                style={[
                  styles.yearChip,
                  {
                    backgroundColor:
                      selectedYear === year ? colors.primary : colors.card,
                    borderColor:
                      selectedYear === year ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedYear(year)}
                activeOpacity={0.8}>
                <Text
                  style={[
                    styles.yearText,
                    {color: selectedYear === year ? '#FFFFFF' : colors.text},
                  ]}>
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Category Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContainer}>
            {MERIT_CATEGORIES.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor:
                      selectedCategory === category.id
                        ? `${colors.primary}15`
                        : 'transparent',
                    borderColor:
                      selectedCategory === category.id
                        ? colors.primary
                        : colors.border,
                  },
                ]}
                onPress={() => setSelectedCategory(category.id)}
                activeOpacity={0.8}>
                <Icon
                  name={category.iconName}
                  family="Ionicons"
                  size={14}
                  color={
                    selectedCategory === category.id
                      ? colors.primary
                      : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color:
                        selectedCategory === category.id
                          ? colors.primary
                          : colors.text,
                    },
                  ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Insights Cards */}
          {insights && (
            <View style={styles.insightsContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <InsightCard
                  title="Average Merit"
                  value={`${insights.avgMerit.toFixed(1)}%`}
                  subtitle={`${selectedYear} session`}
                  iconName="analytics-outline"
                  color={colors.primary}
                  colors={colors}
                />
                <InsightCard
                  title="Highest Merit"
                  value={`${insights.highestMerit.toFixed(1)}%`}
                  subtitle={insights.highestProgram?.universityShortName || ''}
                  iconName="arrow-up-circle-outline"
                  color={colors.error}
                  colors={colors}
                />
                <InsightCard
                  title="Lowest Merit"
                  value={`${insights.lowestMerit.toFixed(1)}%`}
                  subtitle={insights.lowestProgram?.universityShortName || ''}
                  iconName="arrow-down-circle-outline"
                  color={colors.success}
                  colors={colors}
                />
                <InsightCard
                  title="Programs"
                  value={`${insights.totalPrograms}`}
                  subtitle="in database"
                  iconName="school-outline"
                  color={colors.warning}
                  colors={colors}
                />
              </ScrollView>
            </View>
          )}

          {/* Historical Merit Trend Chart */}
          {trendData.length > 1 && (
            <TrendChart data={trendData} colors={colors} isDark={isDark} />
          )}
          </View>

          {/* Table Header - Sticky */}
          <View style={[styles.tableHeader, {backgroundColor: colors.background}]}>
            <TouchableOpacity
              style={styles.headerUniversity}
              onPress={() => handleSort('name')}>
              <Text style={[styles.headerText, {color: colors.textSecondary}]}>University</Text>
              {sortBy === 'name' && (
                <Icon
                  name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'}
                  family="Ionicons"
                  size={12}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerCity}
              onPress={() => handleSort('city')}>
              <Text style={[styles.headerText, {color: colors.textSecondary}]}>City</Text>
              {sortBy === 'city' && (
                <Icon
                  name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'}
                  family="Ionicons"
                  size={12}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerMerit}
              onPress={() => handleSort('merit')}>
              <Text style={[styles.headerText, {color: colors.textSecondary}]}>Merit</Text>
              {sortBy === 'merit' && (
                <Icon
                  name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'}
                  family="Ionicons"
                  size={12}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>

            <View style={styles.headerTrend}>
              <Text style={[styles.headerText, {color: colors.textSecondary}]}>Trend</Text>
            </View>

            <View style={styles.headerSeats}>
              <Text style={[styles.headerText, {color: colors.textSecondary}]}>Seats</Text>
            </View>
          </View>

          {/* Table Body */}
          <View style={[styles.tableBody, {backgroundColor: colors.card}]}>
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record, index) => (
                <MeritRow
                  key={record.id}
                  record={record}
                  yearlyChange={getYearlyChange(record.universityId, record.programName)}
                  colors={colors}
                  isDark={isDark}
                  index={index}
                  onPress={() => {
                    Haptics.light();
                    // Could navigate to detailed view
                  }}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Icon name="search-outline" family="Ionicons" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyTitle, {color: colors.text}]}>
                  No Records Found
                </Text>
                <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
                  Try adjusting your search or filters
                </Text>
              </View>
            )}
          </View>

          {/* Results Count */}
          <View style={styles.resultsCount}>
            <Text style={[styles.resultsText, {color: colors.textSecondary}]}>
              Showing {filteredRecords.length} of {MERIT_RECORDS.filter(r => r.year === selectedYear).length} programs
            </Text>
          </View>

          <View style={{height: 100}} />
        </ScrollView>
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
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  // Header
  headerContainer: {},
  header: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: RADIUS.xxl,
    borderBottomRightRadius: RADIUS.xxl,
    overflow: 'hidden',
  },
  headerDecoCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerDecoCircle2: {
    position: 'absolute',
    bottom: 20,
    left: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  backBtn: {
    position: 'absolute',
    top: SPACING.lg,
    left: SPACING.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
  },
  headerIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
  },
  // Unified search wrapper
  searchWrapper: {
    paddingHorizontal: SPACING.lg,
    marginTop: -20,
    marginBottom: SPACING.md,
  },
  // Year Selector
  yearContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  yearChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginRight: SPACING.sm,
  },
  yearText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
  // Category Filter
  categoryContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    marginRight: SPACING.sm,
    gap: SPACING.xs,
  },
  categoryText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
  },
  // Insights
  insightsContainer: {
    paddingLeft: SPACING.lg,
    marginBottom: SPACING.md,
  },
  insightCard: {
    width: 130,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginRight: SPACING.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  insightTitle: {
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 2,
  },
  insightValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
  },
  insightSubtitle: {
    fontSize: 10,
    marginTop: 2,
  },
  // Table Header
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerUniversity: {
    flex: 2.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerCity: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerMerit: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  headerTrend: {
    flex: 1,
    alignItems: 'flex-end',
  },
  headerSeats: {
    flex: 0.7,
    alignItems: 'flex-end',
  },
  headerText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Table Body
  tableBody: {
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
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
  meritRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
  },
  rowUniversity: {
    flex: 2.5,
  },
  universityShort: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
  },
  programName: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  rowCity: {
    flex: 1.2,
  },
  cityText: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  rowMerit: {
    flex: 1,
    alignItems: 'flex-end',
  },
  meritValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
  },
  rowTrend: {
    flex: 1,
    alignItems: 'flex-end',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '600',
  },
  rowSeats: {
    flex: 0.7,
    alignItems: 'flex-end',
  },
  seatsText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '500',
  },
  // Results Count
  resultsCount: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  resultsText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    textAlign: 'center',
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
  },
  // Trend Chart Styles
  trendChartContainer: {
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  trendChartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  trendChartTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
  },
  trendChartSubtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 150,
    paddingLeft: 35,
  },
  yAxisLabels: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 20,
    width: 32,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 4,
  },
  axisLabel: {
    fontSize: 9,
    fontWeight: '500',
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 130,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    paddingBottom: 2,
    paddingLeft: 4,
  },
  barColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    maxWidth: 60,
  },
  barWrapper: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  bar: {
    width: 22,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    minHeight: 8,
  },
  barGlow: {
    position: 'absolute',
    left: 2,
    right: 2,
    top: 0,
    height: 8,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  barValue: {
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 3,
  },
  barLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 6,
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 1,
  },
  changeText: {
    fontSize: 8,
    fontWeight: '600',
  },
  trendSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  trendSummaryText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
  },
});

export default PremiumMeritArchiveScreen;

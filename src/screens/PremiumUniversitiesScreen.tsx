import React, {useState, useMemo, useCallback, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  Platform,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import {TYPOGRAPHY, SPACING, RADIUS, ANIMATION} from '../constants/design';
import {useTheme} from '../contexts/ThemeContext';
import {RootStackParamList} from '../navigation/AppNavigator';
import {UNIVERSITIES, PROVINCES} from '../data';
import type {UniversityData} from '../data';
import {useDebouncedValue} from '../hooks/useDebounce';
import {Haptics} from '../utils/haptics';
import {Icon} from '../components/icons';
import {PremiumSearchBar} from '../components/PremiumSearchBar';
import UniversityLogo from '../components/UniversityLogo';
import FloatingToolsButton from '../components/FloatingToolsButton';
import {analytics} from '../services/analytics';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const {width} = Dimensions.get('window');

const SORT_OPTIONS = [
  {value: 'ranking', label: 'Ranking', iconName: 'trophy-outline'},
  {value: 'name', label: 'Name', iconName: 'text-outline'},
  {value: 'established', label: 'Oldest', iconName: 'calendar-outline'},
];

// Filter Chip Component
const FilterChip = ({
  label,
  isSelected,
  onPress,
  colors,
  variant = 'default',
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  colors: any;
  variant?: 'default' | 'primary' | 'secondary';
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      ...ANIMATION.spring.snappy,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      ...ANIMATION.spring.snappy,
      useNativeDriver: true,
    }).start();
  };

  const getColors = () => {
    if (!isSelected) {
      return {
        bg: colors.card,
        text: colors.text,
        border: colors.border,
      };
    }
    switch (variant) {
      case 'primary':
        return {
          bg: colors.primary,
          text: '#FFFFFF',
          border: colors.primary,
        };
      case 'secondary':
        return {
          bg: colors.secondary,
          text: '#FFFFFF',
          border: colors.secondary,
        };
      default:
        return {
          bg: `${colors.primary}15`,
          text: colors.primary,
          border: colors.primary,
        };
    }
  };

  const chipColors = getColors();

  return (
    <Animated.View style={{transform: [{scale: scaleAnim}]}}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${label} filter${isSelected ? ', selected' : ''}`}
        accessibilityState={{selected: isSelected}}
        style={[
          styles.filterChip,
          {
            backgroundColor: chipColors.bg,
            borderColor: chipColors.border,
          },
        ]}>
        <Text
          style={[
            styles.filterChipText,
            {
              color: chipColors.text,
              fontWeight: isSelected ? '600' : '500',
            },
          ]}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// University Card Component
const UniversityCard = ({
  item,
  onPress,
  colors,
  isDark,
  index,
}: {
  item: UniversityData;
  onPress: () => void;
  colors: any;
  isDark: boolean;
  index: number;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay: index * 50,
        ...ANIMATION.spring.gentle,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      ...ANIMATION.spring.snappy,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      ...ANIMATION.spring.snappy,
      useNativeDriver: true,
    }).start();
  };

  const getRankColor = (rank: number | undefined) => {
    if (!rank) return [colors.primary, colors.primaryLight];
    if (rank === 1) return ['#FFD700', '#FFA500'];
    if (rank === 2) return ['#C0C0C0', '#A0A0A0'];
    if (rank === 3) return ['#CD7F32', '#8B4513'];
    if (rank <= 10) return [colors.primary, colors.secondary];
    return [colors.primary, colors.primaryLight];
  };

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{scale: scaleAnim}, {translateY: slideAnim}],
        },
      ]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, ${item.type} university in ${item.city}${item.ranking_national ? `, ranked number ${item.ranking_national} nationally` : ''}`}
        accessibilityHint="Double tap to view university details">
        <View style={[styles.universityCard, {backgroundColor: colors.card}]}>
          {/* Header Row */}
          <View style={styles.cardHeader}>
            {/* Logo - Using UniversityLogo for static Supabase storage */}
            <UniversityLogo
              shortName={item.short_name}
              universityName={item.name}
              size={56}
              borderRadius={12}
              style={styles.logoContainer}
            />

            {/* Info */}
            <View style={styles.headerInfo}>
              <Text style={[styles.universityName, {color: colors.text}]} numberOfLines={2}>
                {item.name}
              </Text>
              <View style={styles.shortNameRow}>
                <Text style={[styles.shortName, {color: colors.textSecondary}]}>
                  {item.short_name}
                </Text>
                {item.is_hec_recognized && (
                  <View style={[styles.hecBadge, {backgroundColor: `${colors.success}15`, flexDirection: 'row', alignItems: 'center', gap: 3}]}>
                    <Icon name="checkmark-circle" family="Ionicons" size={12} color={colors.success} />
                    <Text style={[styles.hecText, {color: colors.success}]}>HEC</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Rank Badge */}
            {item.ranking_national && (
              <LinearGradient
                colors={getRankColor(item.ranking_national)}
                style={styles.rankBadge}>
                <Text style={styles.rankText}>#{item.ranking_national}</Text>
              </LinearGradient>
            )}
          </View>

          {/* Details Section */}
          <View style={[styles.cardDetails, {borderTopColor: `${colors.border}`}]}>
            <View style={styles.detailItem}>
              <Icon name="location-outline" family="Ionicons" size={14} color={colors.textSecondary} />
              <Text style={[styles.detailText, {color: colors.textSecondary}]}>
                {item.city}
              </Text>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailItem}>
              <Icon name="calendar-outline" family="Ionicons" size={14} color={colors.textSecondary} />
              <Text style={[styles.detailText, {color: colors.textSecondary}]}>
                Est. {item.established_year}
              </Text>
            </View>
            {item.campuses.length > 1 && (
              <>
                <View style={styles.detailDivider} />
                <View style={styles.detailItem}>
                  <Icon name="business-outline" family="Ionicons" size={14} color={colors.textSecondary} />
                  <Text style={[styles.detailText, {color: colors.textSecondary}]}>
                    {item.campuses.length} Campuses
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Footer Badges */}
          <View style={styles.cardFooter}>
            <View
              style={[
                styles.typeBadge,
                {
                  backgroundColor: item.type === 'public' 
                    ? `${colors.success}12` 
                    : `${colors.primary}12`,
                },
              ]}>
              <View
                style={[
                  styles.typeDot,
                  {
                    backgroundColor: item.type === 'public' ? colors.success : colors.primary,
                  },
                ]}
              />
              <Text
                style={[
                  styles.typeText,
                  {color: item.type === 'public' ? colors.success : colors.primary},
                ]}>
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </Text>
            </View>

          <View style={styles.viewMore} accessibilityElementsHidden>
              <Text style={[styles.viewMoreText, {color: colors.primary}]}>View Details</Text>
              <Icon name="chevron-forward" family="Ionicons" size={16} color={colors.primary} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const PremiumUniversitiesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const {colors, isDark} = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [selectedType, setSelectedType] = useState<'all' | 'public' | 'private'>('all');
  const [sortBy, setSortBy] = useState('ranking');
  const [refreshing, setRefreshing] = useState(false);
  const headerAnim = useRef(new Animated.Value(0)).current;

  // Debounce search query for better performance
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);

  // Track search queries for analytics
  useEffect(() => {
    if (debouncedSearchQuery.trim().length >= 2) {
      // Track search after debounce
      analytics.trackSearch(debouncedSearchQuery.trim(), undefined, 'universities');
    }
  }, [debouncedSearchQuery]);

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.refreshThreshold();
    // Simulate data refresh (in real app, this would fetch from API)
    await new Promise<void>(resolve => setTimeout(() => resolve(), 800));
    setRefreshing(false);
    Haptics.success();
  }, []);

  // FlatList optimization: getItemLayout for fixed height items
  const ITEM_HEIGHT = 180; // Approximate card height
  const getItemLayout = useCallback(
    (_data: ArrayLike<UniversityData> | null | undefined, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  const filteredUniversities = useMemo(() => {
    let result = [...UNIVERSITIES];

    // Search filter - use debounced query
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter(
        u =>
          u.name.toLowerCase().includes(query) ||
          u.short_name.toLowerCase().includes(query) ||
          u.city.toLowerCase().includes(query),
      );
    }

    // Province filter
    if (selectedProvince !== 'all') {
      result = result.filter(u => u.province === selectedProvince);
    }

    // Type filter
    if (selectedType !== 'all') {
      result = result.filter(u => u.type === selectedType);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'ranking':
          return (a.ranking_national || 999) - (b.ranking_national || 999);
        case 'established':
          return a.established_year - b.established_year;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [debouncedSearchQuery, selectedProvince, selectedType, sortBy]);

  const handleUniversityPress = useCallback(
    (university: UniversityData) => {
      navigation.navigate('UniversityDetail', {universityId: university.short_name});
    },
    [navigation],
  );

  const renderHeader = () => (
    <View style={styles.listHeader}>
      {/* Compact Header Row - Integrated with Search */}
      <View style={styles.compactHeader}>
        <View style={styles.titleRow}>
          <View style={styles.titleLeft}>
            <Text style={[styles.screenTitle, {color: colors.text}]}>Universities</Text>
            <View style={[styles.countBadgeInline, {backgroundColor: colors.primaryLight}]}>
              <Text style={[styles.countTextInline, {color: colors.primary}]}>
                {filteredUniversities.length}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.filterIconBtn, {backgroundColor: colors.card}]}
            onPress={() => {/* Toggle advanced filters */}}
            accessibilityLabel="Filter options">
            <Icon name="options-outline" family="Ionicons" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar - Consistent Design */}
      <View style={styles.searchContainer}>
        <PremiumSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Search universities, cities..."
          variant="default"
          size="md"
        />
      </View>

      {/* Sort Options */}
      <View style={styles.sortSection}>
        <Text style={[styles.sortLabel, {color: colors.textSecondary}]}>Sort by</Text>
        <View style={styles.sortOptions}>
          {SORT_OPTIONS.map(opt => (
            <FilterChip
              key={opt.value}
              label={opt.label}
              isSelected={sortBy === opt.value}
              onPress={() => setSortBy(opt.value)}
              colors={colors}
            />
          ))}
        </View>
      </View>

      {/* Province Filter */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={PROVINCES}
        keyExtractor={item => item.value}
        style={styles.provinceList}
        contentContainerStyle={styles.provinceListContent}
        renderItem={({item}) => (
          <FilterChip
            label={item.label}
            isSelected={selectedProvince === item.value}
            onPress={() => setSelectedProvince(item.value)}
            colors={colors}
            variant="primary"
          />
        )}
      />

      {/* Type Filter */}
      <View style={styles.typeFilter}>
        {(['all', 'public', 'private'] as const).map(type => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeBtn,
              {
                backgroundColor: selectedType === type 
                  ? (type === 'public' ? colors.success : type === 'private' ? colors.primary : colors.secondary)
                  : colors.card,
                borderColor: selectedType === type 
                  ? (type === 'public' ? colors.success : type === 'private' ? colors.primary : colors.secondary)
                  : colors.border,
              },
            ]}
            onPress={() => setSelectedType(type)}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
              <Icon 
                name={type === 'all' ? 'school-outline' : type === 'public' ? 'business-outline' : 'briefcase-outline'} 
                family="Ionicons" 
                size={14} 
                color={selectedType === type ? '#FFFFFF' : colors.text} 
              />
              <Text
                style={[
                  styles.typeBtnText,
                  {
                    color: selectedType === type ? '#FFFFFF' : colors.text,
                    fontWeight: selectedType === type ? '700' : '500',
                  },
                ]}>
                {type === 'all' ? 'All' : type === 'public' ? 'Public' : 'Private'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderUniversityCard = useCallback(
    ({item, index}: {item: UniversityData; index: number}) => (
      <UniversityCard
        item={item}
        onPress={() => handleUniversityPress(item)}
        colors={colors}
        isDark={isDark}
        index={index}
      />
    ),
    [handleUniversityPress, colors, isDark],
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <FlatList
          data={filteredUniversities}
          keyExtractor={item => item.short_name}
          renderItem={renderUniversityCard}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          getItemLayout={getItemLayout}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
              progressBackgroundColor={colors.card}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconBg, {backgroundColor: `${colors.primary}10`}]}>
                <Icon name="school-outline" family="Ionicons" size={48} color={colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, {color: colors.text}]}>
                No universities found
              </Text>
              <Text style={[styles.emptySubtitle, {color: colors.textSecondary}]}>
                Try adjusting your filters or search query
              </Text>
              <TouchableOpacity
                style={[styles.resetBtn, {backgroundColor: colors.primary}]}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedProvince('all');
                  setSelectedType('all');
                }}
                accessibilityRole="button"
                accessibilityLabel="Reset all filters to show all universities">
                <Text style={styles.resetBtnText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </SafeAreaView>
      
      {/* Floating Tools Button - Quick access to calculators */}
      <FloatingToolsButton bottomOffset={100} />
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
  listHeader: {
    paddingBottom: SPACING.md,
  },
  compactHeader: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  countBadgeInline: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
  },
  countTextInline: {
    fontSize: 14,
    fontWeight: '700',
  },
  filterIconBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  headerCard: {
    margin: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  screenSubtitle: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '400',
  },
  countBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
  },
  countText: {
    fontSize: 20,
    fontWeight: '700',
  },
  // Unified search container style
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sortSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sortLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sortOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
  },
  filterChipText: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  provinceList: {
    marginBottom: SPACING.md,
  },
  provinceListContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  typeFilter: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
  },
  typeBtnText: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 120,
  },
  universityCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 50,
  },
  logoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '800',
  },
  headerInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    marginRight: SPACING.sm,
  },
  universityName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 4,
  },
  shortNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  shortName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
  hecBadge: {
    paddingHorizontal: SPACING.xs + 2,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  hecText: {
    fontSize: TYPOGRAPHY.sizes.xs - 1,
    fontWeight: '700',
  },
  rankBadge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.md,
    elevation: 2,
  },
  rankText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 2,
    marginTop: SPACING.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  detailText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
  },
  detailDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginHorizontal: SPACING.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  typeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  typeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  viewMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewMoreText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
  viewMoreArrow: {
    fontSize: 16,
  },
  emptyContainer: {
    padding: SPACING.xxxl,
    alignItems: 'center',
  },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  resetBtn: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.full,
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
  },
});

export default PremiumUniversitiesScreen;

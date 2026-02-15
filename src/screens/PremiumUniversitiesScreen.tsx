import React, {useState, useMemo, useCallback, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  Platform,
  RefreshControl,
  Image,
  Alert,
  Linking,
} from 'react-native';

import {FlashList} from '@shopify/flash-list';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import {TYPOGRAPHY, SPACING, RADIUS, ANIMATION} from '../constants/design';
import {LIST_ITEM_HEIGHTS, ANIMATION_SCALES} from '../constants/ui';
import {useTheme} from '../contexts/ThemeContext';
import {useAuth} from '../contexts/AuthContext';
import {RootStackParamList, TabParamList} from '../navigation/AppNavigator';
import {hybridDataService} from '../services/hybridData';
import type {TursoUniversity} from '../services/turso';
import type {UniversityData} from '../data';
import {useDebouncedValue} from '../hooks/useDebounce';
import {Haptics} from '../utils/haptics';
import {Icon} from '../components/icons';
import {PremiumSearchBar} from '../components/PremiumSearchBar';
import FloatingToolsButton from '../components/FloatingToolsButton';
import {UniversitiesListSkeleton} from '../components/ListSkeletons';
import {analytics} from '../services/analytics';
import {findUniversitiesByAlias, normalizeSearchTerm} from '../utils/universityAliases';
import SearchableDropdown, {
  PROVINCE_OPTIONS,
  createUniversityOptions,
} from '../components/SearchableDropdown';
import UniversityLogo from '../components/UniversityLogo';
import {getUniversityBrandColor, getLogo} from '../utils/universityLogos';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Unified type for both Turso and bundled university data
type UniversityItem = TursoUniversity | UniversityData;

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
      toValue: ANIMATION_SCALES.CHIP_PRESS,
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
              fontWeight: isSelected ? TYPOGRAPHY.weight.semibold : TYPOGRAPHY.weight.medium,
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
  onToggleFavorite,
  isFavorite,
  colors,
  isDark,
  index,
}: {
  item: UniversityData;
  onPress: () => void;
  onToggleFavorite: (id: string) => void;
  isFavorite: boolean;
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
      toValue: ANIMATION_SCALES.PRESS,
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
          {/* Enhanced Header Row - With Logo */}
          <View style={styles.cardHeader}>
            {/* University Logo - only show container if logo_url exists */}
            {item.logo_url ? (
              <View style={[styles.logoContainer, {backgroundColor: colors.background}]}>
                <UniversityLogo
                  shortName={item.short_name}
                  universityName={item.name}
                  logoUrl={item.logo_url}
                  size={44}
                  style={styles.uniLogo}
                />
              </View>
            ) : null}

            {/* Info */}
            <View style={styles.headerInfo}>
              <View style={styles.nameRow}>
                <Text style={[styles.universityName, {color: colors.text}]} numberOfLines={1}>
                  {item.name}
                </Text>
              </View>
              <View style={styles.shortNameRow}>
                <Text style={[styles.shortName, {color: getUniversityBrandColor(item.name) || colors.primary, fontWeight: TYPOGRAPHY.weight.bold}]}>
                  {item.short_name}
                </Text>
                {item.type ? (
                  <View style={[
                    styles.typeBadgeSmall, 
                    {backgroundColor: item.type === 'public' ? `${colors.success}15` : `${colors.primary}15`}
                  ]}>
                    <Text style={[
                      styles.typeBadgeText, 
                      {color: item.type === 'public' ? colors.success : colors.primary}
                    ]}>
                      {item.type.toUpperCase()}
                    </Text>
                  </View>
                ) : null}
                {item.is_hec_recognized && (
                  <View style={[styles.hecBadge, {backgroundColor: `${colors.success}15`}]}>
                    <Icon name="checkmark-circle" family="Ionicons" size={10} color={colors.success} />
                    <Text style={[styles.hecText, {color: colors.success}]}>HEC</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Rank + Favorite + Arrow */}
            <View style={styles.cardHeaderRight}>
              {item.ranking_national && (
                <LinearGradient
                  colors={getRankColor(item.ranking_national)}
                  style={styles.rankBadgeCompact}>
                  <Text style={styles.rankText}>#{item.ranking_national}</Text>
                </LinearGradient>
              )}
              <TouchableOpacity
                style={[styles.favoriteBtn, {backgroundColor: isFavorite ? '#FEE2E2' : colors.background}]}
                onPress={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(item.short_name);
                }}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                accessibilityRole="button"
                accessibilityLabel={isFavorite ? "Remove from favorites" : "Add to favorites"}>
                <Icon 
                  name={isFavorite ? "heart" : "heart-outline"} 
                  family="Ionicons" 
                  size={18} 
                  color={isFavorite ? "#EF4444" : colors.textSecondary} 
                />
              </TouchableOpacity>
              <Icon name="chevron-forward" family="Ionicons" size={20} color={colors.textSecondary} />
            </View>
          </View>

          {/* Compact Details Row */}
          <View style={styles.cardDetailsCompact}>
            {item.city ? (
              <View style={styles.detailItem}>
                <Icon name="location" family="Ionicons" size={12} color={colors.primary} />
                <Text style={[styles.detailText, {color: colors.text}]}>
                  {item.city}
                </Text>
              </View>
            ) : null}
            {item.established_year ? (
              <View style={styles.detailItem}>
                <Icon name="calendar" family="Ionicons" size={12} color={colors.primary} />
                <Text style={[styles.detailText, {color: colors.text}]}>
                  {item.established_year}
                </Text>
              </View>
            ) : null}
            {item.campuses && item.campuses.length > 1 && (
              <View style={styles.detailItem}>
                <Icon name="business" family="Ionicons" size={12} color={colors.primary} />
                <Text style={[styles.detailText, {color: colors.text}]}>
                  {item.campuses.length} Campuses
                </Text>
              </View>
            )}
          </View>

          {/* Website Link - Requested by User */}
          {item.website && (
            <View style={styles.websiteRow}>
              <TouchableOpacity 
                style={[styles.websiteButton, {backgroundColor: `${colors.primary}10`}]}
                onPress={(e) => {
                  e.stopPropagation();
                  const url = item.website.startsWith('http') ? item.website : `https://${item.website}`;
                  Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open website'));
                }}
                accessibilityRole="link"
                accessibilityLabel={`Visit ${item.name} website`}>
                <Icon name="globe-outline" family="Ionicons" size={12} color={colors.primary} />
                <Text style={[styles.websiteText, {color: colors.primary}]} numberOfLines={1}>
                  {item.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

type UniversitiesRouteProp = RouteProp<TabParamList, 'Universities'>;

const PremiumUniversitiesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<UniversitiesRouteProp>();
  const {colors, isDark} = useTheme();
  const {user, addFavorite, removeFavorite, isFavorite, isGuest} = useAuth();
  
  // Initialize search query from route params if provided
  const initialSearchQuery = route.params?.searchQuery || '';
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [selectedType, setSelectedType] = useState<'all' | 'public' | 'private'>('all');
  const [sortBy, setSortBy] = useState('ranking');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [universities, setUniversities] = useState<UniversityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const headerAnim = useRef(new Animated.Value(0)).current;

  // Update search query when route params change (e.g., from Home page search)
  useEffect(() => {
    if (route.params?.searchQuery) {
      setSearchQuery(route.params.searchQuery);
    }
  }, [route.params?.searchQuery]);

  // Debounce search query for better performance
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);

  // Load universities from hybrid data service (Turso with bundled fallback)
  useEffect(() => {
    const loadUniversities = async () => {
      try {
        const data = await hybridDataService.getUniversities();
        setUniversities(data);
      } catch (error) {
        // Fallback to sync bundled data if async fails
        setUniversities(hybridDataService.getUniversitiesSync());
      } finally {
        setLoading(false);
      }
    };
    loadUniversities();
  }, []);

  // Track search queries for analytics
  useEffect(() => {
    if (debouncedSearchQuery.trim().length >= 2) {
      // Track search after debounce
      analytics.trackSearch(debouncedSearchQuery.trim(), undefined, 'universities');
    }
  }, [debouncedSearchQuery]);

  // Pull to refresh handler - refreshes from Turso if available
  // CRITICAL: Uses forceRefresh=true to bypass cache and get fresh data
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.refreshThreshold();
    try {
      // Force refresh from server, bypassing cache
      const data = await hybridDataService.getUniversities(true);
      setUniversities(data);
      Haptics.success();
    } catch (error) {
      // Keep existing data on error
      Haptics.error();
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Handle favorite toggle
  const handleToggleFavorite = useCallback(async (universityId: string) => {
    if (isGuest) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to save universities to your favorites.',
        [{text: 'OK'}]
      );
      return;
    }
    
    try {
      if (isFavorite(universityId, 'university')) {
        await removeFavorite(universityId, 'university');
        Haptics.light();
      } else {
        await addFavorite(universityId, 'university');
        Haptics.success();
      }
    } catch (error) {
      Haptics.error();
    }
  }, [isGuest, isFavorite, addFavorite, removeFavorite]);

  // FlatList optimization: getItemLayout for fixed height items
  const ITEM_HEIGHT = LIST_ITEM_HEIGHTS.UNIVERSITY_CARD;
  const getItemLayout = useCallback(
    (_data: ArrayLike<UniversityItem> | null | undefined, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  // Prefetch visible logo images to reduce flicker / missing images
  // Using FastImage.preload for better caching
  const prefetchedLogos = useRef<Set<string>>(new Set());
  const onViewableItemsChanged = useRef(({viewableItems}: {viewableItems: Array<{item: UniversityItem}>}) => {
    // Collect URLs to preload
    const urlsToPreload: {uri: string; priority: string}[] = [];
    
    viewableItems.forEach(({item}) => {
      const url = item?.logo_url || (item?.id && typeof item.id === 'string' ? getLogo(parseInt(item.id, 10)) : null);
      if (url && !prefetchedLogos.current.has(url)) {
        prefetchedLogos.current.add(url);
        urlsToPreload.push({
          uri: url,
          priority: 'normal',
        });
      }
    });
    
    // Batch preload all visible logos
    if (urlsToPreload.length > 0) {
      FastImage.preload(urlsToPreload as any);
    }
  });
  const viewabilityConfig = useRef({itemVisiblePercentThreshold: 50});

  const filteredUniversities = useMemo(() => {
    // Filter out blank/invalid items - ensure all required card fields exist
    const validUniversities = universities.filter(
      u => u && 
        u.name && u.name.trim() !== '' && 
        u.short_name && u.short_name.trim() !== '' &&
        u.city && u.city.trim() !== '' &&
        u.type && u.type.trim() !== '' &&
        u.province
    );
    
    let result = [...validUniversities];

    // Search filter - use debounced query with alias support
    if (debouncedSearchQuery.trim()) {
      const query = normalizeSearchTerm(debouncedSearchQuery);
      
      // Find matching short_names via aliases (e.g., "lums" -> ["LUMS"])
      const aliasMatches = findUniversitiesByAlias(query);
      
      result = result.filter(u => {
        const nameLower = u.name.toLowerCase();
        const shortLower = u.short_name.toLowerCase();
        const cityLower = u.city.toLowerCase();
        
        // Prefix match - matches start of any word in name (Google-like)
        const nameWords = nameLower.split(/[\s,\-()]+/);
        const prefixMatch = nameWords.some(word => word.startsWith(query));
        
        // Direct contains match on name, short_name, or city
        const directMatch = 
          nameLower.includes(query) ||
          shortLower.includes(query) ||
          shortLower.startsWith(query) ||
          cityLower.includes(query) ||
          cityLower.startsWith(query);
        
        // Alias match (e.g., searching "lums" matches university with short_name "LUMS")
        const aliasMatch = aliasMatches.includes(u.short_name);
        
        return directMatch || aliasMatch || prefixMatch;
      });
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
        case 'ranking': {
          // Sort by national ranking first, then HEC ranking, then alphabetically
          const rankA = a.ranking_national ?? 999;
          const rankB = b.ranking_national ?? 999;
          if (rankA !== rankB) return rankA - rankB;
          // HEC ranking as tiebreaker (W1 > W2 > W3 > W4)
          const hecA = a.ranking_hec ? parseInt(a.ranking_hec.replace(/\D/g, '')) || 99 : 99;
          const hecB = b.ranking_hec ? parseInt(b.ranking_hec.replace(/\D/g, '')) || 99 : 99;
          if (hecA !== hecB) return hecA - hecB;
          return a.name.localeCompare(b.name);
        }
        case 'established':
          return (a.established_year || 0) - (b.established_year || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [debouncedSearchQuery, selectedProvince, selectedType, sortBy, universities]);

  const handleUniversityPress = useCallback(
    (university: UniversityItem) => {
      navigation.navigate('UniversityDetail', {universityId: university.short_name});
    },
    [navigation],
  );

  // Get user initials for profile button
  const getUserInitials = () => {
    if (user?.fullName) {
      const names = user.fullName.split(' ');
      return names.map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  // Ref for search input to maintain focus
  const searchInputRef = useRef<string>(searchQuery);
  
  // Stable search change handler that doesn't cause header re-renders
  const handleSearchChange = useCallback((text: string) => {
    searchInputRef.current = text;
    setSearchQuery(text);
  }, []);
  
  const handleSearchClear = useCallback(() => {
    searchInputRef.current = '';
    setSearchQuery('');
  }, []);

  // Memoize header content to prevent keyboard dismissal during typing
  // CRITICAL: searchQuery is NOT in dependencies - search bar is moved OUTSIDE this header
  // This prevents the entire header from re-rendering on each keystroke
  const renderHeader = useCallback(() => (
    <View style={styles.listHeader}>
      {/* Collapsible Filters */}
      {showFilters && (
        <>
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

          {/* Province Filter - Single Dropdown (no redundant pills) */}
          <View style={styles.filterRow}>
            <View style={styles.filterDropdownContainer}>
              <SearchableDropdown
                options={PROVINCE_OPTIONS}
                value={selectedProvince}
                onSelect={(option, value) => setSelectedProvince(value || 'all')}
                placeholder="Select Province"
                searchPlaceholder="Search provinces..."
                emptyMessage="No provinces found"
              />
            </View>
          </View>

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
                onPress={() => setSelectedType(type)}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${type === 'all' ? 'all universities' : type} universities${selectedType === type ? ', currently selected' : ''}`}>
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
                        fontWeight: selectedType === type ? TYPOGRAPHY.weight.bold : TYPOGRAPHY.weight.medium,
                      },
                    ]}>
                {type === 'all' ? 'All' : type === 'public' ? 'Public' : 'Private'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
          </View>
        </>      
      )}
    </View>
  ), [colors, showFilters, sortBy, selectedProvince, selectedType]);

  // Handle compare action from swipe
  const handleCompare = useCallback((universityId: string) => {
    // Navigate to compare screen with this university pre-selected
    navigation.navigate('Compare');
  }, [navigation]);

  const renderUniversityCard = useCallback(
    ({item, index}: {item: UniversityItem; index: number}) => (
      <UniversityCard
        item={item as any}
        onPress={() => handleUniversityPress(item)}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={isFavorite(item.short_name, 'university')}
        colors={colors}
        isDark={isDark}
        index={index}
      />
    ),
    [handleUniversityPress, handleToggleFavorite, isFavorite, colors, isDark],
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Compact Header - Consistent with Scholarships */}
        <View style={styles.compactHeader}>
          <View style={styles.topHeaderRow}>
            <View style={styles.headerLeft}>
              <Text style={[styles.screenTitle, {color: colors.text}]}>Universities</Text>
              <View style={[styles.countBadgeInline, {backgroundColor: colors.primaryLight}]}>
                <Text style={[styles.countTextInline, {color: colors.primary}]}>
                  {filteredUniversities.length}
                </Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={[styles.filterIconBtn, {backgroundColor: showFilters ? colors.primary : colors.card}]}
                onPress={() => setShowFilters(!showFilters)}
                accessibilityLabel="Toggle filter options">
                <Icon name="options-outline" family="Ionicons" size={20} color={showFilters ? '#FFFFFF' : colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.profileBtn,
                  !user?.avatarUrl && {backgroundColor: colors.primary}
                ]}
                onPress={() => navigation.navigate('Profile')}
                accessibilityRole="button"
                accessibilityLabel="View your profile">
                {user?.avatarUrl ? (
                  <Image
                    source={{uri: user.avatarUrl}}
                    style={styles.profileImage}
                    accessibilityIgnoresInvertColors
                  />
                ) : (
                  <Text style={styles.profileInitials}>{getUserInitials()}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
          <Text style={[styles.headerSubtitle, {color: colors.textSecondary}]}>
            Explore Pakistani universities
          </Text>
        </View>

        {/* Search Bar - Consistent position with Scholarships */}
        <View style={styles.searchContainer}>
          <PremiumSearchBar
            value={searchQuery}
            onChangeText={handleSearchChange}
            onClear={handleSearchClear}
            placeholder="Search universities, cities..."
            variant="default"
            size="md"
          />
        </View>
        
        {loading ? (
          <UniversitiesListSkeleton />
        ) : (
        <FlashList
          data={filteredUniversities}
          keyExtractor={item => item.short_name}
          renderItem={renderUniversityCard}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={false}
          estimatedItemSize={120}
          onViewableItemsChanged={onViewableItemsChanged.current}
          viewabilityConfig={viewabilityConfig.current}
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
        )}
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
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  compactHeader: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.regular,
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
    fontWeight: TYPOGRAPHY.weight.heavy,
    letterSpacing: -0.5,
  },
  countBadgeInline: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
  },
  countTextInline: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.bold,
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
  profileBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  profileImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
    fontWeight: TYPOGRAPHY.weight.regular,
  },
  countBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
  },
  countText: {
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  // Unified search container style
  searchContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sortSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  sortLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
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
    paddingHorizontal: SPACING.md,
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
    paddingHorizontal: SPACING.md,
    paddingBottom: 120,
  },
  universityCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBadgeCompact: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    marginRight: SPACING.sm,
  },
  headerInfo: {
    flex: 1,
    marginLeft: SPACING.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  universityName: {
    fontSize: TYPOGRAPHY.sizes.md - 1,
    fontWeight: TYPOGRAPHY.weight.semibold,
    lineHeight: 20,
  },
  shortNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: 2,
  },
  shortName: {
    fontSize: TYPOGRAPHY.sizes.sm - 1,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  typeBadgeSmall: {
    paddingHorizontal: SPACING.xs + 2,
    paddingVertical: 1,
    borderRadius: RADIUS.xs,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  hecBadge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 1,
    borderRadius: RADIUS.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  hecText: {
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  rankBadge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.md,
    elevation: 2,
  },
  rankText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#FFFFFF',
  },
  cardDetailsCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: SPACING.xs + 2,
    paddingTop: SPACING.xs,
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
    gap: 3,
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  detailText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
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
    fontWeight: TYPOGRAPHY.weight.bold,
    textTransform: 'capitalize',
  },
  viewMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewMoreText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
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
    fontWeight: TYPOGRAPHY.weight.bold,
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
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  // NEW: Enhanced filter styles
  filterRow: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  filterDropdownContainer: {
    marginBottom: SPACING.sm,
  },
  // University card logo styles
  logoContainer: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  uniLogo: {
    borderRadius: RADIUS.md,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  favoriteBtn: {
    width: 44, // WCAG 2.1 minimum touch target
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Swipe action styles
  swipeActionsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  swipeAction: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    gap: 4,
  },
  swipeActionLeft: {
    position: 'absolute',
    left: 0,
  },
  swipeActionRight: {
    position: 'absolute',
    right: 0,
  },
  swipeActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  websiteRow: {
    marginTop: SPACING.xs,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.03)',
  },
  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  websiteText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
});

export default PremiumUniversitiesScreen;

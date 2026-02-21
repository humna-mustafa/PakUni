/**
 * useUniversitiesScreen - All state & logic for PremiumUniversitiesScreen
 */

import {useState, useMemo, useCallback, useRef, useEffect} from 'react';
import {Animated, Alert} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import FastImage from 'react-native-fast-image';
import {LIST_ITEM_HEIGHTS} from '../constants/ui';
import {useTheme} from '../contexts/ThemeContext';
import {useAuth} from '../contexts/AuthContext';
import {RootStackParamList, TabParamList} from '../navigation/AppNavigator';
import {hybridDataService} from '../services/hybridData';
import type {TursoUniversity} from '../services/turso';
import type {UniversityData} from '../data';
import {useDebouncedValue} from './useDebounce';
import {Haptics} from '../utils/haptics';
import {analytics} from '../services/analytics';
import {findUniversitiesByAlias, normalizeSearchTerm} from '../utils/universityAliases';
import {getLogo} from '../utils/universityLogos';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type UniversitiesRouteProp = RouteProp<TabParamList, 'Universities'>;
export type UniversityItem = TursoUniversity | UniversityData;

export const SORT_OPTIONS = [
  {value: 'ranking', label: 'Ranking', iconName: 'trophy-outline'},
  {value: 'name', label: 'Name', iconName: 'text-outline'},
  {value: 'established', label: 'Oldest', iconName: 'calendar-outline'},
];

export const useUniversitiesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<UniversitiesRouteProp>();
  const {colors, isDark} = useTheme();
  const {user, addFavorite, removeFavorite, isFavorite, isGuest} = useAuth();

  // State
  const initialSearchQuery = route.params?.searchQuery || '';
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [selectedType, setSelectedType] = useState<'all' | 'public' | 'private'>('all');
  const [sortBy, setSortBy] = useState('ranking');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showForYou, setShowForYou] = useState(false);
  const [universities, setUniversities] = useState<UniversityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const headerAnim = useRef(new Animated.Value(0)).current;

  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);

  // ── Personalisation helpers ──────────────────────────────────────────
  // Map the user's target field to keywords found in university names
  const universityKeywordsForField = useMemo((): string[] => {
    const field = (user?.targetField || '').toLowerCase();
    if (!field) return [];
    if (field.includes('medical') || field.includes('medicine') || field.includes('health'))
      return ['medical', 'health', 'medicine', 'dentistry', 'pharmacy', 'nursing', 'rehabilitation'];
    if (field.includes('engineer') || field.includes('computer') || field.includes('information') || field.includes('software') || field.includes('it'))
      return ['technology', 'engineering', 'sciences', 'computer', 'information'];
    if (field.includes('business') || field.includes('commerce') || field.includes('management') || field.includes('finance'))
      return ['business', 'commerce', 'management', 'institute of business'];
    if (field.includes('law') || field.includes('legal') || field.includes('shariah'))
      return ['law', 'shariah', 'legal'];
    if (field.includes('art') || field.includes('design') || field.includes('fashion'))
      return ['art', 'design', 'fashion', 'fine arts', 'creative'];
    if (field.includes('agriculture'))
      return ['agriculture', 'agrarian', 'arid', 'veterinary'];
    // Default – include everything so the toggle is not confusingly empty
    return [];
  }, [user?.targetField]);

  const userFieldLabel = useMemo(() => {
    return user?.targetField || '';
  }, [user?.targetField]);

  // A university is "for you" if its name/description contains one of the
  // field keywords OR if it is a comprehensive/general university (no
  // specialisation keyword found → it offers all programmes).
  const SPECIALISATION_KEYWORDS = [
    'medical', 'health', 'medicine', 'dentistry', 'pharmacy', 'nursing',
    'technology', 'engineering', 'business', 'commerce', 'management',
    'law', 'shariah', 'art', 'design', 'agriculture', 'veterinary',
    'textile', 'fashion', 'rehabilitation',
  ];

  const isUniversityForYou = useCallback((u: UniversityItem): boolean => {
    if (universityKeywordsForField.length === 0) return true;
    const haystack = `${u.name} ${(u as TursoUniversity).description || ''}`.toLowerCase();
    // Check if it matches user's field
    const matchesField = universityKeywordsForField.some(kw => haystack.includes(kw));
    if (matchesField) return true;
    // Check if it's a general / comprehensive university (no specialisation keyword)
    const isGeneral = !SPECIALISATION_KEYWORDS.some(kw => haystack.includes(kw));
    return isGeneral;
  }, [universityKeywordsForField]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update search query when route params change
  useEffect(() => {
    if (route.params?.searchQuery) {
      setSearchQuery(route.params.searchQuery);
    }
  }, [route.params?.searchQuery]);

  // Load universities
  useEffect(() => {
    const loadUniversities = async () => {
      try {
        const data = await hybridDataService.getUniversities();
        setUniversities(data);
      } catch {
        setUniversities(hybridDataService.getUniversitiesSync());
      } finally {
        setLoading(false);
      }
    };
    loadUniversities();
  }, []);

  // Track search
  useEffect(() => {
    if (debouncedSearchQuery.trim().length >= 2) {
      analytics.trackSearch(debouncedSearchQuery.trim(), undefined, 'universities');
    }
  }, [debouncedSearchQuery]);

  // Pull to refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.refreshThreshold();
    try {
      const data = await hybridDataService.getUniversities(true);
      setUniversities(data);
      Haptics.success();
    } catch {
      Haptics.error();
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Favorite toggle
  const handleToggleFavorite = useCallback(
    async (universityId: string) => {
      if (isGuest) {
        Alert.alert('Sign In Required', 'Please sign in to save universities to your favorites.', [
          {text: 'OK'},
        ]);
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
      } catch {
        Haptics.error();
      }
    },
    [isGuest, isFavorite, addFavorite, removeFavorite],
  );

  // Prefetch logos
  const prefetchedLogos = useRef<Set<string>>(new Set());
  const onViewableItemsChanged = useRef(
    ({viewableItems}: {viewableItems: Array<{item: UniversityItem}>}) => {
      const urlsToPreload: {uri: string; priority: string}[] = [];
      viewableItems.forEach(({item}) => {
        const url =
          item?.logo_url ||
          (item?.id && typeof item.id === 'string' ? getLogo(parseInt(item.id, 10)) : null);
        if (url && !prefetchedLogos.current.has(url)) {
          prefetchedLogos.current.add(url);
          urlsToPreload.push({uri: url, priority: 'normal'});
        }
      });
      if (urlsToPreload.length > 0) {
        FastImage.preload(urlsToPreload as any);
      }
    },
  );
  const viewabilityConfig = useRef({itemVisiblePercentThreshold: 50});

  // Filtered + sorted universities
  const filteredUniversities = useMemo(() => {
    const validUniversities = universities.filter(
      u =>
        u &&
        u.name &&
        u.name.trim() !== '' &&
        u.short_name &&
        u.short_name.trim() !== '' &&
        u.city &&
        u.city.trim() !== '' &&
        u.type &&
        u.type.trim() !== '' &&
        u.province,
    );

    let result = [...validUniversities];

    // ── For You personalisation filter ──────────────────────────────────
    if (showForYou && user?.targetField) {
      result = result.filter(u => isUniversityForYou(u));
    }

    if (debouncedSearchQuery.trim()) {
      const query = normalizeSearchTerm(debouncedSearchQuery);
      const aliasMatches = findUniversitiesByAlias(query);
      result = result.filter(u => {
        const nameLower = u.name.toLowerCase();
        const shortLower = u.short_name.toLowerCase();
        const cityLower = u.city.toLowerCase();
        const nameWords = nameLower.split(/[\s,\-()]+/);
        const prefixMatch = nameWords.some(word => word.startsWith(query));
        const directMatch =
          nameLower.includes(query) ||
          shortLower.includes(query) ||
          shortLower.startsWith(query) ||
          cityLower.includes(query) ||
          cityLower.startsWith(query);
        const aliasMatch = aliasMatches.includes(u.short_name);
        return directMatch || aliasMatch || prefixMatch;
      });
    }

    if (selectedProvince !== 'all') {
      result = result.filter(u => u.province === selectedProvince);
    }
    if (selectedType !== 'all') {
      result = result.filter(u => u.type === selectedType);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'ranking': {
          const rankA = a.ranking_national ?? 999;
          const rankB = b.ranking_national ?? 999;
          if (rankA !== rankB) return rankA - rankB;
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
  }, [debouncedSearchQuery, selectedProvince, selectedType, sortBy, universities, showForYou, isUniversityForYou, user?.targetField]);

  // Navigation
  const handleUniversityPress = useCallback(
    (university: UniversityItem) => {
      navigation.navigate('UniversityDetail', {universityId: university.short_name});
    },
    [navigation],
  );

  const navigateToProfile = useCallback(() => {
    navigation.navigate('Profile');
  }, [navigation]);

  const navigateToCompare = useCallback(() => {
    navigation.navigate('Compare');
  }, [navigation]);

  // User initials
  const getUserInitials = useCallback(() => {
    if (user?.fullName) {
      const names = user.fullName.split(' ');
      return names
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) return user.email[0].toUpperCase();
    return 'U';
  }, [user]);

  // Search handlers
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedProvince('all');
    setSelectedType('all');
    setShowForYou(false);
  }, []);

  return {
    colors,
    isDark,
    user,
    loading,
    searchQuery,
    handleSearchChange,
    handleSearchClear,
    selectedProvince,
    setSelectedProvince,
    selectedType,
    setSelectedType,
    sortBy,
    setSortBy,
    showFilters,
    setShowFilters,
    showForYou,
    setShowForYou,
    userFieldLabel,
    refreshing,
    handleRefresh,
    filteredUniversities,
    handleUniversityPress,
    handleToggleFavorite,
    isFavorite,
    navigateToProfile,
    navigateToCompare,
    getUserInitials,
    resetFilters,
    onViewableItemsChanged,
    viewabilityConfig,
  };
};

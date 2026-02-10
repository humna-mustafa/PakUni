/**
 * Hook for PremiumScholarshipsScreen
 * Manages all state, data fetching, filtering, favorites, and handlers
 */

import {useState, useMemo, useRef, useEffect, useCallback} from 'react';
import {Animated, Alert, Linking} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../contexts/ThemeContext';
import {useAuth} from '../contexts/AuthContext';
import {SCHOLARSHIPS} from '../data';
import {
  hasBroadAvailability,
  getScholarshipSpecificUniversities,
  ScholarshipData,
} from '../data/scholarships';
import {useDebouncedValue} from '../hooks/useDebounce';
import {Haptics} from '../utils/haptics';
import {logger} from '../utils/logger';
import {createUniversityOptions} from '../components/SearchableDropdown';
import {analytics} from '../services/analytics';
import {hybridDataService} from '../services/hybridData';
import type {RootStackParamList, TabParamList} from '../navigation/AppNavigator';
import type {FilterType} from '../types/scholarships';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScholarshipsRouteProp = RouteProp<TabParamList, 'Scholarships'>;

export const useScholarshipsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScholarshipsRouteProp>();
  const {colors, isDark} = useTheme();
  const {user, addFavorite, removeFavorite, isFavorite, isGuest} = useAuth();

  const [scholarships, setScholarships] = useState<ScholarshipData[]>(SCHOLARSHIPS);

  // Initialize search query from route params if provided (e.g., from Home search)
  const initialSearchQuery = route.params?.searchQuery || '';
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);
  const [selectedType, setSelectedType] = useState<FilterType>('all');
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  const [selectedScholarship, setSelectedScholarship] = useState<ScholarshipData | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  // Update search query when route params change (e.g., from Home page search)
  useEffect(() => {
    if (route.params?.searchQuery) {
      setSearchQuery(route.params.searchQuery);
    }
  }, [route.params?.searchQuery]);

  // Load scholarships on mount (uses cached data by default)
  useEffect(() => {
    const loadScholarships = async () => {
      try {
        const data = await hybridDataService.getScholarships();
        if (data.length > 0) {
          setScholarships(data as ScholarshipData[]);
        }
      } catch (error) {
        logger.warn('Failed to load scholarships, using bundled data', error, 'Scholarships');
      }
    };
    loadScholarships();
  }, []);

  // Check favorite status when scholarship is selected
  useEffect(() => {
    if (selectedScholarship) {
      setIsFav(isFavorite(selectedScholarship.id, 'scholarship'));
    }
  }, [selectedScholarship, isFavorite]);

  // Toggle favorite handler (modal)
  const handleToggleFavorite = useCallback(async () => {
    if (!selectedScholarship) return;

    if (isGuest) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to save scholarships to your favorites.',
        [{text: 'OK'}],
      );
      return;
    }

    try {
      if (isFav) {
        await removeFavorite(selectedScholarship.id, 'scholarship');
        setIsFav(false);
        Haptics.light();
      } else {
        await addFavorite(selectedScholarship.id, 'scholarship');
        setIsFav(true);
        Haptics.success();
      }
    } catch (error) {
      logger.error('Error toggling favorite', error, 'Scholarships');
    }
  }, [selectedScholarship, isFav, isGuest, addFavorite, removeFavorite]);

  // Toggle favorite from card (not modal)
  const handleCardToggleFavorite = useCallback(
    async (scholarshipId: string) => {
      if (isGuest) {
        Alert.alert(
          'Sign In Required',
          'Please sign in to save scholarships to your favorites.',
          [{text: 'OK'}],
        );
        return;
      }

      try {
        if (isFavorite(scholarshipId, 'scholarship')) {
          await removeFavorite(scholarshipId, 'scholarship');
          Haptics.light();
        } else {
          await addFavorite(scholarshipId, 'scholarship');
          Haptics.success();
        }
      } catch (error) {
        logger.error('Error toggling favorite', error, 'Scholarships');
      }
    },
    [isGuest, isFavorite, addFavorite, removeFavorite],
  );

  // Track search queries for analytics
  useEffect(() => {
    if (debouncedSearchQuery.trim().length >= 2) {
      analytics.trackSearch(debouncedSearchQuery.trim(), undefined, 'scholarships');
    }
  }, [debouncedSearchQuery]);

  // Pull-to-refresh handler - FORCE REFRESH to bypass cache
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.refreshThreshold();
    try {
      const data = await hybridDataService.getScholarships(true);
      if (data.length > 0) {
        setScholarships(data as ScholarshipData[]);
      }
      Haptics.success();
    } catch (error) {
      logger.warn('Refresh failed, keeping existing data', error, 'Scholarships');
      Haptics.error();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const universityOptions = useMemo(() => createUniversityOptions(), []);

  // Get user initials for profile button
  const getUserInitials = useCallback(() => {
    if (user?.fullName) {
      const names = user.fullName.split(' ');
      return names
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  }, [user]);

  const filteredScholarships = useMemo(() => {
    return scholarships.filter((scholarship: ScholarshipData) => {
      const query = debouncedSearchQuery.toLowerCase().trim();
      let matchesSearch: boolean;
      if (!query) {
        matchesSearch = true;
      } else {
        const nameLower = scholarship.name.toLowerCase();
        const providerLower = scholarship.provider.toLowerCase();
        const descLower = (scholarship.description || '').toLowerCase();

        const directMatch =
          nameLower.includes(query) ||
          providerLower.includes(query) ||
          descLower.includes(query);

        const nameWords = nameLower.split(/[\s,\-()]+/);
        const prefixMatch = nameWords.some(word => word.startsWith(query));

        const providerWords = providerLower.split(/[\s,\-()]+/);
        const providerPrefixMatch = providerWords.some(word => word.startsWith(query));

        const abbreviation = nameWords
          .filter(w => w.length > 0)
          .map(w => w[0])
          .join('');
        const abbrMatch = abbreviation.startsWith(query);

        matchesSearch = directMatch || prefixMatch || providerPrefixMatch || abbrMatch;
      }

      const matchesType = selectedType === 'all' || scholarship.type === selectedType;

      let matchesUni = true;
      if (selectedUniversity) {
        const isBroad = hasBroadAvailability(scholarship);
        const specificUnis = getScholarshipSpecificUniversities(scholarship);
        matchesUni = isBroad || specificUnis.includes(selectedUniversity);
      }

      return matchesSearch && matchesType && matchesUni;
    });
  }, [scholarships, debouncedSearchQuery, selectedType, selectedUniversity]);

  const openLink = useCallback((url?: string) => {
    if (url) {
      Linking.openURL(url);
    }
  }, []);

  const handleOpenScholarship = useCallback((item: ScholarshipData) => {
    analytics.trackScholarshipView(item.name, item.name);
    setSelectedScholarship(item);
    setShowDetail(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setShowDetail(false);
  }, []);

  const navigateToProfile = useCallback(() => {
    navigation.navigate('Profile');
  }, [navigation]);

  return {
    // Context
    colors,
    isDark,
    user,
    // State
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    selectedUniversity,
    setSelectedUniversity,
    selectedScholarship,
    showDetail,
    refreshing,
    isFav,
    showFilters,
    setShowFilters,
    filteredScholarships,
    universityOptions,
    // Handlers
    handleToggleFavorite,
    handleCardToggleFavorite,
    handleRefresh,
    handleOpenScholarship,
    handleCloseDetail,
    openLink,
    getUserInitials,
    navigateToProfile,
    isFavorite,
  };
};

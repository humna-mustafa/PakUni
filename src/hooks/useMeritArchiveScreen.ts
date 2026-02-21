/**
 * useMeritArchiveScreen - All state and data logic for Merit Archive screen.
 */

import {useState, useRef, useEffect, useCallback, useMemo} from 'react';
import {Animated} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../contexts/ThemeContext';
import {logger} from '../utils/logger';
import {Haptics} from '../utils/haptics';
import {
  fetchMeritLists,
  getMeritInsights,
  buildMeritTree,
  AVAILABLE_YEARS,
} from '../services/meritLists';
import {MERIT_RECORDS, OPEN_MERIT_RECORDS, QUOTA_MERIT_RECORDS, QUOTA_TYPE_LABELS, MeritRecord} from '../data/meritArchive';

export const useMeritArchiveScreen = () => {
  const navigation = useNavigation();
  const {colors, isDark} = useTheme();

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeritType, setSelectedMeritType] = useState<'all' | 'open' | 'quota'>('all');
  const [selectedQuotaType, setSelectedQuotaType] = useState<string>('');  // '', 'women', 'fata_pata', etc.
  const [meritRecords, setMeritRecords] = useState<MeritRecord[]>(MERIT_RECORDS);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const headerAnim = useRef(new Animated.Value(0)).current;

  // Load merit data
  const loadMeritData = useCallback(async () => {
    try {
      const {data} = await fetchMeritLists();
      if (data && data.length > 0) {
        setMeritRecords(data);
      }
    } catch (err) {
      logger.debug('Using local merit data', err, 'MeritArchive');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMeritData();
  }, [loadMeritData]);

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.refreshThreshold();
    await loadMeritData();
    setRefreshing(false);
    Haptics.success();
  }, [loadMeritData]);

  // Build the merit tree with filters
  const meritTree = useMemo(() => {
    // Apply merit type filter first
    let filteredRecords = meritRecords;
    if (selectedMeritType === 'open') {
      filteredRecords = filteredRecords.filter(r => !r.quotaType && r.meritType !== 'reserved');
    } else if (selectedMeritType === 'quota') {
      filteredRecords = filteredRecords.filter(r => !!r.quotaType || r.meritType === 'reserved');
      if (selectedQuotaType) {
        filteredRecords = filteredRecords.filter(r => r.quotaType === selectedQuotaType);
      }
    }

    let tree = buildMeritTree(
      filteredRecords,
      selectedYear || undefined,
      selectedCategory !== 'all' ? selectedCategory : undefined,
    );

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      tree = tree.filter(
        uni =>
          uni.universityName.toLowerCase().includes(query) ||
          uni.shortName.toLowerCase().includes(query) ||
          uni.campuses.some(
            c =>
              c.campus.toLowerCase().includes(query) ||
              c.programs.some(p => p.programName.toLowerCase().includes(query)),
          ),
      );
    }

    return tree;
  }, [meritRecords, selectedYear, selectedCategory, searchQuery]);

  // Insights for selected year
  const insights = useMemo(() => {
    return getMeritInsights(meritRecords, selectedYear || AVAILABLE_YEARS[0]);
  }, [meritRecords, selectedYear]);

  // Stats
  const uniqueUniversities = useMemo(() => {
    return new Set(meritRecords.map(r => r.universityId)).size;
  }, [meritRecords]);

  return {
    navigation,
    colors,
    isDark,
    selectedYear,
    setSelectedYear,
    selectedCategory,
    setSelectedCategory,
    selectedMeritType,
    setSelectedMeritType,
    selectedQuotaType,
    setSelectedQuotaType,
    QUOTA_TYPE_LABELS,
    searchQuery,
    setSearchQuery,
    meritRecords,
    isLoading,
    refreshing,
    headerAnim,
    handleRefresh,
    meritTree,
    insights,
    uniqueUniversities,
  };
};

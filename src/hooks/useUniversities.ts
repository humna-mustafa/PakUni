/**
 * useUniversities Hook
 * Manages university data with filtering, sorting, and search
 * Now uses Hybrid Data Service (Turso + bundled fallback)
 */

import {useState, useMemo, useCallback, useEffect} from 'react';
import {UniversityData} from '../data/universities';
import {PROVINCES} from '../data';
import {hybridDataService} from '../services';
import {logger} from '../utils/logger';

export type SortOption = 'name' | 'ranking' | 'province';
export type UniversityType = 'all' | 'public' | 'private';

interface UseUniversitiesOptions {
  initialSearch?: string;
  initialProvince?: string;
  initialType?: UniversityType;
  initialSort?: SortOption;
}

interface ProvinceOption {
  value: string;
  label: string;
}

interface UseUniversitiesReturn {
  universities: UniversityData[];
  filteredUniversities: UniversityData[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedProvince: string;
  setSelectedProvince: (province: string) => void;
  selectedType: UniversityType;
  setSelectedType: (type: UniversityType) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  isLoading: boolean;
  totalCount: number;
  filteredCount: number;
  resetFilters: () => void;
  getUniversityByName: (name: string) => UniversityData | undefined;
  provinces: ProvinceOption[];
  dataSource: 'turso' | 'bundled';
  refreshData: () => Promise<void>;
}

export const useUniversities = (
  options: UseUniversitiesOptions = {},
): UseUniversitiesReturn => {
  const {
    initialSearch = '',
    initialProvince = 'all',
    initialType = 'all',
    initialSort = 'ranking',
  } = options;

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedProvince, setSelectedProvince] = useState(initialProvince);
  const [selectedType, setSelectedType] = useState<UniversityType>(initialType);
  const [sortBy, setSortBy] = useState<SortOption>(initialSort);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'turso' | 'bundled'>('bundled');
  
  // Start with bundled data for instant display
  const [universities, setUniversities] = useState<UniversityData[]>(() => 
    hybridDataService.getUniversitiesSync() as unknown as UniversityData[]
  );

  const provinces = useMemo(() => PROVINCES, []);

  // Fetch fresh data from Turso on mount
  useEffect(() => {
    let mounted = true;
    
    async function fetchData() {
      try {
        const freshData = await hybridDataService.getUniversities();
        if (mounted) {
          setUniversities(freshData as unknown as UniversityData[]);
          const status = await hybridDataService.getSyncStatus();
          setDataSource(status.dataSource as 'turso' | 'bundled');
        }
      } catch (error) {
        logger.debug('Using bundled data', null, 'useUniversities');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }
    
    fetchData();
    return () => { mounted = false; };
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      await hybridDataService.refreshTursoData();
      const freshData = await hybridDataService.getUniversities();
      setUniversities(freshData as unknown as UniversityData[]);
      setDataSource('turso');
    } catch (error) {
      logger.debug('Refresh failed, using cached data', null, 'useUniversities');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filteredUniversities = useMemo(() => {
    let result = [...universities];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        uni =>
          uni.name.toLowerCase().includes(query) ||
          uni.short_name.toLowerCase().includes(query) ||
          uni.city.toLowerCase().includes(query) ||
          uni.province.toLowerCase().includes(query),
      );
    }

    // Apply province filter
    if (selectedProvince && selectedProvince !== 'all') {
      result = result.filter(uni => uni.province === selectedProvince);
    }

    // Apply type filter
    if (selectedType !== 'all') {
      result = result.filter(uni => uni.type.toLowerCase() === selectedType);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'ranking':
          const rankA = a.ranking_national || 999;
          const rankB = b.ranking_national || 999;
          return rankA - rankB;
        case 'province':
          return a.province.localeCompare(b.province);
        default:
          return 0;
      }
    });

    return result;
  }, [universities, searchQuery, selectedProvince, selectedType, sortBy]);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedProvince('all');
    setSelectedType('all');
    setSortBy('ranking');
  }, []);

  const getUniversityByName = useCallback(
    (name: string): UniversityData | undefined => {
      return universities.find(uni => uni.name === name || uni.short_name === name);
    },
    [universities],
  );

  return {
    universities,
    filteredUniversities,
    searchQuery,
    setSearchQuery,
    selectedProvince,
    setSelectedProvince,
    selectedType,
    setSelectedType,
    sortBy,
    setSortBy,
    isLoading,
    totalCount: universities.length,
    filteredCount: filteredUniversities.length,
    resetFilters,
    getUniversityByName,
    provinces,
    dataSource,
    refreshData,
  };
};

export default useUniversities;

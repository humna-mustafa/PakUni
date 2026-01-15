/**
 * useUniversities Hook
 * Manages university data with filtering, sorting, and search
 */

import {useState, useMemo, useCallback} from 'react';
import {UNIVERSITIES, UniversityData} from '../data/universities';
import {PROVINCES} from '../data';

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
  const [isLoading] = useState(false);

  const provinces = useMemo(() => PROVINCES, []);

  const filteredUniversities = useMemo(() => {
    let result = [...UNIVERSITIES];

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
  }, [searchQuery, selectedProvince, selectedType, sortBy]);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedProvince('all');
    setSelectedType('all');
    setSortBy('ranking');
  }, []);

  const getUniversityByName = useCallback(
    (name: string): UniversityData | undefined => {
      return UNIVERSITIES.find(uni => uni.name === name || uni.short_name === name);
    },
    [],
  );

  return {
    universities: UNIVERSITIES,
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
    totalCount: UNIVERSITIES.length,
    filteredCount: filteredUniversities.length,
    resetFilters,
    getUniversityByName,
    provinces,
  };
};

export default useUniversities;

/**
 * useScholarships Hook
 * Manages scholarship data with filtering and search
 */

import {useState, useMemo, useCallback} from 'react';
import {SCHOLARSHIPS, ScholarshipData} from '../data/scholarships';

export type {ScholarshipData} from '../data/scholarships';

export type ScholarshipType = 'all' | 'need_based' | 'merit_based' | 'government' | 'private' | 'hafiz_e_quran' | 'sports' | 'disabled';

interface UseScholarshipsOptions {
  initialSearch?: string;
  initialType?: ScholarshipType;
}

interface UseScholarshipsReturn {
  scholarships: ScholarshipData[];
  filteredScholarships: ScholarshipData[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedType: ScholarshipType;
  setSelectedType: (type: ScholarshipType) => void;
  isLoading: boolean;
  totalCount: number;
  filteredCount: number;
  resetFilters: () => void;
  getScholarshipById: (id: string) => ScholarshipData | undefined;
  types: {value: ScholarshipType; label: string}[];
}

export const useScholarships = (
  options: UseScholarshipsOptions = {},
): UseScholarshipsReturn => {
  const {initialSearch = '', initialType = 'all'} = options;

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedType, setSelectedType] = useState<ScholarshipType>(initialType);
  const [isLoading] = useState(false);

  const types: {value: ScholarshipType; label: string}[] = [
    {value: 'all', label: 'All Types'},
    {value: 'need_based', label: 'Need-Based'},
    {value: 'merit_based', label: 'Merit-Based'},
    {value: 'government', label: 'Government'},
    {value: 'private', label: 'Private'},
    {value: 'hafiz_e_quran', label: 'Hafiz-e-Quran'},
    {value: 'sports', label: 'Sports'},
    {value: 'disabled', label: 'Disabled Persons'},
  ];

  const filteredScholarships = useMemo(() => {
    let result = [...SCHOLARSHIPS].filter(s => s.is_active);

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        scholarship =>
          scholarship.name.toLowerCase().includes(query) ||
          scholarship.provider.toLowerCase().includes(query) ||
          scholarship.description.toLowerCase().includes(query),
      );
    }

    // Apply type filter
    if (selectedType !== 'all') {
      result = result.filter(scholarship => scholarship.type === selectedType);
    }

    return result;
  }, [searchQuery, selectedType]);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedType('all');
  }, []);

  const getScholarshipById = useCallback(
    (id: string): ScholarshipData | undefined => {
      return SCHOLARSHIPS.find(s => s.id === id);
    },
    [],
  );

  return {
    scholarships: SCHOLARSHIPS,
    filteredScholarships,
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    isLoading,
    totalCount: SCHOLARSHIPS.length,
    filteredCount: filteredScholarships.length,
    resetFilters,
    getScholarshipById,
    types,
  };
};

export default useScholarships;

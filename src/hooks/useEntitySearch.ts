/**
 * useEntitySearch - Handles entity search logic with debounce for the contribution wizard
 */

import { useState, useEffect, useCallback } from 'react';
import { hybridDataService } from '../services/hybridData';
import { CategoryOption, EntityData } from '../types/contribute';

/** Check if text matches query (case-insensitive, partial match) */
const matchesQuery = (text: string | null | undefined, query: string): boolean => {
  if (!text) return false;
  return text.toLowerCase().includes(query);
};

/** Check if any item in array matches query */
const arrayMatchesQuery = (arr: string[] | null | undefined, query: string): boolean => {
  if (!arr || !Array.isArray(arr)) return false;
  return arr.some(item => item && item.toLowerCase().includes(query));
};

export function useEntitySearch(category: CategoryOption | null) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<EntityData[]>([]);
  const [loading, setLoading] = useState(false);
  const [popularItems, setPopularItems] = useState<EntityData[]>([]);

  // Load popular items based on selected category
  const loadPopularItems = useCallback(async () => {
    try {
      let items: EntityData[] = [];

      if (category?.id === 'scholarship_info') {
        const scholarships = await hybridDataService.getScholarships();
        items = scholarships.slice(0, 6).map(s => ({
          id: s.id || s.name.toLowerCase().replace(/\s+/g, '_'),
          name: s.name,
          type: (s as any).type || 'Scholarship',
          location: s.provider || '',
          verified: true,
        }));
      } else if (category?.id === 'entry_test_update') {
        const entryTests = await hybridDataService.getEntryTests();
        items = entryTests.slice(0, 6).map(t => ({
          id: t.id || t.name.toLowerCase().replace(/\s+/g, '_'),
          name: t.name,
          type: 'Entry Test',
          location: t.conducting_body || '',
          verified: true,
        }));
      } else {
        const universities = await hybridDataService.getUniversities();
        const popularShortNames = ['NUST', 'LUMS', 'QAU', 'PU', 'UET', 'GIKI', 'FAST', 'IBA', 'NED', 'COMSATS', 'IIU', 'GCU'];
        const popular = universities.filter(u => popularShortNames.includes(u.short_name));
        const others = universities.filter(u => !popularShortNames.includes(u.short_name)).slice(0, 6 - popular.length);
        items = [...popular.slice(0, 6), ...others].slice(0, 6).map(u => ({
          id: u.short_name || u.name.toLowerCase().replace(/\s+/g, '_'),
          name: u.name,
          type: u.type || 'University',
          location: (u as any).city || '',
          verified: true,
        }));
      }

      setPopularItems(items);
    } catch (error) {
      console.error('Error loading popular items:', error);
    }
  }, [category]);

  // Load popular items on mount
  useEffect(() => {
    loadPopularItems();
  }, [loadPopularItems]);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 1) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const query = searchQuery.toLowerCase().trim();
        let matched: EntityData[] = [];

        if (category?.id === 'scholarship_info') {
          const scholarships = await hybridDataService.getScholarships();
          matched = scholarships
            .filter(s => {
              const sData = s as any;
              return (
                matchesQuery(s.name, query) ||
                matchesQuery(s.provider, query) ||
                matchesQuery(s.id, query) ||
                matchesQuery(sData.description, query) ||
                matchesQuery(sData.type, query) ||
                matchesQuery(sData.coverageLabel, query) ||
                arrayMatchesQuery(sData.eligibility, query) ||
                arrayMatchesQuery(sData.targetAudience, query) ||
                arrayMatchesQuery(sData.provinces, query) ||
                arrayMatchesQuery(sData.otherBenefits, query) ||
                (s.id && s.id.split('-').some((part: string) => part.toLowerCase().includes(query))) ||
                (s.name && s.name.split(' ').some(word => word.toLowerCase() === query))
              );
            })
            .slice(0, 12)
            .map(s => ({
              id: s.id || s.name.toLowerCase().replace(/\s+/g, '_'),
              name: s.name,
              type: (s as any).type || 'Scholarship',
              location: s.provider || '',
              verified: true,
            }));
        } else if (category?.id === 'entry_test_update') {
          const entryTests = await hybridDataService.getEntryTests();
          matched = entryTests
            .filter(t => {
              const tData = t as any;
              return (
                matchesQuery(t.name, query) ||
                matchesQuery(t.conducting_body, query) ||
                matchesQuery(t.full_name, query) ||
                matchesQuery(t.id, query) ||
                matchesQuery(tData.description, query) ||
                arrayMatchesQuery(tData.applicable_for, query) ||
                arrayMatchesQuery(tData.provinces, query) ||
                (t.id && t.id.split('-').some((part: string) => part.toLowerCase().includes(query))) ||
                (t.name && t.name.toLowerCase() === query) ||
                (tData.applicable_for && tData.applicable_for.some((prog: string) =>
                  prog.toLowerCase().includes(query) || query.includes(prog.toLowerCase())
                ))
              );
            })
            .slice(0, 12)
            .map(t => ({
              id: t.id || t.name.toLowerCase().replace(/\s+/g, '_'),
              name: `${t.name}${t.full_name ? ` (${t.full_name})` : ''}`,
              type: 'Entry Test',
              location: t.conducting_body || '',
              verified: true,
            }));
        } else {
          const universities = await hybridDataService.getUniversities();
          matched = universities
            .filter(u => {
              const uData = u as any;
              return (
                matchesQuery(u.name, query) ||
                matchesQuery(u.short_name, query) ||
                matchesQuery(uData.city, query) ||
                matchesQuery(uData.province, query) ||
                matchesQuery(uData.description, query) ||
                matchesQuery(uData.type, query) ||
                matchesQuery(uData.address, query) ||
                matchesQuery(uData.ranking_hec, query) ||
                arrayMatchesQuery(uData.campuses, query) ||
                (u.short_name && u.short_name.toLowerCase() === query) ||
                (u.name && u.name.split(' ').some(word =>
                  word.toLowerCase().startsWith(query) || word.toLowerCase() === query
                )) ||
                (String(u.id).includes(query))
              );
            })
            .slice(0, 12)
            .map(u => ({
              id: u.short_name || u.name.toLowerCase().replace(/\s+/g, '_'),
              name: u.name,
              type: u.type || 'University',
              location: (u as any).city || (u as any).location || '',
              verified: true,
            }));
        }

        setSuggestions(matched);
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, category]);

  return {
    searchQuery,
    setSearchQuery,
    suggestions,
    loading,
    popularItems,
  };
}

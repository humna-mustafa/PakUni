/**
 * Component Migration Guide: Using Hybrid Data Service
 * 
 * This file shows how to migrate existing components from 
 * bundled data to the hybrid Turso + Supabase architecture.
 */

// =================================================================
// BEFORE (Old Way - Direct Data Import)
// =================================================================

// Old approach - imports bundled data directly
// import { universities } from '../data/universities';
// import { entryTests } from '../data/entryTests';
// 
// function UniversitiesScreen() {
//   // This uses static bundled data, never updates
//   const allUniversities = universities;
//   
//   return universities.map(u => <UniversityCard key={u.id} {...u} />);
// }


// =================================================================
// AFTER (New Way - Hybrid Data Service)
// =================================================================

import React, {useEffect, useState} from 'react';
import {View, Text, FlatList} from 'react-native';
import {
  hybridDataService,
  type TursoUniversity,
} from '../services';

// Option 1: Simple async loading with useState
export function UniversitiesScreenSimple() {
  const [universities, setUniversities] = useState<TursoUniversity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // First, show bundled data instantly (sync)
      const bundled = hybridDataService.getUniversitiesSync();
      setUniversities(bundled as any);
      setLoading(false);

      // Then try to get fresh data from Turso
      try {
        const fresh = await hybridDataService.getUniversities();
        setUniversities(fresh as any);
      } catch (error) {
        // Already showing bundled data, so user isn't affected
        console.log('Using bundled data');
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <FlatList
      data={universities}
      keyExtractor={item => item.id}
      renderItem={({item}) => (
        <View>
          <Text>{item.name}</Text>
          <Text>{item.city}</Text>
        </View>
      )}
    />
  );
}


// Option 2: Custom hook for reusability
export function useHybridData<T>(
  syncFn: () => T[],
  asyncFn: () => Promise<T[]>
) {
  const [data, setData] = useState<T[]>(() => syncFn());
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'bundled' | 'turso'>('bundled');

  useEffect(() => {
    let mounted = true;

    async function fetchFresh() {
      try {
        const fresh = await asyncFn();
        if (mounted) {
          setData(fresh);
          setDataSource('turso');
        }
      } catch (error) {
        // Keep using bundled data
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchFresh();

    return () => {
      mounted = false;
    };
  }, []);

  return {data, loading, dataSource};
}

// Usage:
// const { data: universities, loading, dataSource } = useHybridData(
//   () => hybridDataService.getUniversitiesSync(),
//   () => hybridDataService.getUniversities()
// );


// Option 3: Search with filters
export function UniversitySearch() {
  const [query, setQuery] = useState('');
  const [province, setProvince] = useState('');
  const [results, setResults] = useState<TursoUniversity[]>([]);

  const handleSearch = async () => {
    const universities = await hybridDataService.searchUniversities(query, {
      province: province || undefined,
    });
    setResults(universities as TursoUniversity[]);
  };

  // ... rest of component
  return null;
}


// =================================================================
// Migration Checklist for Each Screen
// =================================================================
/*

1. Import hybridDataService instead of direct data files:
   - Replace: import { universities } from '../data/universities';
   - With:    import { hybridDataService } from '../services';

2. Add useState for data:
   const [universities, setUniversities] = useState<TursoUniversity[]>([]);

3. Use sync method for instant display:
   const bundled = hybridDataService.getUniversitiesSync();
   setUniversities(bundled);

4. Fetch fresh data async:
   const fresh = await hybridDataService.getUniversities();
   setUniversities(fresh);

5. Handle loading states gracefully (show bundled immediately)

Screens to Update:
- [ ] UniversitiesScreen (src/screens/universities/)
- [ ] EntryTestsScreen (src/screens/entryTests/)
- [ ] ScholarshipsScreen (src/screens/scholarships/)
- [ ] DeadlinesScreen (src/screens/deadlines/)
- [ ] CareersScreen (src/screens/careers/)
- [ ] MeritCalculator (src/screens/meritCalculator/)

*/

export default {
  useHybridData,
};

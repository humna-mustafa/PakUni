/**
 * Turso Database Service
 * Handles static reference data that doesn't require user relationships
 * 
 * Data stored in Turso (500M free reads):
 * - Universities list
 * - Entry test dates
 * - Scholarships
 * - Programs
 * - Careers
 * - Merit formulas
 * - Deadlines/Admission dates
 * 
 * This reduces Supabase load significantly as these are read-heavy,
 * user-independent data that can scale nationwide.
 */

import {createClient, Client, ResultSet} from '@libsql/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import {logger} from '../utils/logger';

// Turso configuration from environment
const TURSO_DATABASE_URL = Config.TURSO_DATABASE_URL || '';
const TURSO_AUTH_TOKEN = Config.TURSO_AUTH_TOKEN || '';

// Cache keys
const CACHE_KEYS = {
  UNIVERSITIES: '@turso_universities',
  ENTRY_TESTS: '@turso_entry_tests',
  SCHOLARSHIPS: '@turso_scholarships',
  PROGRAMS: '@turso_programs',
  CAREERS: '@turso_careers',
  DEADLINES: '@turso_deadlines',
  MERIT_FORMULAS: '@turso_merit_formulas',
  MERIT_ARCHIVE: '@turso_merit_archive',
  LAST_SYNC: '@turso_last_sync',
};

// Cache expiry (24 hours for static data - can be longer)
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000;

// Turso client instance
let tursoClient: Client | null = null;

/**
 * Initialize Turso client
 */
export const initTurso = (): Client | null => {
  if (tursoClient) {
    return tursoClient;
  }

  if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
    logger.warn(
      'Turso configuration missing. Static data will use bundled fallbacks.',
      undefined,
      'Turso'
    );
    return null;
  }

  try {
    tursoClient = createClient({
      url: TURSO_DATABASE_URL,
      authToken: TURSO_AUTH_TOKEN,
    });
    logger.info('Turso client initialized successfully', undefined, 'Turso');
    return tursoClient;
  } catch (error) {
    logger.error('Failed to initialize Turso client', error, 'Turso');
    return null;
  }
};

/**
 * Get Turso client instance
 */
export const getTursoClient = (): Client | null => {
  return tursoClient || initTurso();
};

/**
 * Check if Turso is available
 */
export const isTursoAvailable = (): boolean => {
  return !!getTursoClient();
};

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface TursoUniversity {
  id: string;
  name: string;
  short_name: string;
  type: 'public' | 'private' | 'semi_government';
  province: string;
  city: string;
  address?: string;
  website?: string;
  email?: string;
  phone?: string;
  established_year?: number;
  ranking_hec?: string;
  ranking_national?: number;
  is_hec_recognized: boolean;
  logo_url?: string;
  description?: string;
  admission_url?: string;
  campuses?: string[];
  status_notes?: string;
  application_steps?: string[];
  updated_at: string;
}

export interface TursoEntryTest {
  id: string;
  name: string;
  full_name: string;
  conducting_body: string;
  description: string;
  applicable_for: string[];
  registration_start?: string;
  registration_deadline: string;
  test_date: string;
  result_date?: string;
  website?: string;
  fee: number;
  eligibility: string[];
  test_format?: {
    total_marks: number;
    total_questions: number;
    duration_minutes: number;
    negative_marking: boolean;
    sections: Array<{name: string; questions: number; marks: number}>;
  };
  tips?: string[];
  provinces?: string[];
  status_notes?: string;
  brand_colors?: {primary: string; secondary: string; gradient: string[]};
  updated_at: string;
}

export interface TursoScholarship {
  id: string;
  name: string;
  provider: string;
  type: string;
  coverage_percentage: number;
  monthly_stipend?: number;
  description: string;
  eligibility: string[];
  deadline?: string;
  website?: string;
  how_to_apply?: string[];
  applicable_universities?: string[];
  updated_at: string;
}

export interface TursoDeadline {
  id: string;
  university_id: string;
  university_name: string;
  university_short_name: string;
  program_type: string;
  program_category: string;
  title: string;
  description: string;
  application_start_date: string;
  application_deadline: string;
  entry_test_date?: string;
  result_date?: string;
  class_start_date?: string;
  fee?: number;
  link?: string;
  status: string;
  updated_at: string;
}

export interface TursoProgram {
  id: string;
  name: string;
  short_name: string;
  field: string;
  duration_years: number;
  degree_type: string;
  description: string;
  eligibility: string[];
  career_paths?: string[];
  entry_tests?: string[];
  updated_at: string;
}

export interface TursoCareer {
  id: string;
  name: string;
  field: string;
  description: string;
  salary_range_min: number;
  salary_range_max: number;
  demand_level: string;
  growth_potential: string;
  required_education: string[];
  skills_required: string[];
  job_titles: string[];
  updated_at: string;
}

export interface TursoMeritFormula {
  id: string;
  university_id: string;
  university_name: string;
  program_category: string;
  matric_weight: number;
  inter_weight: number;
  entry_test_weight: number;
  hafiz_bonus?: number;
  notes?: string;
  updated_at: string;
}

export interface TursoMeritArchive {
  id: string;
  university_id: string;
  university_name: string;
  program_name: string;
  year: number;
  round: number;
  merit_percentage: number;
  closing_merit?: number;
  seats_available?: number;
  notes?: string;
  updated_at: string;
}

// =============================================================================
// DATA FETCHING WITH CACHE
// =============================================================================

/**
 * Generic cached fetch from Turso
 */
async function fetchWithCache<T>(
  cacheKey: string,
  query: string,
  transformer: (rows: any[]) => T[]
): Promise<T[]> {
  // Try cache first
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    const lastSync = await AsyncStorage.getItem(CACHE_KEYS.LAST_SYNC);
    
    if (cached && lastSync) {
      const lastSyncTime = parseInt(lastSync, 10);
      if (Date.now() - lastSyncTime < CACHE_EXPIRY_MS) {
        logger.debug(`Using cached data for ${cacheKey}`, undefined, 'Turso');
        return JSON.parse(cached);
      }
    }
  } catch (error) {
    logger.warn(`Cache read error for ${cacheKey}`, error, 'Turso');
  }

  // Fetch from Turso
  const client = getTursoClient();
  if (!client) {
    logger.warn('Turso not available, returning empty array', undefined, 'Turso');
    return [];
  }

  try {
    const result: ResultSet = await client.execute(query);
    const data = transformer(result.rows as any[]);
    
    // Update cache
    await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
    await AsyncStorage.setItem(CACHE_KEYS.LAST_SYNC, Date.now().toString());
    
    logger.info(`Fetched ${data.length} items for ${cacheKey}`, undefined, 'Turso');
    return data;
  } catch (error) {
    logger.error(`Turso fetch error for ${cacheKey}`, error, 'Turso');
    
    // Return cached data even if expired
    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Ignore
    }
    
    return [];
  }
}

/**
 * Fetch universities from Turso
 */
export async function fetchUniversities(): Promise<TursoUniversity[]> {
  return fetchWithCache<TursoUniversity>(
    CACHE_KEYS.UNIVERSITIES,
    'SELECT * FROM universities ORDER BY ranking_national ASC NULLS LAST, name ASC',
    (rows) => rows.map(row => ({
      id: row.id,
      name: row.name,
      short_name: row.short_name,
      type: row.type,
      province: row.province,
      city: row.city,
      address: row.address,
      website: row.website,
      email: row.email,
      phone: row.phone,
      established_year: row.established_year,
      ranking_hec: row.ranking_hec,
      ranking_national: row.ranking_national,
      is_hec_recognized: Boolean(row.is_hec_recognized),
      logo_url: row.logo_url,
      description: row.description,
      admission_url: row.admission_url,
      campuses: row.campuses ? JSON.parse(row.campuses) : [],
      status_notes: row.status_notes,
      application_steps: row.application_steps ? JSON.parse(row.application_steps) : [],
      updated_at: row.updated_at,
    }))
  );
}

/**
 * Fetch entry tests from Turso
 */
export async function fetchEntryTests(): Promise<TursoEntryTest[]> {
  return fetchWithCache<TursoEntryTest>(
    CACHE_KEYS.ENTRY_TESTS,
    'SELECT * FROM entry_tests ORDER BY test_date ASC',
    (rows) => rows.map(row => ({
      id: row.id,
      name: row.name,
      full_name: row.full_name,
      conducting_body: row.conducting_body,
      description: row.description,
      applicable_for: row.applicable_for ? JSON.parse(row.applicable_for) : [],
      registration_start: row.registration_start,
      registration_deadline: row.registration_deadline,
      test_date: row.test_date,
      result_date: row.result_date,
      website: row.website,
      fee: row.fee,
      eligibility: row.eligibility ? JSON.parse(row.eligibility) : [],
      test_format: row.test_format ? JSON.parse(row.test_format) : undefined,
      tips: row.tips ? JSON.parse(row.tips) : [],
      provinces: row.provinces ? JSON.parse(row.provinces) : [],
      status_notes: row.status_notes,
      brand_colors: row.brand_colors ? JSON.parse(row.brand_colors) : undefined,
      updated_at: row.updated_at,
    }))
  );
}

/**
 * Fetch scholarships from Turso
 */
export async function fetchScholarships(): Promise<TursoScholarship[]> {
  return fetchWithCache<TursoScholarship>(
    CACHE_KEYS.SCHOLARSHIPS,
    'SELECT * FROM scholarships ORDER BY coverage_percentage DESC, name ASC',
    (rows) => rows.map(row => ({
      id: row.id,
      name: row.name,
      provider: row.provider,
      type: row.type,
      coverage_percentage: row.coverage_percentage,
      monthly_stipend: row.monthly_stipend,
      description: row.description,
      eligibility: row.eligibility ? JSON.parse(row.eligibility) : [],
      deadline: row.deadline,
      website: row.website,
      how_to_apply: row.how_to_apply ? JSON.parse(row.how_to_apply) : [],
      applicable_universities: row.applicable_universities ? JSON.parse(row.applicable_universities) : [],
      updated_at: row.updated_at,
    }))
  );
}

/**
 * Fetch deadlines from Turso
 */
export async function fetchDeadlines(): Promise<TursoDeadline[]> {
  return fetchWithCache<TursoDeadline>(
    CACHE_KEYS.DEADLINES,
    'SELECT * FROM deadlines WHERE application_deadline >= date("now") ORDER BY application_deadline ASC',
    (rows) => rows.map(row => ({
      id: row.id,
      university_id: row.university_id,
      university_name: row.university_name,
      university_short_name: row.university_short_name,
      program_type: row.program_type,
      program_category: row.program_category,
      title: row.title,
      description: row.description,
      application_start_date: row.application_start_date,
      application_deadline: row.application_deadline,
      entry_test_date: row.entry_test_date,
      result_date: row.result_date,
      class_start_date: row.class_start_date,
      fee: row.fee,
      link: row.link,
      status: row.status,
      updated_at: row.updated_at,
    }))
  );
}

/**
 * Fetch programs from Turso
 */
export async function fetchPrograms(): Promise<TursoProgram[]> {
  return fetchWithCache<TursoProgram>(
    CACHE_KEYS.PROGRAMS,
    'SELECT * FROM programs ORDER BY field ASC, name ASC',
    (rows) => rows.map(row => ({
      id: row.id,
      name: row.name,
      short_name: row.short_name,
      field: row.field,
      duration_years: row.duration_years,
      degree_type: row.degree_type,
      description: row.description,
      eligibility: row.eligibility ? JSON.parse(row.eligibility) : [],
      career_paths: row.career_paths ? JSON.parse(row.career_paths) : [],
      entry_tests: row.entry_tests ? JSON.parse(row.entry_tests) : [],
      updated_at: row.updated_at,
    }))
  );
}

/**
 * Fetch careers from Turso
 */
export async function fetchCareers(): Promise<TursoCareer[]> {
  return fetchWithCache<TursoCareer>(
    CACHE_KEYS.CAREERS,
    'SELECT * FROM careers ORDER BY demand_level DESC, name ASC',
    (rows) => rows.map(row => ({
      id: row.id,
      name: row.name,
      field: row.field,
      description: row.description,
      salary_range_min: row.salary_range_min,
      salary_range_max: row.salary_range_max,
      demand_level: row.demand_level,
      growth_potential: row.growth_potential,
      required_education: row.required_education ? JSON.parse(row.required_education) : [],
      skills_required: row.skills_required ? JSON.parse(row.skills_required) : [],
      job_titles: row.job_titles ? JSON.parse(row.job_titles) : [],
      updated_at: row.updated_at,
    }))
  );
}

/**
 * Fetch merit formulas from Turso
 */
export async function fetchMeritFormulas(): Promise<TursoMeritFormula[]> {
  return fetchWithCache<TursoMeritFormula>(
    CACHE_KEYS.MERIT_FORMULAS,
    'SELECT * FROM merit_formulas ORDER BY university_name ASC',
    (rows) => rows.map(row => ({
      id: row.id,
      university_id: row.university_id,
      university_name: row.university_name,
      program_category: row.program_category,
      matric_weight: row.matric_weight,
      inter_weight: row.inter_weight,
      entry_test_weight: row.entry_test_weight,
      hafiz_bonus: row.hafiz_bonus,
      notes: row.notes,
      updated_at: row.updated_at,
    }))
  );
}

/**
 * Fetch merit archive from Turso
 */
export async function fetchMeritArchive(): Promise<TursoMeritArchive[]> {
  return fetchWithCache<TursoMeritArchive>(
    CACHE_KEYS.MERIT_ARCHIVE,
    'SELECT * FROM merit_archive ORDER BY year DESC, university_name ASC',
    (rows) => rows.map(row => ({
      id: row.id,
      university_id: row.university_id,
      university_name: row.university_name,
      program_name: row.program_name,
      year: row.year,
      round: row.round,
      merit_percentage: row.merit_percentage,
      closing_merit: row.closing_merit,
      seats_available: row.seats_available,
      notes: row.notes,
      updated_at: row.updated_at,
    }))
  );
}

// =============================================================================
// SEARCH FUNCTIONS
// =============================================================================

/**
 * Search universities
 */
export async function searchUniversities(
  query: string,
  filters?: {
    type?: string;
    province?: string;
    city?: string;
  }
): Promise<TursoUniversity[]> {
  const universities = await fetchUniversities();
  const searchLower = query.toLowerCase();
  
  return universities.filter(uni => {
    // Text search
    const matchesQuery = !query || 
      uni.name.toLowerCase().includes(searchLower) ||
      uni.short_name.toLowerCase().includes(searchLower) ||
      uni.city.toLowerCase().includes(searchLower);
    
    // Filters
    const matchesType = !filters?.type || uni.type === filters.type;
    const matchesProvince = !filters?.province || uni.province === filters.province;
    const matchesCity = !filters?.city || uni.city.toLowerCase() === filters.city.toLowerCase();
    
    return matchesQuery && matchesType && matchesProvince && matchesCity;
  });
}

/**
 * Search scholarships
 */
export async function searchScholarships(
  query: string,
  filters?: {
    type?: string;
    minCoverage?: number;
  }
): Promise<TursoScholarship[]> {
  const scholarships = await fetchScholarships();
  const searchLower = query.toLowerCase();
  
  return scholarships.filter(sch => {
    const matchesQuery = !query ||
      sch.name.toLowerCase().includes(searchLower) ||
      sch.provider.toLowerCase().includes(searchLower);
    
    const matchesType = !filters?.type || sch.type === filters.type;
    const matchesCoverage = !filters?.minCoverage || sch.coverage_percentage >= filters.minCoverage;
    
    return matchesQuery && matchesType && matchesCoverage;
  });
}

// =============================================================================
// CACHE MANAGEMENT
// =============================================================================

/**
 * Force refresh all cached data
 */
export async function refreshAllData(): Promise<void> {
  logger.info('Refreshing all Turso cached data', undefined, 'Turso');
  
  // Clear cache timestamps to force refresh
  await AsyncStorage.removeItem(CACHE_KEYS.LAST_SYNC);
  
  // Fetch all data in parallel
  await Promise.all([
    fetchUniversities(),
    fetchEntryTests(),
    fetchScholarships(),
    fetchDeadlines(),
    fetchPrograms(),
    fetchCareers(),
    fetchMeritFormulas(),
    fetchMeritArchive(),
  ]);
  
  logger.info('All Turso data refreshed', undefined, 'Turso');
}

/**
 * Clear all cached data
 */
export async function clearCache(): Promise<void> {
  const keys = Object.values(CACHE_KEYS);
  await AsyncStorage.multiRemove(keys);
  logger.info('Turso cache cleared', undefined, 'Turso');
}

/**
 * Get last sync time
 */
export async function getLastSyncTime(): Promise<Date | null> {
  try {
    const lastSync = await AsyncStorage.getItem(CACHE_KEYS.LAST_SYNC);
    return lastSync ? new Date(parseInt(lastSync, 10)) : null;
  } catch {
    return null;
  }
}

/**
 * Check if data needs refresh
 */
export async function needsRefresh(): Promise<boolean> {
  const lastSync = await getLastSyncTime();
  if (!lastSync) return true;
  return Date.now() - lastSync.getTime() > CACHE_EXPIRY_MS;
}

// Initialize on module load
initTurso();

export default {
  initTurso,
  getTursoClient,
  isTursoAvailable,
  fetchUniversities,
  fetchEntryTests,
  fetchScholarships,
  fetchDeadlines,
  fetchPrograms,
  fetchCareers,
  fetchMeritFormulas,
  fetchMeritArchive,
  searchUniversities,
  searchScholarships,
  refreshAllData,
  clearCache,
  getLastSyncTime,
  needsRefresh,
};

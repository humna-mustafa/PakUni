/**
 * Hybrid Data Service
 * 
 * Architecture:
 * - TURSO (500M free reads): Static reference data
 *   • Universities, Entry Tests, Scholarships
 *   • Programs, Careers, Merit Data
 *   • Deadlines, Merit Formulas
 * 
 * - SUPABASE: User-centric data
 *   • User profiles, authentication
 *   • Favorites, calculations, goals
 *   • Announcements, admin content
 * 
 * Benefits:
 * - Supabase stays within free tier limits
 * - Turso handles read-heavy static data
 * - Easy admin management via Turso Studio
 * - Scales nationwide without cost increase
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {logger} from '../utils/logger';

// Turso imports
import * as turso from './turso';
import {
  TursoUniversity,
  TursoEntryTest,
  TursoScholarship,
  TursoDeadline,
  TursoProgram,
  TursoCareer,
  TursoMeritFormula,
  TursoMeritArchive,
  TursoJobMarketStats,
} from './turso';

// Supabase imports
import {supabase} from './supabase';
import {cache, CACHE_KEYS, CACHE_TTL} from './cache';

// Fallback to bundled data if Turso unavailable
import {UNIVERSITIES, UniversityData} from '../data/universities';
import {SCHOLARSHIPS, ScholarshipData} from '../data/scholarships';
import {ENTRY_TESTS_DATA} from '../data/entryTests';
import {CAREER_FIELDS, CAREER_PATHS} from '../data/careers';
import {MERIT_FORMULAS} from '../data/meritFormulas';
import {PROGRAMS} from '../data/programs';
import {ADMISSION_DEADLINES} from '../data/deadlines';
import {MERIT_RECORDS} from '../data/meritArchive';

// ============================================================================
// TYPES
// ============================================================================

export type DataSource = 'turso' | 'bundled' | 'supabase';

export interface DataSyncStatus {
  tursoConnected: boolean;
  lastTursoSync: Date | null;
  lastSupabaseSync: Date | null;
  dataSource: DataSource;
}

export interface AnnouncementData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'update' | 'promotion';
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  priority: number;
  action_url?: string;
  action_label?: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  type: 'university' | 'scholarship' | 'program';
  item_id: string;
  created_at: string;
}

export interface UserCalculation {
  id: string;
  user_id: string;
  education_system: string;
  matric_marks: number;
  inter_marks: number;
  entry_test_marks?: number;
  calculated_merit: number;
  created_at: string;
}

export interface UserGoal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  target_date?: string;
  progress: number;
  is_completed: boolean;
  created_at: string;
}

// ============================================================================
// HYBRID DATA SERVICE CLASS
// ============================================================================

class HybridDataService {
  private dataSource: DataSource = 'bundled';
  private tursoInitialized = false;

  constructor() {
    this.initializeDataSource();
  }

  /**
   * Initialize data source - try Turso first, fallback to bundled
   */
  private async initializeDataSource(): Promise<void> {
    try {
      if (turso.isTursoAvailable()) {
        // Test Turso connection
        const universities = await turso.fetchUniversities();
        if (universities.length > 0) {
          this.dataSource = 'turso';
          this.tursoInitialized = true;
          logger.info('Using Turso for static data', undefined, 'HybridData');
        } else {
          this.dataSource = 'bundled';
          logger.info('Turso empty, using bundled data', undefined, 'HybridData');
        }
      } else {
        this.dataSource = 'bundled';
        logger.info('Turso unavailable, using bundled data', undefined, 'HybridData');
      }
    } catch (error) {
      this.dataSource = 'bundled';
      logger.warn('Turso initialization failed, using bundled data', error, 'HybridData');
    }
  }

  /**
   * Get current data source
   */
  getDataSource(): DataSource {
    return this.dataSource;
  }

  // ===========================================================================
  // UNIVERSITIES (Turso → Bundled fallback)
  // ===========================================================================

  /**
   * Get all universities
   * @param forceRefresh - Bypass cache for pull-to-refresh (ensures fresh data)
   */
  async getUniversities(forceRefresh: boolean = false): Promise<(TursoUniversity | UniversityData)[]> {
    if (this.dataSource === 'turso') {
      try {
        const data = await turso.fetchUniversities(forceRefresh);
        if (data.length > 0) return data;
      } catch (error) {
        logger.warn('Turso universities fetch failed', error, 'HybridData');
      }
    }
    return UNIVERSITIES;
  }

  /**
   * Get universities synchronously (bundled only - for immediate UI)
   */
  getUniversitiesSync(): UniversityData[] {
    return UNIVERSITIES;
  }

  /**
   * Get university by ID or short name
   */
  async getUniversity(idOrShortName: string): Promise<(TursoUniversity | UniversityData) | undefined> {
    const universities = await this.getUniversities();
    return universities.find(
      u => u.short_name === idOrShortName || u.name === idOrShortName || (u as TursoUniversity).id === idOrShortName
    );
  }

  /**
   * Search universities
   */
  async searchUniversities(query: string, filters?: {
    province?: string;
    type?: 'public' | 'private' | 'semi_government';
    city?: string;
  }): Promise<(TursoUniversity | UniversityData)[]> {
    if (this.dataSource === 'turso' && query) {
      try {
        return await turso.searchUniversities(query, filters);
      } catch (error) {
        logger.warn('Turso search failed', error, 'HybridData');
      }
    }

    // Fallback to local search
    let results = [...UNIVERSITIES];
    const lowerQuery = query.toLowerCase();

    if (query.trim()) {
      results = results.filter(u =>
        u.name.toLowerCase().includes(lowerQuery) ||
        u.short_name.toLowerCase().includes(lowerQuery) ||
        u.city.toLowerCase().includes(lowerQuery) ||
        u.province.toLowerCase().includes(lowerQuery)
      );
    }

    if (filters?.province && filters.province !== 'all') {
      results = results.filter(u => u.province === filters.province);
    }
    if (filters?.type) {
      results = results.filter(u => u.type === filters.type);
    }
    if (filters?.city) {
      results = results.filter(u => u.city.toLowerCase() === filters.city?.toLowerCase());
    }

    return results;
  }

  // ===========================================================================
  // ENTRY TESTS (Turso → Bundled fallback)
  // ===========================================================================

  /**
   * Get all entry tests
   * @param forceRefresh - Bypass cache for pull-to-refresh
   */
  async getEntryTests(forceRefresh: boolean = false): Promise<(TursoEntryTest | typeof ENTRY_TESTS_DATA[0])[]> {
    if (this.dataSource === 'turso') {
      try {
        const data = await turso.fetchEntryTests(forceRefresh);
        if (data.length > 0) return data;
      } catch (error) {
        logger.warn('Turso entry tests fetch failed', error, 'HybridData');
      }
    }
    return ENTRY_TESTS_DATA;
  }

  /**
   * Get entry tests synchronously
   */
  getEntryTestsSync() {
    return ENTRY_TESTS_DATA;
  }

  /**
   * Get upcoming entry tests
   */
  async getUpcomingEntryTests(): Promise<(TursoEntryTest | typeof ENTRY_TESTS_DATA[0])[]> {
    const tests = await this.getEntryTests();
    const today = new Date();
    return tests.filter(test => {
      const testDate = new Date(test.test_date);
      return testDate >= today;
    }).sort((a, b) => new Date(a.test_date).getTime() - new Date(b.test_date).getTime());
  }

  // ===========================================================================
  // SCHOLARSHIPS (Turso → Bundled fallback)
  // ===========================================================================

  /**
   * Get all scholarships
   * @param forceRefresh - Bypass cache for pull-to-refresh
   */
  async getScholarships(forceRefresh: boolean = false): Promise<(TursoScholarship | ScholarshipData)[]> {
    if (this.dataSource === 'turso') {
      try {
        const data = await turso.fetchScholarships(forceRefresh);
        if (data.length > 0) return data;
      } catch (error) {
        logger.warn('Turso scholarships fetch failed', error, 'HybridData');
      }
    }
    return SCHOLARSHIPS.filter(s => s.is_active);
  }

  /**
   * Get scholarships synchronously
   */
  getScholarshipsSync(): ScholarshipData[] {
    return SCHOLARSHIPS.filter(s => s.is_active);
  }

  /**
   * Search scholarships
   */
  async searchScholarships(query: string, filters?: {
    type?: string;
    minCoverage?: number;
  }): Promise<(TursoScholarship | ScholarshipData)[]> {
    if (this.dataSource === 'turso' && query) {
      try {
        return await turso.searchScholarships(query, filters);
      } catch (error) {
        logger.warn('Turso scholarship search failed', error, 'HybridData');
      }
    }

    // Fallback to local search
    let results = SCHOLARSHIPS.filter(s => s.is_active);
    const lowerQuery = query.toLowerCase();

    if (query.trim()) {
      results = results.filter(s =>
        s.name.toLowerCase().includes(lowerQuery) ||
        s.provider.toLowerCase().includes(lowerQuery) ||
        s.description.toLowerCase().includes(lowerQuery)
      );
    }

    if (filters?.type && filters.type !== 'all') {
      results = results.filter(s => s.type === filters.type);
    }
    if (filters?.minCoverage !== undefined) {
      results = results.filter(s => s.coverage_percentage >= filters.minCoverage!);
    }

    return results;
  }

  // ===========================================================================
  // DEADLINES (Turso → Bundled fallback)
  // ===========================================================================

  /**
   * Get all deadlines
   * @param forceRefresh - Bypass cache for pull-to-refresh
   */
  async getDeadlines(forceRefresh: boolean = false): Promise<(TursoDeadline | typeof ADMISSION_DEADLINES[0])[]> {
    if (this.dataSource === 'turso') {
      try {
        const data = await turso.fetchDeadlines(forceRefresh);
        if (data.length > 0) return data;
      } catch (error) {
        logger.warn('Turso deadlines fetch failed', error, 'HybridData');
      }
    }
    return ADMISSION_DEADLINES;
  }

  /**
   * Get deadlines synchronously
   */
  getDeadlinesSync() {
    return ADMISSION_DEADLINES;
  }

  // ===========================================================================
  // PROGRAMS (Turso → Bundled fallback)
  // ===========================================================================

  /**
   * Get all programs
   * @param forceRefresh - Bypass cache for pull-to-refresh
   */
  async getPrograms(forceRefresh: boolean = false): Promise<(TursoProgram | typeof PROGRAMS[0])[]> {
    if (this.dataSource === 'turso') {
      try {
        const data = await turso.fetchPrograms(forceRefresh);
        if (data.length > 0) return data;
      } catch (error) {
        logger.warn('Turso programs fetch failed', error, 'HybridData');
      }
    }
    return PROGRAMS;
  }

  /**
   * Get programs synchronously
   */
  getProgramsSync() {
    return PROGRAMS;
  }

  // ===========================================================================
  // CAREERS (Turso → Bundled fallback)
  // ===========================================================================

  /**
   * Get all careers
   * @param forceRefresh - Bypass cache for pull-to-refresh
   */
  async getCareers(forceRefresh: boolean = false): Promise<(TursoCareer | typeof CAREER_PATHS[0])[]> {
    if (this.dataSource === 'turso') {
      try {
        const data = await turso.fetchCareers(forceRefresh);
        if (data.length > 0) return data;
      } catch (error) {
        logger.warn('Turso careers fetch failed', error, 'HybridData');
      }
    }
    return CAREER_PATHS;
  }

  /**
   * Get careers synchronously
   */
  getCareersSync() {
    return CAREER_PATHS;
  }

  /**
   * Get career fields
   */
  getCareerFields() {
    return CAREER_FIELDS;
  }

  // ===========================================================================
  // MERIT DATA (Turso → Bundled fallback)
  // ===========================================================================

  /**
   * Get merit formulas
   * @param forceRefresh - Bypass cache for pull-to-refresh
   */
  async getMeritFormulas(forceRefresh: boolean = false): Promise<(TursoMeritFormula | typeof MERIT_FORMULAS[0])[]> {
    if (this.dataSource === 'turso') {
      try {
        const data = await turso.fetchMeritFormulas(forceRefresh);
        if (data.length > 0) return data;
      } catch (error) {
        logger.warn('Turso merit formulas fetch failed', error, 'HybridData');
      }
    }
    return MERIT_FORMULAS;
  }

  /**
   * Get merit formulas synchronously
   */
  getMeritFormulasSync() {
    return MERIT_FORMULAS;
  }

  /**
   * Get merit archive
   * @param forceRefresh - Bypass cache for pull-to-refresh
   */
  async getMeritArchive(forceRefresh: boolean = false): Promise<(TursoMeritArchive | typeof MERIT_RECORDS[0])[]> {
    if (this.dataSource === 'turso') {
      try {
        const data = await turso.fetchMeritArchive(forceRefresh);
        if (data.length > 0) return data;
      } catch (error) {
        logger.warn('Turso merit archive fetch failed', error, 'HybridData');
      }
    }
    return MERIT_RECORDS;
  }

  // ===========================================================================
  // KAGGLE ENHANCEMENTS - Enriches existing features with real data
  // ===========================================================================

  /**
   * Get job market statistics (Kaggle data)
   * Enhances career guidance with real job market demand data
   * @param forceRefresh - Bypass cache for pull-to-refresh
   */
  async getJobMarketStats(forceRefresh: boolean = false): Promise<TursoJobMarketStats[]> {
    if (this.dataSource === 'turso') {
      try {
        return await turso.fetchJobMarketStats(forceRefresh);
      } catch (error) {
        logger.warn('Turso job market stats fetch failed', error, 'HybridData');
      }
    }
    return [];
  }

  /**
   * Get job market stats for a specific career field
   * Use this to show demand data on career detail screens
   */
  async getJobMarketStatsForField(field: string): Promise<TursoJobMarketStats | null> {
    if (this.dataSource === 'turso') {
      try {
        return await turso.getJobMarketStatsByField(field);
      } catch (error) {
        logger.warn('Turso job stats by field failed', error, 'HybridData');
      }
    }
    return null;
  }

  /**
   * Get enhanced career data with job market stats
   * Combines careers with real market demand data
   */
  async getCareersWithMarketData(): Promise<any[]> {
    const careers = await this.getCareers();
    const marketStats = await this.getJobMarketStats();
    
    return careers.map(career => {
      const c = career as any;
      const cName = c.name || c.title || '';
      const cField = c.field || c.field_id || '';
      
      const stats = marketStats.find(s => 
        s.field.toLowerCase() === (cField || cName).toLowerCase()
      );
      return { ...career, marketStats: stats };
    });
  }

  // ===========================================================================
  // SUPABASE - User Data (Remains in Supabase)
  // ===========================================================================

  /**
   * Get announcements from Supabase
   * @param forceRefresh - Bypass cache for pull-to-refresh
   */
  async getAnnouncements(forceRefresh: boolean = false): Promise<AnnouncementData[]> {
    try {
      if (!forceRefresh) {
        const cached = await cache.get<AnnouncementData[]>(CACHE_KEYS.ANNOUNCEMENTS);
        if (cached && cached.length > 0) {
          this.refreshAnnouncementsInBackground();
          return cached;
        }
      }
      return await this.fetchAnnouncements();
    } catch (error) {
      logger.error('Get announcements error', error, 'HybridData');
      return [];
    }
  }

  private async fetchAnnouncements(): Promise<AnnouncementData[]> {
    try {
      const now = new Date().toISOString();
      const {data, error} = await supabase
        .from('announcements')
        .select('id, title, message, type, is_active, start_date, end_date, priority, action_url, action_label')
        .eq('is_active', true)
        .lte('start_date', now)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order('priority', {ascending: false})
        .limit(10);

      if (error) throw error;

      const announcements = data || [];
      await cache.set(CACHE_KEYS.ANNOUNCEMENTS, announcements, CACHE_TTL.ANNOUNCEMENTS);
      return announcements;
    } catch (error) {
      logger.error('Fetch announcements error', error, 'HybridData');
      return [];
    }
  }

  private async refreshAnnouncementsInBackground(): Promise<void> {
    setTimeout(async () => {
      try {
        await this.fetchAnnouncements();
      } catch {}
    }, 100);
  }

  /**
   * Get user favorites
   * @param forceRefresh - Bypass cache for pull-to-refresh
   */
  async getUserFavorites(forceRefresh: boolean = false): Promise<UserFavorite[]> {
    try {
      const {data: {user}} = await supabase.auth.getUser();
      if (!user) return [];

      if (!forceRefresh) {
        const cached = await cache.get<UserFavorite[]>(CACHE_KEYS.USER_FAVORITES);
        if (cached) return cached;
      }

      const {data, error} = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', {ascending: false});

      if (error) throw error;

      const favorites = data || [];
      await cache.set(CACHE_KEYS.USER_FAVORITES, favorites, CACHE_TTL.USER_FAVORITES);
      return favorites;
    } catch (error) {
      logger.error('Get favorites error', error, 'HybridData');
      return [];
    }
  }

  /**
   * Add favorite
   */
  async addFavorite(type: UserFavorite['type'], itemId: string): Promise<boolean> {
    try {
      const {data: {user}} = await supabase.auth.getUser();
      if (!user) return false;

      const {error} = await supabase
        .from('user_favorites')
        .insert([{user_id: user.id, type, item_id: itemId}]);

      if (error) throw error;
      await cache.remove(CACHE_KEYS.USER_FAVORITES);
      return true;
    } catch (error) {
      logger.error('Add favorite error', error, 'HybridData');
      return false;
    }
  }

  /**
   * Remove favorite
   */
  async removeFavorite(favoriteId: string): Promise<boolean> {
    try {
      const {error} = await supabase
        .from('user_favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;
      await cache.remove(CACHE_KEYS.USER_FAVORITES);
      return true;
    } catch (error) {
      logger.error('Remove favorite error', error, 'HybridData');
      return false;
    }
  }

  /**
   * Save merit calculation
   */
  async saveCalculation(calculation: Omit<UserCalculation, 'id' | 'user_id' | 'created_at'>): Promise<boolean> {
    try {
      const {data: {user}} = await supabase.auth.getUser();
      
      if (!user) {
        // Save locally
        const localCalcs = await this.getLocalCalculations();
        localCalcs.push({
          ...calculation,
          id: `local_${Date.now()}`,
          user_id: 'local',
          created_at: new Date().toISOString(),
        });
        await AsyncStorage.setItem(CACHE_KEYS.USER_CALCULATIONS, JSON.stringify(localCalcs.slice(-10)));
        return true;
      }

      const {error} = await supabase
        .from('user_calculations')
        .insert([{...calculation, user_id: user.id}]);

      if (error) throw error;
      await cache.remove(CACHE_KEYS.USER_CALCULATIONS);
      return true;
    } catch (error) {
      logger.error('Save calculation error', error, 'HybridData');
      return false;
    }
  }

  private async getLocalCalculations(): Promise<UserCalculation[]> {
    try {
      const stored = await AsyncStorage.getItem(CACHE_KEYS.USER_CALCULATIONS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get user calculations
   * @param forceRefresh - Bypass cache for pull-to-refresh
   */
  async getCalculations(forceRefresh: boolean = false): Promise<UserCalculation[]> {
    try {
      const {data: {user}} = await supabase.auth.getUser();
      if (!user) return this.getLocalCalculations();

      if (!forceRefresh) {
        const cached = await cache.get<UserCalculation[]>(CACHE_KEYS.USER_CALCULATIONS);
        if (cached) return cached;
      }

      const {data, error} = await supabase
        .from('user_calculations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', {ascending: false})
        .limit(20);

      if (error) throw error;

      const calculations = data || [];
      await cache.set(CACHE_KEYS.USER_CALCULATIONS, calculations, CACHE_TTL.USER_CALCULATIONS);
      return calculations;
    } catch (error) {
      logger.error('Get calculations error', error, 'HybridData');
      return [];
    }
  }

  /**
   * Get user goals
   * @param forceRefresh - Bypass cache for pull-to-refresh
   */
  async getUserGoals(forceRefresh: boolean = false): Promise<UserGoal[]> {
    try {
      const {data: {user}} = await supabase.auth.getUser();
      if (!user) return this.getLocalGoals();

      if (!forceRefresh) {
        const cached = await cache.get<UserGoal[]>(CACHE_KEYS.USER_GOALS);
        if (cached) return cached;
      }

      const {data, error} = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', {ascending: false});

      if (error) throw error;

      const goals = data || [];
      await cache.set(CACHE_KEYS.USER_GOALS, goals, CACHE_TTL.USER_GOALS);
      return goals;
    } catch (error) {
      logger.error('Get goals error', error, 'HybridData');
      return [];
    }
  }

  private async getLocalGoals(): Promise<UserGoal[]> {
    try {
      const stored = await AsyncStorage.getItem(CACHE_KEYS.USER_GOALS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Save user goal
   */
  async saveGoal(goal: Omit<UserGoal, 'id' | 'user_id' | 'created_at'>): Promise<boolean> {
    try {
      const {data: {user}} = await supabase.auth.getUser();
      
      if (!user) {
        const localGoals = await this.getLocalGoals();
        localGoals.push({
          ...goal,
          id: `local_${Date.now()}`,
          user_id: 'local',
          created_at: new Date().toISOString(),
        });
        await AsyncStorage.setItem(CACHE_KEYS.USER_GOALS, JSON.stringify(localGoals));
        return true;
      }

      const {error} = await supabase
        .from('user_goals')
        .insert([{...goal, user_id: user.id}]);

      if (error) throw error;
      await cache.remove(CACHE_KEYS.USER_GOALS);
      return true;
    } catch (error) {
      logger.error('Save goal error', error, 'HybridData');
      return false;
    }
  }

  /**
   * Update user goal
   */
  async updateGoal(goalId: string, updates: Partial<UserGoal>): Promise<boolean> {
    try {
      if (goalId.startsWith('local_')) {
        const localGoals = await this.getLocalGoals();
        const index = localGoals.findIndex(g => g.id === goalId);
        if (index !== -1) {
          localGoals[index] = {...localGoals[index], ...updates};
          await AsyncStorage.setItem(CACHE_KEYS.USER_GOALS, JSON.stringify(localGoals));
        }
        return true;
      }

      const {error} = await supabase
        .from('user_goals')
        .update(updates)
        .eq('id', goalId);

      if (error) throw error;
      await cache.remove(CACHE_KEYS.USER_GOALS);
      return true;
    } catch (error) {
      logger.error('Update goal error', error, 'HybridData');
      return false;
    }
  }

  /**
   * Delete user goal
   */
  async deleteGoal(goalId: string): Promise<boolean> {
    try {
      if (goalId.startsWith('local_')) {
        const localGoals = await this.getLocalGoals();
        const filtered = localGoals.filter(g => g.id !== goalId);
        await AsyncStorage.setItem(CACHE_KEYS.USER_GOALS, JSON.stringify(filtered));
        return true;
      }

      const {error} = await supabase
        .from('user_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
      await cache.remove(CACHE_KEYS.USER_GOALS);
      return true;
    } catch (error) {
      logger.error('Delete goal error', error, 'HybridData');
      return false;
    }
  }

  // ===========================================================================
  // SYNC & CACHE MANAGEMENT
  // ===========================================================================

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<DataSyncStatus> {
    const lastTursoSync = await turso.getLastSyncTime();
    return {
      tursoConnected: turso.isTursoAvailable(),
      lastTursoSync,
      lastSupabaseSync: null,
      dataSource: this.dataSource,
    };
  }

  /**
   * Force refresh Turso data
   */
  async refreshTursoData(): Promise<void> {
    if (turso.isTursoAvailable()) {
      await turso.refreshAllData();
      this.dataSource = 'turso';
      this.tursoInitialized = true;
    }
  }

  /**
   * Force refresh all data
   */
  async forceRefreshAll(): Promise<void> {
    await this.refreshTursoData();
    await this.fetchAnnouncements();
    await cache.remove(CACHE_KEYS.USER_FAVORITES);
    await cache.remove(CACHE_KEYS.USER_CALCULATIONS);
    await cache.remove(CACHE_KEYS.USER_GOALS);
  }

  /**
   * Clear all user cache (on logout)
   */
  async clearUserCache(): Promise<void> {
    await cache.remove(CACHE_KEYS.USER_PROFILE);
    await cache.remove(CACHE_KEYS.USER_FAVORITES);
    await cache.remove(CACHE_KEYS.USER_CALCULATIONS);
    await cache.remove(CACHE_KEYS.USER_GOALS);
  }

  /**
   * Clear Turso cache
   */
  async clearTursoCache(): Promise<void> {
    await turso.clearCache();
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const hybridDataService = new HybridDataService();
export default hybridDataService;

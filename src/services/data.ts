/**
 * Data Service - Optimized for Supabase Free Tier
 * 
 * This service provides cache-first data access with intelligent syncing.
 * It uses local static data as primary source, with Supabase for:
 * - User-generated content (favorites, goals, calculations)
 * - Admin-managed updates
 * - Announcements
 * 
 * NO REAL-TIME SUBSCRIPTIONS - This is critical to stay within free tier limits!
 * 
 * Strategy:
 * 1. Static data (universities, scholarships) → Bundled with app
 * 2. Dynamic data (announcements) → Cache-first with manual refresh
 * 3. User data → Synced on login/logout only
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {supabase} from './supabase';
import {cache, CACHE_KEYS, CACHE_TTL} from './cache';

// Import bundled static data
import {UNIVERSITIES, UniversityData} from '../data/universities';
import {SCHOLARSHIPS, ScholarshipData} from '../data/scholarships';
import {ENTRY_TESTS_DATA} from '../data/entryTests';
import {CAREER_FIELDS} from '../data/careers';
import {MERIT_FORMULAS} from '../data/meritFormulas';
import {PROGRAMS} from '../data/programs';

// ============================================================================
// TYPES
// ============================================================================

export interface DataSyncStatus {
  universities: Date | null;
  scholarships: Date | null;
  announcements: Date | null;
  userProfile: Date | null;
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
// DATA SERVICE CLASS
// ============================================================================

class DataService {
  private syncStatus: DataSyncStatus = {
    universities: null,
    scholarships: null,
    announcements: null,
    userProfile: null,
  };

  // -------------------------------------------------------------------------
  // STATIC DATA - Uses bundled data (no egress!)
  // -------------------------------------------------------------------------

  /**
   * Get all universities - from bundled data
   * This NEVER makes API calls - data is shipped with app
   */
  getUniversities(): UniversityData[] {
    return UNIVERSITIES;
  }

  /**
   * Get university by ID
   */
  getUniversity(idOrShortName: string): UniversityData | undefined {
    return UNIVERSITIES.find(
      u => u.short_name === idOrShortName || u.name === idOrShortName
    );
  }

  /**
   * Search universities locally
   */
  searchUniversities(query: string, filters?: {
    province?: string;
    type?: 'public' | 'private' | 'semi_government';
    isHecRecognized?: boolean;
  }): UniversityData[] {
    let results = [...UNIVERSITIES];

    // Apply search query
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(u =>
        u.name.toLowerCase().includes(lowerQuery) ||
        u.short_name.toLowerCase().includes(lowerQuery) ||
        u.city.toLowerCase().includes(lowerQuery) ||
        u.province.toLowerCase().includes(lowerQuery)
      );
    }

    // Apply filters
    if (filters?.province && filters.province !== 'all') {
      results = results.filter(u => u.province === filters.province);
    }
    if (filters?.type) {
      results = results.filter(u => u.type === filters.type);
    }
    if (filters?.isHecRecognized !== undefined) {
      results = results.filter(u => u.is_hec_recognized === filters.isHecRecognized);
    }

    return results;
  }

  /**
   * Get all scholarships - from bundled data
   */
  getScholarships(): ScholarshipData[] {
    return SCHOLARSHIPS.filter(s => s.is_active);
  }

  /**
   * Get scholarship by ID
   */
  getScholarship(id: string): ScholarshipData | undefined {
    return SCHOLARSHIPS.find(s => s.id === id);
  }

  /**
   * Search scholarships locally
   */
  searchScholarships(query: string, filters?: {
    type?: string;
    minCoverage?: number;
    hasStipend?: boolean;
  }): ScholarshipData[] {
    let results = SCHOLARSHIPS.filter(s => s.is_active);

    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
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
    if (filters?.hasStipend) {
      results = results.filter(s => s.monthly_stipend !== null && s.monthly_stipend > 0);
    }

    return results;
  }

  /**
   * Get entry tests data
   */
  getEntryTests() {
    return ENTRY_TESTS_DATA;
  }

  /**
   * Get careers data
   */
  getCareers() {
    return CAREER_FIELDS;
  }

  /**
   * Get merit formulas
   */
  getMeritFormulas() {
    return MERIT_FORMULAS;
  }

  /**
   * Get programs data
   */
  getPrograms() {
    return PROGRAMS;
  }

  // -------------------------------------------------------------------------
  // DYNAMIC DATA - Cache-first with background sync
  // -------------------------------------------------------------------------

  /**
   * Get announcements - cache-first
   * Only fetches from Supabase if cache is expired
   */
  async getAnnouncements(): Promise<AnnouncementData[]> {
    try {
      // Check cache first
      const cached = await cache.get<AnnouncementData[]>(CACHE_KEYS.ANNOUNCEMENTS);
      
      // If cache is fresh, return it
      if (cached && cached.length > 0) {
        // Background revalidate if stale
        this.refreshAnnouncementsInBackground();
        return cached;
      }

      // Fetch from Supabase
      return await this.fetchAnnouncements();
    } catch (error) {
      console.error('[DataService] Get announcements error:', error);
      return [];
    }
  }

  /**
   * Fetch announcements from Supabase
   */
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
        .limit(10); // Limit to reduce egress

      if (error) throw error;

      const announcements = data || [];
      
      // Cache the results
      await cache.set(CACHE_KEYS.ANNOUNCEMENTS, announcements, CACHE_TTL.ANNOUNCEMENTS);
      this.syncStatus.announcements = new Date();

      return announcements;
    } catch (error) {
      console.error('[DataService] Fetch announcements error:', error);
      return [];
    }
  }

  /**
   * Background refresh for announcements
   */
  private async refreshAnnouncementsInBackground(): Promise<void> {
    // Don't block - run in background
    setTimeout(async () => {
      try {
        await this.fetchAnnouncements();
      } catch (error) {
        console.error('[DataService] Background refresh error:', error);
      }
    }, 100);
  }

  // -------------------------------------------------------------------------
  // USER DATA - Only syncs on explicit actions
  // -------------------------------------------------------------------------

  /**
   * Get user favorites - cache-first
   */
  async getUserFavorites(): Promise<UserFavorite[]> {
    try {
      // Check if user is logged in
      const {data: {user}} = await supabase.auth.getUser();
      if (!user) return [];

      // Check cache
      const cached = await cache.get<UserFavorite[]>(CACHE_KEYS.USER_FAVORITES);
      if (cached) return cached;

      // Fetch from Supabase
      const {data, error} = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', {ascending: false});

      if (error) throw error;

      const favorites = data || [];
      await cache.set(CACHE_KEYS.USER_FAVORITES, favorites, CACHE_TTL.USER_PROFILE);

      return favorites;
    } catch (error) {
      console.error('[DataService] Get favorites error:', error);
      return [];
    }
  }

  /**
   * Add favorite - sync immediately
   */
  async addFavorite(type: UserFavorite['type'], itemId: string): Promise<boolean> {
    try {
      const {data: {user}} = await supabase.auth.getUser();
      if (!user) return false;

      const {error} = await supabase
        .from('user_favorites')
        .insert([{user_id: user.id, type, item_id: itemId}]);

      if (error) throw error;

      // Invalidate cache
      await cache.remove(CACHE_KEYS.USER_FAVORITES);
      
      return true;
    } catch (error) {
      console.error('[DataService] Add favorite error:', error);
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

      // Invalidate cache
      await cache.remove(CACHE_KEYS.USER_FAVORITES);

      return true;
    } catch (error) {
      console.error('[DataService] Remove favorite error:', error);
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
        // Save locally if not logged in
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

      // Invalidate cache
      await cache.remove(CACHE_KEYS.USER_CALCULATIONS);

      return true;
    } catch (error) {
      console.error('[DataService] Save calculation error:', error);
      return false;
    }
  }

  /**
   * Get local calculations (for non-logged in users)
   */
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
   */
  async getCalculations(): Promise<UserCalculation[]> {
    try {
      const {data: {user}} = await supabase.auth.getUser();
      
      if (!user) {
        return this.getLocalCalculations();
      }

      const cached = await cache.get<UserCalculation[]>(CACHE_KEYS.USER_CALCULATIONS);
      if (cached) return cached;

      const {data, error} = await supabase
        .from('user_calculations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', {ascending: false})
        .limit(20);

      if (error) throw error;

      const calculations = data || [];
      await cache.set(CACHE_KEYS.USER_CALCULATIONS, calculations, CACHE_TTL.USER_PROFILE);

      return calculations;
    } catch (error) {
      console.error('[DataService] Get calculations error:', error);
      return [];
    }
  }

  /**
   * Get user goals
   */
  async getUserGoals(): Promise<UserGoal[]> {
    try {
      const {data: {user}} = await supabase.auth.getUser();
      if (!user) return this.getLocalGoals();

      const cached = await cache.get<UserGoal[]>(CACHE_KEYS.USER_GOALS);
      if (cached) return cached;

      const {data, error} = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', {ascending: false});

      if (error) throw error;

      const goals = data || [];
      await cache.set(CACHE_KEYS.USER_GOALS, goals, CACHE_TTL.USER_PROFILE);

      return goals;
    } catch (error) {
      console.error('[DataService] Get goals error:', error);
      return [];
    }
  }

  /**
   * Get local goals (for non-logged in users)
   */
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
        // Save locally
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
      console.error('[DataService] Save goal error:', error);
      return false;
    }
  }

  /**
   * Update user goal
   */
  async updateGoal(goalId: string, updates: Partial<UserGoal>): Promise<boolean> {
    try {
      if (goalId.startsWith('local_')) {
        // Update local goal
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
      console.error('[DataService] Update goal error:', error);
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
      console.error('[DataService] Delete goal error:', error);
      return false;
    }
  }

  // -------------------------------------------------------------------------
  // SYNC MANAGEMENT
  // -------------------------------------------------------------------------

  /**
   * Get sync status
   */
  getSyncStatus(): DataSyncStatus {
    return {...this.syncStatus};
  }

  /**
   * Force refresh all cached data
   * Call this sparingly to stay within free tier limits!
   */
  async forceRefreshAll(): Promise<void> {
    await this.fetchAnnouncements();
    await cache.remove(CACHE_KEYS.USER_FAVORITES);
    await cache.remove(CACHE_KEYS.USER_CALCULATIONS);
    await cache.remove(CACHE_KEYS.USER_GOALS);
  }

  /**
   * Clear all user data cache (on logout)
   */
  async clearUserCache(): Promise<void> {
    await cache.remove(CACHE_KEYS.USER_PROFILE);
    await cache.remove(CACHE_KEYS.USER_FAVORITES);
    await cache.remove(CACHE_KEYS.USER_CALCULATIONS);
    await cache.remove(CACHE_KEYS.USER_GOALS);
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const dataService = new DataService();
export default dataService;

/**
 * Enterprise Turso Admin Service
 * Full management capabilities for all Turso database operations
 * Production-grade admin panel integration
 * 
 * IMPORTANT: This service provides mock/cached data in React Native.
 * Direct Turso database operations are NOT available in mobile apps.
 * For full admin capabilities, use a backend API.
 * 
 * In React Native, this service will:
 * - Return cached/mock data for read operations
 * - Throw errors for write operations (CRUD)
 * - Work with the admin dashboard for viewing stats
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  TURSO_DATABASE_URL,
  TURSO_AUTH_TOKEN,
  fetchUniversities,
  fetchScholarships,
  fetchEntryTests,
  fetchDeadlines,
  fetchPrograms,
  fetchCareers,
  fetchMeritFormulas,
  fetchMeritArchive,
  fetchJobMarketStats,
  getLastSyncTime,
  needsRefresh,
} from './turso';
import { logger } from '../utils/logger';

/**
 * Flag indicating we're running in React Native (no direct DB access)
 */
const IS_REACT_NATIVE = typeof navigator !== 'undefined' && 
  // @ts-ignore - navigator.product exists in React Native but not in standard Navigator type
  (navigator.product === 'ReactNative' || (global as any).__BUNDLE_START_TIME__ !== undefined);

/**
 * Generic row type for SQL query results
 */
type SqlRow = Record<string, unknown>;

/**
 * Mock client interface for type compatibility
 * In React Native, we cannot use @libsql/client directly
 */
interface MockClient {
  execute: (query: string | { sql: string; args?: unknown[] }) => Promise<{ rows: SqlRow[] }>;
}

/**
 * Create a mock client that throws errors for write operations
 * but allows read operations to work via the turso.ts cached fetchers
 */
const createMockClient = (): MockClient => ({
  execute: async (query) => {
    const sql = typeof query === 'string' ? query : query.sql;
    const upperSql = sql.toUpperCase().trim();
    
    // Block all write operations in React Native
    if (upperSql.startsWith('INSERT') || 
        upperSql.startsWith('UPDATE') || 
        upperSql.startsWith('DELETE') ||
        upperSql.startsWith('DROP') ||
        upperSql.startsWith('ALTER') ||
        upperSql.startsWith('CREATE')) {
      throw new Error(
        'Database write operations are not available in React Native.\n' +
        'Admin CRUD operations require a backend API.\n' +
        'This is a security feature to prevent mobile apps from directly modifying the database.'
      );
    }
    
    // For SELECT queries, return empty result (actual data comes from cached fetchers)
    logger.warn('Direct SQL query attempted in React Native, returning empty result', sql, 'TursoAdmin');
    return { rows: [] };
  },
});

// ============================================================================
// Types
// ============================================================================

export interface TursoStats {
  totalUniversities: number;
  totalScholarships: number;
  totalEntryTests: number;
  totalDeadlines: number;
  totalPrograms: number;
  totalCareers: number;
  totalMeritFormulas: number;
  totalMeritArchive: number;
  totalJobMarketStats: number;
  lastSync: string | null;
  cacheStatus: 'fresh' | 'stale' | 'expired' | 'unknown';
  databaseStatus: 'connected' | 'disconnected' | 'error';
}

export interface DatabaseHealth {
  isConnected: boolean;
  latencyMs: number;
  lastChecked: string;
  tablesStatus: TableStatus[];
  cacheHealth: CacheHealth;
  storageUsed: number;
}

export interface TableStatus {
  name: string;
  rowCount: number;
  lastUpdated: string | null;
  status: 'healthy' | 'warning' | 'error';
  message?: string;
}

export interface CacheHealth {
  totalCacheSize: number;
  cacheKeys: string[];
  oldestEntry: string | null;
  newestEntry: string | null;
  hitRate: number;
}

export interface BulkOperationResult {
  success: boolean;
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  errors: Array<{ index: number; error: string }>;
  duration: number;
}

export interface DataValidationResult {
  isValid: boolean;
  errors: Array<{ field: string; message: string }>;
  warnings: Array<{ field: string; message: string }>;
}

export interface SyncResult {
  success: boolean;
  tablesRefreshed: string[];
  duration: number;
  errors: string[];
}

// University Types
export interface University {
  id: string;
  name: string;
  short_name: string;
  type: string;
  location: string;
  city: string;
  province: string;
  established: number;
  ranking_national: number | null;
  ranking_qs: number | null;
  website: string;
  description: string;
  logo_url: string;
  cover_image_url: string;
  admission_open: boolean;
  application_deadline: string | null;
  fee_range_min: number | null;
  fee_range_max: number | null;
  student_count: number | null;
  faculty_count: number | null;
  programs_count: number | null;
  acceptance_rate: number | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

// Scholarship Types
export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  type: string;
  amount: number | null;
  amount_description: string;
  eligibility: string;
  deadline: string | null;
  application_url: string;
  description: string;
  requirements: string;
  coverage: string;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

// Entry Test Types
export interface EntryTest {
  id: string;
  name: string;
  short_name: string;
  conducting_body: string;
  description: string;
  test_type: string;
  duration_minutes: number;
  total_marks: number;
  passing_marks: number | null;
  negative_marking: boolean;
  subjects: string;
  eligibility: string;
  fee: number | null;
  registration_url: string;
  syllabus_url: string;
  sample_papers_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Deadline Types
export interface Deadline {
  id: string;
  university_id: string;
  entry_test_id: string | null;
  deadline_type: string;
  title: string;
  description: string;
  deadline_date: string;
  application_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Program Types
export interface Program {
  id: string;
  university_id: string;
  name: string;
  degree_level: string;
  duration_years: number;
  department: string;
  faculty: string;
  fee_per_semester: number | null;
  total_fee: number | null;
  seats: number | null;
  eligibility: string;
  career_prospects: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Career Types
export interface Career {
  id: string;
  title: string;
  field: string;
  description: string;
  required_education: string;
  required_skills: string;
  salary_range_min: number | null;
  salary_range_max: number | null;
  job_outlook: string;
  growth_rate: number | null;
  related_programs: string;
  is_trending: boolean;
  created_at: string;
  updated_at: string;
}

// Merit Formula Types
export interface MeritFormula {
  id: string;
  university_id: string;
  program_id: string | null;
  formula_name: string;
  matric_weight: number;
  fsc_weight: number;
  test_weight: number;
  test_name: string | null;
  additional_criteria: string;
  min_percentage_required: number | null;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Merit Archive Types
export interface MeritArchive {
  id: string;
  university_id: string;
  program_id: string | null;
  year: number;
  merit_type: string;
  first_merit: number | null;
  second_merit: number | null;
  third_merit: number | null;
  closing_merit: number | null;
  total_seats: number | null;
  total_applicants: number | null;
  source: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

// Job Market Stats Types
export interface JobMarketStats {
  id: string;
  field: string;
  job_title: string;
  avg_salary: number | null;
  demand_level: string;
  growth_rate: number | null;
  required_skills: string;
  top_employers: string;
  region: string;
  year: number;
  created_at: string;
  updated_at: string;
}

// Notification Types for Turso
export interface TursoNotification {
  id: string;
  title: string;
  body: string;
  type: 'general' | 'announcement' | 'update' | 'alert' | 'scholarship' | 'admission' | 'deadline';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  target_audience: 'all' | 'verified' | 'active' | 'inactive' | 'new_users' | 'premium' | 'specific';
  target_user_ids: string | null;
  scheduled_at: string | null;
  sent_at: string | null;
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled' | 'failed';
  delivery_count: number;
  open_count: number;
  click_count: number;
  data: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Turso Admin Client
// ============================================================================

const CACHE_KEYS = {
  ADMIN_STATS: '@turso_admin_stats',
  DB_HEALTH: '@turso_db_health',
  LAST_HEALTH_CHECK: '@turso_last_health_check',
  CACHE_HIT_COUNT: '@turso_cache_hits',
  CACHE_MISS_COUNT: '@turso_cache_misses',
};

class TursoAdminService {
  private client: MockClient | null = null;
  private isInitialized = false;

  // ============================================================================
  // Initialization
  // ============================================================================

  /**
   * Get a mock client for React Native
   * This client allows read operations via cached data but blocks writes
   */
  private async getClient(): Promise<MockClient> {
    if (!this.client) {
      if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
        logger.warn('Missing Turso credentials', null, 'TursoAdmin');
        throw new Error('Turso credentials not configured');
      }

      // In React Native, use mock client instead of real libsql client
      this.client = createMockClient();
      this.isInitialized = true;
      logger.info('TursoAdmin initialized with mock client (React Native mode)', null, 'TursoAdmin');
    }
    return this.client;
  }

  // ============================================================================
  // Database Health & Statistics
  // ============================================================================

  async getDatabaseHealth(): Promise<DatabaseHealth> {
    const startTime = Date.now();
    
    try {
      // In React Native, check health by testing cached data availability
      const universities = await fetchUniversities();
      const latencyMs = Date.now() - startTime;
      
      // Get table statuses using cached fetchers
      const tablesStatus = await this.getTablesStatus();
      
      // Get cache health
      const cacheHealth = await this.getCacheHealth();
      
      // Calculate storage estimate
      const storageUsed = await this.estimateStorageUsed();

      const health: DatabaseHealth = {
        isConnected: universities.length > 0,
        latencyMs,
        lastChecked: new Date().toISOString(),
        tablesStatus,
        cacheHealth,
        storageUsed,
      };

      // Cache health data
      await AsyncStorage.setItem(CACHE_KEYS.DB_HEALTH, JSON.stringify(health));
      await AsyncStorage.setItem(CACHE_KEYS.LAST_HEALTH_CHECK, new Date().toISOString());

      return health;
    } catch (error) {
      logger.error('Health check failed', error, 'TursoAdmin');
      
      // Return cached health if available
      const cachedHealth = await AsyncStorage.getItem(CACHE_KEYS.DB_HEALTH);
      if (cachedHealth) {
        const parsed = JSON.parse(cachedHealth);
        parsed.isConnected = false;
        return parsed;
      }
      
      return {
        isConnected: false,
        latencyMs: -1,
        lastChecked: new Date().toISOString(),
        tablesStatus: [],
        cacheHealth: {
          totalCacheSize: 0,
          cacheKeys: [],
          oldestEntry: null,
          newestEntry: null,
          hitRate: 0,
        },
        storageUsed: 0,
      };
    }
  }

  private async getTablesStatus(): Promise<TableStatus[]> {
    // Use cached fetchers to get actual counts in React Native
    const fetcherMap: Record<string, () => Promise<unknown[]>> = {
      'universities': fetchUniversities,
      'scholarships': fetchScholarships,
      'entry_tests': fetchEntryTests,
      'deadlines': fetchDeadlines,
      'programs': fetchPrograms,
      'careers': fetchCareers,
      'merit_formulas': fetchMeritFormulas,
      'merit_archive': fetchMeritArchive,
      'job_market_stats': () => fetchJobMarketStats().catch(() => []),
    };

    const statuses: TableStatus[] = [];

    for (const [table, fetcher] of Object.entries(fetcherMap)) {
      try {
        const data = await fetcher();
        const count = data.length;

        statuses.push({
          name: table,
          rowCount: count,
          lastUpdated: new Date().toISOString(),
          status: count > 0 ? 'healthy' : 'warning',
          message: count === 0 ? 'No data available' : undefined,
        });
      } catch (error) {
        statuses.push({
          name: table,
          rowCount: 0,
          lastUpdated: null,
          status: 'error',
          message: `Table error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }

    return statuses;
  }

  private async getCacheHealth(): Promise<CacheHealth> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const tursoKeys = allKeys.filter(key => key.startsWith('@turso_'));
      
      let totalSize = 0;
      let oldestEntry: string | null = null;
      let newestEntry: string | null = null;

      for (const key of tursoKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }

      // Calculate hit rate
      const hits = parseInt(await AsyncStorage.getItem(CACHE_KEYS.CACHE_HIT_COUNT) || '0');
      const misses = parseInt(await AsyncStorage.getItem(CACHE_KEYS.CACHE_MISS_COUNT) || '0');
      const total = hits + misses;
      const hitRate = total > 0 ? (hits / total) * 100 : 0;

      return {
        totalCacheSize: totalSize,
        cacheKeys: tursoKeys,
        oldestEntry,
        newestEntry,
        hitRate,
      };
    } catch (error) {
      logger.error('Cache health check failed', error, 'TursoAdmin');
      return {
        totalCacheSize: 0,
        cacheKeys: [],
        oldestEntry: null,
        newestEntry: null,
        hitRate: 0,
      };
    }
  }

  private async estimateStorageUsed(): Promise<number> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const tursoKeys = allKeys.filter(key => key.startsWith('@turso_'));
      
      let totalSize = 0;
      for (const key of tursoKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }
      
      return totalSize;
    } catch {
      return 0;
    }
  }

  async getTursoStats(): Promise<TursoStats> {
    try {
      // In React Native, use the cached fetchers to get actual data counts
      // instead of direct SQL queries (which return empty from mock client)
      const [
        universities,
        scholarships,
        entryTests,
        deadlines,
        programs,
        careers,
        meritFormulas,
        meritArchive,
        jobMarketStats,
      ] = await Promise.all([
        fetchUniversities(),
        fetchScholarships(),
        fetchEntryTests(),
        fetchDeadlines(),
        fetchPrograms(),
        fetchCareers(),
        fetchMeritFormulas(),
        fetchMeritArchive(),
        fetchJobMarketStats().catch(() => []), // May not exist
      ]);

      const lastSync = await getLastSyncTime();

      return {
        totalUniversities: universities.length,
        totalScholarships: scholarships.length,
        totalEntryTests: entryTests.length,
        totalDeadlines: deadlines.length,
        totalPrograms: programs.length,
        totalCareers: careers.length,
        totalMeritFormulas: meritFormulas.length,
        totalMeritArchive: meritArchive.length,
        totalJobMarketStats: jobMarketStats.length,
        lastSync: lastSync?.toISOString() || null,
        cacheStatus: await this.getCacheStatus(),
        databaseStatus: universities.length > 0 ? 'connected' : 'disconnected',
      };
    } catch (error) {
      logger.error('Failed to get stats', error, 'TursoAdmin');
      return {
        totalUniversities: 0,
        totalScholarships: 0,
        totalEntryTests: 0,
        totalDeadlines: 0,
        totalPrograms: 0,
        totalCareers: 0,
        totalMeritFormulas: 0,
        totalMeritArchive: 0,
        totalJobMarketStats: 0,
        lastSync: null,
        cacheStatus: 'unknown',
        databaseStatus: 'error',
      };
    }
  }

  private async getCacheStatus(): Promise<'fresh' | 'stale' | 'expired' | 'unknown'> {
    try {
      const lastSync = await AsyncStorage.getItem('@turso_last_sync');
      if (!lastSync) return 'unknown';

      const syncTime = new Date(lastSync).getTime();
      const now = Date.now();
      const hoursSinceSync = (now - syncTime) / (1000 * 60 * 60);

      if (hoursSinceSync < 1) return 'fresh';
      if (hoursSinceSync < 24) return 'stale';
      return 'expired';
    } catch {
      return 'unknown';
    }
  }

  // ============================================================================
  // Cache Management
  // ============================================================================

  async clearAllCache(): Promise<{ success: boolean; keysCleared: number }> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const tursoKeys = allKeys.filter(key => key.startsWith('@turso_'));
      
      await AsyncStorage.multiRemove(tursoKeys);
      
      return { success: true, keysCleared: tursoKeys.length };
    } catch (error) {
      logger.error('Failed to clear cache', error, 'TursoAdmin');
      return { success: false, keysCleared: 0 };
    }
  }

  async refreshAllData(): Promise<SyncResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const tablesRefreshed: string[] = [];

    try {
      // Clear existing cache first
      await this.clearAllCache();

      // Refresh each table's cache
      const tables = [
        'universities',
        'scholarships',
        'entry_tests',
        'deadlines',
        'programs',
        'careers',
        'merit_formulas',
        'merit_archive',
        'job_market_stats',
      ];

      for (const table of tables) {
        try {
          const client = await this.getClient();
          const result = await client.execute(`SELECT * FROM ${table}`);
          
          // Cache the data
          await AsyncStorage.setItem(
            `@turso_${table}_cache`,
            JSON.stringify(result.rows)
          );
          
          tablesRefreshed.push(table);
        } catch (error) {
          errors.push(`Failed to refresh ${table}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Update last sync time
      await AsyncStorage.setItem('@turso_last_sync', new Date().toISOString());

      return {
        success: errors.length === 0,
        tablesRefreshed,
        duration: Date.now() - startTime,
        errors,
      };
    } catch (error) {
      return {
        success: false,
        tablesRefreshed,
        duration: Date.now() - startTime,
        errors: [...errors, error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  // ============================================================================
  // University Management
  // ============================================================================

  async getUniversities(options?: {
    limit?: number;
    offset?: number;
    search?: string;
    type?: string;
    province?: string;
    orderBy?: string;
    orderDir?: 'asc' | 'desc';
  }): Promise<{ data: University[]; total: number }> {
    try {
      const client = await this.getClient();
      
      let whereClause = 'WHERE 1=1';
      if (options?.search) {
        whereClause += ` AND (name LIKE '%${options.search}%' OR short_name LIKE '%${options.search}%' OR city LIKE '%${options.search}%')`;
      }
      if (options?.type) {
        whereClause += ` AND type = '${options.type}'`;
      }
      if (options?.province) {
        whereClause += ` AND province = '${options.province}'`;
      }

      const orderBy = options?.orderBy || 'name';
      const orderDir = options?.orderDir || 'asc';
      const limit = options?.limit || 50;
      const offset = options?.offset || 0;

      const [dataResult, countResult] = await Promise.all([
        client.execute(`SELECT * FROM universities ${whereClause} ORDER BY ${orderBy} ${orderDir} LIMIT ${limit} OFFSET ${offset}`),
        client.execute(`SELECT COUNT(*) as count FROM universities ${whereClause}`),
      ]);

      return {
        data: dataResult.rows as unknown as University[],
        total: Number(countResult.rows[0]?.count || 0),
      };
    } catch (error) {
      logger.error('Failed to get universities', error, 'TursoAdmin');
      return { data: [], total: 0 };
    }
  }

  async createUniversity(university: Omit<University, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const client = await this.getClient();
      const id = `uni_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      await client.execute({
        sql: `INSERT INTO universities (
          id, name, short_name, type, location, city, province, established,
          ranking_national, ranking_qs, website, description, logo_url, cover_image_url,
          admission_open, application_deadline, fee_range_min, fee_range_max,
          student_count, faculty_count, programs_count, acceptance_rate, is_featured,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id, university.name, university.short_name, university.type, university.location,
          university.city, university.province, university.established, university.ranking_national,
          university.ranking_qs, university.website, university.description, university.logo_url,
          university.cover_image_url, university.admission_open ? 1 : 0, university.application_deadline,
          university.fee_range_min, university.fee_range_max, university.student_count,
          university.faculty_count, university.programs_count, university.acceptance_rate,
          university.is_featured ? 1 : 0, now, now,
        ],
      });

      return { success: true, id };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateUniversity(id: string, updates: Partial<University>): Promise<{ success: boolean; error?: string }> {
    try {
      const client = await this.getClient();
      
      const setClause = Object.entries(updates)
        .filter(([key]) => !['id', 'created_at'].includes(key))
        .map(([key, value]) => {
          if (typeof value === 'boolean') {
            return `${key} = ${value ? 1 : 0}`;
          } else if (value === null) {
            return `${key} = NULL`;
          } else {
            return `${key} = '${value}'`;
          }
        })
        .join(', ');

      await client.execute(`UPDATE universities SET ${setClause}, updated_at = '${new Date().toISOString()}' WHERE id = '${id}'`);

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async deleteUniversity(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const client = await this.getClient();
      await client.execute(`DELETE FROM universities WHERE id = '${id}'`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ============================================================================
  // Scholarship Management
  // ============================================================================

  async getScholarships(options?: {
    limit?: number;
    offset?: number;
    search?: string;
    type?: string;
    isActive?: boolean;
  }): Promise<{ data: Scholarship[]; total: number }> {
    try {
      const client = await this.getClient();
      
      let whereClause = 'WHERE 1=1';
      if (options?.search) {
        whereClause += ` AND (name LIKE '%${options.search}%' OR provider LIKE '%${options.search}%')`;
      }
      if (options?.type) {
        whereClause += ` AND type = '${options.type}'`;
      }
      if (options?.isActive !== undefined) {
        whereClause += ` AND is_active = ${options.isActive ? 1 : 0}`;
      }

      const limit = options?.limit || 50;
      const offset = options?.offset || 0;

      const [dataResult, countResult] = await Promise.all([
        client.execute(`SELECT * FROM scholarships ${whereClause} ORDER BY name LIMIT ${limit} OFFSET ${offset}`),
        client.execute(`SELECT COUNT(*) as count FROM scholarships ${whereClause}`),
      ]);

      return {
        data: dataResult.rows as unknown as Scholarship[],
        total: Number(countResult.rows[0]?.count || 0),
      };
    } catch (error) {
      logger.error('Failed to get scholarships', error, 'TursoAdmin');
      return { data: [], total: 0 };
    }
  }

  async createScholarship(scholarship: Omit<Scholarship, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const client = await this.getClient();
      const id = `sch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      await client.execute({
        sql: `INSERT INTO scholarships (
          id, name, provider, type, amount, amount_description, eligibility,
          deadline, application_url, description, requirements, coverage,
          is_active, is_featured, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id, scholarship.name, scholarship.provider, scholarship.type, scholarship.amount,
          scholarship.amount_description, scholarship.eligibility, scholarship.deadline,
          scholarship.application_url, scholarship.description, scholarship.requirements,
          scholarship.coverage, scholarship.is_active ? 1 : 0, scholarship.is_featured ? 1 : 0,
          now, now,
        ],
      });

      return { success: true, id };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateScholarship(id: string, updates: Partial<Scholarship>): Promise<{ success: boolean; error?: string }> {
    try {
      const client = await this.getClient();
      
      const setClause = Object.entries(updates)
        .filter(([key]) => !['id', 'created_at'].includes(key))
        .map(([key, value]) => {
          if (typeof value === 'boolean') {
            return `${key} = ${value ? 1 : 0}`;
          } else if (value === null) {
            return `${key} = NULL`;
          } else {
            return `${key} = '${value}'`;
          }
        })
        .join(', ');

      await client.execute(`UPDATE scholarships SET ${setClause}, updated_at = '${new Date().toISOString()}' WHERE id = '${id}'`);

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async deleteScholarship(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const client = await this.getClient();
      await client.execute(`DELETE FROM scholarships WHERE id = '${id}'`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ============================================================================
  // Entry Test Management
  // ============================================================================

  async getEntryTests(options?: {
    limit?: number;
    offset?: number;
    search?: string;
    testType?: string;
    isActive?: boolean;
  }): Promise<{ data: EntryTest[]; total: number }> {
    try {
      const client = await this.getClient();
      
      let whereClause = 'WHERE 1=1';
      if (options?.search) {
        whereClause += ` AND (name LIKE '%${options.search}%' OR short_name LIKE '%${options.search}%')`;
      }
      if (options?.testType) {
        whereClause += ` AND test_type = '${options.testType}'`;
      }
      if (options?.isActive !== undefined) {
        whereClause += ` AND is_active = ${options.isActive ? 1 : 0}`;
      }

      const limit = options?.limit || 50;
      const offset = options?.offset || 0;

      const [dataResult, countResult] = await Promise.all([
        client.execute(`SELECT * FROM entry_tests ${whereClause} ORDER BY name LIMIT ${limit} OFFSET ${offset}`),
        client.execute(`SELECT COUNT(*) as count FROM entry_tests ${whereClause}`),
      ]);

      return {
        data: dataResult.rows as unknown as EntryTest[],
        total: Number(countResult.rows[0]?.count || 0),
      };
    } catch (error) {
      logger.error('Failed to get entry tests', error, 'TursoAdmin');
      return { data: [], total: 0 };
    }
  }

  async createEntryTest(test: Omit<EntryTest, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const client = await this.getClient();
      const id = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      await client.execute({
        sql: `INSERT INTO entry_tests (
          id, name, short_name, conducting_body, description, test_type,
          duration_minutes, total_marks, passing_marks, negative_marking,
          subjects, eligibility, fee, registration_url, syllabus_url,
          sample_papers_url, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id, test.name, test.short_name, test.conducting_body, test.description,
          test.test_type, test.duration_minutes, test.total_marks, test.passing_marks,
          test.negative_marking ? 1 : 0, test.subjects, test.eligibility, test.fee,
          test.registration_url, test.syllabus_url, test.sample_papers_url,
          test.is_active ? 1 : 0, now, now,
        ],
      });

      return { success: true, id };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateEntryTest(id: string, updates: Partial<EntryTest>): Promise<{ success: boolean; error?: string }> {
    try {
      const client = await this.getClient();
      
      const setClause = Object.entries(updates)
        .filter(([key]) => !['id', 'created_at'].includes(key))
        .map(([key, value]) => {
          if (typeof value === 'boolean') {
            return `${key} = ${value ? 1 : 0}`;
          } else if (value === null) {
            return `${key} = NULL`;
          } else {
            return `${key} = '${value}'`;
          }
        })
        .join(', ');

      await client.execute(`UPDATE entry_tests SET ${setClause}, updated_at = '${new Date().toISOString()}' WHERE id = '${id}'`);

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async deleteEntryTest(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const client = await this.getClient();
      await client.execute(`DELETE FROM entry_tests WHERE id = '${id}'`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ============================================================================
  // Programs Management
  // ============================================================================

  async getPrograms(options?: {
    limit?: number;
    offset?: number;
    search?: string;
    universityId?: string;
    degreeLevel?: string;
    isActive?: boolean;
  }): Promise<{ data: Program[]; total: number }> {
    try {
      const client = await this.getClient();
      
      let whereClause = 'WHERE 1=1';
      if (options?.search) {
        whereClause += ` AND (name LIKE '%${options.search}%' OR department LIKE '%${options.search}%')`;
      }
      if (options?.universityId) {
        whereClause += ` AND university_id = '${options.universityId}'`;
      }
      if (options?.degreeLevel) {
        whereClause += ` AND degree_level = '${options.degreeLevel}'`;
      }
      if (options?.isActive !== undefined) {
        whereClause += ` AND is_active = ${options.isActive ? 1 : 0}`;
      }

      const limit = options?.limit || 50;
      const offset = options?.offset || 0;

      const [dataResult, countResult] = await Promise.all([
        client.execute(`SELECT * FROM programs ${whereClause} ORDER BY name LIMIT ${limit} OFFSET ${offset}`),
        client.execute(`SELECT COUNT(*) as count FROM programs ${whereClause}`),
      ]);

      return {
        data: dataResult.rows as unknown as Program[],
        total: Number(countResult.rows[0]?.count || 0),
      };
    } catch (error) {
      logger.error('Failed to get programs', error, 'TursoAdmin');
      return { data: [], total: 0 };
    }
  }

  async createProgram(program: Omit<Program, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const client = await this.getClient();
      const id = `prog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      await client.execute({
        sql: `INSERT INTO programs (
          id, university_id, name, degree_level, duration_years, department,
          faculty, fee_per_semester, total_fee, seats, eligibility,
          career_prospects, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id, program.university_id, program.name, program.degree_level, program.duration_years,
          program.department, program.faculty, program.fee_per_semester, program.total_fee,
          program.seats, program.eligibility, program.career_prospects,
          program.is_active ? 1 : 0, now, now,
        ],
      });

      return { success: true, id };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateProgram(id: string, updates: Partial<Program>): Promise<{ success: boolean; error?: string }> {
    try {
      const client = await this.getClient();
      
      const setClause = Object.entries(updates)
        .filter(([key]) => !['id', 'created_at'].includes(key))
        .map(([key, value]) => {
          if (typeof value === 'boolean') {
            return `${key} = ${value ? 1 : 0}`;
          } else if (value === null) {
            return `${key} = NULL`;
          } else {
            return `${key} = '${value}'`;
          }
        })
        .join(', ');

      await client.execute(`UPDATE programs SET ${setClause}, updated_at = '${new Date().toISOString()}' WHERE id = '${id}'`);

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async deleteProgram(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const client = await this.getClient();
      await client.execute(`DELETE FROM programs WHERE id = '${id}'`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ============================================================================
  // Careers Management
  // ============================================================================

  async getCareers(options?: {
    limit?: number;
    offset?: number;
    search?: string;
    field?: string;
    isTrending?: boolean;
  }): Promise<{ data: Career[]; total: number }> {
    try {
      const client = await this.getClient();
      
      let whereClause = 'WHERE 1=1';
      if (options?.search) {
        whereClause += ` AND (title LIKE '%${options.search}%' OR field LIKE '%${options.search}%')`;
      }
      if (options?.field) {
        whereClause += ` AND field = '${options.field}'`;
      }
      if (options?.isTrending !== undefined) {
        whereClause += ` AND is_trending = ${options.isTrending ? 1 : 0}`;
      }

      const limit = options?.limit || 50;
      const offset = options?.offset || 0;

      const [dataResult, countResult] = await Promise.all([
        client.execute(`SELECT * FROM careers ${whereClause} ORDER BY title LIMIT ${limit} OFFSET ${offset}`),
        client.execute(`SELECT COUNT(*) as count FROM careers ${whereClause}`),
      ]);

      return {
        data: dataResult.rows as unknown as Career[],
        total: Number(countResult.rows[0]?.count || 0),
      };
    } catch (error) {
      logger.error('Failed to get careers', error, 'TursoAdmin');
      return { data: [], total: 0 };
    }
  }

  async createCareer(career: Omit<Career, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const client = await this.getClient();
      const id = `career_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      await client.execute({
        sql: `INSERT INTO careers (
          id, title, field, description, required_education, required_skills,
          salary_range_min, salary_range_max, job_outlook, growth_rate,
          related_programs, is_trending, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id, career.title, career.field, career.description, career.required_education,
          career.required_skills, career.salary_range_min, career.salary_range_max,
          career.job_outlook, career.growth_rate, career.related_programs,
          career.is_trending ? 1 : 0, now, now,
        ],
      });

      return { success: true, id };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateCareer(id: string, updates: Partial<Career>): Promise<{ success: boolean; error?: string }> {
    try {
      const client = await this.getClient();
      
      const setClause = Object.entries(updates)
        .filter(([key]) => !['id', 'created_at'].includes(key))
        .map(([key, value]) => {
          if (typeof value === 'boolean') {
            return `${key} = ${value ? 1 : 0}`;
          } else if (value === null) {
            return `${key} = NULL`;
          } else {
            return `${key} = '${value}'`;
          }
        })
        .join(', ');

      await client.execute(`UPDATE careers SET ${setClause}, updated_at = '${new Date().toISOString()}' WHERE id = '${id}'`);

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async deleteCareer(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const client = await this.getClient();
      await client.execute(`DELETE FROM careers WHERE id = '${id}'`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ============================================================================
  // Deadlines Management
  // ============================================================================

  async getDeadlines(options?: {
    limit?: number;
    offset?: number;
    search?: string;
    universityId?: string;
    deadlineType?: string;
    isActive?: boolean;
  }): Promise<{ data: Deadline[]; total: number }> {
    try {
      const client = await this.getClient();
      
      let whereClause = 'WHERE 1=1';
      if (options?.search) {
        whereClause += ` AND (title LIKE '%${options.search}%' OR description LIKE '%${options.search}%')`;
      }
      if (options?.universityId) {
        whereClause += ` AND university_id = '${options.universityId}'`;
      }
      if (options?.deadlineType) {
        whereClause += ` AND deadline_type = '${options.deadlineType}'`;
      }
      if (options?.isActive !== undefined) {
        whereClause += ` AND is_active = ${options.isActive ? 1 : 0}`;
      }

      const limit = options?.limit || 50;
      const offset = options?.offset || 0;

      const [dataResult, countResult] = await Promise.all([
        client.execute(`SELECT * FROM deadlines ${whereClause} ORDER BY deadline_date LIMIT ${limit} OFFSET ${offset}`),
        client.execute(`SELECT COUNT(*) as count FROM deadlines ${whereClause}`),
      ]);

      return {
        data: dataResult.rows as unknown as Deadline[],
        total: Number(countResult.rows[0]?.count || 0),
      };
    } catch (error) {
      logger.error('Failed to get deadlines', error, 'TursoAdmin');
      return { data: [], total: 0 };
    }
  }

  async createDeadline(deadline: Omit<Deadline, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const client = await this.getClient();
      const id = `deadline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      await client.execute({
        sql: `INSERT INTO deadlines (
          id, university_id, entry_test_id, deadline_type, title, description,
          deadline_date, application_url, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id, deadline.university_id, deadline.entry_test_id, deadline.deadline_type,
          deadline.title, deadline.description, deadline.deadline_date, deadline.application_url,
          deadline.is_active ? 1 : 0, now, now,
        ],
      });

      return { success: true, id };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateDeadline(id: string, updates: Partial<Deadline>): Promise<{ success: boolean; error?: string }> {
    try {
      const client = await this.getClient();
      
      const setClause = Object.entries(updates)
        .filter(([key]) => !['id', 'created_at'].includes(key))
        .map(([key, value]) => {
          if (typeof value === 'boolean') {
            return `${key} = ${value ? 1 : 0}`;
          } else if (value === null) {
            return `${key} = NULL`;
          } else {
            return `${key} = '${value}'`;
          }
        })
        .join(', ');

      await client.execute(`UPDATE deadlines SET ${setClause}, updated_at = '${new Date().toISOString()}' WHERE id = '${id}'`);

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async deleteDeadline(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const client = await this.getClient();
      await client.execute(`DELETE FROM deadlines WHERE id = '${id}'`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ============================================================================
  // Merit Formulas Management
  // ============================================================================

  async getMeritFormulas(options?: {
    limit?: number;
    offset?: number;
    search?: string;
    universityId?: string;
    isActive?: boolean;
  }): Promise<{ data: MeritFormula[]; total: number }> {
    try {
      const client = await this.getClient();
      
      let whereClause = 'WHERE 1=1';
      if (options?.search) {
        whereClause += ` AND (formula_name LIKE '%${options.search}%' OR description LIKE '%${options.search}%')`;
      }
      if (options?.universityId) {
        whereClause += ` AND university_id = '${options.universityId}'`;
      }
      if (options?.isActive !== undefined) {
        whereClause += ` AND is_active = ${options.isActive ? 1 : 0}`;
      }

      const limit = options?.limit || 50;
      const offset = options?.offset || 0;

      const [dataResult, countResult] = await Promise.all([
        client.execute(`SELECT * FROM merit_formulas ${whereClause} ORDER BY formula_name LIMIT ${limit} OFFSET ${offset}`),
        client.execute(`SELECT COUNT(*) as count FROM merit_formulas ${whereClause}`),
      ]);

      return {
        data: dataResult.rows as unknown as MeritFormula[],
        total: Number(countResult.rows[0]?.count || 0),
      };
    } catch (error) {
      logger.error('Failed to get merit formulas', error, 'TursoAdmin');
      return { data: [], total: 0 };
    }
  }

  async createMeritFormula(formula: Omit<MeritFormula, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const client = await this.getClient();
      const id = `formula_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      await client.execute({
        sql: `INSERT INTO merit_formulas (
          id, university_id, program_id, formula_name, matric_weight, fsc_weight,
          test_weight, test_name, additional_criteria, min_percentage_required,
          description, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id, formula.university_id, formula.program_id, formula.formula_name,
          formula.matric_weight, formula.fsc_weight, formula.test_weight, formula.test_name,
          formula.additional_criteria, formula.min_percentage_required, formula.description,
          formula.is_active ? 1 : 0, now, now,
        ],
      });

      return { success: true, id };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateMeritFormula(id: string, updates: Partial<MeritFormula>): Promise<{ success: boolean; error?: string }> {
    try {
      const client = await this.getClient();
      
      const setClause = Object.entries(updates)
        .filter(([key]) => !['id', 'created_at'].includes(key))
        .map(([key, value]) => {
          if (typeof value === 'boolean') {
            return `${key} = ${value ? 1 : 0}`;
          } else if (value === null) {
            return `${key} = NULL`;
          } else if (typeof value === 'number') {
            return `${key} = ${value}`;
          } else {
            return `${key} = '${value}'`;
          }
        })
        .join(', ');

      await client.execute(`UPDATE merit_formulas SET ${setClause}, updated_at = '${new Date().toISOString()}' WHERE id = '${id}'`);

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async deleteMeritFormula(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const client = await this.getClient();
      await client.execute(`DELETE FROM merit_formulas WHERE id = '${id}'`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ============================================================================
  // Merit Archive Management
  // ============================================================================

  async getMeritArchive(options?: {
    limit?: number;
    offset?: number;
    search?: string;
    universityId?: string;
    year?: number;
  }): Promise<{ data: MeritArchive[]; total: number }> {
    try {
      const client = await this.getClient();
      
      let whereClause = 'WHERE 1=1';
      if (options?.search) {
        whereClause += ` AND (merit_type LIKE '%${options.search}%' OR source LIKE '%${options.search}%')`;
      }
      if (options?.universityId) {
        whereClause += ` AND university_id = '${options.universityId}'`;
      }
      if (options?.year) {
        whereClause += ` AND year = ${options.year}`;
      }

      const limit = options?.limit || 50;
      const offset = options?.offset || 0;

      const [dataResult, countResult] = await Promise.all([
        client.execute(`SELECT * FROM merit_archive ${whereClause} ORDER BY year DESC, merit_type LIMIT ${limit} OFFSET ${offset}`),
        client.execute(`SELECT COUNT(*) as count FROM merit_archive ${whereClause}`),
      ]);

      return {
        data: dataResult.rows as unknown as MeritArchive[],
        total: Number(countResult.rows[0]?.count || 0),
      };
    } catch (error) {
      logger.error('Failed to get merit archive', error, 'TursoAdmin');
      return { data: [], total: 0 };
    }
  }

  async createMeritArchive(archive: Omit<MeritArchive, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const client = await this.getClient();
      const id = `archive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      await client.execute({
        sql: `INSERT INTO merit_archive (
          id, university_id, program_id, year, merit_type, first_merit,
          second_merit, third_merit, closing_merit, total_seats,
          total_applicants, source, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id, archive.university_id, archive.program_id, archive.year, archive.merit_type,
          archive.first_merit, archive.second_merit, archive.third_merit, archive.closing_merit,
          archive.total_seats, archive.total_applicants, archive.source, archive.notes,
          now, now,
        ],
      });

      return { success: true, id };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateMeritArchive(id: string, updates: Partial<MeritArchive>): Promise<{ success: boolean; error?: string }> {
    try {
      const client = await this.getClient();
      
      const setClause = Object.entries(updates)
        .filter(([key]) => !['id', 'created_at'].includes(key))
        .map(([key, value]) => {
          if (value === null) {
            return `${key} = NULL`;
          } else if (typeof value === 'number') {
            return `${key} = ${value}`;
          } else {
            return `${key} = '${value}'`;
          }
        })
        .join(', ');

      await client.execute(`UPDATE merit_archive SET ${setClause}, updated_at = '${new Date().toISOString()}' WHERE id = '${id}'`);

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async deleteMeritArchive(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const client = await this.getClient();
      await client.execute(`DELETE FROM merit_archive WHERE id = '${id}'`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ============================================================================
  // Notifications Management (Turso-based)
  // ============================================================================

  async initNotificationsTable(): Promise<{ success: boolean; error?: string }> {
    try {
      const client = await this.getClient();
      
      await client.execute(`
        CREATE TABLE IF NOT EXISTS notifications (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          body TEXT NOT NULL,
          type TEXT DEFAULT 'general',
          priority TEXT DEFAULT 'normal',
          target_audience TEXT DEFAULT 'all',
          target_user_ids TEXT,
          scheduled_at TEXT,
          sent_at TEXT,
          status TEXT DEFAULT 'draft',
          delivery_count INTEGER DEFAULT 0,
          open_count INTEGER DEFAULT 0,
          click_count INTEGER DEFAULT 0,
          data TEXT,
          created_by TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `);

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getNotifications(options?: {
    limit?: number;
    offset?: number;
    search?: string;
    type?: string;
    status?: string;
    priority?: string;
  }): Promise<{ data: TursoNotification[]; total: number }> {
    try {
      const client = await this.getClient();
      
      // Ensure table exists
      await this.initNotificationsTable();
      
      let whereClause = 'WHERE 1=1';
      if (options?.search) {
        whereClause += ` AND (title LIKE '%${options.search}%' OR body LIKE '%${options.search}%')`;
      }
      if (options?.type) {
        whereClause += ` AND type = '${options.type}'`;
      }
      if (options?.status) {
        whereClause += ` AND status = '${options.status}'`;
      }
      if (options?.priority) {
        whereClause += ` AND priority = '${options.priority}'`;
      }

      const limit = options?.limit || 50;
      const offset = options?.offset || 0;

      const [dataResult, countResult] = await Promise.all([
        client.execute(`SELECT * FROM notifications ${whereClause} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`),
        client.execute(`SELECT COUNT(*) as count FROM notifications ${whereClause}`),
      ]);

      return {
        data: dataResult.rows as unknown as TursoNotification[],
        total: Number(countResult.rows[0]?.count || 0),
      };
    } catch (error) {
      logger.error('Failed to get notifications', error, 'TursoAdmin');
      return { data: [], total: 0 };
    }
  }

  async createNotification(notification: Omit<TursoNotification, 'id' | 'delivery_count' | 'open_count' | 'click_count' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const client = await this.getClient();
      await this.initNotificationsTable();
      
      const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      await client.execute({
        sql: `INSERT INTO notifications (
          id, title, body, type, priority, target_audience, target_user_ids,
          scheduled_at, sent_at, status, delivery_count, open_count, click_count,
          data, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?, ?, ?, ?)`,
        args: [
          id, notification.title, notification.body, notification.type, notification.priority,
          notification.target_audience, notification.target_user_ids, notification.scheduled_at,
          notification.sent_at, notification.status, notification.data, notification.created_by,
          now, now,
        ],
      });

      return { success: true, id };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateNotification(id: string, updates: Partial<TursoNotification>): Promise<{ success: boolean; error?: string }> {
    try {
      const client = await this.getClient();
      
      const setClause = Object.entries(updates)
        .filter(([key]) => !['id', 'created_at'].includes(key))
        .map(([key, value]) => {
          if (value === null) {
            return `${key} = NULL`;
          } else if (typeof value === 'number') {
            return `${key} = ${value}`;
          } else {
            return `${key} = '${value}'`;
          }
        })
        .join(', ');

      await client.execute(`UPDATE notifications SET ${setClause}, updated_at = '${new Date().toISOString()}' WHERE id = '${id}'`);

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async sendNotification(id: string): Promise<{ success: boolean; deliveryCount?: number; error?: string }> {
    try {
      const client = await this.getClient();
      const now = new Date().toISOString();
      
      // Get notification details
      const result = await client.execute(`SELECT * FROM notifications WHERE id = '${id}'`);
      if (result.rows.length === 0) {
        return { success: false, error: 'Notification not found' };
      }

      const notification = result.rows[0] as unknown as TursoNotification;
      
      // Simulate delivery (in production, integrate with FCM/APNs)
      const estimatedDelivery = notification.target_audience === 'all' ? 1000 : 100;
      
      await client.execute(`
        UPDATE notifications 
        SET status = 'sent', sent_at = '${now}', delivery_count = ${estimatedDelivery}, updated_at = '${now}'
        WHERE id = '${id}'
      `);

      return { success: true, deliveryCount: estimatedDelivery };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async deleteNotification(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const client = await this.getClient();
      await client.execute(`DELETE FROM notifications WHERE id = '${id}'`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getNotificationStats(): Promise<{
    total: number;
    sent: number;
    scheduled: number;
    draft: number;
    totalDeliveries: number;
    totalOpens: number;
    avgOpenRate: number;
  }> {
    try {
      const client = await this.getClient();
      await this.initNotificationsTable();

      const [total, sent, scheduled, draft, stats] = await Promise.all([
        client.execute('SELECT COUNT(*) as count FROM notifications'),
        client.execute("SELECT COUNT(*) as count FROM notifications WHERE status = 'sent'"),
        client.execute("SELECT COUNT(*) as count FROM notifications WHERE status = 'scheduled'"),
        client.execute("SELECT COUNT(*) as count FROM notifications WHERE status = 'draft'"),
        client.execute('SELECT SUM(delivery_count) as deliveries, SUM(open_count) as opens FROM notifications'),
      ]);

      const totalDeliveries = Number(stats.rows[0]?.deliveries || 0);
      const totalOpens = Number(stats.rows[0]?.opens || 0);
      const avgOpenRate = totalDeliveries > 0 ? (totalOpens / totalDeliveries) * 100 : 0;

      return {
        total: Number(total.rows[0]?.count || 0),
        sent: Number(sent.rows[0]?.count || 0),
        scheduled: Number(scheduled.rows[0]?.count || 0),
        draft: Number(draft.rows[0]?.count || 0),
        totalDeliveries,
        totalOpens,
        avgOpenRate,
      };
    } catch (error) {
      logger.error('Failed to get notification stats', error, 'TursoAdmin');
      return {
        total: 0,
        sent: 0,
        scheduled: 0,
        draft: 0,
        totalDeliveries: 0,
        totalOpens: 0,
        avgOpenRate: 0,
      };
    }
  }

  // ============================================================================
  // Bulk Operations
  // ============================================================================

  async bulkInsertUniversities(universities: Omit<University, 'id' | 'created_at' | 'updated_at'>[]): Promise<BulkOperationResult> {
    const startTime = Date.now();
    const errors: Array<{ index: number; error: string }> = [];
    let successCount = 0;

    for (let i = 0; i < universities.length; i++) {
      const result = await this.createUniversity(universities[i]);
      if (result.success) {
        successCount++;
      } else {
        errors.push({ index: i, error: result.error || 'Unknown error' });
      }
    }

    return {
      success: errors.length === 0,
      totalProcessed: universities.length,
      successCount,
      failureCount: errors.length,
      errors,
      duration: Date.now() - startTime,
    };
  }

  async bulkInsertScholarships(scholarships: Omit<Scholarship, 'id' | 'created_at' | 'updated_at'>[]): Promise<BulkOperationResult> {
    const startTime = Date.now();
    const errors: Array<{ index: number; error: string }> = [];
    let successCount = 0;

    for (let i = 0; i < scholarships.length; i++) {
      const result = await this.createScholarship(scholarships[i]);
      if (result.success) {
        successCount++;
      } else {
        errors.push({ index: i, error: result.error || 'Unknown error' });
      }
    }

    return {
      success: errors.length === 0,
      totalProcessed: scholarships.length,
      successCount,
      failureCount: errors.length,
      errors,
      duration: Date.now() - startTime,
    };
  }

  // ============================================================================
  // Data Export
  // ============================================================================

  async exportTableToJSON(table: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const client = await this.getClient();
      const result = await client.execute(`SELECT * FROM ${table}`);
      return { success: true, data: result.rows as any[] };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async exportTableToCSV(table: string): Promise<{ success: boolean; csv?: string; error?: string }> {
    try {
      const result = await this.exportTableToJSON(table);
      if (!result.success || !result.data) {
        return { success: false, error: result.error };
      }

      if (result.data.length === 0) {
        return { success: true, csv: '' };
      }

      const headers = Object.keys(result.data[0]);
      const csvRows = [
        headers.join(','),
        ...result.data.map(row => 
          headers.map(header => {
            const value = row[header];
            if (value === null || value === undefined) return '';
            const stringValue = String(value);
            return stringValue.includes(',') || stringValue.includes('"') 
              ? `"${stringValue.replace(/"/g, '""')}"` 
              : stringValue;
          }).join(',')
        ),
      ];

      return { success: true, csv: csvRows.join('\n') };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ============================================================================
  // Raw SQL Execution (for advanced admin operations)
  // ============================================================================

  async executeRawSQL(sql: string): Promise<{ success: boolean; rows?: any[]; error?: string }> {
    try {
      // Safety check - only allow SELECT statements for raw queries
      const normalizedSQL = sql.trim().toLowerCase();
      if (!normalizedSQL.startsWith('select')) {
        return { success: false, error: 'Only SELECT statements are allowed for raw SQL queries' };
      }

      const client = await this.getClient();
      const result = await client.execute(sql);
      return { success: true, rows: result.rows as any[] };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

// Export singleton instance
export const tursoAdminService = new TursoAdminService();

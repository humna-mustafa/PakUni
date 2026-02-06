/**
 * Hybrid Data Service Tests
 * 
 * Tests the Turso → bundled fallback architecture that powers all data in the app.
 * Critical for ensuring the app works even when Turso is unavailable.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock Turso service
const mockFetchUniversities = jest.fn();
const mockFetchScholarships = jest.fn();
const mockFetchEntryTests = jest.fn();
const mockFetchDeadlines = jest.fn();
const mockFetchPrograms = jest.fn();
const mockFetchCareers = jest.fn();
const mockFetchMeritFormulas = jest.fn();
const mockFetchMeritArchive = jest.fn();
const mockFetchJobMarketStats = jest.fn();
const mockGetJobMarketStatsByField = jest.fn();
const mockIsTursoAvailable = jest.fn();
const mockSearchUniversities = jest.fn();
const mockSearchScholarships = jest.fn();
const mockRefreshAllData = jest.fn();
const mockClearCache = jest.fn();
const mockGetLastSyncTime = jest.fn();

jest.mock('../../src/services/turso', () => ({
  fetchUniversities: mockFetchUniversities,
  fetchScholarships: mockFetchScholarships,
  fetchEntryTests: mockFetchEntryTests,
  fetchDeadlines: mockFetchDeadlines,
  fetchPrograms: mockFetchPrograms,
  fetchCareers: mockFetchCareers,
  fetchMeritFormulas: mockFetchMeritFormulas,
  fetchMeritArchive: mockFetchMeritArchive,
  fetchJobMarketStats: mockFetchJobMarketStats,
  getJobMarketStatsByField: mockGetJobMarketStatsByField,
  isTursoAvailable: mockIsTursoAvailable,
  searchUniversities: mockSearchUniversities,
  searchScholarships: mockSearchScholarships,
  refreshAllData: mockRefreshAllData,
  clearCache: mockClearCache,
  getLastSyncTime: mockGetLastSyncTime,
}));

// Mock bundled data
const MOCK_BUNDLED_UNIVERSITIES = [
  {id: 1, name: 'NUST', short_name: 'NUST', city: 'Islamabad', province: 'ICT', type: 'public'},
  {id: 2, name: 'LUMS', short_name: 'LUMS', city: 'Lahore', province: 'Punjab', type: 'private'},
];

const MOCK_BUNDLED_SCHOLARSHIPS = [
  {id: 'sc1', name: 'HEC Scholarship', provider: 'HEC', type: 'need_based', description: 'Need based', status: 'open', tuitionCoverage: 100},
  {id: 'sc2', name: 'Closed One', provider: 'Test', type: 'merit_based', description: 'Closed', status: 'closed', tuitionCoverage: 50},
];

const MOCK_BUNDLED_ENTRY_TESTS = [
  {id: 'et1', name: 'ECAT', test_date: '2026-06-15'},
];

const MOCK_BUNDLED_CAREERS = [
  {id: 'c1', name: 'Software Engineering', field: 'CS'},
];

const MOCK_BUNDLED_PROGRAMS = [
  {id: 'p1', name: 'BS Computer Science'},
];

const MOCK_BUNDLED_DEADLINES = [
  {id: 'd1', university: 'NUST', deadline: '2026-04-30'},
];

const MOCK_BUNDLED_FORMULAS = [
  {id: 'f1', university: 'NUST', formula: '40% matric + 60% test'},
];

const MOCK_BUNDLED_RECORDS = [
  {id: 'r1', year: 2024, university: 'NUST', merit: 89.5},
];

jest.mock('../../src/data/universities', () => ({
  UNIVERSITIES: MOCK_BUNDLED_UNIVERSITIES,
}));

jest.mock('../../src/data/scholarships', () => ({
  SCHOLARSHIPS: MOCK_BUNDLED_SCHOLARSHIPS,
}));

jest.mock('../../src/data/entryTests', () => ({
  ENTRY_TESTS_DATA: MOCK_BUNDLED_ENTRY_TESTS,
}));

jest.mock('../../src/data/careers', () => ({
  CAREER_FIELDS: [{id: 'cs', name: 'Computer Science'}],
  CAREER_PATHS: MOCK_BUNDLED_CAREERS,
}));

jest.mock('../../src/data/programs', () => ({
  PROGRAMS: MOCK_BUNDLED_PROGRAMS,
}));

jest.mock('../../src/data/deadlines', () => ({
  ADMISSION_DEADLINES: MOCK_BUNDLED_DEADLINES,
}));

jest.mock('../../src/data/meritFormulas', () => ({
  MERIT_FORMULAS: MOCK_BUNDLED_FORMULAS,
}));

jest.mock('../../src/data/meritArchive', () => ({
  MERIT_RECORDS: MOCK_BUNDLED_RECORDS,
}));

jest.mock('../../src/services/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(() => Promise.resolve({data: {user: null}})),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn(() => Promise.resolve({data: [], error: null})),
      insert: jest.fn(() => Promise.resolve({error: null})),
      delete: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
    })),
  },
}));

jest.mock('../../src/services/cache', () => ({
  cache: {
    get: jest.fn(() => Promise.resolve(null)),
    set: jest.fn(() => Promise.resolve()),
    remove: jest.fn(() => Promise.resolve()),
  },
  CACHE_KEYS: {
    ANNOUNCEMENTS: '@pakuni_announcements',
    USER_FAVORITES: '@pakuni_favorites',
    USER_CALCULATIONS: '@pakuni_calculations',
    USER_GOALS: '@pakuni_goals',
    USER_PROFILE: '@pakuni_profile',
  },
  CACHE_TTL: {
    ANNOUNCEMENTS: 3600000,
    USER_FAVORITES: 300000,
    USER_CALCULATIONS: 300000,
    USER_GOALS: 300000,
  },
}));

jest.mock('../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Must import AFTER mocks are set up
let hybridDataService: any;

describe('HybridDataService', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    
    // Default: Turso unavailable (bundled fallback)
    mockIsTursoAvailable.mockReturnValue(false);
    mockFetchUniversities.mockResolvedValue([]);
  });

  const loadService = async () => {
    const mod = require('../../src/services/hybridData');
    hybridDataService = mod.hybridDataService;
    // Let constructor initialize
    await new Promise(resolve => setTimeout(resolve, 50));
  };

  describe('Fallback to bundled data when Turso unavailable', () => {
    beforeEach(async () => {
      mockIsTursoAvailable.mockReturnValue(false);
      await loadService();
    });

    it('should return bundled universities when Turso is down', async () => {
      const result = await hybridDataService.getUniversities();
      expect(result).toEqual(MOCK_BUNDLED_UNIVERSITIES);
      expect(result.length).toBe(2);
    });

    it('should return bundled scholarships (excluding closed)', async () => {
      const result = await hybridDataService.getScholarships();
      // Should filter out 'closed' status
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('HEC Scholarship');
    });

    it('should return bundled entry tests', async () => {
      const result = await hybridDataService.getEntryTests();
      expect(result).toEqual(MOCK_BUNDLED_ENTRY_TESTS);
    });

    it('should return bundled programs', async () => {
      const result = await hybridDataService.getPrograms();
      expect(result).toEqual(MOCK_BUNDLED_PROGRAMS);
    });

    it('should return bundled careers', async () => {
      const result = await hybridDataService.getCareers();
      expect(result).toEqual(MOCK_BUNDLED_CAREERS);
    });

    it('should return bundled deadlines', async () => {
      const result = await hybridDataService.getDeadlines();
      expect(result).toEqual(MOCK_BUNDLED_DEADLINES);
    });

    it('should return bundled merit formulas', async () => {
      const result = await hybridDataService.getMeritFormulas();
      expect(result).toEqual(MOCK_BUNDLED_FORMULAS);
    });

    it('should return bundled merit archive', async () => {
      const result = await hybridDataService.getMeritArchive();
      expect(result).toEqual(MOCK_BUNDLED_RECORDS);
    });

    it('should return empty array for job market stats (no bundled fallback)', async () => {
      const result = await hybridDataService.getJobMarketStats();
      expect(result).toEqual([]);
    });
  });

  describe('Sync data sources', () => {
    it('should return universities synchronously from bundled', async () => {
      await loadService();
      const result = hybridDataService.getUniversitiesSync();
      expect(result).toEqual(MOCK_BUNDLED_UNIVERSITIES);
    });

    it('should return scholarships synchronously (excluding closed)', async () => {
      await loadService();
      const result = hybridDataService.getScholarshipsSync();
      expect(result.length).toBe(1);
    });

    it('should return career fields', async () => {
      await loadService();
      const fields = hybridDataService.getCareerFields();
      expect(fields).toBeDefined();
      expect(fields.length).toBe(1);
    });
  });

  describe('Search functionality with bundled fallback', () => {
    beforeEach(async () => {
      mockIsTursoAvailable.mockReturnValue(false);
      await loadService();
    });

    it('should search universities by name locally', async () => {
      const results = await hybridDataService.searchUniversities('NUST');
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('NUST');
    });

    it('should search universities by city locally', async () => {
      const results = await hybridDataService.searchUniversities('Lahore');
      expect(results.length).toBe(1);
      expect(results[0].short_name).toBe('LUMS');
    });

    it('should filter universities by province', async () => {
      const results = await hybridDataService.searchUniversities('', {province: 'Punjab'});
      expect(results.length).toBe(1);
      expect(results[0].province).toBe('Punjab');
    });

    it('should filter universities by type', async () => {
      const results = await hybridDataService.searchUniversities('', {type: 'public'});
      expect(results.length).toBe(1);
      expect(results[0].type).toBe('public');
    });

    it('should return all when province is "all"', async () => {
      const results = await hybridDataService.searchUniversities('', {province: 'all'});
      expect(results.length).toBe(2);
    });

    it('should search scholarships by name locally', async () => {
      const results = await hybridDataService.searchScholarships('HEC');
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('HEC Scholarship');
    });

    it('should filter scholarships by type', async () => {
      const results = await hybridDataService.searchScholarships('', {type: 'need_based'});
      expect(results.length).toBe(1);
    });
  });

  describe('User data (Supabase) - guest mode', () => {
    beforeEach(async () => {
      await loadService();
    });

    it('should return empty favorites for unauthenticated user', async () => {
      const result = await hybridDataService.getUserFavorites();
      expect(result).toEqual([]);
    });

    it('should save calculations locally for unauthenticated user', async () => {
      const result = await hybridDataService.saveCalculation({
        education_system: 'matric',
        matric_marks: 950,
        inter_marks: 900,
        calculated_merit: 85.5,
      });
      expect(result).toBe(true);
    });

    it('should return empty announcements on error', async () => {
      const result = await hybridDataService.getAnnouncements();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getUniversity by ID or short name', () => {
    beforeEach(async () => {
      mockIsTursoAvailable.mockReturnValue(false);
      await loadService();
    });

    it('should find university by short_name', async () => {
      const uni = await hybridDataService.getUniversity('NUST');
      expect(uni).toBeDefined();
      expect(uni?.name).toBe('NUST');
    });

    it('should find university by full name', async () => {
      const uni = await hybridDataService.getUniversity('LUMS');
      expect(uni).toBeDefined();
    });

    it('should return undefined for non-existent university', async () => {
      const uni = await hybridDataService.getUniversity('NONEXISTENT');
      expect(uni).toBeUndefined();
    });
  });

  describe('Cache and sync management', () => {
    beforeEach(async () => {
      await loadService();
    });

    it('should return sync status', async () => {
      mockGetLastSyncTime.mockResolvedValue(null);
      const status = await hybridDataService.getSyncStatus();
      expect(status).toHaveProperty('tursoConnected');
      expect(status).toHaveProperty('dataSource');
    });

    it('should handle clearUserCache without error', async () => {
      await expect(hybridDataService.clearUserCache()).resolves.not.toThrow();
    });

    it('should handle clearTursoCache without error', async () => {
      await expect(hybridDataService.clearTursoCache()).resolves.not.toThrow();
    });
  });
});

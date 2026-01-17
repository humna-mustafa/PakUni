/**
 * Turso Database Schema & Migration Guide
 * 
 * This file documents the required schema for the Turso database.
 * Run these migrations using: turso db shell pakuni-static-data
 * 
 * Schema Version: 3
 */

// ============================================================================
// UNIVERSITIES TABLE
// ============================================================================

/*
CREATE TABLE IF NOT EXISTS universities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'public', 'private', 'semi_government'
  province TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  website TEXT,
  email TEXT,
  phone TEXT,
  established_year INTEGER,
  ranking_hec TEXT,
  ranking_national INTEGER,
  is_hec_recognized INTEGER NOT NULL,
  logo_url TEXT,
  description TEXT,
  admission_url TEXT,
  campuses TEXT, -- JSON array
  status_notes TEXT,
  application_steps TEXT, -- JSON array
  -- Kaggle enhancement fields
  latitude REAL,
  longitude REAL,
  map_url TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  total_campuses INTEGER,
  campus_locations TEXT, -- JSON array
  updated_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_universities_province ON universities(province);
CREATE INDEX IF NOT EXISTS idx_universities_city ON universities(city);
CREATE INDEX IF NOT EXISTS idx_universities_ranking ON universities(ranking_national);
CREATE INDEX IF NOT EXISTS idx_universities_type ON universities(type);
CREATE INDEX IF NOT EXISTS idx_universities_updated_at ON universities(updated_at);
*/

// ============================================================================
// ENTRY TESTS TABLE
// ============================================================================

/*
CREATE TABLE IF NOT EXISTS entry_tests (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  conducting_body TEXT NOT NULL,
  description TEXT,
  applicable_for TEXT NOT NULL, -- JSON array
  registration_start TEXT,
  registration_deadline TEXT NOT NULL,
  test_date TEXT NOT NULL,
  result_date TEXT,
  website TEXT,
  fee REAL NOT NULL,
  eligibility TEXT, -- JSON array
  test_format TEXT, -- JSON object
  tips TEXT, -- JSON array
  provinces TEXT, -- JSON array
  status_notes TEXT,
  brand_colors TEXT, -- JSON object
  updated_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_entry_tests_date ON entry_tests(test_date);
CREATE INDEX IF NOT EXISTS idx_entry_tests_deadline ON entry_tests(registration_deadline);
CREATE INDEX IF NOT EXISTS idx_entry_tests_updated_at ON entry_tests(updated_at);
*/

// ============================================================================
// SCHOLARSHIPS TABLE
// ============================================================================

/*
CREATE TABLE IF NOT EXISTS scholarships (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  type TEXT NOT NULL,
  coverage_percentage REAL NOT NULL,
  monthly_stipend REAL,
  description TEXT,
  eligibility TEXT NOT NULL, -- JSON array
  deadline TEXT,
  website TEXT,
  how_to_apply TEXT, -- JSON array
  applicable_universities TEXT, -- JSON array
  is_active INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scholarships_provider ON scholarships(provider);
CREATE INDEX IF NOT EXISTS idx_scholarships_coverage ON scholarships(coverage_percentage);
CREATE INDEX IF NOT EXISTS idx_scholarships_active ON scholarships(is_active);
CREATE INDEX IF NOT EXISTS idx_scholarships_updated_at ON scholarships(updated_at);
*/

// ============================================================================
// DEADLINES TABLE
// ============================================================================

/*
CREATE TABLE IF NOT EXISTS deadlines (
  id TEXT PRIMARY KEY,
  university_id TEXT NOT NULL,
  university_name TEXT NOT NULL,
  university_short_name TEXT NOT NULL,
  program_type TEXT NOT NULL,
  program_category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  application_start_date TEXT NOT NULL,
  application_deadline TEXT NOT NULL,
  entry_test_date TEXT,
  result_date TEXT,
  class_start_date TEXT,
  fee REAL,
  link TEXT,
  status TEXT NOT NULL, -- 'open', 'closed', 'upcoming'
  updated_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (university_id) REFERENCES universities(id)
);

CREATE INDEX IF NOT EXISTS idx_deadlines_university ON deadlines(university_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_deadline ON deadlines(application_deadline);
CREATE INDEX IF NOT EXISTS idx_deadlines_status ON deadlines(status);
CREATE INDEX IF NOT EXISTS idx_deadlines_program_type ON deadlines(program_type);
CREATE INDEX IF NOT EXISTS idx_deadlines_updated_at ON deadlines(updated_at);
*/

// ============================================================================
// PROGRAMS TABLE
// ============================================================================

/*
CREATE TABLE IF NOT EXISTS programs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT,
  field TEXT NOT NULL,
  duration_years INTEGER NOT NULL,
  degree_type TEXT NOT NULL,
  description TEXT,
  eligibility TEXT, -- JSON array
  career_paths TEXT, -- JSON array
  entry_tests TEXT, -- JSON array
  updated_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_programs_field ON programs(field);
CREATE INDEX IF NOT EXISTS idx_programs_degree_type ON programs(degree_type);
CREATE INDEX IF NOT EXISTS idx_programs_updated_at ON programs(updated_at);
*/

// ============================================================================
// CAREERS TABLE
// ============================================================================

/*
CREATE TABLE IF NOT EXISTS careers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  field TEXT NOT NULL,
  description TEXT,
  salary_range_min REAL NOT NULL,
  salary_range_max REAL NOT NULL,
  demand_level TEXT NOT NULL, -- 'low', 'medium', 'high', 'very_high'
  growth_potential TEXT NOT NULL,
  required_education TEXT, -- JSON array
  skills_required TEXT, -- JSON array
  job_titles TEXT, -- JSON array
  -- Kaggle enhancement fields
  job_count INTEGER,
  top_cities TEXT, -- JSON array
  common_titles TEXT, -- JSON array
  market_trend TEXT, -- 'growing', 'stable', 'declining'
  updated_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_careers_field ON careers(field);
CREATE INDEX IF NOT EXISTS idx_careers_demand_level ON careers(demand_level);
CREATE INDEX IF NOT EXISTS idx_careers_job_count ON careers(job_count);
CREATE INDEX IF NOT EXISTS idx_careers_updated_at ON careers(updated_at);
*/

// ============================================================================
// MERIT FORMULAS TABLE
// ============================================================================

/*
CREATE TABLE IF NOT EXISTS merit_formulas (
  id TEXT PRIMARY KEY,
  university_id TEXT NOT NULL,
  university_name TEXT NOT NULL,
  program_category TEXT NOT NULL,
  matric_weight REAL NOT NULL,
  inter_weight REAL NOT NULL,
  entry_test_weight REAL NOT NULL,
  hafiz_bonus REAL,
  notes TEXT,
  updated_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (university_id) REFERENCES universities(id)
);

CREATE INDEX IF NOT EXISTS idx_merit_formulas_university ON merit_formulas(university_id);
CREATE INDEX IF NOT EXISTS idx_merit_formulas_program ON merit_formulas(program_category);
CREATE INDEX IF NOT EXISTS idx_merit_formulas_updated_at ON merit_formulas(updated_at);
*/

// ============================================================================
// MERIT ARCHIVE TABLE (Historical Merit Percentages)
// ============================================================================

/*
CREATE TABLE IF NOT EXISTS merit_archive (
  id TEXT PRIMARY KEY,
  university_id TEXT NOT NULL,
  university_name TEXT NOT NULL,
  program_name TEXT NOT NULL,
  year INTEGER NOT NULL,
  round INTEGER NOT NULL,
  merit_percentage REAL NOT NULL,
  closing_merit REAL,
  seats_available INTEGER,
  notes TEXT,
  updated_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (university_id) REFERENCES universities(id)
);

CREATE INDEX IF NOT EXISTS idx_merit_archive_university ON merit_archive(university_id);
CREATE INDEX IF NOT EXISTS idx_merit_archive_year ON merit_archive(year);
CREATE INDEX IF NOT EXISTS idx_merit_archive_program ON merit_archive(program_name);
CREATE INDEX IF NOT EXISTS idx_merit_archive_updated_at ON merit_archive(updated_at);
*/

// ============================================================================
// JOB MARKET STATS TABLE (From Kaggle Data)
// ============================================================================

/*
CREATE TABLE IF NOT EXISTS job_market_stats (
  id TEXT PRIMARY KEY,
  field TEXT NOT NULL,
  total_jobs INTEGER NOT NULL,
  top_skills TEXT, -- JSON array
  top_cities TEXT, -- JSON array
  demand_level TEXT NOT NULL,
  common_titles TEXT, -- JSON array
  updated_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_job_market_field ON job_market_stats(field);
CREATE INDEX IF NOT EXISTS idx_job_market_demand ON job_market_stats(demand_level);
CREATE INDEX IF NOT EXISTS idx_job_market_updated_at ON job_market_stats(updated_at);
*/

// ============================================================================
// MIGRATION NOTES
// ============================================================================

/*
To apply these migrations:

1. Copy all CREATE TABLE statements (without the asterisks and slashes)
2. Run in Turso Shell:
   turso db shell pakuni-static-data
   
3. Paste each CREATE TABLE statement and press Enter

4. Verify with:
   .tables
   .schema

Schema Version History:
- v1: Initial release (universities, entry_tests, scholarships, programs, careers, deadlines, merit_formulas, merit_archive)
- v2: Added job_market_stats table for Kaggle job market data
- v3: Enhanced universities with Kaggle geographic data (latitude, longitude, campus_locations)

Performance Tips:
- Indexes are created on commonly filtered columns (province, city, ranking, date fields)
- JSON columns use TEXT type for SQLite compatibility
- Foreign keys reference universities table for relational integrity
- All tables have updated_at for cache invalidation tracking

Maintenance:
- Run yearly: VACUUM; to optimize database size
- Monitor index performance: EXPLAIN QUERY PLAN SELECT...
- Backup regularly using: turso db dump
*/

export const TURSO_MIGRATION_V3 = {
  version: 3,
  tables: [
    'universities',
    'entry_tests',
    'scholarships',
    'deadlines',
    'programs',
    'careers',
    'merit_formulas',
    'merit_archive',
    'job_market_stats',
  ],
  lastUpdated: '2024-01-01T00:00:00Z',
  notes: 'Schema optimized for 500M free reads. All indexes created for common queries.',
};

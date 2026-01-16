-- Additional Schema for Kaggle-sourced Data
-- Focus: ENHANCE existing features with richer data

-- ============================================================================
-- 1. UNIVERSITY ENHANCEMENTS (geolocation, contact info, etc.)
-- Adds new columns to existing universities table
-- ============================================================================
ALTER TABLE universities ADD COLUMN IF NOT EXISTS latitude REAL;
ALTER TABLE universities ADD COLUMN IF NOT EXISTS longitude REAL;
ALTER TABLE universities ADD COLUMN IF NOT EXISTS map_url TEXT;
ALTER TABLE universities ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE universities ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE universities ADD COLUMN IF NOT EXISTS total_campuses INTEGER;
ALTER TABLE universities ADD COLUMN IF NOT EXISTS campus_locations TEXT; -- JSON array of campus cities

-- ============================================================================
-- 2. ENHANCED CAREER DATA (enrich existing careers table)
-- Job market insights aggregated by field
-- ============================================================================
ALTER TABLE careers ADD COLUMN IF NOT EXISTS job_count INTEGER; -- number of jobs in market
ALTER TABLE careers ADD COLUMN IF NOT EXISTS top_cities TEXT; -- JSON array of cities with most jobs
ALTER TABLE careers ADD COLUMN IF NOT EXISTS common_titles TEXT; -- JSON array of job titles
ALTER TABLE careers ADD COLUMN IF NOT EXISTS experience_levels TEXT; -- JSON: entry/mid/senior percentages
ALTER TABLE careers ADD COLUMN IF NOT EXISTS market_trend TEXT; -- 'growing', 'stable', 'declining'

-- ============================================================================
-- 3. JOB MARKET STATS (aggregate data for career guidance)
-- ============================================================================
CREATE TABLE IF NOT EXISTS job_market_stats (
  id TEXT PRIMARY KEY,
  field TEXT NOT NULL,
  total_jobs INTEGER,
  avg_experience_years REAL,
  top_skills TEXT, -- JSON array
  top_cities TEXT, -- JSON array  
  salary_indicator TEXT, -- 'low', 'medium', 'high', 'very_high'
  demand_level TEXT, -- 'low', 'medium', 'high', 'very_high'
  common_departments TEXT, -- JSON array
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_job_stats_field ON job_market_stats(field);

-- ============================================================================
-- 4. PROGRAM ENHANCEMENTS (link programs to job market)
-- ============================================================================
ALTER TABLE programs ADD COLUMN IF NOT EXISTS job_demand TEXT; -- 'low', 'medium', 'high'
ALTER TABLE programs ADD COLUMN IF NOT EXISTS avg_starting_salary TEXT;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS top_employers TEXT; -- JSON array
ALTER TABLE programs ADD COLUMN IF NOT EXISTS market_outlook TEXT;

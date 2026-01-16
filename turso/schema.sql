-- PakUni Static Data Schema for Turso
-- This schema stores all static reference data that doesn't require user relationships
-- Benefits: 500M free reads, reduced Supabase load, scalable nationwide

-- ============================================
-- UNIVERSITIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS universities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('public', 'private', 'semi_government')),
    province TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT,
    website TEXT,
    email TEXT,
    phone TEXT,
    established_year INTEGER,
    ranking_hec TEXT,
    ranking_national INTEGER,
    is_hec_recognized INTEGER DEFAULT 1,
    logo_url TEXT,
    description TEXT,
    admission_url TEXT,
    campuses TEXT, -- JSON array
    status_notes TEXT,
    application_steps TEXT, -- JSON array
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for universities
CREATE INDEX IF NOT EXISTS idx_universities_province ON universities(province);
CREATE INDEX IF NOT EXISTS idx_universities_city ON universities(city);
CREATE INDEX IF NOT EXISTS idx_universities_type ON universities(type);
CREATE INDEX IF NOT EXISTS idx_universities_ranking ON universities(ranking_national);
CREATE INDEX IF NOT EXISTS idx_universities_short_name ON universities(short_name);

-- ============================================
-- ENTRY TESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS entry_tests (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    full_name TEXT NOT NULL,
    conducting_body TEXT NOT NULL,
    description TEXT,
    applicable_for TEXT, -- JSON array
    registration_start TEXT,
    registration_deadline TEXT NOT NULL,
    test_date TEXT NOT NULL,
    result_date TEXT,
    website TEXT,
    fee INTEGER DEFAULT 0,
    eligibility TEXT, -- JSON array
    test_format TEXT, -- JSON object
    tips TEXT, -- JSON array
    provinces TEXT, -- JSON array
    status_notes TEXT,
    brand_colors TEXT, -- JSON object
    application_steps TEXT, -- JSON array
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for entry tests
CREATE INDEX IF NOT EXISTS idx_entry_tests_test_date ON entry_tests(test_date);
CREATE INDEX IF NOT EXISTS idx_entry_tests_registration ON entry_tests(registration_deadline);
CREATE INDEX IF NOT EXISTS idx_entry_tests_name ON entry_tests(name);

-- ============================================
-- SCHOLARSHIPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS scholarships (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    provider TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('merit_based', 'need_based', 'sports', 'hafiz_e_quran', 'disabled', 'government', 'private', 'international')),
    coverage_percentage REAL DEFAULT 0,
    monthly_stipend REAL,
    description TEXT,
    eligibility TEXT, -- JSON array
    deadline TEXT,
    website TEXT,
    how_to_apply TEXT, -- JSON array
    applicable_universities TEXT, -- JSON array
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for scholarships
CREATE INDEX IF NOT EXISTS idx_scholarships_type ON scholarships(type);
CREATE INDEX IF NOT EXISTS idx_scholarships_coverage ON scholarships(coverage_percentage);
CREATE INDEX IF NOT EXISTS idx_scholarships_deadline ON scholarships(deadline);

-- ============================================
-- DEADLINES TABLE (Admission Deadlines)
-- ============================================
CREATE TABLE IF NOT EXISTS deadlines (
    id TEXT PRIMARY KEY,
    university_id TEXT,
    university_name TEXT NOT NULL,
    university_short_name TEXT NOT NULL,
    program_type TEXT NOT NULL,
    program_category TEXT,
    title TEXT NOT NULL,
    description TEXT,
    application_start_date TEXT,
    application_deadline TEXT NOT NULL,
    entry_test_date TEXT,
    result_date TEXT,
    class_start_date TEXT,
    fee INTEGER,
    link TEXT,
    status TEXT DEFAULT 'upcoming',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (university_id) REFERENCES universities(id)
);

-- Indexes for deadlines
CREATE INDEX IF NOT EXISTS idx_deadlines_university ON deadlines(university_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_deadline ON deadlines(application_deadline);
CREATE INDEX IF NOT EXISTS idx_deadlines_status ON deadlines(status);
CREATE INDEX IF NOT EXISTS idx_deadlines_program_type ON deadlines(program_type);

-- ============================================
-- PROGRAMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS programs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT,
    field TEXT NOT NULL,
    duration_years REAL DEFAULT 4,
    degree_type TEXT NOT NULL,
    description TEXT,
    eligibility TEXT, -- JSON array
    career_paths TEXT, -- JSON array
    entry_tests TEXT, -- JSON array
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for programs
CREATE INDEX IF NOT EXISTS idx_programs_field ON programs(field);
CREATE INDEX IF NOT EXISTS idx_programs_degree_type ON programs(degree_type);

-- ============================================
-- CAREERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS careers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    field TEXT NOT NULL,
    description TEXT,
    salary_range_min INTEGER,
    salary_range_max INTEGER,
    demand_level TEXT CHECK (demand_level IN ('high', 'medium', 'low')),
    growth_potential TEXT CHECK (growth_potential IN ('excellent', 'good', 'moderate', 'limited')),
    required_education TEXT, -- JSON array
    skills_required TEXT, -- JSON array
    job_titles TEXT, -- JSON array
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for careers
CREATE INDEX IF NOT EXISTS idx_careers_field ON careers(field);
CREATE INDEX IF NOT EXISTS idx_careers_demand ON careers(demand_level);

-- ============================================
-- MERIT FORMULAS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS merit_formulas (
    id TEXT PRIMARY KEY,
    university_id TEXT,
    university_name TEXT NOT NULL,
    program_category TEXT NOT NULL,
    matric_weight REAL NOT NULL,
    inter_weight REAL NOT NULL,
    entry_test_weight REAL NOT NULL,
    hafiz_bonus REAL DEFAULT 0,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (university_id) REFERENCES universities(id)
);

-- Indexes for merit formulas
CREATE INDEX IF NOT EXISTS idx_merit_formulas_university ON merit_formulas(university_id);
CREATE INDEX IF NOT EXISTS idx_merit_formulas_category ON merit_formulas(program_category);

-- ============================================
-- MERIT ARCHIVE TABLE (Historical Merit Data)
-- ============================================
CREATE TABLE IF NOT EXISTS merit_archive (
    id TEXT PRIMARY KEY,
    university_id TEXT,
    university_name TEXT NOT NULL,
    program_name TEXT NOT NULL,
    year INTEGER NOT NULL,
    round INTEGER DEFAULT 1,
    merit_percentage REAL NOT NULL,
    closing_merit REAL,
    seats_available INTEGER,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (university_id) REFERENCES universities(id)
);

-- Indexes for merit archive
CREATE INDEX IF NOT EXISTS idx_merit_archive_university ON merit_archive(university_id);
CREATE INDEX IF NOT EXISTS idx_merit_archive_year ON merit_archive(year);
CREATE INDEX IF NOT EXISTS idx_merit_archive_program ON merit_archive(program_name);

-- ============================================
-- DATA VERSION TABLE (For sync tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS data_versions (
    table_name TEXT PRIMARY KEY,
    version INTEGER DEFAULT 1,
    last_updated TEXT DEFAULT (datetime('now')),
    record_count INTEGER DEFAULT 0
);

-- Initialize version tracking
INSERT OR IGNORE INTO data_versions (table_name, version, record_count) VALUES
    ('universities', 1, 0),
    ('entry_tests', 1, 0),
    ('scholarships', 1, 0),
    ('deadlines', 1, 0),
    ('programs', 1, 0),
    ('careers', 1, 0),
    ('merit_formulas', 1, 0),
    ('merit_archive', 1, 0);

-- ============================================
-- TRIGGER: Auto-update timestamps
-- ============================================
CREATE TRIGGER IF NOT EXISTS update_universities_timestamp 
    AFTER UPDATE ON universities
    BEGIN
        UPDATE universities SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_entry_tests_timestamp 
    AFTER UPDATE ON entry_tests
    BEGIN
        UPDATE entry_tests SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_scholarships_timestamp 
    AFTER UPDATE ON scholarships
    BEGIN
        UPDATE scholarships SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_deadlines_timestamp 
    AFTER UPDATE ON deadlines
    BEGIN
        UPDATE deadlines SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

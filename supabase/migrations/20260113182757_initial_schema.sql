-- PakUni Database Schema
-- Pakistan University & Career Hub

-- ============================================
-- ENUMS
-- ============================================


CREATE TYPE education_system AS ENUM (
  'fsc_pre_medical',
  'fsc_pre_engineering', 
  'ics',
  'icom',
  'fa',
  'dae',
  'o_levels',
  'a_levels'
);

CREATE TYPE university_type AS ENUM (
  'public',
  'private',
  'semi_government'
);

CREATE TYPE province AS ENUM (
  'punjab',
  'sindh',
  'kpk',
  'balochistan',
  'islamabad',
  'azad_kashmir',
  'gilgit_baltistan'
);

CREATE TYPE scholarship_type AS ENUM (
  'merit_based',
  'need_based',
  'sports',
  'hafiz_e_quran',
  'disabled',
  'government',
  'private'
);

CREATE TYPE program_level AS ENUM (
  'bachelor',
  'master',
  'phd',
  'diploma',
  'certificate'
);

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  education_system education_system,
  matric_marks DECIMAL(5,2),
  matric_total DECIMAL(5,2) DEFAULT 1100,
  inter_marks DECIMAL(5,2),
  inter_total DECIMAL(5,2) DEFAULT 1100,
  entry_test_score DECIMAL(5,2),
  entry_test_total DECIMAL(5,2) DEFAULT 100,
  preferred_province province,
  preferred_field TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- UNIVERSITIES
-- ============================================

CREATE TABLE universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  short_name TEXT,
  type university_type NOT NULL,
  province province NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  website TEXT,
  email TEXT,
  phone TEXT,
  established_year INTEGER,
  ranking_national INTEGER,
  ranking_hec TEXT,
  is_hec_recognized BOOLEAN DEFAULT true,
  admission_open BOOLEAN DEFAULT false,
  admission_deadline DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (public read)
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Universities are publicly readable" ON universities
  FOR SELECT USING (true);

-- ============================================
-- FIELDS OF STUDY (Categories)
-- ============================================

CREATE TABLE fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fields are publicly readable" ON fields
  FOR SELECT USING (true);

-- ============================================
-- PROGRAMS / DEGREES
-- ============================================

CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
  field_id UUID REFERENCES fields(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  degree_title TEXT, -- e.g., MBBS, BS Computer Science
  level program_level NOT NULL,
  duration_years DECIMAL(3,1),
  credit_hours INTEGER,
  description TEXT,
  eligibility_criteria TEXT,
  required_education education_system[],
  min_percentage DECIMAL(5,2),
  seats_total INTEGER,
  seats_merit INTEGER,
  seats_self_finance INTEGER,
  is_morning BOOLEAN DEFAULT true,
  is_evening BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Programs are publicly readable" ON programs
  FOR SELECT USING (true);

-- ============================================
-- FEE STRUCTURE
-- ============================================

CREATE TABLE fee_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  admission_fee DECIMAL(10,2),
  tuition_per_semester DECIMAL(10,2),
  tuition_per_year DECIMAL(10,2),
  security_deposit DECIMAL(10,2),
  exam_fee DECIMAL(10,2),
  lab_fee DECIMAL(10,2),
  library_fee DECIMAL(10,2),
  hostel_fee_per_month DECIMAL(10,2),
  transport_fee_per_month DECIMAL(10,2),
  total_estimated_cost DECIMAL(12,2),
  is_self_finance BOOLEAN DEFAULT false,
  currency TEXT DEFAULT 'PKR',
  academic_year TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fee structures are publicly readable" ON fee_structures
  FOR SELECT USING (true);

-- ============================================
-- ENTRY TESTS
-- ============================================

CREATE TABLE entry_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- MDCAT, ECAT, NTS, etc.
  short_name TEXT,
  description TEXT,
  conducting_body TEXT,
  applicable_fields UUID[], -- Array of field IDs (no FK constraint on arrays)
  test_date DATE,
  registration_deadline DATE,
  registration_fee DECIMAL(10,2),
  website TEXT,
  syllabus_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE entry_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Entry tests are publicly readable" ON entry_tests
  FOR SELECT USING (true);

-- Junction table for entry tests and fields (proper many-to-many)
CREATE TABLE entry_test_fields (
  entry_test_id UUID REFERENCES entry_tests(id) ON DELETE CASCADE,
  field_id UUID REFERENCES fields(id) ON DELETE CASCADE,
  PRIMARY KEY (entry_test_id, field_id)
);

ALTER TABLE entry_test_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Entry test fields are publicly readable" ON entry_test_fields
  FOR SELECT USING (true);

-- ============================================
-- SCHOLARSHIPS
-- ============================================

CREATE TABLE scholarships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider TEXT, -- Government, University name, Private org
  type scholarship_type NOT NULL,
  description TEXT,
  eligibility_criteria TEXT,
  coverage_percentage DECIMAL(5,2), -- 100% = full scholarship
  covers_tuition BOOLEAN DEFAULT true,
  covers_hostel BOOLEAN DEFAULT false,
  covers_books BOOLEAN DEFAULT false,
  monthly_stipend DECIMAL(10,2),
  application_deadline DATE,
  application_url TEXT,
  required_documents TEXT[],
  min_percentage DECIMAL(5,2),
  max_family_income DECIMAL(12,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Scholarships are publicly readable" ON scholarships
  FOR SELECT USING (true);

-- ============================================
-- UNIVERSITY SCHOLARSHIPS (Junction)
-- ============================================

CREATE TABLE university_scholarships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
  scholarship_id UUID REFERENCES scholarships(id) ON DELETE CASCADE,
  additional_criteria TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(university_id, scholarship_id)
);

ALTER TABLE university_scholarships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "University scholarships are publicly readable" ON university_scholarships
  FOR SELECT USING (true);

-- ============================================
-- MERIT FORMULAS
-- ============================================

CREATE TABLE merit_formulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  field_id UUID REFERENCES fields(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  matric_weightage DECIMAL(5,2) DEFAULT 10,
  inter_weightage DECIMAL(5,2) DEFAULT 40,
  entry_test_weightage DECIMAL(5,2) DEFAULT 50,
  hafiz_bonus DECIMAL(5,2) DEFAULT 0,
  sports_bonus DECIMAL(5,2) DEFAULT 0,
  formula_expression TEXT, -- For complex formulas
  applicable_education education_system[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE merit_formulas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merit formulas are publicly readable" ON merit_formulas
  FOR SELECT USING (true);

-- ============================================
-- USER CALCULATIONS (Saved History)
-- ============================================

CREATE TABLE user_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  formula_id UUID REFERENCES merit_formulas(id) ON DELETE SET NULL,
  university_name TEXT,
  program_name TEXT,
  education_system education_system,
  matric_marks DECIMAL(5,2),
  matric_total DECIMAL(5,2),
  inter_marks DECIMAL(5,2),
  inter_total DECIMAL(5,2),
  entry_test_marks DECIMAL(5,2),
  entry_test_total DECIMAL(5,2),
  calculated_aggregate DECIMAL(5,2),
  is_hafiz BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own calculations" ON user_calculations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calculations" ON user_calculations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own calculations" ON user_calculations
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- USER BOOKMARKS
-- ============================================

CREATE TABLE user_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  scholarship_id UUID REFERENCES scholarships(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT bookmark_has_target CHECK (
    university_id IS NOT NULL OR 
    program_id IS NOT NULL OR 
    scholarship_id IS NOT NULL
  )
);

ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks" ON user_bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks" ON user_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" ON user_bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_universities_province ON universities(province);
CREATE INDEX idx_universities_city ON universities(city);
CREATE INDEX idx_universities_type ON universities(type);
CREATE INDEX idx_programs_university ON programs(university_id);
CREATE INDEX idx_programs_field ON programs(field_id);
CREATE INDEX idx_programs_level ON programs(level);
CREATE INDEX idx_fee_structures_program ON fee_structures(program_id);
CREATE INDEX idx_scholarships_type ON scholarships(type);
CREATE INDEX idx_user_calculations_user ON user_calculations(user_id);
CREATE INDEX idx_user_bookmarks_user ON user_bookmarks(user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_universities_updated_at
  BEFORE UPDATE ON universities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_scholarships_updated_at
  BEFORE UPDATE ON scholarships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- SEED DATA: Fields of Study
-- ============================================

INSERT INTO fields (name, slug, description, icon) VALUES
('Medical & Health Sciences', 'medical', 'MBBS, BDS, Pharmacy, Nursing, Allied Health', '🏥'),
('Engineering & Technology', 'engineering', 'Civil, Mechanical, Electrical, Computer, Software Engineering', '⚙️'),
('Computer Science & IT', 'computer-science', 'CS, IT, Software Engineering, Data Science, AI', '💻'),
('Business & Commerce', 'business', 'BBA, MBA, Accounting, Finance, Marketing', '📊'),
('Arts & Humanities', 'arts', 'English, Urdu, History, Islamic Studies, Philosophy', '📚'),
('Natural Sciences', 'sciences', 'Physics, Chemistry, Biology, Mathematics', '🔬'),
('Social Sciences', 'social-sciences', 'Psychology, Sociology, Political Science, Economics', '🌍'),
('Law & Legal Studies', 'law', 'LLB, LLM, Legal Studies', '⚖️'),
('Agriculture & Veterinary', 'agriculture', 'Agriculture, Veterinary Sciences, Food Technology', '🌾'),
('Architecture & Design', 'architecture', 'Architecture, Interior Design, Urban Planning', '🏛️'),
('Media & Communication', 'media', 'Mass Communication, Journalism, Media Studies', '📺'),
('Education', 'education', 'B.Ed, M.Ed, Teaching Programs', '🎓');

-- ============================================
-- SEED DATA: Sample Universities
-- ============================================

INSERT INTO universities (name, short_name, type, province, city, description, established_year, ranking_hec, is_hec_recognized, website) VALUES
('University of the Punjab', 'PU', 'public', 'punjab', 'Lahore', 'Oldest and largest public university in Pakistan', 1882, 'W4', true, 'https://pu.edu.pk'),
('Quaid-i-Azam University', 'QAU', 'public', 'islamabad', 'Islamabad', 'Leading research university in natural and social sciences', 1967, 'W4', true, 'https://qau.edu.pk'),
('LUMS', 'LUMS', 'private', 'punjab', 'Lahore', 'Lahore University of Management Sciences - Premier business and technology school', 1985, 'W4', true, 'https://lums.edu.pk'),
('NUST', 'NUST', 'public', 'islamabad', 'Islamabad', 'National University of Sciences and Technology - Top engineering university', 1991, 'W4', true, 'https://nust.edu.pk'),
('COMSATS University', 'COMSATS', 'public', 'islamabad', 'Islamabad', 'Leading IT and technology university with multiple campuses', 1998, 'W4', true, 'https://comsats.edu.pk'),
('University of Karachi', 'KU', 'public', 'sindh', 'Karachi', 'Largest university in Sindh', 1951, 'W4', true, 'https://uok.edu.pk'),
('FAST-NUCES', 'FAST', 'private', 'punjab', 'Lahore', 'National University of Computer and Emerging Sciences', 2000, 'W4', true, 'https://nu.edu.pk'),
('UET Lahore', 'UET', 'public', 'punjab', 'Lahore', 'University of Engineering and Technology - Premier engineering institution', 1921, 'W4', true, 'https://uet.edu.pk'),
('King Edward Medical University', 'KEMU', 'public', 'punjab', 'Lahore', 'Premier medical university in Pakistan', 1860, 'W4', true, 'https://kemu.edu.pk'),
('Aga Khan University', 'AKU', 'private', 'sindh', 'Karachi', 'Leading private medical and nursing university', 1983, 'W4', true, 'https://aku.edu');

-- ============================================
-- SEED DATA: Sample Merit Formulas
-- ============================================

INSERT INTO merit_formulas (name, description, matric_weightage, inter_weightage, entry_test_weightage, applicable_education) VALUES
('UHS Medical Merit (MDCAT)', 'Punjab Medical Colleges merit formula', 10, 40, 50, ARRAY['fsc_pre_medical']::education_system[]),
('UET Engineering Merit (ECAT)', 'Punjab Engineering Colleges merit formula', 10, 40, 50, ARRAY['fsc_pre_engineering', 'dae']::education_system[]),
('General University Merit', 'Standard 40-60 formula for most universities', 40, 60, 0, ARRAY['fsc_pre_medical', 'fsc_pre_engineering', 'ics', 'icom', 'fa']::education_system[]),
('NUST NET Based Merit', 'NUST admission formula with NET test', 15, 25, 60, ARRAY['fsc_pre_engineering', 'a_levels']::education_system[]),
('HEC Need Based', 'HEC scholarship merit calculation', 50, 50, 0, ARRAY['fsc_pre_medical', 'fsc_pre_engineering', 'ics', 'icom', 'fa', 'dae']::education_system[]);

-- ============================================
-- SEED DATA: Sample Scholarships
-- ============================================

INSERT INTO scholarships (name, provider, type, description, coverage_percentage, covers_tuition, covers_hostel, monthly_stipend, min_percentage, is_active) VALUES
('HEC Need Based Scholarship', 'Higher Education Commission', 'need_based', 'Full tuition waiver for financially deserving students', 100, true, false, 5000, 60, true),
('PEEF Scholarship', 'Punjab Educational Endowment Fund', 'need_based', 'For Punjab domicile students from low-income families', 100, true, true, 8000, 60, true),
('Ehsaas Undergraduate Scholarship', 'Government of Pakistan', 'need_based', 'Fully funded scholarship for deserving students', 100, true, true, 4000, 60, true),
('Merit Scholarship', 'Various Universities', 'merit_based', 'For students with exceptional academic performance', 50, true, false, 0, 85, true),
('Hafiz-e-Quran Scholarship', 'Various Universities', 'hafiz_e_quran', 'Tuition discount for Hafiz-e-Quran students', 25, true, false, 0, 0, true);

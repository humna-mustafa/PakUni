-- Migration: Admin Data Management Tables
-- Creates tables for merit lists, entry test dates, and admission dates

-- ============================================================================
-- Merit Lists Table
-- Stores university program merit/closing percentages
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.merit_lists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    university_id UUID REFERENCES public.universities(id) ON DELETE SET NULL,
    university_name TEXT NOT NULL,
    program_name TEXT NOT NULL,
    merit_percentage DECIMAL(5, 2) NOT NULL CHECK (merit_percentage >= 0 AND merit_percentage <= 100),
    year INTEGER NOT NULL CHECK (year >= 2000 AND year <= 2100),
    round INTEGER NOT NULL DEFAULT 1 CHECK (round >= 1 AND round <= 10),
    seats_available INTEGER CHECK (seats_available >= 0),
    closing_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for merit_lists
CREATE INDEX IF NOT EXISTS idx_merit_lists_university ON public.merit_lists(university_name);
CREATE INDEX IF NOT EXISTS idx_merit_lists_program ON public.merit_lists(program_name);
CREATE INDEX IF NOT EXISTS idx_merit_lists_year ON public.merit_lists(year);
CREATE INDEX IF NOT EXISTS idx_merit_lists_merit ON public.merit_lists(merit_percentage);

-- Enable RLS
ALTER TABLE public.merit_lists ENABLE ROW LEVEL SECURITY;

-- Policies for merit_lists
CREATE POLICY "Merit lists are viewable by everyone"
    ON public.merit_lists FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage merit lists"
    ON public.merit_lists FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin', 'content_editor')
        )
    );

-- ============================================================================
-- Entry Test Dates Table
-- Stores information about entry tests (MDCAT, ECAT, NAT, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.entry_test_dates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    test_name TEXT NOT NULL,
    conducting_body TEXT NOT NULL,
    test_date DATE NOT NULL,
    registration_start DATE,
    registration_end DATE NOT NULL,
    result_date DATE,
    fee INTEGER CHECK (fee >= 0),
    website TEXT,
    description TEXT,
    eligibility TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for entry_test_dates
CREATE INDEX IF NOT EXISTS idx_entry_tests_name ON public.entry_test_dates(test_name);
CREATE INDEX IF NOT EXISTS idx_entry_tests_date ON public.entry_test_dates(test_date);
CREATE INDEX IF NOT EXISTS idx_entry_tests_active ON public.entry_test_dates(is_active);
CREATE INDEX IF NOT EXISTS idx_entry_tests_reg_end ON public.entry_test_dates(registration_end);

-- Enable RLS
ALTER TABLE public.entry_test_dates ENABLE ROW LEVEL SECURITY;

-- Policies for entry_test_dates
CREATE POLICY "Entry test dates are viewable by everyone"
    ON public.entry_test_dates FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage entry test dates"
    ON public.entry_test_dates FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin', 'content_editor')
        )
    );

-- ============================================================================
-- Admission Dates Table
-- Stores university admission periods
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.admission_dates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    university_id UUID REFERENCES public.universities(id) ON DELETE SET NULL,
    university_name TEXT NOT NULL,
    program_type TEXT NOT NULL CHECK (program_type IN ('undergraduate', 'graduate', 'phd', 'diploma', 'certificate')),
    admission_start DATE NOT NULL,
    admission_end DATE NOT NULL,
    classes_start DATE,
    fee_deadline DATE,
    year INTEGER NOT NULL CHECK (year >= 2000 AND year <= 2100),
    semester TEXT CHECK (semester IN ('fall', 'spring', 'summer')),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for admission_dates
CREATE INDEX IF NOT EXISTS idx_admission_dates_university ON public.admission_dates(university_name);
CREATE INDEX IF NOT EXISTS idx_admission_dates_year ON public.admission_dates(year);
CREATE INDEX IF NOT EXISTS idx_admission_dates_program_type ON public.admission_dates(program_type);
CREATE INDEX IF NOT EXISTS idx_admission_dates_active ON public.admission_dates(is_active);
CREATE INDEX IF NOT EXISTS idx_admission_dates_start ON public.admission_dates(admission_start);

-- Enable RLS
ALTER TABLE public.admission_dates ENABLE ROW LEVEL SECURITY;

-- Policies for admission_dates
CREATE POLICY "Admission dates are viewable by everyone"
    ON public.admission_dates FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage admission dates"
    ON public.admission_dates FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin', 'content_editor')
        )
    );

-- ============================================================================
-- Insert Sample Data for Testing
-- ============================================================================

-- Sample merit lists
INSERT INTO public.merit_lists (university_name, program_name, merit_percentage, year, round, seats_available, closing_date) VALUES
    ('NUST', 'BS Computer Science', 89.5, 2024, 1, 120, '2024-09-15'),
    ('NUST', 'BS Electrical Engineering', 87.2, 2024, 1, 100, '2024-09-15'),
    ('LUMS', 'BS Computer Science', 92.0, 2024, 1, 80, '2024-08-30'),
    ('FAST-NUCES', 'BS Software Engineering', 82.5, 2024, 1, 200, '2024-09-20'),
    ('FAST-NUCES', 'BS Computer Science', 84.0, 2024, 1, 180, '2024-09-20'),
    ('COMSATS', 'BS Computer Science', 75.5, 2024, 1, 150, '2024-09-25'),
    ('Punjab University', 'MBBS', 91.0, 2024, 1, 350, '2024-10-01'),
    ('King Edward Medical University', 'MBBS', 93.5, 2024, 1, 400, '2024-10-01'),
    ('UET Lahore', 'BS Civil Engineering', 78.0, 2024, 1, 200, '2024-09-18'),
    ('UET Lahore', 'BS Computer Science', 85.0, 2024, 1, 120, '2024-09-18')
ON CONFLICT DO NOTHING;

-- Sample entry test dates
INSERT INTO public.entry_test_dates (test_name, conducting_body, test_date, registration_start, registration_end, result_date, fee, website, is_active) VALUES
    ('MDCAT', 'PMC (Pakistan Medical Commission)', '2024-08-25', '2024-06-01', '2024-07-31', '2024-09-15', 5500, 'https://www.pmc.gov.pk', true),
    ('ECAT', 'UET Lahore', '2024-07-21', '2024-05-15', '2024-06-30', '2024-08-10', 3500, 'https://ecat.uet.edu.pk', true),
    ('NAT-IE', 'NTS', '2024-06-30', '2024-05-01', '2024-06-15', '2024-07-15', 2000, 'https://nts.org.pk', true),
    ('NAT-ICS', 'NTS', '2024-06-30', '2024-05-01', '2024-06-15', '2024-07-15', 2000, 'https://nts.org.pk', true),
    ('GAT General', 'NTS', '2024-09-15', '2024-07-01', '2024-08-31', '2024-10-01', 2500, 'https://nts.org.pk', true),
    ('HAT', 'HEC', '2024-06-20', '2024-04-15', '2024-05-31', '2024-07-10', 1500, 'https://hec.gov.pk', true),
    ('NUMS Entry Test', 'NUMS', '2024-08-10', '2024-06-01', '2024-07-15', '2024-08-25', 4000, 'https://nums.edu.pk', true),
    ('NUST NET', 'NUST', '2024-07-14', '2024-04-01', '2024-06-30', '2024-08-01', 4500, 'https://nust.edu.pk', true),
    ('LUMS SAT', 'LUMS', '2024-03-09', '2024-01-01', '2024-02-15', '2024-04-01', 0, 'https://lums.edu.pk', true),
    ('FAST Entry Test', 'FAST-NUCES', '2024-07-07', '2024-05-01', '2024-06-20', '2024-07-20', 3000, 'https://nu.edu.pk', true)
ON CONFLICT DO NOTHING;

-- Sample admission dates
INSERT INTO public.admission_dates (university_name, program_type, admission_start, admission_end, classes_start, fee_deadline, year, semester, is_active) VALUES
    ('NUST', 'undergraduate', '2024-06-01', '2024-08-31', '2024-09-15', '2024-09-10', 2024, 'fall', true),
    ('LUMS', 'undergraduate', '2024-01-15', '2024-07-31', '2024-09-01', '2024-08-25', 2024, 'fall', true),
    ('FAST-NUCES', 'undergraduate', '2024-05-15', '2024-09-15', '2024-09-25', '2024-09-20', 2024, 'fall', true),
    ('COMSATS', 'undergraduate', '2024-06-01', '2024-09-20', '2024-10-01', '2024-09-25', 2024, 'fall', true),
    ('Punjab University', 'undergraduate', '2024-07-01', '2024-09-30', '2024-10-15', '2024-10-10', 2024, 'fall', true),
    ('UET Lahore', 'undergraduate', '2024-06-15', '2024-09-10', '2024-09-20', '2024-09-15', 2024, 'fall', true),
    ('NUST', 'graduate', '2024-06-01', '2024-08-15', '2024-09-01', '2024-08-25', 2024, 'fall', true),
    ('LUMS', 'graduate', '2024-02-01', '2024-06-30', '2024-09-01', '2024-08-20', 2024, 'fall', true),
    ('IBA Karachi', 'undergraduate', '2024-01-01', '2024-05-31', '2024-09-01', '2024-08-25', 2024, 'fall', true),
    ('AKU', 'undergraduate', '2024-03-01', '2024-07-31', '2024-09-15', '2024-09-10', 2024, 'fall', true)
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT ALL ON public.merit_lists TO authenticated;
GRANT ALL ON public.entry_test_dates TO authenticated;
GRANT ALL ON public.admission_dates TO authenticated;
GRANT SELECT ON public.merit_lists TO anon;
GRANT SELECT ON public.entry_test_dates TO anon;
GRANT SELECT ON public.admission_dates TO anon;

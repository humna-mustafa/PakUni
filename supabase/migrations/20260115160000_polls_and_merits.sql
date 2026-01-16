-- PakUni Database Schema Extension
-- Polls and Merit Lists Tables

-- ============================================
-- POLLS SYSTEM
-- ============================================

CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('campus', 'academics', 'facilities', 'career', 'overall')),
  is_active BOOLEAN DEFAULT true,
  total_votes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  short_name TEXT,
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  option_id UUID REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(poll_id, user_id) -- One vote per user per poll
);

-- Enable RLS
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Polls are publicly readable" ON polls FOR SELECT USING (true);
CREATE POLICY "Poll options are publicly readable" ON poll_options FOR SELECT USING (true);
CREATE POLICY "Users can view their own votes" ON poll_votes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can vote" ON poll_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to increment vote count
CREATE OR REPLACE FUNCTION increment_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE poll_options SET votes = votes + 1 WHERE id = NEW.option_id;
  UPDATE polls SET total_votes = total_votes + 1, updated_at = NOW() WHERE id = NEW.poll_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_poll_vote_insert
  AFTER INSERT ON poll_votes
  FOR EACH ROW EXECUTE FUNCTION increment_vote_count();

-- ============================================
-- MERIT LISTS ARCHIVE
-- ============================================

CREATE TABLE merit_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  program_name TEXT NOT NULL,
  program_code TEXT,
  year INTEGER NOT NULL CHECK (year >= 2015 AND year <= 2030),
  session TEXT DEFAULT 'Fall' CHECK (session IN ('Fall', 'Spring')),
  merit_type TEXT DEFAULT 'open' CHECK (merit_type IN ('open', 'self-finance', 'reserved', 'provincial')),
  category TEXT NOT NULL,
  
  -- Merit data
  opening_merit DECIMAL(5,2),
  closing_merit DECIMAL(5,2) NOT NULL,
  last_merit DECIMAL(5,2),
  
  -- Seats info
  total_seats INTEGER,
  merit_seats INTEGER,
  self_finance_seats INTEGER,
  
  -- Additional info
  applicants INTEGER,
  list_number INTEGER DEFAULT 1, -- 1st merit list, 2nd merit list, etc.
  
  -- Metadata
  city TEXT,
  campus TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE merit_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merit lists are publicly readable" ON merit_lists FOR SELECT USING (true);

-- Create index for faster queries
CREATE INDEX idx_merit_lists_university ON merit_lists(university_id);
CREATE INDEX idx_merit_lists_year ON merit_lists(year);
CREATE INDEX idx_merit_lists_category ON merit_lists(category);
CREATE INDEX idx_merit_lists_program ON merit_lists(program_name);

-- ============================================
-- SEED DATA FOR POLLS
-- ============================================

INSERT INTO polls (id, question, description, category) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Best Campus Life in Pakistan?', 'Which university offers the best overall campus experience?', 'campus'),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Best Computer Science Faculty?', 'Which university has the strongest CS department?', 'academics'),
  ('c3d4e5f6-a7b8-9012-cdef-012345678912', 'Best Engineering University?', 'Which university leads in engineering education?', 'academics'),
  ('d4e5f6a7-b8c9-0123-defa-123456789123', 'Best Sports Facilities?', 'Which university has the best sports infrastructure?', 'facilities'),
  ('e5f6a7b8-c9d0-1234-efab-234567890234', 'Best Medical University?', 'Which medical university is the best in Pakistan?', 'academics'),
  ('f6a7b8c9-d0e1-2345-fabc-345678901345', 'Best for Job Placements?', 'Which university has the highest job placement rate?', 'career'),
  ('a7b8c9d0-e1f2-3456-abcd-456789012456', 'Best Library & Research Facilities?', 'Which university has the best library and research resources?', 'facilities'),
  ('b8c9d0e1-f2a3-4567-bcde-567890123567', 'Best Business School?', 'Which university has the best MBA/BBA programs?', 'academics'),
  ('c9d0e1f2-a3b4-5678-cdef-678901234678', 'Best Hostel Facilities?', 'Which university provides the best hostel experience?', 'facilities'),
  ('d0e1f2a3-b4c5-6789-defa-789012345789', 'Overall Best University in Pakistan?', 'Considering everything - academics, facilities, career - which is the best?', 'overall');

-- Seed poll options
INSERT INTO poll_options (poll_id, name, short_name, votes) VALUES
  -- Best Campus Life
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'LUMS', 'LUMS', 2847),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'NUST', 'NUST', 3256),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'GIKI', 'GIKI', 1523),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'FAST-NU', 'FAST', 1892),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'IBA Karachi', 'IBA', 1124),
  
  -- Best CS Faculty
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'FAST-NU', 'FAST', 4521),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'NUST', 'NUST', 3892),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'LUMS', 'LUMS', 2156),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'COMSATS', 'CUI', 2834),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'ITU', 'ITU', 1245),
  
  -- Best Engineering
  ('c3d4e5f6-a7b8-9012-cdef-012345678912', 'NUST', 'NUST', 5234),
  ('c3d4e5f6-a7b8-9012-cdef-012345678912', 'UET Lahore', 'UET', 3156),
  ('c3d4e5f6-a7b8-9012-cdef-012345678912', 'GIKI', 'GIKI', 2987),
  ('c3d4e5f6-a7b8-9012-cdef-012345678912', 'NED Karachi', 'NED', 2145),
  ('c3d4e5f6-a7b8-9012-cdef-012345678912', 'PIEAS', 'PIEAS', 1823),
  
  -- Best Sports
  ('d4e5f6a7-b8c9-0123-defa-123456789123', 'LUMS', 'LUMS', 2156),
  ('d4e5f6a7-b8c9-0123-defa-123456789123', 'Punjab University', 'PU', 1845),
  ('d4e5f6a7-b8c9-0123-defa-123456789123', 'NUST', 'NUST', 2678),
  ('d4e5f6a7-b8c9-0123-defa-123456789123', 'UET Lahore', 'UET', 1234),
  ('d4e5f6a7-b8c9-0123-defa-123456789123', 'Quaid-e-Azam University', 'QAU', 987),
  
  -- Best Medical
  ('e5f6a7b8-c9d0-1234-efab-234567890234', 'Aga Khan University', 'AKU', 4567),
  ('e5f6a7b8-c9d0-1234-efab-234567890234', 'King Edward Medical', 'KEMU', 3892),
  ('e5f6a7b8-c9d0-1234-efab-234567890234', 'Dow University', 'DUHS', 2345),
  ('e5f6a7b8-c9d0-1234-efab-234567890234', 'Allama Iqbal Medical', 'AIMC', 1987),
  ('e5f6a7b8-c9d0-1234-efab-234567890234', 'Army Medical College', 'AMC', 2156),
  
  -- Best Job Placements
  ('f6a7b8c9-d0e1-2345-fabc-345678901345', 'LUMS', 'LUMS', 5123),
  ('f6a7b8c9-d0e1-2345-fabc-345678901345', 'IBA Karachi', 'IBA', 4567),
  ('f6a7b8c9-d0e1-2345-fabc-345678901345', 'NUST', 'NUST', 3845),
  ('f6a7b8c9-d0e1-2345-fabc-345678901345', 'FAST-NU', 'FAST', 2987),
  ('f6a7b8c9-d0e1-2345-fabc-345678901345', 'GIKI', 'GIKI', 1756),
  
  -- Best Library
  ('a7b8c9d0-e1f2-3456-abcd-456789012456', 'Quaid-e-Azam University', 'QAU', 2345),
  ('a7b8c9d0-e1f2-3456-abcd-456789012456', 'LUMS', 'LUMS', 3156),
  ('a7b8c9d0-e1f2-3456-abcd-456789012456', 'Punjab University', 'PU', 1987),
  ('a7b8c9d0-e1f2-3456-abcd-456789012456', 'NUST', 'NUST', 2678),
  ('a7b8c9d0-e1f2-3456-abcd-456789012456', 'University of Karachi', 'UoK', 1456),
  
  -- Best Business School
  ('b8c9d0e1-f2a3-4567-bcde-567890123567', 'LUMS', 'LUMS', 6234),
  ('b8c9d0e1-f2a3-4567-bcde-567890123567', 'IBA Karachi', 'IBA', 5892),
  ('b8c9d0e1-f2a3-4567-bcde-567890123567', 'Lahore School of Economics', 'LSE', 2156),
  ('b8c9d0e1-f2a3-4567-bcde-567890123567', 'NUST Business School', 'NBS', 2478),
  ('b8c9d0e1-f2a3-4567-bcde-567890123567', 'SZABIST', 'SZABIST', 1234),
  
  -- Best Hostel
  ('c9d0e1f2-a3b4-5678-cdef-678901234678', 'GIKI', 'GIKI', 3567),
  ('c9d0e1f2-a3b4-5678-cdef-678901234678', 'LUMS', 'LUMS', 2987),
  ('c9d0e1f2-a3b4-5678-cdef-678901234678', 'NUST', 'NUST', 2456),
  ('c9d0e1f2-a3b4-5678-cdef-678901234678', 'IBA Karachi', 'IBA', 1678),
  ('c9d0e1f2-a3b4-5678-cdef-678901234678', 'Air University', 'AU', 1234),
  
  -- Best Overall
  ('d0e1f2a3-b4c5-6789-defa-789012345789', 'LUMS', 'LUMS', 7845),
  ('d0e1f2a3-b4c5-6789-defa-789012345789', 'NUST', 'NUST', 8234),
  ('d0e1f2a3-b4c5-6789-defa-789012345789', 'Aga Khan University', 'AKU', 4567),
  ('d0e1f2a3-b4c5-6789-defa-789012345789', 'FAST-NU', 'FAST', 3892),
  ('d0e1f2a3-b4c5-6789-defa-789012345789', 'Quaid-e-Azam University', 'QAU', 3156);

-- Update total votes for each poll
UPDATE polls SET total_votes = (SELECT COALESCE(SUM(votes), 0) FROM poll_options WHERE poll_options.poll_id = polls.id);

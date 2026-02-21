-- ============================================================================
-- Data Corrections Table
-- Stores structured, field-level data correction submissions from users.
-- Users report wrong data on universities, scholarships, entry tests, etc.
-- Admin reviews before/after diffs and approves with a single tap.
-- Approved corrections are then applied to Turso via turso:shell or CLI.
-- ============================================================================

-- Create the data_corrections table
CREATE TABLE IF NOT EXISTS public.data_corrections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Entity being corrected
  entity_type   TEXT NOT NULL CHECK (entity_type IN (
    'university', 'scholarship', 'entry_test', 'career',
    'deadline', 'program', 'merit_archive'
  )),
  entity_id             TEXT NOT NULL,
  entity_display_name   TEXT NOT NULL,

  -- Structured corrections as JSON array of { fieldKey, fieldLabel, currentValue, proposedValue }
  corrections_json      TEXT NOT NULL,

  -- User's reasoning
  overall_reason        TEXT NOT NULL,
  source_proof          TEXT,         -- reference URL or citation
  reporter_note         TEXT,         -- any extra note from user

  -- Reporter
  user_id       TEXT NOT NULL,
  user_name     TEXT,
  user_email    TEXT,

  -- Workflow
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'under_review', 'approved', 'rejected', 'applied'
  )),
  priority      TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN (
    'low', 'medium', 'high', 'urgent'
  )),

  -- Admin review
  admin_notes   TEXT,
  reviewed_by   TEXT,
  reviewed_at   TIMESTAMPTZ,
  applied_at    TIMESTAMPTZ,

  -- Timestamps
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_data_corrections_status
  ON public.data_corrections (status);

CREATE INDEX IF NOT EXISTS idx_data_corrections_entity
  ON public.data_corrections (entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_data_corrections_user
  ON public.data_corrections (user_id);

CREATE INDEX IF NOT EXISTS idx_data_corrections_created
  ON public.data_corrections (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_data_corrections_priority
  ON public.data_corrections (priority, status);

-- ─── Auto-update updated_at ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_data_corrections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_data_corrections_updated_at ON public.data_corrections;
CREATE TRIGGER trg_data_corrections_updated_at
  BEFORE UPDATE ON public.data_corrections
  FOR EACH ROW EXECUTE FUNCTION public.update_data_corrections_updated_at();

-- ─── Row Level Security ──────────────────────────────────────────────────────
ALTER TABLE public.data_corrections ENABLE ROW LEVEL SECURITY;

-- Authenticated users can insert (submit corrections)
CREATE POLICY "users_can_insert_corrections" ON public.data_corrections
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

-- Users can see their own corrections
CREATE POLICY "users_can_view_own_corrections" ON public.data_corrections
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

-- Admins can view all corrections
CREATE POLICY "admins_can_view_all_corrections" ON public.data_corrections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('moderator', 'content_editor', 'admin', 'super_admin')
    )
  );

-- Admins can update corrections (approve / reject / mark applied)
CREATE POLICY "admins_can_update_corrections" ON public.data_corrections
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('moderator', 'content_editor', 'admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('moderator', 'content_editor', 'admin', 'super_admin')
    )
  );

-- Service-role bypass (for admin tooling)
CREATE POLICY "service_role_all" ON public.data_corrections
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─── Grant permissions ───────────────────────────────────────────────────────
GRANT SELECT, INSERT ON public.data_corrections TO authenticated;
GRANT UPDATE (status, admin_notes, reviewed_by, reviewed_at, applied_at) ON public.data_corrections TO authenticated;
GRANT ALL ON public.data_corrections TO service_role;

-- =============================================================================
-- ERROR REPORTS TABLE - User Error Reporting System
-- =============================================================================
-- This table stores user-reported errors from the mobile app.
-- Allows users to report issues they encounter and provides admin visibility
-- for debugging and improving user experience.
-- =============================================================================

-- Create error_reports table
CREATE TABLE IF NOT EXISTS error_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User who reported (nullable for anonymous reports)
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Error details
    error_message TEXT NOT NULL,
    error_name TEXT NOT NULL DEFAULT 'Error',
    error_stack TEXT,
    component_stack TEXT,
    
    -- Categorization
    category TEXT NOT NULL DEFAULT 'unknown',
    severity TEXT NOT NULL DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'new',
    
    -- Context
    screen_name TEXT,
    user_action TEXT,
    
    -- Device & Environment info
    device_info JSONB DEFAULT '{}',
    app_version TEXT,
    
    -- Additional data
    additional_context JSONB DEFAULT '{}',
    user_feedback TEXT,
    
    -- Occurrence tracking
    occurrence_count INTEGER DEFAULT 1,
    first_occurred_at TIMESTAMPTZ DEFAULT NOW(),
    last_occurred_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Admin resolution
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_error_reports_user_id ON error_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_error_reports_status ON error_reports(status);
CREATE INDEX IF NOT EXISTS idx_error_reports_severity ON error_reports(severity);
CREATE INDEX IF NOT EXISTS idx_error_reports_category ON error_reports(category);
CREATE INDEX IF NOT EXISTS idx_error_reports_created_at ON error_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_reports_error_name ON error_reports(error_name);
CREATE INDEX IF NOT EXISTS idx_error_reports_screen_name ON error_reports(screen_name);

-- Add RLS policies
ALTER TABLE error_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Users can create error reports
CREATE POLICY "Users can create error reports"
    ON error_reports
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy: Users can view their own error reports
CREATE POLICY "Users can view own error reports"
    ON error_reports
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Policy: Admins can view all error reports
CREATE POLICY "Admins can view all error reports"
    ON error_reports
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin', 'moderator')
        )
    );

-- Policy: Admins can update error reports
CREATE POLICY "Admins can update error reports"
    ON error_reports
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin', 'moderator')
        )
    );

-- Policy: Admins can delete error reports
CREATE POLICY "Admins can delete error reports"
    ON error_reports
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Policy: Anonymous error reports (for non-authenticated users)
CREATE POLICY "Allow anonymous error reports"
    ON error_reports
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_error_reports_updated_at ON error_reports;
CREATE TRIGGER update_error_reports_updated_at
    BEFORE UPDATE ON error_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE error_reports IS 'Stores user-reported errors from mobile app for admin review and debugging';
COMMENT ON COLUMN error_reports.category IS 'Error category: network, authentication, server, validation, permission, unknown';
COMMENT ON COLUMN error_reports.severity IS 'Error severity: low, medium, high, critical';
COMMENT ON COLUMN error_reports.status IS 'Report status: new, acknowledged, investigating, resolved, wont_fix';

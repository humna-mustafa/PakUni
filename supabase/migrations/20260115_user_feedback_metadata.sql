-- Add metadata column to user_feedback table for enhanced feedback details
-- This supports: bug severity, content types, material submissions, etc.

-- Add metadata column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_feedback' AND column_name = 'metadata') THEN
        ALTER TABLE user_feedback ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
END $$;

-- Update the user_feedback table to support more feedback types
-- Add new type values if type column exists
DO $$
BEGIN
    -- Ensure the type enum has all needed values
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'feedback_type') THEN
        CREATE TYPE feedback_type AS ENUM (
            'bug', 
            'feature_request', 
            'content_error', 
            'general', 
            'complaint',
            'material_submission'
        );
    END IF;
END $$;

-- Create index for faster metadata queries
CREATE INDEX IF NOT EXISTS idx_user_feedback_metadata 
ON user_feedback USING gin (metadata);

-- Create index for status filtering (common admin query)
CREATE INDEX IF NOT EXISTS idx_user_feedback_status 
ON user_feedback (status);

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_user_feedback_category 
ON user_feedback (category);

-- Comment on the metadata structure
COMMENT ON COLUMN user_feedback.metadata IS 
'JSON structure containing:
- feedbackType: Original feedback type (bug_report, feature_request, content_update, material_submission, general_feedback, complaint)
- severity: For bug reports (low, medium, high, critical)
- contentType: For content updates (university, scholarship, program, deadline, merit_list, other)
- materialType: For material submissions (merit_list, past_paper, study_guide, admission_guide, scholarship_info, other)
- universityName: Specific university name if applicable
- scholarshipName: Specific scholarship name if applicable
- materialUrl: URL/link to submitted material
- wouldRecommend: Whether user would recommend the app
- deviceInfo: Device/OS information
- appVersion: App version
- submittedAt: Submission timestamp';

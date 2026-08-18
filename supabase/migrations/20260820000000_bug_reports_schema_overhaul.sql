-- =====================================================================================
-- SUPABASE MIGRATION: BUG REPORTING & COORDINATION WORKFLOW OVERHAUL
-- =====================================================================================

-- Ensure all required columns exist for element fingerprinting, ancestor paths, 
-- and the bug-to-fix verification loop.
ALTER TABLE public.bug_reports
    ADD COLUMN IF NOT EXISTS reporter TEXT DEFAULT 'user',
    ADD COLUMN IF NOT EXISTS page_route TEXT,
    ADD COLUMN IF NOT EXISTS section_name TEXT,
    ADD COLUMN IF NOT EXISTS element_ancestor_path TEXT,
    ADD COLUMN IF NOT EXISTS element_data_attributes JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS viewport_size JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS fixed_in_files TEXT,
    ADD COLUMN IF NOT EXISTS fix_notes TEXT,
    ADD COLUMN IF NOT EXISTS verification_notes TEXT,
    ADD COLUMN IF NOT EXISTS fixed_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- Normalize existing statuses to lowercase standard
UPDATE public.bug_reports
SET status = 'open'
WHERE status = 'Open';

UPDATE public.bug_reports
SET status = 'in_review'
WHERE status = 'In Progress';

UPDATE public.bug_reports
SET status = 'verified_done'
WHERE status IN ('Resolved', 'Closed');

-- Set default status to 'open'
ALTER TABLE public.bug_reports 
    ALTER COLUMN status SET DEFAULT 'open';

-- Ensure helpful indexes for admin filtering and bug coordination queries
CREATE INDEX IF NOT EXISTS idx_bug_reports_section_name ON public.bug_reports(section_name);
CREATE INDEX IF NOT EXISTS idx_bug_reports_page_route ON public.bug_reports(page_route);
CREATE INDEX IF NOT EXISTS idx_bug_reports_status_created ON public.bug_reports(status, created_at DESC);

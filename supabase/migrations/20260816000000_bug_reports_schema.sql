-- =====================================================================================
-- SUPABASE MIGRATION: VISUAL BUG REPORTING SYSTEM
-- =====================================================================================

CREATE TABLE IF NOT EXISTS public.bug_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'UI Glitch',
    severity TEXT NOT NULL DEFAULT 'Medium',
    status TEXT NOT NULL DEFAULT 'Open',
    element_selector TEXT,
    element_tag TEXT,
    element_classes TEXT,
    element_position JSONB DEFAULT '{}'::jsonb,
    viewport JSONB DEFAULT '{}'::jsonb,
    route TEXT,
    screenshot_data TEXT,
    markdown_content TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone or authenticated users can create bug reports"
    ON public.bug_reports FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can view their own reports and admin can view all"
    ON public.bug_reports FOR SELECT
    USING (
        auth.uid() = user_id 
        OR auth.jwt()->>'email' = 'tungariyarahul08@gmail.com'
        OR user_id IS NULL
    );

CREATE POLICY "Admin can update bug reports"
    ON public.bug_reports FOR UPDATE
    USING (
        auth.jwt()->>'email' = 'tungariyarahul08@gmail.com'
        OR auth.uid() = user_id
    );

CREATE POLICY "Admin can delete bug reports"
    ON public.bug_reports FOR DELETE
    USING (
        auth.jwt()->>'email' = 'tungariyarahul08@gmail.com'
    );

-- Index on created_at and status for fast admin querying
CREATE INDEX IF NOT EXISTS idx_bug_reports_created_at ON public.bug_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON public.bug_reports(status);

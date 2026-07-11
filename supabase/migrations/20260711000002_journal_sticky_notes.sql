-- Create journal_sticky_notes table for quick thoughts inside the Journal module
CREATE TABLE IF NOT EXISTS public.journal_sticky_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL DEFAULT '',
    x NUMERIC NOT NULL DEFAULT 0,
    y NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.journal_sticky_notes ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies
DROP POLICY IF EXISTS "Manage journal_sticky_notes policy" ON public.journal_sticky_notes;
CREATE POLICY "Manage journal_sticky_notes policy" ON public.journal_sticky_notes
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS journal_sticky_notes_user_idx ON public.journal_sticky_notes (user_id);

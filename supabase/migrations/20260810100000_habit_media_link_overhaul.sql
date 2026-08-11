-- Migration: Consolidated app modifications
-- Updates media logs, consolidates links, and expands habits & reflections

-- 1. Recreate check constraint on media_logs.type to support SERIES and MOVIE
ALTER TABLE public.media_logs DROP CONSTRAINT IF EXISTS media_logs_type_check;
ALTER TABLE public.media_logs ADD CONSTRAINT media_logs_type_check CHECK (type IN ('ANIME', 'GAME', 'SERIES', 'MOVIE'));

-- 2. Expand links table for consolidation (type and term_type)
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'other';
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS term_type TEXT NOT NULL DEFAULT 'short' CHECK (term_type IN ('short', 'long'));

-- Migrate existing link_saver data to links table if table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'link_saver') THEN
    INSERT INTO public.links (id, user_id, url, title, type, saved_at)
    SELECT id, user_id, url, title, type, saved_at FROM public.link_saver
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- 3. Add columns to habits table for the advanced UX overhaul
ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS why_text TEXT DEFAULT '';
ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS habit_type TEXT DEFAULT 'generic';
ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS completion_details JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS target_time TEXT DEFAULT '';
ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS relationships JSONB DEFAULT '[]'::jsonb;

-- 4. Create daily reflections table
CREATE TABLE IF NOT EXISTS public.daily_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  score INTEGER CHECK (score >= 1 AND score <= 10),
  what_went_well TEXT DEFAULT '',
  blockers TEXT DEFAULT '',
  tomorrow_plan TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT daily_reflections_user_date_unique UNIQUE (user_id, date)
);

-- Enable RLS
ALTER TABLE public.daily_reflections ENABLE ROW LEVEL SECURITY;

-- Add RLS policy
DROP POLICY IF EXISTS "Users can manage their own reflections" ON public.daily_reflections;
CREATE POLICY "Users can manage their own reflections"
  ON public.daily_reflections
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index on daily reflections
CREATE INDEX IF NOT EXISTS daily_reflections_user_date_idx ON public.daily_reflections(user_id, date DESC);

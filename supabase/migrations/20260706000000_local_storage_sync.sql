-- Supabase Migration: Sync Settings and Coder Hub from localStorage to DB

-- 1. User Settings Table (Stores theme, drawing options like isometric grid, active sketch, and app preferences)
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'system')),
    countdown_template TEXT NOT NULL DEFAULT 'default',
    accent_color TEXT NOT NULL DEFAULT 'rose',
    animation_speed TEXT NOT NULL DEFAULT 'normal',
    compact_mode BOOLEAN NOT NULL DEFAULT false,
    sound_enabled BOOLEAN NOT NULL DEFAULT true,
    initial_bank_balance NUMERIC NOT NULL DEFAULT 0,
    initial_cash_balance NUMERIC NOT NULL DEFAULT 0,
    currency_symbol TEXT DEFAULT '$',
    active_sketch_id TEXT DEFAULT 'default',
    isometric_grid BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Sprints Table (Coder Hub Agile board sprints and task items)
CREATE TABLE IF NOT EXISTS public.sprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('planned', 'active', 'completed')),
    tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. DSA Problems Table (Coder Hub DSA progress log)
CREATE TABLE IF NOT EXISTS public.dsa_problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    platform TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    topic TEXT NOT NULL,
    link TEXT,
    status TEXT NOT NULL CHECK (status IN ('solved', 'review', 'revision')),
    notes TEXT,
    solved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TIL Logs Table (Coder Hub Today I Learned logs)
CREATE TABLE IF NOT EXISTS public.til_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Learning Roadmaps Table (Coder Hub custom roadmap checklists)
CREATE TABLE IF NOT EXISTS public.roadmaps (
    id TEXT PRIMARY KEY, -- Text keys are used for custom roadmaps (e.g. 'roadmap-frontend')
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Resources/Bookmarks Table (Coder Hub reading lists)
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    tags TEXT[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL CHECK (status IN ('to_read', 'reading', 'completed')),
    saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Developer Goals Table (Coder Hub milestones and targets)
CREATE TABLE IF NOT EXISTS public.dev_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target NUMERIC NOT NULL,
    current NUMERIC NOT NULL,
    metric TEXT NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dsa_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.til_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dev_goals ENABLE ROW LEVEL SECURITY;

-- Enable standard CRUD policies based on auth.uid()
DROP POLICY IF EXISTS "Manage user_settings policy" ON public.user_settings;
CREATE POLICY "Manage user_settings policy" ON public.user_settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Manage sprints policy" ON public.sprints;
CREATE POLICY "Manage sprints policy" ON public.sprints FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Manage dsa_problems policy" ON public.dsa_problems;
CREATE POLICY "Manage dsa_problems policy" ON public.dsa_problems FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Manage til_logs policy" ON public.til_logs;
CREATE POLICY "Manage til_logs policy" ON public.til_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Manage roadmaps policy" ON public.roadmaps;
CREATE POLICY "Manage roadmaps policy" ON public.roadmaps FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Manage resources policy" ON public.resources;
CREATE POLICY "Manage resources policy" ON public.resources FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Manage dev_goals policy" ON public.dev_goals;
CREATE POLICY "Manage dev_goals policy" ON public.dev_goals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create Indexes for performance
CREATE INDEX IF NOT EXISTS sprints_user_idx ON public.sprints (user_id);
CREATE INDEX IF NOT EXISTS dsa_problems_user_idx ON public.dsa_problems (user_id);
CREATE INDEX IF NOT EXISTS til_logs_user_idx ON public.til_logs (user_id);
CREATE INDEX IF NOT EXISTS roadmaps_user_idx ON public.roadmaps (user_id);
CREATE INDEX IF NOT EXISTS resources_user_idx ON public.resources (user_id);
CREATE INDEX IF NOT EXISTS dev_goals_user_idx ON public.dev_goals (user_id);

-- Add reduce_blur setting column to user_settings
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS reduce_blur BOOLEAN NOT NULL DEFAULT false;

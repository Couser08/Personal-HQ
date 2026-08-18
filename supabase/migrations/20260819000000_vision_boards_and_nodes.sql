-- ==============================================================================
-- Migration: Vision Boards, Canvas Nodes & Affirmations Schema
-- Description: Multi-board infinite canvas architecture with customizable node templates
-- ==============================================================================

-- 1. Vision Boards Table
CREATE TABLE IF NOT EXISTS public.vision_boards (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subtitle TEXT,
    category TEXT NOT NULL DEFAULT 'PERSONAL' CHECK (category IN ('FAVORITES', 'PERSONAL', 'CAREER', 'LIFESTYLE', 'OTHER')),
    icon TEXT DEFAULT '✨',
    is_favorite BOOLEAN NOT NULL DEFAULT false,
    theme TEXT NOT NULL DEFAULT 'dots' CHECK (theme IN ('dots', 'grid', 'blank')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Vision Nodes Table (Infinite Canvas Cards)
CREATE TABLE IF NOT EXISTS public.vision_nodes (
    id TEXT PRIMARY KEY,
    board_id TEXT NOT NULL REFERENCES public.vision_boards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('image', 'text', 'goal', 'quote', 'map', 'audio', 'skill', 'embed', 'shape')),
    title TEXT NOT NULL,
    subtitle TEXT,
    content TEXT,
    image_url TEXT,
    accent_color TEXT DEFAULT '#3b82f6',
    tags TEXT[] NOT NULL DEFAULT '{}',
    position_x NUMERIC NOT NULL DEFAULT 100,
    position_y NUMERIC NOT NULL DEFAULT 100,
    width NUMERIC NOT NULL DEFAULT 320,
    height NUMERIC NOT NULL DEFAULT 220,
    corner_radius INTEGER NOT NULL DEFAULT 20,
    has_shadow BOOLEAN NOT NULL DEFAULT true,
    has_border BOOLEAN NOT NULL DEFAULT false,
    link_url TEXT,
    progress INTEGER DEFAULT 0,
    goal_target INTEGER,
    goal_current INTEGER,
    goal_unit TEXT,
    map_pins JSONB DEFAULT '[]'::jsonb,
    audio_url TEXT,
    audio_duration TEXT DEFAULT '02:45',
    quote_author TEXT,
    font_family TEXT DEFAULT 'sans',
    font_size INTEGER DEFAULT 16,
    font_weight TEXT DEFAULT 'bold',
    font_style TEXT DEFAULT 'normal',
    is_uppercase BOOLEAN DEFAULT true,
    letter_spacing TEXT DEFAULT 'tight',
    text_align TEXT DEFAULT 'left' CHECK (text_align IN ('left', 'center', 'right')),
    bg_style TEXT DEFAULT 'solid',
    text_color TEXT,
    is_favorite BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Vision Affirmations Table (Mindfulness Library)
CREATE TABLE IF NOT EXISTS public.vision_affirmations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quote TEXT NOT NULL,
    author TEXT NOT NULL DEFAULT 'Self',
    category TEXT NOT NULL DEFAULT 'Mindset' CHECK (category IN ('Mindset', 'Confidence', 'Peace', 'Growth', 'Focus')),
    is_favorite BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes for High-Performance Queries ──────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_vision_boards_user_id ON public.vision_boards (user_id);
CREATE INDEX IF NOT EXISTS idx_vision_boards_favorite ON public.vision_boards (user_id, is_favorite);
CREATE INDEX IF NOT EXISTS idx_vision_nodes_board_id ON public.vision_nodes (board_id);
CREATE INDEX IF NOT EXISTS idx_vision_nodes_user_id ON public.vision_nodes (user_id);
CREATE INDEX IF NOT EXISTS idx_vision_affirmations_user_id ON public.vision_affirmations (user_id);

-- ─── Row Level Security (RLS) Policies ─────────────────────────────────────────
ALTER TABLE public.vision_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vision_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vision_affirmations ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['vision_boards', 'vision_nodes', 'vision_affirmations'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%1$s_select_own" ON public.%1$I', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "%1$s_insert_own" ON public.%1$I', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "%1$s_update_own" ON public.%1$I', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "%1$s_delete_own" ON public.%1$I', tbl);

    EXECUTE format('CREATE POLICY "%1$s_select_own" ON public.%1$I FOR SELECT USING (auth.uid() = user_id)', tbl);
    EXECUTE format('CREATE POLICY "%1$s_insert_own" ON public.%1$I FOR INSERT WITH CHECK (auth.uid() = user_id)', tbl);
    EXECUTE format('CREATE POLICY "%1$s_update_own" ON public.%1$I FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)', tbl);
    EXECUTE format('CREATE POLICY "%1$s_delete_own" ON public.%1$I FOR DELETE USING (auth.uid() = user_id)', tbl);
  END LOOP;
END $$;

-- Supabase Migration: Create journals and mindmaps tables

-- Journals Table
CREATE TABLE IF NOT EXISTS public.journals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    mood TEXT NOT NULL DEFAULT 'good',
    tags TEXT[] NOT NULL DEFAULT '{}',
    pinned BOOLEAN NOT NULL DEFAULT false,
    focus_list JSONB NOT NULL DEFAULT '[]'::jsonb,
    page_style TEXT NOT NULL DEFAULT 'default',
    images TEXT[] NOT NULL DEFAULT '{}',
    reflection JSONB NOT NULL DEFAULT '{"whatWentWell": "", "whatCanBeBetter": ""}'::jsonb,
    attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
    location TEXT NOT NULL DEFAULT '',
    reminder TEXT NOT NULL DEFAULT '',
    style_preset TEXT NOT NULL DEFAULT 'calm',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for Journals
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own journals"
    ON public.journals
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Mindmaps Table
CREATE TABLE IF NOT EXISTS public.mindmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '',
    nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
    links JSONB NOT NULL DEFAULT '[]'::jsonb,
    edge_style TEXT DEFAULT 'solid',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for Mindmaps
ALTER TABLE public.mindmaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own mindmaps"
    ON public.mindmaps
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Standard Calculations Table
CREATE TABLE IF NOT EXISTS public.standard_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    expression TEXT NOT NULL,
    result TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for Standard Calculations
ALTER TABLE public.standard_calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own standard calculations"
    ON public.standard_calculations
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create Indexes
CREATE INDEX IF NOT EXISTS journals_user_date_idx ON public.journals (user_id, date DESC);
CREATE INDEX IF NOT EXISTS mindmaps_user_created_idx ON public.mindmaps (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS standard_calculations_user_idx ON public.standard_calculations (user_id, created_at DESC);

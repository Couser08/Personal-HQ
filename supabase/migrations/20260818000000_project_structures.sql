-- Supabase Migration: Create project_structures table for Project Structure Maintainer
-- Module: Project Architect / Structure Maintainer

CREATE TABLE IF NOT EXISTS public.project_structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Untitled Project',
    description TEXT NOT NULL DEFAULT '',
    root_name TEXT NOT NULL DEFAULT 'my-project',
    nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
    tags TEXT[] NOT NULL DEFAULT '{}',
    template_type TEXT NOT NULL DEFAULT 'custom',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.project_structures ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own project structures" ON public.project_structures;
DROP POLICY IF EXISTS "Users can insert their own project structures" ON public.project_structures;
DROP POLICY IF EXISTS "Users can update their own project structures" ON public.project_structures;
DROP POLICY IF EXISTS "Users can delete their own project structures" ON public.project_structures;
DROP POLICY IF EXISTS "Users can manage their own project structures" ON public.project_structures;

-- Single comprehensive CRUD policy for owner
CREATE POLICY "Users can manage their own project structures"
    ON public.project_structures
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS project_structures_user_updated_idx 
    ON public.project_structures (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS project_structures_user_name_idx 
    ON public.project_structures (user_id, name);

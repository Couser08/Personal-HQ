-- =====================================================================================
-- MAJOR SUPABASE MIGRATION: AI EXAM GENERATOR & TO-DO SUBTASKS
-- Run this script in your Supabase SQL Editor.
-- =====================================================================================

-- 1. ADD SUBTASKS COLUMN TO TODO_TASKS (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='todo_tasks' AND column_name='subtasks') THEN
      ALTER TABLE todo_tasks ADD COLUMN subtasks JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- 2. CREATE STUDY_MATERIALS TABLE
CREATE TABLE IF NOT EXISTS study_materials (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    raw_content TEXT NOT NULL,
    structured_data JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security for study_materials
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own study_materials" ON study_materials
    FOR ALL USING (auth.uid() = user_id);

-- 3. CREATE EXAMS TABLE
CREATE TABLE IF NOT EXISTS exams (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    material_id TEXT NOT NULL REFERENCES study_materials(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    total_marks INTEGER NOT NULL,
    spec_prompt TEXT NOT NULL,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security for exams
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own exams" ON exams
    FOR ALL USING (auth.uid() = user_id);

-- 4. CREATE EXAM_ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS exam_attempts (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exam_id TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    total_score INTEGER NOT NULL DEFAULT 0,
    feedback JSONB NOT NULL DEFAULT '[]'::jsonb,
    weakness_summary TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security for exam_attempts
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own exam_attempts" ON exam_attempts
    FOR ALL USING (auth.uid() = user_id);

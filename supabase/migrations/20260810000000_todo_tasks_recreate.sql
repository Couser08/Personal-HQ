-- Drop the existing todo_tasks table
DROP TABLE IF EXISTS public.todo_tasks CASCADE;

-- Create the new todo_tasks table with added planner fields
CREATE TABLE public.todo_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.todo_projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    priority TEXT NOT NULL DEFAULT 'none',
    tags TEXT[] NOT NULL DEFAULT '{}',
    due_date TIMESTAMPTZ,
    start_time TEXT,
    end_time TEXT,
    pomodoro_count INTEGER DEFAULT 0,
    subtasks JSONB DEFAULT '[]'::jsonb,
    deleted BOOLEAN NOT NULL DEFAULT false,
    
    -- New Daily Planner Fields
    category TEXT,
    description TEXT,
    location TEXT,
    reminder TEXT,
    repeat TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for Todo Tasks
ALTER TABLE public.todo_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own todo tasks"
    ON public.todo_tasks
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

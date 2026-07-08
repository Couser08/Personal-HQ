-- Add subtasks JSONB column to todo_tasks Table
ALTER TABLE todo_tasks ADD COLUMN IF NOT EXISTS subtasks JSONB DEFAULT '[]'::jsonb;

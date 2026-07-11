-- Add deleted column to todo_tasks
ALTER TABLE public.todo_tasks ADD COLUMN IF NOT EXISTS deleted BOOLEAN NOT NULL DEFAULT false;

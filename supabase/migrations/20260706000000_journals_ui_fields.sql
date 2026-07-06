-- Add journal UI fields for the screenshot-aligned journal workspace

ALTER TABLE public.journals
  ADD COLUMN IF NOT EXISTS location TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS reminder TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS style_preset TEXT NOT NULL DEFAULT 'calm';

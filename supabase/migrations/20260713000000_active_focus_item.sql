-- Migration: Add active_focus_item column to user_settings table
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS active_focus_item JSONB DEFAULT NULL;

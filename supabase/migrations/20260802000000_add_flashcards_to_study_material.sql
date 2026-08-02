-- Migration: Add flashcards JSONB column to study_materials
ALTER TABLE study_materials ADD COLUMN IF NOT EXISTS flashcards JSONB DEFAULT '[]'::jsonb;

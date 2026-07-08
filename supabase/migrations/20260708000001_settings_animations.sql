-- Add reduce_animations column to user_settings Table
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS reduce_animations BOOLEAN DEFAULT false;

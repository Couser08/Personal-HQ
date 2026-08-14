-- This script removes all tables related to the deprecated Budget and Study modules.
-- Ensure you have exported any necessary data before running this!

-- Drop Budget Tables
DROP TABLE IF EXISTS public.budget_transactions CASCADE;
DROP TABLE IF EXISTS public.budget_categories CASCADE;

-- Drop Study Tracker Tables
DROP TABLE IF EXISTS public.topic_notes CASCADE;
DROP TABLE IF EXISTS public.topics CASCADE;
DROP TABLE IF EXISTS public.subjects CASCADE;

-- Note: We are preserving exam-related tables (exams, exam_attempts, study_materials) 
-- as they are part of the active AI Exam Prep module.

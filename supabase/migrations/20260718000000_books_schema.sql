-- Migration to create the books and notebooks tables
CREATE TABLE IF NOT EXISTS public.books (
  id TEXT PRIMARY KEY, -- Supports text keys like 'book-1' as well as UUIDs
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled',
  author TEXT NOT NULL DEFAULT 'Unknown Author',
  tagline TEXT NOT NULL DEFAULT '',
  rating INTEGER NOT NULL DEFAULT 0,
  cover_image TEXT NOT NULL DEFAULT '',
  pages_count INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT '',
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  reading_list BOOLEAN NOT NULL DEFAULT false,
  audiobook BOOLEAN NOT NULL DEFAULT false,
  progress INTEGER NOT NULL DEFAULT 0,
  current_page INTEGER NOT NULL DEFAULT 1,
  pages JSONB NOT NULL DEFAULT '{}'::jsonb, -- Maps pageNumber keys to page HTML content
  topics JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of BookTopic objects
  sticky_notes JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of BookStickyNote objects
  bookmarks INTEGER[] NOT NULL DEFAULT '{}', -- Array of bookmarked page numbers
  highlights JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of BookHighlight objects
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Create policy for user-scoped CRUD access
DROP POLICY IF EXISTS "Users can manage their own notebooks" ON public.books;
CREATE POLICY "Users can manage their own notebooks" ON public.books
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create performance index
CREATE INDEX IF NOT EXISTS books_user_idx ON public.books(user_id, created_at DESC);

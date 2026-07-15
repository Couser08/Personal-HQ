-- Migration to create the link_saver table
CREATE TABLE IF NOT EXISTS public.link_saver (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'other',
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.link_saver ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own saved links in link_saver" ON public.link_saver
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS link_saver_user_idx ON public.link_saver(user_id, saved_at DESC);

-- Create visions table
CREATE TABLE IF NOT EXISTS public.visions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL,
  image_url text,
  target_date text,
  why_text text,
  status text NOT NULL DEFAULT 'Not Started',
  progress integer NOT NULL DEFAULT 0,
  linked_habit_ids text[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.visions ENABLE ROW LEVEL SECURITY;

-- Policies for visions
CREATE POLICY "Users can view their own visions"
  ON public.visions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own visions"
  ON public.visions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own visions"
  ON public.visions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own visions"
  ON public.visions FOR DELETE
  USING (auth.uid() = user_id);

-- Create storage bucket for vision images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('visions', 'visions', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for storage
CREATE POLICY "Anyone can view vision images"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'visions' );

CREATE POLICY "Users can upload vision images"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'visions' AND auth.uid() = owner );

CREATE POLICY "Users can update vision images"
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'visions' AND auth.uid() = owner );

CREATE POLICY "Users can delete vision images"
  ON storage.objects FOR DELETE
  USING ( bucket_id = 'visions' AND auth.uid() = owner );

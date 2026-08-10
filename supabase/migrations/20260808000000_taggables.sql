-- Migration to create the taggables polymorphic join table
CREATE TABLE IF NOT EXISTS public.taggables (
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  taggable_id UUID NOT NULL,
  taggable_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tag_id, taggable_id, taggable_type)
);

-- Enable RLS
ALTER TABLE public.taggables ENABLE ROW LEVEL SECURITY;

-- Create policies (Assuming users can manage tags on their own taggables)
-- We need to check if the tag belongs to the user
CREATE POLICY "Users can manage their own taggables" ON public.taggables
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.tags 
      WHERE tags.id = taggables.tag_id 
      AND tags.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tags 
      WHERE tags.id = taggables.tag_id 
      AND tags.user_id = auth.uid()
    )
  );

-- Create indexes for fast polymorphic lookups
CREATE INDEX IF NOT EXISTS taggables_taggable_idx ON public.taggables(taggable_type, taggable_id);
CREATE INDEX IF NOT EXISTS taggables_tag_id_idx ON public.taggables(tag_id);

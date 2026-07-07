-- Migration to create habits table
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text default '',
  frequency_type text not null default 'daily', -- 'daily', 'weekly_days', 'weekly_count'
  frequency_days integer[] default '{}', -- e.g. [1, 3, 5] (0 = Sunday, 6 = Saturday)
  frequency_count integer default 0, -- e.g. 3 times per week
  completed_dates text[] not null default '{}', -- array of YYYY-MM-DD strings
  streak integer not null default 0,
  best_streak integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.habits enable row level security;

-- Policy
create policy "Users can manage their own habits"
  on public.habits
  for all
  using (auth.uid() = user_id);

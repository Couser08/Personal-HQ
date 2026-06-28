-- Personal HQ initial Supabase schema
-- Apply with: supabase db push, or paste into the Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  content text not null default '',
  tags text[] not null default '{}',
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  title text not null default '',
  tags text[] not null default '{}',
  saved_at timestamptz not null default now()
);

create table if not exists public.stocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ticker text not null,
  entry_price numeric not null check (entry_price >= 0),
  quantity numeric not null check (quantity >= 0),
  action text not null check (action in ('BUY', 'SELL', 'WATCHLIST')),
  notes text not null default '',
  date timestamptz not null default now()
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  semester text not null default '',
  topics jsonb not null default '[]'::jsonb
);

create table if not exists public.interest_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('SI', 'CI')),
  principal numeric not null check (principal >= 0),
  rate numeric not null check (rate >= 0),
  time numeric not null check (time >= 0),
  time_unit text not null check (time_unit in ('years', 'months')),
  interest numeric not null,
  total_amount numeric not null,
  compound_frequency text check (compound_frequency in ('annually', 'semi-annually', 'quarterly', 'monthly')),
  label text not null default '',
  calculated_at timestamptz not null default now()
);

create table if not exists public.media_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('ANIME', 'GAME')),
  title text not null,
  status text not null,
  rating numeric check (rating is null or (rating >= 0 and rating <= 10)),
  episodes integer check (episodes is null or episodes >= 0),
  notes text not null default '',
  added_at timestamptz not null default now()
);

create table if not exists public.countdowns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  target_date timestamptz not null,
  emoji text not null default '',
  color text not null check (color in ('rose', 'amber', 'blue', 'green', 'purple')),
  created_at timestamptz not null default now()
);

create table if not exists public.snippets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  language text not null,
  code text not null,
  tags text[] not null default '{}',
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.budget_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  budget numeric not null check (budget >= 0),
  color text not null check (color in ('rose', 'blue', 'green', 'amber', 'purple')),
  icon text not null default ''
);

create table if not exists public.budget_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.budget_categories(id) on delete cascade,
  amount numeric not null check (amount >= 0),
  description text not null default '',
  date timestamptz not null default now(),
  type text not null check (type in ('income', 'expense'))
);

create index if not exists notes_user_updated_idx on public.notes (user_id, updated_at desc);
create index if not exists links_user_saved_idx on public.links (user_id, saved_at desc);
create index if not exists stocks_user_date_idx on public.stocks (user_id, date desc);
create index if not exists interest_user_calculated_idx on public.interest_records (user_id, calculated_at desc);
create index if not exists media_user_added_idx on public.media_logs (user_id, added_at desc);
create index if not exists countdowns_user_created_idx on public.countdowns (user_id, created_at desc);
create index if not exists snippets_user_created_idx on public.snippets (user_id, created_at desc);
create index if not exists budget_categories_user_idx on public.budget_categories (user_id);
create index if not exists budget_transactions_user_date_idx on public.budget_transactions (user_id, date desc);
create index if not exists budget_transactions_category_idx on public.budget_transactions (category_id);

alter table public.notes enable row level security;
alter table public.links enable row level security;
alter table public.stocks enable row level security;
alter table public.subjects enable row level security;
alter table public.interest_records enable row level security;
alter table public.media_logs enable row level security;
alter table public.countdowns enable row level security;
alter table public.snippets enable row level security;
alter table public.budget_categories enable row level security;
alter table public.budget_transactions enable row level security;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'notes', 'links', 'stocks', 'subjects', 'interest_records', 'media_logs',
    'countdowns', 'snippets', 'budget_categories', 'budget_transactions'
  ] loop
    execute format('drop policy if exists "%1$s_select_own" on public.%1$I', table_name);
    execute format('drop policy if exists "%1$s_insert_own" on public.%1$I', table_name);
    execute format('drop policy if exists "%1$s_update_own" on public.%1$I', table_name);
    execute format('drop policy if exists "%1$s_delete_own" on public.%1$I', table_name);
    execute format('create policy "%1$s_select_own" on public.%1$I for select using (auth.uid() = user_id)', table_name);
    execute format('create policy "%1$s_insert_own" on public.%1$I for insert with check (auth.uid() = user_id)', table_name);
    execute format('create policy "%1$s_update_own" on public.%1$I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)', table_name);
    execute format('create policy "%1$s_delete_own" on public.%1$I for delete using (auth.uid() = user_id)', table_name);
  end loop;
end $$;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "avatars_public_read" on storage.objects;
drop policy if exists "avatars_insert_own" on storage.objects;
drop policy if exists "avatars_update_own" on storage.objects;
drop policy if exists "avatars_delete_own" on storage.objects;

create policy "avatars_public_read"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "avatars_insert_own"
on storage.objects for insert
with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "avatars_update_own"
on storage.objects for update
using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1])
with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "avatars_delete_own"
on storage.objects for delete
using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

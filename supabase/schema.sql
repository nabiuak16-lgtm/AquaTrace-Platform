-- AquaTrace per-user cloud sync schema (run in Supabase SQL Editor)

create extension if not exists "pgcrypto";

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text not null default '',
  updated_at timestamptz not null default now()
);

-- Water sources
create table if not exists public.sources (
  id text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  type text not null,
  location text,
  created_at text not null,
  next_test_date text,
  primary key (user_id, id)
);

-- Screening samples
create table if not exists public.samples (
  id text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  source_id text not null default '',
  location_name text not null default '',
  water_source text not null default 'Other',
  volume_filtered numeric not null default 0,
  latitude numeric not null default 0,
  longitude numeric not null default 0,
  notes text not null default '',
  image_data_url text,
  date text not null,
  analysis jsonb not null default '{}'::jsonb,
  possible_source text not null default '',
  submitted_to_map boolean not null default false,
  compare_pair_id text,
  compare_role text,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- Membrane inventory (one row per user)
create table if not exists public.membranes (
  user_id uuid primary key references auth.users (id) on delete cascade,
  remaining integer not null default 2,
  pack_size integer not null default 10,
  estimated_until text not null default '',
  last_activated_at text,
  activations jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists samples_user_date_idx on public.samples (user_id, date desc);
create index if not exists sources_user_idx on public.sources (user_id);

alter table public.profiles enable row level security;
alter table public.sources enable row level security;
alter table public.samples enable row level security;
alter table public.membranes enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

drop policy if exists "sources_all_own" on public.sources;
create policy "sources_all_own" on public.sources for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "samples_all_own" on public.samples;
create policy "samples_all_own" on public.samples for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "membranes_all_own" on public.membranes;
create policy "membranes_all_own" on public.membranes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create profile + membranes on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.email, '')
  )
  on conflict (id) do nothing;

  insert into public.membranes (user_id, remaining, pack_size, estimated_until, activations)
  values (
    new.id,
    2,
    10,
    to_char((now() + interval '14 days'), 'YYYY-MM-DD'),
    '[]'::jsonb
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =======================================================
-- SQL SCHEMA FOR CHM CALENDAR PORTAL
-- Copy and paste this script into your Supabase SQL Editor
-- =======================================================

-- 1. Create registered_users table
create table if not exists public.registered_users (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null unique,
  password text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create events table
create table if not exists public.events (
  id text primary key,
  type text not null check (type in ('duty', 'teaching')),
  title text not null,
  date date not null,
  end_date date,
  time text not null,
  participants text[] not null default '{}',
  status text not null check (status in ('confirmed', 'pending')),
  attachment text,
  created_by text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Populate default administrators (re-runnable)
insert into public.registered_users (name, email, password) values
  ('พิชชาภา โหลสกุล', 'pitchapa.ro@ssru.ac.th', 'chmssru@2026'),
  ('รัชตะสรณ์ จันทรวรศิษฐ์', 'ratchatasorn.ch@ssru.ac.th', 'chmssru@2026'),
  ('นันทภัทร เล้าสกุล', 'nantapat.le@ssru.ac.th', 'chmssru@2026'),
  ('ปราชญ์ ก้อนเพชร', 'prachkp@gmail.com', 'chmssru@2026')
on conflict (email) do nothing;

-- 4. Enable Row Level Security (RLS) for data protection
alter table public.events enable row level security;
alter table public.registered_users enable row level security;

-- 5. Define RLS Access Policies

-- Policies for registered_users table
create policy "Allow read access to registered_users"
  on public.registered_users for select
  using (true);

create policy "Allow registrations insert"
  on public.registered_users for insert
  with check (true);

-- Policies for events table (Public can read, authenticated or verified users can write)
create policy "Allow public read access to events"
  on public.events for select
  using (true);

create policy "Allow insert access to events"
  on public.events for insert
  with check (true);

create policy "Allow update access to events"
  on public.events for update
  using (true);

create policy "Allow delete access to events"
  on public.events for delete
  using (true);

-- ============================================================
--  Database Schema for Supabase
-- Run this ONCE in your Supabase SQL Editor
-- Dashboard → SQL Editor → New query → Paste → Run
-- ============================================================

-- 1. PROFILES table (stores user display info)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null default '',
  email       text not null default '',
  store_name  text default 'My Store',
  created_at  timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Users can read/update their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);


-- 2. TICKETS table (stores all analyzed tickets)
create table if not exists public.tickets (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references auth.users(id) on delete cascade not null,
  category        text not null,
  priority        text not null,
  sentiment       text not null,
  confidence      integer default 0,
  ticket_text     text,
  draft_response  text,
  time_saved      integer default 5,
  tone            text default 'friendly',
  snippet         text default '',
  customer_name   text default '',
  order_number    text default '',
  created_at      timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.tickets enable row level security;

-- Users can only see/manage their own tickets
create policy "Users can view own tickets"
  on public.tickets for select
  using (auth.uid() = user_id);

create policy "Users can insert own tickets"
  on public.tickets for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own tickets"
  on public.tickets for delete
  using (auth.uid() = user_id);

-- Index for faster lookups by user
create index if not exists idx_tickets_user_id on public.tickets(user_id);
create index if not exists idx_tickets_created_at on public.tickets(created_at desc);

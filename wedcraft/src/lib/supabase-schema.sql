-- ============================================================
--  WedCraft Database Schema for Supabase
--  Run this ONCE in your Supabase SQL Editor
--  Dashboard → SQL Editor → New query → Paste → Run
-- ============================================================

-- 1. PROFILES table
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null default '',
  email       text not null default '',
  avatar_url  text default null,
  created_at  timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);


-- 2. WEDDINGS table
create table if not exists public.weddings (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references auth.users(id) on delete cascade not null,
  partner1_name   text not null default '',
  partner2_name   text not null default '',
  wedding_date    date not null default (current_date + interval '1 year'),
  venue           text default '',
  city            text default '',
  total_budget    numeric(12,2) default 1000000,
  created_at      timestamptz default now() not null
);

alter table public.weddings enable row level security;

create policy "Users can view own weddings"
  on public.weddings for select using (auth.uid() = user_id);
create policy "Users can insert own weddings"
  on public.weddings for insert with check (auth.uid() = user_id);
create policy "Users can update own weddings"
  on public.weddings for update using (auth.uid() = user_id);
create policy "Users can delete own weddings"
  on public.weddings for delete using (auth.uid() = user_id);

create index if not exists idx_weddings_user_id on public.weddings(user_id);


-- 3. TASKS table
create table if not exists public.tasks (
  id                    uuid default gen_random_uuid() primary key,
  wedding_id            uuid references public.weddings(id) on delete cascade not null,
  text                  text not null,
  completed             boolean default false,
  priority              text default 'medium' check (priority in ('high', 'medium', 'low')),
  due_date              date default null,
  assignee              text default '',
  category              text default '',
  github_issue_number   integer default null,
  created_at            timestamptz default now() not null
);

alter table public.tasks enable row level security;

create policy "Users can view own tasks"
  on public.tasks for select
  using (
    wedding_id in (select id from public.weddings where user_id = auth.uid())
  );
create policy "Users can insert own tasks"
  on public.tasks for insert
  with check (
    wedding_id in (select id from public.weddings where user_id = auth.uid())
  );
create policy "Users can update own tasks"
  on public.tasks for update
  using (
    wedding_id in (select id from public.weddings where user_id = auth.uid())
  );
create policy "Users can delete own tasks"
  on public.tasks for delete
  using (
    wedding_id in (select id from public.weddings where user_id = auth.uid())
  );

create index if not exists idx_tasks_wedding_id on public.tasks(wedding_id);
create index if not exists idx_tasks_created_at on public.tasks(created_at desc);


-- 4. BUDGET_ITEMS table
create table if not exists public.budget_items (
  id            uuid default gen_random_uuid() primary key,
  wedding_id    uuid references public.weddings(id) on delete cascade not null,
  category      text not null default '',
  vendor_name   text default '',
  allocated     numeric(12,2) default 0,
  spent         numeric(12,2) default 0,
  paid          boolean default false,
  notes         text default '',
  created_at    timestamptz default now() not null
);

alter table public.budget_items enable row level security;

create policy "Users can view own budget items"
  on public.budget_items for select
  using (wedding_id in (select id from public.weddings where user_id = auth.uid()));
create policy "Users can insert own budget items"
  on public.budget_items for insert
  with check (wedding_id in (select id from public.weddings where user_id = auth.uid()));
create policy "Users can update own budget items"
  on public.budget_items for update
  using (wedding_id in (select id from public.weddings where user_id = auth.uid()));
create policy "Users can delete own budget items"
  on public.budget_items for delete
  using (wedding_id in (select id from public.weddings where user_id = auth.uid()));

create index if not exists idx_budget_items_wedding_id on public.budget_items(wedding_id);


-- 5. GUESTS table
create table if not exists public.guests (
  id              uuid default gen_random_uuid() primary key,
  wedding_id      uuid references public.weddings(id) on delete cascade not null,
  name            text not null,
  email           text default '',
  phone           text default '',
  side            text default 'mutual' check (side in ('bride', 'groom', 'mutual')),
  guest_group     text default '',
  rsvp_status     text default 'pending' check (rsvp_status in ('accepted', 'declined', 'pending', 'maybe')),
  plus_ones       integer default 0,
  dietary         text default '',
  table_number    text default '',
  created_at      timestamptz default now() not null
);

alter table public.guests enable row level security;

create policy "Users can view own guests"
  on public.guests for select
  using (wedding_id in (select id from public.weddings where user_id = auth.uid()));
create policy "Users can insert own guests"
  on public.guests for insert
  with check (wedding_id in (select id from public.weddings where user_id = auth.uid()));
create policy "Users can update own guests"
  on public.guests for update
  using (wedding_id in (select id from public.weddings where user_id = auth.uid()));
create policy "Users can delete own guests"
  on public.guests for delete
  using (wedding_id in (select id from public.weddings where user_id = auth.uid()));

create index if not exists idx_guests_wedding_id on public.guests(wedding_id);


-- 6. VENDORS table
create table if not exists public.vendors (
  id            uuid default gen_random_uuid() primary key,
  wedding_id    uuid references public.weddings(id) on delete cascade not null,
  name          text not null,
  category      text default '',
  phone         text default '',
  email         text default '',
  cost          numeric(12,2) default 0,
  status        text default 'pending' check (status in ('booked', 'pending', 'cancelled', 'contacted')),
  notes         text default '',
  created_at    timestamptz default now() not null
);

alter table public.vendors enable row level security;

create policy "Users can view own vendors"
  on public.vendors for select
  using (wedding_id in (select id from public.weddings where user_id = auth.uid()));
create policy "Users can insert own vendors"
  on public.vendors for insert
  with check (wedding_id in (select id from public.weddings where user_id = auth.uid()));
create policy "Users can update own vendors"
  on public.vendors for update
  using (wedding_id in (select id from public.weddings where user_id = auth.uid()));
create policy "Users can delete own vendors"
  on public.vendors for delete
  using (wedding_id in (select id from public.weddings where user_id = auth.uid()));

create index if not exists idx_vendors_wedding_id on public.vendors(wedding_id);

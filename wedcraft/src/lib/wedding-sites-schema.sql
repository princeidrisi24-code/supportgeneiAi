-- ============================================================
--  WedCraft: Wedding Sites Schema (Phase 2)
--  Run this in Supabase SQL Editor AFTER the base schema
--  Dashboard → SQL Editor → New query → Paste → Run
-- ============================================================

-- 7. WEDDING_SITES table
create table if not exists public.wedding_sites (
  id              uuid default gen_random_uuid() primary key,
  wedding_id      uuid references public.weddings(id) on delete cascade not null unique,
  slug            text not null unique,
  template_id     text not null default 'royal',
  sections        jsonb not null default '[]'::jsonb,
  is_published    boolean default false,
  custom_story    text default '',
  custom_events   jsonb default '[]'::jsonb,
  published_at    timestamptz default null,
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null
);

alter table public.wedding_sites enable row level security;

-- Owner can do full CRUD
create policy "Users can view own wedding sites"
  on public.wedding_sites for select
  using (wedding_id in (select id from public.weddings where user_id = auth.uid()));

create policy "Users can insert own wedding sites"
  on public.wedding_sites for insert
  with check (wedding_id in (select id from public.weddings where user_id = auth.uid()));

create policy "Users can update own wedding sites"
  on public.wedding_sites for update
  using (wedding_id in (select id from public.weddings where user_id = auth.uid()));

create policy "Users can delete own wedding sites"
  on public.wedding_sites for delete
  using (wedding_id in (select id from public.weddings where user_id = auth.uid()));

-- Public users can view published sites by slug (for the /site/[slug] page)
create policy "Anyone can view published wedding sites"
  on public.wedding_sites for select
  using (is_published = true);

create index if not exists idx_wedding_sites_wedding_id on public.wedding_sites(wedding_id);
create index if not exists idx_wedding_sites_slug on public.wedding_sites(slug);


-- 8. SITE_RSVPS table — stores RSVPs from the public wedding site
create table if not exists public.site_rsvps (
  id              uuid default gen_random_uuid() primary key,
  wedding_site_id uuid references public.wedding_sites(id) on delete cascade not null,
  wedding_id      uuid references public.weddings(id) on delete cascade not null,
  name            text not null,
  email           text default '',
  rsvp_status     text default 'accepted' check (rsvp_status in ('accepted', 'declined')),
  plus_ones       integer default 0,
  dietary         text default '',
  blessing        text default '',
  created_at      timestamptz default now() not null
);

alter table public.site_rsvps enable row level security;

-- Owner can view RSVPs for their wedding
create policy "Users can view own site RSVPs"
  on public.site_rsvps for select
  using (wedding_id in (select id from public.weddings where user_id = auth.uid()));

-- Anyone can submit an RSVP to a published site
create policy "Anyone can insert RSVPs for published sites"
  on public.site_rsvps for insert
  with check (
    wedding_site_id in (select id from public.wedding_sites where is_published = true)
  );

create policy "Users can delete own site RSVPs"
  on public.site_rsvps for delete
  using (wedding_id in (select id from public.weddings where user_id = auth.uid()));

create index if not exists idx_site_rsvps_wedding_site_id on public.site_rsvps(wedding_site_id);
create index if not exists idx_site_rsvps_wedding_id on public.site_rsvps(wedding_id);

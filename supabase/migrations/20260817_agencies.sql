-- Agencies table (for white-label partners)
create table if not exists agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  tagline text,
  brand_color text default '#06b6d4',
  contact_email text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Agency users (links HireFlow users to an agency)
create table if not exists agency_users (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references agencies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  joined_at timestamptz default now(),
  unique(agency_id, user_id)
);

-- RLS
alter table agencies enable row level security;
alter table agency_users enable row level security;

-- Anyone can read active agencies (for branded landing pages)
create policy "Public can read active agencies"
  on agencies for select
  using (is_active = true);

-- Users can read their own agency memberships
create policy "Users can read own agency memberships"
  on agency_users for select
  using (auth.uid() = user_id);

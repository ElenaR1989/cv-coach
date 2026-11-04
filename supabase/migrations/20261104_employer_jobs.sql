-- Employers table
create table if not exists employers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_name text not null,
  company_description text,
  website text,
  logo_url text,
  location text,
  created_at timestamptz default now(),
  unique(user_id)
);

-- Job postings table
create table if not exists job_postings (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references employers(id) on delete cascade,
  title text not null,
  description text not null,
  location text not null,
  job_type text not null default 'full-time', -- full-time, part-time, contract, apprenticeship
  salary_min integer,
  salary_max integer,
  apply_url text, -- external apply link (optional)
  is_active boolean default true,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '90 days')
);

-- Job applications (Phase 2 — apply with HireFlow CV)
create table if not exists job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references job_postings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  cv_id uuid, -- references their HireFlow CV
  cover_letter text,
  match_score integer, -- 0-100
  status text default 'applied', -- applied, reviewing, interview, rejected, offered
  applied_at timestamptz default now(),
  unique(job_id, user_id)
);

-- RLS
alter table employers enable row level security;
alter table job_postings enable row level security;
alter table job_applications enable row level security;

-- Employers can read/write their own record
create policy "Employers can manage own profile"
  on employers for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Anyone can read active job postings
create policy "Public can read active job postings"
  on job_postings for select
  using (is_active = true);

-- Employers can manage their own job postings
create policy "Employers can manage own job postings"
  on job_postings for all
  using (employer_id in (select id from employers where user_id = auth.uid()))
  with check (employer_id in (select id from employers where user_id = auth.uid()));

-- Job seekers can read their own applications
create policy "Users can read own applications"
  on job_applications for select
  using (auth.uid() = user_id);

-- Job seekers can apply
create policy "Users can apply to jobs"
  on job_applications for insert
  with check (auth.uid() = user_id);

-- Employers can read applications for their jobs
create policy "Employers can read applications for their jobs"
  on job_applications for select
  using (job_id in (
    select jp.id from job_postings jp
    join employers e on e.id = jp.employer_id
    where e.user_id = auth.uid()
  ));

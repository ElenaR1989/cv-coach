create table if not exists practice_interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid references job_applications(id) on delete set null,
  role text,
  company text,
  questions jsonb,
  answers jsonb,
  report jsonb,
  created_at timestamptz default now()
);

alter table practice_interviews enable row level security;

create policy "Users can manage own interviews"
  on practice_interviews
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

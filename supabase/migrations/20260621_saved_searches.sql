create table if not exists saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  query text not null,
  location text,
  label text,
  created_at timestamptz default now()
);

alter table saved_searches enable row level security;

create policy "Users can manage own saved searches" on saved_searches
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

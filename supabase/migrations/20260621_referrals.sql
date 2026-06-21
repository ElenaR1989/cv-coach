-- Referral codes table
create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references auth.users(id) on delete cascade,
  code text unique not null,
  used_by uuid references auth.users(id) on delete set null,
  used_at timestamptz,
  reward_granted boolean default false,
  created_at timestamptz default now()
);

alter table referrals enable row level security;

create policy "Users can view own referrals" on referrals
  for select using (auth.uid() = referrer_id);

create policy "Anyone can look up a referral code" on referrals
  for select using (true);

create policy "Users can insert own referral" on referrals
  for insert with check (auth.uid() = referrer_id);

create policy "Service role can update referrals" on referrals
  for update using (true);

create table if not exists promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  description text,
  months_free integer default 1,
  max_uses integer default null,
  uses integer default 0,
  expires_at timestamptz default null,
  created_at timestamptz default now()
);

create table if not exists promo_redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null,
  redeemed_at timestamptz default now(),
  pro_until timestamptz,
  unique(user_id, code)
);

alter table promo_codes enable row level security;
alter table promo_redemptions enable row level security;

create policy "Anyone can read promo codes" on promo_codes for select using (true);
create policy "Users can read own redemptions" on promo_redemptions for select using (auth.uid() = user_id);

-- Insert the Product Hunt promo code
insert into promo_codes (code, description, months_free, expires_at)
values ('PRODUCTHUNT', '1 month Pro free for Product Hunt community', 1, now() + interval '30 days')
on conflict (code) do nothing;

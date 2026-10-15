-- Promo code for Megan (King's Charles Foundation) — 6 months free Pro, unlimited uses
insert into promo_codes (code, description, months_free, max_uses, expires_at)
values ('MEGAN6', '6 months free Pro for King''s Charles Foundation young people', 6, null, null)
on conflict (code) do nothing;

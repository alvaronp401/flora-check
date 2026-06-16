-- Aulão no Eixão Sul
-- Rode no Supabase SQL Editor para garantir que o evento esteja correto no painel e no checkout.

insert into public.events (
  slug,
  title,
  description,
  date,
  location,
  capacity,
  lot_prices,
  lot_thresholds,
  fees,
  is_active
) values (
  'alongamento-corrida-eixao-sul',
  'Aulão no Eixão Sul',
  'Alongamento + corrida/caminhada em grupo às 8h com Prof. Jonathas Armiliato. Leve sua canga e vamos tomar café juntos.',
  '2026-06-21 08:00:00-03',
  'Eixão Sul',
  30,
  '{"lot1":30,"lot2":35}'::jsonb,
  '{"lot1":15,"lot2":30}'::jsonb,
  '[]'::jsonb,
  true
) on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  date = excluded.date,
  location = excluded.location,
  capacity = coalesce(public.events.capacity, excluded.capacity),
  lot_prices = coalesce(public.events.lot_prices, excluded.lot_prices),
  lot_thresholds = coalesce(public.events.lot_thresholds, excluded.lot_thresholds),
  fees = coalesce(public.events.fees, excluded.fees),
  is_active = true,
  updated_at = now();

select id, slug, title, date, location, capacity, lot_prices
from public.events
where slug = 'alongamento-corrida-eixao-sul';

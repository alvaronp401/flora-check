-- Trail & Run Club checkout production schema
-- Run this in Supabase SQL Editor before opening sales.

create extension if not exists "pgcrypto";

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  date timestamptz not null,
  location text not null default '',
  image_url text not null default '',
  capacity integer not null default 50 check (capacity > 0),
  lot_prices jsonb not null default '{"lot1":110,"lot2":130,"lot3":150}'::jsonb,
  lot_thresholds jsonb not null default '{"lot1":15,"lot2":30}'::jsonb,
  fees jsonb not null default '[{"id":"insurance","name":"Seguro Aventura","price":10}]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  full_name text not null,
  cpf text not null,
  email text not null,
  phone text not null,
  emergency_phone text,
  blood_type text,
  medication text not null default '',
  gender text,
  shirt_size text,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'cancelled')),
  coupon_code text,
  final_price numeric(10,2),
  reserved_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(10,2) not null check (discount_value >= 0),
  usage_limit integer not null default 1 check (usage_limit >= 0),
  used_count integer not null default 0 check (used_count >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists idx_events_slug_active on public.events (slug, is_active);
create index if not exists idx_registrations_event_status on public.registrations (event_id, payment_status);
create index if not exists idx_registrations_reserved_until on public.registrations (reserved_until);
create index if not exists idx_registrations_created_at on public.registrations (created_at desc);
create index if not exists idx_coupons_code_active on public.coupons (code, is_active);

alter table public.events enable row level security;
alter table public.registrations enable row level security;
alter table public.coupons enable row level security;
alter table public.event_settings enable row level security;

drop policy if exists "Public can read active events" on public.events;
create policy "Public can read active events"
  on public.events for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Public can create pending registrations" on public.registrations;
create policy "Public can create pending registrations"
  on public.registrations for insert
  to anon, authenticated
  with check (payment_status = 'pending');

drop policy if exists "Public can read registrations for success page" on public.registrations;
create policy "Public can read registrations for success page"
  on public.registrations for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can read active coupons" on public.coupons;
create policy "Public can read active coupons"
  on public.coupons for select
  to anon, authenticated
  using (is_active = true);

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
  'flona-12km',
  'Trilha Flona 12km',
  'Trilha guiada de 12km na Flona Brasilia com parada no Corrego Geladeira e Pinheiral.',
  '2026-06-14 07:30:00-03',
  'FLONA Brasilia',
  20,
  '{"lot1":30,"lot2":30,"lot3":30}'::jsonb,
  '{"lot1":20,"lot2":20}'::jsonb,
  '[]'::jsonb,
  true
) on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  date = excluded.date,
  location = excluded.location,
  capacity = excluded.capacity,
  lot_prices = excluded.lot_prices,
  lot_thresholds = excluded.lot_thresholds,
  fees = excluded.fees,
  is_active = excluded.is_active,
  updated_at = now();

-- Copy this id into VITE_FLONA_12KM_EVENT_ID in the frontend environment.
select id, slug, title from public.events where slug = 'flona-12km';

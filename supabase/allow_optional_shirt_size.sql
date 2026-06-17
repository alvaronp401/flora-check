-- Permite eventos sem camiseta no checkout.
-- Rode no Supabase SQL Editor se a tabela antiga ainda estiver com NOT NULL.

alter table public.registrations
  alter column shirt_size drop not null;

select
  column_name,
  is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'registrations'
  and column_name = 'shirt_size';

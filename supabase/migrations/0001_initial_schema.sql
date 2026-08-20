create extension if not exists pgcrypto;

create type deal_status as enum ('open', 'funded', 'purchased', 'sold', 'closed');
create type participation_status as enum ('pending', 'confirmed', 'cancelled');

create table public.users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique check (username ~ '^[a-z0-9_]{3,32}$'),
  password_hash text not null,
  password_salt text not null,
  display_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  target_amount numeric(12, 2) not null check (target_amount > 0),
  expected_sale_price numeric(12, 2) check (expected_sale_price is null or expected_sale_price > 0),
  status deal_status not null default 'open',
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint deals_slug_format check (slug ~ '^[A-Z2-9]{6,12}$')
);

create table public.participations (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  status participation_status not null default 'pending',
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  confirmed_by uuid references public.users(id) on delete set null,
  constraint participation_confirmation_consistency check (
    (status = 'confirmed' and confirmed_at is not null and confirmed_by is not null)
    or (status <> 'confirmed')
  )
);

create unique index participations_one_active_per_user_deal
  on public.participations(deal_id, user_id)
  where status in ('pending', 'confirmed');

create index sessions_user_id_idx on public.sessions(user_id);
create index sessions_expires_at_idx on public.sessions(expires_at);
create index deals_slug_idx on public.deals(slug);
create index deals_status_idx on public.deals(status);
create index participations_deal_id_idx on public.participations(deal_id);
create index participations_user_id_idx on public.participations(user_id);
create index participations_status_idx on public.participations(status);

create or replace view public.deal_funding_totals as
select
  d.id as deal_id,
  coalesce(sum(p.amount) filter (where p.status = 'confirmed'), 0)::numeric(12, 2) as confirmed_amount,
  coalesce(sum(p.amount) filter (where p.status = 'pending'), 0)::numeric(12, 2) as pending_amount
from public.deals d
left join public.participations p on p.deal_id = d.id
group by d.id;

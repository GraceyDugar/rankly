-- Rankly database setup.
-- Every table has row level security ON with no public policies:
-- only the server (using the service role key) can read or write.

-- Paying (or pending) customers
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'past_due', 'cancelled')),
  dodo_customer_id text,
  dodo_subscription_id text,
  created_at timestamptz not null default now()
);

-- The brand and 5 questions each customer tracks
create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers (id) on delete cascade,
  name text not null,
  website text,
  questions text[] not null
    check (cardinality(questions) between 1 and 5),
  created_at timestamptz not null default now()
);

-- One weekly report per brand
create table if not exists scans (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands (id) on delete cascade,
  week_of date not null,
  score int not null default 0,
  total int not null default 0,
  fixes jsonb not null default '[]',
  created_at timestamptz not null default now(),
  unique (brand_id, week_of)
);

-- Each question's result inside a weekly report
create table if not exists scan_results (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references scans (id) on delete cascade,
  question text not null,
  engine text not null default 'gemini',
  mentioned boolean not null,
  position int,
  competitors text[] not null default '{}',
  answer text,
  created_at timestamptz not null default now()
);

-- Every free check run from the homepage (also used for rate limiting)
create table if not exists free_checks (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  question text not null,
  mentioned boolean,
  position int,
  competitors text[] not null default '{}',
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists free_checks_ip_recent on free_checks (ip_hash, created_at desc);
create index if not exists brands_customer on brands (customer_id);
create index if not exists scans_brand_week on scans (brand_id, week_of desc);
create index if not exists scan_results_scan on scan_results (scan_id);

alter table customers enable row level security;
alter table brands enable row level security;
alter table scans enable row level security;
alter table scan_results enable row level security;
alter table free_checks enable row level security;

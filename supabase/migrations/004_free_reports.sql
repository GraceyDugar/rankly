-- Free full reports (lead magnet). One per email. Processed by the cron
-- queue because a full report takes longer than a web request can wait.
create table if not exists free_reports (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  brand text not null,
  website text,
  questions text[] not null check (cardinality(questions) between 1 and 5),
  status text not null default 'pending' check (status in ('pending', 'running', 'sent', 'failed')),
  score int,
  total int,
  error text,
  ip_hash text not null,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists free_reports_status on free_reports (status, created_at);
create index if not exists free_reports_ip_recent on free_reports (ip_hash, created_at desc);

alter table free_reports enable row level security;

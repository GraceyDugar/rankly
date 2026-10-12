-- Early-access signups collected before payments go live.
create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  brand text,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists waitlist_ip_recent on waitlist (ip_hash, created_at desc);

-- Server-only access, like every other table.
alter table waitlist enable row level security;

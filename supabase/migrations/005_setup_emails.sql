-- Track the "finish setup" emails so each is sent once.
alter table customers add column if not exists welcome_sent_at timestamptz;
alter table customers add column if not exists setup_reminded_at timestamptz;

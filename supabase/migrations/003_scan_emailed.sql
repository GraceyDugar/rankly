-- Track whether a weekly report email actually went out, so the cron
-- retries reports that were scanned but not delivered.
alter table scans add column if not exists emailed_at timestamptz;

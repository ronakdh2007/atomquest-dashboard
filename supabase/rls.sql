-- Run in Supabase -> SQL Editor.
-- Turns RLS on for the 5 flagged tables, then adds policies that keep the demo
-- working exactly as it does today (the app logs in by email lookup and talks
-- to Supabase with the anon key, so anon must keep full access).
--
-- NOTE: this clears the red errors but does NOT make the data private.
-- Real protection needs Supabase Auth + per-user policies.

alter table public.users     enable row level security;
alter table public.goals     enable row level security;
alter table public.checkins  enable row level security;
alter table public.audit_log enable row level security;
alter table public.cycles    enable row level security;

create policy "demo full access" on public.users     for all to anon using (true) with check (true);
create policy "demo full access" on public.goals     for all to anon using (true) with check (true);
create policy "demo full access" on public.checkins  for all to anon using (true) with check (true);
create policy "demo full access" on public.audit_log for all to anon using (true) with check (true);
create policy "demo full access" on public.cycles    for all to anon using (true) with check (true);
-- client-insights: events + feedback tables. Additive only; safe to run once per project.
-- Clients may INSERT their own rows; nobody can SELECT through the public API.
-- The insights agent reads with elevated access (Supabase MCP), never from the browser.

create table if not exists public.events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  user_id uuid default auth.uid(),
  role text check (char_length(role) <= 30),
  event text not null check (char_length(event) between 1 and 60),
  screen text check (char_length(screen) <= 80),
  lang text check (lang in ('en','es')),
  session text check (char_length(session) <= 40),
  props jsonb not null default '{}'::jsonb check (pg_column_size(props) <= 2000)
);
create index if not exists events_created_idx on public.events (created_at);
create index if not exists events_event_idx on public.events (event, created_at);
alter table public.events enable row level security;

drop policy if exists "insert own events" on public.events;
create policy "insert own events" on public.events
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

create table if not exists public.feedback (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  user_id uuid default auth.uid(),
  role text check (char_length(role) <= 30),
  screen text check (char_length(screen) <= 80),
  lang text check (lang in ('en','es')),
  message text not null check (char_length(message) between 3 and 2000),
  status text not null default 'new' check (status in ('new','planned','done','declined'))
);
create index if not exists feedback_created_idx on public.feedback (created_at);
alter table public.feedback enable row level security;

drop policy if exists "insert own feedback" on public.feedback;
create policy "insert own feedback" on public.feedback
  for insert to anon, authenticated
  with check ((user_id is null or user_id = auth.uid()) and status = 'new');

-- Keep 13 months of events (optional; needs pg_cron enabled):
-- select cron.schedule('trim-events', '17 4 * * 0',
--   $$delete from public.events where created_at < now() - interval '13 months'$$);

revoke all on public.events, public.feedback from anon, authenticated;
grant insert on public.events, public.feedback to anon, authenticated;

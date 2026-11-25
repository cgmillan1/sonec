-- =====================================================================
--  Sonec · base de datos (Supabase)
--  Pega TODO este archivo en Supabase > SQL Editor > New query > Run.
--  Se puede volver a correr sin perder datos.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- Tablas ----------------------------------------------------

create table if not exists settings (
  owner uuid primary key default auth.uid() references auth.users on delete cascade,
  company text default 'Grupo Sonec',
  contact_name text default '',
  phone text default '',
  email text default ''
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users on delete cascade,
  client_token text not null unique default encode(gen_random_bytes(18), 'hex'),
  client_name text default '',
  client_phone text default '',
  client_email text default '',
  title text default '',
  address text default '',
  start_date date,
  end_date date,
  status text default 'estimate_sent',
  tax_rate numeric default 7.25,
  created_at timestamptz default now()
);

create table if not exists items (            -- estimado
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects on delete cascade,
  kind text default 'mat' check (kind in ('mat','lab')),
  description text default '',
  qty numeric default 1,
  price numeric default 0,
  sort int default 0
);

create table if not exists materials (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects on delete cascade,
  name text default '',
  qty numeric default 1,
  unit text default '',
  purchased boolean default false,
  purchased_on date,
  sort int default 0
);

create table if not exists steps (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects on delete cascade,
  title text default '',
  done boolean default false,
  due_date date,
  sort int default 0
);

create table if not exists updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects on delete cascade,
  body text default '',
  photos text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists payments (         -- pagos del cliente
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects on delete cascade,
  paid_on date default current_date,
  note text default '',
  amount numeric default 0
);

create table if not exists milestones (       -- calendario de pagos
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects on delete cascade,
  label text default '',
  amount numeric default 0,
  sort int default 0
);

create table if not exists change_orders (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects on delete cascade,
  title text default '',
  details text default '',
  kind text default 'mat' check (kind in ('mat','lab')),
  amount numeric default 0,
  status text default 'pending' check (status in ('draft','pending','approved','declined')),
  decided_by text,
  decided_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists budget (           -- privado
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects on delete cascade,
  category text default '',
  amount numeric default 0,
  sort int default 0
);

create table if not exists expenses (         -- privado
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects on delete cascade,
  spent_on date default current_date,
  description text default '',
  category text default '',            -- (versión 1, ya no se usa)
  budget_id uuid references budget on delete set null,
  vendor text default '',
  amount numeric default 0,
  receipt text
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects on delete cascade,
  author text not null check (author in ('client','contractor')),
  name text default '',
  body text not null,
  seen boolean default false,
  created_at timestamptz default now()
);

-- ---------- Seguridad: solo el dueño ve y cambia sus datos -------------

alter table settings enable row level security;
alter table projects enable row level security;
drop policy if exists own_settings on settings;
create policy own_settings on settings for all to authenticated
  using (owner = auth.uid()) with check (owner = auth.uid());
drop policy if exists own_projects on projects;
create policy own_projects on projects for all to authenticated
  using (owner = auth.uid()) with check (owner = auth.uid());

do $$
declare t text;
begin
  foreach t in array array['items','materials','steps','updates','payments','milestones','change_orders','budget','expenses','comments'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists own_rows on %I', t);
    execute format($p$create policy own_rows on %I for all to authenticated
      using (exists (select 1 from projects p where p.id = project_id and p.owner = auth.uid()))
      with check (exists (select 1 from projects p where p.id = project_id and p.owner = auth.uid()))$p$, t);
    execute format('create index if not exists %I on %I (project_id)', t || '_project_idx', t);
  end loop;
end $$;

-- ---------- Acceso del cliente con su enlace privado ------------------
-- El cliente no inicia sesión. Su enlace lleva un código único y estas
-- funciones devuelven SOLO lo que el cliente puede ver (nunca presupuesto
-- ni gastos).

create or replace function client_project(tok text)
returns json language plpgsql security definer set search_path = public as $$
declare p projects; r json;
begin
  select * into p from projects where client_token = tok;
  if p.id is null then return null; end if;
  select json_build_object(
    'project', json_build_object('id', p.id, 'client_name', p.client_name, 'title', p.title, 'details', p.details, 'service', p.service,
       'address', p.address, 'start_date', p.start_date, 'end_date', p.end_date,
       'status', p.status, 'tax_rate', p.tax_rate),
    'contact', (select json_build_object('company', s.company, 'name', s.contact_name, 'phone', s.phone, 'email', s.email,
                'legal_name', s.legal_name, 'license_no', s.license_no, 'address', s.address)
                from settings s where s.owner = p.owner),
    'items', coalesce((select json_agg(i order by i.sort, i.description) from (select id, kind, description, qty, price, sort from items where project_id = p.id) i), '[]'),
    'materials', coalesce((select json_agg(m order by m.sort, m.name) from (select id, name, qty, unit, purchased, purchased_on, sort from materials where project_id = p.id) m), '[]'),
    'steps', coalesce((select json_agg(s order by s.sort, s.due_date) from (select id, title, done, due_date, sort from steps where project_id = p.id) s), '[]'),
    'updates', coalesce((select json_agg(u order by u.created_at desc) from (select id, body, photos, created_at from updates where project_id = p.id) u), '[]'),
    'payments', coalesce((select json_agg(x order by x.paid_on) from (select id, paid_on, note, amount from payments where project_id = p.id) x), '[]'),
    'milestones', coalesce((select json_agg(x order by x.sort) from (select id, label, amount, sort from milestones where project_id = p.id) x), '[]'),
    'change_orders', coalesce((select json_agg(x order by x.created_at desc) from (select id, title, details, kind, amount, status, decided_by, decided_at, created_at from change_orders where project_id = p.id and status <> 'draft') x), '[]'),
    'comments', coalesce((select json_agg(x order by x.created_at) from (select id, author, name, body, created_at from comments where project_id = p.id) x), '[]'),
    'documents', coalesce((select json_agg(x order by x.created_at desc) from (select id, kind, lang, snapshot, total, status, signed_by, signed_on, file, created_at from documents where project_id = p.id and status in ('sent','signed')) x), '[]')
  ) into r;
  return r;
end $$;

create or replace function client_comment(tok text, who text, msg text)
returns void language plpgsql security definer set search_path = public as $$
declare pid uuid;
begin
  select id into pid from projects where client_token = tok;
  if pid is null or coalesce(trim(msg), '') = '' then raise exception 'invalid'; end if;
  if (select count(*) from comments where project_id = pid and author = 'client'
      and created_at > now() - interval '10 minutes') >= 10 then
    raise exception 'too many messages';
  end if;
  insert into comments (project_id, author, name, body)
  values (pid, 'client', left(coalesce(who, ''), 80), left(msg, 2000));
end $$;

create or replace function client_decide(tok text, co uuid, approve boolean, who text)
returns void language plpgsql security definer set search_path = public as $$
begin
  update change_orders c set status = case when approve then 'approved' else 'declined' end,
         decided_by = left(coalesce(who, ''), 80), decided_at = now()
  from projects p
  where c.id = co and c.project_id = p.id and p.client_token = tok and c.status = 'pending';
  if not found then raise exception 'invalid'; end if;
end $$;

revoke all on function client_project(text) from public;
revoke all on function client_comment(text, text, text) from public;
revoke all on function client_decide(text, uuid, boolean, text) from public;
grant execute on function client_project(text) to anon, authenticated;
grant execute on function client_comment(text, text, text) to anon, authenticated;
grant execute on function client_decide(text, uuid, boolean, text) to anon, authenticated;

-- ---------- Solicitudes de estimado (formulario del sitio web) --------

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users on delete cascade,
  name text not null,
  phone text default '',
  email text default '',
  city text default '',
  service text default '',
  message text default '',
  lang text default 'es',
  status text default 'new' check (status in ('new','contacted','won','archived')),
  project_id uuid references projects on delete set null,
  created_at timestamptz default now(),
  constraint leads_len check (char_length(name) between 1 and 120 and char_length(coalesce(phone,'')) <= 40
    and char_length(coalesce(email,'')) <= 160 and char_length(coalesce(city,'')) <= 120
    and char_length(coalesce(service,'')) <= 80 and char_length(coalesce(message,'')) <= 2000)
);
alter table leads enable row level security;
drop policy if exists own_leads on leads;
create policy own_leads on leads for all to authenticated
  using (owner = auth.uid()) with check (owner = auth.uid());
create index if not exists leads_owner_idx on leads (owner, created_at desc);

create or replace function submit_lead(who text, tel text, mail text, town text, svc text, msg text, lng text)
returns void language plpgsql security definer set search_path = public as $$
declare o uuid;
begin
  select owner into o from settings order by owner limit 1;
  if o is null then raise exception 'not configured'; end if;
  if coalesce(trim(who), '') = '' or (coalesce(trim(tel), '') = '' and coalesce(trim(mail), '') = '') then
    raise exception 'invalid';
  end if;
  if (select count(*) from leads where created_at > now() - interval '1 hour') >= 30 then
    raise exception 'too many requests';
  end if;
  insert into leads (owner, name, phone, email, city, service, message, lang)
  values (o, left(trim(who), 120), left(coalesce(tel, ''), 40), left(coalesce(mail, ''), 160),
          left(coalesce(town, ''), 120), left(coalesce(svc, ''), 80), left(coalesce(msg, ''), 2000),
          case when lng = 'en' then 'en' else 'es' end);
end $$;
revoke all on function submit_lead(text, text, text, text, text, text, text) from public;
grant execute on function submit_lead(text, text, text, text, text, text, text) to anon, authenticated;

-- ---------- Estados del proyecto (versión 3) --------------------------
-- estimate_sent = Estimado enviado, estimate_accepted = Estimado aceptado,
-- progress = En progreso, done = Terminado. Pasa los estados viejos a los nuevos.
alter table projects drop constraint if exists projects_status_check;
update projects set status = 'estimate_sent' where status = 'planning' or status is null;
update projects set status = 'progress' where status = 'paused';
alter table projects alter column status set default 'estimate_sent';
alter table projects add constraint projects_status_check
  check (status in ('estimate_sent','estimate_accepted','progress','done'));

-- una copia vieja de la app (guardada en el navegador) puede mandar los estados
-- viejos: se convierten solos en vez de dar error
create or replace function projects_status_compat() returns trigger language plpgsql as $$
begin
  if new.status is null or new.status = 'planning' then new.status := 'estimate_sent';
  elsif new.status = 'paused' then new.status := 'progress';
  end if;
  return new;
end $$;
drop trigger if exists projects_status_compat on projects;
create trigger projects_status_compat before insert or update of status on projects
  for each row execute function projects_status_compat();

-- ---------- Datos para contratos y documentos (versión 3) ------------

alter table settings add column if not exists legal_name text default '';
alter table settings add column if not exists license_no text default '';
alter table settings add column if not exists address text default '';
alter table settings add column if not exists warranty text default '';
alter table settings add column if not exists extra_terms text default '';
alter table settings add column if not exists share_pct numeric default 10;
alter table settings drop constraint if exists settings_share_range;
alter table settings add constraint settings_share_range check (share_pct >= 0 and share_pct <= 100);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects on delete cascade,
  kind text not null check (kind in ('contract','completion')),
  lang text default 'es' check (lang in ('es','en')),
  snapshot jsonb not null,            -- copia exacta del estimado, cambios y pagos al crearlo
  total numeric default 0,
  status text default 'draft' check (status in ('draft','sent','signed','void')),
  signed_by text,
  signed_on date,
  created_at timestamptz default now()
);
alter table documents enable row level security;
drop policy if exists own_rows on documents;
create policy own_rows on documents for all to authenticated
  using (exists (select 1 from projects p where p.id = project_id and p.owner = auth.uid()))
  with check (exists (select 1 from projects p where p.id = project_id and p.owner = auth.uid()));
create index if not exists documents_project_idx on documents (project_id);

-- PDF firmado (por ejemplo, el que regresa de DocuSign) o un contrato que Victor sube
alter table documents add column if not exists file text;
alter table documents drop constraint if exists documents_kind_check;
alter table documents add constraint documents_kind_check check (kind in ('estimate','contract','completion'));

-- ---------- Datos del cliente y detalles del proyecto (versión 3) ------
alter table projects add column if not exists client_phone2 text default '';
alter table projects add column if not exists details text default '';
alter table projects add column if not exists service text default '';
alter table projects drop constraint if exists projects_client_len;
alter table projects add constraint projects_client_len check (
  char_length(coalesce(client_phone,'')) <= 40 and char_length(coalesce(client_phone2,'')) <= 40
  and char_length(coalesce(client_email,'')) <= 160 and char_length(coalesce(details,'')) <= 4000
  and char_length(coalesce(service,'')) <= 80) not valid;

-- ---------- Reglas de datos (montos, largos, enlaces) ----------------
-- Se agregan solo si no existen, para poder correr este archivo otra vez.

alter table expenses add column if not exists budget_id uuid references budget on delete set null;
create index if not exists expenses_budget_idx on expenses (budget_id);

-- un gasto solo puede apuntar a una categoría de su mismo proyecto
create or replace function expenses_budget_same_project() returns trigger
language plpgsql as $$
begin
  if new.budget_id is not null and not exists
     (select 1 from budget b where b.id = new.budget_id and b.project_id = new.project_id) then
    raise exception 'budget category belongs to another project';
  end if;
  return new;
end $$;
drop trigger if exists expenses_budget_check on expenses;
create trigger expenses_budget_check before insert or update of budget_id, project_id on expenses
  for each row execute function expenses_budget_same_project();

do $$
declare c record;
begin
  for c in select * from (values
    ('projects', 'projects_token_len',   'char_length(client_token) >= 24'),
    ('projects', 'projects_tax_range',   'tax_rate >= 0 and tax_rate <= 25'),
    ('projects', 'projects_text_len',    'char_length(coalesce(title,'''')) <= 200 and char_length(coalesce(client_name,'''')) <= 200 and char_length(coalesce(address,'''')) <= 300'),
    ('items', 'items_nonneg',            'qty >= 0 and price >= 0'),
    ('items', 'items_text_len',          'char_length(coalesce(description,'''')) <= 500'),
    ('materials', 'materials_nonneg',    'qty >= 0'),
    ('payments', 'payments_positive',    'amount > 0'),
    ('milestones', 'milestones_nonneg',  'amount >= 0'),
    ('budget', 'budget_nonneg',          'amount >= 0'),
    ('expenses', 'expenses_nonneg',      'amount >= 0'),
    ('change_orders', 'co_text_len',     'char_length(coalesce(details,'''')) <= 2000'),
    ('updates', 'updates_text_len',      'char_length(coalesce(body,'''')) <= 4000 and coalesce(array_length(photos, 1), 0) <= 30'),
    ('comments', 'comments_text_len',    'char_length(body) between 1 and 2000')
  ) as v(tbl, name, expr) loop
    if not exists (select 1 from pg_constraint where conname = c.name) then
      execute format('alter table %I add constraint %I check (%s) not valid', c.tbl, c.name, c.expr);
    end if;
  end loop;
end $$;

-- ---------- Fotos y recibos -------------------------------------------
-- Cada archivo se guarda en una carpeta con el id del proyecto: <proyecto>/<archivo>.
-- Solo el dueño de ese proyecto puede subir, ver (recibos) o borrar sus archivos.
-- photos: públicas con nombres imposibles de adivinar (el cliente las ve).
-- receipts: privadas.

create or replace function public.owns_project_folder(path text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from projects p
                 where p.id::text = split_part(path, '/', 1) and p.owner = auth.uid());
$$;
revoke all on function public.owns_project_folder(text) from public;
grant execute on function public.owns_project_folder(text) to authenticated;

insert into storage.buckets (id, name, public) values ('photos', 'photos', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('receipts', 'receipts', false)
  on conflict (id) do nothing;
-- docs: PDFs firmados. Igual que las fotos: nombres imposibles de adivinar, para
-- que el cliente los descargue desde su enlace privado sin iniciar sesión.
insert into storage.buckets (id, name, public) values ('docs', 'docs', true)
  on conflict (id) do nothing;

drop policy if exists sonec_photos_write on storage.objects;
create policy sonec_photos_write on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and public.owns_project_folder(name));
drop policy if exists sonec_photos_delete on storage.objects;
create policy sonec_photos_delete on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and public.owns_project_folder(name));
drop policy if exists sonec_photos_list on storage.objects;
create policy sonec_photos_list on storage.objects for select to authenticated
  using (bucket_id = 'photos' and public.owns_project_folder(name));
drop policy if exists sonec_docs_all on storage.objects;
create policy sonec_docs_all on storage.objects for all to authenticated
  using (bucket_id = 'docs' and public.owns_project_folder(name))
  with check (bucket_id = 'docs' and public.owns_project_folder(name));
drop policy if exists sonec_receipts_all on storage.objects;
create policy sonec_receipts_all on storage.objects for all to authenticated
  using (bucket_id = 'receipts' and public.owns_project_folder(name))
  with check (bucket_id = 'receipts' and public.owns_project_folder(name));

-- ---------- Permisos de la API ----------------------------------------
-- Funciona aunque "Grant API access to new tables automatically" esté apagado.
-- El contratista (usuario con sesión) usa las tablas; el público (anon) nunca
-- las toca directo, solo por las funciones de abajo.
grant usage on schema public to anon, authenticated;
do $$
declare t text;
begin
  foreach t in array array['settings','projects','items','materials','steps','updates','payments','milestones','change_orders','budget','expenses','comments','leads','documents'] loop
    if to_regclass('public.' || t) is not null then
      execute format('grant select, insert, update, delete on %I to authenticated', t);
      execute format('revoke all on %I from anon', t);
    end if;
  end loop;
end $$;

-- ===== v5 (nov 2026): reglas mas rapidas, indices, avisos de solicitudes, resenas, registro de errores =====
-- 1) funciones de trigger con search_path fijo
alter function public.expenses_budget_same_project() set search_path = public;
alter function public.projects_status_compat() set search_path = public;

-- 2) reglas RLS: auth.uid() se calcula una vez por consulta, no por fila
do $$
declare t text;
begin
  foreach t in array array['items','materials','steps','updates','payments','milestones','change_orders','budget','expenses','comments','documents'] loop
    execute format('drop policy if exists own_rows on public.%I', t);
    execute format($p$create policy own_rows on public.%I for all to authenticated
      using (exists (select 1 from public.projects p where p.id = %I.project_id and p.owner = (select auth.uid())))
      with check (exists (select 1 from public.projects p where p.id = %I.project_id and p.owner = (select auth.uid())))$p$, t, t, t);
  end loop;
end $$;
drop policy if exists own_projects on public.projects;
create policy own_projects on public.projects for all to authenticated
  using (owner = (select auth.uid())) with check (owner = (select auth.uid()));
drop policy if exists own_settings on public.settings;
create policy own_settings on public.settings for all to authenticated
  using (owner = (select auth.uid())) with check (owner = (select auth.uid()));
drop policy if exists own_leads on public.leads;
create policy own_leads on public.leads for all to authenticated
  using (owner = (select auth.uid())) with check (owner = (select auth.uid()));

-- 3) indices de llaves foraneas
create index if not exists projects_owner_idx on public.projects(owner);
create index if not exists leads_project_idx on public.leads(project_id);

-- 4) las funciones del cliente no las necesita un usuario con sesion; solo anon (token) y Victor
revoke execute on function public.owns_project_folder(text) from anon, public;

alter table public.settings add column if not exists review_url text;
alter table public.settings add column if not exists notify_email text;
alter table public.leads add column if not exists notified_at timestamptz;
do $$ begin
  alter table public.settings add constraint settings_review_url_chk check (review_url is null or review_url = '' or review_url ~* '^https://');
exception when duplicate_object then null; end $$;

-- la pagina del cliente tambien recibe el enlace de resenas
create or replace function public.client_project(tok text)
returns json language plpgsql security definer set search_path = public as $$
declare p projects; r json;
begin
  select * into p from projects where client_token = tok;
  if p.id is null then return null; end if;
  select json_build_object(
    'project', json_build_object('id', p.id, 'client_name', p.client_name, 'title', p.title, 'details', p.details, 'service', p.service,
       'address', p.address, 'start_date', p.start_date, 'end_date', p.end_date,
       'status', p.status, 'tax_rate', p.tax_rate),
    'contact', (select json_build_object('company', s.company, 'name', s.contact_name, 'phone', s.phone, 'email', s.email,
                'legal_name', s.legal_name, 'license_no', s.license_no, 'address', s.address, 'review_url', s.review_url)
                from settings s where s.owner = p.owner),
    'items', coalesce((select json_agg(i order by i.sort, i.description) from (select id, kind, description, qty, price, sort from items where project_id = p.id) i), '[]'),
    'materials', coalesce((select json_agg(m order by m.sort, m.name) from (select id, name, qty, unit, purchased, purchased_on, sort from materials where project_id = p.id) m), '[]'),
    'steps', coalesce((select json_agg(s order by s.sort, s.due_date) from (select id, title, done, due_date, sort from steps where project_id = p.id) s), '[]'),
    'updates', coalesce((select json_agg(u order by u.created_at desc) from (select id, body, photos, created_at from updates where project_id = p.id) u), '[]'),
    'payments', coalesce((select json_agg(x order by x.paid_on) from (select id, paid_on, note, amount from payments where project_id = p.id) x), '[]'),
    'milestones', coalesce((select json_agg(x order by x.sort) from (select id, label, amount, sort from milestones where project_id = p.id) x), '[]'),
    'change_orders', coalesce((select json_agg(x order by x.created_at desc) from (select id, title, details, kind, amount, status, decided_by, decided_at, created_at from change_orders where project_id = p.id and status <> 'draft') x), '[]'),
    'comments', coalesce((select json_agg(x order by x.created_at) from (select id, author, name, body, created_at from comments where project_id = p.id) x), '[]'),
    'documents', coalesce((select json_agg(x order by x.created_at desc) from (select id, kind, lang, snapshot, total, status, signed_by, signed_on, file, created_at from documents where project_id = p.id and status in ('sent','signed')) x), '[]')
  ) into r;
  return r;
end $$;

-- registro de errores del app (sin datos personales: mensaje, pagina sin enlace secreto, navegador)
create table if not exists public.app_errors (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  page text, msg text, src text, ua text
);
alter table public.app_errors enable row level security;
drop policy if exists read_errors on public.app_errors;
create policy read_errors on public.app_errors for select to authenticated using (true);
revoke all on public.app_errors from anon, authenticated;
grant select on public.app_errors to authenticated;

create or replace function public.log_error(pg text, m text, s text, u text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from app_errors where created_at > now() - interval '10 minutes') >= 60 then return; end if;
  insert into app_errors (page, msg, src, ua) values (left(pg, 120), left(m, 500), left(s, 1500), left(u, 200));
  delete from app_errors where created_at < now() - interval '90 days';
end $$;
revoke all on function public.log_error(text, text, text, text) from public;
grant execute on function public.log_error(text, text, text, text) to anon, authenticated;

-- aviso por correo cuando llega una solicitud del sitio
create extension if not exists pg_net with schema extensions;
create or replace function public.leads_notify()
returns trigger language plpgsql security definer set search_path = public, extensions as $$
begin
  perform net.http_post(
    url := 'https://zeavzcpsyvcoeghknomm.supabase.co/functions/v1/lead-alert',
    body := jsonb_build_object('id', new.id),
    headers := '{"Content-Type":"application/json"}'::jsonb,
    timeout_milliseconds := 5000);
  return new;
exception when others then
  return new; -- un aviso que falla nunca debe impedir guardar la solicitud
end $$;
revoke all on function public.leads_notify() from public, anon, authenticated;
drop trigger if exists leads_notify on public.leads;
create trigger leads_notify after insert on public.leads for each row execute function public.leads_notify();

update public.settings set notify_email = 'sonecgerencia@gmail.com' where coalesce(notify_email, '') = '';

grant select, update (notified_at) on public.leads to service_role;
grant select (owner, notify_email) on public.settings to service_role;

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
  status text default 'planning' check (status in ('planning','progress','paused','done')),
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
    'project', json_build_object('id', p.id, 'client_name', p.client_name, 'title', p.title,
       'address', p.address, 'start_date', p.start_date, 'end_date', p.end_date,
       'status', p.status, 'tax_rate', p.tax_rate),
    'contact', (select json_build_object('company', s.company, 'name', s.contact_name, 'phone', s.phone, 'email', s.email)
                from settings s where s.owner = p.owner),
    'items', coalesce((select json_agg(i order by i.sort, i.description) from (select id, kind, description, qty, price, sort from items where project_id = p.id) i), '[]'),
    'materials', coalesce((select json_agg(m order by m.sort, m.name) from (select id, name, qty, unit, purchased, purchased_on, sort from materials where project_id = p.id) m), '[]'),
    'steps', coalesce((select json_agg(s order by s.sort, s.due_date) from (select id, title, done, due_date, sort from steps where project_id = p.id) s), '[]'),
    'updates', coalesce((select json_agg(u order by u.created_at desc) from (select id, body, photos, created_at from updates where project_id = p.id) u), '[]'),
    'payments', coalesce((select json_agg(x order by x.paid_on) from (select id, paid_on, note, amount from payments where project_id = p.id) x), '[]'),
    'milestones', coalesce((select json_agg(x order by x.sort) from (select id, label, amount, sort from milestones where project_id = p.id) x), '[]'),
    'change_orders', coalesce((select json_agg(x order by x.created_at desc) from (select id, title, details, kind, amount, status, decided_by, decided_at, created_at from change_orders where project_id = p.id and status <> 'draft') x), '[]'),
    'comments', coalesce((select json_agg(x order by x.created_at) from (select id, author, name, body, created_at from comments where project_id = p.id) x), '[]')
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

drop policy if exists sonec_photos_write on storage.objects;
create policy sonec_photos_write on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and public.owns_project_folder(name));
drop policy if exists sonec_photos_delete on storage.objects;
create policy sonec_photos_delete on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and public.owns_project_folder(name));
drop policy if exists sonec_photos_list on storage.objects;
create policy sonec_photos_list on storage.objects for select to authenticated
  using (bucket_id = 'photos' and public.owns_project_folder(name));
drop policy if exists sonec_receipts_all on storage.objects;
create policy sonec_receipts_all on storage.objects for all to authenticated
  using (bucket_id = 'receipts' and public.owns_project_folder(name))
  with check (bucket_id = 'receipts' and public.owns_project_folder(name));

-- =====================================================================
-- FlySync - schema do Supabase
-- Rode este arquivo inteiro no SQL Editor do Supabase (uma vez).
-- Pode rodar de novo com segurança: usa IF NOT EXISTS / OR REPLACE.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- PROFILES (1 por usuário do Supabase Auth)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text not null default '',
  email         text not null default '',
  role          text not null default 'user' check (role in ('user', 'admin')),
  plan          text not null default 'free' check (plan in ('free', 'premium')),
  preferences   jsonb not null default jsonb_build_object(
                  'emailAlerts', false,
                  'whatsappAlerts', false,
                  'inAppAlerts', true,
                  'pushAlerts', true,
                  'soundEnabled', true,
                  'frequency', 'immediate',
                  'termsAccepted', true,
                  'privacyAccepted', true,
                  'termsAcceptedAt', now()
                ),
  created_at    timestamptz not null default now()
);

-- Verifica se o usuário logado é admin (security definer evita recursão no RLS)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Cria o profile automaticamente no cadastro
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, email)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Usuário comum não pode mudar o próprio papel nem o plano
-- (o plano só muda via pagamento real / admin / service_role)
create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.role := old.role;
    new.plan := old.plan;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_fields on public.profiles;
create trigger protect_profile_fields
  before update on public.profiles
  for each row execute function public.protect_profile_fields();

alter table public.profiles enable row level security;

drop policy if exists "profiles: ver o próprio" on public.profiles;
create policy "profiles: ver o próprio" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles: editar o próprio" on public.profiles;
create policy "profiles: editar o próprio" on public.profiles
  for update using (id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------
-- PROGRAMS (programas de fidelidade)
-- ---------------------------------------------------------------------
create table if not exists public.programs (
  id                text primary key,
  code              text not null unique,
  name              text not null,
  category          text not null check (category in ('airline', 'bank')),
  unit_label        text not null,
  is_active         boolean not null default true,
  color             text not null default '#7C3AED',
  bg_light          text not null default '#F5F3FF',
  airline_alliance  text
);

alter table public.programs enable row level security;

drop policy if exists "programs: leitura pública" on public.programs;
create policy "programs: leitura pública" on public.programs for select using (true);

drop policy if exists "programs: admin escreve" on public.programs;
create policy "programs: admin escreve" on public.programs
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- SOURCES (fontes de coleta: scraper, cadastro manual...)
-- ---------------------------------------------------------------------
create table if not exists public.sources (
  id                      text primary key,
  name                    text not null,
  source_type             text not null check (source_type in ('api', 'scraper', 'crawler', 'curadoria')),
  status                  text not null default 'active' check (status in ('active', 'paused', 'error')),
  terms_reviewed_at       timestamptz not null default now(),
  frequency_minutes       integer not null default 60,
  last_run_at             timestamptz,
  reliability_score       integer not null default 100,
  total_offers_collected  integer not null default 0,
  active_offers_count     integer not null default 0,
  rate_limit_per_minute   integer not null default 0,
  notes                   text
);

alter table public.sources enable row level security;

drop policy if exists "sources: só admin" on public.sources;
create policy "sources: só admin" on public.sources
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- OFFERS (ofertas do Radar)
-- ---------------------------------------------------------------------
create table if not exists public.offers (
  id                   uuid primary key default gen_random_uuid(),
  external_id          text unique,          -- id da oferta no scraper (evita duplicar)
  source_id            text references public.sources(id) on delete set null,
  source_name          text not null default '',
  program_id           text not null references public.programs(id),
  origin               text not null,
  origin_city          text not null default '',
  destination          text not null,
  dest_city            text not null default '',
  departure_date       date not null,
  return_date          date,
  trip_type            text not null default 'one_way' check (trip_type in ('one_way', 'round_trip')),
  cabin_class          text not null default 'economy' check (cabin_class in ('economy', 'premium_economy', 'business', 'first')),
  miles                integer not null check (miles > 0),
  cash_amount          numeric(10, 2) not null default 0,
  currency             text not null default 'BRL',
  airline              text not null default '',
  flight_number        text,
  stops                integer not null default 0,
  status               text not null default 'ativa' check (status in ('ativa', 'expirada', 'desatualizada')),
  availability_status  text not null default 'Observada' check (availability_status in ('Observada', 'Verificada', 'Disponibilidade confirmada')),
  observed_at          timestamptz not null default now(),
  verified_at          timestamptz not null default now(),
  booking_url          text not null default '',
  seats_left           integer,
  created_at           timestamptz not null default now()
);

create index if not exists offers_route_idx on public.offers (origin, destination, departure_date);
create index if not exists offers_status_idx on public.offers (status);

alter table public.offers enable row level security;

drop policy if exists "offers: leitura pública" on public.offers;
create policy "offers: leitura pública" on public.offers for select using (true);

drop policy if exists "offers: admin escreve" on public.offers;
create policy "offers: admin escreve" on public.offers
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- OFFER OBSERVATIONS (histórico de preço -> gráfico de previsão)
-- ---------------------------------------------------------------------
create table if not exists public.offer_observations (
  id                   uuid primary key default gen_random_uuid(),
  offer_id             uuid not null references public.offers(id) on delete cascade,
  observed_at          timestamptz not null default now(),
  miles                integer not null,
  cash_amount          numeric(10, 2) not null default 0,
  availability_status  text not null default 'Observada'
);

create index if not exists offer_observations_offer_idx on public.offer_observations (offer_id, observed_at);

alter table public.offer_observations enable row level security;

drop policy if exists "observations: leitura pública" on public.offer_observations;
create policy "observations: leitura pública" on public.offer_observations for select using (true);

drop policy if exists "observations: admin escreve" on public.offer_observations;
create policy "observations: admin escreve" on public.offer_observations
  for all using (public.is_admin()) with check (public.is_admin());

-- Registra uma observação sempre que uma oferta entra ou muda de preço
create or replace function public.record_offer_observation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT'
     or new.miles is distinct from old.miles
     or new.cash_amount is distinct from old.cash_amount then
    insert into public.offer_observations (offer_id, observed_at, miles, cash_amount, availability_status)
    values (new.id, coalesce(new.observed_at, now()), new.miles, new.cash_amount, new.availability_status);
  end if;
  return new;
end;
$$;

drop trigger if exists record_offer_observation on public.offers;
create trigger record_offer_observation
  after insert or update on public.offers
  for each row execute function public.record_offer_observation();

-- ---------------------------------------------------------------------
-- BALANCES (carteira) + histórico
-- ---------------------------------------------------------------------
create table if not exists public.balances (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  program_id      text not null references public.programs(id),
  balance         bigint not null default 0,
  observed_at     timestamptz not null default now(),
  expires_at      timestamptz,
  account_number  text,
  notes           text,
  updated_at      timestamptz not null default now(),
  unique (user_id, program_id)
);

alter table public.balances enable row level security;

drop policy if exists "balances: só o dono" on public.balances;
create policy "balances: só o dono" on public.balances
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create table if not exists public.balance_history (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  balance_id        uuid references public.balances(id) on delete set null,
  program_name      text not null default '',
  previous_balance  bigint not null default 0,
  new_balance       bigint not null default 0,
  diff              bigint not null default 0,
  recorded_at       timestamptz not null default now(),
  note              text
);

alter table public.balance_history enable row level security;

drop policy if exists "balance_history: só o dono" on public.balance_history;
create policy "balance_history: só o dono" on public.balance_history
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- SAVED SEARCHES (alertas de rota)
-- ---------------------------------------------------------------------
create table if not exists public.saved_searches (
  id                         uuid primary key default gen_random_uuid(),
  user_id                    uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  title                      text not null,
  origin                     text not null,
  destination                text not null,
  max_miles                  integer not null,
  program_id                 text references public.programs(id),
  cabin_class                text,
  departure_month            text,
  is_active                  boolean not null default true,
  push_enabled               boolean not null default true,
  email_enabled              boolean not null default false,
  whatsapp_enabled           boolean not null default false,
  target_price_drop_percent  integer,
  alert_frequency            text not null default 'immediate' check (alert_frequency in ('immediate', 'daily', 'weekly')),
  created_at                 timestamptz not null default now(),
  last_matched_at            timestamptz
);

alter table public.saved_searches enable row level security;

drop policy if exists "saved_searches: só o dono" on public.saved_searches;
create policy "saved_searches: só o dono" on public.saved_searches
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Limite de alertas ativos por plano (free: 2, premium: 15)
create or replace function public.enforce_saved_search_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_plan text;
  max_active integer;
  active_count integer;
begin
  if not new.is_active then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.is_active then
    return new;
  end if;

  select plan into user_plan from public.profiles where id = new.user_id;
  max_active := case when user_plan = 'premium' then 15 else 2 end;

  select count(*) into active_count
  from public.saved_searches
  where user_id = new.user_id and is_active and id <> new.id;

  if active_count >= max_active then
    raise exception 'Limite de % alertas ativos atingido para o seu plano.', max_active
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_saved_search_limit on public.saved_searches;
create trigger enforce_saved_search_limit
  before insert or update on public.saved_searches
  for each row execute function public.enforce_saved_search_limit();

-- ---------------------------------------------------------------------
-- NOTIFICATIONS (caixa de entrada)
-- ---------------------------------------------------------------------
create table if not exists public.notifications (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  offer_id         uuid references public.offers(id) on delete set null,
  saved_search_id  uuid references public.saved_searches(id) on delete set null,
  title            text not null,
  message          text not null,
  channel          text not null default 'in_app' check (channel in ('in_app', 'email', 'whatsapp', 'push')),
  status           text not null default 'unread' check (status in ('read', 'unread')),
  sent_at          timestamptz not null default now(),
  offer_details    jsonb,
  unique (offer_id, saved_search_id)   -- não manda o mesmo alerta duas vezes
);

create index if not exists notifications_user_idx on public.notifications (user_id, sent_at desc);

alter table public.notifications enable row level security;

drop policy if exists "notifications: ver as próprias" on public.notifications;
create policy "notifications: ver as próprias" on public.notifications
  for select using (user_id = auth.uid());

drop policy if exists "notifications: marcar como lida" on public.notifications;
create policy "notifications: marcar como lida" on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "notifications: apagar as próprias" on public.notifications;
create policy "notifications: apagar as próprias" on public.notifications
  for delete using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- MOTOR DE ALERTAS
-- Cruza ofertas ativas com alertas ativos e cria notificações.
-- Roda sozinho quando entra/atualiza uma oferta (inclusive pelo scraper)
-- e quando um alerta é criado.
-- ---------------------------------------------------------------------
create or replace function public.fmt_br_int(n bigint)
returns text
language sql
immutable
as $$
  select replace(to_char(n, 'FM999,999,999,999'), ',', '.');
$$;

create or replace function public.match_alerts(p_offer_id uuid default null, p_search_id uuid default null)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted integer;
begin
  with matches as (
    select o.id as offer_id, s.id as search_id, s.user_id, s.push_enabled, s.max_miles,
           o.origin, o.destination, o.miles, o.cash_amount,
           p.name as program_name, p.unit_label
    from public.offers o
    join public.saved_searches s
      on upper(s.origin) = upper(o.origin)
     and upper(s.destination) = upper(o.destination)
     and o.miles <= s.max_miles
     and (s.program_id is null or s.program_id = o.program_id)
     and (s.cabin_class is null or s.cabin_class = '' or s.cabin_class = o.cabin_class)
    join public.programs p on p.id = o.program_id
    where o.status = 'ativa'
      and s.is_active
      and (p_offer_id is null or o.id = p_offer_id)
      and (p_search_id is null or s.id = p_search_id)
  ),
  ins as (
    insert into public.notifications (user_id, offer_id, saved_search_id, title, message, channel, offer_details)
    select
      m.user_id,
      m.offer_id,
      m.search_id,
      '⚡ Oportunidade: ' || m.origin || ' ➔ ' || m.destination,
      m.program_name || ': ' || public.fmt_br_int(m.miles) || ' ' || m.unit_label
        || ' (seu limite: ' || public.fmt_br_int(m.max_miles) || '). Taxas R$ '
        || replace(to_char(m.cash_amount, 'FM999999990.00'), '.', ','),
      case when m.push_enabled then 'push' else 'in_app' end,
      jsonb_build_object('route', m.origin || ' ➔ ' || m.destination, 'miles', m.miles, 'program', m.program_name)
    from matches m
    on conflict (offer_id, saved_search_id) do nothing
    returning saved_search_id
  ),
  touched as (
    update public.saved_searches s
       set last_matched_at = now()
     where s.id in (select saved_search_id from ins)
    returning 1
  )
  select count(*) into inserted from ins;

  return inserted;
end;
$$;

-- Botão "verificar agora": roda o motor só para os alertas do usuário logado
create or replace function public.run_my_alert_matcher()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  total integer := 0;
  s record;
begin
  for s in select id from public.saved_searches where user_id = auth.uid() and is_active loop
    total := total + public.match_alerts(null, s.id);
  end loop;
  return total;
end;
$$;

revoke execute on function public.match_alerts(uuid, uuid) from public, anon, authenticated;
grant execute on function public.run_my_alert_matcher() to authenticated;

create or replace function public.trg_match_on_offer()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'ativa' then
    perform public.match_alerts(new.id, null);
  end if;
  return new;
end;
$$;

drop trigger if exists match_on_offer on public.offers;
create trigger match_on_offer
  after insert or update of miles, status, cash_amount on public.offers
  for each row execute function public.trg_match_on_offer();

create or replace function public.trg_match_on_search()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_active then
    perform public.match_alerts(null, new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists match_on_search on public.saved_searches;
create trigger match_on_search
  after insert or update of is_active, max_miles, origin, destination, program_id, cabin_class on public.saved_searches
  for each row execute function public.trg_match_on_search();

-- ---------------------------------------------------------------------
-- COLLECTION RUNS (execuções do scraper)
-- ---------------------------------------------------------------------
create table if not exists public.collection_runs (
  id               uuid primary key default gen_random_uuid(),
  source_id        text references public.sources(id) on delete set null,
  source_name      text not null default '',
  started_at       timestamptz not null default now(),
  finished_at      timestamptz,
  status           text not null default 'success' check (status in ('success', 'partial', 'error')),
  records_count    integer not null default 0,
  valid_count      integer not null default 0,
  duplicate_count  integer not null default 0,
  rejected_count   integer not null default 0,
  latency_ms       integer not null default 0,
  error_code       text
);

alter table public.collection_runs enable row level security;

drop policy if exists "collection_runs: só admin" on public.collection_runs;
create policy "collection_runs: só admin" on public.collection_runs
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- AUDIT LOGS
-- ---------------------------------------------------------------------
create table if not exists public.audit_logs (
  id           uuid primary key default gen_random_uuid(),
  actor_id     uuid default auth.uid(),
  actor_name   text not null default '',
  action       text not null,
  entity_type  text not null check (entity_type in ('offer', 'source', 'campaign', 'balance', 'subscription')),
  entity_id    text not null default '',
  details      text not null default '',
  created_at   timestamptz not null default now()
);

alter table public.audit_logs enable row level security;

drop policy if exists "audit_logs: admin lê" on public.audit_logs;
create policy "audit_logs: admin lê" on public.audit_logs for select using (public.is_admin());

drop policy if exists "audit_logs: usuário registra as próprias ações" on public.audit_logs;
create policy "audit_logs: usuário registra as próprias ações" on public.audit_logs
  for insert with check (actor_id = auth.uid());

-- ---------------------------------------------------------------------
-- EXCLUSÃO DE CONTA (LGPD): o próprio usuário apaga a conta e os dados
-- (profiles e tudo que depende dele somem em cascata)
-- ---------------------------------------------------------------------
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Não autenticado';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- ---------------------------------------------------------------------
-- REALTIME (ofertas novas e notificações aparecem sem recarregar)
-- ---------------------------------------------------------------------
do $$
begin
  begin
    alter publication supabase_realtime add table public.offers;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.notifications;
  exception when duplicate_object then null;
  end;
end $$;

-- ---------------------------------------------------------------------
-- DADOS BÁSICOS
-- ---------------------------------------------------------------------
insert into public.programs (id, code, name, category, unit_label, is_active, color, bg_light, airline_alliance) values
  ('prog-smiles',    'smiles',    'Smiles (GOL)',       'airline', 'milhas', true, '#FF6700', '#FFF5EB', 'Parceiras GOL'),
  ('prog-latampass', 'latampass', 'LATAM Pass',         'airline', 'pontos', true, '#E8112D', '#FFF0F2', 'LATAM Airlines'),
  ('prog-azul',      'azul',      'Azul Fidelidade',    'airline', 'pontos', true, '#0055A5', '#EDF5FC', 'Azul Conecta / United'),
  ('prog-tap',       'tap',       'TAP Miles&Go',       'airline', 'milhas', true, '#13894E', '#EDFAF3', 'Star Alliance'),
  ('prog-livelo',    'livelo',    'Livelo (Bancário)',  'bank',    'pontos', true, '#E6007E', '#FDF0F7', 'Bradesco / BB transferível'),
  ('prog-esfera',    'esfera',    'Esfera (Santander)', 'bank',    'pontos', true, '#EC0000', '#FFF0F0', 'Santander transferível'),
  ('prog-iberia',    'iberia',    'Iberia Plus',        'airline', 'Avios',  true, '#D81E05', '#FDF1EF', 'oneworld')
on conflict (id) do nothing;

insert into public.sources (id, name, source_type, status, frequency_minutes, notes) values
  ('src-manual',  'Cadastro manual (admin)', 'curadoria', 'active', 0,  'Ofertas cadastradas à mão no painel admin.'),
  ('src-scraper', 'Scraper FlySync',         'scraper',   'paused', 60, 'Reservado para o scraper (ainda não integrado).')
on conflict (id) do nothing;

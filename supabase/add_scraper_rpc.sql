-- =====================================================================
-- Função RPC para o Scraper Monitor-Milhas inserir ofertas no FlySync
-- Pode ser chamada diretamente pelo Python usando a Publishable Key ou Service Role
-- =====================================================================

-- Garante que a fonte do scraper existe no Admin -> Fontes
insert into public.sources (id, name, source_type, status, notes)
values ('src-scraper', 'Scraper Monitor-Milhas (API)', 'scraper', 'active', 'Conector Python automatizado via API REST')
on conflict (id) do nothing;

create or replace function public.sync_scraper_offer(p_offer jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_prog_id text;
  v_cabin text;
  v_external_id text;
  v_miles integer;
  v_taxes numeric;
  v_origin text;
  v_destination text;
begin
  v_external_id := coalesce(p_offer->>'raw_id', p_offer->>'external_id');
  v_origin := upper(coalesce(p_offer->>'origin', ''));
  v_destination := upper(coalesce(p_offer->>'destination', ''));
  
  if v_origin = '' or v_destination = '' then
    return jsonb_build_object('success', false, 'error', 'Origem e destino são obrigatórios');
  end if;

  -- Rejeita datas passadas
  if (p_offer->>'departure_date') is null or (p_offer->>'departure_date')::date < current_date then
    return jsonb_build_object('success', false, 'error', 'Data de partida deve ser no futuro');
  end if;

  -- Purga automaticamente ofertas vencidas
  delete from public.offers where departure_date < current_date;

  if v_external_id is null or v_external_id = '' then
    v_external_id := 'scraped-' || md5(v_origin || v_destination || (p_offer->>'departure_date') || (p_offer->>'price_miles'));
  end if;

  -- Mapeia programa
  v_prog_id := case
    when lower(coalesce(p_offer->>'program', '')) like '%smiles%' then 'prog-smiles'
    when lower(coalesce(p_offer->>'program', '')) like '%azul%' then 'prog-azul'
    when lower(coalesce(p_offer->>'program', '')) in ('fleyn', 'latam', 'latampass') then 'prog-latampass'
    when lower(coalesce(p_offer->>'program', '')) like '%tap%' then 'prog-tap'
    when lower(coalesce(p_offer->>'program', '')) like '%iberia%' then 'prog-iberia'
    else coalesce(p_offer->>'program_id', 'prog-smiles')
  end;

  -- Mapeia cabine
  v_cabin := case
    when upper(coalesce(p_offer->>'cabin', '')) in ('BUSINESS', 'EXECUTIVA') then 'business'
    when upper(coalesce(p_offer->>'cabin', '')) in ('FIRST', 'PRIMEIRA') then 'first'
    when upper(coalesce(p_offer->>'cabin', '')) like '%PREMIUM%' then 'premium_economy'
    else 'economy'
  end;

  v_miles := greatest((coalesce(p_offer->>'price_miles', p_offer->>'miles', '0'))::integer, 1);
  v_taxes := coalesce((coalesce(p_offer->>'taxes', p_offer->>'cash_amount', '0'))::numeric, 0);

  insert into public.offers (
    external_id,
    source_id,
    source_name,
    program_id,
    origin,
    origin_city,
    destination,
    dest_city,
    departure_date,
    trip_type,
    cabin_class,
    miles,
    cash_amount,
    currency,
    airline,
    flight_number,
    stops,
    status,
    availability_status,
    booking_url,
    seats_left
  ) values (
    v_external_id,
    'src-scraper',
    'Scraper Monitor-Milhas',
    v_prog_id,
    v_origin,
    coalesce(p_offer->>'origin_city', ''),
    v_destination,
    coalesce(p_offer->>'destination_city', p_offer->>'dest_city', ''),
    (p_offer->>'departure_date')::date,
    'one_way',
    v_cabin,
    v_miles,
    v_taxes,
    coalesce(p_offer->>'currency', 'BRL'),
    coalesce(p_offer->>'airline', ''),
    p_offer->>'flight_number',
    coalesce((coalesce(p_offer->>'connection_count', p_offer->>'stops', '0'))::integer, 0),
    'ativa',
    'Disponibilidade confirmada',
    coalesce(p_offer->>'booking_url', 'https://www.smiles.com.br'),
    coalesce((p_offer->>'seats_left')::integer, 4)
  )
  on conflict (external_id) do update set
    miles = excluded.miles,
    cash_amount = excluded.cash_amount,
    seats_left = coalesce(excluded.seats_left, offers.seats_left),
    observed_at = now(),
    verified_at = now(),
    status = 'ativa'
  returning id into v_id;

  -- Atualiza contadores na fonte
  update public.sources
  set 
    last_run_at = now(),
    total_offers_collected = total_offers_collected + 1,
    active_offers_count = (select count(*) from public.offers where source_id = 'src-scraper' and status = 'ativa')
  where id = 'src-scraper';

  return jsonb_build_object('success', true, 'offer_id', v_id);
exception when others then
  return jsonb_build_object('success', false, 'error', sqlerrm);
end;
$$;

grant execute on function public.sync_scraper_offer(jsonb) to anon, authenticated, service_role;

-- Função auxiliar para purgar ofertas expiradas a qualquer momento
create or replace function public.purge_expired_offers()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  delete from public.offers where departure_date < current_date;
  get diagnostics v_count = row_count;
  return jsonb_build_object('success', true, 'purged_count', v_count);
exception when others then
  return jsonb_build_object('success', false, 'error', sqlerrm);
end;
$$;

grant execute on function public.purge_expired_offers() to anon, authenticated, service_role;

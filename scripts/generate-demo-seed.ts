// Gera supabase/seed_demo.sql a partir das ofertas de exemplo em src/data/initialData.ts
// Uso: npx tsx scripts/generate-demo-seed.ts
import fs from 'node:fs';
import path from 'node:path';
import { INITIAL_OFFERS, INITIAL_OBSERVATIONS } from '../src/data/initialData';

const q = (v: unknown): string => {
  if (v === undefined || v === null || v === '') return 'null';
  if (typeof v === 'number') return String(v);
  return `'${String(v).replace(/'/g, "''")}'`;
};

const lines: string[] = [
  '-- Ofertas de DEMONSTRAÇÃO (geradas de src/data/initialData.ts).',
  '-- Rode depois do schema.sql. Para remover: delete from public.offers where external_id like \'demo-%\';',
  '',
];

for (const o of INITIAL_OFFERS) {
  lines.push(
    `insert into public.offers (external_id, source_name, program_id, origin, origin_city, destination, dest_city, departure_date, return_date, trip_type, cabin_class, miles, cash_amount, currency, airline, flight_number, stops, status, availability_status, observed_at, verified_at, booking_url, seats_left) values (` +
      [
        q(`demo-${o.id}`), q(o.sourceName), q(o.programId), q(o.origin), q(o.originCity), q(o.destination), q(o.destCity),
        q(o.departureDate), q(o.returnDate), q(o.tripType), q(o.cabinClass), q(o.miles), q(o.cashAmount), q(o.currency),
        q(o.airline), q(o.flightNumber), q(o.stops), q(o.status), q(o.availabilityStatus), q(o.observedAt), q(o.verifiedAt),
        q(o.bookingUrl), q(o.seatsLeft),
      ].join(', ') +
      `) on conflict (external_id) do nothing;`
  );
}

lines.push('', '-- Histórico de preço extra (o preço atual já é registrado automaticamente pelo trigger)');
for (const obs of INITIAL_OBSERVATIONS) {
  const offer = INITIAL_OFFERS.find(o => o.id === obs.offerId);
  if (offer && offer.miles === obs.miles) continue; // já criado pelo trigger
  lines.push(
    `insert into public.offer_observations (offer_id, observed_at, miles, cash_amount, availability_status) ` +
      `select id, ${q(obs.observedAt)}, ${q(obs.miles)}, ${q(obs.cashAmount)}, ${q(obs.availabilityStatus)} ` +
      `from public.offers where external_id = ${q(`demo-${obs.offerId}`)};`
  );
}

const out = path.resolve('supabase/seed_demo.sql');
fs.writeFileSync(out, lines.join('\n') + '\n', 'utf8');
console.log(`OK: ${INITIAL_OFFERS.length} ofertas -> ${out}`);

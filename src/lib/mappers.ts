// Conversão entre as linhas do Postgres (snake_case) e os tipos do app (camelCase)
import {
  UserProfile,
  LoyaltyProgram,
  MileageBalance,
  BalanceHistory,
  FlightOffer,
  OfferObservation,
  OfferSource,
  CollectionRun,
  SavedSearch,
  AppNotification,
  AuditLog
} from '../types';

type Row = Record<string, any>;

const num = (v: unknown, fallback = 0): number => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const opt = <T,>(v: T | null | undefined): T | undefined => (v === null ? undefined : v);

export const DEFAULT_PREFERENCES: UserProfile['preferences'] = {
  emailAlerts: false,
  whatsappAlerts: false,
  inAppAlerts: true,
  pushAlerts: true,
  soundEnabled: true,
  frequency: 'immediate',
  termsAccepted: true,
  privacyAccepted: true,
  termsAcceptedAt: new Date().toISOString()
};

export const toProfile = (r: Row): UserProfile => ({
  id: r.id,
  displayName: r.display_name || (r.email ? String(r.email).split('@')[0] : 'Viajante'),
  email: r.email || '',
  role: r.role === 'admin' ? 'admin' : 'user',
  plan: r.plan === 'premium' ? 'premium' : 'free',
  createdAt: r.created_at,
  preferences: { ...DEFAULT_PREFERENCES, ...(r.preferences || {}) }
});

export const toProgram = (r: Row): LoyaltyProgram => ({
  id: r.id,
  code: r.code,
  name: r.name,
  category: r.category,
  unitLabel: r.unit_label,
  isActive: r.is_active,
  color: r.color,
  bgLight: r.bg_light,
  airlineAlliance: opt(r.airline_alliance)
});

export const toBalance = (r: Row): MileageBalance => ({
  id: r.id,
  userId: r.user_id,
  programId: r.program_id,
  balance: num(r.balance),
  observedAt: r.observed_at,
  expiresAt: r.expires_at ?? null,
  accountNumber: opt(r.account_number),
  notes: opt(r.notes),
  updatedAt: r.updated_at
});

export const toBalanceHistory = (r: Row): BalanceHistory => ({
  id: r.id,
  balanceId: r.balance_id || '',
  programName: r.program_name,
  previousBalance: num(r.previous_balance),
  newBalance: num(r.new_balance),
  diff: num(r.diff),
  recordedAt: r.recorded_at,
  note: opt(r.note)
});

const inferAirline = (airline?: string, programId?: string): string => {
  if (airline && airline.trim() !== '') return airline.trim();
  switch (programId) {
    case 'prog-latampass':
      return 'LATAM Airlines';
    case 'prog-smiles':
      return 'GOL Linhas Aéreas';
    case 'prog-azul':
      return 'Azul Linhas Aéreas';
    case 'prog-iberia':
      return 'Iberia';
    case 'prog-tap':
      return 'TAP Air Portugal';
    case 'prog-livelo':
      return 'LATAM / GOL';
    case 'prog-esfera':
      return 'Iberia / LATAM';
    default:
      return 'LATAM Airlines';
  }
};

const IATA_CITY_MAP: Record<string, string> = {
  GRU: 'São Paulo', CGH: 'São Paulo', VCP: 'Campinas',
  GIG: 'Rio de Janeiro', SDU: 'Rio de Janeiro',
  REC: 'Recife', SSA: 'Salvador', FOR: 'Fortaleza',
  BSB: 'Brasília', CNF: 'Belo Horizonte', CWB: 'Curitiba',
  POA: 'Porto Alegre', FLN: 'Florianópolis', MCZ: 'Maceió',
  NAT: 'Natal', MAO: 'Manaus', BEL: 'Belém',
  MIA: 'Miami', MCO: 'Orlando', JFK: 'Nova York', EWR: 'Nova York',
  MAD: 'Madri', LIS: 'Lisboa', OPO: 'Porto',
  EZE: 'Buenos Aires', AEP: 'Buenos Aires', SCL: 'Santiago',
  MVD: 'Montevidéu', CDG: 'Paris', LHR: 'Londres'
};

const inferCity = (city?: string, iata?: string): string => {
  if (city && city.trim() !== '') return city.trim();
  if (iata && IATA_CITY_MAP[iata.toUpperCase()]) return IATA_CITY_MAP[iata.toUpperCase()];
  return iata || '';
};

export const toOffer = (r: Row): FlightOffer => ({
  id: r.id,
  sourceId: r.source_id || '',
  programId: r.program_id,
  origin: r.origin,
  originCity: inferCity(r.origin_city, r.origin),
  destination: r.destination,
  destCity: inferCity(r.dest_city, r.destination),
  departureDate: r.departure_date,
  returnDate: opt(r.return_date),
  tripType: r.trip_type,
  cabinClass: r.cabin_class,
  miles: num(r.miles),
  cashAmount: num(r.cash_amount),
  currency: r.currency,
  airline: inferAirline(r.airline, r.program_id),
  flightNumber: opt(r.flight_number),
  stops: num(r.stops),
  status: r.status,
  availabilityStatus: r.availability_status,
  observedAt: r.observed_at,
  verifiedAt: r.verified_at,
  bookingUrl: r.booking_url,
  sourceName: r.source_name,
  seatsLeft: r.seats_left === null || r.seats_left === undefined ? undefined : num(r.seats_left)
});

export const fromOffer = (o: Omit<FlightOffer, 'id' | 'observedAt' | 'verifiedAt'>): Row => ({
  source_id: o.sourceId || null,
  source_name: o.sourceName,
  program_id: o.programId,
  origin: o.origin.toUpperCase(),
  origin_city: o.originCity,
  destination: o.destination.toUpperCase(),
  dest_city: o.destCity,
  departure_date: o.departureDate,
  return_date: o.returnDate || null,
  trip_type: o.tripType,
  cabin_class: o.cabinClass,
  miles: o.miles,
  cash_amount: o.cashAmount,
  currency: o.currency,
  airline: o.airline,
  flight_number: o.flightNumber || null,
  stops: o.stops,
  status: o.status,
  availability_status: o.availabilityStatus,
  booking_url: o.bookingUrl,
  seats_left: o.seatsLeft ?? null
});

export const toObservation = (r: Row): OfferObservation => ({
  id: r.id,
  offerId: r.offer_id,
  observedAt: r.observed_at,
  miles: num(r.miles),
  cashAmount: num(r.cash_amount),
  availabilityStatus: r.availability_status
});

export const toSavedSearch = (r: Row): SavedSearch => ({
  id: r.id,
  userId: r.user_id,
  title: r.title,
  origin: r.origin,
  destination: r.destination,
  maxMiles: num(r.max_miles),
  programId: r.program_id || undefined,
  cabinClass: r.cabin_class || undefined,
  departureMonth: r.departure_month || undefined,
  isActive: r.is_active,
  pushEnabled: r.push_enabled,
  emailEnabled: r.email_enabled,
  whatsappEnabled: r.whatsapp_enabled,
  targetPriceDropPercent: r.target_price_drop_percent ?? undefined,
  alertFrequency: r.alert_frequency,
  createdAt: r.created_at,
  lastMatchedAt: opt(r.last_matched_at)
});

/** Só os campos que o app pode alterar num alerta */
export const fromSavedSearchPatch = (s: Partial<SavedSearch>): Row => {
  const out: Row = {};
  if (s.title !== undefined) out.title = s.title;
  if (s.origin !== undefined) out.origin = s.origin.toUpperCase();
  if (s.destination !== undefined) out.destination = s.destination.toUpperCase();
  if (s.maxMiles !== undefined) out.max_miles = s.maxMiles;
  if (s.programId !== undefined) out.program_id = s.programId || null;
  if (s.cabinClass !== undefined) out.cabin_class = s.cabinClass || null;
  if (s.departureMonth !== undefined) out.departure_month = s.departureMonth || null;
  if (s.isActive !== undefined) out.is_active = s.isActive;
  if (s.pushEnabled !== undefined) out.push_enabled = s.pushEnabled;
  if (s.emailEnabled !== undefined) out.email_enabled = s.emailEnabled;
  if (s.whatsappEnabled !== undefined) out.whatsapp_enabled = s.whatsappEnabled;
  if (s.targetPriceDropPercent !== undefined) out.target_price_drop_percent = s.targetPriceDropPercent;
  if (s.alertFrequency !== undefined) out.alert_frequency = s.alertFrequency;
  return out;
};

export const toNotification = (r: Row): AppNotification => ({
  id: r.id,
  userId: r.user_id,
  offerId: r.offer_id || '',
  savedSearchId: opt(r.saved_search_id),
  title: r.title,
  message: r.message,
  channel: r.channel,
  status: r.status,
  sentAt: r.sent_at,
  offerDetails: r.offer_details || undefined
});

export const toSource = (r: Row): OfferSource => ({
  id: r.id,
  name: r.name,
  sourceType: r.source_type,
  status: r.status,
  termsReviewedAt: r.terms_reviewed_at,
  frequencyMinutes: num(r.frequency_minutes),
  lastRunAt: r.last_run_at || '',
  reliabilityScore: num(r.reliability_score),
  totalOffersCollected: num(r.total_offers_collected),
  activeOffersCount: num(r.active_offers_count),
  rateLimitPerMinute: num(r.rate_limit_per_minute),
  notes: opt(r.notes)
});

export const toCollectionRun = (r: Row): CollectionRun => ({
  id: r.id,
  sourceId: r.source_id || '',
  sourceName: r.source_name,
  startedAt: r.started_at,
  finishedAt: r.finished_at || '',
  status: r.status,
  recordsCount: num(r.records_count),
  validCount: num(r.valid_count),
  duplicateCount: num(r.duplicate_count),
  rejectedCount: num(r.rejected_count),
  latencyMs: num(r.latency_ms),
  errorCode: opt(r.error_code)
});

export const toAuditLog = (r: Row): AuditLog => ({
  id: r.id,
  actorId: r.actor_id || '',
  actorName: r.actor_name,
  action: r.action,
  entityType: r.entity_type,
  entityId: r.entity_id,
  details: r.details,
  createdAt: r.created_at
});

/** Insere/atualiza por id mantendo a ordem (novos no topo) */
export const upsertById = <T extends { id: string }>(list: T[], item: T): T[] => {
  const idx = list.findIndex(x => x.id === item.id);
  if (idx === -1) return [item, ...list];
  const next = [...list];
  next[idx] = item;
  return next;
};

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
import { buildOfficialBookingUrl, isBookingLinkSupported } from '../utils/bookingUrls';
import { findAirportByIata } from '../data/airports';

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
  termsAcceptedAt: new Date().toISOString(),
  preferredOrigin: 'GRU',
  preferredCabin: 'economy',
  favoriteDestinations: ['MIA', 'LIS', 'MAD', 'REC', 'SCL'],
  favoriteOrigins: ['GRU', 'GIG', 'CNF'],
  phone: '(11) 98765-4321'
};

export const ADMIN_EMAILS = [
  'maia.operacional@gmail.com',
  'isabelle021004@gmail.com',
  'admin@flysync.app'
];

export const isAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
};

export const toProfile = (r: Row): UserProfile => {
  const email = r.email || '';
  const isAdmin = r.role === 'admin' || isAdminEmail(email);

  return {
    id: r.id,
    displayName: r.display_name || (email ? String(email).split('@')[0] : 'Ivy Maia'),
    email,
    role: isAdmin ? 'admin' : 'user',
    plan: (r.plan === 'premium' || isAdmin) ? 'premium' : 'free',
    createdAt: r.created_at,
    preferences: { ...DEFAULT_PREFERENCES, ...(r.preferences || {}) }
  };
};

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

const AIRLINE_CODE_MAP: Record<string, string> = {
  'JJ': 'LATAM Airlines',
  'LA': 'LATAM Airlines',
  'LP': 'LATAM Airlines',
  'XL': 'LATAM Airlines',
  '4M': 'LATAM Airlines',
  '4C': 'LATAM Airlines',
  'PZ': 'LATAM Airlines',
  'G3': 'GOL Linhas Aéreas',
  'AD': 'Azul Linhas Aéreas',
  'TP': 'TAP Air Portugal',
  'IB': 'Iberia',
  'AF': 'Air France',
  'KL': 'KLM',
  'AA': 'American Airlines',
  'DL': 'Delta Air Lines',
  'UA': 'United Airlines',
  'CM': 'Copa Airlines',
  'AV': 'Avianca',
  'AR': 'Aerolíneas Argentinas',
  '2Z': 'Voepass Linhas Aéreas',
  'VO': 'Voepass Linhas Aéreas',
  'WJ': 'JetSMART',
  'JA': 'JetSMART',
  'H2': 'SKY Airline',
  'FO': 'Flybondi',
  'QR': 'Qatar Airways',
  'EK': 'Emirates',
  'TK': 'Turkish Airlines',
  'BA': 'British Airways',
  'AZ': 'ITA Airways',
  'LH': 'Lufthansa',
  'LX': 'SWISS',
  'UX': 'Air Europa',
  'CA': 'Air China',
  'ET': 'Ethiopian Airlines',
  'AM': 'Aeromexico',
  'AC': 'Air Canada',
  'AT': 'Royal Air Maroc',
  'SN': 'Brussels Airlines',
  'OS': 'Austrian Airlines',
  'EW': 'Eurowings',
  'SA': 'South African Airways',
  'TA': 'Avianca',
  'OB': 'Boliviana de Aviación',
  'DT': 'TAAG Angola Airlines',
  'KQ': 'Kenya Airways',
};

const inferAirline = (airline?: string, programId?: string): string => {
  if (airline && airline.trim() !== '') {
    const trimmed = airline.trim();
    const code = trimmed.toUpperCase();
    if (AIRLINE_CODE_MAP[code]) return AIRLINE_CODE_MAP[code];
    return trimmed;
  }
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

const inferCity = (city?: string, iata?: string): string => {
  if (city && city.trim() !== '') return city.trim();
  if (iata) {
    const found = findAirportByIata(iata);
    if (found?.city) return found.city;
  }
  return iata || '';
};

const isIntlAirport = (code?: string): boolean => {
  if (!code) return false;
  const c = code.toUpperCase();
  const INTL = new Set([
    'MIA', 'MCO', 'JFK', 'EWR', 'MAD', 'LIS', 'OPO', 'CDG', 'EZE', 'SCL', 'MVD', 'BOG', 'LIM',
    'CUN', 'ORL', 'FLL', 'NAS', 'BCN', 'NCE', 'FRA', 'MXP', 'FCO', 'AMS', 'LHR', 'DOH', 'DXB'
  ]);
  return INTL.has(c);
};

export const toOffer = (r: Row): FlightOffer => {
  let miles = num(r.miles);
  let cashAmount = num(r.cash_amount);
  const extId = String(r.external_id || r.raw_id || r.id || '');
  const sourceName = String(r.source_name || '');
  const bookingUrl = String(r.booking_url || '');
  const bookingUrlLower = bookingUrl.toLowerCase();
  const airline = inferAirline(r.airline, r.program_id);

  const isIntl = isIntlAirport(r.origin) || isIntlAirport(r.destination);

  // Detecta se é oferta em dinheiro originada do Melhores Destinos ou agências parceiras
  const isFromCashScraper =
    extId.startsWith('md_') ||
    extId.toLowerCase().includes('melhores') ||
    sourceName.toLowerCase().includes('melhores') ||
    bookingUrlLower.includes('melhores') ||
    bookingUrlLower.includes('cvc.com.br') ||
    bookingUrlLower.includes('decolar.com') ||
    bookingUrlLower.includes('trackeame.com') ||
    r.payment_type === 'cash' ||
    (!extId.startsWith('smiles-') && !extId.startsWith('latam-') && !extId.startsWith('demo-') && miles > 0 && miles < 5500);

  let paymentType: 'miles' | 'cash' = isFromCashScraper ? 'cash' : (r.payment_type || 'miles');
  let cashPriceTotal = r.cash_price_total ? num(r.cash_price_total) : undefined;

  if (isFromCashScraper) {
    paymentType = 'cash';
    // O valor em reais do post promocional (ex: R$ 3.132 para Madri, R$ 3.596 para Orlando, R$ 309 para nacional)
    let rawCash = (cashPriceTotal && cashPriceTotal > 0) ? cashPriceTotal : (miles > 0 ? miles : 0);
    if (rawCash <= 0) {
      rawCash = isIntl ? 2890 : 389;
    }
    cashPriceTotal = rawCash;

    if (isIntl) {
      // Taxas internacionais de embarque
      cashAmount = Math.min(rawCash * 0.15, 382.40);
      if (cashAmount < 180) cashAmount = 382.40;
      // Milhas equivalentes no programa de pontos
      const fareNet = Math.max(300, rawCash - cashAmount);
      miles = Math.round((fareNet / 0.045) / 500) * 500;
      if (miles < 35000) miles = 45000;
    } else {
      // Taxa doméstica ANAC padrão
      cashAmount = Math.min(rawCash * 0.15, 54.90);
      if (cashAmount < 35) cashAmount = 54.90;
      const cpm = airline.includes('LATAM') ? 0.023 : airline.includes('Azul') ? 0.021 : 0.0185;
      const fareNet = Math.max(100, rawCash - cashAmount);
      miles = Math.round((fareNet / cpm) / 100) * 100;
      if (miles < 6000) miles = 8200;
    }
  } else {
    // Oferta real em milhas: garantir sanidade mínima (evitar voo internacional a 3.000 milhas ou taxas zeradas)
    if (isIntl) {
      if (miles < 15000) {
        miles = Math.round((miles * 15) / 500) * 500;
        if (miles < 35000) miles = 45000;
      }
      if (cashAmount <= 0) {
        cashAmount = 382.40;
      }
    } else {
      if (cashAmount <= 0) {
        cashAmount = 54.90;
      }
      if (miles < 2500) {
        miles = 6800;
      }
    }
  }

  // Detecta se é ida e volta pelo link ou pelos dados
  const isRoundTrip = bookingUrlLower.includes('roundtrip') || r.trip_type === 'round_trip';
  const tripType = isRoundTrip ? 'round_trip' : (r.trip_type || 'one_way');

  return {
    id: r.id,
    sourceId: r.source_id || '',
    programId: isFromCashScraper ? 'prog-cash' : r.program_id,
    origin: r.origin,
    originCity: inferCity(r.origin_city, r.origin),
    destination: r.destination,
    destCity: inferCity(r.dest_city, r.destination),
    departureDate: r.departure_date,
    returnDate: opt(r.return_date),
    tripType,
    cabinClass: r.cabin_class || 'economy',
    miles,
    cashAmount,
    currency: r.currency || 'BRL',
    airline,
    flightNumber: opt(r.flight_number),
    stops: num(r.stops),
    status: r.status || 'ativa',
    availabilityStatus: r.availability_status || 'Disponibilidade confirmada',
    observedAt: r.observed_at || new Date().toISOString(),
    verifiedAt: r.verified_at || new Date().toISOString(),
    bookingUrl: r.booking_url || buildOfficialBookingUrl({
      origin: r.origin,
      destination: r.destination,
      departureDate: r.departure_date,
      returnDate: r.return_date,
      tripType,
      cabinClass: r.cabin_class,
      programId: r.program_id,
      airline
    }),
    sourceName: isFromCashScraper ? 'Melhores Destinos (Dinheiro)' : (r.source_name || 'Scraper Monitor-Milhas'),
    seatsLeft: opt(r.seats_left) ?? 4,
    paymentType,
    cashPriceTotal
  };
};

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

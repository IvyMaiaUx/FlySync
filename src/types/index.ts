export type UserRole = 'user' | 'admin';

export type PlanCode = 'free' | 'premium';

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  plan: PlanCode;
  createdAt: string;
  preferences: {
    emailAlerts: boolean;
    whatsappAlerts: boolean;
    inAppAlerts: boolean;
    pushAlerts: boolean;
    soundEnabled: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
    termsAccepted: boolean;
    privacyAccepted: boolean;
    termsAcceptedAt: string;
  };
}

export interface LoyaltyProgram {
  id: string;
  code: string; // e.g. 'smiles', 'latampass', 'azul', 'tap', 'livelo', 'esfera', 'aadvantage'
  name: string;
  category: 'airline' | 'bank';
  unitLabel: string; // 'milhas', 'pontos', 'Avios'
  isActive: boolean;
  color: string;
  bgLight: string;
  airlineAlliance?: string;
}

export interface MileageBalance {
  id: string;
  userId: string;
  programId: string;
  balance: number;
  observedAt: string;
  expiresAt?: string | null;
  accountNumber?: string;
  notes?: string;
  updatedAt: string;
}

export interface BalanceHistory {
  id: string;
  balanceId: string;
  programName: string;
  previousBalance: number;
  newBalance: number;
  diff: number;
  recordedAt: string;
  note?: string;
}

export type OfferAvailabilityStatus = 'Observada' | 'Verificada' | 'Disponibilidade confirmada';

export type OfferStatus = 'ativa' | 'expirada' | 'desatualizada';

export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';

export type TripType = 'one_way' | 'round_trip';

export interface FlightOffer {
  id: string;
  sourceId: string;
  programId: string;
  origin: string; // IATA (e.g. GRU)
  originCity: string;
  destination: string; // IATA (e.g. MIA)
  destCity: string;
  departureDate: string;
  returnDate?: string;
  tripType: TripType;
  cabinClass: CabinClass;
  miles: number;
  cashAmount: number; // Taxes and fees
  currency: string; // 'BRL'
  airline: string;
  flightNumber?: string;
  stops: number;
  status: OfferStatus;
  availabilityStatus: OfferAvailabilityStatus;
  observedAt: string;
  verifiedAt: string;
  bookingUrl: string;
  sourceName: string;
  seatsLeft?: number;
}

export interface OfferObservation {
  id: string;
  offerId: string;
  observedAt: string;
  miles: number;
  cashAmount: number;
  availabilityStatus: OfferAvailabilityStatus;
}

export interface SavedSearch {
  id: string;
  userId: string;
  title: string;
  origin: string;
  destination: string;
  maxMiles: number;
  programId?: string; // empty means any program
  cabinClass?: CabinClass | string;
  tripType?: TripType;
  departureMonth?: string;
  isActive: boolean;
  pushEnabled?: boolean;
  emailEnabled?: boolean;
  whatsappEnabled?: boolean;
  targetPriceDropPercent?: number; // e.g. 10 (%)
  alertFrequency?: 'immediate' | 'daily' | 'weekly';
  createdAt: string;
  lastMatchedAt?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  offerId: string;
  savedSearchId?: string;
  title: string;
  message: string;
  channel: 'in_app' | 'email' | 'whatsapp' | 'push';
  status: 'read' | 'unread';
  sentAt: string;
  offerDetails?: {
    route: string;
    miles: number;
    program: string;
  };
}

export interface PlanFeature {
  id: string;
  label: string;
  freeLimit: string;
  premiumLimit: string;
}

export interface Plan {
  id: string;
  code: PlanCode;
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  currency: string;
  features: string[];
  maxSavedSearches: number;
  alertSpeed: 'instant' | 'daily';
  hasPriceHistory: boolean;
  hasPrioritySupport: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planCode: PlanCode;
  provider: 'stripe' | 'pix' | 'manual';
  providerSubscriptionId: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled';
  billingInterval: 'month' | 'year';
  currentPeriodEnd: string;
  createdAt: string;
}

export interface PaymentEvent {
  id: string;
  providerEventId: string;
  eventType: 'payment_intent.succeeded' | 'customer.subscription.created' | 'invoice.paid' | 'customer.subscription.deleted';
  processedAt: string;
  status: 'processed' | 'failed' | 'ignored';
  amount: number;
  currency: string;
  method: string;
}

export interface PartnerCampaign {
  id: string;
  partnerName: string;
  category: 'transfer_bonus' | 'shopping_points' | 'buy_points' | 'credit_card';
  title: string;
  description: string;
  bonusPercentage?: number;
  pointsMultiplier?: string; // e.g. "10 pts / R$ 1"
  startsAt: string;
  endsAt: string;
  destinationUrl: string;
  isAffiliate: boolean;
  status: 'active' | 'expired';
  termsSummary: string;
  badgeText?: string;
}

export interface AffiliateClick {
  id: string;
  campaignId: string;
  campaignTitle: string;
  userId: string;
  clickedAt: string;
  referralCode: string;
}

export type SourceType = 'api' | 'scraper' | 'crawler' | 'curadoria';

export type SourceStatus = 'active' | 'paused' | 'error';

export interface OfferSource {
  id: string;
  name: string;
  sourceType: SourceType;
  status: SourceStatus;
  termsReviewedAt: string;
  frequencyMinutes: number;
  lastRunAt: string;
  reliabilityScore: number; // 0 to 100
  totalOffersCollected: number;
  activeOffersCount: number;
  rateLimitPerMinute: number;
  notes?: string;
}

export interface CollectionRun {
  id: string;
  sourceId: string;
  sourceName: string;
  startedAt: string;
  finishedAt: string;
  status: 'success' | 'partial' | 'error';
  recordsCount: number;
  validCount: number;
  duplicateCount: number;
  rejectedCount: number;
  latencyMs: number;
  errorCode?: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  entityType: 'offer' | 'source' | 'campaign' | 'balance' | 'subscription';
  entityId: string;
  details: string;
  createdAt: string;
}

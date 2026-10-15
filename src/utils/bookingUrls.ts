import { FlightOffer } from '../types';

/**
 * Utilitário para gerar URLs oficiais de emissão de passagens por programa de fidelidade.
 * Mapeamento baseado rigorosamente na matriz oficial fornecida pelo usuário:
 * Programas de Viagem | Companhias Aéreas Nacionais & Internacionais | Links de Emissão
 */

export interface BookingUrlParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  tripType?: 'one_way' | 'round_trip';
  cabinClass?: 'economy' | 'premium_economy' | 'business' | 'first';
  programId?: string;
  airline?: string;
}

export interface ProgramMappingRule {
  programKeywords: string[];
  url: string;
}

export const PROGRAM_EMISSION_RULES: ProgramMappingRule[] = [
  // 1. AAdvantage
  // GOL, American Airlines, British Airways, Cathay Pacific, Etihad Airways, Fiji Airways, Finnair, Iberia, Japan Airlines, Qantas Airways, Qatar Airways, Royal Air Maroc
  {
    programKeywords: ['aadvantage', 'aa.com', 'american'],
    url: 'https://www.aa.com/'
  },

  // 2. Aeroplan
  // Azul, GOL, Air Canada, All Nippon Airways, Avianca, Lufthansa, TAP Air Portugal
  {
    programKeywords: ['aeroplan', 'air canada'],
    url: 'https://www.aeroplan.com/'
  },

  // 3. Azul Pelo Mundo (interline internacional da Azul)
  // Aerolíneas Argentinas, Air Europa, Avianca, Copa Airlines, Emirates, Ethiopian Airlines, Etihad Airways, Qatar Airways, Royal Air Maroc, SKY Airline, TAAG, Turkish Airlines, United Airlines, American Airlines
  {
    programKeywords: ['azul pelo mundo', 'azulpelomundo', 'mundo'],
    url: 'https://azulpelomundo.voeazul.com.br/'
  },

  // 4. Azul Fidelidade
  // Azul, Air Canada, Copa Airlines, Turkish Airlines, United Airlines
  {
    programKeywords: ['azul fidelidade', 'tudoazul', 'prog-azul', 'azul'],
    url: 'https://www.voeazul.com.br/'
  },

  // 5. Executive Club
  // British Airways
  {
    programKeywords: ['executive club', 'executiveclub', 'british airways', 'ba.com'],
    url: 'https://www.britishairways.com/travel/redeem/execclub/_gf/pt_br'
  },

  // 6. Finnair Plus
  // Air France, Finnair
  {
    programKeywords: ['finnair'],
    url: 'https://www.finnair.com/'
  },

  // 7. Flying Club
  // LATAM, Air France, Iberia, KLM, Virgin Atlantic
  {
    programKeywords: ['flying club', 'flyingclub', 'virgin atlantic', 'virgin'],
    url: 'https://www.virginatlantic.com/flying-club/'
  },

  // 8. Flying Blue
  // Air France, KLM
  {
    programKeywords: ['flying blue', 'flyingblue', 'air france', 'klm'],
    url: 'https://www.flyingblue.com/'
  },

  // 9. Iberia Plus
  // LATAM, British Airways, Cathay Pacific, Iberia
  {
    programKeywords: ['iberia plus', 'iberiaplus', 'prog-iberia', 'iberia'],
    url: 'https://www.iberia.com/us/'
  },

  // 10. KrisFlyer
  // Singapore Airlines
  {
    programKeywords: ['krisflyer', 'singapore airlines', 'singapore'],
    url: 'https://www.singaporeair.com/'
  },

  // 11. Latam Pass
  // LATAM, Iberia, Lufthansa, Delta Air Lines, Japan Airlines, Qatar Airways, Swiss
  {
    programKeywords: ['latam pass', 'latampass', 'prog-latampass', 'latam'],
    url: 'https://latampass.latam.com/pt_br/passagens'
  },

  // 12. Privilege Club
  // LATAM, American Airlines, British Airways, Iberia, Qatar Airways, Royal Air Maroc
  {
    programKeywords: ['privilege club', 'privilegeclub', 'qatar airways', 'qatar'],
    url: 'https://www.qatarairways.com/en/homepage.html'
  },

  // 13. Smiles
  // GOL, Azul, Aerolíneas Argentinas, Aeroméxico, Air Canada, Air Europa, Air France, American Airlines, Avianca, Copa Airlines, Emirates, Ethiopian Airlines, KLM, Korean Air, Royal Air Maroc, South African Airways, TAP Air Portugal, Turkish Airlines
  {
    programKeywords: ['smiles', 'prog-smiles'],
    url: 'https://www.smiles.com.br/passagens'
  },

  // 14. TAP Miles&Go
  // TAP Air Portugal
  {
    programKeywords: ['tap miles&go', 'tap miles and go', 'miles&go', 'prog-tap', 'tap air portugal', 'tap'],
    url: 'https://www.flytap.com/'
  }
];

export const isBookingLinkSupported = (_paramsOrOffer?: { airline?: string; programId?: string } | null): boolean => {
  return true;
};

/**
 * Gera URL oficial de resgate de passagens baseada no programa de fidelidade emissor
 */
export const buildOfficialBookingUrl = (params: BookingUrlParams): string => {
  const p = (params.programId || '').toLowerCase().replace(/[-_]/g, ' ').trim();
  const a = (params.airline || '').toLowerCase().trim();

  // 1. Prioridade: busca pelo programa de fidelidade
  if (p) {
    for (const rule of PROGRAM_EMISSION_RULES) {
      if (rule.programKeywords.some(keyword => p.includes(keyword))) {
        return rule.url;
      }
    }
  }

  // 2. Fallback: caso o programId não esteja explícito, mapeia pela companhia aérea
  if (a) {
    if (a.includes('gol')) return 'https://www.smiles.com.br/passagens';
    if (a.includes('latam')) return 'https://latampass.latam.com/pt_br/passagens';
    if (a.includes('azul pelo mundo')) return 'https://azulpelomundo.voeazul.com.br/';
    if (a.includes('azul')) return 'https://www.voeazul.com.br/';
    if (a.includes('iberia')) return 'https://www.iberia.com/us/';
    if (a.includes('tap')) return 'https://www.flytap.com/';
    if (a.includes('british')) return 'https://www.britishairways.com/travel/redeem/execclub/_gf/pt_br';
    if (a.includes('american')) return 'https://www.aa.com/';
    if (a.includes('qatar')) return 'https://www.qatarairways.com/en/homepage.html';
    if (a.includes('air canada')) return 'https://www.aeroplan.com/';
    if (a.includes('singapore')) return 'https://www.singaporeair.com/';
    if (a.includes('virgin')) return 'https://www.virginatlantic.com/flying-club/';
    if (a.includes('finnair')) return 'https://www.finnair.com/';
    if (a.includes('air france') || a.includes('klm')) return 'https://www.flyingblue.com/';
  }

  return 'https://www.google.com/travel/flights';
};

/**
 * Gera URL do Google Flights com a rota e data exatas pré-carregadas.
 * Funciona como plano de contingência 100% garantido para ver horários e conexões.
 */
export const buildGoogleFlightsUrl = (params: BookingUrlParams): string => {
  const origin = (params.origin || 'GRU').toUpperCase().trim();
  const destination = (params.destination || 'REC').toUpperCase().trim();
  const date = params.departureDate || new Date().toISOString().split('T')[0];
  const returnDate = params.returnDate;

  const searchQuery = returnDate && params.tripType === 'round_trip'
    ? `Voos de ${origin} para ${destination} em ${date} ate ${returnDate}`
    : `Voos de ${origin} para ${destination} em ${date}`;

  const query = new URLSearchParams({
    q: searchQuery,
    hl: 'pt-BR',
    curr: 'BRL'
  });

  return `https://www.google.com/travel/flights?${query.toString()}`;
};

/**
 * Retorna a melhor URL de emissão oficial para uma oferta.
 */
export const getEffectiveBookingUrl = (offer: FlightOffer): string => {
  return buildOfficialBookingUrl({
    origin: offer.origin,
    destination: offer.destination,
    departureDate: offer.departureDate,
    returnDate: offer.returnDate,
    tripType: offer.tripType,
    cabinClass: offer.cabinClass,
    programId: offer.programId,
    airline: offer.airline
  });
};

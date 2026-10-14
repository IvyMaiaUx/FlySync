import { FlightOffer } from '../types';

/**
 * Utilitário para gerar URLs diretas de emissão e busca com milhas pré-preenchidas
 * com Origem, Destino, Data de Partida, Cabine e Passageiros.
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

/**
 * Normaliza e identifica o programa ou cia aérea
 */
const detectProgram = (programId?: string, airline?: string): 'smiles' | 'latam' | 'azul' | 'tap' | 'iberia' | 'other' => {
  const p = (programId || '').toLowerCase();
  const a = (airline || '').toLowerCase();

  if (p.includes('smiles') || a.includes('gol') || a.includes('smiles')) return 'smiles';
  if (p.includes('latam') || a.includes('latam')) return 'latam';
  if (p.includes('azul') || a.includes('azul')) return 'azul';
  if (p.includes('tap') || a.includes('tap')) return 'tap';
  if (p.includes('iberia') || a.includes('iberia')) return 'iberia';

  return 'other';
};

/**
 * Gera URL oficial de resgate de milhas pré-preenchida para a data e rota selecionadas.
 */
export const buildOfficialBookingUrl = (params: BookingUrlParams): string => {
  const origin = (params.origin || 'GRU').toUpperCase().trim();
  const destination = (params.destination || 'REC').toUpperCase().trim();
  const date = params.departureDate || new Date().toISOString().split('T')[0];
  const isRoundTrip = params.tripType === 'round_trip' && !!params.returnDate;
  const returnDate = params.returnDate;
  const cabin = params.cabinClass || 'economy';
  const programType = detectProgram(params.programId, params.airline);

  switch (programType) {
    case 'smiles': {
      // Smiles: emissão com milhas direta
      const baseUrl = 'https://www.smiles.com.br/emissao-com-milhas';
      const query = new URLSearchParams({
        originAirportCode: origin,
        destinationAirportCode: destination,
        departureDate: date,
        adults: '1',
        children: '0',
        infants: '0',
        tripType: isRoundTrip ? '2' : '1',
        cabinType: cabin === 'business' ? 'BUSINESS' : 'all',
        currencyCode: 'BRL'
      });
      if (isRoundTrip && returnDate) {
        query.set('returnDate', returnDate);
      }
      return `${baseUrl}?${query.toString()}`;
    }

    case 'latam': {
      // LATAM Airlines: portal brasileiro com redemption=true (LATAM Pass)
      const baseUrl = 'https://www.latamairlines.com/br/pt/oferta-voos';
      const outboundIso = `${date}T12:00:00.000Z`;
      const query = new URLSearchParams({
        origin,
        destination,
        outbound: outboundIso,
        inbound: isRoundTrip && returnDate ? `${returnDate}T12:00:00.000Z` : 'null',
        adt: '1',
        chd: '0',
        inf: '0',
        trip: isRoundTrip ? 'RT' : 'OW',
        cabin: cabin === 'business' ? 'Business' : 'Economy',
        redemption: 'true',
        sort: 'RECOMMENDED'
      });
      return `${baseUrl}?${query.toString()}`;
    }

    case 'azul': {
      // Azul Fidelidade: seleção com pontos
      const baseUrl = 'https://www.voeazul.com.br/br/pt/home/selecao-voo';
      const query = new URLSearchParams({
        origin,
        destination,
        departureDate: date,
        fareType: 'POINTS',
        adults: '1',
        tripType: isRoundTrip ? 'RT' : 'OW'
      });
      if (isRoundTrip && returnDate) {
        query.set('returnDate', returnDate);
      }
      return `${baseUrl}?${query.toString()}`;
    }

    case 'tap': {
      // TAP Miles&Go
      const baseUrl = 'https://www.flytap.com/pt-br/reserva-de-voos';
      const query = new URLSearchParams({
        origin,
        destination,
        departureDate: date,
        useMiles: 'true',
        adults: '1'
      });
      if (isRoundTrip && returnDate) {
        query.set('returnDate', returnDate);
      }
      return `${baseUrl}?${query.toString()}`;
    }

    case 'iberia': {
      // Iberia Plus (Avios)
      const baseUrl = 'https://www.iberia.com/br/voos/';
      const query = new URLSearchParams({
        origin,
        destination,
        dateDeparture: date,
        useAvios: 'true',
        adults: '1'
      });
      if (isRoundTrip && returnDate) {
        query.set('dateReturn', returnDate);
      }
      return `${baseUrl}?${query.toString()}`;
    }

    default: {
      // Fallback universal: Google Flights com a data e rota exata
      return buildGoogleFlightsUrl(params);
    }
  }
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
 * Retorna a melhor URL de emissão para uma oferta.
 * Sempre garante que a data selecionada na tela está contida no link.
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

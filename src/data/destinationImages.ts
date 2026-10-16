/**
 * Imagens reais, vibrantes e de alta resolução dos principais destinos turísticos.
 * Servidas via Unsplash CDN com WebP otimizado e carregamento instantâneo.
 */

const DESTINATION_PHOTOS: Record<string, string> = {
  // América do Norte
  MIA: 'https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?auto=format&fit=crop&w=700&q=80', // Miami Beach
  MCO: 'https://images.unsplash.com/photo-1575089776834-8be34696ffb9?auto=format&fit=crop&w=700&q=80', // Orlando
  ORL: 'https://images.unsplash.com/photo-1575089776834-8be34696ffb9?auto=format&fit=crop&w=700&q=80',
  JFK: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=700&q=80', // Nova York
  EWR: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=700&q=80',
  LAX: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0?auto=format&fit=crop&w=700&q=80', // Los Angeles
  SFO: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=700&q=80', // São Francisco
  BOS: 'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?auto=format&fit=crop&w=700&q=80', // Boston
  ORD: 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&w=700&q=80', // Chicago
  YYZ: 'https://images.unsplash.com/photo-1517935703635-2717090c2210?auto=format&fit=crop&w=700&q=80', // Toronto

  // Europa
  LIS: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=700&q=80', // Lisboa
  OPO: 'https://images.unsplash.com/photo-1555881400-74d7acaacd81?auto=format&fit=crop&w=700&q=80', // Porto
  MAD: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=700&q=80', // Madri
  BCN: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=700&q=80', // Barcelona
  CDG: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=700&q=80', // Paris
  ORY: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=700&q=80',
  LHR: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=700&q=80', // Londres
  LGW: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=700&q=80',
  FCO: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=700&q=80', // Roma
  MXP: 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?auto=format&fit=crop&w=700&q=80', // Milão
  MIL: 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?auto=format&fit=crop&w=700&q=80',
  AMS: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=700&q=80', // Amsterdã
  FRA: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=700&q=80', // Frankfurt
  MUC: 'https://images.unsplash.com/photo-1595867818082-083862f3d630?auto=format&fit=crop&w=700&q=80', // Munique
  ZRH: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?auto=format&fit=crop&w=700&q=80', // Zurique

  // América do Sul
  SCL: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?auto=format&fit=crop&w=700&q=80', // Santiago do Chile
  EZE: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=700&q=80', // Buenos Aires
  AEP: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=700&q=80',
  BRC: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=700&q=80', // Bariloche
  MDZ: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=700&q=80', // Mendoza
  MVD: 'https://images.unsplash.com/photo-1598887142487-3c854d51d2c7?auto=format&fit=crop&w=700&q=80', // Montevidéu
  LIM: 'https://images.unsplash.com/photo-1531968455001-5c5272a41129?auto=format&fit=crop&w=700&q=80', // Lima
  BOG: 'https://images.unsplash.com/photo-1583301286816-f4f05e1e8b25?auto=format&fit=crop&w=700&q=80', // Bogotá

  // Caribe
  CUN: 'https://images.unsplash.com/photo-1510097467424-192d713fd8b2?auto=format&fit=crop&w=700&q=80', // Cancún
  PUJ: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=700&q=80', // Punta Cana
  CUR: 'https://images.unsplash.com/photo-1580237072617-771c3ecc4a24?auto=format&fit=crop&w=700&q=80', // Curaçao
  NAS: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=700&q=80', // Bahamas

  // Oriente Médio, África & Ásia
  DXB: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=700&q=80', // Dubai
  DOH: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=700&q=80', // Doha
  IST: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=700&q=80', // Istambul
  NRT: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=700&q=80', // Tóquio
  HND: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=700&q=80',
  JNB: 'https://images.unsplash.com/photo-1577948000111-9c970dfe3743?auto=format&fit=crop&w=700&q=80', // Joanesburgo

  // Brasil - Destaques Turísticos Nacionais
  GIG: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=700&q=80', // Rio de Janeiro
  SDU: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=700&q=80',
  GRU: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=700&q=80', // São Paulo
  CGH: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=700&q=80',
  REC: 'https://images.unsplash.com/photo-1594904351111-a072f80b1a71?auto=format&fit=crop&w=700&q=80', // Recife
  SSA: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=700&q=80', // Salvador
  FOR: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=700&q=80', // Fortaleza
  FLN: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=700&q=80', // Florianópolis
  NAT: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=700&q=80', // Natal
  MCZ: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=80', // Maceió
  IGU: 'https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&w=700&q=80', // Foz do Iguaçu
  BSB: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=700&q=80', // Brasília
  CNF: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=700&q=80', // Belo Horizonte
  POA: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=700&q=80', // Porto Alegre
  CWB: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=700&q=80', // Curitiba
};

const GENERIC_FALLBACKS = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=80', // Praia tropical
  'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=700&q=80', // Asa de avião ao pôr do sol
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=700&q=80', // Passaporte & viagem
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=700&q=80', // Montanhas & lago
  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=700&q=80', // Cidade moderna
];

/**
 * Retorna uma foto real, vibrante e marcante para o aeroporto de destino ou cidade.
 */
export function getDestinationImageUrl(iataCode: string, cityName?: string): string {
  const code = (iataCode || '').toUpperCase().trim();
  if (DESTINATION_PHOTOS[code]) {
    return DESTINATION_PHOTOS[code];
  }

  // Busca por correspondência no nome da cidade
  const city = (cityName || '').toLowerCase();
  if (city.includes('miami')) return DESTINATION_PHOTOS.MIA;
  if (city.includes('orlando')) return DESTINATION_PHOTOS.MCO;
  if (city.includes('nova york') || city.includes('new york')) return DESTINATION_PHOTOS.JFK;
  if (city.includes('santiago')) return DESTINATION_PHOTOS.SCL;
  if (city.includes('buenos aires')) return DESTINATION_PHOTOS.EZE;
  if (city.includes('bariloche')) return DESTINATION_PHOTOS.BRC;
  if (city.includes('mendoza')) return DESTINATION_PHOTOS.MDZ;
  if (city.includes('lisboa')) return DESTINATION_PHOTOS.LIS;
  if (city.includes('porto')) return DESTINATION_PHOTOS.OPO;
  if (city.includes('madri') || city.includes('madrid')) return DESTINATION_PHOTOS.MAD;
  if (city.includes('barcelona')) return DESTINATION_PHOTOS.BCN;
  if (city.includes('paris')) return DESTINATION_PHOTOS.CDG;
  if (city.includes('roma') || city.includes('rome')) return DESTINATION_PHOTOS.FCO;
  if (city.includes('londres') || city.includes('london')) return DESTINATION_PHOTOS.LHR;
  if (city.includes('cancún') || city.includes('cancun')) return DESTINATION_PHOTOS.CUN;
  if (city.includes('punta cana')) return DESTINATION_PHOTOS.PUJ;
  if (city.includes('dubai')) return DESTINATION_PHOTOS.DXB;
  if (city.includes('tóquio') || city.includes('tokyo')) return DESTINATION_PHOTOS.NRT;
  if (city.includes('rio')) return DESTINATION_PHOTOS.GIG;
  if (city.includes('salvador')) return DESTINATION_PHOTOS.SSA;
  if (city.includes('recife')) return DESTINATION_PHOTOS.REC;
  if (city.includes('fortaleza')) return DESTINATION_PHOTOS.FOR;
  if (city.includes('florianópolis') || city.includes('florianopolis')) return DESTINATION_PHOTOS.FLN;
  if (city.includes('são paulo') || city.includes('sao paulo')) return DESTINATION_PHOTOS.GRU;

  // Hash determinístico para fallback consistente
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = (hash << 5) - hash + code.charCodeAt(i);
  }
  const fallbackIndex = Math.abs(hash) % GENERIC_FALLBACKS.length;
  return GENERIC_FALLBACKS[fallbackIndex];
}

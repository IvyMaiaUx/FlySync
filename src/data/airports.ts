export interface AirportItem {
  iata: string;
  city: string;
  name: string;
  country: string;
  popular?: boolean;
}

export const AIRPORTS: AirportItem[] = [
  // Brasil - Principais Hubs e Capitais
  { iata: 'GRU', city: 'São Paulo', name: 'Aeroporto Internacional de Guarulhos', country: 'Brasil', popular: true },
  { iata: 'CGH', city: 'São Paulo', name: 'Aeroporto de Congonhas', country: 'Brasil', popular: true },
  { iata: 'VCP', city: 'Campinas / SP', name: 'Aeroporto Internacional de Viracopos', country: 'Brasil', popular: true },
  { iata: 'GIG', city: 'Rio de Janeiro', name: 'Aeroporto Internacional do Galeão', country: 'Brasil', popular: true },
  { iata: 'SDU', city: 'Rio de Janeiro', name: 'Aeroporto Santos Dumont', country: 'Brasil', popular: true },
  { iata: 'BSB', city: 'Brasília', name: 'Aeroporto Internacional de Brasília', country: 'Brasil', popular: true },
  { iata: 'CNF', city: 'Belo Horizonte', name: 'Aeroporto Internacional de Confins', country: 'Brasil', popular: true },
  { iata: 'REC', city: 'Recife', name: 'Aeroporto Internacional dos Guararapes', country: 'Brasil', popular: true },
  { iata: 'SSA', city: 'Salvador', name: 'Aeroporto Internacional de Salvador', country: 'Brasil', popular: true },
  { iata: 'FOR', city: 'Fortaleza', name: 'Aeroporto Internacional Pinto Martins', country: 'Brasil', popular: true },
  { iata: 'CWB', city: 'Curitiba', name: 'Aeroporto Internacional Afonso Pena', country: 'Brasil', popular: true },
  { iata: 'POA', city: 'Porto Alegre', name: 'Aeroporto Internacional Salgado Filho', country: 'Brasil', popular: true },
  { iata: 'FLN', city: 'Florianópolis', name: 'Aeroporto Internacional Hercílio Luz', country: 'Brasil', popular: true },
  { iata: 'MCZ', city: 'Maceió', name: 'Aeroporto Internacional Zumbi dos Palmares', country: 'Brasil', popular: true },
  { iata: 'NAT', city: 'Natal', name: 'Aeroporto Internacional de Natal', country: 'Brasil', popular: true },
  { iata: 'JPA', city: 'João Pessoa', name: 'Aeroporto Castro Pinto', country: 'Brasil' },
  { iata: 'VIX', city: 'Vitória', name: 'Aeroporto Eurico de Aguiar Salles', country: 'Brasil' },
  { iata: 'GYN', city: 'Goiânia', name: 'Aeroporto Santa Genoveva', country: 'Brasil' },
  { iata: 'MAO', city: 'Manaus', name: 'Aeroporto Internacional Eduardo Gomes', country: 'Brasil' },
  { iata: 'BEL', city: 'Belém', name: 'Aeroporto Internacional de Val-de-Cans', country: 'Brasil' },
  { iata: 'SLZ', city: 'São Luís', name: 'Aeroporto Marechal Cunha Machado', country: 'Brasil' },
  { iata: 'CGB', city: 'Cuiabá', name: 'Aeroporto Marechal Rondon', country: 'Brasil' },
  { iata: 'CGR', city: 'Campo Grande', name: 'Aeroporto Internacional de Campo Grande', country: 'Brasil' },
  { iata: 'NVT', city: 'Navegantes / SC', name: 'Aeroporto de Navegantes', country: 'Brasil' },
  { iata: 'IGU', city: 'Foz do Iguaçu', name: 'Aeroporto Internacional Cataratas', country: 'Brasil' },
  { iata: 'AJU', city: 'Aracaju', name: 'Aeroporto Santa Maria', country: 'Brasil' },
  { iata: 'UDI', city: 'Uberlândia', name: 'Aeroporto Ten. Cel. Aviador César Bombonato', country: 'Brasil' },
  { iata: 'RAO', city: 'Ribeirão Preto', name: 'Aeroporto Leite Lopes', country: 'Brasil' },

  // América do Norte
  { iata: 'MIA', city: 'Miami', name: 'Miami International Airport', country: 'Estados Unidos', popular: true },
  { iata: 'MCO', city: 'Orlando', name: 'Orlando International Airport', country: 'Estados Unidos', popular: true },
  { iata: 'JFK', city: 'Nova York', name: 'John F. Kennedy International Airport', country: 'Estados Unidos', popular: true },
  { iata: 'EWR', city: 'Nova York / Newark', name: 'Newark Liberty International Airport', country: 'Estados Unidos' },
  { iata: 'LAX', city: 'Los Angeles', name: 'Los Angeles International Airport', country: 'Estados Unidos', popular: true },
  { iata: 'SFO', city: 'São Francisco', name: 'San Francisco International Airport', country: 'Estados Unidos' },
  { iata: 'BOS', city: 'Boston', name: 'Logan International Airport', country: 'Estados Unidos' },
  { iata: 'ORD', city: 'Chicago', name: 'O\'Hare International Airport', country: 'Estados Unidos' },
  { iata: 'ATL', city: 'Atlanta', name: 'Hartsfield-Jackson Atlanta International Airport', country: 'Estados Unidos' },
  { iata: 'IAD', city: 'Washington D.C.', name: 'Dulles International Airport', country: 'Estados Unidos' },
  { iata: 'YYZ', city: 'Toronto', name: 'Toronto Pearson International Airport', country: 'Canadá' },
  { iata: 'YVR', city: 'Vancouver', name: 'Vancouver International Airport', country: 'Canadá' },

  // Europa
  { iata: 'LIS', city: 'Lisboa', name: 'Aeroporto Humberto Delgado', country: 'Portugal', popular: true },
  { iata: 'OPO', city: 'Porto', name: 'Aeroporto Francisco Sá Carneiro', country: 'Portugal', popular: true },
  { iata: 'MAD', city: 'Madri', name: 'Aeropuerto Adolfo Suárez Madrid-Barajas', country: 'Espanha', popular: true },
  { iata: 'BCN', city: 'Barcelona', name: 'Aeropuerto Josep Tarradellas Barcelona-El Prat', country: 'Espanha', popular: true },
  { iata: 'CDG', city: 'Paris', name: 'Aéroport de Paris-Charles de Gaulle', country: 'França', popular: true },
  { iata: 'ORY', city: 'Paris', name: 'Aéroport de Paris-Orly', country: 'França' },
  { iata: 'LHR', city: 'Londres', name: 'Heathrow Airport', country: 'Reino Unido', popular: true },
  { iata: 'LGW', city: 'Londres', name: 'Gatwick Airport', country: 'Reino Unido' },
  { iata: 'FCO', city: 'Roma', name: 'Aeroporto di Roma-Fiumicino', country: 'Itália', popular: true },
  { iata: 'MXP', city: 'Milão', name: 'Aeroporto di Milano-Malpensa', country: 'Itália' },
  { iata: 'FRA', city: 'Frankfurt', name: 'Flughafen Frankfurt am Main', country: 'Alemanha', popular: true },
  { iata: 'MUC', city: 'Munique', name: 'Flughafen München', country: 'Alemanha' },
  { iata: 'AMS', city: 'Amsterdã', name: 'Luchthaven Schiphol', country: 'Holanda', popular: true },
  { iata: 'ZRH', city: 'Zurique', name: 'Flughafen Zürich', country: 'Suíça' },

  // América do Sul
  { iata: 'EZE', city: 'Buenos Aires', name: 'Aeropuerto Internacional Ministro Pistarini (Ezeiza)', country: 'Argentina', popular: true },
  { iata: 'AEP', city: 'Buenos Aires', name: 'Aeroparque Jorge Newbery', country: 'Argentina', popular: true },
  { iata: 'SCL', city: 'Santiago', name: 'Aeropuerto Internacional Arturo Merino Benítez', country: 'Chile', popular: true },
  { iata: 'MVD', city: 'Montevidéu', name: 'Aeropuerto Internacional de Carrasco', country: 'Uruguai', popular: true },
  { iata: 'BOG', city: 'Bogotá', name: 'Aeropuerto Internacional El Dorado', country: 'Colômbia' },
  { iata: 'LIM', city: 'Lima', name: 'Aeropuerto Internacional Jorge Chávez', country: 'Peru' },

  // Oriente Médio & Ásia
  { iata: 'DXB', city: 'Dubai', name: 'Dubai International Airport', country: 'Emirados Árabes', popular: true },
  { iata: 'DOH', city: 'Doha', name: 'Hamad International Airport', country: 'Catar', popular: true },
  { iata: 'IST', city: 'Istambul', name: 'Istanbul Airport', country: 'Turquia' },
  { iata: 'NRT', city: 'Tóquio', name: 'Narita International Airport', country: 'Japão' }
];

import globalIataData from './iata_global.json';

export const GLOBAL_AIRPORTS_DICT = globalIataData as Record<string, [string, string]>;

/**
 * Procura um aeroporto pelo código IATA (busca na lista curada e no catálogo global de 8.600+ IATAs)
 */
export const findAirportByIata = (iata: string): AirportItem | undefined => {
  const code = (iata || '').toUpperCase().trim();
  if (!code) return undefined;

  const curated = AIRPORTS.find(a => a.iata === code);
  if (curated) return curated;

  const globalEntry = GLOBAL_AIRPORTS_DICT[code];
  if (globalEntry) {
    return {
      iata: code,
      city: globalEntry[0] || code,
      name: globalEntry[1] || `Aeroporto ${code}`,
      country: 'Internacional',
      popular: false
    };
  }

  return undefined;
};

/**
 * Filtra aeroportos por query (IATA, Cidade ou País) com suporte global a 8.600+ aeroportos
 */
export const filterAirports = (query: string): AirportItem[] => {
  const q = (query || '').toLowerCase().trim();
  if (!q) return AIRPORTS.filter(a => a.popular);

  const curatedMatches = AIRPORTS.filter(a =>
    a.iata.toLowerCase().includes(q) ||
    a.city.toLowerCase().includes(q) ||
    a.name.toLowerCase().includes(q) ||
    a.country.toLowerCase().includes(q)
  );

  const seenIatas = new Set(curatedMatches.map(a => a.iata));
  const globalMatches: AirportItem[] = [];

  for (const [code, [city, name]] of Object.entries(GLOBAL_AIRPORTS_DICT)) {
    if (seenIatas.has(code)) continue;

    const codeMatch = code.toLowerCase().startsWith(q) || code.toLowerCase().includes(q);
    const cityMatch = city && city.toLowerCase().includes(q);
    const nameMatch = name && name.toLowerCase().includes(q);

    if (codeMatch || cityMatch || nameMatch) {
      globalMatches.push({
        iata: code,
        city: city || code,
        name: name || `Aeroporto ${code}`,
        country: 'Internacional',
        popular: false
      });

      if (curatedMatches.length + globalMatches.length >= 30) {
        break;
      }
    }
  }

  return [...curatedMatches, ...globalMatches];
};

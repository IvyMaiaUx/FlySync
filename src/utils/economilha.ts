/**
 * Motor de Inteligência EconoMilha: Milhas vs. Dinheiro & Comparativo Multi-Programa
 * 
 * Calcula o custo real da emissão com base na cotação do milheiro (CPM),
 * estima o preço pagante em dinheiro equivalente e calcula a economia real em R$ e %.
 */

export interface ProgramCpm {
  id: string;
  name: string;
  defaultCpm: number; // Reais por 1.000 milhas
  color: string;
}

export const DEFAULT_PROGRAM_CPM: Record<string, ProgramCpm> = {
  'prog-smiles': { id: 'prog-smiles', name: 'Smiles', defaultCpm: 17.50, color: '#FF6A00' },
  'prog-latampass': { id: 'prog-latampass', name: 'LATAM Pass', defaultCpm: 26.00, color: '#E8112D' },
  'prog-azul': { id: 'prog-azul', name: 'Azul Fidelidade', defaultCpm: 19.00, color: '#0085CA' },
  'prog-tap': { id: 'prog-tap', name: 'TAP Miles&Go', defaultCpm: 38.00, color: '#27B466' },
  'prog-iberia': { id: 'prog-iberia', name: 'Iberia Plus (Avios)', defaultCpm: 68.00, color: '#C8102E' },
};

export type EconomilhaVerdict = 'super_deal' | 'good_deal' | 'fair_deal' | 'cash_better';

export interface EconomilhaAnalysis {
  cpmUsed: number;
  milesCostReais: number;
  totalCostReais: number; // milhas convertidas + taxas
  estimatedCashPrice: number; // preço em dinheiro no site da companhia
  savedReais: number; // economia em R$
  savedPercent: number; // economia em %
  verdict: EconomilhaVerdict;
  verdictBadge: string;
  verdictLabel: string;
  verdictMessage: string;
  programComparison: {
    programName: string;
    miles: number;
    taxes: number;
    totalReais: number;
    differenceReais: number;
    isCurrent: boolean;
    isBestOption: boolean;
  }[];
}

/**
 * Estima a tarifa de balcão (pagante em dinheiro) média para a rota e cabine.
 */
export function estimateCashPrice(origin: string, destination: string, cabinClass: string): number {
  const isBusiness = (cabinClass || '').toLowerCase().includes('business');
  const org = (origin || '').toUpperCase();
  const dst = (destination || '').toUpperCase();

  // Rotas internacionais populares
  const northAmerica = ['MIA', 'MCO', 'JFK', 'EWR', 'LAX', 'ORD', 'BOS'];
  const europe = ['LIS', 'OPO', 'MAD', 'BCN', 'CDG', 'LHR', 'FCO', 'MXP', 'AMS', 'FRA'];
  const southAmerica = ['EZE', 'AEP', 'SCL', 'MVD', 'LIM', 'BOG', 'ASU'];
  const caribbean = ['CUN', 'PUJ', 'PTY', 'AUA', 'CUR', 'HAV'];

  if (northAmerica.includes(dst) || northAmerica.includes(org)) {
    return isBusiness ? 14500 : 3850;
  }
  if (europe.includes(dst) || europe.includes(org)) {
    return isBusiness ? 16800 : 4900;
  }
  if (southAmerica.includes(dst) || southAmerica.includes(org)) {
    return isBusiness ? 4800 : 1850;
  }
  if (caribbean.includes(dst) || caribbean.includes(org)) {
    return isBusiness ? 9500 : 3100;
  }

  // Doméstico Brasil
  return isBusiness ? 2200 : 890;
}

/**
 * Executa a análise completa estilo EconoMilha
 */
export function analyzeOfferEconomilha(
  programId: string,
  cabinClass: string,
  miles: number,
  cashAmount: number,
  origin: string,
  destination: string,
  customCpm?: number
): EconomilhaAnalysis {
  const normProg = (programId || '').toLowerCase().includes('latam')
    ? 'prog-latampass'
    : (programId || '').toLowerCase().includes('azul')
    ? 'prog-azul'
    : (programId || '').toLowerCase().includes('tap')
    ? 'prog-tap'
    : (programId || '').toLowerCase().includes('iberia')
    ? 'prog-iberia'
    : 'prog-smiles';

  const progInfo = DEFAULT_PROGRAM_CPM[normProg] || DEFAULT_PROGRAM_CPM['prog-smiles'];
  const cpm = customCpm && customCpm > 0 ? customCpm : progInfo.defaultCpm;

  const milesCostReais = (miles / 1000) * cpm;
  const totalCostReais = Math.round(milesCostReais + (cashAmount || 0));
  const estimatedCash = estimateCashPrice(origin, destination, cabinClass);

  const savedReais = Math.max(0, estimatedCash - totalCostReais);
  const rawDiff = estimatedCash - totalCostReais;
  const savedPercent = Math.round((rawDiff / estimatedCash) * 100);

  let verdict: EconomilhaVerdict;
  let verdictBadge: string;
  let verdictLabel: string;
  let verdictMessage: string;

  if (savedPercent >= 35) {
    verdict = 'super_deal';
    verdictBadge = 'bg-emerald-500/20 text-[#22C55E] border-emerald-500/40';
    verdictLabel = '🔥 Super Economia com Milhas';
    verdictMessage = `Emitir com milhas economiza R$ ${savedReais.toLocaleString('pt-BR')} (${savedPercent}% OFF em relação ao dinheiro). Vantagem máxima!`;
  } else if (savedPercent >= 15) {
    verdict = 'good_deal';
    verdictBadge = 'bg-teal-500/20 text-teal-300 border-teal-500/40';
    verdictLabel = 'Compensa com Milhas';
    verdictMessage = `Bom negócio: você economiza R$ ${savedReais.toLocaleString('pt-BR')} (${savedPercent}% OFF). Vale a emissão!`;
  } else if (savedPercent >= 0) {
    verdict = 'fair_deal';
    verdictBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    verdictLabel = 'Empate Técnico';
    verdictMessage = `O custo em milhas está próximo do preço pagante em dinheiro. Só compensa se suas milhas estiverem prestes a expirar.`;
  } else {
    verdict = 'cash_better';
    verdictBadge = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    verdictLabel = 'Melhor Pagar em Dinheiro';
    verdictMessage = `Nesta data o resgate em milhas está inflacionado. Comprar a passagem em dinheiro sai mais vantajoso!`;
  }

  // Gera comparativo estimado com os outros 3 principais programas para a mesma rota
  const isBusiness = (cabinClass || '').toLowerCase().includes('business');
  
  // Fatores de equivalência entre tabelas de milhas
  let smilesMiles = normProg === 'prog-smiles' ? miles : Math.round(miles * (normProg === 'prog-latampass' ? 1.45 : 1.15));
  let latamMiles = normProg === 'prog-latampass' ? miles : Math.round(miles * (normProg === 'prog-smiles' ? 0.72 : 0.85));
  let azulMiles = normProg === 'prog-azul' ? miles : Math.round(miles * (normProg === 'prog-smiles' ? 0.95 : 1.30));

  const smilesCost = Math.round((smilesMiles / 1000) * DEFAULT_PROGRAM_CPM['prog-smiles'].defaultCpm + cashAmount);
  const latamCost = Math.round((latamMiles / 1000) * DEFAULT_PROGRAM_CPM['prog-latampass'].defaultCpm + cashAmount);
  const azulCost = Math.round((azulMiles / 1000) * DEFAULT_PROGRAM_CPM['prog-azul'].defaultCpm + cashAmount);

  const programs = [
    {
      programName: 'LATAM Pass',
      miles: latamMiles,
      taxes: cashAmount,
      totalReais: latamCost,
      differenceReais: latamCost - totalCostReais,
      isCurrent: normProg === 'prog-latampass',
      isBestOption: false,
    },
    {
      programName: 'Smiles',
      miles: smilesMiles,
      taxes: cashAmount,
      totalReais: smilesCost,
      differenceReais: smilesCost - totalCostReais,
      isCurrent: normProg === 'prog-smiles',
      isBestOption: false,
    },
    {
      programName: 'Azul Fidelidade',
      miles: azulMiles,
      taxes: cashAmount,
      totalReais: azulCost,
      differenceReais: azulCost - totalCostReais,
      isCurrent: normProg === 'prog-azul',
      isBestOption: false,
    },
  ];

  // Marca quem tem o menor custo em R$
  const minCost = Math.min(...programs.map(p => p.totalReais));
  programs.forEach(p => {
    if (p.totalReais === minCost) p.isBestOption = true;
  });

  return {
    cpmUsed: cpm,
    milesCostReais: Math.round(milesCostReais),
    totalCostReais,
    estimatedCashPrice: estimatedCash,
    savedReais,
    savedPercent,
    verdict,
    verdictBadge,
    verdictLabel,
    verdictMessage,
    programComparison: programs,
  };
}

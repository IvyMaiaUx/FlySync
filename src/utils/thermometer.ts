/**
 * Termômetro de Milhas FlySync
 * Baseado no Guia Oficial de Referência (março/2026)
 *
 * Avalia oportunidades em 4 faixas:
 * - 🔥 Excelente (única faixa com emoji de destaque)
 * - Bom
 * - Normal
 * - Ruim
 */

export type DealRating = 'excellent' | 'good' | 'normal' | 'bad';

export interface DealEvaluation {
  rating: DealRating;
  label: string;
  emoji: string;
  badgeBg: string;
  badgeText: string;
  border: string;
  description: string;
  maxExcellent: number;
  maxGood: number;
  maxNormal: number;
}

// Mapeamento de IATAs conhecidos para Regiões
const IATA_REGION_MAP: Record<string, string> = {
  // América do Norte
  MIA: 'north_america',
  MCO: 'north_america',
  JFK: 'north_america',
  EWR: 'north_america',
  LAX: 'north_america',
  SFO: 'north_america',
  ORD: 'north_america',
  BOS: 'north_america',
  ATL: 'north_america',
  YYZ: 'north_america',
  YVR: 'north_america',
  MEX: 'north_america',
  CUN: 'caribbean_central_america',

  // Europa
  LIS: 'europe',
  OPO: 'europe',
  MAD: 'europe',
  BCN: 'europe',
  CDG: 'europe',
  ORY: 'europe',
  LHR: 'europe',
  LGW: 'europe',
  FCO: 'europe',
  MXP: 'europe',
  AMS: 'europe',
  FRA: 'europe',
  MUC: 'europe',
  ZRH: 'europe',
  DUB: 'europe',
  VIE: 'europe',

  // América do Sul
  GRU: 'south_america',
  CGH: 'south_america',
  VCP: 'south_america',
  GIG: 'south_america',
  SDU: 'south_america',
  BSB: 'south_america',
  CNF: 'south_america',
  SSA: 'south_america',
  REC: 'south_america',
  FOR: 'south_america',
  POA: 'south_america',
  CWB: 'south_america',
  FLN: 'south_america',
  BEL: 'south_america',
  MAO: 'south_america',
  EZE: 'south_america',
  AEP: 'south_america',
  SCL: 'south_america',
  MVD: 'south_america',
  ASU: 'south_america',
  LIM: 'south_america',
  BOG: 'south_america',

  // Caribe / América Central
  PTY: 'caribbean_central_america',
  PUJ: 'caribbean_central_america',
  SDQ: 'caribbean_central_america',
  HAV: 'caribbean_central_america',
  AUA: 'caribbean_central_america',
  CUR: 'caribbean_central_america',
  SJO: 'caribbean_central_america',

  // África
  JNB: 'africa',
  CPT: 'africa',
  RAK: 'africa',
  CMN: 'africa',
  CAI: 'africa',
  LAD: 'africa',
  SID: 'africa',

  // Oriente Médio
  DXB: 'middle_east',
  DOH: 'middle_east',
  AUH: 'middle_east',
  IST: 'middle_east',
  TLV: 'middle_east',
  RUH: 'middle_east',

  // Ásia
  HND: 'asia',
  NRT: 'asia',
  KIX: 'asia',
  ICN: 'asia',
  BKK: 'asia',
  SIN: 'asia',
  HKG: 'asia',
  PEK: 'asia',
  PVG: 'asia',
};

// Matriz de referência oficial
const THERMOMETER_RULES: Record<
  string, // program_key: 'smiles' | 'latam' | 'azul' | 'azul_pelo_mundo'
  Record<
    string, // cabin: 'economy' | 'business'
    Record<
      string, // region
      { excellent: number; good: number; normal: number }
    >
  >
> = {
  smiles: {
    economy: {
      north_america: { excellent: 70000, good: 99000, normal: 160000 },
      europe: { excellent: 55000, good: 100000, normal: 190000 },
      south_america: { excellent: 30000, good: 50000, normal: 80000 },
      caribbean_central_america: { excellent: 35000, good: 50000, normal: 80000 },
      africa: { excellent: 100000, good: 150000, normal: 180000 },
      middle_east: { excellent: 70000, good: 85000, normal: 110000 },
      asia: { excellent: 75000, good: 95000, normal: 125000 },
    },
    business: {
      north_america: { excellent: 199000, good: 250000, normal: 290000 },
      europe: { excellent: 220000, good: 260000, normal: 300000 },
      south_america: { excellent: 45000, good: 55000, normal: 75000 },
      caribbean_central_america: { excellent: 90000, good: 120000, normal: 160000 },
      africa: { excellent: 201000, good: 250000, normal: 280000 },
      middle_east: { excellent: 200000, good: 250000, normal: 320000 },
      asia: { excellent: 220000, good: 280000, normal: 380000 },
    },
  },
  latam: {
    economy: {
      north_america: { excellent: 60000, good: 80000, normal: 120000 },
      europe: { excellent: 60000, good: 90000, normal: 130000 },
      south_america: { excellent: 25000, good: 35000, normal: 48000 },
      caribbean_central_america: { excellent: 35000, good: 45000, normal: 60000 },
      africa: { excellent: 65000, good: 80000, normal: 105000 },
      middle_east: { excellent: 70000, good: 90000, normal: 115000 },
      asia: { excellent: 75000, good: 95000, normal: 125000 },
    },
    business: {
      north_america: { excellent: 110000, good: 135000, normal: 170000 },
      europe: { excellent: 130000, good: 160000, normal: 210000 },
      south_america: { excellent: 50000, good: 70000, normal: 95000 },
      caribbean_central_america: { excellent: 85000, good: 110000, normal: 140000 },
      africa: { excellent: 110000, good: 140000, normal: 180000 },
      middle_east: { excellent: 130000, good: 160000, normal: 200000 },
      asia: { excellent: 140000, good: 180000, normal: 230000 },
    },
  },
  azul: {
    economy: {
      north_america: { excellent: 55000, good: 70000, normal: 100000 },
      europe: { excellent: 90000, good: 120000, normal: 150000 },
      south_america: { excellent: 18000, good: 28000, normal: 40000 },
      caribbean_central_america: { excellent: 28000, good: 38000, normal: 50000 },
      africa: { excellent: 100000, good: 140000, normal: 180000 },
      middle_east: { excellent: 120000, good: 160000, normal: 200000 },
      asia: { excellent: 130000, good: 170000, normal: 220000 },
    },
    business: {
      north_america: { excellent: 220000, good: 240000, normal: 280000 },
      europe: { excellent: 220000, good: 260000, normal: 300000 },
      south_america: { excellent: 65000, good: 70000, normal: 80000 },
      caribbean_central_america: { excellent: 130000, good: 140000, normal: 160000 },
      africa: { excellent: 200000, good: 260000, normal: 300000 },
      middle_east: { excellent: 580000, good: 70000, normal: 790000 },
      asia: { excellent: 250000, good: 300000, normal: 380000 },
    },
  },
};

export function evaluateDeal(
  programId: string,
  cabinClass: string,
  miles: number,
  destinationIata: string
): DealEvaluation {
  const normProg = (programId || '').toLowerCase().includes('latam')
    ? 'latam'
    : (programId || '').toLowerCase().includes('azul')
    ? 'azul'
    : 'smiles';

  const normCabin = (cabinClass || '').toLowerCase().includes('business') || (cabinClass || '').toLowerCase().includes('first')
    ? 'business'
    : 'economy';

  const normDest = (destinationIata || '').toUpperCase().trim();
  const region = IATA_REGION_MAP[normDest] || 'north_america';

  const progRules = THERMOMETER_RULES[normProg] || THERMOMETER_RULES.smiles;
  const cabinRules = progRules[normCabin] || progRules.economy;
  const limits = cabinRules[region] || { excellent: 50000, good: 80000, normal: 120000 };

  if (miles <= limits.excellent) {
    return {
      rating: 'excellent',
      label: 'Excelente',
      emoji: '🔥',
      badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
      badgeText: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-500',
      description: `Tarifa abaixo do piso histórico (${limits.excellent.toLocaleString()} milhas). Oportunidade imperdível!`,
      maxExcellent: limits.excellent,
      maxGood: limits.good,
      maxNormal: limits.normal,
    };
  }

  if (miles <= limits.good) {
    return {
      rating: 'good',
      label: 'Bom Preço',
      emoji: '',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      badgeText: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500',
      description: `Preço competitivo e vantajoso para resgate imediato.`,
      maxExcellent: limits.excellent,
      maxGood: limits.good,
      maxNormal: limits.normal,
    };
  }

  if (miles <= limits.normal) {
    return {
      rating: 'normal',
      label: 'Preço Normal',
      emoji: '',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      badgeText: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500',
      description: `Tarifa na média histórica. Considere monitorar se a viagem não for urgente.`,
      maxExcellent: limits.excellent,
      maxGood: limits.good,
      maxNormal: limits.normal,
    };
  }

  return {
    rating: 'bad',
    label: 'Tarifa Alta',
    emoji: '',
    badgeBg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30',
    badgeText: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-500',
    description: `Valor acima da média recomendada para emissão com milhas.`,
    maxExcellent: limits.excellent,
    maxGood: limits.good,
    maxNormal: limits.normal,
  };
}

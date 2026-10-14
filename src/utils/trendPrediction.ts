import { FlightOffer, OfferObservation } from '../types';

/**
 * Modelo preditivo FlySync (PRD 4.3).
 *
 * Heurística determinística (sem ML) que combina:
 *  1. Dispersão em relação ao piso histórico da rota
 *  2. Posição em relação à média da rota
 *  3. Escassez de assentos na tarifa
 *  4. Janela de antecedência até o embarque
 *  5. Sazonalidade (alta x baixa temporada)
 */

export type TrendAction = 'BUY_NOW' | 'WAIT';
export type UrgencyLevel = 'alta' | 'moderada' | 'baixa';
export type FactorImpact = 'positive' | 'negative' | 'neutral';

export interface TrendFactor {
  label: string;
  detail: string;
  impact: FactorImpact;
}

export interface TrendChartPoint {
  shortDate: string;
  label: string;
  miles: number;
  type: 'historical' | 'current' | 'predicted';
  note?: string;
}

export interface TrendAnalysisResult {
  action: TrendAction;
  confidenceScore: number;
  urgencyLevel: UrgencyLevel;
  sweetSpotTag: string | null;
  recommendationHeadline: string;
  recommendationExplanation: string;
  currentPrice: number;
  historicalLowestPrice: number;
  averagePrice: number;
  percentFromLowest: number;
  percentFromAverage: number;
  predictedFuturePrice: number;
  expectedPriceChangePercent: number;
  priceHistoryChartData: TrendChartPoint[];
  seasonalInsight: string;
  factors: TrendFactor[];
}

const DAY_MS = 24 * 60 * 60 * 1000;
const HIGH_SEASON_MONTHS = [0, 6, 11]; // jan, jul, dez

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const roundTo = (v: number, step: number) => Math.round(v / step) * step;

const parseDate = (value?: string): Date | null => {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

const shortDate = (d: Date) =>
  d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

const longDate = (d: Date) =>
  d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

const sameRoute = (a: FlightOffer, b: FlightOffer) =>
  a.origin.toUpperCase() === b.origin.toUpperCase() &&
  a.destination.toUpperCase() === b.destination.toUpperCase();

export function calculateRouteTrendInsights(
  currentOffer: FlightOffer,
  allOffers: FlightOffer[],
  observations: OfferObservation[]
): TrendAnalysisResult {
  const currentPrice = currentOffer.miles;

  // Ofertas comparáveis: mesma rota e cabine (fallback: mesma rota)
  let routeOffers = allOffers.filter(
    o => sameRoute(o, currentOffer) && o.cabinClass === currentOffer.cabinClass
  );
  if (routeOffers.length === 0) routeOffers = allOffers.filter(o => sameRoute(o, currentOffer));
  if (!routeOffers.some(o => o.id === currentOffer.id)) routeOffers = [...routeOffers, currentOffer];

  const routeOfferIds = new Set(routeOffers.map(o => o.id));
  const routeObservations = observations
    .filter(obs => routeOfferIds.has(obs.offerId) && obs.miles > 0)
    .sort((a, b) => (parseDate(a.observedAt)?.getTime() ?? 0) - (parseDate(b.observedAt)?.getTime() ?? 0));

  const pricePool = [
    ...routeOffers.map(o => o.miles),
    ...routeObservations.map(o => o.miles),
  ].filter(p => p > 0);

  const historicalLowestPrice = Math.min(currentPrice, ...pricePool);
  const averagePrice = Math.round(
    pricePool.length ? pricePool.reduce((s, p) => s + p, 0) / pricePool.length : currentPrice
  );

  const percentFromLowest =
    historicalLowestPrice > 0
      ? Math.round(((currentPrice - historicalLowestPrice) / historicalLowestPrice) * 100)
      : 0;
  const percentFromAverage =
    averagePrice > 0 ? Math.round(((currentPrice - averagePrice) / averagePrice) * 100) : 0;

  // Antecedência e sazonalidade
  const departure = parseDate(currentOffer.departureDate);
  const daysToDeparture = departure
    ? Math.max(0, Math.round((departure.getTime() - Date.now()) / DAY_MS))
    : null;
  const isHighSeason = departure ? HIGH_SEASON_MONTHS.includes(departure.getMonth()) : false;
  const seats = currentOffer.seatsLeft;

  // ---- Score (>= 55 => comprar agora) ----
  let score = 50;
  const factors: TrendFactor[] = [];

  if (percentFromLowest <= 5) {
    score += 25;
    factors.push({
      label: 'Proximidade do piso histórico',
      impact: 'positive',
      detail:
        percentFromLowest === 0
          ? 'A tarifa atual é a menor já registrada nesta rota.'
          : `A tarifa está apenas ${percentFromLowest}% acima da mínima histórica — margem de queda muito pequena.`,
    });
  } else if (percentFromLowest <= 15) {
    score += 10;
    factors.push({
      label: 'Proximidade do piso histórico',
      impact: 'neutral',
      detail: `Tarifa ${percentFromLowest}% acima da mínima registrada. Ainda é uma faixa competitiva.`,
    });
  } else {
    score -= percentFromLowest > 30 ? 20 : 8;
    factors.push({
      label: 'Proximidade do piso histórico',
      impact: 'negative',
      detail: `Tarifa ${percentFromLowest}% acima da mínima histórica (${historicalLowestPrice.toLocaleString('pt-BR')}). Há espaço relevante para queda.`,
    });
  }

  if (percentFromAverage <= -5) {
    score += 15;
    factors.push({
      label: 'Comparação com a média da rota',
      impact: 'positive',
      detail: `${Math.abs(percentFromAverage)}% abaixo da média observada para a rota.`,
    });
  } else if (percentFromAverage >= 5) {
    score -= 15;
    factors.push({
      label: 'Comparação com a média da rota',
      impact: 'negative',
      detail: `${percentFromAverage}% acima da média observada — historicamente tende a recuar.`,
    });
  } else {
    factors.push({
      label: 'Comparação com a média da rota',
      impact: 'neutral',
      detail: 'Tarifa alinhada à média da rota.',
    });
  }

  if (seats !== undefined && seats <= 3) {
    score += 15;
    factors.push({
      label: 'Escassez de assentos',
      impact: 'positive',
      detail: `Restam apenas ${seats} ${seats === 1 ? 'assento' : 'assentos'} nesta classe tarifária — risco de salto para o próximo balde.`,
    });
  } else {
    factors.push({
      label: 'Escassez de assentos',
      impact: 'neutral',
      detail: 'Disponibilidade regular de assentos na classe tarifária.',
    });
  }

  if (daysToDeparture !== null) {
    if (daysToDeparture <= 45) {
      score += 10;
      factors.push({
        label: 'Janela de antecedência',
        impact: 'positive',
        detail: `Embarque em ${daysToDeparture} dias. Na janela crítica (≤ 45 dias) novas promoções são raras.`,
      });
    } else if (daysToDeparture > 120) {
      score -= 10;
      factors.push({
        label: 'Janela de antecedência',
        impact: 'negative',
        detail: `Embarque em ${daysToDeparture} dias. Antecedência longa costuma trazer novas campanhas.`,
      });
    } else {
      factors.push({
        label: 'Janela de antecedência',
        impact: 'neutral',
        detail: `Embarque em ${daysToDeparture} dias — janela intermediária.`,
      });
    }
  }

  if (isHighSeason) score += 5;
  factors.push({
    label: 'Sazonalidade da rota',
    impact: isHighSeason ? 'positive' : 'neutral',
    detail: isHighSeason
      ? 'Data em alta temporada (férias/fim de ano): demanda pressiona as tarifas para cima.'
      : 'Data fora da alta temporada: maior chance de campanhas bonificadas.',
  });

  const action: TrendAction = score >= 55 ? 'BUY_NOW' : 'WAIT';
  const isBuyNow = action === 'BUY_NOW';

  const confidenceScore = Math.round(
    clamp(55 + Math.min(routeObservations.length * 4, 25) + Math.abs(score - 55) / 3, 50, 96)
  );

  const urgencyLevel: UrgencyLevel = isBuyNow
    ? (seats !== undefined && seats <= 3) || (daysToDeparture !== null && daysToDeparture <= 30)
      ? 'alta'
      : 'moderada'
    : 'baixa';

  const expectedPriceChangePercent = isBuyNow
    ? Math.round(clamp(8 + (score - 55) / 3, 8, 25))
    : Math.round(clamp(percentFromLowest / 2, 5, 25));

  const predictedFuturePrice = Math.max(
    100,
    roundTo(currentPrice * (1 + (isBuyNow ? 1 : -1) * (expectedPriceChangePercent / 100)), 100)
  );

  const sweetSpotTag =
    percentFromLowest === 0 ? '★ O menor de todos' : percentFromLowest <= 10 ? 'Preço ótimo' : null;

  const recommendationHeadline = isBuyNow
    ? percentFromLowest === 0
      ? 'Tarifa no menor patamar já registrado — emita agora.'
      : 'Boa janela de emissão: a tendência é de alta.'
    : 'Tarifa acima do ideal — há boa chance de queda.';

  const recommendationExplanation = isBuyNow
    ? `Com a tarifa a ${percentFromLowest}% do piso histórico${
        seats !== undefined && seats <= 3 ? ` e só ${seats} assento(s) restante(s)` : ''
      }, o modelo projeta alta de cerca de ${expectedPriceChangePercent}% nos próximos 10 a 14 dias.`
    : `A tarifa está ${percentFromLowest}% acima da mínima registrada e ${
        percentFromAverage >= 0 ? `${percentFromAverage}% acima` : `${Math.abs(percentFromAverage)}% abaixo`
      } da média. O modelo projeta queda de cerca de ${expectedPriceChangePercent}% — vale monitorar.`;

  // ---- Dados do gráfico ----
  const priceHistoryChartData: TrendChartPoint[] = routeObservations.slice(-6).map(obs => {
    const d = parseDate(obs.observedAt) ?? new Date();
    return {
      shortDate: shortDate(d),
      label: longDate(d),
      miles: obs.miles,
      type: 'historical' as const,
      note: obs.availabilityStatus,
    };
  });

  const today = new Date();
  priceHistoryChartData.push({
    shortDate: 'Hoje',
    label: longDate(today),
    miles: currentPrice,
    type: 'current',
    note: 'Tarifa verificada agora',
  });

  const midPrice = roundTo((currentPrice + predictedFuturePrice) / 2, 100);
  [
    { days: 7, miles: midPrice },
    { days: 14, miles: predictedFuturePrice },
  ].forEach(({ days, miles }) => {
    const d = new Date(today.getTime() + days * DAY_MS);
    priceHistoryChartData.push({
      shortDate: shortDate(d),
      label: longDate(d),
      miles,
      type: 'predicted',
      note: `Projeção para +${days} dias`,
    });
  });

  const seasonalInsight = isHighSeason
    ? 'Alta temporada: tarifas tendem a subir conforme o embarque se aproxima.'
    : 'Baixa temporada: campanhas de transferência bonificada são mais frequentes.';

  return {
    action,
    confidenceScore,
    urgencyLevel,
    sweetSpotTag,
    recommendationHeadline,
    recommendationExplanation,
    currentPrice,
    historicalLowestPrice,
    averagePrice,
    percentFromLowest,
    percentFromAverage,
    predictedFuturePrice,
    expectedPriceChangePercent,
    priceHistoryChartData,
    seasonalInsight,
    factors,
  };
}

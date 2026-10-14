import React, { useState } from 'react';
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  BellRing,
  HelpCircle,
  Calendar,
  Users
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Dot
} from 'recharts';
import { FlightOffer, OfferObservation } from '../../types';
import { calculateRouteTrendInsights, TrendAnalysisResult } from '../../utils/trendPrediction';

interface TrendInsightsProps {
  currentOffer: FlightOffer;
  allRouteOffers: FlightOffer[];
  observations: OfferObservation[];
  unitLabel?: string;
  onSetAlert?: () => void;
  compact?: boolean;
}

export const TrendInsights: React.FC<TrendInsightsProps> = ({
  currentOffer,
  allRouteOffers,
  observations,
  unitLabel = 'pts',
  onSetAlert,
  compact = false
}) => {
  const [showFactors, setShowFactors] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);

  const insights: TrendAnalysisResult = calculateRouteTrendInsights(
    currentOffer,
    allRouteOffers,
    observations
  );

  const isBuyNow = insights.action === 'BUY_NOW';

  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const isPredicted = dataPoint.type === 'predicted';
      const isCurrent = dataPoint.type === 'current';

      return (
        <div className="p-3 bg-[#0B021C] text-white rounded-xl shadow-2xl border border-purple-800 text-xs space-y-1 z-50">
          <div className="flex items-center justify-between gap-3 border-b border-purple-900/80 pb-1">
            <span className="font-bold text-slate-300">
              {dataPoint.label || label}
            </span>
            <span
              className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded ${
                isPredicted
                  ? 'bg-purple-900/60 text-purple-200'
                  : isCurrent
                  ? 'bg-emerald-500/20 text-[#22C55E]'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {isPredicted ? 'Previsão' : isCurrent ? 'Hoje' : 'Histórico'}
            </span>
          </div>

          <div className="flex items-baseline gap-1 pt-0.5">
            <span className="text-sm font-extrabold font-mono text-[#38BDF8]">
              {dataPoint.miles.toLocaleString('pt-BR')}
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-sans">
              {unitLabel}
            </span>
          </div>

          {dataPoint.note && (
            <p className="text-[10px] text-slate-400 italic pt-0.5">
              {dataPoint.note}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-purple-800/80 bg-gradient-to-b from-[#160634] to-[#0F0324] p-4 sm:p-5 shadow-xl space-y-4">
      {/* Header with Predictive Badge & Confidence */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-900/70">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-700/60 text-purple-300 shadow-inner">
            <Sparkles className="w-4 h-4 text-[#38BDF8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#38BDF8]">
                Vale a pena comprar agora?
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Nossa previsão de preço para esta rota
            </p>
          </div>
        </div>

        {/* Confidence pill */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="px-2.5 py-1 rounded-lg bg-[#110427] border border-purple-800/80 flex items-center gap-1.5 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Confiança:
            </span>
            <span className="font-mono font-black text-[#22C55E]">
              {insights.confidenceScore}%
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowMethodology(!showMethodology)}
            className="p-1 rounded-lg hover:bg-purple-900/40 text-slate-400 hover:text-white transition-colors"
            title="Como calculamos?"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Methodology Explain Drawer */}
      {showMethodology && (
        <div className="p-3.5 rounded-xl bg-[#0C021E] border border-cyan-500/30 text-xs text-slate-300 space-y-2 animate-fadeIn">
          <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
            <Info className="w-3.5 h-3.5" />
            <span>Como calculamos</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-300">
            Para dizer se é melhor <strong>comprar agora</strong> ou <strong>esperar</strong>, olhamos:
          </p>
          <ul className="text-[11px] space-y-1 list-disc list-inside text-slate-400">
            <li><strong className="text-slate-200">Menor preço já visto:</strong> o quanto o preço atual está perto dele.</li>
            <li><strong className="text-slate-200">Assentos restantes:</strong> com 3 ou menos, o preço costuma subir.</li>
            <li><strong className="text-slate-200">Dias até o voo:</strong> faltando 45 dias ou menos, promoções ficam raras.</li>
            <li><strong className="text-slate-200">Época do ano:</strong> férias e fim de ano costumam ser mais caros.</li>
          </ul>
        </div>
      )}

      {/* Main Verdict Card: COMPRAR AGORA vs AGUARDAR */}
      <div
        className={`p-4 sm:p-4.5 rounded-2xl border transition-all ${
          isBuyNow
            ? 'bg-gradient-to-r from-emerald-950/60 via-[#12062E] to-[#12062E] border-emerald-500/50 shadow-[0_0_24px_rgba(34,197,94,0.15)]'
            : 'bg-gradient-to-r from-amber-950/60 via-[#12062E] to-[#12062E] border-amber-500/50 shadow-[0_0_24px_rgba(245,158,11,0.15)]'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md ${
                  isBuyNow
                    ? 'bg-[#22C55E] text-slate-950'
                    : 'bg-amber-400 text-slate-950'
                }`}
              >
                {isBuyNow ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                    <span>Comprar agora</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 stroke-[3]" />
                    <span>Melhor esperar</span>
                  </>
                )}
              </span>

              {insights.sweetSpotTag && (
                <span className="px-2.5 py-0.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-[11px] font-bold text-cyan-300">
                  {insights.sweetSpotTag}
                </span>
              )}

              <span
                className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                  insights.urgencyLevel === 'alta'
                    ? 'bg-rose-950/70 border border-rose-500/40 text-rose-300'
                    : insights.urgencyLevel === 'moderada'
                    ? 'bg-purple-900/60 text-purple-200'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                Urgência: {insights.urgencyLevel.toUpperCase()}
              </span>
            </div>

            <h4 className="text-base sm:text-lg font-black text-white tracking-tight pt-1">
              {insights.recommendationHeadline}
            </h4>

            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              {insights.recommendationExplanation}
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="p-3.5 rounded-xl bg-[#0A0218] border border-purple-900/70 shrink-0 text-right space-y-1 min-w-[150px]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Previsão em 2 semanas
            </span>
            <div
              className={`text-xl font-black font-mono flex items-center justify-end gap-1 ${
                isBuyNow ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {isBuyNow ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              <span>
                {insights.predictedFuturePrice.toLocaleString('pt-BR')} {unitLabel}
              </span>
            </div>
            <div className="text-[11px] font-semibold text-slate-400">
              {isBuyNow ? (
                <span className="text-rose-300">
                  +{Math.abs(insights.expectedPriceChangePercent)}% de alta
                </span>
              ) : (
                <span className="text-emerald-300">
                  -{Math.abs(insights.expectedPriceChangePercent)}% de queda
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Numerical Benchmark Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-3 rounded-xl bg-[#14052E] border border-purple-900/60 space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Preço atual
          </span>
          <div className="text-base font-black text-white font-mono">
            {insights.currentPrice.toLocaleString('pt-BR')}{' '}
            <span className="text-[10px] font-sans text-slate-400">{unitLabel}</span>
          </div>
          <span className="text-[10px] text-cyan-300 font-semibold block">
            Atualizado agora
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#14052E] border border-purple-900/60 space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Menor preço visto
          </span>
          <div className="text-base font-black text-[#22C55E] font-mono">
            {insights.historicalLowestPrice.toLocaleString('pt-BR')}{' '}
            <span className="text-[10px] font-sans text-slate-400">{unitLabel}</span>
          </div>
          <span className="text-[10px] text-slate-400 block">
            {insights.percentFromLowest === 0
              ? '★ O menor de todos'
              : `+${insights.percentFromLowest}% acima do menor`}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#14052E] border border-purple-900/60 space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Média da rota
          </span>
          <div className="text-base font-black text-slate-200 font-mono">
            {insights.averagePrice.toLocaleString('pt-BR')}{' '}
            <span className="text-[10px] font-sans text-slate-400">{unitLabel}</span>
          </div>
          <span
            className={`text-[10px] font-semibold block ${
              insights.percentFromAverage <= 0 ? 'text-[#22C55E]' : 'text-amber-400'
            }`}
          >
            {insights.percentFromAverage <= 0
              ? `${insights.percentFromAverage}% da média`
              : `+${insights.percentFromAverage}% da média`}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#14052E] border border-purple-900/60 space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Assentos neste preço
          </span>
          <div className="text-base font-black text-amber-300 font-mono">
            {currentOffer.seatsLeft ? `${currentOffer.seatsLeft} assentos` : '6 ou mais'}
          </div>
          <span className="text-[10px] text-slate-400 block">
            {currentOffer.seatsLeft && currentOffer.seatsLeft <= 3
              ? 'Quase esgotado'
              : 'Disponibilidade normal'}
          </span>
        </div>
      </div>

      {/* Chart: Historical Evolution + Mock Predictive Forecast */}
      <div className="p-4 rounded-xl bg-[#12042A] border border-purple-900/60 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <TrendingDown className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Evolução do preço</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-[#38BDF8] inline-block" /> Histórico
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 border-t border-dashed border-[#22C55E] inline-block" /> Previsão
            </span>
          </div>
        </div>

        <div className="h-44 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={insights.priceHistoryChartData}
              margin={{ top: 10, right: 15, left: -15, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2D1259" vertical={false} />
              <XAxis
                dataKey="shortDate"
                stroke="#6B7280"
                fontSize={10}
                tickLine={false}
              />
              <YAxis
                stroke="#6B7280"
                fontSize={10}
                tickLine={false}
                tickFormatter={(val) => `${Math.round(val / 1000)}k`}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomChartTooltip />} />
              <ReferenceLine
                y={insights.averagePrice}
                stroke="#7C3AED"
                strokeDasharray="4 4"
                label={{
                  value: 'Média',
                  fill: '#A78BFA',
                  fontSize: 9,
                  position: 'insideTopRight'
                }}
              />
              <Line
                type="monotone"
                dataKey="miles"
                stroke="#38BDF8"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#38BDF8', stroke: '#0B021C', strokeWidth: 1.5 }}
                activeDot={{ r: 6, fill: '#22C55E' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-purple-900/40">
          <span>{insights.seasonalInsight}</span>
          <span className="text-slate-500 font-mono text-[10px]">
            
          </span>
        </div>
      </div>

      {/* Accordion: Detailed Predictive Factors */}
      <div className="border border-purple-900/60 rounded-xl bg-[#12042A] overflow-hidden">
        <button
          type="button"
          onClick={() => setShowFactors(!showFactors)}
          className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-200 hover:text-white transition-colors"
        >
          <span className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>Por que essa recomendação?</span>
          </span>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-normal">
            <span>{showFactors ? 'Esconder' : 'Ver detalhes'}</span>
            {showFactors ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </div>
        </button>

        {showFactors && (
          <div className="px-4 pb-3 pt-1 space-y-2 border-t border-purple-900/50">
            {insights.factors.map((factor, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-[#0E0320] border border-purple-900/40 flex items-start gap-2.5 text-xs"
              >
                <div className="mt-0.5 shrink-0">
                  {factor.impact === 'positive' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                  ) : factor.impact === 'negative' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Info className="w-4 h-4 text-cyan-400" />
                  )}
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>{factor.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                        factor.impact === 'positive'
                          ? 'bg-emerald-500/20 text-[#22C55E]'
                          : factor.impact === 'negative'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-purple-900/40 text-purple-300'
                      }`}
                    >
                      {factor.impact === 'positive'
                        ? 'A favor'
                        : factor.impact === 'negative'
                        ? 'Atenção'
                        : 'Neutro'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {factor.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer Callout: if WAIT, encourage setting alert */}
      {!isBuyNow && onSetAlert && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-200">
            <BellRing className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              O preço deve cair. Crie um alerta e avisamos quando baixar.
            </span>
          </div>
          <button
            type="button"
            onClick={onSetAlert}
            className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shrink-0 text-xs transition-colors shadow-sm"
          >
            Criar alerta
          </button>
        </div>
      )}
    </div>
  );
};

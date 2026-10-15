import { TrendInsights } from './TrendInsights';
import React, { useState, useMemo } from 'react';
import { useFlySync } from '../../store/FlySyncContext';
import { Modal } from '../common/Modal';
import { FlightOffer } from '../../types';
import { getEffectiveBookingUrl } from '../../utils/bookingUrls';
import {
  Calendar,
  Plane,
  TrendingDown,
  Sparkles,
  ExternalLink,
  Bell,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Zap,
  ArrowRight
} from 'lucide-react';

interface RouteCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeKey: string | null; // e.g. "GRU-MIA"
  initialOffer?: FlightOffer | null;
  onOpenCreateAlert: (offer: FlightOffer) => void;
}

export const RouteCalendarModal: React.FC<RouteCalendarModalProps> = ({
  isOpen,
  onClose,
  routeKey,
  initialOffer,
  onOpenCreateAlert
}) => {
  const { offers, programs, observations, trackOutboundClick } = useFlySync();

  // If initialOffer is provided, extract origin & destination
  const origin = initialOffer ? initialOffer.origin : routeKey?.split('-')[0] || '';
  const destination = initialOffer ? initialOffer.destination : routeKey?.split('-')[1] || '';

  // Get all offers for this route
  const routeOffers = useMemo(() => {
    if (!origin || !destination) return [];
    const todayStr = new Date().toISOString().split('T')[0];
    return offers
      .filter(o => o.origin === origin && o.destination === destination && o.status === 'ativa' && o.departureDate >= todayStr)
      .sort((a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime());
  }, [offers, origin, destination]);

  // Extract unique months from all offers
  const monthsData = useMemo(() => {
    const map = new Map<string, { label: string; count: number; minMiles: number; offers: FlightOffer[] }>();

    routeOffers.forEach(o => {
      const parts = o.departureDate.split('-');
      if (parts.length >= 2) {
        const monthKey = `${parts[0]}-${parts[1]}`; // e.g. "2026-11"
        const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
        const label = dateObj.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

        if (!map.has(monthKey)) {
          map.set(monthKey, { label, count: 0, minMiles: Infinity, offers: [] });
        }

        const data = map.get(monthKey)!;
        data.count += 1;
        if (o.miles < data.minMiles) data.minMiles = o.miles;
        data.offers.push(o);
      }
    });

    return Array.from(map.entries()).map(([key, value]) => ({
      key,
      ...value
    })).sort((a, b) => a.key.localeCompare(b.key));
  }, [routeOffers]);

  // Selected Month State ('all' or specific monthKey)
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('all');
  const [showTrendDetails, setShowTrendDetails] = useState<boolean>(false);

  // Filter offers by selected month
  const displayedOffers = useMemo(() => {
    if (selectedMonthKey === 'all') return routeOffers;
    return routeOffers.filter(o => o.departureDate.startsWith(selectedMonthKey));
  }, [routeOffers, selectedMonthKey]);

  // Find lowest price across all dates
  const globalLowestMiles = useMemo(() => {
    if (routeOffers.length === 0) return 0;
    return Math.min(...routeOffers.map(o => o.miles));
  }, [routeOffers]);

  // Best month to travel (lowest minimum miles)
  const bestMonth = useMemo(() => {
    if (monthsData.length === 0) return null;
    return [...monthsData].sort((a, b) => a.minMiles - b.minMiles)[0];
  }, [monthsData]);

  if (!isOpen || !origin || !destination) return null;

  const sampleOffer = routeOffers[0] || initialOffer;
  const originCity = sampleOffer?.originCity || origin;
  const destCity = sampleOffer?.destCity || destination;

  const formatDateLabel = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        const weekday = d.toLocaleDateString('pt-BR', { weekday: 'short' });
        return {
          weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
          dayMonth: `${parts[2]}/${parts[1]}/${parts[0]}`
        };
      }
      return { weekday: '', dayMonth: dateStr };
    } catch {
      return { weekday: '', dayMonth: dateStr };
    }
  };

  const handleBookingClick = (offer: FlightOffer) => {
    trackOutboundClick(offer.id);
    const targetUrl = getEffectiveBookingUrl(offer);
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${origin} ➔ ${destination}`}
      subtitle={`${originCity} para ${destCity} · Calendário Multimeses de Menor Tarifa`}
      size="xl"
    >
      <div className="space-y-6 text-slate-200">
        {/* Top Summary Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#180838] to-[#120526] border border-purple-800/80 shadow-lg relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
                <Sparkles className="w-4 h-4 text-[#22C55E]" />
                <span className="uppercase tracking-wider text-[11px]">Navegação Flexível de Datas</span>
                <span aria-hidden="true">·</span>
                <span className="text-cyan-300 font-normal">
                  {routeOffers.length} {routeOffers.length === 1 ? 'data' : 'datas'} em {monthsData.length} {monthsData.length === 1 ? 'mês disponível' : 'meses disponíveis'}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Matriz de Tarifas: {originCity} ({origin}) ➔ {destCity} ({destination})
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Compare as datas mais vantajosas de cada mês. As melhores oportunidades são destacadas com indicação preditiva de compra.
              </p>
            </div>

            {/* Lowest Fare Highlight */}
            <div className="p-3.5 rounded-xl bg-[#0F0322] border border-emerald-500/30 text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Menor Tarifa da Rota</span>
              <div className="text-2xl font-black text-[#22C55E] font-mono tabular-nums">
                {globalLowestMiles.toLocaleString('pt-BR')} <span className="text-xs font-sans font-normal text-slate-400">pts</span>
              </div>
              {bestMonth && (
                <div className="text-[11px] text-cyan-300 font-medium mt-0.5">
                  Mês mais barato: {bestMonth.label}
                </div>
              )}
            </div>
          </div>

          {/* PRD 4.3 Predictive Recommendation Header Strip */}
          <div className="mt-3.5 pt-3 border-t border-purple-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse shrink-0" />
              <p className="text-[11px] leading-relaxed">
                <strong className="text-white">Nossa dica: </strong>
                <span className="text-emerald-300 font-semibold">Comprar Agora. </span>
                O menor preço é {globalLowestMiles.toLocaleString('pt-BR')} milhas e deve subir nas próximas 2 semanas.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowTrendDetails(!showTrendDetails)}
              className="px-3 py-1 rounded-lg bg-[#200A4C] hover:bg-purple-900/60 text-[#38BDF8] border border-purple-700/60 text-[11px] font-bold transition-all shrink-0 flex items-center gap-1.5 self-start sm:self-center"
            >
              <Sparkles className="w-3 h-3 text-[#38BDF8]" />
              <span>{showTrendDetails ? 'Ocultar Gráfico & Métricas' : 'Ver Insights & Gráfico Preditivo'}</span>
            </button>
          </div>
        </div>

        {/* PRD 4.3 TrendInsights Section (when expanded or on lowest offer) */}
        {showTrendDetails && routeOffers.length > 0 && (
          <div className="animate-fadeIn">
            <TrendInsights
              currentOffer={routeOffers[0]}
              allRouteOffers={offers}
              observations={observations}
              unitLabel={programs.find(p => p.id === routeOffers[0].programId)?.unitLabel || 'pts'}
              onSetAlert={() => onOpenCreateAlert(routeOffers[0])}
            />
          </div>
        )}

        {/* Month Selector Tabs */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              Selecione o Mês Desejado:
            </span>
            <span className="text-[11px] text-slate-400">
              {displayedOffers.length} {displayedOffers.length === 1 ? 'data encontrada' : 'datas encontradas'}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {/* All Months Button */}
            <button
              onClick={() => setSelectedMonthKey('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedMonthKey === 'all'
                  ? 'bg-[#22C55E] text-slate-950 shadow-[0_0_12px_rgba(34,197,94,0.35)]'
                  : 'bg-[#160833] text-slate-300 hover:text-white hover:bg-purple-900/40 border border-purple-800/60'
              }`}
            >
              <span>Todos os Meses</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                selectedMonthKey === 'all' ? 'bg-slate-950/20 text-slate-950' : 'bg-purple-900/60 text-purple-200'
              }`}>
                {routeOffers.length}
              </span>
            </button>

            {/* Individual Months */}
            {monthsData.map(m => {
              const isSelected = selectedMonthKey === m.key;
              const isBest = m.key === bestMonth?.key;

              return (
                <button
                  key={m.key}
                  onClick={() => setSelectedMonthKey(m.key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex flex-col items-start min-w-[120px] ${
                    isSelected
                      ? 'bg-[#22C55E] text-slate-950 shadow-[0_0_12px_rgba(34,197,94,0.35)]'
                      : 'bg-[#160833] text-slate-300 hover:text-white hover:bg-purple-900/40 border border-purple-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between w-full gap-2">
                    <span className="capitalize">{m.label}</span>
                    {isBest && (
                      <span className={`text-[9px] px-1 rounded-sm uppercase tracking-wider font-extrabold ${
                        isSelected ? 'bg-slate-950 text-[#22C55E]' : 'bg-[#22C55E]/20 text-[#22C55E]'
                      }`}>
                        Top
                      </span>
                    )}
                  </div>
                  <div className={`text-[10px] font-mono mt-0.5 ${
                    isSelected ? 'text-slate-950/90' : 'text-slate-400'
                  }`}>
                    a partir de {m.minMiles.toLocaleString('pt-BR')} pts · {m.count} {m.count === 1 ? 'data' : 'datas'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Available Dates List / Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Exibindo datas para <strong>{originCity} ➔ {destCity}</strong>
            </span>
            <span className="text-[#38BDF8] text-[11px]">Tarifas em milhas + taxas em R$</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
            {displayedOffers.map(offer => {
              const prog = programs.find(p => p.id === offer.programId);
              const { weekday, dayMonth } = formatDateLabel(offer.departureDate);
              const isLowestOnRoute = offer.miles === globalLowestMiles;

              return (
                <div
                  key={offer.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    isLowestOnRoute
                      ? 'bg-[#180A3A] border-[#22C55E] shadow-[0_0_15px_rgba(34,197,94,0.2)] ring-1 ring-[#22C55E]/40'
                      : 'bg-[#13062C] border-purple-900/60 hover:border-purple-700'
                  }`}
                >
                  <div>
                    {/* Date and Tag Row */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-[#1F0A44] border border-purple-800 text-cyan-300">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-black text-white">
                            {weekday}, {dayMonth}
                          </div>
                          {offer.returnDate && (
                            <div className="text-[11px] text-slate-400">
                              Volta: {formatDateLabel(offer.returnDate).dayMonth} ({offer.tripType === 'round_trip' ? 'Ida e Volta' : 'Trecho'})
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Lowest Fare Badge */}
                      {isLowestOnRoute ? (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#22C55E] text-slate-950 uppercase tracking-wide">
                          Melhor Tarifa
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-200 border border-purple-800/60">
                          {offer.cabinClass === 'business' ? 'Executiva' : 'Econômica'}
                        </span>
                      )}
                    </div>

                    {/* Flight & Airline Row */}
                    <div className="flex items-center justify-between text-xs text-slate-300 py-1.5 border-y border-purple-900/40">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: prog?.color || '#38BDF8' }}
                        />
                        <span className="font-semibold">{offer.airline}</span>
                        {offer.flightNumber && (
                          <span className="text-slate-400 text-[11px]">({offer.flightNumber})</span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {offer.stops === 0 ? 'Voo Direto' : `${offer.stops} parada(s)`}
                      </span>
                    </div>

                    {/* Pricing */}
                    <div className="py-2.5 flex items-baseline justify-between">
                      <div>
                        <div className="text-2xl font-black text-white font-mono tabular-nums tracking-tight">
                          {offer.miles.toLocaleString('pt-BR')}
                          <span className="text-xs font-sans text-[#22C55E] ml-1 uppercase">
                            {prog?.unitLabel || 'pts'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300 font-medium mt-0.5 flex items-center gap-1">
                          <span className="text-[#38BDF8] font-bold">+</span>
                          <span>R$ {offer.cashAmount.toFixed(2)} taxas o trecho</span>
                        </div>
                      </div>

                      {offer.seatsLeft && offer.seatsLeft <= 3 && (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md">
                          Últimos {offer.seatsLeft} assentos
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="mt-2 pt-2 border-t border-purple-900/40 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onOpenCreateAlert(offer)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-purple-900/40 hover:bg-purple-900/70 border border-purple-800/60 transition-colors flex items-center gap-1.5"
                    >
                      <Bell className="w-3.5 h-3.5 text-purple-400" />
                      <span>Criar Alerta</span>
                    </button>

                    <button
                      onClick={() => handleBookingClick(offer)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-[#22C55E] hover:bg-emerald-400 transition-colors flex items-center gap-1.5 shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                    >
                      <span>Emitir no Site Oficial</span>
                      <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-2 border-t border-purple-900/40 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
            <span>Redirecionamento transparente sem intermediários ou sobretaxas de emissão</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-[#160833] border border-purple-800/60 hover:bg-purple-900/40 self-end sm:self-auto"
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  );
};

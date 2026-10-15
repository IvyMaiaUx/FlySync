import { TrendInsights } from './TrendInsights';
import { evaluateDeal } from '../../utils/thermometer';
import { EconomilhaWidget } from './EconomilhaWidget';
import React, { useState, useMemo } from 'react';
import { useFlySync } from '../../store/FlySyncContext';
import { Modal } from '../common/Modal';
import { FlightOffer } from '../../types';
import { getEffectiveBookingUrl, buildGoogleFlightsUrl } from '../../utils/bookingUrls';
import {
  Plane,
  Calendar,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  BellRing,
  TrendingDown,
  Info,
  Sparkles,
  ChevronRight,
  Flame,
  Users,
  CheckCircle2,
  Tag,
  Building2,
  ArrowRight,
  Layers,
  AlertTriangle
} from 'lucide-react';

interface OfferDetailModalProps {
  offer: FlightOffer | null;
  onClose: () => void;
  onOpenCreateAlert: (offer: FlightOffer) => void;
  onSelectAlternativeOffer?: (altOffer: FlightOffer) => void;
  onOpenRouteCalendar?: (routeKey: string, initialOffer: FlightOffer) => void;
}

export const OfferDetailModal: React.FC<OfferDetailModalProps> = ({
  offer,
  onClose,
  onOpenCreateAlert,
  onSelectAlternativeOffer,
  onOpenRouteCalendar
}) => {
  const { offers, programs, observations, trackOutboundClick } = useFlySync();

  // Selected date/offer inside the modal (defaults to current offer)
  const [activeOffer, setActiveOffer] = useState<FlightOffer | null>(null);
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('all');

  // Sync activeOffer when modal opens or offer prop changes
  React.useEffect(() => {
    setActiveOffer(offer);
    setSelectedMonthFilter('all');
  }, [offer]);

  // Current viewed offer is either activeOffer or the initial offer
  const current = activeOffer || offer;
  const prog = programs.find(p => p.id === current?.programId);
  const relatedObs = observations.filter(o => o.offerId === current?.id);

  // All offers for this specific origin ➔ destination route
  const routeOffers = useMemo(() => {
    if (!current) return [];
    const todayStr = new Date().toISOString().split('T')[0];
    return offers
      .filter(o => o.origin === current.origin && o.destination === current.destination && o.status === 'ativa' && o.departureDate >= todayStr)
      .sort((a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime());
  }, [offers, current]);

  // Distinct months available on this route
  const availableMonths = useMemo(() => {
    if (!current) return [];
    const map = new Map<string, { label: string; count: number; minMiles: number }>();
    routeOffers.forEach(o => {
      const parts = o.departureDate.split('-');
      if (parts.length >= 2) {
        const key = `${parts[0]}-${parts[1]}`;
        const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
        const label = dateObj.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        if (!map.has(key)) {
          map.set(key, { label, count: 0, minMiles: Infinity });
        }
        const mData = map.get(key)!;
        mData.count += 1;
        if (o.miles < mData.minMiles) mData.minMiles = o.miles;
      }
    });
    return Array.from(map.entries())
      .map(([key, data]) => ({ key, ...data }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [routeOffers, current]);

  // Filtered available dates for user to switch
  const displayedDateOptions = useMemo(() => {
    if (!current) return [];
    if (selectedMonthFilter === 'all') return routeOffers;
    return routeOffers.filter(o => o.departureDate.startsWith(selectedMonthFilter));
  }, [routeOffers, selectedMonthFilter, current]);

  if (!offer || !current) return null;

  const formatDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const formatDateNice = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const weekday = dateObj.toLocaleDateString('pt-BR', { weekday: 'short' });
      const dayMonth = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
      return { weekday: weekday.toUpperCase(), dayMonth };
    } catch {
      return { weekday: '', dayMonth: dateStr };
    }
  };

  const formatDateTime = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  };

  const handleGoToBooking = () => {
    trackOutboundClick(current.id);
    const targetUrl = getEffectiveBookingUrl(current);
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleGoToGoogleFlights = () => {
    trackOutboundClick(current.id);
    const gfUrl = buildGoogleFlightsUrl({
      origin: current.origin,
      destination: current.destination,
      departureDate: current.departureDate,
      returnDate: current.returnDate,
      tripType: current.tripType
    });
    window.open(gfUrl, '_blank', 'noopener,noreferrer');
  };

  const seatsCount = current.seatsLeft ?? 4;
  const isScarcityHigh = seatsCount <= 3;

  return (
    <Modal
      isOpen={!!offer}
      onClose={onClose}
      title={`${current.origin} ➔ ${current.destination}`}
      subtitle={`${current.originCity} para ${current.destCity} · Detalhes de Oferta & Emissão`}
      size="xl"
    >
      <div className="space-y-5 text-slate-200">
        
        {/* BANNER PRINCIPAL: Programa de Fidelidade, Companhia Aérea, Rota & Tarifa */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#1A083B] via-[#14062E] to-[#0E0322] border border-purple-800 shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Lado Esquerdo: Programa, Cia e Rota */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Badge do Programa de Viagem */}
                <span
                  className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
                  style={{
                    backgroundColor: prog?.bgLight || '#2D1259',
                    color: prog?.color || '#38BDF8'
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: prog?.color || '#38BDF8' }}
                  />
                  <span>{prog?.name || 'Programa Fidelidade'}</span>
                </span>

                {/* Badge da Companhia Aérea */}
                <span className="px-2.5 py-1 rounded-lg bg-[#250C54] border border-purple-700/60 text-xs font-bold text-white flex items-center gap-1.5">
                  <Plane className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>{current.airline}</span>
                </span>

                {/* Classe de Cabine */}
                <span className="px-2.5 py-1 rounded-lg bg-purple-900/40 border border-purple-800/60 text-xs font-semibold text-purple-200">
                  {current.cabinClass === 'business'
                    ? 'Classe Executiva'
                    : current.cabinClass === 'premium_economy'
                    ? 'Premium Economy'
                    : 'Classe Econômica'}
                </span>
              </div>

              {/* Título Rota & Cidade */}
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {current.originCity} ({current.origin}) ➔ {current.destCity} ({current.destination})
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-2">
                  <span>{current.stops === 0 ? 'Voo Direto sem escalas' : `${current.stops} conexão(ões)`}</span>
                  {current.flightNumber && <span>· Voo {current.flightNumber}</span>}
                  <span>· {current.tripType === 'round_trip' ? 'Ida e Volta' : 'Só Ida'}</span>
                </p>
              </div>
            </div>

            {/* Lado Direito: Tarifas e Botão de Urgência */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-purple-900/60">
              <div className="lg:text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Tarifa em Milhas
                </span>
                <div className="text-3xl font-black text-white font-mono tracking-tight flex items-baseline lg:justify-end gap-1.5 mt-0.5">
                  <span>{current.miles.toLocaleString('pt-BR')}</span>
                  <span className="text-sm font-sans text-[#22C55E] uppercase font-bold">
                    {prog?.unitLabel || 'pts'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1 lg:justify-end">
                  <span className="text-[#38BDF8] font-bold">+</span>
                  <span>R$ {current.cashAmount.toFixed(2)} taxas o trecho</span>
                </p>
              </div>

              {/* Botão de Urgência de Ação Direta */}
              <button
                type="button"
                onClick={handleGoToBooking}
                className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                  isScarcityHigh
                    ? 'bg-gradient-to-r from-rose-600 via-amber-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.35)]'
                    : 'bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                }`}
                title="Garantir vaga imediata no canal oficial"
              >
                <Flame className="w-4 h-4 fill-current shrink-0" />
                <span className="uppercase tracking-wider">
                  {seatsCount <= 1
                    ? 'ÚLTIMO ASSENTO DISPONÍVEL!'
                    : `Apenas ${seatsCount} assentos disponíveis!`}
                </span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>

        {/* INDICADOR DE ESCASSEZ VISUAL DE ALTA URGÊNCIA (Requisito 4) */}
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isScarcityHigh
            ? 'bg-gradient-to-r from-rose-950/80 via-[#260924] to-[#160420] border-rose-500/80 shadow-[0_0_25px_rgba(244,63,94,0.3)] ring-1 ring-rose-500/40'
            : 'bg-gradient-to-r from-amber-950/60 via-[#24101E] to-[#140620] border-amber-500/60 shadow-lg ring-1 ring-amber-500/30'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className={`p-3 rounded-xl shrink-0 ${
                isScarcityHigh
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                <Flame className="w-6 h-6 fill-current" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    isScarcityHigh ? 'bg-rose-600 text-white shadow-sm' : 'bg-amber-500 text-slate-950 shadow-sm'
                  }`}>
                    {isScarcityHigh ? 'ALERTA DE ESCASSEZ CRÍTICA' : 'DISPONIBILIDADE LIMITADA'}
                  </span>
                  <span className="text-xs font-bold text-slate-300">
                    {current.airline} · {prog?.name}
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                  <span>
                    {seatsCount <= 1
                      ? 'Apenas 1 assento disponível nesta tarifa!'
                      : `Apenas ${seatsCount} assentos disponíveis nesta tarifa`}
                  </span>
                  <span className="text-xs font-normal text-slate-400 font-mono">
                    ({current.miles.toLocaleString('pt-BR')} {prog?.unitLabel || 'pts'})
                  </span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isScarcityHigh
                    ? 'Restam poucos assentos neste preço. Quando acabarem, o valor deve subir.'
                    : 'O preço pode mudar conforme os assentos forem vendidos.'}
                </p>
              </div>
            </div>

            {/* Barra de escassez visual e Botão de Ação */}
            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-2.5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-rose-900/40">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-semibold">Vagas nesta tarifa:</span>
                <div className="flex items-center gap-1.5 bg-[#0D021C] px-2.5 py-1 rounded-lg border border-purple-900/60">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <span
                      key={idx}
                      className={`w-2.5 h-4 rounded-xs transition-all ${
                        idx < seatsCount
                          ? (isScarcityHigh ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]' : 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.5)]')
                          : 'bg-purple-950/70 border border-purple-800/40'
                      }`}
                      title={`${seatsCount} vagas restantes`}
                    />
                  ))}
                  <span className="text-xs font-black font-mono ml-1 text-white">{seatsCount}/6</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleGoToBooking}
                className={`w-full md:w-auto px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer transform hover:scale-[1.02] ${
                  isScarcityHigh
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.45)]'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                }`}
              >
                <span>Garantir Vaga no Site Oficial</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>

        {/* TERMÔMETRO DE MILHAS (GUIA OFICIAL DE REFERÊNCIA) */}
        {(() => {
          const deal = evaluateDeal(current.programId, current.cabinClass, current.miles, current.destination);
          return (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#13062C] border border-purple-900/70 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  {deal.emoji && <span className="text-2xl">{deal.emoji}</span>}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-white">Termômetro de Milhas FlySync</h4>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${deal.badgeBg}`}>
                        {deal.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">{deal.description}</p>
                  </div>
                </div>
              </div>

              {/* Régua de Avaliação das 4 Faixas */}
              <div className="space-y-2.5 pt-2 border-t border-purple-900/50">
                <span className="text-xs font-semibold text-slate-300 block">
                  Faixas de referência oficiais para esta região e cabine:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-center">
                  <div className={`p-3 sm:p-3.5 rounded-xl border transition-all ${
                    deal.rating === 'excellent'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 ring-2 ring-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                      : 'bg-purple-950/40 border-purple-900/60 text-slate-400 opacity-60'
                  }`}>
                    <div className="text-xs font-black">🔥 Excelente</div>
                    <div className="font-mono text-sm sm:text-base mt-1 font-bold text-white">até {Math.round(deal.maxExcellent / 1000)}k</div>
                  </div>

                  <div className={`p-3 sm:p-3.5 rounded-xl border transition-all ${
                    deal.rating === 'good'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/40 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                      : 'bg-purple-950/40 border-purple-900/60 text-slate-400 opacity-60'
                  }`}>
                    <div className="text-xs font-bold">Bom</div>
                    <div className="font-mono text-sm sm:text-base mt-1 font-bold text-white">até {Math.round(deal.maxGood / 1000)}k</div>
                  </div>

                  <div className={`p-3 sm:p-3.5 rounded-xl border transition-all ${
                    deal.rating === 'normal'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                      : 'bg-purple-950/40 border-purple-900/60 text-slate-400 opacity-60'
                  }`}>
                    <div className="text-xs font-bold">Normal</div>
                    <div className="font-mono text-sm sm:text-base mt-1 font-bold text-white">até {Math.round(deal.maxNormal / 1000)}k</div>
                  </div>

                  <div className={`p-3 sm:p-3.5 rounded-xl border transition-all ${
                    deal.rating === 'bad'
                      ? 'bg-slate-500/20 border-slate-500 text-slate-300 ring-1 ring-slate-500 shadow-md'
                      : 'bg-purple-950/40 border-purple-900/60 text-slate-400 opacity-60'
                  }`}>
                    <div className="text-xs font-bold">Ruim</div>
                    <div className="font-mono text-sm sm:text-base mt-1 font-bold text-slate-300">&gt; {Math.round(deal.maxNormal / 1000)}k</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* TERMÔMETRO ECONOMILHA & COMPARATIVO MULTI-PROGRAMA */}
        <EconomilhaWidget offer={current} />

        {/* SELETOR INTERATIVO: Escolha a Data e o Mês Disponíveis nesta Rota */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#13062C] border border-purple-900/70 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-900/60 pb-2.5">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#38BDF8]" />
              <h4 className="text-xs sm:text-sm font-bold text-white">
                Selecione a Data e o Mês de Viagem nesta Rota ({routeOffers.length} opções disponíveis)
              </h4>
            </div>
            {onOpenRouteCalendar && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRouteCalendar(`${current.origin}-${current.destination}`, current);
                }}
                className="text-xs font-bold text-[#22C55E] hover:underline flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Ver Matriz Mensal Completa</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Abas de Filtro de Mês */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
              Filtrar por Mês de Partida:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              <button
                type="button"
                onClick={() => setSelectedMonthFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  selectedMonthFilter === 'all'
                    ? 'bg-[#22C55E] text-slate-950 shadow-sm'
                    : 'bg-[#180838] text-slate-300 hover:text-white border border-purple-800/60'
                }`}
              >
                Todos os Meses ({routeOffers.length})
              </button>
              {availableMonths.map(m => {
                const isActive = selectedMonthFilter === m.key;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setSelectedMonthFilter(m.key)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap capitalize transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#22C55E] text-slate-950 shadow-sm'
                        : 'bg-[#180838] text-slate-300 hover:text-white border border-purple-800/60'
                    }`}
                  >
                    <span>{m.label}</span>
                    <span className={`text-[10px] font-mono ${isActive ? 'text-slate-950 font-bold' : 'text-emerald-400'}`}>
                      desde {m.minMiles.toLocaleString('pt-BR')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid de Datas Disponíveis para Selecionar e Atualizar os Dados da Tela */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-2">
              Clique em uma data para carregar os dados de voo e tendência:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto pr-1">
              {displayedDateOptions.map(alt => {
                const isSelected = alt.id === current.id;
                const { weekday, dayMonth } = formatDateNice(alt.departureDate);
                const altProg = programs.find(p => p.id === alt.programId);
                const isScarce = (alt.seatsLeft ?? 4) <= 3;
                return (
                  <button
                    key={alt.id}
                    type="button"
                    onClick={() => setActiveOffer(alt)}
                    className={`p-2.5 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#280C54] to-[#1E083E] border-[#22C55E] ring-2 ring-[#22C55E]/40 shadow-md'
                        : 'bg-[#180838] border-purple-800/60 hover:border-purple-600 hover:bg-[#1F0A44]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-black text-white">
                        {weekday} {dayMonth}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                      )}
                    </div>
                    <div className="text-xs font-mono font-extrabold text-[#22C55E]">
                      {alt.miles.toLocaleString('pt-BR')} <span className="text-[10px] font-sans font-normal text-slate-300">pts</span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1 pt-1 border-t border-purple-900/50">
                      <span className="truncate max-w-[80px]">{alt.airline}</span>
                      {isScarce && (
                        <span className="text-rose-400 font-bold flex items-center gap-0.5">
                          <Flame className="w-2.5 h-2.5 fill-current" />
                          {alt.seatsLeft} vgs
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* LOGÍSTICA COMPLETA DE VOO: Companhia, Aeronave/Voo, Conexões e Taxas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-4 rounded-xl border border-purple-900/60 bg-[#160833] space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-cyan-400" />
              Companhia Aérea & Operação
            </h4>
            <div className="text-slate-300 space-y-1.5">
              <p className="flex justify-between">
                <span>Companhia aérea:</span>
                <strong className="text-white">{current.airline}</strong>
              </p>
              <p className="flex justify-between">
                <span>Programa de fidelidade:</span>
                <strong className="text-white">{prog?.name || 'N/A'}</strong>
              </p>
              {current.flightNumber && (
                <p className="flex justify-between">
                  <span>Código do voo:</span>
                  <strong className="text-white font-mono">{current.flightNumber}</strong>
                </p>
              )}
              <p className="flex justify-between">
                <span>Itinerário de paradas:</span>
                <strong className="text-white">
                  {current.stops === 0 ? 'Voo Direto (Sem escalas)' : `${current.stops} conexão(ões)`}
                </strong>
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-purple-900/60 bg-[#160833] space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-purple-400" />
              Datas & Disponibilidade
            </h4>
            <div className="text-slate-300 space-y-1.5">
              <p className="flex justify-between">
                <span>Data de partida (ida):</span>
                <strong className="text-white">{formatDate(current.departureDate)}</strong>
              </p>
              {current.returnDate && (
                <p className="flex justify-between">
                  <span>Data de regresso (volta):</span>
                  <strong className="text-white">{formatDate(current.returnDate)}</strong>
                </p>
              )}
              <p className="flex justify-between items-center">
                <span>Assentos monitorados:</span>
                <span className={`font-bold flex items-center gap-1 font-mono ${isScarcityHigh ? 'text-rose-400' : 'text-amber-300'}`}>
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  {seatsCount} vagas restantes
                </span>
              </p>
              <p className="flex justify-between">
                <span>Última checagem:</span>
                <strong className="text-emerald-400 font-normal">{formatDateTime(current.verifiedAt)}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* PRD 4.3 INSIGHTS DE TENDÊNCIA E ALGORITMO PREDITIVO (Comprar Agora vs Aguardar) */}
        <TrendInsights
          currentOffer={current}
          allRouteOffers={offers}
          observations={observations}
          unitLabel={prog?.unitLabel || 'pts'}
          onSetAlert={() => {
            onClose();
            onOpenCreateAlert(current);
          }}
        />

        {/* Histórico Recente de Observações */}
        {relatedObs.length > 0 && (
          <div className="p-4 rounded-xl border border-purple-900/60 bg-[#14052C] space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Histórico de Coletas FlySync Nesta Data</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">
                {relatedObs.length} checagens
              </span>
            </div>
            <div className="space-y-1.5 pt-1">
              {relatedObs.map(obs => (
                <div
                  key={obs.id}
                  className="p-2 rounded-lg bg-[#0F0322] border border-purple-900/40 flex items-center justify-between text-xs"
                >
                  <span className="text-slate-300 text-[11px]">
                    {formatDateTime(obs.observedAt)}
                  </span>
                  <span className="font-mono font-bold text-white">
                    {obs.miles.toLocaleString('pt-BR')} pts
                  </span>
                  <span className="text-[#22C55E] text-[11px] font-semibold">
                    {obs.availabilityStatus}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aviso de Transparência e Segurança */}
        <div className="p-3.5 rounded-xl bg-[#0D021C] border border-purple-900/60 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-white">Emissão Direta Pré-Preenchida:</strong> O FlySync redireciona diretamente ao canal oficial da <strong>{current.airline} ({prog?.name})</strong> com a rota <strong>{current.origin} ➔ {current.destination}</strong> e a data selecionada (<strong>{formatDate(current.departureDate)}</strong>) já configurados no link.
          </p>
        </div>

        {/* Ações do Rodapé com Urgência Máxima */}
        <div className="pt-3 border-t border-purple-900/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCreateAlert(current);
              }}
              className="w-full sm:w-auto px-3.5 py-2.5 text-xs font-bold text-slate-200 bg-[#160833] border border-purple-800/80 hover:bg-purple-900/50 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <BellRing className="w-4 h-4 text-[#22C55E]" />
              Alerta de Preço
            </button>
            <button
              type="button"
              onClick={handleGoToGoogleFlights}
              className="w-full sm:w-auto px-3.5 py-2.5 text-xs font-bold text-cyan-300 bg-cyan-950/40 border border-cyan-800/60 hover:bg-cyan-900/40 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              title={`Comparar no Google Flights para ${formatDate(current.departureDate)}`}
            >
              <Plane className="w-3.5 h-3.5 text-cyan-400" />
              Google Flights
            </button>
          </div>

          <button
            type="button"
            onClick={handleGoToBooking}
            className="w-full sm:w-auto px-5 py-3 text-xs font-black text-slate-950 bg-[#22C55E] hover:bg-emerald-400 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.35)] transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02]"
            title={`Abrir página oficial de emissão para ${formatDate(current.departureDate)}`}
          >
            <Flame className="w-4 h-4 fill-slate-950" />
            <span>Emitir no Site Oficial ({formatDate(current.departureDate)})</span>
            <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
